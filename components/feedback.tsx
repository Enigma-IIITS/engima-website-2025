"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, useInView } from "motion/react"; // 👈 Import useInView
import { useRef } from "react";

export default function FeedbackForm() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" }); // Trigger when 50px before entering viewport

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Feedback submitted:", formData);
    alert("Thank you for your feedback!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <motion.div
      ref={ref} // 👈 Attach ref for useInView
      initial={{ opacity: 0, y: 30 }}     // Start hidden & slightly below
      animate={isInView ? { opacity: 1, y: 0 } : {}} // Animate only when in view
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto p-6 rounded-lg bg-black border border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
    >
      {/* Matrix-style border overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px),
            linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px)
          `,
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
            placeholder="Enter your full name"
            className="bg-zinc-900 text-white border-green-700 focus:ring-green-500"
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
            placeholder="your@email.com"
            className="bg-zinc-900 text-white border-green-700 focus:ring-green-500"
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
            className={cn(
              "w-full rounded-md border-none bg-zinc-900 px-3 py-2 text-sm text-white transition duration-400 focus-visible:ring-[2px] focus-visible:ring-green-500 focus-visible:outline-none resize-none",
              "placeholder:text-gray-500"
            )}
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
        >
          Submit Feedback
        </button>
      </form>

      {/* Optional: Add ENIGMA logo at bottom */}
      <div className="mt-8 flex justify-center">
        <div className="text-xs text-gray-500">
          <span className="font-mono">ENIGMA</span> — Where Code meets Curiosity.
        </div>
      </div>
    </motion.div>
  );
}