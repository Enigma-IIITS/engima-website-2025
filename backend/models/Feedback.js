const mongoose = require("mongoose");

/**
 * Feedback Schema
 * Handles feedback collection for events, general feedback, and suggestions
 */
const feedbackSchema = new mongoose.Schema(
  {
    // Core feedback details
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for feedback"],
    },

    // Feedback type and context
    type: {
      type: String,
      enum: [
        "event",
        "general",
        "website",
        "suggestion",
        "complaint",
        "bug_report",
      ],
      required: [true, "Feedback type is required"],
      default: "general",
    },

    // Related event (if applicable)
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: function () {
        return this.type === "event";
      },
    },

    // Feedback content
    title: {
      type: String,
      required: [true, "Feedback title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },

    content: {
      type: String,
      required: [true, "Feedback content is required"],
      maxlength: [2000, "Content cannot be more than 2000 characters"],
    },

    // Ratings (for event feedback)
    ratings: {
      overall: {
        type: Number,
        min: 1,
        max: 5,
        required: function () {
          return this.type === "event";
        },
      },
      organization: {
        type: Number,
        min: 1,
        max: 5,
      },
      content: {
        type: Number,
        min: 1,
        max: 5,
      },
      venue: {
        type: Number,
        min: 1,
        max: 5,
      },
      speakers: {
        type: Number,
        min: 1,
        max: 5,
      },
      networking: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    // Categorical feedback
    categories: {
      // What they liked
      liked: [String],

      // What could be improved
      improvements: [String],

      // Suggestions for future events
      suggestions: [String],

      // Areas of interest
      interests: [String],
    },

    // Priority and urgency
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    urgency: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Status and resolution
    status: {
      type: String,
      enum: [
        "pending",
        "under_review",
        "in_progress",
        "resolved",
        "closed",
        "rejected",
      ],
      default: "pending",
    },

    resolution: {
      status: {
        type: String,
        enum: ["resolved", "partially_resolved", "not_applicable", "duplicate"],
      },
      notes: String,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: Date,
      actionsTaken: [String],
    },

    // Contact preferences
    contactPreferences: {
      followUp: {
        type: Boolean,
        default: true,
      },
      anonymous: {
        type: Boolean,
        default: false,
      },
      preferredMethod: {
        type: String,
        enum: ["email", "phone", "none"],
        default: "email",
      },
    },

    // Additional metadata
    metadata: {
      // Device/browser information
      userAgent: String,
      platform: String,

      // Page/section where feedback was submitted
      page: String,
      section: String,

      // Session information
      sessionId: String,

      // Location if relevant
      location: String,
    },

    // Attachments (screenshots, files, etc.)
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Admin notes and comments
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
        isInternal: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Tags for categorization
    tags: [String],

    // Related feedback items
    relatedFeedback: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Feedback",
      },
    ],

    // Voting/helpfulness (for public feedback)
    votes: {
      helpful: {
        type: Number,
        default: 0,
      },
      notHelpful: {
        type: Number,
        default: 0,
      },
      voters: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          vote: {
            type: String,
            enum: ["helpful", "not_helpful"],
          },
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
feedbackSchema.index({ user: 1, type: 1 });
feedbackSchema.index({ event: 1, type: 1 });
feedbackSchema.index({ status: 1, priority: 1 });
feedbackSchema.index({ type: 1, createdAt: -1 });
feedbackSchema.index({ tags: 1 });
feedbackSchema.index({ "ratings.overall": 1 });

// Virtual for feedback ID
feedbackSchema.virtual("feedbackId").get(function () {
  return `FB-${this.type.toUpperCase()}-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Virtual for average rating
feedbackSchema.virtual("averageRating").get(function () {
  if (!this.ratings || this.type !== "event") return null;

  const ratings = Object.values(this.ratings).filter(
    (rating) => typeof rating === "number" && rating > 0
  );

  if (ratings.length === 0) return null;

  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
});

// Virtual for days since submission
feedbackSchema.virtual("daysSinceSubmission").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to set priority based on type and content
feedbackSchema.pre("save", function (next) {
  if (this.isNew) {
    // Auto-set priority based on type
    if (this.type === "complaint" || this.type === "bug_report") {
      this.priority = "high";
    }

    // Auto-tag based on content
    const content = this.content.toLowerCase();
    const autoTags = [];

    if (content.includes("urgent") || content.includes("critical")) {
      this.urgency = "urgent";
      autoTags.push("urgent");
    }

    if (content.includes("bug") || content.includes("error")) {
      autoTags.push("technical");
    }

    if (content.includes("suggestion") || content.includes("feature")) {
      autoTags.push("enhancement");
    }

    this.tags = [...new Set([...this.tags, ...autoTags])];
  }

  next();
});

// Instance methods
feedbackSchema.methods.resolve = function (
  resolvedBy,
  notes,
  actionsTaken = []
) {
  this.status = "resolved";
  this.resolution = {
    status: "resolved",
    notes,
    resolvedBy,
    resolvedAt: new Date(),
    actionsTaken,
  };
  return this.save();
};

feedbackSchema.methods.addAdminNote = function (
  note,
  adminId,
  isInternal = true
) {
  this.adminNotes.push({
    note,
    addedBy: adminId,
    isInternal,
  });
  return this.save();
};

feedbackSchema.methods.addVote = function (userId, voteType) {
  // Remove any existing vote from this user
  this.votes.voters = this.votes.voters.filter(
    (voter) => !voter.user.equals(userId)
  );

  // Add new vote
  this.votes.voters.push({
    user: userId,
    vote: voteType,
  });

  // Recalculate vote counts
  this.votes.helpful = this.votes.voters.filter(
    (v) => v.vote === "helpful"
  ).length;
  this.votes.notHelpful = this.votes.voters.filter(
    (v) => v.vote === "not_helpful"
  ).length;

  return this.save();
};

// Static methods
feedbackSchema.statics.getEventFeedback = function (eventId) {
  return this.find({ event: eventId, type: "event" })
    .populate("user", "name email")
    .populate("event", "title startDate")
    .sort({ createdAt: -1 });
};

feedbackSchema.statics.getFeedbackByType = function (type, status = null) {
  const query = { type };
  if (status) query.status = status;

  return this.find(query)
    .populate("user", "name email")
    .populate("event", "title startDate")
    .sort({ createdAt: -1 });
};

feedbackSchema.statics.getFeedbackStats = async function (eventId = null) {
  const matchStage = eventId ? { event: mongoose.Types.ObjectId(eventId) } : {};

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: "$type",
          status: "$status",
        },
        count: { $sum: 1 },
        avgRating: { $avg: "$ratings.overall" },
      },
    },
    {
      $group: {
        _id: "$_id.type",
        statusCounts: {
          $push: {
            status: "$_id.status",
            count: "$count",
          },
        },
        averageRating: { $avg: "$avgRating" },
        totalCount: { $sum: "$count" },
      },
    },
  ]);

  return stats;
};

feedbackSchema.statics.getTopIssues = function (limit = 10) {
  return this.aggregate([
    {
      $match: {
        type: { $in: ["complaint", "bug_report"] },
        status: { $ne: "resolved" },
      },
    },
    {
      $group: {
        _id: "$title",
        count: { $sum: 1 },
        priority: { $first: "$priority" },
        latestSubmission: { $max: "$createdAt" },
      },
    },
    { $sort: { count: -1, latestSubmission: -1 } },
    { $limit: limit },
  ]);
};

feedbackSchema.statics.getSentimentAnalysis = async function (eventId) {
  const feedbacks = await this.find({
    event: eventId,
    type: "event",
  }).select("content ratings categories");

  // Simple sentiment analysis based on ratings and keywords
  let positive = 0;
  let negative = 0;
  let neutral = 0;

  feedbacks.forEach((feedback) => {
    const rating = feedback.ratings?.overall || 3;
    const content = feedback.content.toLowerCase();

    // Keyword-based sentiment
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "love",
      "perfect",
    ];
    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "hate",
      "worst",
      "disappointing",
    ];

    const positiveCount = positiveWords.filter((word) =>
      content.includes(word)
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      content.includes(word)
    ).length;

    if (rating >= 4 || positiveCount > negativeCount) {
      positive++;
    } else if (rating <= 2 || negativeCount > positiveCount) {
      negative++;
    } else {
      neutral++;
    }
  });

  const total = positive + negative + neutral;

  return {
    positive: {
      count: positive,
      percentage: total ? (positive / total) * 100 : 0,
    },
    negative: {
      count: negative,
      percentage: total ? (negative / total) * 100 : 0,
    },
    neutral: {
      count: neutral,
      percentage: total ? (neutral / total) * 100 : 0,
    },
    total,
  };
};

module.exports = mongoose.model("Feedback", feedbackSchema);
