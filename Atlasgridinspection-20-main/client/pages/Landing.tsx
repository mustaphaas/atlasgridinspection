import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import nigeriaMapModule from "@svg-maps/nigeria";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  CloudOff,
  FileCheck2,
  LocateFixed,
  MapPinned,
  Menu,
  Navigation,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UploadCloud,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { portalDestination, useAtlasGrid } from "@/context/AtlasGridContext";

type NigeriaMapLocation = { id: string; name: string; path: string };
type NigeriaMapData = { viewBox: string; locations: NigeriaMapLocation[] };
type NigeriaMapInterop = NigeriaMapData & { default?: NigeriaMapData };

const importedNigeriaMap = nigeriaMapModule as unknown as NigeriaMapInterop;
const nigeriaMap = importedNigeriaMap.default ?? importedNigeriaMap;

const workflowSteps = [
  { icon: UploadCloud, title: "Claim intake", copy: "Receive validated contract claims through secure forms, Excel, CSV or connected REA systems." },
  { icon: UsersRound, title: "Consultant assignment", copy: "REA assigns the consultant. The consultant organises its own field team and inspection schedule." },
  { icon: LocateFixed, title: "Verified field inspection", copy: "GPS, geofencing, evidence, signatures and project-specific forms establish what exists on site." },
  { icon: ClipboardCheck, title: "Consultant quality review", copy: "Supervisors check completeness, evidence quality and findings before sending a controlled report to REA." },
  { icon: FileCheck2, title: "REA verification", copy: "REA reviews the complete inspection record and issues the authoritative verification outcome." },
];

function NigeriaHeroMap() {
  const selectedStates = new Set(["Kano", "Kaduna", "Bauchi", "Niger", "Lagos", "Enugu", "Federal Capital Territory"]);
  return (
    <svg className="landing-nigeria-map" viewBox={nigeriaMap.viewBox || "0 0 744 600"} role="img" aria-label="Nigeria project coverage map">
      <g>
        {(nigeriaMap.locations ?? []).map((location) => (
          <path
            key={location.id}
            d={location.path}
            className={selectedStates.has(location.name) ? "is-active" : ""}
          />
        ))}
      </g>
      <g className="landing-map-points" aria-hidden="true">
        <circle cx="370" cy="166" r="8" />
        <circle cx="323" cy="226" r="6" />
        <circle cx="470" cy="240" r="7" />
        <circle cx="274" cy="322" r="6" />
        <circle cx="195" cy="470" r="7" />
        <circle cx="490" cy="452" r="6" />
      </g>
    </svg>
  );
}

function PlatformPreview() {
  return (
    <div className="landing-preview-wrap" aria-label="AtlasGrid platform preview">
      <div className="landing-preview-glow" />
      <div className="landing-browser-card">
        <div className="landing-browser-bar">
          <span className="landing-browser-dots"><i /><i /><i /></span>
          <span className="landing-browser-title"><Zap size={13} fill="currentColor" /> Atlas Grid Inspection</span>
          <span className="landing-live-pill"><i /> Live</span>
        </div>
        <div className="landing-browser-body">
          <aside className="landing-mini-nav">
            <span className="is-active"><i /><b>Overview</b></span>
            <span><i /><b>Claims</b></span>
            <span><i /><b>Reports</b></span>
            <span><i /><b>Project map</b></span>
          </aside>
          <div className="landing-mini-content">
            <div className="landing-mini-heading">
              <div><small>NATIONAL OVERSIGHT</small><b>Programme overview</b></div>
              <span>Updated now</span>
            </div>
            <div className="landing-mini-kpis">
              <div><small>Projects</small><b>1,284</b><em>National portfolio</em></div>
              <div><small>Verified</small><b>187</b><em>REA controlled records</em></div>
              <div><small>In review</small><b>71</b><em>Awaiting final action</em></div>
            </div>
            <div className="landing-mini-grid">
              <div className="landing-mini-map-card">
                <header><span>Project coverage</span><small>36 states + FCT</small></header>
                <NigeriaHeroMap />
                <div className="landing-map-legend"><span><i /> Verified</span><span><i /> In review</span></div>
              </div>
              <div className="landing-mini-pipeline">
                <header><span>Verification pipeline</span><small>Live workflow</small></header>
                <div><i style={{ width: "92%" }} /><span>Inspected</span><b>154</b></div>
                <div><i style={{ width: "76%" }} /><span>Consultant approved</span><b>94</b></div>
                <div><i style={{ width: "58%" }} /><span>REA verified</span><b>52</b></div>
                <footer><CheckCircle2 size={14} /> Evidence synchronized</footer>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="landing-floating-card landing-floating-verified">
        <span><ShieldCheck size={17} /></span>
        <div><small>Site verification</small><b>GPS confirmed</b></div>
        <CheckCircle2 size={18} />
      </div>
      <div className="landing-floating-card landing-floating-offline">
        <span><CloudOff size={17} /></span>
        <div><small>Low connectivity</small><b>Draft saved offline</b></div>
      </div>
    </div>
  );
}

function FieldOfficerScene() {
  return (
    <div className="field-scene" aria-label="Field officer taking GPS coordinates at an inspection site">
      <svg viewBox="0 0 980 720" role="img" aria-labelledby="field-scene-title field-scene-desc">
        <title id="field-scene-title">Field officer verifying project coordinates</title>
        <desc id="field-scene-desc">An inspector at a rural solar project uses a mobile phone to verify GPS location before beginning inspection data entry.</desc>
        <defs>
          <linearGradient id="fieldSky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#eef8f2" />
            <stop offset="1" stopColor="#dcefe3" />
          </linearGradient>
          <linearGradient id="fieldGround" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#a7c9ab" />
            <stop offset="1" stopColor="#6f9e75" />
          </linearGradient>
          <linearGradient id="fieldVest" x1="0" x2="1">
            <stop offset="0" stopColor="#f4c857" />
            <stop offset="1" stopColor="#df9e28" />
          </linearGradient>
          <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#173a2b" floodOpacity="0.16" />
          </filter>
        </defs>
        <rect width="980" height="720" rx="44" fill="url(#fieldSky)" />
        <circle cx="785" cy="118" r="54" fill="#fff8d6" opacity="0.9" />
        <path d="M0 395 C150 318 250 360 385 318 C535 270 660 328 780 288 C865 260 922 277 980 244 L980 720 L0 720 Z" fill="#c3ddc8" />
        <path d="M0 472 C150 405 270 450 410 398 C535 352 668 408 790 365 C875 336 935 358 980 326 L980 720 L0 720 Z" fill="url(#fieldGround)" />
        <path d="M0 570 C210 515 392 548 530 516 C680 482 833 522 980 472 L980 720 L0 720 Z" fill="#5d8963" opacity="0.85" />

        <g className="field-cloud" opacity="0.72">
          <ellipse cx="150" cy="132" rx="65" ry="23" fill="#fff" />
          <ellipse cx="105" cy="141" rx="35" ry="18" fill="#fff" />
          <ellipse cx="198" cy="144" rx="42" ry="17" fill="#fff" />
        </g>

        <g className="field-solar-panels" filter="url(#softShadow)">
          <g transform="translate(72 400) skewY(-7)">
            <rect width="240" height="118" rx="8" fill="#143d4b" />
            <path d="M0 39 H240 M0 78 H240 M60 0 V118 M120 0 V118 M180 0 V118" stroke="#7da4ad" strokeWidth="3" opacity="0.75" />
            <path d="M42 118 L21 166 M198 118 L220 166" stroke="#284b40" strokeWidth="9" strokeLinecap="round" />
          </g>
          <g transform="translate(650 386) scale(.78) skewY(-7)">
            <rect width="240" height="118" rx="8" fill="#174454" />
            <path d="M0 39 H240 M0 78 H240 M60 0 V118 M120 0 V118 M180 0 V118" stroke="#86abb4" strokeWidth="3" opacity="0.72" />
            <path d="M42 118 L21 166 M198 118 L220 166" stroke="#284b40" strokeWidth="9" strokeLinecap="round" />
          </g>
        </g>

        <g className="field-pole" opacity="0.88">
          <path d="M880 232 L862 526" stroke="#435f4d" strokeWidth="10" strokeLinecap="round" />
          <path d="M830 263 H930" stroke="#435f4d" strokeWidth="8" strokeLinecap="round" />
          <path d="M844 263 C780 295 734 292 670 279 M916 263 C950 275 966 278 980 278" stroke="#435f4d" strokeWidth="3" fill="none" />
        </g>

        <g className="gps-ground-target" transform="translate(553 560)">
          <ellipse rx="98" ry="35" fill="#e9f7ee" opacity="0.52" />
          <ellipse rx="67" ry="24" fill="none" stroke="#2b9560" strokeWidth="4" opacity="0.55" />
          <ellipse rx="35" ry="12" fill="none" stroke="#2b9560" strokeWidth="4" opacity="0.8" />
          <circle r="6" fill="#147a46" />
        </g>

        <g className="field-officer" transform="translate(380 160)" filter="url(#softShadow)">
          <ellipse cx="180" cy="456" rx="112" ry="25" fill="#1f3e30" opacity="0.18" />
          <path d="M134 282 C120 332 112 382 105 449" stroke="#293c35" strokeWidth="35" strokeLinecap="round" />
          <path d="M189 286 C205 345 211 395 218 449" stroke="#293c35" strokeWidth="35" strokeLinecap="round" />
          <path d="M88 454 H131" stroke="#1f2d29" strokeWidth="18" strokeLinecap="round" />
          <path d="M202 454 H244" stroke="#1f2d29" strokeWidth="18" strokeLinecap="round" />
          <path d="M96 132 Q159 104 218 139 L203 304 Q154 331 111 299 Z" fill="#284e43" />
          <path d="M113 143 Q159 126 203 145 L193 269 Q154 286 122 268 Z" fill="url(#fieldVest)" />
          <path d="M121 175 H197 M119 220 H195" stroke="#f7e7a9" strokeWidth="13" opacity="0.85" />
          <path d="M103 154 C73 199 65 244 82 283" stroke="#7b513a" strokeWidth="24" strokeLinecap="round" />
          <path d="M210 154 C236 192 247 216 253 242" stroke="#7b513a" strokeWidth="24" strokeLinecap="round" />
          <path d="M252 240 C262 250 272 254 282 250" stroke="#7b513a" strokeWidth="20" strokeLinecap="round" />
          <rect x="267" y="194" width="55" height="90" rx="12" fill="#142925" transform="rotate(5 294 239)" />
          <rect x="273" y="201" width="43" height="71" rx="8" fill="#dff4e6" transform="rotate(5 294 239)" />
          <circle cx="293" cy="265" r="3" fill="#1b5e3d" />
          <circle cx="158" cy="88" r="48" fill="#7b513a" />
          <path d="M116 81 Q154 22 204 72 L201 90 Q157 69 116 91 Z" fill="#1f4136" />
          <path d="M121 69 Q158 31 201 65" stroke="#f0b52d" strokeWidth="14" strokeLinecap="round" />
          <path d="M153 72 C176 73 189 77 203 88" stroke="#19352c" strokeWidth="7" strokeLinecap="round" />
          <circle cx="174" cy="90" r="4" fill="#1b2421" />
          <path d="M174 113 Q187 118 197 109" stroke="#543628" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="147" y="126" width="25" height="18" rx="8" fill="#714833" />
          <path d="M153 136 V290" stroke="#8f692b" strokeWidth="3" opacity="0.5" />
          <rect x="139" y="151" width="38" height="58" rx="7" fill="#f8fbf9" opacity="0.94" />
          <path d="M148 162 H168 M148 172 H168 M148 182 H162" stroke="#4d7e69" strokeWidth="3" />
        </g>

        <g className="field-coordinate-line" aria-hidden="true">
          <path d="M665 252 C729 235 762 221 798 201" stroke="#268f5e" strokeWidth="3" strokeDasharray="8 9" fill="none" />
          <circle cx="665" cy="252" r="7" fill="#fff" stroke="#268f5e" strokeWidth="4" />
        </g>
      </svg>

      <div className="field-coordinate-card">
        <header><span><LocateFixed size={18} /></span><div><small>LIVE SITE VERIFICATION</small><b>Coordinates captured</b></div><i /></header>
        <div className="field-coordinate-values">
          <div><small>LATITUDE</small><b>12.0022° N</b></div>
          <div><small>LONGITUDE</small><b>8.5919° E</b></div>
        </div>
        <div className="field-coordinate-meta"><span><Radio size={14} /> Accuracy 4.8 m</span><span><Navigation size={14} /> 34 m from site</span></div>
        <footer><CheckCircle2 size={17} /><span><b>Within approved geofence</b><small>Inspection data entry unlocked</small></span></footer>
      </div>

      <div className="field-phone-card">
        <div className="field-phone-speaker" />
        <div className="field-phone-screen">
          <span className="field-phone-time">09:42</span>
          <div className="field-phone-map">
            <i className="field-phone-ring ring-one" />
            <i className="field-phone-ring ring-two" />
            <span><MapPinned size={21} /></span>
          </div>
          <small>REA-KN-2026-0042</small>
          <b>Kano Solar Mini Grid</b>
          <em><CheckCircle2 size={13} /> Location verified</em>
          <button type="button" tabIndex={-1}>Start inspection</button>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { currentUser } = useAtlasGrid();
  const [menuOpen, setMenuOpen] = useState(false);

  const workspaceLink = useMemo(
    () => (currentUser ? portalDestination(currentUser.role) : "/login"),
    [currentUser],
  );

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-landing-reveal]"));
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.14, rootMargin: "0px 0px -8%" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  };

  return (
    <div className="atlas-landing">
      <header className="landing-header">
        <button className="landing-brand" type="button" onClick={() => scrollTo("home")} aria-label="Atlas Grid Inspection home">
          <span className="landing-brand-mark"><Zap size={19} fill="currentColor" /></span>
          <span><b>Atlas Grid Inspection</b><small>REA VERIFICATION PORTAL</small></span>
        </button>
        <nav className={menuOpen ? "is-open" : ""} aria-label="Landing page navigation">
          <button type="button" onClick={() => scrollTo("platform")}>The platform</button>
          <button type="button" onClick={() => scrollTo("workflow")}>Workflow</button>
          <button type="button" onClick={() => scrollTo("field-operations")}>Field operations</button>
          <button type="button" onClick={() => scrollTo("trust")}>Assurance</button>
          <Link className="landing-mobile-nav-portal" to={workspaceLink}>{currentUser ? "Open workspace" : "Sign in to portal"}<ArrowRight size={15} /></Link>
        </nav>
        <div className="landing-header-actions">
          <Link className="landing-signin-link" to={workspaceLink}>{currentUser ? "Open workspace" : "Sign in"}</Link>
          <Link className="landing-header-cta" to={workspaceLink}>{currentUser ? "Continue" : "Enter portal"}<ArrowRight size={16} /></Link>
          <button className="landing-menu-toggle" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>

      <main>
        <section className="landing-hero landing-snap-section" id="home">
          <div className="landing-orb landing-orb-one" />
          <div className="landing-orb landing-orb-two" />
          <div className="landing-hero-inner">
            <div className="landing-hero-copy" data-landing-reveal>
              <div className="landing-eyebrow"><span><i /> National inspection infrastructure</span><em>Secure · Auditable · Field-ready</em></div>
              <h1>Every project.<br /><span>Verified on the ground.</span></h1>
              <p>Atlas Grid Inspection connects contract claims, consultant supervision, field evidence and REA verification in one controlled national workspace.</p>
              <div className="landing-hero-actions">
                <button type="button" className="landing-primary-button" onClick={() => scrollTo("platform")}>Explore the platform <ArrowRight size={18} /></button>
                <Link className="landing-secondary-button" to={workspaceLink}>{currentUser ? "Open your workspace" : "Sign in securely"}<ShieldCheck size={17} /></Link>
              </div>
              <div className="landing-trust-row">
                <span><LocateFixed size={16} /> GPS verified</span>
                <span><CloudOff size={16} /> Offline capable</span>
                <span><FileCheck2 size={16} /> Controlled records</span>
              </div>
              <div className="landing-hero-status"><i /><div><b>National verification workspace operational</b><small>Live workflow visibility from claim intake to REA decision</small></div></div>
            </div>
            <div className="landing-hero-visual" data-landing-reveal>
              <PlatformPreview />
            </div>
          </div>
          <button className="landing-scroll-cue" type="button" onClick={() => scrollTo("platform")}><span>Discover the platform</span><ChevronDown size={18} /></button>
        </section>

        <section className="landing-platform landing-snap-section" id="platform">
          <div className="landing-section-shell">
            <div className="landing-section-intro" data-landing-reveal>
              <div className="landing-section-number">01</div>
              <div>
                <span className="landing-section-kicker">A SINGLE SOURCE OF TRUTH</span>
                <h2>Built for the full inspection and verification lifecycle.</h2>
              </div>
              <p>Instead of moving between spreadsheets, messaging apps, paper forms and disconnected evidence folders, every authorised user works from the same project record and audit history.</p>
            </div>

            <div className="landing-capability-grid">
              <article className="landing-capability-feature" data-landing-reveal>
                <div className="landing-feature-top"><span><Sparkles size={19} /></span><small>COORDINATED OVERSIGHT</small></div>
                <h3>From national visibility to site-level evidence.</h3>
                <p>REA sees programme progress and risk. Consultants coordinate inspections and quality review. Field officers capture evidence only after the approved project location has been verified.</p>
                <div className="landing-feature-metrics">
                  <div><b>36</b><span>States</span></div>
                  <div><b>FCT</b><span>Included</span></div>
                  <div><b>100%</b><span>Auditable</span></div>
                </div>
              </article>

              <article className="landing-capability-card" data-landing-reveal>
                <span><ClipboardCheck size={21} /></span>
                <small>CLAIMS & ASSIGNMENTS</small>
                <h3>Work begins from an approved contract record.</h3>
                <p>Project details and coordinates are inherited automatically before consultant assignment.</p>
                <button type="button" onClick={() => scrollTo("workflow")}>Follow the workflow <ArrowRight size={15} /></button>
              </article>

              <article className="landing-capability-card" data-landing-reveal>
                <span><Smartphone size={21} /></span>
                <small>FIELD-FIRST EXPERIENCE</small>
                <h3>Designed for real operating conditions.</h3>
                <p>Phone-number access, offline drafts, in-app evidence and clear synchronization states support teams beyond reliable network coverage.</p>
                <button type="button" onClick={() => scrollTo("field-operations")}>See field verification <ArrowRight size={15} /></button>
              </article>

              <article className="landing-capability-wide" data-landing-reveal>
                <div>
                  <span><ShieldCheck size={21} /></span>
                  <small>INDEPENDENT ASSURANCE</small>
                  <h3>Each decision carries its evidence, reviewer and history.</h3>
                </div>
                <ul>
                  <li><CheckCircle2 size={17} /> Geofence and coordinate verification</li>
                  <li><CheckCircle2 size={17} /> Time-stamped evidence and signatures</li>
                  <li><CheckCircle2 size={17} /> Consultant QA and REA final review</li>
                  <li><CheckCircle2 size={17} /> Complete controlled-record audit trail</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-field landing-snap-section" id="field-operations">
          <div className="landing-field-shell">
            <div className="landing-field-visual" data-landing-reveal><FieldOfficerScene /></div>
            <div className="landing-field-copy" data-landing-reveal>
              <span className="landing-section-kicker">LOCATION BEFORE DATA</span>
              <h2>Evidence starts where the project is.</h2>
              <p>The field form remains locked until the officer’s live coordinates are captured and confirmed within the approved project geofence.</p>
              <div className="landing-field-checks">
                <div><span>01</span><p><b>Navigate to the approved location</b><small>Project coordinates come from the selected REA contract record.</small></p></div>
                <div><span>02</span><p><b>Verify arrival with live GPS</b><small>Distance and accuracy are checked before data entry becomes available.</small></p></div>
                <div><span>03</span><p><b>Capture inspection evidence</b><small>Forms, photos, signatures and findings inherit the project, officer, date and location.</small></p></div>
              </div>
              <button type="button" className="landing-text-link" onClick={() => scrollTo("workflow")}>See how the record moves to verification <ArrowRight size={17} /></button>
            </div>
          </div>
        </section>

        <section className="landing-workflow landing-snap-section" id="workflow">
          <div className="landing-section-shell">
            <div className="landing-workflow-heading" data-landing-reveal>
              <span className="landing-section-kicker">ONE CONNECTED WORKFLOW</span>
              <h2>Clear responsibility at every stage.</h2>
              <p>AtlasGrid separates who assigns, who inspects, who quality-checks and who gives the final verification decision.</p>
            </div>
            <div className="landing-workflow-grid">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} data-landing-reveal>
                    <div className="landing-workflow-index">{String(index + 1).padStart(2, "0")}</div>
                    <span className="landing-workflow-icon"><Icon size={21} /></span>
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                    {index < workflowSteps.length - 1 && <i className="landing-workflow-connector" />}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-assurance landing-snap-section" id="trust">
          <div className="landing-assurance-card" data-landing-reveal>
            <div className="landing-assurance-copy">
              <span className="landing-section-kicker">TRUSTED NATIONAL OVERSIGHT</span>
              <h2>A modern verification experience with the discipline of a controlled government record.</h2>
              <p>See programme health, geographic coverage, contractor performance, field submissions, consultant decisions and REA verification in one beautifully structured environment.</p>
              <div className="landing-assurance-actions">
                <Link className="landing-primary-button" to={workspaceLink}>{currentUser ? "Open your workspace" : "Enter the verification portal"}<ArrowRight size={18} /></Link>
                <button type="button" className="landing-secondary-button" onClick={() => scrollTo("home")}>Back to top</button>
              </div>
            </div>
            <div className="landing-assurance-seal">
              <div><ShieldCheck size={38} /><span><b>Independent</b><small>project verification</small></span></div>
              <div className="landing-assurance-ring ring-a" />
              <div className="landing-assurance-ring ring-b" />
              <i className="landing-assurance-dot dot-a" />
              <i className="landing-assurance-dot dot-b" />
              <i className="landing-assurance-dot dot-c" />
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <button className="landing-brand" type="button" onClick={() => scrollTo("home")}>
          <span className="landing-brand-mark"><Zap size={17} fill="currentColor" /></span>
          <span><b>Atlas Grid Inspection</b><small>REA VERIFICATION PORTAL</small></span>
        </button>
        <p>Independent project inspection, evidence and verification across Nigeria.</p>
        <div><button type="button" onClick={() => scrollTo("platform")}>Platform</button><button type="button" onClick={() => scrollTo("field-operations")}>Field operations</button><Link to={workspaceLink}>Portal access</Link></div>
      </footer>
    </div>
  );
}
