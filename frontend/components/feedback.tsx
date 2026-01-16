"use client";
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useAuth } from "@/hooks/AuthContext";

// Added props to handle specific events
interface FeedbackFormProps {
  eventId?: string;
  eventTitle?: string;
  onSuccess?: () => void;
}

export default function FeedbackForm({
  eventId,
  eventTitle,
  onSuccess,
}: FeedbackFormProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    message: "",
    overallRating: 5,
  });

  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        title: eventTitle ? `Feedback for ${eventTitle}` : "",
      }));
    }
  }, [user, eventTitle]);

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

      // Building the body according to your professional schema
      const feedbackBody = {
        type: eventId ? "event" : "website",
        event: eventId || undefined,
        title:
          formData.title ||
          (eventId ? `Event Feedback: ${eventTitle}` : "Website Feedback"),
        content: formData.message,
        ratings: eventId
          ? {
              overall: formData.overallRating,
              // You can add more detailed rating inputs in the UI later
            }
          : undefined,
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackBody),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Something went wrong.");

      setStatus("success");
      setFormData((prev) => ({ ...prev, message: "", title: "" }));
      if (onSuccess) setTimeout(onSuccess, 2000);
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
      className="relative w-full max-w-md mx-auto p-6 rounded-2xl bg-black border border-green-500/50 shadow-[0_0_30px_rgba(0,255,0,0.15)]"
    >
      <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tighter">
        {eventId ? "Event Review" : "Feedback"}
      </h2>
      <p className="text-xs text-gray-500 mb-6 font-medium">
        {eventId
          ? `Sharing thoughts on ${eventTitle}`
          : "Help us improve the ENIGMA platform."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Stars - Only shows for events */}
        {eventId && (
          <div className="flex flex-col gap-2 mb-4">
            <Label className="text-neutral-400 text-xs uppercase font-bold">
              Overall Rating
            </Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, overallRating: num })
                  }
                  className={cn(
                    "w-10 h-10 rounded-lg border transition-all font-bold",
                    formData.overallRating >= num
                      ? "bg-green-600 border-green-500 text-black"
                      : "bg-zinc-900 border-neutral-800 text-neutral-500"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="title"
            className="text-neutral-400 text-xs uppercase font-bold"
          >
            Subject
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What is this regarding?"
            className="bg-zinc-900 border-neutral-800 text-white focus:ring-green-500 h-11"
            required
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="message"
            className="text-neutral-400 text-xs uppercase font-bold"
          >
            Your Message
          </Label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Be as specific as possible..."
            rows={4}
            required
            className="w-full rounded-xl bg-zinc-900 border border-neutral-800 p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
          />
        </div>

        {status === "error" && (
          <p className="text-xs text-red-500 font-bold bg-red-500/10 p-2 rounded border border-red-500/20">
            {formError}
          </p>
        )}
        {status === "success" && (
          <p className="text-xs text-green-500 font-bold bg-green-500/10 p-2 rounded border border-green-500/20">
            Sent! We appreciate your input.
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full mt-2 bg-green-600 hover:bg-green-500 text-black font-black py-3 rounded-xl transition-all disabled:bg-neutral-800 disabled:text-neutral-600 uppercase tracking-widest text-xs"
        >
          {status === "submitting" ? "Encrypting..." : "Submit Feedback"}
        </button>
      </form>
    </motion.div>
  );
}
