const mongoose = require("mongoose");

/**
 * RSVP/Registration Schema
 * Handles event registrations with comprehensive tracking
 */
const rsvpSchema = new mongoose.Schema(
  {
    // Core registration details
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for registration"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required for registration"],
    },

    // Registration status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "waitlist",
        "attended",
        "no-show",
      ],
      default: "pending",
    },

    // Contact information (may differ from user profile)
    contactInfo: {
      email: {
        type: String,
        required: [true, "Email is required"],
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please enter a valid email",
        ],
      },
      phone: {
        type: String,
        validate: {
          validator: function (v) {
            return /\d{10}/.test(v);
          },
          message: "Phone number must be 10 digits",
        },
      },
      emergencyContact: {
        name: String,
        phone: String,
        relation: String,
      },
    },

    // Additional registration data
    additionalInfo: {
      // Team information for team events
      teamName: String,
      teamMembers: [
        {
          name: {
            type: String,
            required: function () {
              return this.teamName;
            },
          },
          email: String,
          phone: String,
          role: String,
        },
      ],

      // Dietary restrictions, special needs
      dietaryRestrictions: [String],
      specialNeeds: String,

      // T-shirt size, accommodation needs
      tshirtSize: {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL"],
      },
      accommodationNeeded: {
        type: Boolean,
        default: false,
      },

      // Custom fields for specific events
      customFields: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    },

    // Payment information
    payment: {
      amount: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending",
      },
      transactionId: String,
      paymentMethod: String,
      paidAt: Date,
      refundedAt: Date,
      refundAmount: Number,
    },

    // Timestamps and tracking
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: Date,
    cancelledAt: Date,
    attendedAt: Date,

    // QR code for check-in
    qrCode: String,
    checkInCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Notes and admin comments
    notes: String,
    adminNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Source tracking
    source: {
      type: String,
      enum: ["website", "mobile_app", "social_media", "word_of_mouth", "other"],
      default: "website",
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
rsvpSchema.index({ user: 1, event: 1 }, { unique: true }); // Prevent duplicate registrations
rsvpSchema.index({ event: 1, status: 1 });
rsvpSchema.index({ event: 1, registeredAt: 1 });
rsvpSchema.index({ checkInCode: 1 }, { sparse: true });
rsvpSchema.index({ "payment.transactionId": 1 }, { sparse: true });

// Virtual for registration ID
rsvpSchema.virtual("registrationId").get(function () {
  return `REG-${this.event
    .toString()
    .slice(-6)
    .toUpperCase()}-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Virtual for days since registration
rsvpSchema.virtual("daysSinceRegistration").get(function () {
  return Math.floor((Date.now() - this.registeredAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate check-in code
rsvpSchema.pre("save", function (next) {
  if (this.isNew && !this.checkInCode) {
    this.checkInCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Pre-save middleware to update event participant count
rsvpSchema.pre("save", async function (next) {
  if (this.isModified("status")) {
    const Event = mongoose.model("Event");
    const event = await Event.findById(this.event);

    if (event) {
      // Recalculate participant count
      const confirmedCount = await this.constructor.countDocuments({
        event: this.event,
        status: { $in: ["confirmed", "attended"] },
      });

      event.currentParticipants = confirmedCount;
      await event.save();
    }
  }
  next();
});

// Instance methods
rsvpSchema.methods.confirm = function () {
  this.status = "confirmed";
  this.confirmedAt = new Date();
  return this.save();
};

rsvpSchema.methods.cancel = function () {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  return this.save();
};

rsvpSchema.methods.markAttended = function () {
  this.status = "attended";
  this.attendedAt = new Date();
  return this.save();
};

rsvpSchema.methods.addAdminNote = function (note, adminId) {
  this.adminNotes.push({
    note,
    addedBy: adminId,
  });
  return this.save();
};

// Static methods
rsvpSchema.statics.getEventRegistrations = function (eventId, status = null) {
  const query = { event: eventId };
  if (status) query.status = status;

  return this.find(query)
    .populate("user", "name email phone studentId")
    .populate("event", "title startDate venue")
    .sort({ registeredAt: -1 });
};

rsvpSchema.statics.getUserRegistrations = function (userId, status = null) {
  const query = { user: userId };
  if (status) query.status = status;

  return this.find(query)
    .populate("event", "title startDate venue category eventType")
    .sort({ registeredAt: -1 });
};

rsvpSchema.statics.getRegistrationStats = async function (eventId) {
  const stats = await this.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    waitlist: 0,
    attended: 0,
    noShow: 0,
  };

  stats.forEach((stat) => {
    result[stat._id.replace("-", "")] = stat.count;
    result.total += stat.count;
  });

  return result;
};

rsvpSchema.statics.checkAvailability = async function (eventId) {
  const Event = mongoose.model("Event");
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (!event.maxParticipants) {
    return { available: true, remaining: Infinity };
  }

  const confirmedCount = await this.countDocuments({
    event: eventId,
    status: { $in: ["confirmed", "attended"] },
  });

  const remaining = event.maxParticipants - confirmedCount;

  return {
    available: remaining > 0,
    remaining,
    total: event.maxParticipants,
    confirmed: confirmedCount,
  };
};

module.exports = mongoose.model("RSVP", rsvpSchema);
