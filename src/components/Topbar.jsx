import React, { useState } from "react";
import { Search, Bell, Users, Sparkles, Play, CheckCircle2, ChevronRight, X, Compass, AlertTriangle, Anchor, Navigation, RefreshCw } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { useFlow } from "../lib/flow";
import { toast } from "sonner";

export default function Topbar() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [showDemoTour, setShowDemoTour] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Read live scenario and event state from flow context
  const {
    requirement,
    weatherDelayActive,
    berthReallocated,
    portCongestionActive,
    portDiverted,
    eventsList,
  } = useFlow();

  const hasBookedVessel = Boolean(requirement && requirement.status === "ACTIVE_IN_TRANSIT");

  // Build notification list dynamically
  const notifications = [];

  // Dynamic Real-time Event System notifications (New requirements, Contractor accept/reject/wait)
  if (eventsList && eventsList.length > 0) {
    eventsList.forEach((ev) => {
      const isRecipient = !ev.roleRecipient || 
        ev.roleRecipient.includes(user?.role) || 
        (user?.role === "chartering_operator" && ev.roleRecipient.includes("contractor")) ||
        (user?.role === "contractor" && ev.roleRecipient.includes("contractor")) ||
        (user?.role === "company" && ev.roleRecipient.includes("company")) ||
        (user?.role === "logistics_manager" && ev.roleRecipient.includes("company"));

      if (isRecipient) {
        let icon = "🔔";
        let bgClass = "bg-blue-50 border-blue-200 text-blue-900";
        let detailClass = "text-blue-700";

        if (ev.severity === "WARNING" || ev.type === "CONTRACTOR_REJECTED_WITH_SOLUTION") {
          icon = "⚠️";
          bgClass = "bg-amber-50 border-amber-200 text-amber-900";
          detailClass = "text-amber-700";
        } else if (ev.severity === "SUCCESS" || ev.type === "CONTRACTOR_ACCEPTED") {
          icon = "✅";
          bgClass = "bg-emerald-50 border-emerald-200 text-emerald-900";
          detailClass = "text-emerald-700";
        } else if (ev.type === "NEW_REQUIREMENT_CREATED") {
          icon = "📦";
          bgClass = "bg-purple-50 border-purple-200 text-purple-900";
          detailClass = "text-purple-700";
        } else if (ev.type === "CONTRACTOR_WAIT_SHIPBUILDER") {
          icon = "⏳";
          bgClass = "bg-blue-50 border-blue-200 text-blue-900";
          detailClass = "text-blue-700";
        }

        notifications.push({
          id: ev.id,
          type: ev.severity || "info",
          icon,
          title: ev.title,
          detail: ev.detail || ev.summary,
          bgClass,
          detailClass,
          time: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"
        });
      }
    });
  }

  if (hasBookedVessel && weatherDelayActive && !berthReallocated) {
    notifications.push({
      id: "s1-weather",
      type: "warning",
      icon: "⚡",
      title: "Scenario 1: Monsoon Swell Delay — Berth Conflict",
      detail: `MV ${requirement?.selectedVessel?.name || "Bengal Voyager"} held in sea · +10h delay buffer active`,
      extra: {
        incoming: {
          vesselName: "MV Coastal Pride",
          category: "Supramax",
          dwt: "58,000 DWT",
          operator: "JSW Shipping Ltd",
          berthId: `${requirement?.destinationPort || "Paradip"} · Bulk Berth #2`,
          status: "Approaching berth · ETA ~45 min",
        }
      },
      bgClass: "bg-amber-50 border-amber-200 text-amber-900",
      detailClass: "text-amber-700",
      time: "Just now",
    });
  }

  if (hasBookedVessel && weatherDelayActive && berthReallocated) {
    notifications.push({
      id: "s1-resolved",
      type: "success",
      icon: "✅",
      title: "Scenario 1 Resolved: Berth Reallocated",
      detail: `Vessel cleared to proceed · New berth assigned at ${requirement?.destinationPort || "Paradip"} · Feeder vessel departed`,
      bgClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
      detailClass: "text-emerald-700",
      time: "Just now",
    });
  }

  if (hasBookedVessel && portCongestionActive && !portDiverted) {
    notifications.push({
      id: "s2-congestion",
      type: "critical",
      icon: "🚨",
      title: "Scenario 2 Active: Port Congestion",
      detail: `${requirement?.destinationPort || "Paradip"} Port congested · Auto-diversion to Krishnapatnam Berth #4 awaiting approval`,
      bgClass: "bg-red-50 border-red-200 text-red-900",
      detailClass: "text-red-700",
      time: "Just now",
    });
  }

  if (hasBookedVessel && portCongestionActive && portDiverted) {
    notifications.push({
      id: "s2-diverted",
      type: "info",
      icon: "🔀",
      title: "Scenario 2 Resolved: Port Diversion Approved",
      detail: `Vessel rerouted · Arriving at Krishnapatnam Port Berth #4 · ETA updated across all stakeholders`,
      bgClass: "bg-blue-50 border-blue-200 text-blue-900",
      detailClass: "text-blue-700",
      time: "Just now",
    });
  }

  const notifCount = notifications.length;

  const switchRole = async (email, roleName) => {
    try {
      const pw = email === "admin@astra.io" ? "admin123" : "test123";
      await login(email, pw);
      toast.success(`Switched active workspace to: ${roleName}`);
      nav("/");
    } catch (err) {
      console.error("Role switch error:", err);
      toast.error("Failed to switch role");
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 gap-4 sticky top-0 z-20">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            data-testid="topbar-search"
            placeholder="Search vessels, ports, requirements, voyages…"
            className="w-full h-9 pl-9 pr-4 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 font-medium"
          />
        </div>
      </div>

      {/* Center/Right Controls */}
      <div className="flex items-center gap-3">
        {/* 1-Click 4-Persona Role Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
          <button
            onClick={() => switchRole("company@astra.io", "Tata Steel Logistics (Company)")}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${(!user?.role || user?.role === "company" || user?.role === "logistics_manager") ? "bg-blue-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}
            title="Switch to Company (Shipper / Cargo Owner)"
          >
            <span>🏢</span> COMPANY
          </button>
          <button
            onClick={() => switchRole("contractor@astra.io", "Tata NYK Shipping (Contractor)")}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${(user?.role === "contractor" || user?.role === "chartering_operator") ? "bg-blue-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}
            title="Switch to Ocean Contractor (Fleet & Vessel Operator)"
          >
            <span>🚢</span> CONTRACTOR
          </button>
          <button
            onClick={() => switchRole("road@astra.io", "Intermodal Road Express (Transporter)")}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${(user?.role === "road_transporter" || user?.role === "transporter") ? "bg-blue-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}
            title="Switch to Road Transporter (Inland Fleet & Gate Passes)"
          >
            <span>🚛</span> ROAD FLEET
          </button>
          <button
            onClick={() => switchRole("port@astra.io", "Paradip Port Authority (Port Ops)")}
            className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1.5 ${(user?.role === "port_operator" || user?.role === "vessel_operator") ? "bg-blue-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"}`}
            title="Switch to Port Operator (Berth Allocation & Dynamic Reschedule)"
          >
            <span>⚓</span> PORT OPS
          </button>
        </div>

        {/* Prototype Data Tag */}
        <span className="astra-sim-tag hidden lg:inline">SIMULATED DATA</span>

        {/* Notifications Icon — badge only shown when notifications exist */}
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-100"
          data-testid="notifications-btn"
          aria-label="Notifications"
        >
          <Bell
            size={18}
            strokeWidth={1.75}
            className={notifCount > 0 ? "text-blue-900" : "text-slate-400"}
          />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] grid place-items-center font-bold animate-pulse">
              {notifCount}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-900 text-white grid place-items-center text-xs font-bold font-mono">
          {(user?.name || "U").slice(0, 1).toUpperCase()}
        </div>
      </div>

      {/* NOTIFICATION DRAWER OVERLAY */}
      {showNotifications && (
        <div className="absolute top-16 right-6 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl text-xs z-30 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm" style={{ fontFamily: "Manrope" }}>
                Notifications
              </span>
              {notifCount > 0 && (
                <span className="bg-red-100 text-red-700 border border-red-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {notifCount} active
                </span>
              )}
            </div>
            <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700">
              <X size={15} />
            </button>
          </div>

          {/* Notification list or empty state */}
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {notifCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center text-slate-400">
                  <Bell size={18} strokeWidth={1.5} />
                </div>
                <p className="text-slate-500 font-semibold text-xs">No notifications</p>
                <p className="text-slate-400 text-[10px] leading-tight max-w-[180px]">
                  {!hasBookedVessel
                    ? "Book a shipment and trigger a scenario to see live alerts here."
                    : "Trigger a scenario on the Dashboard to see real-time alerts here."}
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-lg border ${n.bgClass} space-y-0.5`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{n.icon}</span>
                      <span>{n.title}</span>
                    </div>
                    <span className="text-[9px] opacity-60 shrink-0">{n.time}</span>
                  </div>
                  <div className={`text-[11px] leading-snug ${n.detailClass}`}>
                    {n.detail}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-slate-100 px-4 py-2 bg-slate-50 text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <RefreshCw size={10} />
            Notifications reset on page refresh
          </div>
        </div>
      )}
    </header>
  );
}
