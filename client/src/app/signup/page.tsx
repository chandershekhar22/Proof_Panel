"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Lock,
  Zap,
  Eye,
  BarChart3,
  User,
  Layers,
} from "lucide-react";

const roles = [
  {
    id: "insight_company",
    title: "Insight Company",
    description: "Access verified respondents and conduct surveys with confidence",
    icon: BarChart3,
    color: "bg-purple-500",
  },
  {
    id: "panelist",
    title: "Panelist",
    description: "Participate in surveys and earn rewards with verified credentials",
    icon: User,
    color: "bg-gray-600",
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setStep("form");
    }
  };

  const handleBack = () => {
    setStep("role");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store role in sessionStorage for use in onboarding
    if (selectedRole) {
      sessionStorage.setItem("userRole", selectedRole);
    }
    // Redirect based on role - insight companies go directly to dashboard
    if (selectedRole === "insight_company") {
      router.push("/insight/dashboard");
    } else {
      // Panelists go through onboarding flow
      router.push("/onboarding");
    }
  };

  const features = [
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your data is encrypted and never shared",
    },
    {
      icon: Zap,
      title: "Instant Verification",
      description: "Get verified in minutes, not days",
    },
    {
      icon: Eye,
      title: "Zero-Knowledge",
      description: "Prove credentials without exposing data",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Role Selection Step */}
      {step === "role" && (
        <div className="relative w-full max-w-2xl">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-2xl p-8 shadow-2xl">
            {/* Logo Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <Layers className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Get started with ProofPanel</h1>
              <p className="text-gray-400">Select your role and create your account</p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {roles.map((role) => {
                const isSelected = selectedRole === role.id;
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`relative flex flex-col items-start p-5 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "bg-[#1a1a24] border-emerald-500"
                        : "bg-[#0d0d12] border-[#1a1a24] hover:border-[#2a2a36]"
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div
                      className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>

                    {/* Icon */}
                    <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-white font-semibold text-lg mb-2">{role.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{role.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold transition-colors ${
                selectedRole
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-[#1a1a24] text-gray-500 cursor-not-allowed"
              }`}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Sign In Link */}
            <p className="text-center text-gray-400 mt-6">
              Already have an account?{" "}
              <Link href="/signin" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Signup Form Step */}
      {step === "form" && (
        <div className="relative w-full max-w-md">
          <div className="bg-[#12121a] border border-[#1a1a24] rounded-2xl p-8 shadow-2xl">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to role selection</span>
            </button>

            {/* Logo Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
              <p className="text-gray-400">
                Signing up as{" "}
                <span className="text-emerald-400 font-medium">
                  {roles.find((r) => r.id === selectedRole)?.title}
                </span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Smith"
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-[#2a2a36] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
              >
                Create Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-gray-400 mt-6">
              Already have an account?{" "}
              <Link href="/signin" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Features Section */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#12121a]/80 border border-[#1a1a24] rounded-xl p-4 text-center"
              >
                <feature.icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <p className="text-white text-xs font-medium mb-1">{feature.title}</p>
                <p className="text-gray-500 text-xs leading-tight">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
