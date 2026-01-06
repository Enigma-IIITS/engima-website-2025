"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "react-qr-code";

// --- Main Page Component ---
export default function MyRegistrationsPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRsvp, setSelectedRsvp] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    if (token) {
      const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
          // 1. Fetch Registrations
          const regRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/rsvp/my-registrations`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (regRes.data.success) {
            setRegistrations(regRes.data.data.registrations);
          }

          // 2. Fetch Member Profile (contains stickers)
          const profileRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/members/my-profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (profileRes.data.success) {
            setMemberProfile(profileRes.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch dashboard data", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user, token, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="animate-pulse text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {" "}
        {/* Increased max-width for bigger gallery */}
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-neutral-400 hover:text-white mb-8 transition-colors group"
        >
          <BackIcon />
          <span className="ml-2 group-hover:-translate-x-1 transition-transform">
            Back to Home
          </span>
        </Link>
        {/* Header Section */}
        <header className="mb-16">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            User Dashboard
          </h1>
          <p className="text-xl text-neutral-400">
            Welcome back,{" "}
            <span className="text-green-400 font-bold underline underline-offset-8 decoration-green-500/30">
              {user?.name}
            </span>
            .
          </p>
        </header>
        {/* Achievements Section - NOW BIGGER */}
        <section className="mb-20">
          <StickerGallery stickers={memberProfile?.stickers} />
        </section>
        {/* Tickets Section */}
        <section className="max-w-4xl">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <TicketIcon /> Upcoming Access Passes
          </h2>
          <div className="space-y-6">
            {registrations.length > 0 ? (
              registrations.map((rsvp) => (
                <div
                  key={rsvp._id}
                  className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-neutral-900 transition-all hover:border-neutral-600"
                >
                  <div>
                    <h3 className="font-bold text-white text-2xl mb-2">
                      {rsvp.event.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-1">
                      <p className="px-3 py-1 bg-neutral-800 rounded-full text-sm text-neutral-300 flex items-center gap-2">
                        <CalendarSmallIcon />{" "}
                        {new Date(rsvp.event.startDate).toLocaleDateString(
                          undefined,
                          { month: "long", day: "numeric", year: "numeric" }
                        )}
                      </p>
                      <p
                        className={`px-3 py-1 rounded-full text-sm font-bold capitalize border ${
                          rsvp.status === "confirmed"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}
                      >
                        {rsvp.status}
                      </p>
                    </div>
                  </div>

                  {rsvp.status === "confirmed" && rsvp.checkInCode && (
                    <button
                      onClick={() => setSelectedRsvp(rsvp)}
                      className="w-full sm:w-auto px-8 py-3 bg-green-600 text-black font-black uppercase tracking-tighter rounded-xl hover:bg-green-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-900/20"
                    >
                      Show QR Entry
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-neutral-900/30 border-2 border-dashed border-neutral-800 rounded-3xl p-16 text-center">
                <p className="text-neutral-500 text-lg italic">
                  No active event tickets found.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedRsvp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRsvp(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-white p-8 sm:p-12 rounded-[2.5rem] text-center max-w-md w-full relative border-[12px] border-neutral-200 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedRsvp(null)}
                className="absolute -top-12 right-0 text-white text-3xl font-light hover:text-green-400"
              >
                Close ✕
              </button>
              <h2 className="text-3xl font-black text-black mb-1 uppercase tracking-tighter">
                Event Pass
              </h2>
              <p className="text-neutral-500 font-medium mb-8">
                {selectedRsvp.event.title}
              </p>
              <div className="p-6 bg-neutral-50 inline-block rounded-3xl mb-6 shadow-inner border border-neutral-100">
                <QRCode value={selectedRsvp.checkInCode} size={240} />
              </div>
              <div className="bg-black text-green-500 py-4 px-6 rounded-2xl">
                <p className="font-mono text-3xl tracking-[0.4em] font-bold">
                  {selectedRsvp.checkInCode}
                </p>
              </div>
              <p className="text-xs text-neutral-400 mt-8 font-medium">
                PLEASE HAVE THIS READY AT THE VENUE GATE
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper Components ---

const StickerGallery = ({ stickers }: { stickers: any[] }) => {
  const API_ROOT = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "");

  if (!stickers || stickers.length === 0) return null;

  return (
    <div className="bg-neutral-900/20 border border-neutral-800 rounded-[2rem] p-8 sm:p-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h3 className="text-3xl font-black mb-2 flex items-center gap-3">
            <StickerIcon /> Hall of Fame
          </h3>
          <p className="text-neutral-500 font-medium">
            Badges and stickers awarded for your contributions.
          </p>
        </div>
        <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 font-bold text-sm">
          {stickers.length} Achievements Earned
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {stickers.map((s, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -10, scale: 1.02 }}
            className="relative group bg-gradient-to-b from-neutral-800/50 to-neutral-900/80 border border-neutral-700/50 p-8 rounded-[1.5rem] flex flex-col items-center text-center transition-all hover:border-green-500/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            {/* The Image is now much larger */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-green-500/20 blur-[40px] rounded-full group-hover:bg-green-500/40 transition-all"></div>
              <img
                src={`${API_ROOT}${s.stickerImage.url}`}
                alt={s.stickerName}
                className="relative w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
              />
            </div>

            <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">
              {s.stickerName}
            </h4>

            <p className="text-neutral-400 text-sm leading-relaxed mb-4 max-w-[200px]">
              "{s.message}"
            </p>

            <div className="mt-auto pt-4 border-t border-neutral-700/50 w-full">
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                Earned{" "}
                {new Date(s.awardedAt).toLocaleDateString(undefined, {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- SVG Icons ---

const StickerIcon = () => (
  <svg
    className="w-8 h-8 text-green-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
    />
  </svg>
);

const BackIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const TicketIcon = () => (
  <svg
    className="w-8 h-8 text-green-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </svg>
);

const CalendarSmallIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
