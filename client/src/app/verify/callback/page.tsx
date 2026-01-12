"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface LinkedInData {
  hashId: string;
  linkedin: {
    sub: string;
    name: string;
    email: string;
    picture: string;
    email_verified: boolean;
  };
  verified: boolean;
  verifiedAt: string;
}

export default function LinkedInCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string>("");
  const [linkedInData, setLinkedInData] = useState<LinkedInData | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setStatus("error");
        setError(errorDescription || "LinkedIn authentication was cancelled or failed");
        return;
      }

      if (!code) {
        setStatus("error");
        setError("No authorization code received from LinkedIn");
        return;
      }

      try {
        // Exchange the code for tokens via our backend
        const response = await fetch(`${API_URL}/api/linkedin/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, state }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to complete LinkedIn authentication");
        }

        setLinkedInData(data.data);
        setStatus("success");

        // Redirect to completed page after a short delay
        setTimeout(() => {
          if (data.data.hashId) {
            router.push(`/verify/${data.data.hashId}?verified=true&name=${encodeURIComponent(data.data.linkedin.name)}`);
          }
        }, 2000);

      } catch (err) {
        console.error("LinkedIn callback error:", err);
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to complete authentication");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying with LinkedIn
              </h1>
              <p className="text-gray-500">
                Please wait while we complete your verification...
              </p>
            </>
          )}

          {status === "success" && linkedInData && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Successful!
              </h1>
              <p className="text-gray-500 mb-6">
                Welcome, {linkedInData.linkedin.name}
              </p>

              {linkedInData.linkedin.picture && (
                <div className="flex justify-center mb-6">
                  <img
                    src={linkedInData.linkedin.picture}
                    alt={linkedInData.linkedin.name}
                    className="w-20 h-20 rounded-full border-4 border-purple-100"
                  />
                </div>
              )}

              <div className="bg-gray-100 rounded-xl p-4 mb-4">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                  Verified Email
                </p>
                <p className="text-gray-900 text-sm">
                  {linkedInData.linkedin.email}
                </p>
              </div>

              <p className="text-gray-400 text-sm">
                Redirecting to completion page...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-500 mb-6">
                {error}
              </p>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
