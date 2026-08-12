import { useMemo, useState } from "react";
import { Builder } from "@builder.io/react";
import nigeriaMap from "@svg-maps/nigeria";
import { LocateFixed, Minus, Plus, RotateCcw, X } from "lucide-react";

export type NigeriaMapView = "status" | "coverage" | "risk";

type ProjectStatus = "Verified" | "Active" | "Pending verification" | "At Risk" | "Critical" | "Inactive";

type Project = {
  id: string;
  name: string;
  state: string;
  lga: string;
  contractor: string;
  type: string;
  status: ProjectStatus;
  risk: "Normal" | "Medium" | "High" | "Critical";
  inspectionDate: string;
  latitude: number;
  longitude: number;
};

type StateMetric = {
  total: number;
  active: number;
  verified: number;
  atRisk: number;
};

type NigeriaProjectMapProps = {
  selectedState?: string;
  mapView?: NigeriaMapView;
  projects?: Project[];
  stateMetrics?: Record<string, StateMetric>;
  showLabels?: boolean;
  showLegend?: boolean;
  onStateSelect?: (state: string) => void;
  onProjectSelect?: (project: Project) => void;
  compact?: boolean;
};

type MapLocation = { id: string; name: string; path: string };

const mapData = nigeriaMap as unknown as { viewBox: string; locations: MapLocation[] };

const defaultProjects: Project[] = [
  { id: "REA-KN-2026-014", name: "Rimin Gado Solar Mini-Grid", state: "Kano", lga: "Rimin Gado", contractor: "Arewa Solar Concepts", type: "Solar mini-grid", status: "Verified", risk: "Normal", inspectionDate: "06 Aug 2026", latitude: 11.62, longitude: 8.58 },
  { id: "REA-KN-2026-021", name: "Tarauni Community Power", state: "Kano", lga: "Tarauni", contractor: "GreenVolt Nigeria Ltd", type: "Solar mini-grid", status: "Active", risk: "Medium", inspectionDate: "05 Aug 2026", latitude: 12.02, longitude: 8.54 },
  { id: "REA-KD-2026-009", name: "Kachia Rural Electrification", state: "Kaduna", lga: "Kachia", contractor: "Sahel Power Systems Ltd", type: "Solar mini-grid", status: "Pending verification", risk: "High", inspectionDate: "27 Jul 2026", latitude: 9.87, longitude: 7.95 },
  { id: "REA-KT-2026-006", name: "Katsina North Solar Hub", state: "Katsina", lga: "Katsina", contractor: "GreenVolt Nigeria Ltd", type: "Solar mini-grid", status: "Active", risk: "Normal", inspectionDate: "02 Aug 2026", latitude: 12.99, longitude: 7.60 },
  { id: "REA-SO-2026-003", name: "Sokoto Irrigation Cluster", state: "Sokoto", lga: "Sokoto North", contractor: "Arewa Solar Concepts", type: "Solar mini-grid", status: "Verified", risk: "Normal", inspectionDate: "31 Jul 2026", latitude: 13.06, longitude: 5.24 },
  { id: "REA-BA-2026-011", name: "Bauchi Community Energy", state: "Bauchi", lga: "Bauchi", contractor: "Sahel Power Systems Ltd", type: "Solar mini-grid", status: "At Risk", risk: "High", inspectionDate: "29 Jul 2026", latitude: 10.31, longitude: 9.84 },
  { id: "REA-GO-2026-004", name: "Gombe Health Facility Power", state: "Gombe", lga: "Gombe", contractor: "GreenVolt Nigeria Ltd", type: "Solar mini-grid", status: "Active", risk: "Medium", inspectionDate: "01 Aug 2026", latitude: 10.29, longitude: 11.17 },
  { id: "REA-NI-2026-008", name: "Minna Rural Power Link", state: "Niger", lga: "Chanchaga", contractor: "Arewa Solar Concepts", type: "Solar mini-grid", status: "Verified", risk: "Normal", inspectionDate: "25 Jul 2026", latitude: 9.61, longitude: 6.56 },
  { id: "REA-FC-2026-002", name: "Abuja Satellite Community Grid", state: "FCT", lga: "Abuja Municipal", contractor: "GreenVolt Nigeria Ltd", type: "Solar mini-grid", status: "Verified", risk: "Normal", inspectionDate: "04 Aug 2026", latitude: 9.08, longitude: 7.40 },
  { id: "REA-LA-2026-018", name: "Lagos Coastal Energy Point", state: "Lagos", lga: "Epe", contractor: "SolarTech Nigeria", type: "Solar mini-grid", status: "Critical", risk: "Critical", inspectionDate: "18 Jul 2026", latitude: 6.58, longitude: 3.75 },
  { id: "REA-EN-2026-005", name: "Enugu Rural Solar Cluster", state: "Enugu", lga: "Nsukka", contractor: "Sahel Power Systems Ltd", type: "Solar mini-grid", status: "Pending verification", risk: "Medium", inspectionDate: "30 Jul 2026", latitude: 6.86, longitude: 7.40 },
  { id: "REA-PL-2026-012", name: "Plateau Highland Mini-Grid", state: "Plateau", lga: "Jos South", contractor: "Arewa Solar Concepts", type: "Solar mini-grid", status: "Active", risk: "Normal", inspectionDate: "03 Aug 2026", latitude: 9.22, longitude: 9.52 },
  { id: "REA-NA-2026-007", name: "Nasarawa Agri-Power Site", state: "Nasarawa", lga: "Lafia", contractor: "GreenVolt Nigeria Ltd", type: "Solar mini-grid", status: "Active", risk: "Medium", inspectionDate: "26 Jul 2026", latitude: 8.49, longitude: 8.52 },
  { id: "REA-BO-2026-010", name: "Borno Resilience Power Hub", state: "Borno", lga: "Maiduguri", contractor: "Sahel Power Systems Ltd", type: "Solar mini-grid", status: "At Risk", risk: "High", inspectionDate: "21 Jul 2026", latitude: 11.83, longitude: 13.15 },
  { id: "REA-YO-2026-003", name: "Yobe Community Grid", state: "Yobe", lga: "Damaturu", contractor: "Arewa Solar Concepts", type: "Solar mini-grid", status: "Verified", risk: "Normal", inspectionDate: "28 Jul 2026", latitude: 11.75, longitude: 11.96 },
  { id: "REA-BE-2026-004", name: "Benue Riverbank Power Site", state: "Benue", lga: "Makurdi", contractor: "SolarTech Nigeria", type: "Solar mini-grid", status: "Active", risk: "Medium", inspectionDate: "24 Jul 2026", latitude: 7.73, longitude: 8.54 },
];

const defaultMetrics: Record<string, StateMetric> = {
  Kano: { total: 48, active: 40, verified: 32, atRisk: 8 }, Kaduna: { total: 42, active: 34, verified: 38, atRisk: 4 }, Katsina: { total: 36, active: 29, verified: 31, atRisk: 3 }, Sokoto: { total: 35, active: 28, verified: 30, atRisk: 2 }, Bauchi: { total: 39, active: 30, verified: 31, atRisk: 5 }, Gombe: { total: 27, active: 23, verified: 22, atRisk: 2 }, Niger: { total: 28, active: 22, verified: 24, atRisk: 4 }, FCT: { total: 31, active: 27, verified: 29, atRisk: 2 }, Lagos: { total: 16, active: 12, verified: 13, atRisk: 1 }, Enugu: { total: 19, active: 15, verified: 16, atRisk: 2 }, Plateau: { total: 24, active: 19, verified: 21, atRisk: 2 }, Nasarawa: { total: 22, active: 17, verified: 18, atRisk: 3 }, Borno: { total: 37, active: 27, verified: 30, atRisk: 3 }, Yobe: { total: 25, active: 19, verified: 21, atRisk: 3 }, Benue: { total: 21, active: 16, verified: 17, atRisk: 3 },
};

const labelCoordinates: Record<string, [number, number]> = { Kano: [12.0, 8.5], Kaduna: [10.5, 7.4], Katsina: [12.7, 7.6], Sokoto: [13.0, 5.3], Bauchi: [10.3, 9.8], Gombe: [10.2, 11.1], Niger: [9.6, 6.5], FCT: [9.1, 7.4], Lagos: [6.5, 3.4], Enugu: [6.5, 7.5], Plateau: [9.3, 9.5], Nasarawa: [8.5, 8.4], Borno: [11.8, 13.1], Yobe: [12.0, 11.7], Benue: [7.7, 8.6] };

const statusColors: Record<ProjectStatus, string> = { Verified: "#16753A", Active: "#42A765", "Pending verification": "#D6A029", "At Risk": "#D97706", Critical: "#C74343", Inactive: "#A9B4AD" };
const mapLocations = mapData.locations ?? [];
const stateName = (name: string) => name === "Federal Capital Territory" ? "FCT" : name;
const normalizeState = (name: string) => stateName(name).toLowerCase().replace(/[^a-z]/g, "");

function projectPoint(latitude: number, longitude: number) {
  const x = ((longitude - 2.6) / (14.7 - 2.6)) * 744;
  const y = ((13.9 - latitude) / (13.9 - 4.2)) * 600;
  return { x, y };
}

function metricFor(state: string, projects: Project[], metrics: Record<string, StateMetric>) {
  const supplied = metrics[state];
  if (supplied) return supplied;
  const stateProjects = projects.filter((project) => normalizeState(project.state) === normalizeState(state));
  return { total: stateProjects.length, active: stateProjects.filter((project) => project.status === "Active").length, verified: stateProjects.filter((project) => project.status === "Verified").length, atRisk: stateProjects.filter((project) => project.risk === "High" || project.risk === "Critical" || project.status === "At Risk").length };
}

export default function NigeriaProjectMap({ selectedState: selectedStateProp, mapView: mapViewProp = "status", projects = defaultProjects, stateMetrics = defaultMetrics, showLabels = true, showLegend = true, onStateSelect, onProjectSelect, compact = false }: NigeriaProjectMapProps) {
  const [selectedState, setSelectedState] = useState(selectedStateProp ?? "Kano");
  const [mapView, setMapView] = useState<NigeriaMapView>(mapViewProp);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [zoom, setZoom] = useState(1);

  const activeState = selectedStateProp ?? selectedState;
  const visibleProjects = useMemo(() => compact ? projects : projects.filter((project) => !activeState || normalizeState(project.state) === normalizeState(activeState)), [activeState, compact, projects]);
  const hoveredMetric = hoveredState ? metricFor(hoveredState, projects, stateMetrics) : null;

  const selectState = (state: string) => {
    setSelectedState(state);
    setSelectedProject(null);
    onStateSelect?.(state);
  };

  const stateFill = (state: string) => {
    const metrics = metricFor(state, projects, stateMetrics);
    if (mapView === "coverage") {
      const percentage = metrics.total ? metrics.verified / metrics.total : 0;
      return percentage >= .8 ? "#16753A" : percentage >= .6 ? "#42A765" : percentage >= .4 ? "#D6A029" : "#D97706";
    }
    if (mapView === "risk") return metrics.atRisk >= 5 ? "#C74343" : metrics.atRisk >= 3 ? "#D97706" : metrics.atRisk ? "#D6A029" : "#E7F4EA";
    return state === activeState ? "#16753A" : "#E7F4EA";
  };

  return <div className={`nigeria-project-map ${compact ? "compact" : ""}`}>
    {!compact && <div className="nigeria-map-toolbar">
      <div className="nigeria-map-views" role="tablist" aria-label="Map view"><button className={mapView === "status" ? "active" : ""} onClick={() => setMapView("status")}>Project Status</button><button className={mapView === "coverage" ? "active" : ""} onClick={() => setMapView("coverage")}>Verification Coverage</button><button className={mapView === "risk" ? "active" : ""} onClick={() => setMapView("risk")}>Risk</button></div>
      <div className="nigeria-map-zoom"><button aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(2.4, value + .2))}><Plus size={15} /></button><button aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, value - .2))}><Minus size={15} /></button><button aria-label="Reset map" onClick={() => setZoom(1)}><RotateCcw size={14} /></button><button aria-label="Center map" onClick={() => selectState("Kano")}><LocateFixed size={14} /></button></div>
    </div>}
    <div className="nigeria-map-body">
      <div className="nigeria-map-stage" onClick={() => setSelectedProject(null)}>
        <svg className="nigeria-map-svg" viewBox={mapData.viewBox} role="img" aria-label="Map of Nigeria with state boundaries" style={{ transform: `scale(${zoom})` }}>
          <g className="nigeria-map-locations">{mapLocations.map((location) => { const state = stateName(location.name); return <path key={location.id} d={location.path} fill={stateFill(state)} className={`nigeria-state ${normalizeState(state) === normalizeState(activeState) ? "selected" : ""} ${normalizeState(state) === normalizeState(hoveredState ?? "") ? "hovered" : ""}`} onMouseEnter={() => setHoveredState(state)} onMouseLeave={() => setHoveredState(null)} onClick={(event) => { event.stopPropagation(); selectState(state); }}><title>{state} · {metricFor(state, projects, stateMetrics).total} projects</title></path>; })}</g>
          {showLabels && Object.entries(labelCoordinates).map(([state, [latitude, longitude]]) => { const point = projectPoint(latitude, longitude); return <text key={state} x={point.x} y={point.y} className="nigeria-state-label" onClick={() => selectState(state)}>{state === "FCT" ? "FCT Abuja" : state}</text>; })}
          {mapView === "status" && visibleProjects.map((project) => { const point = projectPoint(project.latitude, project.longitude); return <g key={project.id} className="nigeria-project-marker" transform={`translate(${point.x} ${point.y})`} onClick={(event) => { event.stopPropagation(); setSelectedProject(project); onProjectSelect?.(project); }}><circle r="7" fill={statusColors[project.status]} /><circle r="3" fill="#fff" /><title>{project.name}</title></g>; })}
        </svg>
        {hoveredState && hoveredMetric && <div className="nigeria-state-tooltip"><b>{hoveredState} State</b><span><strong>{hoveredMetric.total}</strong> Total projects</span><span><strong>{hoveredMetric.active}</strong> Active</span><span><strong>{hoveredMetric.verified}</strong> Verified</span><span><strong>{hoveredMetric.atRisk}</strong> At risk</span></div>}
        {selectedProject && <div className="nigeria-project-popup" onClick={(event) => event.stopPropagation()}><button className="nigeria-popup-close" onClick={() => setSelectedProject(null)} aria-label="Close project details"><X size={14} /></button><small>{selectedProject.id} · {selectedProject.state}</small><b>{selectedProject.name}</b><span>{selectedProject.lga} · {selectedProject.contractor}</span><div><i style={{ background: statusColors[selectedProject.status] }} /> {selectedProject.status} · {selectedProject.risk} risk</div><button className="nigeria-view-project" onClick={() => onProjectSelect?.(selectedProject)}>View Project</button></div>}
      </div>
      {!compact && <aside className="nigeria-map-side-panel"><div className="nigeria-side-heading"><div><small>SELECTED STATE</small><h3>{activeState} State</h3></div><span>{metricFor(activeState, projects, stateMetrics).total} projects</span></div><div className="nigeria-side-metrics"><div><b>{metricFor(activeState, projects, stateMetrics).active}</b><small>Active</small></div><div><b>{metricFor(activeState, projects, stateMetrics).verified}</b><small>Verified</small></div><div><b>{metricFor(activeState, projects, stateMetrics).atRisk}</b><small>At Risk</small></div></div><div className="nigeria-side-projects"><b>Projects in {activeState}</b>{visibleProjects.slice(0, 4).map((project) => <button key={project.id} onClick={() => { setSelectedProject(project); onProjectSelect?.(project); }}><span><i style={{ background: statusColors[project.status] }} />{project.name}</span><small>{project.lga}</small></button>)}</div></aside>}
    </div>
    {showLegend && <div className="nigeria-map-legend"><b>{mapView === "status" ? "Project status" : mapView === "coverage" ? "Verification coverage" : "Risk level"}</b>{mapView === "status" ? Object.entries(statusColors).map(([label, color]) => <span key={label}><i style={{ background: color }} />{label}</span>) : mapView === "coverage" ? <><span><i style={{ background: "#16753A" }} />80%+ verified</span><span><i style={{ background: "#42A765" }} />60–79%</span><span><i style={{ background: "#D6A029" }} />40–59%</span><span><i style={{ background: "#D97706" }} />Below 40%</span></> : <><span><i style={{ background: "#E7F4EA" }} />Normal</span><span><i style={{ background: "#D6A029" }} />Medium</span><span><i style={{ background: "#D97706" }} />High</span><span><i style={{ background: "#C74343" }} />Critical</span></>}</div>}
  </div>;
}

Builder.registerComponent(NigeriaProjectMap, {
  name: "NigeriaProjectMap",
  inputs: [
    { name: "selectedState", type: "string", defaultValue: "Kano" },
    { name: "mapView", type: "string", enum: ["status", "coverage", "risk"], defaultValue: "status" },
    { name: "projects", type: "list", subFields: [{ name: "name", type: "string" }, { name: "id", type: "string" }, { name: "state", type: "string" }, { name: "lga", type: "string" }, { name: "contractor", type: "string" }, { name: "type", type: "string" }, { name: "status", type: "string" }, { name: "risk", type: "string" }, { name: "inspectionDate", type: "string" }, { name: "latitude", type: "number" }, { name: "longitude", type: "number" }] },
    { name: "stateMetrics", type: "object" },
    { name: "showLabels", type: "boolean", defaultValue: true },
    { name: "showLegend", type: "boolean", defaultValue: true },
    { name: "compact", type: "boolean", defaultValue: false },
  ],
});
