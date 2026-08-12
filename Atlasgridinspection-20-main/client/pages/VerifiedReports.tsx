import { useMemo, useState } from "react";
import { CheckCircle2, Download, FileCheck2, FileClock, Search, ShieldCheck, TriangleAlert } from "lucide-react";
import { KpiCard, Modal, PageTitle, Panel, StatusBadge } from "@/components/ModernUI";
import InspectionReportView from "@/components/InspectionReportView";
import { useAtlasGrid, type ClaimRecord } from "@/context/AtlasGridContext";
import { downloadCsv, downloadJson, downloadText } from "@/lib/download";

function downloadReport(report: ClaimRecord) {
  const content = [
    "ATLAS GRID INSPECTION - REA VERIFIED REPORT",
    `Report ID: AIR-${report.id.replace("CLM-", "")}`,
    `Claim ID: ${report.id}`,
    `Project: ${report.project}`,
    `Contractor: ${report.contractor}`,
    `Location: ${report.community}, ${report.lga}, ${report.state}`,
    `Consultant: ${report.consultant ?? "-"}`,
    `Field Officer: ${report.fieldOfficer ?? "-"}`,
    `Score: ${report.score ?? 0}%`,
    `Findings: ${report.findings ?? 0}`,
    `Evidence: ${report.evidenceCount ?? 0} files`,
    `Outcome: ${report.status}`,
    `Recommendation: ${report.recommendation ?? "Verified as recorded."}`,
  ].join("\n");
  downloadText(`${report.id}-verified-report.txt`, content);
}

export default function VerifiedReports() {
  const { claims, reaVerify, returnForReinspection } = useAtlasGrid();
  const [tab, setTab] = useState<"verified" | "queue">("verified");
  const [search, setSearch] = useState("");
  const [state, setState] = useState("All states");
  const [selected, setSelected] = useState<ClaimRecord | null>(null);
  const [sort, setSort] = useState("Newest first");
  const [notice, setNotice] = useState("");

  const verified = claims.filter((claim) => claim.status === "Verified");
  const queue = claims.filter((claim) => claim.status === "Pending REA Review");
  const source = tab === "verified" ? verified : queue;
  const filtered = useMemo(() => {
    const records = source.filter((report) => {
      const query = search.trim().toLowerCase();
      return (!query || `${report.id} ${report.project} ${report.contractor} ${report.fieldOfficer ?? ""}`.toLowerCase().includes(query)) && (state === "All states" || report.state === state);
    });
    return [...records].sort((a, b) => {
      if (sort === "Highest score") return (b.score ?? 0) - (a.score ?? 0);
      if (sort === "Most findings") return (b.findings ?? 0) - (a.findings ?? 0);
      return b.id.localeCompare(a.id);
    });
  }, [search, sort, source, state]);

  const averageScore = verified.length ? Math.round(verified.reduce((sum, item) => sum + (item.score ?? 0), 0) / verified.length) : 0;
  const critical = verified.reduce((sum, item) => sum + (item.criticalFindings ?? 0), 0);

  return (
    <section className="ag-page ag-reports-page">
      <PageTitle
        eyebrow="CONTROLLED RECORDS / REA ADMIN"
        title="Verified Reports"
        description="Review pending submissions and manage the authoritative inspection reports verified by REA."
        meta={<><span className="ag-live-dot" /> Controlled records <span>Updated today, 09:40 AM</span></>}
        actions={<button className="ag-button ag-button-outline" onClick={() => { downloadCsv("atlasgrid-verified-reports.csv", [["Report ID", "Claim ID", "Project", "Contractor", "State", "Field Officer", "Score", "Findings", "Critical Findings", "Status"], ...filtered.map((report) => [`AIR-${report.id.replace("CLM-", "")}`, report.id, report.project, report.contractor, report.state, report.fieldOfficer ?? "", report.score ?? 0, report.findings ?? 0, report.criticalFindings ?? 0, report.status])]); setNotice("Filtered reports downloaded as CSV."); }}><Download size={16} /> Export reports</button>}
      />

      {notice && <button className="ag-notice" onClick={() => setNotice("")}>{notice}<span>×</span></button>}

      <div className="ag-kpi-grid ag-kpi-grid-6">
        <KpiCard label="Verified Reports" value={Math.max(187, verified.length)} detail="Authoritative records" icon={FileCheck2} tone="green" onClick={() => setTab("verified")} />
        <KpiCard label="Projects Covered" value="154" detail="Unique projects" icon={ShieldCheck} tone="mint" />
        <KpiCard label="Verified This Period" value="52" detail="Current reporting period" icon={CheckCircle2} tone="green" />
        <KpiCard label="Average Score" value={`${averageScore || 91}%`} detail="Inspection quality score" icon={ShieldCheck} tone="blue" />
        <KpiCard label="Critical Findings" value={Math.max(9, critical)} detail="Within verified reports" icon={TriangleAlert} tone="rose" />
        <KpiCard label="REA Review Queue" value={queue.length} detail="Awaiting final decision" icon={FileClock} tone="amber" onClick={() => setTab("queue")} />
      </div>

      <Panel title={tab === "verified" ? "Official verified records" : "REA verification queue"} subtitle={tab === "verified" ? "Reports that completed REA review" : "Consultant-approved reports awaiting REA action"} action={<div className="ag-segmented"><button className={tab === "verified" ? "active" : ""} onClick={() => setTab("verified")}>Verified records</button><button className={tab === "queue" ? "active" : ""} onClick={() => setTab("queue")}>Review queue ({queue.length})</button></div>}>
        <div className="ag-record-toolbar">
          <label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search report ID, project, contractor or officer" /></label>
          <select value={state} onChange={(event) => setState(event.target.value)}><option>All states</option>{[...new Set(source.map((item) => item.state))].map((item) => <option key={item}>{item}</option>)}</select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}><option>Newest first</option><option>Highest score</option><option>Most findings</option></select>
        </div>
        <div className="ag-table-scroll">
          <table className="ag-table">
            <thead><tr><th>Report</th><th>Project</th><th>Contractor</th><th>Field Officer</th><th>Score</th><th>Findings</th><th>Verification</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map((report) => (
                <tr key={report.id} onClick={() => setSelected(report)}>
                  <td><b>AIR-{report.id.replace("CLM-", "")}</b><small>{report.id}</small></td>
                  <td><b>{report.project}</b><small>{report.state}, Nigeria</small></td>
                  <td>{report.contractor}</td>
                  <td><b>{report.fieldOfficer ?? "-"}</b><small>{report.fieldOfficerId ?? "-"}</small></td>
                  <td><b className="ag-score">{report.score ?? 0}%</b><small>{(report.score ?? 0) >= 85 ? "Compliant" : "Review required"}</small></td>
                  <td><b>{report.findings ?? 0}</b><small>{report.criticalFindings ? `${report.criticalFindings} critical` : "No critical"}</small></td>
                  <td><b>{report.lastUpdated}</b><small>{report.arrivalDistanceM ?? 0} m from site</small></td>
                  <td><StatusBadge status={report.status} /></td>
                  <td><button className="ag-table-action" onClick={(event) => { event.stopPropagation(); setSelected(report); }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="ag-controlled-record"><ShieldCheck size={21} /><div><b>Official verified records</b><p>Verified reports are the authoritative inspection versions. Every action is retained in the audit trail.</p></div></div>

      {selected && (
        <Modal title={`AIR-${selected.id.replace("CLM-", "")}`} subtitle={`${selected.project} · ${selected.state}, Nigeria`} onClose={() => setSelected(null)} wide>
          <InspectionReportView claim={selected} />
          <div className="ag-modal-actions ag-modal-actions-between"><StatusBadge status={selected.status} /><div><button className="ag-button ag-button-outline" onClick={() => downloadReport(selected)}><Download size={16} /> Download summary</button><button className="ag-button ag-button-outline" onClick={() => downloadJson(`${selected.id}-inspection-record.json`, selected)}><Download size={16} /> Download full form</button>{selected.status === "Pending REA Review" && <><button className="ag-button ag-button-outline" onClick={() => { returnForReinspection(selected.id, "REA requested additional field evidence and clarification of the outstanding finding.", undefined, "REA Reviewer"); setNotice(`${selected.id} returned for re-inspection.`); setSelected(null); }}>Return for evidence</button><button className="ag-button ag-button-primary" onClick={() => { reaVerify(selected.id); setNotice(`${selected.id} verified and added to controlled records.`); setSelected(null); }}>Verify report</button></>}</div></div>
        </Modal>
      )}
    </section>
  );
}
