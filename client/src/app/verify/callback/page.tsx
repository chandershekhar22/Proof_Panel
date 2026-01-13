"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export default function LinkedInCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setError(errorDescription || "LinkedIn authentication was cancelled or failed");
        return;
      }

      if (!code) {
        setError("No authorization code received from LinkedIn");
        return;
      }

      try {
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

        // Redirect immediately to verification page
        if (data.data.hashId) {
          const params = new URLSearchParams({
            verified: 'true',
            name: data.data.linkedin.name || '',
          });
          if (data.data.attributes?.jobTitle) {
            params.set('jobTitle', data.data.attributes.jobTitle);
          }
          if (data.data.attributes?.industry) {
            params.set('industry', data.data.attributes.industry);
          }
          if (data.data.attributes?.companySize) {
            params.set('companySize', data.data.attributes.companySize);
          }
          router.replace(`/verify/${data.data.hashId}?${params.toString()}`);
        }

      } catch (err) {
        console.error("LinkedIn callback error:", err);
        setError(err instanceof Error ? err.message : "Failed to complete authentication");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  // Show nothing while processing - completely blank page
  if (!error) {
    return null;
  }

  // Only show UI for errors
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
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
        </div>
      </div>
    </div>
  );
}
