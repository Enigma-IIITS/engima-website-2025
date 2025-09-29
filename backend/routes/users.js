const express = require("express");
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");
const {
  validateUserUpdate,
  handleValidationErrors,
} = require("../utils/validation");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundResponse,
  sendForbiddenResponse,
  sendServerErrorResponse,
  getPaginationData,
  buildPaginationResponse,
} = require("../utils/response");
const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get("/", auth, admin, async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationData(req);
    const { search, role, isActive } = req.query;

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { college: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    // Get users with pagination
    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCount = await User.countDocuments(filter);

    const response = buildPaginationResponse(users, totalCount, page, limit);
    sendSuccessResponse(res, "Users retrieved successfully", response);
  } catch (error) {
    console.error("Get users error:", error);
    sendServerErrorResponse(res, "Error retrieving users");
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return sendForbiddenResponse(res, "Access denied");
    }

    const user = await User.findById(id);
    if (!user) {
      return sendNotFoundResponse(res, "User not found");
    }

    sendSuccessResponse(res, "User retrieved successfully", user.toJSON());
  } catch (error) {
    console.error("Get user error:", error);
    if (error.name === "CastError") {
      return sendErrorResponse(res, "Invalid user ID format");
    }
    sendServerErrorResponse(res, "Error retrieving user");
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put(
  "/:id",
  auth,
  validateUserUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Users can only update their own profile unless they're admin
      if (req.user.role !== "admin" && req.user._id.toString() !== id) {
        return sendForbiddenResponse(res, "Access denied");
      }

      const updateData = { ...req.body };

      // Remove fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.email;
      delete updateData.role; // Only admins can change roles via separate endpoint
      delete updateData.isEmailVerified;

      const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return sendNotFoundResponse(res, "User not found");
      }

      sendSuccessResponse(res, "User updated successfully", user.toJSON());
    } catch (error) {
      console.error("Update user error:", error);
      if (error.name === "CastError") {
        return sendErrorResponse(res, "Invalid user ID format");
      }
      if (error.name === "ValidationError") {
        return sendErrorResponse(res, error.message);
      }
      sendServerErrorResponse(res, "Error updating user");
    }
  }
);

// @route   PUT /api/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put("/:id/role", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "moderator"].includes(role)) {
      return sendErrorResponse(res, "Invalid role");
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendNotFoundResponse(res, "User not found");
    }

    sendSuccessResponse(res, "User role updated successfully", user.toJSON());
  } catch (error) {
    console.error("Update user role error:", error);
    if (error.name === "CastError") {
      return sendErrorResponse(res, "Invalid user ID format");
    }
    sendServerErrorResponse(res, "Error updating user role");
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private/Admin
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return sendForbiddenResponse(res, "Cannot delete your own account");
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return sendNotFoundResponse(res, "User not found");
    }

    sendSuccessResponse(res, "User deactivated successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    if (error.name === "CastError") {
      return sendErrorResponse(res, "Invalid user ID format");
    }
    sendServerErrorResponse(res, "Error deactivating user");
  }
});

module.exports = router;
