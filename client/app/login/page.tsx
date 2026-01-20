"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 🚀 Toggle state

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md mx-auto p-8 rounded-lg bg-neutral-900 border border-green-500/30 shadow-[0_0_20px_rgba(0,255,0,0.1)]"
      >
        <Link
          href="/"
          className="absolute top-4 left-4 text-neutral-400 hover:text-white text-sm flex items-center transition-colors"
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
            placeholder="admin@enigma.com"
          />

          <div className="relative">
            <InputField
              label="Password"
              name="password"
              // 🚀 Dynamic type based on toggle
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            {/* 🚀 Eye Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-neutral-500 hover:text-green-400 transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-black font-bold py-2.5 px-4 rounded-md transition-all active:scale-95 disabled:bg-neutral-600"
          >
            {isLoading ? "Logging In..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          New to Enigma?{" "}
          <Link
            href="/signup"
            className="font-semibold text-green-400 hover:text-green-300 transition-colors"
          >
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// --- Helper Components ---

const InputField = ({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
  <div className="w-full">
    <label
      htmlFor={props.id || props.name}
      className="block text-sm font-medium text-neutral-300 mb-1"
    >
      {label}
    </label>
    <input
      className="block w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all"
      {...props}
    />
  </div>
);

// --- Icons ---

const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L4.22 4.22m15.56 15.56l-5.66-5.66m0 0a9.96 9.96 0 001.438-2.12c1.274-4.057-2.515-7-6.992-7-1.314 0-2.543.257-3.66.724"
    />
  </svg>
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
