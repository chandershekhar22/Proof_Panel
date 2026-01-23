"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  Layers,
  TrendingUp,
  ChevronRight,
  Plus,
  Search,
  Filter,
  LogOut,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { name: "Dashboard", href: "/insight/dashboard", icon: LayoutDashboard },
  { name: "My Surveys", href: "/insight/surveys", icon: FileText },
  { name: "Respondent Pool", href: "/insight/respondents", icon: Users },
  { name: "Analytics", href: "/insight/analytics", icon: BarChart3 },
  { name: "Settings", href: "/insight/settings", icon: Settings },
];

const stats = [
  { label: "Active Surveys", value: "8", icon: FileText, color: "text-purple-400" },
  { label: "Total Responses", value: "1,247", icon: Users, color: "text-purple-400" },
  { label: "Completion Rate", value: "87%", icon: TrendingUp, color: "text-purple-400" },
  { label: "Verified Respondents", value: "892", icon: CheckCircle, color: "text-purple-400" },
];

const activeSurveys = [
  {
    id: 1,
    title: "Enterprise Software Decision Makers",
    status: "active",
    responses: 156,
    target: 200,
    daysLeft: 5,
    completionRate: 78,
  },
  {
    id: 2,
    title: "Developer Tools & Workflow Study",
    status: "active",
    responses: 89,
    target: 150,
    daysLeft: 12,
    completionRate: 59,
  },
  {
    id: 3,
    title: "Healthcare IT Decision Maker Panel",
    status: "draft",
    responses: 0,
    target: 100,
    daysLeft: null,
    completionRate: 0,
  },
];

const recentResponses = [
  { id: 1, survey: "Enterprise Software Decision Makers", respondent: "VP Engineering", time: "2 hours ago", verified: true },
  { id: 2, survey: "Developer Tools & Workflow Study", respondent: "Senior Developer", time: "3 hours ago", verified: true },
  { id: 3, survey: "Enterprise Software Decision Makers", respondent: "CTO", time: "5 hours ago", verified: true },
  { id: 4, survey: "Developer Tools & Workflow Study", respondent: "Tech Lead", time: "6 hours ago", verified: false },
];

export default function InsightDashboard() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d0d12] border-r border-[#1a1a24] flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-white">Proof</span>
            <span className="text-purple-400">Panel</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-purple-500/10 text-purple-400"
                        : "text-gray-400 hover:bg-[#1a1a24] hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-3 pb-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>

        {/* Company Info Box */}
        <div className="p-4 border-t border-[#1a1a24]">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium">Insight Company</span>
            </div>
            <p className="text-gray-500 text-xs">Access to verified respondents</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, Researcher</h1>
            <p className="text-gray-400">Manage your surveys and access verified respondents</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            Create Survey
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Active Surveys Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Active Surveys</h2>
            <Link
              href="/insight/surveys"
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Survey Cards */}
          <div className="space-y-4">
            {activeSurveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-5 hover:border-[#2a2a36] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold">{survey.title}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          survey.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {survey.status === "active" ? "Active" : "Draft"}
                      </span>
                    </div>
                    {survey.status === "active" && (
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400 text-sm">
                            {survey.responses}/{survey.target} responses
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-400 text-sm">{survey.daysLeft} days left</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    {survey.status === "active" && (
                      <>
                        <div className="text-right">
                          <p className="text-gray-500 text-xs mb-1">Completion</p>
                          <p className="text-purple-400 font-semibold">{survey.completionRate}%</p>
                        </div>
                        <div className="w-32 bg-[#1a1a24] rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${survey.completionRate}%` }}
                          ></div>
                        </div>
                      </>
                    )}
                    <button
                      className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                        survey.status === "active"
                          ? "bg-[#1a1a24] hover:bg-[#2a2a36] text-white border border-[#2a2a36]"
                          : "bg-purple-500 hover:bg-purple-600 text-white"
                      }`}
                    >
                      {survey.status === "active" ? "View Results" : "Edit Draft"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Responses Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Responses</h2>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1a24] hover:bg-[#2a2a36] text-gray-400 rounded-lg text-sm transition-colors border border-[#2a2a36]">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-[#1a1a24] hover:bg-[#2a2a36] text-gray-400 rounded-lg text-sm transition-colors border border-[#2a2a36]">
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a1a24]">
                  <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">SURVEY</th>
                  <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">RESPONDENT</th>
                  <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">TIME</th>
                  <th className="text-left text-gray-500 text-xs font-medium px-5 py-3">VERIFIED</th>
                </tr>
              </thead>
              <tbody>
                {recentResponses.map((response) => (
                  <tr key={response.id} className="border-b border-[#1a1a24] last:border-b-0 hover:bg-[#1a1a24]/50">
                    <td className="px-5 py-4 text-white text-sm">{response.survey}</td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{response.respondent}</td>
                    <td className="px-5 py-4 text-gray-500 text-sm">{response.time}</td>
                    <td className="px-5 py-4">
                      {response.verified ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
