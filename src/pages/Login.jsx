import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Building2, Ship, Truck, Anchor } from "lucide-react";

const ROLE_PRESETS = [
  { role: "company", label: "Company (Cargo Owner)", email: "company@astra.io", pw: "test123", icon: Building2, desc: "Create requirements, evaluate multimodal AI options, sign fixtures" },
  { role: "contractor", label: "Ocean Contractor", email: "contractor@astra.io", pw: "test123", icon: Ship, desc: "Fleet allocation, vessel health diagnostics, charter operations" },
  { role: "road_transporter", label: "Road Transporter", email: "road@astra.io", pw: "test123", icon: Truck, desc: "First/Last mile trucking, dispatch schedules, port gate passes" },
  { role: "port_operator", label: "Port Terminal Ops", email: "port@astra.io", pw: "test123", icon: Anchor, desc: "Berth scheduling, crane allocation, dynamic delay conflict solver" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("company@astra.io");
  const [password, setPassword] = useState("test123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (e2) {
      setErr(e2?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (r) => {
    setEmail(r.email);
    setPassword(r.pw);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left panel */}
      <div className="hidden lg:block relative overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1575528941322-c74397246f19?crop=entropy&cs=srgb&fm=jpg&q=85"
          alt="cargo ship"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-blue-950/60" />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white text-blue-900 grid place-items-center font-mono font-extrabold text-lg">A</div>
            <div>
              <div className="font-extrabold text-2xl tracking-tight" style={{ fontFamily: "Manrope" }}>ASTRA</div>
              <div className="text-xs uppercase tracking-widest text-blue-100">Multimodal Maritime & Inland Logistics</div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight" style={{ fontFamily: "Manrope" }}>
              End-to-End Multimodal Supply Chain Intelligence.
            </h1>
            <p className="mt-4 text-blue-100 max-w-lg leading-relaxed">
              Factory siding ➔ Inland Road ➔ Origin Port ➔ Ocean Freight ➔ Dest Port ➔ Last-Mile Road Delivery.
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-blue-200">
              <span className="w-8 h-px bg-blue-300" />
              <span>4 Synchronized Profiles · Real-Time Simulation Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-md" data-testid="login-form">
          <div className="mb-8">
            <div className="astra-label mb-2">Sign In</div>
            <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: "Manrope" }}>Welcome to ASTRA</h2>
            <p className="text-sm text-slate-500 mt-2">Select a 1-click role preset to enter:</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            {ROLE_PRESETS.map((r) => (
              <button
                type="button"
                key={r.role}
                onClick={() => quickLogin(r)}
                data-testid={`role-${r.role}`}
                className={`border rounded-lg p-3 text-left transition-all ${email === r.email ? "border-blue-900 bg-blue-50/50 shadow-sm ring-1 ring-blue-900" : "border-slate-200 hover:border-slate-300 bg-white"}`}
              >
                <r.icon size={16} className="text-blue-900 mb-1.5" strokeWidth={1.75} />
                <div className="text-xs font-semibold text-slate-900 leading-tight">{r.label}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">{r.email}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="astra-label block mb-1.5">Email</label>
              <input
                data-testid="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="astra-label block mb-1.5">Password</label>
              <input
                data-testid="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-900 focus:border-blue-900 outline-none text-sm"
                required
              />
            </div>
            {err && <div className="text-red-600 text-sm" data-testid="login-error">{err}</div>}
            <button data-testid="login-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center h-11 text-xs font-bold">
              {loading ? "Signing in…" : "Sign in to Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
