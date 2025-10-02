import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/mongo";
import Feedback from "@/models/Feedback";

const TOKEN = process.env.FEEDBACK_TOKEN;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect();

    const { method, query, body } = req;

    // Simple token-based auth
    const authHeader = req.headers.authorization || "";
    if (authHeader !== `Bearer ${TOKEN}`) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Route selection via query.route
    const route = query.route as string | undefined;

    // -------------------------
    // 1️⃣ Submit feedback
    // -------------------------
    if (method === "POST" && !route) {
      const feedback = await Feedback.create(body);
      return res.status(201).json({ success: true, data: feedback });
    }

    // -------------------------
    // 2️⃣ Get all feedback
    // -------------------------
    if (method === "GET" && !route) {
      const feedback = await Feedback.find();
      return res.json({ success: true, data: feedback });
    }

    // -------------------------
    // 3️⃣ Get my feedback
    // -------------------------
    if (method === "GET" && route === "my-feedback") {
      const { email } = query;
      const feedback = await Feedback.find({ email });
      return res.json({ success: true, data: feedback });
    }

    // -------------------------
    // 4️⃣ Get event feedback
    // -------------------------
    if (method === "GET" && route === "event") {
      const { eventId } = query;
      const feedback = await Feedback.find({ eventId });
      return res.json({ success: true, data: feedback });
    }

    // -------------------------
    // 5️⃣ Resolve feedback
    // -------------------------
    if (method === "POST" && route === "resolve" && query.id) {
      const feedback = await Feedback.findById(query.id);
      if (!feedback) return res.status(404).json({ success: false, message: "Not found" });

      feedback.resolved = body.resolved ?? true;
      await feedback.save();

      return res.json({ success: true, data: feedback });
    }

    // -------------------------
    // 6️⃣ Add admin note
    // -------------------------
    if (method === "POST" && route === "note" && query.id) {
      const feedback = await Feedback.findById(query.id);
      if (!feedback) return res.status(404).json({ success: false, message: "Not found" });

      if (!Array.isArray(feedback.notes)) feedback.notes = [];
      if (body.note) feedback.notes.push(body.note);

      await feedback.save();
      return res.json({ success: true, data: feedback });
    }

    // -------------------------
    // 7️⃣ Vote feedback
    // -------------------------
    if (method === "POST" && route === "vote" && query.id) {
      const feedback = await Feedback.findById(query.id);
      if (!feedback) return res.status(404).json({ success: false, message: "Not found" });

      if (body.upvote) feedback.votes = (feedback.votes || 0) + 1;
      else if (body.downvote) feedback.votes = (feedback.votes || 0) - 1;

      await feedback.save();
      return res.json({ success: true, data: feedback });
    }

    // -------------------------
    // 8️⃣ Analytics
    // -------------------------
    if (method === "GET" && route === "analytics") {
      const total = await Feedback.countDocuments();
      const resolved = await Feedback.countDocuments({ resolved: true });
      const pending = total - resolved;
      const votesAgg = await Feedback.aggregate([{ $group: { _id: null, totalVotes: { $sum: "$votes" } } }]);
      const votes = votesAgg[0]?.totalVotes ?? 0;

      return res.json({ success: true, data: { total, resolved, pending, votes } });
    }

    // Unknown route
    res.status(400).json({ success: false, message: "Bad request" });
  } catch (error: any) {
    console.error("Feedback API error:", error);
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
}
