"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "react-qr-code";

export default function MyRegistrationsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRsvp, setSelectedRsvp] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (token) {
      const fetchRegistrations = async () => {
        setIsLoading(true);
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/rsvp/my-registrations`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (res.data.success) {
            setRegistrations(res.data.data.registrations);
          }
        } catch (error) {
          console.error("Failed to fetch registrations", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchRegistrations();
    }
  }, [user, token, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading your registrations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
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
          <span className="ml-2">Back to Home</span>
        </Link>
        <h1 className="text-4xl font-bold mb-8">My Tickets</h1>

        <div className="space-y-4">
          {registrations.length > 0 ? (
            registrations.map((rsvp) => (
              <div
                key={rsvp._id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-white text-lg">
                    {rsvp.event.title}
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Date: {new Date(rsvp.event.startDate).toLocaleDateString()}
                  </p>
                  <p
                    className={`text-sm font-bold capitalize ${
                      rsvp.status === "confirmed"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    Status: {rsvp.status}
                  </p>
                </div>
                {rsvp.status === "confirmed" && rsvp.checkInCode && (
                  <button
                    onClick={() => setSelectedRsvp(rsvp)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    View QR Code
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-neutral-500 text-center py-10">
              You have not registered for any events yet.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedRsvp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setSelectedRsvp(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white p-8 rounded-lg text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-black mb-2">
                Check-in for {selectedRsvp.event.title}
              </h2>
              <p className="text-neutral-600 mb-6">
                Present this QR code to an event coordinator to check in.
              </p>
              <div className="p-4 bg-white inline-block rounded-md">
                <QRCode value={selectedRsvp.checkInCode} size={256} />
              </div>
              <p className="text-black font-mono text-2xl mt-4 tracking-widest">
                {selectedRsvp.checkInCode}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
