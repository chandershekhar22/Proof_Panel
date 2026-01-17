"use client";

import { Link2, Check } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

export default function Settings() {
  const {
    apiBaseUrl,
    setApiBaseUrl,
    apiKey,
    setApiKey,
    environment,
    setEnvironment,
    isConnected,
    setIsConnected,
  } = useAppContext();

  const handleConnect = () => {
    if (apiKey.trim()) {
      setIsConnected(!isConnected);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure API connection and application preferences</p>
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

      {/* Connection Status Info */}
      {isConnected && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
          <Check className="w-5 h-5 text-green-400" />
          <p className="text-green-400">
            API connected successfully! You can now use the Dashboard to load datasets.
          </p>
        </div>
      )}
    </div>
  );
}
