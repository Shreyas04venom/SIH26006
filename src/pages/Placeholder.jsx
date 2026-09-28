import React from "react";
import Badge from "../components/Badge";
import { Construction } from "lucide-react";

export default function Placeholder({ title, phase, badge = "MONITORING", description }) {
  return (
    <div className="max-w-3xl space-y-4" data-testid={`placeholder-${title.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="flex items-center gap-2">
        <Badge kind={badge} />
        <span className="astra-label">{phase}</span>
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "Manrope" }}>{title}</h1>
      <div className="astra-card astra-card-p flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-900 grid place-items-center shrink-0">
          <Construction size={18}/>
        </div>
        <div>
          <div className="font-semibold text-slate-900">Coming in the next milestone</div>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
