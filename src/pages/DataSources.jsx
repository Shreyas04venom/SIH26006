import React from "react";
import Badge from "../components/Badge";
import { Database, RefreshCw, CheckCircle2, Radio, Server, Activity, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function DataSources() {
  const sources = [
    { name: "Baltic Dry Index (BDI) Exchange Feed", category: "Market", status: "CONNECTED", records: "12,450", frequency: "Daily 17:00 UTC", protocol: "REST / JSON", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Singapore VLSFO Bunker Fuel Index", category: "Commodity", status: "CONNECTED", records: "4,820", frequency: "Realtime Continuous", protocol: "WebSocket / FIX", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Indian Port Community System (IPA PCS 1x)", category: "Port Operations", status: "SYNCING", records: "38,900", frequency: "Hourly Polling", protocol: "EDI / XML API", badge: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "AIS Satellite Coastal Receiver Stream", category: "Telemetry", status: "CONNECTED", records: "142,000", frequency: "Sub-Minute Streaming", protocol: "NMEA / TCP Stream", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "India Meteorological Dept (IMD) Marine Weather", category: "Weather & Swell", status: "CONNECTED", records: "8,940", frequency: "6-Hour Forecast Cycles", protocol: "GRIB2 / NetCDF", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Global Ship Registry (IMO / Clarkson)", category: "Vessel Specs", status: "CONNECTED", records: "2,400", frequency: "Weekly Batch Update", protocol: "SQL Replication", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ];

  const handleSync = (srcName) => {
    toast.success(`Triggered manual pipeline refresh for: ${srcName}`);
  };

  return (
    <div className="space-y-6" data-testid="data-sources-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="ANALYTICS" />
            <span className="astra-label">Ingestion Pipelines & Protocol Connectivity</span>
            <span className="astra-sim-tag">PROTOTYPE PIPELINE FEEDS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Data Sources & Ingestion Hub
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time maritime market feeds, port community gateways, and satellite AIS telemetry connections.
          </p>
        </div>

        <button onClick={() => toast.success("All 6 ingestion pipelines synchronized.")} className="btn-primary">
          <RefreshCw size={16} /> Sync All Pipelines
        </button>
      </div>

      {/* PIPELINES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((src) => (
          <div key={src.name} className="astra-card astra-card-p space-y-3 border-t-4 border-blue-900">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-extrabold text-sm text-slate-900">{src.name}</span>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{src.category}</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${src.badge}`}>
                {src.status}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">RECORDS CACHED:</span>
                <span className="font-bold text-slate-900">{src.records}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FREQUENCY:</span>
                <span className="text-slate-700">{src.frequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PROTOCOL:</span>
                <span className="text-blue-900 font-bold">{src.protocol}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 font-mono font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Pipeline Healthy
              </span>
              <button 
                onClick={() => handleSync(src.name)} 
                className="btn-ghost text-xs py-1 px-2 text-blue-900 font-bold"
              >
                Refresh
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
