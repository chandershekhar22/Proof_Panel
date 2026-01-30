"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { usePathname } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

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

interface Survey {
  id: string;
  title: string;
  company: string;
  tags: string[];
  match: number;
  duration: string;
  payout: number;
  urgent: boolean;
  surveyMethod?: string;
  externalUrl?: string;
}

export default function MemberDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Member");

  // Fetch available surveys on mount
  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.firstName || "Member");
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }

    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/available`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch surveys");
      }

      setSurveys(data.data || []);
    } catch (err) {
      console.error("Error fetching surveys:", err);
      setError(err instanceof Error ? err.message : "Failed to load surveys");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleStartSurvey = (survey: Survey) => {
    if (survey.surveyMethod === "external" && survey.externalUrl) {
      window.open(survey.externalUrl, "_blank");
    } else {
      // For internal surveys, navigate to survey page (to be implemented)
      router.push(`/member/surveys/${survey.id}`);
    }
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
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {userName}</h1>
            <p className="text-gray-400">
              {surveys.length > 0
                ? `You have ${surveys.length} new survey opportunities matching your profile`
                : "Check back later for new survey opportunities"}
            </p>
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
            {isLoading ? (
              <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-8 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                <p className="text-gray-400">Loading available surveys...</p>
              </div>
            ) : error ? (
              <div className="bg-[#12121a] border border-red-500/30 rounded-xl p-8 flex flex-col items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
                <p className="text-red-400 mb-2">Failed to load surveys</p>
                <button
                  onClick={fetchSurveys}
                  className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                  Try again
                </button>
              </div>
            ) : surveys.length === 0 ? (
              <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-8 flex flex-col items-center justify-center">
                <FileText className="w-8 h-8 text-gray-500 mb-3" />
                <p className="text-gray-400 mb-2">No surveys available right now</p>
                <p className="text-gray-500 text-sm">Check back later for new opportunities</p>
              </div>
            ) : (
              surveys.map((survey) => (
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
                      <button
                        onClick={() => handleStartSurvey(survey)}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Start Survey
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
