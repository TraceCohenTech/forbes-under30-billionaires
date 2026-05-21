/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { under30Billionaires2026, type Billionaire } from "./data";

// ── Tokens ─────────────────────────────────────────────────────────────────────
const INH = "#dc2626";
const SM  = "#1d4ed8";

const CHART_PAL = [
  "#1d4ed8","#059669","#0891b2","#dc2626","#0284c7","#10b981",
  "#6366f1","#14b8a6","#84cc16","#ec4899","#64748b","#2dd4bf",
];

const FLAGS: Record<string, string> = {
  "Italy":"🇮🇹","Germany":"🇩🇪","United States":"🇺🇸","Ireland":"🇮🇪",
  "Norway":"🇳🇴","France":"🇫🇷","UAE":"🇦🇪","South Korea":"🇰🇷",
  "Sweden":"🇸🇪","Brazil":"🇧🇷","Pakistan":"🇵🇰","China":"🇨🇳",
};

const SEC_COL: Record<string, string> = {
  "Pharmaceuticals":"#0891b2","Eyewear / Consumer":"#0d9488",
  "Retail / Pharmacy":"#059669","Conglomerate":"#64748b",
  "Investment / Holding Company":"#64748b","Aerospace / Defense":"#dc2626",
  "Real Estate":"#059669","Gaming":"#6366f1",
  "Industrial / Electric Motors":"#14b8a6","Industrial / Tools":"#475569",
  "Art / Collectibles":"#db2777","Fintech / Prediction Markets":"#1d4ed8",
  "Prediction Markets / Crypto":"#0284c7","Chemicals":"#65a30d",
  "Wholesale / Industrial Distribution":"#94a3b8",
  "AI / Data":"#6366f1","AI / Developer Tools":"#6366f1",
  "AI / Labor Marketplace":"#6366f1","AI / Software":"#6366f1",
};

const RANK_CFG = [
  { bg:"linear-gradient(145deg,#140e00,#2d1f00)", border:"rgba(240,192,64,0.5)",   glow:"rgba(240,192,64,0.2)",   accent:"#f0c040", tag:"#1 · Gold"   },
  { bg:"linear-gradient(145deg,#0d1117,#1c2430)", border:"rgba(185,195,215,0.4)",  glow:"rgba(185,195,215,0.12)", accent:"#b9c3d7", tag:"#2 · Silver" },
  { bg:"linear-gradient(145deg,#130b00,#251500)", border:"rgba(188,120,70,0.45)",  glow:"rgba(188,120,70,0.14)",  accent:"#bc7846", tag:"#3 · Bronze" },
  { bg:"linear-gradient(145deg,#050d1e,#0d1f3c)", border:"rgba(29,78,216,0.5)",    glow:"rgba(29,78,216,0.15)",   accent:"#3b82f6", tag:"#4"          },
  { bg:"linear-gradient(145deg,#030e1a,#071e30)", border:"rgba(8,145,178,0.5)",    glow:"rgba(8,145,178,0.15)",   accent:"#22d3ee", tag:"#5"          },
];

// ── Base styles ────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background:"#fff", borderRadius:20,
  border:"1px solid #e5e7eb",
  boxShadow:"0 1px 6px rgba(0,0,0,0.05)",
};
const ttStyle = {
  background:"#fff", border:"1px solid #e5e7eb", borderRadius:10,
  fontSize:12, color:"#111827", padding:"10px 14px",
  boxShadow:"0 6px 20px rgba(0,0,0,0.09)",
};
const selStyle: React.CSSProperties = {
  padding:"7px 10px", background:"#f9fafb", border:"1px solid #e5e7eb",
  borderRadius:8, color:"#374151", fontSize:13, fontFamily:"inherit",
  outline:"none", cursor:"pointer",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt  = (v: number) => `$${v.toFixed(1)}B`;
const flag = (c: string) => FLAGS[c] ?? "";
const secCol = (s: string) => SEC_COL[s] ?? "#6b7280";

// ── Animated counter ───────────────────────────────────────────────────────────
function useCountUp(target: number, ms = 1500, dec = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let t0: number | null = null;
    let id: number;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / ms, 1);
      setVal(+(target * (1 - Math.pow(1 - p, 3))).toFixed(dec));
      if (p < 1) { id = requestAnimationFrame(tick); } else setVal(target);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, ms, dec]);
  return val;
}

// ── Atoms ──────────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display:"inline-block", padding:"2px 9px", borderRadius:20,
      fontSize:11, fontWeight:700, background:`${color}15`, color }}>
      {label}
    </span>
  );
}

function SectorChip({ sector }: { sector: string }) {
  const col = secCol(sector);
  return (
    <span style={{ display:"inline-block", padding:"2px 7px", borderRadius:5,
      fontSize:10, fontWeight:600, background:`${col}12`, color:col, border:`1px solid ${col}25` }}>
      {sector}
    </span>
  );
}

function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom:22, paddingBottom:18, borderBottom:"2px solid #e5e7eb" }}>
      <h2 className="section-title" style={{ fontWeight:800, color:"#0f172a", margin:0, letterSpacing:"-0.025em", lineHeight:1.2 }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontSize:13, color:"#6b7280", margin:"6px 0 0", lineHeight:1.5 }}>{subtitle}</p>}
    </div>
  );
}

// Big anchor bento card — dark navy, gold accent
function AnchorCard({ value, label, sub, accent = "#f0c040" }: { value: string; label: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      height:"100%",
      background:"linear-gradient(145deg,#040d1e,#0a1e40,#0f2756)",
      borderRadius:20, border:"1px solid rgba(255,255,255,0.07)",
      padding:"30px 32px", position:"relative", overflow:"hidden",
      boxShadow:"0 10px 40px rgba(0,0,0,0.25)",
      display:"flex", flexDirection:"column", justifyContent:"flex-end",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg,${accent},${accent}77,transparent)` }} />
      <div style={{ position:"absolute", top:-60, right:-60, width:240, height:240, borderRadius:"50%",
        background:`radial-gradient(circle,${accent}14 0%,transparent 65%)`, pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:120,
        background:"linear-gradient(to top,rgba(4,13,30,0.6),transparent)", pointerEvents:"none" }} />
      <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.38)",
        letterSpacing:"0.12em", textTransform:"uppercase" as const, marginBottom:14 }}>
        {label}
      </div>
      <div style={{ fontSize:52, fontWeight:900, color:accent, lineHeight:1,
        letterSpacing:"-0.04em", marginBottom:14 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize:13, color:"rgba(255,255,255,0.38)", lineHeight:1.5 }}>{sub}</div>
      )}
    </div>
  );
}

// Light bento stat card
function StatCard({ value, label, color, sub }: { value: string; label: string; color: string; sub?: string }) {
  return (
    <div className="card-lift" style={{ ...card, padding:"22px 24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:color }} />
      <div style={{ fontSize:11, fontWeight:700, color:"#9ca3af",
        letterSpacing:"0.09em", textTransform:"uppercase" as const, marginBottom:10 }}>
        {label}
      </div>
      <div style={{ fontSize:34, fontWeight:900, color, lineHeight:1, letterSpacing:"-0.03em" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize:12, color:"#6b7280", marginTop:9, lineHeight:1.4 }}>{sub}</div>}
    </div>
  );
}

// Hall of fame card
function HallCard({ person, rank }: { person: Billionaire; rank: number }) {
  const cfg = RANK_CFG[rank - 1] ?? RANK_CFG[4];
  return (
    <div className="hall-card" style={{
      background:cfg.bg, border:`1px solid ${cfg.border}`,
      borderRadius:20, padding:"24px 20px 20px",
      position:"relative", overflow:"hidden",
      boxShadow:`0 0 40px ${cfg.glow}, 0 6px 24px rgba(0,0,0,0.28)`,
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg,transparent,${cfg.accent},transparent)` }} />
      <div style={{ position:"absolute", top:-50, right:-50, width:160, height:160, borderRadius:"50%",
        background:`radial-gradient(circle,${cfg.glow} 0%,transparent 70%)`, pointerEvents:"none" }} />
      <div style={{ fontSize:10, fontWeight:800, color:cfg.accent,
        letterSpacing:"0.12em", textTransform:"uppercase" as const, marginBottom:12 }}>
        {cfg.tag}
      </div>
      <div style={{ fontSize:15, fontWeight:800, color:"#f8fafc", lineHeight:1.25, marginBottom:2 }}>
        {person.name}
      </div>
      <div style={{ fontSize:11, color:"rgba(248,250,252,0.35)", marginBottom:16 }}>{person.company}</div>
      <div style={{ fontSize:28, fontWeight:900, color:cfg.accent, lineHeight:1,
        letterSpacing:"-0.03em", marginBottom:14 }}>
        {fmt(person.netWorthB)}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:7, flexWrap:"wrap" }}>
        <Badge label={person.wealthType} color={person.wealthType==="Inherited" ? INH : SM} />
        <span style={{ fontSize:11, color:"rgba(248,250,252,0.32)" }}>
          Age {person.age} · {flag(person.country)}
        </span>
      </div>
    </div>
  );
}

// Mosaic card
function BCard({ person }: { person: Billionaire }) {
  const tc = person.wealthType === "Inherited" ? INH : SM;
  return (
    <div className="mosaic-card" style={{ ...card, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3,
        background:`linear-gradient(90deg,${tc},${tc}55)` }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <span style={{ fontSize:11, color:"#9ca3af", fontWeight:700 }}>#{person.rank}</span>
        <span style={{ fontSize:15 }}>{flag(person.country)}</span>
      </div>
      <div style={{ fontSize:14, fontWeight:800, color:"#0f172a", lineHeight:1.3, marginBottom:2 }}>{person.name}</div>
      <div style={{ fontSize:12, color:"#6b7280", marginBottom:12 }}>{person.company}</div>
      <div style={{ fontSize:24, fontWeight:900, color:"#059669", letterSpacing:"-0.025em", marginBottom:12 }}>
        {fmt(person.netWorthB)}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, flexWrap:"wrap" }}>
        <Badge label={person.wealthType} color={tc} />
        <span style={{ fontSize:11, color:"#9ca3af" }}>Age {person.age}</span>
      </div>
      <SectorChip sector={person.sector} />
    </div>
  );
}

function ChartCard({ title, children, height = 260, accent }: {
  title: string; children: React.ReactNode; height?: number; accent?: string;
}) {
  return (
    <div style={{ ...card, padding:"22px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
        {accent && <div style={{ width:3, height:12, borderRadius:2, background:accent, flexShrink:0 }} />}
        <span style={{ fontSize:11, fontWeight:700, color:"#9ca3af",
          textTransform:"uppercase" as const, letterSpacing:"0.08em" }}>
          {title}
        </span>
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

type SK = keyof Billionaire;
function SortIcon({ dir }: { dir: "asc" | "desc" | null }) {
  if (!dir) return <span style={{ marginLeft:4, opacity:0.2, fontSize:10 }}>⇅</span>;
  return <span style={{ marginLeft:4, fontSize:10, color:SM }}>{dir === "asc" ? "▲" : "▼"}</span>;
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const data = under30Billionaires2026;

  const [search,   setSearch]   = useState("");
  const [filterC,  setFilterC]  = useState("All");
  const [filterW,  setFilterW]  = useState("All");
  const [filterCo, setFilterCo] = useState("All");
  const [view,     setView]     = useState<"cards" | "table">("cards");
  const [sortK,    setSortK]    = useState<SK>("rank");
  const [sortD,    setSortD]    = useState<"asc" | "desc">("asc");

  const countries = useMemo(() => ["All", ...Array.from(new Set(data.map(d => d.country))).sort()], [data]);
  const companies = useMemo(() => ["All", ...Array.from(new Set(data.map(d => d.company))).sort()], [data]);

  const total        = data.length;
  const smCount      = data.filter(d => d.wealthType === "Self-made").length;
  const inhCount     = data.filter(d => d.wealthType === "Inherited").length;
  const totalNW      = data.reduce((s, d) => s + d.netWorthB, 0);
  const avgAge       = data.reduce((s, d) => s + d.age, 0) / data.length;
  const avgNW        = totalNW / data.length;
  const youngest     = data.reduce((a, b) => a.age < b.age ? a : b);
  const richest      = data.reduce((a, b) => a.netWorthB > b.netWorthB ? a : b);
  const smNW         = data.filter(d => d.wealthType === "Self-made").reduce((s, d) => s + d.netWorthB, 0);
  const inhNW        = data.filter(d => d.wealthType === "Inherited").reduce((s, d) => s + d.netWorthB, 0);
  const countryCount = new Set(data.map(d => d.country)).size;

  const aNW    = useCountUp(totalNW, 1800, 1);
  const aTotal = useCountUp(total, 1200);

  // Chart data
  const splitData = [{ name:"Inherited", value:inhCount }, { name:"Self-made", value:smCount }];
  const avgByType = [
    { type:"Inherited", avg:+(inhNW / inhCount).toFixed(2) },
    { type:"Self-made",  avg:+(smNW / smCount).toFixed(2)  },
  ];
  const ageGroups = [
    { range:"20–22", count:data.filter(d => d.age <= 22).length },
    { range:"23–25", count:data.filter(d => d.age >= 23 && d.age <= 25).length },
    { range:"26–28", count:data.filter(d => d.age >= 26 && d.age <= 28).length },
    { range:"29",    count:data.filter(d => d.age === 29).length },
  ];
  const countryData = useMemo(() => {
    const m: Record<string, { count: number; worth: number }> = {};
    data.forEach(d => {
      if (!m[d.country]) m[d.country] = { count:0, worth:0 };
      m[d.country].count++;
      m[d.country].worth += d.netWorthB;
    });
    return Object.entries(m)
      .map(([country, v]) => ({ country, label:`${flag(country)} ${country}`, count:v.count, worth:+v.worth.toFixed(1) }))
      .sort((a, b) => b.count - a.count);
  }, [data]);
  const companyData = useMemo(() => {
    const m: Record<string, { count: number; worth: number }> = {};
    data.forEach(d => {
      if (!m[d.company]) m[d.company] = { count:0, worth:0 };
      m[d.company].count++;
      m[d.company].worth += d.netWorthB;
    });
    return Object.entries(m)
      .map(([company, v]) => ({ company, count:v.count, worth:+v.worth.toFixed(1) }))
      .sort((a, b) => b.worth - a.worth);
  }, [data]);
  const top20 = useMemo(() =>
    [...data].sort((a, b) => b.netWorthB - a.netWorthB).slice(0, 20)
      .map(d => ({ name:d.name.split(" ").slice(-1)[0], full:d.name, worth:d.netWorthB, type:d.wealthType })),
  [data]);

  const handleSort = useCallback((k: SK) => {
    setSortD(prev => sortK === k ? (prev === "asc" ? "desc" : "asc") : "asc");
    setSortK(k);
  }, [sortK]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(d => {
      if (filterC  !== "All" && d.country    !== filterC)  return false;
      if (filterW  !== "All" && d.wealthType !== filterW)  return false;
      if (filterCo !== "All" && d.company    !== filterCo) return false;
      if (q && !d.name.toLowerCase().includes(q) && !d.company.toLowerCase().includes(q) && !d.country.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => {
      const av = a[sortK], bv = b[sortK];
      if (typeof av === "number" && typeof bv === "number") return sortD === "asc" ? av - bv : bv - av;
      return sortD === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [data, search, filterC, filterW, filterCo, sortK, sortD]);

  const thS = (k: SK): React.CSSProperties => ({
    textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase",
    letterSpacing:"0.06em", color:sortK === k ? SM : "#9ca3af",
    padding:"11px 14px", borderBottom:"1px solid #f3f4f6",
    whiteSpace:"nowrap", cursor:"pointer", userSelect:"none",
    background:"#fff", position:"sticky", top:0, zIndex:10,
  });
  const tdS: React.CSSProperties = {
    padding:"12px 14px", borderBottom:"1px solid #f9fafb",
    fontSize:13, color:"#374151", verticalAlign:"middle",
  };

  const insights = [
    { color:INH,      icon:"👑", title:"Inherited wealth dominates",       body:"25 of 35 (71%) inherited. EssilorLuxottica and Boehringer heirs alone account for $47.4B — more than the entire self-made cohort combined." },
    { color:SM,       icon:"🤖", title:"AI & fintech own self-made wealth", body:"Every self-made under-30 billionaire built in AI (Scale AI, Cursor, Mercor, Lovable) or prediction markets (Kalshi, Polymarket)." },
    { color:"#059669",icon:"🇩🇪", title:"Germany leads by concentration",   body:"German heirs hold $33.7B across Boehringer Ingelheim (×4), dm-drogerie, Stihl, and Cordes — the most concentrated national wealth." },
    { color:"#0891b2",icon:"🚀", title:"6 companies, 12 founders, $21.7B", body:"Cursor (4), Mercor (3), Kalshi (2), Polymarket, Lovable, Scale AI — all 12 self-made under-30 billionaires from this tight cluster." },
  ];

  const top5 = [...data].sort((a, b) => a.rank - b.rank).slice(0, 5);

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>

      {/* ── HERO ── */}
      <div style={{
        background:"linear-gradient(160deg,#010c1e 0%,#041532 25%,#0a2456 55%,#123580 80%,#1d4ed8 100%)",
        padding:"48px 0 56px", position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.035) 1px,transparent 1px)",
          backgroundSize:"32px 32px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:-100, right:0, width:600, height:600, borderRadius:"50%",
          background:"radial-gradient(circle,rgba(240,192,64,0.065) 0%,transparent 65%)", pointerEvents:"none" }} />

        <div style={{ maxWidth:1300, margin:"0 auto", position:"relative" }} className="hero-inner">
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#f0c040", boxShadow:"0 0 10px rgba(240,192,64,0.9)" }} />
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.48)", fontWeight:700, letterSpacing:"0.2em", textTransform:"uppercase" }}>
              Forbes · 2026 Edition
            </span>
          </div>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:24, marginBottom:20 }}>
            <h1 className="hero-title" style={{ letterSpacing:"-0.04em", lineHeight:0.95, margin:0 }}>
              <span className="gold-shimmer">Under-30</span>
              <br />
              <span style={{ color:"#fff" }}>Billionaires</span>
            </h1>
            <div style={{ display:"flex", flexDirection:"column", gap:7, paddingBottom:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:INH, boxShadow:`0 0 7px ${INH}` }} />
                <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{inhCount} Inherited</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.38)" }}>{fmt(inhNW)}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#60a5fa", boxShadow:"0 0 7px rgba(96,165,250,0.8)" }} />
                <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{smCount} Self-made</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.38)" }}>{fmt(smNW)}</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize:14, color:"rgba(255,255,255,0.45)", marginBottom:34 }}>
            <span style={{ color:"rgba(255,255,255,0.85)", fontWeight:600 }}>{aTotal}</span> billionaires ·{" "}
            <span style={{ color:"rgba(255,255,255,0.85)", fontWeight:600 }}>${aNW.toFixed(1)}B</span> combined net worth · Ages 20–29 · May 2026
          </div>

          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[
              { v:`$${aNW.toFixed(1)}B`,      l:"Combined NW", a:"#f0c040" },
              { v:fmt(richest.netWorthB),       l:"Highest NW",  a:"#f0c040" },
              { v:fmt(inhNW),                   l:"Inherited $",  a:INH       },
              { v:fmt(smNW),                    l:"Self-made $",  a:"#60a5fa" },
              { v:fmt(avgNW),                   l:"Average NW",  a:"#059669" },
              { v:`${avgAge.toFixed(1)}y`,      l:"Avg Age",     a:"#0891b2" },
            ].map((s, i) => (
              <div key={i} className="hero-chip">
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:s.a }} />
                <div style={{ fontSize:15, fontWeight:800, color:s.a }}>{s.v}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.42)", marginTop:3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1300, margin:"0 auto" }} className="page-body fade-up">

        {/* ── BENTO STATS ── */}
        <div className="bento-stats">
          {/* Anchor: spans 2 cols × 2 rows */}
          <div className="bento-anchor">
            <AnchorCard
              value={`$${aNW.toFixed(1)}B`}
              label="Combined Net Worth"
              sub={`${total} billionaires across ${countryCount} countries · Forbes 2026`}
              accent="#f0c040"
            />
          </div>
          <StatCard value={String(total)}         label="Total Billionaires"  color={SM}        sub="Forbes 2026 under-30 list" />
          <StatCard value={String(countryCount)}  label="Countries"           color="#0891b2"   sub="Nations represented" />
          <StatCard
            value={`${((inhCount / total) * 100).toFixed(0)}%`}
            label="Inherited Wealth"
            color={INH}
            sub={`${inhCount} people · ${fmt(inhNW)}`}
          />
          <StatCard
            value={fmt(avgNW)}
            label="Average Net Worth"
            color="#059669"
            sub={`Youngest: ${youngest.name.split(" ")[0]}, age ${youngest.age}`}
          />
        </div>

        {/* ── HALL OF FAME ── */}
        <div>
          <SectionLabel title="🏆 Hall of Fame" subtitle="The five wealthiest people under 30 on earth" />
          <div className="hall-row">
            {top5.map(p => <HallCard key={p.rank} person={p} rank={p.rank} />)}
          </div>
        </div>

        {/* ── ANALYTICS BENTO ── */}
        <div>
          <SectionLabel title="Wealth Breakdown" subtitle="Origin split, average net worth by type, and age distribution" />
          <div className="analytics-bento">
            {/* Donut: 2 cols × 2 rows */}
            <div className="analytics-donut">
              <div style={{ ...card, padding:"22px", height:"100%" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
                  <div style={{ width:3, height:12, borderRadius:2, background:INH }} />
                  <span style={{ fontSize:11, fontWeight:700, color:"#9ca3af",
                    textTransform:"uppercase" as const, letterSpacing:"0.08em" }}>
                    Inherited vs. Self-made
                  </span>
                </div>
                <div style={{ position:"relative", height:300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={splitData} dataKey="value" cx="50%" cy="50%"
                        outerRadius={118} innerRadius={66} paddingAngle={3}
                        label={({ name, percent }: { name?: string; percent?: number }) =>
                          `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={{ stroke:"#d1d5db" }}
                      >
                        <Cell fill={INH} />
                        <Cell fill={SM}  />
                      </Pie>
                      <Tooltip contentStyle={ttStyle} formatter={(v: any) => [v, "People"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position:"absolute", top:"50%", left:"50%",
                    transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
                    <div style={{ fontSize:30, fontWeight:900, color:"#0f172a", lineHeight:1 }}>{total}</div>
                    <div style={{ fontSize:11, color:"#9ca3af", marginTop:3 }}>total</div>
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"center", gap:28, marginTop:18 }}>
                  {[{ label:"Inherited", color:INH, count:inhCount }, { label:"Self-made", color:SM, count:smCount }].map(l => (
                    <div key={l.label} style={{ display:"flex", alignItems:"center", gap:7 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:l.color }} />
                      <span style={{ fontSize:13, color:"#374151", fontWeight:600 }}>{l.label}</span>
                      <span style={{ fontSize:12, color:"#9ca3af" }}>({l.count})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Avg NW by type */}
            <div className="analytics-chart">
              <ChartCard title="Avg Net Worth by Type" accent="#059669" height={160}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgByType} margin={{ top:4, right:12, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="type" tick={{ fill:"#6b7280", fontSize:12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#9ca3af", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}B`} />
                    <Tooltip contentStyle={ttStyle} formatter={(v: any) => [`$${v}B`, "Avg Net Worth"]} />
                    <Bar dataKey="avg" radius={[6,6,0,0]} maxBarSize={80}>
                      <Cell fill={INH} />
                      <Cell fill={SM}  />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            {/* Age distribution */}
            <div className="analytics-chart">
              <ChartCard title="Age Distribution" accent="#0891b2" height={160}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageGroups} margin={{ top:4, right:12, bottom:4, left:8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="range" tick={{ fill:"#6b7280", fontSize:12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:"#9ca3af", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={ttStyle} formatter={(v: any) => [v, "People"]} />
                    <Bar dataKey="count" fill="#0891b2" radius={[6,6,0,0]} maxBarSize={80} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </div>

        {/* ── BY COUNTRY ── */}
        <div>
          <SectionLabel title="By Country" subtitle="Billionaires and combined net worth per nation" />
          <div className="two-col">
            <ChartCard title="Billionaires by Country" height={320} accent={SM}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical" margin={{ top:4, right:20, bottom:4, left:116 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill:"#9ca3af", fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="label" type="category" tick={{ fill:"#374151", fontSize:12 }} axisLine={false} tickLine={false} width={116} />
                  <Tooltip contentStyle={ttStyle} formatter={(v: any) => [v, "Billionaires"]} />
                  <Bar dataKey="count" radius={[0,5,5,0]} maxBarSize={20}>
                    {countryData.map((_, i) => <Cell key={i} fill={CHART_PAL[i % CHART_PAL.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Combined Net Worth by Country" height={320} accent="#059669">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...countryData].sort((a, b) => b.worth - a.worth)} layout="vertical" margin={{ top:4, right:20, bottom:4, left:116 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill:"#9ca3af", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}B`} />
                  <YAxis dataKey="label" type="category" tick={{ fill:"#374151", fontSize:12 }} axisLine={false} tickLine={false} width={116} />
                  <Tooltip contentStyle={ttStyle} formatter={(v: any) => [`$${v}B`, "Net Worth"]} />
                  <Bar dataKey="worth" radius={[0,5,5,0]} maxBarSize={20}>
                    {[...countryData].sort((a, b) => b.worth - a.worth).map((_, i) => <Cell key={i} fill={CHART_PAL[i % CHART_PAL.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* ── INDIVIDUALS & COMPANIES ── */}
        <div>
          <SectionLabel title="By Individual & Company" subtitle="Red = inherited · Blue = self-made" />
          <div className="two-col">
            <ChartCard title="Net Worth — Top 20 Individuals" height={460} accent={INH}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top20} layout="vertical" margin={{ top:4, right:20, bottom:4, left:98 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill:"#9ca3af", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}B`} />
                  <YAxis dataKey="name" type="category" tick={{ fill:"#374151", fontSize:11 }} axisLine={false} tickLine={false} width={98} />
                  <Tooltip contentStyle={ttStyle}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div style={ttStyle}>
                          <div style={{ fontWeight:700, marginBottom:5 }}>{d.full}</div>
                          <Badge label={d.type} color={d.type === "Inherited" ? INH : SM} />
                          <div style={{ marginTop:6, fontWeight:800, color:"#059669", fontSize:14 }}>${d.worth}B</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="worth" radius={[0,5,5,0]} maxBarSize={17}>
                    {top20.map((d, i) => <Cell key={i} fill={d.type === "Inherited" ? INH : SM} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Combined Net Worth by Company" height={460} accent={SM}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData} layout="vertical" margin={{ top:4, right:20, bottom:4, left:138 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill:"#9ca3af", fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}B`} />
                  <YAxis dataKey="company" type="category" tick={{ fill:"#374151", fontSize:11 }} axisLine={false} tickLine={false} width={138} />
                  <Tooltip contentStyle={ttStyle} formatter={(v: any) => [`$${v}B`, "Net Worth"]} />
                  <Bar dataKey="worth" radius={[0,5,5,0]} maxBarSize={17}>
                    {companyData.map((_, i) => <Cell key={i} fill={CHART_PAL[i % CHART_PAL.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* ── INSIGHTS ── 4-column horizontal strip */}
        <div>
          <SectionLabel title="Key Insights" subtitle="Patterns and takeaways from the 2026 cohort" />
          <div className="four-col">
            {insights.map((ins, i) => (
              <div key={i} className="card-lift" style={{
                ...card, borderLeft:`4px solid ${ins.color}`, padding:"20px 20px 18px",
              }}>
                <div style={{ fontSize:22, marginBottom:10 }}>{ins.icon}</div>
                <div style={{ fontSize:13, fontWeight:800, color:"#0f172a", lineHeight:1.4, marginBottom:8 }}>{ins.title}</div>
                <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.7 }}>{ins.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ALL 35 ── */}
        <div>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <SectionLabel title="All 35 Billionaires" subtitle="Filter and explore the full cohort" />
            <div style={{ display:"flex", background:"#e2e8f0", borderRadius:10, padding:"3px", gap:2, flexShrink:0 }}>
              {(["cards", "table"] as const).map(m => (
                <button key={m} onClick={() => setView(m)} style={{
                  padding:"7px 16px", borderRadius:8, border:"none", cursor:"pointer",
                  fontSize:12, fontWeight:600, fontFamily:"inherit",
                  background:view === m ? "#fff" : "transparent",
                  color:view === m ? "#111827" : "#6b7280",
                  boxShadow:view === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  transition:"all 0.15s",
                }}>
                  {m === "cards" ? "🃏 Cards" : "📋 Table"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14, alignItems:"center" }}>
            <input type="text" placeholder="Search name, company, country…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ ...selStyle, width:248 }} />
            <select value={filterW}  onChange={e => setFilterW(e.target.value)}  style={selStyle}>
              <option value="All">All wealth types</option>
              <option value="Inherited">Inherited</option>
              <option value="Self-made">Self-made</option>
            </select>
            <select value={filterC}  onChange={e => setFilterC(e.target.value)}  style={selStyle}>
              {countries.map(c => <option key={c} value={c}>{c === "All" ? "All countries" : c}</option>)}
            </select>
            <select value={filterCo} onChange={e => setFilterCo(e.target.value)} style={selStyle}>
              {companies.map(c => <option key={c} value={c}>{c === "All" ? "All companies" : c}</option>)}
            </select>
            {(search || filterC !== "All" || filterW !== "All" || filterCo !== "All") && (
              <button onClick={() => { setSearch(""); setFilterC("All"); setFilterW("All"); setFilterCo("All"); }}
                style={{ ...selStyle, color:"#dc2626", borderColor:"#fca5a5", background:"#fef2f2" }}>
                Clear
              </button>
            )}
            <span style={{ fontSize:12, color:"#9ca3af", marginLeft:"auto" }}>{filtered.length} of {total}</span>
          </div>

          {view === "cards" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(215px,1fr))", gap:12 }}>
              {filtered.map(d => <BCard key={d.rank} person={d} />)}
              {filtered.length === 0 && (
                <div style={{ gridColumn:"1/-1", textAlign:"center", padding:56, color:"#9ca3af", fontSize:14 }}>No results.</div>
              )}
            </div>
          )}

          {view === "table" && (
            <div style={{ borderRadius:20, border:"1px solid #e5e7eb", overflow:"hidden", background:"#fff", boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ maxHeight:540, overflowY:"auto", overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:880 }}>
                  <thead>
                    <tr>
                      {([["rank","#"],["name","Name"],["company","Company"],["age","Age"],["netWorthB","Net Worth"],["wealthType","Type"],["country","Country"],["sector","Sector"]] as [SK, string][]).map(([k, l]) => (
                        <th key={k} onClick={() => handleSort(k)} style={thS(k)}>{l}<SortIcon dir={sortK === k ? sortD : null} /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d, i) => (
                      <tr key={d.rank} className="row-hover" style={{ background:i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ ...tdS, width:44 }}>
                          {d.rank <= 3
                            ? <span style={{ fontSize:15 }}>{["🥇","🥈","🥉"][d.rank - 1]}</span>
                            : <span style={{ color:"#9ca3af", fontVariantNumeric:"tabular-nums" }}>{d.rank}</span>}
                        </td>
                        <td style={{ ...tdS, fontWeight:700, color:"#111827", whiteSpace:"nowrap" }}>{d.name}</td>
                        <td style={{ ...tdS, whiteSpace:"nowrap", color:"#374151" }}>{d.company}</td>
                        <td style={{ ...tdS, textAlign:"center" as const, color:"#6b7280", fontVariantNumeric:"tabular-nums" }}>{d.age}</td>
                        <td style={{ ...tdS, fontWeight:800, color:"#059669", whiteSpace:"nowrap", fontSize:14 }}>{fmt(d.netWorthB)}</td>
                        <td style={tdS}><Badge label={d.wealthType} color={d.wealthType === "Inherited" ? INH : SM} /></td>
                        <td style={{ ...tdS, whiteSpace:"nowrap" }}>{flag(d.country)} {d.country}</td>
                        <td style={tdS}><SectorChip sector={d.sector} /></td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign:"center", padding:52, color:"#9ca3af", fontSize:14 }}>No results.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop:"1px solid #e5e7eb", padding:"18px 40px", background:"#fff" }}>
        <div style={{ maxWidth:1300, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <span style={{ fontSize:12, color:"#9ca3af" }}>Forbes 2026 Under-30 Billionaires · Data as of May 2026</span>
          <div style={{ display:"flex", gap:20 }}>
            <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer"
              style={{ fontSize:12, color:"#6b7280", textDecoration:"none", fontWeight:500 }}>𝕏 @Trace_Cohen</a>
            <a href="mailto:t@nyvp.com"
              style={{ fontSize:12, color:"#6b7280", textDecoration:"none", fontWeight:500 }}>t@nyvp.com</a>
          </div>
        </div>
      </div>

    </div>
  );
}
