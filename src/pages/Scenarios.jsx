import React, { useState } from "react";
import Badge from "../components/Badge";
import TopDownVesselIcon from "../components/VesselIcons";
import { Link, useNavigate } from "react-router-dom";
import { 
  GitCompareArrows, Trophy, Check, X, TrendingUp, Clock, 
  DollarSign, ShieldCheck, ChevronRight, Sparkles 
} from "lucide-react";

export default function Scenarios() {
  const nav = useNavigate();
  const [selectedScenario, setSelectedScenario] = useState("Scenario A");

  const scenarios = [
    {
      id: "Scenario A",
      name: "Scenario A: Optimal Capesize Direct Fixture (Recommended)",
      vessel: "MV Pacific Pioneer",
      category: "Capesize",
      dwt: "180,000 DWT",
      port: "Paradip (Discharge)",
      freightPerTon: 11.80,
      totalCost: 1042000,
      freightCost: 826000,
      fuelCost: 198000,
      waitingHours: 12,
      waitingCost: 18000,
      etaDays: 14.5,
      capacityUtil: 92,
      risk: "LOW",
      compatible: true,
      costScore: 95,
      recommended: true
    },
    {
      id: "Scenario B",
      name: "Scenario B: Split Panamax Coastal Fixture",
      vessel: "MV Bengal Voyager",
      category: "Panamax",
      dwt: "75,000 DWT",
      port: "Chennai (Discharge)",
      freightPerTon: 17.60,
      totalCost: 1284000,
      freightCost: 1056000,
      fuelCost: 168000,
      waitingHours: 28,
      waitingCost: 60000,
      etaDays: 16.0,
      capacityUtil: 95,
      risk: "HIGH",
      compatible: true,
      costScore: 78,
      recommended: false
    },
    {
      id: "Scenario C",
      name: "Scenario C: Supramax Geared Alternative",
      vessel: "MV Eastern Horizon",
      category: "Supramax",
      dwt: "58,000 DWT",
      port: "Visakhapatnam (Discharge)",
      freightPerTon: 19.80,
      totalCost: 1390000,
      freightCost: 1188000,
      fuelCost: 154000,
      waitingHours: 22,
      waitingCost: 48000,
      etaDays: 17.2,
      capacityUtil: 98,
      risk: "MEDIUM",
      compatible: true,
      costScore: 72,
      recommended: false
    }
  ];

  return (
    <div className="space-y-6" data-testid="scenarios-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="ANALYTICS" />
            <span className="astra-label">What-If Simulation & Scenario Optimization</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Multi-Scenario Fixture Comparison
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Compare landed cargo economics, transit durations, and port congestion risk trade-offs.
          </p>
        </div>
      </div>

      {/* 3 SCENARIO COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            onClick={() => setSelectedScenario(sc.id)}
            className={`astra-card astra-card-p cursor-pointer transition-all space-y-4 ${
              sc.recommended 
                ? "border-2 border-emerald-500 bg-gradient-to-b from-emerald-50/40 via-white to-white shadow-md" 
                : selectedScenario === sc.id
                ? "border-2 border-blue-900 shadow-sm"
                : "hover:border-slate-300"
            }`}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <TopDownVesselIcon category={sc.category} size={20} />
                  <span className="font-extrabold text-slate-900 text-sm">{sc.id}</span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-1">{sc.vessel}</div>
                <div className="text-[10px] text-slate-400 font-mono">{sc.category} · {sc.port}</div>
              </div>
              {sc.recommended && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white font-mono uppercase">
                  ASTRA #1
                </span>
              )}
            </div>

            {/* Total Landed Cost */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center font-mono">
              <div className="text-[9px] uppercase text-slate-400 font-bold">TOTAL LANDED COST</div>
              <div className="text-2xl font-extrabold text-blue-900 mt-0.5">
                ${sc.totalCost.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                ${sc.freightPerTon}/t · Transit {sc.etaDays}d
              </div>
            </div>

            {/* Visual Metrics Stack */}
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Freight Base</span>
                  <span className="font-bold text-slate-900">${sc.freightCost.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-blue-900 rounded-full" style={{ width: `${(sc.freightCost / sc.totalCost) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Bunker Fuel (VLSFO)</span>
                  <span className="font-bold text-slate-900">${sc.fuelCost.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(sc.fuelCost / sc.totalCost) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Port Waiting ({sc.waitingHours}h)</span>
                  <span className="font-bold text-red-600">${sc.waitingCost.toLocaleString()}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (sc.waitingCost / sc.totalCost) * 400)}%` }} />
                </div>
              </div>
            </div>

            {/* Risk & Compatibility */}
            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-100">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check size={14} /> 100% Port Fit
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                sc.risk === "HIGH" ? "bg-red-50 text-red-700 border border-red-200" :
                sc.risk === "MEDIUM" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {sc.risk} RISK
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ASTRA SCENARIO RECOMMENDATION & EVIDENCE MATRIX */}
      <div className="astra-card astra-card-p space-y-3 bg-gradient-to-r from-emerald-50/50 via-white to-blue-50/40 border-2 border-emerald-500">
        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-emerald-600" />
            <span className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
              Why ASTRA Recommends Scenario A
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded">
            Net Savings: $242,000 vs. Scenario B
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-3 text-xs text-slate-700">
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-600" /> Lowest Landed Cost
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Achieves $11.80/t freight rate with Capesize economies of scale, minimizing unit transport cost.
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock size={14} className="text-blue-900" /> Minimal Port Delay
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Paradip deepwater terminal currently has nominal 12h waiting vs. 28h congestion backlog at Chennai.
            </div>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm space-y-1">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" /> Zero Limit Constraints
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Draft depth (18.2m max) and LOA (292m) safely clear Paradip's newly dredged deep berth limits.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
