"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- SVG Icon Components for a cleaner look ---
const LinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

const GalleryIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

// --- Data for Past Events ---
const events = [
  {
    title: "Server Surfers",
    poster: "https://www.enigma-iiits.in/assets/img/portfolio/ctf1.png",
    detailsUrl: "https://github.com/Enigma-IIITS", // Replace with actual link
    photos: [
      "https://www.enigma-iiits.in/assets/img/gallary/g2.JPG",
      "https://www.enigma-iiits.in/assets/img/gallary/g3.JPG",
      "https://www.enigma-iiits.in/assets/img/gallary/g4.JPG",
    ],
  },
  {
    title: "The Maze of Osiris",
    poster: "https://www.enigma-iiits.in/assets/img/portfolio/ctf2.png",
    detailsUrl: "https://github.com/Enigma-IIITS/TheMazeOfOsiris",
    photos: [
      "https://www.enigma-iiits.in/assets/img/gallary/g5.JPG",
      "https://www.enigma-iiits.in/assets/img/gallary/g6.JPG",
    ],
  },
  {
    title: "Jean-Colas Prunier",
    poster: "https://www.enigma-iiits.in/assets/img/portfolio/graphics.png",
    detailsUrl:
      "https://www.linkedin.com/posts/enigmaiiits_presenting-jean-colas-prunier-activity-7165313738907009024-T8Ds/",
    photos: [
      "https://www.enigma-iiits.in/assets/img/gallary/g8.JPG",
      "https://www.enigma-iiits.in/assets/img/gallary/g9.JPG",
      "https://www.enigma-iiits.in/assets/img/gallary/g1.JPG",
    ],
  },
  {
    title: "Distributed Systems",
    poster: "https://www.enigma-iiits.in/assets/img/portfolio/dissys.png",
    detailsUrl: "https://www.enigma-iiits.in/distributed-system.html",
    photos: [
      "https://www.enigma-iiits.in/assets/img/gallary/g1.JPG",
      "https://www.enigma-iiits.in/assets/img/gallary/g8.JPG",
    ],
  },
  {
    title: "Cracking The Code",
    poster: "https://www.enigma-iiits.in/assets/img/portfolio/crackcode.png",
    detailsUrl: "https://github.com/Enigma-IIITS/TheMazeOfOsiris",
    photos: [
      "https://www.enigma-iiits.in/assets/img/gallary/g2.JPG",
      "https://www.enigma-iiits.in/assets/img/gallary/g5.JPG",
    ],
  },
  {
    title: "/dev/null",
    poster: "https://www.enigma-iiits.in/assets/img/portfolio/ctf3.png",
    detailsUrl: "https://github.com/Enigma-IIITS/dev-null",
    photos: [
      "https://www.enigma-iiits.in/assets/img/gallary/g3.JPG",
      "https://www.enigma-iiits.in/assets/img/gallary/g9.JPG",
    ],
  },
];

const PastEvents = () => {
  const [selectedEventPhotos, setSelectedEventPhotos] = useState<
    string[] | null
  >(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
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

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  const openModal = (photos: string[]) => {
    setSelectedEventPhotos(photos);
    setCurrentPhotoIndex(0);
  };

  const closeModal = () => setSelectedEventPhotos(null);

  const nextPhoto = () => {
    if (selectedEventPhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % selectedEventPhotos.length);
    }
  };
  const prevPhoto = () => {
    if (selectedEventPhotos) {
      setCurrentPhotoIndex(
        (prev) =>
          (prev - 1 + selectedEventPhotos.length) % selectedEventPhotos.length
      );
    }
  };

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8 }}
      className="border border-white/[0.1] bg-black max-w-7xl mx-auto my-24 p-8 rounded-2xl"
    >
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Past Events
        </h2>
        <p className="text-lg text-neutral-400 mt-2">
          A Glimpse into Our Journey
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-neutral-900 rounded-lg overflow-hidden group flex flex-col border border-neutral-800"
          >
            <div className="overflow-hidden">
              <img
                src={event.poster}
                alt={`Poster for ${event.title}`}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4 flex justify-between items-center bg-neutral-900">
              <h3 className="text-md font-bold text-white flex-1 mr-2 truncate">
                {event.title}
              </h3>
              <div className="flex items-center space-x-2">
                <a
                  href={event.detailsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-neutral-800 text-neutral-300 rounded-full hover:bg-green-500 hover:text-white transition-colors"
                  aria-label="Event Details"
                >
                  <LinkIcon />
                </a>
                <button
                  onClick={() => openModal(event.photos)}
                  className="p-2 bg-neutral-800 text-neutral-300 rounded-full hover:bg-green-500 hover:text-white transition-colors"
                  aria-label="View Photos"
                >
                  <GalleryIcon />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal for Photo Slider */}
      <AnimatePresence>
        {selectedEventPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-3xl aspect-[4/3] bg-black border border-neutral-700 rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  src={selectedEventPhotos[currentPhotoIndex]}
                  alt="Event photo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-contain rounded-lg"
                />
              </AnimatePresence>
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors z-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <button
                onClick={prevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full p-2 hover:bg-white/20 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default PastEvents;
