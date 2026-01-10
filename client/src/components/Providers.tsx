"use client";

import { AppProvider } from "@/context/AppContext";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}
