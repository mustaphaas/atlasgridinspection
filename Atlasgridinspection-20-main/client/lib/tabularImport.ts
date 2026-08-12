export type TabularRows = string[][];

export function parseCsv(text: string): TabularRows {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }
    if (character === '"') {
      quoted = !quoted;
      continue;
    }
    if (character === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += character;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

type ZipEntry = {
  method: number;
  compressedSize: number;
  localOffset: number;
};

function findEndOfCentralDirectory(view: DataView) {
  const signature = 0x06054b50;
  const minimum = Math.max(0, view.byteLength - 65_557);
  for (let offset = view.byteLength - 22; offset >= minimum; offset -= 1) {
    if (view.getUint32(offset, true) === signature) return offset;
  }
  throw new Error("The Excel ZIP directory could not be located.");
}

function readZipDirectory(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const decoder = new TextDecoder("utf-8");
  const endOffset = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(endOffset + 10, true);
  const centralOffset = view.getUint32(endOffset + 16, true);
  const entries = new Map<string, ZipEntry>();
  let offset = centralOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error("The Excel ZIP directory is invalid.");
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const fileNameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const fileName = decoder.decode(new Uint8Array(buffer, offset + 46, fileNameLength));
    entries.set(fileName, { method, compressedSize, localOffset });
    offset += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

async function extractZipText(buffer: ArrayBuffer, entry: ZipEntry) {
  const view = new DataView(buffer);
  const decoder = new TextDecoder("utf-8");
  if (view.getUint32(entry.localOffset, true) !== 0x04034b50) throw new Error("The Excel ZIP entry is invalid.");
  const fileNameLength = view.getUint16(entry.localOffset + 26, true);
  const extraLength = view.getUint16(entry.localOffset + 28, true);
  const dataOffset = entry.localOffset + 30 + fileNameLength + extraLength;
  const compressed = new Uint8Array(buffer, dataOffset, entry.compressedSize);

  if (entry.method === 0) return decoder.decode(compressed);
  if (entry.method !== 8 || typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot decompress the selected Excel workbook.");
  }

  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return decoder.decode(await new Response(stream).arrayBuffer());
}

function textContent(element: Element | null) {
  return element?.textContent?.trim() ?? "";
}

function columnIndex(reference: string) {
  const letters = reference.match(/[A-Z]+/i)?.[0]?.toUpperCase() ?? "A";
  let result = 0;
  for (const letter of letters) result = result * 26 + letter.charCodeAt(0) - 64;
  return result - 1;
}

export async function parseXlsx(file: File): Promise<TabularRows> {
  const buffer = await file.arrayBuffer();
  const entries = readZipDirectory(buffer);
  const sheetName = [...entries.keys()]
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))[0];
  if (!sheetName) throw new Error("No worksheet was found in the Excel workbook.");

  const parser = new DOMParser();
  const sharedStringsEntry = entries.get("xl/sharedStrings.xml");
  const sharedStrings = sharedStringsEntry
    ? Array.from(parser.parseFromString(await extractZipText(buffer, sharedStringsEntry), "application/xml").getElementsByTagName("si"))
        .map((item) => Array.from(item.getElementsByTagName("t")).map((node) => node.textContent ?? "").join(""))
    : [];

  const sheetEntry = entries.get(sheetName)!;
  const document = parser.parseFromString(await extractZipText(buffer, sheetEntry), "application/xml");
  if (document.querySelector("parsererror")) throw new Error("The Excel worksheet XML is invalid.");

  return Array.from(document.getElementsByTagName("row")).map((rowElement) => {
    const row: string[] = [];
    Array.from(rowElement.getElementsByTagName("c")).forEach((cellElement) => {
      const index = columnIndex(cellElement.getAttribute("r") ?? "A1");
      const type = cellElement.getAttribute("t");
      const value = textContent(cellElement.getElementsByTagName("v")[0] ?? null);
      const inlineValue = Array.from(cellElement.getElementsByTagName("t")).map((node) => node.textContent ?? "").join("");
      row[index] = type === "s" ? sharedStrings[Number(value)] ?? "" : type === "inlineStr" ? inlineValue : value;
    });
    return Array.from({ length: row.length }, (_, index) => row[index] ?? "");
  }).filter((row) => row.some((value) => value.trim().length > 0));
}

export async function readTabularFile(file: File): Promise<TabularRows> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv" || extension === "txt") return parseCsv(await file.text());
  if (extension === "xlsx") return parseXlsx(file);
  throw new Error("Use a CSV or XLSX file.");
}
