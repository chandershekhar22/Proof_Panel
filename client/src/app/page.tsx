"use client";

import { useState } from "react";
import { Link2, FileText, Filter, Check, Download } from "lucide-react";

// Data endpoints
const endpoints = [
  { id: "users", path: "/api/v1/panel/users", records: "12,450 records" },
  { id: "transactions", path: "/api/v1/panel/transactions", records: "89,234 records" },
  { id: "profiles", path: "/api/v1/panel/profiles", records: "45,678 records" },
  { id: "activities", path: "/api/v1/panel/activities", records: "234,567 records" },
];

// Filter categories based on the document
const filterCategories = {
  employmentStatus: {
    title: "7.1 Employment Status Proofs",
    options: ["Currently employed", "Recently active"],
  },
  jobTitle: {
    title: "7.2 Job Title / Seniority Proofs",
    options: ["C-Level", "VP+", "Director+", "Manager+", "Individual Contributor"],
  },
  jobFunction: {
    title: "7.3 Job Function Proofs",
    options: [
      "IT Decision Maker",
      "Marketing DM",
      "HR Decision Maker",
      "Finance DM",
      "Procurement",
      "Sales DM",
      "Operations",
      "Legal/Compliance",
      "Product Mgmt",
      "Data/Analytics",
    ],
  },
  companySize: {
    title: "7.4 Company Size (Firmographics) Proofs",
    options: [
      "Enterprise (10K+)",
      "Large (1K-10K)",
      "Mid-Market (100-999)",
      "SMB (10-99)",
      "Small (<10)",
    ],
  },
  industry: {
    title: "7.5 Industry (Vertical) Proofs",
    options: [
      "Technology",
      "Financial Services",
      "Healthcare",
      "Manufacturing",
      "Retail/CPG",
      "Prof Services",
      "Energy/Utilities",
    ],
  },
};

export default function Dashboard() {
  const [apiBaseUrl, setApiBaseUrl] = useState("https://api.panel.example.com");
  const [apiKey, setApiKey] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [isConnected, setIsConnected] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    employmentStatus: [],
    jobTitle: [],
    jobFunction: [],
    companySize: [],
    industry: [],
  });

  const handleConnect = () => {
    if (apiKey.trim()) {
      setIsConnected(!isConnected);
    }
  };

  const handleFilterChange = (category: string, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const resetFilters = () => {
    setSelectedFilters({
      employmentStatus: [],
      jobTitle: [],
      jobFunction: [],
      companySize: [],
      industry: [],
    });
  };

  const handleLoadDataset = () => {
    console.log("Loading dataset with filters:", selectedFilters);
    console.log("Selected endpoint:", selectedEndpoint);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Connect to panel database and load datasets</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          <span className="text-gray-400 text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {/* API Connection Card */}
      <div className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36] mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Link2 className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">API Connection</h2>
        </div>

        <div className="space-y-6">
          {/* API Base URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              API Base URL
            </label>
            <input
              type="text"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              disabled={isConnected}
              className="w-full bg-[#0f0f13] border border-[#2a2a36] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
              placeholder="https://api.panel.example.com"
            />
          </div>

          {/* API Key and Environment Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isConnected}
                className="w-full bg-[#0f0f13] border border-[#2a2a36] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                placeholder="Enter your API key"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                disabled={isConnected}
                className="w-full bg-[#0f0f13] border border-[#2a2a36] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Development">Development</option>
              </select>
            </div>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            className={`font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              isConnected
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {isConnected && <Check className="w-4 h-4" />}
            {isConnected ? "Connected" : "Connect to Panel"}
          </button>
        </div>
      </div>

      {/* Show sections only when connected */}
      {isConnected && (
        <>
          {/* Select Data Endpoint */}
          <div className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36] mb-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Select Data Endpoint</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  onClick={() => setSelectedEndpoint(endpoint.id)}
                  className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedEndpoint === endpoint.id
                      ? "bg-[#2a2a36] border-purple-500"
                      : "bg-[#0f0f13] border-[#2a2a36] hover:border-[#3a3a46]"
                  }`}
                >
                  {selectedEndpoint === endpoint.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  <FileText className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-white text-sm font-medium mb-1">{endpoint.path}</p>
                  <p className="text-gray-500 text-xs">{endpoint.records}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Data Points */}
          <div className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36]">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Filter Data Points</h2>
            </div>

            <div className="space-y-6">
              {Object.entries(filterCategories).map(([key, category]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {category.title}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {category.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleFilterChange(key, option)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedFilters[key]?.includes(option)
                            ? "bg-purple-600 text-white"
                            : "bg-[#0f0f13] text-gray-400 border border-[#2a2a36] hover:border-purple-500 hover:text-white"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#2a2a36]">
              <button
                onClick={resetFilters}
                className="px-6 py-3 rounded-lg text-gray-400 hover:text-white transition-colors border border-[#2a2a36] hover:border-[#3a3a46]"
              >
                Reset Filters
              </button>
              <button
                onClick={handleLoadDataset}
                disabled={!selectedEndpoint}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Load Dataset
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
