import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Badge from "../components/Badge";
import EastCoastMap from "../components/EastCoastMap";
import TopDownVesselIcon from "../components/VesselIcons";
import { useAuth } from "../lib/auth";
import { 
  Waves, Navigation, Clock, AlertTriangle, ShieldCheck, MapPin, 
  Radio, Compass, ChevronRight, CheckCircle2, ArrowRight 
} from "lucide-react";

export default function VoyageTracking() {
  const { user } = useAuth();

  // Contractor profile does not view maps or AIS telemetry; restricted to Tenders Desk
  if (user?.role === "contractor" || user?.role === "chartering_operator") {
    return <Navigate to="/" replace />;
  }

  const [selectedVoyageId, setSelectedVoyageId] = useState("VOY-801");

  const voyages = [
    {
      id: "VOY-801",
      vessel: "MV Pacific Pioneer",
      category: "Capesize",
      cargo: "165,000 MT Thermal Coal",
      origin: "Newcastle, Australia",
      dest: "Paradip, India",
      speed: "14.2 knots",
      heading: "068° ENE",
      latLon: "16.4281° N, 84.1524° E",
      lastUpdated: "2 minutes ago (AIS Stream)",
      status: "IN TRANSIT",
      originalEta: "Aug 29, 12:00",
      currentEta: "Aug 29, 14:30",
      delayHours: "+2.5h (Weather Swell)",
      deviationStatus: "NOMINAL (1.2 NM from Fairway)",
      deviationReason: "None / Following Optimal Weather Corridor",
      progressPct: 78
    },
    {
      id: "VOY-802",
      vessel: "MV Bengal Voyager",
      category: "Panamax",
      cargo: "70,000 MT Steam Coal",
      origin: "Taboneo, Indonesia",
      dest: "Chennai, India",
      speed: "13.8 knots",
      heading: "295° WNW",
      latLon: "12.8912° N, 81.2401° E",
      lastUpdated: "4 minutes ago",
      status: "APPROACHING",
      originalEta: "Aug 28, 20:00",
      currentEta: "Aug 29, 02:00",
      delayHours: "+6.0h (Port Anchorage Queue)",
      deviationStatus: "ANCHORAGE DRIFT (Speed Reduced to 8 kts)",
      deviationReason: "Port Congestion Advisory at Chennai",
      progressPct: 92
    },
    {
      id: "VOY-803",
      vessel: "MV Eastern Horizon",
      category: "Supramax",
      cargo: "54,000 MT Coking Coal",
      origin: "Hay Point, Australia",
      dest: "Visakhapatnam, India",
      speed: "14.0 knots",
      heading: "310° NW",
      latLon: "15.1200° N, 85.3400° E",
      lastUpdated: "8 minutes ago",
      status: "IN TRANSIT",
      originalEta: "Aug 30, 08:00",
      currentEta: "Aug 30, 08:00",
      delayHours: "None (On Schedule)",
      deviationStatus: "NOMINAL",
      deviationReason: "On Schedule Track",
      progressPct: 62
    }
  ];

  const activeVoyage = voyages.find(v => v.id === selectedVoyageId) || voyages[0];

  return (
    <div className="space-y-6" data-testid="voyage-tracking-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="MONITORING" />
            <span className="astra-label">Live Maritime Positioning & Route Deviation</span>
            <span className="astra-sim-tag">SIMULATED / PROTOTYPE DATA</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Live Voyage Tracking & AIS Telemetry
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Planned vs. actual trajectory comparison, waypoint ETA monitoring, and route deviation detection.
          </p>
        </div>
      </div>

      {/* VOYAGE SELECTOR PILLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {voyages.map((voy) => {
          const isSelected = voy.id === activeVoyage.id;
          return (
            <div
              key={voy.id}
              onClick={() => setSelectedVoyageId(voy.id)}
              className={`astra-card astra-card-p cursor-pointer transition-all ${
                isSelected 
                  ? "border-2 border-blue-900 bg-blue-50/30 shadow-md" 
                  : "hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TopDownVesselIcon category={voy.category} size={20} />
                  <span className="font-extrabold text-slate-900 text-sm">{voy.vessel}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-900 text-white">
                  {voy.id}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-mono mt-2">
                {voy.origin.split(",")[0]} ➔ {voy.dest.split(",")[0]}
              </div>
              <div className="flex items-center justify-between text-xs font-mono mt-2 pt-2 border-t border-slate-100">
                <span className="text-emerald-700 font-bold">ETA: {voy.currentEta}</span>
                <span className="text-slate-500">{voy.speed}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN TRACKING HERO & MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live AIS Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-blue-900" />
              <span className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                Active Navigation Plot: {activeVoyage.vessel} ({activeVoyage.id})
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-600 font-medium">Position Updated: {activeVoyage.lastUpdated}</span>
            </div>
          </div>
          <EastCoastMap />
        </div>

        {/* Right Col: Voyage Telemetry & Route Deviation HUD */}
        <div className="space-y-4">
          {/* Active Voyage Identity Card */}
          <div className="astra-card astra-card-p space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="font-extrabold text-slate-900 text-sm" style={{ fontFamily: "Manrope" }}>
                Voyage Telemetry & Coordinates
              </div>
              <Badge kind="MONITORING" />
            </div>

            <div className="space-y-2 font-mono text-xs">
              <Row label="VESSEL / ID" value={`${activeVoyage.vessel} (${activeVoyage.category})`} />
              <Row label="CARGO ONBOARD" value={activeVoyage.cargo} accent="text-amber-700 font-bold" />
              <Row label="ORIGIN PORT" value={activeVoyage.origin} />
              <Row label="DESTINATION" value={activeVoyage.dest} accent="text-blue-900 font-bold" />
              <Row label="CURRENT LAT/LON" value={activeVoyage.latLon} />
              <Row label="SPEED / HEADING" value={`${activeVoyage.speed} · ${activeVoyage.heading}`} />
            </div>
          </div>

          {/* ETA Visual Progression Timeline */}
          <div className="astra-card astra-card-p space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="font-extrabold text-slate-900 text-sm" style={{ fontFamily: "Manrope" }}>
                ETA Progression Timeline
              </div>
              <Clock size={16} className="text-blue-900" />
            </div>

            {/* 4 Steps Timeline */}
            <div className="flex items-center justify-between text-center font-mono text-[10px] pt-1">
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white grid place-items-center font-bold mx-auto">✓</div>
                <div className="font-bold text-slate-900">DEPARTED</div>
              </div>
              <div className="h-0.5 flex-1 bg-emerald-500 mx-1 mb-3" />
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-blue-900 text-white grid place-items-center font-bold mx-auto">2</div>
                <div className="font-bold text-blue-900">IN TRANSIT</div>
              </div>
              <div className="h-0.5 flex-1 bg-slate-200 mx-1 mb-3" />
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 grid place-items-center font-bold mx-auto">3</div>
                <div className="text-slate-400">FAIRWAY</div>
              </div>
              <div className="h-0.5 flex-1 bg-slate-200 mx-1 mb-3" />
              <div className="space-y-1">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 grid place-items-center font-bold mx-auto">4</div>
                <div className="text-slate-400">BERTHED</div>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">ORIGINAL ETA:</span>
                <span className="text-slate-700">{activeVoyage.originalEta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CURRENT ETA:</span>
                <span className="text-emerald-700 font-bold">{activeVoyage.currentEta}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span className="text-slate-500">VARIANCE:</span>
                <span className="text-amber-700 font-bold">{activeVoyage.delayHours}</span>
              </div>
            </div>
          </div>

          {/* Route Deviation Warning Status */}
          <div className="astra-card astra-card-p border-l-4 border-emerald-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck size={16} /> ROUTE DEVIATION STATUS
              </span>
              <span className="text-[10px] font-mono text-slate-400">RULE-BASED</span>
            </div>
            <div className="text-xs text-slate-800 font-mono font-semibold">
              {activeVoyage.deviationStatus}
            </div>
            <div className="text-[11px] text-slate-500">
              Reason: {activeVoyage.deviationReason}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent = "text-slate-800" }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 last:border-0 py-1">
      <span className="text-slate-400 text-[10px] uppercase font-bold">{label}</span>
      <span className={`font-semibold ${accent}`}>{value}</span>
    </div>
  );
}
