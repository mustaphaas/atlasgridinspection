import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Search,
  ShieldCheck,
} from "lucide-react";
import { KpiCard, Modal, PageTitle, Panel, StatusBadge } from "@/components/ModernUI";
import { useAtlasGrid, type ClaimRecord } from "@/context/AtlasGridContext";
import { downloadCsv } from "@/lib/download";

type ContractorSummary = {
  name: string;
  projects: number;
  inspected: number;
  verified: number;
  compliance: number;
  findings: number;
  critical: number;
  reinspection: number;
  risk: "Low Risk" | "Medium Risk" | "High Risk" | "Critical";
  states: string[];
  records: ClaimRecord[];
};

type ContractorTab = "Overview" | "Projects" | "Inspections" | "Findings" | "Corrective actions";

export default function Contractors() {
  const { claims } = useAtlasGrid();
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("All risks");
  const [selected, setSelected] = useState<ContractorSummary | null>(null);
  const [tab, setTab] = useState<ContractorTab>("Overview");
  const [notice, setNotice] = useState("");

  const contractors = useMemo<ContractorSummary[]>(() => {
    const grouped = new Map<string, ClaimRecord[]>();
    claims.forEach((claim) => grouped.set(claim.contractor, [...(grouped.get(claim.contractor) ?? []), claim]));

    return [...grouped.entries()]
      .map(([name, records], index) => {
        const inspected = records.filter((record) => record.inspectionProgress > 0).length;
        const verified = records.filter((record) => record.status === "Verified").length;
        const findings = records.reduce((sum, record) => sum + (record.findings ?? 0), 0);
        const critical = records.reduce((sum, record) => sum + (record.criticalFindings ?? 0), 0);
        const reinspection = records.filter((record) => record.status === "Re-inspection Required").length;
        const compliance = Math.max(68, Math.min(96, 92 - findings * 2 - critical * 5 + verified * 2 - index));
        const riskLevel: ContractorSummary["risk"] = critical > 1
          ? "Critical"
          : reinspection > 0 || compliance < 78
            ? "High Risk"
            : compliance < 86
              ? "Medium Risk"
              : "Low Risk";

        return {
          name,
          projects: records.length,
          inspected,
          verified,
          compliance,
          findings,
          critical,
          reinspection,
          risk: riskLevel,
          states: [...new Set(records.map((record) => record.state))],
          records,
        };
      })
      .sort((a, b) => b.projects - a.projects);
  }, [claims]);

  const filtered = contractors.filter((contractor) =>
    contractor.name.toLowerCase().includes(search.toLowerCase()) &&
    (risk === "All risks" || contractor.risk === risk),
  );
  const averageCompliance = contractors.length
    ? Math.round(contractors.reduce((sum, item) => sum + item.compliance, 0) / contractors.length)
    : 0;

  const openContractor = (contractor: ContractorSummary) => {
    setSelected(contractor);
    setTab("Overview");
  };

  const exportContractors = () => {
    downloadCsv("atlasgrid-contractor-performance.csv", [
      ["Contractor", "Projects", "Inspected", "Verified", "Compliance %", "Findings", "Critical", "Re-inspections", "Risk", "States"],
      ...filtered.map((contractor) => [
        contractor.name,
        contractor.projects,
        contractor.inspected,
        contractor.verified,
        contractor.compliance,
        contractor.findings,
        contractor.critical,
        contractor.reinspection,
        contractor.risk,
        contractor.states.join("; "),
      ]),
    ]);
    setNotice("Filtered contractor performance downloaded as CSV.");
  };

  const exportSelected = () => {
    if (!selected) return;
    downloadCsv(`${selected.name.replace(/\W+/g, "-").toLowerCase()}-oversight.csv`, [
      ["Claim", "Project", "State", "Status", "Inspection Progress", "Score", "Findings", "Critical Findings", "Field Officer"],
      ...selected.records.map((record) => [
        record.id,
        record.project,
        record.state,
        record.status,
        `${record.inspectionProgress}%`,
        record.score ?? "",
        record.findings ?? 0,
        record.criticalFindings ?? 0,
        record.fieldOfficer ?? "Not assigned",
      ]),
    ]);
    setNotice(`${selected.name} oversight report downloaded.`);
  };

  const renderTab = () => {
    if (!selected) return null;

    if (tab === "Overview") {
      return (
        <div className="ag-detail-grid ag-contractor-tab-content">
          <div><small>States of operation</small><b>{selected.states.join(", ")}</b></div>
          <div><small>Re-inspections</small><b>{selected.reinspection}</b></div>
          <div><small>Risk rating</small><StatusBadge status={selected.risk} /></div>
          <div><small>Performance basis</small><b>Verified inspection outcomes</b></div>
        </div>
      );
    }

    if (tab === "Projects") {
      return (
        <div className="ag-table-scroll ag-contractor-tab-content">
          <table className="ag-table">
            <thead><tr><th>Project</th><th>Location</th><th>Claim</th><th>Status</th></tr></thead>
            <tbody>{selected.records.map((record) => (
              <tr key={record.id}>
                <td><b>{record.project}</b><small>{record.projectId}</small></td>
                <td><b>{record.state}</b><small>{record.lga} · {record.community}</small></td>
                <td>{record.id}</td>
                <td><StatusBadge status={record.status} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      );
    }

    if (tab === "Inspections") {
      return (
        <div className="ag-table-scroll ag-contractor-tab-content">
          <table className="ag-table">
            <thead><tr><th>Claim</th><th>Field Officer</th><th>Progress</th><th>Score</th><th>Outcome</th></tr></thead>
            <tbody>{selected.records.map((record) => (
              <tr key={record.id}>
                <td><b>{record.id}</b><small>{record.project}</small></td>
                <td>{record.fieldOfficer ?? "Not assigned"}</td>
                <td><div className="ag-progress-cell"><i><em style={{ width: `${record.inspectionProgress}%` }} /></i><b>{record.inspectionProgress}%</b></div></td>
                <td>{record.score ? `${record.score}%` : "—"}</td>
                <td><StatusBadge status={record.status} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      );
    }

    if (tab === "Findings") {
      return (
        <div className="ag-table-scroll ag-contractor-tab-content">
          <table className="ag-table">
            <thead><tr><th>Claim</th><th>Project</th><th>Findings</th><th>Critical</th><th>Recommendation</th></tr></thead>
            <tbody>{selected.records.map((record) => (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.project}</td>
                <td>{record.findings ?? 0}</td>
                <td><StatusBadge status={(record.criticalFindings ?? 0) > 0 ? `${record.criticalFindings} critical` : "None"} /></td>
                <td className="ag-table-detail">{record.recommendation ?? "No finding recommendation recorded."}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="ag-table-scroll ag-contractor-tab-content">
        <table className="ag-table">
          <thead><tr><th>Claim</th><th>Project</th><th>Action status</th><th>Follow-up</th></tr></thead>
          <tbody>{selected.records.map((record) => {
            const open = record.status === "Re-inspection Required" || (record.criticalFindings ?? 0) > 0;
            return (
              <tr key={record.id}>
                <td>{record.id}</td>
                <td>{record.project}</td>
                <td><StatusBadge status={open ? "Open" : "Closed"} /></td>
                <td>{open ? record.recommendation ?? "Additional field evidence required." : "No open corrective action."}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="ag-page ag-contractors-page">
      <PageTitle
        eyebrow="REA ADMIN / CONTRACTOR OVERSIGHT"
        title="Contractors"
        description="Monitor contractor project delivery, inspection outcomes, compliance, findings and re-inspection exposure."
        meta={<><span className="ag-live-dot" /> Performance data synchronized <span>Payment processing is outside AtlasGrid</span></>}
        actions={<button className="ag-button ag-button-outline" onClick={exportContractors}><Download size={16} /> Export performance</button>}
      />

      {notice && <button className="ag-notice" onClick={() => setNotice("")}>{notice}<span>×</span></button>}

      <div className="ag-kpi-grid ag-kpi-grid-5">
        <KpiCard label="Total Contractors" value={contractors.length} detail="With active programme records" icon={Building2} tone="green" />
        <KpiCard label="Projects Tracked" value={claims.length} detail="Across all contractors" icon={ClipboardCheck} tone="mint" />
        <KpiCard label="Average Compliance" value={`${averageCompliance}%`} detail="Inspection-based score" icon={ShieldCheck} tone="green" />
        <KpiCard label="Contractors At Risk" value={contractors.filter((item) => item.risk === "High Risk" || item.risk === "Critical").length} detail="Require programme attention" icon={AlertTriangle} tone="rose" onClick={() => setRisk("High Risk")} />
        <KpiCard label="Verified Projects" value={claims.filter((claim) => claim.status === "Verified").length} detail="REA verified outcomes" icon={CheckCircle2} tone="blue" />
      </div>

      <div className="ag-contractor-layout">
        <Panel
          title="Contractor performance register"
          subtitle={`${filtered.length} contractors shown`}
          action={(
            <div className="ag-inline-filters">
              <label><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contractor" /></label>
              <select value={risk} onChange={(event) => setRisk(event.target.value)}><option>All risks</option><option>Low Risk</option><option>Medium Risk</option><option>High Risk</option><option>Critical</option></select>
            </div>
          )}
        >
          <div className="ag-table-scroll">
            <table className="ag-table">
              <thead><tr><th>Contractor</th><th>Projects</th><th>Inspected</th><th>Verified</th><th>Compliance</th><th>Findings</th><th>Re-inspections</th><th>Risk</th><th>Action</th></tr></thead>
              <tbody>{filtered.map((contractor) => (
                <tr key={contractor.name} onClick={() => openContractor(contractor)}>
                  <td><div className="ag-person"><span>{contractor.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}</span><div><b>{contractor.name}</b><small>{contractor.states.join(", ")}</small></div></div></td>
                  <td>{contractor.projects}</td>
                  <td>{contractor.inspected}</td>
                  <td>{contractor.verified}</td>
                  <td><div className="ag-progress-cell"><i><em style={{ width: `${contractor.compliance}%` }} /></i><b>{contractor.compliance}%</b></div></td>
                  <td><b>{contractor.findings}</b><small>{contractor.critical} critical</small></td>
                  <td>{contractor.reinspection}</td>
                  <td><StatusBadge status={contractor.risk} /></td>
                  <td><button className="ag-table-action" onClick={(event) => { event.stopPropagation(); openContractor(contractor); }}>View</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Risk distribution" subtitle="Current contractor risk profile">
          <div className="ag-risk-distribution">
            {["Low Risk", "Medium Risk", "High Risk", "Critical"].map((item) => {
              const count = contractors.filter((contractor) => contractor.risk === item).length;
              return <button key={item} onClick={() => setRisk(item)}><StatusBadge status={item} /><b>{count}</b><small>{Math.round((count / Math.max(1, contractors.length)) * 100)}%</small></button>;
            })}
          </div>
          <div className="ag-contractor-insight"><AlertTriangle size={19} /><div><b>Inspection outcomes drive risk</b><p>Risk ratings are calculated from compliance, critical findings and re-inspection history—not payment or procurement data.</p></div></div>
        </Panel>
      </div>

      {selected && (
        <Modal title={selected.name} subtitle="Contractor oversight profile" onClose={() => setSelected(null)} wide>
          <div className="ag-kpi-grid ag-kpi-grid-4 ag-modal-kpis">
            <KpiCard label="Projects" value={selected.projects} detail="Current records" icon={ClipboardCheck} tone="green" />
            <KpiCard label="Verified" value={selected.verified} detail="REA verified" icon={CheckCircle2} tone="mint" />
            <KpiCard label="Compliance" value={`${selected.compliance}%`} detail="Current score" icon={ShieldCheck} tone="blue" />
            <KpiCard label="Open Findings" value={selected.findings} detail={`${selected.critical} critical`} icon={AlertTriangle} tone="rose" />
          </div>
          <div className="ag-tabs-static">
            {(["Overview", "Projects", "Inspections", "Findings", "Corrective actions"] as ContractorTab[]).map((item) => (
              <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>
            ))}
          </div>
          {renderTab()}
          <div className="ag-modal-actions">
            <button className="ag-button ag-button-outline" onClick={() => setSelected(null)}>Close</button>
            <button className="ag-button ag-button-primary" onClick={exportSelected}><Download size={16} /> Export contractor report</button>
          </div>
        </Modal>
      )}
    </section>
  );
}
