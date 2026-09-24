import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./lib/auth";
import { FlowProvider } from "./lib/flow";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewRequirement from "./pages/NewRequirement";
import Validation from "./pages/Validation";
import FreightForecast from "./pages/FreightForecast";
import WaitingRisk from "./pages/WaitingRisk";
import VesselMatching from "./pages/VesselMatching";
import RouteIntelligence from "./pages/RouteIntelligence";
import PortIntelligence from "./pages/PortIntelligence";
import DecisionHistory from "./pages/DecisionHistory";
import VoyageTracking from "./pages/VoyageTracking";
import RoadLogistics from "./pages/RoadLogistics";
import VesselHealth from "./pages/VesselHealth";
import Incidents from "./pages/Incidents";
import Alerts from "./pages/Alerts";
import Scenarios from "./pages/Scenarios";
import Reports from "./pages/Reports";
import Placeholder from "./pages/Placeholder";
import "./App.css";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-slate-500 font-mono">Loading ASTRA…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <FlowProvider>
        <BrowserRouter>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <Protected>
                  <Layout />
                </Protected>
              }
            >
              {/* Role-adaptive master dashboard */}
              <Route index element={<Dashboard />} />
              
              {/* Core Procurement & Decision Support Flow */}
              <Route path="new-requirement" element={<NewRequirement />} />
              <Route path="validation" element={<Validation />} />
              <Route path="freight-forecast" element={<FreightForecast />} />
              <Route path="waiting-risk" element={<WaitingRisk />} />
              <Route path="vessel-matching" element={<VesselMatching />} />
              <Route path="route-intelligence" element={<RouteIntelligence />} />
              <Route path="port-intelligence" element={<PortIntelligence />} />
              <Route path="decision-history" element={<DecisionHistory />} />
              
              {/* Dedicated Operational Workspaces */}
              <Route path="voyage-tracking" element={<VoyageTracking />} />
              <Route path="road-logistics" element={<RoadLogistics />} />
              <Route path="vessel-health" element={<VesselHealth />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="scenarios" element={<Scenarios />} />
              <Route path="reports" element={<Reports />} />
              
              {/* Settings & Profile */}
              <Route path="profile" element={<Placeholder title="Profile & Preferences" phase="Phase 19" badge="ANALYTICS" description="User profile, role management, preferred East Coast ports, saved fixtures, and authorization tokens." />} />
              <Route path="settings" element={<Placeholder title="Platform Settings" phase="Phase 19" badge="ANALYTICS" description="System configuration, API keys, webhook notification triggers, and user access policies." />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FlowProvider>
    </AuthProvider>
  );
}
