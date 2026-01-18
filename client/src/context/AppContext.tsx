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

// Verification config for tracking changes
export interface VerificationConfig {
  hashIds: string[];
  selectedQueries: string[];
}

// Data Set type for storing multiple filter configurations
export interface DataSet {
  id: string;
  name: string;
  createdAt: string;
  endpoint: string;
  filters: Record<string, string[]>;
  data: Respondent[];
  totalRecords: number;
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

  // Multiple Data Sets
  dataSets: DataSet[];
  activeDataSetId: string | null;

  // Manage Proof
  selectedSource: string | null;
  selectedQueries: string[];

  // Verification tracking
  lastVerificationConfig: VerificationConfig | null;
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
  setLastVerificationConfig: (config: VerificationConfig | null) => void;
  // Data Sets
  addDataSet: (name: string) => void;
  removeDataSet: (id: string) => void;
  setActiveDataSetId: (id: string | null) => void;
  getActiveDataSet: () => DataSet | null;
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
  dataSets: [],
  activeDataSetId: null,
  selectedSource: null,
  selectedQueries: [],
  lastVerificationConfig: null,
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
  const setLastVerificationConfig = (config: VerificationConfig | null) => setState(prev => ({ ...prev, lastVerificationConfig: config }));

  // Data Set functions
  const addDataSet = (name: string) => {
    if (!state.loadedData || !state.selectedEndpoint) return;

    const newDataSet: DataSet = {
      id: `dataset-${Date.now()}`,
      name: name,
      createdAt: new Date().toISOString(),
      endpoint: state.selectedEndpoint,
      filters: { ...state.selectedFilters },
      data: [...state.loadedData],
      totalRecords: state.totalRecords,
    };

    setState(prev => ({
      ...prev,
      dataSets: [...(prev.dataSets || []), newDataSet],
      // Clear current loaded data after saving
      loadedData: null,
      totalRecords: 0,
      selectedFilters: defaultFilters,
    }));
  };

  const removeDataSet = (id: string) => {
    setState(prev => ({
      ...prev,
      dataSets: (prev.dataSets || []).filter(ds => ds.id !== id),
      activeDataSetId: prev.activeDataSetId === id ? null : prev.activeDataSetId,
    }));
  };

  const setActiveDataSetId = (id: string | null) => {
    setState(prev => ({ ...prev, activeDataSetId: id }));
  };

  const getActiveDataSet = (): DataSet | null => {
    if (!state.activeDataSetId || !state.dataSets) return null;
    return state.dataSets.find(ds => ds.id === state.activeDataSetId) || null;
  };

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
        setLastVerificationConfig,
        addDataSet,
        removeDataSet,
        setActiveDataSetId,
        getActiveDataSet,
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
