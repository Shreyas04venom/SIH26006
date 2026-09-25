import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("astra_sidebar_open");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("astra_sidebar_open", String(next));
      } catch {}
      return next;
    });
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    try {
      localStorage.setItem("astra_sidebar_open", "false");
    } catch {}
  };

  return (
    <div className="min-h-screen flex bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={handleToggleSidebar} />
        <main className="flex-1 p-6 md:p-8 bg-white overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
