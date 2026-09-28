import React from "react";

const STYLES = {
  ML: { bg: "bg-violet-50", text: "text-violet-800", border: "border-violet-200" },
  RULE: { bg: "bg-slate-50", text: "text-slate-800", border: "border-slate-300" },
  OPTIMIZATION: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
  MONITORING: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  ANALYTICS: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  "USER DECISION": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  "DECISION SUPPORT": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
};

export default function Badge({ kind = "ML", children }) {
  const s = STYLES[kind] || STYLES.ML;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-widest px-2 py-1 rounded ${s.bg} ${s.text} border ${s.border} font-mono`}>
      [{children || kind}]
    </span>
  );
}
