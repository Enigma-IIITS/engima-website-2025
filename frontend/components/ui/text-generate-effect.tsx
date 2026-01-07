"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration: duration,
        delay: stagger(0.1),
      }
    );
  }, [scope.current, animate, duration, filter]);

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline-flex flex-wrap items-center">
        {wordsArray.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}`}
            className="text-white opacity-0"
            style={{
              filter: filter ? "blur(8px)" : "none",
              display: "inline-block",
              whiteSpace: "pre", // 👈 Preserves whitespace
            }}
          >
            {word}
            {idx < wordsArray.length - 1 && <>&nbsp;</>} {/* 👈 Adds non-breaking space after each word except last */}
          </motion.span>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <h1
        className={cn(
          "text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight tracking-wide",
          "drop-shadow-lg"
        )}
        style={{ textShadow: "0 0 8px rgba(0, 255, 0, 0.3)" }}
      >
        {renderWords()}
      </h1>
    </div>
  );
};