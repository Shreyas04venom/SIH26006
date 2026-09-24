import React from "react";
import Badge from "../components/Badge";
import { 
  Network, Database, BrainCircuit, ShieldCheck, Ship, 
  Activity, ArrowRight, RefreshCw, Layers, CheckCircle2, Zap 
} from "lucide-react";

export default function Architecture() {
  const pipelineSteps = [
    { title: "1. MULTI-MODAL DATA INGESTION", subtitle: "Baltic Exchange, Singapore VLSFO Bunker, IPA Port Feeds, IMD Weather, Satellite AIS Streams", icon: Database, color: "border-blue-900 bg-blue-50/40" },
    { title: "2. FEATURE ENGINEERING & TEMPORAL EMBEDDING", subtitle: "Port draft margins, congestion queue density, monsoon wave swell indicators, macro freight momentum", icon: Layers, color: "border-violet-600 bg-violet-50/40" },
    { title: "3. ML INFERENCE + RULE COMPATIBILITY", subtitle: "Temporal Fusion Transformer (Freight Rate), GBDT Queue Regressor, Port LOA/Beam/Draft Rule Constraints", icon: BrainCircuit, color: "border-emerald-600 bg-emerald-50/40" },
    { title: "4. PARETO OPTIMIZATION & DECISION ENGINE", subtitle: "Multi-objective total landed cost solver ranking optimal candidate vessels with explainable evidence", icon: ShieldCheck, color: "border-amber-500 bg-amber-50/40" },
    { title: "5. OPERATIONAL VOYAGE MONITORING", subtitle: "Real-time AIS position telemetry, planned vs actual route deviation, ETA progression, vessel health diagnostics", icon: Ship, color: "border-blue-700 bg-blue-50/40" },
    { title: "6. CONTINUOUS MODEL FEEDBACK LOOP", subtitle: "Completed voyage actuals stored and fed back for rolling walk-forward ML model recalibration", icon: RefreshCw, color: "border-emerald-700 bg-emerald-50/40" },
  ];

  return (
    <div className="space-y-6" data-testid="architecture-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="ANALYTICS" />
            <span className="astra-label">System Architecture & Intelligence Pipeline</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            ASTRA End-to-End Decision Architecture
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Full intelligence lifecycle: Multi-source ingestion ➔ AI/ML forecasting ➔ Rule constraints ➔ Pareto optimization ➔ Live monitoring ➔ Continuous learning.
          </p>
        </div>
      </div>

      {/* 6-STAGE VISUAL PIPELINE CARDS */}
      <div className="space-y-3">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className={`astra-card astra-card-p border-l-4 ${step.color} flex items-center justify-between gap-4`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 grid place-items-center shrink-0">
                  <Icon size={20} className="text-blue-900" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900" style={{ fontFamily: "Manrope" }}>{step.title}</div>
                  <div className="text-xs text-slate-600 mt-0.5 font-sans">{step.subtitle}</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 shrink-0">STAGE 0{idx + 1}</span>
            </div>
          );
        })}
      </div>

      {/* CONTINUOUS FEEDBACK LOOP HERO */}
      <div className="astra-card astra-card-p bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span className="font-extrabold text-white text-base" style={{ fontFamily: "Manrope" }}>
              Continuous Learning & Retraining Feedback Loop
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
            AUTO-RECALIBRATING
          </span>
        </div>

        {/* Visual Lifecycle Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono text-xs">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-bold">1. CHARTER APPROVAL</div>
            <div className="font-bold text-white mt-1">Voyage Logged</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-bold">2. DISCHARGE BERTH</div>
            <div className="font-bold text-white mt-1">Actual Demurrage Rec.</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-bold">3. RESIDUAL AUDIT</div>
            <div className="font-bold text-emerald-400 mt-1">Predicted vs Actual</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="text-[10px] text-slate-400 uppercase font-bold">4. WEIGHT UPDATE</div>
            <div className="font-bold text-violet-300 mt-1">Model Recalibration</div>
          </div>
        </div>
      </div>
    </div>
  );
}
