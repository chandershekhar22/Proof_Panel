"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, Lock, Zap, Eye } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to onboarding flow
    router.push("/onboarding");
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

      {/* Signup Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-[#12121a] border border-[#1a1a24] rounded-2xl p-8 shadow-2xl">
          {/* Logo Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Join ProofPanel</h1>
            <p className="text-gray-400">Create your account to start earning</p>
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
    </div>
  );
}
