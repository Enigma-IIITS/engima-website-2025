"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion"; // ✅ FIX: Corrected import from "framer-motion"

// --- Included Hook: useOutsideClick ---
// This hook detects clicks outside of a specified element.
export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      callback();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};

export default function UpcomingEvents() {
  // Renamed for consistency
  const [active, setActive] = useState<(typeof events)[number] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    // ✅ FIX: Wrapped in a styled motion.section for consistency
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="border border-white/[0.1] bg-black max-w-7xl mx-auto my-24 p-8 rounded-2xl"
    >
      {/* Backdrop */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Expanded Modal */}
      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <motion.button
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 bg-black/50 border border-neutral-700 rounded-full w-8 h-8 flex items-center justify-center text-white hover:border-green-500 hover:text-green-500 transition-colors z-50"
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-4xl max-h-[90vh] flex flex-col lg:flex-row bg-neutral-900 text-white rounded-2xl overflow-hidden border border-green-500/50"
            >
              <motion.div
                layoutId={`image-${active.title}-${id}`}
                className="lg:w-1/2"
              >
                <img
                  src={active.src}
                  alt={active.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
              </motion.div>

              <div className="flex-1 overflow-y-auto p-8 lg:w-1/2">
                <div className="space-y-6">
                  <div>
                    <motion.h2
                      layoutId={`title-${active.title}-${id}`}
                      className="text-3xl font-bold text-white"
                    >
                      {active.title}
                    </motion.h2>
                    <motion.p
                      layoutId={`date-${active.title}-${id}`}
                      className="text-green-400 mt-1"
                    >
                      {active.date}
                    </motion.p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-neutral-300 leading-relaxed"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="pt-4"
                  >
                    <a
                      href={active.rsvpLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center px-6 py-3 bg-green-600 text-black font-bold rounded-lg hover:bg-green-500 transition-colors text-md"
                    >
                      RSVP Now
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Collapsed Cards View */}
      <div className="w-full">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <motion.div
              layoutId={`card-${event.title}-${id}`}
              key={event.title}
              onClick={() => setActive(event)}
              className="cursor-pointer bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden group hover:border-green-500/50 transition-colors"
            >
              <motion.div layoutId={`image-${event.title}-${id}`}>
                <img
                  src={event.src}
                  alt={event.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </motion.div>
              <div className="p-4">
                <motion.h3
                  layoutId={`title-${event.title}-${id}`}
                  className="font-semibold text-white text-lg"
                >
                  {event.title}
                </motion.h3>
                <motion.p
                  layoutId={`date-${event.title}-${id}`}
                  className="text-green-400 text-sm mt-1"
                >
                  {event.date}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const events = [
  {
    title: "Tech Innovators Summit",
    date: "June 15, 2025",
    src: "https://assets.aceternity.com/demos/tech-summit.jpeg",
    rsvpLink: "#",
    content: () => (
      <p>
        Join us for the annual Tech Innovators Summit, where industry leaders
        and emerging talents converge to shape the future of technology. This
        year's theme is "The Synergy of Theory and Practice," focusing on
        groundbreaking projects in Computer Graphics, Cybersecurity, and
        Distributed Systems.
      </p>
    ),
  },
  {
    title: "Cybersecurity Workshop",
    date: "July 3, 2025",
    src: "https://assets.aceternity.com/demos/cyber-security.jpeg",
    rsvpLink: "#",
    content: () => (
      <p>
        Dive deep into the world of cybersecurity with our hands-on workshop.
        Learn about the latest threats, defense mechanisms, and ethical hacking
        techniques from seasoned experts in this interactive session.
      </p>
    ),
  },
  {
    title: "Graphics & Animation Lab",
    date: "August 10, 2025",
    src: "https://assets.aceternity.com/demos/graphics-lab.jpeg",
    rsvpLink: "#",
    content: () => (
      <p>
        Explore the art and science of computer graphics in our immersive lab
        experience. From 3D modeling to real-time rendering, this event offers a
        comprehensive look at the tools powering modern visual effects.
      </p>
    ),
  },
  {
    title: "Distributed Systems Symposium",
    date: "September 5, 2025",
    src: "https://assets.aceternity.com/demos/distributed-systems.jpeg",
    rsvpLink: "#",
    content: () => (
      <p>
        Delve into the complexities of distributed systems at our specialized
        symposium. Engage with engineers as they discuss scalability, fault
        tolerance, and consensus algorithms through case studies and live coding
        sessions.
      </p>
    ),
  },
];
