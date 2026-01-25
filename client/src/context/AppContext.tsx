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

// Excel Upload type
export interface ExcelUpload {
  id: string;
  fileName: string;
  uploadedAt: string;
  totalRecords: number;
  data: Respondent[];
}

// Connection type - either API or Excel
export type ConnectionType = 'api' | 'excel' | null;

// App State type
interface AppState {
  // Connection
  apiBaseUrl: string;
  apiKey: string;
  environment: string;
  isConnected: boolean;
  connectionType: ConnectionType;
  activeExcelUploadId: string | null;

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

  // Excel Uploads
  excelUploads: ExcelUpload[];

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
  setConnectionType: (type: ConnectionType) => void;
  setActiveExcelUploadId: (id: string | null) => void;
  connectToApi: () => void;
  connectToExcel: (uploadId: string) => void;
  disconnect: () => void;
  getActiveExcelUpload: () => ExcelUpload | null;
  setSelectedEndpoint: (endpoint: string | null) => void;
  setSelectedFilters: (filters: Record<string, string[]>) => void;
  setLoadedData: (data: Respondent[] | null) => void;
  setTotalRecords: (total: number) => void;
  setSelectedSource: (source: string | null) => void;
  setSelectedQueries: (queries: string[]) => void;
  setLastVerificationConfig: (config: VerificationConfig | null) => void;
  // Data Sets
  addDataSet: (name: string) => void;
  addDataSetFromExcel: (name: string, data: Respondent[], filters: Record<string, string[]>) => void;
  removeDataSet: (id: string) => void;
  setActiveDataSetId: (id: string | null) => void;
  getActiveDataSet: () => DataSet | null;
  // Excel Uploads
  addExcelUpload: (fileName: string, data: Respondent[]) => void;
  removeExcelUpload: (id: string) => void;
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
  connectionType: null,
  activeExcelUploadId: null,
  selectedEndpoint: null,
  selectedFilters: defaultFilters,
  loadedData: null,
  totalRecords: 0,
  dataSets: [],
  activeDataSetId: null,
  excelUploads: [],
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
  const setConnectionType = (type: ConnectionType) => setState(prev => ({ ...prev, connectionType: type }));
  const setActiveExcelUploadId = (id: string | null) => setState(prev => ({ ...prev, activeExcelUploadId: id }));

  // Connect to API
  const connectToApi = () => {
    setState(prev => ({
      ...prev,
      isConnected: true,
      connectionType: 'api',
      activeExcelUploadId: null,
      loadedData: null,
      totalRecords: 0,
      selectedEndpoint: null,
    }));
  };

  // Connect to Excel data
  const connectToExcel = (uploadId: string) => {
    setState(prev => ({
      ...prev,
      isConnected: true,
      connectionType: 'excel',
      activeExcelUploadId: uploadId,
      loadedData: null,
      totalRecords: 0,
      selectedEndpoint: null,
    }));
  };

  // Disconnect (works for both API and Excel)
  const disconnect = () => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionType: null,
      activeExcelUploadId: null,
      loadedData: null,
      totalRecords: 0,
      selectedEndpoint: null,
      selectedFilters: defaultFilters,
    }));
  };

  // Get active Excel upload
  const getActiveExcelUpload = (): ExcelUpload | null => {
    if (!state.activeExcelUploadId || !state.excelUploads) return null;
    return state.excelUploads.find(eu => eu.id === state.activeExcelUploadId) || null;
  };

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

  // Add dataset from Excel upload with filters
  const addDataSetFromExcel = (name: string, data: Respondent[], filters: Record<string, string[]>) => {
    const newDataSet: DataSet = {
      id: `dataset-${Date.now()}`,
      name: name,
      createdAt: new Date().toISOString(),
      endpoint: "excel-upload",
      filters: { ...filters },
      data: [...data],
      totalRecords: data.length,
    };

    setState(prev => ({
      ...prev,
      dataSets: [...(prev.dataSets || []), newDataSet],
    }));
  };

  const setActiveDataSetId = (id: string | null) => {
    setState(prev => ({ ...prev, activeDataSetId: id }));
  };

  // Excel Upload functions
  const addExcelUpload = (fileName: string, data: Respondent[]) => {
    const newUpload: ExcelUpload = {
      id: `excel-${Date.now()}`,
      fileName: fileName,
      uploadedAt: new Date().toISOString(),
      totalRecords: data.length,
      data: data,
    };

    setState(prev => ({
      ...prev,
      excelUploads: [...(prev.excelUploads || []), newUpload],
    }));
  };

  const removeExcelUpload = (id: string) => {
    setState(prev => ({
      ...prev,
      excelUploads: (prev.excelUploads || []).filter(eu => eu.id !== id),
    }));
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
        setConnectionType,
        setActiveExcelUploadId,
        connectToApi,
        connectToExcel,
        disconnect,
        getActiveExcelUpload,
        setSelectedEndpoint,
        setSelectedFilters,
        setLoadedData,
        setTotalRecords,
        setSelectedSource,
        setSelectedQueries,
        setLastVerificationConfig,
        addDataSet,
        addDataSetFromExcel,
        removeDataSet,
        setActiveDataSetId,
        getActiveDataSet,
        addExcelUpload,
        removeExcelUpload,
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
