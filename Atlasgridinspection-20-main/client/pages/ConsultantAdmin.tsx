import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileCheck2,
  LogOut,
  Phone,
  Search,
  Send,
  ShieldCheck,
  UserPlus,
  UserRoundCheck,
  Users,
  Zap,
} from "lucide-react";
import { KpiCard, Modal, PageTitle, Panel, StatusBadge } from "@/components/ModernUI";
import { useAtlasGrid, type ClaimRecord } from "@/context/AtlasGridContext";

type ConsultantView = "Dashboard" | "Assignments" | "Field Officers" | "Review Queue" | "Submitted to REA";

type OfficerDraft = {
  name: string;
  phone: string;
  state: string;
  email: string;
  temporaryPin: string;
};

const views: { label: ConsultantView; icon: typeof BarChart3 }[] = [
  { label: "Dashboard", icon: BarChart3 },
  { label: "Assignments", icon: ClipboardCheck },
  { label: "Field Officers", icon: Users },
  { label: "Review Queue", icon: FileCheck2 },
  { label: "Submitted to REA", icon: Send },
];

const generatePin = () => String(Math.floor(100000 + Math.random() * 900000));

export default function ConsultantAdmin() {
  const {
    claims,
    fieldOfficers,
    currentUser,
    signOut,
    assignFieldOfficer,
    createFieldOfficer,
    toggleFieldOfficerStatus,
    consultantApprove,
    returnForReinspection,
  } = useAtlasGrid();

  const organization = currentUser?.organization ?? "NorthGrid Consultants";
  const consultantName = currentUser?.name ?? "Consultant Administrator";
  const consultantState = currentUser?.state ?? "Kano";
  const consultantFieldOfficers = useMemo(
    () => fieldOfficers.filter((officer) => officer.organization === organization),
    [fieldOfficers, organization],
  );
  const activeFieldOfficers = useMemo(() => consultantFieldOfficers.filter((officer) => officer.status === "Active"), [consultantFieldOfficers]);

  const [view, setView] = useState<ConsultantView>("Dashboard");
  const [selected, setSelected] = useState<ClaimRecord | null>(null);
  const [officerId, setOfficerId] = useState(activeFieldOfficers[0]?.id ?? "");
  const [returnReason, setReturnReason] = useState("Additional evidence and clearer equipment serial photographs are required.");
  const [notice, setNotice] = useState("");
  const [showCreateOfficer, setShowCreateOfficer] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ name: string; username: string; pin: string; id: string } | null>(null);
  const [officerDraft, setOfficerDraft] = useState<OfficerDraft>({ name: "", phone: "", state: consultantState, email: "", temporaryPin: generatePin() });

  const portfolio = useMemo(() => claims.filter((claim) => claim.consultant === organization), [claims, organization]);
  const unassigned = portfolio.filter((claim) => claim.status === "Consultant Assigned" || claim.status === "Re-inspection Required");
  const inField = portfolio.filter((claim) => ["Field Officer Assigned", "Arrival Verified", "Inspection In Progress"].includes(claim.status));
  const reviewQueue = portfolio.filter((claim) => claim.status === "Consultant Review");
  const sentToRea = portfolio.filter((claim) => claim.status === "Pending REA Review" || claim.status === "Verified");

  useEffect(() => {
    if (!activeFieldOfficers.some((officer) => officer.id === officerId)) setOfficerId(activeFieldOfficers[0]?.id ?? "");
  }, [activeFieldOfficers, officerId]);

  const openCreateOfficer = () => {
    setOfficerDraft({ name: "", phone: "", state: consultantState, email: "", temporaryPin: generatePin() });
    setShowCreateOfficer(true);
  };

  const createOfficer = () => {
    const result = createFieldOfficer({
      ...officerDraft,
      organization,
      email: officerDraft.email || undefined,
    });
    if (!result.ok || !result.data) {
      setNotice(result.message);
      return;
    }
    setShowCreateOfficer(false);
    setCreatedCredentials({
      name: result.data.name,
      username: result.data.username,
      pin: officerDraft.temporaryPin,
      id: result.data.id,
    });
    setOfficerId(result.data.id);
    setNotice(`${result.data.name} was added to ${organization}.`);
  };

  const copyCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Atlas Grid Inspection\nField officer: ${createdCredentials.name}\nUsername: ${createdCredentials.username}\nTemporary PIN: ${createdCredentials.pin}`;
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Login credentials copied. Share them through an approved secure channel.");
    } catch {
      setNotice("Copy was blocked by the browser. Select and copy the credentials manually.");
    }
  };

  const assign = () => {
    if (!selected || !officerId) {
      setNotice("Create or activate a field officer before assigning this inspection.");
      return;
    }
    const officer = activeFieldOfficers.find((item) => item.id === officerId);
    const ok = assignFieldOfficer(selected.id, officerId);
    if (!ok || !officer) {
      setNotice("The selected officer is not active or does not belong to this consultant organization.");
      return;
    }
    setNotice(`${officer.name} assigned to ${selected.project}.`);
    setSelected(null);
  };

  const approve = (claim: ClaimRecord) => {
    consultantApprove(claim.id);
    setNotice(`${claim.id} approved and sent to the REA verification queue.`);
  };

  const returnReport = () => {
    if (!selected) return;
    returnForReinspection(selected.id, returnReason, consultantName, "Consultant Admin");
    setNotice(`${selected.id} returned for re-inspection.`);
    setSelected(null);
  };

  const renderAssignments = () => (
    <Panel
      title="REA-assigned claims"
      subtitle="Assign your organization’s active field officers and monitor inspections"
      action={<div className="ag-inline-filters"><label><Search size={15} /><input placeholder="Search assignment" /></label><select><option>All statuses</option><option>Unassigned</option><option>In progress</option></select></div>}
    >
      <div className="ag-table-scroll">
        <table className="ag-table">
          <thead><tr><th>Claim / Project</th><th>Location</th><th>Priority</th><th>Field Officer</th><th>Status</th><th>Due Date</th><th>Action</th></tr></thead>
          <tbody>{portfolio.filter((claim) => !["Pending REA Review", "Verified"].includes(claim.status)).map((claim) => (
            <tr key={claim.id}>
              <td><b>{claim.project}</b><small>{claim.id}</small></td>
              <td><b>{claim.state}</b><small>{claim.lga} · {claim.community}</small></td>
              <td><StatusBadge status={claim.priority} /></td>
              <td>{claim.fieldOfficer ?? <span className="ag-muted">Not assigned</span>}</td>
              <td><StatusBadge status={claim.status} /></td>
              <td>{claim.dueDate ?? "20 Aug 2026"}</td>
              <td><button className="ag-table-action" onClick={() => setSelected(claim)}>{claim.fieldOfficer ? "Reassign" : "Assign officer"}</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Panel>
  );

  const renderReviewQueue = () => (
    <Panel title="Consultant review queue" subtitle="Review field submissions before they reach REA">
      <div className="ag-review-list">
        {reviewQueue.length ? reviewQueue.map((claim) => (
          <article key={claim.id}>
            <div className="ag-review-score"><b>{claim.score ?? 0}%</b><small>Inspection score</small></div>
            <div className="ag-review-main">
              <div><b>{claim.project}</b><small>{claim.id} · {claim.fieldOfficer} · {claim.evidenceCount ?? 0} evidence files</small></div>
              <p>{claim.recommendation ?? "Review the submitted form, GPS evidence, photographs and signatures."}</p>
              <div><StatusBadge status={`${claim.findings ?? 0} findings`} />{(claim.criticalFindings ?? 0) > 0 && <StatusBadge status={`${claim.criticalFindings} critical`} />}</div>
            </div>
            <div className="ag-review-actions"><button className="ag-button ag-button-outline" onClick={() => setSelected(claim)}>Return</button><button className="ag-button ag-button-primary" onClick={() => approve(claim)}><CheckCircle2 size={16} /> Approve for REA</button></div>
          </article>
        )) : <div className="ag-submitted-state"><CheckCircle2 size={24} /><div><b>Review queue is clear</b><p>New field submissions will appear here automatically.</p></div></div>}
      </div>
    </Panel>
  );

  const renderFieldOfficers = () => (
    <Panel
      title="Field officer accounts"
      subtitle={`Create and manage field officers belonging to ${organization}`}
      action={<button className="ag-button ag-button-primary" onClick={openCreateOfficer}><UserPlus size={16} /> Add field officer</button>}
    >
      <div className="ag-ownership-note"><ShieldCheck size={18} /><div><b>Consultant-owned accounts</b><small>Phone numbers are used as usernames. REA can audit these accounts, but this consultant controls creation, assignment and activation.</small></div></div>
      <div className="ag-officer-directory">
        {consultantFieldOfficers.length ? consultantFieldOfficers.map((officer, index) => {
          const active = portfolio.filter((claim) => claim.fieldOfficerId === officer.id && ["Field Officer Assigned", "Arrival Verified", "Inspection In Progress"].includes(claim.status)).length;
          return (
            <article key={officer.id} className={officer.status === "Suspended" ? "is-suspended" : ""}>
              <span>{officer.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span>
              <div><b>{officer.name}</b><small><Phone size={12} /> {officer.phone ?? officer.username}</small><small>{officer.id} · {officer.state}</small></div>
              <div className="ag-officer-metric"><b>{active}</b><small>Active jobs</small></div>
              <div className="ag-officer-metric"><b>{[94, 91, 97, 86][index] ?? 90}%</b><small>Approval</small></div>
              <StatusBadge status={officer.status} />
              <button className="ag-table-action" onClick={() => { const result = toggleFieldOfficerStatus(officer.id, organization); setNotice(result.message); }}>{officer.status === "Suspended" ? "Reactivate" : "Suspend"}</button>
            </article>
          );
        }) : <div className="ag-submitted-state"><Users size={24} /><div><b>No field officers created</b><p>Add an officer before assigning field inspections.</p></div></div>}
      </div>
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
        <KpiCard label="REA Assignments" value={portfolio.length} detail={`Claims assigned to ${organization}`} icon={ClipboardCheck} tone="green" onClick={() => setView("Assignments")} />
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

  const pageDescription = view === "Dashboard"
    ? "Assign your own field officers, monitor inspections and complete consultant QA before submission to REA."
    : view === "Field Officers"
      ? "Create phone-based field accounts and control access for officers employed by your organization."
      : "Focused operational workspace for the consultant inspection workflow.";

  return (
    <div className="ag-consultant-shell">
      <aside className="ag-consultant-sidebar">
        <div className="ag-brand"><span className="ag-brand-logo"><Zap size={19} fill="currentColor" /></span><div className="ag-brand-copy"><b>Atlas Grid Inspection</b><small>CONSULTANT OPERATIONS PORTAL</small></div></div>
        <div className="ag-account-card"><span>{organization.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><b>{organization}</b><small>REA-appointed consultant</small></div><ShieldCheck size={17} /></div>
        <nav>{views.map(({ label, icon: Icon }) => <button key={label} className={view === label ? "active" : ""} onClick={() => setView(label)}><Icon size={18} /><span>{label}</span>{label === "Assignments" && unassigned.length > 0 && <em>{unassigned.length}</em>}{label === "Review Queue" && reviewQueue.length > 0 && <em>{reviewQueue.length}</em>}</button>)}</nav>
        <div className="ag-sidebar-bottom"><div className="ag-system-status"><span /><div><b>Consultant workspace</b><small>{consultantFieldOfficers.length} field officer accounts</small></div></div><Link to="/login" className="ag-signout" onClick={signOut}><LogOut size={15} /> Sign out</Link></div>
      </aside>

      <main className="ag-consultant-main">
        <header className="ag-role-topbar"><div><b>Consultant workspace</b><small>Claims assigned by REA · field execution and quality assurance</small></div><div className="ag-role-user"><span>{consultantName.split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("")}</span><div><b>{consultantName}</b><small>Consultant Administrator</small></div></div></header>
        <div className="ag-role-content">
          <PageTitle eyebrow="CONSULTANT OPERATIONS" title={view} description={pageDescription} meta={<><span className="ag-live-dot" /> Synchronized workflow <span>Updated just now</span></>} />
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
          {activeFieldOfficers.length ? <div className="ag-form-grid ag-form-grid-single"><label>Field officer<select value={officerId} onChange={(event) => setOfficerId(event.target.value)}>{activeFieldOfficers.map((officer) => <option key={officer.id} value={officer.id}>{officer.name} · {officer.phone}</option>)}</select></label><label>Inspection instructions<textarea defaultValue="Verify site arrival, complete all mandatory form sections, capture GPS-tagged evidence and obtain required signatures." /></label></div> : <div className="ag-empty-assignment"><Users size={22} /><div><b>No active field officer is available</b><p>Create or reactivate an officer in the Field Officers section.</p></div><button className="ag-button ag-button-primary" onClick={() => { setSelected(null); setView("Field Officers"); openCreateOfficer(); }}><UserPlus size={16} /> Add field officer</button></div>}
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setSelected(null)}>Cancel</button>{activeFieldOfficers.length > 0 && <button className="ag-button ag-button-primary" onClick={assign}>Assign officer</button>}</div>
        </Modal>
      )}

      {selected?.status === "Consultant Review" && (
        <Modal title="Return inspection" subtitle={`${selected.project} · ${selected.fieldOfficer}`} onClose={() => setSelected(null)}>
          <div className="ag-report-note"><b>Current recommendation</b><p>{selected.recommendation}</p></div>
          <label className="ag-modal-label">Reason for re-inspection<textarea value={returnReason} onChange={(event) => setReturnReason(event.target.value)} /></label>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setSelected(null)}>Cancel</button><button className="ag-button ag-button-primary" onClick={returnReport}>Return to field</button></div>
        </Modal>
      )}

      {showCreateOfficer && (
        <Modal title="Create field officer" subtitle={`The account will belong to ${organization}. The phone number becomes the username.`} onClose={() => setShowCreateOfficer(false)}>
          <div className="ag-form-grid">
            <label>Full name<input value={officerDraft.name} onChange={(event) => setOfficerDraft({ ...officerDraft, name: event.target.value })} placeholder="e.g. Amina Yusuf" /></label>
            <label>Phone number / username<input type="tel" inputMode="tel" value={officerDraft.phone} onChange={(event) => setOfficerDraft({ ...officerDraft, phone: event.target.value })} placeholder="0803 555 0198" /></label>
            <label>State / coverage area<input value={officerDraft.state} onChange={(event) => setOfficerDraft({ ...officerDraft, state: event.target.value })} placeholder="Kano" /></label>
            <label>Email <span className="ag-optional">Optional</span><input type="email" value={officerDraft.email} onChange={(event) => setOfficerDraft({ ...officerDraft, email: event.target.value })} placeholder="Only for recovery or notices" /></label>
            <label>Temporary six-digit PIN<input type="text" inputMode="numeric" maxLength={6} value={officerDraft.temporaryPin} onChange={(event) => setOfficerDraft({ ...officerDraft, temporaryPin: event.target.value.replace(/\D/g, "").slice(0, 6) })} /></label>
            <div className="ag-phone-login-explainer"><Phone size={18} /><div><b>Why phone-number login?</b><small>It removes the requirement for every officer to own or remember an email account. The PIN remains separate and should be changed after first sign-in.</small></div></div>
          </div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setShowCreateOfficer(false)}>Cancel</button><button className="ag-button ag-button-primary" onClick={createOfficer}><UserPlus size={16} /> Create account</button></div>
        </Modal>
      )}

      {createdCredentials && (
        <Modal title="Field officer account created" subtitle="Share these temporary credentials securely. The phone number is the username." onClose={() => setCreatedCredentials(null)}>
          <div className="ag-credential-card"><span><CheckCircle2 size={24} /></span><div><small>Field officer</small><b>{createdCredentials.name}</b></div><div><small>Officer ID</small><b>{createdCredentials.id}</b></div><div><small>Username</small><b>{createdCredentials.username}</b></div><div><small>Temporary PIN</small><b>{createdCredentials.pin}</b></div></div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={copyCredentials}><Copy size={16} /> Copy credentials</button><button className="ag-button ag-button-primary" onClick={() => setCreatedCredentials(null)}>Done</button></div>
        </Modal>
      )}
    </div>
  );
}
