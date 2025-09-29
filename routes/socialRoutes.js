// const express = require("express");
// const { getSocials, createSocial, updateSocial, deleteSocial } = require("../controllers/socialController");

// const router = express.Router();

// router.get("/", getSocials);
// router.post("/", createSocial);
// router.put("/:id", updateSocial);
// router.delete("/:id", deleteSocial);

// module.exports = router;


const express = require("express");
const { getSocials } = require("../controllers/socialController");
const router = express.Router();

router.get("/", getSocials);

module.exports = router;
