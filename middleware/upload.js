const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, safeName);
  }
});

// File filter (allow png/jpg/jpeg)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const allowed = /jpeg|jpg|png/;
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (jpeg/jpg/png) are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

module.exports = upload;
