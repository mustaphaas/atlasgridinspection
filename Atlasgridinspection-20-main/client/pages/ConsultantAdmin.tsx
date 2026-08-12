import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  LogOut,
  Search,
  Send,
  ShieldCheck,
  UserRoundCheck,
  Users,
  Zap,
} from "lucide-react";
import { KpiCard, Modal, PageTitle, Panel, StatusBadge } from "@/components/ModernUI";
import { useAtlasGrid, type ClaimRecord } from "@/context/AtlasGridContext";

type ConsultantView = "Dashboard" | "Assignments" | "Field Officers" | "Review Queue" | "Submitted to REA";

const views: { label: ConsultantView; icon: typeof BarChart3 }[] = [
  { label: "Dashboard", icon: BarChart3 },
  { label: "Assignments", icon: ClipboardCheck },
  { label: "Field Officers", icon: Users },
  { label: "Review Queue", icon: FileCheck2 },
  { label: "Submitted to REA", icon: Send },
];

export default function ConsultantAdmin() {
  const { claims, fieldOfficers, assignFieldOfficer, consultantApprove, returnForReinspection } = useAtlasGrid();
  const [view, setView] = useState<ConsultantView>("Dashboard");
  const [selected, setSelected] = useState<ClaimRecord | null>(null);
  const [officerName, setOfficerName] = useState(fieldOfficers[0]?.name ?? "Amina Yusuf");
  const [returnReason, setReturnReason] = useState("Additional evidence and clearer equipment serial photographs are required.");
  const [notice, setNotice] = useState("");

  const portfolio = useMemo(() => claims.filter((claim) => claim.consultant === "NorthGrid Consultants"), [claims]);
  const unassigned = portfolio.filter((claim) => claim.status === "Consultant Assigned" || claim.status === "Re-inspection Required");
  const inField = portfolio.filter((claim) => ["Field Officer Assigned", "Arrival Verified", "Inspection In Progress"].includes(claim.status));
  const reviewQueue = portfolio.filter((claim) => claim.status === "Consultant Review");
  const sentToRea = portfolio.filter((claim) => claim.status === "Pending REA Review" || claim.status === "Verified");

  const assign = () => {
    if (!selected) return;
    assignFieldOfficer(selected.id, officerName);
    setNotice(`${officerName} assigned to ${selected.project}.`);
    setSelected(null);
  };

  const approve = (claim: ClaimRecord) => {
    consultantApprove(claim.id);
    setNotice(`${claim.id} approved and sent to the REA verification queue.`);
  };

  const returnReport = () => {
    if (!selected) return;
    returnForReinspection(selected.id, returnReason);
    setNotice(`${selected.id} returned for re-inspection.`);
    setSelected(null);
  };

  const renderAssignments = () => (
    <Panel title="REA-assigned claims" subtitle="Assign field officers and monitor active inspections" action={<div className="ag-inline-filters"><label><Search size={15} /><input placeholder="Search assignment" /></label><select><option>All statuses</option><option>Unassigned</option><option>In progress</option></select></div>}>
      <div className="ag-table-scroll"><table className="ag-table"><thead><tr><th>Claim / Project</th><th>Location</th><th>Priority</th><th>Field Officer</th><th>Status</th><th>Due Date</th><th>Action</th></tr></thead><tbody>{portfolio.filter((claim) => !["Pending REA Review", "Verified"].includes(claim.status)).map((claim) => <tr key={claim.id}><td><b>{claim.project}</b><small>{claim.id}</small></td><td><b>{claim.state}</b><small>{claim.lga} · {claim.community}</small></td><td><StatusBadge status={claim.priority} /></td><td>{claim.fieldOfficer ?? <span className="ag-muted">Not assigned</span>}</td><td><StatusBadge status={claim.status} /></td><td>{claim.dueDate ?? "20 Aug 2026"}</td><td><button className="ag-table-action" onClick={() => setSelected(claim)}>{claim.fieldOfficer ? "Reassign" : "Assign officer"}</button></td></tr>)}</tbody></table></div>
    </Panel>
  );

  const renderReviewQueue = () => (
    <Panel title="Consultant review queue" subtitle="Review field submissions before they reach REA">
      <div className="ag-review-list">
        {reviewQueue.length ? reviewQueue.map((claim) => <article key={claim.id}><div className="ag-review-score"><b>{claim.score ?? 0}%</b><small>Inspection score</small></div><div className="ag-review-main"><div><b>{claim.project}</b><small>{claim.id} · {claim.fieldOfficer} · {claim.evidenceCount ?? 0} evidence files</small></div><p>{claim.recommendation ?? "Review the submitted form, GPS evidence, photographs and signatures."}</p><div><StatusBadge status={`${claim.findings ?? 0} findings`} />{(claim.criticalFindings ?? 0) > 0 && <StatusBadge status={`${claim.criticalFindings} critical`} />}</div></div><div className="ag-review-actions"><button className="ag-button ag-button-outline" onClick={() => setSelected(claim)}>Return</button><button className="ag-button ag-button-primary" onClick={() => approve(claim)}><CheckCircle2 size={16} /> Approve for REA</button></div></article>) : <div className="ag-submitted-state"><CheckCircle2 size={24} /><div><b>Review queue is clear</b><p>New field submissions will appear here automatically.</p></div></div>}
      </div>
    </Panel>
  );

  const renderFieldOfficers = () => (
    <Panel title="Field officer team" subtitle="Consultant-managed officers available for assignments">
      <div className="ag-officer-directory">{fieldOfficers.map((officer, index) => { const active = portfolio.filter((claim) => claim.fieldOfficer === officer.name && ["Field Officer Assigned", "Arrival Verified", "Inspection In Progress"].includes(claim.status)).length; return <article key={officer.id}><span>{officer.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span><div><b>{officer.name}</b><small>{officer.id} · {officer.state}</small></div><div className="ag-officer-metric"><b>{active}</b><small>Active</small></div><div className="ag-officer-metric"><b>{[94, 91, 97, 86][index] ?? 90}%</b><small>Approval</small></div><StatusBadge status={officer.status} /></article>; })}</div>
    </Panel>
  );

  const renderSubmitted = () => (
    <Panel title="Reports submitted to REA" subtitle="Track final verification outcomes">
      <div className="ag-table-scroll"><table className="ag-table"><thead><tr><th>Report</th><th>Project</th><th>Field Officer</th><th>Score</th><th>Submitted Status</th><th>Last Updated</th></tr></thead><tbody>{sentToRea.map((claim) => <tr key={claim.id}><td><b>AIR-{claim.id.replace("CLM-", "")}</b><small>{claim.id}</small></td><td><b>{claim.project}</b><small>{claim.state}</small></td><td>{claim.fieldOfficer}</td><td><b className="ag-score">{claim.score ?? 0}%</b></td><td><StatusBadge status={claim.status} /></td><td>{claim.lastUpdated}</td></tr>)}</tbody></table></div>
    </Panel>
  );

  const renderDashboard = () => (
    <>
      <div className="ag-kpi-grid ag-kpi-grid-5">
        <KpiCard label="REA Assignments" value={portfolio.length} detail="Claims assigned to NorthGrid" icon={ClipboardCheck} tone="green" onClick={() => setView("Assignments")} />
        <KpiCard label="Awaiting Officer" value={unassigned.length} detail="Require assignment" icon={Users} tone="amber" onClick={() => setView("Assignments")} />
        <KpiCard label="In Field" value={inField.length} detail="Inspection activity" icon={UserRoundCheck} tone="blue" onClick={() => setView("Assignments")} />
        <KpiCard label="Review Queue" value={reviewQueue.length} detail="Awaiting consultant QA" icon={FileCheck2} tone="amber" onClick={() => setView("Review Queue")} />
        <KpiCard label="Submitted to REA" value={sentToRea.length} detail="Pending or verified" icon={ShieldCheck} tone="green" onClick={() => setView("Submitted to REA")} />
      </div>
      <div className="ag-consultant-grid">
        <Panel title="Priority assignments" subtitle="Claims requiring field-officer assignment or action" action={<button className="ag-text-link" onClick={() => setView("Assignments")}>View all</button>}>
          <div className="ag-consultant-priority">{unassigned.map((claim) => <button key={claim.id} onClick={() => setSelected(claim)}><span><ClipboardCheck size={18} /></span><div><b>{claim.project}</b><small>{claim.id} · {claim.state} · {claim.priority}</small></div><StatusBadge status={claim.status} /></button>)}</div>
        </Panel>
        <Panel title="Workflow status" subtitle="Current consultant delivery pipeline">
          <div className="ag-consultant-flow">{[["Assigned", unassigned.length], ["In field", inField.length], ["Review", reviewQueue.length], ["Sent to REA", sentToRea.length]].map(([label, value], index) => <div key={String(label)}><span>{index + 1}</span><b>{value}</b><small>{label}</small></div>)}</div>
        </Panel>
      </div>
      {renderReviewQueue()}
    </>
  );

  return (
    <div className="ag-consultant-shell">
      <aside className="ag-consultant-sidebar">
        <div className="ag-brand"><span className="ag-brand-logo"><Zap size={19} fill="currentColor" /></span><div className="ag-brand-copy"><b>Atlas Grid Inspection</b><small>CONSULTANT OPERATIONS PORTAL</small></div></div>
        <div className="ag-account-card"><span>NG</span><div><b>NorthGrid Consultants</b><small>REA-appointed consultant</small></div><ShieldCheck size={17} /></div>
        <nav>{views.map(({ label, icon: Icon }) => <button key={label} className={view === label ? "active" : ""} onClick={() => setView(label)}><Icon size={18} /><span>{label}</span>{label === "Assignments" && unassigned.length > 0 && <em>{unassigned.length}</em>}{label === "Review Queue" && reviewQueue.length > 0 && <em>{reviewQueue.length}</em>}</button>)}</nav>
        <div className="ag-sidebar-bottom"><Link to="/" className="ag-role-link"><ShieldCheck size={16} /> REA portal</Link><Link to="/field-officer" className="ag-role-link"><Users size={16} /> Field officer view</Link><Link to="/login" className="ag-signout"><LogOut size={15} /> Sign out</Link></div>
      </aside>

      <main className="ag-consultant-main">
        <header className="ag-role-topbar"><div><b>Consultant workspace</b><small>Claims assigned by REA · field execution and quality assurance</small></div><div className="ag-role-user"><span>FB</span><div><b>Engr. Fatima Bello</b><small>Consultant Administrator</small></div></div></header>
        <div className="ag-role-content">
          <PageTitle eyebrow="CONSULTANT OPERATIONS" title={view} description={view === "Dashboard" ? "Assign field officers, monitor inspections and complete consultant QA before submission to REA." : "Focused operational workspace for the consultant inspection workflow."} meta={<><span className="ag-live-dot" /> Synchronized workflow <span>Updated just now</span></>} />
          <nav className="ag-consultant-mobile-nav" aria-label="Consultant workspace navigation">{views.map(({ label, icon: Icon }) => <button key={label} className={view === label ? "active" : ""} onClick={() => setView(label)}><Icon size={16} /><span>{label}</span></button>)}</nav>
          {notice && <button className="ag-notice" onClick={() => setNotice("")}>{notice}<span>×</span></button>}
          {view === "Dashboard" && renderDashboard()}
          {view === "Assignments" && renderAssignments()}
          {view === "Field Officers" && renderFieldOfficers()}
          {view === "Review Queue" && renderReviewQueue()}
          {view === "Submitted to REA" && renderSubmitted()}
        </div>
      </main>

      {selected && !["Consultant Review"].includes(selected.status) && (
        <Modal title="Assign field officer" subtitle={`${selected.project} · ${selected.state}`} onClose={() => setSelected(null)}>
          <div className="ag-detail-grid"><div><small>Claim</small><b>{selected.id}</b></div><div><small>Priority</small><StatusBadge status={selected.priority} /></div><div><small>Deadline</small><b>{selected.dueDate ?? "20 Aug 2026"}</b></div><div><small>Approved coordinates</small><b>{selected.coordinates}</b></div></div>
          <div className="ag-form-grid ag-form-grid-single"><label>Field officer<select value={officerName} onChange={(event) => setOfficerName(event.target.value)}>{fieldOfficers.map((officer) => <option key={officer.id}>{officer.name}</option>)}</select></label><label>Inspection instructions<textarea defaultValue="Verify site arrival, complete all mandatory form sections, capture GPS-tagged evidence and obtain required signatures." /></label></div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setSelected(null)}>Cancel</button><button className="ag-button ag-button-primary" onClick={assign}>Assign officer</button></div>
        </Modal>
      )}

      {selected?.status === "Consultant Review" && (
        <Modal title="Return inspection" subtitle={`${selected.project} · ${selected.fieldOfficer}`} onClose={() => setSelected(null)}>
          <div className="ag-report-note"><b>Current recommendation</b><p>{selected.recommendation}</p></div>
          <label className="ag-modal-label">Reason for re-inspection<textarea value={returnReason} onChange={(event) => setReturnReason(event.target.value)} /></label>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setSelected(null)}>Cancel</button><button className="ag-button ag-button-primary" onClick={returnReport}>Return to field</button></div>
        </Modal>
      )}
    </div>
  );
}
