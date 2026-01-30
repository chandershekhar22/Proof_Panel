"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
import {
  ArrowLeft,
  Monitor,
  Stethoscope,
  DollarSign,
  GraduationCap,
  Building2,
  Car,
  Shield,
  CheckCircle,
  ChevronRight,
  Users,
  Target,
  Search,
  Zap,
  ChevronDown,
  FileText,
  Link2,
  Rocket,
} from "lucide-react";

const steps = [
  { id: 1, name: "Select Audience", icon: Users },
  { id: 2, name: "Set Targeting", icon: Target },
  { id: 3, name: "Review Matches", icon: Search },
  { id: 4, name: "Launch Study", icon: Zap },
];

const audienceSegments = [
  {
    id: "tech",
    title: "Technology Professionals",
    description: "Developers, Engineers, IT Decision Makers",
    icon: Monitor,
    verified: "245,000",
    verifiedDisplay: "245,000+",
    color: "bg-gray-700",
    tags: ["Role", "Experience Level", "Primary Skills", "+4 more"],
  },
  {
    id: "healthcare",
    title: "Healthcare Professionals",
    description: "Physicians, Specialists, Allied Health",
    icon: Stethoscope,
    verified: "180,000",
    verifiedDisplay: "180,000+",
    color: "bg-pink-600",
    tags: ["Provider Type", "Specialty", "Practice Setting", "+3 more"],
  },
  {
    id: "financial",
    title: "Financial Professionals",
    description: "Advisors, Wealth Managers, CFOs",
    icon: DollarSign,
    verified: "95,000",
    verifiedDisplay: "95,000+",
    color: "bg-amber-500",
    tags: ["Role", "Assets Under Management", "Primary Client Type", "+2 more"],
  },
  {
    id: "education",
    title: "Education Professionals",
    description: "Teachers, Administrators, EdTech Users",
    icon: GraduationCap,
    verified: "320,000",
    verifiedDisplay: "320,000+",
    color: "bg-amber-600",
    tags: ["Role", "Grade Level", "Subject Area", "+3 more"],
  },
  {
    id: "b2b",
    title: "B2B Decision Makers",
    description: "C-Suite, VPs, Directors, Managers",
    icon: Building2,
    verified: "420,000",
    verifiedDisplay: "420,000+",
    color: "bg-blue-600",
    tags: ["Job Title", "Department", "Company Size", "+3 more"],
  },
  {
    id: "vehicle",
    title: "Vehicle Owners",
    description: "Current Owners, Intenders, Lessees",
    icon: Car,
    verified: "890,000",
    verifiedDisplay: "890,000+",
    color: "bg-red-500",
    tags: ["Vehicle Type", "Current Brand", "Ownership Type", "+3 more"],
  },
];

// Targeting options for each audience type
const targetingOptions: Record<string, { title: string; options: string[] }[]> = {
  tech: [
    { title: "Role", options: ["Frontend Developer", "Backend Developer", "Full Stack", "DevOps Engineer", "ML Engineer", "Data Engineer", "Cloud Architect", "QA Engineer", "Security Engineer"] },
    { title: "Experience Level", options: ["Junior (0-2 yrs)", "Mid (3-5 yrs)", "Senior (6-10 yrs)", "Staff/Principal (10+ yrs)", "Director/VP Level"] },
    { title: "Primary Skills", options: ["Python", "JavaScript", "Java", "Go", "Rust", "C#", "Ruby", "TypeScript", "Kotlin", "Swift"] },
    { title: "Cloud Expertise", options: ["AWS", "Azure", "Google Cloud", "Multi-cloud", "On-premise"] },
    { title: "AI/ML Tools", options: ["TensorFlow", "PyTorch", "OpenAI/GPT", "Hugging Face", "Scikit-learn", "MLOps"] },
  ],
  healthcare: [
    { title: "Provider Type", options: ["Physician (MD/DO)", "Nurse Practitioner", "Physician Assistant", "Registered Nurse", "Pharmacist", "Allied Health"] },
    { title: "Specialty", options: ["Primary Care", "Cardiology", "Oncology", "Neurology", "Orthopedics", "Dermatology", "Psychiatry", "Pediatrics", "Emergency Medicine"] },
    { title: "Practice Setting", options: ["Hospital", "Private Practice", "Academic Medical Center", "Community Health", "Telehealth", "Specialty Clinic"] },
    { title: "Prescribing Volume", options: ["High Volume (50+ Rx/week)", "Moderate (20-50 Rx/week)", "Low Volume (<20 Rx/week)"] },
    { title: "Patient Volume", options: ["High (100+ patients/week)", "Moderate (50-100/week)", "Specialized (<50/week)"] },
  ],
  financial: [
    { title: "Role", options: ["Financial Advisor", "Wealth Manager", "Portfolio Manager", "CFO", "Controller", "Investment Banker", "CPA"] },
    { title: "Assets Under Management", options: ["<$10M", "$10M-$50M", "$50M-$100M", "$100M-$500M", "$500M+"] },
    { title: "Primary Client Type", options: ["Retail/Mass Affluent", "High Net Worth", "Ultra High Net Worth", "Institutional", "Corporate"] },
    { title: "Products Managed", options: ["Equities", "Fixed Income", "ETFs/Mutual Funds", "Alternatives", "Insurance/Annuities", "Crypto/Digital Assets"] },
    { title: "Licenses Held", options: ["Series 7", "Series 66", "CFP", "CFA", "CPA", "ChFC"] },
  ],
  education: [
    { title: "Role", options: ["Teacher", "Professor", "Principal", "Superintendent", "Curriculum Director", "Instructional Designer"] },
    { title: "Grade Level", options: ["Pre-K", "Elementary (K-5)", "Middle School (6-8)", "High School (9-12)", "Higher Education", "Adult/Corporate"] },
    { title: "Subject Area", options: ["Math", "Science", "English/ELA", "Social Studies", "STEM", "Arts", "Special Education", "ESL"] },
    { title: "School Type", options: ["Public", "Private", "Charter", "Parochial", "Online/Virtual"] },
    { title: "EdTech Usage", options: ["LMS Power User", "Assessment Tools", "Video Platforms", "AI Tools for Education", "Content Creation"] },
    { title: "Budget Authority", options: ["Classroom Budget", "Department Budget", "School-wide Decisions", "District-level Authority"] },
  ],
  b2b: [
    { title: "Job Title", options: ["C-Level (CEO, CTO, CFO, CMO)", "VP / SVP", "Director", "Manager", "Team Lead"] },
    { title: "Department", options: ["IT / Technology", "Marketing", "Sales", "Finance", "HR", "Operations", "Product", "Engineering"] },
    { title: "Company Size", options: ["1-50 employees", "51-200", "201-500", "501-1000", "1001-5000", "5000+"] },
    { title: "Industry", options: ["Technology/SaaS", "Financial Services", "Healthcare", "Manufacturing", "Retail", "Media", "Professional Services"] },
    { title: "Purchase Authority", options: ["Final Decision Maker", "Key Influencer", "Budget Holder", "Evaluator/Recommender"] },
    { title: "Annual Budget", options: ["<$50K", "$50K-$250K", "$250K-$1M", "$1M-$5M", "$5M+"] },
  ],
  vehicle: [
    { title: "Vehicle Type", options: ["Sedan", "SUV", "Truck/Pickup", "Sports Car", "Electric Vehicle", "Hybrid", "Luxury", "Minivan"] },
    { title: "Current Brand", options: ["Toyota", "Honda", "Ford", "Chevrolet", "Tesla", "BMW", "Mercedes", "Lexus", "Audi", "Jeep"] },
    { title: "Ownership Type", options: ["Own (Paid Off)", "Own (Financed)", "Lease", "Considering Purchase"] },
    { title: "Next Purchase Timeline", options: ["Within 3 months", "3-6 months", "6-12 months", "1-2 years", "No current plans"] },
    { title: "Annual Miles", options: ["<5,000", "5,000-10,000", "10,000-15,000", "15,000-20,000", "20,000+"] },
    { title: "Priority Features", options: ["Safety Tech", "Performance", "Fuel Efficiency", "Luxury/Comfort", "Towing Capacity", "EV/Sustainability"] },
  ],
};

// Sample profiles for each audience
const sampleProfiles: Record<string, { name: string; title: string; score: number; credentials: string[]; avatar: string }[]> = {
  tech: [
    { name: "Sarah Chen", title: "Senior DevOps Engineer", score: 98, credentials: ["LinkedIn", "Corporate Email", "GitHub"], avatar: "SC" },
    { name: "Marcus Johnson", title: "ML Engineer", score: 96, credentials: ["LinkedIn", "Corporate Email"], avatar: "MJ" },
    { name: "Emily Rodriguez", title: "Full Stack Developer", score: 94, credentials: ["LinkedIn", "GitHub", "Stack Overflow"], avatar: "ER" },
  ],
  healthcare: [
    { name: "Dr. Jennifer Walsh", title: "Cardiologist", score: 97, credentials: ["NPI Registry", "Medical License", "Hospital Affiliation"], avatar: "JW" },
    { name: "Dr. Michael Torres", title: "Oncologist", score: 98, credentials: ["NPI Registry", "Medical License", "Publication Record"], avatar: "MT" },
    { name: "Dr. Lisa Patel", title: "Primary Care Physician", score: 95, credentials: ["NPI Registry", "Medical License", "DEA Registration"], avatar: "LP" },
  ],
  financial: [
    { name: "Robert Chen", title: "Wealth Manager", score: 96, credentials: ["FINRA BrokerCheck", "SEC Registration", "Corporate Email"], avatar: "RC" },
    { name: "Amanda Foster", title: "Financial Advisor", score: 94, credentials: ["FINRA BrokerCheck", "Corporate Email"], avatar: "AF" },
  ],
  education: [
    { name: "Dr. Patricia Williams", title: "High School Principal", score: 97, credentials: ["State License", "School District", "LinkedIn"], avatar: "PW" },
    { name: "James Morrison", title: "STEM Teacher", score: 93, credentials: ["Teaching License", "School Verification"], avatar: "JM" },
  ],
  b2b: [
    { name: "Christine Lee", title: "VP of Engineering", score: 98, credentials: ["LinkedIn", "Corporate Email", "Company Website"], avatar: "CL" },
    { name: "Thomas Wright", title: "CTO", score: 99, credentials: ["LinkedIn", "Crunchbase", "Corporate Email"], avatar: "TW" },
  ],
  vehicle: [
    { name: "Kevin Martinez", title: "Software Engineer", score: 92, credentials: ["DMV Records", "Purchase Verification"], avatar: "KM" },
    { name: "Rachel Thompson", title: "Marketing Director", score: 90, credentials: ["DMV Records", "Insurance Verification"], avatar: "RT" },
  ],
};

export default function NewStudyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({});
  const [studyName, setStudyName] = useState("");
  const [targetCompletes, setTargetCompletes] = useState(500);
  const [surveyLength, setSurveyLength] = useState(15);
  const [surveyMethod, setSurveyMethod] = useState<"create" | "external">("create");
  const [externalUrl, setExternalUrl] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");

  // Get user info from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id);
        // Use company name from user data or default
        const firstName = user.firstName || user.first_name || "Research";
        setCompanyName(user.companyName || `${firstName} Company`);
      } catch (e) {
        console.error("Failed to parse user from localStorage");
      }
    }
  }, []);

  const handleAudienceSelect = (audienceId: string) => {
    setSelectedAudience(audienceId);
    setSelectedTags({});
  };

  const toggleTag = (category: string, tag: string) => {
    setSelectedTags(prev => {
      const categoryTags = prev[category] || [];
      if (categoryTags.includes(tag)) {
        return { ...prev, [category]: categoryTags.filter(t => t !== tag) };
      } else {
        return { ...prev, [category]: [...categoryTags, tag] };
      }
    });
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Step 4: Launch the study
      await launchStudy();
    }
  };

  const launchStudy = async () => {
    if (!studyName.trim()) {
      setLaunchError("Please enter a study name");
      return;
    }

    if (surveyMethod === "external" && !externalUrl.trim()) {
      setLaunchError("Please enter an external survey URL");
      return;
    }

    setIsLaunching(true);
    setLaunchError(null);

    try {
      // Generate tags based on selected targeting criteria
      const tags: string[] = [];
      Object.entries(selectedTags).forEach(([category, options]) => {
        options.forEach(option => {
          // Add first 3 tags for display
          if (tags.length < 3) {
            tags.push(option);
          }
        });
      });

      // Calculate payout (~$3 per minute, rounded to nearest $5)
      const cpi = 7.50;
      const rawPayout = surveyLength * 3; // $3 per minute
      const payout = Math.round(rawPayout / 5) * 5; // Round to nearest $5

      const response = await fetch(`${API_BASE_URL}/api/studies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: studyName,
          companyName: companyName,
          audience: selectedSegment?.title || "General Audience",
          targetingCriteria: selectedTags,
          targetCompletes: targetCompletes,
          surveyLength: surveyLength,
          surveyMethod: surveyMethod,
          externalUrl: surveyMethod === "external" ? externalUrl : null,
          cpi: cpi,
          payout: payout,
          isUrgent: isUrgent,
          tags: tags,
          createdBy: userId,
          status: "active", // Launch immediately
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to launch study");
      }

      console.log("Study launched successfully:", data.data);

      // Redirect to surveys page
      router.push("/insight/dashboard");
    } catch (error) {
      console.error("Launch study error:", error);
      setLaunchError(error instanceof Error ? error.message : "Failed to launch study");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const selectedSegment = audienceSegments.find(s => s.id === selectedAudience);
  const currentTargetingOptions = selectedAudience ? targetingOptions[selectedAudience] : [];
  const currentSampleProfiles = selectedAudience ? sampleProfiles[selectedAudience] : [];

  // Count total selected targeting criteria
  const totalSelectedCriteria = Object.values(selectedTags).reduce((sum, tags) => sum + tags.length, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#0d0d12] border-r border-[#1a1a24] flex flex-col fixed h-full">
        {/* Back Link */}
        <div className="p-4">
          <Link
            href="/insight/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
        </div>

        {/* Study Setup Steps */}
        <div className="px-4 py-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Study Setup
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

        {/* Live Feasibility Panel - Show on Step 2 and 4 */}
        {(currentStep === 2 || currentStep === 4) && selectedAudience && (
          <div className="px-4 py-4">
            <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Live Feasibility</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Verified Available</span>
                  <span className="text-emerald-400 font-semibold">{selectedSegment?.verified}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Incidence Rate</span>
                  <span className="text-white font-semibold">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Est. CPI</span>
                  <span className="text-white font-semibold">$7.50</span>
                </div>
                <div className="border-t border-[#1a1a24] pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm font-medium">Total Cost</span>
                    <span className="text-emerald-400 font-bold text-lg">$3,750</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verification Guarantee */}
        <div className="mt-auto p-4">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">Verification Guarantee</span>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed">
              All respondents are verified through ZKP. Get refunds for any unverified responses.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ml-64 p-8 overflow-auto ${currentStep === 2 || currentStep === 4 ? 'mr-80' : ''}`}>
        {/* Step 1: Select Audience */}
        {currentStep === 1 && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Select Your Target Audience</h1>
              <p className="text-gray-400">Choose the category of verified respondents you need for your research.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {audienceSegments.map((segment) => {
                const IconComponent = segment.icon;
                const isSelected = selectedAudience === segment.id;
                return (
                  <button
                    key={segment.id}
                    onClick={() => handleAudienceSelect(segment.id)}
                    className={`text-left p-5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-[#1a1a24] border-emerald-500"
                        : "bg-[#12121a] border-[#1a1a24] hover:border-[#2a2a36]"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${segment.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <span className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        {segment.verifiedDisplay} verified
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">{segment.title}</h3>
                    <p className="text-gray-500 text-sm mb-4">{segment.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {segment.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[#1a1a24] text-gray-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Step 2: Set Targeting */}
        {currentStep === 2 && selectedSegment && (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${selectedSegment.color} rounded-lg flex items-center justify-center`}>
                  <selectedSegment.icon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white">{selectedSegment.title}</h1>
              </div>
              <p className="text-gray-400">Define your exact audience using deep professional profiling.</p>
            </div>

            {/* Targeting Categories */}
            <div className="space-y-6">
              {currentTargetingOptions.map((category, catIndex) => (
                <div key={catIndex} className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4">{category.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.options.map((option, optIndex) => {
                      const isSelected = (selectedTags[category.title] || []).includes(option);
                      return (
                        <button
                          key={optIndex}
                          onClick={() => toggleTag(category.title, option)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? "bg-emerald-500 text-white"
                              : "bg-[#1a1a24] text-gray-400 hover:bg-[#2a2a36] hover:text-white"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 3: Review Matches */}
        {currentStep === 3 && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Review Matching Respondents</h1>
              <p className="text-gray-400">Preview the verified respondents that match your criteria.</p>
            </div>

            <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold">Estimated Matches</h3>
                  <p className="text-gray-500 text-sm">Based on your targeting criteria</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-400">{selectedSegment?.verified}</p>
                  <p className="text-gray-500 text-sm">verified respondents</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#1a1a24] rounded-lg p-4">
                  <p className="text-gray-500 text-sm mb-1">Avg Quality Score</p>
                  <p className="text-2xl font-bold text-white">96%</p>
                </div>
                <div className="bg-[#1a1a24] rounded-lg p-4">
                  <p className="text-gray-500 text-sm mb-1">Avg Response Time</p>
                  <p className="text-2xl font-bold text-white">3.2 hrs</p>
                </div>
                <div className="bg-[#1a1a24] rounded-lg p-4">
                  <p className="text-gray-500 text-sm mb-1">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">94%</p>
                </div>
              </div>

              <h4 className="text-white font-semibold mb-4">Sample Matching Profiles</h4>
              <div className="space-y-3">
                {currentSampleProfiles.map((profile, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{profile.avatar}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{profile.name}</p>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-gray-500 text-sm">{profile.title}</p>
                        <div className="flex gap-2 mt-1">
                          {profile.credentials.map((cred, i) => (
                            <span key={i} className="text-xs text-emerald-400">✓ {cred}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{profile.score}</p>
                      <p className="text-gray-500 text-xs">Quality</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 4: Launch Study */}
        {currentStep === 4 && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Launch Your Study</h1>
              <p className="text-gray-400">Configure your study details and start collecting verified responses.</p>
            </div>

            {/* Study Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Study Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={studyName}
                onChange={(e) => setStudyName(e.target.value)}
                placeholder="e.g., Developer Tools Survey Q1 2025"
                className="w-full px-4 py-3 bg-[#12121a] border border-[#1a1a24] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Target Completes & Survey Length */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Completes <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={targetCompletes}
                  onChange={(e) => setTargetCompletes(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#12121a] border border-[#1a1a24] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Survey Length (min)
                </label>
                <input
                  type="number"
                  value={surveyLength}
                  onChange={(e) => setSurveyLength(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-[#12121a] border border-[#1a1a24] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Survey Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Survey Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSurveyMethod("create")}
                  className={`p-6 rounded-xl border transition-all text-center ${
                    surveyMethod === "create"
                      ? "bg-[#1a1a24] border-emerald-500"
                      : "bg-[#12121a] border-[#1a1a24] hover:border-[#2a2a36]"
                  }`}
                >
                  <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-white font-medium">Create Survey</p>
                  <p className="text-gray-500 text-sm">Use our builder</p>
                </button>
                <button
                  onClick={() => setSurveyMethod("external")}
                  className={`p-6 rounded-xl border transition-all text-center ${
                    surveyMethod === "external"
                      ? "bg-[#1a1a24] border-emerald-500"
                      : "bg-[#12121a] border-[#1a1a24] hover:border-[#2a2a36]"
                  }`}
                >
                  <Link2 className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-white font-medium">External Link</p>
                  <p className="text-gray-500 text-sm">Qualtrics, etc.</p>
                </button>
              </div>
            </div>

            {/* External URL Input (shown when external method is selected) */}
            {surveyMethod === "external" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Survey URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://qualtrics.com/your-survey"
                  className="w-full px-4 py-3 bg-[#12121a] border border-[#1a1a24] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            )}

            {/* Urgent Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-[#12121a] text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                />
                <div>
                  <span className="text-white font-medium">Mark as Urgent</span>
                  <p className="text-gray-500 text-sm">Prioritize this survey in panelist dashboards</p>
                </div>
              </label>
            </div>

            {/* Error Message */}
            {launchError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{launchError}</p>
              </div>
            )}
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
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          {currentStep !== 4 && (
            <button
              onClick={handleNext}
              disabled={currentStep === 1 && !selectedAudience}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1 && !selectedAudience
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white"
              }`}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </main>

      {/* Right Sidebar - Matched Respondents (Step 2) */}
      {currentStep === 2 && selectedAudience && (
        <aside className="w-80 bg-[#0d0d12] border-l border-[#1a1a24] fixed right-0 h-full overflow-auto p-4">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Matched Verified Respondents</h3>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">Live</span>
            </div>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-emerald-400">{selectedSegment?.verified}</p>
              <p className="text-gray-500 text-sm">verified respondents match</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sample Matching Profiles
            </p>
            <div className="space-y-3">
              {currentSampleProfiles.map((profile, index) => (
                <div key={index} className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{profile.avatar}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-white font-medium text-sm">{profile.name}</p>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                        </div>
                        <p className="text-gray-500 text-xs">{profile.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{profile.score}</p>
                      <p className="text-gray-500 text-xs">Quality</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {profile.credentials.map((cred, i) => (
                      <span key={i} className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        ✓ {cred}
                      </span>
                    ))}
                  </div>
                  <button className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                    <ChevronDown className="w-3 h-3" />
                    View credentials
                  </button>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs text-center mt-3">
              + {parseInt(selectedSegment?.verified.replace(/,/g, '') || '0') - currentSampleProfiles.length} more verified matches
            </p>
          </div>
        </aside>
      )}

      {/* Right Sidebar - Study Summary (Step 4) */}
      {currentStep === 4 && selectedAudience && (
        <aside className="w-80 bg-[#0d0d12] border-l border-[#1a1a24] fixed right-0 h-full overflow-auto p-4">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4 mb-4">
            <h3 className="text-white font-semibold mb-4">Study Summary</h3>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Audience</span>
                <span className="text-white font-medium text-sm">{selectedSegment?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Targeting Criteria</span>
                <span className="text-emerald-400 font-medium text-sm">{totalSelectedCriteria} selected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Verified Available</span>
                <span className="text-emerald-400 font-medium text-sm">{selectedSegment?.verified}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Target Completes</span>
                <span className="text-white font-medium text-sm">{targetCompletes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Est. Delivery</span>
                <span className="text-white font-medium text-sm">2-5 days</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1a1a24]">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-medium">Total Investment</span>
                <span className="text-2xl font-bold text-purple-400">$3,750</span>
              </div>
            </div>
          </div>

          {/* Quality Guaranteed */}
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <p className="text-emerald-400 font-medium">Quality Guaranteed</p>
                <p className="text-gray-500 text-sm">Pay only for verified, quality responses</p>
              </div>
            </div>
          </div>

          {/* Launch Study Button */}
          <button
            onClick={handleNext}
            disabled={isLaunching}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${
              isLaunching
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            }`}
          >
            {isLaunching ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Launching...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Launch Study
              </>
            )}
          </button>
        </aside>
      )}
    </div>
  );
}
