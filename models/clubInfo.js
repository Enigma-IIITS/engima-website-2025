const mongoose = require("mongoose");

const clubInfoSchema = new mongoose.Schema({
  welcomeMessage: { type: String, required: true },
  about: { type: String, required: true },
  moto: { type: String },
  domains: [
    {
      name: { type: String },
      description: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("ClubInfo", clubInfoSchema);
