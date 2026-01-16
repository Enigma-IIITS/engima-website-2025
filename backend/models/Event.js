const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot be more than 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: [
        "technical",
        "cultural",
        "sports",
        "workshop",
        "seminar",
        "competition",
        "other",
      ],
      default: "other",
    },
    eventType: {
      type: String,
      enum: ["online", "offline", "hybrid"],
      required: [true, "Event type is required"],
      default: "offline",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    registrationStartDate: {
      type: Date,
      default: Date.now,
    },
    registrationEndDate: {
      type: Date,
      required: [true, "Registration end date is required"],
    },
    venue: {
      type: String,
      required: function () {
        return this.eventType === "offline" || this.eventType === "hybrid";
      },
    },
    onlineLink: {
      type: String,
      required: function () {
        return this.eventType === "online" || this.eventType === "hybrid";
      },
    },
    maxParticipants: {
      type: Number,
      default: null, // null means unlimited
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    registrationFee: {
      type: Number,
      default: 0,
    },
    prizes: [
      {
        position: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: String,
      },
    ],
    organizers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    coordinators: [
      {
        name: {
          type: String,
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        phone: String,
      },
    ],
    requirements: [String],
    rules: [String],
    poster: {
      type: String, // URL to poster image
      default: "",
    },
    gallery: [String], // Array of image URLs
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    registrations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        registrationDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["registered", "confirmed", "cancelled", "attended"],
          default: "registered",
        },
        paymentStatus: {
          type: String,
          enum: ["pending", "completed", "failed", "refunded"],
          default: "pending",
        },
        paymentId: String,
        teamMembers: [String], // For team events
        additionalInfo: String,
      },
    ],
    feedback: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "ongoing", "completed", "cancelled"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
eventSchema.index({ category: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ isActive: 1 });
eventSchema.index({ isFeatured: 1 });
eventSchema.index({ "registrations.user": 1 });

// Virtual for registration status
eventSchema.virtual("isRegistrationOpen").get(function () {
  const now = new Date();
  return (
    now >= this.registrationStartDate &&
    now <= this.registrationEndDate &&
    this.status === "published" &&
    (this.maxParticipants === null ||
      this.currentParticipants < this.maxParticipants)
  );
});

// Virtual for event status based on dates
eventSchema.virtual("currentStatus").get(function () {
  const now = new Date();
  if (this.status === "cancelled") return "cancelled";
  if (this.status === "draft") return "draft";
  if (now < this.startDate) return "upcoming";
  if (now >= this.startDate && now <= this.endDate) return "ongoing";
  if (now > this.endDate) return "completed";
  return this.status;
});

// Method to register user for event
eventSchema.methods.registerUser = function (userId, additionalData = {}) {
  // Check if user is already registered
  const existingRegistration = this.registrations.find(
    (reg) => reg.user.toString() === userId.toString()
  );

  if (existingRegistration) {
    throw new Error("User is already registered for this event");
  }

  // Check if registration is open
  if (!this.isRegistrationOpen) {
    throw new Error("Registration is not open for this event");
  }

  // Add registration
  this.registrations.push({
    user: userId,
    ...additionalData,
  });

  this.currentParticipants += 1;
  return this.save();
};

// Method to cancel registration
eventSchema.methods.cancelRegistration = function (userId) {
  const registrationIndex = this.registrations.findIndex(
    (reg) => reg.user.toString() === userId.toString()
  );

  if (registrationIndex === -1) {
    throw new Error("User is not registered for this event");
  }

  this.registrations.splice(registrationIndex, 1);
  this.currentParticipants -= 1;
  return this.save();
};

// Ensure virtuals are included in JSON output
eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);
