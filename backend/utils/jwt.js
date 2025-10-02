const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (user) => {
  // ✅ FIX: Include user's ID, role, and name in the token payload
  const payload = {
    userId: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Verify JWT Token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
