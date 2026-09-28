import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        return false;
      }
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
    <div className="min-h-screen flex bg-white print:block">
      <div className="print:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 print:w-full print:block">
        <div className="print:hidden">
          <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={handleToggleSidebar} />
        </div>
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 bg-white overflow-x-hidden print:p-0 print:m-0 print:overflow-visible print:w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
