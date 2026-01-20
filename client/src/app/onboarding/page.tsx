"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  Shield,
  LayoutDashboard,
  Info,
  ChevronRight,
  ChevronLeft,
  Layers,
  CheckCircle,
} from "lucide-react";

const steps = [
  { id: 1, name: "Employment", icon: Briefcase },
  { id: 2, name: "Verification", icon: Shield },
  { id: 3, name: "Dashboard", icon: LayoutDashboard },
];

const employmentStatuses = [
  "Employed Full-time",
  "Employed Part-time",
  "Self-employed",
  "Unemployed",
  "Student",
  "Retired",
  "Homemaker",
];

const industries = [
  "Technology",
  "Healthcare",
  "Finance & Banking",
  "Education",
  "Manufacturing",
  "Retail",
  "Government",
  "Non-profit",
  "Media & Entertainment",
  "Real Estate",
  "Other",
];

const jobFunctions = [
  "Executive/C-Suite",
  "IT Decision Maker",
  "Marketing",
  "Sales",
  "Operations",
  "Human Resources",
  "Finance",
  "Engineering",
  "Research & Development",
  "Other",
];

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1001-5000 employees",
  "5000+ employees",
];

const yearsOfExperience = [
  "Less than 1 year",
  "1-2 years",
  "3-5 years",
  "6-10 years",
  "11-15 years",
  "16-20 years",
  "20+ years",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Employment
    employmentStatus: "",
    industry: "",
    jobFunction: "",
    companySize: "",
    jobTitle: "",
    yearsOfExperience: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - go to member dashboard
      router.push("/member/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const SelectField = ({
    label,
    name,
    value,
    options,
    placeholder,
  }: {
    label: string;
    name: string;
    value: string;
    options: string[];
    placeholder: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
      >
        <option value="" className="text-gray-500">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option} className="text-white bg-[#1a1a24]">
            {option}
          </option>
        ))}
      </select>
    </div>
  );

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
          {/* Step 1: Employment */}
          {currentStep === 1 && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Employment Details</h1>
                <p className="text-gray-400">Help us understand your professional background</p>
              </div>

              {/* Employment Status Section */}
              <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Employment Status</h2>
                </div>
                <SelectField
                  label="Current Employment Status"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  options={employmentStatuses}
                  placeholder="Select employment status"
                />
              </div>

              {/* Professional Details Section */}
              <div className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <User className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Professional Details</h2>
                </div>
                <div className="space-y-4">
                  <SelectField
                    label="Industry"
                    name="industry"
                    value={formData.industry}
                    options={industries}
                    placeholder="Select industry"
                  />
                  <SelectField
                    label="Job Function"
                    name="jobFunction"
                    value={formData.jobFunction}
                    options={jobFunctions}
                    placeholder="Select job function"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer"
                      className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <SelectField
                    label="Company Size"
                    name="companySize"
                    value={formData.companySize}
                    options={companySizes}
                    placeholder="Select company size"
                  />
                  <SelectField
                    label="Years of Experience"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    options={yearsOfExperience}
                    placeholder="Select years of experience"
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Verification */}
          {currentStep === 2 && (
            <>
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
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                      Connect
                    </button>
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
                    <button className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-medium transition-colors">
                      Connect
                    </button>
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
                  {formData.employmentStatus && (
                    <div className="flex justify-between py-2 border-b border-[#2a2a36]">
                      <span className="text-gray-400">Employment</span>
                      <span className="text-white">{formData.employmentStatus}</span>
                    </div>
                  )}
                  {formData.industry && (
                    <div className="flex justify-between py-2 border-b border-[#2a2a36]">
                      <span className="text-gray-400">Industry</span>
                      <span className="text-white">{formData.industry}</span>
                    </div>
                  )}
                  {formData.jobFunction && (
                    <div className="flex justify-between py-2 border-b border-[#2a2a36]">
                      <span className="text-gray-400">Job Function</span>
                      <span className="text-white">{formData.jobFunction}</span>
                    </div>
                  )}
                  {formData.yearsOfExperience && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Experience</span>
                      <span className="text-white">{formData.yearsOfExperience}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">Ready to Start Earning?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Based on your profile, you qualify for premium B2B surveys with higher payouts.
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
