import React, { useState } from "react";
import Badge from "../components/Badge";
import TopDownVesselIcon from "../components/VesselIcons";
import { 
  HeartPulse, Gauge, Fuel, Thermometer, Radio, Activity, 
  Wrench, CheckCircle2, AlertTriangle, ShieldCheck, Zap, HardDrive 
} from "lucide-react";

export default function VesselHealth() {
  const [selectedVessel, setSelectedVessel] = useState("MV Pacific Pioneer");

  const telemetry = {
    vessel: "MV Pacific Pioneer",
    id: "ASTRA-CAP-104",
    category: "Capesize",
    overallScore: 94,
    status: "HEALTHY",
    subsystems: [
      { name: "Main Engine (MAN B&W 6S70ME)", status: "NORMAL", score: 96, metric: "85.2 RPM · Load 78%", detail: "Exhaust: 385°C · Scavenge Air: 2.1 bar" },
      { name: "Lube Oil & Cooling Circuit", status: "NORMAL", score: 92, metric: "4.2 bar · Temp 48°C", detail: "Separator Delta P: 0.4 bar (Clean)" },
      { name: "Propulsion Shaft Vibration", status: "NORMAL", score: 95, metric: "1.8 mm/s RMS", detail: "Thrust Bearing Temp: 54°C (Limit 75°C)" },
      { name: "Bunker Fuel System", status: "NORMAL", score: 91, metric: "74% Tank (2,140 MT)", detail: "Daily Burn: 48.5 MT/day @ 14.2 kts" },
      { name: "Auxiliary Generators (3x Yanmar)", status: "NORMAL", score: 98, metric: "Gen #1 & #2 Online", detail: "Grid Load: 460 kW (48% Capacity)" },
      { name: "Bridge Navigation & SatComms", status: "NORMAL", score: 99, metric: "Inmarsat-C Connected", detail: "Dual GPS Sync · Latency 180ms" },
    ],
    timeline: [
      { timestamp: "Today 08:30 IST", event: "Routine Telemetry Sync: All parameters within ISO-10816 standards", type: "NORMAL" },
      { timestamp: "Aug 26, 14:10 IST", event: "Lube Oil Filter Delta Pressure Alert (Resolved via Auto-Backwash)", type: "RESOLVED" },
      { timestamp: "Aug 20, 11:00 IST", event: "Scheduled Auxiliary Generator #2 250h Preventive Inspection Completed", type: "MAINTENANCE" },
      { timestamp: "Aug 15, 09:00 IST", event: "Newcastle Departure Comprehensive Sea-Trial Signoff", type: "NORMAL" },
    ]
  };

  return (
    <div className="space-y-6" data-testid="vessel-health-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="MONITORING" />
            <span className="astra-label">Condition-Based Maintenance & Sensor Diagnostics</span>
            <span className="astra-sim-tag">SIMULATED OPERATIONAL TELEMETRY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Vessel Operational Health & Machinery Telemetry
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time propulsion vibration metrics, thermal performance, and health progression timelines.
          </p>
        </div>
      </div>

      {/* OVERALL HEALTH HERO CARD */}
      <div className="astra-card astra-card-p bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Circular Overall Score Indicator */}
            <div className="relative w-24 h-24 shrink-0 grid place-items-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="94, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-extrabold font-mono text-emerald-400">94%</div>
                <div className="text-[9px] uppercase font-bold text-slate-400">HEALTH</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "Manrope" }}>
                  {telemetry.vessel}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ALL SYSTEMS NOMINAL
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {telemetry.id} · {telemetry.category} (180k DWT) · Flag: Liberia
              </div>
              <div className="text-xs text-blue-300 font-mono">
                Propulsion Status: Continuous Sea Service Rating (CSR)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center font-mono">
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[9px] text-slate-400 font-bold uppercase">ALERTS</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">0 Active</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[9px] text-slate-400 font-bold uppercase">NEXT SERVICE</div>
              <div className="text-xl font-bold text-blue-300 mt-0.5">120 Hours</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[9px] text-slate-400 font-bold uppercase">TELEMETRY</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">ONLINE</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 MACHINERY SUBSYSTEM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {telemetry.subsystems.map((sub) => (
          <div key={sub.name} className="astra-card astra-card-p space-y-2 border-t-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">{sub.name}</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {sub.status}
              </span>
            </div>
            <div className="text-lg font-extrabold font-mono text-slate-900">{sub.metric}</div>
            <div className="text-xs text-slate-500 font-mono">{sub.detail}</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sub.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* HEALTH PROGRESSION & EVENT TIMELINE */}
      <div className="astra-card astra-card-p space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-900" />
            <span className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
              Machinery Health Event Log & Diagnostics Stream
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">ISO 10816 Mechanical Standards</span>
        </div>

        <div className="space-y-2">
          {telemetry.timeline.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 font-mono text-xs">
              <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-slate-800">{item.event}</span>
                  <span className="text-slate-400 text-[11px]">{item.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
