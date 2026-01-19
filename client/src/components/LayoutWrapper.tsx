"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide sidebar for verification pages (panelist-facing)
  const isVerifyPage = pathname.startsWith("/verify");

  // Hide sidebar for landing page
  const isLandingPage = pathname === "/";

  // Hide sidebar for auth pages
  const isAuthPage = pathname === "/signup" || pathname === "/signin" || pathname === "/onboarding";

  if (isVerifyPage) {
    // Standalone layout for verification pages - no sidebar
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {children}
      </div>
    );
  }

  if (isAuthPage) {
    // Auth pages with dark background - no sidebar
    return <>{children}</>;
  }

  if (isLandingPage) {
    // Landing page - no sidebar, full width
    return <>{children}</>;
  }

  // Default layout with sidebar for admin pages
  return (
    <div className="min-h-screen bg-[#0f0f13]">
      <Sidebar />
      <main className="ml-64 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
