// components/AboutUsEvervaultCard.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "./ui/evervault-card"; // EvervaultCard is no longer used directly, only the Icon

const AboutUsEvervaultCard = () => {
  // --- TEXT SPLIT FOR BETTER READABILITY ---
  const aboutText = `"ENIGMA" stands as the preeminent technical club at the esteemed Indian Institute of Information Technology (IIIT), committed to advancing technology through tangible, hands-on projects. Within ENIGMA, we believe in the transformative potential of practical application.`;

  const philosophyText = `Our core philosophy centers on the synergy of theoretical understanding and hands-on innovation. As a nurturing ground for expertise, we cultivate a culture deeply rooted in continuous exploration, focusing on Computer Graphics, Cybersecurity, Distributed Systems, and System Software.`;

  // State to track if the component is in view for animations
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    // --- CONTAINER: Reverted to the original dark, bordered card style ---
    <motion.div
      id="about"
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="border border-white/[0.1] bg-black max-w-5xl mx-auto p-8 md:p-12 relative text-white"
    >
      {/* Corner Icons for decoration */}
      <Icon className="absolute h-6 w-6 -top-3 -left-3 text-white" />
      <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-white" />
      <Icon className="absolute h-6 w-6 -top-3 -right-3 text-white" />
      <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-white" />

      {/* --- NEW LAYOUT: A clean two-column grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* --- LEFT COLUMN: Text Content --- */}
        <div className="flex flex-col text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold mb-2">ABOUT US</h2>
          <p className="text-md text-neutral-400 mb-8">The Legacy of Enigma</p>
          <div className="space-y-6 text-lg text-neutral-200 leading-relaxed font-light">
            <p>{aboutText}</p>
            <p className="border-l-2 border-green-500 pl-4 text-neutral-300">
              {philosophyText}
            </p>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Image --- */}
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="https://www.enigma-iiits.in/assets/img/about.jpg"
            alt="Enigma members in lecture hall"
            className="rounded-lg object-cover w-full h-auto max-w-md shadow-lg shadow-green-500/10"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AboutUsEvervaultCard;