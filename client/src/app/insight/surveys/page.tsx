"use client";

import { useState, useEffect } from "react";
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
  Clock,
  Pause,
  Play,
  Trash2,
  MoreVertical,
  TrendingUp,
  Target,
  DollarSign,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { usePathname } from "next/navigation";


const sidebarItems = [
  { name: "Dashboard", href: "/insight/dashboard", icon: LayoutDashboard },
  { name: "My Studies", href: "/insight/surveys", icon: FileText },
  { name: "Respondent Pool", href: "/insight/respondents", icon: Users },
  { name: "Analytics", href: "/insight/analytics", icon: BarChart3 },
  { name: "Settings", href: "/insight/settings", icon: Settings },
];

interface Study {
  id: string;
  name: string;
  company_name: string;
  audience: string;
  target_completes: number;
  current_completes: number;
  survey_length: number;
  survey_method: string;
  external_url: string | null;
  cpi: number;
  total_cost: number;
  payout: number;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  is_urgent: boolean;
  tags: string[];
  created_at: string;
  launched_at: string | null;
  completed_at: string | null;
}

const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-500/20 text-gray-400", dotColor: "bg-gray-400" },
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-400", dotColor: "bg-emerald-400" },
  paused: { label: "Paused", color: "bg-yellow-500/20 text-yellow-400", dotColor: "bg-yellow-400" },
  completed: { label: "Completed", color: "bg-blue-500/20 text-blue-400", dotColor: "bg-blue-400" },
  cancelled: { label: "Cancelled", color: "bg-red-500/20 text-red-400", dotColor: "bg-red-400" },
};

export default function MyStudiesPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    // Get user ID and fetch studies
    const storedUser = localStorage.getItem("user");
    let currentUserId: string | null = null;

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        currentUserId = user.id || null;
        setUserId(currentUserId);
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }

    // Fetch studies regardless of userId
    fetchStudies(currentUserId);
  }, []);

  const fetchStudies = async (userIdParam?: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build URL - if we have a valid userId, filter by it
      let url = `/api/studies`;
      if (userIdParam) {
        url += `?createdBy=${userIdParam}`;
      }

      console.log("Fetching studies from:", url);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      const data = await response.json();
      console.log("Studies response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch studies");
      }

      setStudies(data.data || []);
    } catch (err: unknown) {
      console.error("Error fetching studies:", err);
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Make sure the server is running.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to load studies. Check if server is running on port 3002.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (studyId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/studies/${studyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update study");
      }

      // Refresh studies list
      fetchStudies();
      setActiveDropdown(null);
    } catch (err) {
      console.error("Error updating study:", err);
      alert("Failed to update study status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const filteredStudies = filterStatus === "all"
    ? studies
    : studies.filter(s => s.status === filterStatus);

  const getProgressPercentage = (study: Study) => {
    if (study.target_completes === 0) return 0;
    return Math.round((study.current_completes / study.target_completes) * 100);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

        {/* Company Box */}
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
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Studies</h1>
            <p className="text-gray-400">
              Manage and monitor your research studies
            </p>
          </div>
          <Link
            href="/insight/new-study"
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Study
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Studies</p>
                <p className="text-2xl font-bold text-white">{studies.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400/30" />
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Studies</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {studies.filter((s) => s.status === "active").length}
                </p>
              </div>
              <Play className="w-8 h-8 text-emerald-400/30" />
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Responses</p>
                <p className="text-2xl font-bold text-white">
                  {studies.reduce((sum, s) => sum + (s.current_completes || 0), 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400/30" />
            </div>
          </div>
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Invested</p>
                <p className="text-2xl font-bold text-emerald-400">
                  ${studies.reduce((sum, s) => sum + (s.total_cost || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400/30" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {["all", "active", "paused", "completed", "draft"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-[#1a1a24] text-gray-400 hover:text-white"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== "all" && (
                <span className="ml-2 text-xs">
                  ({studies.filter((s) => s.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Studies List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
              <p className="text-gray-400">Loading your studies...</p>
            </div>
          ) : error ? (
            <div className="bg-[#12121a] border border-red-500/30 rounded-xl p-12 flex flex-col items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
              <p className="text-red-400 mb-3">Failed to load studies</p>
              <button
                onClick={() => fetchStudies(userId)}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              >
                Try again
              </button>
            </div>
          ) : filteredStudies.length === 0 ? (
            <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-12 flex flex-col items-center justify-center">
              <FileText className="w-10 h-10 text-gray-500 mb-4" />
              <p className="text-gray-400 mb-2">
                {filterStatus === "all" ? "No studies yet" : `No ${filterStatus} studies`}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                {filterStatus === "all"
                  ? "Create your first study to start collecting verified responses"
                  : "Try a different filter"}
              </p>
              {filterStatus === "all" && (
                <Link
                  href="/insight/new-study"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Study
                </Link>
              )}
            </div>
          ) : (
            filteredStudies.map((study) => {
              const status = statusConfig[study.status];
              const progress = getProgressPercentage(study);

              return (
                <div
                  key={study.id}
                  className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 hover:border-[#2a2a36] transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{study.name}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                          {status.label}
                        </span>
                        {study.is_urgent && (
                          <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-3">
                        {study.audience} • {study.survey_length} min • ${study.payout} payout
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {study.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2.5 py-1 bg-[#1a1a24] text-gray-300 text-xs rounded-lg border border-[#2a2a36]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === study.id ? null : study.id)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1a24] rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {activeDropdown === study.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a24] border border-[#2a2a36] rounded-xl py-2 shadow-xl z-10">
                          {study.status === "active" && (
                            <button
                              onClick={() => handleStatusChange(study.id, "paused")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-300 hover:bg-[#2a2a36] transition-colors"
                            >
                              <Pause className="w-4 h-4" />
                              Pause Study
                            </button>
                          )}
                          {study.status === "paused" && (
                            <button
                              onClick={() => handleStatusChange(study.id, "active")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-300 hover:bg-[#2a2a36] transition-colors"
                            >
                              <Play className="w-4 h-4" />
                              Resume Study
                            </button>
                          )}
                          {(study.status === "active" || study.status === "paused") && (
                            <button
                              onClick={() => handleStatusChange(study.id, "completed")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-300 hover:bg-[#2a2a36] transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Complete
                            </button>
                          )}
                          {study.external_url && (
                            <a
                              href={study.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-300 hover:bg-[#2a2a36] transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Open Survey
                            </a>
                          )}
                          <button
                            onClick={() => handleStatusChange(study.id, "cancelled")}
                            className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-400 hover:bg-[#2a2a36] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancel Study
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">
                        {study.current_completes || 0} / {study.target_completes} responses ({progress}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="text-white ml-2">{formatDate(study.created_at)}</span>
                    </div>
                    {study.launched_at && (
                      <div>
                        <span className="text-gray-500">Launched:</span>
                        <span className="text-white ml-2">{formatDate(study.launched_at)}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Investment:</span>
                      <span className="text-emerald-400 ml-2">${study.total_cost?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Method:</span>
                      <span className="text-white ml-2 capitalize">{study.survey_method}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}
