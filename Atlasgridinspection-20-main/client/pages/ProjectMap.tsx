import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Filter,
  Layers3,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import NigeriaProjectMap, {
  nigeriaProjects,
  nigeriaStateMetrics,
  type NigeriaProject,
} from "@/components/NigeriaProjectMap";

type MapFilterState = {
  search: string;
  status: string;
  type: string;
  state: string;
  contractor: string;
  risk: string;
};

const initialFilters: MapFilterState = {
  search: "",
  status: "All statuses",
  type: "All project types",
  state: "All states",
  contractor: "All contractors",
  risk: "All risk levels",
};

const statePerformance = Object.entries(nigeriaStateMetrics)
  .map(([state, values]) => ({
    state,
    total: values.total,
    verified: values.verified,
    atRisk: values.atRisk,
    coverage: Math.round((values.verified / values.total) * 100),
  }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 8);

const statusColor: Record<NigeriaProject["status"], string> = {
  Verified: "#16753A",
  Active: "#49A972",
  "Pending verification": "#D6A029",
  "At Risk": "#D97706",
  Critical: "#C74343",
  Inactive: "#A9B4AD",
};

export default function ProjectMap() {
  const [filters, setFilters] = useState<MapFilterState>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<MapFilterState>(initialFilters);
  const [selectedState, setSelectedState] = useState("Kano");
  const [selectedProject, setSelectedProject] = useState<NigeriaProject | null>(null);
  const [notice, setNotice] = useState("");

  const filteredProjects = useMemo(() => {
    const query = appliedFilters.search.trim().toLowerCase();
    return nigeriaProjects.filter((project) => {
      const matchesSearch =
        !query ||
        [project.id, project.name, project.state, project.lga, project.contractor]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        appliedFilters.status === "All statuses" ||
        project.status === appliedFilters.status;
      const matchesType =
        appliedFilters.type === "All project types" ||
        project.type === appliedFilters.type;
      const matchesState =
        appliedFilters.state === "All states" ||
        project.state === appliedFilters.state;
      const matchesContractor =
        appliedFilters.contractor === "All contractors" ||
        project.contractor === appliedFilters.contractor;
      const matchesRisk =
        appliedFilters.risk === "All risk levels" ||
        project.risk === appliedFilters.risk;
      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesState &&
        matchesContractor &&
        matchesRisk
      );
    });
  }, [appliedFilters]);

  const activeFilters = useMemo(
    () =>
      (Object.keys(initialFilters) as (keyof MapFilterState)[]).filter(
        (key) => appliedFilters[key] !== initialFilters[key],
      ).length,
    [appliedFilters],
  );

  const mapSummary = [
    { label: "Projects Mapped", value: "1,284", detail: "National portfolio", icon: Layers3, tone: "green" },
    { label: "Verified", value: "187", detail: "Authoritative records", icon: ShieldCheck, tone: "green" },
    { label: "Active", value: "946", detail: "Currently monitored", icon: Zap, tone: "mint" },
    { label: "At Risk", value: "16", detail: "Require attention", icon: AlertTriangle, tone: "rose" },
    { label: "States + FCT", value: "36 + 1", detail: "National coverage", icon: MapPin, tone: "gold" },
  ] as const;

  const selectedMetric = nigeriaStateMetrics[selectedState] ?? {
    total: filteredProjects.filter((project) => project.state === selectedState).length,
    active: filteredProjects.filter((project) => project.state === selectedState && project.status === "Active").length,
    verified: filteredProjects.filter((project) => project.state === selectedState && project.status === "Verified").length,
    atRisk: filteredProjects.filter((project) => project.state === selectedState && (project.risk === "High" || project.risk === "Critical")).length,
  };

  const updateFilter = (key: keyof MapFilterState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <motion.section
      className="rea-project-map-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <header className="rea-page-heading">
        <div>
          <div className="rea-page-kicker"><span /> NATIONAL PROJECT INTELLIGENCE</div>
          <h1>Project Map</h1>
          <p>Explore REA projects across Nigeria by status, verification coverage, contractor and programme risk.</p>
        </div>
        <div className="rea-page-heading-actions">
          <div className="rea-data-freshness">
            <span><i /> Map online</span>
            <b>{filteredProjects.length} sample project markers visible</b>
            <small>State boundaries and project coordinates enabled</small>
          </div>
          <button type="button" className="rea-outline-button" onClick={() => setNotice("Map data export prepared") }>
            <Download size={16} /> Export map data
          </button>
        </div>
      </header>

      <div className="rea-map-kpi-strip">
        {mapSummary.map(({ label, value, detail, icon: Icon, tone }, index) => (
          <motion.div
            key={label}
            className={`rea-map-kpi ${tone}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.055, duration: 0.38 }}
          >
            <span><Icon size={18} /></span>
            <div><small>{label}</small><b>{value}</b><em>{detail}</em></div>
          </motion.div>
        ))}
      </div>

      <section className="rea-map-filter-panel" aria-label="Project map filters">
        <div className="rea-map-filter-title">
          <Filter size={16} />
          <b>Map filters</b>
          {activeFilters > 0 && <em>{activeFilters} active</em>}
        </div>
        <label className="rea-map-search">
          <span>Search</span>
          <div><Search size={16} /><input value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Project, ID, contractor or location" /></div>
        </label>
        <label><span>Project status</span><select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>{["All statuses", "Verified", "Active", "Pending verification", "At Risk", "Critical"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Project type</span><select value={filters.type} onChange={(event) => updateFilter("type", event.target.value)}>{["All project types", "Solar mini-grid", "Distribution extension", "Institutional solar", "Productive-use energy"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>State</span><select value={filters.state} onChange={(event) => { updateFilter("state", event.target.value); if (event.target.value !== "All states") setSelectedState(event.target.value); }}>{["All states", ...Object.keys(nigeriaStateMetrics)].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Contractor</span><select value={filters.contractor} onChange={(event) => updateFilter("contractor", event.target.value)}>{["All contractors", ...Array.from(new Set(nigeriaProjects.map((project) => project.contractor)))].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Risk level</span><select value={filters.risk} onChange={(event) => updateFilter("risk", event.target.value)}>{["All risk levels", "Normal", "Medium", "High", "Critical"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <button
          type="button"
          className="rea-filter-reset"
          onClick={() => {
            setFilters(initialFilters);
            setAppliedFilters(initialFilters);
            setSelectedState("Kano");
            setNotice("Map filters reset");
          }}
        >
          <RefreshCw size={15} /> Reset
        </button>
        <button
          type="button"
          className="rea-primary-button"
          onClick={() => {
            setAppliedFilters(filters);
            setNotice("Map filters applied");
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

      <section className="rea-map-primary-card">
        <header>
          <div>
            <h2>National Project Coverage</h2>
            <p>Interactive Nigeria map using state boundaries and project coordinates.</p>
          </div>
          <span className="rea-map-result-count">{filteredProjects.length} markers shown</span>
        </header>
        <NigeriaProjectMap
          projects={filteredProjects}
          selectedState={appliedFilters.state === "All states" ? selectedState : appliedFilters.state}
          showLabels
          showLegend
          showSidePanel
          onStateSelect={(state) => {
            setSelectedState(state);
            setSelectedProject(null);
          }}
          onProjectSelect={(project) => setSelectedProject(project)}
        />
      </section>

      <div className="rea-map-insights-grid">
        <section className="rea-card rea-state-performance-card">
          <header className="rea-card-header">
            <div><h2>Verification Coverage by State</h2><p>Verified projects compared with the monitored portfolio.</p></div>
            <button type="button" className="rea-text-button" onClick={() => setNotice("State performance report opened")}>Full report <ArrowRight size={14} /></button>
          </header>
          <div className="rea-state-performance-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statePerformance} layout="vertical" margin={{ top: 4, right: 28, left: 4, bottom: 4 }}>
                <CartesianGrid stroke="#E8F0EB" strokeDasharray="4 6" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#71847A", fontSize: 12 }} />
                <YAxis dataKey="state" type="category" tickLine={false} axisLine={false} width={72} tick={{ fill: "#3F5C4A", fontSize: 12, fontWeight: 600 }} />
                <Tooltip formatter={(value: number) => [`${value}%`, "Verification coverage"]} cursor={{ fill: "#F4FAF6" }} />
                <Bar dataKey="coverage" fill="#3C9A69" radius={[0, 6, 6, 0]} barSize={13} animationDuration={900} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rea-card rea-selected-state-card">
          <header className="rea-card-header">
            <div><h2>{selectedState} State</h2><p>Current project and verification summary.</p></div>
            <span className="rea-state-status-pill">Selected</span>
          </header>
          <div className="rea-selected-state-kpis">
            <div><b>{selectedMetric.total}</b><small>Total projects</small></div>
            <div><b>{selectedMetric.active}</b><small>Active</small></div>
            <div><b>{selectedMetric.verified}</b><small>Verified</small></div>
            <div className="warning"><b>{selectedMetric.atRisk}</b><small>At risk</small></div>
          </div>
          <div className="rea-selected-state-progress">
            <div><span>Verification coverage</span><b>{selectedMetric.total ? Math.round((selectedMetric.verified / selectedMetric.total) * 100) : 0}%</b></div>
            <i><em style={{ width: `${selectedMetric.total ? (selectedMetric.verified / selectedMetric.total) * 100 : 0}%` }} /></i>
          </div>
          <div className="rea-selected-projects-list">
            {nigeriaProjects.filter((project) => project.state === selectedState).slice(0, 4).map((project) => (
              <button type="button" key={project.id} onClick={() => setSelectedProject(project)}>
                <i style={{ background: statusColor[project.status] }} />
                <span><b>{project.name}</b><small>{project.lga} · {project.contractor}</small></span>
                <em>{project.status}</em>
              </button>
            ))}
          </div>
        </section>

        <section className="rea-card rea-map-intelligence-card">
          <header className="rea-card-header">
            <div><h2>Map Intelligence</h2><p>Live geographic signals from field and verification data.</p></div>
          </header>
          <div className="rea-map-intelligence-list">
            <div><span><ShieldCheck size={17} /></span><p><b>Highest verification coverage</b><small>FCT leads at 94% of monitored projects.</small></p></div>
            <div><span><AlertTriangle size={17} /></span><p><b>Largest risk concentration</b><small>Kano currently has 8 projects at risk.</small></p></div>
            <div><span><Users size={17} /></span><p><b>Beneficiary confirmation</b><small>941 beneficiaries have been confirmed on site.</small></p></div>
            <div><span><Zap size={17} /></span><p><b>Capacity verification</b><small>875 kW of installed capacity is verified.</small></p></div>
          </div>
        </section>
      </div>

      {selectedProject && (
        <motion.aside
          className="rea-map-project-drawer"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
        >
          <button type="button" className="rea-map-project-drawer-close" onClick={() => setSelectedProject(null)} aria-label="Close project details"><X size={16} /></button>
          <small>{selectedProject.id} · {selectedProject.state}</small>
          <h2>{selectedProject.name}</h2>
          <p>{selectedProject.lga} · {selectedProject.type}</p>
          <dl>
            <div><dt>Contractor</dt><dd>{selectedProject.contractor}</dd></div>
            <div><dt>Status</dt><dd><i style={{ background: statusColor[selectedProject.status] }} />{selectedProject.status}</dd></div>
            <div><dt>Risk</dt><dd>{selectedProject.risk}</dd></div>
            <div><dt>Last inspection</dt><dd>{selectedProject.inspectionDate}</dd></div>
            <div><dt>Verified capacity</dt><dd>{selectedProject.capacityKw ?? 0} kW</dd></div>
            <div><dt>Beneficiaries</dt><dd>{selectedProject.beneficiaries ?? 0}</dd></div>
          </dl>
          <button type="button" className="rea-primary-button full" onClick={() => setNotice(`${selectedProject.name} opened`)}>View full project <ArrowRight size={15} /></button>
        </motion.aside>
      )}
    </motion.section>
  );
}
