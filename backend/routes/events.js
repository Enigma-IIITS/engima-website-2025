const express = require("express");
const Event = require("../models/Event");
const { auth, admin, moderator } = require("../middleware/auth");
const {
  validateEventCreation,
  validateEventUpdate,
  handleValidationErrors,
} = require("../utils/validation");
const {
  sendSuccessResponse,
  sendCreatedResponse,
  sendErrorResponse,
  sendNotFoundResponse,
  sendForbiddenResponse,
  sendServerErrorResponse,
  getPaginationData,
  buildPaginationResponse,
} = require("../utils/response");
const router = express.Router();

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationData(req);
    const {
      category,
      eventType,
      status,
      isFeatured,
      search,
      upcoming,
      ongoing,
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (eventType) filter.eventType = eventType;
    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Date-based filters
    const now = new Date();
    if (upcoming === "true") {
      filter.startDate = { $gt: now };
    }
    if (ongoing === "true") {
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }

    // Get events with pagination
    const events = await Event.find(filter)
      .populate("organizers", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ startDate: 1 });

    const totalCount = await Event.countDocuments(filter);

    const response = buildPaginationResponse(events, totalCount, page, limit);
    sendSuccessResponse(res, "Events retrieved successfully", response);
  } catch (error) {
    console.error("Get events error:", error);
    sendServerErrorResponse(res, "Error retrieving events");
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate("organizers", "name email")
      .populate("registrations.user", "name email");

    if (!event || !event.isActive) {
      return sendNotFoundResponse(res, "Event not found");
    }

    sendSuccessResponse(res, "Event retrieved successfully", event);
  } catch (error) {
    console.error("Get event error:", error);
    if (error.name === "CastError") {
      return sendErrorResponse(res, "Invalid event ID format");
    }
    sendServerErrorResponse(res, "Error retrieving event");
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private/Admin
router.post(
  "/",
  auth,
  moderator,
  validateEventCreation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const eventData = {
        ...req.body,
        organizers: [req.user._id], // Add current user as organizer
      };

      const event = new Event(eventData);
      await event.save();

      const populatedEvent = await Event.findById(event._id).populate(
        "organizers",
        "name email"
      );

      sendCreatedResponse(res, "Event created successfully", populatedEvent);
    } catch (error) {
      console.error("Create event error:", error);
      if (error.name === "ValidationError") {
        return sendErrorResponse(res, error.message);
      }
      sendServerErrorResponse(res, "Error creating event");
    }
  }
);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private/Admin
router.put(
  "/:id",
  auth,
  moderator,
  validateEventUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findById(id);
      if (!event) {
        return sendNotFoundResponse(res, "Event not found");
      }

      // Check if user is organizer or admin
      const isOrganizer = event.organizers.some(
        (organizerId) => organizerId.toString() === req.user._id.toString()
      );

      if (req.user.role !== "admin" && !isOrganizer) {
        return sendForbiddenResponse(
          res,
          "Access denied. Must be event organizer or admin"
        );
      }

      const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      }).populate("organizers", "name email");

      sendSuccessResponse(res, "Event updated successfully", updatedEvent);
    } catch (error) {
      console.error("Update event error:", error);
      if (error.name === "CastError") {
        return sendErrorResponse(res, "Invalid event ID format");
      }
      if (error.name === "ValidationError") {
        return sendErrorResponse(res, error.message);
      }
      sendServerErrorResponse(res, "Error updating event");
    }
  }
);

// @route   DELETE /api/events/:id
// @desc    Delete event (soft delete)
// @access  Private/Admin
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!event) {
      return sendNotFoundResponse(res, "Event not found");
    }

    sendSuccessResponse(res, "Event deleted successfully");
  } catch (error) {
    console.error("Delete event error:", error);
    if (error.name === "CastError") {
      return sendErrorResponse(res, "Invalid event ID format");
    }
    sendServerErrorResponse(res, "Error deleting event");
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post("/:id/register", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { teamMembers, additionalInfo } = req.body;

    const event = await Event.findById(id);
    if (!event || !event.isActive) {
      return sendNotFoundResponse(res, "Event not found");
    }

    await event.registerUser(req.user._id, {
      teamMembers,
      additionalInfo,
    });

    sendSuccessResponse(res, "Successfully registered for event");
  } catch (error) {
    console.error("Event registration error:", error);
    if (error.message.includes("already registered")) {
      return sendErrorResponse(res, error.message, 409);
    }
    if (error.message.includes("not open")) {
      return sendErrorResponse(res, error.message, 400);
    }
    sendServerErrorResponse(res, "Error registering for event");
  }
});

// @route   DELETE /api/events/:id/register
// @desc    Cancel event registration
// @access  Private
router.delete("/:id/register", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return sendNotFoundResponse(res, "Event not found");
    }

    await event.cancelRegistration(req.user._id);

    sendSuccessResponse(res, "Registration cancelled successfully");
  } catch (error) {
    console.error("Cancel registration error:", error);
    if (error.message.includes("not registered")) {
      return sendErrorResponse(res, error.message, 400);
    }
    sendServerErrorResponse(res, "Error cancelling registration");
  }
});

module.exports = router;
