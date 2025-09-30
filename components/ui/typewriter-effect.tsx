"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  // Split each word into array of characters
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const renderWords = () => {
    return (
      <div>
        {wordsArray.map((word, idx) => (
          <span key={`word-${idx}`} className="inline-block">
            {word.text.map((char, index) => (
              <span
                key={`char-${index}`}
                className={cn("dark:text-white text-black", word.className)}
              >
                {char}
              </span>
            ))}
            &nbsp;
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("flex items-center justify-center my-6", className)}>
      {/* Animated text container */}
      <motion.div
        className="overflow-hidden inline-block"
        initial={{ width: "0%" }}
        whileInView={{ width: "fit-content" }}
        transition={{
          duration: 2,
          ease: "linear",
          delay: 1,
        }}
      >
        <div
          className="font-bold text-center inline-block"
          style={{
            whiteSpace: "nowrap",
            display: "inline-block",
            maxWidth: "100%",
            overflow: "hidden",
          }}
        >
          {/* 🔥 BOLDER MOBILE FONT SIZE — now much more readable */}
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl">
            {renderWords()}
          </span>
        </div>
      </motion.div>

      {/* Cursor positioned inline at the end — same line, blinking */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(
          "inline-block w-[4px] h-5 sm:h-7 xl:h-14 bg-blue-500 ml-1",
          cursorClassName
        )}
      />
    </div>
  );
};