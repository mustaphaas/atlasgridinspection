import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileClock,
  Filter,
  Layers3,
  MapPinned,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import NigeriaProjectMap from "@/components/NigeriaProjectMap";

type FilterState = {
  date: string;
  state: string;
  lga: string;
  contractor: string;
  type: string;
  status: string;
};

type ReaOverviewProps = {
  onNavigate?: (
    page: "Project map" | "Verified reports" | "Contractors" | "Analytics",
  ) => void;
};

const initialFilters: FilterState = {
  date: "Last 30 days",
  state: "All states",
  lga: "All LGAs",
  contractor: "All contractors",
  type: "All project types",
  status: "All statuses",
};

const kpis = [
  {
    label: "Total Projects",
    value: "1,284",
    caption: "Programme portfolio",
    trend: "+6.2%",
    icon: Layers3,
    tone: "green",
  },
  {
    label: "Active Projects",
    value: "946",
    caption: "Currently monitored",
    trend: "73.7%",
    icon: Activity,
    tone: "mint",
  },
  {
    label: "Beneficiaries Verified",
    value: "941",
    caption: "Confirmed on site",
    trend: "+8.4%",
    icon: Users,
    tone: "green",
  },
  {
    label: "Capacity Verified",
    value: "875 kW",
    caption: "Installed capacity",
    trend: "+12.6%",
    icon: Zap,
    tone: "green",
  },
  {
    label: "Inspections Pending",
    value: "73",
    caption: "Awaiting field action",
    trend: "14 overdue",
    icon: ClipboardCheck,
    tone: "amber",
  },
  {
    label: "Pending REA Review",
    value: "31",
    caption: "Awaiting final review",
    trend: "2.4 days",
    icon: FileClock,
    tone: "gold",
  },
  {
    label: "Projects At Risk",
    value: "16",
    caption: "Require intervention",
    trend: "1.2%",
    icon: AlertTriangle,
    tone: "rose",
  },
] as const;

const trendData = {
  "30 Days": [
    { name: "01 May", inspected: 38, submitted: 31, approved: 24, verified: 18 },
    { name: "06 May", inspected: 49, submitted: 40, approved: 32, verified: 23 },
    { name: "11 May", inspected: 44, submitted: 42, approved: 35, verified: 28 },
    { name: "16 May", inspected: 63, submitted: 52, approved: 43, verified: 33 },
    { name: "21 May", inspected: 72, submitted: 61, approved: 50, verified: 41 },
    { name: "26 May", inspected: 84, submitted: 70, approved: 59, verified: 47 },
    { name: "31 May", inspected: 92, submitted: 78, approved: 65, verified: 52 },
  ],
  "90 Days": [
    { name: "Mar W1", inspected: 62, submitted: 51, approved: 42, verified: 31 },
    { name: "Mar W3", inspected: 78, submitted: 65, approved: 53, verified: 39 },
    { name: "Apr W1", inspected: 91, submitted: 75, approved: 61, verified: 45 },
    { name: "Apr W3", inspected: 87, submitted: 77, approved: 66, verified: 51 },
    { name: "May W1", inspected: 98, submitted: 84, approved: 72, verified: 55 },
    { name: "May W3", inspected: 112, submitted: 96, approved: 82, verified: 64 },
  ],
  "12 Months": [
    { name: "Jun", inspected: 210, submitted: 184, approved: 151, verified: 121 },
    { name: "Aug", inspected: 246, submitted: 213, approved: 176, verified: 142 },
    { name: "Oct", inspected: 278, submitted: 239, approved: 198, verified: 165 },
    { name: "Dec", inspected: 314, submitted: 274, approved: 228, verified: 189 },
    { name: "Feb", inspected: 361, submitted: 312, approved: 267, verified: 218 },
    { name: "Apr", inspected: 409, submitted: 356, approved: 301, verified: 249 },
    { name: "May", inspected: 447, submitted: 392, approved: 334, verified: 281 },
  ],
} as const;

const attentionItems = [
  { label: "Reports awaiting REA verification", value: 71, detail: "Oldest pending for 5 days", tone: "amber" },
  { label: "Reports returned for clarification", value: 9, detail: "Consultant response required", tone: "rose" },
  { label: "Overdue inspections", value: 14, detail: "Across 7 states", tone: "amber" },
  { label: "Overdue corrective actions", value: 14, detail: "Contractor follow-up required", tone: "rose" },
  { label: "Projects behind schedule", value: 27, detail: "2.1% of portfolio", tone: "neutral" },
] as const;

const pipeline = [
  { label: "Inspection Conducted", value: 154, detail: "Field complete", tone: "mint" },
  { label: "Submitted", value: 126, detail: "Evidence received", tone: "green" },
  { label: "Consultant Approved", value: 94, detail: "QA complete", tone: "green" },
  { label: "Pending REA Review", value: 71, detail: "Current bottleneck", tone: "amber" },
  { label: "REA Verified", value: 52, detail: "Authoritative records", tone: "deep" },
] as const;

const complianceData = [
  { name: "Compliant", value: 72, count: 923, color: "#16814A" },
  { name: "Partially compliant", value: 19, count: 244, color: "#79B894" },
  { name: "Non-compliant", value: 7, count: 90, color: "#D9A441" },
  { name: "Critical", value: 2, count: 27, color: "#C85A52" },
];

const contractors = [
  { name: "ABC Energy Ltd", projects: 42, compliance: 92, issues: 3 },
  { name: "NorthStar Power", projects: 35, compliance: 88, issues: 4 },
  { name: "XYZ Power Ltd", projects: 31, compliance: 84, issues: 7 },
  { name: "GreenGrid Energy", projects: 28, compliance: 79, issues: 9 },
  { name: "Arewa Solar Concepts", projects: 24, compliance: 76, issues: 6 },
];

const riskStates = [
  { state: "Kano", metric: "8 projects at risk", value: 8, tone: "rose" },
  { state: "Kaduna", metric: "6 overdue inspections", value: 6, tone: "amber" },
  { state: "Bauchi", metric: "5 high-risk projects", value: 5, tone: "rose" },
  { state: "Niger", metric: "4 pending verification", value: 4, tone: "neutral" },
  { state: "Gombe", metric: "3 re-inspections required", value: 3, tone: "amber" },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.045, duration: 0.42, ease: "easeOut" },
  }),
};

function Card({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rea-card ${className}`}>
      <header className="rea-card-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rea-chart-tooltip">
      <b>{label}</b>
      {payload.map((item: any) => (
        <span key={item.dataKey}>
          <i style={{ background: item.color }} />
          {item.name}: <strong>{item.value}</strong>
        </span>
      ))}
    </div>
  );
}

export default function ReaOverview({ onNavigate }: ReaOverviewProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [period, setPeriod] = useState<keyof typeof trendData>("30 Days");
  const [notice, setNotice] = useState("");

  const activeFilterCount = useMemo(
    () =>
      (Object.keys(initialFilters) as (keyof FilterState)[]).filter(
        (key) => appliedFilters[key] !== initialFilters[key],
      ).length,
    [appliedFilters],
  );

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const showNotice = (message: string) => setNotice(message);

  return (
    <motion.section
      className="rea-overview-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <header className="rea-page-heading">
        <div>
          <div className="rea-page-kicker"><span /> NATIONAL INSPECTION &amp; PROJECT OVERSIGHT</div>
          <h1>Overview</h1>
          <p>Executive visibility into national project delivery, field verification, compliance and programme risk.</p>
        </div>
        <div className="rea-page-heading-actions">
          <div className="rea-data-freshness">
            <span><i /> Live data</span>
            <b>Updated today, 09:40 AM</b>
            <small>1,284 projects · 36 states + FCT</small>
          </div>
          <button type="button" className="rea-outline-button" onClick={() => showNotice("Overview export prepared") }>
            <Download size={16} /> Export overview
          </button>
        </div>
      </header>

      <section className="rea-filter-panel" aria-label="Global dashboard filters">
        <div className="rea-filter-heading">
          <Filter size={16} />
          <span>Global filters</span>
          {activeFilterCount > 0 && <em>{activeFilterCount} active</em>}
        </div>
        {([
          ["date", "Date range", ["Last 30 days", "Last 90 days", "Last 12 months"]],
          ["state", "State", ["All states", "Kano", "Kaduna", "Bauchi", "Niger"]],
          ["lga", "LGA", ["All LGAs", "Tarauni", "Kachia", "Bauchi", "Chanchaga"]],
          ["contractor", "Contractor", ["All contractors", "GreenVolt Nigeria Ltd", "ABC Energy Ltd", "Arewa Solar Concepts"]],
          ["type", "Project type", ["All project types", "Solar mini-grid", "Distribution extension", "Institutional solar"]],
          ["status", "Project status", ["All statuses", "Active", "Pending verification", "At risk", "Verified"]],
        ] as const).map(([key, label, options]) => (
          <label key={key}>
            <span>{label}</span>
            <select
              value={filters[key]}
              onChange={(event) => updateFilter(key, event.target.value)}
            >
              {options.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
        ))}
        <button
          type="button"
          className="rea-filter-reset"
          onClick={() => {
            setFilters(initialFilters);
            setAppliedFilters(initialFilters);
            showNotice("Filters reset");
          }}
        >
          <RefreshCw size={15} /> Reset
        </button>
        <button
          type="button"
          className="rea-primary-button"
          onClick={() => {
            setAppliedFilters(filters);
            showNotice("Dashboard filters applied");
          }}
        >
          Apply filters
        </button>
      </section>

      {notice && (
        <button type="button" className="rea-inline-notice" onClick={() => setNotice("")}>
          <CheckCircle2 size={16} />
          <span>{notice}</span>
          <X size={15} />
        </button>
      )}

      <div className="rea-kpi-strip" aria-label="Programme key performance indicators">
        {kpis.map(({ label, value, caption, trend, icon: Icon, tone }, index) => (
          <motion.button
            type="button"
            key={label}
            className={`rea-kpi-card ${tone}`}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4 }}
            onClick={() => showNotice(`${label}: ${value}`)}
          >
            <span className="rea-kpi-icon"><Icon size={18} /></span>
            <small>{label}</small>
            <b>{value}</b>
            <div><em>{caption}</em><strong>{trend}</strong></div>
          </motion.button>
        ))}
      </div>

      <div className="rea-command-grid">
        <Card
          title="Programme Performance"
          subtitle="Inspections and reports moving through the verification cycle"
          className="rea-performance-card"
          action={
            <div className="rea-segmented-control" role="group" aria-label="Performance period">
              {(Object.keys(trendData) as (keyof typeof trendData)[]).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={period === item ? "active" : ""}
                  onClick={() => setPeriod(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          }
        >
          <div className="rea-performance-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData[period]} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="inspectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16814A" stopOpacity={0.26} />
                    <stop offset="100%" stopColor="#16814A" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="verifiedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7FB998" stopOpacity={0.24} />
                    <stop offset="100%" stopColor="#7FB998" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E8F0EB" strokeDasharray="4 6" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#75867C", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#75867C", fontSize: 12 }} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="inspected" name="Inspected" stroke="#16814A" strokeWidth={2.5} fill="url(#inspectedGradient)" animationDuration={900} />
                <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#49A972" strokeWidth={2.2} fill="transparent" animationDuration={1000} />
                <Area type="monotone" dataKey="approved" name="Approved" stroke="#95C9A9" strokeWidth={2.2} fill="transparent" animationDuration={1100} />
                <Area type="monotone" dataKey="verified" name="REA verified" stroke="#D09A35" strokeWidth={2.5} fill="url(#verifiedGradient)" animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="rea-chart-legend">
            <span><i style={{ background: "#16814A" }} />Inspected</span>
            <span><i style={{ background: "#49A972" }} />Submitted</span>
            <span><i style={{ background: "#95C9A9" }} />Consultant approved</span>
            <span><i style={{ background: "#D09A35" }} />REA verified</span>
          </div>
          <div className="rea-health-strip">
            <div><small>Schedule performance</small><b>91%</b><span>On track</span></div>
            <div><small>Inspection completion</small><b>73%</b><span>Of plan</span></div>
            <div><small>Verification rate</small><b>56%</b><span>Of submitted</span></div>
            <div><small>Avg turnaround</small><b>2.4d</b><span>Current average</span></div>
          </div>
        </Card>

        <Card
          title="Requires Action"
          subtitle="Priority items for REA programme teams"
          className="rea-attention-card"
          action={<button type="button" className="rea-text-button" onClick={() => showNotice("Action queue opened")}>View all <ArrowRight size={14} /></button>}
        >
          <div className="rea-attention-list">
            {attentionItems.map((item, index) => (
              <motion.button
                type="button"
                key={item.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + index * 0.06 }}
                onClick={() => showNotice(`${item.label} opened`)}
              >
                <i className={item.tone} />
                <span><b>{item.label}</b><small>{item.detail}</small></span>
                <strong>{item.value}</strong>
                <ArrowRight size={15} />
              </motion.button>
            ))}
          </div>
          <div className="rea-attention-summary">
            <ShieldCheck size={18} />
            <span><b>82% of priority items have owners</b><small>11 actions remain unassigned</small></span>
          </div>
        </Card>
      </div>

      <Card
        title="Inspection & REA Verification Pipeline"
        subtitle="Current volume and conversion across the controlled workflow"
        className="rea-pipeline-card"
        action={<button type="button" className="rea-text-button" onClick={() => onNavigate?.("Verified reports")}>Open reports <ArrowRight size={14} /></button>}
      >
        <div className="rea-pipeline">
          {pipeline.map((stage, index) => (
            <div className="rea-pipeline-step" key={stage.label}>
              <div className={`rea-pipeline-node ${stage.tone}`}>
                <span>{index + 1}</span>
                <b>{stage.value}</b>
              </div>
              <div className="rea-pipeline-copy"><b>{stage.label}</b><small>{stage.detail}</small></div>
              {index < pipeline.length - 1 && <div className="rea-pipeline-connector"><i /></div>}
            </div>
          ))}
        </div>
        <div className="rea-pipeline-callout">
          <FileClock size={18} />
          <div><b>71 reports are awaiting REA verification</b><span>Current bottleneck · Average review time is 2.4 days</span></div>
          <button type="button" onClick={() => onNavigate?.("Verified reports")}>Review queue <ArrowRight size={14} /></button>
        </div>
      </Card>

      <Card
        title="Project Coverage & Risk"
        subtitle="National project distribution, verification coverage and geographic risk"
        className="rea-coverage-card"
        action={<button type="button" className="rea-primary-button compact" onClick={() => onNavigate?.("Project map")}><MapPinned size={15} /> Open project map</button>}
      >
        <div className="rea-coverage-layout">
          <div className="rea-overview-map-wrap">
            <NigeriaProjectMap
              compact
              showLabels={false}
              showLegend={false}
              showSidePanel={false}
              onProjectSelect={(project) => showNotice(`${project.name} selected`)}
            />
          </div>
          <aside className="rea-risk-panel">
            <header><div><small>GEOGRAPHIC PRIORITIES</small><h3>Risk hotspots</h3></div><span>5 states</span></header>
            <div className="rea-risk-list">
              {riskStates.map((item, index) => (
                <button type="button" key={item.state} onClick={() => showNotice(`${item.state} risk profile opened`)}>
                  <span className={`rea-risk-rank ${item.tone}`}>{index + 1}</span>
                  <div><b>{item.state}</b><small>{item.metric}</small></div>
                  <strong>{item.value}</strong>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
            <div className="rea-risk-footer">
              <div><small>National coverage</small><b>36 states + FCT</b></div>
              <div><small>Projects mapped</small><b>1,284</b></div>
            </div>
          </aside>
        </div>
      </Card>

      <div className="rea-bottom-grid">
        <Card
          title="Compliance Overview"
          subtitle="Assessment distribution across verified projects"
          className="rea-compliance-card"
          action={<button type="button" className="rea-text-button" onClick={() => onNavigate?.("Analytics")}>Full analysis <ArrowRight size={14} /></button>}
        >
          <div className="rea-compliance-content">
            <div className="rea-compliance-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={complianceData} dataKey="value" innerRadius={68} outerRadius={94} paddingAngle={3} cornerRadius={6} animationDuration={1000}>
                    {complianceData.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value: number, _name: string, item: any) => [`${value}% (${item.payload.count})`, item.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div><b>78.5%</b><span>Overall compliance</span></div>
            </div>
            <div className="rea-compliance-list">
              {complianceData.map((item) => (
                <div key={item.name}>
                  <i style={{ background: item.color }} />
                  <span><b>{item.name}</b><small>{item.count} projects</small></span>
                  <strong>{item.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          title="Contractor Performance"
          subtitle="Current delivery quality across monitored contractors"
          className="rea-contractor-card"
          action={<button type="button" className="rea-text-button" onClick={() => onNavigate?.("Contractors")}>View contractors <ArrowRight size={14} /></button>}
        >
          <div className="rea-contractor-head"><span>Contractor</span><span>Projects</span><span>Compliance</span><span>Open issues</span></div>
          <div className="rea-contractor-list">
            {contractors.map((contractor) => (
              <button type="button" key={contractor.name} onClick={() => onNavigate?.("Contractors")}>
                <span className="rea-contractor-name"><i>{contractor.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</i><b>{contractor.name}</b></span>
                <strong>{contractor.projects}</strong>
                <span className="rea-contractor-progress"><b>{contractor.compliance}%</b><i><em style={{ width: `${contractor.compliance}%` }} /></i></span>
                <span className={`rea-issue-count ${contractor.issues >= 8 ? "high" : contractor.issues >= 5 ? "medium" : "low"}`}>{contractor.issues}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </motion.section>
  );
}
