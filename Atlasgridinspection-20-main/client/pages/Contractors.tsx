import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  Search,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";

type Contractor = {
  name: string;
  id: string;
  projects: number;
  inspected: number;
  verified: number;
  compliance: number;
  findings: number;
  reinspections: number;
  risk: "Low" | "Medium" | "High" | "Critical";
  status: "Active" | "Under Review" | "Restricted";
  states: string;
  lastInspection: string;
};

const contractors: Contractor[] = [
  { name: "ABC Energy Ltd", id: "REA-CTR-02481", projects: 42, inspected: 39, verified: 34, compliance: 92, findings: 3, reinspections: 1, risk: "Low", status: "Active", states: "Kano, Kaduna, Katsina", lastInspection: "08 Aug 2026" },
  { name: "GreenVolt Nigeria Ltd", id: "REA-CTR-02214", projects: 31, inspected: 29, verified: 25, compliance: 84, findings: 7, reinspections: 3, risk: "Medium", status: "Active", states: "Kano, FCT, Gombe", lastInspection: "07 Aug 2026" },
  { name: "Arewa Solar Concepts", id: "REA-CTR-01908", projects: 28, inspected: 25, verified: 20, compliance: 79, findings: 9, reinspections: 4, risk: "High", status: "Under Review", states: "Sokoto, Niger, Yobe", lastInspection: "06 Aug 2026" },
  { name: "Sahel Power Systems Ltd", id: "REA-CTR-03145", projects: 24, inspected: 21, verified: 17, compliance: 76, findings: 11, reinspections: 5, risk: "High", status: "Under Review", states: "Kaduna, Bauchi, Borno", lastInspection: "05 Aug 2026" },
  { name: "SolarTech Nigeria", id: "REA-CTR-01872", projects: 19, inspected: 17, verified: 15, compliance: 88, findings: 4, reinspections: 2, risk: "Medium", status: "Active", states: "Lagos, Benue", lastInspection: "03 Aug 2026" },
];

const kpis = [
  ["Total Contractors", "184", "Registered contractors", Users],
  ["Active Contractors", "156", "Currently monitored", CheckCircle2],
  ["Projects Under Contractors", "427", "Across the programme", ShieldCheck],
  ["Average Compliance", "87%", "Verified project average", CheckCircle2],
  ["Contractors At Risk", "12", "Require programme attention", AlertTriangle],
  ["Open Corrective Actions", "71", "Awaiting contractor closure", Wrench],
] as const;

export default function Contractors() {
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("All risk levels");
  const [selected, setSelected] = useState<Contractor | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(
    () => contractors.filter((contractor) => {
      const matchesSearch = `${contractor.name} ${contractor.id} ${contractor.states}`.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = risk === "All risk levels" || contractor.risk === risk;
      return matchesSearch && matchesRisk;
    }),
    [search, risk],
  );

  return (
    <section className="contractors-page">
      <header className="workspace-page-header">
        <div>
          <div className="workspace-kicker">REA ADMIN / CONTRACTOR OVERSIGHT</div>
          <h1>Contractors</h1>
          <p>Monitor contractor delivery, compliance, findings, re-inspections and verification outcomes.</p>
        </div>
        <button className="workspace-secondary-action" onClick={() => setNotice("Contractor report export prepared")}><Download size={15} /> Export</button>
      </header>

      {notice && <button className="workspace-notice" onClick={() => setNotice("")}><CheckCircle2 size={14} /> {notice}<X size={13} /></button>}

      <div className="contractors-kpis">
        {kpis.map(([label, value, detail, Icon]) => (
          <div key={label} className="contractors-kpi">
            <span><Icon size={17} /></span><small>{label}</small><b>{value}</b><em>{detail}</em>
          </div>
        ))}
      </div>

      <section className="contractors-filter-card">
        <div className="contractors-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contractor name, ID or state" /></div>
        <label>State<select><option>All states</option><option>Kano</option><option>Kaduna</option><option>Bauchi</option></select></label>
        <label>Project Type<select><option>All project types</option><option>Solar mini-grid</option></select></label>
        <label>Compliance<select><option>All compliance levels</option><option>90% and above</option><option>Below 80%</option></select></label>
        <label>Risk Level<select value={risk} onChange={(event) => setRisk(event.target.value)}><option>All risk levels</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
        <button className="contractors-reset" onClick={() => { setSearch(""); setRisk("All risk levels"); }}>Reset</button>
      </section>

      <section className="contractors-register-card">
        <header>
          <div><h2>Contractor performance register</h2><p>{filtered.length} contractors shown · Performance is based on verified inspection outcomes.</p></div>
          <button onClick={() => setNotice("Highest-risk contractors shown first")}>Sort: Risk <ChevronDown size={13} /></button>
        </header>
        <div className="contractors-table-scroll">
          <table className="contractors-table">
            <thead><tr><th>CONTRACTOR</th><th>PROJECTS</th><th>INSPECTED</th><th>VERIFIED</th><th>COMPLIANCE</th><th>OPEN FINDINGS</th><th>RE-INSPECTIONS</th><th>RISK</th><th>STATUS</th><th>ACTION</th></tr></thead>
            <tbody>{filtered.map((contractor) => (
              <tr key={contractor.id} onClick={() => setSelected(contractor)}>
                <td><div className="contractor-identity"><span>{contractor.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}</span><div><b>{contractor.name}</b><small>{contractor.id}</small></div></div></td>
                <td>{contractor.projects}</td><td>{contractor.inspected}</td><td>{contractor.verified}</td>
                <td><div className="contractor-compliance"><b>{contractor.compliance}%</b><i><em style={{ width: `${contractor.compliance}%` }} /></i></div></td>
                <td><strong className={contractor.findings >= 9 ? "attention" : ""}>{contractor.findings}</strong></td>
                <td>{contractor.reinspections}</td>
                <td><span className={`contractor-risk ${contractor.risk.toLowerCase()}`}>{contractor.risk}</span></td>
                <td><span className={`contractor-state ${contractor.status.toLowerCase().replace(/ /g, "-")}`}>{contractor.status}</span></td>
                <td><button className="contractor-row-action" onClick={(event) => { event.stopPropagation(); setSelected(contractor); }}>View <ArrowRight size={12} /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>

      <div className="contractor-insight-grid">
        <section className="contractor-insight-card"><h3>Risk distribution</h3><div className="risk-distribution"><span><i className="low" /> Low Risk <b>102</b></span><span><i className="medium" /> Medium Risk <b>58</b></span><span><i className="high" /> High Risk <b>18</b></span><span><i className="critical" /> Critical <b>6</b></span></div></section>
        <section className="contractor-insight-card"><h3>Current programme signals</h3><div className="contractor-signals"><span>Contractors with critical findings <b>9</b></span><span>Corrective actions overdue <b>14</b></span><span>Repeated re-inspections <b>11</b></span><span>Average finding closure time <b>8.4 days</b></span></div></section>
      </div>

      {selected && <aside className="contractor-drawer">
        <button className="contractor-drawer-close" onClick={() => setSelected(null)}><X size={16} /></button>
        <div className="workspace-kicker">CONTRACTOR PROFILE</div>
        <h2>{selected.name}</h2>
        <span className={`contractor-risk ${selected.risk.toLowerCase()}`}>{selected.risk} Risk</span>
        <div className="contractor-profile-metrics"><div><b>{selected.projects}</b><small>Projects</small></div><div><b>{selected.verified}</b><small>Verified</small></div><div><b>{selected.compliance}%</b><small>Compliance</small></div></div>
        <div className="contractor-profile-details">
          <div><small>Contractor ID</small><b>{selected.id}</b></div>
          <div><small>States of Operation</small><b>{selected.states}</b></div>
          <div><small>Open Findings</small><b>{selected.findings}</b></div>
          <div><small>Re-inspections</small><b>{selected.reinspections}</b></div>
          <div><small>Last Inspection</small><b>{selected.lastInspection}</b></div>
          <div><small>Status</small><b>{selected.status}</b></div>
        </div>
        <div className="contractor-profile-actions"><button>View Projects</button><button>View Inspections</button><button>View Findings</button><button>Corrective Actions</button><button>Export Contractor Report</button></div>
      </aside>}
    </section>
  );
}
