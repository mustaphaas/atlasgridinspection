import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Layers3, MapPin, Search, ShieldCheck } from "lucide-react";
import { KpiCard, PageTitle, Panel, StatusBadge } from "@/components/ModernUI";
import NigeriaProjectMap, { nigeriaProjects, nigeriaStateMetrics, type NigeriaProject } from "@/components/NigeriaProjectMap";
import { downloadCsv, downloadJson } from "@/lib/download";

export default function ProjectMap({ initialState = "Kano", initialProjectId }: { initialState?: string; initialProjectId?: string }) {
  const [search, setSearch] = useState("");
  const [state, setState] = useState("All states");
  const [status, setStatus] = useState("All statuses");
  const [risk, setRisk] = useState("All risks");
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedProject, setSelectedProject] = useState<NigeriaProject | null>(() => nigeriaProjects.find((project) => project.id === initialProjectId) ?? null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setSelectedState(initialState);
    setState(initialState === "All states" ? "All states" : initialState);
    setSelectedProject(initialProjectId ? nigeriaProjects.find((project) => project.id === initialProjectId) ?? null : null);
  }, [initialProjectId, initialState]);

  const filteredProjects = useMemo(() => nigeriaProjects.filter((project) => {
    const query = search.trim().toLowerCase();
    return (!query || `${project.name} ${project.id} ${project.contractor} ${project.lga}`.toLowerCase().includes(query)) &&
      (state === "All states" || project.state === state) &&
      (status === "All statuses" || project.status === status) &&
      (risk === "All risks" || project.risk === risk);
  }), [risk, search, state, status]);

  const selectedMetric = nigeriaStateMetrics[selectedState] ?? { total: 0, active: 0, verified: 0, atRisk: 0 };
  const stateProjects = filteredProjects.filter((project) => project.state === selectedState);
  const verified = nigeriaProjects.filter((project) => project.status === "Verified").length;
  const atRisk = nigeriaProjects.filter((project) => project.risk === "High" || project.risk === "Critical").length;

  return (
    <section className="ag-page ag-map-page">
      <PageTitle
        eyebrow="REA ADMIN / GEOSPATIAL OVERSIGHT"
        title="Project Map"
        description="Explore project coverage, verification progress and risk across Nigeria. Click any state to enlarge and focus its project locations."
        meta={<><span className="ag-live-dot" /> Map data synchronized <span>Project coordinates from controlled contract records</span></>}
        actions={<button className="ag-button ag-button-outline" onClick={() => { downloadCsv("atlasgrid-project-map.csv", [["Project ID", "Project", "State", "LGA", "Contractor", "Status", "Risk", "Latitude", "Longitude"], ...filteredProjects.map((project) => [project.id, project.name, project.state, project.lga, project.contractor, project.status, project.risk, project.latitude, project.longitude])]); setNotice("Filtered project-map data downloaded as CSV."); }}><Download size={16} /> Export map</button>}
      />

      {notice && <button className="ag-notice" onClick={() => setNotice("")}>{notice}<span>×</span></button>}

      <div className="ag-kpi-grid ag-kpi-grid-5">
        <KpiCard label="Mapped Projects" value="1,284" detail="National programme portfolio" icon={Layers3} tone="green" />
        <KpiCard label="States Covered" value="36 + FCT" detail="Nationwide coverage" icon={MapPin} tone="mint" />
        <KpiCard label="Verified Locations" value={verified} detail="Sample mapped projects" icon={CheckCircle2} tone="green" />
        <KpiCard label="At-Risk Locations" value={atRisk} detail="High or critical risk" icon={AlertTriangle} tone="rose" />
        <KpiCard label="Coordinate Integrity" value="99.2%" detail="Valid project coordinates" icon={ShieldCheck} tone="blue" />
      </div>

      <Panel title="Map filters" subtitle="Filter project markers without changing the controlled project coordinates">
        <div className="ag-map-filterbar">
          <label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search project, ID, contractor or LGA" /></label>
          <select value={state} onChange={(event) => { setState(event.target.value); if (event.target.value !== "All states") setSelectedState(event.target.value); }}><option>All states</option>{[...new Set(nigeriaProjects.map((project) => project.state))].sort().map((item) => <option key={item}>{item}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option>{[...new Set(nigeriaProjects.map((project) => project.status))].map((item) => <option key={item}>{item}</option>)}</select>
          <select value={risk} onChange={(event) => setRisk(event.target.value)}><option>All risks</option><option>Normal</option><option>Medium</option><option>High</option><option>Critical</option></select>
          <button className="ag-button ag-button-outline" onClick={() => { setSearch(""); setState("All states"); setStatus("All statuses"); setRisk("All risks"); setSelectedState("Kano"); }}>Reset filters</button>
        </div>
      </Panel>

      <Panel title="Nigeria Project Coverage" subtitle="Select a state to zoom into its boundary and reveal nearby project markers" className="ag-full-map-panel">
        <NigeriaProjectMap
          projects={filteredProjects}
          selectedState={selectedState}
          showLabels
          showLegend
          showSidePanel
          onStateSelect={(value) => { setSelectedState(value); setState(value); }}
          onProjectSelect={(project) => setSelectedProject(project)}
        />
      </Panel>

      <div className="ag-map-bottom-grid">
        <Panel title={`${selectedState} portfolio`} subtitle="Selected-state verification and risk summary">
          <div className="ag-state-summary">
            <div><b>{selectedMetric.total}</b><small>Total projects</small></div>
            <div><b>{selectedMetric.active}</b><small>Active</small></div>
            <div><b>{selectedMetric.verified}</b><small>Verified</small></div>
            <div><b>{selectedMetric.atRisk}</b><small>At risk</small></div>
          </div>
          <div className="ag-state-coverage"><span><b>Verification coverage</b><strong>{selectedMetric.total ? Math.round((selectedMetric.verified / selectedMetric.total) * 100) : 0}%</strong></span><i><em style={{ width: `${selectedMetric.total ? (selectedMetric.verified / selectedMetric.total) * 100 : 0}%` }} /></i></div>
        </Panel>

        <Panel title={`Projects around ${selectedState}`} subtitle={`${stateProjects.length} visible projects after filters`}>
          <div className="ag-map-project-list">{stateProjects.length ? stateProjects.map((project) => <button key={project.id} onClick={() => setSelectedProject(project)}><i className={`ag-map-dot ag-map-dot-${project.risk.toLowerCase()}`} /><div><b>{project.name}</b><small>{project.id} · {project.lga} · {project.contractor}</small></div><StatusBadge status={project.status} /></button>) : <div className="ag-submitted-state"><MapPin size={22} /><div><b>No matching project markers</b><p>Clear filters or choose another state.</p></div></div>}</div>
        </Panel>
      </div>

      {selectedProject && <div className="ag-map-project-drawer"><button onClick={() => setSelectedProject(null)}>×</button><div className="ag-eyebrow"><span />PROJECT RECORD</div><h2>{selectedProject.name}</h2><StatusBadge status={selectedProject.status} /><div className="ag-detail-grid"><div><small>Project ID</small><b>{selectedProject.id}</b></div><div><small>Location</small><b>{selectedProject.lga}, {selectedProject.state}</b></div><div><small>Contractor</small><b>{selectedProject.contractor}</b></div><div><small>Risk</small><StatusBadge status={selectedProject.risk} /></div><div><small>Last inspection</small><b>{selectedProject.inspectionDate}</b></div><div><small>Capacity</small><b>{selectedProject.capacityKw ?? 0} kW</b></div><div><small>Beneficiaries</small><b>{selectedProject.beneficiaries ?? 0}</b></div><div><small>Coordinates</small><b>{selectedProject.latitude}, {selectedProject.longitude}</b></div></div><button className="ag-button ag-button-primary" onClick={() => { downloadJson(`${selectedProject.id}-project-record.json`, selectedProject); setNotice(`${selectedProject.id} project record downloaded.`); }}>Download project record</button></div>}
    </section>
  );
}
