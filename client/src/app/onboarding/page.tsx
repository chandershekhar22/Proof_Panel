"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  Shield,
  LayoutDashboard,
  Info,
  ChevronRight,
  ChevronLeft,
  Layers,
  CheckCircle,
  Loader2,
  Monitor,
  Car,
  Building2,
  Stethoscope,
  GraduationCap,
  Grid3X3,
  Link,
  Upload,
  Star,
  X,
  Check,
} from "lucide-react";

const steps = [
  { id: 1, name: "Categories", icon: Grid3X3 },
  { id: 2, name: "Verification", icon: Shield },
  { id: 3, name: "Dashboard", icon: LayoutDashboard },
];

const profileCategories = [
  {
    id: "b2b",
    title: "B2B Professional",
    description: "Decision makers, executives, and business professionals",
    icon: Briefcase,
    color: "bg-blue-500",
  },
  {
    id: "developer",
    title: "Developer & Tech",
    description: "Software developers, engineers, and tech professionals",
    icon: Monitor,
    color: "bg-emerald-500",
  },
  {
    id: "automotive",
    title: "Automotive Ownership",
    description: "Vehicle owners and automotive enthusiasts",
    icon: Car,
    color: "bg-orange-500",
  },
  {
    id: "asset",
    title: "Asset Ownership",
    description: "Property owners, investors, and asset holders",
    icon: Building2,
    color: "bg-blue-500",
  },
  {
    id: "healthcare",
    title: "Healthcare Professional",
    description: "Doctors, nurses, and medical practitioners",
    icon: Stethoscope,
    color: "bg-pink-500",
  },
  {
    id: "education",
    title: "Education Professional",
    description: "Teachers, professors, and education administrators",
    icon: GraduationCap,
    color: "bg-amber-500",
  },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportInstructions, setShowExportInstructions] = useState(false);
  const [selectedConnectMethod, setSelectedConnectMethod] = useState<'quick' | 'full' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDataSelectionModal, setShowDataSelectionModal] = useState(false);
  const [selectedDataTypes, setSelectedDataTypes] = useState({
    basicInfo: true,
    connections: true,
    messageHeaders: true,
    importedContacts: true,
  });

  // Check for LinkedIn callback result
  useEffect(() => {
    const linkedinResult = searchParams.get("linkedin");

    if (linkedinResult === "success") {
      setLinkedinConnected(true);
      setCurrentStep(3); // Move to dashboard step

      // Get profile from sessionStorage if available
      const profileData = sessionStorage.getItem("linkedinProfile");
      if (profileData) {
        console.log("LinkedIn profile:", JSON.parse(profileData));
        sessionStorage.removeItem("linkedinProfile");
      }

      // Clean up URL
      router.replace("/onboarding");
    } else if (linkedinResult === "error") {
      // Handle error - stay on verification step
      setCurrentStep(2);
      router.replace("/onboarding");
    }
  }, [searchParams, router]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Show the LinkedIn connect modal
  const handleLinkedInConnect = () => {
    setShowLinkedInModal(true);
    setSelectedConnectMethod(null);
  };

  // Actually connect via OAuth (Quick Connect)
  const handleQuickConnect = async () => {
    try {
      // Set flag to indicate onboarding flow
      sessionStorage.setItem("linkedinOnboarding", "true");

      // Get LinkedIn OAuth URL from server
      const response = await fetch(`${API_URL}/api/auth/linkedin`);
      const data = await response.json();

      if (data.success && data.authUrl) {
        // Redirect to LinkedIn OAuth
        window.location.href = data.authUrl;
      } else {
        console.error("Failed to get LinkedIn auth URL");
        sessionStorage.removeItem("linkedinOnboarding");
      }
    } catch (error) {
      console.error("LinkedIn connect error:", error);
      sessionStorage.removeItem("linkedinOnboarding");
    }
  };

  // Handle Full Profile Upload (Archive)
  const handleFullProfileUpload = () => {
    setShowLinkedInModal(false);
    setShowUploadModal(true);
  };

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      setUploadedFile(file);
      // Show data selection modal after file is uploaded
      setShowUploadModal(false);
      setShowDataSelectionModal(true);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setUploadedFile(file);
      // Show data selection modal after file is uploaded
      setShowUploadModal(false);
      setShowDataSelectionModal(true);
    }
  };

  // Toggle data type selection
  const toggleDataType = (key: keyof typeof selectedDataTypes) => {
    // Connections is required and cannot be deselected
    if (key === 'connections') return;
    setSelectedDataTypes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Get selected count
  const getSelectedCount = () => {
    return Object.values(selectedDataTypes).filter(Boolean).length;
  };

  // Handle final upload submission
  const handleFinalUpload = () => {
    if (uploadedFile) {
      // TODO: Process the uploaded file with selected data types
      console.log("Uploading file:", uploadedFile.name);
      console.log("Selected data types:", selectedDataTypes);
      setLinkedinConnected(true);
      setShowDataSelectionModal(false);
      setCurrentStep(3);
    }
  };

  // Handle upload submission (now goes to data selection)
  const handleUploadSubmit = () => {
    if (uploadedFile) {
      setShowUploadModal(false);
      setShowDataSelectionModal(true);
    }
  };

  const handleGitHubConnect = () => {
    // GitHub OAuth - Coming soon
    alert("GitHub verification coming soon!");
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - redirect based on user role
      const userRole = sessionStorage.getItem("userRole");
      if (userRole === "insight_company") {
        router.push("/insight/dashboard");
      } else {
        // Default to member dashboard for panelists
        router.push("/member/dashboard");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left Sidebar */}
      <aside className="w-72 bg-[#0d0d12] border-r border-[#1a1a24] flex flex-col">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-white">Proof</span>
            <span className="text-emerald-400">Panel</span>
          </span>
        </div>

        {/* Steps */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Profile Setup
          </p>
          <ul className="space-y-2">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <li key={step.id}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-500/10 text-white"
                        : isCompleted
                        ? "text-emerald-400"
                        : "text-gray-500"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                        isActive
                          ? "bg-emerald-500 text-white"
                          : isCompleted
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-[#1a1a24] text-gray-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ZKP Info Box */}
        <div className="mt-auto p-6">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">ZKP Protected</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              All profile information is converted to zero-knowledge proofs. Your raw data is never stored.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Profile Categories */}
          {currentStep === 1 && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Select Your Profile Categories</h1>
                <p className="text-gray-400">Choose categories that match your background to unlock relevant survey opportunities</p>
              </div>

              {/* Category Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                        isSelected
                          ? "bg-[#12121a] border-emerald-500/50"
                          : "bg-[#12121a] border-[#1a1a24] hover:border-[#2a2a36]"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{category.title}</p>
                          <p className="text-gray-500 text-sm">{category.description}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-600"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedCategories.length > 0 && (
                <div className="flex items-start gap-2 mt-6 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Info className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-emerald-400 text-sm">
                    {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"} selected. You can select multiple categories to unlock more survey opportunities.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Step 2: Verification */}
          {currentStep === 2 && (
            <>
              {/* Verifying Overlay */}
              {isVerifying && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div className="bg-[#12121a] border border-[#1a1a24] rounded-2xl p-8 text-center max-w-sm mx-4">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Verifying Your Profile</h3>
                    <p className="text-gray-400 text-sm">
                      Please wait while we verify your credentials...
                    </p>
                  </div>
                </div>
              )}

              {/* LinkedIn Connect Modal */}
              {showLinkedInModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0d1117] border border-[#1a1a24] rounded-2xl w-full max-w-2xl overflow-hidden">
                    {/* Modal Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">Connect LinkedIn</h3>
                          <p className="text-gray-400 text-sm">Choose how you want to verify your profile</p>
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="px-6 space-y-3">
                      {/* Quick Connect Option */}
                      <button
                        onClick={() => setSelectedConnectMethod('quick')}
                        className={`w-full p-4 rounded-xl border text-left transition-all ${
                          selectedConnectMethod === 'quick'
                            ? 'bg-[#1a2332] border-blue-500'
                            : 'bg-[#12161c] border-[#1a1a24] hover:border-[#2a2a36]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mt-0.5">
                              <Link className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-semibold">Quick Connect</span>
                                <span className="text-xs text-gray-400">via OAuth</span>
                              </div>
                              <p className="text-gray-400 text-sm mb-2">Instant verification with basic profile info</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span className="text-gray-300">Name & headline</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span className="text-gray-300">Current position</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <X className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-500">No network data</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 block mb-1">Quick</span>
                            <div className="bg-[#1a2332] px-2 py-1 rounded">
                              <span className="text-xs text-gray-400">Reward Boost</span>
                              <p className="text-lg font-bold text-white">1.5x</p>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Full Profile Upload Option */}
                      <button
                        onClick={() => setSelectedConnectMethod('full')}
                        className={`w-full p-4 rounded-xl border text-left transition-all relative ${
                          selectedConnectMethod === 'full'
                            ? 'bg-[#1a2332] border-emerald-500'
                            : 'bg-[#12161c] border-[#1a1a24] hover:border-[#2a2a36]'
                        }`}
                      >
                        {/* Recommended Badge */}
                        <div className="absolute -top-2 right-4 flex items-center gap-1 bg-amber-500 text-black text-xs font-semibold px-2 py-0.5 rounded">
                          <Star className="w-3 h-3" />
                          Recommended
                        </div>

                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center mt-0.5">
                              <Upload className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-white font-semibold">Full Profile Upload</span>
                                <span className="text-xs text-gray-400">via Archive</span>
                              </div>
                              <p className="text-gray-400 text-sm mb-2">Upload your LinkedIn data export for maximum rewards</p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span className="text-gray-300">Complete profile & work history</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span className="text-gray-300">Skills & endorsements</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span className="text-gray-300">Network connections</span>
                                  <span className="text-amber-400 text-xs">+Referral earnings</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="bg-emerald-500/20 px-2 py-1 rounded">
                              <span className="text-xs text-emerald-400">Reward Boost</span>
                              <p className="text-lg font-bold text-emerald-400">3x</p>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Info Box */}
                    <div className="px-6 mt-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-blue-400 text-sm font-medium">Why upload your archive?</p>
                            <p className="text-gray-400 text-xs mt-1">
                              With your network data, you can earn by referring similar professionals for surveys. Your data is ZKP protected and never shared.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 pt-4 flex items-center justify-between">
                      <button
                        onClick={() => setShowLinkedInModal(false)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-xs">ZKP Protected</span>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedConnectMethod === 'quick') {
                            handleQuickConnect();
                          } else if (selectedConnectMethod === 'full') {
                            handleFullProfileUpload();
                          }
                        }}
                        disabled={!selectedConnectMethod}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
                      >
                        Connect LinkedIn
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Upload Modal */}
              {showUploadModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0d1117] border border-[#1a1a24] rounded-2xl w-full max-w-lg overflow-hidden">
                    {/* Modal Header */}
                    <div className="p-6 pb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">Connect LinkedIn</h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowUploadModal(false);
                          setUploadedFile(null);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Steps */}
                    <div className="px-6 space-y-4">
                      {/* Step 1: Export your data */}
                      <button
                        onClick={() => {
                          setShowUploadModal(false);
                          setShowExportInstructions(true);
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-[#12161c] rounded-lg border border-[#1a1a24] hover:border-emerald-500/50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-medium">Export your data</span>
                            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                          <p className="text-gray-500 text-sm">Download your data from LinkedIn</p>
                        </div>
                      </button>

                      {/* Step 2: Upload your file */}
                      <div className="flex items-center gap-3 p-3 bg-[#12161c] rounded-lg border border-[#1a1a24]">
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Upload className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <span className="text-white font-medium">Upload your file</span>
                          <p className="text-gray-500 text-sm">ZIP file accepted</p>
                        </div>
                      </div>

                      {/* Drop Zone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('fileInput')?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                          isDragging
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : uploadedFile
                            ? 'border-emerald-500 bg-emerald-500/5'
                            : 'border-[#2a2a36] hover:border-[#3a3a46]'
                        }`}
                      >
                        <input
                          id="fileInput"
                          type="file"
                          accept=".zip"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        {uploadedFile ? (
                          <>
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <CheckCircle className="w-6 h-6 text-emerald-400" />
                            </div>
                            <p className="text-white font-medium mb-1">{uploadedFile.name}</p>
                            <p className="text-gray-500 text-sm">Click to change file</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                            <p className="text-white font-medium mb-1">Drop your LinkedIn export here or click to browse</p>
                            <p className="text-gray-500 text-sm mb-3">You&apos;ll choose what data to share in the next step</p>
                            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>ZIP</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Learn More Link */}
                      <div className="text-center">
                        <a
                          href="https://www.linkedin.com/help/linkedin/answer/50191"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                          Learn more
                        </a>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 pt-4 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setShowUploadModal(false);
                          setShowLinkedInModal(true);
                          setUploadedFile(null);
                        }}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back
                      </button>
                      <button
                        onClick={handleUploadSubmit}
                        disabled={!uploadedFile}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Selection Modal */}
              {showDataSelectionModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0d1117] border border-[#1a1a24] rounded-2xl w-full max-w-lg overflow-hidden">
                    {/* Modal Header */}
                    <div className="p-6 pb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white">Connect LinkedIn</h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowDataSelectionModal(false);
                          setUploadedFile(null);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Data Selection Content */}
                    <div className="px-6">
                      <div className="mb-4">
                        <h4 className="text-white font-semibold text-lg">Select data to upload</h4>
                        <p className="text-gray-400 text-sm">Sensitive data is not shared to Happenstance.</p>
                      </div>

                      {/* Data Type Options */}
                      <div className="space-y-3">
                        {/* Basic Information */}
                        <button
                          onClick={() => toggleDataType('basicInfo')}
                          className="w-full flex items-start gap-3 p-3 bg-[#12161c] rounded-lg border border-[#1a1a24] hover:border-[#2a2a36] transition-colors text-left"
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedDataTypes.basicInfo
                              ? 'bg-emerald-500'
                              : 'border-2 border-gray-600'
                          }`}>
                            {selectedDataTypes.basicInfo && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <span className="text-white font-medium">Basic information</span>
                            <p className="text-gray-500 text-sm">Profile, work history, education, skills, and contact info</p>
                          </div>
                        </button>

                        {/* Connections - Required */}
                        <div className="w-full flex items-start gap-3 p-3 bg-[#12161c] rounded-lg border border-[#1a1a24] text-left">
                          <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">Connections</span>
                              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-medium">Required</span>
                            </div>
                            <p className="text-gray-500 text-sm">Your LinkedIn connections and associated URLs</p>
                          </div>
                        </div>

                        {/* Message Headers */}
                        <button
                          onClick={() => toggleDataType('messageHeaders')}
                          className="w-full flex items-start gap-3 p-3 bg-[#12161c] rounded-lg border border-[#1a1a24] hover:border-[#2a2a36] transition-colors text-left"
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedDataTypes.messageHeaders
                              ? 'bg-emerald-500'
                              : 'border-2 border-gray-600'
                          }`}>
                            {selectedDataTypes.messageHeaders && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <span className="text-white font-medium">Message headers</span>
                            <p className="text-gray-500 text-sm">Metadata only - messages are not uploaded.</p>
                          </div>
                        </button>

                        {/* Imported Contacts */}
                        <button
                          onClick={() => toggleDataType('importedContacts')}
                          className="w-full flex items-start gap-3 p-3 bg-[#12161c] rounded-lg border border-[#1a1a24] hover:border-[#2a2a36] transition-colors text-left"
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedDataTypes.importedContacts
                              ? 'bg-emerald-500'
                              : 'border-2 border-gray-600'
                          }`}>
                            {selectedDataTypes.importedContacts && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <span className="text-white font-medium">Imported contacts</span>
                            <p className="text-gray-500 text-sm">Phone book contacts from the LinkedIn app</p>
                          </div>
                        </button>
                      </div>

                      {/* Selected Count */}
                      <div className="mt-4 text-gray-400 text-sm">
                        {getSelectedCount()} of 4 selected
                      </div>

                      {/* Learn More Link */}
                      <div className="mt-2 mb-4">
                        <a
                          href="https://www.linkedin.com/help/linkedin/answer/50191"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white text-sm transition-colors"
                        >
                          Learn more
                        </a>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="p-6 pt-2 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setShowDataSelectionModal(false);
                          setShowUploadModal(true);
                        }}
                        className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleFinalUpload}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Instructions Modal */}
              {showExportInstructions && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0d1117] border border-[#1a1a24] rounded-2xl w-full max-w-4xl overflow-hidden">
                    {/* Close Button */}
                    <div className="flex justify-end p-4 pb-0">
                      <button
                        onClick={() => {
                          setShowExportInstructions(false);
                          setShowUploadModal(true);
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="px-8 pb-8">
                      <h2 className="text-2xl font-bold text-white text-center mb-6">
                        Request your archive on the next screen
                      </h2>

                      {/* LinkedIn Export Preview */}
                      <div className="bg-white rounded-lg p-6 mb-6">
                        <h3 className="text-gray-800 font-semibold mb-2">Export your data</h3>
                        <p className="text-gray-600 text-sm mb-4">
                          Your LinkedIn data belongs to you, and you can download an archive any time or{" "}
                          <span className="text-blue-600">view the rich media</span> you have uploaded.
                        </p>

                        {/* Option 1 - Recommended */}
                        <div className="mb-3">
                          <div className="flex items-start gap-3 p-3 border-2 border-blue-500 rounded-lg bg-blue-50">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                              <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 text-sm">
                                <strong>Download larger data archive</strong>, including connections, verifications, contacts, account history, and information we infer about you based on your profile and activity.{" "}
                                <span className="text-blue-600">Learn more</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Option 2 - Not Recommended */}
                        <div className="mb-4">
                          <div className="flex items-start gap-3 p-3 border-2 border-red-300 rounded-lg bg-red-50 relative">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-600 text-sm">
                                Want something in particular? Select the data files you&apos;re most interested in.
                              </p>
                              <div className="flex flex-wrap gap-4 mt-2 opacity-50">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                  <input type="checkbox" disabled className="w-4 h-4" /> Profile
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                  <input type="checkbox" disabled className="w-4 h-4" /> Imported Contacts
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                  <input type="checkbox" disabled className="w-4 h-4" /> Invitations
                                </label>
                              </div>
                            </div>
                            {/* Warning overlay */}
                            <div className="absolute -right-2 -bottom-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded transform rotate-3">
                              Don&apos;t choose this option!
                            </div>
                          </div>
                        </div>

                        {/* Request Archive Button Preview */}
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
                            Request archive
                          </button>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="space-y-4 mb-6">
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                          <div>
                            <p className="text-white font-medium">Select &quot;Download larger data archive&quot; (top option)</p>
                            <div className="flex items-center gap-2 mt-1 text-amber-400 text-sm">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span>The second option won&apos;t work as it doesn&apos;t include your connections.</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                          <p className="text-white font-medium">Click &quot;Request archive&quot;</p>
                        </div>
                      </div>

                      {/* Continue Button */}
                      <button
                        onClick={() => {
                          window.open("https://www.linkedin.com/mypreferences/d/download-my-data", "_blank");
                        }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        Continue to LinkedIn
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Verify Your Profile</h1>
                <p className="text-gray-400">Connect your professional accounts for higher earnings</p>
              </div>

              <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Verification Options</h2>
                </div>

                <div className="space-y-4">
                  {/* LinkedIn Verification */}
                  <div className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg border border-[#2a2a36]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">LinkedIn</p>
                        <p className="text-gray-500 text-sm">Verify your professional profile</p>
                      </div>
                    </div>
                    {linkedinConnected ? (
                      <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Connected
                      </span>
                    ) : (
                      <button
                        onClick={handleLinkedInConnect}
                        disabled={isVerifying}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Connect
                      </button>
                    )}
                  </div>

                  {/* GitHub Verification */}
                  <div className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg border border-[#2a2a36]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">GitHub</p>
                        <p className="text-gray-500 text-sm">Verify your developer profile</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-gray-700/50 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                      Coming Soon
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Info className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-emerald-400 text-sm">
                    Verification is optional but verified panelists earn up to 3x more per survey.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Dashboard Preview */}
          {currentStep === 3 && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">You&apos;re All Set!</h1>
                <p className="text-gray-400">Your profile is ready. Start earning with surveys matched to you.</p>
              </div>

              <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Profile Summary</h2>
                </div>

                <div className="space-y-3">
                  <div className="py-2">
                    <span className="text-gray-400 block mb-3">Selected Categories</span>
                    {selectedCategories.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((catId) => {
                          const category = profileCategories.find((c) => c.id === catId);
                          if (!category) return null;
                          const IconComponent = category.icon;
                          return (
                            <div
                              key={catId}
                              className="flex items-center gap-2 px-3 py-2 bg-[#1a1a24] rounded-lg border border-[#2a2a36]"
                            >
                              <div className={`w-6 h-6 ${category.color} rounded flex items-center justify-center`}>
                                <IconComponent className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-white text-sm">{category.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No categories selected</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">Ready to Start Earning?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Based on your profile, you qualify for premium surveys with higher payouts.
                </p>
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Average payout: $15-50 per survey</span>
                </div>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-white hover:bg-[#1a1a24]"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
            >
              {currentStep === 3 ? "Go to Dashboard" : "Continue"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
