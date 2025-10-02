"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";

export default function UpcomingEventsExpandableCard() {
  const [active, setActive] = useState<(typeof events)[number] | boolean | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };

    if (active && typeof active === "object") {
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
    <div className="bg-black min-h-screen">
      {/* Backdrop */}
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/80 z-40"
          />
        )}
      </AnimatePresence>

      {/* Expanded Modal */}
      <AnimatePresence>
        {active && typeof active === "object" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.button
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 lg:hidden bg-black border border-green-500 rounded-full w-6 h-6 flex items-center justify-center"
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[90vw] max-h-[90vh] flex flex-col bg-black text-white rounded-2xl overflow-hidden border border-green-500"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <img
                  src={active.src}
                  alt={active.title}
                  className="w-full h-64 lg:h-80 object-cover object-top"
                />
              </motion.div>

              <div className="flex-1 overflow-y-auto p-6 [mask:linear-gradient(to_bottom,black_80%,transparent)]">
                <div className="space-y-6">
                  {/* Title & Date — MUST match collapsed view layoutId */}
                  <div>
                    <motion.h2
                      layoutId={`title-${active.title}-${id}`}
                      className="text-xl font-bold text-white"
                    >
                      {active.title}
                    </motion.h2>
                    <motion.p
                      layoutId={`date-${active.title}-${id}`} // ✅ FIXED: was 'description'
                      className="text-green-400 mt-1"
                    >
                      {active.date}
                    </motion.p>
                  </div>

                  {/* Long description — NO layoutId (not in collapsed view) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-white text-sm md:text-base leading-relaxed"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>

                  {/* Narrow RSVP button */}
                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.rsvpLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="inline-block mx-auto px-6 py-2 bg-green-500 text-black font-bold rounded-full hover:bg-green-400 transition-colors text-sm"
                  >
                    RSVP Now
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fade-in section on scroll */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 py-12"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
          {events.map((event) => (
            <motion.div
              layoutId={`card-${event.title}-${id}`}
              key={event.title}
              onClick={() => setActive(event)}
              className="flex-shrink-0 w-60 cursor-pointer"
            >
              <div className="bg-black border border-green-500 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                <motion.div layoutId={`image-${event.title}-${id}`}>
                  <img
                    src={event.src}
                    alt={event.title}
                    className="w-full h-48 object-cover"
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
                    layoutId={`date-${event.title}-${id}`} // ✅ FIXED: was 'description'
                    className="text-green-400 text-sm mt-1"
                  >
                    {event.date}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const CloseIcon = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 text-green-500"
    initial={{ rotate: 90, opacity: 0 }}
    animate={{ rotate: 0, opacity: 1 }}
    exit={{ rotate: -90, opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </motion.svg>
);

const events = [
  {
    title: "Tech Innovators Summit",
    date: "June 15, 2025",
    src: "https://assets.aceternity.com/demos/tech-summit.jpeg",
    rsvpLink: "#",
    content: (
      <p>
        Join us for the annual Tech Innovators Summit, where industry leaders and emerging talents converge to shape the future of technology.
        <br /><br />
        This year's theme is "The Synergy of Theory and Practice," focusing on groundbreaking projects in Computer Graphics, Cybersecurity, and Distributed Systems. Network with peers, attend workshops, and witness live demos of cutting-edge applications.
      </p>
    ),
  },
  {
    title: "Cybersecurity Workshop",
    date: "July 3, 2025",
    src: "https://assets.aceternity.com/demos/cyber-security.jpeg",
    rsvpLink: "#",
    content: (
      <p>
        Dive deep into the world of cybersecurity with our hands-on workshop designed for enthusiasts and professionals alike.
        <br /><br />
        Learn about the latest threats, defense mechanisms, and ethical hacking techniques from seasoned experts. This interactive session will equip you with practical skills to protect digital assets and navigate the evolving cyber landscape.
      </p>
    ),
  },
  {
    title: "Graphics & Animation Lab",
    date: "August 10, 2025",
    src: "https://assets.aceternity.com/demos/graphics-lab.jpeg",
    rsvpLink: "#",
    content: (
      <p>
        Explore the art and science of computer graphics and animation in our immersive lab experience.
        <br /><br />
        From 3D modeling to real-time rendering, this event offers a comprehensive look at the tools and techniques powering modern visual effects. Whether you're a beginner or an experienced artist, you'll find inspiration and valuable insights to elevate your craft.
      </p>
    ),
  },
  {
    title: "Distributed Systems Symposium",
    date: "September 5, 2025",
    src: "https://assets.aceternity.com/demos/distributed-systems.jpeg",
    rsvpLink: "#",
    content: (
      <p>
        Delve into the complexities and opportunities of distributed systems at our specialized symposium.
        <br /><br />
        Engage with researchers and engineers as they discuss scalability, fault tolerance, and consensus algorithms. Gain practical knowledge through case studies and live coding sessions that demonstrate how to build robust, high-performance systems.
      </p>
    ),
  },
];