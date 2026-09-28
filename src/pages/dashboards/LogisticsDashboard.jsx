import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import Badge from "../../components/Badge";
import TopDownVesselIcon from "../../components/VesselIcons";
import { Link, useNavigate } from "react-router-dom";
import { 
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";
import { 
  ClipboardList, TrendingUp, TrendingDown, Ship, Anchor, AlertTriangle, 
  DollarSign, CheckCircle2, ChevronRight, ArrowUpRight, Sparkles, Trophy, Award, Navigation 
} from "lucide-react";

export default function LogisticsDashboard() {
  const nav = useNavigate();
  const [summary, setSummary] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [matchingData, setMatchingData] = useState(null);

  useEffect(() => {
    api.get("/dashboard/summary").then(r => setSummary(r.data)).catch(() => {});
    api.get("/analytics/freight-forecast", { params: { destinationPort: "Paradip", vesselClass: "Panamax" } })
      .then(r => setForecastData(r.data)).catch(() => {});
    api.post("/analytics/vessel-matching", { destinationPort: "Paradip", cargoQuantity: 70000, preferredVesselCategory: "Panamax" })
      .then(r => setMatchingData(r.data)).catch(() => {});
  }, []);

  if (!summary || !forecastData || !matchingData) {
    return <div className="text-slate-500 font-mono py-12 text-center">Loading Logistics & Procurement Workspace…</div>;
  }

  const chartSeries = forecastData.series.slice(-24); // 14 past + 10 future

  return (
    <div className="space-y-6" data-testid="logistics-dashboard">
      {/* Role Workspace Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-900 text-white uppercase font-mono tracking-wider">
              Procurement & Chartering Decision Hub
            </span>
            <span className="astra-sim-tag">SIMULATED / PROTOTYPE DATA</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Logistics & Freight Procurement
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Optimize charter fixture timing, evaluate landed voyage costs, and mitigate port delay risks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/scenarios" className="btn-secondary">
            View Scenarios
          </Link>
          <Link to="/new-requirement" className="btn-primary" data-testid="new-req-btn">
            <ClipboardList size={16} /> New Cargo Requirement
          </Link>
        </div>
      </div>

      {/* TOP 6 PROCUREMENT KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Active Requirements" value="12" sub="in fixture pipeline" icon={ClipboardList} accent="text-blue-900" />
        <KpiCard label="Spot Forecast" value={`$${forecastData.currentRate}/t`} sub="Panamax Newcastle ➔ Paradip" icon={TrendingUp} accent="text-violet-700" />
        <KpiCard label="Recommended Vessels" value="4 Ready" sub="100% Port Compatible" icon={Ship} accent="text-emerald-600" />
        <KpiCard label="High-Risk Routes" value="2 Alerts" sub="Monsoon / Congestion" icon={AlertTriangle} accent="text-red-600" />
        <KpiCard label="Port Congestion" value="3 High" sub="Chennai, Kolkata, Haldia" icon={Anchor} accent="text-amber-600" />
        <KpiCard label="Est. Cost Savings" value="$148,000" sub="via ASTRA Optimization" icon={DollarSign} accent="text-emerald-700" />
      </div>

      {/* MAIN ROW: FREIGHT INTELLIGENCE + DECISION CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Freight Forecast Curve */}
        <div className="astra-card astra-card-p lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Badge kind="ML" />
                <span className="font-extrabold text-slate-900 text-lg" style={{ fontFamily: "Manrope" }}>
                  Freight Rate Trajectory: Newcastle ➔ Paradip (Panamax)
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Historical Spot Rate vs. ASTRA AI Projected 14-Day Forward Curve ($ USD / Metric Ton)
              </div>
            </div>
            <Link to="/freight-forecast" className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1">
              Deep Analytics <ArrowUpRight size={14} />
            </Link>
          </div>

          {/* Large High-Density Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartSeries} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748B", fontFamily: "JetBrains Mono" }} dy={5} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: "#64748B", fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip contentStyle={{ fontSize: 12, fontFamily: "JetBrains Mono" }} formatter={(val) => [`$${val}/t`, 'Rate']} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Sans" }} />
                <Area type="monotone" dataKey="confidenceUpper" name="95% Confidence Band" stroke="none" fill="url(#forecastGlow)" />
                <Line type="monotone" dataKey="actual" name="Actual Historical Spot" stroke="#1E3A8A" strokeWidth={3} dot={{ r: 2.5 }} />
                <Line type="monotone" dataKey="predicted" name="AI Projected Forecast" stroke="#8B5CF6" strokeWidth={3} strokeDasharray="5 4" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center font-mono text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <div className="text-[9px] uppercase text-slate-400 font-bold">CURRENT SPOT</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">${forecastData.currentRate}/t</div>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <div className="text-[9px] uppercase text-slate-400 font-bold">14-DAY FORECAST</div>
              <div className="font-bold text-violet-700 text-sm mt-0.5">${forecastData.predictedRate}/t</div>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <div className="text-[9px] uppercase text-slate-400 font-bold">MODEL ACCURACY (R²)</div>
              <div className="font-bold text-emerald-700 text-sm mt-0.5">0.946 (MAE $0.42)</div>
            </div>
          </div>
        </div>

        {/* Right Col: DECISION CENTER */}
        <div className="astra-card astra-card-p flex flex-col justify-between border-2 border-blue-900/40 bg-gradient-to-b from-blue-50/40 via-white to-white space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                <span className="font-extrabold text-slate-900 text-sm" style={{ fontFamily: "Manrope" }}>
                  ASTRA DECISION CENTER
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                94% CONFIDENCE
              </span>
            </div>

            {/* Recommendation Hero Box */}
            <div className="mt-4 p-4 rounded-xl bg-emerald-600 text-white shadow-md text-center space-y-1">
              <div className="text-[10px] uppercase tracking-widest font-mono font-bold text-emerald-200">
                RECOMMENDED ACTION
              </div>
              <div className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "Manrope" }}>
                BUY NOW
              </div>
              <div className="text-xs text-emerald-100 font-medium">
                Fix spot charter within next 48h to beat projected +7.4% market tightening.
              </div>
            </div>

            {/* Visual Evidence Chips */}
            <div className="space-y-2 mt-4">
              <div className="text-[11px] uppercase font-mono font-bold text-slate-500">Decision Evidence Matrix:</div>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <EvidenceChip label="Freight Trend" value="↑ BULLISH" color="text-red-700 bg-red-50 border-red-200" />
                <EvidenceChip label="Anchorage Wait" value="↓ 12h (LOW)" color="text-emerald-700 bg-emerald-50 border-emerald-200" />
                <EvidenceChip label="Idle-Risk" value="LOW (0.22)" color="text-emerald-700 bg-emerald-50 border-emerald-200" />
                <EvidenceChip label="Port Limits" value="✓ COMPATIBLE" color="text-emerald-700 bg-emerald-50 border-emerald-200" />
                <EvidenceChip label="Delivery Feas." value="✓ ON TIME" color="text-emerald-700 bg-emerald-50 border-emerald-200" />
                <EvidenceChip label="Bunker Index" value="$585/t VLSFO" color="text-slate-700 bg-slate-100 border-slate-200" />
              </div>
            </div>
          </div>

          <button 
            onClick={() => nav("/route-intelligence")}
            className="btn-primary w-full py-2.5 justify-center text-sm"
          >
            Execute Decision Workflow <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: RECOMMENDED CANDIDATE VESSELS */}
      <div className="astra-card astra-card-p space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge kind="OPTIMIZATION" />
              <span className="font-extrabold text-slate-900 text-lg" style={{ fontFamily: "Manrope" }}>
                Top Ranked Candidate Vessels (Pareto Optimal)
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Ranked by Lowest Total Landed Cost (Freight + Fuel Burn + Port Waiting Demurrage Proxy)
            </div>
          </div>
          <Link to="/vessel-matching" className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1">
            Compare All Candidates ({matchingData.ranked.length}) <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* 4 Horizontal Candidate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {matchingData.ranked.slice(0, 4).map((cand, idx) => {
            const isBest = idx === 0;
            return (
              <div 
                key={cand.vessel.vesselId} 
                className={`border rounded-xl p-3.5 space-y-3 transition-all hover:shadow-md cursor-pointer ${
                  isBest 
                    ? "border-emerald-500 bg-gradient-to-b from-emerald-50/40 to-white shadow-sm" 
                    : "border-slate-200 bg-white"
                }`}
                onClick={() => nav("/vessel-matching")}
              >
                {/* Header with Vessel Graphic */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <TopDownVesselIcon category={cand.vessel.category} size={22} />
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">{cand.vessel.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{cand.vessel.category} · {cand.vessel.dwtTons.toLocaleString()} DWT</div>
                    </div>
                  </div>
                  {isBest && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white font-mono uppercase">
                      #1 BEST
                    </span>
                  )}
                </div>

                {/* Landed Cost Metric */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center font-mono">
                  <div className="text-[9px] uppercase text-slate-400 font-bold">TOTAL LANDED VOYAGE COST</div>
                  <div className="text-xl font-extrabold text-blue-900 mt-0.5">
                    ${Number(cand.totalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Base: ${cand.predictedFreightUsdPerTon}/t · Wait: {cand.waitingHours}h
                  </div>
                </div>

                {/* Compatibility & Risk Badges */}
                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> {cand.capacityUtilization}% Util.
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    cand.risk === "HIGH" ? "bg-red-50 text-red-700 border border-red-200" :
                    cand.risk === "MEDIUM" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                    "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {cand.risk} RISK
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, icon: Icon, accent = "text-blue-900" }) {
  return (
    <div className="astra-card astra-card-p">
      <div className="flex items-center justify-between">
        <div className="astra-label">{label}</div>
        <Icon size={16} className={accent} strokeWidth={2} />
      </div>
      <div className="astra-metric mt-1.5 font-mono">{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5 font-sans">{sub}</div>}
    </div>
  );
}

function EvidenceChip({ label, value, color }) {
  return (
    <div className={`p-1.5 rounded border text-center ${color}`}>
      <div className="text-[9px] uppercase font-bold opacity-75">{label}</div>
      <div className="font-extrabold text-[11px] mt-0.5">{value}</div>
    </div>
  );
}
