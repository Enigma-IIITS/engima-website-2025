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
        "rounded-lg relative bg-gray-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out border border-gray-800",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >
      <img
        src={card.src}
        alt={card.title}
        className="object-cover absolute inset-0"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/70 flex items-end py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          {card.title}
        </div>
      </div>
    </motion.div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  src: string;
};

export function FocusCards({
  cards,
  heading = "Our Highlights",
  subheading = "Explore our most captivating moments",
}: {
  cards: Card[];
  heading?: string;
  subheading?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-black"
    >
      {/* Headings */}
      <div className="max-w-5xl mx-auto mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{heading}</h2>
        <p className="text-lg text-gray-300">{subheading}</p>
      </div>

      {/* Cards Container - Center aligned */}
      <div className="flex flex-wrap justify-center gap-6 mx-auto max-w-6xl">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className="w-full md:w-[calc(33.333%-1.5rem)] max-w-md"
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
    </motion.div>
  );
}