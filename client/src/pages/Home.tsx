import { useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Activity, ArrowUpRight, BarChart3, Binary, Clock3, FileText, Gauge, History, LogIn, LogOut, Menu, Search, ShieldCheck, Sparkles, Trash2, Upload, X } from "lucide-react";

const sampleArticle = `A viral post claims that a secret research group has proven a single household ingredient can eliminate every known disease overnight. The article offers no named researchers, no links to a study, and urges readers to share immediately before the information is removed.`;

function VerdictBadge({ verdict }: { verdict: "Fake" | "Real" }) {
  return <span className={`verdict-badge ${verdict === "Fake" ? "verdict-fake" : "verdict-real"}`}><span className="status-dot" />{verdict}</span>;
}

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [articleText, setArticleText] = useState("");
  const [result, setResult] = useState<null | { verdict: "Fake" | "Real"; confidence: number; explanation: string; linguisticPatterns: string; emotionalTone: string; credibilitySignals: string; highlightedPhrases: string[]; signals: string[]; processingTimeMs: number }>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "confidence">("newest");
  const [verdictFilter, setVerdictFilter] = useState<"all" | "Fake" | "Real">("all");
  const [minConfidence, setMinConfidence] = useState("");
  const [maxConfidence, setMaxConfidence] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const view = typeof window !== "undefined" && window.location.pathname.includes("history") ? "history" : "dashboard";
  const stats = trpc.predictions.stats.useQuery(undefined, { enabled: isAuthenticated });
  const history = trpc.predictions.list.useQuery({ search: search || undefined, sort, verdict: verdictFilter, minConfidence: minConfidence ? Number(minConfidence) : undefined, maxConfidence: maxConfidence ? Number(maxConfidence) : undefined, from: fromDate || undefined, to: toDate || undefined }, { enabled: isAuthenticated });
  const utils = trpc.useUtils();
  const analyze = trpc.predictions.analyze.useMutation({
    onSuccess: data => {
      setResult(data);
      void utils.predictions.stats.invalidate();
      void utils.predictions.list.invalidate();
    },
    onError: error => toast.error(error.message || "Unable to analyze article"),
  });
  const remove = trpc.predictions.remove.useMutation({
    onSuccess: () => { toast.success("Prediction removed"); void utils.predictions.stats.invalidate(); void utils.predictions.list.invalidate(); },
  });
  const recent = stats.data?.recent ?? [];
  const fakePercentage = stats.data?.fakePercentage ?? 0;
  const realPercentage = stats.data?.realPercentage ?? 0;
  const greeting = useMemo(() => user?.name?.split(" ")[0] || "Operator", [user?.name]);

  if (loading) return <div className="boot-screen"><Binary className="spin" /><span>AUTHENTICATING_SESSION...</span></div>;
  if (!isAuthenticated) {
    return <Landing onLogin={startLogin} />;
  }

  const handleFile = (file?: File) => {
    if (!file) return;
    if (file.type !== "text/plain" && !file.name.toLowerCase().endsWith(".txt")) {
      toast.error("Only plain-text .txt files are supported");
      return;
    }
    const reader = new FileReader();
    reader.onload = event => setArticleText(String(event.target?.result ?? ""));
    reader.readAsText(file);
  };

  const runAnalysis = () => {
    if (articleText.trim().length < 40) {
      toast.error("Enter at least 40 characters of article text");
      return;
    }
    analyze.mutate({ articleText: articleText.trim() });
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand-lockup"><div className="brand-mark">FN</div><div><div className="brand-name">FAKE//REAL</div><div className="brand-sub">SIGNAL ANALYSIS UNIT</div></div></div>
      <div className="sidebar-rule" />
      <div className="nav-label">[ COMMAND DECK ]</div>
      <nav className="side-nav">
        <a className={view === "dashboard" ? "active" : ""} href="/dashboard"><BarChart3 size={16} />Dashboard<span className="nav-index">01</span></a>
        <a className={view === "history" ? "active" : ""} href="/history"><History size={16} />Prediction log<span className="nav-index">02</span></a>
      </nav>
      <div className="sidebar-bottom">
        <div className="system-card"><span className="status-dot status-live" /><div><div className="mono-label">MODEL STATUS</div><strong>ONLINE / READY</strong></div></div>
        <button className="logout-button" onClick={() => logout()}><LogOut size={15} />Terminate session</button>
      </div>
    </aside>
    {mobileNav && <button className="mobile-overlay" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
    <main className="main-canvas">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu /></button><div><div className="eyebrow">/ {view === "history" ? "PREDICTION_LOG" : "COMMAND_DECK"}</div><h1>{view === "history" ? "Prediction history" : "Signal dashboard"}</h1></div><div className="topbar-actions"><div className="operator-chip"><span className="avatar-chip">{greeting.slice(0, 2).toUpperCase()}</span><span>{greeting}</span></div></div></header>
      {view === "dashboard" ? <>
        <section className="hero-strip"><div><div className="eyebrow cyan">[ LIVE CLASSIFICATION NODE ]</div><h2>Interrogate the signal.<br /><span>Expose the noise.</span></h2><p>Submit article text to run a pattern-based Fake / Real analysis. Results are designed for awareness, not absolute verification.</p></div><div className="hero-glyph"><span>01</span><span>10</span><span>11</span><span>01</span><span>00</span><span>10</span></div></section>
        <section className="stat-grid"><Stat label="TOTAL SCANS" value={String(stats.data?.total ?? 0).padStart(2, "0")} icon={<Gauge />} accent="cyan" /><Stat label="FAKE SIGNALS" value={`${fakePercentage}%`} sub={`${stats.data?.fake ?? 0} classifications`} icon={<ShieldCheck />} accent="red" /><Stat label="REAL SIGNALS" value={`${realPercentage}%`} sub={`${stats.data?.real ?? 0} classifications`} icon={<Activity />} accent="green" /><Stat label="MODEL" value="LSTM" sub="Bi-directional / v1.0" icon={<Binary />} accent="yellow" /></section>
        <section className="workspace-grid"><Card className="input-card"><CardHeader><div className="panel-kicker"><span className="panel-number">01</span><span>INPUT_STREAM</span><span className="panel-line" /></div><CardTitle>Feed the article</CardTitle><p className="muted-copy">Paste raw text or load a plain-text file. Minimum 40 characters.</p></CardHeader><CardContent><Textarea value={articleText} onChange={event => setArticleText(event.target.value)} placeholder="Paste article content here..." className="article-input" /><div className="input-footer"><button className="ghost-button" onClick={() => fileRef.current?.click()}><Upload size={15} />Load .TXT<input ref={fileRef} type="file" accept=".txt,text/plain" hidden onChange={event => handleFile(event.target.files?.[0])} /></button><button className="text-button" onClick={() => setArticleText(sampleArticle)}>Load sample signal</button><span className="char-count">{articleText.length.toLocaleString()} / 20,000</span></div><Button className="detect-button" onClick={runAnalysis} disabled={analyze.isPending}>{analyze.isPending ? <><span className="button-pulse" />ANALYZING_SIGNAL...</> : <><Sparkles size={16} />RUN DETECTION <ArrowUpRight size={16} /></>}</Button></CardContent></Card><ResultPanel result={result} articleText={articleText} /></section>
        <section className="lower-grid"><Card><CardHeader><div className="panel-kicker"><span className="panel-number">02</span><span>RECENT_ACTIVITY</span><span className="panel-line" /></div><CardTitle>Latest scans</CardTitle></CardHeader><CardContent>{recent.length === 0 ? <EmptyState onClick={() => navigate("/history")} /> : <div className="activity-list">{recent.map(item => <ActivityRow key={item.id} item={item} />)}</div>}</CardContent></Card><Card className="signal-card"><CardHeader><div className="panel-kicker"><span className="panel-number">03</span><span>OPERATING_NOTE</span><span className="panel-line" /></div><CardTitle>Read the signal</CardTitle></CardHeader><CardContent><p className="quote-copy">“A confidence score measures the model’s pattern match — not the truth of the world.”</p><div className="terminal-lines"><span>&gt; classify linguistic cues</span><span>&gt; inspect emotional tone</span><span>&gt; compare credibility signals</span><span>&gt; verify independently</span></div></CardContent></Card></section>
      </> : <section className="history-section"><div className="section-intro"><div><div className="eyebrow cyan">[ ARCHIVE / USER_SCOPE ]</div><h2>Prediction history</h2><p>Search and inspect your stored classification events.</p></div><div className="history-count">{history.data?.length ?? 0} RECORDS</div></div><div className="history-toolbar"><div className="search-box"><Search size={16} /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search article text or verdict..." /></div><select value={verdictFilter} onChange={event => setVerdictFilter(event.target.value as typeof verdictFilter)}><option value="all">All verdicts</option><option value="Fake">Fake only</option><option value="Real">Real only</option></select><select value={sort} onChange={event => setSort(event.target.value as typeof sort)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="confidence">Confidence</option></select></div><div className="filter-row"><label>MIN CONF <Input type="number" min="0" max="100" value={minConfidence} onChange={event => setMinConfidence(event.target.value)} placeholder="0" /></label><label>MAX CONF <Input type="number" min="0" max="100" value={maxConfidence} onChange={event => setMaxConfidence(event.target.value)} placeholder="100" /></label><label>FROM <Input type="date" value={fromDate} onChange={event => setFromDate(event.target.value)} /></label><label>TO <Input type="date" value={toDate} onChange={event => setToDate(event.target.value)} /></label><button className="text-button" onClick={() => { setVerdictFilter("all"); setMinConfidence(""); setMaxConfidence(""); setFromDate(""); setToDate(""); }}>Clear filters <X size={13} /></button></div><Card className="history-card"><CardContent>{history.data?.length ? <div className="history-table-wrap"><table className="history-table"><thead><tr><th>VERDICT</th><th>ARTICLE SIGNAL</th><th>CONFIDENCE</th><th>PROCESS TIME</th><th>DATE</th><th /></tr></thead><tbody>{history.data.map(item => <tr key={item.id}><td><VerdictBadge verdict={item.verdict} /></td><td><div className="article-preview">{item.articleText}</div></td><td><strong>{item.confidence}%</strong><Progress value={item.confidence} className="mini-progress" /></td><td><span className="mono-data"><Clock3 size={13} />{item.processingTimeMs}ms</span></td><td><span className="mono-data">{new Date(item.createdAt).toLocaleDateString()}</span></td><td><button className="icon-button danger" onClick={() => remove.mutate({ id: item.id })} aria-label="Delete prediction"><Trash2 size={15} /></button></td></tr>)}</tbody></table></div> : <EmptyState onClick={() => navigate("/dashboard")} />}</CardContent></Card></section>}
    </main>
  </div>;
}

function Landing({ onLogin }: { onLogin: () => void }) { return <div className="landing"><div className="landing-grid" /><div className="landing-content"><div className="brand-lockup large"><div className="brand-mark">FN</div><div><div className="brand-name">FAKE//REAL</div><div className="brand-sub">SIGNAL ANALYSIS UNIT</div></div></div><div className="eyebrow cyan">[ AUTHORIZED ACCESS ONLY ]</div><h1>Detect the<br /><span>disinformation.</span></h1><p>A pattern-based AI interface for interrogating news signals. Paste an article, expose its linguistic fingerprints, and keep your verification workflow moving.</p><Button className="detect-button landing-button" onClick={onLogin}><LogIn size={16} />ENTER THE NODE <ArrowUpRight size={16} /></Button><div className="landing-footer"><span>ENCRYPTED SESSION</span><span>MODEL / LSTM_BI v1.0</span><span>NODE / ONLINE</span></div></div><div className="landing-code">{Array.from({ length: 9 }, (_, i) => <span key={i}>0{i + 1} // SIGNAL_{i % 2 ? "TRACE" : "READY"}</span>)}</div></div> }

function Stat({ label, value, sub, icon, accent }: { label: string; value: string; sub?: string; icon: React.ReactNode; accent: string }) { return <div className={`stat-card stat-${accent}`}><div className="stat-top"><span className="mono-label">{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value}</div><div className="stat-sub">{sub || "ACTIVE"}</div></div> }
function ResultPanel({ result, articleText }: { result: { verdict: "Fake" | "Real"; confidence: number; explanation: string; linguisticPatterns: string; emotionalTone: string; credibilitySignals: string; highlightedPhrases: string[]; signals: string[]; processingTimeMs: number } | null; articleText: string }) { return <Card className={`result-card ${result ? `result-${result.verdict.toLowerCase()}` : ""}`}><CardHeader><div className="panel-kicker"><span className="panel-number">04</span><span>ANALYSIS_OUTPUT</span><span className="panel-line" /></div><CardTitle>Verdict console</CardTitle></CardHeader><CardContent>{!result ? <div className="result-empty"><div className="crosshair">＋</div><p>Awaiting article input</p><span>OUTPUT WILL MATERIALIZE HERE</span></div> : <div className="result-content"><div className="verdict-row"><div><div className="mono-label">CLASSIFICATION</div><div className="verdict-title"><VerdictBadge verdict={result.verdict} /></div></div><div className="confidence-block"><div className="confidence-value">{result.confidence}%</div><div className="mono-label">CONFIDENCE</div></div></div><Progress value={result.confidence} className="confidence-progress" /><div className="result-meta"><span><Clock3 size={14} />{result.processingTimeMs}ms processing</span><span><FileText size={14} />pattern analysis</span></div><div className="explanation-box"><div className="mono-label">EXPLANATION / PATTERN READOUT</div><p>{result.explanation}</p><div className="dimension-grid"><div><span className="mono-label">LINGUISTIC PATTERNS</span><p>{result.linguisticPatterns}</p></div><div><span className="mono-label">EMOTIONAL TONE</span><p>{result.emotionalTone}</p></div><div><span className="mono-label">CREDIBILITY SIGNALS</span><p>{result.credibilitySignals}</p></div></div></div><div className="signals"><div className="mono-label">INFLUENTIAL SIGNALS</div><div className="signal-chips">{result.signals.map(signal => <Badge key={signal} variant="outline">{signal}</Badge>)}</div><div className="highlight-readout"><span className="mono-label">HIGHLIGHTED PHRASES IN ARTICLE</span><p>{highlightPhrases(articleText, result.highlightedPhrases)}</p></div></div><div className="disclaimer"><span>!</span>Results are pattern-based and not verified facts. Independently verify important claims.</div></div>}</CardContent></Card> }
function highlightPhrases(text: string, phrases: string[]) { if (!text) return <span>No article text available.</span>; const escaped = phrases.filter(Boolean).map(phrase => phrase.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")); if (!escaped.length) return <span>{text}</span>; return text.split(new RegExp(`(${escaped.join("|")})`, "gi")).map((part, index) => phrases.some(phrase => phrase.toLowerCase() === part.toLowerCase()) ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>); }
function ActivityRow({ item }: { item: any }) { return <div className="activity-row"><VerdictBadge verdict={item.verdict} /><div className="activity-copy"><span>{item.articleText.slice(0, 76)}{item.articleText.length > 76 ? "..." : ""}</span><small>{new Date(item.createdAt).toLocaleString()}</small></div><strong>{item.confidence}%</strong></div> }
function EmptyState({ onClick }: { onClick: () => void }) { return <div className="empty-state"><History size={22} /><p>No signals recorded yet.</p><button className="text-button" onClick={onClick}>Run your first scan <ArrowUpRight size={14} /></button></div> }
