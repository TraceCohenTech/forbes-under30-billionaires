/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";
import { under30Billionaires2026, type Billionaire } from "./data";

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  blue:   "#1d4ed8",
  green:  "#059669",
  red:    "#dc2626",
  teal:   "#0d9488",
  indigo: "#4f46e5",
  cyan:   "#0891b2",
  slate:  "#475569",
};

// Inherited = red (establishment, heritage), Self-made = blue (tech, innovation)
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

// Hall of fame rank configs (no purple on text)
const RANK_CFG = [
  { bg:"linear-gradient(145deg,#140e00,#2d1f00,#140e00)", border:"rgba(240,192,64,0.5)",  glow:"rgba(240,192,64,0.18)",   accent:"#f0c040", tag:"#1 · Gold"     },
  { bg:"linear-gradient(145deg,#0d1117,#1c2430,#0d1117)", border:"rgba(185,195,215,0.45)", glow:"rgba(185,195,215,0.12)", accent:"#b9c3d7", tag:"#2 · Silver"   },
  { bg:"linear-gradient(145deg,#130b00,#251500,#130b00)", border:"rgba(188,120,70,0.45)",  glow:"rgba(188,120,70,0.12)",  accent:"#bc7846", tag:"#3 · Bronze"   },
  { bg:"linear-gradient(145deg,#050d1e,#0d1f3c,#050d1e)", border:"rgba(29,78,216,0.5)",   glow:"rgba(29,78,216,0.15)",   accent:"#3b82f6", tag:"#4"            },
  { bg:"linear-gradient(145deg,#030e1a,#071e30,#030e1a)", border:"rgba(8,145,178,0.5)",   glow:"rgba(8,145,178,0.15)",   accent:"#22d3ee", tag:"#5"            },
];

// ── Base styles ───────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  padding: "20px 22px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
};
const ttStyle = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  fontSize: 12,
  color: "#111827",
  padding: "10px 14px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.09)",
};
const selStyle: React.CSSProperties = {
  padding: "7px 10px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  color: "#374151",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  cursor: "pointer",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v: number) => `$${v.toFixed(1)}B`;
const flag = (c: string) => FLAGS[c] ?? "";
const secCol = (s: string) => SEC_COL[s] ?? "#6b7280";

// ── Animated counter ──────────────────────────────────────────────────────────
function useCountUp(target: number, ms = 1500, dec = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let t0: number | null = null;
    let id: number;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / ms, 1);
      setVal(+(target * (1 - Math.pow(1 - p, 3))).toFixed(dec));
      if (p < 1) { id = requestAnimationFrame(tick); }
      else setVal(target);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, ms, dec]);
  return val;
}

// ── Atoms ─────────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display:"inline-block", padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700, background:`${color}15`, color, letterSpacing:"0.02em" }}>
      {label}
    </span>
  );
}

function SectorChip({ sector }: { sector: string }) {
  const col = secCol(sector);
  return (
    <span style={{ display:"inline-block", padding:"2px 7px", borderRadius:5, fontSize:10, fontWeight:600, background:`${col}12`, color:col, border:`1px solid ${col}25` }}>
      {sector}
    </span>
  );
}

function SectionLabel({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom:28, paddingBottom:20, borderBottom:"2px solid #e5e7eb" }}>
      <h2 style={{ fontSize:28, fontWeight:800, color:"#0f172a", margin:0, letterSpacing:"-0.025em", lineHeight:1.2 }}>{title}</h2>
      {subtitle && <p style={{ fontSize:14, color:"#6b7280", margin:"7px 0 0", lineHeight:1.5 }}>{subtitle}</p>}
    </div>
  );
}

function ChartCard({ title, children, height=260, accent }: { title:string; children:React.ReactNode; height?:number; accent?:string }) {
  return (
    <div style={card}>
      <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:16 }}>
        {accent && <div style={{ width:3, height:13, borderRadius:2, background:accent, flexShrink:0 }} />}
        <span style={{ fontSize:11, fontWeight:700, color:"#9ca3af", textTransform:"uppercase" as const, letterSpacing:"0.08em" }}>{title}</span>
      </div>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

// Dark glass stat card
function DarkStat({ label, value, accent, sub }: { label:string; value:string; accent:string; sub?:string }) {
  return (
    <div className="card-lift" style={{
      background:"linear-gradient(145deg,#0f172a,#1a2744)",
      borderRadius:16, border:"1px solid rgba(255,255,255,0.08)",
      padding:"18px 20px", position:"relative", overflow:"hidden",
      boxShadow:"0 4px 20px rgba(0,0,0,0.18)",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:accent }} />
      <div style={{ fontSize:24, fontWeight:900, color:accent, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:6, fontWeight:500 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:3 }}>{sub}</div>}
    </div>
  );
}

// Light stat card
function LightStat({ label, value, color, sub }: { label:string; value:string; color:string; sub?:string }) {
  return (
    <div className="card-lift" style={{ ...card, padding:"16px 20px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`${color}50` }} />
      <div style={{ fontSize:21, fontWeight:800, color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:12, color:"#6b7280", marginTop:5, fontWeight:500 }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// Hall of Fame card
function HallCard({ person, rank }: { person:Billionaire; rank:number }) {
  const cfg = RANK_CFG[rank - 1] ?? RANK_CFG[4];
  return (
    <div className="hall-card" style={{
      background:cfg.bg, border:`1px solid ${cfg.border}`,
      borderRadius:18, padding:"26px 24px 22px",
      minWidth:235, maxWidth:260, flexShrink:0,
      position:"relative", overflow:"hidden",
      boxShadow:`0 0 40px ${cfg.glow}, 0 6px 28px rgba(0,0,0,0.3)`,
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,transparent,${cfg.accent},transparent)` }} />
      <div style={{ position:"absolute", top:-60, right:-60, width:180, height:180, borderRadius:"50%", background:`radial-gradient(circle,${cfg.glow} 0%,transparent 70%)`, pointerEvents:"none" }} />

      {/* Tag */}
      <div style={{ fontSize:11, fontWeight:800, color:cfg.accent, letterSpacing:"0.1em", textTransform:"uppercase" as const, marginBottom:14 }}>{cfg.tag}</div>

      {/* Name */}
      <div style={{ fontSize:16, fontWeight:800, color:"#f8fafc", lineHeight:1.25, marginBottom:3 }}>{person.name}</div>
      <div style={{ fontSize:12, color:"rgba(248,250,252,0.4)", marginBottom:18 }}>{person.company}</div>

      {/* Net worth */}
      <div style={{ fontSize:32, fontWeight:900, color:cfg.accent, lineHeight:1, letterSpacing:"-0.03em", marginBottom:18 }}>{fmt(person.netWorthB)}</div>

      {/* Meta */}
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <Badge label={person.wealthType} color={person.wealthType==="Inherited"?INH:SM} />
        <span style={{ fontSize:12, color:"rgba(248,250,252,0.4)" }}>Age {person.age}</span>
        <span style={{ fontSize:16 }}>{flag(person.country)}</span>
      </div>
    </div>
  );
}

// Mosaic card
function BCard({ person }: { person:Billionaire }) {
  const tc = person.wealthType==="Inherited" ? INH : SM;
  return (
    <div className="mosaic-card" style={{ ...card, padding:"14px 16px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${tc},${tc}66)` }} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:11, color:"#9ca3af", fontWeight:700 }}>#{person.rank}</span>
        <span style={{ fontSize:14 }}>{flag(person.country)}</span>
      </div>
      <div style={{ fontSize:14, fontWeight:800, color:"#111827", lineHeight:1.25, marginBottom:2 }}>{person.name}</div>
      <div style={{ fontSize:12, color:"#6b7280", marginBottom:10 }}>{person.company}</div>
      <div style={{ fontSize:22, fontWeight:900, color:C.green, letterSpacing:"-0.02em", marginBottom:10 }}>{fmt(person.netWorthB)}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, flexWrap:"wrap" }}>
        <Badge label={person.wealthType} color={tc} />
        <span style={{ fontSize:11, color:"#9ca3af" }}>Age {person.age}</span>
      </div>
      <SectorChip sector={person.sector} />
    </div>
  );
}

type SK = keyof Billionaire;
function SortIcon({ dir }: { dir:"asc"|"desc"|null }) {
  if (!dir) return <span style={{ marginLeft:4, opacity:0.2, fontSize:10 }}>⇅</span>;
  return <span style={{ marginLeft:4, fontSize:10, color:C.blue }}>{dir==="asc"?"▲":"▼"}</span>;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const data = under30Billionaires2026;

  const [search, setSearch]     = useState("");
  const [filterC, setFilterC]   = useState("All");
  const [filterW, setFilterW]   = useState("All");
  const [filterCo, setFilterCo] = useState("All");
  const [view, setView]         = useState<"cards"|"table">("cards");
  const [sortK, setSortK]       = useState<SK>("rank");
  const [sortD, setSortD]       = useState<"asc"|"desc">("asc");

  const countries = useMemo(()=>["All",...Array.from(new Set(data.map(d=>d.country))).sort()],[data]);
  const companies = useMemo(()=>["All",...Array.from(new Set(data.map(d=>d.company))).sort()],[data]);

  // Stats
  const total    = data.length;
  const smCount  = data.filter(d=>d.wealthType==="Self-made").length;
  const inhCount = data.filter(d=>d.wealthType==="Inherited").length;
  const totalNW  = data.reduce((s,d)=>s+d.netWorthB,0);
  const avgAge   = data.reduce((s,d)=>s+d.age,0)/data.length;
  const avgNW    = totalNW/data.length;
  const youngest = data.reduce((a,b)=>a.age<b.age?a:b);
  const richest  = data.reduce((a,b)=>a.netWorthB>b.netWorthB?a:b);
  const smNW     = data.filter(d=>d.wealthType==="Self-made").reduce((s,d)=>s+d.netWorthB,0);
  const inhNW    = data.filter(d=>d.wealthType==="Inherited").reduce((s,d)=>s+d.netWorthB,0);

  // Animated counters
  const aNW    = useCountUp(totalNW, 1800, 1);
  const aTotal = useCountUp(total, 1200);

  // Chart data
  const splitData  = [{ name:"Inherited", value:inhCount },{ name:"Self-made", value:smCount }];
  const avgByType  = [
    { type:"Inherited", avg:+(inhNW/inhCount).toFixed(2) },
    { type:"Self-made",  avg:+(smNW/smCount).toFixed(2) },
  ];
  const ageGroups = [
    { range:"20–22", count:data.filter(d=>d.age<=22).length },
    { range:"23–25", count:data.filter(d=>d.age>=23&&d.age<=25).length },
    { range:"26–28", count:data.filter(d=>d.age>=26&&d.age<=28).length },
    { range:"29",    count:data.filter(d=>d.age===29).length },
  ];
  const countryData = useMemo(()=>{
    const m: Record<string,{count:number;worth:number}> = {};
    data.forEach(d=>{ if(!m[d.country]) m[d.country]={count:0,worth:0}; m[d.country].count++; m[d.country].worth+=d.netWorthB; });
    return Object.entries(m)
      .map(([country,v])=>({ country, label:`${flag(country)} ${country}`, count:v.count, worth:+v.worth.toFixed(1) }))
      .sort((a,b)=>b.count-a.count);
  },[data]);
  const companyData = useMemo(()=>{
    const m: Record<string,{count:number;worth:number}> = {};
    data.forEach(d=>{ if(!m[d.company]) m[d.company]={count:0,worth:0}; m[d.company].count++; m[d.company].worth+=d.netWorthB; });
    return Object.entries(m).map(([company,v])=>({ company, count:v.count, worth:+v.worth.toFixed(1) })).sort((a,b)=>b.worth-a.worth);
  },[data]);
  const top20 = useMemo(()=>
    [...data].sort((a,b)=>b.netWorthB-a.netWorthB).slice(0,20)
      .map(d=>({ name:d.name.split(" ").slice(-1)[0], full:d.name, worth:d.netWorthB, type:d.wealthType })),
  [data]);

  const handleSort = useCallback((k:SK)=>{
    setSortD(prev=>sortK===k?(prev==="asc"?"desc":"asc"):"asc");
    setSortK(k);
  },[sortK]);

  const filtered = useMemo(()=>{
    const q = search.toLowerCase();
    return data.filter(d=>{
      if(filterC!=="All"&&d.country!==filterC) return false;
      if(filterW!=="All"&&d.wealthType!==filterW) return false;
      if(filterCo!=="All"&&d.company!==filterCo) return false;
      if(q&&!d.name.toLowerCase().includes(q)&&!d.company.toLowerCase().includes(q)&&!d.country.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a,b)=>{
      const av=a[sortK],bv=b[sortK];
      if(typeof av==="number"&&typeof bv==="number") return sortD==="asc"?av-bv:bv-av;
      return sortD==="asc"?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av));
    });
  },[data,search,filterC,filterW,filterCo,sortK,sortD]);

  const thS = (k:SK): React.CSSProperties => ({
    textAlign:"left", fontSize:11, fontWeight:700, textTransform:"uppercase",
    letterSpacing:"0.06em", color:sortK===k?C.blue:"#9ca3af",
    padding:"11px 14px", borderBottom:"1px solid #f3f4f6",
    whiteSpace:"nowrap", cursor:"pointer", userSelect:"none",
    background:"#fff", position:"sticky", top:0, zIndex:10,
  });
  const tdS: React.CSSProperties = {
    padding:"12px 14px", borderBottom:"1px solid #f9fafb",
    fontSize:13, color:"#374151", verticalAlign:"middle",
  };

  const insights = [
    { color:INH,    icon:"👑", title:"Inherited wealth dominates the top",   body:"25 of 35 billionaires (71%) inherited their wealth. EssilorLuxottica and Boehringer Ingelheim heirs account for $47.4B — more than the entire self-made cohort combined." },
    { color:SM,     icon:"🤖", title:"AI & fintech own self-made wealth",     body:"Every self-made billionaire built in AI (Scale AI, Cursor, Mercor, Lovable) or prediction markets (Kalshi, Polymarket). Zero self-made wealth exists outside of tech." },
    { color:C.green,icon:"🇩🇪", title:"Germany leads inherited concentration", body:"German heirs hold $33.7B across Boehringer Ingelheim (×4), dm-drogerie markt, Stihl, and Cordes & Graefe — the most concentrated inherited wealth of any country." },
    { color:C.cyan, icon:"🚀", title:"Six companies, $21.7B, 12 founders",   body:"Cursor (4 founders), Mercor (3), Kalshi (2), Polymarket, Lovable, Scale AI — all 12 self-made billionaires under 30 came from this remarkably tight cluster." },
  ];

  const top5 = [...data].sort((a,b)=>a.rank-b.rank).slice(0,5);

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{
        background:"linear-gradient(160deg,#010c1e 0%,#041532 25%,#0a2456 55%,#123580 80%,#1d4ed8 100%)",
        padding:"44px 0 52px",
        position:"relative",
        overflow:"hidden",
      }}>
        {/* Subtle grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }} />
        {/* Faint gold bloom top-right */}
        <div style={{ position:"absolute", top:-120, right:0, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(240,192,64,0.07) 0%,transparent 65%)", pointerEvents:"none" }} />

        <div style={{ maxWidth:1300, margin:"0 auto", padding:"0 40px", position:"relative" }}>

          {/* Overline */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:"#f0c040", boxShadow:"0 0 10px rgba(240,192,64,0.8)" }} />
            <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase" }}>Forbes · 2026 Edition</span>
          </div>

          {/* Title row */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:24, marginBottom:20 }}>
            <h1 style={{ fontSize:54, fontWeight:900, letterSpacing:"-0.04em", lineHeight:1, margin:0 }}>
              <span className="gold-shimmer">Under-30&nbsp;</span>
              <span style={{ color:"#fff" }}>Billionaires</span>
            </h1>
            {/* Wealth type split — clean, right-aligned */}
            <div style={{ display:"flex", flexDirection:"column", gap:6, alignSelf:"flex-end", paddingBottom:4 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:INH, boxShadow:`0 0 7px ${INH}` }} />
                <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{inhCount} Inherited</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>{fmt(inhNW)}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#60a5fa", boxShadow:"0 0 7px rgba(96,165,250,0.8)" }} />
                <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{smCount} Self-made</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>{fmt(smNW)}</span>
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div style={{ fontSize:14, color:"rgba(255,255,255,0.55)", marginBottom:32 }}>
            <span style={{ color:"rgba(255,255,255,0.85)", fontWeight:600 }}>{aTotal}</span> billionaires ·{" "}
            <span style={{ color:"rgba(255,255,255,0.85)", fontWeight:600 }}>${aNW.toFixed(1)}B</span> combined net worth · Ages 20–29 · Data as of May 2026
          </div>

          {/* Stat chips */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[
              { v:`$${aNW.toFixed(1)}B`,        l:"Combined NW", a:"#f0c040" },
              { v:fmt(richest.netWorthB),         l:"Highest NW",  a:"#f0c040" },
              { v:fmt(inhNW),                     l:"Inherited $",  a:INH       },
              { v:fmt(smNW),                      l:"Self-made $",  a:"#60a5fa" },
              { v:fmt(avgNW),                     l:"Average NW",  a:C.green   },
              { v:`${avgAge.toFixed(1)} yrs`,      l:"Avg Age",    a:C.cyan    },
            ].map((s,i)=>(
              <div key={i} className="hero-chip">
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:s.a }} />
                <div style={{ fontSize:16, fontWeight:800, color:s.a }}>{s.v}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", marginTop:3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HALL OF FAME ─────────────────────────────────────────────────── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"30px 40px 34px" }}>
        <div style={{ maxWidth:1300, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:20 }}>
            <span style={{ fontSize:16, fontWeight:800, color:"#111827" }}>🏆 Hall of Fame</span>
            <span style={{ fontSize:12, color:"#9ca3af" }}>— The five wealthiest people under 30 on earth</span>
          </div>
          <div style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:4 }}>
            {top5.map(p=><HallCard key={p.rank} person={p} rank={p.rank} />)}
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:1300, margin:"0 auto", padding:"32px 40px 72px", display:"flex", flexDirection:"column", gap:32 }} className="fade-up">

        {/* Stat grid: 4 dark + 4 light */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:12 }}>
          <DarkStat label="Combined Net Worth"   value={`$${aNW.toFixed(1)}B`} accent="#f0c040" />
          <DarkStat label="Inherited Wealth"     value={fmt(inhNW)}             accent={INH}      sub={`${inhCount} people · ${((inhCount/total)*100).toFixed(0)}%`} />
          <DarkStat label="Self-made Wealth"     value={fmt(smNW)}              accent="#60a5fa"  sub={`${smCount} people · ${((smCount/total)*100).toFixed(0)}%`} />
          <DarkStat label="Richest Under-30"     value={fmt(richest.netWorthB)} accent="#f0c040"  sub={richest.name} />
          <LightStat label="Total Billionaires"   value={String(total)}                            color={C.blue}   />
          <LightStat label="Average Age"          value={`${avgAge.toFixed(1)} yrs`}               color={C.cyan}   />
          <LightStat label="Average Net Worth"    value={fmt(avgNW)}                               color={C.green}  />
          <LightStat label="Youngest" value={`${youngest.name.split(" ")[0]}, ${youngest.age}`}    color={C.slate}  sub={youngest.company} />
        </div>

        {/* Charts R1 */}
        <div>
          <SectionLabel title="Wealth Breakdown" subtitle="Origin split, average net worth by type, and age spread" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>

            <ChartCard title="Inherited vs. Self-made" accent={INH}>
              <div style={{ position:"relative", height:"100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={splitData} dataKey="value" cx="50%" cy="50%"
                      outerRadius={90} innerRadius={50} paddingAngle={3}
                      label={({ name, percent }:{name?:string;percent?:number})=>`${name??""} ${((percent??0)*100).toFixed(0)}%`}
                      labelLine={{ stroke:"#d1d5db" }}
                    >
                      <Cell fill={INH} /><Cell fill={SM} />
                    </Pie>
                    <Tooltip contentStyle={ttStyle} formatter={(v:any)=>[v,"People"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
                  <div style={{ fontSize:22, fontWeight:900, color:"#111827", lineHeight:1 }}>{total}</div>
                  <div style={{ fontSize:10, color:"#9ca3af", marginTop:2 }}>total</div>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Avg Net Worth by Type" accent={C.green}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgByType} margin={{ top:8,right:12,bottom:8,left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="type" tick={{ fill:"#6b7280",fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#9ca3af",fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}B`} />
                  <Tooltip contentStyle={ttStyle} formatter={(v:any)=>[`$${v}B`,"Avg Net Worth"]} />
                  <Bar dataKey="avg" radius={[6,6,0,0]} maxBarSize={80}>
                    <Cell fill={INH} /><Cell fill={SM} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Age Distribution" accent={C.cyan}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageGroups} margin={{ top:8,right:12,bottom:8,left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="range" tick={{ fill:"#6b7280",fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:"#9ca3af",fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={ttStyle} formatter={(v:any)=>[v,"People"]} />
                  <Bar dataKey="count" fill={C.cyan} radius={[6,6,0,0]} maxBarSize={80} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* Charts R2 */}
        <div>
          <SectionLabel title="By Country" subtitle="Billionaires and combined net worth — flag emojis included" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <ChartCard title="Billionaires by Country" height={310} accent={C.blue}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical" margin={{ top:4,right:20,bottom:4,left:116 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill:"#9ca3af",fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="label" type="category" tick={{ fill:"#374151",fontSize:12 }} axisLine={false} tickLine={false} width={116} />
                  <Tooltip contentStyle={ttStyle} formatter={(v:any)=>[v,"Billionaires"]} />
                  <Bar dataKey="count" radius={[0,5,5,0]} maxBarSize={20}>
                    {countryData.map((_,i)=><Cell key={i} fill={CHART_PAL[i%CHART_PAL.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Combined Net Worth by Country" height={310} accent={C.green}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...countryData].sort((a,b)=>b.worth-a.worth)} layout="vertical" margin={{ top:4,right:20,bottom:4,left:116 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill:"#9ca3af",fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}B`} />
                  <YAxis dataKey="label" type="category" tick={{ fill:"#374151",fontSize:12 }} axisLine={false} tickLine={false} width={116} />
                  <Tooltip contentStyle={ttStyle} formatter={(v:any)=>[`$${v}B`,"Net Worth"]} />
                  <Bar dataKey="worth" radius={[0,5,5,0]} maxBarSize={20}>
                    {[...countryData].sort((a,b)=>b.worth-a.worth).map((_,i)=><Cell key={i} fill={CHART_PAL[i%CHART_PAL.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* Charts R3 */}
        <div>
          <SectionLabel title="By Individual & Company" subtitle="Red = inherited · Blue = self-made" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <ChartCard title="Net Worth — Top 20 Individuals" height={450} accent={INH}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top20} layout="vertical" margin={{ top:4,right:20,bottom:4,left:98 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill:"#9ca3af",fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}B`} />
                  <YAxis dataKey="name" type="category" tick={{ fill:"#374151",fontSize:11 }} axisLine={false} tickLine={false} width={98} />
                  <Tooltip contentStyle={ttStyle}
                    content={({ active,payload })=>{
                      if(!active||!payload?.length) return null;
                      const d=payload[0].payload;
                      return (
                        <div style={ttStyle}>
                          <div style={{ fontWeight:700, marginBottom:5 }}>{d.full}</div>
                          <Badge label={d.type} color={d.type==="Inherited"?INH:SM} />
                          <div style={{ marginTop:6, fontWeight:800, color:C.green, fontSize:14 }}>${d.worth}B</div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="worth" radius={[0,5,5,0]} maxBarSize={17}>
                    {top20.map((d,i)=><Cell key={i} fill={d.type==="Inherited"?INH:SM} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Combined Net Worth by Company" height={450} accent={C.blue}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData} layout="vertical" margin={{ top:4,right:20,bottom:4,left:138 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                  <XAxis type="number" tick={{ fill:"#9ca3af",fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}B`} />
                  <YAxis dataKey="company" type="category" tick={{ fill:"#374151",fontSize:11 }} axisLine={false} tickLine={false} width={138} />
                  <Tooltip contentStyle={ttStyle} formatter={(v:any)=>[`$${v}B`,"Net Worth"]} />
                  <Bar dataKey="worth" radius={[0,5,5,0]} maxBarSize={17}>
                    {companyData.map((_,i)=><Cell key={i} fill={CHART_PAL[i%CHART_PAL.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* Insights */}
        <div>
          <SectionLabel title="Key Insights" subtitle="Patterns and takeaways from the 2026 cohort" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {insights.map((ins,i)=>(
              <div key={i} className="card-lift" style={{ ...card, borderLeft:`4px solid ${ins.color}`, borderRadius:14, padding:"16px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
                  <span style={{ fontSize:17 }}>{ins.icon}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:"#111827", letterSpacing:"-0.01em" }}>{ins.title}</span>
                </div>
                <div style={{ fontSize:13, color:"#6b7280", lineHeight:1.7 }}>{ins.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All 35 */}
        <div>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:14 }}>
            <SectionLabel title="All 35 Billionaires" subtitle="Filter and explore the full cohort" />
            <div style={{ display:"flex", background:"#f3f4f6", borderRadius:9, padding:"3px", gap:2, flexShrink:0 }}>
              {(["cards","table"] as const).map(m=>(
                <button key={m} onClick={()=>setView(m)} className="view-btn" style={{
                  background:view===m?"#fff":"transparent",
                  color:view===m?"#111827":"#6b7280",
                  boxShadow:view===m?"0 1px 4px rgba(0,0,0,0.1)":"none",
                }}>
                  {m==="cards"?"🃏 Cards":"📋 Table"}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14, alignItems:"center" }}>
            <input type="text" placeholder="Search name, company, country…" value={search}
              onChange={e=>setSearch(e.target.value)} style={{ ...selStyle,width:248 }} />
            <select value={filterW}  onChange={e=>setFilterW(e.target.value)}  style={selStyle}>
              <option value="All">All wealth types</option>
              <option value="Inherited">Inherited</option>
              <option value="Self-made">Self-made</option>
            </select>
            <select value={filterC}  onChange={e=>setFilterC(e.target.value)}  style={selStyle}>
              {countries.map(c=><option key={c} value={c}>{c==="All"?"All countries":c}</option>)}
            </select>
            <select value={filterCo} onChange={e=>setFilterCo(e.target.value)} style={selStyle}>
              {companies.map(c=><option key={c} value={c}>{c==="All"?"All companies":c}</option>)}
            </select>
            {(search||filterC!=="All"||filterW!=="All"||filterCo!=="All")&&(
              <button onClick={()=>{setSearch("");setFilterC("All");setFilterW("All");setFilterCo("All");}}
                style={{ ...selStyle,color:C.red,borderColor:"#fca5a5",background:"#fef2f2" }}>
                Clear
              </button>
            )}
            <span style={{ fontSize:12,color:"#9ca3af",marginLeft:"auto" }}>{filtered.length} of {total}</span>
          </div>

          {/* Cards */}
          {view==="cards" && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(215px,1fr))", gap:12 }}>
              {filtered.map(d=><BCard key={d.rank} person={d} />)}
              {filtered.length===0&&<div style={{ gridColumn:"1/-1",textAlign:"center",padding:56,color:"#9ca3af",fontSize:14 }}>No results.</div>}
            </div>
          )}

          {/* Table */}
          {view==="table" && (
            <div style={{ borderRadius:16,border:"1px solid #e5e7eb",overflow:"hidden",background:"#fff",boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ maxHeight:540,overflowY:"auto",overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",minWidth:880 }}>
                  <thead>
                    <tr>
                      {([["rank","#"],["name","Name"],["company","Company"],["age","Age"],["netWorthB","Net Worth"],["wealthType","Type"],["country","Country"],["sector","Sector"]] as [SK,string][]).map(([k,l])=>(
                        <th key={k} onClick={()=>handleSort(k)} style={thS(k)}>{l}<SortIcon dir={sortK===k?sortD:null} /></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((d,i)=>(
                      <tr key={d.rank} className="row-hover" style={{ background:i%2===0?"#fff":"#fafafa" }}>
                        <td style={{ ...tdS,width:44 }}>
                          {d.rank<=3?<span style={{ fontSize:15 }}>{["🥇","🥈","🥉"][d.rank-1]}</span>:<span style={{ color:"#9ca3af",fontVariantNumeric:"tabular-nums" }}>{d.rank}</span>}
                        </td>
                        <td style={{ ...tdS,fontWeight:700,color:"#111827",whiteSpace:"nowrap" }}>{d.name}</td>
                        <td style={{ ...tdS,whiteSpace:"nowrap",color:"#374151" }}>{d.company}</td>
                        <td style={{ ...tdS,textAlign:"center" as const,color:"#6b7280",fontVariantNumeric:"tabular-nums" }}>{d.age}</td>
                        <td style={{ ...tdS,fontWeight:800,color:C.green,whiteSpace:"nowrap",fontSize:14 }}>{fmt(d.netWorthB)}</td>
                        <td style={tdS}><Badge label={d.wealthType} color={d.wealthType==="Inherited"?INH:SM} /></td>
                        <td style={{ ...tdS,whiteSpace:"nowrap" }}>{flag(d.country)} {d.country}</td>
                        <td style={tdS}><SectorChip sector={d.sector} /></td>
                      </tr>
                    ))}
                    {filtered.length===0&&<tr><td colSpan={8} style={{ textAlign:"center",padding:52,color:"#9ca3af",fontSize:14 }}>No results.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div style={{ borderTop:"1px solid #e5e7eb",padding:"18px 40px",background:"#fff" }}>
        <div style={{ maxWidth:1300,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12 }}>
          <span style={{ fontSize:12,color:"#9ca3af" }}>Forbes 2026 Under-30 Billionaires · Data as of May 2026</span>
          <div style={{ display:"flex",gap:20 }}>
            <a href="https://x.com/Trace_Cohen" target="_blank" rel="noopener noreferrer" style={{ fontSize:12,color:"#6b7280",textDecoration:"none",fontWeight:500 }}>𝕏 @Trace_Cohen</a>
            <a href="mailto:t@nyvp.com" style={{ fontSize:12,color:"#6b7280",textDecoration:"none",fontWeight:500 }}>t@nyvp.com</a>
          </div>
        </div>
      </div>

    </div>
  );
}
