"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Shield,
  DollarSign,
  User,
  Layers,
  CheckCircle,
  ClipboardList,
  TrendingUp,
  ChevronRight,
  Clock,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { name: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
  { name: "Available Surveys", href: "/member/surveys", icon: FileText },
  { name: "My Verifications", href: "/member/verifications", icon: Shield },
  { name: "Earnings", href: "/member/earnings", icon: DollarSign },
  { name: "Profile", href: "/member/profile", icon: User },
];

const stats = [
  { label: "Surveys Completed", value: "24", icon: ClipboardList, color: "text-emerald-400" },
  { label: "Total Earned", value: "$342.50", icon: DollarSign, color: "text-emerald-400" },
  { label: "Response Rate", value: "94%", icon: TrendingUp, color: "text-emerald-400" },
  { label: "Verifications", value: "1", icon: CheckCircle, color: "text-emerald-400" },
];

const availableSurveys = [
  {
    id: 1,
    title: "Enterprise Software Decision Makers",
    company: "Leading Tech Research Firm",
    tags: ["Director+ Title", "Tech Industry", "Company 500+"],
    match: 98,
    duration: "25 min",
    payout: 75,
    urgent: true,
  },
  {
    id: 2,
    title: "Developer Tools & Workflow Study",
    company: "Product Research Inc.",
    tags: ["Software Developer", "GitHub Verified", "3+ Years Exp"],
    match: 95,
    duration: "15 min",
    payout: 45,
    urgent: false,
  },
  {
    id: 3,
    title: "K-12 Education Technology Survey",
    company: "EdTech Insights",
    tags: ["Verified Teacher", "Public School", "K-8 Grade"],
    match: 92,
    duration: "12 min",
    payout: 35,
    urgent: false,
  },
  {
    id: 4,
    title: "Healthcare IT Decision Maker Panel",
    company: "MedResearch Global",
    tags: ["Healthcare Industry", "Manager+", "IT Department"],
    match: 88,
    duration: "40 min",
    payout: 125,
    urgent: true,
  },
];

export default function MemberDashboard() {
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
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-white">Proof</span>
            <span className="text-emerald-400">Panel</span>
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
                        ? "bg-emerald-500/10 text-emerald-400"
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

        {/* Verified Profile Box */}
        <div className="p-4 border-t border-[#1a1a24]">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Verified Profile</span>
            </div>
            <p className="text-gray-500 text-xs">1 verification active</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, Member</h1>
            <p className="text-gray-400">You have 12 new survey opportunities matching your profile</p>
          </div>
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl px-6 py-4">
            <p className="text-gray-500 text-xs mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
              <DollarSign className="w-5 h-5" />
              127.50
            </p>
          </div>
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

        {/* Available Surveys Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Available Surveys</h2>
            <Link
              href="/member/surveys"
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Survey Cards */}
          <div className="space-y-4">
            {availableSurveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-5 hover:border-[#2a2a36] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold">{survey.title}</h3>
                      {survey.urgent && (
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{survey.company}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {survey.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-[#1a1a24] text-gray-300 text-xs rounded-lg border border-[#2a2a36]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-1">Match</p>
                      <p className="text-emerald-400 font-semibold">{survey.match}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-1">Duration</p>
                      <p className="text-white font-medium">{survey.duration}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-1">Payout</p>
                      <p className="text-emerald-400 font-bold">${survey.payout}</p>
                    </div>
                    <button className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
                      Start Survey
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Complete More Verifications CTA */}
        <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Complete More Verifications</h3>
              <p className="text-gray-500 text-sm">
                Add more verified credentials to unlock premium survey opportunities worth up to $150+
              </p>
            </div>
          </div>
          <Link
            href="/member/verifications"
            className="px-5 py-2.5 bg-[#1a1a24] hover:bg-[#2a2a36] text-white rounded-lg font-medium transition-colors border border-[#2a2a36]"
          >
            Add Verifications
          </Link>
        </div>
      </main>
    </div>
  );
}
