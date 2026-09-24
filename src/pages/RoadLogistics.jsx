import React, { useState, useMemo, useEffect } from "react";
import Badge from "../components/Badge";
import { TopDownTruckSvg } from "../components/VesselIcons";
import { useFlow } from "../lib/flow";
import CorridorLeafletMap from "../components/CorridorLeafletMap";
import { getCorridorData, CORRIDOR_SOURCES, CORRIDOR_DESTINATIONS } from "../data/corridorsData";
import { 
  Truck, MapPin, QrCode, ArrowRight, ShieldCheck, Clock, 
  CheckCircle2, AlertTriangle, RefreshCw, Fuel, User, Navigation, 
  Search, Filter, Activity, Zap, Compass, AlertOctagon, Phone,
  Radio, Gauge, CheckSquare, Sparkles, Building2, Anchor,
  FileText, Printer, Download, Eye, X, PlusCircle, Check,
  BarChart3, Cpu, ChevronRight, CheckCircle, Info
} from "lucide-react";
import { toast } from "sonner";

export default function RoadLogistics() {
  const { 
    requirement, 
    portDiverted, 
    trucks,
    setTrucks,
    updateTruckStatus,
    triggerTruckDelay,
    triggerRouteDeviation,
    triggerVehicleIdle,
    resetAllExceptions,
    dispatchNewTruck,
    isLiveTruckData
  } = useFlow();

  const [activeTab, setActiveTab] = useState("last-mile"); // "first-mile" | "last-mile"
  const [selectedSourceId, setSelectedSourceId] = useState("paradip");
  const [selectedDestId, setSelectedDestId] = useState("angul");
  const [selectedTruckId, setSelectedTruckId] = useState("TRK-LM-201");
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("split"); // "split" | "map" | "list"

  // Active corridor data
  const currentCorridor = useMemo(() => {
    return getCorridorData(selectedSourceId, selectedDestId);
  }, [selectedSourceId, selectedDestId]);

  // Sync corridor with activeTab
  useEffect(() => {
    if (activeTab === "first-mile") {
      setSelectedSourceId("hunter_valley");
      setSelectedDestId("newcastle_port");
    } else if (selectedSourceId === "hunter_valley") {
      setSelectedSourceId("paradip");
      setSelectedDestId("angul");
    }
  }, [activeTab]);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // "ewb" | "weighbridge" | "gatepass" | "dispatch" | null
  const [selectedModalTruck, setSelectedModalTruck] = useState(null);

  // Quick Dispatch Form State
  const [dispatchForm, setDispatchForm] = useState({
    truckModel: "Tata Signa 4825.TK (16-Wheeler, 47.5T GVW)",
    plate: "OD-05-BX-4835",
    driver: "Rajeshwar Mohanty",
    phone: "+91 98451 22815",
    dlNumber: "OD-052021004835",
    berthHopper: "Berth MCH-02 Mobile Crane Hopper #3",
    cargoQuantityMt: 40.2,
    cargoType: "Thermal Coal",
    targetPlant: "Angul Integrated Steel Complex (WH-07)"
  });

  // Keep dispatch form in sync with chosen corridor
  useEffect(() => {
    setDispatchForm(prev => ({
      ...prev,
      berthHopper: currentCorridor.source.berth || prev.berthHopper,
      targetPlant: currentCorridor.dest.name || prev.targetPlant,
      plate: `${currentCorridor.source.platePrefix || "OD-05"}-BX-${Math.floor(Math.random() * 8000 + 1000)}`
    }));
  }, [currentCorridor]);

  // Live AIS-140 GPS Ping Simulation Counter
  const [pingTimer, setPingTimer] = useState(4);
  useEffect(() => {
    const interval = setInterval(() => {
      setPingTimer(prev => (prev <= 1 ? 10 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter trucks by leg or active corridor with resilient fallback
  const legTrucks = useMemo(() => {
    const fromContext = (trucks || []).filter(t => t.leg === activeTab);
    const validContextTrucks = fromContext.filter(t => typeof t.lat === "number" && typeof t.lon === "number");
    
    const isDefaultParadip = selectedSourceId === "paradip" && selectedDestId === "angul";
    const isDefaultHunter = selectedSourceId === "hunter_valley" && selectedDestId === "newcastle_port";

    if (validContextTrucks.length > 0 && (isDefaultParadip || isDefaultHunter)) {
      return validContextTrucks;
    }

    // Return current corridor trucks
    return currentCorridor.trucks || [];
  }, [trucks, activeTab, selectedSourceId, selectedDestId, currentCorridor]);

  // Apply search & status filter
  const filteredTrucks = useMemo(() => {
    return legTrucks.filter(t => {
      const matchesSearch = 
        t.plate?.toLowerCase().includes(searchFilter.toLowerCase()) || 
        t.driver?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.gatePassId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.ewb?.ewbNo?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.fastag?.tagId?.toLowerCase().includes(searchFilter.toLowerCase());
      
      if (!matchesSearch) return false;

      if (statusFilter === "ALL") return true;
      if (statusFilter === "IN_TRANSIT") return t.status === "IN TRANSIT";
      if (statusFilter === "DELAYED") return t.status === "DELAYED" || t.exception !== null;
      if (statusFilter === "AT_TERMINAL") return t.status === "AT WAREHOUSE" || t.status === "APPROACHING PORT" || t.status === "LOADING" || t.status === "AT PORT";
      return true;
    });
  }, [legTrucks, searchFilter, statusFilter]);

  // Active selected truck
  const activeSelectedTruck = useMemo(() => {
    const found = (trucks || []).find(t => t.id === selectedTruckId);
    if (found) return found;
    return legTrucks[0] || (trucks && trucks[0]) || null;
  }, [trucks, selectedTruckId, legTrucks]);

  // Fleet KPIs with authentic Indian logistics values
  const kpis = useMemo(() => {
    const all = legTrucks || [];
    const inTransit = all.filter(t => t.status === "IN TRANSIT").length;
    const delayed = all.filter(t => t.status === "DELAYED" || t.exception !== null).length;
    const atTerminal = all.filter(t => t.status === "AT WAREHOUSE" || t.status === "APPROACHING PORT" || t.status === "LOADING" || t.status === "AT PORT").length;
    const onTimePct = all.length > 0 ? (((all.length - delayed) / all.length) * 100).toFixed(1) : "100.0";
    const movingTrucks = all.filter(t => t.speedKmh > 0);
    const avgSpeed = movingTrucks.length > 0 ? Math.round(movingTrucks.reduce((acc, t) => acc + t.speedKmh, 0) / movingTrucks.length) : 48;
    const totalTonnage = all.reduce((acc, t) => acc + (t.cargoQuantityMt || 40), 0);

    return {
      total: all.length,
      inTransit,
      delayed,
      atTerminal,
      onTimePct,
      avgSpeed,
      totalTonnage: Math.round(totalTonnage),
      evacuationRateMtPerDay: 13840,
      targetRateMtPerDay: 12000,
      fastagClearancePct: "98.6%",
      weighbridgeCycleMin: "3.2m",
      demurrageRisk: "ZERO RISK"
    };
  }, [legTrucks]);

  // Modal open handlers
  const handleOpenModal = (modalType, truck) => {
    setSelectedModalTruck(truck || activeSelectedTruck);
    setActiveModal(modalType);
  };

  // Exception triggers
  const handleSimulateDelay = () => {
    const target = legTrucks.find(t => t.status === "IN TRANSIT") || legTrucks[0];
    if (target) {
      triggerTruckDelay(target.id, 42, "Heavy industrial congestion on NH-53 Toll Plaza #4 (Marshaghai)");
      setSelectedTruckId(target.id);
      toast.warning(`Corridor Exception: +42 min delay triggered on ${target.plate} (${target.id})`);
    } else {
      toast.info("No active trucks in transit on this corridor.");
    }
  };

  const handleSimulateDeviation = () => {
    const target = legTrucks.find(t => t.status === "IN TRANSIT") || legTrucks[0];
    if (target) {
      triggerRouteDeviation(target.id, "Vehicle diverted 3.8 km west of designated NH-53 corridor towards unapproved bypass road");
      setSelectedTruckId(target.id);
      toast.error(`Security Alert: Route Deviation detected for ${target.plate}!`);
    } else {
      toast.info("No active trucks in transit on this corridor.");
    }
  };

  const handleSimulateIdle = () => {
    const target = legTrucks.find(t => t.status !== "AT WAREHOUSE") || legTrucks[0];
    if (target) {
      triggerVehicleIdle(target.id, 50);
      setSelectedTruckId(target.id);
      toast.warning(`Idling Alert: ${target.plate} stationary on highway shoulder for 50 mins.`);
    }
  };

  const handleResetExceptions = () => {
    resetAllExceptions();
    toast.success("All inland fleet exceptions resolved. Corridor schedules re-synchronized.");
  };

  // Handle Quick Dispatch Submit
  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    const newUnit = {
      leg: activeTab,
      truckModel: dispatchForm.truckModel,
      plate: dispatchForm.plate,
      driver: dispatchForm.driver,
      phone: dispatchForm.phone,
      dlNumber: dispatchForm.dlNumber,
      cargoQuantityMt: Number(dispatchForm.cargoQuantityMt),
      cargoType: dispatchForm.cargoType,
      originPort: activeTab === "first-mile" ? "Hunter Valley Mine Siding, NSW" : "Paradip Port Bulk Jetty Berth MCH-02",
      destPlant: activeTab === "first-mile" ? "Newcastle Port Jetty Berth #2" : dispatchForm.targetPlant
    };

    if (dispatchNewTruck) {
      await dispatchNewTruck(newUnit);
    }
    toast.success(`Tipper ${dispatchForm.plate} successfully dispatched! GST e-Way Bill & FASTag In-Gate Pass generated.`);
    setActiveModal(null);
    setSelectedTruckId(newUnit.plate);
  };

  return (
    <div className="space-y-6" data-testid="road-logistics-page">
      {/* Header with Live AIS-140 Telemetry & Real Logistics Status */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="INLAND LOGISTICS" />
            <span className="astra-label">National Highway & Port Gate Logistics System</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Inland Road Fleet Dispatch & Digital Gate Passes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time AIS-140 GPS telematics, GST e-Way bills, computerized weighbridge slips, and automated FASTag corridor monitoring.
          </p>
        </div>

        {/* Telemetry Status & Dispatch Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold shadow-sm">
            <Radio size={14} className="text-emerald-600 animate-pulse" />
            <span>AIS-140 GPS & FASTAG SYNC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] text-emerald-700 font-normal">Next ping: {pingTimer}s</span>
          </div>

          <button
            onClick={() => setActiveModal("dispatch")}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
          >
            <PlusCircle size={15} />
            <span>+ Dispatch Tipper Unit</span>
          </button>
        </div>
      </div>

      {/* Corridor Header Card: Multimodal Milestone & Operational KPIs */}
      <div className="astra-card p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-300 grid place-items-center shadow-inner">
              <Truck size={24} />
            </div>
            <div>
              <div className="text-[11px] text-blue-200 font-mono tracking-wider">CERTIFIED BULK HIGHWAY FLEET</div>
              <div className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{requirement?.roadFleet?.transporterName || "Intermodal Road Express"}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  AIS-140 COMPLIANT
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  FASTag ENABLED
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
            <div>
              <div className="text-slate-400">Total Corridor Haul</div>
              <div className="text-sm font-bold text-amber-400">
                {(requirement?.cargoQuantity || 70000).toLocaleString()} MT {requirement?.cargoType || "Thermal Coal"}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Evacuation Rate</div>
              <div className="text-sm font-bold text-emerald-400">{kpis.evacuationRateMtPerDay.toLocaleString()} MT / Day</div>
            </div>
            <div>
              <div className="text-slate-400">Demurrage Prevention</div>
              <div className="text-sm font-bold text-emerald-300 flex items-center gap-1">
                <ShieldCheck size={14} />
                <span>{kpis.demurrageRisk}</span>
              </div>
            </div>
            <div>
              <div className="text-slate-400">Weighbridge Turnaround</div>
              <div className="text-sm font-bold text-white">{kpis.weighbridgeCycleMin} / Tipper</div>
            </div>
          </div>
        </div>

        {/* First Mile vs Last Mile Corridor Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { 
                setActiveTab("last-mile"); 
                setSelectedTruckId("TRK-LM-201"); 
              }}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "last-mile" 
                  ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300 font-black" 
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <Anchor size={15} />
              <span>Last-Mile Corridor:</span>
              <span className="font-mono">
                {currentCorridor.source.shortName} ➔ {currentCorridor.dest.shortName} ({currentCorridor.highway.split(' ')[0]})
              </span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-black/30 text-[10px]">
                {legTrucks.length} Tippers Active
              </span>
            </button>

            <button
              onClick={() => { 
                setActiveTab("first-mile"); 
                setSelectedTruckId("TRK-FM-101"); 
              }}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "first-mile" 
                  ? "bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300 font-black" 
                  : "bg-white/10 text-slate-300 hover:bg-white/20"
              }`}
            >
              <Building2 size={15} />
              <span>First-Mile Corridor:</span>
              <span className="font-mono">{requirement?.originWarehouse || "Hunter Valley Siding"} ➔ {requirement?.originPort || "Newcastle Port Jetty"} (M15)</span>
              <span className="ml-1 px-1.5 py-0.5 rounded bg-black/30 text-[10px]">
                {trucks.filter(t => t.leg === "first-mile").length} Units
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <span className="text-slate-400">View Mode:</span>
            <button
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold ${viewMode === "split" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Interactive Split
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold ${viewMode === "map" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Full Highway Map
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold ${viewMode === "list" ? "bg-white/20 text-white" : "text-slate-400 hover:text-white"}`}
            >
              Roster Table
            </button>
          </div>
        </div>
      </div>

      {/* Operational KPIs Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="astra-card p-3 bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>ACTIVE ROSTER</span>
            <Truck size={13} className="text-blue-900" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
            {kpis.total} <span className="text-xs font-normal text-slate-500">tippers</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{kpis.totalTonnage} MT moving</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>IN TRANSIT</span>
            <Navigation size={13} className="text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">
            {kpis.inTransit} <span className="text-xs font-normal text-slate-500">hauling</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Avg speed: {kpis.avgSpeed} km/h</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>TERMINAL / WEIGHBRIDGE</span>
            <MapPin size={13} className="text-indigo-600" />
          </div>
          <div className="text-xl font-extrabold text-indigo-700 mt-1 font-mono">
            {kpis.atTerminal} <span className="text-xs font-normal text-slate-500">staged</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Hopper loading / scale</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>CORRIDOR EXCEPTIONS</span>
            <AlertTriangle size={13} className={kpis.delayed > 0 ? "text-amber-600" : "text-slate-400"} />
          </div>
          <div className={`text-xl font-extrabold mt-1 font-mono ${kpis.delayed > 0 ? "text-amber-600" : "text-slate-900"}`}>
            {kpis.delayed} <span className="text-xs font-normal text-slate-500">delayed</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{kpis.delayed > 0 ? "Requires Dispatcher Action" : "All corridors green"}</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>ON-TIME SLA</span>
            <CheckCircle2 size={13} className="text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">{kpis.onTimePct}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Target: 95.0% SLA</div>
        </div>

        <div className="astra-card p-3 bg-white border border-slate-200 shadow-sm">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>FASTAG CLEARANCE</span>
            <Zap size={13} className="text-blue-900" />
          </div>
          <div className="text-xl font-extrabold text-blue-900 mt-1 font-mono">{kpis.fastagClearancePct}</div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">Auto barrier clearance</div>
        </div>
      </div>

      {/* Interactive Leaflet Corridor Highway Map */}
      {(viewMode === "split" || viewMode === "map") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-900"></span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                Live Highway Corridor Tracking & Telematics Map
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Interactive Leaflet Engine · Click any truck marker to inspect telematics & e-Way bill
            </span>
          </div>

          <CorridorLeafletMap
            selectedSourceId={selectedSourceId}
            selectedDestId={selectedDestId}
            onSelectSource={setSelectedSourceId}
            onSelectDestination={setSelectedDestId}
            trucks={legTrucks}
            selectedTruckId={selectedTruckId}
            onSelectTruck={(id) => setSelectedTruckId(id)}
            activeTab={activeTab}
            onCorridorChange={(corr) => {
              if (corr.trucks && corr.trucks.length > 0) {
                if (!corr.trucks.some(t => t.id === selectedTruckId)) {
                  setSelectedTruckId(corr.trucks[0].id);
                }
              }
            }}
          />
        </div>
      )}

      {/* Exception Management & Incident Simulation Strip */}
      <div className="astra-card p-4 bg-amber-50/70 border border-amber-200 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <Zap size={16} className="text-amber-600" />
              <span>Operational Incident Simulation & Exception Response</span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              Simulate real-world industrial anomalies across the highway corridor to test AIS-140 GPS alerts, FASTag toll delays, and automated dispatch resilience:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateDelay}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Simulate +42 min highway delay"
            >
              <Clock size={13} />
              <span>Simulate Toll Delay (+42m)</span>
            </button>

            <button
              onClick={handleSimulateDeviation}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Trigger GPS geofence deviation"
            >
              <AlertOctagon size={13} />
              <span>Route Deviation Alert</span>
            </button>

            <button
              onClick={handleSimulateIdle}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Trigger vehicle idle alert"
            >
              <Clock size={13} />
              <span>Vehicle Idling (&gt;45m)</span>
            </button>

            <button
              onClick={handleResetExceptions}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              title="Reset all simulated exceptions"
            >
              <RefreshCw size={13} />
              <span>Reset Exceptions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search registration, driver, E-Way bill, FASTag..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-mono font-bold">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded ${statusFilter === "ALL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              All ({legTrucks.length})
            </button>
            <button
              onClick={() => setStatusFilter("IN_TRANSIT")}
              className={`px-2.5 py-1 rounded ${statusFilter === "IN_TRANSIT" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              In Transit
            </button>
            <button
              onClick={() => setStatusFilter("DELAYED")}
              className={`px-2.5 py-1 rounded ${statusFilter === "DELAYED" ? "bg-amber-100 text-amber-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              Delayed
            </button>
            <button
              onClick={() => setStatusFilter("AT_TERMINAL")}
              className={`px-2.5 py-1 rounded ${statusFilter === "AT_TERMINAL" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              At Terminal
            </button>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-500 font-bold">
          Displaying {filteredTrucks.length} Units on {activeTab === "first-mile" ? "M15 Hunter Corridor" : "NH-53 Heavy Industrial Corridor"}
        </span>
      </div>

      {/* Main Content Grid: Truck Roster + Deep Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Detailed Truck Cards */}
        <div className="lg:col-span-2 space-y-3">
          {filteredTrucks.length === 0 ? (
            <div className="astra-card p-12 text-center bg-white border border-slate-200">
              <Truck size={36} className="text-slate-300 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700">No trucks found matching query</div>
              <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms</p>
            </div>
          ) : (
            filteredTrucks.map((t) => {
              const isSelected = activeSelectedTruck?.id === t.id;
              const hasException = t.exception !== null || t.status === "DELAYED";
              const progressPct = Math.min(100, Math.round(((t.distanceCoveredKm || 0) / (t.plannedDistanceKm || 182)) * 100));

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTruckId(t.id)}
                  className={`astra-card p-4 cursor-pointer transition-all border-2 rounded-xl ${
                    isSelected 
                      ? "border-blue-900 bg-blue-50/40 shadow-md ring-1 ring-blue-900" 
                      : hasException
                        ? "border-amber-300 bg-amber-50/30 hover:border-amber-400"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {/* Top Row: Plate, Model, Tracking type, Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <TopDownTruckSvg size={30} horizontal={true} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base text-slate-900 font-mono tracking-tight">{t.plate}</span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                            {t.truckModel || t.trailer}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                            {t.trackingType || "AIS-140 GPS"}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <User size={12} className="text-slate-400" /> 
                          <span className="font-semibold text-slate-700">{t.driver}</span>
                          <span>·</span>
                          <span className="font-mono text-slate-700 font-bold">
                            {t.cargoQuantityMt} MT {t.cargoType || "Coal"}
                          </span>
                          <span>·</span>
                          <span className="font-mono text-slate-500 text-[11px]">
                            {t.subStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase shadow-sm ${
                        hasException 
                          ? "bg-amber-500 text-slate-950 animate-pulse" 
                          : t.status === "IN TRANSIT"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : t.status === "AT WAREHOUSE"
                              ? "bg-blue-100 text-blue-900 border border-blue-300"
                              : "bg-slate-100 text-slate-800 border border-slate-300"
                      }`}>
                        {hasException ? "EXCEPTION ALERT" : t.status}
                      </span>
                      <div className="text-xs text-slate-500 font-mono mt-1">
                        ETA: <span className="font-bold text-slate-900">{t.etaFormatted || t.eta || "On Schedule"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Exception Banner if Active */}
                  {hasException && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-950 text-xs flex items-start gap-2">
                      <AlertTriangle size={15} className="text-amber-700 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold font-mono">
                          {t.exception?.type === "TRUCK_DELAY" || t.status === "DELAYED" ? `CORRIDOR DELAY DETECTED:` : "ROUTE / IDLE ANOMALY:"}
                        </span>{" "}
                        <span>{t.exception?.message || t.exception?.reason || "Delay reported along industrial corridor."}</span>
                      </div>
                    </div>
                  )}

                  {/* Live Telemetry Progress & Telematics Strip */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                    <div className="flex items-center gap-4 text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Gauge size={13} className="text-slate-400" />
                        <span className="font-bold text-slate-900">{t.speedKmh || 0}</span> km/h
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel size={13} className="text-slate-400" />
                        <span className="font-bold text-slate-900">{t.fuelPct || 85}%</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Compass size={13} className="text-slate-400" />
                        <span className="font-bold text-slate-900">{t.headingDeg || 0}°</span>
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Last ping: {t.lastUpdateSecondsAgo || 12}s ago
                      </span>
                    </div>

                    {/* Quick Document Action Badges */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal("ewb", t);
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 transition"
                        title="View Official GST E-Way Bill"
                      >
                        <FileText size={11} className="text-blue-900" />
                        <span>EWB: {t.ewb?.ewbNo?.slice(-6) || "View"}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal("weighbridge", t);
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1 transition"
                        title="View NABL Weighbridge Ticket"
                      >
                        <CheckSquare size={11} className="text-emerald-700" />
                        <span>Scale Slip</span>
                      </button>

                      <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-blue-900 h-1.5 rounded-full transition-all" 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold shrink-0">{progressPct}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Deep-Dive Telematics & Gate Pass Inspector */}
        <div className="space-y-4">
          {activeSelectedTruck ? (
            <div className="astra-card p-5 space-y-4 border-t-4 border-t-amber-500 bg-white shadow-lg rounded-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">DIGITAL IN-GATE PASS & FASTag ID</span>
                  <h3 className="text-lg font-extrabold text-slate-900 font-mono">{activeSelectedTruck.plate}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  SECURITY CLEARED
                </span>
              </div>

              {/* Digital QR Gate Pass Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                <div className="w-28 h-28 bg-white border border-slate-300 rounded-lg grid place-items-center shadow-inner p-2 mb-2">
                  <QrCode size={90} className="text-slate-800" />
                </div>
                <div className="text-xs font-mono font-extrabold text-slate-800">{activeSelectedTruck.gatePassId || "GP-PPT-2026-9041"}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Scans automatically at RFID/FASTag Toll & Terminal Barrier</div>
                
                {/* Official Documents Links */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 w-full justify-center">
                  <button
                    onClick={() => handleOpenModal("ewb", activeSelectedTruck)}
                    className="px-2.5 py-1 rounded bg-blue-900 text-white hover:bg-blue-800 text-[10px] font-bold font-mono flex items-center gap-1 shadow-sm"
                  >
                    <FileText size={11} />
                    <span>Official E-Way Bill</span>
                  </button>

                  <button
                    onClick={() => handleOpenModal("weighbridge", activeSelectedTruck)}
                    className="px-2.5 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800 text-[10px] font-bold font-mono flex items-center gap-1 shadow-sm"
                  >
                    <CheckSquare size={11} />
                    <span>Weighbridge Slip</span>
                  </button>
                </div>
              </div>

              {/* Exception Resolution Box if Truck has Exception */}
              {(activeSelectedTruck.exception || activeSelectedTruck.status === "DELAYED") && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-800 font-bold font-mono">
                    <AlertOctagon size={15} />
                    <span>INCIDENT DIAGNOSTICS</span>
                  </div>
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {activeSelectedTruck.exception?.message || activeSelectedTruck.exception?.reason || "Corridor delay detected by Intugine FASTag anomaly engine."}
                  </p>
                  <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Dispatch Action:</span>
                    <button
                      onClick={() => {
                        updateTruckStatus(activeSelectedTruck.id, "IN TRANSIT", { exception: null });
                        toast.success(`Exception resolved for ${activeSelectedTruck.plate}. Resuming normal corridor.`);
                      }}
                      className="px-2.5 py-1 rounded bg-rose-700 hover:bg-rose-800 text-white font-bold text-[10px]"
                    >
                      Acknowledge & Clear Delay
                    </button>
                  </div>
                </div>
              )}

              {/* Real Engine Diagnostics & TPMS Sensors */}
              <div className="p-3 bg-slate-900 text-white rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <Cpu size={12} className="text-blue-400" />
                    AIS-140 Telemetry & Sensors
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">LIVE TELEMETRICS</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <div className="text-[9px] text-slate-400">ENGINE RPM</div>
                    <div className="text-sm font-bold text-white mt-0.5">{activeSelectedTruck.telematics?.engineRpm || 1420}</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <div className="text-[9px] text-slate-400">COOLANT</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">{activeSelectedTruck.telematics?.coolantTempC || 87}°C</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <div className="text-[9px] text-slate-400">OIL PRESSURE</div>
                    <div className="text-sm font-bold text-blue-300 mt-0.5">{activeSelectedTruck.telematics?.engineOilPressureBar || 4.2} bar</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <div className="text-[9px] text-slate-400">BATTERY</div>
                    <div className="text-sm font-bold text-white mt-0.5">{activeSelectedTruck.telematics?.batteryVoltage || 24.4} V</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <div className="text-[9px] text-slate-400">DEF / ADBLUE</div>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">{activeSelectedTruck.telematics?.defRemainingPct || 84}%</div>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <div className="text-[9px] text-slate-400">ODOMETER</div>
                    <div className="text-[11px] font-bold text-amber-300 mt-0.5">{activeSelectedTruck.telematics?.odometerKm ? `${activeSelectedTruck.telematics.odometerKm.toLocaleString()} km` : "142,820 km"}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Tire Pressure (TPMS):</span>
                  <span className="text-emerald-400 font-bold">{activeSelectedTruck.telematics?.tpmsStatus || "All 16 Tires Normal (110 PSI)"}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Driver DMS Fatigue:</span>
                  <span className="text-white font-bold">{activeSelectedTruck.telematics?.dmsFatigueStatus || "Attentive / Normal"}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Breathalyzer Log:</span>
                  <span className="text-emerald-400 font-bold">{activeSelectedTruck.telematics?.breathalyzerTest || "0.00% BAC (PASS)"}</span>
                </div>
              </div>

              {/* FASTag Toll Highway Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1">
                    <Zap size={12} className="text-amber-600" />
                    FASTag Electronic Toll Log
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                    {activeSelectedTruck.fastag?.status || "ACTIVE"}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">FASTag ID:</span>
                  <span className="font-bold text-slate-800">{activeSelectedTruck.fastag?.tagId || "34161FA820320492812001"}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Issuer Bank:</span>
                  <span className="font-bold text-slate-800">{activeSelectedTruck.fastag?.issuer || "SBI FASTag"}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Wallet Balance:</span>
                  <span className="font-bold text-emerald-700">₹{activeSelectedTruck.fastag?.balanceInr ? activeSelectedTruck.fastag.balanceInr.toLocaleString() : "4,850"}.00</span>
                </div>
                <div className="flex justify-between py-0.5 border-t border-slate-200 pt-1.5">
                  <span className="text-slate-500">Last Toll Passed:</span>
                  <span className="font-bold text-slate-800 text-right">{activeSelectedTruck.fastag?.lastTollPassed || "Marshaghai Toll Plaza (NH-53)"}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-500">Deduction / Time:</span>
                  <span className="font-bold text-slate-800">₹{activeSelectedTruck.fastag?.lastTollAmountInr || 265} · {activeSelectedTruck.fastag?.lastTollTime || "14:12:08 HRS"}</span>
                </div>
              </div>

              {/* Telematics & Route Details */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Corridor Route:</span>
                  <span className="font-bold text-slate-800 text-right">{activeSelectedTruck.routeCorridor}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Origin Loading Bay:</span>
                  <span className="font-bold text-slate-800">
                    {activeTab === "first-mile" 
                      ? (activeSelectedTruck.originWarehouse || "Hunter Valley Siding") 
                      : (activeSelectedTruck.originPort || "Paradip Port Bulk Jetty Berth MCH-02")}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Destination Point:</span>
                  <span className="font-bold text-slate-800">
                    {activeTab === "first-mile" 
                      ? (activeSelectedTruck.targetPort || "Newcastle Port Jetty Berth #2") 
                      : (activeSelectedTruck.destPlant || "Angul Integrated Steel Complex (WH-07)")}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Driver License (DL):</span>
                  <span className="font-bold text-slate-800">{activeSelectedTruck.dlNumber || "OD-052019003412"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Driver Phone:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Phone size={11} className="text-slate-400" />
                    {activeSelectedTruck.phone || "+91 98451 22801"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Certified Net Payload:</span>
                  <span className="font-bold text-emerald-700">
                    {activeSelectedTruck.cargoQuantityMt} MT {activeSelectedTruck.cargoType || "Thermal Coal"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Jetty Direct-Discharge Sync:</span>
                  <span className="font-bold text-blue-900">MV Ocean Pioneer (Hold #4)</span>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-[10px] font-mono uppercase text-slate-500 font-bold block mb-1">
                  Manual Dispatch Override (Control Room):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      updateTruckStatus(activeSelectedTruck.id, "IN TRANSIT");
                      toast.success(`${activeSelectedTruck.plate} set to IN TRANSIT`);
                    }}
                    className={`px-2 py-1.5 rounded text-[11px] font-bold border transition ${
                      activeSelectedTruck.status === "IN TRANSIT"
                        ? "bg-blue-900 text-white border-blue-900"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    In Transit
                  </button>
                  <button
                    onClick={() => {
                      updateTruckStatus(activeSelectedTruck.id, "APPROACHING PORT");
                      toast.success(`${activeSelectedTruck.plate} set to APPROACHING PORT`);
                    }}
                    className={`px-2 py-1.5 rounded text-[11px] font-bold border transition ${
                      activeSelectedTruck.status === "APPROACHING PORT"
                        ? "bg-blue-900 text-white border-blue-900"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    Approaching Gate
                  </button>
                  <button
                    onClick={() => {
                      updateTruckStatus(activeSelectedTruck.id, "AT WAREHOUSE");
                      toast.success(`${activeSelectedTruck.plate} marked AT WAREHOUSE (Delivered)`);
                    }}
                    className={`px-2 py-1.5 rounded text-[11px] font-bold border transition ${
                      activeSelectedTruck.status === "AT WAREHOUSE"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    Delivered
                  </button>
                  <button
                    onClick={() => {
                      updateTruckStatus(activeSelectedTruck.id, "DELAYED", { 
                        exception: { type: "DELAY", message: "Traffic congestion flagged by dispatcher", delayMinutes: 30 } 
                      });
                      toast.warning(`${activeSelectedTruck.plate} flagged as DELAYED`);
                    }}
                    className={`px-2 py-1.5 rounded text-[11px] font-bold border transition ${
                      activeSelectedTruck.status === "DELAYED"
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    Flag Delay
                  </button>
                </div>
              </div>

              {/* Re-Sync Barrier Gate Pass Button */}
              <button 
                onClick={() => toast.success(`Gate pass ${activeSelectedTruck.gatePassId || "GP-PPT-2026-9041"} pushed to driver mobile terminal & terminal security barrier`)} 
                className="btn-primary w-full justify-center h-10 text-xs font-bold mt-2"
              >
                <CheckCircle2 size={15} /> Re-Sync Barrier Gate Pass
              </button>
            </div>
          ) : (
            <div className="astra-card p-6 text-center text-slate-400">
              Select a truck to inspect telematics
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: AUTHENTIC GOVERNMENT OF INDIA GST E-WAY BILL (FORM GST EWB-01)   */}
      {/* ========================================================================= */}
      {activeModal === "ewb" && selectedModalTruck && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 grid place-items-center">
                  <FileText size={20} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400">GOVERNMENT OF INDIA · GOODS AND SERVICES TAX</div>
                  <h3 className="text-base font-extrabold text-white font-mono">e-Way Bill Print (Form GST EWB-01)</h3>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Document Content */}
            <div className="p-6 space-y-5 text-slate-900 font-mono text-xs">
              {/* EWB Header Bar */}
              <div className="border-2 border-slate-900 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4 bg-slate-50">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">e-Way Bill No:</div>
                  <div className="text-xl font-black text-slate-900 tracking-wider">
                    {selectedModalTruck.ewb?.ewbNo || "2418 0984 1101"}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    Generated Date: <strong>{selectedModalTruck.ewb?.ewbDate || "2026-09-21 12:30:00"}</strong>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Valid Until: <strong className="text-emerald-700">{selectedModalTruck.ewb?.validUntil || "2026-09-22 23:59:00"} (200 km/day)</strong>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-2 bg-white border border-slate-300 rounded-lg shadow-sm">
                  <QrCode size={75} className="text-slate-900" />
                  <span className="text-[9px] text-slate-400 mt-1">GST E-Sign Valid</span>
                </div>
              </div>

              {/* Part A Table */}
              <div>
                <div className="bg-slate-900 text-white px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase rounded-t">
                  PART - A (Supply & Tax Details)
                </div>
                <div className="border border-t-0 border-slate-300 p-3 rounded-b space-y-2 text-[11px]">
                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">GSTIN OF SUPPLIER / CONSIGNOR:</span>
                      <strong className="text-slate-900">{selectedModalTruck.ewb?.consignor || "Paradip Port Trust Bulk Terminal Berth MCH-02 (21AAAGP1209F1ZY)"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">PLACE OF DISPATCH:</span>
                      <strong className="text-slate-900">Paradip Port Bulk Jetty (754142), Odisha</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">GSTIN OF RECIPIENT / CONSIGNEE:</span>
                      <strong className="text-slate-900">{selectedModalTruck.ewb?.consignee || "Tata Steel Limited - Angul Works (21AAACT2727Q1ZG)"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">PLACE OF DELIVERY:</span>
                      <strong className="text-slate-900">Meramandali, Angul Steel Plant (759121), Odisha</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[10px]">DOCUMENT NO & DATE:</span>
                      <strong className="text-slate-900">{selectedModalTruck.ewb?.invoiceNo || "PPT/TATA/2026/09-4821"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TAXABLE VALUE:</span>
                      <strong className="text-emerald-700">₹{(selectedModalTruck.ewb?.taxableValue || 349740).toLocaleString()}.00</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">HSN CODE & COMMODITY:</span>
                      <strong className="text-slate-900">{selectedModalTruck.ewb?.hsnCode || "27011920"} (Steam Coal Bulk)</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                    <span>Tax Breakdown: </span>
                    <strong className="text-slate-800">{selectedModalTruck.ewb?.taxBreakdown || "5% IGST ₹17,487 + Clean Energy Cess ₹16,080"}</strong>
                  </div>
                </div>
              </div>

              {/* Part B Table */}
              <div>
                <div className="bg-slate-900 text-white px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase rounded-t">
                  PART - B (Vehicle & Transporter Movement)
                </div>
                <div className="border border-t-0 border-slate-300 p-3 rounded-b text-[11px]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-500 border-b border-slate-200">
                        <th className="py-1">Mode</th>
                        <th className="py-1">Vehicle No</th>
                        <th className="py-1">From</th>
                        <th className="py-1">Entered Date</th>
                        <th className="py-1">Transporter ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1.5 font-bold">ROAD</td>
                        <td className="py-1.5 font-black text-blue-900">{selectedModalTruck.plate}</td>
                        <td className="py-1.5 font-bold">PARADIP (754142)</td>
                        <td className="py-1.5">{selectedModalTruck.ewb?.ewbDate?.slice(0, 10) || "2026-09-21"}</td>
                        <td className="py-1.5 font-mono text-slate-700">TRANS-IND-90218</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-slate-100 px-6 py-3 flex items-center justify-between border-t border-slate-200">
              <div className="text-[11px] text-slate-500 font-mono">
                Digitally authenticated under Section 68 of CGST Act.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("Printing official e-Way Bill copy...")}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer size={13} />
                  <span>Print E-Way Bill</span>
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CERTIFIED COMPUTERIZED WEIGHBRIDGE SLIP (NABL ACCREDITED)        */}
      {/* ========================================================================= */}
      {activeModal === "weighbridge" && selectedModalTruck && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            {/* Perforated Thermal Receipt Style Container */}
            <div className="bg-amber-50 border-b-4 border-amber-500 p-6 text-slate-900 font-mono text-xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-amber-200 text-amber-900 grid place-items-center font-bold">
                    ⚖️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">PARADIP PORT AUTHORITY</h4>
                    <div className="text-[10px] text-slate-600">Central Electronic Weighbridge Complex (NABL Accredited)</div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-1 rounded text-slate-500 hover:text-slate-900"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex justify-between items-center text-[11px] pb-2 border-b border-dashed border-amber-300">
                <span>Slip No: <strong>{selectedModalTruck.weighbridge?.slipNo || "WBS-PPT-2026-9041"}</strong></span>
                <span>Date: <strong>21-SEP-2026</strong></span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Vehicle Registration:</span>
                  <span className="font-black text-slate-900 text-sm">{selectedModalTruck.plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Truck Specification:</span>
                  <span className="font-bold text-slate-800">{selectedModalTruck.truckModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Commodity:</span>
                  <span className="font-bold text-slate-800">{selectedModalTruck.cargoType} (Bulk Coal)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Transporter:</span>
                  <span className="font-bold text-slate-800">Intermodal Road Express</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Berth Hopper Chute:</span>
                  <span className="font-bold text-slate-800">Berth MCH-02 Hopper Chute #3</span>
                </div>
              </div>

              {/* Certified Weight Breakdown Box */}
              <div className="bg-white border-2 border-slate-900 p-3 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Gross Weight:</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      {(selectedModalTruck.weighbridge?.grossWeightKg || 54620).toLocaleString()} kg
                    </span>
                    <div className="text-[9px] text-slate-400">Time: {selectedModalTruck.weighbridge?.grossTime || "13:42 HRS"}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-1.5">
                  <span className="text-slate-500">Tare Weight (Empty):</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-sm">
                      {(selectedModalTruck.weighbridge?.tareWeightKg || 14210).toLocaleString()} kg
                    </span>
                    <div className="text-[9px] text-slate-400">Time: {selectedModalTruck.weighbridge?.tareTime || "12:15 HRS"}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm border-t-2 border-slate-900 pt-2 bg-emerald-50/60 p-1.5 rounded">
                  <span className="font-black text-emerald-950">NET CERTIFIED PAYLOAD:</span>
                  <span className="font-black text-emerald-800 text-base">
                    {(selectedModalTruck.weighbridge?.netWeightKg || 40410).toLocaleString()} kg
                    <span className="text-xs font-normal text-slate-600 ml-1">
                      ({selectedModalTruck.cargoQuantityMt} MT)
                    </span>
                  </span>
                </div>
              </div>

              <div className="text-[10px] space-y-1 text-slate-600 border-t border-amber-200 pt-3">
                <div className="flex justify-between">
                  <span>Axle Overload Check:</span>
                  <strong className="text-emerald-700">COMPLIANT (Statutory 11.5T single / 21T tandem)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Weighmaster / Operator:</span>
                  <strong>{selectedModalTruck.weighbridge?.weighmaster || "N.C. Mohapatra (Seal #092)"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Calibration Cert:</span>
                  <strong>NABL/CAL/2026/0891 (Valid till Oct 2027)</strong>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-2 text-[9px] text-slate-400 border-t border-dashed border-amber-300">
                *** Computer generated computerized scale ticket. Valid without physical signature under IT Act 2000 ***
              </div>
            </div>

            <div className="bg-slate-100 px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => toast.success("Printing weighbridge scale ticket...")}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer size={13} />
                <span>Print Scale Slip</span>
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK DISPATCH MODAL (+ DISPATCH TIPPER UNIT)                     */}
      {/* ========================================================================= */}
      {activeModal === "dispatch" && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 grid place-items-center">
                  <PlusCircle size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-blue-300">INLAND CONTROL ROOM</div>
                  <h3 className="text-base font-extrabold text-white font-mono">Dispatch New Tipper Unit onto Corridor</h3>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-6 space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Commercial Model:</label>
                  <select
                    value={dispatchForm.truckModel}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, truckModel: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="Tata Signa 4825.TK (16-Wheeler, 47.5T GVW)">Tata Signa 4825.TK (16-Wheeler, 47.5T GVW)</option>
                    <option value="BharatBenz 3528C Heavy Tipper (12-Wheeler)">BharatBenz 3528C Heavy Tipper (12-Wheeler)</option>
                    <option value="Ashok Leyland 4220 HG (14-Wheeler 10x2)">Ashok Leyland 4220 HG (14-Wheeler 10x2)</option>
                    <option value="Volvo FMX 460 Multi-Axle Dump Truck (8x4)">Volvo FMX 460 Multi-Axle Dump Truck (8x4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Registration Plate:</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.plate}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, plate: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Driver Name:</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.driver}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, driver: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Driver Mobile:</label>
                  <input
                    type="text"
                    required
                    value={dispatchForm.phone}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, phone: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Berth Loading Chute:</label>
                  <select
                    value={dispatchForm.berthHopper}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, berthHopper: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    <option value="Berth MCH-02 Mobile Crane Hopper #3">Berth MCH-02 Mobile Crane Hopper #3</option>
                    <option value="Berth MCH-02 Mobile Crane Hopper #2">Berth MCH-02 Mobile Crane Hopper #2</option>
                    <option value="Berth MCH-01 Conveyor Siding #1">Berth MCH-01 Conveyor Siding #1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1">Certified Payload (MT):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={dispatchForm.cargoQuantityMt}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, cargoQuantityMt: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CheckCircle size={13} className="text-emerald-600" />
                  <span>Automated Dispatch Pipeline Verification</span>
                </div>
                <div>• Auto-generates GST e-Way Bill (Part A & B) with NIC QR code.</div>
                <div>• Pushes RFID In-Gate Pass token to Paradip Port Security Barrier Post #2.</div>
                <div>• Initialises AIS-140 GPS telematics frequency (10s sync) on NH-53.</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  <Check size={14} />
                  <span>Confirm & Dispatch Tipper</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}