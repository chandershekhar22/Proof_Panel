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
  ChevronRight,
  AlertCircle,
  LogOut,
  Loader2,
  Search,
  Filter,
  Clock,
  TrendingUp,
} from "lucide-react";
import { usePathname } from "next/navigation";


const sidebarItems = [
  { name: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
  { name: "Available Surveys", href: "/member/surveys", icon: FileText },
  { name: "My Verifications", href: "/member/verifications", icon: Shield },
  { name: "Earnings", href: "/member/earnings", icon: DollarSign },
  { name: "Profile", href: "/member/profile", icon: User },
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
  audience?: string;
  targetCategory?: string;
  surveyMethod?: string;
  externalUrl?: string;
  targetCompletes?: number;
  currentCompletes?: number;
}

export default function AvailableSurveysPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "payout" | "duration">("match");

  useEffect(() => {
    fetchSurveys();
  }, []);

  useEffect(() => {
    let result = [...surveys];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (survey) =>
          survey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          survey.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          survey.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by urgent
    if (filterUrgent) {
      result = result.filter((survey) => survey.urgent);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "match") return b.match - a.match;
      if (sortBy === "payout") return b.payout - a.payout;
      if (sortBy === "duration") {
        const aDuration = parseInt(a.duration) || 0;
        const bDuration = parseInt(b.duration) || 0;
        return aDuration - bDuration;
      }
      return 0;
    });

    setFilteredSurveys(result);
  }, [surveys, searchQuery, filterUrgent, sortBy]);

  const fetchSurveys = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get userId from sessionStorage to filter surveys by user's categories
      let userId: string | null = null;
      const userDataStr = sessionStorage.getItem("userData");
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          userId = userData.id;
        } catch {
          // Parsing failed, userId stays null
        }
      }

      const url = userId
        ? `/api/surveys/available?userId=${userId}`
        : `/api/surveys/available`;

      const response = await fetch(url);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Available Surveys</h1>
          <p className="text-gray-400">
            Browse and participate in surveys that match your profile
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search surveys..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Urgent Filter */}
            <button
              onClick={() => setFilterUrgent(!filterUrgent)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                filterUrgent
                  ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                  : "bg-[#1a1a24] border-[#2a2a36] text-gray-400 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              Urgent Only
            </button>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "match" | "payout" | "duration")}
                className="bg-[#1a1a24] border border-[#2a2a36] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="match">Best Match</option>
                <option value="payout">Highest Payout</option>
                <option value="duration">Shortest Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Available</p>
                <p className="text-2xl font-bold text-white">{surveys.length}</p>
              </div>
              <FileText className="w-8 h-8 text-emerald-400/30" />
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Urgent Surveys</p>
                <p className="text-2xl font-bold text-orange-400">
                  {surveys.filter((s) => s.urgent).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-400/30" />
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Potential Earnings</p>
                <p className="text-2xl font-bold text-emerald-400">
                  ${surveys.reduce((sum, s) => sum + s.payout, 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400/30" />
            </div>
          </div>
        </div>

        {/* Survey List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
              <p className="text-gray-400">Loading available surveys...</p>
            </div>
          ) : error ? (
            <div className="bg-[#12121a] border border-red-500/30 rounded-xl p-12 flex flex-col items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
              <p className="text-red-400 mb-3">Failed to load surveys</p>
              <button
                onClick={fetchSurveys}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Try again
              </button>
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-12 flex flex-col items-center justify-center">
              <FileText className="w-10 h-10 text-gray-500 mb-4" />
              <p className="text-gray-400 mb-2">No surveys found</p>
              <p className="text-gray-500 text-sm">
                {searchQuery || filterUrgent
                  ? "Try adjusting your filters"
                  : "Check back later for new opportunities"}
              </p>
            </div>
          ) : (
            filteredSurveys.map((survey) => (
              <div
                key={survey.id}
                className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 hover:border-[#2a2a36] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{survey.title}</h3>
                      {survey.urgent && (
                        <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{survey.company}</p>
                    {survey.audience && (
                      <p className="text-gray-400 text-sm mb-3">
                        Target Audience: {survey.audience}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {survey.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-[#1a1a24] text-gray-300 text-xs rounded-lg border border-[#2a2a36]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-8 ml-6">
                    <div className="text-center">
                      <p className="text-gray-500 text-xs mb-1">Match</p>
                      <p className="text-xl font-bold text-emerald-400">{survey.match}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs mb-1">Duration</p>
                      <p className="text-xl font-bold text-white">{survey.duration}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-xs mb-1">Payout</p>
                      <p className="text-xl font-bold text-emerald-400">${survey.payout}</p>
                    </div>
                    <button
                      onClick={() => handleStartSurvey(survey)}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Start Survey
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
