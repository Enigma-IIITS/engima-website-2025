const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true }, // e.g., Core, Lead, Member
  designation: { type: String },
  photo: { type: String } // path to photo
}, { timestamps: true });

module.exports = mongoose.model("Team", teamSchema);
