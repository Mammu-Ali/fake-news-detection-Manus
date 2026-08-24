import { useEffect } from "react";
import { Binary, LogIn, ArrowUpRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

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
      <button className="detect-button login-button" onClick={() => startLogin()}><LogIn size={16} /> USER LOGIN <ArrowUpRight size={16} /></button>
      <div className="login-assurance"><ShieldCheck size={15} /><span>OAuth session · protected dashboard · private history</span></div>
      <button className="back-link" onClick={() => navigate("/")}><ArrowLeft size={14} /> Return to public node</button>
    </section>
    <div className="login-code"><span>01 // AUTH_READY</span><span>02 // USER_SCOPE</span><span>03 // SESSION_LOCK</span><span>04 // SIGNAL_ACCESS</span></div>
  </main>;
}
