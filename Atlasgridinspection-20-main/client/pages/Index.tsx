import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  FileCheck2,
  HelpCircle,
  History,
  LogOut,
  Map,
  Menu,
  Search,
  Settings,
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
import { Modal } from "@/components/ModernUI";

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
  const { claims, auditEvents, currentUser, signOut, updateCurrentUserProfile, resetDemo } = useAtlasGrid();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dialog, setDialog] = useState<"profile" | "settings" | "help" | null>(null);
  const [search, setSearch] = useState("");
  const [searchNotice, setSearchNotice] = useState("");
  const [profileNotice, setProfileNotice] = useState("");
  const [profileDraft, setProfileDraft] = useState({ name: currentUser?.name ?? "", phone: currentUser?.phone ?? "", state: currentUser?.state ?? "FCT" });
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = window.localStorage.getItem("atlasgrid-rea-preferences-v1");
      return stored ? JSON.parse(stored) as { emailAlerts: boolean; criticalAlerts: boolean; compactTables: boolean; animations: boolean } : { emailAlerts: true, criticalAlerts: true, compactTables: false, animations: true };
    } catch {
      return { emailAlerts: true, criticalAlerts: true, compactTables: false, animations: true };
    }
  });
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const active: PortalTab = labelBySlug[params.get("tab") ?? "overview"] ?? "Overview";
  const initials = (currentUser?.name ?? "REA").split(" ").map((part) => part[0]).filter(Boolean).slice(0, 2).join("");

  const badgeCounts = useMemo(() => ({
    Claims: claims.filter((claim) => claim.status === "New" || claim.status === "Validated").length,
    "Verified reports": claims.filter((claim) => claim.status === "Pending REA Review").length,
  }), [claims]);

  const goTo = (page: PortalTab, extra: { state?: string; project?: string; q?: string } = {}) => {
    const nextParams: Record<string, string> = { tab: slugByLabel[page] };
    if (extra.state) nextParams.state = extra.state;
    if (extra.project) nextParams.project = extra.project;
    if (extra.q) nextParams.q = extra.q;
    setParams(nextParams);
    setMobileOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };
    const pointerListener = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    window.addEventListener("keydown", listener);
    window.addEventListener("mousedown", pointerListener);
    return () => {
      window.removeEventListener("keydown", listener);
      window.removeEventListener("mousedown", pointerListener);
    };
  }, []);

  useEffect(() => {
    setProfileDraft({ name: currentUser?.name ?? "", phone: currentUser?.phone ?? "", state: currentUser?.state ?? "FCT" });
  }, [currentUser?.name, currentUser?.phone, currentUser?.state]);

  useEffect(() => {
    document.documentElement.dataset.compactTables = preferences.compactTables ? "true" : "false";
    document.documentElement.dataset.animations = preferences.animations ? "true" : "false";
  }, [preferences.animations, preferences.compactTables]);

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
        return <ReaOverview onNavigate={(page, extra) => goTo(page, extra)} />;
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

  const openDialog = (value: "profile" | "settings" | "help") => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    setProfileNotice("");
    setDialog(value);
  };

  const saveProfile = () => {
    const result = updateCurrentUserProfile(profileDraft);
    setProfileNotice(result.message);
    if (result.ok) window.setTimeout(() => setDialog(null), 500);
  };

  const savePreferences = () => {
    try { window.localStorage.setItem("atlasgrid-rea-preferences-v1", JSON.stringify(preferences)); } catch { /* keep the active preferences in this tab */ }
    document.documentElement.dataset.compactTables = preferences.compactTables ? "true" : "false";
    document.documentElement.dataset.animations = preferences.animations ? "true" : "false";
    setProfileNotice("Workspace preferences saved.");
  };

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const handleResetDemo = () => {
    const confirmed = window.confirm("Reset all local workflow records, sample forms, users and audit events to the AtlasGrid demonstration data?");
    if (!confirmed) return;
    resetDemo();
    navigate("/login", { replace: true });
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

        <button type="button" className="ag-account-card ag-account-card-button" onClick={() => openDialog("profile")}>
          <span>{initials}</span>
          <div><b>{currentUser?.organization ?? "REA Administration"}</b><small>National verification workspace</small></div>
          <ShieldCheck size={17} />
        </button>

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
          <button type="button" className="ag-user-card" onClick={() => openDialog("profile")}><span>{initials}</span><div><b>{currentUser?.name ?? "REA Administrator"}</b><small>{currentUser?.role ?? "REA Admin"}</small></div><ChevronDown size={15} /></button>
          <button type="button" className="ag-signout" onClick={handleSignOut}><LogOut size={15} /> Sign out</button>
        </div>
      </aside>

      <main className="ag-main">
        <header className="ag-topbar">
          <button className="ag-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={19} /></button>
          <div className="ag-breadcrumb"><span>REA verification</span><i>/</i><b>{active}</b></div>
          <div className="ag-top-actions" ref={profileMenuRef}>
            <form className="ag-global-search" onSubmit={submitSearch}><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claims, projects, contractors" /></form>
            <button className="ag-top-icon" onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} aria-label="Notifications"><Bell size={18} /><i>{Math.min(12, auditEvents.length)}</i></button>
            <button type="button" className="ag-top-avatar" onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} aria-label="Open account menu" aria-expanded={profileOpen}>{initials}</button>
            {profileOpen && (
              <div className="ag-profile-menu">
                <header><span>{initials}</span><div><b>{currentUser?.name}</b><small>{currentUser?.role} · {currentUser?.organization}</small></div></header>
                <button type="button" onClick={() => openDialog("profile")}><CircleUserRound size={17} /><span><b>My profile</b><small>View and update account details</small></span></button>
                <button type="button" onClick={() => openDialog("settings")}><Settings size={17} /><span><b>Workspace settings</b><small>Alerts, tables and motion</small></span></button>
                <button type="button" onClick={() => goTo("Audit trail")}><History size={17} /><span><b>My audit activity</b><small>Open recorded system actions</small></span></button>
                <button type="button" onClick={() => openDialog("help")}><HelpCircle size={17} /><span><b>Help & support</b><small>Workflow guidance and shortcuts</small></span></button>
                <button type="button" className="ag-profile-signout" onClick={handleSignOut}><LogOut size={17} /><span><b>Sign out</b><small>End this secure session</small></span></button>
              </div>
            )}
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

      {dialog === "profile" && (
        <Modal title="My profile" subtitle="Update your REA workspace identity and duty-location details." onClose={() => setDialog(null)}>
          <div className="ag-profile-summary"><span>{initials}</span><div><b>{currentUser?.name}</b><small>{currentUser?.role} · {currentUser?.organization}</small><em>{currentUser?.email ?? currentUser?.username}</em></div><ShieldCheck size={21} /></div>
          {profileNotice && <div className="ag-modal-notice">{profileNotice}</div>}
          <div className="ag-form-grid ag-form-grid-single">
            <label>Full name<input value={profileDraft.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} /></label>
            <label>Phone number<input type="tel" value={profileDraft.phone} onChange={(event) => setProfileDraft({ ...profileDraft, phone: event.target.value })} placeholder="080..." /></label>
            <label>Primary state / duty location<input value={profileDraft.state} onChange={(event) => setProfileDraft({ ...profileDraft, state: event.target.value })} /></label>
            <label>Account role<input value={currentUser?.role ?? ""} readOnly /></label>
          </div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setDialog(null)}>Cancel</button><button className="ag-button ag-button-primary" onClick={saveProfile}>Save profile</button></div>
        </Modal>
      )}

      {dialog === "settings" && (
        <Modal title="Workspace settings" subtitle="Personalize notifications, table density and motion for this browser." onClose={() => setDialog(null)}>
          {profileNotice && <div className="ag-modal-notice">{profileNotice}</div>}
          <div className="ag-settings-list">
            <label><span><b>Critical workflow alerts</b><small>Show high-risk, overdue and returned-work notifications.</small></span><input type="checkbox" checked={preferences.criticalAlerts} onChange={(event) => setPreferences({ ...preferences, criticalAlerts: event.target.checked })} /></label>
            <label><span><b>Email alert preference</b><small>Record that this account should receive online email alerts when available.</small></span><input type="checkbox" checked={preferences.emailAlerts} onChange={(event) => setPreferences({ ...preferences, emailAlerts: event.target.checked })} /></label>
            <label><span><b>Compact tables</b><small>Reduce table row height when reviewing large registers.</small></span><input type="checkbox" checked={preferences.compactTables} onChange={(event) => setPreferences({ ...preferences, compactTables: event.target.checked })} /></label>
            <label><span><b>Interface animations</b><small>Use subtle transitions and KPI hover movement.</small></span><input type="checkbox" checked={preferences.animations} onChange={(event) => setPreferences({ ...preferences, animations: event.target.checked })} /></label>
          </div>
          <div className="ag-reset-demo"><div><b>Restore demonstration workflow</b><small>Reset claims, submitted field forms, consultant reviews, REA records, users and the audit trail in this browser.</small></div><button type="button" onClick={handleResetDemo}>Reset demo data</button></div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-outline" onClick={() => setDialog(null)}>Cancel</button><button className="ag-button ag-button-primary" onClick={savePreferences}>Save settings</button></div>
        </Modal>
      )}

      {dialog === "help" && (
        <Modal title="Help & workflow support" subtitle="Open the relevant workspace or follow the complete inspection-verification sequence." onClose={() => setDialog(null)} wide>
          <div className="ag-help-workflow">{["Claim received", "Claim validated", "Consultant assigned", "Field officer assigned", "Arrival verified", "Inspection submitted", "Consultant QA approved", "REA verified"].map((step, index) => <div key={step}><span>{index + 1}</span><b>{step}</b></div>)}</div>
          <div className="ag-help-links">
            <button onClick={() => { setDialog(null); goTo("Claims"); }}><ClipboardCheck size={20} /><span><b>Claims and assignments</b><small>Create, validate and assign workflow records.</small></span></button>
            <button onClick={() => { setDialog(null); goTo("Verified reports"); }}><FileCheck2 size={20} /><span><b>REA review queue</b><small>Open full field forms and make final decisions.</small></span></button>
            <button onClick={() => { setDialog(null); goTo("Project map"); }}><Map size={20} /><span><b>Project map</b><small>Focus states and inspect project locations.</small></span></button>
            <button onClick={() => { setDialog(null); goTo("Audit trail"); }}><History size={20} /><span><b>Audit trail</b><small>Review every workflow and access action.</small></span></button>
          </div>
          <div className="ag-support-note"><HelpCircle size={20} /><div><b>Operational support</b><p>For a production deployment, connect this interface to your approved REA help desk, authentication service and central API. This prototype keeps workflow data synchronized in the current browser.</p></div></div>
          <div className="ag-modal-actions"><button className="ag-button ag-button-primary" onClick={() => setDialog(null)}>Close help</button></div>
        </Modal>
      )}
    </div>
  );
}
