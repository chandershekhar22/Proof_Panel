"use client";

import { useState, useEffect } from "react";
import { UserCheck, RefreshCw, Briefcase, Building2, Users, MapPin, TrendingUp } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface AggregatedData {
  jobTitle: Record<string, number>;
  industry: Record<string, number>;
  companySize: Record<string, number>;
  jobFunction: Record<string, number>;
  employmentStatus: Record<string, number>;
  totalVerified: number;
  totalFailed: number;
}

interface CategoryCardProps {
  title: string;
  icon: React.ReactNode;
  data: Record<string, number>;
  colorClass: string;
}

function CategoryCard({ title, icon, data, colorClass }: CategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = sortedEntries.reduce((sum, [, count]) => sum + count, 0);

  // Get the accent color for the progress bar
  const getAccentColor = () => {
    if (colorClass.includes('blue')) return 'bg-blue-500';
    if (colorClass.includes('purple')) return 'bg-purple-500';
    if (colorClass.includes('green')) return 'bg-green-500';
    if (colorClass.includes('orange')) return 'bg-orange-500';
    if (colorClass.includes('cyan')) return 'bg-cyan-500';
    return 'bg-purple-500';
  };

  return (
    <div
      className={`bg-[#1a1a24] rounded-xl p-6 border transition-all duration-300 cursor-pointer ${
        isExpanded ? 'border-purple-500/50' : 'border-[#2a2a36] hover:border-[#3a3a46]'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-gray-500 text-sm">{total} verified</p>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Collapsed view - just show count */}
      {!isExpanded && (
        <p className="text-gray-500 text-sm">
          {sortedEntries.length === 0 ? 'No data yet' : `Click to see ${sortedEntries.length} categories`}
        </p>
      )}

      {/* Expanded view - show all data with progress bars */}
      {isExpanded && (
        <div className="space-y-3 mt-4 pt-4 border-t border-[#2a2a36]">
          {sortedEntries.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            sortedEntries.map(([label, count]) => {
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 text-sm truncate max-w-[70%]">{label}</span>
                    <span className="text-white font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-[#2a2a36] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getAccentColor()}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function VerifiedPanelists() {
  const { isConnected } = useAppContext();
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAggregatedData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/verified-panelists/aggregated");
      const result = await response.json();

      if (result.success) {
        setAggregatedData(result.data);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching aggregated data:", err);
      setError("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAggregatedData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchAggregatedData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Verified Panelists</h1>
          <p className="text-gray-400">Real-time aggregated data from verified panelists</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchAggregatedData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a2a36] hover:bg-[#3a3a46] text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
            <span className="text-gray-400 text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-4xl font-bold text-white">{aggregatedData?.totalVerified || 0}</p>
              <p className="text-green-400 text-sm font-medium">Verified Panelists</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Users className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <p className="text-4xl font-bold text-white">{aggregatedData?.totalFailed || 0}</p>
              <p className="text-red-400 text-sm font-medium">Failed Verification</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-4xl font-bold text-white">
                {aggregatedData && aggregatedData.totalVerified + aggregatedData.totalFailed > 0
                  ? Math.round((aggregatedData.totalVerified / (aggregatedData.totalVerified + aggregatedData.totalFailed)) * 100)
                  : 0}%
              </p>
              <p className="text-purple-400 text-sm font-medium">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Aggregated Data Cards */}
      {aggregatedData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CategoryCard
            title="Job Title / Seniority"
            icon={<Briefcase className="w-5 h-5 text-blue-400" />}
            data={aggregatedData.jobTitle}
            colorClass="bg-blue-500/20"
          />

          <CategoryCard
            title="Industry"
            icon={<Building2 className="w-5 h-5 text-purple-400" />}
            data={aggregatedData.industry}
            colorClass="bg-purple-500/20"
          />

          <CategoryCard
            title="Company Size"
            icon={<Users className="w-5 h-5 text-green-400" />}
            data={aggregatedData.companySize}
            colorClass="bg-green-500/20"
          />

          <CategoryCard
            title="Job Function"
            icon={<MapPin className="w-5 h-5 text-orange-400" />}
            data={aggregatedData.jobFunction}
            colorClass="bg-orange-500/20"
          />

          <CategoryCard
            title="Employment Status"
            icon={<UserCheck className="w-5 h-5 text-cyan-400" />}
            data={aggregatedData.employmentStatus}
            colorClass="bg-cyan-500/20"
          />
        </div>
      )}

      {/* Empty State */}
      {!aggregatedData && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 bg-[#1a1a24] rounded-full flex items-center justify-center mb-6">
            <UserCheck className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Verified Panelists Yet</h2>
          <p className="text-gray-400 text-center max-w-md">
            When panelists verify through email, their aggregated data will appear here.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !aggregatedData && (
        <div className="flex flex-col items-center justify-center py-32">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mb-4" />
          <p className="text-gray-400">Loading verified panelists data...</p>
        </div>
      )}
    </div>
  );
}
