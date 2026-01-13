"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Check, Shield, Copy, ArrowRight, ArrowLeft, Linkedin, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

type VerificationStep = "email-verified" | "verify-attributes" | "choose-method" | "verifying" | "completed";

interface VerifiedAttributes {
  jobTitle?: string;
  industry?: string;
  companySize?: string;
}

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hashId = params.hashId as string;

  const [currentStep, setCurrentStep] = useState<VerificationStep>("email-verified");
  const [copied, setCopied] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("linkedin");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [verifiedName, setVerifiedName] = useState<string>("");
  const [verifiedAttributes, setVerifiedAttributes] = useState<VerifiedAttributes>({});
  const [verifyingProgress, setVerifyingProgress] = useState(0);

  // Check if returning from LinkedIn OAuth
  useEffect(() => {
    const verified = searchParams.get("verified");
    const name = searchParams.get("name");
    const jobTitle = searchParams.get("jobTitle");
    const industry = searchParams.get("industry");
    const companySize = searchParams.get("companySize");

    if (verified === "true") {
      // First show "verifying" step for 5 seconds
      setCurrentStep("verifying");
      if (name) {
        setVerifiedName(name);
      }
      // Set the verified attributes from URL params
      setVerifiedAttributes({
        jobTitle: jobTitle || undefined,
        industry: industry || undefined,
        companySize: companySize || undefined,
      });

      // Animate progress over 5 seconds
      const progressInterval = setInterval(() => {
        setVerifyingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2; // Increment every 100ms to reach 100 in 5s
        });
      }, 100);

      // After 5 seconds, show completed
      const timer = setTimeout(() => {
        setCurrentStep("completed");
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [searchParams]);

  const handleLinkedInAuth = async () => {
    setIsRedirecting(true);

    try {
      const response = await fetch(`${API_URL}/api/linkedin/auth-url?hashId=${hashId}`);
      const data = await response.json();

      if (data.success && data.authUrl) {
        // Redirect to LinkedIn
        window.location.href = data.authUrl;
      } else {
        console.error("Failed to get LinkedIn auth URL:", data.error);
        setIsRedirecting(false);
        alert(data.error || "Failed to initiate LinkedIn authentication. Please try again.");
      }
    } catch (error) {
      console.error("Error initiating LinkedIn auth:", error);
      setIsRedirecting(false);
      alert("Failed to connect to server. Please try again.");
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(hashId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress step indicator
  const getStepProgress = () => {
    switch (currentStep) {
      case "email-verified":
        return 1;
      case "verify-attributes":
        return 2;
      case "choose-method":
        return 3;
      case "completed":
        return 4;
      default:
        return 1;
    }
  };

  const stepProgress = getStepProgress();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Step 1: Email Verified */}
        {currentStep === "email-verified" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Credentials Verified!
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Your Credentials has been successfully verified
            </p>

            {/* Respondent ID Box */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 mb-6">
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider text-center mb-2">
                Your Respondent ID
              </p>
              <p className="text-white font-mono text-lg font-bold text-center mb-4 break-all">
                {hashId}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied!" : "Copy ID"}
                </button>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-amber-800 text-sm">
                <span className="font-semibold">Important:</span> This is a one-time verification process. Your Respondent ID will be used to verify your identity without storing any credentials.
              </p>
            </div>

            {/* Zero-Knowledge Proof Info */}
            <div className="border border-gray-200 rounded-lg p-4 mb-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Zero-Knowledge Proof System
              </h3>
              <p className="text-gray-600 text-sm">
                Your identity is protected. Only your Respondent ID is used - no personal information or credentials are stored in our system.
              </p>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setCurrentStep("verify-attributes")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Verify Your Attributes */}
        {currentStep === "verify-attributes" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Shield Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Verify Your Attributes
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Your data stays private with Zero-Knowledge Proofs
            </p>

            {/* How it works */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">How it works:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">Your actual data is never shared</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">Only binary yes/no results are transmitted</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">Cryptographically proven, tamper-proof</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">GDPR & CCPA compliant by design</span>
                </li>
              </ul>
            </div>

            {/* Consent Button */}
            <button
              onClick={() => setCurrentStep("choose-method")}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              I Consent - Continue
            </button>
          </div>
        )}

        {/* Step 3: Choose Verification Method */}
        {currentStep === "choose-method" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Progress Steps */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-1.5 bg-purple-600 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-purple-600 rounded-full"></div>
              <div className={`flex-1 h-1.5 rounded-full ${stepProgress >= 3 ? "bg-purple-600" : "bg-gray-200"}`}></div>
              <div className={`flex-1 h-1.5 rounded-full ${stepProgress >= 4 ? "bg-purple-600" : "bg-gray-200"}`}></div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Choose Verification Method
            </h1>
            <p className="text-gray-500 mb-8">
              Select how you&apos;d like to verify your attributes
            </p>

            {/* LinkedIn Option */}
            <div
              onClick={() => setSelectedMethod("linkedin")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all mb-4 ${
                selectedMethod === "linkedin"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0A66C2] rounded-lg flex items-center justify-center">
                    <Linkedin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">LinkedIn</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">Verify using your LinkedIn profile</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === "linkedin"
                      ? "border-purple-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedMethod === "linkedin" && (
                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentStep("verify-attributes")}
                disabled={isRedirecting}
                className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleLinkedInAuth}
                disabled={isRedirecting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting to LinkedIn...
                  </>
                ) : (
                  <>
                    <Linkedin className="w-5 h-5" />
                    Continue with LinkedIn
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Verifying Attributes (5 second loading screen) */}
        {currentStep === "verifying" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Progress Steps */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-1.5 bg-purple-600 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-purple-600 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-purple-600 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-100 ease-linear"
                  style={{ width: `${verifyingProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Loading Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Your Attributes
            </h1>
            <p className="text-gray-500 mb-8">
              Please wait while we verify your professional attributes using Zero-Knowledge Proofs...
            </p>

            {/* Verification Steps Animation */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${verifyingProgress >= 20 ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {verifyingProgress >= 20 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    )}
                  </div>
                  <span className={`text-sm ${verifyingProgress >= 20 ? 'text-green-700' : 'text-gray-500'}`}>
                    Connecting to verification network...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${verifyingProgress >= 45 ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {verifyingProgress >= 45 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : verifyingProgress >= 20 ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-sm ${verifyingProgress >= 45 ? 'text-green-700' : verifyingProgress >= 20 ? 'text-gray-700' : 'text-gray-400'}`}>
                    Generating cryptographic proofs...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${verifyingProgress >= 70 ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {verifyingProgress >= 70 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : verifyingProgress >= 45 ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-sm ${verifyingProgress >= 70 ? 'text-green-700' : verifyingProgress >= 45 ? 'text-gray-700' : 'text-gray-400'}`}>
                    Validating professional attributes...
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${verifyingProgress >= 95 ? 'bg-green-100' : 'bg-gray-200'}`}>
                    {verifyingProgress >= 95 ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : verifyingProgress >= 70 ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                  <span className={`text-sm ${verifyingProgress >= 95 ? 'text-green-700' : verifyingProgress >= 70 ? 'text-gray-700' : 'text-gray-400'}`}>
                    Finalizing verification...
                  </span>
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            <p className="text-gray-400 text-sm">
              {verifyingProgress}% complete
            </p>
          </div>
        )}

        {/* Step 5: Verification Completed */}
        {currentStep === "completed" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Progress Steps */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-1.5 bg-green-500 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-green-500 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-green-500 rounded-full"></div>
              <div className="flex-1 h-1.5 bg-green-500 rounded-full"></div>
            </div>

            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Complete!
            </h1>
            <p className="text-gray-500 mb-6">
              {verifiedName
                ? `Welcome, ${verifiedName}!`
                : "Your attributes have been verified using Zero-Knowledge Proofs"}
            </p>

            {/* Verified Attributes Section */}
            {(verifiedAttributes.jobTitle || verifiedAttributes.industry || verifiedAttributes.companySize) && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 text-left border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Verified Attributes
                </h3>
                <div className="space-y-3">
                  {verifiedAttributes.jobTitle && (
                    <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700">
                        <span className="font-medium text-gray-900">Job Title:</span> {verifiedAttributes.jobTitle}
                      </span>
                    </div>
                  )}
                  {verifiedAttributes.industry && (
                    <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700">
                        <span className="font-medium text-gray-900">Industry:</span> {verifiedAttributes.industry}
                      </span>
                    </div>
                  )}
                  {verifiedAttributes.companySize && (
                    <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-gray-700">
                        <span className="font-medium text-gray-900">Company Size:</span> {verifiedAttributes.companySize}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Proof ID */}
            <p className="text-gray-400 text-xs mb-4 font-mono">
              Proof ID: ZKP-{hashId.substring(0, 8).toUpperCase()}
            </p>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold mb-6 shadow-lg shadow-green-200">
              <Check className="w-5 h-5" strokeWidth={3} />
              Verified
            </div>

            {/* Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-700 text-sm">
                You can now close this window. The verification status has been updated in our system.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
