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
const multer = require("multer");
const path = require("path");

// Multer configuration for event poster uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/events"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "event-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Images Only!"));
    }
  },
});

// @route   GET /api/events
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
    const now = new Date();
    if (upcoming === "true") filter.startDate = { $gt: now };
    if (ongoing === "true") {
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }
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
    sendServerErrorResponse(res, "Error retrieving event");
  }
});

// @route   POST /api/events
router.post(
  "/",
  auth,
  moderator,
  upload.single("poster"),
  validateEventCreation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const eventData = { ...req.body, organizers: [req.user._id] };
      if (req.file) {
        eventData.poster = `/uploads/events/${req.file.filename}`;
      }
      const event = new Event(eventData);
      await event.save();
      const populatedEvent = await Event.findById(event._id).populate(
        "organizers",
        "name email"
      );
      sendCreatedResponse(res, "Event created successfully", populatedEvent);
    } catch (error) {
      console.error("Create event error:", error);
      sendServerErrorResponse(res, "Error creating event");
    }
  }
);

// @route   PUT /api/events/:id
router.put(
  "/:id",
  auth,
  moderator,
  upload.single("poster"),
  validateEventUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const eventToUpdate = await Event.findById(id);
      if (!eventToUpdate) return sendNotFoundResponse(res, "Event not found");

      const isOrganizer = eventToUpdate.organizers.some((orgId) =>
        orgId.equals(req.user._id)
      );
      if (req.user.role !== "admin" && !isOrganizer) {
        return sendForbiddenResponse(res, "Access denied.");
      }

      const updateData = { ...req.body };
      if (req.file) {
        updateData.poster = `/uploads/events/${req.file.filename}`;
      }
      Object.assign(eventToUpdate, updateData);
      const updatedEvent = await eventToUpdate.save();
      await updatedEvent.populate("organizers", "name email");
      sendSuccessResponse(res, "Event updated successfully", updatedEvent);
    } catch (error) {
      console.error("Update event error:", error);
      sendServerErrorResponse(res, "Error updating event");
    }
  }
);

// @route   DELETE /api/events/:id
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!event) return sendNotFoundResponse(res, "Event not found");
    sendSuccessResponse(res, "Event deleted successfully");
  } catch (error) {
    console.error("Delete event error:", error);
    sendServerErrorResponse(res, "Error deleting event");
  }
});

module.exports = router;
