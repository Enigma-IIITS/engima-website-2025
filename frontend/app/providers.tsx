"use client";

// ✅ FIX: Corrected the import path to point to the 'hooks' folder.
import { AuthProvider } from "@/hooks/AuthContext";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // You can wrap other providers here in the future if needed
  return <AuthProvider>{children}</AuthProvider>;
}
