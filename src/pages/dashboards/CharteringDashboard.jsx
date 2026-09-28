import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import Badge from "../../components/Badge";
import EastCoastMap from "../../components/EastCoastMap";
import TopDownVesselIcon from "../../components/VesselIcons";
import { Link, useNavigate } from "react-router-dom";
import { 
  Ship, Waves, Navigation, Clock, AlertTriangle, AlertOctagon, 
  ChevronRight, ArrowUpRight, Compass, ShieldCheck, MapPin, X, CheckCircle2 
} from "lucide-react";

export default function CharteringDashboard() {
  const nav = useNavigate();
  const [selectedDrawerVessel, setSelectedDrawerVessel] = useState(null);

  const activeVoyages = [
    { id: "VOY-801", vessel: "MV Pacific Pioneer", category: "Capesize", cargo: "165,000 MT Thermal Coal", origin: "Newcastle", dest: "Paradip", eta: "18h", delay: "None", status: "In Transit (Deepwater)", speed: "14.2 kts" },
    { id: "VOY-802", vessel: "MV Bengal Voyager", category: "Panamax", cargo: "70,000 MT Steam Coal", origin: "Taboneo", dest: "Chennai", eta: "4h", delay: "+6h Wait", status: "Approaching Outer Anchorage", speed: "13.8 kts" },
    { id: "VOY-803", vessel: "MV Eastern Horizon", category: "Supramax", cargo: "54,000 MT Coking Coal", origin: "Hay Point", dest: "Visakhapatnam", eta: "1.5d", delay: "None", status: "Underway", speed: "14.0 kts" },
    { id: "VOY-804", vessel: "MV Coromandel Trader", category: "Handysize", cargo: "32,000 MT Petcoke", origin: "Samarinda", dest: "Haldia", eta: "6h", delay: "+8h Tidal", status: "Pilot Station Awaited", speed: "12.5 kts" },
  ];

  return (
    <div className="space-y-6" data-testid="chartering-dashboard">
      {/* Workspace Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-700 text-white uppercase font-mono tracking-wider">
              Fleet Operations & Chartering Desk
            </span>
            <span className="astra-sim-tag">AIS / GPS TELEMETRY READY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Chartering Operations & Fleet Tracking
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time fleet positioning across Bay of Bengal, voyage delays, approaching arrivals, and charter fixtures.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/incidents" className="btn-secondary text-red-700 border-red-200">
            <AlertOctagon size={16} /> Open Incidents (2)
          </Link>
          <Link to="/voyage-tracking" className="btn-primary">
            <Waves size={16} /> Live Voyage Tracker
          </Link>
        </div>
      </div>

      {/* TOP 6 OPERATIONAL KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Available Fleet" value="18 Ready" sub="Spot Open in Region" icon={Ship} accent="text-emerald-700" />
        <KpiCard label="Vessels in Transit" value="8 Underway" sub="Bay of Bengal Tracks" icon={Navigation} accent="text-blue-900" />
        <KpiCard label="Approaching Ports" value="4 Vessels" sub="Next 24 Hours ETA" icon={Compass} accent="text-violet-700" />
        <KpiCard label="Anchorage Delays" value="3 Flagged" sub="Chennai & Kolkata" icon={Clock} accent="text-amber-600" />
        <KpiCard label="Open Incidents" value="1 High" sub="Engine Sensor Warning" icon={AlertOctagon} accent="text-red-600" />
        <KpiCard label="Charter Desk" value="6 Fixtures" sub="Pending Negotiation" icon={ShieldCheck} accent="text-blue-900" />
      </div>

      {/* MAIN VISUAL: LIVE FLEET AIS MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
              Live Fleet AIS Positions & Inbound Corridors
            </span>
            <span className="text-xs text-slate-500 font-mono">12 Ports · 8 Vessels Live Tracked</span>
          </div>
          <EastCoastMap />
        </div>

        {/* Right Side: Chartering Desk & Opportunities */}
        <div className="space-y-4">
          <div className="astra-card astra-card-p space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <div className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                  Active Charter Opportunities
                </div>
                <div className="text-xs text-slate-500">Spot & Period Cargo Requirements</div>
              </div>
              <Badge kind="OPTIMIZATION" />
            </div>

            <div className="space-y-2.5">
              {[
                { cargo: "70k MT Thermal Coal", route: "Taboneo ➔ Chennai", laycan: "Sep 02–06", status: "Optimal Matched" },
                { cargo: "160k MT Iron Ore", route: "Port Hedland ➔ Dhamra", laycan: "Sep 08–12", status: "Draft Restricted" },
                { cargo: "55k MT Coking Coal", route: "Gladstone ➔ Vizag", laycan: "Sep 04–08", status: "Review Fixture" }
              ].map((opp, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                    <span>{opp.cargo}</span>
                    <span className="text-emerald-700 font-mono text-[11px]">{opp.status}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-mono flex items-center justify-between">
                    <span>{opp.route}</span>
                    <span className="text-slate-400">{opp.laycan}</span>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/vessel-matching" className="btn-secondary w-full justify-center text-xs py-2">
              Open Full Charter Desk <ChevronRight size={14} />
            </Link>
          </div>

          {/* Operational Alerts Card */}
          <div className="astra-card astra-card-p space-y-2 border-l-4 border-amber-500">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase font-mono">
              <AlertTriangle size={15} /> Port Anchorage Alert
            </div>
            <div className="text-xs text-slate-700 font-medium leading-relaxed">
              Chennai Port pilot boarding delay increased to +6h due to tidal fairway restrictions. MV Bengal Voyager alerted to hold speed at 11 kts for fuel conservation.
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: ACTIVE VOYAGES MONITORING TABLE */}
      <div className="astra-card astra-card-p space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
            Active Voyage Monitoring Stream
          </div>
          <span className="text-xs font-mono text-slate-500">Auto-Refreshed via Telemetry Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left uppercase font-mono text-[10px] text-slate-400 border-b border-slate-200 bg-slate-50">
                <th className="py-2.5 px-3">Voyage ID</th>
                <th className="py-2.5 px-3">Vessel</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Cargo Manifest</th>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">ETA</th>
                <th className="py-2.5 px-3">Speed</th>
                <th className="py-2.5 px-3">Delay Status</th>
                <th className="py-2.5 px-3">Operational State</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {activeVoyages.map((v) => (
                <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-blue-900">{v.id}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 flex items-center gap-1.5">
                    <TopDownVesselIcon category={v.category} size={16} />
                    <span>{v.vessel}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{v.category}</td>
                  <td className="py-2.5 px-3 text-slate-700">{v.cargo}</td>
                  <td className="py-2.5 px-3">{v.origin} ➔ {v.dest}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">{v.eta}</td>
                  <td className="py-2.5 px-3">{v.speed}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      v.delay === "None" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {v.delay}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-800">{v.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
