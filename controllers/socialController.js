// const Social = require("../models/Social");

// // GET /api/socials
// exports.getSocials = async (req, res) => {
//   try {
//     const socials = await Social.find().sort({ platform: 1 });
//     res.json(socials);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // POST /api/socials
// exports.createSocial = async (req, res) => {
//   try {
//     const { platform, url, icon } = req.body;
//     const social = new Social({ platform, url, icon });
//     await social.save();
//     res.status(201).json(social);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // PUT /api/socials/:id
// exports.updateSocial = async (req, res) => {
//   try {
//     const social = await Social.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!social) return res.status(404).json({ message: "Social link not found" });
//     res.json(social);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // DELETE /api/socials/:id
// exports.deleteSocial = async (req, res) => {
//   try {
//     await Social.findByIdAndDelete(req.params.id);
//     res.json({ message: "Social link deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const socials = [
  { id: 1, platform: "LinkedIn", url: "https://linkedin.com/enigma", icon: "/icons/linkedin.png" },
  { id: 2, platform: "Instagram", url: "https://instagram.com/enigma", icon: "/icons/instagram.png" }
];

exports.getSocials = (req, res) => res.json(socials);
