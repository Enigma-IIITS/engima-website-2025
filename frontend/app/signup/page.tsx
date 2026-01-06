"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignupPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // 🚀 New field
    phone: "",
    college: "",
    year: "1st",
    department: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneralError(null);
    setValidationErrors({});

    // 🚀 Front-end Validation: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationErrors({ confirmPassword: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    try {
      // We don't need to send confirmPassword to the backend
      const { confirmPassword, ...submitData } = formData;
      await register(submitData);
    } catch (err: any) {
      if (err.errors) {
        const newErrors: { [key: string]: string } = {};
        err.errors.forEach((error: { path: string; msg: string }) => {
          newErrors[error.path] = error.msg;
        });
        setValidationErrors(newErrors);
      } else {
        setGeneralError(err.message || "An unknown error occurred.");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg mx-auto p-8 rounded-2xl bg-neutral-900 border border-green-500/30 shadow-[0_0_20px_rgba(0,255,0,0.1)]"
      >
        <Link
          href="/"
          className="absolute top-4 left-4 text-neutral-400 hover:text-white text-sm flex items-center transition-colors"
        >
          <BackIcon />
          <span className="ml-1">Back to Home</span>
        </Link>

        <h2 className="text-3xl font-bold text-white text-center mb-2 mt-8">
          Join Enigma
        </h2>
        <p className="text-center text-neutral-400 text-sm mb-8">
          Create your account to start building.
        </p>

        {generalError && (
          <p className="bg-red-900/50 border border-red-500 text-red-300 text-sm rounded-md p-3 text-center mb-6">
            {generalError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={validationErrors.name}
              required
            />
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              error={validationErrors.email}
              required
            />
          </div>

          {/* 🚀 Password Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              show={showPassword}
              toggle={() => setShowPassword(!showPassword)}
              error={validationErrors.password}
              required
            />
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword(!showConfirmPassword)}
              error={validationErrors.confirmPassword}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Phone Number"
              name="phone"
              placeholder="+91..."
              value={formData.phone}
              onChange={handleChange}
              error={validationErrors.phone}
            />
            <InputField
              label="College"
              name="college"
              placeholder="Your IIIT / College"
              value={formData.college}
              onChange={handleChange}
              error={validationErrors.college}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              options={["1st", "2nd", "3rd", "4th", "Graduate", "Other"]}
            />
            <InputField
              label="Department"
              name="department"
              placeholder="CSE / ECE etc."
              value={formData.department}
              onChange={handleChange}
              error={validationErrors.department}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-green-600 hover:bg-green-700 text-black font-bold py-3 rounded-xl transition-all active:scale-[0.98] disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            {isLoading ? "Encrypting Data..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-8">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-green-400 hover:text-green-300 transition-colors"
          >
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// --- Enhanced Reusable Components ---

const InputField = ({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) => (
  <div className="flex flex-col">
    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">
      {label}
    </label>
    <input
      className={`block w-full bg-neutral-800 border rounded-xl py-2.5 px-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 transition-all ${
        error
          ? "border-red-500 ring-red-500/20"
          : "border-neutral-700 focus:ring-green-500/50 focus:border-green-500"
      }`}
      {...props}
    />
    {error && (
      <p className="mt-1 text-[10px] font-bold text-red-400 uppercase tracking-tight ml-1">
        {error}
      </p>
    )}
  </div>
);

// 🚀 New Specific Password Component
const PasswordField = ({ label, show, toggle, error, ...props }: any) => (
  <div className="flex flex-col relative">
    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">
      {label}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={`block w-full bg-neutral-800 border rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 transition-all pr-10 ${
          error
            ? "border-red-500 ring-red-500/20"
            : "border-neutral-700 focus:ring-green-500/50 focus:border-green-500"
        }`}
        {...props}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-green-400 transition-colors"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
    {error && (
      <p className="mt-1 text-[10px] font-bold text-red-400 uppercase tracking-tight ml-1">
        {error}
      </p>
    )}
  </div>
);

const SelectField = ({
  label,
  options,
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
  error?: string;
}) => (
  <div className="flex flex-col">
    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1 ml-1">
      {label}
    </label>
    <select
      className={`block w-full bg-neutral-800 border rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${
        error
          ? "border-red-500 ring-red-500/20"
          : "border-neutral-700 focus:ring-green-500/50 focus:border-green-500"
      }`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-neutral-900">
          {opt}
        </option>
      ))}
    </select>
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
