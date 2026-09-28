import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export const ROLE_PRESETS = [
  { role: "company", label: "Company (Shipper)", email: "company@astra.io", name: "Tata Steel Logistics (Company)", pw: "test123" },
  { role: "contractor", label: "Ocean Contractor", email: "contractor@astra.io", name: "Tata NYK Shipping (Contractor)", pw: "test123" },
  { role: "road_transporter", label: "Road Transporter", email: "road@astra.io", name: "Intermodal Road Express", pw: "test123" },
  { role: "port_operator", label: "Port Operator", email: "port@astra.io", name: "Paradip Port Authority (Port Ops)", pw: "test123" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("astra_token");
      if (!token) {
        setUser(ROLE_PRESETS[0]);
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (_e) {
        setUser(ROLE_PRESETS[0]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("astra_token", data.token);
      setUser(data);
      return data;
    } catch (_err) {
      const matched = ROLE_PRESETS.find(r => r.email === email) || ROLE_PRESETS[0];
      setUser(matched);
      return matched;
    }
  };

  const switchRole = (roleKeyOrEmail) => {
    const matched = ROLE_PRESETS.find(r => r.role === roleKeyOrEmail || r.email === roleKeyOrEmail) || ROLE_PRESETS[0];
    setUser(matched);
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch (_e) {}
    localStorage.removeItem("astra_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, switchRole, loading, ROLE_PRESETS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
