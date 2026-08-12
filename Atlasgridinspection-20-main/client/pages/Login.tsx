import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Phone, ShieldCheck, UserRound, Zap } from "lucide-react";
import { useAtlasGrid } from "@/context/AtlasGridContext";

const demoAccounts = [
  { role: "Consultant Admin", identifier: "admin@northgrid.ng", password: "admin123", initials: "FB", tone: "green" },
  { role: "Field Officer", identifier: "+2348035550198", password: "field123", initials: "AY", tone: "blue" },
  { role: "REA Staff", identifier: "staff@rea.gov.ng", password: "staff123", initials: "FS", tone: "green" },
];

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAtlasGrid();
  const [identifier, setIdentifier] = useState("admin@northgrid.ng");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const result = signIn(identifier, password);
    if (!result.ok || !result.data) {
      setError(result.message);
      return;
    }
    setError("");
    navigate(result.data.destination, { replace: true });
  };

  const selectDemo = (account: typeof demoAccounts[number]) => {
    setIdentifier(account.identifier);
    setPassword(account.password);
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-visual">
        <div className="login-visual-top">
          <div className="login-logo"><span><Zap size={18} fill="currentColor" /></span><b>Atlas Grid Inspection</b></div>
          <div className="login-secure"><ShieldCheck size={14} /> Secure REA workspace</div>
        </div>
        <div className="login-visual-copy">
          <div className="login-kicker"><i /> RURAL ELECTRIFICATION AGENCY</div>
          <h1>Powering better<br /><em>field decisions.</em></h1>
          <p>A secure operations platform for coordinating inspections, verifying project sites, and delivering reliable infrastructure across Nigeria.</p>
          <div className="login-feature-list">
            <div><CheckCircle2 size={17} /><span><b>Verified field evidence</b><small>GPS-tagged photos, signatures and reports</small></span></div>
            <div><CheckCircle2 size={17} /><span><b>Designed for low-connectivity work</b><small>Phone-number login for field officers and offline drafts</small></span></div>
            <div><CheckCircle2 size={17} /><span><b>Role-isolated portals</b><small>Users enter only the workspace assigned to their account</small></span></div>
          </div>
        </div>
        <div className="login-visual-footer"><span><i /> All systems operational</span><span>© 2026 REA Nigeria</span></div>
      </div>

      <div className="login-form-side">
        <div className="login-form-wrap">
          <Link className="login-back-home" to="/">← Back to AtlasGrid overview</Link>
          <div className="mobile-login-logo"><span><Zap size={16} fill="currentColor" /></span><b>Atlas Grid Inspection</b></div>
          <div className="login-form-heading"><div className="login-form-icon"><LockKeyhole size={20} /></div><h2>Welcome back</h2><p>Sign in with your assigned email address or phone number.</p></div>
          <form onSubmit={submit}>
            <label>Email or phone number
              <div className="login-input"><UserRound size={16} /><input type="text" inputMode="email" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Email or +234 phone number" /></div>
            </label>
            <label>Password or PIN
              <div className="login-input"><LockKeyhole size={16} /><input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password or PIN" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            </label>
            {error && <div className="login-error">{error}</div>}
            <button className="login-submit" type="submit">Sign in to workspace <ArrowRight size={17} /></button>
          </form>
          <div className="login-phone-note"><Phone size={15} /><div><b>Field officers use their phone number as username</b><small>No email account is required. A password/PIN is still required for security.</small></div></div>
          <div className="demo-divider"><span>QUICK DEMO ACCESS</span></div>
          <div className="demo-accounts">{demoAccounts.map((account) => <button key={account.role} className={`demo-account ${account.tone}`} onClick={() => selectDemo(account)}><span className="demo-avatar">{account.initials}</span><span><b>{account.role}</b><small>{account.identifier}</small></span><ArrowRight size={15} /></button>)}</div>
          <div className="login-note"><ShieldCheck size={14} /> Demo credentials are for preview access only.</div>
        </div>
      </div>
    </div>
  );
}
