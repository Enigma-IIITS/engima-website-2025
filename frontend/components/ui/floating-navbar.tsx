"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/AuthContext";
import ThemeToggle from "../ThemeToggle";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);
  const { user, logout } = useAuth(); // Get user state

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      let direction = current! - scrollYProgress.getPrevious()!;
      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        setVisible(direction < 0);
      }
    }
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex max-w-fit fixed top-6 inset-x-0 mx-auto border border-white/[0.2] rounded-full bg-black z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4",
          className
        )}
      >
        {/* Main Nav Links */}
        {navItems.map((navItem, idx) => (
          <Link
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              "relative text-neutral-50 items-center flex space-x-1 hover:text-neutral-300"
            )}
          >
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </Link>
        ))}

        {/* Conditional Auth Section */}
        {user ? (
          // Logged-In View
          <>
            {/* ✅ ADD THIS LINK */}
            <Link
              href="/my-registrations"
              className="border text-sm font-medium relative border-transparent text-neutral-50 px-4 py-2 rounded-full"
            >
              <span>My Tickets</span>
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin"
                className="border text-sm font-medium relative border-transparent text-neutral-50 px-4 py-2 rounded-full"
              >
                <span>Dashboard</span>
                <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
              </Link>
            )}

            <button
              onClick={logout}
              className="border text-sm font-medium relative border-neutral-200/50 text-white px-4 py-2 rounded-full"
            >
              <span>Logout</span>
            </button>
          </>
        ) : (
          // Logged-Out View
          <>
            <Link
              href="/login"
              className="border text-sm font-medium relative border-transparent text-neutral-50 px-4 py-2 rounded-full"
            >
              <span>Login</span>
            </Link>

            <Link
              href="/signup"
              className="border text-sm font-medium relative border-green-500/50 bg-green-900/50 text-white px-4 py-2 rounded-full"
            >
              <span>Sign Up</span>
              <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-green-500 to-transparent h-px" />
            </Link>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
