"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Respondent type
export interface Respondent {
  hashId: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  location: string;
  employmentStatus: string;
  jobTitle: string;
  jobFunction: string;
  companySize: string;
  industry: string;
  createdAt: string;
  lastActiveAt: string;
  verified: boolean;
}

// App State type
interface AppState {
  // Connection
  apiBaseUrl: string;
  apiKey: string;
  environment: string;
  isConnected: boolean;

  // Endpoint
  selectedEndpoint: string | null;

  // Filters
  selectedFilters: Record<string, string[]>;

  // Loaded Data
  loadedData: Respondent[] | null;
  totalRecords: number;

  // Manage Proof
  selectedSource: string | null;
  selectedQueries: string[];
}

// Context type with setters
interface AppContextType extends AppState {
  setApiBaseUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  setEnvironment: (env: string) => void;
  setIsConnected: (connected: boolean) => void;
  setSelectedEndpoint: (endpoint: string | null) => void;
  setSelectedFilters: (filters: Record<string, string[]>) => void;
  setLoadedData: (data: Respondent[] | null) => void;
  setTotalRecords: (total: number) => void;
  setSelectedSource: (source: string | null) => void;
  setSelectedQueries: (queries: string[]) => void;
  resetFilters: () => void;
  resetAll: () => void;
}

const defaultFilters = {
  employmentStatus: [],
  jobTitle: [],
  jobFunction: [],
  companySize: [],
  industry: [],
};

const defaultState: AppState = {
  apiBaseUrl: "http://localhost:3001",
  apiKey: "",
  environment: "Production",
  isConnected: false,
  selectedEndpoint: null,
  selectedFilters: defaultFilters,
  loadedData: null,
  totalRecords: 0,
  selectedSource: null,
  selectedQueries: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("proofpanel-state");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } catch (e) {
        console.error("Failed to parse stored state:", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("proofpanel-state", JSON.stringify(state));
    }
  }, [state, isHydrated]);

  const setApiBaseUrl = (url: string) => setState(prev => ({ ...prev, apiBaseUrl: url }));
  const setApiKey = (key: string) => setState(prev => ({ ...prev, apiKey: key }));
  const setEnvironment = (env: string) => setState(prev => ({ ...prev, environment: env }));
  const setIsConnected = (connected: boolean) => setState(prev => ({ ...prev, isConnected: connected }));
  const setSelectedEndpoint = (endpoint: string | null) => setState(prev => ({ ...prev, selectedEndpoint: endpoint }));
  const setSelectedFilters = (filters: Record<string, string[]>) => setState(prev => ({ ...prev, selectedFilters: filters }));
  const setLoadedData = (data: Respondent[] | null) => setState(prev => ({ ...prev, loadedData: data }));
  const setTotalRecords = (total: number) => setState(prev => ({ ...prev, totalRecords: total }));
  const setSelectedSource = (source: string | null) => setState(prev => ({ ...prev, selectedSource: source }));
  const setSelectedQueries = (queries: string[]) => setState(prev => ({ ...prev, selectedQueries: queries }));

  const resetFilters = () => setState(prev => ({ ...prev, selectedFilters: defaultFilters }));

  const resetAll = () => {
    setState(defaultState);
    localStorage.removeItem("proofpanel-state");
  };

  // Don't render until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

  return (
    <AppContext.Provider
      value={{
        ...state,
        setApiBaseUrl,
        setApiKey,
        setEnvironment,
        setIsConnected,
        setSelectedEndpoint,
        setSelectedFilters,
        setLoadedData,
        setTotalRecords,
        setSelectedSource,
        setSelectedQueries,
        resetFilters,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
