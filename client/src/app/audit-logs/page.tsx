"use client";

import { FileText } from "lucide-react";

export default function AuditLogs() {
  const isConnected = true;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
          <p className="text-gray-400">View system activity and user actions</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
          <span className="text-gray-400 text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-16 h-16 bg-[#1a1a24] rounded-full flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">No Logs Available</h2>
        <p className="text-gray-400 text-center max-w-md">
          Audit logs will appear here once you start using the application.
        </p>
      </div>
    </div>
  );
}
