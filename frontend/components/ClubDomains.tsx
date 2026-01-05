"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// --- Data for the club domains ---
// I've updated "Web Engineering" to "Cybersecurity" to match previous versions.
const domains = [
  {
    title: "Computer Graphics",
    description:
      "Diving into the world of rendering, simulation, and virtual reality to create stunning visual experiences and tools.",
  },
  {
    title: "Cybersecurity",
    description:
      "Exploring digital defense, ethical hacking, and cryptography to secure systems and protect information in a connected world.",
  },
  {
    title: "Distributed Systems",
    description:
      "Building scalable and resilient systems that operate across multiple machines, tackling challenges in concurrency and fault tolerance.",
  },
  {
    title: "System Software",
    description:
      "Working close to the metal, focusing on operating systems, compilers, and the core software that powers all other applications.",
  },
];

// --- Unique colors for each domain card title ---
const domainColors = [
  "text-green-400",
  "text-green-400",
  "text-green-400",
  "text-green-400",
];

const ClubDomains = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    // --- FIX: Wrapped component in a styled container ---
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="border border-white/[0.1] bg-black max-w-7xl mx-auto my-24 p-8 rounded-2xl"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Our Domains
        </h2>
        <p className="text-lg text-neutral-400 mt-2">
          Exploring the Core of Technology
        </p>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {domains.map((domain, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            // --- FIX: Updated card styling ---
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-full transition-colors hover:border-green-500/50"
          >
            {/* --- FIX: Applied unique color from the array --- */}
            <h3
              className={`text-2xl font-bold mb-3 ${
                domainColors[index % domainColors.length]
              }`}
            >
              {domain.title}
            </h3>
            <p className="text-neutral-300 font-light">{domain.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default ClubDomains;
