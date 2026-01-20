"use client";

import React from "react";

// --- FIX: Using a new set of cleaner, more accurate icons ---
const DiscordIcon = () => (
  <svg
    fill="currentColor"
    className="w-7 h-7"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.07.07 0 0 0-.078.037c-.21.375-.446.825-.618 1.252a17.76 17.76 0 0 0-5.485 0 18.18 18.18 0 0 0-.618-1.252.07.07 0 0 0-.078-.037A19.74 19.74 0 0 0 3.72 4.37a.07.07 0 0 0-.032.027C.533 9.045-.32 13.578.1 18.057a.08.08 0 0 0 .031.056c2.052 1.507 4.04 2.422 5.993 3.03a.08.08 0 0 0 .084-.028c.462-.63.874-1.295 1.228-2.008a.07.07 0 0 0-.042-.106A16.54 16.54 0 0 1 5.23 16.22a.07.07 0 0 1 .002-.121c.12-.09.24-.184.36-.274a.07.07 0 0 1 .078-.01c4.918 1.946 9.922 1.946 14.832 0a.07.07 0 0 1 .078.01c.12.09.24.184.36.274a.07.07 0 0 1 .002.121 16.54 16.54 0 0 1-5.08 2.118.07.07 0 0 0-.042.106c.354.713.766 1.378 1.228 2.008a.08.08 0 0 0 .084.028c1.953-.608 3.94-1.523 5.993-3.03a.08.08 0 0 0 .03-.056c.42-4.48-.423-9.012-.423-9.012a.07.07 0 0 0-.032-.027ZM8.02 15.33c-.785 0-1.422-1.096-1.422-2.447s.637-2.447 1.422-2.447c.785 0 1.422 1.096 1.422 2.447s-.637 2.447-1.422 2.447Zm7.96 0c-.785 0-1.422-1.096-1.422-2.447s.637-2.447 1.422-2.447c.785 0 1.422 1.096 1.422 2.447s-.637 2.447-1.422 2.447Z" />
  </svg>
);
const InstagramIcon = () => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-7 h-7"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const LinkedinIcon = () => (
  <svg
    fill="currentColor"
    className="w-7 h-7"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);
const GithubIcon = () => (
  <svg
    fill="currentColor"
    className="w-7 h-7"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-black border-t border-neutral-800 text-white mt-10">
      <div className="w-full max-w-6xl mx-auto py-12 px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
        <div className="mb-6 md:mb-0">
          <h3 className="text-2xl font-bold">ENIGMA</h3>
          <p className="text-neutral-400">Where Code Meets Curiosity.</p>
        </div>
        <div className="flex flex-col items-center md:items-end">
          <h4 className="font-bold mb-4 text-2xl">Connect With Us</h4>
          {/* --- FIX: Redesigned the icon links for a cleaner, more attractive look --- */}
          <div className="flex items-center space-x-6">
            <a
              href="https://discord.gg/CSh7eKVVsY"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-green-500 transition-colors duration-300"
            >
              <DiscordIcon />
            </a>
            <a
              href="https://www.instagram.com/enigmaiiits/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-green-500 transition-colors duration-300"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.linkedin.com/company/enigmaiiits/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-green-500 transition-colors duration-300"
            >
              <LinkedinIcon />
            </a>
            <a
              href="https://github.com/Enigma-IIITS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-green-500 transition-colors duration-300"
            >
              <GithubIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800 py-4">
        <p className="text-center text-neutral-500 text-sm">
          &copy; {new Date().getFullYear()} ENIGMA Club. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
