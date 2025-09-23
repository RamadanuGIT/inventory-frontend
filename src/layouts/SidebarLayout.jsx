import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const SidebarLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 max-md:p-15">
        <Outlet />
      </main>
    </div>
  );
};

export default SidebarLayout;
