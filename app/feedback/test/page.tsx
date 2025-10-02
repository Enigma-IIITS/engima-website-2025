"use client";
import { useEffect, useState } from "react";
import {
  submitFeedback,
  getAllFeedback,
  getMyFeedback,
  getEventFeedback,
  resolveFeedback,
  addAdminNote,
  voteFeedback,
  getAnalytics,
} from "@/lib/feedbackApi";

export default function TestFeedbackAPI() {
  const token = process.env.NEXT_PUBLIC_FEEDBACK_TOKEN || "";

  const [results, setResults] = useState<any>({});

  useEffect(() => {
    const test = async () => {
      const newResults: any = {};

      // 1️⃣ Submit new feedback
      newResults.submitFeedback = await submitFeedback(token, {
        name: "Test User",
        email: "test@example.com",
        message: "This is a test feedback",
        eventId: "event123",
      });

      const feedbackId = newResults.submitFeedback.data?._id;

      // 2️⃣ Get all feedback
      newResults.getAllFeedback = await getAllFeedback(token);

      // 3️⃣ Get my feedback
      newResults.getMyFeedback = await getMyFeedback(token, { email: "test@example.com" });

      // 4️⃣ Get event feedback
      newResults.getEventFeedback = await getEventFeedback(token, { eventId: "event123" });

      if (feedbackId) {
        // 5️⃣ Resolve feedback
        newResults.resolveFeedback = await resolveFeedback(token, feedbackId, { resolved: true });

        // 6️⃣ Add admin note
        newResults.addAdminNote = await addAdminNote(token, feedbackId, { note: "Checked by admin" });

        // 7️⃣ Vote feedback
        newResults.voteFeedback = await voteFeedback(token, feedbackId, { upvote: true });

        // 8️⃣ Get analytics
        newResults.getAnalytics = await getAnalytics(token);
      }

      setResults(newResults);
    };

    test();
  }, []);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white font-mono">
      <h1 className="text-2xl font-bold mb-6">Feedback API Test</h1>
      <p className="mb-4">Results of all 8 routes:</p>

      {Object.entries(results).map(([key, value]) => (
        <div key={key} className="mb-6 p-4 border border-green-500 rounded-md bg-gray-800">
          <h2 className="font-bold text-green-400 mb-2">{key}</h2>
          <pre className="text-sm overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>
        </div>
      ))}

      {Object.keys(results).length === 0 && <p>Loading results...</p>}
    </div>
  );
}
