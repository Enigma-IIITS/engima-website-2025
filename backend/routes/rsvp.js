const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const RSVP = require("../models/RSVP");
const Event = require("../models/Event");
const {
  auth,
  authorizeRoles,
  moderator,
  admin,
} = require("../middleware/auth");
const { validateRSVP, validateRSVPUpdate } = require("../utils/validation");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");

/**
 * @route   POST /api/rsvp
 * @desc    Register for an event
 * @access  Private
 */
router.post("/", auth, async (req, res) => {
  try {
    // Validate input
    const errors = validateRSVP(req.body);
    if (errors.length > 0) {
      return sendErrorResponse(res, "Validation failed", 400, errors);
    }

    const { eventId, contactInfo, additionalInfo } = req.body;
    const userId = req.user.id;

    // Check if event exists and is open for registration
    const event = await Event.findById(eventId);
    if (!event) {
      return sendErrorResponse(res, "Event not found", 404);
    }

    // Check if registration is open
    const now = new Date();
    if (now < event.registrationStartDate) {
      return sendErrorResponse(res, "Registration has not started yet", 400);
    }

    if (now > event.registrationEndDate) {
      return sendErrorResponse(res, "Registration has ended", 400);
    }

    // Check if user is already registered
    const existingRSVP = await RSVP.findOne({
      user: userId,
      event: eventId,
    });

    if (existingRSVP) {
      return sendErrorResponse(
        res,
        "You are already registered for this event",
        400
      );
    }

    // Check availability
    const availability = await RSVP.checkAvailability(eventId);
    if (!availability.available) {
      // Add to waitlist if event is full
      const rsvp = new RSVP({
        user: userId,
        event: eventId,
        contactInfo,
        additionalInfo,
        status: "waitlist",
        payment: {
          amount: event.registrationFee || 0,
        },
      });

      await rsvp.save();

      return sendSuccessResponse(
        res,
        "Added to waitlist - Event is full",
        {
          rsvp,
          position: "waitlist",
        },
        201
      );
    }

    // Create new RSVP
    const rsvp = new RSVP({
      user: userId,
      event: eventId,
      contactInfo,
      additionalInfo,
      status: event.registrationFee > 0 ? "pending" : "confirmed",
      payment: {
        amount: event.registrationFee || 0,
        status: event.registrationFee > 0 ? "pending" : "completed",
      },
    });

    if (event.registrationFee === 0) {
      rsvp.confirmedAt = new Date();
    }

    await rsvp.save();

    // Populate user and event details for response
    await rsvp.populate([
      { path: "user", select: "name email" },
      { path: "event", select: "title startDate venue registrationFee" },
    ]);

    sendSuccessResponse(res, "Successfully registered for event", rsvp, 201);
  } catch (error) {
    console.error("Registration error:", error);
    sendErrorResponse(res, "Failed to register for event", 500);
  }
});

/**
 * @route   GET /api/rsvp/my-registrations
 * @desc    Get current user's registrations
 * @access  Private
 */
router.get("/my-registrations", auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const registrations = await RSVP.getUserRegistrations(userId, status)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RSVP.countDocuments({
      user: userId,
      ...(status && { status }),
    });

    sendSuccessResponse(res, "Registrations retrieved successfully", {
      registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get registrations error:", error);
    sendErrorResponse(res, "Failed to retrieve registrations", 500);
  }
});

/**
 * @route   GET /api/rsvp/event/:eventId
 * @desc    Get all registrations for an event (Admin only)
 * @access  Private (Admin/Organizer)
 */
router.get("/event/:eventId", auth, moderator, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, page = 1, limit = 50, export: exportData } = req.query;

    // Check if user has permission to view this event's registrations
    const event = await Event.findById(eventId);
    if (!event) {
      return sendErrorResponse(res, "Event not found", 404);
    }

    // Check if user is organizer of this event
    if (
      req.user.role !== "admin" &&
      !event.organizers.includes(req.user.id) &&
      !event.coordinators.includes(req.user.id)
    ) {
      return sendErrorResponse(
        res,
        "Not authorized to view registrations for this event",
        403
      );
    }

    if (exportData === "true") {
      // Export all registrations without pagination
      const registrations = await RSVP.getEventRegistrations(eventId, status);

      // Format for CSV export
      const csvData = registrations.map((rsvp) => ({
        registrationId: rsvp.registrationId,
        name: rsvp.user.name,
        email: rsvp.contactInfo.email,
        phone: rsvp.contactInfo.phone,
        status: rsvp.status,
        registeredAt: rsvp.registeredAt,
        teamName: rsvp.additionalInfo?.teamName || "",
        specialNeeds: rsvp.additionalInfo?.specialNeeds || "",
        paymentStatus: rsvp.payment.status,
      }));

      return sendSuccessResponse(res, "Registrations exported successfully", {
        data: csvData,
        count: csvData.length,
      });
    }

    const registrations = await RSVP.getEventRegistrations(eventId, status)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RSVP.countDocuments({
      event: eventId,
      ...(status && { status }),
    });

    // Get registration statistics
    const stats = await RSVP.getRegistrationStats(eventId);

    sendSuccessResponse(res, "Event registrations retrieved successfully", {
      registrations,
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
    console.error("Get event registrations error:", error);
    sendErrorResponse(res, "Failed to retrieve event registrations", 500);
  }
});

/**
 * @route   PUT /api/rsvp/:rsvpId
 * @desc    Update registration details
 * @access  Private
 */
router.put("/:rsvpId", auth, async (req, res) => {
  try {
    // Validate input
    const errors = validateRSVPUpdate(req.body);
    if (errors.length > 0) {
      return sendErrorResponse(res, "Validation failed", 400, errors);
    }

    const { rsvpId } = req.params;
    const userId = req.user.id;

    const rsvp = await RSVP.findById(rsvpId);
    if (!rsvp) {
      return sendErrorResponse(res, "Registration not found", 404);
    }

    // Check if user owns this registration or is admin/organizer
    if (!rsvp.user.equals(userId) && req.user.role !== "admin") {
      const event = await Event.findById(rsvp.event);
      if (
        !event.organizers.includes(userId) &&
        !event.coordinators.includes(userId)
      ) {
        return sendErrorResponse(
          res,
          "Not authorized to update this registration",
          403
        );
      }
    }

    // Check if registration can be updated
    if (rsvp.status === "cancelled") {
      return sendErrorResponse(
        res,
        "Cannot update cancelled registration",
        400
      );
    }

    const { contactInfo, additionalInfo, status } = req.body;

    // Update fields
    if (contactInfo) {
      rsvp.contactInfo = { ...rsvp.contactInfo, ...contactInfo };
    }

    if (additionalInfo) {
      rsvp.additionalInfo = { ...rsvp.additionalInfo, ...additionalInfo };
    }

    // Only admins and organizers can update status
    if (
      status &&
      (req.user.role === "admin" ||
        (rsvp.user.equals(userId) && status === "cancelled"))
    ) {
      rsvp.status = status;

      if (status === "confirmed") {
        rsvp.confirmedAt = new Date();
      } else if (status === "cancelled") {
        rsvp.cancelledAt = new Date();
      }
    }

    await rsvp.save();

    await rsvp.populate([
      { path: "user", select: "name email" },
      { path: "event", select: "title startDate venue" },
    ]);

    sendSuccessResponse(res, "Registration updated successfully", rsvp);
  } catch (error) {
    console.error("Update registration error:", error);
    sendErrorResponse(res, "Failed to update registration", 500);
  }
});

/**
 * @route   DELETE /api/rsvp/:rsvpId
 * @desc    Cancel registration
 * @access  Private
 */
router.delete("/:rsvpId", auth, async (req, res) => {
  try {
    const { rsvpId } = req.params;
    const userId = req.user.id;

    const rsvp = await RSVP.findById(rsvpId);
    if (!rsvp) {
      return sendErrorResponse(res, "Registration not found", 404);
    }

    // Check if user owns this registration
    if (!rsvp.user.equals(userId) && req.user.role !== "admin") {
      return sendErrorResponse(
        res,
        "Not authorized to cancel this registration",
        403
      );
    }

    // Check if registration can be cancelled
    if (rsvp.status === "cancelled") {
      return sendErrorResponse(res, "Registration is already cancelled", 400);
    }

    if (rsvp.status === "attended") {
      return sendErrorResponse(
        res,
        "Cannot cancel registration after attendance",
        400
      );
    }

    // Cancel the registration
    await rsvp.cancel();

    // If there's a waitlist, promote the next person
    const waitlistRSVP = await RSVP.findOne({
      event: rsvp.event,
      status: "waitlist",
    }).sort({ registeredAt: 1 });

    if (waitlistRSVP) {
      await waitlistRSVP.confirm();
      // TODO: Send notification to waitlisted user
    }

    sendSuccessResponse(res, "Registration cancelled successfully", {
      rsvp,
      waitlistPromoted: !!waitlistRSVP,
    });
  } catch (error) {
    console.error("Cancel registration error:", error);
    sendErrorResponse(res, "Failed to cancel registration", 500);
  }
});

/**
 * @route   POST /api/rsvp/:rsvpId/check-in
 * @desc    Check in participant for event
 * @access  Private (Admin/Organizer)
 */
router.post("/:rsvpId/check-in", auth, moderator, async (req, res) => {
  try {
    const { rsvpId } = req.params;
    const { checkInCode } = req.body;

    let rsvp;

    if (checkInCode) {
      // Find by check-in code
      rsvp = await RSVP.findOne({ checkInCode });
    } else {
      // Find by RSVP ID
      rsvp = await RSVP.findById(rsvpId);
    }

    if (!rsvp) {
      return sendErrorResponse(res, "Registration not found", 404);
    }

    // Check if already checked in
    if (rsvp.status === "attended") {
      return sendErrorResponse(res, "Participant already checked in", 400);
    }

    // Check if registration is confirmed
    if (rsvp.status !== "confirmed") {
      return sendErrorResponse(
        res,
        "Registration must be confirmed before check-in",
        400
      );
    }

    // Mark as attended
    await rsvp.markAttended();

    await rsvp.populate([
      { path: "user", select: "name email" },
      { path: "event", select: "title startDate venue" },
    ]);

    sendSuccessResponse(res, "Participant checked in successfully", rsvp);
  } catch (error) {
    console.error("Check-in error:", error);
    sendErrorResponse(res, "Failed to check in participant", 500);
  }
});

/**
 * @route   GET /api/rsvp/:rsvpId/qr-code
 * @desc    Get QR code for registration
 * @access  Private
 */
router.get("/:rsvpId/qr-code", auth, async (req, res) => {
  try {
    const { rsvpId } = req.params;
    const userId = req.user.id;

    const rsvp = await RSVP.findById(rsvpId);
    if (!rsvp) {
      return sendErrorResponse(res, "Registration not found", 404);
    }

    // Check if user owns this registration
    if (!rsvp.user.equals(userId)) {
      return sendErrorResponse(res, "Not authorized to view this QR code", 403);
    }

    // Generate QR code data
    const qrData = {
      registrationId: rsvp.registrationId,
      checkInCode: rsvp.checkInCode,
      event: rsvp.event,
      user: rsvp.user,
    };

    sendSuccessResponse(res, "QR code data retrieved successfully", {
      qrData,
      checkInCode: rsvp.checkInCode,
    });
  } catch (error) {
    console.error("QR code error:", error);
    sendErrorResponse(res, "Failed to generate QR code", 500);
  }
});

/**
 * @route   GET /api/rsvp/stats/:eventId
 * @desc    Get registration statistics for an event
 * @access  Private (Admin/Organizer)
 */
router.get("/stats/:eventId", auth, moderator, async (req, res) => {
  try {
    const { eventId } = req.params;

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
        "Not authorized to view statistics for this event",
        403
      );
    }

    const stats = await RSVP.getRegistrationStats(eventId);
    const availability = await RSVP.checkAvailability(eventId);

    // Get daily registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = await RSVP.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
          registeredAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$registeredAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    sendSuccessResponse(res, "Event statistics retrieved successfully", {
      stats,
      availability,
      dailyTrend,
      event: {
        title: event.title,
        maxParticipants: event.maxParticipants,
        registrationFee: event.registrationFee,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    sendErrorResponse(res, "Failed to retrieve event statistics", 500);
  }
});

module.exports = router;
