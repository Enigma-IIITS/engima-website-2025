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
router.post(
  "/register",
  validateUserRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password, phone, college, year, department } =
        req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return sendErrorResponse(
          res,
          "User already exists with this email",
          409
        );
      }

      // Model pre-save hook handles hashing automatically
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
      const token = generateToken(user);

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
router.post(
  "/login",
  validateUserLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // 🚀 THE FIX: Explicitly select the password field using .select("+password")
      // because the schema has 'select: false' for security.
      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+password"
      );

      if (!user) {
        return sendUnauthorizedResponse(res, "Invalid credentials");
      }

      if (!user.isActive) {
        return sendUnauthorizedResponse(res, "Account is deactivated");
      }

      // Verify password using the bcrypt comparison method in User model
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        console.log(`Password mismatch for user: ${email}`);
        return sendUnauthorizedResponse(res, "Invalid credentials");
      }

      await user.updateLastLogin();
      const token = generateToken(user);

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
router.post("/logout", auth, async (req, res) => {
  try {
    sendSuccessResponse(res, "User logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    sendServerErrorResponse(res, "Error logging out");
  }
});

// @route   GET /api/auth/me
router.get("/me", auth, async (req, res) => {
  try {
    sendSuccessResponse(res, "User profile retrieved", req.user.toJSON());
  } catch (error) {
    console.error("Get profile error:", error);
    sendServerErrorResponse(res, "Error getting user profile");
  }
});

module.exports = router;
