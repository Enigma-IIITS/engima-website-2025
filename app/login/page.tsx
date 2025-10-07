"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth(); // We'll use the login function from our context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- State for loading and specific errors ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      await login(email, password);
      // On success, the AuthContext handles the redirect automatically
    } catch (err: any) {
      // Catch the specific error message thrown from AuthContext
      setError(err.message || "An unknown error occurred.");
      setIsLoading(false); // Stop loading on failure
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-auto p-8 rounded-lg bg-neutral-900 border border-green-500/30"
      >
        <Link
          href="/"
          className="absolute top-4 left-4 text-neutral-400 hover:text-white text-sm flex items-center"
        >
          <BackIcon />
          <span className="ml-1">Back to Home</span>
        </Link>
        <h2 className="text-3xl font-bold text-white text-center mb-2 mt-8">
          Welcome Back
        </h2>
        <p className="text-center text-neutral-400 text-sm mb-6">
          Login to the Enigma community.
        </p>

        {/* --- Display the specific error message here --- */}
        {error && (
          <p className="bg-red-900/50 border border-red-500 text-red-300 text-sm rounded-md p-3 text-center mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-black font-bold py-2.5 px-4 rounded-md transition-colors duration-300 disabled:bg-neutral-600"
          >
            {isLoading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          New to Enigma?{" "}
          <Link
            href="/signup"
            className="font-semibold text-green-400 hover:text-green-300"
          >
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// --- Reusable Helper Components (No changes needed) ---
const InputField = ({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div>
    <label
      htmlFor={props.id || props.name}
      className="block text-sm font-medium text-neutral-300 mb-1"
    >
      {label}
    </label>
    <input
      className="block w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500"
      {...props}
    />
  </div>
);

const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
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
);
