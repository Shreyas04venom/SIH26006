import React, { useEffect, useState } from "react";
import api from "../lib/api";
import Badge from "../components/Badge";
import TopDownVesselIcon from "../components/VesselIcons";
import { useFlow } from "../lib/flow";
import { useNavigate } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";
import { Ship, Check, X, ChevronRight, Trophy, Sparkles, Fuel, Gauge, DollarSign, Award } from "lucide-react";

export default function VesselMatching() {
  const { requirement, setMatching, setSelectedVessel } = useFlow();
  const nav = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!requirement) { nav("/new-requirement"); return; }
    api.post("/analytics/vessel-matching", {
      destinationPort: requirement.destinationPort,
      cargoQuantity: requirement.cargoQuantity,
      preferredVesselCategory: requirement.preferredVesselCategory,
    }).then((r) => { setData(r.data); setMatching(r.data); });
  }, [requirement, nav, setMatching]);

  const pick = (s) => {
    setSelectedVessel(s);
    nav("/route-intelligence");
  };

  if (!requirement || !data) return (
    <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-mono gap-3">
      <Ship size={20} className="animate-spin text-blue-900" />
      <span>Optimizing fleet combinations & fuel curves…</span>
    </div>
  );

  // Prepare cost comparison chart data
  const costChartData = data.ranked.slice(0, 5).map(s => ({
    name: s.vessel.name.replace("MV ", ""),
    freight: Math.round(s.freightCost),
    fuel: Math.round(s.fuelCost),
    waiting: Math.round(s.waitingCost),
    total: Math.round(s.totalCost)
  }));

  return (
    <div className="space-y-6" data-testid="matching-page">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="OPTIMIZATION" />
            <Badge kind="RULE" />
            <span className="astra-label">Phases 6–7 · Multi-Objective Solver</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Vessel Matching & Optimization
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Global fleet candidates evaluated against port draft/LOA limits, bunker burn curves, and demurrage exposure.
          </p>
        </div>
        <div className="bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-mono text-slate-700">
          Bunker Index: <span className="font-bold text-blue-900">${data.bunkerPrice}/MT (VLSFO)</span>
        </div>
      </div>

      {/* BEST SCENARIO SPOTLIGHT CARD */}
      {data.best && (
        <div className="astra-card astra-card-p border-2 border-emerald-500 bg-gradient-to-r from-emerald-50/70 via-white to-blue-50/50 shadow-md relative overflow-hidden" data-testid="best-scenario">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                  <Trophy size={14} /> Recommended Optimal Fixture
                </span>
                <span className="text-xs text-slate-500 font-mono">Pareto Frontier Best Rank #1</span>
              </div>

              <div className="flex items-center gap-4">
                <TopDownVesselIcon category={data.best.vessel.category} size={28} />
                <div>
                  <div className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                    {data.best.vessel.name}
                  </div>
                  <div className="text-xs text-slate-600 font-mono">
                    {data.best.vessel.vesselId} · {data.best.vessel.category} · DWT {Number(data.best.vessel.dwtTons).toLocaleString()} · Max Draft {data.best.vessel.draftM}m
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                Selected not purely on lowest base freight, but by solving the lowest <strong>Total Landed Cost</strong> ($
                {Number(data.best.totalCost).toLocaleString()}) while maintaining <span className="font-mono font-bold text-emerald-800">{data.best.capacityUtilization}%</span> capacity utilization and zero physical port limit violations at {requirement.destinationPort}.
              </p>
            </div>

            {/* Metrics HUD Box */}
            <div className="grid grid-cols-2 gap-2.5 shrink-0 w-full sm:w-auto">
              <Metric label="Total Landed Cost" value={`$${Number(data.best.totalCost).toLocaleString()}`} accent="text-blue-900" />
              <Metric label="Freight Base" value={`$${data.best.predictedFreightUsdPerTon}/t`} accent="text-slate-800" />
              <Metric label="Fuel Expense" value={`$${Math.round(data.best.fuelCost).toLocaleString()}`} accent="text-amber-700" />
              <Metric label="Rule Compatibility" value="100% Passed" accent="text-emerald-700" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-mono">
              Daily Fuel: {data.best.vessel.fuelConsumptionTonsPerDay} MT/day · Speed: {data.best.vessel.speedKnots} kts
            </div>
            <button className="btn-primary" onClick={() => pick(data.best)} data-testid="pick-best">
              Use This Vessel Scenario <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Visual Cost Comparison Chart */}
      <div className="astra-card astra-card-p">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
              Total Landed Cost Comparison (Top Candidates)
            </div>
            <div className="text-xs text-slate-500">Stacked Breakdown: Base Freight Rate + Fuel Consumption + Demurrage Proxy</div>
          </div>
          <span className="text-xs font-mono text-slate-500">VALUES IN USD ($)</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569", fontFamily: "IBM Plex Sans", fontWeight: "bold" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B", fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} contentStyle={{ fontSize: 12, fontFamily: "JetBrains Mono" }} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "IBM Plex Sans" }} />
              <Bar dataKey="freight" name="Base Freight Cost" stackId="a" fill="#1E3A8A" radius={[0, 0, 0, 0]} />
              <Bar dataKey="fuel" name="Fuel Burn Cost (14d)" stackId="a" fill="#F59E0B" />
              <Bar dataKey="waiting" name="Demurrage Exposure" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All Ranked Table */}
      <div className="astra-card astra-card-p">
        <div className="astra-label mb-3">Complete Candidate Fleet Optimization Table</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-slate-500 border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Vessel Candidate</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Freight $/t</th>
                <th className="py-2.5 px-3">Fuel (14d)</th>
                <th className="py-2.5 px-3">Wait Hours</th>
                <th className="py-2.5 px-3">Total Cost</th>
                <th className="py-2.5 px-3">Util.</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Compatibility</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {data.ranked.map((s, i) => (
                <tr key={s.vessel.vesselId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-bold">{i + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2 font-sans">
                      <TopDownVesselIcon category={s.vessel.category} size={18} />
                      <span className="font-semibold text-slate-900">{s.vessel.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{s.vessel.vesselId} · DWT {s.vessel.dwtTons.toLocaleString()}</div>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-xs text-slate-700">{s.vessel.category}</td>
                  <td className="py-2.5 px-3 font-bold">${s.predictedFreightUsdPerTon}</td>
                  <td className="py-2.5 px-3">${Math.round(s.fuelCost).toLocaleString()}</td>
                  <td className="py-2.5 px-3">{s.waitingHours}h</td>
                  <td className="py-2.5 px-3 font-bold text-blue-900">${Math.round(s.totalCost).toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900">{s.capacityUtilization}%</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.risk === "HIGH" ? "bg-red-50 text-red-700 border border-red-200" : 
                      s.risk === "MEDIUM" ? "bg-amber-50 text-amber-700 border border-amber-200" : 
                      "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}>
                      {s.risk}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {s.compatible ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                        <Check size={14} /> Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs">
                        <X size={14} /> Draft/LOA
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <button 
                      className="btn-ghost text-blue-900 font-bold text-xs px-2.5 py-1" 
                      onClick={() => pick(s)} 
                      data-testid={`pick-${i}`}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, accent = "text-slate-900" }) {
  return (
    <div className="border border-slate-200 rounded-lg p-2.5 bg-white shadow-sm min-w-[120px]">
      <div className="astra-label">{label}</div>
      <div className={`font-mono text-base font-extrabold mt-0.5 ${accent}`}>{value}</div>
    </div>
  );
}
