import React, { useState } from "react";
import Badge from "../components/Badge";
import TopDownVesselIcon from "../components/VesselIcons";
import { 
  AlertOctagon, AlertTriangle, ShieldCheck, MapPin, LifeBuoy, 
  Radio, CheckCircle2, ChevronRight, ArrowRight, UserCheck, Clock, X 
} from "lucide-react";
import { toast } from "sonner";

export default function Incidents() {
  const [selectedIncidentId, setSelectedIncidentId] = useState("INC-401");
  const [assistanceRequested, setAssistanceRequested] = useState(false);

  const incidents = [
    {
      id: "INC-401",
      severity: "HIGH",
      title: "Main Engine Scavenge Air High Temperature Alarm",
      vessel: "MV Pacific Pioneer",
      category: "Capesize",
      location: "16.4281° N, 84.1524° E (Bay of Bengal TSS)",
      timestamp: "18 minutes ago",
      status: "RESPONSE IN PROGRESS",
      details: "Exhaust gas temperature on Cylinder #4 elevated to 425°C. Vessel reduced speed to 10.5 knots as precautionary safety measure.",
      nearbyCandidates: [
        { rank: 1, name: "MV Bengal Voyager", category: "Panamax", distance: "38 NM", eta: "2.4 Hours", status: "Underway / Radio Contact Open" },
        { rank: 2, name: "MV Eastern Horizon", category: "Supramax", distance: "64 NM", eta: "4.5 Hours", status: "Underway" },
        { rank: 3, name: "MV Coromandel Trader", category: "Handysize", distance: "92 NM", eta: "7.2 Hours", status: "Standby at Anchor" },
      ]
    },
    {
      id: "INC-402",
      severity: "MEDIUM",
      title: "Outer Anchorage Dwell Exceeded (>24h)",
      vessel: "MV Bengal Voyager",
      category: "Panamax",
      location: "Chennai Port Outer Roads",
      timestamp: "2 hours ago",
      status: "MONITORING",
      details: "Vessel has been awaiting pilot boarding for 26 hours due to high berth occupancy at container/coal terminals.",
      nearbyCandidates: []
    }
  ];

  const activeInc = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const handleRequestAssistance = (candidate) => {
    setAssistanceRequested(true);
    toast.success(`Assistance alert transmitted to ${candidate.name}. Awaiting Master confirmation.`);
  };

  return (
    <div className="space-y-6" data-testid="incidents-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="RULE" />
            <span className="astra-label">Maritime Incident Response & Nearby Mutual Assistance</span>
            <span className="astra-sim-tag">HUMAN DECISION WORKFLOW</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Incident Center & Assistance Dispatch
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time threshold incident triage, situational telemetry, and human-confirmed standby vessel assistance.
          </p>
        </div>
      </div>

      {/* 6-STEP INCIDENT RESPONSE WORKFLOW TIMELINE */}
      <div className="astra-card astra-card-p bg-slate-900 text-white">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono font-bold mb-3">
          ASTRA Standard Incident Response Progression
        </div>
        <div className="flex items-center justify-between text-center font-mono text-xs overflow-x-auto gap-2">
          <StepNode num="1" label="INCIDENT ALARM" active completed />
          <StepLine completed />
          <StepNode num="2" label="VERIFY TELEMETRY" active completed />
          <StepLine completed />
          <StepNode num="3" label="GPS LOCATION" active completed />
          <StepLine completed />
          <StepNode num="4" label="SEVERITY ASSESSMENT" active completed />
          <StepLine completed={assistanceRequested} />
          <StepNode num="5" label="NEARBY VESSELS" active={!assistanceRequested} completed={assistanceRequested} />
          <StepLine completed={assistanceRequested} />
          <StepNode num="6" label="HUMAN RESOLUTION" active={assistanceRequested} />
        </div>
      </div>

      {/* MAIN TWO-COLUMN INCIDENT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Incident Selector List */}
        <div className="space-y-3">
          <div className="text-xs uppercase font-mono font-bold text-slate-500">Active Incident Triage Queue</div>
          {incidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncidentId(inc.id)}
              className={`astra-card astra-card-p cursor-pointer transition-all space-y-2 ${
                inc.id === activeInc.id 
                  ? "border-2 border-red-500 bg-red-50/20 shadow-md" 
                  : "hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  inc.severity === "HIGH" ? "bg-red-600 text-white" : "bg-amber-500 text-white"
                }`}>
                  {inc.severity} SEVERITY
                </span>
                <span className="text-[10px] font-mono text-slate-400">{inc.timestamp}</span>
              </div>
              <div className="font-extrabold text-sm text-slate-900">{inc.title}</div>
              <div className="text-xs text-slate-600 font-mono">{inc.vessel} ({inc.category})</div>
            </div>
          ))}
        </div>

        {/* Right 2 Cols: Incident Details & Nearby Vessel Mutual Assistance */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Incident Profile */}
          <div className="astra-card astra-card-p space-y-4 border-l-4 border-red-500">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <AlertOctagon size={20} className="text-red-600" />
                  <span className="text-xl font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>
                    {activeInc.title}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-1">
                  Incident ID: <strong className="text-slate-900">{activeInc.id}</strong> · Logged {activeInc.timestamp}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
                {activeInc.status}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-slate-400 uppercase font-bold text-[10px]">AFFECTED VESSEL</div>
                <div className="font-bold text-slate-900 text-sm mt-1">{activeInc.vessel} ({activeInc.category})</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-slate-400 uppercase font-bold text-[10px]">GEOGRAPHIC COORDINATES</div>
                <div className="font-bold text-slate-900 text-sm mt-1">{activeInc.location}</div>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              <strong>Telemetry Assessment:</strong> {activeInc.details}
            </p>
          </div>

          {/* NEARBY VESSEL MUTUAL ASSISTANCE NETWORK */}
          {activeInc.nearbyCandidates.length > 0 && (
            <div className="astra-card astra-card-p space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <LifeBuoy size={18} className="text-blue-900" />
                  <span className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                    Nearby Vessels Ranked for Standby Assistance
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Ranked by Proximity & Response ETA</span>
              </div>

              <div className="space-y-2.5">
                {activeInc.nearbyCandidates.map((cand) => (
                  <div key={cand.name} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-900 text-white font-extrabold grid place-items-center shrink-0">
                        #{cand.rank}
                      </div>
                      <div>
                        <div className="font-sans font-bold text-slate-900 text-sm">{cand.name} ({cand.category})</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          Distance: <strong className="text-slate-800">{cand.distance}</strong> · Response ETA: <strong className="text-emerald-700">{cand.eta}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => handleRequestAssistance(cand)}
                        className={`btn-primary text-xs py-1.5 px-3 w-full sm:w-auto ${assistanceRequested && cand.rank === 1 ? "bg-emerald-600" : ""}`}
                        disabled={assistanceRequested}
                      >
                        {assistanceRequested && cand.rank === 1 ? "✓ Assistance Requested" : "Request Standby Assistance"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-500 bg-blue-50/60 p-2 rounded border border-blue-200">
                ℹ️ <strong>Operational Protocol:</strong> Standby requests transmit DSC alerts to the companion vessel bridge and require Master acknowledgement. No vessel is automatically dispatched without human signoff.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepNode({ num, label, active, completed }) {
  return (
    <div className="space-y-1 shrink-0">
      <div className={`w-6 h-6 rounded-full mx-auto grid place-items-center text-[10px] font-bold ${
        completed ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
      }`}>
        {completed ? "✓" : num}
      </div>
      <div className={`text-[9px] uppercase ${active ? "text-white font-bold" : "text-slate-400"}`}>
        {label}
      </div>
    </div>
  );
}

function StepLine({ completed }) {
  return (
    <div className={`h-0.5 flex-1 mx-1 mb-3 ${completed ? "bg-emerald-500" : "bg-slate-800"}`} />
  );
}
