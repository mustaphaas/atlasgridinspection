import { Link } from "react-router-dom";
import { useState } from "react";
import ReaOverview from "./ReaOverview";
import VerifiedReports from "./VerifiedReports";
import ProjectMap from "./ProjectMap";
import Claims from "./Claims";
import Contractors from "./Contractors";
import Analytics from "./Analytics";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  Layers3,
  LogOut,
  Map,
  Menu,
  Search,
  Users,
  Zap,
} from "lucide-react";

const nav = [
  { label: "Overview", icon: BarChart3 },
  { label: "Claims", icon: ClipboardCheck, badge: 12 },
  { label: "Verified reports", icon: FileCheck2, badge: 5 },
  { label: "Project map", icon: Map },
  { label: "Contractors", icon: Users },
  { label: "Analytics", icon: BarChart3 },
] as const;

type PortalTab = (typeof nav)[number]["label"];

export default function Index() {
  const [active, setActive] = useState<PortalTab>("Overview");

  const renderWorkspace = () => {
    switch (active) {
      case "Claims":
        return <Claims />;
      case "Verified reports":
        return <VerifiedReports />;
      case "Project map":
        return <ProjectMap />;
      case "Contractors":
        return <Contractors />;
      case "Analytics":
        return <Analytics onNavigate={(page) => setActive(page)} />;
      default:
        return <ReaOverview onNavigate={(page) => setActive(page)} />;
    }
  };

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <span><Zap size={17} fill="currentColor" /></span>
          <div><b>Atlas Grid Inspection</b><small>REA VERIFICATION PORTAL</small></div>
        </div>

        <div className="portal-account">
          <span>REA</span>
          <div><b>Renewable Energy Agency</b><small>National verification workspace</small></div>
        </div>

        <div className="portal-nav-label">PORTAL</div>
        <nav>
          {nav.map(({ label, icon: Icon, ...item }) => (
            <button
              key={label}
              className={`portal-nav-item ${active === label ? "active" : ""}`}
              onClick={() => setActive(label)}
            >
              <Icon size={17} />
              <span>{label}</span>
              {"badge" in item && item.badge > 0 && <em>{item.badge}</em>}
            </button>
          ))}
        </nav>

        <div className="portal-sidebar-bottom">
          <Link to="/consultant-admin" className="portal-assign-link">
            <Layers3 size={16} />
            <span>Consultant management</span>
            <ArrowUpRight size={14} />
          </Link>
          <div className="portal-user">
            <span>FS</span>
            <div><b>Engr. Fatima Sani</b><small>REA programme lead</small></div>
            <ChevronDown size={14} />
          </div>
          <Link to="/login" className="portal-signout"><LogOut size={14} /> Sign out</Link>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <div className="portal-mobile-brand"><Menu size={18} /><b>Atlas Grid Inspection</b></div>
          <div className="portal-top-context"><span>REA oversight</span><span>/</span><b>{active}</b></div>
          <div className="portal-top-actions">
            <div className="portal-search"><Search size={15} /><input placeholder="Search claims, projects or contractors" /></div>
            <button className="portal-icon" aria-label="Notifications"><Bell size={17} /><i /></button>
            <div className="portal-avatar">FS</div>
            <Link to="/login" className="portal-top-logout"><LogOut size={14} /> <span>Logout</span></Link>
          </div>
        </header>

        <div className="portal-content portal-workspace-clean">
          {renderWorkspace()}
          <footer className="portal-footer portal-footer-clean">
            <span>Atlas Grid Inspection · Independent project verification platform</span>
            <span>REA Nigeria · 2026</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
