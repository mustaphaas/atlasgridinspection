import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  Gauge,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { downloadCsv } from "@/lib/download";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

type AnalyticsPeriod = "30 Days" | "90 Days" | "12 Months";

type AnalyticsProps = {
  onNavigate?: (page: "Project map" | "Verified reports" | "Contractors") => void;
};

const nationalTrend: Record<AnalyticsPeriod, { period: string; inspected: number; approved: number; verified: number; compliance: number }[]> = {
  "30 Days": [
    { period: "01 May", inspected: 38, approved: 24, verified: 18, compliance: 72 },
    { period: "06 May", inspected: 49, approved: 32, verified: 23, compliance: 74 },
    { period: "11 May", inspected: 44, approved: 35, verified: 28, compliance: 75 },
    { period: "16 May", inspected: 63, approved: 43, verified: 33, compliance: 76 },
    { period: "21 May", inspected: 72, approved: 50, verified: 41, compliance: 78 },
    { period: "26 May", inspected: 84, approved: 59, verified: 47, compliance: 78.2 },
    { period: "31 May", inspected: 92, approved: 65, verified: 52, compliance: 78.5 },
  ],
  "90 Days": [
    { period: "Mar W1", inspected: 62, approved: 42, verified: 31, compliance: 71 },
    { period: "Mar W3", inspected: 78, approved: 53, verified: 39, compliance: 72.4 },
    { period: "Apr W1", inspected: 91, approved: 61, verified: 45, compliance: 74 },
    { period: "Apr W3", inspected: 87, approved: 66, verified: 51, compliance: 75.6 },
    { period: "May W1", inspected: 98, approved: 72, verified: 55, compliance: 77.1 },
    { period: "May W3", inspected: 112, approved: 82, verified: 64, compliance: 78.5 },
  ],
  "12 Months": [
    { period: "Jun", inspected: 210, approved: 151, verified: 121, compliance: 67 },
    { period: "Aug", inspected: 246, approved: 176, verified: 142, compliance: 69.5 },
    { period: "Oct", inspected: 278, approved: 198, verified: 165, compliance: 71.8 },
    { period: "Dec", inspected: 314, approved: 228, verified: 189, compliance: 73.4 },
    { period: "Feb", inspected: 361, approved: 267, verified: 218, compliance: 76.2 },
    { period: "Apr", inspected: 409, approved: 301, verified: 249, compliance: 77.6 },
    { period: "May", inspected: 447, approved: 334, verified: 281, compliance: 78.5 },
  ],
};

const funnelData = [
  { stage: "Inspected", value: 154, rate: 100 },
  { stage: "Submitted", value: 126, rate: 82 },
  { stage: "Consultant approved", value: 94, rate: 61 },
  { stage: "Pending REA", value: 71, rate: 46 },
  { stage: "REA verified", value: 52, rate: 34 },
];

const stateData = [
  { state: "Kano", active: 40, verified: 32, risk: 8 },
  { state: "Kaduna", active: 34, verified: 38, risk: 4 },
  { state: "Bauchi", active: 30, verified: 31, risk: 5 },
  { state: "Borno", active: 27, verified: 30, risk: 3 },
  { state: "Katsina", active: 29, verified: 31, risk: 3 },
  { state: "Sokoto", active: 28, verified: 30, risk: 2 },
  { state: "FCT", active: 27, verified: 29, risk: 2 },
  { state: "Niger", active: 22, verified: 24, risk: 4 },
];

const complianceData = [
  { name: "Compliant", value: 72, color: "#16814A" },
  { name: "Partial", value: 19, color: "#7BB995" },
  { name: "Non-compliant", value: 7, color: "#D9A441" },
  { name: "Critical", value: 2, color: "#C85A52" },
];

const radarData = [
  { metric: "Quality", ABC: 92, GreenGrid: 79, Arewa: 76 },
  { metric: "Schedule", ABC: 88, GreenGrid: 72, Arewa: 82 },
  { metric: "Evidence", ABC: 94, GreenGrid: 84, Arewa: 79 },
  { metric: "Closure", ABC: 86, GreenGrid: 68, Arewa: 73 },
  { metric: "Compliance", ABC: 92, GreenGrid: 79, Arewa: 76 },
  { metric: "Re-inspection", ABC: 89, GreenGrid: 70, Arewa: 81 },
];

const riskDeliveryData = [
  { name: "ABC Energy", x: 92, y: 91, z: 42, risk: "Low" },
  { name: "NorthStar", x: 88, y: 86, z: 35, risk: "Low" },
  { name: "XYZ Power", x: 84, y: 78, z: 31, risk: "Medium" },
  { name: "GreenGrid", x: 79, y: 72, z: 28, risk: "High" },
  { name: "Arewa Solar", x: 76, y: 81, z: 24, risk: "Medium" },
  { name: "SolarTech", x: 71, y: 66, z: 19, risk: "High" },
];

const impactData = [
  { month: "Dec", capacity: 420, beneficiaries: 480, projects: 48 },
  { month: "Jan", capacity: 510, beneficiaries: 552, projects: 56 },
  { month: "Feb", capacity: 586, beneficiaries: 618, projects: 61 },
  { month: "Mar", capacity: 670, beneficiaries: 704, projects: 69 },
  { month: "Apr", capacity: 760, beneficiaries: 818, projects: 76 },
  { month: "May", capacity: 875, beneficiaries: 941, projects: 84 },
];

const analyticsKpis = [
  { label: "REA Verification Rate", value: "56%", detail: "Of submitted reports", delta: "+4.8%", icon: ShieldCheck, tone: "green" },
  { label: "Inspection Completion", value: "73%", detail: "Against reporting plan", delta: "+6.1%", icon: CheckCircle2, tone: "mint" },
  { label: "Compliance Rate", value: "78.5%", detail: "Across verified projects", delta: "+2.3%", icon: Gauge, tone: "green" },
  { label: "Beneficiaries Verified", value: "941", detail: "Confirmed on site", delta: "+8.4%", icon: Users, tone: "green" },
  { label: "Capacity Verified", value: "875 kW", detail: "Installed capacity", delta: "+12.6%", icon: Zap, tone: "gold" },
] as const;

function AnalyticsCard({ title, subtitle, action, className = "", children }: { title: string; subtitle: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={`rea-analytics-card ${className}`}>
      <header><div><h2>{title}</h2><p>{subtitle}</p></div>{action}</header>
      {children}
    </section>
  );
}

function AnalyticsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rea-chart-tooltip">
      {label && <b>{label}</b>}
      {payload.map((entry: any) => (
        <span key={`${entry.name}-${entry.value}`}>
          <i style={{ background: entry.color ?? entry.fill }} />
          {entry.name}: <strong>{entry.value}</strong>
        </span>
      ))}
    </div>
  );
}

function RiskScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]?.payload) return null;
  const item = payload[0].payload;
  return (
    <div className="rea-chart-tooltip">
      <b>{item.name}</b>
      <span>Compliance: <strong>{item.x}%</strong></span>
      <span>Schedule: <strong>{item.y}%</strong></span>
      <span>Projects: <strong>{item.z}</strong></span>
      <span>Risk: <strong>{item.risk}</strong></span>
    </div>
  );
}

export default function Analytics({ onNavigate }: AnalyticsProps) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30 Days");
  const [notice, setNotice] = useState("");

  const averageVerified = useMemo(() => {
    const data = nationalTrend[period];
    return Math.round(data.reduce((sum, item) => sum + item.verified, 0) / data.length);
  }, [period]);

  return (
    <motion.section
      className="rea-analytics-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42 }}
    >
      <header className="rea-page-heading">
        <div>
          <div className="rea-page-kicker"><span /> REA ADMIN / ADVANCED PROGRAMME ANALYTICS</div>
          <h1>Analytics</h1>
          <p>Interactive performance intelligence across inspections, verification, contractors, compliance, capacity and beneficiary outcomes.</p>
        </div>
        <div className="rea-page-heading-actions">
          <div className="rea-analytics-period">
            <CalendarDays size={16} />
            <select value={period} onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)}>
              <option>30 Days</option>
              <option>90 Days</option>
              <option>12 Months</option>
            </select>
          </div>
          <button type="button" className="rea-outline-button" onClick={() => { downloadCsv("atlasgrid-analytics-snapshot.csv", [["Period", "Inspected", "Consultant Approved", "REA Verified", "Compliance %"], ...nationalTrend[period].map((item) => [item.period, item.inspected, item.approved, item.verified, item.compliance])]); setNotice("Analytics snapshot downloaded as CSV."); }}>
            <Download size={16} /> Export snapshot
          </button>
        </div>
      </header>

      {notice && (
        <button type="button" className="rea-inline-notice" onClick={() => setNotice("")}>
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </button>
      )}

      <div className="rea-analytics-kpi-strip">
        {analyticsKpis.map(({ label, value, detail, delta, icon: Icon, tone }, index) => (
          <motion.div
            key={label}
            className={`rea-analytics-kpi ${tone}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.055, duration: 0.4 }}
            whileHover={{ y: -4 }}
          >
            <span><Icon size={18} /></span>
            <small>{label}</small>
            <b>{value}</b>
            <div><em>{detail}</em><strong><TrendingUp size={12} />{delta}</strong></div>
          </motion.div>
        ))}
      </div>

      <div className="rea-analytics-grid primary">
        <AnalyticsCard
          title="National Performance Trend"
          subtitle="Inspection throughput, approvals, verification and compliance over time"
          className="rea-analytics-trend-card"
          action={<div className="rea-analytics-stat"><small>Average verified</small><b>{averageVerified}</b></div>}
        >
          <div className="rea-analytics-trend-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={nationalTrend[period]} margin={{ top: 16, right: 20, left: -16, bottom: 4 }}>
                <defs>
                  <linearGradient id="analyticsInspected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16814A" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#16814A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E8F0EB" strokeDasharray="4 6" vertical={false} />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: "#728379", fontSize: 12 }} />
                <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "#728379", fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" domain={[60, 90]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} tick={{ fill: "#9A7A37", fontSize: 12 }} />
                <Tooltip content={<AnalyticsTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area yAxisId="left" type="monotone" dataKey="inspected" name="Inspected" stroke="#16814A" fill="url(#analyticsInspected)" strokeWidth={2.6} animationDuration={950} />
                <Line yAxisId="left" type="monotone" dataKey="approved" name="Consultant approved" stroke="#62A982" strokeWidth={2.3} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={1050} />
                <Line yAxisId="left" type="monotone" dataKey="verified" name="REA verified" stroke="#D29A35" strokeWidth={2.6} dot={{ r: 3 }} activeDot={{ r: 5 }} animationDuration={1150} />
                <Line yAxisId="right" type="monotone" dataKey="compliance" name="Compliance %" stroke="#385F4B" strokeDasharray="6 5" strokeWidth={2} dot={false} animationDuration={1250} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          title="Verification Funnel"
          subtitle="Conversion from completed inspection to authoritative REA record"
          className="rea-funnel-card"
          action={<button type="button" className="rea-text-button" onClick={() => onNavigate?.("Verified reports")}>Open queue <ArrowRight size={14} /></button>}
        >
          <div className="rea-funnel-list">
            {funnelData.map((item, index) => (
              <motion.button
                type="button"
                key={item.stage}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.07 }}
                onClick={() => onNavigate?.("Verified reports")}
              >
                <span><i>{index + 1}</i><b>{item.stage}</b></span>
                <strong>{item.value}</strong>
                <div><em style={{ width: `${item.rate}%` }} /></div>
                <small>{item.rate}% of inspected</small>
              </motion.button>
            ))}
          </div>
          <div className="rea-funnel-insight">
            <AlertTriangle size={17} />
            <span><b>46% currently reach the REA review stage</b><small>Consultant approval and REA queue time are the main conversion constraints.</small></span>
          </div>
        </AnalyticsCard>
      </div>

      <div className="rea-analytics-grid secondary">
        <AnalyticsCard
          title="State Portfolio Performance"
          subtitle="Active, verified and at-risk projects across leading state portfolios"
          className="rea-state-analytics-card"
          action={<button type="button" className="rea-text-button" onClick={() => onNavigate?.("Project map")}>View map <ArrowRight size={14} /></button>}
        >
          <div className="rea-state-analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} margin={{ top: 8, right: 16, left: -18, bottom: 2 }}>
                <CartesianGrid stroke="#E8F0EB" strokeDasharray="4 6" vertical={false} />
                <XAxis dataKey="state" tickLine={false} axisLine={false} tick={{ fill: "#64796C", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#7B8E83", fontSize: 12 }} />
                <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: "#F4FAF6" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="active" name="Active" stackId="portfolio" fill="#9FD1B0" radius={[4, 4, 0, 0]} animationDuration={850} />
                <Bar dataKey="verified" name="Verified" stackId="portfolio" fill="#16814A" animationDuration={1000} />
                <Bar dataKey="risk" name="At risk" stackId="portfolio" fill="#D98A4D" radius={[4, 4, 0, 0]} animationDuration={1150} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          title="Compliance Distribution"
          subtitle="Current compliance mix across verified projects"
          className="rea-compliance-analytics-card"
        >
          <div className="rea-analytics-donut-wrap">
            <div className="rea-analytics-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={complianceData} dataKey="value" innerRadius={70} outerRadius={100} paddingAngle={3} cornerRadius={7} animationDuration={1100}>
                    {complianceData.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div><b>78.5%</b><span>Compliant</span></div>
            </div>
            <div className="rea-analytics-donut-legend">
              {complianceData.map((item) => (
                <div key={item.name}><i style={{ background: item.color }} /><span>{item.name}</span><b>{item.value}%</b></div>
              ))}
            </div>
          </div>
        </AnalyticsCard>
      </div>

      <div className="rea-analytics-grid tertiary">
        <AnalyticsCard
          title="Contractor Quality Profile"
          subtitle="Comparative performance across quality, schedule, evidence and closure"
          className="rea-radar-card"
          action={<button type="button" className="rea-text-button" onClick={() => onNavigate?.("Contractors")}>Contractors <ArrowRight size={14} /></button>}
        >
          <div className="rea-radar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#DDEBE2" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#5D7466", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="ABC Energy" dataKey="ABC" stroke="#16814A" fill="#16814A" fillOpacity={0.2} animationDuration={900} />
                <Radar name="GreenGrid" dataKey="GreenGrid" stroke="#D19A3A" fill="#D19A3A" fillOpacity={0.12} animationDuration={1050} />
                <Radar name="Arewa Solar" dataKey="Arewa" stroke="#76A88A" fill="#76A88A" fillOpacity={0.1} animationDuration={1200} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard
          title="Risk vs Delivery Matrix"
          subtitle="Contractor compliance compared with schedule performance; bubble size represents portfolio"
          className="rea-scatter-card"
        >
          <div className="rea-scatter-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 22, bottom: 16, left: 4 }}>
                <CartesianGrid stroke="#E8F0EB" strokeDasharray="4 6" />
                <XAxis type="number" dataKey="x" name="Compliance" domain={[60, 100]} unit="%" tick={{ fill: "#6B7F73", fontSize: 12 }} label={{ value: "Compliance", position: "insideBottom", offset: -8, fill: "#6B7F73", fontSize: 12 }} />
                <YAxis type="number" dataKey="y" name="Schedule" domain={[55, 100]} unit="%" tick={{ fill: "#6B7F73", fontSize: 12 }} label={{ value: "Schedule", angle: -90, position: "insideLeft", fill: "#6B7F73", fontSize: 12 }} />
                <ZAxis type="number" dataKey="z" range={[90, 430]} name="Projects" />
                <Tooltip content={<RiskScatterTooltip />} cursor={{ strokeDasharray: "4 4" }} />
                <Scatter name="Contractors" data={riskDeliveryData} fill="#2F8E5F" animationDuration={1100}>
                  {riskDeliveryData.map((item) => <Cell key={item.name} fill={item.risk === "High" ? "#D87852" : item.risk === "Medium" ? "#D1A03F" : "#2F8E5F"} />)}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>
      </div>

      <AnalyticsCard
        title="Capacity & Beneficiary Impact"
        subtitle="Verified installed capacity and confirmed beneficiaries over the last six reporting periods"
        className="rea-impact-card"
        action={<div className="rea-impact-summary"><span><Zap size={14} />875 kW</span><span><Users size={14} />941 beneficiaries</span></div>}
      >
        <div className="rea-impact-chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={impactData} margin={{ top: 16, right: 24, left: -10, bottom: 4 }}>
              <CartesianGrid stroke="#E8F0EB" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#6B7F73", fontSize: 12 }} />
              <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fill: "#6B7F73", fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fill: "#9B7936", fontSize: 12 }} />
              <Tooltip content={<AnalyticsTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="capacity" name="Verified capacity (kW)" fill="#9BCBAB" radius={[7, 7, 0, 0]} barSize={34} animationDuration={900} />
              <Area yAxisId="right" type="monotone" dataKey="beneficiaries" name="Beneficiaries" stroke="#16814A" fill="#16814A" fillOpacity={0.12} strokeWidth={2.6} animationDuration={1100} />
              <Line yAxisId="left" type="monotone" dataKey="projects" name="Projects verified" stroke="#D09A35" strokeWidth={2.2} dot={{ r: 3 }} animationDuration={1250} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </AnalyticsCard>

      <section className="rea-analytics-insights">
        <div><span><TrendingUp size={18} /></span><p><b>Verification velocity is improving</b><small>REA-verified reports increased 12% over the previous reporting period.</small></p></div>
        <div><span><BarChart3 size={18} /></span><p><b>State performance is uneven</b><small>FCT and Kaduna lead coverage, while Kano carries the largest risk concentration.</small></p></div>
        <div><span><AlertTriangle size={18} /></span><p><b>Corrective-action closure needs attention</b><small>14 actions are overdue and materially affect contractor risk ratings.</small></p></div>
      </section>
    </motion.section>
  );
}
