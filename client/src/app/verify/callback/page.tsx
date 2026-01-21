"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, Loader2, CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

export default function LinkedInCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your LinkedIn profile...");
  const processedRef = useRef(false); // Prevent double execution

  useEffect(() => {
    // Prevent double execution in React strict mode
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // Check if this is from onboarding flow
      const isOnboarding = sessionStorage.getItem("linkedinOnboarding") === "true";

      if (errorParam) {
        setStatus("error");
        setMessage(errorDescription || "LinkedIn authentication was cancelled or failed");
        setTimeout(() => {
          if (isOnboarding) {
            sessionStorage.removeItem("linkedinOnboarding");
            router.push("/onboarding?linkedin=error");
          } else {
            window.history.back();
          }
        }, 2000);
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received from LinkedIn");
        setTimeout(() => {
          if (isOnboarding) {
            sessionStorage.removeItem("linkedinOnboarding");
            router.push("/onboarding?linkedin=error");
          } else {
            window.history.back();
          }
        }, 2000);
        return;
      }

      try {
        // Use the auth endpoint for onboarding flow
        const endpoint = isOnboarding
          ? `${API_URL}/api/auth/linkedin/callback`
          : `${API_URL}/api/linkedin/callback`;

        const response = await fetch(endpoint, {
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

        // Handle onboarding flow
        if (isOnboarding) {
          setStatus("success");
          setMessage(`Welcome, ${data.profile?.name || "User"}! Your LinkedIn profile has been verified.`);

          // Store the profile in sessionStorage
          if (data.profile) {
            sessionStorage.setItem("linkedinProfile", JSON.stringify(data.profile));
          }
          sessionStorage.removeItem("linkedinOnboarding");

          // Redirect back to onboarding with success
          setTimeout(() => {
            router.push("/onboarding?linkedin=success");
          }, 2000);
          return;
        }

        // Handle panelist verification flow
        if (data.data?.hashId) {
          const params = new URLSearchParams({
            verified: 'true',
            name: data.data.linkedin?.name || '',
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
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to complete authentication");
        setTimeout(() => {
          if (isOnboarding) {
            sessionStorage.removeItem("linkedinOnboarding");
            router.push("/onboarding?linkedin=error");
          }
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="bg-[#12121a] border border-[#1a1a24] rounded-2xl p-8 text-center max-w-md mx-4 shadow-xl">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Verifying Your Profile</h3>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Verification Successful!</h3>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Verification Failed</h3>
          </>
        )}

        <p className="text-gray-400 text-sm">{message}</p>

        {status !== "loading" && (
          <p className="text-gray-500 text-xs mt-4">Redirecting you back...</p>
        )}
      </div>
    </div>
  );
}
