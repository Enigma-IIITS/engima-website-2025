// const Event = require("../models/Event");

// // GET /api/events
// exports.getEvents = async (req, res) => {
//   try {
//     const events = await Event.find().sort({ date: -1, createdAt: -1 });
//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // POST /api/events
// // fields: poster (single), photos (multiple)
// exports.createEvent = async (req, res) => {
//   try {
//     const { title, description, date } = req.body;
//     const poster = req.files && req.files["poster"] ? req.files["poster"][0].path : null;
//     const photos = req.files && req.files["photos"] ? req.files["photos"].map(f => f.path) : [];

//     const event = new Event({ title, description, date, poster, photos });
//     await event.save();
//     res.status(201).json(event);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // PUT /api/events/:id
// // Allows updating fields; file updates not handled here (can be extended similarly)
// exports.updateEvent = async (req, res) => {
//   try {
//     const updateData = { ...req.body };

//     // If files uploaded on update:
//     if (req.files && req.files["poster"]) updateData.poster = req.files["poster"][0].path;
//     if (req.files && req.files["photos"]) {
//       // either append or replace; here we replace with uploaded set
//       updateData.photos = req.files["photos"].map(f => f.path);
//     }

//     const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     if (!event) return res.status(404).json({ message: "Event not found" });
//     res.json(event);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // DELETE /api/events/:id
// exports.deleteEvent = async (req, res) => {
//   try {
//     const ev = await Event.findByIdAndDelete(req.params.id);
//     if (!ev) return res.status(404).json({ message: "Event not found" });
//     res.json({ message: "Event deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const events = [
  {
    id: 1,
    title: "Hackathon 2025",
    description: "Our annual coding hackathon.",
    date: "2025-06-15",
    poster: "/images/hackathon2025.png",
    photos: ["/images/hack1.png", "/images/hack2.png"]
  },
  {
    id: 2,
    title: "AI Workshop",
    description: "Intro to AI & ML.",
    date: "2025-07-01",
    poster: "/images/aiworkshop.png",
    photos: []
  }
];

exports.getEvents = (req, res) => res.json(events);
