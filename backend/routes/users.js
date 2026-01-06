const express = require("express");
const User = require("../models/User");
const { Member } = require("../models/Member"); // Required for automatic position cleanup
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

/**
 * @route   GET /api/users
 * @desc    Get all users (restricted by privilege level on frontend)
 * @access  Private/Admin
 */
router.get("/", auth, admin, async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationData(req);
    const { search, role, isActive } = req.query;

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

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (Promote to Admin/Member or Demote to User)
 * @access  Private/Admin
 */
router.put("/:id/role", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return sendErrorResponse(
        res,
        "Invalid role. Use 'admin' for club members or 'user' for standard accounts."
      );
    }

    // 1. Update the User role in the primary User collection
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return sendNotFoundResponse(res, "User not found");
    }

    // 🚀 DEMOTION LOGIC: Automatically clean up Member profile if returned to 'user' role
    if (role === "user") {
      const member = await Member.findOne({ user: id });

      if (member) {
        // Mark all historical club positions as inactive
        member.roles = member.roles.map((r) => ({
          ...r,
          isActive: false,
          endDate: new Date(),
        }));

        // Remove current primary role and set status to inactive
        member.primaryRole = undefined;
        member.availability = {
          ...member.availability,
          status: "inactive",
          lastActive: new Date(),
        };

        await member.save();
      }
    }

    sendSuccessResponse(
      res,
      `User successfully ${role === "admin" ? "promoted" : "demoted"}`,
      user.toJSON()
    );
  } catch (error) {
    console.error("Update user role error:", error);
    if (error.name === "CastError") {
      return sendErrorResponse(res, "Invalid user ID format");
    }
    sendServerErrorResponse(res, "Error updating user role");
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Soft delete user and remove from club roster
 * @access  Private/Admin
 */
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return sendForbiddenResponse(res, "Cannot delete your own account");
    }

    // Soft delete user
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return sendNotFoundResponse(res, "User not found");
    }

    // Clean up member record if it exists
    await Member.findOneAndUpdate(
      { user: id },
      { "availability.status": "graduated", "roles.$[].isActive": false }
    );

    sendSuccessResponse(res, "User deactivated and removed from active roster");
  } catch (error) {
    console.error("Delete user error:", error);
    sendServerErrorResponse(res, "Error deactivating user");
  }
});

module.exports = router;
