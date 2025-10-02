// models/Feedback.ts
import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    notes: [{ text: String, createdAt: { type: Date, default: Date.now } }],
    votes: { type: Number, default: 0 },
    eventId: { type: String, default: "" }, // optional
  },
  { timestamps: true }
);

export default mongoose.models.Feedback ||
  mongoose.model("Feedback", FeedbackSchema);
