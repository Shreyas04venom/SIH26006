import React from "react";
import Badge from "../components/Badge";
import { 
  FileBarChart2, Download, TrendingUp, Anchor, Ship, Clock, 
  BarChart3, CheckCircle2, DollarSign, Calendar 
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from "recharts";
import { toast } from "sonner";

export default function Reports() {
  const handleExport = () => {
    toast.success("ASTRA Intelligence Summary Report exported as PDF/CSV.");
  };

  const portPerfData = [
    { port: "Paradip", turnaroundHours: 28, waitingHours: 12, volumeMT: "130k" },
    { port: "Dhamra", turnaroundHours: 24, waitingHours: 10, volumeMT: "110k" },
    { port: "Visakhapatnam", turnaroundHours: 42, waitingHours: 22, volumeMT: "125k" },
    { port: "Gangavaram", turnaroundHours: 26, waitingHours: 11, volumeMT: "95k" },
    { port: "Haldia", turnaroundHours: 52, waitingHours: 32, volumeMT: "60k" },
    { port: "Chennai", turnaroundHours: 49, waitingHours: 28, volumeMT: "105k" },
  ];

  const savingsData = [
    { month: "Apr", actual: 12.4, optimized: 11.2, savings: 84000 },
    { month: "May", actual: 14.8, optimized: 13.1, savings: 118000 },
    { month: "Jun", actual: 16.2, optimized: 14.5, savings: 142000 },
    { month: "Jul", actual: 18.0, optimized: 16.1, savings: 165000 },
    { month: "Aug", actual: 17.6, optimized: 15.8, savings: 148000 },
  ];

  return (
    <div className="space-y-6" data-testid="reports-page">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge kind="ANALYTICS" />
            <span className="astra-label">Executive Intelligence & Operational Reports</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1" style={{ fontFamily: "Manrope" }}>
            Operational Analytics & Performance Reports
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quarterly chartering cost savings, port discharge velocity benchmarks, and forecast accuracy audits.
          </p>
        </div>

        <button onClick={handleExport} className="btn-primary">
          <Download size={16} /> Export Intelligence Summary
        </button>
      </div>

      {/* TOP 4 EXECUTIVE KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="astra-card astra-card-p border-l-4 border-emerald-600">
          <div className="astra-label">Total Procurement Savings</div>
          <div className="astra-metric mt-1 font-mono text-emerald-700">$657,000</div>
          <div className="text-xs text-slate-500 mt-0.5">Trailing 5 Months vs. Market Spot</div>
        </div>
        <div className="astra-card astra-card-p border-l-4 border-blue-900">
          <div className="astra-label">Forecast Win Rate (R²)</div>
          <div className="astra-metric mt-1 font-mono text-blue-900">94.6%</div>
          <div className="text-xs text-slate-500 mt-0.5">180-Day Rolling Evaluation</div>
        </div>
        <div className="astra-card astra-card-p border-l-4 border-violet-600">
          <div className="astra-label">Average Demurrage Reduction</div>
          <div className="astra-metric mt-1 font-mono text-violet-700">-38.5%</div>
          <div className="text-xs text-slate-500 mt-0.5">via Congestion-Aware Routing</div>
        </div>
        <div className="astra-card astra-card-p border-l-4 border-amber-500">
          <div className="astra-label">Fleet Capacity Utilization</div>
          <div className="astra-metric mt-1 font-mono text-slate-900">93.8%</div>
          <div className="text-xs text-slate-500 mt-0.5">Across 86 Monitored Voyages</div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Monthly Spot vs Optimized Savings */}
        <div className="astra-card astra-card-p space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <div className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                Freight Rate ($/t): Market Spot vs. ASTRA Optimized Fixture
              </div>
              <div className="text-xs text-slate-500">Consistent unit cost savings achieved per metric ton</div>
            </div>
            <Badge kind="ANALYTICS" />
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#475569", fontFamily: "JetBrains Mono" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B", fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(val) => [`$${val}/t`]} contentStyle={{ fontSize: 12, fontFamily: "JetBrains Mono" }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Sans" }} />
                <Bar dataKey="actual" name="Unoptimized Market Spot ($/t)" fill="#94A3B8" radius={[2, 2, 0, 0]} />
                <Bar dataKey="optimized" name="ASTRA Optimized Fixture ($/t)" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: East Coast Port Turnaround Benchmarks */}
        <div className="astra-card astra-card-p space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <div className="font-extrabold text-slate-900 text-base" style={{ fontFamily: "Manrope" }}>
                East Coast India Port Turnaround Benchmarks
              </div>
              <div className="text-xs text-slate-500">Total Turnaround Hours vs. Anchorage Queue Hours</div>
            </div>
            <Badge kind="MONITORING" />
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portPerfData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="port" tick={{ fontSize: 10, fill: "#475569", fontFamily: "IBM Plex Sans" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B", fontFamily: "JetBrains Mono" }} tickFormatter={(v) => `${v}h`} />
                <Tooltip formatter={(val) => [`${val} Hours`]} contentStyle={{ fontSize: 12, fontFamily: "JetBrains Mono" }} />
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "IBM Plex Sans" }} />
                <Bar dataKey="turnaroundHours" name="Total Turnaround (Hours)" fill="#3B82F6" />
                <Bar dataKey="waitingHours" name="Anchorage Queue Delay (Hours)" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
