const express = require("express");
const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { auth } = require("../middleware/auth");
const {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors,
} = require("../utils/validation");
const {
  sendSuccessResponse,
  sendCreatedResponse,
  sendErrorResponse,
  sendUnauthorizedResponse,
  sendServerErrorResponse,
} = require("../utils/response");
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  validateUserRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password, phone, college, year, department } =
        req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return sendErrorResponse(
          res,
          "User already exists with this email",
          409
        );
      }

      // Create new user
      const user = new User({
        name,
        email,
        password,
        phone,
        college,
        year,
        department,
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id);

      sendCreatedResponse(res, "User registered successfully", {
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      sendServerErrorResponse(res, "Error registering user");
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post(
  "/login",
  validateUserLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email and include password
      const user = await User.findByEmail(email).select("+password");
      if (!user) {
        return sendUnauthorizedResponse(res, "Invalid credentials");
      }

      // Check if user is active
      if (!user.isActive) {
        return sendUnauthorizedResponse(res, "Account is deactivated");
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return sendUnauthorizedResponse(res, "Invalid credentials");
      }

      // Update last login
      await user.updateLastLogin();

      // Generate JWT token
      const token = generateToken(user._id);

      sendSuccessResponse(res, "Login successful", {
        user: user.toJSON(),
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      sendServerErrorResponse(res, "Error logging in");
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", auth, async (req, res) => {
  try {
    // In a real-world app, you might want to blacklist the token
    // or store logout info in the database
    sendSuccessResponse(res, "User logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    sendServerErrorResponse(res, "Error logging out");
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    sendSuccessResponse(res, "User profile retrieved", req.user.toJSON());
  } catch (error) {
    console.error("Get profile error:", error);
    sendServerErrorResponse(res, "Error getting user profile");
  }
});

module.exports = router;
