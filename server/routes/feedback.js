const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Feedback = require("../models/Feedback");
const Event = require("../models/Event");
const {
  auth,
  authorizeRoles,
  moderator,
  admin,
} = require("../middleware/auth");
const {
  validateFeedback,
  validateFeedbackUpdate,
} = require("../utils/validation");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");

/**
 * @route   POST /api/feedback
 * @desc    Submit feedback
 * @access  Private
 */
router.post("/", auth, async (req, res) => {
  try {
    // Validate input
    const errors = validateFeedback(req.body);
    if (errors.length > 0) {
      return sendErrorResponse(res, "Validation failed", 400, errors);
    }

    const userId = req.user.id;
    const {
      type,
      event,
      title,
      content,
      ratings,
      categories,
      priority,
      urgency,
      contactPreferences,
      metadata,
      tags,
    } = req.body;

    // If event feedback, verify event exists
    if (type === "event" && event) {
      const eventExists = await Event.findById(event);
      if (!eventExists) {
        return sendErrorResponse(res, "Event not found", 404);
      }
    }

    // Create feedback
    const feedback = new Feedback({
      user: userId,
      type,
      event,
      title,
      content,
      ratings,
      categories,
      priority,
      urgency,
      contactPreferences,
      metadata: {
        ...metadata,
        userAgent: req.get("User-Agent"),
        platform: req.get("X-Platform") || "web",
      },
      tags: tags || [],
    });

    await feedback.save();

    await feedback.populate([
      { path: "user", select: "name email" },
      { path: "event", select: "title startDate" },
    ]);

    sendSuccessResponse(res, "Feedback submitted successfully", feedback, 201);
  } catch (error) {
    console.error("Submit feedback error:", error);
    sendErrorResponse(res, "Failed to submit feedback", 500);
  }
});

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback (Admin only)
 * @access  Private (Admin)
 */
router.get("/", auth, moderator, async (req, res) => {
  try {
    const {
      type,
      status,
      priority,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const feedback = await Feedback.find(query)
      .populate("user", "name email")
      .populate("event", "title startDate")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(query);

    // Get summary statistics
    const stats = await Feedback.getFeedbackStats();

    sendSuccessResponse(res, "Feedback retrieved successfully", {
      feedback,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get feedback error:", error);
    sendErrorResponse(res, "Failed to retrieve feedback", 500);
  }
});

/**
 * @route   GET /api/feedback/my-feedback
 * @desc    Get current user's feedback
 * @access  Private
 */
router.get("/my-feedback", auth, async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const query = { user: userId };
    if (type) query.type = type;

    const feedback = await Feedback.find(query)
      .populate("event", "title startDate")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(query);

    sendSuccessResponse(res, "Your feedback retrieved successfully", {
      feedback,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user feedback error:", error);
    sendErrorResponse(res, "Failed to retrieve your feedback", 500);
  }
});

/**
 * @route   GET /api/feedback/event/:eventId
 * @desc    Get feedback for specific event
 * @access  Private (Admin/Organizer)
 */
router.get("/event/:eventId", auth, moderator, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20, ratings = false } = req.query;

    // Check if event exists and user has permission
    const event = await Event.findById(eventId);
    if (!event) {
      return sendErrorResponse(res, "Event not found", 404);
    }

    if (
      req.user.role !== "admin" &&
      !event.organizers.includes(req.user.id) &&
      !event.coordinators.includes(req.user.id)
    ) {
      return sendErrorResponse(
        res,
        "Not authorized to view feedback for this event",
        403
      );
    }

    const feedback = await Feedback.getEventFeedback(eventId)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments({
      event: eventId,
      type: "event",
    });

    // Get ratings summary if requested
    let ratingsummary = null;
    if (ratings === "true") {
      const ratingsData = await Feedback.aggregate([
        {
          $match: {
            event: new mongoose.Types.ObjectId(eventId),
            type: "event",
          },
        },
        {
          $group: {
            _id: null,
            avgOverall: { $avg: "$ratings.overall" },
            avgOrganization: { $avg: "$ratings.organization" },
            avgContent: { $avg: "$ratings.content" },
            avgVenue: { $avg: "$ratings.venue" },
            avgSpeakers: { $avg: "$ratings.speakers" },
            avgNetworking: { $avg: "$ratings.networking" },
            totalResponses: { $sum: 1 },
          },
        },
      ]);

      ratingsummary = ratingsData[0] || {};
    }

    // Get sentiment analysis
    const sentiment = await Feedback.getSentimentAnalysis(eventId);

    sendSuccessResponse(res, "Event feedback retrieved successfully", {
      feedback,
      ratingsummary,
      sentiment,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get event feedback error:", error);
    sendErrorResponse(res, "Failed to retrieve event feedback", 500);
  }
});

/**
 * @route   GET /api/feedback/:feedbackId
 * @desc    Get specific feedback
 * @access  Private
 */
router.get("/:feedbackId", auth, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findById(feedbackId)
      .populate("user", "name email")
      .populate("event", "title startDate")
      .populate("resolution.resolvedBy", "name")
      .populate("adminNotes.addedBy", "name");

    if (!feedback) {
      return sendErrorResponse(res, "Feedback not found", 404);
    }

    // Check if user has permission to view
    if (!feedback.user.equals(userId) && req.user.role !== "admin") {
      // Check if user is organizer of related event
      if (feedback.event) {
        const event = await Event.findById(feedback.event);
        if (
          !event.organizers.includes(userId) &&
          !event.coordinators.includes(userId)
        ) {
          return sendErrorResponse(
            res,
            "Not authorized to view this feedback",
            403
          );
        }
      } else {
        return sendErrorResponse(
          res,
          "Not authorized to view this feedback",
          403
        );
      }
    }

    sendSuccessResponse(res, "Feedback retrieved successfully", feedback);
  } catch (error) {
    console.error("Get feedback error:", error);
    sendErrorResponse(res, "Failed to retrieve feedback", 500);
  }
});

/**
 * @route   PUT /api/feedback/:feedbackId
 * @desc    Update feedback
 * @access  Private
 */
router.put("/:feedbackId", auth, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return sendErrorResponse(res, "Feedback not found", 404);
    }

    // Check if user owns this feedback or is admin
    if (!feedback.user.equals(userId) && req.user.role !== "admin") {
      return sendErrorResponse(
        res,
        "Not authorized to update this feedback",
        403
      );
    }

    // Validate update data
    const errors = validateFeedbackUpdate(req.body);
    if (errors.length > 0) {
      return sendErrorResponse(res, "Validation failed", 400, errors);
    }

    const allowedUpdates = [
      "title",
      "content",
      "ratings",
      "categories",
      "tags",
    ];
    const adminOnlyUpdates = ["status", "priority", "urgency"];

    // Apply user updates
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        feedback[field] = req.body[field];
      }
    });

    // Apply admin-only updates
    if (req.user.role === "admin") {
      adminOnlyUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          feedback[field] = req.body[field];
        }
      });
    }

    await feedback.save();

    await feedback.populate([
      { path: "user", select: "name email" },
      { path: "event", select: "title startDate" },
    ]);

    sendSuccessResponse(res, "Feedback updated successfully", feedback);
  } catch (error) {
    console.error("Update feedback error:", error);
    sendErrorResponse(res, "Failed to update feedback", 500);
  }
});

/**
 * @route   DELETE /api/feedback/:feedbackId
 * @desc    Delete feedback
 * @access  Private
 */
router.delete("/:feedbackId", auth, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const userId = req.user.id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return sendErrorResponse(res, "Feedback not found", 404);
    }

    // Check if user owns this feedback or is admin
    if (!feedback.user.equals(userId) && req.user.role !== "admin") {
      return sendErrorResponse(
        res,
        "Not authorized to delete this feedback",
        403
      );
    }

    await Feedback.findByIdAndDelete(feedbackId);

    sendSuccessResponse(res, "Feedback deleted successfully");
  } catch (error) {
    console.error("Delete feedback error:", error);
    sendErrorResponse(res, "Failed to delete feedback", 500);
  }
});

/**
 * @route   POST /api/feedback/:feedbackId/resolve
 * @desc    Resolve feedback (Admin only)
 * @access  Private (Admin)
 */
router.post("/:feedbackId/resolve", auth, moderator, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { notes, actionsTaken } = req.body;
    const userId = req.user.id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return sendErrorResponse(res, "Feedback not found", 404);
    }

    await feedback.resolve(userId, notes, actionsTaken);

    await feedback.populate([
      { path: "user", select: "name email" },
      { path: "event", select: "title startDate" },
      { path: "resolution.resolvedBy", select: "name" },
    ]);

    sendSuccessResponse(res, "Feedback resolved successfully", feedback);
  } catch (error) {
    console.error("Resolve feedback error:", error);
    sendErrorResponse(res, "Failed to resolve feedback", 500);
  }
});

/**
 * @route   POST /api/feedback/:feedbackId/note
 * @desc    Add admin note to feedback
 * @access  Private (Admin)
 */
router.post("/:feedbackId/note", auth, admin, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { note, isInternal = true } = req.body;
    const userId = req.user.id;

    if (!note || note.trim().length === 0) {
      return sendErrorResponse(res, "Note content is required", 400);
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return sendErrorResponse(res, "Feedback not found", 404);
    }

    await feedback.addAdminNote(note, userId, isInternal);

    await feedback.populate("adminNotes.addedBy", "name");

    sendSuccessResponse(res, "Note added successfully", {
      note: feedback.adminNotes[feedback.adminNotes.length - 1],
    });
  } catch (error) {
    console.error("Add note error:", error);
    sendErrorResponse(res, "Failed to add note", 500);
  }
});

/**
 * @route   POST /api/feedback/:feedbackId/vote
 * @desc    Vote on feedback helpfulness
 * @access  Private
 */
router.post("/:feedbackId/vote", auth, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { vote } = req.body;
    const userId = req.user.id;

    if (!["helpful", "not_helpful"].includes(vote)) {
      return sendErrorResponse(res, "Invalid vote type", 400);
    }

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return sendErrorResponse(res, "Feedback not found", 404);
    }

    await feedback.addVote(userId, vote);

    sendSuccessResponse(res, "Vote recorded successfully", {
      votes: feedback.votes,
    });
  } catch (error) {
    console.error("Vote error:", error);
    sendErrorResponse(res, "Failed to record vote", 500);
  }
});

/**
 * @route   GET /api/feedback/analytics/summary
 * @desc    Get feedback analytics summary
 * @access  Private (Admin)
 */
router.get("/analytics/summary", auth, moderator, async (req, res) => {
  try {
    const { period = "30d", eventId } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const matchQuery = { createdAt: { $gte: startDate } };
    if (eventId) {
      matchQuery.event = new mongoose.Types.ObjectId(eventId);
    }

    // Get feedback statistics
    const stats = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          avgRating: { $avg: "$ratings.overall" },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
        },
      },
    ]);

    // Get top issues
    const topIssues = await Feedback.getTopIssues(5);

    // Get daily trend
    const dailyTrend = await Feedback.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          types: { $push: "$type" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    sendSuccessResponse(res, "Feedback analytics retrieved successfully", {
      stats,
      topIssues,
      dailyTrend,
      period,
      dateRange: { startDate, endDate: now },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    sendErrorResponse(res, "Failed to retrieve analytics", 500);
  }
});

module.exports = router;
