// Authentication middleware
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");
const {
  sendUnauthorizedResponse,
  sendForbiddenResponse,
  sendServerErrorResponse,
} = require("../utils/response");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return sendUnauthorizedResponse(res, "No token, authorization denied");
    }

    // Verify token
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return sendUnauthorizedResponse(res, "Invalid token or user deactivated");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendUnauthorizedResponse(res, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      return sendUnauthorizedResponse(res, "Token expired");
    }
    return sendServerErrorResponse(res, "Authentication error");
  }
};

// Admin middleware
const admin = (req, res, next) => {
  try {
    if (!req.user) {
      return sendUnauthorizedResponse(res, "Authorization required");
    }

    if (req.user.role !== "admin") {
      return sendForbiddenResponse(res, "Admin access required");
    }

    next();
  } catch (error) {
    return sendServerErrorResponse(res, "Server error in admin middleware");
  }
};

// Moderator or Admin middleware
const moderator = (req, res, next) => {
  try {
    if (!req.user) {
      return sendUnauthorizedResponse(res, "Authorization required");
    }

    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return sendForbiddenResponse(res, "Moderator or Admin access required");
    }

    next();
  } catch (error) {
    return sendServerErrorResponse(res, "Server error in moderator middleware");
  }
};

module.exports = { auth, admin, moderator };
