// const ClubInfo = require("../models/clubInfo");

// // GET /api/about
// exports.getClubInfo = async (req, res) => {
//   try {
//     const info = await ClubInfo.findOne();
//     res.json(info || {});
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // PUT /api/about
// // body: { welcomeMessage, about, moto, domains } (domains is array)
// exports.updateClubInfo = async (req, res) => {
//   try {
//     const { welcomeMessage, about, moto, domains } = req.body;
//     let info = await ClubInfo.findOne();

//     if (info) {
//       info.welcomeMessage = welcomeMessage ?? info.welcomeMessage;
//       info.about = about ?? info.about;
//       info.moto = moto ?? info.moto;
//       info.domains = domains ?? info.domains;
//     } else {
//       info = new ClubInfo({ welcomeMessage, about, moto, domains });
//     }

//     await info.save();
//     res.json(info);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const clubInfo = {
  welcomeMessage: "Welcome to Enigma!",
  about: "We are the official tech club of IIITS, promoting coding, AI, and robotics.",
  moto: "Innovate. Code. Inspire.",
  domains: [
    { name: "AI/ML", description: "Work on AI and Machine Learning projects." },
    { name: "Web Development", description: "Build modern web apps and websites." }
  ]
};

exports.getClubInfo = (req, res) => {
  res.json(clubInfo);
};
