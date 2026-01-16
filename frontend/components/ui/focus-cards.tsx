"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative bg-gray-900 overflow-hidden h-72 md:h-80 w-full transition-all duration-300 ease-out border border-gray-800",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        className="object-cover absolute inset-0 w-full h-full"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/70 flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          {card.title}
        </div>
      </div>
    </motion.div>
  )
);

Card.displayName = "Card";

type CardData = {
  title: string;
  src: string;
};

export function FocusCards({
  cards,
  heading = "",
  subheading = "",
}: {
  cards: CardData[];
  heading?: string;
  subheading?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 bg-black">
      {/* Headings */}
      {(heading || subheading) && (
        <div className="max-w-5xl mx-auto mb-10 text-center">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {heading}
            </h2>
          )}
          {subheading && <p className="text-lg text-gray-300">{subheading}</p>}
        </div>
      )}

      {/* Cards Container - Gap increased to 6 */}
      <div className="flex flex-wrap justify-center gap-6 mx-auto max-w-7xl">
        {cards.map((card, index) => (
          <div
            key={`${card.title}-${index}`}
            /* Updated width math:
               sm (2 cols): calc(50% - 1.5rem) -> 1.5rem is the 24px gap
               lg (4 cols): calc(25% - 1.2rem) -> slightly higher subtraction to ensure fit
            */
            className="w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.2rem)]"
          >
            <Card
              card={card}
              index={index}
              hovered={hovered}
              setHovered={setHovered}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
