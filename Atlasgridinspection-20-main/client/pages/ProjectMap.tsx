import { useState } from "react";
import { CheckCircle2, MapPin, RefreshCw, Users, Zap } from "lucide-react";
import NigeriaProjectMap from "@/components/NigeriaProjectMap";

const mapSummary = [["Total Projects", "1,284", Zap], ["States + FCT", "36", MapPin], ["Beneficiaries", "941", Users], ["Capacity", "875 kW", Zap]] as const;
const filterOptions = [["status", "Project status", "All statuses", "At risk"], ["type", "Project type", "All types", "Solar mini-grid"], ["state", "State", "All states", "Kano"], ["lga", "LGA", "All LGAs", "Tarauni"], ["risk", "Risk level", "All levels", "High risk"]] as const;
type FilterKey = (typeof filterOptions)[number][0];

export default function ProjectMap() {
  const [filters, setFilters] = useState<Record<FilterKey, string>>({ status: "All statuses", type: "All types", state: "All states", lga: "All LGAs", risk: "All levels" });
  const [notice, setNotice] = useState("");
  const update = (key: FilterKey, value: string) => setFilters((current) => ({ ...current, [key]: value }));

  return <section className="project-map-reference">
    <header className="project-map-header"><div><div className="project-map-kicker">NATIONAL COVERAGE</div><h1>Project Map</h1><p>Geographic view of REA projects across Nigeria</p></div><div className="project-map-summary">{mapSummary.map(([label, value, Icon]) => <div key={label}><span className="green"><Icon size={14} /></span><small>{label}</small><b>{value}</b></div>)}</div></header>
    <div className="project-map-filters">{filterOptions.map(([key, label, defaultValue, option]) => <label key={key}><span>{label}</span><select value={filters[key]} onChange={(event) => update(key, event.target.value)}><option>{defaultValue}</option><option>{option}</option></select></label>)}<button onClick={() => { setFilters({ status: "All statuses", type: "All types", state: "All states", lga: "All LGAs", risk: "All levels" }); setNotice("Map filters reset"); }}><RefreshCw size={12} /> Reset</button><button className="map-apply" onClick={() => setNotice("Map filters applied")}>Apply Filters</button></div>
    {notice && <button className="map-notice" onClick={() => setNotice("")}><CheckCircle2 size={13} /> {notice}</button>}
    <NigeriaProjectMap />
  </section>;
}
