import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, ChevronRight, Clock3, Compass, FileCheck2, LocateFixed, MapPin, Navigation, ShieldCheck, Wifi, Zap } from "lucide-react";

const assignments = [
  { id: "REA-04281", title: "Kano Solar Mini-grid", location: "Kumbotso, Kano State", date: "Today · 10:30 AM", distance: "18.4 km", status: "Ready to inspect", color: "green" },
  { id: "REA-04284", title: "Rural Electrification Phase II", location: "Bida, Niger State", date: "Tomorrow · 09:00 AM", distance: "92.1 km", status: "Upcoming", color: "blue" },
  { id: "REA-04286", title: "Community Transformer Upgrade", location: "Dutse, Jigawa State", date: "Jun 18 · 08:30 AM", distance: "214 km", status: "Upcoming", color: "blue" },
];

export default function FieldOfficer() {
  const [selected, setSelected] = useState(assignments[0]);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);

  const verifyLocation = () => {
    setChecking(true);
    window.setTimeout(() => { setChecking(false); setVerified(true); }, 1100);
  };

  return <div className="officer-app">
    <header className="officer-topbar"><div className="officer-brand"><span className="officer-brand-mark"><Zap size={17} fill="currentColor" /></span><span>Atlas Grid Inspection</span></div><div className="officer-top-center"><span className="field-live-dot" /> Field officer mode</div><div className="officer-user"><span className="officer-avatar-large">AY</span><span><b>Amina Yusuf</b><small>Field officer</small></span><Link to="/login" className="officer-logout">Log out</Link></div></header>
    <main className="officer-content">
      <div className="officer-breadcrumb"><span>Field workspace</span><span>/</span><b>My assignments</b></div>
      <section className="officer-heading"><div><div className="officer-eyebrow">FIELD OPERATIONS</div><h1>Good morning, Amina<span>.</span></h1><p>Your assigned inspections are ready for secure field verification.</p></div><div className="offline-pill"><Wifi size={14} /> Offline ready <span /></div></section>
      <section className="officer-summary"><div><span className="summary-icon green"><FileCheck2 size={17} /></span><div><small>Assigned today</small><b>01 inspection</b></div></div><div><span className="summary-icon amber"><Clock3 size={17} /></span><div><small>Next deadline</small><b>Today, 4:00 PM</b></div></div><div><span className="summary-icon blue"><ShieldCheck size={17} /></span><div><small>Device verified</small><b>Android · FG-2184</b></div></div></section>
      <div className="officer-grid"><section className="assignment-list"><div className="officer-section-title"><div><h2>My assignments</h2><p>Projects assigned by your consultant administrator</p></div><span className="assignment-count">{assignments.length} total</span></div>{assignments.map((assignment) => <button key={assignment.id} className={`assignment-card ${selected.id === assignment.id ? "selected" : ""}`} onClick={() => { setSelected(assignment); setVerified(false); }}><div className={`assignment-status ${assignment.color}`}><span />{assignment.status}</div><div className="assignment-card-main"><span className="assignment-project-icon"><Navigation size={18} /></span><div><h3>{assignment.title}</h3><span className="assignment-id">{assignment.id}</span><p><MapPin size={13} /> {assignment.location}</p></div><ChevronRight size={17} className="assignment-chevron" /></div><div className="assignment-meta"><span><CalendarDays size={13} /> {assignment.date}</span><span><Compass size={13} /> {assignment.distance}</span></div></button>)}</section>
        <section className="verification-panel"><div className="verification-head"><div><div className="officer-eyebrow">SELECTED ASSIGNMENT</div><h2>{selected.title}</h2><p>{selected.id} · {selected.location}</p></div><span className="verified-shield"><ShieldCheck size={20} /></span></div><div className="site-map"><div className="site-map-grid" /><div className="site-radius" /><div className="site-center"><MapPin size={18} /></div><div className="site-label"><b>Approved project area</b><span>250 m geofence radius</span></div><div className="site-coordinate">9°59'12.4\"N<br />8°31'44.8\"E</div></div><div className={`location-check ${verified ? "verified" : ""}`}><div className="location-check-icon">{verified ? <CheckCircle2 size={20} /> : <LocateFixed size={20} />}</div><div><b>{verified ? "Location verified" : "Verify your arrival"}</b><span>{verified ? "You are within the approved project boundary." : "Inspection can only begin at the assigned project site."}</span></div><span className="location-check-status">{verified ? "PASS" : "REQUIRED"}</span></div><div className="verification-details"><div><small>YOUR CURRENT LOCATION</small><b>{verified ? "9°59'10.9\"N, 8°31'46.2\"E" : "Location not captured"}</b></div><div><small>APPROVED RADIUS</small><b>250 metres</b></div></div><button className={`verify-button ${verified ? "complete" : ""}`} onClick={verifyLocation} disabled={checking || verified}>{checking ? <><span className="button-spinner" /> Checking GPS coordinates...</> : verified ? <><CheckCircle2 size={17} /> Ready to start inspection</> : <><LocateFixed size={17} /> Verify my location</>}</button>{!verified && <div className="location-note"><ShieldCheck size={14} /> GPS, time, device ID and arrival coordinates will be recorded automatically.</div>}</section></div>
      <section className="officer-bottom"><div><CheckCircle2 size={16} /> <b>Secure field capture enabled</b><span>Photos and signatures will be tagged with project ID, GPS and timestamp.</span></div><div><Wifi size={16} /> <b>Sync status</b><span>Records save locally and sync automatically when online.</span></div></section>
    </main>
  </div>;
}
