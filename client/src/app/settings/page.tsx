"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Link2, Check, Upload, FileSpreadsheet, Trash2, Loader2, Database } from "lucide-react";
import { useAppContext, Respondent } from "@/context/AppContext";
import * as XLSX from "xlsx";

export default function Settings() {
  const router = useRouter();
  const {
    apiBaseUrl,
    setApiBaseUrl,
    apiKey,
    setApiKey,
    environment,
    setEnvironment,
    isConnected,
    connectionType,
    activeExcelUploadId,
    connectToApi,
    connectToExcel,
    disconnect,
    excelUploads,
    addExcelUpload,
    removeExcelUpload,
  } = useAppContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Check if API is connected
  const isApiConnected = isConnected && connectionType === 'api';
  // Check if Excel is connected
  const isExcelConnected = isConnected && connectionType === 'excel';

  const handleApiConnect = () => {
    if (apiKey.trim()) {
      if (!isApiConnected) {
        // Connecting to API - navigate to dashboard
        connectToApi();
        router.push("/dashboard");
      } else {
        // Disconnecting
        disconnect();
      }
    }
  };

  const handleExcelConnect = (uploadId: string) => {
    connectToExcel(uploadId);
    router.push("/dashboard");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

      // Map Excel data to Respondent format
      const respondents: Respondent[] = jsonData.map((row, index) => ({
        hashId: String(row.hashId || row.id || `excel-${Date.now()}-${index}`),
        firstName: String(row.firstName || row.first_name || row.FirstName || ""),
        lastName: String(row.lastName || row.last_name || row.LastName || ""),
        email: String(row.email || row.Email || ""),
        company: String(row.company || row.Company || row.organization || ""),
        location: String(row.location || row.Location || row.city || ""),
        employmentStatus: String(row.employmentStatus || row.employment_status || row.EmploymentStatus || ""),
        jobTitle: String(row.jobTitle || row.job_title || row.JobTitle || row.title || ""),
        jobFunction: String(row.jobFunction || row.job_function || row.JobFunction || row.function || ""),
        companySize: String(row.companySize || row.company_size || row.CompanySize || ""),
        industry: String(row.industry || row.Industry || ""),
        createdAt: String(row.createdAt || row.created_at || new Date().toISOString()),
        lastActiveAt: String(row.lastActiveAt || row.last_active_at || new Date().toISOString()),
        verified: Boolean(row.verified || row.Verified || false),
      }));

      if (respondents.length === 0) {
        throw new Error("No data found in the Excel file");
      }

      addExcelUpload(file.name, respondents);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to parse Excel file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure API connection and data import preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          <span className="text-gray-400 text-sm">
            {isConnected
              ? connectionType === 'api'
                ? "Connected to API"
                : "Connected to Excel"
              : "Disconnected"}
          </span>
        </div>
      </div>

      {/* API Connection Card */}
      <div className={`bg-[#1a1a24] rounded-xl p-6 border mb-6 ${isApiConnected ? "border-green-500/50" : "border-[#2a2a36]"}`}>
        <div className="flex items-center gap-3 mb-6">
          <Link2 className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">API Connection</h2>
          {isApiConnected && (
            <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full">
              Active
            </span>
          )}
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
              disabled={isApiConnected || isExcelConnected}
              className="w-full bg-[#0f0f13] border border-[#2a2a36] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
              placeholder="http://localhost:3001"
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
                disabled={isApiConnected || isExcelConnected}
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
                disabled={isApiConnected || isExcelConnected}
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
            onClick={handleApiConnect}
            disabled={isExcelConnected}
            className={`font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
              isApiConnected
                ? "bg-green-600 hover:bg-green-700 text-white"
                : isExcelConnected
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {isApiConnected && <Check className="w-4 h-4" />}
            {isApiConnected ? "Connected" : "Connect to Panel"}
          </button>
        </div>
      </div>

      {/* Connection Status Info */}
      {isApiConnected && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3 mb-6">
          <Check className="w-5 h-5 text-green-400" />
          <p className="text-green-400">
            API connected successfully! You can now use the Dashboard to load datasets.
          </p>
        </div>
      )}

      {/* Excel Upload Card */}
      <div className={`bg-[#1a1a24] rounded-xl p-6 border ${isExcelConnected ? "border-green-500/50" : "border-[#2a2a36]"}`}>
        <div className="flex items-center gap-3 mb-6">
          <FileSpreadsheet className="w-5 h-5 text-white" />
          <h2 className="text-lg font-semibold text-white">Excel Sheet Upload</h2>
          {isExcelConnected && (
            <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Upload an Excel file (.xlsx, .xls) containing user data. Connect to use it as a data source, similar to the API connection.
        </p>

        {/* Upload Area */}
        <div
          onClick={() => !isConnected && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors mb-6 ${
            isConnected
              ? "border-[#2a2a36] opacity-50 cursor-not-allowed"
              : "border-[#2a2a36] cursor-pointer hover:border-purple-500/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isConnected}
          />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-3" />
              <p className="text-white">Processing file...</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-white mb-1">Click to upload or drag and drop</p>
              <p className="text-gray-500 text-sm">Excel files (.xlsx, .xls) or CSV</p>
            </>
          )}
        </div>

        {uploadError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{uploadError}</p>
          </div>
        )}

        {/* Excel Connection Status */}
        {isExcelConnected && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3 mb-6">
            <Check className="w-5 h-5 text-green-400" />
            <p className="text-green-400">
              Connected to Excel data! You can now use the Dashboard to filter and save datasets.
            </p>
          </div>
        )}

        {/* Uploaded Files List */}
        {excelUploads && excelUploads.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Uploaded Files
            </h3>
            <div className="space-y-3">
              {excelUploads.map((upload) => {
                const isActiveUpload = activeExcelUploadId === upload.id;
                return (
                  <div
                    key={upload.id}
                    className={`flex items-center justify-between bg-[#0f0f13] rounded-lg p-4 border ${
                      isActiveUpload ? "border-green-500/50" : "border-[#2a2a36]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className={`w-8 h-8 ${isActiveUpload ? "text-green-400" : "text-green-400"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{upload.fileName}</p>
                          {isActiveUpload && (
                            <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-0.5 rounded">
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm">
                          {upload.totalRecords.toLocaleString()} records • Uploaded{" "}
                          {new Date(upload.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isActiveUpload ? (
                        <button
                          onClick={() => disconnect()}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          Disconnect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleExcelConnect(upload.id)}
                          disabled={isApiConnected}
                          className={`font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            isApiConnected
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-purple-600 hover:bg-purple-700 text-white"
                          }`}
                        >
                          <Database className="w-4 h-4" />
                          Connect to Data
                        </button>
                      )}
                      <button
                        onClick={() => removeExcelUpload(upload.id)}
                        disabled={isActiveUpload}
                        className={`transition-colors p-2 ${
                          isActiveUpload
                            ? "text-gray-600 cursor-not-allowed"
                            : "text-gray-500 hover:text-red-400"
                        }`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
