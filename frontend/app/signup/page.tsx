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
    phone: "",
    college: "",
    year: "1st",
    department: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation error for the field being edited
    if (validationErrors[e.target.name]) {
      setValidationErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneralError(null);
    setValidationErrors({});

    try {
      await register(formData);
      // Redirect is handled by AuthContext on success
    } catch (err: any) {
      // This 'err' comes from the re-throw in AuthContext
      if (err.errors) {
        // This is a validation error from the backend
        const newErrors: { [key: string]: string } = {};
        err.errors.forEach((error: { path: string; msg: string }) => {
          newErrors[error.path] = error.msg;
        });
        setValidationErrors(newErrors);
      } else {
        // This is a general error (e.g., "Email already exists")
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
        className="relative w-full max-w-lg mx-auto p-8 rounded-lg bg-neutral-900 border border-green-500/30"
      >
        <Link
          href="/"
          className="absolute top-4 left-4 text-neutral-400 hover:text-white text-sm flex items-center"
        >
          <BackIcon />
          <span className="ml-1">Back to Home</span>
        </Link>
        <h2 className="text-3xl font-bold text-white text-center mb-2 mt-8">
          Join the Enigma Community
        </h2>
        <p className="text-center text-neutral-400 text-sm mb-6">
          Create an account to register for events and more.
        </p>

        {generalError && (
          <p className="bg-red-900/50 border border-red-500 text-red-300 text-sm rounded-md p-3 text-center mb-4">
            {generalError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={validationErrors.name}
            required
          />
          <InputField
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={validationErrors.email}
            required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={validationErrors.password}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={validationErrors.phone}
            />
            <InputField
              label="College"
              name="college"
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
              value={formData.department}
              onChange={handleChange}
              error={validationErrors.department}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-black font-bold py-2.5 px-4 rounded-md transition-colors duration-300 disabled:bg-neutral-600"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-green-400 hover:text-green-300"
          >
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// Reusable Form Components
const InputField = ({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) => (
  <div>
    <label
      htmlFor={props.id || props.name}
      className="block text-sm font-medium text-neutral-300 mb-1"
    >
      {label}
    </label>
    <input
      className={`block w-full bg-neutral-800 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 sm:text-sm ${
        error
          ? "border-red-500 ring-red-500/50"
          : "border-neutral-700 focus:ring-green-500 focus:border-green-500"
      }`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
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
  <div>
    <label
      htmlFor={props.id || props.name}
      className="block text-sm font-medium text-neutral-300 mb-1"
    >
      {label}
    </label>
    <select
      className={`block w-full bg-neutral-800 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 sm:text-sm ${
        error
          ? "border-red-500 ring-red-500/50"
          : "border-neutral-700 focus:ring-green-500 focus:border-green-500"
      }`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
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
