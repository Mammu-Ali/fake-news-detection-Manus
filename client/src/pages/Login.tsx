import { useEffect, useState } from "react";
import { Binary, LogIn, ArrowUpRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [loginError, setLoginError] = useState(() => {
    if (typeof window === "undefined") return "";
    const code = new URLSearchParams(window.location.search).get("error");
    if (code === "missing_oauth_params") return "The OAuth provider did not return the required login parameters.";
    if (code === "invalid_oauth_state") return "This login session expired or was opened in another browser tab. Start again.";
    if (code === "oauth_callback_failed") return "The OAuth provider could not complete this login. Check the local callback configuration and try again.";
    return "";
  });
  const [loginStatus, setLoginStatus] = useState("");

  const handleLogin = () => {
    setLoginError("");
    setLoginStatus("OPENING_OAUTH_GATE...");
    if (typeof window !== "undefined") window.history.replaceState({}, "", "/login");
    try {
      startLogin();
      window.setTimeout(() => {
        setLoginStatus("");
        setLoginError("OAuth did not open. Check your local OAuth variables and callback URL, then try again.");
      }, 1800);
    } catch (error) {
      setLoginStatus("");
      setLoginError(error instanceof Error ? error.message : "Unable to start OAuth login");
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/dashboard");
  }, [loading, isAuthenticated, navigate]);

  if (loading) return <div className="boot-screen"><Binary className="spin" /><span>CHECKING_ACCESS_NODE...</span></div>;
  if (isAuthenticated) return null;

  return <main className="login-page">
    <div className="landing-grid" />
    <div className="login-noise" />
    <section className="login-card" aria-labelledby="login-title">
      <div className="brand-lockup large"><div className="brand-mark">FN</div><div><div className="brand-name">FAKE//REAL</div><div className="brand-sub">SIGNAL ANALYSIS UNIT</div></div></div>
      <div className="eyebrow cyan">[ USER ACCESS / AUTHENTICATED NODE ]</div>
      <h1 id="login-title">Enter the<br /><span>signal room.</span></h1>
      <p className="login-copy">Sign in as a user to analyze article signals, review your prediction history, and continue your verification workflow.</p>
      <button type="button" className="detect-button login-button" onClick={handleLogin} disabled={Boolean(loginStatus)}><LogIn size={16} /> {loginStatus ? "CONNECTING..." : "USER LOGIN"} <ArrowUpRight size={16} /></button>
      {loginStatus && <div className="login-status" role="status">{loginStatus}</div>}
      {loginError && <div className="login-error" role="alert"><strong>AUTH GATE ERROR</strong><span>{loginError}</span><small>For a local clone, configure VITE_APP_ID and VITE_OAUTH_PORTAL_URL before starting Vite.</small></div>}
      <div className="login-assurance"><ShieldCheck size={15} /><span>OAuth session · protected dashboard · private history</span></div>
      <button className="back-link" onClick={() => navigate("/")}><ArrowLeft size={14} /> Return to public node</button>
    </section>
    <div className="login-code"><span>01 // AUTH_READY</span><span>02 // USER_SCOPE</span><span>03 // SESSION_LOCK</span><span>04 // SIGNAL_ACCESS</span></div>
  </main>;
}
