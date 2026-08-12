import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  History,
  LogOut,
  Map,
  Menu,
  Search,
  ShieldCheck,
  Users,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import Analytics from "./Analytics";
import AuditTrail from "./AuditTrail";
import Claims from "./Claims";
import Contractors from "./Contractors";
import ProjectMap from "./ProjectMap";
import ReaOverview from "./ReaOverview";
import UsersPage from "./Users";
import VerifiedReports from "./VerifiedReports";
import { useAtlasGrid } from "@/context/AtlasGridContext";

const nav = [
  { label: "Overview", slug: "overview", icon: BarChart3 },
  { label: "Claims", slug: "claims", icon: ClipboardCheck },
  { label: "Verified reports", slug: "verified-reports", icon: FileCheck2 },
  { label: "Project map", slug: "project-map", icon: Map },
  { label: "Contractors", slug: "contractors", icon: Users },
  { label: "Analytics", slug: "analytics", icon: BarChart3 },
  { label: "Audit trail", slug: "audit-trail", icon: History },
  { label: "Users", slug: "users", icon: UsersRound },
] as const;

type PortalTab = (typeof nav)[number]["label"];

const slugByLabel = Object.fromEntries(nav.map((item) => [item.label, item.slug])) as Record<PortalTab, string>;
const labelBySlug = Object.fromEntries(nav.map((item) => [item.slug, item.label])) as Record<string, PortalTab>;

export default function Index() {
  const { claims, auditEvents } = useAtlasGrid();
  const [params, setParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchNotice, setSearchNotice] = useState("");

  const active: PortalTab = labelBySlug[params.get("tab") ?? "overview"] ?? "Overview";

  const badgeCounts = useMemo(() => ({
    Claims: claims.filter((claim) => claim.status === "New" || claim.status === "Validated").length,
    "Verified reports": claims.filter((claim) => claim.status === "Pending REA Review").length,
  }), [claims]);

  const goTo = (page: PortalTab) => {
    setParams({ tab: slugByLabel[page] });
    setMobileOpen(false);
    setNotificationsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const renderWorkspace = () => {
    switch (active) {
      case "Claims":
        return <Claims initialSearch={params.get("q") ?? ""} onOpenMap={(state, projectId) => { setParams({ tab: slugByLabel["Project map"], state, project: projectId }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />;
      case "Verified reports":
        return <VerifiedReports />;
      case "Project map":
        return <ProjectMap initialState={params.get("state") ?? "Kano"} initialProjectId={params.get("project") ?? undefined} />;
      case "Contractors":
        return <Contractors />;
      case "Analytics":
        return <Analytics onNavigate={(page) => goTo(page)} />;
      case "Audit trail":
        return <AuditTrail />;
      case "Users":
        return <UsersPage />;
      default:
        return <ReaOverview onNavigate={(page) => goTo(page)} />;
    }
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    setParams({ tab: slugByLabel.Claims, q: query });
    setMobileOpen(false);
    setNotificationsOpen(false);
    setSearchNotice(`Showing workflow records matching “${query}”.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="ag-shell">
      {mobileOpen && <button className="ag-sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <aside className={`ag-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="ag-brand">
          <span className="ag-brand-logo"><Zap size={20} fill="currentColor" /></span>
          <div className="ag-brand-copy">
            <b>Atlas Grid Inspection</b>
            <small>REA VERIFICATION PORTAL</small>
          </div>
          <button className="ag-sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="ag-account-card">
          <span>AL</span>
          <div><b>REA Administration</b><small>National verification workspace</small></div>
          <ShieldCheck size={17} />
        </div>

        <div className="ag-nav-label">WORKSPACE</div>
        <nav className="ag-nav">
          {nav.map(({ label, icon: Icon }) => {
            const badge = badgeCounts[label as keyof typeof badgeCounts] ?? 0;
            return (
              <button key={label} className={active === label ? "active" : ""} onClick={() => goTo(label)}>
                <Icon size={18} />
                <span>{label}</span>
                {badge > 0 && <em>{badge}</em>}
              </button>
            );
          })}
        </nav>

        <div className="ag-sidebar-bottom">
          <div className="ag-system-status"><span /><div><b>Workflow synchronized</b><small>Cross-tab browser workspace active</small></div></div>
          <Link to="/consultant-admin" className="ag-role-link"><Users size={16} /><span>Consultant portal</span></Link>
          <Link to="/field-officer" className="ag-role-link"><Map size={16} /><span>Field officer portal</span></Link>
          <div className="ag-user-card"><span>FS</span><div><b>Engr. Fatima Sani</b><small>REA programme lead</small></div><ChevronDown size={15} /></div>
          <Link to="/login" className="ag-signout"><LogOut size={15} /> Sign out</Link>
        </div>
      </aside>

      <main className="ag-main">
        <header className="ag-topbar">
          <button className="ag-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
          <div className="ag-breadcrumb"><span>REA verification</span><i>/</i><b>{active}</b></div>
          <div className="ag-top-actions">
            <form className="ag-global-search" onSubmit={submitSearch}><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claims, projects, contractors" /></form>
            <button className="ag-top-icon" onClick={() => setNotificationsOpen((value) => !value)} aria-label="Notifications"><Bell size={18} /><i>{Math.min(12, auditEvents.length)}</i></button>
            <div className="ag-top-avatar">FS</div>
          </div>
          {notificationsOpen && (
            <div className="ag-notification-popover">
              <header><div><b>Notifications</b><small>Latest workflow activity</small></div><button onClick={() => setNotificationsOpen(false)}>×</button></header>
              {auditEvents.slice(0, 4).map((event) => <button key={event.id} onClick={() => goTo("Audit trail")}><span /><div><b>{event.action}</b><small>{event.entityId} · {event.actor}</small></div></button>)}
              <button className="ag-notification-footer" onClick={() => goTo("Audit trail")}>View complete audit trail</button>
            </div>
          )}
        </header>

        {searchNotice && <button className="ag-global-notice" onClick={() => setSearchNotice("")}>{searchNotice}<span>×</span></button>}

        <div className="ag-content">
          {renderWorkspace()}
          <footer className="ag-footer"><span>Atlas Grid Inspection · Independent project verification platform</span><span>REA Nigeria · Controlled workspace</span></footer>
        </div>
      </main>
    </div>
  );
}
