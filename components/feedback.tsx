// "use client";
// import * as React from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { cn } from "@/lib/utils";
// import { motion, useInView } from "motion/react";
// import { useRef } from "react";
// import { submitFeedback } from "@/lib/feedbackApi";

// export default function FeedbackForm() {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: "-50px" });

//   const [formData, setFormData] = React.useState({
//     name: "",
//     email: "",
//     message: "",
//   });
//   const [loading, setLoading] = React.useState(false);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const token = process.env.NEXT_PUBLIC_FEEDBACK_TOKEN || "testtoken";
//       const res = await submitFeedback(token, formData);
//       if (res.success) {
//         alert("Feedback submitted successfully!");
//         setFormData({ name: "", email: "", message: "" });
//       } else {
//         alert(res.message || "Submission failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong!");
//     }
//     setLoading(false);
//   };

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 30 }}
//       animate={isInView ? { opacity: 1, y: 0 } : {}}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//       className="relative w-full max-w-md mx-auto p-6 rounded-lg bg-black border border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
//     >
//       <div
//         className="absolute inset-0 pointer-events-none z-10"
//         style={{
//           backgroundImage: `
//             linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px),
//             linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px)
//           `,
//           backgroundSize: "20px 20px",
//           opacity: 0.3,
//         }}
//       />

//       <h2 className="text-2xl font-bold text-white mb-4">FEEDBACK</h2>
//       <p className="text-sm text-gray-400 mb-6">Help us improve ENIGMA. Your thoughts matter.</p>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="name" className="text-white">Full Name</Label>
//           <Input
//             id="name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Enter your full name"
//             className="bg-zinc-900 text-white border-green-700 focus:ring-green-500"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="email" className="text-white">Email Address</Label>
//           <Input
//             id="email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="your@email.com"
//             className="bg-zinc-900 text-white border-green-700 focus:ring-green-500"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="message" className="text-white">Your Feedback</Label>
//           <textarea
//             id="message"
//             name="message"
//             value={formData.message}
//             onChange={handleChange}
//             placeholder="Share your thoughts..."
//             rows={5}
//             className={cn(
//               "w-full rounded-md border-none bg-zinc-900 px-3 py-2 text-sm text-white transition duration-400 focus-visible:ring-[2px] focus-visible:ring-green-500 focus-visible:outline-none resize-none",
//               "placeholder:text-gray-500"
//             )}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? "Submitting..." : "Submit Feedback"}
//         </button>
//       </form>

//       <div className="mt-8 flex justify-center">
//         <div className="text-xs text-gray-500">
//           <span className="font-mono">ENIGMA</span> — Where Code meets Curiosity.
//         </div>
//       </div>
//     </motion.div>
//   );
// // }
"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

export default function FeedbackForm() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const [formData, setFormData] = React.useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = process.env.NEXT_PUBLIC_FEEDBACK_TOKEN;

      const res = await fetch(`${window.location.origin}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

console.log("Frontend token:", token); // must log testtoken

      const data = await res.json();

      if (data.success) {
        alert("Feedback submitted successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        alert(data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-md mx-auto p-6 rounded-lg bg-black border border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
    >
      <h2 className="text-2xl font-bold text-white mb-4">FEEDBACK</h2>
      <p className="text-sm text-gray-400 mb-6">Help us improve ENIGMA. Your thoughts matter.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Full Name</Label>
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
          <Label htmlFor="email" className="text-white">Email Address</Label>
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
          <Label htmlFor="message" className="text-white">Your Feedback</Label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Share your thoughts..."
            rows={5}
            className={cn(
              "w-full rounded-md border-none bg-zinc-900 px-3 py-2 text-sm text-white transition duration-400 focus-visible:ring-[2px] focus-visible:ring-green-500 focus-visible:outline-none resize-none",
              "placeholder:text-gray-500"
            )}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </form>
    </motion.div>
  );
}

