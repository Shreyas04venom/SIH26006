import React, { useEffect, useState } from "react";
import { useFlow } from "../lib/flow";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";

const STEPS = [
  "Input Validation",
  "Route Validation",
  "Cargo Validation",
  "Port Validation",
  "Data Availability Check",
  "Model Analysis",
];

export default function Validation() {
  const { requirement } = useFlow();
  const nav = useNavigate();
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (!requirement) { nav("/new-requirement"); return; }
    const t = setInterval(() => {
      setDone((d) => {
        if (d >= STEPS.length) { clearInterval(t); return d; }
        return d + 1;
      });
    }, 450);
    return () => clearInterval(t);
  }, [requirement, nav]);

  if (!requirement) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6" data-testid="validation-page">
      <div>
        <div className="astra-label">Phase 3 · Data Pipeline</div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "Manrope" }}>Validating your requirement</h1>
        <p className="text-sm text-slate-500 mt-1">Predictions use information available before the forecast point.</p>
      </div>

      <div className="astra-card astra-card-p">
        <ul className="space-y-4">
          {STEPS.map((label, i) => {
            const isDone = i < done;
            const isActive = i === done;
            return (
              <li key={label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full grid place-items-center border ${isDone ? "bg-emerald-500 border-emerald-500 text-white" : isActive ? "border-blue-900 text-blue-900" : "border-slate-300 text-slate-400"}`}>
                  {isDone ? <Check size={16} /> : isActive ? <Loader2 size={16} className="animate-spin" /> : i + 1}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${isDone ? "text-slate-900" : isActive ? "text-blue-900" : "text-slate-400"}`}>{label}</div>
                  <div className="text-xs text-slate-500">
                    {isDone ? "Passed" : isActive ? "Running…" : "Queued"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          {["Cargo", "Route", "Destination", "Date", "Historical Data"].map((c, i) => (
            <div key={c} className="border border-slate-200 rounded-md p-2">
              <div className="astra-label">{c}</div>
              <div className={`mt-1 text-emerald-600 font-bold ${done > i ? "opacity-100" : "opacity-30"}`}>✓</div>
            </div>
          ))}
        </div>

        {done >= STEPS.length && (
          <div className="mt-6 flex justify-end">
            <button className="btn-primary" data-testid="continue-forecast" onClick={() => nav("/freight-forecast")}>
              Continue to Freight Forecast →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
