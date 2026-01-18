"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Settings2, Clock, Check, Maximize2, Database, ChevronDown } from "lucide-react";
import { useAppContext, DataSet } from "@/context/AppContext";

// LinkedIn Icon Component
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

// Verification queries mapped to each data point attribute
const verificationQueries: Record<string, Record<string, { query: string; category: string; color: string }>> = {
  employmentStatus: {
    "Currently employed": { query: "EMPLOYED: Pass/Fail", category: "EMPLOYMENT", color: "bg-blue-500" },
    "Recently active": { query: "RECENTLY_ACTIVE: Pass/Fail", category: "EMPLOYMENT", color: "bg-blue-500" },
  },
  jobTitle: {
    "C-Level": { query: "IS_C_LEVEL: Pass/Fail", category: "SENIORITY", color: "bg-purple-500" },
    "VP+": { query: "IS_VP_PLUS: Pass/Fail", category: "SENIORITY", color: "bg-purple-500" },
    "Director+": { query: "IS_DIRECTOR_PLUS: Pass/Fail", category: "SENIORITY", color: "bg-purple-500" },
    "Manager+": { query: "IS_MANAGER_PLUS: Pass/Fail", category: "SENIORITY", color: "bg-purple-500" },
    "Individual Contributor": { query: "IS_IC: Pass/Fail", category: "SENIORITY", color: "bg-purple-500" },
  },
  jobFunction: {
    "IT Decision Maker": { query: "IS_IT_DM: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
    "Marketing DM": { query: "IS_MARKETING_DM: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
    "HR Decision Maker": { query: "IS_HR_DM: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
    "Finance DM": { query: "IS_FINANCE_DM: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
    "Procurement": { query: "IS_PROCUREMENT: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
    "Sales DM": { query: "IS_SALES_DM: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
    "Operations": { query: "IS_OPS: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
    "Legal/Compliance": { query: "IS_LEGAL: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
    "Product Mgmt": { query: "IS_PRODUCT: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
    "Data/Analytics": { query: "IS_DATA: Pass/Fail", category: "FUNCTION", color: "bg-green-500" },
  },
  companySize: {
    "Enterprise (10K+)": { query: "IS_ENTERPRISE: Pass/Fail", category: "SIZE", color: "bg-orange-500" },
    "Large (1K-10K)": { query: "IS_LARGE: Pass/Fail", category: "SIZE", color: "bg-orange-500" },
    "Mid-Market (100-999)": { query: "IS_MID_MARKET: Pass/Fail", category: "SIZE", color: "bg-orange-500" },
    "SMB (10-99)": { query: "IS_SMB: Pass/Fail", category: "SIZE", color: "bg-orange-500" },
    "Small (<10)": { query: "IS_SMALL_BIZ: Pass/Fail", category: "SIZE", color: "bg-orange-500" },
  },
  industry: {
    "Technology": { query: "IN_TECH: Pass/Fail", category: "INDUSTRY", color: "bg-cyan-500" },
    "Financial Services": { query: "IN_FINSERV: Pass/Fail", category: "INDUSTRY", color: "bg-cyan-500" },
    "Healthcare": { query: "IN_HEALTHCARE: Pass/Fail", category: "INDUSTRY", color: "bg-cyan-500" },
    "Manufacturing": { query: "IN_MANUFACTURING: Pass/Fail", category: "INDUSTRY", color: "bg-cyan-500" },
    "Retail/CPG": { query: "IN_RETAIL: Pass/Fail", category: "INDUSTRY", color: "bg-cyan-500" },
    "Prof Services": { query: "IN_PROF_SERVICES: Pass/Fail", category: "INDUSTRY", color: "bg-cyan-500" },
    "Energy/Utilities": { query: "IN_ENERGY: Pass/Fail", category: "INDUSTRY", color: "bg-cyan-500" },
  },
};

// Category display names
const categoryNames: Record<string, string> = {
  employmentStatus: "Employment Status",
  jobTitle: "Job Title / Seniority",
  jobFunction: "Job Function",
  companySize: "Company Size",
  industry: "Industry",
};

export default function ManageProof() {
  const router = useRouter();
  const {
    isConnected,
    loadedData,
    selectedFilters,
    selectedSource,
    setSelectedSource,
    selectedQueries,
    setSelectedQueries,
    dataSets,
    activeDataSetId,
    setActiveDataSetId,
    getActiveDataSet,
  } = useAppContext();

  // Get the active data set or fall back to current loaded data
  const activeDataSet = getActiveDataSet();

  // Determine which data to use: active data set or loaded data
  const workingData = activeDataSet ? activeDataSet.data : loadedData;
  const workingFilters = activeDataSet ? activeDataSet.filters : selectedFilters;

  const hasDataset = (workingData && workingData.length > 0) || (dataSets && dataSets.length > 0);
  const hasInitializedRef = useRef(false);
  const previousSourceRef = useRef<string | null>(null);

  const linkedinFeatures = [
    "Profile Verification",
    "Employment History",
    "Education Validation",
    "Skills & Endorsements",
  ];

  // Calculate default selected queries based on Dashboard filters
  const calculateDefaultQueries = (filters: Record<string, string[]>): string[] => {
    const defaultSelected: string[] = [];

    Object.entries(filters).forEach(([categoryKey, selectedValues]) => {
      if (selectedValues && selectedValues.length > 0 && verificationQueries[categoryKey]) {
        const allOptionsInCategory = Object.keys(verificationQueries[categoryKey]);
        const isAllSelected = selectedValues.length === allOptionsInCategory.length;

        if (isAllSelected) {
          // If all selected in filter, select all queries in this category
          allOptionsInCategory.forEach(attribute => {
            defaultSelected.push(`${categoryKey}-${attribute}`);
          });
        } else {
          // Otherwise, only select the specifically filtered ones
          selectedValues.forEach(attribute => {
            if (verificationQueries[categoryKey][attribute]) {
              defaultSelected.push(`${categoryKey}-${attribute}`);
            }
          });
        }
      }
    });

    return defaultSelected;
  };

  // Track if we've applied defaults for this session
  const hasAppliedDefaultsRef = useRef(false);

  // Apply default selections when entering step 2
  useEffect(() => {
    // Case 1: Page refresh while on step 2 - apply defaults if queries are empty
    // Case 2: Transitioning to step 2 from step 1 - defaults are already set by handleContinue

    const isOnStep2 = selectedSource === "linkedin-step2";
    const wasOnStep2 = previousSourceRef.current === "linkedin-step2";
    const isEnteringStep2 = isOnStep2 && !wasOnStep2;

    // On initial mount when already on step 2 (refresh scenario)
    if (isOnStep2 && previousSourceRef.current === null && !hasAppliedDefaultsRef.current) {
      // Only apply if queries haven't been set yet
      if (selectedQueries.length === 0) {
        const defaultQueries = calculateDefaultQueries(workingFilters);
        console.log("Refresh scenario - applying defaults:", defaultQueries);
        if (defaultQueries.length > 0) {
          setSelectedQueries(defaultQueries);
        }
      }
      hasAppliedDefaultsRef.current = true;
    }

    // Reset flags when leaving step 2
    if (!isOnStep2) {
      hasInitializedRef.current = false;
      hasAppliedDefaultsRef.current = false;
    }

    // Track previous source for next render
    previousSourceRef.current = selectedSource;
  }, [selectedSource, workingFilters, selectedQueries, setSelectedQueries]);

  const handleContinue = () => {
    // Calculate default queries from current filters - pass filters directly
    const defaultQueries = calculateDefaultQueries(workingFilters);

    console.log("=== handleContinue Debug ===");
    console.log("workingFilters:", JSON.stringify(workingFilters, null, 2));
    console.log("defaultQueries calculated:", defaultQueries);
    console.log("===========================");

    // Mark as initialized to prevent other effects from overwriting
    hasInitializedRef.current = true;

    // Set both states synchronously
    setSelectedQueries(defaultQueries);
    setSelectedSource("linkedin-step2");
  };

  const toggleQuery = (queryKey: string) => {
    if (selectedQueries.includes(queryKey)) {
      setSelectedQueries(selectedQueries.filter(q => q !== queryKey));
    } else {
      setSelectedQueries([...selectedQueries, queryKey]);
    }
  };

  // Get ALL queries for display
  const getAllQueries = () => {
    const queries: { key: string; attribute: string; query: string; category: string; color: string; categoryKey: string; isFromFilter: boolean }[] = [];

    Object.entries(verificationQueries).forEach(([categoryKey, attributes]) => {
      const allOptionsInCategory = Object.keys(attributes);
      const selectedInCategory = workingFilters[categoryKey] || [];
      const isAllSelectedInCategory = selectedInCategory.length === allOptionsInCategory.length && selectedInCategory.length > 0;

      Object.entries(attributes).forEach(([attribute, data]) => {
        // Check if this attribute was selected in Dashboard filters
        // OR if "Select All" was chosen for this category
        const isFromFilter = isAllSelectedInCategory || selectedInCategory.includes(attribute);

        queries.push({
          key: `${categoryKey}-${attribute}`,
          attribute,
          query: data.query,
          category: data.category,
          color: data.color,
          categoryKey,
          isFromFilter,
        });
      });
    });

    return queries;
  };

  const allQueries = getAllQueries();
  const showStep2 = selectedSource === "linkedin" || selectedSource === "linkedin-step2";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Proof</h1>
          <p className="text-gray-400">Verify and validate loaded data with queries</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          <span className="text-gray-400 text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {/* Data Set Selector - Show when there are saved data sets */}
      {dataSets && dataSets.length > 0 && (
        <div className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Select Data Set</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Choose which data set to work with for verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dataSets.map((ds) => {
              const isActive = activeDataSetId === ds.id;
              return (
                <div
                  key={ds.id}
                  onClick={() => {
                    setActiveDataSetId(ds.id);
                    // Reset source when switching data sets
                    setSelectedSource(null);
                    setSelectedQueries([]);
                  }}
                  className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                    isActive
                      ? "bg-[#2a2a36] border-purple-500"
                      : "bg-[#0f0f13] border-[#2a2a36] hover:border-[#3a3a46]"
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  <h3 className="text-white font-medium mb-1 pr-6">{ds.name}</h3>
                  <p className="text-gray-500 text-xs mb-2">
                    {new Date(ds.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{ds.totalRecords.toLocaleString()} records</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State - No Dataset */}
      {!hasDataset && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 bg-[#1a1a24] rounded-full flex items-center justify-center mb-6">
            <Settings2 className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Dataset Loaded</h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Please load a dataset from the Dashboard first to run verification queries.
          </p>
          <Link
            href="/"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      {/* No Data Set Selected - Show when there are data sets but none selected */}
      {dataSets && dataSets.length > 0 && !activeDataSetId && !loadedData && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-[#1a1a24] rounded-full flex items-center justify-center mb-6">
            <Database className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Select a Data Set</h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Please select a data set above to continue with verification.
          </p>
        </div>
      )}

      {/* Verification Flow - Show when we have working data (either from active data set or loaded data) */}
      {workingData && workingData.length > 0 && (
        <div className="space-y-6">
          {/* Step 1: Select Verification Source */}
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${showStep2 ? "bg-green-600" : "bg-[#1a1a24] border border-[#2a2a36]"}`}>
              {showStep2 ? <Check className="w-4 h-4 text-white" /> : <Clock className="w-4 h-4 text-gray-400" />}
            </div>
            <h2 className="text-lg font-semibold text-white">Step 1: Select Verification Source</h2>
          </div>

          {/* LinkedIn Card */}
          <div
            onClick={() => setSelectedSource(selectedSource === "linkedin" ? null : "linkedin")}
            className={`relative bg-[#1a1a24] rounded-xl p-6 border cursor-pointer transition-all ${
              selectedSource?.startsWith("linkedin")
                ? "border-purple-500"
                : "border-[#2a2a36] hover:border-[#3a3a46]"
            }`}
          >
            {selectedSource?.startsWith("linkedin") && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-[#0A66C2] rounded-lg flex items-center justify-center flex-shrink-0">
                <LinkedInIcon className="w-8 h-8 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">LinkedIn</h3>
                <p className="text-gray-400 mb-4">
                  Verify professional profiles, employment history, and educational credentials
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {linkedinFeatures.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          {selectedSource === "linkedin" && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleContinue}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                Continue with LinkedIn
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Step 2: Select Verification Queries */}
          {selectedSource === "linkedin-step2" && (
            <>
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a1a24] border border-[#2a2a36] flex items-center justify-center">
                    <Maximize2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Step 2: Select Verification Queries</h2>
                </div>
                <span className="text-purple-400 text-sm">{selectedQueries.length} selected</span>
              </div>

              {/* Show ALL queries grouped by category */}
              <div className="space-y-6 mt-6">
                {/* Group queries by category */}
                {Object.entries(
                  allQueries.reduce((acc, query) => {
                    if (!acc[query.categoryKey]) acc[query.categoryKey] = [];
                    acc[query.categoryKey].push(query);
                    return acc;
                  }, {} as Record<string, typeof allQueries>)
                ).map(([categoryKey, queries]) => (
                  <div key={categoryKey} className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36]">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      {categoryNames[categoryKey]}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {queries.map((queryItem) => {
                        const isSelected = selectedQueries.includes(queryItem.key);

                        return (
                          <div
                            key={queryItem.key}
                            onClick={() => toggleQuery(queryItem.key)}
                            className={`relative p-4 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#2a2a36] border-purple-500"
                                : "bg-[#0f0f13] border-[#2a2a36] hover:border-[#3a3a46]"
                            }`}
                          >
                            {/* Filter indicator badge */}
                            {queryItem.isFromFilter && (
                              <div className="absolute top-3 left-3">
                                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-medium rounded">
                                  FILTER
                                </span>
                              </div>
                            )}

                            {/* Checkbox */}
                            <div className="absolute top-3 right-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-purple-600 border-purple-600"
                                  : "border-gray-500"
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </div>

                            {/* Category Badge */}
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium text-white mb-2 ${queryItem.isFromFilter ? "mt-5" : ""} ${queryItem.color}`}>
                              {queryItem.category}
                            </span>

                            {/* Attribute Name */}
                            <h4 className="text-white font-medium mb-2 pr-6">{queryItem.attribute}</h4>

                            {/* Query (Verifier Sees) */}
                            <p className="text-gray-400 text-sm font-mono">{queryItem.query}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Run Verification Button */}
              {selectedQueries.length > 0 && (
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => router.push("/verification-dashboard")}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                  >
                    Run Verification ({selectedQueries.length} queries)
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
