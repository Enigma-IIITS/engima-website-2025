// const Team = require("../models/Team");

// // GET /api/team
// exports.getTeam = async (req, res) => {
//   try {
//     const members = await Team.find().sort({ createdAt: -1 });
//     res.json(members);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // POST /api/team  (photo single)
// exports.createMember = async (req, res) => {
//   try {
//     const { name, role, designation } = req.body;
//     const photo = req.file ? req.file.path : null;

//     const member = new Team({ name, role, designation, photo });
//     await member.save();
//     res.status(201).json(member);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // PUT /api/team/:id
// exports.updateMember = async (req, res) => {
//   try {
//     const updateData = { ...req.body };
//     if (req.file) updateData.photo = req.file.path;

//     const member = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     if (!member) return res.status(404).json({ message: "Member not found" });
//     res.json(member);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // DELETE /api/team/:id
// exports.deleteMember = async (req, res) => {
//   try {
//     const member = await Team.findByIdAndDelete(req.params.id);
//     if (!member) return res.status(404).json({ message: "Member not found" });
//     res.json({ message: "Member deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const team = [
  { id: 1, name: "Kamran", role: "Core", designation: "Backend Dev", photo: "/images/alice.png" },
  { id: 2, name: "Pranjal", role: "Core", designation: "Frontend Dev", photo: "/images/bob.png" },
  { id: 3, name: "Shri Charan", role: "Core", designation: "Backend Dev", photo: "/images/charlie.png" },
      { id: 4, name: "Vaitish", role: "Core", designation: "Frontend Dev", photo: "/images/charlie.png" }
];

exports.getTeam = (req, res) => res.json(team);
