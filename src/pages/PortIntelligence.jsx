import React, { useEffect, useState } from "react";
import api from "../lib/api";
import Badge from "../components/Badge";
import { useFlow } from "../lib/flow";
import { 
  Anchor, ShieldAlert, CheckCircle2, Clock, Zap, 
  ArrowRight, ShieldCheck, RefreshCw, AlertTriangle, Radio, Navigation, 
  LifeBuoy, Ship, Compass, ArrowUpRight, ArrowDownRight, Layers,
  Activity, CheckCircle, BarChart3, AlertOctagon, TrendingDown,
  Gauge, Building2, Calendar
} from "lucide-react";
import { toast } from "sonner";

export default function PortIntelligence() {
  const [ports, setPorts] = useState([]);
  const [activePortName, setActivePortName] = useState("Paradip");
  const [manifestData, setManifestData] = useState(null);
  const [alternativePortData, setAlternativePortData] = useState(null);
  const [manifestTab, setManifestTab] = useState("INCOMING"); // "INCOMING" | "ANCHORAGE" | "BERTH" | "DEPARTURES"

  const { 
    requirement, 
    weatherDelayActive, 
    berthReallocated, 
    approveBerthReallocation,
    portCongestionActive,
    portDiverted,
    approvePortDiversion,
    isLiveVesselData
  } = useFlow();

  // Fetch Ports benchmark
  useEffect(() => { 
    api.get("/ports").then((r) => setPorts(r.data)).catch(() => {}); 
  }, []);

  // Fetch Port Ops Manifest & Alternative Port Recommendation
  useEffect(() => {
    api.get(`/port-ops/manifest?port=${activePortName}`)
      .then((r) => setManifestData(r.data))
      .catch((err) => {
        console.warn("Failed to load live port ops manifest, using local state", err);
      });

    api.get(`/port-ops/alternative-port?port=${activePortName}`)
      .then((r) => setAlternativePortData(r.data))
      .catch((err) => {
        console.warn("Failed to load alternative port recommendation", err);
      });
  }, [activePortName]);

  const congStyle = (c) => 
    c === "High" || c === "HIGH" 
      ? "bg-red-50 text-red-800 border-red-200" 
      : c === "Medium" || c === "MEDIUM" 
        ? "bg-amber-50 text-amber-800 border-amber-200" 
        : "bg-emerald-50 text-emerald-800 border-emerald-200";

  // Manifest items based on active tab
  const incoming = manifestData?.incomingVessels || [
    {
      id: "VES-INC-01",
      name: requirement?.selectedVessel?.name || "MV Bengal Voyager",
      category: "Panamax",
      origin: requirement?.originPort ? `${requirement.originPort}, Australia` : "Newcastle, Australia",
      destinationPort: activePortName,
      eta: weatherDelayActive ? "Today 12:00 HRS (+10h Swell Delay)" : "Today 02:00 HRS",
      cargo: `${(requirement?.cargoQuantity || 70000).toLocaleString()} MT ${requirement?.cargoType || "Thermal Coal"}`,
      draftM: 13.8,
      loaM: 225,
      speedKnots: 13.8,
      status: "AT SEA (Approaching Fairway)",
      risk: weatherDelayActive ? "HIGH" : "LOW",
      carrier: requirement?.selectedContractor || "Tata NYK Shipping"
    },
    {
      id: "VES-INC-02",
      name: "MV Pacific Horizon",
      category: "Capesize",
      origin: "Port Hedland, Australia",
      destinationPort: activePortName,
      eta: "Tomorrow 04:30 HRS",
      cargo: "165,000 MT Iron Ore",
      draftM: 17.5,
      loaM: 292,
      speedKnots: 14.2,
      status: "AT SEA (Bay of Bengal Central)",
      risk: "LOW",
      carrier: "Rio Tinto Marine"
    },
    {
      id: "VES-INC-03",
      name: "MV Southern Cross",
      category: "Supramax",
      origin: "Taboneo, Indonesia",
      destinationPort: activePortName,
      eta: "Tomorrow 18:00 HRS",
      cargo: "55,000 MT Steam Coal",
      draftM: 12.2,
      loaM: 190,
      speedKnots: 12.9,
      status: "AT SEA (Weather Swell Corridor)",
      risk: "MEDIUM",
      carrier: "Eastern Glory Chartering"
    }
  ];

  const anchorage = manifestData?.anchorageVessels || [
    {
      id: "VES-ANC-01",
      name: "MV Ocean Trader",
      category: "Panamax",
      arrivalTime: "Yesterday 22:45 HRS",
      waitingHours: 14.2,
      isUnusuallyDelayed: false,
      expectedBerth: "Berth #2 (Mechanized Coal)",
      cargo: "72,000 MT Thermal Coal",
      draftM: 13.6,
      risk: "MEDIUM",
      priority: "Next in Turn"
    },
    {
      id: "VES-ANC-02",
      name: "MV Coastal Pride",
      category: "Supramax",
      arrivalTime: "Today 04:15 HRS",
      waitingHours: 6.0,
      isUnusuallyDelayed: false,
      expectedBerth: berthReallocated ? "Berth #2 (Quick Turnaround Feeder)" : "Berth #3 (General Cargo)",
      cargo: "55,000 MT Coking Coal",
      draftM: 12.2,
      risk: "LOW",
      priority: berthReallocated ? "Quick Turnaround (Allocated)" : "Standby Feeder"
    },
    {
      id: "VES-ANC-03",
      name: "MV Fortune Star",
      category: "Handysize",
      arrivalTime: "2 Days Ago 11:30 HRS",
      waitingHours: 38.5,
      isUnusuallyDelayed: true,
      expectedBerth: "Berth #4 (General Cargo)",
      cargo: "32,000 MT Limestone",
      draftM: 9.8,
      risk: "HIGH",
      priority: "Delayed by Consignee Documentation"
    }
  ];

  const berths = manifestData?.berthOperations || [
    {
      berthNumber: "BERTH 01",
      berthName: "Mechanized Iron Ore Jetty",
      vesselName: "MV Ocean Pioneer",
      operation: "Discharging Iron Ore Fines",
      startTime: "Yesterday 14:00 HRS",
      expectedCompletion: "Today 18:00 HRS",
      allocatedCranes: "Crane #1 & #2 (Conveyor Belt 4)",
      dischargedTons: 62000,
      totalTons: 74000,
      progressPct: 84,
      utilizationPct: 95
    },
    {
      berthNumber: "BERTH 02",
      berthName: "Deepwater Mechanized Coal Jetty",
      vesselName: berthReallocated 
        ? "MV Coastal Pride (Feeder Swapped)" 
        : weatherDelayActive 
          ? "Idle Vacancy (Waiting MV Bengal Voyager)" 
          : requirement?.selectedVessel?.name || "MV Bengal Voyager",
      operation: berthReallocated 
        ? "Feeder Quick Turnaround Discharge (6h task)" 
        : "Pre-allocated Panamax Thermal Coal Unloading",
      startTime: "Today 08:30 HRS",
      expectedCompletion: berthReallocated ? "Today 14:30 HRS" : "Tomorrow 02:00 HRS",
      allocatedCranes: "Mobile Harbor Cranes #2 & #3",
      dischargedTons: berthReallocated ? 38000 : 0,
      totalTons: berthReallocated ? 55000 : 70000,
      progressPct: berthReallocated ? 69 : 0,
      utilizationPct: berthReallocated ? 98 : (weatherDelayActive ? 15 : 92)
    },
    {
      berthNumber: "BERTH 03",
      berthName: "Multi-Purpose Bulk Berth",
      vesselName: "MV Fortune Trader",
      operation: "Grab Unloader Limestone Discharge",
      startTime: "Yesterday 20:00 HRS",
      expectedCompletion: "Tomorrow 04:00 HRS",
      allocatedCranes: "Gantry Crane #4",
      dischargedTons: 18000,
      totalTons: 42000,
      progressPct: 43,
      utilizationPct: 88
    },
    {
      berthNumber: "BERTH 04",
      berthName: "Fertilizer & Clean Bulk Jetty",
      vesselName: "Standby Ready",
      operation: "Shore Mobile Hopper Standby",
      startTime: "N/A",
      expectedCompletion: "Immediate Allocation Ready",
      allocatedCranes: "Mobile Hopper Unit 1",
      dischargedTons: 0,
      totalTons: 0,
      progressPct: 0,
      utilizationPct: 0
    }
  ];

  const departures = manifestData?.departures || [
    {
      id: "VES-DEP-01",
      name: "MV Chennai Express",
      category: "Handymax",
      departureTime: "Today 06:15 HRS",
      destination: "Visakhapatnam Port",
      cargo: "Ballast Transit (Discharged)",
      status: "CLEARED OUTBOUND",
      tugs: "Tug Ocean Titan (Assisted Departure)"
    },
    {
      id: "VES-DEP-02",
      name: "MV Asian Pioneer",
      category: "Panamax",
      departureTime: "Yesterday 21:30 HRS",
      destination: "Singapore Anchorage",
      cargo: "45,000 MT Pelletized Slag",
      status: "CLEARED OUTBOUND",
      tugs: "Tug Thor & Tug Varuna"
    }
  ];

  const kpis = manifestData?.kpis || {
    incomingCount: incoming.length,
    anchorageCount: anchorage.length,
    berthCountOccupied: berths.filter(b => b.progressPct > 0 || b.vesselName.includes("MV")).length,
    totalBerths: berths.length,
    departuresToday: departures.length,
    berthUtilizationPct: 92,
    averageWaitingTimeHours: 12
  };

  return (
    <div className="space-y-6" data-testid="ports-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="PORT OPS" />
            <span className="astra-label">Terminal Management & Port Operations Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Quayside Berth Command & 4-Stage Operational Manifest
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time jetty operations, anchorage queue management, dynamic crane synchronization, and port diversion optimization.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            {isLiveVesselData ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold shadow-sm">
                <Radio size={13} className="text-emerald-600 animate-pulse" />
                <span>SHIPFINDER / AIS LIVE VESSEL TELEMETRY ACTIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-mono font-bold shadow-sm">
                <Activity size={13} className="text-amber-600" />
                <span>SIMULATED AIS · Terminal Radar Engine</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-mono font-bold shadow-sm">
            <Anchor size={15} />
            <span>Active Terminal Command: {activePortName} Port</span>
          </div>
        </div>
      </div>

      {/* Operational KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="astra-card p-3 bg-white border border-slate-200">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>INCOMING</span>
            <Ship size={13} className="text-blue-900" />
          </div>
          <div className="text-xl font-extrabold text-blue-950 mt-1 font-mono">{kpis.incomingCount} <span className="text-xs font-normal text-slate-500">vessels</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Next 24h tidal window</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>AT ANCHORAGE</span>
            <Clock size={13} className="text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-amber-700 mt-1 font-mono">{kpis.anchorageCount} <span className="text-xs font-normal text-slate-500">waiting</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Avg wait: {kpis.averageWaitingTimeHours}h</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>BERTH OCCUPANCY</span>
            <Anchor size={13} className="text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">{kpis.berthCountOccupied} / {kpis.totalBerths}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{kpis.berthUtilizationPct}% utilized</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>DEPARTURES</span>
            <ArrowUpRight size={13} className="text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-indigo-700 mt-1 font-mono">{kpis.departuresToday} <span className="text-xs font-normal text-slate-500">cleared</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Berths vacated on schedule</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>CONGESTION</span>
            <Activity size={13} className={portCongestionActive ? "text-red-600" : "text-emerald-600"} />
          </div>
          <div className={`text-xl font-extrabold mt-1 font-mono ${portCongestionActive ? "text-red-600" : "text-slate-900"}`}>
            {portCongestionActive ? "HIGH" : "NORMAL"}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{portCongestionActive ? "Queue > 32h" : "Smooth operations"}</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>MAX DRAFT</span>
            <Gauge size={13} className="text-blue-900" />
          </div>
          <div className="text-xl font-extrabold text-blue-900 mt-1 font-mono">14.5m</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Deepwater mechanized</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2 REAL-TIME DYNAMIC TURNAROUND SOLVER BANNERS */}
      {/* ========================================================================= */}

      {/* SOLVER 1: WEATHER SWELL DELAY (+10H) ➔ DYNAMIC BERTH SWAPPING */}
      {weatherDelayActive && (
        <div className="astra-card p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border-2 border-amber-400 space-y-4 animate-in slide-in-from-top-2 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-950 grid place-items-center font-bold shadow">
                <Zap size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-800">TURNAROUND CONFLICT SOLVER · WEATHER DELAY</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {requirement?.selectedVessel?.name || "MV Bengal Voyager"} (+10h Swell Delay) — Berth #2 Vacancy Window Conflict
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-200 text-amber-900">
              ACTION REQUIRED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-white border border-amber-200 rounded-lg space-y-1.5 font-mono">
              <div className="text-[10px] text-slate-400 font-bold uppercase">THE PROBLEM: IDLE BERTH & LOST CRANE TIME</div>
              <div className="text-slate-700">• Original ETA: <span className="font-bold">02:00 HRS</span> ➔ Revised Weather ETA: <span className="font-bold text-red-600">12:00 HRS</span></div>
              <div className="text-slate-700">• Unproductive Idle Berth Window: <span className="font-bold text-amber-700">10.0 Hours</span></div>
              <div className="text-slate-700">• Potential Lost Terminal Revenue: <span className="font-bold text-red-600">$18,200</span></div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg space-y-1.5 font-mono text-emerald-950">
              <div className="text-[10px] text-emerald-800 font-bold uppercase">ASTRA AI TURNAROUND RESOLUTION</div>
              <div className="font-bold">➔ Dynamically berth feeder ship MV Coastal Pride (6.0h turnaround)</div>
              <div className="text-emerald-800">• Feeder discharges & departs by 08:30 HRS (Cranes 100% utilized).</div>
              <div className="text-emerald-800">• Berth #2 vacated & ready for {requirement?.selectedVessel?.name} at 12:00 HRS with zero delay!</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            {!berthReallocated ? (
              <button
                onClick={() => { approveBerthReallocation(); toast.success("Berth #2 successfully reassigned to MV Coastal Pride! Terminal throughput maximized."); }}
                className="btn-primary px-6 h-11 text-xs font-bold gap-2 bg-blue-900 hover:bg-blue-800 shadow"
              >
                <CheckCircle2 size={16} /> 1-Click Approve Dynamic Berth Re-assignment
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-4 py-2 rounded-md">
                <CheckCircle2 size={16} /> Berth #2 Re-allocated · Feeder vessel berthing in progress · Cranes #2 & #3 synced!
              </div>
            )}
          </div>
        </div>
      )}

      {/* SOLVER 2: PORT CONGESTION (PORT NOT FREE) ➔ SHIFT TO NEARBY PORT */}
      {portCongestionActive && (
        <div className="astra-card p-5 bg-gradient-to-r from-red-500/10 via-red-50 to-white border-2 border-red-400 space-y-4 animate-in slide-in-from-top-2 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 text-white grid place-items-center font-bold shadow">
                <ShieldAlert size={20} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-red-800">TURNAROUND CONFLICT SOLVER · HIGH PORT CONGESTION</span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {activePortName} Port Anchorage Full (28 Vessels Waiting / 32+ Hours Delay)
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-red-200 text-red-900">
              CRITICAL QUEUE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-white border border-red-200 rounded-lg space-y-1.5 font-mono">
              <div className="text-[10px] text-slate-400 font-bold uppercase">THE PROBLEM: HEAVY CONGESTION AT CURRENT PORT</div>
              <div className="text-slate-700">• Current Port: <span className="font-bold text-slate-900">{activePortName}</span> · Queue: <span className="font-bold text-red-600">32+ Hours</span></div>
              <div className="text-slate-700">• Financial Demurrage Penalty: <span className="font-bold text-red-600">$38,400</span> ($1,200/hr × 32h)</div>
              <div className="text-slate-700">• Steel Complex Delivery Delay: <span className="font-bold text-red-600">+1.5 Days</span></div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg space-y-1.5 font-mono text-emerald-950">
              <div className="text-[10px] text-emerald-800 font-bold uppercase">ASTRA AI TURNAROUND RESOLUTION</div>
              <div className="font-bold">➔ Shift / Divert Vessel to Nearby Krishnapatnam Port (0 Waiting Hours)</div>
              <div className="text-emerald-800">• Deepwater Berth #4 allocated immediately with shore grab unloaders.</div>
              <div className="text-emerald-800">• 52 Road Trucks automatically rerouted to Krishnapatnam Jetty Gate 2.</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            {!portDiverted ? (
              <button
                onClick={() => { approvePortDiversion(); toast.success("Ship shifted to Krishnapatnam Port Berth #4 & 52 Trucks Rerouted! $38,400 Demurrage Saved."); }}
                className="btn-primary px-6 h-11 text-xs font-bold gap-2 bg-red-600 hover:bg-red-700 text-white shadow animate-bounce"
              >
                <Navigation size={16} /> 1-Click Shift Vessel to Krishnapatnam Port (Saves $38,400)
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-4 py-2 rounded-md">
                <ShieldCheck size={16} /> Vessel Diverted to Krishnapatnam Berth #4 · 22 Hours & $38,400 Demurrage Saved!
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROACTIVE ALTERNATIVE PORT / DIVERSION ADVISORY */}
      {alternativePortData && !portDiverted && (
        <div className="astra-card p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white shadow-xl border border-blue-800">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-800/80 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400 text-blue-300 grid place-items-center">
                <Navigation size={22} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-300 font-bold tracking-wider">
                  PREDICTIVE PORT DIVERSION ADVISORY
                </span>
                <h3 className="text-base font-extrabold text-white">
                  Port Congestion Mitigation: {activePortName} ➔ {alternativePortData.recommendedAlternativePort} Port
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold">
                +{alternativePortData.etaImprovementHours}h Faster Delivery
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold">
                Net Savings: +${alternativePortData.netFinancialSavingsUsd?.toLocaleString()} USD
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px]">CURRENT ANCHORAGE WAIT</span>
              <div className="text-lg font-extrabold text-red-400">{alternativePortData.currentWaitHours} Hours</div>
              <div className="text-[10px] text-slate-400">Demurrage risk: ${alternativePortData.currentDemurrageRiskUsd?.toLocaleString()}</div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px]">ALTERNATIVE WAIT TIME</span>
              <div className="text-lg font-extrabold text-emerald-400">{alternativePortData.alternativeWaitHours} Hours</div>
              <div className="text-[10px] text-emerald-300 font-bold">Saves {alternativePortData.alternativeWaitSavingsHours}h wait</div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px]">ROAD TRUCK DELTA</span>
              <div className="text-lg font-extrabold text-amber-400">+${alternativePortData.additionalInlandTruckCostUsd?.toLocaleString()}</div>
              <div className="text-[10px] text-slate-400">Inland haulage adjustment</div>
            </div>

            <div className="p-3 bg-white/5 rounded-lg border border-white/10 space-y-1">
              <span className="text-slate-400 text-[10px]">NET FINANCIAL BENEFIT</span>
              <div className="text-lg font-extrabold text-emerald-400">+${alternativePortData.netFinancialSavingsUsd?.toLocaleString()}</div>
              <div className="text-[10px] text-emerald-300 font-bold">Guaranteed net positive</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="text-blue-200 text-[11px] max-w-2xl leading-relaxed">
              {alternativePortData.recommendationText}
            </p>
            <button
              onClick={() => {
                approvePortDiversion();
                toast.success(`Diverted vessel to ${alternativePortData.recommendedAlternativePort} Port with road fleet synchronization!`);
              }}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle size={15} />
              <span>Authorize Diversion to {alternativePortData.recommendedAlternativePort}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4-STAGE OPERATIONAL MANIFEST: INCOMING ➔ AT ANCHORAGE ➔ AT BERTH ➔ DEPARTURES */}
      {/* ========================================================================= */}
      <div className="astra-card p-5 space-y-4 bg-white border border-slate-200 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="text-xs uppercase font-mono font-bold text-slate-500">TERMINAL OPERATIONAL MANIFEST</div>
            <h3 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
              4-Stage Bulk Vessel Tracking & Berth Allocation ({activePortName} Port)
            </h3>
          </div>

          {/* 4 Stage Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-mono font-bold">
            <button
              onClick={() => setManifestTab("INCOMING")}
              className={`px-3 py-1.5 rounded-md transition ${
                manifestTab === "INCOMING" 
                  ? "bg-blue-900 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1. Incoming ({incoming.length})
            </button>
            <button
              onClick={() => setManifestTab("ANCHORAGE")}
              className={`px-3 py-1.5 rounded-md transition ${
                manifestTab === "ANCHORAGE" 
                  ? "bg-blue-900 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2. Anchorage ({anchorage.length})
            </button>
            <button
              onClick={() => setManifestTab("BERTH")}
              className={`px-3 py-1.5 rounded-md transition ${
                manifestTab === "BERTH" 
                  ? "bg-blue-900 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              3. At Berth ({berths.length})
            </button>
            <button
              onClick={() => setManifestTab("DEPARTURES")}
              className={`px-3 py-1.5 rounded-md transition ${
                manifestTab === "DEPARTURES" 
                  ? "bg-blue-900 text-white shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              4. Departures ({departures.length})
            </button>
          </div>
        </div>

        {/* STAGE 1: INCOMING VESSELS */}
        {manifestTab === "INCOMING" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 font-mono">
              Vessels currently underway in high seas / approaches with designated destination to {activePortName}.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Vessel & Category</th>
                    <th className="py-2.5 px-3">Origin Port</th>
                    <th className="py-2.5 px-3">Cargo Spec</th>
                    <th className="py-2.5 px-3">Draft / LOA</th>
                    <th className="py-2.5 px-3">Speed</th>
                    <th className="py-2.5 px-3">ETA Window</th>
                    <th className="py-2.5 px-3">Carrier</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incoming.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Ship size={15} className="text-blue-900 shrink-0" />
                          <div>
                            <div>{v.name}</div>
                            <span className="text-[10px] font-mono text-slate-500 font-normal">{v.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{v.origin}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900">{v.cargo}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{v.draftM}m / {v.loaM}m</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">{v.speedKnots} kts</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{v.eta}</td>
                      <td className="py-3 px-3 text-slate-600">{v.carrier}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          v.risk === "HIGH" 
                            ? "bg-red-100 text-red-800" 
                            : v.risk === "MEDIUM" 
                              ? "bg-amber-100 text-amber-800" 
                              : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STAGE 2: AT ANCHORAGE */}
        {manifestTab === "ANCHORAGE" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 font-mono">
              Vessels dropped anchor in the outer/inner roadstead awaiting jetty clearance.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Vessel</th>
                    <th className="py-2.5 px-3">Arrival Timestamp</th>
                    <th className="py-2.5 px-3">Waiting Time</th>
                    <th className="py-2.5 px-3">Designated Berth</th>
                    <th className="py-2.5 px-3">Cargo Spec</th>
                    <th className="py-2.5 px-3">Draft</th>
                    <th className="py-2.5 px-3">Allocation Priority</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anchorage.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Anchor size={15} className="text-amber-600 shrink-0" />
                          <div>
                            <div>{v.name}</div>
                            <span className="text-[10px] font-mono text-slate-500 font-normal">{v.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{v.arrivalTime}</td>
                      <td className="py-3 px-3 font-mono font-bold">
                        <span className={v.waitingHours > 24 ? "text-red-600" : "text-slate-800"}>
                          {v.waitingHours}h
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-semibold">{v.expectedBerth}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{v.cargo}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{v.draftM}m</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          v.isUnusuallyDelayed ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-900"
                        }`}>
                          {v.priority}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => toast.success(`Pilot boarding assigned for ${v.name} to ${v.expectedBerth}`)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px]"
                        >
                          Call Pilot
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STAGE 3: AT BERTH */}
        {manifestTab === "BERTH" && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 font-mono">
              Active quayside loading and discharging operations across the 4 specialized terminals.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {berths.map((b) => (
                <div 
                  key={b.berthNumber} 
                  className={`border-2 rounded-xl p-4 space-y-3 transition ${
                    b.progressPct > 0 
                      ? "border-blue-900/30 bg-white shadow-sm" 
                      : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-900">{b.berthNumber}</span>
                      <h4 className="font-extrabold text-sm text-slate-900">{b.berthName}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      b.progressPct > 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                    }`}>
                      {b.progressPct > 0 ? "DISCHARGING" : "AVAILABLE / STANDBY"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Active Vessel:</span>
                      <span className="font-extrabold text-slate-900">{b.vesselName}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Operation:</span>
                      <span className="text-slate-700">{b.operation}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Allocated Cranes:</span>
                      <span className="font-bold text-blue-900">{b.allocatedCranes}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Completion ETA:</span>
                      <span className="font-bold text-slate-800">{b.expectedCompletion}</span>
                    </div>
                  </div>

                  {b.totalTons > 0 && (
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Discharge Progress ({b.progressPct}%):</span>
                        <span className="font-bold text-slate-900">
                          {b.dischargedTons?.toLocaleString()} / {b.totalTons?.toLocaleString()} MT
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-900 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${b.progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STAGE 4: DEPARTURES */}
        {manifestTab === "DEPARTURES" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 font-mono">
              Vessels with completed discharge operations, pilot cleared, and departed outward.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-mono uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Vessel & Category</th>
                    <th className="py-2.5 px-3">Departure Timestamp</th>
                    <th className="py-2.5 px-3">Next Destination</th>
                    <th className="py-2.5 px-3">Last Cargo Discharged</th>
                    <th className="py-2.5 px-3">Tugs Assigned</th>
                    <th className="py-2.5 px-3 text-right">Outbound Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departures.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Ship size={15} className="text-indigo-600 shrink-0" />
                          <div>
                            <div>{v.name}</div>
                            <span className="text-[10px] font-mono text-slate-500 font-normal">{v.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{v.departureTime}</td>
                      <td className="py-3 px-3 text-slate-800 font-semibold">{v.destination}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{v.cargo}</td>
                      <td className="py-3 px-3 text-slate-600">{v.tugs}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


      {/* East Coast 12 Ports Benchmark Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <div className="text-xs uppercase font-mono font-bold text-slate-800 flex items-center gap-2">
              <span>EAST COAST DEEPWATER PORTS BENCHMARK</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">12 PORTS</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Telemetry dataset: <span className="font-semibold text-slate-700">datasets/east_coast_india_port_telemetry.csv</span>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Click any row to inspect terminal manifest & vessel allocation
          </span>
        </div>

        <div className="astra-card overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Port / State</th>
                  <th className="py-3 px-3">Congestion</th>
                  <th className="py-3 px-3 text-right">Max Draft</th>
                  <th className="py-3 px-3 text-right">Max LOA</th>
                  <th className="py-3 px-3 text-right">Max Beam</th>
                  <th className="py-3 px-3 text-right">Capacity / Day</th>
                  <th className="py-3 px-3 text-right">Historical Wait</th>
                  <th className="py-3 px-3 text-right">Turnaround (TAT)</th>
                  <th className="py-3 px-3 text-right">Queue Count</th>
                  <th className="py-3 px-4 text-center">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ports.map((p) => {
                  const isSelected = activePortName === p.portName;
                  const isHighRisk = p.currentCongestion === "High" || p.currentCongestion === "HIGH";
                  const isMedRisk = p.currentCongestion === "Medium" || p.currentCongestion === "MEDIUM";
                  return (
                    <tr
                      key={p.portName}
                      onClick={() => setActivePortName(p.portName)}
                      className={`cursor-pointer transition-all duration-150 group ${
                        isSelected
                          ? "bg-blue-50/80 font-medium border-l-4 border-l-blue-900 shadow-sm"
                          : "hover:bg-slate-50/90 border-l-4 border-l-transparent"
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-blue-900 ring-2 ring-blue-300" : "bg-slate-300 group-hover:bg-slate-400"}`} />
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm group-hover:text-blue-900 transition-colors">
                              {p.portName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-normal">
                              {p.state}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${congStyle(p.currentCongestion)}`}>
                          {p.currentCongestion.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {p.maxDraftM}m
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {p.maxLoaM}m
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {p.maxBeamM}m
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {((p.cargoHandlingCapacityTonsPerDay || 0) / 1000).toFixed(0)}k t
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-bold ${isHighRisk ? "text-red-700" : isMedRisk ? "text-amber-700" : "text-emerald-700"}`}>
                          {p.historicalWaitingHours}h
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-800">
                        {p.turnaroundTimeHours}h
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {p.currentVesselCount} ships
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-900 text-white px-2.5 py-1 rounded shadow-sm">
                            <CheckCircle2 size={12} /> Selected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 group-hover:text-blue-900 group-hover:underline">
                            Inspect ➔
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-slate-200 rounded p-1.5 bg-white">
      <div className="astra-label text-[10px]">{label}</div>
      <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">{value}</div>
    </div>
  );
}
