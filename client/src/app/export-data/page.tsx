"use client";

import Link from "next/link";
import { Download } from "lucide-react";

export default function ExportData() {
  const isConnected = true;
  const hasDataset = false;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Export Data</h1>
          <p className="text-gray-400">Export filtered datasets in various formats</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          <span className="text-gray-400 text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {/* Empty State */}
      {!hasDataset && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 bg-[#1a1a24] rounded-full flex items-center justify-center mb-6">
            <Download className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Data to Export</h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Please load a dataset from the Dashboard first to export data.
          </p>
          <Link
            href="/"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
