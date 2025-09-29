const mongoose = require("mongoose");

const socialSchema = new mongoose.Schema({
  platform: { type: String, required: true }, // Instagram, LinkedIn, etc.
  url: { type: String, required: true },
  icon: { type: String } // optional path or icon name
}, { timestamps: true });

module.exports = mongoose.model("Social", socialSchema);
