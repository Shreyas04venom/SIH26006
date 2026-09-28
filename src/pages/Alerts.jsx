import React, { useState } from "react";
import Badge from "../components/Badge";
import { useFlow } from "../lib/flow";
import { 
  BellRing, AlertOctagon, AlertTriangle, Anchor, TrendingUp, 
  Clock, HeartPulse, Radio, ShieldAlert, Check, Filter, Truck, Navigation, Zap
} from "lucide-react";

export default function Alerts() {
  const { eventsList, trucks, weatherDelayActive, portCongestionActive, portDiverted, berthReallocated } = useFlow();
  const [filterCat, setFilterCat] = useState("ALL");
  const [filterSev, setFilterSev] = useState("ALL");

  // Base static alerts
  const staticAlerts = [
    { id: "ALT-101", category: "Incident", severity: "CRITICAL", title: "Main Engine Exhaust Gas Temp Alarm on MV Pacific Pioneer", detail: "Cylinder #4 exhaust reached 425°C. Vessel speed reduced to 10.5 kts. Response workflow initiated.", timestamp: "18m ago", icon: AlertOctagon },
    { id: "ALT-102", category: "Port", severity: "HIGH", title: "Anchorage Congestion Spike at Chennai Port", detail: "Outer anchorage waiting queue extended to 28 hours with 22 bulk vessels in queue.", timestamp: "42m ago", icon: Anchor },
    { id: "ALT-103", category: "ETA", severity: "MEDIUM", title: "Voyage ETA Revised: MV Bengal Voyager (+6.0h Delay)", detail: "Tidal draft window restriction at Chennai roads postponed pilot boarding to 02:00 IST.", timestamp: "1.5h ago", icon: Clock },
    { id: "ALT-104", category: "Freight", severity: "MEDIUM", title: "Singapore VLSFO Bunker Spot Surge (+$16/MT)", detail: "Index adjusted to $585/MT (+2.8% 7-day average), adding $0.35/t fuel carryover pressure.", timestamp: "3h ago", icon: TrendingUp },
    { id: "ALT-105", category: "Risk", severity: "LOW", title: "Monsoon Wave Swell Warning: Bay of Bengal East Fairway", detail: "Significant wave heights evaluated at 3.2m; all tracked vessels reporting nominal stability.", timestamp: "5h ago", icon: ShieldAlert },
    { id: "ALT-106", category: "Health", severity: "LOW", title: "Auxiliary Generator #2 Routine Inspection Due (120h)", detail: "Preventive maintenance window scheduled upon arrival at Paradip discharge berth.", timestamp: "8h ago", icon: HeartPulse },
  ];

  // Derive dynamic alerts from useFlow state (truck exceptions, weather delays, port congestion)
  const dynamicAlerts = [];

  if (weatherDelayActive) {
    dynamicAlerts.push({
      id: "DYN-WTR-01",
      category: "Weather",
      severity: "HIGH",
      title: "Active Weather Swell Delay (+10h) on MV Bengal Voyager",
      detail: berthReallocated 
        ? "Dynamic Feeder Re-allocation Executed: MV Coastal Pride berthed at Berth #2 to avoid crane idle time."
        : "Bay of Bengal swell delay active (+10h). Berth #2 vacancy window conflict requires dynamic swap approval.",
      timestamp: "Just now",
      icon: Zap
    });
  }

  if (portCongestionActive) {
    dynamicAlerts.push({
      id: "DYN-PRT-01",
      category: "Port",
      severity: "CRITICAL",
      title: "Critical Anchorage Congestion Alert: Paradip Port (32+ Hours)",
      detail: portDiverted
        ? "Diversion Executed: Vessel rerouted to Krishnapatnam Port Berth #4 & 52 inland road trucks synchronized."
        : "28 bulk vessels queued in outer anchorage. Estimated demurrage exposure is $38,400. Diversion recommended.",
      timestamp: "Just now",
      icon: ShieldAlert
    });
  }

  // Check trucks for active exceptions
  (trucks || []).forEach(t => {
    if (t.exception) {
      dynamicAlerts.push({
        id: `DYN-TRK-${t.id}`,
        category: "Logistics",
        severity: t.exception.type === "DELAY" ? "HIGH" : "CRITICAL",
        title: `Inland Corridor Exception: Truck ${t.plate} (${t.id})`,
        detail: t.exception.message || "Telemetry exception flagged along transport corridor.",
        timestamp: "2m ago",
        icon: Truck
      });
    }
  });

  const allAlerts = [...dynamicAlerts, ...staticAlerts];


  const filtered = allAlerts.filter(a => {
    if (filterCat !== "ALL" && a.category !== filterCat) return false;
    if (filterSev !== "ALL" && a.severity !== filterSev) return false;
    return true;
  });

  return (
    <div className="space-y-6" data-testid="alerts-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="MONITORING" />
            <span className="astra-label">Centralized Incident & Operational Alert Stream</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Alert & Exception Center
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Severity-based operational hierarchy across Fleet Telemetry, Port Queues, Inland Corridors, Freight Markets, and Weather.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 text-xs">
          <select 
            value={filterCat} 
            onChange={(e) => setFilterCat(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="Logistics">Inland Logistics</option>
            <option value="Weather">Weather & Swell</option>
            <option value="Incident">Incident</option>
            <option value="Port">Port</option>
            <option value="ETA">ETA</option>
            <option value="Freight">Freight</option>
            <option value="Risk">Risk</option>
            <option value="Health">Health</option>
          </select>

          <select 
            value={filterSev} 
            onChange={(e) => setFilterSev(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* ALERT FEED LIST */}
      <div className="space-y-3">
        {filtered.map((alt) => {
          const Icon = alt.icon;
          const isCrit = alt.severity === "CRITICAL";
          const isHigh = alt.severity === "HIGH";
          const isMed = alt.severity === "MEDIUM";

          const borderCol = isCrit ? "border-l-red-600" : isHigh ? "border-l-red-500" : isMed ? "border-l-amber-500" : "border-l-blue-500";
          const badgeCol = isCrit ? "bg-red-600 text-white" : isHigh ? "bg-red-100 text-red-700" : isMed ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800";

          return (
            <div 
              key={alt.id} 
              className={`astra-card astra-card-p border-l-4 ${borderCol} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isCrit || isHigh ? "bg-red-50 text-red-600" : isMed ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>
                  <Icon size={18} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{alt.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${badgeCol}`}>
                      {alt.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">[{alt.category}]</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {alt.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                <span className="text-slate-400">{alt.timestamp}</span>
                <button className="btn-ghost text-xs py-1 px-2 text-blue-900 font-bold">
                  Acknowledge
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
