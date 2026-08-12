import { useMemo, useState } from "react";
import { Search, ShieldCheck, UserPlus, UsersRound, UserRoundCheck, UserRoundX } from "lucide-react";
import { KpiCard, Modal, PageTitle, Panel, StatusBadge } from "@/components/ModernUI";
import { useAtlasGrid, type PortalUser } from "@/context/AtlasGridContext";

const emptyUser: Omit<PortalUser, "id" | "lastActive"> = {
  name: "",
  email: "",
  role: "REA Reviewer",
  organization: "REA",
  state: "FCT",
  status: "Invited",
};

export default function Users() {
  const { users, addUser, toggleUserStatus } = useAtlasGrid();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All roles");
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(emptyUser);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => users.filter((user) => {
    const query = search.trim().toLowerCase();
    return (!query || `${user.name} ${user.email} ${user.organization}`.toLowerCase().includes(query)) && (role === "All roles" || user.role === role);
  }), [role, search, users]);

  const submit = () => {
    if (!draft.name.trim() || !draft.email.trim()) {
      setNotice("Name and email are required.");
      return;
    }
    addUser(draft);
    setDraft(emptyUser);
    setShowAdd(false);
    setNotice("User invitation created and recorded in the audit trail.");
  };

  return (
    <section className="ag-page ag-users-page">
      <PageTitle
        eyebrow="REA ADMIN / ACCESS CONTROL"
        title="Users"
        description="Manage REA reviewers, consultant administrators, field officers and audit access."
        meta={<><span className="ag-live-dot" /> Role-based access active <span>{users.filter((user) => user.status === "Active").length} active accounts</span></>}
        actions={<button className="ag-button ag-button-primary" onClick={() => setShowAdd(true)}><UserPlus size={16} /> Add user</button>}
      />

      {notice && <button className="ag-notice" onClick={() => setNotice("")}>{notice}<span>×</span></button>}

      <div className="ag-kpi-grid ag-kpi-grid-4">
        <KpiCard label="Total Users" value={users.length} detail="Across all portal roles" icon={UsersRound} tone="green" />
        <KpiCard label="Active Accounts" value={users.filter((user) => user.status === "Active").length} detail="Can access the system" icon={UserRoundCheck} tone="mint" />
        <KpiCard label="Invitations" value={users.filter((user) => user.status === "Invited").length} detail="Awaiting activation" icon={UserPlus} tone="blue" />
        <KpiCard label="Suspended" value={users.filter((user) => user.status === "Suspended").length} detail="Access temporarily blocked" icon={UserRoundX} tone="rose" />
      </div>

      <Panel title="User directory" subtitle={`${filtered.length} users shown`} action={<div className="ag-inline-filters"><label><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" /></label><select value={role} onChange={(event) => setRole(event.target.value)}><option>All roles</option><option>REA Admin</option><option>REA Reviewer</option><option>Consultant Admin</option><option>Field Officer</option><option>Auditor</option></select></div>}>
        <div className="ag-table-scroll">
          <table className="ag-table">
            <thead><tr><th>User</th><th>Role</th><th>Organization</th><th>State</th><th>Last Active</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td><div className="ag-person"><span>{user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><b>{user.name}</b><small>{user.email}</small></div></div></td>
                  <td><b>{user.role}</b><small>{user.id}</small></td>
                  <td>{user.organization}</td>
                  <td>{user.state}</td>
                  <td>{user.lastActive}</td>
                  <td><StatusBadge status={user.status} /></td>
                  <td><button className="ag-table-action" onClick={() => { toggleUserStatus(user.id); setNotice(`${user.name} access status updated.`); }}>{user.status === "Suspended" ? "Reactivate" : "Suspend"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {showAdd && (
        <Modal title="Add portal user" subtitle="Create a role-specific account. The action is logged automatically." onClose={() => setShowAdd(false)}>
          <div className="ag-form-grid">
            <label>Full name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Enter full name" /></label>
            <label>Email<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="name@example.com" /></label>
            <label>Role<select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as PortalUser["role"] })}><option>REA Admin</option><option>REA Reviewer</option><option>Consultant Admin</option><option>Field Officer</option><option>Auditor</option></select></label>
            <label>Organization<input value={draft.organization} onChange={(event) => setDraft({ ...draft, organization: event.target.value })} /></label>
            <label>State<input value={draft.state} onChange={(event) => setDraft({ ...draft, state: event.target.value })} /></label>
            <label>Initial status<select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as PortalUser["status"] })}><option>Invited</option><option>Active</option></select></label>
          </div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setShowAdd(false)}>Cancel</button><button className="ag-button ag-button-primary" onClick={submit}><ShieldCheck size={16} /> Create user</button></div>
        </Modal>
      )}
    </section>
  );
}
