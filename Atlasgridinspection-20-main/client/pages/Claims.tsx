import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Download,
  FilePlus2,
  FileText,
  Filter,
  Link2,
  MapPin,
  Search,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import { KpiCard, Modal, PageTitle, Panel, StatusBadge } from "@/components/ModernUI";
import InspectionReportView from "@/components/InspectionReportView";
import { useAtlasGrid, type ClaimRecord, type ContractRecord } from "@/context/AtlasGridContext";
import { downloadCsv } from "@/lib/download";
import { readTabularFile } from "@/lib/tabularImport";

const statusOrder = ["New", "Validated", "Consultant Assigned", "Field Officer Assigned", "Arrival Verified", "Inspection In Progress", "Consultant Review", "Pending REA Review", "Verified"];

export default function Claims({ onOpenMap, initialSearch = "" }: { onOpenMap?: (state: string, projectId: string) => void; initialSearch?: string }) {
  const {
    claims,
    contracts,
    consultants,
    createClaim,
    validateClaim,
    assignConsultant,
    reaVerify,
    rejectClaim,
  } = useAtlasGrid();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState("All statuses");
  const [state, setState] = useState("All states");
  const [selected, setSelected] = useState<ClaimRecord | null>(null);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [newClaimOpen, setNewClaimOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [connectorOpen, setConnectorOpen] = useState(false);
  const [connectorName, setConnectorName] = useState("REA Project Registry");
  const [connectorEndpoint, setConnectorEndpoint] = useState("https://api.rea.gov.ng/atlasgrid");
  const [syncMode, setSyncMode] = useState("Two-way");
  const [connectorConnected, setConnectorConnected] = useState(() => {
    try { return Boolean(window.localStorage.getItem("atlasgrid-rea-connector")); } catch { return false; }
  });
  const [consultant, setConsultant] = useState(consultants[0]);
  const [lead, setLead] = useState("Engr. Fatima Bello");
  const [deadline, setDeadline] = useState("2026-08-20");
  const [assignmentNotes, setAssignmentNotes] = useState("Complete field verification, evidence capture and consultant QA before submission to REA.");
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const filtered = useMemo(() => claims.filter((claim) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${claim.id} ${claim.contractId} ${claim.project} ${claim.contractor} ${claim.consultant ?? ""}`.toLowerCase().includes(query);
    return matchesSearch && (status === "All statuses" || claim.status === status) && (state === "All states" || claim.state === state);
  }), [claims, search, state, status]);

  const count = (values: string[]) => claims.filter((claim) => values.includes(claim.status)).length;

  const handleImport = async (file?: File) => {
    if (!file) return;
    try {
      const rows = await readTabularFile(file);
      const headers = rows[0]?.map((value) => value.trim().toLowerCase()) ?? [];
      const contractColumn = headers.findIndex((value) => ["contract", "contract id", "contract number", "contract reference"].includes(value));
      const column = contractColumn >= 0 ? contractColumn : 0;
      const matched = [...new Set(rows.slice(1).map((row) => row[column]?.trim()).filter((id): id is string => Boolean(id) && contracts.some((contract) => contract.id === id)))];
      const created = matched.map((contractId) => createClaim(contractId, `REA ${file.name.toLowerCase().endsWith(".xlsx") ? "Excel" : "CSV"} Import`)).filter(Boolean);
      setNotice(`${file.name} processed. ${created.length} claim${created.length === 1 ? "" : "s"} created from matched contract references.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The selected file could not be imported.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const submitNewClaim = () => {
    if (!selectedContract) return;
    const claim = createClaim(selectedContract.id);
    setNewClaimOpen(false);
    setSelectedContract(null);
    if (claim) {
      setSelected(claim);
      setNotice(`${claim.id} created from ${selectedContract.id}.`);
    }
  };


  const openConsultantAssignment = () => {
    if (!selected) return;
    setConsultant(selected.consultant ?? consultants[0]);
    setLead(selected.consultantLead ?? "Engr. Fatima Bello");
    setDeadline("2026-08-20");
    setAssignmentNotes(selected.assignmentInstructions ?? "Complete field verification, evidence capture and consultant QA before submission to REA.");
    setAssignOpen(true);
  };

  const formattedDeadline = () => {
    const parsed = new Date(`${deadline}T00:00:00`);
    return Number.isNaN(parsed.getTime())
      ? "20 Aug 2026"
      : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
  };

  const assignSelectedConsultant = () => {
    if (!selected) return;
    assignConsultant(selected.id, consultant, lead, formattedDeadline(), assignmentNotes);
    setSelected({ ...selected, status: "Consultant Assigned", consultant, consultantLead: lead });
    setAssignOpen(false);
    setNotice(`${consultant} assigned to ${selected.id}.`);
  };

  const saveConnector = () => {
    try {
      const parsed = new URL(connectorEndpoint);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("Unsupported protocol");
      window.localStorage.setItem("atlasgrid-rea-connector", JSON.stringify({ name: connectorName, endpoint: connectorEndpoint, mode: syncMode, savedAt: new Date().toISOString() }));
      setConnectorConnected(true);
      setConnectorOpen(false);
      setNotice(`${connectorName} configuration saved. Add approved API credentials in the deployment environment to enable live exchange.`);
    } catch {
      setNotice("Enter a valid HTTPS API endpoint before saving the REA system connection.");
    }
  };

  return (
    <section className="ag-page ag-claims-page">
      <PageTitle
        eyebrow="REA ADMIN / CLAIMS INTAKE"
        title="Claims"
        description="Receive claims against registered contracts, validate project details, assign consultant firms and track the complete inspection workflow."
        meta={<><span className="ag-live-dot" /> Workflow synchronized <span>{claims.length} records in the current workspace</span></>}
        actions={<><input ref={fileInput} type="file" accept=".csv,.xlsx" hidden onChange={(event) => handleImport(event.target.files?.[0])} /><button className="ag-button ag-button-outline" onClick={() => downloadCsv("atlasgrid-claims-import-template.csv", [["Contract Number", "Claim Reference", "Submitted By", "Notes"], ...contracts.slice(0, 4).map((contract, index) => [contract.id, `REA-CLAIM-${String(index + 1).padStart(3, "0")}`, "REA Claims Desk", "Inspect against the approved contract scope and coordinates."])])}><Download size={16} /> Download template</button><button className="ag-button ag-button-outline" onClick={() => fileInput.current?.click()}><Upload size={16} /> Import Excel/CSV</button><button className="ag-button ag-button-outline" onClick={() => setConnectorOpen(true)}><Link2 size={16} /> {connectorConnected ? "REA system connected" : "Connect REA system"}</button><button className="ag-button ag-button-primary" onClick={() => setNewClaimOpen(true)}><FilePlus2 size={16} /> New claim</button></>}
      />

      {notice && <button className="ag-notice" onClick={() => setNotice("")}>{notice}<span>×</span></button>}

      <div className="ag-kpi-grid ag-kpi-grid-6">
        <KpiCard label="Total Claims" value={claims.length} detail="Current workflow records" icon={FileText} tone="green" onClick={() => setStatus("All statuses")} />
        <KpiCard label="New / Unassigned" value={count(["New", "Validated"])} detail="Require REA action" icon={FilePlus2} tone="amber" onClick={() => setStatus("New")} />
        <KpiCard label="Under Inspection" value={count(["Consultant Assigned", "Field Officer Assigned", "Arrival Verified", "Inspection In Progress", "Re-inspection Required"])} detail="Field workflow active" icon={ClipboardCheck} tone="blue" onClick={() => setStatus("Inspection In Progress")} />
        <KpiCard label="Consultant Review" value={count(["Consultant Review"])} detail="Awaiting consultant QA" icon={Users} tone="mint" onClick={() => setStatus("Consultant Review")} />
        <KpiCard label="Pending REA Review" value={count(["Pending REA Review"])} detail="Awaiting final verification" icon={ShieldCheck} tone="amber" onClick={() => setStatus("Pending REA Review")} />
        <KpiCard label="Verified" value={count(["Verified"])} detail="Authoritative records" icon={CheckCircle2} tone="green" onClick={() => setStatus("Verified")} />
      </div>

      <Panel title="Claims register" subtitle={`${filtered.length} claims shown · click a row to open the workflow record`} action={<div className="ag-inline-filters"><label><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claim, contract, project or contractor" /></label><select value={state} onChange={(event) => setState(event.target.value)}><option>All states</option>{[...new Set(claims.map((claim) => claim.state))].map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{[...new Set(claims.map((claim) => claim.status))].map((item) => <option key={item}>{item}</option>)}</select><button className="ag-filter-reset" onClick={() => { setSearch(""); setState("All states"); setStatus("All statuses"); }}><Filter size={14} /> Reset</button></div>}>
        <div className="ag-table-scroll">
          <table className="ag-table">
            <thead><tr><th>Claim</th><th>Contract / Project</th><th>Contractor</th><th>Location</th><th>Consultant</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map((claim) => (
                <tr key={claim.id} onClick={() => { setSelected(claim); setShowInspectionForm(false); }}>
                  <td><b>{claim.id}</b><small>{claim.submittedDate}</small></td>
                  <td><b>{claim.project}</b><small>{claim.contractId}</small></td>
                  <td>{claim.contractor}</td>
                  <td><b>{claim.state}</b><small>{claim.lga} · {claim.community}</small></td>
                  <td>{claim.consultant ?? <span className="ag-muted">Unassigned</span>}</td>
                  <td><StatusBadge status={claim.status} /></td>
                  <td>{claim.lastUpdated}</td>
                  <td><button className="ag-table-action" onClick={(event) => { event.stopPropagation(); setSelected(claim); setShowInspectionForm(false); }}>Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {selected && (
        <Modal title={selected.id} subtitle={`${selected.project} · ${selected.contractId}`} onClose={() => { setSelected(null); setShowInspectionForm(false); }} wide>
          <div className="ag-workflow-strip">
            {statusOrder.map((item, index) => {
              const currentIndex = statusOrder.indexOf(selected.status);
              return <div key={item} className={index <= currentIndex ? "complete" : ""}><span>{index + 1}</span><small>{item}</small></div>;
            })}
          </div>
          <div className="ag-detail-grid">
            <div><small>Contractor</small><b>{selected.contractor}</b></div>
            <div><small>Location</small><b>{selected.community}, {selected.lga}, {selected.state}</b></div>
            <div><small>Approved coordinates</small><b>{selected.coordinates}</b></div>
            <div><small>Contract capacity</small><b>{selected.capacity}</b></div>
            <div><small>Expected beneficiaries</small><b>{selected.beneficiaries}</b></div>
            <div><small>Consultant</small><b>{selected.consultant ?? "Not assigned"}</b></div>
            <div><small>Field officer</small><b>{selected.fieldOfficer ?? "Consultant will assign"}</b></div>
            <div><small>Inspection progress</small><b>{selected.inspectionProgress}%</b></div>
          </div>
          <div className="ag-coordinate-card"><MapPin size={18} /><div><b>Approved project location</b><small>Coordinates are controlled by the contract register and are read-only during claim intake.</small></div><button onClick={() => { onOpenMap?.(selected.state, selected.projectId); setSelected(null); }}>View map</button></div>
          {selected.inspectionForm && <button className="ag-report-toggle" onClick={() => setShowInspectionForm((value) => !value)}><FileText size={17} /><span><b>{showInspectionForm ? "Hide submitted inspection form" : "Open submitted inspection form"}</b><small>GPS, equipment, findings, evidence, signatures and review history</small></span></button>}
          {showInspectionForm && selected.inspectionForm && <InspectionReportView claim={selected} />}
          <div className="ag-modal-actions ag-modal-actions-between">
            <div><StatusBadge status={selected.status} /></div>
            <div>
              {selected.status === "New" && <button className="ag-button ag-button-primary" onClick={() => { validateClaim(selected.id); setSelected({ ...selected, status: "Validated" }); setNotice(`${selected.id} validated.`); }}>Validate claim</button>}
              {selected.status === "Validated" && <button className="ag-button ag-button-primary" onClick={openConsultantAssignment}>Assign consultant</button>}
              {selected.status === "Pending REA Review" && <><button className="ag-button ag-button-outline" onClick={() => { rejectClaim(selected.id, "Returned for additional evidence."); setSelected({ ...selected, status: "Rejected" }); }}>Reject</button><button className="ag-button ag-button-primary" onClick={() => { reaVerify(selected.id); setSelected({ ...selected, status: "Verified" }); setNotice(`${selected.id} verified by REA.`); }}>Verify report</button></>}
              {!['New', 'Validated', 'Pending REA Review'].includes(selected.status) && <button className="ag-button ag-button-outline" onClick={() => setSelected(null)}>Close</button>}
            </div>
          </div>
        </Modal>
      )}

      {newClaimOpen && (
        <Modal title="Create claim" subtitle="Select an existing REA contract. Project details and coordinates are loaded automatically." onClose={() => { setNewClaimOpen(false); setSelectedContract(null); }} wide>
          <div className="ag-contract-picker">
            <div className="ag-contract-list">
              {contracts.map((contract) => <button key={contract.id} className={selectedContract?.id === contract.id ? "selected" : ""} onClick={() => setSelectedContract(contract)}><span><b>{contract.project}</b><small>{contract.id} · {contract.contractor}</small></span><StatusBadge status={contract.status} /></button>)}
            </div>
            <div className="ag-contract-preview">
              {selectedContract ? <><div className="ag-eyebrow"><span />SELECTED CONTRACT</div><h3>{selectedContract.project}</h3><div className="ag-detail-grid"><div><small>Project ID</small><b>{selectedContract.projectId}</b></div><div><small>Contractor</small><b>{selectedContract.contractor}</b></div><div><small>Location</small><b>{selectedContract.community}, {selectedContract.state}</b></div><div><small>Coordinates</small><b>{selectedContract.coordinates}</b></div><div><small>Capacity</small><b>{selectedContract.capacity}</b></div><div><small>Beneficiaries</small><b>{selectedContract.beneficiaries}</b></div></div></> : <div className="ag-picker-empty"><MapPin size={24} /><b>Select a contract</b><small>Contract details will appear here.</small></div>}
            </div>
          </div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setNewClaimOpen(false)}>Cancel</button><button className="ag-button ag-button-primary" disabled={!selectedContract} onClick={submitNewClaim}>Submit claim</button></div>
        </Modal>
      )}


      {connectorOpen && (
        <Modal title="Connect REA system" subtitle="Store the approved registry endpoint for claim and contract synchronization." onClose={() => setConnectorOpen(false)}>
          <div className="ag-form-grid ag-form-grid-single">
            <label>System name<input value={connectorName} onChange={(event) => setConnectorName(event.target.value)} /></label>
            <label>API endpoint<input type="url" value={connectorEndpoint} onChange={(event) => setConnectorEndpoint(event.target.value)} placeholder="https://api.rea.gov.ng/..." /></label>
            <label>Synchronization mode<select value={syncMode} onChange={(event) => setSyncMode(event.target.value)}><option>Two-way</option><option>Import only</option><option>Export only</option></select></label>
          </div>
          <div className="ag-connector-note"><ShieldCheck size={18} /><div><b>Credentials are not stored in the browser</b><small>Configure secrets and authentication in Cloudflare or your approved backend before enabling production synchronization.</small></div></div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setConnectorOpen(false)}>Cancel</button><button className="ag-button ag-button-primary" onClick={saveConnector}>Save connection</button></div>
        </Modal>
      )}

      {assignOpen && selected && (
        <Modal title="Assign consultant" subtitle="REA assigns the consultant firm. The consultant will assign its own field officer." onClose={() => setAssignOpen(false)}>
          <div className="ag-form-grid ag-form-grid-single"><label>Consultant firm<select value={consultant} onChange={(event) => setConsultant(event.target.value)}>{consultants.map((item) => <option key={item}>{item}</option>)}</select></label><label>Consultant lead<input value={lead} onChange={(event) => setLead(event.target.value)} /></label><label>Inspection deadline<input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label><label>Assignment notes<textarea value={assignmentNotes} onChange={(event) => setAssignmentNotes(event.target.value)} /></label></div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setAssignOpen(false)}>Cancel</button><button className="ag-button ag-button-primary" onClick={assignSelectedConsultant}>Assign consultant</button></div>
        </Modal>
      )}
    </section>
  );
}
