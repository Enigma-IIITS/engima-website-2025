const mongoose = require("mongoose");

/**
 * Showcase Schema
 * Handles showcasing of member projects, blogs, demos, and achievements
 */
const showcaseSchema = new mongoose.Schema(
  {
    // Core showcase details
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },

    // Basic information
    title: {
      type: String,
      required: [true, "Showcase title is required"],
      trim: true,
      maxlength: [150, "Title cannot be more than 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },

    shortDescription: {
      type: String,
      maxlength: [300, "Short description cannot be more than 300 characters"],
    },

    // Showcase type and category
    type: {
      type: String,
      enum: [
        "project",
        "blog",
        "demo",
        "research",
        "achievement",
        "tutorial",
        "open_source",
      ],
      required: [true, "Showcase type is required"],
    },

    category: {
      type: String,
      enum: [
        "web_development",
        "mobile_development",
        "machine_learning",
        "artificial_intelligence",
        "data_science",
        "blockchain",
        "cybersecurity",
        "game_development",
        "iot",
        "robotics",
        "cloud_computing",
        "devops",
        "ui_ux_design",
        "research",
        "competitive_programming",
        "open_source",
        "other",
      ],
      required: [true, "Category is required"],
    },

    // Technology stack and skills
    technologies: [
      {
        name: {
          type: String,
          required: true,
        },
        proficiency: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
          default: "intermediate",
        },
      },
    ],

    skills: [String], // Skills demonstrated/learned

    // Project details
    status: {
      type: String,
      enum: ["concept", "in_progress", "completed", "deployed", "archived"],
      default: "in_progress",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: Date,

    duration: String, // e.g., "3 months", "1 week"

    // Links and resources
    links: {
      github: String,
      live: String,
      demo: String,
      documentation: String,
      blog: String,
      video: String,
      presentation: String,
      publication: String,
    },

    // Multimedia content
    media: {
      // Primary image/thumbnail
      thumbnail: {
        url: String,
        filename: String,
        size: Number,
        mimetype: String,
      },

      // Image gallery
      images: [
        {
          url: String,
          filename: String,
          caption: String,
          size: Number,
          mimetype: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      // Videos
      videos: [
        {
          url: String,
          filename: String,
          title: String,
          duration: Number, // in seconds
          size: Number,
          mimetype: String,
          thumbnail: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      // Documents/files
      documents: [
        {
          url: String,
          filename: String,
          originalName: String,
          description: String,
          size: Number,
          mimetype: String,
          downloadCount: {
            type: Number,
            default: 0,
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Collaboration and team
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: String,
        contribution: String,
      },
    ],

    teamSize: {
      type: Number,
      default: 1,
    },

    isTeamProject: {
      type: Boolean,
      default: false,
    },

    // Achievement and recognition
    achievements: [
      {
        title: String,
        description: String,
        date: Date,
        organization: String,
        certificate: String, // URL to certificate
        rank: String, // e.g., "1st Place", "Top 10"
      },
    ],

    awards: [
      {
        name: String,
        organization: String,
        date: Date,
        description: String,
        amount: Number, // Prize money if any
        certificate: String,
      },
    ],

    // Engagement metrics
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      downloads: {
        type: Number,
        default: 0,
      },
      stars: {
        type: Number,
        default: 0,
      },
      forks: {
        type: Number,
        default: 0,
      },
    },

    // User interactions
    interactions: {
      likedBy: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      comments: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          content: {
            type: String,
            required: true,
            maxlength: [500, "Comment cannot be more than 500 characters"],
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          replies: [
            {
              user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
              },
              content: {
                type: String,
                required: true,
                maxlength: [300, "Reply cannot be more than 300 characters"],
              },
              createdAt: {
                type: Date,
                default: Date.now,
              },
            },
          ],
        },
      ],
    },

    // Visibility and moderation
    visibility: {
      type: String,
      enum: ["public", "members_only", "private", "draft"],
      default: "draft",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    featuredAt: Date,

    moderation: {
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "flagged"],
        default: "pending",
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedAt: Date,
      reviewNotes: String,
      flaggedReasons: [String],
    },

    // SEO and discoverability
    seo: {
      slug: {
        type: String,
        unique: true,
        sparse: true,
      },
      metaDescription: String,
      keywords: [String],
    },

    // Tags for filtering and search
    tags: [String],

    // Analytics tracking
    analytics: {
      lastViewedAt: Date,
      viewHistory: [
        {
          date: Date,
          count: Number,
        },
      ],
      referralSources: [
        {
          source: String,
          count: Number,
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
showcaseSchema.index({ owner: 1, visibility: 1 });
showcaseSchema.index({ type: 1, category: 1 });
showcaseSchema.index({ status: 1, createdAt: -1 });
showcaseSchema.index({ featured: 1, createdAt: -1 });
showcaseSchema.index({ "moderation.status": 1 });
showcaseSchema.index({ tags: 1 });
showcaseSchema.index({ technologies: 1 });
showcaseSchema.index({ "seo.slug": 1 });
showcaseSchema.index({ "metrics.views": -1 });

// Virtual for showcase URL
showcaseSchema.virtual("url").get(function () {
  return `/showcase/${this.seo.slug || this._id}`;
});

// Virtual for total engagement score
showcaseSchema.virtual("engagementScore").get(function () {
  const { views, likes, shares, downloads, stars } = this.metrics;
  return views * 1 + likes * 3 + shares * 5 + downloads * 2 + stars * 4;
});

// Virtual for project duration in readable format
showcaseSchema.virtual("durationFormatted").get(function () {
  if (!this.endDate || !this.startDate) return null;

  const diffTime = Math.abs(this.endDate - this.startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays} days`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
  return `${Math.floor(diffDays / 365)} years`;
});

// Pre-save middleware to generate slug
showcaseSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("title")) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure slug uniqueness
    const timestamp = Date.now().toString(36);
    this.seo.slug += `-${timestamp}`;
  }
  next();
});

// Pre-save middleware to update metrics
showcaseSchema.pre("save", function (next) {
  if (this.isModified("interactions.likedBy")) {
    this.metrics.likes = this.interactions.likedBy.length;
  }
  next();
});

// Instance methods
showcaseSchema.methods.incrementViews = function () {
  this.metrics.views += 1;
  this.analytics.lastViewedAt = new Date();

  // Update daily view history
  const today = new Date().toDateString();
  const todayHistory = this.analytics.viewHistory.find(
    (h) => h.date.toDateString() === today
  );

  if (todayHistory) {
    todayHistory.count += 1;
  } else {
    this.analytics.viewHistory.push({
      date: new Date(),
      count: 1,
    });
  }

  return this.save();
};

showcaseSchema.methods.like = function (userId) {
  if (!this.interactions.likedBy.includes(userId)) {
    this.interactions.likedBy.push(userId);
    this.metrics.likes += 1;
  }
  return this.save();
};

showcaseSchema.methods.unlike = function (userId) {
  this.interactions.likedBy = this.interactions.likedBy.filter(
    (id) => !id.equals(userId)
  );
  this.metrics.likes = this.interactions.likedBy.length;
  return this.save();
};

showcaseSchema.methods.addComment = function (userId, content) {
  this.interactions.comments.push({
    user: userId,
    content,
  });
  return this.save();
};

showcaseSchema.methods.approve = function (reviewerId, notes = "") {
  this.moderation.status = "approved";
  this.moderation.reviewedBy = reviewerId;
  this.moderation.reviewedAt = new Date();
  this.moderation.reviewNotes = notes;

  if (this.visibility === "draft") {
    this.visibility = "public";
  }

  return this.save();
};

showcaseSchema.methods.feature = function () {
  this.featured = true;
  this.featuredAt = new Date();
  return this.save();
};

// Static methods
showcaseSchema.statics.getFeatured = function (limit = 6) {
  return this.find({
    featured: true,
    visibility: "public",
    "moderation.status": "approved",
  })
    .populate("owner", "name profilePicture year domain")
    .sort({ featuredAt: -1 })
    .limit(limit);
};

showcaseSchema.statics.getByCategory = function (category, limit = 12) {
  return this.find({
    category,
    visibility: "public",
    "moderation.status": "approved",
  })
    .populate("owner", "name profilePicture year domain")
    .sort({ createdAt: -1 })
    .limit(limit);
};

showcaseSchema.statics.getTrending = function (days = 7, limit = 10) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return this.find({
    visibility: "public",
    "moderation.status": "approved",
    "analytics.lastViewedAt": { $gte: cutoffDate },
  })
    .populate("owner", "name profilePicture year domain")
    .sort({ "metrics.views": -1, createdAt: -1 })
    .limit(limit);
};

showcaseSchema.statics.search = function (query, filters = {}) {
  const searchQuery = {
    visibility: "public",
    "moderation.status": "approved",
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { tags: { $regex: query, $options: "i" } },
      { "technologies.name": { $regex: query, $options: "i" } },
    ],
  };

  // Apply filters
  if (filters.type) searchQuery.type = filters.type;
  if (filters.category) searchQuery.category = filters.category;
  if (filters.status) searchQuery.status = filters.status;
  if (filters.technologies) {
    searchQuery["technologies.name"] = { $in: filters.technologies };
  }

  return this.find(searchQuery)
    .populate("owner", "name profilePicture year domain")
    .sort({ "metrics.views": -1, createdAt: -1 });
};

showcaseSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $match: {
        visibility: "public",
        "moderation.status": "approved",
      },
    },
    {
      $group: {
        _id: {
          type: "$type",
          category: "$category",
        },
        count: { $sum: 1 },
        totalViews: { $sum: "$metrics.views" },
        totalLikes: { $sum: "$metrics.likes" },
      },
    },
  ]);

  return stats;
};

module.exports = mongoose.model("Showcase", showcaseSchema);
