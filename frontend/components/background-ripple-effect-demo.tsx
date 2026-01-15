"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { TextGenerateEffect } from "./ui/text-generate-effect";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import AboutUsEvervaultCard from "./AboutUs";
import FocusCardsDemo from "./Lead_and_colead";
import FocusCardsDemo1 from "./System_Software";
import ClubDomains from "./ClubDomains";
import PastEvents from "./PastEvents";
import Footer from "./Footer";
import FeedbackForm from "./feedback";
import UpcomingEventsExpandableCard from "./expandable-card-demo-standard";
import FocusCardsDemo2 from "./web_engineering";
import FocusCardsDemo3 from "./video_editing";
import FocusCardsDemo4 from "./Design_team";
import FocusCardsDemo5 from "./PR_and_Management";

// Responsive grid sizes
const MOBILE_ROWS = 12;
const MOBILE_COLS = 24;
const DESKTOP_ROWS = 20;
const DESKTOP_COLS = 40;

// Background ripple grid component
const BackgroundRippleEffect: React.FC = () => {
  const [grid, setGrid] = useState<
    Array<{ id: number; char: string; rippleLevel?: number }>
  >([]);
  const gridRef = useRef(grid);

  const [rows, setRows] = useState(DESKTOP_ROWS);
  const [cols, setCols] = useState(DESKTOP_COLS);

  const updateGridSize = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    setRows(isMobile ? MOBILE_ROWS : DESKTOP_ROWS);
    setCols(isMobile ? MOBILE_COLS : DESKTOP_COLS);
  }, []);

  useEffect(() => {
    updateGridSize();
    window.addEventListener("resize", updateGridSize);
    return () => window.removeEventListener("resize", updateGridSize);
  }, [updateGridSize]);

  const generateRandomChar = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return chars[Math.floor(Math.random() * chars.length)];
  }, []);

  const generateBinaryChar = useCallback(() => {
    return Math.random() > 0.5 ? "0" : "1";
  }, []);

  useEffect(() => {
    const initialGrid = [];
    const totalCells = rows * cols;
    for (let i = 0; i < totalCells; i++) {
      initialGrid.push({ id: i, char: generateRandomChar(), rippleLevel: 0 });
    }
    setGrid(initialGrid);
    gridRef.current = initialGrid;
  }, [generateRandomChar, rows, cols]);

  // background subtle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setGrid((prev) =>
        prev.map((cell) => ({
          ...cell,
          char: Math.random() > 0.92 ? generateRandomChar() : cell.char,
          rippleLevel: cell.rippleLevel ? cell.rippleLevel : 0,
        }))
      );
    }, 400);

    return () => clearInterval(interval);
  }, [generateRandomChar]);

  const handleCellClick = useCallback(
    (id: number) => {
      const centerRow = Math.floor(id / cols);
      const centerCol = id % cols;
      const maxDistance = Math.sqrt(rows * rows + cols * cols);

      for (let distance = 0; distance <= maxDistance; distance++) {
        setTimeout(() => {
          setGrid((prev) =>
            prev.map((cell, idx) => {
              const row = Math.floor(idx / cols);
              const col = idx % cols;
              const dRow = row - centerRow;
              const dCol = col - centerCol;

              const euclideanDistance = Math.sqrt(dRow * dRow + dCol * dCol);

              // tolerance band
              if (Math.abs(euclideanDistance - distance) < 0.6) {
                return {
                  ...cell,
                  char: generateBinaryChar(),
                  rippleLevel: 1, // start ripple
                };
              }
              return cell;
            })
          );
        }, distance * 45);
      }

      // fade ripple back down smoothly
      setTimeout(() => {
        setGrid((prev) =>
          prev.map((cell) => ({
            ...cell,
            rippleLevel: 0,
          }))
        );
      }, maxDistance * 60 + 800);
    },
    [generateBinaryChar, rows, cols]
  );

  return (
    <div
      className="absolute inset-0 grid h-full w-full"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        userSelect: "none",
      }}
    >
      {grid.map((cell) => (
        <div
          key={cell.id}
          onClick={() => handleCellClick(cell.id)}
          className={`flex cursor-pointer items-center justify-center border border-neutral-900 bg-black font-mono transition-all ease-out
            ${
              cell.rippleLevel === 1
                ? "text-green-300 font-bold animate-ripple-glow"
                : "text-green-400"
            }`}
          style={{
            WebkitTapHighlightColor: "transparent",
            fontSize: `${rows === MOBILE_ROWS ? "0.75rem" : "0.8rem"}`,
            letterSpacing: "0.05em",
            userSelect: "none",
          }}
        >
          {cell.char}
        </div>
      ))}
    </div>
  );
};

// Add CSS animation in global.css (or Tailwind config)
const rippleCSS = `
@keyframes rippleGlow {
  0% { text-shadow: 0 0 4px rgba(0,255,0,0.6), 0 0 8px rgba(0,255,0,0.3); transform: scale(1); }
  50% { text-shadow: 0 0 10px rgba(0,255,0,1), 0 0 20px rgba(0,255,0,0.8); transform: scale(1.2); }
  100% { text-shadow: 0 0 4px rgba(0,255,0,0.4); transform: scale(1); }
}
.animate-ripple-glow {
  animation: rippleGlow 0.6s ease-out;
}
`;

// Inject ripple CSS dynamically
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = rippleCSS;
  document.head.appendChild(style);
}

// Main page layout
export default function BackgroundRippleEffectDemo() {
  const words = [
    { text: "Where", className: "text-white" },
    { text: "code", className: "text-white" },
    { text: "meets", className: "text-white" },
    { text: "curiosity.", className: "text-blue-500" },
  ];

  return (
    <div className="relative w-full overflow-x-hidden bg-black">
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-0">
        <BackgroundRippleEffect />
      </div>
      <div className="fixed inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />
      <div className="fixed inset-0 z-10 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_70%,rgba(0,0,0,1)_100%)]" />

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="relative z-20 pointer-events-none">
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="pointer-events-auto">
            <TextGenerateEffect
              words="Welcome To"
              className="mb-6"
              duration={2}
            />
            <TextGenerateEffect
              words="ENIGMA"
              className="mb-6"
              duration={2.4}
            />
            <TypewriterEffectSmooth words={words} className="mb-6" />
          </div>
        </div>

        <div id="About" className="pointer-events-auto">
          <AboutUsEvervaultCard />
        </div>
        <div id="domains" className="pointer-events-auto">
          <ClubDomains />
        </div>
        <div id="rsvp" className="pointer-events-auto">
          <UpcomingEventsExpandableCard />
        </div>
        <div id="events" className="pointer-events-auto">
          <PastEvents />
        </div>

        <div id="Lead_and_colead" className="pointer-events-auto mb-10">
          <FocusCardsDemo />
        </div>
        <div id="System_Software" className="pointer-events-auto mb-20">
          <FocusCardsDemo1 />
        </div>
        <div id="web_engineering" className="pointer-events-auto mb-10">
          <FocusCardsDemo2 />
        </div>
        <div id="video_editing" className="pointer-events-auto">
          <FocusCardsDemo3 />
        </div>
        <div id="Design_team" className="pointer-events-auto">
          <FocusCardsDemo4 />
        </div>
        <div id="Pr_and_management" className="pointer-events-auto mb-30">
          <FocusCardsDemo5 />
        </div>
        <div id="feedback" className="pointer-events-auto">
          <FeedbackForm />
        </div>
        <br />
        {/* Footer text */}
        <div className="mt-20 mb-32 w-full max-w-3xl text-neutral-500 space-y-6 opacity-90 text-center pointer-events-auto mx-auto">
          <p className="text-lg">
            Scroll down to descend into the digital abyss. The grid continues
            infinitely — but the light fades, as all things must.
          </p>
          <p>
            Click anywhere to send a pulse — a ripple of 0s and 1s — echoing
            into the void.
          </p>
        </div>

        <div className="w-full pointer-events-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
}
