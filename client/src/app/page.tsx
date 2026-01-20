"use client";

import Link from "next/link";
import { Users, Building2, DollarSign, Shield, Linkedin, Github, Award, BadgeCheck, ArrowRight, Play, Layers } from "lucide-react";

export default function LandingPage() {
  const stats = [
    { icon: Users, value: "50K+", label: "Verified Panelists" },
    { icon: Building2, value: "200+", label: "Enterprise Clients" },
    { icon: DollarSign, value: "$2.5M", label: "Paid to Members" },
    { icon: Shield, value: "100%", label: "Privacy Protected" },
  ];

  const trustedSources = [
    { icon: Linkedin, name: "LinkedIn", description: "Professional & B2B", color: "text-blue-400" },
    { icon: Github, name: "GitHub", description: "Developers", color: "text-gray-400" },
    { icon: Award, name: "State Credentials", description: "Teachers & Educators", color: "text-green-400" },
    { icon: BadgeCheck, name: "License Boards", description: "Licensed Professionals", color: "text-yellow-400" },
  ];

  const features = [
    {
      title: "Privacy-First Verification",
      description: "Your personal data never leaves your device. We use zero-knowledge proofs to verify your credentials without exposing sensitive information.",
    },
    {
      title: "Instant Qualification",
      description: "Once verified, you're automatically matched with surveys that fit your professional profile. No more screening questions.",
    },
    {
      title: "Premium Rewards",
      description: "Verified panelists earn 3x more than traditional survey takers. Your verified status commands premium compensation.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-[#1a1a24]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Proof</span>
                <span className="text-emerald-400">Panel</span>
              </span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <Link
                href="/signin"
                className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 border border-emerald-500 text-emerald-400 hover:bg-emerald-500/10 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Join Panel
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-8">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">ZERO-KNOWLEDGE PROOF VERIFIED</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Earn Rewards for Your</span>
            <br />
            <span className="text-emerald-400">Verified Insights</span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join our verified research panel and participate in paid surveys matched to your professional profile. Your identity is verified, but your personal data stays private with zero-knowledge proof technology.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors text-lg"
            >
              Start Earning Today
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#1a1a24] hover:bg-[#2a2a36] text-white rounded-lg font-semibold transition-colors text-lg border border-[#2a2a36]">
              <Play className="w-5 h-5" />
              How ZKP Works
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 text-center hover:border-[#2a2a36] transition-colors"
              >
                <stat.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted Sources Section */}
      <section className="py-20 px-6 bg-[#0d0d12]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Verified by Trusted Sources
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Connect once, prove your qualifications forever—without exposing your personal data
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustedSources.map((source, index) => (
              <div
                key={index}
                className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 text-center hover:border-emerald-500/30 transition-colors group"
              >
                <div className="w-14 h-14 bg-[#1a1a24] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#2a2a36] transition-colors">
                  <source.icon className={`w-7 h-7 ${source.color}`} />
                </div>
                <h3 className="text-white font-semibold mb-1">{source.name}</h3>
                <p className="text-gray-500 text-sm">{source.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose ProofPanel?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The future of market research is private, verified, and rewarding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#12121a] border border-[#1a1a24] rounded-xl p-6 hover:border-emerald-500/30 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#0a0a0f] to-[#0d1210]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of verified professionals earning premium rewards for their insights.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors text-lg"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1a1a24]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-400">© 2026 ProofPanel. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
