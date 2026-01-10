"use client";

import { useState, useRef, useEffect } from "react";
import { Link2, FileText, Filter, Check, Download, ChevronDown } from "lucide-react";

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
    title: "Employment Status",
    options: ["Currently employed", "Recently active"],
  },
  jobTitle: {
    title: "Job Title / Seniority",
    options: ["C-Level", "VP+", "Director+", "Manager+", "Individual Contributor"],
  },
  jobFunction: {
    title: "Job Function",
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
    title: "Company Size",
    options: [
      "Enterprise (10K+)",
      "Large (1K-10K)",
      "Mid-Market (100-999)",
      "SMB (10-99)",
      "Small (<10)",
    ],
  },
  industry: {
    title: "Industry",
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

// Dropdown component with multi-select and select all
function FilterDropdown({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = selected.length === options.length;
  const noneSelected = selected.length === 0;

  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
    setIsOpen(false);
  };

  const handleOptionClick = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else {
      onChange([...selected, option]);
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (noneSelected) return `Select ${title.toLowerCase()}`;
    if (allSelected) return `All selected`;
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0f0f13] border border-[#2a2a36] rounded-lg px-4 py-3 text-left text-white focus:outline-none focus:border-purple-500 transition-colors flex items-center justify-between hover:border-[#3a3a46]"
      >
        <span className={noneSelected ? "text-gray-400" : "text-white"}>
          {getDisplayText()}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#1e1e28] border border-[#2a2a36] rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {/* Select All Option */}
          <div
            onClick={handleSelectAll}
            className={`px-4 py-3 cursor-pointer flex items-center justify-between border-b border-[#2a2a36] ${
              allSelected
                ? "bg-purple-600/20 text-purple-400"
                : "hover:bg-[#2a2a36] text-gray-300"
            }`}
          >
            <span className="font-medium">Select All</span>
            {allSelected && <Check className="w-4 h-4 text-purple-400" />}
          </div>

          {/* Options */}
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                selected.includes(option)
                  ? "bg-purple-600/20 text-purple-400"
                  : "hover:bg-[#2a2a36] text-gray-300"
              }`}
            >
              <span>{option}</span>
              {selected.includes(option) && <Check className="w-4 h-4 text-purple-400" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const handleFilterChange = (category: string, values: string[]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [category]: values,
    }));
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

            {/* Filter Dropdowns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {Object.entries(filterCategories).map(([key, category]) => (
                <FilterDropdown
                  key={key}
                  title={category.title}
                  options={category.options}
                  selected={selectedFilters[key] || []}
                  onChange={(values) => handleFilterChange(key, values)}
                />
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
