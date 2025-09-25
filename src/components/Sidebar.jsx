import { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaBox,
  FaChartBar,
  FaCog,
  FaOutdent,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/" },
    { name: "Inventory", icon: <FaBox />, path: "/inventory" },
    { name: "Reports", icon: <FaChartBar />, path: "/reports" },
    { name: "Stock Out", icon: <FaOutdent />, path: "/keluar-stock" },
    { name: "Settings", icon: <FaCog />, path: "/setting" },
  ];

  return (
    <div className="flex">
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 m-2 text-gray-700 bg-gray-200 rounded z-20 fixed"
        onClick={() => setSidebarOpen(true)}
      >
        <FaBars size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 z-30
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          md:translate-x-0 md:static
          ${collapsed ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:justify-center">
          {!collapsed && <h2 className="text-xl font-bold">Menu</h2>}
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <FaTimes size={20} />
          </button>
          {/* Collapse button desktop */}
          <button
            className="hidden md:block ml-auto"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
        </div>

        {/* Menu */}
        <ul className="mt-4">
          {menuItems.map((item) => (
            <li key={item.name} className="mt-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-2 rounded hover:bg-gray-700 ${
                    isActive ? "bg-gray-700" : ""
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && <span className="ml-2">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
