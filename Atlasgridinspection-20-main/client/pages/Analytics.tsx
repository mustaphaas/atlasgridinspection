import { ArrowUpRight, BarChart3, CheckCircle2, ShieldCheck, Users, Zap } from "lucide-react";

const stateCoverage = [
  ["Kano", 48, 32, 8], ["Kaduna", 42, 38, 4], ["Bauchi", 39, 31, 5], ["Sokoto", 35, 30, 2], ["Katsina", 36, 31, 3], ["FCT", 31, 29, 2], ["Niger", 28, 24, 4],
] as const;

export default function Analytics() {
  return <section className="analytics-page-clean">
    <header className="workspace-page-header"><div><div className="workspace-kicker">REA ADMIN / PROGRAMME ANALYTICS</div><h1>Analytics</h1><p>Programme-level signals from consultant inspections and REA-verified records.</p></div><button className="workspace-secondary-action"><BarChart3 size={15} /> Export snapshot</button></header>
    <div className="analytics-clean-kpis">
      <div><span><ShieldCheck size={17} /></span><small>Verification Rate</small><b>56%</b><em>Of submitted reports</em></div>
      <div><span><Users size={17} /></span><small>Beneficiaries Verified</small><b>941</b><em>Confirmed on site</em></div>
      <div><span><Zap size={17} /></span><small>Capacity Verified</small><b>875 kW</b><em>Installed capacity confirmed</em></div>
      <div><span><CheckCircle2 size={17} /></span><small>Compliance Rate</small><b>78.5%</b><em>Across verified projects</em></div>
    </div>
    <div className="analytics-clean-grid">
      <section className="analytics-clean-card"><header><div><h2>Verification coverage by state</h2><p>Verified projects compared with total monitored projects.</p></div><button>View map <ArrowUpRight size={13} /></button></header><div className="analytics-state-list">{stateCoverage.map(([state, total, verified, risk]) => <div key={state}><span><b>{state}</b><small>{verified} of {total} verified · {risk} at risk</small></span><i><em style={{ width: `${(verified / total) * 100}%` }} /></i><strong>{Math.round((verified / total) * 100)}%</strong></div>)}</div></section>
      <section className="analytics-clean-card"><header><div><h2>Programme performance</h2><p>Current reporting-period indicators.</p></div></header><div className="analytics-performance-list"><div><span>Schedule performance</span><b>91%</b></div><div><span>Inspection completion</span><b>73%</b></div><div><span>Consultant approval rate</span><b>82%</b></div><div><span>REA verification turnaround</span><b>2.4 days</b></div><div><span>Projects with critical issues</span><b className="attention">22</b></div><div><span>Overdue corrective actions</span><b className="attention">14</b></div></div></section>
    </div>
  </section>;
}
