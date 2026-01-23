"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Filter,
  FileText,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
} from "lucide-react";
import { useAppContext, DataSet, Respondent } from "@/context/AppContext";

// Filter categories for display
const filterCategoryNames: Record<string, string> = {
  employmentStatus: "Employment Status",
  jobTitle: "Job Title / Seniority",
  jobFunction: "Job Function",
  companySize: "Company Size",
  industry: "Industry",
};

export default function DatasetViewPage() {
  const params = useParams();
  const router = useRouter();
  const { dataSets } = useAppContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Respondent>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Find the dataset by ID directly from dataSets
  const dataset = dataSets?.find((ds) => ds.id === params.id) || null;

  if (!dataset) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 bg-[#1a1a24] rounded-full flex items-center justify-center mb-6">
            <Database className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Dataset Not Found</h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            The dataset you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link
            href="/dashboard"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Filter and sort data
  const filteredData = dataset.data.filter((record) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      record.firstName?.toLowerCase().includes(term) ||
      record.lastName?.toLowerCase().includes(term) ||
      record.email?.toLowerCase().includes(term) ||
      record.company?.toLowerCase().includes(term) ||
      record.jobTitle?.toLowerCase().includes(term)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    if (sortDirection === "asc") {
      return String(aVal).localeCompare(String(bVal));
    }
    return String(bVal).localeCompare(String(aVal));
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof Respondent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: keyof Respondent }) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 text-gray-600" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-purple-400" />
    ) : (
      <ChevronDown className="w-4 h-4 text-purple-400" />
    );
  };

  // Get active filters
  const activeFilters = Object.entries(dataset.filters).filter(
    ([, values]) => values.length > 0
  );

  return (
    <div className="p-8">
      {/* Back Button and Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 rounded-lg bg-[#1a1a24] border border-[#2a2a36] hover:border-[#3a3a46] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">{dataset.name}</h1>
          <p className="text-gray-400 text-sm">
            Created on {new Date(dataset.createdAt).toLocaleDateString()} at{" "}
            {new Date(dataset.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Dataset Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Endpoint Card */}
        <div className="bg-[#1a1a24] rounded-xl p-5 border border-[#2a2a36]">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">Endpoint</span>
          </div>
          <p className="text-white font-medium">/api/v1/panel/{dataset.endpoint}</p>
        </div>

        {/* Records Card */}
        <div className="bg-[#1a1a24] rounded-xl p-5 border border-[#2a2a36]">
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Total Records</span>
          </div>
          <p className="text-white font-medium text-2xl">
            {dataset.totalRecords.toLocaleString()}
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-[#1a1a24] rounded-xl p-5 border border-[#2a2a36]">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Active Filters</span>
          </div>
          <p className="text-white font-medium text-2xl">{activeFilters.length}</p>
        </div>
      </div>

      {/* Filters Section */}
      {activeFilters.length > 0 && (
        <div className="bg-[#1a1a24] rounded-xl p-6 border border-[#2a2a36] mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-white" />
            <h2 className="text-lg font-semibold text-white">Applied Filters</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {activeFilters.map(([key, values]) => (
              <div key={key} className="bg-[#0f0f13] rounded-lg p-3 border border-[#2a2a36]">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">
                  {filterCategoryNames[key] || key}
                </p>
                <div className="flex flex-wrap gap-2">
                  {values.map((value) => (
                    <span
                      key={value}
                      className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a36]">
        {/* Table Header */}
        <div className="p-6 border-b border-[#2a2a36]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Users Data</h2>
              <span className="bg-purple-600/20 text-purple-400 text-xs font-medium px-2 py-1 rounded-full">
                {filteredData.length} users
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#0f0f13] border border-[#2a2a36] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a36]">
                <th
                  onClick={() => handleSort("firstName")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    Name
                    <SortIcon field="firstName" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("email")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    Email
                    <SortIcon field="email" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("company")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    Company
                    <SortIcon field="company" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("jobTitle")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    Job Title
                    <SortIcon field="jobTitle" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("jobFunction")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    Function
                    <SortIcon field="jobFunction" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("industry")}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    Industry
                    <SortIcon field="industry" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((record, index) => (
                <tr
                  key={record.hashId || index}
                  className="border-b border-[#2a2a36] hover:bg-[#0f0f13] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-medium text-sm">
                        {record.firstName?.[0]}
                        {record.lastName?.[0]}
                      </div>
                      <span className="text-white">
                        {record.firstName} {record.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{record.email}</td>
                  <td className="px-6 py-4 text-white text-sm">{record.company}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{record.jobTitle}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{record.jobFunction}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{record.industry}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        record.verified
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {record.verified ? "Verified" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-[#2a2a36] flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}{" "}
              users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-[#0f0f13] border border-[#2a2a36] text-gray-400 hover:text-white hover:border-[#3a3a46] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-gray-400 px-4">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-[#0f0f13] border border-[#2a2a36] text-gray-400 hover:text-white hover:border-[#3a3a46] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {paginatedData.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-400">No users found matching your search.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <Link
          href="/manage-proof"
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Run Verification
        </Link>
      </div>
    </div>
  );
}
