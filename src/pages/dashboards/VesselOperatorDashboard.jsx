import React, { useState } from "react";
import Badge from "../../components/Badge";
import TopDownVesselIcon from "../../components/VesselIcons";
import EastCoastMap from "../../components/EastCoastMap";
import { Link, useNavigate } from "react-router-dom";
import { 
  Ship, HeartPulse, Gauge, Fuel, Thermometer, Radio, AlertOctagon, 
  Wrench, Compass, Navigation, ArrowUpRight, CheckCircle2, ShieldCheck, MapPin, LifeBuoy 
} from "lucide-react";

export default function VesselOperatorDashboard() {
  const nav = useNavigate();

  const myVessel = {
    name: "MV Pacific Pioneer",
    id: "ASTRA-CAP-104",
    category: "Capesize",
    dwt: "180,000 DWT",
    flag: "Liberia",
    speed: "14.2 knots",
    heading: "068° ENE",
    coordinates: "16.4281° N, 84.1524° E",
    origin: "Newcastle, Australia",
    destination: "Paradip, India",
    eta: "Aug 29, 14:30 IST (In 18h)",
    cargo: "165,000 MT Thermal Coal",
    fuelLevel: "74%",
    dailyBurn: "48.5 MT / day VLSFO",
    rpm: "85 RPM",
    engineHealth: "NORMAL",
    oilPressure: "4.2 bar",
    coolingTemp: "78°C",
    vibration: "1.8 mm/s (Normal)",
    commsStatus: "CONNECTED (Inmarsat)",
    lastPing: "2 minutes ago"
  };

  return (
    <div className="space-y-6" data-testid="vessel-operator-dashboard">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-emerald-700 text-white uppercase font-mono tracking-wider">
              Onboard Telemetry & Vessel Operations
            </span>
            <span className="astra-sim-tag">SIMULATED OPERATIONAL TELEMETRY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            My Vessel: {myVessel.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time bridge navigation, main propulsion telemetry, fuel management, and vessel health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/incidents" className="btn-secondary text-red-700 border-red-200">
            <AlertOctagon size={16} /> Report Incident
          </Link>
          <Link to="/vessel-health" className="btn-primary">
            <HeartPulse size={16} /> Full Health Diagnostics
          </Link>
        </div>
      </div>

      {/* HERO SECTION: ASSIGNED VESSEL STATUS HUD */}
      <div className="astra-card astra-card-p bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 relative z-10">
          {/* Left: Vessel Identity & Visual Graphic */}
          <div className="flex items-start gap-5">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0 grid place-items-center">
              <TopDownVesselIcon category={myVessel.category} size={42} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "Manrope" }}>
                  {myVessel.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  UNDERWAY AT SEA
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {myVessel.id} · {myVessel.category} ({myVessel.dwt}) · Flag: {myVessel.flag}
              </div>
              <div className="text-xs text-blue-200 font-mono pt-1">
                Cargo Onboard: <span className="text-amber-300 font-semibold">{myVessel.cargo}</span>
              </div>
            </div>
          </div>

          {/* Right: Live Bridge Telemetry HUD Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto font-mono text-center">
            <BridgeTelemetry label="CURRENT SPEED" value={myVessel.speed} sub="SOG GPS" accent="text-blue-400" />
            <BridgeTelemetry label="HEADING" value={myVessel.heading} sub="True Gyro" accent="text-slate-200" />
            <BridgeTelemetry label="ESTIMATED ETA" value="18 Hours" sub="Paradip Fairway" accent="text-emerald-400" />
            <BridgeTelemetry label="TELEMETRY PING" value="CONNECTED" sub="2m ago" accent="text-emerald-400" />
          </div>
        </div>

        {/* Route Corridor Banner */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin size={14} className="text-amber-400" />
            <span>Position: <strong className="text-white">{myVessel.coordinates}</strong> (Bay of Bengal TSS)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Voyage: <strong>{myVessel.origin}</strong> ➔ <strong>{myVessel.destination}</strong></span>
          </div>
        </div>
      </div>

      {/* LIVE NAUTICAL AIS CHART FOR VESSEL OPERATOR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation size={18} className="text-emerald-700" />
            <h2 className="text-lg font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
              Live Bridge Navigation & Marine Weather Chart
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            📡 ShipFinder Live AIS Feeds
          </span>
        </div>
        <EastCoastMap activePort="Paradip" />
      </div>

      {/* HEALTH GAUGES & PROPULSION STATUS RINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gauge 1: Engine Propulsion */}
        <div className="astra-card astra-card-p space-y-2 border-t-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="astra-label">Main Engine (MAN B&W)</span>
            <Gauge size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{myVessel.rpm}</div>
          <div className="text-xs text-emerald-700 font-bold font-mono flex items-center gap-1">
            <CheckCircle2 size={12} /> {myVessel.engineHealth} (Load 78%)
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Exhaust: 385°C · Press: {myVessel.oilPressure}</div>
        </div>

        {/* Gauge 2: Fuel Level */}
        <div className="astra-card astra-card-p space-y-2 border-t-4 border-blue-600">
          <div className="flex items-center justify-between">
            <span className="astra-label">Fuel Bunker (VLSFO)</span>
            <Fuel size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{myVessel.fuelLevel}</div>
          <div className="text-xs text-slate-600 font-mono">2,140 MT Remaining</div>
          <div className="text-[11px] text-slate-500 font-mono">Daily Burn: {myVessel.dailyBurn}</div>
        </div>

        {/* Gauge 3: Thermal & Cooling */}
        <div className="astra-card astra-card-p space-y-2 border-t-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="astra-label">Cooling & Oil Temp</span>
            <Thermometer size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">{myVessel.coolingTemp}</div>
          <div className="text-xs text-emerald-700 font-bold font-mono">NORMAL RANGE</div>
          <div className="text-[11px] text-slate-500 font-mono">Lub Oil: 48°C (Nominal)</div>
        </div>

        {/* Gauge 4: Hull & Vibration */}
        <div className="astra-card astra-card-p space-y-2 border-t-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="astra-label">Shaft Vibration (RMS)</span>
            <HeartPulse size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">1.8 mm/s</div>
          <div className="text-xs text-emerald-700 font-bold font-mono">NORMAL (Threshold 4.5)</div>
          <div className="text-[11px] text-slate-500 font-mono">Bearing Temp: 52°C</div>
        </div>

        {/* Gauge 5: Satellite Comms */}
        <div className="astra-card astra-card-p space-y-2 border-t-4 border-blue-900">
          <div className="flex items-center justify-between">
            <span className="astra-label">Bridge SatComms</span>
            <Radio size={16} className="text-blue-900" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">ONLINE</div>
          <div className="text-xs text-blue-900 font-bold font-mono">INMARSAT-C</div>
          <div className="text-[11px] text-slate-500 font-mono">Latency: 180ms · Signal 98%</div>
        </div>
      </div>

      {/* ROW 3: MAINTENANCE SCHEDULE & NEARBY ASSISTANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Maintenance & Planned Service Timeline */}
        <div className="astra-card astra-card-p lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-blue-900" />
              <span className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                Maintenance Timeline & Machinery Logs
              </span>
            </div>
            <Link to="/vessel-health" className="text-xs font-bold text-blue-900 hover:underline">
              View All Logs
            </Link>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {[
              { task: "Main Propulsion Fuel Injector Inspection", status: "UPCOMING", date: "Sep 05, 2026 (At Paradip Port)", badge: "bg-blue-50 text-blue-700 border-blue-200" },
              { task: "Turbocharger Casing Wash & Clean", status: "COMPLETED", date: "Aug 15, 2026 (At Newcastle)", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { task: "Lube Oil Separator Filter Replacement", status: "DUE IN 120h", date: "Routine 500h Service", badge: "bg-amber-50 text-amber-700 border-amber-200" },
              { task: "Auxiliary Generator #2 Overhaul", status: "COMPLETED", date: "Jul 28, 2026", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="font-sans font-semibold text-slate-800">{m.task}</div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">{m.date}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${m.badge}`}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Emergency & Nearby Assistance Panel */}
        <div className="astra-card astra-card-p border-l-4 border-amber-500 space-y-3">
          <div className="flex items-center gap-2">
            <LifeBuoy size={18} className="text-amber-600" />
            <span className="font-extrabold text-slate-900 text-sm" style={{ fontFamily: "Manrope" }}>
              Nearby Vessel Assistance Network
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            In the event of severe weather, steering gear issues, or main engine alarms, ASTRA continuously identifies the closest companion vessels for mutual standby assistance.
          </p>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs font-mono space-y-1 text-amber-900">
            <div className="font-bold">CLOSEST STANDBY VESSEL:</div>
            <div>MV Bengal Voyager (Panamax) · 38 NM Distance</div>
            <div className="text-[11px] text-amber-700">Estimated Response Time: ~2.4 Hours</div>
          </div>

          <Link to="/incidents" className="btn-secondary w-full justify-center text-xs py-2">
            Open Incident & Assistance Center <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function BridgeTelemetry({ label, value, sub, accent = "text-white" }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-lg">
      <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">{label}</div>
      <div className={`text-base font-extrabold mt-0.5 ${accent}`}>{value}</div>
      <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}
