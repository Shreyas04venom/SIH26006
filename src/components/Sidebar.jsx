import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, FilePlus2, LineChart, Ship, Anchor, Route, 
  HeartPulse, AlertOctagon, BellRing, GitCompareArrows, 
  FileBarChart2, ClipboardList, Database, Network, User, Settings, LogOut, Waves, LifeBuoy, Wrench,
  PanelLeftClose
} from "lucide-react";
import { useAuth } from "../lib/auth";

export default function Sidebar({ isOpen = true, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || "logistics_manager";

  const doLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Role-specific clean minimal navigation (2-3 high-impact items per persona)
  const getNavItems = () => {
    switch (role) {
      case "contractor":
      case "chartering_operator":
        return [
          { to: "/", label: "Company Tenders Desk", icon: LayoutDashboard },
          { to: "/vessel-health", label: "Vessel Health & Diagnostics", icon: HeartPulse },
          { to: "/decision-history", label: "Charter Bookings & Fixtures", icon: ClipboardList },
        ];
      case "road_transporter":
      case "transporter":
        return [
          { to: "/", label: "Road Corridor & Gate Radar", icon: LayoutDashboard },
          { to: "/road-logistics", label: "Fleet Dispatch & Gate Passes", icon: ClipboardList },
          { to: "/vessel-health", label: "Fleet Telemetry & Diagnostics", icon: HeartPulse },
        ];
      case "port_operator":
      case "vessel_operator":
        return [
          { to: "/", label: "Port Terminal Command", icon: LayoutDashboard },
          { to: "/port-intelligence", label: "Berth Dispatch & Conflict Solver", icon: Anchor },
        ];
      case "admin":
        return [
          { to: "/", label: "System Overview", icon: LayoutDashboard },
          { to: "/data-sources", label: "Data Pipelines", icon: Database },
          { to: "/architecture", label: "Architecture", icon: Network },
        ];
      case "company":
      case "logistics_manager":
      default:
        return [
          { to: "/", label: "Multimodal Dashboard", icon: LayoutDashboard },
          { to: "/new-requirement", label: "New Shipment Wizard", icon: FilePlus2 },
          { to: "/decision-history", label: "Contract Fixtures & History", icon: ClipboardList },
          { to: "/voyage-tracking", label: "Live Corridor Radar", icon: Waves },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    if (role === "contractor" || role === "chartering_operator") return "CONTRACTOR";
    if (role === "road_transporter" || role === "transporter") return "ROAD FLEET";
    if (role === "port_operator" || role === "vessel_operator") return "PORT OPS";
    if (role === "admin") return "ADMIN";
    return "COMPANY";
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden print:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}
      <aside
        className={`transition-all duration-300 ease-in-out shrink-0 bg-slate-50 flex flex-col h-screen fixed lg:sticky top-0 left-0 z-50 lg:z-30 print:hidden shadow-2xl lg:shadow-none ${
          isOpen ? "w-64 border-r border-slate-200 opacity-100 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 border-r-0 overflow-hidden opacity-0 pointer-events-none"
        }`}
      >
      <div className="w-64 flex flex-col h-full flex-1 min-w-[16rem]">
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-900 text-white grid place-items-center font-mono font-extrabold text-base shadow-sm">
              A
            </div>
            <div>
              <div className="font-extrabold tracking-tight text-slate-900 text-lg leading-none" style={{ fontFamily: "Manrope" }}>
                ASTRA
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mt-1">
                Maritime Intelligence
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Hide Menu Bar"
              aria-label="Hide Sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>

      {/* Role Badge In Sidebar */}
      <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Active Workspace:</span>
        <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-blue-900 text-white">
          {role === "logistics_manager" ? "LOGISTICS" : role === "chartering_operator" ? "CHARTERING" : role === "vessel_operator" ? "VESSEL OPS" : "ADMIN"}
        </span>
      </div>

      {/* Dynamic Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5" data-testid="sidebar-nav">
        {navItems.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === "/"}
            className={({ isActive }) => `astra-nav-link ${isActive ? "active" : ""}`}
            data-testid={`nav-${n.to.replace(/\//g, "") || "home"}`}
          >
            <n.icon size={16} strokeWidth={1.75} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Bar */}
      <div className="border-t border-slate-200 p-3.5 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-900 text-white grid place-items-center font-bold text-xs shrink-0">
            {(user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">{user?.name || "User"}</div>
            <div className="text-[10px] text-slate-500 truncate uppercase tracking-wider font-mono">
              {role.replace(/_/g, " ")}
            </div>
          </div>
          <button data-testid="logout-btn" onClick={doLogout} className="text-slate-400 hover:text-red-600 p-1 transition-colors" title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  </aside>
</>
);
}
