import { useEffect, useMemo, useState } from "react";
import { Builder } from "@builder.io/react";
import nigeriaMapModule from "@svg-maps/nigeria";
import {
  ArrowUpRight,
  LocateFixed,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";

export type NigeriaMapView = "status" | "coverage" | "risk";
export type ProjectStatus =
  | "Verified"
  | "Active"
  | "Pending verification"
  | "At Risk"
  | "Critical"
  | "Inactive";

export type NigeriaProject = {
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
  capacityKw?: number;
  beneficiaries?: number;
};

export type NigeriaStateMetric = {
  total: number;
  active: number;
  verified: number;
  atRisk: number;
};

type NigeriaProjectMapProps = {
  selectedState?: string;
  mapView?: NigeriaMapView;
  projects?: NigeriaProject[];
  stateMetrics?: Record<string, NigeriaStateMetric>;
  showLabels?: boolean;
  showLegend?: boolean;
  showSidePanel?: boolean;
  onStateSelect?: (state: string) => void;
  onProjectSelect?: (project: NigeriaProject) => void;
  compact?: boolean;
  className?: string;
};

type MapLocation = { id: string; name: string; path: string };
type SvgMapData = { viewBox: string; locations: MapLocation[] };
type SvgMapInterop = SvgMapData & { default?: SvgMapData };

const importedMap = nigeriaMapModule as unknown as SvgMapInterop;
const mapData: SvgMapData = importedMap.default ?? importedMap;
const mapViewBox =
  typeof mapData?.viewBox === "string" && mapData.viewBox.trim()
    ? mapData.viewBox
    : "0 0 744 600";
const mapLocations = Array.isArray(mapData?.locations) ? mapData.locations : [];
const parsedViewBox = mapViewBox.split(/\s+/).map(Number);
const [viewMinX, viewMinY, viewWidth, viewHeight] =
  parsedViewBox.length === 4 && parsedViewBox.every(Number.isFinite)
    ? parsedViewBox
    : [0, 0, 744, 600];

export const nigeriaProjects: NigeriaProject[] = [
  {
    id: "REA-KN-2026-014",
    name: "Rimin Gado Solar Mini-Grid",
    state: "Kano",
    lga: "Rimin Gado",
    contractor: "Arewa Solar Concepts",
    type: "Solar mini-grid",
    status: "Verified",
    risk: "Normal",
    inspectionDate: "06 Aug 2026",
    latitude: 11.62,
    longitude: 8.58,
    capacityKw: 96,
    beneficiaries: 124,
  },
  {
    id: "REA-KN-2026-021",
    name: "Tarauni Community Power",
    state: "Kano",
    lga: "Tarauni",
    contractor: "GreenVolt Nigeria Ltd",
    type: "Solar mini-grid",
    status: "Active",
    risk: "Medium",
    inspectionDate: "05 Aug 2026",
    latitude: 12.02,
    longitude: 8.54,
    capacityKw: 80,
    beneficiaries: 98,
  },
  {
    id: "REA-KD-2026-009",
    name: "Kachia Rural Electrification",
    state: "Kaduna",
    lga: "Kachia",
    contractor: "Sahel Power Systems Ltd",
    type: "Distribution extension",
    status: "Pending verification",
    risk: "High",
    inspectionDate: "27 Jul 2026",
    latitude: 9.87,
    longitude: 7.95,
    capacityKw: 75,
    beneficiaries: 86,
  },
  {
    id: "REA-KT-2026-006",
    name: "Katsina North Solar Hub",
    state: "Katsina",
    lga: "Katsina",
    contractor: "GreenVolt Nigeria Ltd",
    type: "Solar mini-grid",
    status: "Active",
    risk: "Normal",
    inspectionDate: "02 Aug 2026",
    latitude: 12.99,
    longitude: 7.6,
    capacityKw: 68,
    beneficiaries: 71,
  },
  {
    id: "REA-SO-2026-003",
    name: "Sokoto Irrigation Cluster",
    state: "Sokoto",
    lga: "Sokoto North",
    contractor: "Arewa Solar Concepts",
    type: "Productive-use energy",
    status: "Verified",
    risk: "Normal",
    inspectionDate: "31 Jul 2026",
    latitude: 13.06,
    longitude: 5.24,
    capacityKw: 62,
    beneficiaries: 64,
  },
  {
    id: "REA-BA-2026-011",
    name: "Bauchi Community Energy",
    state: "Bauchi",
    lga: "Bauchi",
    contractor: "Sahel Power Systems Ltd",
    type: "Solar mini-grid",
    status: "At Risk",
    risk: "High",
    inspectionDate: "29 Jul 2026",
    latitude: 10.31,
    longitude: 9.84,
    capacityKw: 58,
    beneficiaries: 79,
  },
  {
    id: "REA-GO-2026-004",
    name: "Gombe Health Facility Power",
    state: "Gombe",
    lga: "Gombe",
    contractor: "GreenVolt Nigeria Ltd",
    type: "Institutional solar",
    status: "Active",
    risk: "Medium",
    inspectionDate: "01 Aug 2026",
    latitude: 10.29,
    longitude: 11.17,
    capacityKw: 45,
    beneficiaries: 51,
  },
  {
    id: "REA-NI-2026-008",
    name: "Minna Rural Power Link",
    state: "Niger",
    lga: "Chanchaga",
    contractor: "Arewa Solar Concepts",
    type: "Distribution extension",
    status: "Verified",
    risk: "Normal",
    inspectionDate: "25 Jul 2026",
    latitude: 9.61,
    longitude: 6.56,
    capacityKw: 72,
    beneficiaries: 93,
  },
  {
    id: "REA-FC-2026-002",
    name: "Abuja Satellite Community Grid",
    state: "FCT",
    lga: "Abuja Municipal",
    contractor: "GreenVolt Nigeria Ltd",
    type: "Solar mini-grid",
    status: "Verified",
    risk: "Normal",
    inspectionDate: "04 Aug 2026",
    latitude: 9.08,
    longitude: 7.4,
    capacityKw: 110,
    beneficiaries: 132,
  },
  {
    id: "REA-LA-2026-018",
    name: "Lagos Coastal Energy Point",
    state: "Lagos",
    lga: "Epe",
    contractor: "SolarTech Nigeria",
    type: "Institutional solar",
    status: "Critical",
    risk: "Critical",
    inspectionDate: "18 Jul 2026",
    latitude: 6.58,
    longitude: 3.75,
    capacityKw: 52,
    beneficiaries: 67,
  },
  {
    id: "REA-EN-2026-005",
    name: "Enugu Rural Solar Cluster",
    state: "Enugu",
    lga: "Nsukka",
    contractor: "Sahel Power Systems Ltd",
    type: "Solar mini-grid",
    status: "Pending verification",
    risk: "Medium",
    inspectionDate: "30 Jul 2026",
    latitude: 6.86,
    longitude: 7.4,
    capacityKw: 54,
    beneficiaries: 59,
  },
  {
    id: "REA-PL-2026-012",
    name: "Plateau Highland Mini-Grid",
    state: "Plateau",
    lga: "Jos South",
    contractor: "Arewa Solar Concepts",
    type: "Solar mini-grid",
    status: "Active",
    risk: "Normal",
    inspectionDate: "03 Aug 2026",
    latitude: 9.22,
    longitude: 9.52,
    capacityKw: 49,
    beneficiaries: 61,
  },
  {
    id: "REA-NA-2026-007",
    name: "Nasarawa Agri-Power Site",
    state: "Nasarawa",
    lga: "Lafia",
    contractor: "GreenVolt Nigeria Ltd",
    type: "Productive-use energy",
    status: "Active",
    risk: "Medium",
    inspectionDate: "26 Jul 2026",
    latitude: 8.49,
    longitude: 8.52,
    capacityKw: 50,
    beneficiaries: 55,
  },
  {
    id: "REA-BO-2026-010",
    name: "Borno Resilience Power Hub",
    state: "Borno",
    lga: "Maiduguri",
    contractor: "Sahel Power Systems Ltd",
    type: "Solar mini-grid",
    status: "At Risk",
    risk: "High",
    inspectionDate: "21 Jul 2026",
    latitude: 11.83,
    longitude: 13.15,
    capacityKw: 88,
    beneficiaries: 106,
  },
  {
    id: "REA-YO-2026-003",
    name: "Yobe Community Grid",
    state: "Yobe",
    lga: "Damaturu",
    contractor: "Arewa Solar Concepts",
    type: "Solar mini-grid",
    status: "Verified",
    risk: "Normal",
    inspectionDate: "28 Jul 2026",
    latitude: 11.75,
    longitude: 11.96,
    capacityKw: 46,
    beneficiaries: 48,
  },
  {
    id: "REA-BE-2026-004",
    name: "Benue Riverbank Power Site",
    state: "Benue",
    lga: "Makurdi",
    contractor: "SolarTech Nigeria",
    type: "Productive-use energy",
    status: "Active",
    risk: "Medium",
    inspectionDate: "24 Jul 2026",
    latitude: 7.73,
    longitude: 8.54,
    capacityKw: 40,
    beneficiaries: 47,
  },
];

export const nigeriaStateMetrics: Record<string, NigeriaStateMetric> = {
  Kano: { total: 48, active: 40, verified: 32, atRisk: 8 },
  Kaduna: { total: 42, active: 34, verified: 38, atRisk: 4 },
  Katsina: { total: 36, active: 29, verified: 31, atRisk: 3 },
  Sokoto: { total: 35, active: 28, verified: 30, atRisk: 2 },
  Bauchi: { total: 39, active: 30, verified: 31, atRisk: 5 },
  Gombe: { total: 27, active: 23, verified: 22, atRisk: 2 },
  Niger: { total: 28, active: 22, verified: 24, atRisk: 4 },
  FCT: { total: 31, active: 27, verified: 29, atRisk: 2 },
  Lagos: { total: 16, active: 12, verified: 13, atRisk: 1 },
  Enugu: { total: 19, active: 15, verified: 16, atRisk: 2 },
  Plateau: { total: 24, active: 19, verified: 21, atRisk: 2 },
  Nasarawa: { total: 22, active: 17, verified: 18, atRisk: 3 },
  Borno: { total: 37, active: 27, verified: 30, atRisk: 3 },
  Yobe: { total: 25, active: 19, verified: 21, atRisk: 3 },
  Benue: { total: 21, active: 16, verified: 17, atRisk: 3 },
};

const labelCoordinates: Record<string, [number, number]> = {
  Kano: [12.0, 8.5],
  Kaduna: [10.5, 7.4],
  Katsina: [12.7, 7.6],
  Sokoto: [13.0, 5.3],
  Bauchi: [10.3, 9.8],
  Gombe: [10.2, 11.1],
  Niger: [9.6, 6.5],
  FCT: [9.1, 7.4],
  Lagos: [6.5, 3.4],
  Enugu: [6.5, 7.5],
  Plateau: [9.3, 9.5],
  Nasarawa: [8.5, 8.4],
  Borno: [11.8, 13.1],
  Yobe: [12.0, 11.7],
  Benue: [7.7, 8.6],
};

const statusColors: Record<ProjectStatus, string> = {
  Verified: "#16753A",
  Active: "#49A972",
  "Pending verification": "#D6A029",
  "At Risk": "#D97706",
  Critical: "#C74343",
  Inactive: "#A9B4AD",
};

const stateAliases: Record<string, string> = {
  "federal capital territory": "FCT",
  plataeu: "Plateau",
  "cross-river": "Cross River",
  nassarawa: "Nasarawa",
};

function stateName(name: string) {
  const normalized = name.trim().toLowerCase();
  return stateAliases[normalized] ?? name;
}

function normalizeState(name: string) {
  return stateName(name).toLowerCase().replace(/[^a-z]/g, "");
}

function projectPoint(latitude: number, longitude: number) {
  const longitudeMin = 2.6;
  const longitudeMax = 14.7;
  const latitudeMin = 4.2;
  const latitudeMax = 13.9;
  const x =
    viewMinX +
    ((longitude - longitudeMin) / (longitudeMax - longitudeMin)) * viewWidth;
  const y =
    viewMinY +
    ((latitudeMax - latitude) / (latitudeMax - latitudeMin)) * viewHeight;
  return { x, y };
}

function metricFor(
  state: string,
  projects: NigeriaProject[],
  metrics: Record<string, NigeriaStateMetric>,
) {
  const supplied = metrics[state];
  if (supplied) return supplied;
  const stateProjects = projects.filter(
    (project) => normalizeState(project.state) === normalizeState(state),
  );
  return {
    total: stateProjects.length,
    active: stateProjects.filter((project) => project.status === "Active").length,
    verified: stateProjects.filter((project) => project.status === "Verified")
      .length,
    atRisk: stateProjects.filter(
      (project) =>
        project.risk === "High" ||
        project.risk === "Critical" ||
        project.status === "At Risk",
    ).length,
  };
}

function fallbackNigeriaPath() {
  const x = viewMinX;
  const y = viewMinY;
  const w = viewWidth;
  const h = viewHeight;
  return `M ${x + w * 0.11} ${y + h * 0.33}
    L ${x + w * 0.18} ${y + h * 0.13}
    L ${x + w * 0.36} ${y + h * 0.07}
    L ${x + w * 0.54} ${y + h * 0.14}
    L ${x + w * 0.67} ${y + h * 0.09}
    L ${x + w * 0.86} ${y + h * 0.23}
    L ${x + w * 0.91} ${y + h * 0.43}
    L ${x + w * 0.83} ${y + h * 0.56}
    L ${x + w * 0.76} ${y + h * 0.58}
    L ${x + w * 0.72} ${y + h * 0.78}
    L ${x + w * 0.59} ${y + h * 0.9}
    L ${x + w * 0.49} ${y + h * 0.82}
    L ${x + w * 0.4} ${y + h * 0.94}
    L ${x + w * 0.27} ${y + h * 0.85}
    L ${x + w * 0.18} ${y + h * 0.87}
    L ${x + w * 0.12} ${y + h * 0.67}
    L ${x + w * 0.05} ${y + h * 0.52} Z`;
}

export default function NigeriaProjectMap({
  selectedState: selectedStateProp,
  mapView: mapViewProp = "status",
  projects = nigeriaProjects,
  stateMetrics = nigeriaStateMetrics,
  showLabels = true,
  showLegend = true,
  showSidePanel,
  onStateSelect,
  onProjectSelect,
  compact = false,
  className = "",
}: NigeriaProjectMapProps) {
  const [selectedState, setSelectedState] = useState(
    selectedStateProp && selectedStateProp !== "All states"
      ? selectedStateProp
      : "Kano",
  );
  const [mapView, setMapView] = useState<NigeriaMapView>(mapViewProp);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] =
    useState<NigeriaProject | null>(null);
  const [zoom, setZoom] = useState(1);
  const [focusPoint, setFocusPoint] = useState({ x: viewMinX + viewWidth / 2, y: viewMinY + viewHeight / 2 });
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (selectedStateProp && selectedStateProp !== "All states") {
      setSelectedState(selectedStateProp);
      const coordinates = labelCoordinates[selectedStateProp];
      const stateProjects = projects.filter(
        (project) => normalizeState(project.state) === normalizeState(selectedStateProp),
      );
      const point = coordinates
        ? projectPoint(coordinates[0], coordinates[1])
        : stateProjects.length
          ? {
              x: stateProjects.reduce((sum, project) => sum + projectPoint(project.latitude, project.longitude).x, 0) / stateProjects.length,
              y: stateProjects.reduce((sum, project) => sum + projectPoint(project.latitude, project.longitude).y, 0) / stateProjects.length,
            }
          : { x: viewMinX + viewWidth / 2, y: viewMinY + viewHeight / 2 };
      setFocusPoint(point);
      setZoom(compact ? 1.55 : 2.35);
      setFocused(true);
    }
  }, [compact, projects, selectedStateProp]);

  useEffect(() => setMapView(mapViewProp), [mapViewProp]);

  const activeState = selectedState;
  const sidePanelVisible = showSidePanel ?? !compact;
  const hoveredMetric = hoveredState
    ? metricFor(hoveredState, projects, stateMetrics)
    : null;
  const sideProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          normalizeState(project.state) === normalizeState(activeState),
      ),
    [activeState, projects],
  );
  const activeMetric = metricFor(activeState, projects, stateMetrics);
  const centerX = viewMinX + viewWidth / 2;
  const centerY = viewMinY + viewHeight / 2;

  const selectState = (state: string, shouldFocus = true) => {
    setSelectedState(state);
    setSelectedProject(null);
    if (shouldFocus) {
      const coordinates = labelCoordinates[state];
      const stateProjects = projects.filter(
        (project) => normalizeState(project.state) === normalizeState(state),
      );
      const point = coordinates
        ? projectPoint(coordinates[0], coordinates[1])
        : stateProjects.length
          ? {
              x: stateProjects.reduce((sum, project) => sum + projectPoint(project.latitude, project.longitude).x, 0) / stateProjects.length,
              y: stateProjects.reduce((sum, project) => sum + projectPoint(project.latitude, project.longitude).y, 0) / stateProjects.length,
            }
          : { x: centerX, y: centerY };
      setFocusPoint(point);
      setZoom(compact ? 1.55 : 2.35);
      setFocused(true);
    }
    onStateSelect?.(state);
  };

  const resetMap = () => {
    setZoom(1);
    setFocusPoint({ x: centerX, y: centerY });
    setFocused(false);
    setSelectedProject(null);
  };

  const stateFill = (state: string) => {
    const metrics = metricFor(state, projects, stateMetrics);
    const verificationRate = metrics.total ? metrics.verified / metrics.total : 0;
    if (normalizeState(state) === normalizeState(activeState)) return "#14703A";
    if (mapView === "coverage") {
      if (verificationRate >= 0.8) return "#2E8B57";
      if (verificationRate >= 0.6) return "#71B88D";
      if (verificationRate >= 0.4) return "#D6C16A";
      return "#E8B676";
    }
    if (mapView === "risk") {
      if (metrics.atRisk >= 5) return "#D8655C";
      if (metrics.atRisk >= 3) return "#E6A15F";
      if (metrics.atRisk > 0) return "#F0D69A";
      return "#EAF5ED";
    }
    if (metrics.atRisk >= 5) return "#F4D7D2";
    if (verificationRate >= 0.75) return "#BFE2CA";
    if (metrics.active > 0) return "#DDF0E3";
    return "#EEF6F0";
  };

  return (
    <div className={`ng-project-map ${compact ? "is-compact" : ""} ${className}`}>
      {!compact && (
        <div className="ng-map-toolbar">
          <div className="ng-map-view-switch" role="tablist" aria-label="Map view">
            {([
              ["status", "Project status"],
              ["coverage", "Verification coverage"],
              ["risk", "Risk exposure"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={mapView === value ? "active" : ""}
                onClick={() => setMapView(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ng-map-tools" aria-label="Map controls">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => setZoom((value) => Math.min(3, value + 0.25))}
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => setZoom((value) => Math.max(1, value - 0.2))}
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              aria-label="Reset zoom"
              onClick={resetMap}
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              aria-label="Focus Kano"
              onClick={() => selectState("Kano")}
            >
              <LocateFixed size={15} />
            </button>
          </div>
        </div>
      )}

      <div className={`ng-map-layout ${sidePanelVisible ? "with-panel" : ""}`}>
        <div className="ng-map-stage" onClick={() => setSelectedProject(null)}>
          <div className="ng-map-grid" aria-hidden="true" />
          <svg
            className="ng-map-svg"
            viewBox={mapViewBox}
            role="img"
            aria-label="Interactive map of Nigeria showing project and verification data"
            preserveAspectRatio="xMidYMid meet"
          >
            <g
              transform={`translate(${centerX} ${centerY}) scale(${zoom}) translate(${-focusPoint.x} ${-focusPoint.y})`}
              className="ng-map-zoom-layer"
            >
              {mapLocations.length > 0 ? (
                <g className="ng-map-states">
                  {mapLocations.map((location) => {
                    const state = stateName(location.name);
                    const selected =
                      normalizeState(state) === normalizeState(activeState);
                    const hovered =
                      normalizeState(state) === normalizeState(hoveredState ?? "");
                    const metrics = metricFor(state, projects, stateMetrics);
                    return (
                      <path
                        key={location.id}
                        d={location.path}
                        fill={stateFill(state)}
                        className={`ng-map-state ${selected ? "selected" : ""} ${hovered ? "hovered" : ""} ${focused && !selected ? "dimmed" : ""}`}
                        onMouseEnter={() => setHoveredState(state)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={(event) => {
                          event.stopPropagation();
                          selectState(state);
                        }}
                      >
                        <title>{`${state}: ${metrics.total} projects, ${metrics.verified} verified, ${metrics.atRisk} at risk`}</title>
                      </path>
                    );
                  })}
                </g>
              ) : (
                <g className="ng-map-fallback">
                  <path d={fallbackNigeriaPath()} />
                  <text x={centerX} y={centerY}>Nigeria boundary data</text>
                </g>
              )}

              {showLabels &&
                Object.entries(labelCoordinates).map(
                  ([state, [latitude, longitude]]) => {
                    const point = projectPoint(latitude, longitude);
                    return (
                      <text
                        key={state}
                        x={point.x}
                        y={point.y}
                        className="ng-map-state-label"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectState(state);
                        }}
                      >
                        {state === "FCT" ? "Abuja" : state}
                      </text>
                    );
                  },
                )}

              {mapView === "status" &&
                projects.map((project) => {
                  const point = projectPoint(project.latitude, project.longitude);
                  const pulse =
                    project.status === "Critical" || project.status === "At Risk";
                  return (
                    <g
                      key={project.id}
                      className={`ng-project-marker ${pulse ? "pulse" : ""} ${focused && normalizeState(project.state) !== normalizeState(activeState) ? "dimmed" : ""} ${focused && normalizeState(project.state) === normalizeState(activeState) ? "focused" : ""}`}
                      transform={`translate(${point.x} ${point.y})`}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectState(project.state);
                        setSelectedProject(project);
                        onProjectSelect?.(project);
                      }}
                    >
                      {pulse && (
                        <circle
                          className="ng-project-marker-ring"
                          r="12"
                          fill={statusColors[project.status]}
                        />
                      )}
                      <circle
                        className="ng-project-marker-dot"
                        r="7.5"
                        fill={statusColors[project.status]}
                      />
                      <circle r="2.4" fill="#ffffff" />
                      {focused && normalizeState(project.state) === normalizeState(activeState) && (
                        <text className="ng-project-marker-label" x="12" y="-9">
                          {project.name.length > 24 ? `${project.name.slice(0, 24)}…` : project.name}
                        </text>
                      )}
                      <title>{`${project.name} - ${project.status}`}</title>
                    </g>
                  );
                })}
            </g>
          </svg>

          {!compact && (
            <div className="ng-map-national-label">
              <small>NATIONAL PROJECT COVERAGE</small>
              <strong>Nigeria</strong>
              <span>36 states + FCT</span>
            </div>
          )}

          {hoveredState && hoveredMetric && (
            <div className="ng-map-tooltip" role="status">
              <div>
                <small>STATE SUMMARY</small>
                <b>{hoveredState}</b>
              </div>
              <span><strong>{hoveredMetric.total}</strong> projects</span>
              <span><strong>{hoveredMetric.verified}</strong> verified</span>
              <span><strong>{hoveredMetric.active}</strong> active</span>
              <span><strong>{hoveredMetric.atRisk}</strong> at risk</span>
            </div>
          )}

          {selectedProject && (
            <div className="ng-project-popover" onClick={(event) => event.stopPropagation()}>
              <button
                className="ng-project-popover-close"
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
              >
                <X size={15} />
              </button>
              <small>{selectedProject.id}</small>
              <h4>{selectedProject.name}</h4>
              <p>{selectedProject.lga}, {selectedProject.state}</p>
              <dl>
                <div><dt>Contractor</dt><dd>{selectedProject.contractor}</dd></div>
                <div><dt>Status</dt><dd><i style={{ background: statusColors[selectedProject.status] }} />{selectedProject.status}</dd></div>
                <div><dt>Last inspection</dt><dd>{selectedProject.inspectionDate}</dd></div>
              </dl>
              <button
                type="button"
                className="ng-project-open"
                onClick={() => onProjectSelect?.(selectedProject)}
              >
                View project <ArrowUpRight size={14} />
              </button>
            </div>
          )}
        </div>

        {sidePanelVisible && (
          <aside className="ng-map-side-panel">
            <header>
              <div>
                <small>SELECTED STATE</small>
                <h3>{activeState}</h3>
              </div>
              <span>{activeMetric.total} projects</span>
            </header>

            <div className="ng-map-side-kpis">
              <div><b>{activeMetric.active}</b><small>Active</small></div>
              <div><b>{activeMetric.verified}</b><small>Verified</small></div>
              <div className={activeMetric.atRisk > 4 ? "warning" : ""}><b>{activeMetric.atRisk}</b><small>At risk</small></div>
            </div>

            <div className="ng-state-coverage">
              <div>
                <span>Verification coverage</span>
                <b>{activeMetric.total ? Math.round((activeMetric.verified / activeMetric.total) * 100) : 0}%</b>
              </div>
              <i><em style={{ width: `${activeMetric.total ? (activeMetric.verified / activeMetric.total) * 100 : 0}%` }} /></i>
            </div>

            <div className="ng-state-projects">
              <div className="ng-state-projects-heading">
                <b>Projects in {activeState}</b>
                <small>{sideProjects.length} shown</small>
              </div>
              {sideProjects.length ? (
                sideProjects.slice(0, 5).map((project) => (
                  <button
                    type="button"
                    key={project.id}
                    onClick={() => {
                      selectState(project.state);
                      setSelectedProject(project);
                      onProjectSelect?.(project);
                    }}
                  >
                    <i style={{ background: statusColors[project.status] }} />
                    <span><b>{project.name}</b><small>{project.lga} · {project.status}</small></span>
                    <ArrowUpRight size={14} />
                  </button>
                ))
              ) : (
                <div className="ng-state-projects-empty">No sample projects in this state.</div>
              )}
            </div>
          </aside>
        )}
      </div>

      {showLegend && (
        <div className="ng-map-legend">
          <b>{mapView === "status" ? "Project status" : mapView === "coverage" ? "Verification coverage" : "Risk exposure"}</b>
          {mapView === "status" ? (
            Object.entries(statusColors).map(([label, color]) => (
              <span key={label}><i style={{ background: color }} />{label}</span>
            ))
          ) : mapView === "coverage" ? (
            <>
              <span><i style={{ background: "#2E8B57" }} />80%+ verified</span>
              <span><i style={{ background: "#71B88D" }} />60-79%</span>
              <span><i style={{ background: "#D6C16A" }} />40-59%</span>
              <span><i style={{ background: "#E8B676" }} />Below 40%</span>
            </>
          ) : (
            <>
              <span><i style={{ background: "#EAF5ED" }} />Normal</span>
              <span><i style={{ background: "#F0D69A" }} />Medium</span>
              <span><i style={{ background: "#E6A15F" }} />High</span>
              <span><i style={{ background: "#D8655C" }} />Critical</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

Builder.registerComponent(NigeriaProjectMap, {
  name: "NigeriaProjectMap",
  inputs: [
    { name: "selectedState", type: "string", defaultValue: "Kano" },
    {
      name: "mapView",
      type: "string",
      enum: ["status", "coverage", "risk"],
      defaultValue: "status",
    },
    {
      name: "projects",
      type: "list",
      subFields: [
        { name: "name", type: "string" },
        { name: "id", type: "string" },
        { name: "state", type: "string" },
        { name: "lga", type: "string" },
        { name: "contractor", type: "string" },
        { name: "type", type: "string" },
        { name: "status", type: "string" },
        { name: "risk", type: "string" },
        { name: "inspectionDate", type: "string" },
        { name: "latitude", type: "number" },
        { name: "longitude", type: "number" },
        { name: "capacityKw", type: "number" },
        { name: "beneficiaries", type: "number" },
      ],
    },
    { name: "stateMetrics", type: "object" },
    { name: "showLabels", type: "boolean", defaultValue: true },
    { name: "showLegend", type: "boolean", defaultValue: true },
    { name: "showSidePanel", type: "boolean", defaultValue: true },
    { name: "compact", type: "boolean", defaultValue: false },
  ],
});
