import { useEffect, useMemo, useState } from "react";
import { Binary, LogIn, ArrowUpRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { hasOAuthConfig, isLocalDevelopmentHost, startLocalDemoLogin, startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const authConfig = trpc.auth.config.useQuery(undefined, { staleTime: 60_000, retry: false });
  const [loginError, setLoginError] = useState(() => {
    if (typeof window === "undefined") return "";
    const code = new URLSearchParams(window.location.search).get("error");
    if (code === "missing_oauth_params") return "The OAuth provider did not return the required login parameters.";
    if (code === "invalid_oauth_state") return "This login session expired or was opened in another browser tab. Start again.";
    if (code === "oauth_callback_failed") return "The OAuth provider could not complete this login. Check the callback configuration and try again.";
    return "";
  });
  const [loginStatus, setLoginStatus] = useState("");

  const authMode = useMemo(() => {
    const appId = authConfig.data?.appId || (hasOAuthConfig ? import.meta.env.VITE_APP_ID : "");
    const oauthPortalUrl = authConfig.data?.oauthPortalUrl || (hasOAuthConfig ? import.meta.env.VITE_OAUTH_PORTAL_URL : "");
    if (appId && oauthPortalUrl) return "oauth" as const;
    if (authConfig.data?.localDemoEnabled && isLocalDevelopmentHost()) return "local-demo" as const;
    return "unavailable" as const;
  }, [authConfig.data]);

  const handleLogin = () => {
    setLoginError("");
    if (authMode === "unavailable") {
      setLoginError(isLocalDevelopmentHost()
        ? "OAuth is not configured for this local server. Set VITE_APP_ID and VITE_OAUTH_PORTAL_URL, then restart with pnpm dev."
        : "Hosted login is not configured on this deployment. Add VITE_APP_ID and VITE_OAUTH_PORTAL_URL to the server environment, rebuild, and restart.");
      return;
    }

    setLoginStatus(authMode === "oauth" ? "OPENING_OAUTH_GATE..." : "OPENING_LOCAL_DEMO_NODE...");
    if (typeof window !== "undefined") window.history.replaceState({}, "", "/login");
    try {
      if (authMode === "oauth") {
        startLogin({ appId: authConfig.data?.appId, oauthPortalUrl: authConfig.data?.oauthPortalUrl });
      } else {
        startLocalDemoLogin();
      }
    } catch (error) {
      setLoginStatus("");
      setLoginError(error instanceof Error ? error.message : "Unable to start the login flow.");
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated) navigate("/dashboard");
  }, [loading, isAuthenticated, navigate]);

  if (loading) return <div className="boot-screen"><Binary className="spin" /><span>CHECKING_ACCESS_NODE...</span></div>;
  if (isAuthenticated) return null;

  const buttonLabel = authMode === "oauth" ? "USER LOGIN" : authMode === "local-demo" ? "LOCAL DEMO LOGIN" : "AUTH CONFIG REQUIRED";
  const assurance = authMode === "oauth"
    ? "OAuth session · protected dashboard · private history"
    : authMode === "local-demo"
      ? "Local demo session · protected dashboard · sample history"
      : "Login unavailable · configure the server auth environment";

  return <main className="login-page">
    <div className="landing-grid" />
    <div className="login-noise" />
    <section className="login-card" aria-labelledby="login-title">
      <div className="brand-lockup large"><div className="brand-mark">FN</div><div><div className="brand-name">FAKE//REAL</div><div className="brand-sub">SIGNAL ANALYSIS UNIT</div></div></div>
      <div className="eyebrow cyan">[ USER ACCESS / AUTHENTICATED NODE ]</div>
      <h1 id="login-title">Enter the<br /><span>signal room.</span></h1>
      <p className="login-copy">Sign in as a user to analyze article signals, review your prediction history, and continue your verification workflow.</p>
      <button type="button" className="detect-button login-button" onClick={handleLogin} disabled={Boolean(loginStatus)}><LogIn size={16} /> {loginStatus ? "CONNECTING..." : buttonLabel} <ArrowUpRight size={16} /></button>
      {loginStatus && <div className="login-status" role="status">{loginStatus}</div>}
      {loginError && <div className="login-error" role="alert"><strong>AUTH GATE ERROR</strong><span>{loginError}</span><small>{authMode === "oauth" ? "Check the OAuth callback URL and provider configuration." : "The client will not attempt local demo login on a hosted origin."}</small></div>}
      <div className="login-assurance"><ShieldCheck size={15} /><span>{assurance}</span></div>
      <button className="back-link" onClick={() => navigate("/")}><ArrowLeft size={14} /> Return to public node</button>
    </section>
    <div className="login-code"><span>01 // AUTH_READY</span><span>02 // USER_SCOPE</span><span>03 // SESSION_LOCK</span><span>04 // SIGNAL_ACCESS</span></div>
  </main>;
}
