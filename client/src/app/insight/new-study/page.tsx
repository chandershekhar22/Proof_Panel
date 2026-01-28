"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    verified: "245,000+",
    color: "bg-gray-700",
    tags: ["Role", "Experience Level", "Primary Skills", "+4 more"],
  },
  {
    id: "healthcare",
    title: "Healthcare Professionals",
    description: "Physicians, Specialists, Allied Health",
    icon: Stethoscope,
    verified: "180,000+",
    color: "bg-pink-600",
    tags: ["Provider Type", "Specialty", "Practice Setting", "+3 more"],
  },
  {
    id: "financial",
    title: "Financial Professionals",
    description: "Advisors, Wealth Managers, CFOs",
    icon: DollarSign,
    verified: "95,000+",
    color: "bg-amber-500",
    tags: ["Role", "Assets Under Management", "Primary Client Type", "+2 more"],
  },
  {
    id: "education",
    title: "Education Professionals",
    description: "Teachers, Administrators, EdTech Users",
    icon: GraduationCap,
    verified: "320,000+",
    color: "bg-amber-600",
    tags: ["Role", "Grade Level", "Subject Area", "+3 more"],
  },
  {
    id: "b2b",
    title: "B2B Decision Makers",
    description: "C-Suite, VPs, Directors, Managers",
    icon: Building2,
    verified: "420,000+",
    color: "bg-blue-600",
    tags: ["Job Title", "Department", "Company Size", "+3 more"],
  },
  {
    id: "vehicle",
    title: "Vehicle Owners",
    description: "Current Owners, Intenders, Lessees",
    icon: Car,
    verified: "890,000+",
    color: "bg-red-500",
    tags: ["Vehicle Type", "Current Brand", "Ownership Type", "+3 more"],
  },
];

export default function NewStudyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);

  const handleAudienceSelect = (audienceId: string) => {
    setSelectedAudience(audienceId);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Launch study and redirect to studies page
      router.push("/insight/surveys");
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
      <main className="flex-1 ml-64 p-8 overflow-auto">
        {/* Step 1: Select Audience */}
        {currentStep === 1 && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Select Your Target Audience</h1>
              <p className="text-gray-400">Choose the category of verified respondents you need for your research.</p>
            </div>

            {/* Audience Grid */}
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
                        {segment.verified} verified
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
        {currentStep === 2 && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Set Your Targeting Criteria</h1>
              <p className="text-gray-400">Define specific attributes to narrow down your ideal respondents.</p>
            </div>

            <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Selected Audience: {audienceSegments.find(s => s.id === selectedAudience)?.title}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                  <select className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white focus:outline-none focus:border-emerald-500">
                    <option>Any experience level</option>
                    <option>Entry Level (0-2 years)</option>
                    <option>Mid Level (3-5 years)</option>
                    <option>Senior Level (6-10 years)</option>
                    <option>Expert (10+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company Size</label>
                  <select className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white focus:outline-none focus:border-emerald-500">
                    <option>Any company size</option>
                    <option>Startup (1-50)</option>
                    <option>Small (51-200)</option>
                    <option>Medium (201-1000)</option>
                    <option>Large (1001-5000)</option>
                    <option>Enterprise (5000+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <select className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white focus:outline-none focus:border-emerald-500">
                    <option>Any location</option>
                    <option>United States</option>
                    <option>Europe</option>
                    <option>Asia Pacific</option>
                    <option>Latin America</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Number of Respondents Needed</label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
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
                  <p className="text-3xl font-bold text-emerald-400">12,450</p>
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
                {[
                  { name: "Senior Developer", company: "Tech Startup", score: 98 },
                  { name: "Product Manager", company: "Enterprise Software", score: 96 },
                  { name: "Engineering Lead", company: "Fortune 500", score: 97 },
                ].map((profile, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#1a1a24] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <span className="text-emerald-400 font-semibold text-sm">{profile.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{profile.name}</p>
                        <p className="text-gray-500 text-sm">{profile.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-semibold">{profile.score}</span>
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
              <p className="text-gray-400">Review your study details and launch when ready.</p>
            </div>

            <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Study Summary</h3>

              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-[#1a1a24]">
                  <span className="text-gray-400">Target Audience</span>
                  <span className="text-white font-medium">{audienceSegments.find(s => s.id === selectedAudience)?.title}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#1a1a24]">
                  <span className="text-gray-400">Estimated Matches</span>
                  <span className="text-white font-medium">12,450 verified respondents</span>
                </div>
                <div className="flex justify-between py-3 border-b border-[#1a1a24]">
                  <span className="text-gray-400">Estimated Cost</span>
                  <span className="text-white font-medium">$2,500 - $5,000</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-400">Estimated Completion</span>
                  <span className="text-white font-medium">3-5 business days</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-emerald-400 font-medium">Verification Guarantee</p>
                  <p className="text-gray-400 text-sm mt-1">
                    All responses are verified through zero-knowledge proofs. Receive full refunds for any unverified responses.
                  </p>
                </div>
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
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep === 1 && !selectedAudience}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1 && !selectedAudience
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
            }`}
          >
            {currentStep === 4 ? "Launch Study" : "Continue"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
}
