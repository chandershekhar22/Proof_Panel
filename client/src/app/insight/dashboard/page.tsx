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
  Plus,
  LogOut,
  CheckCircle,
  Zap,
  Target,
  Monitor,
  Stethoscope,
  DollarSign,
  GraduationCap,
  Building2,
  Car,
} from "lucide-react";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { name: "Dashboard", href: "/insight/dashboard", icon: LayoutDashboard },
  { name: "My Studies", href: "/insight/surveys", icon: FileText },
  { name: "Respondent Pool", href: "/insight/respondents", icon: Users },
  { name: "Analytics", href: "/insight/analytics", icon: BarChart3 },
  { name: "Settings", href: "/insight/settings", icon: Settings },
];

const stats = [
  { label: "Verified Respondents", value: "2.5M+", icon: Users, color: "text-blue-400", dotColor: "bg-blue-400" },
  { label: "Targeting Attributes", value: "300+", icon: Target, color: "text-pink-400", dotColor: "bg-pink-400" },
  { label: "Avg Quality Score", value: "96%", icon: CheckCircle, color: "text-emerald-400", dotColor: "bg-emerald-400" },
  { label: "Avg Response Time", value: "< 4hrs", icon: Zap, color: "text-amber-400", dotColor: "bg-amber-400" },
];

const audienceSegments = [
  {
    id: "tech",
    title: "Technology Professionals",
    description: "Developers, Engineers, IT Decision Makers",
    icon: Monitor,
    verified: "245,000+",
    color: "bg-gray-700",
  },
  {
    id: "healthcare",
    title: "Healthcare Professionals",
    description: "Physicians, Specialists, Allied Health",
    icon: Stethoscope,
    verified: "180,000+",
    color: "bg-pink-600",
  },
  {
    id: "financial",
    title: "Financial Professionals",
    description: "Advisors, Wealth Managers, CFOs",
    icon: DollarSign,
    verified: "95,000+",
    color: "bg-amber-500",
  },
  {
    id: "education",
    title: "Education Professionals",
    description: "Teachers, Administrators, EdTech Users",
    icon: GraduationCap,
    verified: "320,000+",
    color: "bg-amber-600",
  },
  {
    id: "b2b",
    title: "B2B Decision Makers",
    description: "C-Suite, VPs, Directors, Managers",
    icon: Building2,
    verified: "420,000+",
    color: "bg-blue-600",
  },
  {
    id: "vehicle",
    title: "Vehicle Owners",
    description: "Current Owners, Intenders, Lessees",
    icon: Car,
    verified: "890,000+",
    color: "bg-red-500",
  },
];

const sampleRespondents = [
  {
    id: 1,
    name: "Sarah Chen",
    title: "Senior DevOps Engineer",
    company: "Fortune 500 Tech Co.",
    experience: "8 years experience",
    qualityScore: 98,
    verified: true,
    avatar: "SC",
    avatarColor: "bg-orange-500",
  },
  {
    id: 2,
    name: "Marcus Johnson",
    title: "ML Engineer",
    company: "AI Startup",
    experience: "5 years experience",
    qualityScore: 96,
    verified: true,
    avatar: "MJ",
    avatarColor: "bg-amber-500",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    title: "Full Stack Developer",
    company: "E-commerce Platform",
    experience: "6 years experience",
    qualityScore: 94,
    verified: true,
    avatar: "ER",
    avatarColor: "bg-orange-500",
  },
  {
    id: 4,
    name: "David Kim",
    title: "Cloud Architect",
    company: "Enterprise Software",
    experience: "12 years experience",
    qualityScore: 99,
    verified: true,
    avatar: "DK",
    avatarColor: "bg-amber-500",
  },
];

export default function InsightDashboard() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    sessionStorage.removeItem("userRole");
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

        {/* Company Info Box */}
        <div className="p-4 border-t border-[#1a1a24]">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Insight Company</span>
            </div>
            <p className="text-gray-500 text-xs">Access to verified respondents</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Your Research Dashboard</h1>
            <p className="text-gray-400">Access verified respondents for your market research studies</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            New Study
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-5 relative"
            >
              <div className="flex items-start justify-between mb-3">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div className={`w-2 h-2 rounded-full ${stat.dotColor}`}></div>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Browse Verified Audience Segments */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-6">Browse Verified Audience Segments</h2>
          <div className="grid grid-cols-3 gap-4">
            {audienceSegments.map((segment) => {
              const IconComponent = segment.icon;
              return (
                <div
                  key={segment.id}
                  className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-5 hover:border-[#2a2a36] transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${segment.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-emerald-400 text-sm font-medium">{segment.verified} verified</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{segment.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{segment.description}</p>
                  <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors">
                    Explore segment →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sample Verified Respondents */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-6">Sample Verified Respondents</h2>
          <div className="grid grid-cols-2 gap-4">
            {sampleRespondents.map((respondent) => (
              <div
                key={respondent.id}
                className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-5 flex items-center justify-between hover:border-[#2a2a36] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${respondent.avatarColor} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {respondent.avatar}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{respondent.name}</h3>
                    <p className="text-gray-400 text-sm">{respondent.title} • {respondent.company}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {respondent.verified && (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      <span className="text-gray-500 text-xs">{respondent.experience}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{respondent.qualityScore}</p>
                  <p className="text-gray-500 text-xs">Quality Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
