"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";

export default function ManageProof() {
  const isConnected = true; // TODO: Get from global state
  const hasDataset = false; // TODO: Get from global state

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

      {/* Empty State */}
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
    </div>
  );
}
