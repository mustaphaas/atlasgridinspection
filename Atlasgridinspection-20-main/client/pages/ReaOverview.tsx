import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileClock,
  Layers3,
  MapPinned,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KpiCard, PageTitle, Panel, StatusBadge, TextLink } from "@/components/ModernUI";
import NigeriaProjectMap from "@/components/NigeriaProjectMap";
import { useAtlasGrid } from "@/context/AtlasGridContext";

type Destination = "Claims" | "Project map" | "Verified reports" | "Contractors" | "Analytics" | "Audit trail" | "Users";

type ReaOverviewProps = { onNavigate?: (page: Destination, extra?: { state?: string; project?: string }) => void };

type OverviewPeriod = "30 Days" | "90 Days" | "12 Months";

const trendData: Record<OverviewPeriod, { date: string; completed: number; submitted: number; approved: number; verified: number }[]> = {
  "30 Days": [
    { date: "01 May", completed: 38, submitted: 31, approved: 24, verified: 18 },
    { date: "06 May", completed: 49, submitted: 40, approved: 32, verified: 23 },
    { date: "11 May", completed: 44, submitted: 42, approved: 35, verified: 28 },
    { date: "16 May", completed: 63, submitted: 52, approved: 43, verified: 33 },
    { date: "21 May", completed: 72, submitted: 61, approved: 50, verified: 41 },
    { date: "26 May", completed: 84, submitted: 70, approved: 59, verified: 47 },
    { date: "31 May", completed: 92, submitted: 78, approved: 65, verified: 52 },
  ],
  "90 Days": [
    { date: "Mar W1", completed: 62, submitted: 50, approved: 39, verified: 31 },
    { date: "Mar W3", completed: 78, submitted: 64, approved: 53, verified: 39 },
    { date: "Apr W1", completed: 91, submitted: 75, approved: 61, verified: 45 },
    { date: "Apr W3", completed: 87, submitted: 78, approved: 66, verified: 51 },
    { date: "May W1", completed: 98, submitted: 84, approved: 72, verified: 55 },
    { date: "May W3", completed: 112, submitted: 96, approved: 82, verified: 64 },
  ],
  "12 Months": [
    { date: "Jun", completed: 210, submitted: 176, approved: 151, verified: 121 },
    { date: "Aug", completed: 246, submitted: 205, approved: 176, verified: 142 },
    { date: "Oct", completed: 278, submitted: 231, approved: 198, verified: 165 },
    { date: "Dec", completed: 314, submitted: 266, approved: 228, verified: 189 },
    { date: "Feb", completed: 361, submitted: 307, approved: 267, verified: 218 },
    { date: "Apr", completed: 409, submitted: 352, approved: 301, verified: 249 },
    { date: "May", completed: 447, submitted: 382, approved: 334, verified: 281 },
  ],
};

const contractors = [
  { name: "ABC Energy Ltd", projects: 42, compliance: 92, issues: 3 },
  { name: "NorthStar Power", projects: 35, compliance: 88, issues: 4 },
  { name: "XYZ Power Ltd", projects: 31, compliance: 84, issues: 7 },
  { name: "GreenGrid Energy", projects: 28, compliance: 79, issues: 9 },
];

const health = [
  { label: "Schedule performance", value: "91%", detail: "On track", width: 91 },
  { label: "Inspection completion", value: "73%", detail: "Of plan", width: 73 },
  { label: "REA verification rate", value: "56%", detail: "Of submitted", width: 56 },
  { label: "Compliance rate", value: "78.5%", detail: "Verified projects", width: 78.5 },
  { label: "Critical issue projects", value: "22", detail: "Require escalation", width: 22 },
  { label: "Verification turnaround", value: "2.4d", detail: "Current average", width: 64 },
];

const pipelineLabels = [
  ["Inspection Conducted", 154],
  ["Submitted", 126],
  ["Consultant Approved", 94],
  ["Pending REA Review", 71],
  ["REA Verified", 52],
] as const;

export default function ReaOverview({ onNavigate }: ReaOverviewProps) {
  const { claims } = useAtlasGrid();
  const [period, setPeriod] = useState<OverviewPeriod>("30 Days");

  const workflow = useMemo(() => ({
    newClaims: claims.filter((claim) => claim.status === "New" || claim.status === "Validated").length,
    pendingInspection: claims.filter((claim) => ["Consultant Assigned", "Field Officer Assigned", "Arrival Verified", "Inspection In Progress", "Re-inspection Required"].includes(claim.status)).length,
    pendingRea: claims.filter((claim) => claim.status === "Pending REA Review").length,
    verified: claims.filter((claim) => claim.status === "Verified").length,
  }), [claims]);

  const attention = [
    { label: "Claims awaiting consultant assignment", value: workflow.newClaims, detail: "REA action required", status: "High priority", page: "Claims" as Destination },
    { label: "Reports awaiting REA verification", value: Math.max(31, workflow.pendingRea), detail: "Current final-review queue", status: "Pending", page: "Verified reports" as Destination },
    { label: "Overdue inspections", value: 14, detail: "Across seven states", status: "Overdue", page: "Project map" as Destination },
    { label: "Overdue corrective actions", value: 14, detail: "Contractor follow-up required", status: "Escalated", page: "Contractors" as Destination },
    { label: "Projects behind schedule", value: 27, detail: "2.1% of portfolio", status: "At Risk", page: "Analytics" as Destination },
  ];

  return (
    <motion.section className="ag-page ag-overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <PageTitle
        eyebrow="NATIONAL INSPECTION & PROJECT OVERSIGHT"
        title="Overview"
        description="Executive visibility across claims, inspections, consultant quality assurance and REA verification."
        meta={<><span className="ag-live-dot" /> Live data <span>Updated today, 09:40 AM</span></>}
        actions={<button className="ag-button ag-button-outline" onClick={() => onNavigate?.("Analytics")}><BarChart3 size={16} /> Open analytics</button>}
      />

      <div className="ag-kpi-grid ag-kpi-grid-7 ag-kpi-single-line">
        <KpiCard label="Total Projects" value="1,284" detail="Programme portfolio" icon={Layers3} tone="green" onClick={() => onNavigate?.("Project map")} />
        <KpiCard label="Active Projects" value="946" detail="Currently monitored" icon={Activity} tone="mint" onClick={() => onNavigate?.("Project map")} />
        <KpiCard label="Beneficiaries Verified" value="941" detail="Confirmed on site" icon={Users} tone="green" onClick={() => onNavigate?.("Analytics")} />
        <KpiCard label="Capacity Verified" value="875 kW" detail="Installed capacity" icon={Zap} tone="blue" onClick={() => onNavigate?.("Analytics")} />
        <KpiCard label="Inspections Pending" value={Math.max(73, workflow.pendingInspection)} detail="Awaiting field action" icon={ClipboardCheck} tone="amber" onClick={() => onNavigate?.("Claims")} />
        <KpiCard label="Pending REA Review" value={Math.max(31, workflow.pendingRea)} detail="Awaiting final review" icon={FileClock} tone="amber" onClick={() => onNavigate?.("Verified reports")} />
        <KpiCard label="Projects At Risk" value="16" detail="Require intervention" icon={AlertTriangle} tone="rose" onClick={() => onNavigate?.("Project map")} />
      </div>

      <div className="ag-overview-grid ag-overview-grid-top">
        <Panel title="Requires Attention" subtitle="Priority items requiring programme action" action={<TextLink onClick={() => onNavigate?.("Claims")}>Open action queue</TextLink>}>
          <div className="ag-attention-list">
            {attention.map((item) => (
              <button key={item.label} onClick={() => onNavigate?.(item.page)}>
                <span className="ag-attention-value">{item.value}</span>
                <div><b>{item.label}</b><small>{item.detail}</small></div>
                <StatusBadge status={item.status} />
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Inspection & Verification Pipeline" subtitle="Status movement through the complete workflow" action={<TextLink onClick={() => onNavigate?.("Verified reports")}>View reports</TextLink>}>
          <div className="ag-pipeline">
            {pipelineLabels.map(([label, value], index) => (
              <button key={label} className={label === "Pending REA Review" ? "is-bottleneck" : ""} onClick={() => onNavigate?.(label.includes("REA") ? "Verified reports" : "Claims")}>
                <span>{index + 1}</span><b>{value}</b><small>{label}</small>
              </button>
            ))}
          </div>
          <div className="ag-pipeline-callout"><FileClock size={18} /><div><b>71 reports are pending REA verification</b><small>Current bottleneck · Average review time: 2.4 days</small></div><button onClick={() => onNavigate?.("Verified reports")}>Review queue</button></div>
        </Panel>
      </div>

      <Panel title="Programme Health" subtitle="Executive indicators across the reporting period" className="ag-health-panel">
        <div className="ag-health-grid">
          {health.map((item) => <div key={item.label}><span><small>{item.label}</small><b>{item.value}</b></span><i><em style={{ width: `${item.width}%` }} /></i><p>{item.detail}</p></div>)}
        </div>
      </Panel>

      <div className="ag-overview-grid ag-map-section">
        <Panel title="Project Coverage & Risk" subtitle="Click a state to focus the map and reveal projects around it" action={<TextLink onClick={() => onNavigate?.("Project map")}>Open full map</TextLink>} className="ag-overview-map-panel">
          <NigeriaProjectMap compact showLegend={false} showSidePanel={false} onStateSelect={(state) => onNavigate?.("Project map", { state })} onProjectSelect={(project) => onNavigate?.("Project map", { state: project.state, project: project.id })} />
        </Panel>

        <Panel title="Geographic Risk Summary" subtitle="States requiring programme attention" action={<MapPinned size={18} />}>
          <div className="ag-risk-list">
            {[
              ["Kano", "8 projects at risk", 8, "At Risk"],
              ["Kaduna", "6 overdue inspections", 6, "Overdue"],
              ["Bauchi", "5 high-risk projects", 5, "High priority"],
              ["Niger", "4 pending verification", 4, "Pending"],
              ["Gombe", "3 re-inspections required", 3, "Re-inspection Required"],
            ].map(([state, detail, value, status]) => <button key={String(state)} onClick={() => onNavigate?.("Project map", { state: String(state) })}><span>{state}</span><b>{value}</b><small>{detail}</small><StatusBadge status={String(status)} /></button>)}
          </div>
        </Panel>
      </div>

      <div className="ag-overview-grid ag-overview-grid-bottom">
        <Panel title="Inspections Over Time" subtitle="Completed, submitted, approved and verified" action={<div className="ag-segmented">{["30 Days", "90 Days", "12 Months"].map((item) => <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item as OverviewPeriod)}>{item}</button>)}</div>}>
          <div className="ag-overview-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trendData[period]} margin={{ top: 14, right: 16, left: -18, bottom: 0 }}><defs><linearGradient id="verifiedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2f8f62" stopOpacity={0.28} /><stop offset="100%" stopColor="#2f8f62" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="#e7eee9" strokeDasharray="4 6" vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#78857e", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#78857e", fontSize: 12 }} /><Tooltip /><Area type="monotone" dataKey="completed" stroke="#9db8aa" fill="transparent" strokeWidth={2} /><Area type="monotone" dataKey="submitted" stroke="#65a682" fill="transparent" strokeWidth={2} /><Area type="monotone" dataKey="approved" stroke="#3d8161" fill="transparent" strokeWidth={2} /><Area type="monotone" dataKey="verified" stroke="#176f45" fill="url(#verifiedFill)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div>
        </Panel>

        <Panel title="Compliance Overview" subtitle="Distribution across verified projects" action={<TextLink onClick={() => onNavigate?.("Analytics")}>Full report</TextLink>}>
          <div className="ag-compliance-stack"><div className="ag-compliance-bar"><span style={{ width: "72%" }} /><span style={{ width: "19%" }} /><span style={{ width: "7%" }} /><span style={{ width: "2%" }} /></div>{[["Compliant", "72%", "923"], ["Partially compliant", "19%", "244"], ["Non-compliant", "7%", "90"], ["Critical", "2%", "27"]].map(([label, value, count], index) => <div key={label}><i className={`tone-${index}`} /><span>{label}</span><b>{value}</b><small>{count} projects</small></div>)}</div>
        </Panel>
      </div>

      <Panel title="Contractor Performance" subtitle="Current performance across verified projects" action={<TextLink onClick={() => onNavigate?.("Contractors")}>View contractors</TextLink>}>
        <div className="ag-table-scroll"><table className="ag-table ag-compact-table"><thead><tr><th>Contractor</th><th>Projects</th><th>Compliance</th><th>Open Issues</th><th>Performance</th></tr></thead><tbody>{contractors.map((contractor) => <tr key={contractor.name} onClick={() => onNavigate?.("Contractors")}><td><b>{contractor.name}</b></td><td>{contractor.projects}</td><td><div className="ag-progress-cell"><i><em style={{ width: `${contractor.compliance}%` }} /></i><b>{contractor.compliance}%</b></div></td><td><StatusBadge status={contractor.issues > 7 ? "High Risk" : contractor.issues > 4 ? "Medium Risk" : "Low Risk"} /></td><td><CheckCircle2 size={17} /> Monitored</td></tr>)}</tbody></table></div>
      </Panel>
    </motion.section>
  );
}
