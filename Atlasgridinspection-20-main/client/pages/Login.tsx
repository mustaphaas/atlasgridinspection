import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound, Zap } from "lucide-react";

const demoAccounts = [
  { role: "Consultant Admin", email: "admin@rea.gov.ng", password: "admin123", destination: "/consultant-admin", initials: "MA", tone: "green" },
  { role: "Field Officer", email: "officer@rea.gov.ng", password: "field123", destination: "/field-officer", initials: "AY", tone: "blue" },
  { role: "REA Staff", email: "staff@rea.gov.ng", password: "staff123", destination: "/", initials: "RS", tone: "green" },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@rea.gov.ng");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const signIn = (event: FormEvent) => {
    event.preventDefault();
    const account = demoAccounts.find((item) => item.email === email && item.password === password);
    if (!account) { setError("Use one of the demo accounts below to continue."); return; }
    setError("");
    navigate(account.destination);
  };

  const selectDemo = (account: typeof demoAccounts[number]) => { setEmail(account.email); setPassword(account.password); setError(""); };

  return <div className="login-page"><div className="login-visual"><div className="login-visual-top"><div className="login-logo"><span><Zap size={18} fill="currentColor" /></span><b>Atlas Grid Inspection</b></div><div className="login-secure"><ShieldCheck size={14} /> Secure REA workspace</div></div><div className="login-visual-copy"><div className="login-kicker"><i /> RURAL ELECTRIFICATION AGENCY</div><h1>Powering better<br /><em>field decisions.</em></h1><p>A secure operations platform for coordinating inspections, verifying project sites, and delivering reliable infrastructure across Nigeria.</p><div className="login-feature-list"><div><CheckCircle2 size={17} /><span><b>Verified field evidence</b><small>GPS-tagged photos, signatures and reports</small></span></div><div><CheckCircle2 size={17} /><span><b>Works offline in the field</b><small>Capture now. Synchronize when connected.</small></span></div><div><CheckCircle2 size={17} /><span><b>One source of truth</b><small>Live oversight for every assigned project</small></span></div></div></div><div className="login-visual-footer"><span><i /> All systems operational</span><span>© 2024 REA Nigeria</span></div></div><div className="login-form-side"><div className="login-form-wrap"><div className="mobile-login-logo"><span><Zap size={16} fill="currentColor" /></span><b>Atlas Grid Inspection</b></div><div className="login-form-heading"><div className="login-form-icon"><LockKeyhole size={20} /></div><h2>Welcome back</h2><p>Sign in to your REA operations workspace.</p></div><form onSubmit={signIn}><label>Email address<div className="login-input"><UserRound size={16} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@rea.gov.ng" /></div></label><label>Password<div className="login-input"><LockKeyhole size={16} /><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>{error && <div className="login-error">{error}</div>}<button className="login-submit" type="submit">Sign in to workspace <ArrowRight size={17} /></button></form><div className="demo-divider"><span>QUICK DEMO ACCESS</span></div><div className="demo-accounts">{demoAccounts.map((account) => <button key={account.role} className={`demo-account ${account.tone}`} onClick={() => selectDemo(account)}><span className="demo-avatar">{account.initials}</span><span><b>{account.role}</b><small>{account.email}</small></span><ArrowRight size={15} /></button>)}</div><div className="login-note"><ShieldCheck size={14} /> Demo accounts are for preview access only.</div></div></div></div>;
}
