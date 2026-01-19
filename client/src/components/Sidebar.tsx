"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckCircle,
  Settings,
  Download,
  FileText,
  Layers,
  LogOut,
  UserCheck,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";

const mainNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Manage Proof", href: "/manage-proof", icon: CheckCircle },
  { name: "Verified Panelists", href: "/verified-panelists", icon: UserCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

const reportNavItems = [
  { name: "Export Data", href: "/export-data", icon: Download },
  { name: "Audit Logs", href: "/audit-logs", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resetAll } = useAppContext();

  const handleEndSession = () => {
    resetAll();
    router.push("/"); // Redirects to landing page
  };

  return (
    <aside className="w-64 h-screen bg-[#14141a] border-r border-[#2a2a36] flex flex-col fixed top-0 left-0 z-40">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-semibold text-white">ProofPanel</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {/* Main Section */}
        <div className="mb-6">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Main
          </p>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? "bg-purple-600/20 text-purple-400" : "text-gray-400 hover:bg-[#1a1a24] hover:text-white"}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Reports Section */}
        <div>
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Reports
          </p>
          <ul className="space-y-1">
            {reportNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? "bg-purple-600/20 text-purple-400" : "text-gray-400 hover:bg-[#1a1a24] hover:text-white"}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* End Session Button */}
      <div className="px-3 pb-2">
        <button
          onClick={handleEndSession}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">End Session</span>
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[#2a2a36]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">AD</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
