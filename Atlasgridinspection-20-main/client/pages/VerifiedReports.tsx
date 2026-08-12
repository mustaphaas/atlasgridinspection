import { CalendarDays, ChevronDown, Download, Eye, FileCheck2, FileText, Search, ShieldCheck, Wrench } from "lucide-react";

const reports = [
  { id: "AIR-2026-00482", projectId: "REA-KN-2026-0042", project: "Kano Solar Mini Grid", location: "Kano, Nigeria", contractor: "ABC Energy Ltd.", type: "Completion", officer: "Ibrahim A.", officerId: "FO-010", inspectionDate: "08 May 2026", score: 94, findings: "2 Findings", verificationDate: "08 May 2026", status: "Verified" },
  { id: "AIR-2026-00479", projectId: "REA-KD-2026-0038", project: "Kaduna 33kV Line Extension", location: "Kaduna, Nigeria", contractor: "PowerGrid Ltd.", type: "Progress", officer: "Musa K.", officerId: "FO-011", inspectionDate: "07 May 2026", score: 88, findings: "3 Findings", verificationDate: "07 May 2026", status: "Verified" },
  { id: "AIR-2026-00476", projectId: "REA-BA-2026-0029", project: "Bauchi Mini Grid", location: "Bauchi, Nigeria", contractor: "GreenVolt Ltd.", type: "Routine", officer: "Aliyu S.", officerId: "FO-012", inspectionDate: "06 May 2026", score: 92, findings: "1 Critical", verificationDate: "06 May 2026", status: "Verified" },
  { id: "AIR-2026-00473", projectId: "REA-SO-2026-0024", project: "Sokoto Solar Project", location: "Sokoto, Nigeria", contractor: "Nura Energy Ltd.", type: "Completion", officer: "Amina Y.", officerId: "FO-013", inspectionDate: "05 May 2026", score: 90, findings: "2 Findings", verificationDate: "05 May 2026", status: "Verified" },
  { id: "AIR-2026-00469", projectId: "REA-JG-2026-0019", project: "Tshida Distribution", location: "Jigawa, Nigeria", contractor: "E-Sabem Ltd.", type: "Progress", officer: "Salihu M.", officerId: "FO-014", inspectionDate: "05 May 2026", score: 85, findings: "4 Findings", verificationDate: "05 May 2026", status: "Verified" },
  { id: "AIR-2026-00466", projectId: "REA-PL-2026-0017", project: "Plateau Mini-Grid", location: "Plateau, Nigeria", contractor: "LightUp Africa", type: "Re-inspection", officer: "Grace E.", officerId: "FO-015", inspectionDate: "03 May 2026", score: 97, findings: "1 Critical", verificationDate: "03 May 2026", status: "Verified" },
  { id: "AIR-2026-00463", projectId: "REA-PL-2026-0015", project: "Jos Solar Extension", location: "Plateau, Nigeria", contractor: "Northern Elect. Co.", type: "Progress", officer: "Haruna P.", officerId: "FO-016", inspectionDate: "02 May 2026", score: 89, findings: "3 Findings", verificationDate: "02 May 2026", status: "Verified" },
  { id: "AIR-2026-00460", projectId: "REA-YO-2026-0013", project: "Yobe Solar Mini Grid", location: "Yobe, Nigeria", contractor: "SunPower Nig. Ltd.", type: "Completion", officer: "Bello F.", officerId: "FO-017", inspectionDate: "01 May 2026", score: 93, findings: "2 Findings", verificationDate: "01 May 2026", status: "Verified" },
  { id: "AIR-2026-00457", projectId: "REA-NA-2026-0012", project: "Nasarawa 33kV Line", location: "Nasarawa, Nigeria", contractor: "VoltageWorks Ltd.", type: "Routine", officer: "Jibril T.", officerId: "FO-018", inspectionDate: "30 Apr 2026", score: 91, findings: "1 Critical", verificationDate: "30 Apr 2026", status: "Verified" },
  { id: "AIR-2026-00454", projectId: "REA-BE-2026-0008", project: "Benue Rural Electrification", location: "Benue, Nigeria", contractor: "Benue Power Solutions", type: "Progress", officer: "Audu O.", officerId: "FO-019", inspectionDate: "29 Apr 2026", score: 87, findings: "3 Findings", verificationDate: "29 Apr 2026", status: "Verified" },
];

const summaryCards = [
  ["Verified Reports", "187", "Total reports", FileCheck2, "green"],
  ["Projects Covered", "154", "Unique projects", FileText, "green"],
  ["Verified This Period", "52", "Current reporting period", CalendarDays, "green"],
  ["Average Score", "91%", "Average inspection score", ShieldCheck, "green"],
  ["Critical Findings", "9", "From verified reports", ShieldCheck, "red"],
  ["Open Corrective Actions", "71", "Require follow-up", Wrench, "amber"],
] as const;

export default function VerifiedReports() {
  return <section className="verified-reference verified-clean-page">
    <header className="verified-reference-header">
      <div><div className="verified-kicker"><span /> CONTROLLED RECORDS / REA ADMIN</div><h1>Verified Reports</h1><p>Inspection reports reviewed and verified by REA.</p></div>
      <div className="verified-header-actions"><button><CalendarDays size={14} /> 01 May 2026 - 31 May 2026 <ChevronDown size={13} /></button></div>
    </header>

    <div className="verified-summary-cards">{summaryCards.map(([label, value, detail, Icon, tone]) => <div className={`verified-summary-card ${tone}`} key={label}><span><Icon size={16} /></span><small>{label}</small><b>{value}</b><em>{detail}</em></div>)}</div>

    <div className="verified-filter-card">
      <div className="verified-filter-title-clean"><div><h2>Search & Filter</h2><p>Find authoritative records by report, project, contractor, location or verifier.</p></div><span>4 filters active</span></div>
      <div className="verified-filter-search"><Search size={15} /><input placeholder="Search report ID, project, contractor, officer..." /></div>
      <div className="verified-filter-grid">
        {["State", "LGA", "Project", "Contractor", "Inspection Type", "Verified By"].map((label) => <label key={label}><span>{label}</span><select><option>All {label === "LGA" ? "LGAs" : label.toLowerCase() + "s"}</option></select></label>)}
      </div>
      <div className="verified-filter-row">
        <label><span>Score Range</span><select><option>All Scores</option></select></label>
        <label><span>Finding Severity</span><select><option>All Severities</option></select></label>
        <label><span>Verification Date</span><div className="verified-date"><input placeholder="Start date" /><CalendarDays size={13} /><input placeholder="End date" /></div></label>
        <label><span>Report Status</span><select><option>Verified</option></select></label>
        <button className="verified-reset">Reset</button>
        <button className="verified-export"><Download size={14} /> Export Reports</button>
      </div>
    </div>

    <div className="verified-table-card">
      <div className="verified-table-toolbar"><div><b>Verified Reports</b><span>Showing 1 to 10 of 187 verified reports</span></div><button>Sort by: Newest First <ChevronDown size={12} /></button></div>
      <div className="verified-table-wrap"><table className="verified-table verified-table-clean"><thead><tr><th>REPORT ID</th><th>PROJECT</th><th>CONTRACTOR</th><th>TYPE</th><th>FIELD OFFICER</th><th>INSPECTION DATE</th><th>SCORE</th><th>FINDINGS</th><th>VERIFICATION DATE</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{reports.map((report) => <tr key={report.id}>
        <td><b>{report.id}</b><small>{report.projectId}</small></td>
        <td><b>{report.project}</b><small>{report.location}</small></td>
        <td>{report.contractor}</td>
        <td><span className={`inspection-type ${report.type.toLowerCase().replace(/ /g, "-")}`}>{report.type}</span></td>
        <td><div className="verified-person"><span>{report.officer.split(" ").map((part) => part[0]).join("")}</span><div><b>{report.officer}</b><small>{report.officerId}</small></div></div></td>
        <td>{report.inspectionDate}<small>09:30 AM</small></td>
        <td><strong className={report.score >= 85 ? "score-verified" : "score-warning"}>{report.score}%</strong><small>Compliant</small></td>
        <td><b>{report.findings.split(" ")[0]}</b><small className={report.findings.includes("Critical") ? "finding-critical" : "finding-minor"}>{report.findings}</small></td>
        <td>{report.verificationDate}<small>02:15 PM</small></td>
        <td><span className="verified-status"><ShieldCheck size={11} /> {report.status}</span></td>
        <td><button className="verified-row-view"><Eye size={14} /> View</button></td>
      </tr>)}</tbody></table></div>
      <footer className="verified-pagination"><label>Rows per page <select><option>10</option><option>25</option><option>50</option></select></label><div><button className="active">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button>…</button><button>19</button></div></footer>
    </div>

    <div className="verified-controlled-note"><ShieldCheck size={18} /><div><b>Official Verified Records</b><span>These reports have completed REA review and represent the authoritative inspection versions.</span></div><strong>CONTROLLED RECORDS</strong></div>
  </section>;
}
