const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date },
  poster: { type: String }, // path to poster file (uploads/...)
  photos: [{ type: String }] // array of file paths
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
