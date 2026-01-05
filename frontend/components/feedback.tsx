"use client";
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useAuth } from "@/hooks/AuthContext";

export default function FeedbackForm() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-fill form if user is logged in
    if (user) {
      setFormData((prev) => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      setFormError("You must be logged in to submit feedback.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setFormError(null);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/feedback`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Website Feedback from ${formData.name}`,
          content: formData.message,
          type: "website",
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Something went wrong.");

      setStatus("success");
      setFormData((prev) => ({ ...prev, message: "" })); // Clear only the message
    } catch (err: any) {
      setFormError(err.message);
      setStatus("error");
    }
  };

  return (
    <motion.div
      id="feedback"
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto p-6 rounded-lg bg-black border border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
    >
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px), linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
          opacity: 0.3,
        }}
      />
      <h2 className="text-2xl font-bold text-white mb-4">FEEDBACK</h2>
      <p className="text-sm text-gray-400 mb-6">
        Help us improve ENIGMA. Your thoughts matter.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Full Name
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Login to auto-fill"
            className="bg-zinc-900 text-white border-green-700 focus:ring-green-500"
            disabled={!!user}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Login to auto-fill"
            className="bg-zinc-900 text-white border-green-700 focus:ring-green-500"
            disabled={!!user}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message" className="text-white">
            Your Feedback
          </Label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Share your thoughts, suggestions, or concerns..."
            rows={5}
            required
            className={cn(
              "w-full rounded-md border-none bg-zinc-900 px-3 py-2 text-sm text-white transition duration-400 focus-visible:ring-[2px] focus-visible:ring-green-500 focus-visible:outline-none resize-none",
              "placeholder:text-gray-500"
            )}
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-500">{formError}</p>
        )}
        {status === "success" && (
          <p className="text-sm text-green-500">
            Thank you! Your feedback has been submitted.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-black font-medium py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-neutral-600 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </motion.div>
  );
}
