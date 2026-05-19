import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Activity, Zap, Server, Copy, Check, ChevronRight, Search, Filter, LogIn, BookOpen, Code2, FlaskConical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface Payload {
  id: number;
  category: string;
  subcategory: string;
  title: string;
  payload: string;
  description: string;
  severity: string;
  isBypass: boolean;
  bypassType: string | null;
  tags: string[];
  platform: string | null;
}

interface Stats {
  total: number;
  bypassCount: number;
  byCategory: { category: string; count: number }[];
  bySeverity: { severity: string; count: number }[];
}

const CATEGORIES = ["ALL", "XSS", "SQLi", "LFI", "SSRF", "XXE", "RCE", "CSRF", "IDOR", "Open Redirect", "SSTI", "Command Injection"];

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "border-red-500 text-red-400 bg-red-500/10",
  High: "border-orange-500 text-orange-400 bg-orange-500/10",
  Medium: "border-yellow-500 text-yellow-400 bg-yellow-500/10",
  Low: "border-blue-500 text-blue-400 bg-blue-500/10",
  Info: "border-gray-500 text-gray-400 bg-gray-500/10",
};

function useAuth() {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => setUser(d))
      .catch(() => setUser(null));
  }, []);
  return user;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const user = useAuth();
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [bypassOnly, setBypassOnly] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState<Payload | null>(null);
  const [heroText, setHeroText] = useState("");

  const fullHeroText = "root@41m4:~$ ./load_arsenal --mode expert";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setHeroText(fullHeroText.substring(0, i));
      i++;
      if (i > fullHeroText.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/api/payloads/stats/overview")
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const fetchPayloads = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== "ALL") params.set("category", activeCategory);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (bypassOnly) params.set("bypass", "true");
      params.set("page", String(pg));
      params.set("limit", "24");
      const res = await fetch(`/api/payloads?${params}`);
      const data = await res.json();
      setPayloads(data.payloads ?? []);
      setTotal(data.meta?.total ?? 0);
      setPages(data.meta?.pages ?? 1);
      setPage(pg);
    } catch {
      setPayloads([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, bypassOnly]);

  useEffect(() => {
    fetchPayloads(1);
  }, [fetchPayloads]);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-mono">
      {/* Navbar */}
      <nav className="border-b border-border/50 p-4 sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="text-2xl font-bold tracking-widest text-primary shrink-0">41M4</div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/docs")} className="text-muted-foreground hover:text-primary rounded-none text-xs tracking-wider">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />[DOCS]
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/api-reference")} className="text-muted-foreground hover:text-primary rounded-none text-xs tracking-wider">
              <Code2 className="w-3.5 h-3.5 mr-1.5" />[API]
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/lab")} className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded-none border border-orange-400/40 text-xs tracking-wider">
              <FlaskConical className="w-3.5 h-3.5 mr-1.5" />[ATTACK BOX]
            </Button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary border border-primary/30 px-2 py-1">{user.username}</span>
                <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-destructive rounded-none text-xs">[LOGOUT]</Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setLocation("/login")} className="border-primary text-primary hover:bg-primary hover:text-background rounded-none text-xs tracking-wider">
                <LogIn className="w-3.5 h-3.5 mr-1.5" />[LOGIN]
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 max-w-7xl mx-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-primary/8 via-background to-background pointer-events-none" />
        <div className="relative z-10 text-center space-y-6">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-primary">
            CROSS THE LINE.
          </h1>
          <div className="bg-card border border-border inline-block text-left p-3 min-w-[280px] shadow-[0_0_20px_rgba(0,255,65,0.15)]">
            <span className="text-primary text-sm">{heroText}</span><span className="animate-pulse">_</span>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto uppercase tracking-wider">
            Professional-grade payload arsenal for authorized penetration testing and security research.
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" onClick={() => document.getElementById("arsenal")?.scrollIntoView({ behavior: "smooth" })} className="bg-primary text-background hover:bg-primary/80 rounded-none font-bold tracking-wider shadow-[0_0_15px_rgba(0,255,65,0.3)]">
              [BROWSE ARSENAL]
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/lab")} className="border-orange-400 text-orange-400 hover:bg-orange-400/10 rounded-none font-bold tracking-wider">
              [ATTACK LAB]
            </Button>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section className="border-y border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50 text-center">
          {[
            { label: "PAYLOADS", val: stats ? stats.total.toLocaleString() : "—" },
            { label: "CATEGORIES", val: stats ? String(stats.byCategory.length) : "—" },
            { label: "WAF BYPASSES", val: stats ? String(stats.bypassCount) : "—" },
            { label: "CRITICAL SEVERITY", val: stats ? String(stats.bySeverity.find(s => s.severity === "Critical")?.count ?? 0) : "—" },
          ].map((s, i) => (
            <div key={i} className="p-6">
              <div className="text-3xl font-bold text-primary mb-1">{s.val}</div>
              <div className="text-xs text-muted-foreground tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Arsenal */}
      <section className="py-16 px-4 max-w-7xl mx-auto" id="arsenal">
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-primary">
            <Terminal className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-widest uppercase">Payload Arsenal</h2>
            {total > 0 && <span className="text-sm text-muted-foreground ml-auto">{total} results</span>}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 bg-card border-border/60 focus-visible:ring-primary rounded-none font-mono"
                placeholder="Search payloads, techniques, CVEs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setBypassOnly(b => !b)}
              className={`rounded-none border-border/60 gap-2 ${bypassOnly ? "border-primary text-primary bg-primary/10" : "text-muted-foreground"}`}
            >
              <Filter className="w-4 h-4" />
              {bypassOnly ? "BYPASS ONLY ✓" : "BYPASS ONLY"}
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 tracking-wider border transition-colors rounded-none ${
                  activeCategory === cat
                    ? "bg-primary text-background border-primary"
                    : "border-primary/30 text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Payload Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-border/30 bg-card h-40 animate-pulse" />
              ))}
            </div>
          ) : payloads.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border/50">
              <Terminal className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <div className="tracking-widest">NO_PAYLOADS_FOUND</div>
              <div className="text-xs mt-2">Try a different search or category</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {payloads.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <Card
                        className="bg-card border-border/50 rounded-none group hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col"
                        onClick={() => setSelectedPayload(p)}
                      >
                        <CardContent className="p-4 flex-1 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="outline" className="rounded-none border-primary/40 text-primary bg-primary/10 text-xs">{p.category}</Badge>
                              <Badge variant="outline" className={`rounded-none text-xs border ${SEVERITY_COLORS[p.severity] ?? ""}`}>{p.severity}</Badge>
                              {p.isBypass && <Badge variant="outline" className="rounded-none text-xs border-purple-500/40 text-purple-400 bg-purple-500/10">BYPASS</Badge>}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-none opacity-0 group-hover:opacity-100"
                              onClick={(e) => { e.stopPropagation(); handleCopy(p.id, p.payload); }}
                            >
                              {copiedId === p.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                          <div className="text-xs font-semibold text-foreground/80 tracking-wide">{p.title}</div>
                          <div className="bg-background/60 border border-border/30 p-2.5 flex-1 overflow-hidden relative">
                            <pre className="text-xs text-primary/80 font-mono whitespace-nowrap overflow-hidden text-ellipsis">{p.payload}</pre>
                            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/60 to-transparent" />
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{p.description}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchPayloads(page - 1)} className="rounded-none">
                    ←
                  </Button>
                  <span className="text-xs text-muted-foreground px-4">
                    Page {page} of {pages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => fetchPayloads(page + 1)} className="rounded-none">
                    →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Features row */}
      <section className="bg-card/40 border-y border-border py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Activity className="h-7 w-7 text-primary" />, title: "LIVE DATABASE", desc: "Real PostgreSQL-backed payload database. Every payload is hand-curated with descriptions and exploit context." },
            { icon: <Zap className="h-7 w-7 text-primary" />, title: "SMART SEARCH", desc: "Full-text search across payload bodies, titles, descriptions, and subcategories with pagination." },
            { icon: <Shield className="h-7 w-7 text-primary" />, title: "WAF BYPASS TAGGED", desc: "Bypass payloads are tagged and filterable — quickly find techniques to evade ModSecurity, Cloudflare WAF, and more." },
            { icon: <Server className="h-7 w-7 text-primary" />, title: "LIVE ATTACK LAB", desc: "Real vulnerable Express.js endpoints for XSS, SQLi, CSRF, and LFI — not a simulation, not sandboxed." },
          ].map((f, i) => (
            <div key={i} className="p-5 border border-border/30 hover:border-primary/40 transition-colors">
              {f.icon}
              <h3 className="font-bold tracking-wider text-sm mt-3 mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-10 px-4 text-center text-sm">
        <div className="max-w-7xl mx-auto space-y-4 text-muted-foreground">
          <div className="text-xl font-bold tracking-widest text-primary">41M4</div>
          <p className="text-xs uppercase tracking-widest">Professional Security Research Platform</p>
          <div className="flex gap-4 justify-center text-xs">
            <button onClick={() => setLocation("/docs")} className="hover:text-primary">[DOCS]</button>
            <button onClick={() => setLocation("/api-reference")} className="hover:text-primary">[API]</button>
            <button onClick={() => setLocation("/lab")} className="hover:text-orange-400">[LAB]</button>
            <button onClick={() => setLocation("/register")} className="hover:text-primary">[REGISTER]</button>
          </div>
          <div className="border border-destructive/30 bg-destructive/5 text-destructive p-3 inline-block max-w-xl text-xs uppercase tracking-wide">
            ⚠ FOR AUTHORIZED SECURITY RESEARCH ONLY. NEVER TEST WITHOUT EXPLICIT WRITTEN PERMISSION.
          </div>
        </div>
      </footer>

      {/* Payload Detail Modal */}
      <AnimatePresence>
        {selectedPayload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPayload(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="border border-primary bg-card max-w-2xl w-full shadow-[0_0_40px_rgba(0,255,65,0.2)] max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-primary/15 border-b border-primary p-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                <span className="ml-2 text-xs text-primary font-bold tracking-widest flex-1">{selectedPayload.category} // {selectedPayload.subcategory}</span>
                <button onClick={() => setSelectedPayload(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-primary mb-2">{selectedPayload.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={`rounded-none text-xs border ${SEVERITY_COLORS[selectedPayload.severity]}`}>{selectedPayload.severity}</Badge>
                    {selectedPayload.isBypass && (
                      <Badge variant="outline" className="rounded-none text-xs border-purple-500/40 text-purple-400">
                        BYPASS{selectedPayload.bypassType ? `: ${selectedPayload.bypassType}` : ""}
                      </Badge>
                    )}
                    {selectedPayload.platform && (
                      <Badge variant="outline" className="rounded-none text-xs border-blue-500/40 text-blue-400">{selectedPayload.platform}</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Payload</div>
                  <div className="relative bg-background border border-primary/40 p-4 group">
                    <pre className="text-sm text-primary font-mono whitespace-pre-wrap break-all">{selectedPayload.payload}</pre>
                    <button
                      onClick={() => handleCopy(selectedPayload.id, selectedPayload.payload)}
                      className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedId === selectedPayload.id ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Description</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedPayload.description}</p>
                </div>

                {selectedPayload.tags.length > 0 && (
                  <div>
                    <div className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPayload.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 border border-border/40 text-muted-foreground">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-border/40">
                  <Button
                    className="flex-1 rounded-none bg-primary text-background hover:bg-primary/80 font-bold"
                    onClick={() => handleCopy(selectedPayload.id, selectedPayload.payload)}
                  >
                    {copiedId === selectedPayload.id ? <><Check className="w-4 h-4 mr-2" /> COPIED!</> : <><Copy className="w-4 h-4 mr-2" /> COPY PAYLOAD</>}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedPayload(null)} className="rounded-none border-border/60">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
