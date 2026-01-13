"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, Eye, Check, Loader2 } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

// Verification item type
interface VerificationItem {
  id: string;
  panelistId: string;
  email: string;
  emailStatus: "Pending" | "Sent" | "Verified" | "Failed";
  proofStatus: "Pending" | "Generated" | "Verified" | "Failed";
  zkpResult: "Pass" | "Fail" | "Pending";
}

// Sent email result type
interface SentEmailResult {
  hashId: string;
  email: string;
  verificationLink: string;
  messageId: string;
  isTestAccount: boolean;
}

export default function VerificationDashboard() {
  const {
    isConnected,
    loadedData,
  } = useAppContext();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [useResendApi, setUseResendApi] = useState(false);
  const [smtpEmail, setSmtpEmail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sentEmails, setSentEmails] = useState<SentEmailResult[]>([]);

  // Generate verification items from loaded data and fetch statuses
  useEffect(() => {
    const initializeAndFetchStatuses = async () => {
      if (loadedData && loadedData.length > 0) {
        const items = loadedData.map((respondent, index) => ({
          id: `verification-${index}`,
          panelistId: respondent.hashId,
          email: respondent.email,
          emailStatus: "Pending" as const,
          proofStatus: "Pending" as const,
          zkpResult: "Pending" as const,
        }));
        setVerificationItems(items);

        // Fetch verification statuses for these items
        try {
          const hashIds = loadedData.map(r => r.hashId);
          const response = await fetch("http://localhost:3002/api/verification-statuses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hashIds })
          });
          const result = await response.json();

          if (result.success) {
            setVerificationItems(prevItems => {
              return prevItems.map(item => {
                const status = result.data[item.panelistId];
                if (status && status.verified) {
                  return {
                    ...item,
                    proofStatus: "Verified" as const,
                    zkpResult: "Pass" as const,
                  };
                }
                return item;
              });
            });
          }
        } catch (error) {
          console.error("Error fetching verification statuses:", error);
        }
      }
    };

    initializeAndFetchStatuses();
  }, [loadedData]);

  const pendingEmailCount = verificationItems.filter(item => item.emailStatus === "Pending").length;
  const sentEmailCount = verificationItems.filter(item => item.emailStatus === "Sent").length;

  const toggleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(i => i !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === verificationItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(verificationItems.map(item => item.id));
    }
  };

  const fetchVerificationStatuses = async () => {
    if (verificationItems.length === 0) return;

    try {
      const hashIds = verificationItems.map(item => item.panelistId);
      const response = await fetch("http://localhost:3002/api/verification-statuses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ hashIds })
      });

      const result = await response.json();

      if (result.success) {
        setVerificationItems(prevItems => {
          return prevItems.map(item => {
            const status = result.data[item.panelistId];
            if (status && status.verified) {
              return {
                ...item,
                proofStatus: "Verified" as const,
                zkpResult: "Pass" as const,
              };
            }
            return item;
          });
        });
      }
    } catch (error) {
      console.error("Error fetching verification statuses:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchVerificationStatuses();
    setIsRefreshing(false);
  };

  const handleSendVerification = async () => {
    // Validate SMTP credentials if using SMTP
    if (!useResendApi) {
      if (!smtpEmail || !smtpPassword) {
        setSendError("Please enter your SMTP email and password");
        return;
      }
    }

    setIsSending(true);
    setSendError(null);

    try {
      // Prepare recipients list (only pending ones) with full respondent data
      const pendingItems = verificationItems.filter(item => item.emailStatus === "Pending");
      const recipients = pendingItems.map(item => {
        // Find the full respondent data
        const respondent = loadedData?.find(r => r.hashId === item.panelistId);
        return {
          hashId: item.panelistId,
          email: item.email,
          firstName: respondent?.firstName,
          lastName: respondent?.lastName,
          company: respondent?.company,
          location: respondent?.location,
          employmentStatus: respondent?.employmentStatus,
          jobTitle: respondent?.jobTitle,
          jobFunction: respondent?.jobFunction,
          companySize: respondent?.companySize,
          industry: respondent?.industry,
        };
      });

      // Call the backend API
      const response = await fetch("http://localhost:3002/api/send-verification-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          smtpEmail,
          smtpPassword,
          recipients
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send emails");
      }

      // Store sent emails for success modal
      setSentEmails(result.data.sent);

      // Update email statuses based on results
      setVerificationItems(prevItems => {
        return prevItems.map(item => {
          // Check if this item was successfully sent
          const wasSent = result.data.sent.some(
            (sent: { hashId: string }) => sent.hashId === item.panelistId
          );
          const wasFailed = result.data.failed.some(
            (failed: { hashId: string }) => failed.hashId === item.panelistId
          );

          if (wasSent) {
            return { ...item, emailStatus: "Sent" as const };
          } else if (wasFailed) {
            return { ...item, emailStatus: "Failed" as const };
          }
          return item;
        });
      });

      // Close email modal and show success modal
      setShowEmailModal(false);
      setShowSuccessModal(true);
      setSmtpEmail("");
      setSmtpPassword("");

    } catch (error) {
      console.error("Error sending emails:", error);
      setSendError(error instanceof Error ? error.message : "Failed to send emails");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded text-xs font-medium";

    if (status === "Pending") {
      return (
        <span className={`${baseClasses} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30`}>
          Pending
        </span>
      );
    }
    if (status === "Verified" || status === "Generated" || status === "Pass") {
      return (
        <span className={`${baseClasses} bg-green-500/20 text-green-400 border border-green-500/30`}>
          {status}
        </span>
      );
    }
    if (status === "Sent") {
      return (
        <span className={`${baseClasses} bg-blue-500/20 text-blue-400 border border-blue-500/30`}>
          Sent
        </span>
      );
    }
    if (status === "Failed" || status === "Fail") {
      return (
        <span className={`${baseClasses} bg-red-500/20 text-red-400 border border-red-500/30`}>
          {status}
        </span>
      );
    }
    return <span className={baseClasses}>{status}</span>;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Panelists</h1>
          <p className="text-gray-400">ZKP Mode: Displaying respondent IDs and encrypted data only</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/manage-proof"
            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></span>
            <span className="text-gray-400 text-sm">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
      </div>

      {/* ZKP Mode Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-8">
        <p className="text-blue-400">
          <span className="font-semibold">Zero-Knowledge Proof Mode:</span>{" "}
          <span className="text-blue-300">No personal data is displayed. Only respondent IDs and encrypted hashes are shown.</span>
        </p>
      </div>

      {/* Empty State */}
      {verificationItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-16 h-16 bg-[#1a1a24] rounded-full flex items-center justify-center mb-6">
            <Eye className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Verification Data</h2>
          <p className="text-gray-400 text-center mb-6 max-w-md">
            Please run verification from the Manage Proof page first.
          </p>
          <Link
            href="/manage-proof"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Go to Manage Proof
          </Link>
        </div>
      )}

      {/* Verification Table */}
      {verificationItems.length > 0 && (
        <div className="bg-[#1a1a24] rounded-xl border border-[#2a2a36]">
          {/* Table Header Actions */}
          <div className="flex justify-between items-center p-4 border-b border-[#2a2a36]">
            <div>
              <p className="text-white font-medium">
                {selectedItems.length} of {verificationItems.length} selected
              </p>
              <p className="text-orange-400 text-sm">
                {pendingEmailCount} pending email verification
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2a36] hover:bg-[#3a3a46] text-white rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh Status
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                disabled={pendingEmailCount === 0}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
              >
                Send Verification to All
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a36]">
                  <th className="p-4 text-left">
                    <div
                      onClick={toggleSelectAll}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                        selectedItems.length === verificationItems.length
                          ? "bg-purple-600 border-purple-600"
                          : "border-gray-500 hover:border-gray-400"
                      }`}
                    >
                      {selectedItems.length === verificationItems.length && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </th>
                  <th className="p-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Hashed ID
                  </th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email Status
                  </th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Proof Status
                  </th>
                  <th className="p-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    ZKP Result
                  </th>
                </tr>
              </thead>
              <tbody>
                {verificationItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#2a2a36] hover:bg-[#2a2a36]/30 transition-colors"
                  >
                    <td className="p-4">
                      <div
                        onClick={() => toggleSelectItem(item.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                          selectedItems.includes(item.id)
                            ? "bg-purple-600 border-purple-600"
                            : "border-gray-500 hover:border-gray-400"
                        }`}
                      >
                        {selectedItems.includes(item.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-mono text-sm">{item.panelistId}</span>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(item.emailStatus)}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(item.proofStatus)}
                    </td>
                    <td className="p-4 text-center">
                      <button className="px-3 py-1.5 border border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded text-xs font-medium transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Send Verification Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Send Verification Emails</h2>
              <p className="text-gray-500 mt-1">Send verification links to respondents for profile verification</p>
            </div>

            {/* Stats Section */}
            <div className="mx-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-blue-600 font-medium text-sm">Pending Verification</p>
                <p className="text-3xl font-bold text-gray-900">{pendingEmailCount}</p>
                <p className="text-blue-600 text-sm">respondents waiting for email</p>
              </div>
              <div className="text-right">
                <p className="text-blue-600 font-medium text-sm">Already Sent</p>
                <p className="text-3xl font-bold text-gray-900">{sentEmailCount}</p>
                <p className="text-blue-600 text-sm">emails sent</p>
              </div>
            </div>

            {/* Email Delivery Method */}
            <div className="mx-6 mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">Email Delivery Method</p>
                  <p className="text-gray-500 text-sm">
                    {useResendApi ? "Using Resend API (configured on server)" : "Using your SMTP credentials"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseResendApi(!useResendApi)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      useResendApi ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        useResendApi ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                  <span className="text-gray-700 font-medium">
                    {useResendApi ? "Resend API" : "SMTP"}
                  </span>
                </div>
              </div>
            </div>

            {/* SMTP Credentials Form or Resend API Info */}
            <div className="mx-6 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              {useResendApi ? (
                <>
                  <h3 className="font-medium text-blue-700">Using Resend API</h3>
                  <p className="text-blue-600 text-sm mt-2">
                    Emails will be sent using the Resend API configured on the server. Make sure RESEND_API_KEY is set in your server environment variables.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-medium text-blue-700">Enter Your Email SMTP Credentials</h3>
                  <p className="text-blue-600 text-sm mt-2 mb-4">
                    Emails will be sent from your email account. For Gmail, use an App Password (not your regular password).
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        SMTP Email (e.g., your-email@gmail.com)
                      </label>
                      <input
                        type="email"
                        value={smtpEmail}
                        onChange={(e) => setSmtpEmail(e.target.value)}
                        placeholder="your-email@gmail.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">
                        SMTP Password / App Password
                      </label>
                      <input
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="Enter your app password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs mt-3">
                    Your credentials are only used for this session and are not stored on the server.
                  </p>
                </>
              )}
            </div>

            {/* Error Message */}
            {sendError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{sendError}</p>
              </div>
            )}

            {/* How it works */}
            <div className="mx-6 mt-4 p-4">
              <p className="text-gray-600 text-sm">
                <span className="font-medium text-gray-900">How it works:</span> Each respondent will receive a unique verification link. When they click the link, they&apos;ll be redirected to complete their profile verification.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-6 pt-2 flex gap-3">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setSendError(null);
                }}
                disabled={isSending}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendVerification}
                disabled={isSending || (!useResendApi && (!smtpEmail || !smtpPassword))}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  `Send to All (${pendingEmailCount})`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Emails Sent */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Send Verification Emails</h2>
              <p className="text-gray-500 mt-1">Send verification links to respondents for profile verification</p>
            </div>

            {/* Stats Section */}
            <div className="mx-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-blue-600 font-medium text-sm">Pending Verification</p>
                <p className="text-3xl font-bold text-gray-900">{pendingEmailCount}</p>
                <p className="text-blue-600 text-sm">respondents waiting for email</p>
              </div>
              <div className="text-right">
                <p className="text-blue-600 font-medium text-sm">Already Sent</p>
                <p className="text-3xl font-bold text-gray-900">{sentEmailCount}</p>
                <p className="text-blue-600 text-sm">emails sent</p>
              </div>
            </div>

            {/* Emails Sent Successfully */}
            <div className="mx-6 mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-700 mb-3">Emails Sent Successfully from</h3>
              <div className="max-h-48 overflow-y-auto space-y-3">
                {sentEmails.map((email, index) => (
                  <div key={index} className="bg-white p-3 rounded border border-green-100">
                    <p className="font-mono text-sm text-gray-900">{email.hashId}</p>
                    <p className="text-gray-500 text-sm">{email.email}</p>
                    <p className="text-blue-600 text-xs break-all mt-1">{email.verificationLink}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="mx-6 mt-4 p-4">
              <p className="text-gray-600 text-sm">
                <span className="font-medium text-gray-900">How it works:</span> Each respondent will receive a unique verification link. When they click the link, they&apos;ll be redirected to complete their profile verification.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-6 pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
