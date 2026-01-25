"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Filter, Check, Download, ChevronDown, Table, CheckCircle, Loader2, Link2, Plus, Trash2, Database } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppContext, Respondent } from "@/context/AppContext";

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

interface DatasetResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    records: Respondent[];
  };
  appliedFilters: Record<string, string[]>;
}

// Dropdown component with single-select or all
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

  // "All" means empty selection (no filter applied)
  const isAllSelected = selected.length === 0;

  const handleSelectAll = () => {
    onChange([]); // Empty = All (no filter)
    setIsOpen(false);
  };

  const handleOptionClick = (option: string) => {
    // Single select - only one option at a time
    if (selected.length === 1 && selected[0] === option) {
      // Clicking same option again → go back to "All"
      onChange([]);
    } else {
      // Select only this one option
      onChange([option]);
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (isAllSelected) return "All";
    return selected[0]; // Single selection
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
        <span className="text-white">
          {getDisplayText()}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-[#1e1e28] border border-[#2a2a36] rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {/* All Option */}
          <div
            onClick={handleSelectAll}
            className={`px-4 py-3 cursor-pointer flex items-center justify-between border-b border-[#2a2a36] ${
              isAllSelected
                ? "bg-purple-600/20 text-purple-400"
                : "hover:bg-[#2a2a36] text-gray-300"
            }`}
          >
            <span className="font-medium">All</span>
            {isAllSelected && <Check className="w-4 h-4 text-purple-400" />}
          </div>

          {/* Single Options */}
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
  const router = useRouter();
  const {
    apiBaseUrl,
    isConnected,
    connectionType,
    getActiveExcelUpload,
    selectedEndpoint,
    setSelectedEndpoint,
    selectedFilters,
    setSelectedFilters,
    loadedData,
    setLoadedData,
    totalRecords,
    setTotalRecords,
    resetFilters,
    setSelectedSource,
    setSelectedQueries,
    dataSets,
    addDataSet,
    addDataSetFromExcel,
    removeDataSet,
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [dataSetName, setDataSetName] = useState("");

  // Get active Excel upload if connected via Excel
  const activeExcelUpload = getActiveExcelUpload();
  const isApiConnection = connectionType === 'api';
  const isExcelConnection = connectionType === 'excel';

  const handleFilterChange = (category: string, values: string[]) => {
    setSelectedFilters({
      ...selectedFilters,
      [category]: values,
    });
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    // Add filters (AND condition - only add if selected)
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.append(key, values.join(','));
      }
    });

    // Get all records (large pageSize)
    params.append('pageSize', '1000');
    params.append('page', '1');

    return params.toString();
  };

  // Filter Excel data locally based on selected filters
  // Empty array for a filter = "All" (no filtering for that category)
  // Single value = filter by that specific value
  const filterExcelData = (data: Respondent[]) => {
    // If no filters are selected (all are "All"), return all data
    const hasAnyFilter = Object.values(selectedFilters).some(values => values.length > 0);
    if (!hasAnyFilter) {
      return data;
    }

    return data.filter(record => {
      // Check each filter category
      for (const [key, values] of Object.entries(selectedFilters)) {
        // Skip if "All" is selected (empty array = no filter)
        if (values.length === 0) {
          continue;
        }

        const recordValue = String(record[key as keyof Respondent] || '').toLowerCase();
        const filterValue = values[0].toLowerCase(); // Single select - only one value

        // Check if record value matches the filter value
        const matches = recordValue === filterValue ||
                       recordValue.includes(filterValue) ||
                       filterValue.includes(recordValue);

        if (!matches) {
          return false;
        }
      }
      return true;
    });
  };

  const handleLoadDataset = async () => {
    // For Excel connection, filter data locally
    if (isExcelConnection && activeExcelUpload) {
      setIsLoading(true);
      setError(null);

      try {
        const filteredData = filterExcelData(activeExcelUpload.data);
        setLoadedData(filteredData);
        setTotalRecords(filteredData.length);
        // Reset Manage Proof state when new data is loaded
        setSelectedSource(null);
        setSelectedQueries([]);
      } catch (err) {
        console.error("Error filtering Excel data:", err);
        setError(err instanceof Error ? err.message : "Failed to filter data");
        setLoadedData(null);
        setTotalRecords(0);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // For API connection
    if (!selectedEndpoint) return;

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = endpoints.find(e => e.id === selectedEndpoint);
      if (!endpoint) return;

      const queryParams = buildQueryParams();
      const url = `${apiBaseUrl}${endpoint.path}?${queryParams}`;

      console.log("Fetching from:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: DatasetResponse = await response.json();

      if (data.success) {
        setLoadedData(data.data.records);
        setTotalRecords(data.data.total);
        // Reset Manage Proof state when new data is loaded
        setSelectedSource(null);
        setSelectedQueries([]);
      } else {
        throw new Error("Failed to load dataset");
      }
    } catch (err) {
      console.error("Error loading dataset:", err);
      setError(err instanceof Error ? err.message : "Failed to load dataset");
      setLoadedData(null);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate data fields count (number of fields in a respondent object)
  const dataFieldsCount = loadedData && loadedData.length > 0
    ? Object.keys(loadedData[0]).length
    : 0;

  // Calculate completeness (percentage of non-null fields)
  const calculateCompleteness = () => {
    if (!loadedData || loadedData.length === 0) return 0;

    let totalFields = 0;
    let filledFields = 0;

    loadedData.forEach(record => {
      Object.values(record).forEach(value => {
        totalFields++;
        if (value !== null && value !== undefined && value !== '') {
          filledFields++;
        }
      });
    });

    return totalFields > 0 ? ((filledFields / totalFields) * 100).toFixed(1) : 0;
  };

  const handleSaveDataSet = () => {
    if (!dataSetName.trim() || !loadedData) return;

    if (isExcelConnection) {
      // Save Excel data as dataset
      addDataSetFromExcel(dataSetName.trim(), loadedData, selectedFilters);
    } else {
      // Save API data as dataset
      addDataSet(dataSetName.trim());
    }

    setDataSetName("");
    setShowSaveModal(false);
  };

  const getFilterSummary = (filters: Record<string, string[]>) => {
    const parts: string[] = [];
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length > 0) {
        parts.push(`${values.length} ${key}`);
      }
    });
    return parts.length > 0 ? parts.join(", ") : "No filters";
  };

  // Navigate to dataset view page
  const handleViewDataSet = (dataSetId: string) => {
    router.push(`/dataset/${dataSetId}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            {isExcelConnection
              ? `Connected to: ${activeExcelUpload?.fileName || 'Excel file'}`
              : "Select data endpoint and load datasets"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          <span className="text-gray-400 text-sm">
            {isConnected
              ? isApiConnection
                ? "API Connected"
                : "Excel Connected"
              : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Not Connected State - Only show if no datasets exist */}
      {!isConnected && (!dataSets || dataSets.length === 0) && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 bg-[#1a1a24] rounded-full flex items-center justify-center mb-6">
            <Link2 className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Data Available</h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Connect to the API or upload an Excel file to get started with your datasets.
          </p>
          <Link
            href="/settings"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Go to Settings
          </Link>
        </div>
      )}

      {/* Show data source sections when connected */}
      {isConnected && (
        <>
          {/* Excel Data Source Card - Show for Excel connections */}
          {isExcelConnection && activeExcelUpload && (
            <div className="bg-[#1a1a24] rounded-xl p-6 border border-green-500/50 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-5 h-5 text-white" />
                <h2 className="text-lg font-semibold text-white">Data Source</h2>
                <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                  Excel File
                </span>
              </div>

              <div className="bg-[#0f0f13] rounded-lg p-4 border border-[#2a2a36]">
                <div className="flex items-center gap-4">
                  <FileText className="w-10 h-10 text-green-400" />
                  <div>
                    <p className="text-white font-medium">{activeExcelUpload.fileName}</p>
                    <p className="text-gray-500 text-sm">
                      {activeExcelUpload.totalRecords.toLocaleString()} total records •
                      Uploaded {new Date(activeExcelUpload.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Select Data Endpoint - Show for API connections */}
          {isApiConnection && (
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
          )}

          {/* Filter Data Points */}
          <div className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36] mb-6">
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
                disabled={(isApiConnection && !selectedEndpoint) || isLoading}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isLoading ? "Loading..." : isExcelConnection ? "Apply Filters" : "Load Dataset"}
              </button>
            </div>
          </div>

          {/* Dataset Preview - Show after loading */}
          {(loadedData || error) && (
            <div className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Table className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">Dataset Preview</h2>
                </div>
                {loadedData && (
                  <span className="text-gray-400 text-sm">{totalRecords.toLocaleString()} records loaded</span>
                )}
              </div>

              {error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                  Error: {error}
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-[#0f0f13] rounded-lg p-6 text-center border border-[#2a2a36]">
                      <p className="text-3xl font-bold text-white mb-1">{totalRecords.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Total Records</p>
                    </div>
                    <div className="bg-[#0f0f13] rounded-lg p-6 text-center border border-[#2a2a36]">
                      <p className="text-3xl font-bold text-white mb-1">{dataFieldsCount}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Data Fields</p>
                    </div>
                    <div className="bg-[#0f0f13] rounded-lg p-6 text-center border border-[#2a2a36]">
                      <p className="text-3xl font-bold text-white mb-1">{calculateCompleteness()}%</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Completeness</p>
                    </div>
                    <div className="bg-[#0f0f13] rounded-lg p-6 text-center border border-[#2a2a36]">
                      <p className="text-3xl font-bold text-white mb-1">0</p>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Errors</p>
                    </div>
                  </div>

                  {/* Success Message and Save Button */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3 flex-1">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-green-400">
                        Dataset loaded successfully! Navigate to{" "}
                        <Link href="/manage-proof" className="text-purple-400 font-medium hover:underline">
                          Manage Proof
                        </Link>{" "}
                        or save as a data set.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSaveModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      Save as Data Set
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Saved Data Sets Section - Show regardless of API connection */}
      {dataSets && dataSets.length > 0 && (
        <div className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36] mt-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Saved Data Sets</h2>
            <span className="bg-purple-600/20 text-purple-400 text-xs font-medium px-2 py-1 rounded-full">
              {dataSets.length} saved
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSets.map((ds) => (
              <div
                key={ds.id}
                onClick={() => handleViewDataSet(ds.id)}
                className="bg-[#0f0f13] rounded-lg p-4 border cursor-pointer transition-all border-[#2a2a36] hover:border-purple-500/50 hover:bg-[#1a1a24]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">{ds.name}</h3>
                    <p className="text-gray-500 text-xs">
                      {new Date(ds.createdAt).toLocaleDateString()} at{" "}
                      {new Date(ds.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDataSet(ds.id);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Records:</span>
                    <span className="text-white">{ds.totalRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Source:</span>
                    <span className="text-white text-xs">
                      {ds.endpoint === "excel-upload" ? "Excel Upload" : ds.endpoint}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-[#2a2a36]">
                    {getFilterSummary(ds.filters)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Click on a data set to view its users and details.
          </p>
        </div>
      )}

      {/* Save Data Set Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36] w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Save Data Set</h3>
            <p className="text-gray-400 text-sm mb-4">
              Save this filtered data as a named set to use later in Manage Proof.
            </p>
            <input
              type="text"
              value={dataSetName}
              onChange={(e) => setDataSetName(e.target.value)}
              placeholder="Enter data set name (e.g., IT Directors Q1)"
              className="w-full bg-[#0f0f13] border border-[#2a2a36] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setDataSetName("");
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDataSet}
                disabled={!dataSetName.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Save Data Set
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
