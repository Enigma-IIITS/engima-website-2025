


// "use client";
// import * as React from "react";
// import { Input, Button } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { cn } from "@/lib/utils";
// import { motion, useInView } from "motion/react";
// import { useRef } from "react";
// import {
//   submitFeedback,
//   getAllFeedback,
//   getMyFeedback,
//   getEventFeedback,
//   resolveFeedback,
//   addAdminNote,
//   voteFeedback,
// } from "@/lib/feedbackApi";

// type FeedbackData = { name: string; email: string; message: string };

// export default function FeedbackForm() {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true, margin: "-50px" });

//   const [formData, setFormData] = React.useState<FeedbackData>({
//     name: "",
//     email: "",
//     message: "",
//   });
//   const [loading, setLoading] = React.useState(false);
//   const [feedbackList, setFeedbackList] = React.useState<any[]>([]);
//   const [route, setRoute] = React.useState("all"); // all, my-feedback, event
//   const [noteText, setNoteText] = React.useState<string>("");

//   const token = process.env.NEXT_PUBLIC_FEEDBACK_TOKEN;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const data = await submitFeedback(token!, formData);
//       if (data.success) {
//         alert("Feedback submitted successfully!");
//         setFormData({ name: "", email: "", message: "" });
//       } else {
//         alert(data.message || "Submission failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Something went wrong!");
//     }

//     setLoading(false);
//   };

//   const fetchFeedback = async () => {
//     setLoading(true);
//     try {
//       let data;
//       if (route === "all") data = await getAllFeedback(token!);
//       else if (route === "my-feedback") data = await getMyFeedback(token!, { email: formData.email });
//       else if (route === "event") data = await getEventFeedback(token!, { eventId: "123" });

//       if (data.success) setFeedbackList(data.data);
//       else alert(data.message || "Failed to fetch feedback");
//     } catch (err) {
//       console.error(err);
//       alert("Error fetching feedback");
//     }
//     setLoading(false);
//   };

//   const handleResolve = async (id: string) => {
//     setLoading(true);
//     try {
//       const data = await resolveFeedback(token!, id, { resolved: true });
//       if (data.success) fetchFeedback();
//     } catch (err) {
//       console.error(err);
//       alert("Error resolving feedback");
//     }
//     setLoading(false);
//   };

//   const handleAddNote = async (id: string) => {
//     if (!noteText) return alert("Enter a note first");
//     setLoading(true);
//     try {
//       const data = await addAdminNote(token!, id, { note: noteText });
//       if (data.success) {
//         fetchFeedback();
//         setNoteText("");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Error adding note");
//     }
//     setLoading(false);
//   };

//   const handleVote = async (id: string, upvote: boolean) => {
//     setLoading(true);
//     try {
//       const data = await voteFeedback(token!, id, { upvote });
//       if (data.success) fetchFeedback();
//     } catch (err) {
//       console.error(err);
//       alert("Error voting feedback");
//     }
//     setLoading(false);
//   };

//   return (
//     <motion.div
//       ref={ref}
//       initial={{ opacity: 0, y: 30 }}
//       animate={isInView ? { opacity: 1, y: 0 } : {}}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//       className="relative w-full max-w-2xl mx-auto p-6 rounded-lg bg-black border border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
//     >
//       <h2 className="text-2xl font-bold text-white mb-4">FEEDBACK</h2>

//       {/* Route Selector */}
//       <div className="mb-4">
//         <Label className="text-white">Select Route</Label>
//         <select
//           value={route}
//           onChange={(e) => setRoute(e.target.value)}
//           className="w-full rounded-md p-2 bg-zinc-900 text-white border-green-700"
//         >
//           <option value="all">All Feedback</option>
//           <option value="my-feedback">My Feedback</option>
//           <option value="event">Event Feedback</option>
//         </select>
//       </div>

//       {/* Submit Feedback Form */}
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="space-y-2">
//           <Label htmlFor="name" className="text-white">Full Name</Label>
//           <Input
//             id="name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             placeholder="Enter your full name"
//             className="bg-zinc-900 text-white border-green-700"
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
//             className="bg-zinc-900 text-white border-green-700"
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
//               "w-full rounded-md bg-zinc-900 px-3 py-2 text-white text-sm resize-none border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500",
//               "placeholder:text-gray-500"
//             )}
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? "Submitting..." : "Submit Feedback"}
//         </button>
//       </form>

//       {/* Fetch Feedback Button */}
//       <button
//         onClick={fetchFeedback}
//         disabled={loading}
//         className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {loading ? "Loading..." : "Fetch Feedback"}
//       </button>

//       {/* Display Feedback */}
//       {feedbackList.length > 0 && (
//         <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
//           {feedbackList.map((fb) => (
//             <div key={fb._id} className="p-3 bg-zinc-800 rounded-md border border-green-700">
//               <p><strong>Name:</strong> {fb.name}</p>
//               <p><strong>Email:</strong> {fb.email}</p>
//               <p><strong>Message:</strong> {fb.message}</p>
//               <p><strong>Resolved:</strong> {fb.resolved ? "Yes" : "No"}</p>
//               {fb.notes && fb.notes.length > 0 && (
//                 <p><strong>Notes:</strong> {fb.notes.join(", ")}</p>
//               )}
//               <div className="mt-2 space-x-2">
//                 <button
//                   onClick={() => handleResolve(fb._id)}
//                   className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
//                 >
//                   Resolve
//                 </button>
//                 <input
//                   type="text"
//                   placeholder="Add note..."
//                   value={noteText}
//                   onChange={(e) => setNoteText(e.target.value)}
//                   className="px-2 py-1 rounded bg-zinc-900 text-white border-green-700"
//                 />
//                 <button
//                   onClick={() => handleAddNote(fb._id)}
//                   className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded"
//                 >
//                   Add Note
//                 </button>
//                 <button
//                   onClick={() => handleVote(fb._id, true)}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
//                 >
//                   Upvote
//                 </button>
//                 <button
//                   onClick={() => handleVote(fb._id, false)}
//                   className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
//                 >
//                   Downvote
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </motion.div>
//   );
// }
"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import {
  submitFeedback,
  getAllFeedback,
  getMyFeedback,
  getEventFeedback,
} from "@/lib/feedbackApi";

export default function FeedbackForm() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const [route, setRoute] = React.useState("submit"); // submit, my-feedback, all, event
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
    eventId: "",
  });
  const [feedbacks, setFeedbacks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const token = process.env.NEXT_PUBLIC_FEEDBACK_TOKEN;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message) {
      alert("Please write your feedback before submitting!");
      return;
    }
    setLoading(true);
    try {
      const res = await submitFeedback(token!, {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        eventId: formData.eventId,
      });
      if (res.success) {
        alert("Feedback submitted successfully!");
        setFormData({ ...formData, message: "" });
      } else {
        alert(res.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    }
    setLoading(false);
  };

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      let res;
      if (route === "my-feedback") {
        // Auto-use the email from formData
        res = await getMyFeedback(token!, { email: formData.email });
      } else if (route === "all") {
        res = await getAllFeedback(token!);
      } else if (route === "event") {
        if (!formData.eventId) {
          alert("Enter event ID to fetch feedback");
          setLoading(false);
          return;
        }
        res = await getEventFeedback(token!, { eventId: formData.eventId });
      }
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching feedback");
    }
    setLoading(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-4xl mx-auto p-6 rounded-lg bg-black border border-green-500 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
    >
      <h2 className="text-2xl font-bold text-white mb-4">ENIGMA FEEDBACK</h2>
      <p className="text-sm text-gray-400 mb-6">Help us improve ENIGMA. Your thoughts matter.</p>

      <div className="mb-4">
        <Label htmlFor="route" className="text-white">Select Action</Label>
        <select
          id="route"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          className="w-full bg-zinc-900 text-white px-3 py-2 rounded-md border border-green-700 focus:ring-green-500"
        >
          <option value="submit">Submit Feedback</option>
          <option value="my-feedback">My Feedback</option>
          <option value="all">All Feedback</option>
          <option value="event">Event Feedback</option>
        </select>
      </div>

      {route === "submit" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full bg-zinc-900 text-white border-green-700 px-3 py-2 rounded-md"
          />
          <Input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="w-full bg-zinc-900 text-white border-green-700 px-3 py-2 rounded-md"
          />
          <Input
            name="eventId"
            value={formData.eventId}
            onChange={handleChange}
            placeholder="Event ID (optional)"
            className="w-full bg-zinc-900 text-white border-green-700 px-3 py-2 rounded-md"
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Your feedback..."
            rows={4}
            className="w-full bg-zinc-900 text-white border-green-700 px-3 py-2 rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      )}

      {route !== "submit" && (
        <div className="space-y-4">
          {route === "event" && (
            <Input
              name="eventId"
              value={formData.eventId}
              onChange={handleChange}
              placeholder="Enter Event ID"
              className="w-full bg-zinc-900 text-white border-green-700 px-3 py-2 rounded-md mb-2"
            />
          )}
          <button
            onClick={fetchFeedback}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50 mb-4"
          >
            {loading ? "Fetching..." : "Fetch Feedback"}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map((fb) => (
              <div key={fb._id} className="p-4 bg-zinc-900 border border-green-700 rounded-md">
                <h3 className="text-white font-bold">{fb.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{fb.email} | Event: {fb.eventId || "N/A"}</p>
                <p className="text-white mb-2">{fb.message}</p>
                <p className="text-green-500 text-sm">Votes: {fb.votes || 0}</p>
                <p className="text-sm text-gray-300">Resolved: {fb.resolved ? "Yes" : "No"}</p>
                {fb.notes?.length > 0 && (
                  <div className="mt-2 text-gray-300">
                    <strong>Notes:</strong>
                    <ul className="list-disc ml-5">
                      {fb.notes.map((note: string, idx: number) => (
                        <li key={idx}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
