import { useMemo, useState } from "react";
import { Download, FileClock, Search, ShieldCheck, UserRoundCheck } from "lucide-react";
import { KpiCard, PageTitle, Panel, StatusBadge } from "@/components/ModernUI";
import { useAtlasGrid } from "@/context/AtlasGridContext";
import { downloadCsv } from "@/lib/download";

export default function AuditTrail() {
  const { auditEvents } = useAtlasGrid();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All types");

  const filtered = useMemo(() => auditEvents.filter((event) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || `${event.actor} ${event.action} ${event.entityId} ${event.details}`.toLowerCase().includes(query);
    const matchesType = type === "All types" || event.entityType === type;
    return matchesSearch && matchesType;
  }), [auditEvents, search, type]);

  const todayCount = auditEvents.filter((event) => event.timestamp.includes("12 Aug 2026")).length;
  const userActions = auditEvents.filter((event) => event.entityType === "User").length;

  return (
    <section className="ag-page ag-audit-page">
      <PageTitle
        eyebrow="REA ADMIN / GOVERNANCE"
        title="Audit Trail"
        description="A complete, chronological record of claim, inspection, report, user and system activity."
        meta={<><span className="ag-live-dot" /> Live audit stream <span>Updated just now</span></>}
        actions={<button className="ag-button ag-button-outline" onClick={() => downloadCsv("atlasgrid-audit-trail.csv", [["Timestamp", "Actor", "Role", "Action", "Entity", "ID", "Details"], ...filtered.map((event) => [event.timestamp, event.actor, event.role, event.action, event.entityType, event.entityId, event.details])])}><Download size={16} /> Export CSV</button>}
      />

      <div className="ag-kpi-grid ag-kpi-grid-4">
        <KpiCard label="Audit Events" value={auditEvents.length} detail="Recorded system actions" icon={FileClock} tone="green" />
        <KpiCard label="Events Today" value={todayCount} detail="Current reporting day" icon={ShieldCheck} tone="mint" />
        <KpiCard label="User Changes" value={userActions} detail="Access and status updates" icon={UserRoundCheck} tone="blue" />
        <KpiCard label="Integrity Status" value="Healthy" detail="No gaps detected" icon={ShieldCheck} tone="green" />
      </div>

      <Panel title="Activity register" subtitle={`${filtered.length} events shown · newest activity first`} action={<div className="ag-inline-filters"><label><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search actor, action or record" /></label><select value={type} onChange={(event) => setType(event.target.value)}><option>All types</option><option>Claim</option><option>Inspection</option><option>Report</option><option>User</option><option>System</option></select></div>}>
        <div className="ag-table-scroll">
          <table className="ag-table">
            <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Record</th><th>Details</th></tr></thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id}>
                  <td><b>{event.timestamp}</b><small>{event.id}</small></td>
                  <td><b>{event.actor}</b><small>{event.role}</small></td>
                  <td><StatusBadge status={event.action} /></td>
                  <td><b>{event.entityId}</b><small>{event.entityType}</small></td>
                  <td className="ag-table-detail">{event.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </section>
  );
}
