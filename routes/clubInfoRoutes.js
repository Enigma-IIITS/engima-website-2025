// const express = require("express");
// const { getClubInfo, updateClubInfo } = require("../controllers/clubInfoController");
// const router = express.Router();

// router.get("/", getClubInfo);
// router.put("/", updateClubInfo);

// module.exports = router;


const express = require("express");
const { getClubInfo } = require("../controllers/clubInfoController");
const router = express.Router();

router.get("/", getClubInfo);

module.exports = router;
