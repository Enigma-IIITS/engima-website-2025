"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";

// We still dynamically import our own client component to be safe.
const QrScannerClient = dynamic(() => import("@/components/QrScannerClient"), {
  ssr: false,
  loading: () => (
    <p className="text-center text-neutral-400">Requesting Camera Access...</p>
  ),
});

export default function QrScannerPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }
  if (!user || user.role !== "admin") {
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return null;
  }

  const handleDecode = async (result: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setScanResult(null);
    setScanError(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/rsvp/check-in`,
        { checkInCode: result },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setScanResult(res.data.data);
      }
    } catch (error: any) {
      console.error("Check-in failed:", error);
      setScanError(
        error.response?.data?.message || "Invalid QR Code or check-in failed."
      );
    } finally {
      setTimeout(() => setIsSubmitting(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* This is now a standard Link, as the cleanup is automatic and reliable */}
        <Link
          href="/admin"
          className="inline-flex items-center text-neutral-400 hover:text-white mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="ml-2">Back to Admin Dashboard</span>
        </Link>
        <h1 className="text-4xl font-bold text-center mb-4">QR Code Scanner</h1>
        <p className="text-neutral-400 text-center mb-8">
          Point the camera at a user's QR code to check them in.
        </p>
      </div>

      <div className="w-full max-w-xl h-auto aspect-square rounded-lg overflow-hidden border-2 border-neutral-700 bg-neutral-900 flex items-center justify-center">
        <QrScannerClient onDecode={handleDecode} isSubmitting={isSubmitting} />
      </div>

      <div className="mt-8 text-center h-24">
        {isSubmitting && !scanResult && !scanError && (
          <p className="text-yellow-400">Processing...</p>
        )}
        {scanError && (
          <p className="text-red-500 font-bold text-lg">{scanError}</p>
        )}
        {scanResult && (
          <div className="text-green-400 font-bold text-lg">
            <p>✓ Success!</p>
            <p>
              {scanResult.user.name} checked in for {scanResult.event.title}.
            </p>
          </div>
        )}
        {!isSubmitting && !scanResult && !scanError && (
          <p className="text-neutral-500">Waiting for QR code...</p>
        )}
      </div>
    </div>
  );
}
