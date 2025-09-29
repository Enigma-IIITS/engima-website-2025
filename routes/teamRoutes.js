// const express = require("express");
// const upload = require("../middleware/upload");
// const { getTeam, createMember, updateMember, deleteMember } = require("../controllers/teamController");

// const router = express.Router();

// router.get("/", getTeam);
// router.post("/", upload.single("photo"), createMember);
// router.put("/:id", upload.single("photo"), updateMember);
// router.delete("/:id", deleteMember);

// module.exports = router;


const express = require("express");
const { getTeam } = require("../controllers/teamController");
const router = express.Router();

router.get("/", getTeam);

module.exports = router;
