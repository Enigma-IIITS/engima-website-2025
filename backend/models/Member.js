const mongoose = require("mongoose");

/**
 * Domain Schema
 * Handles different domains/departments within the organization
 */
const domainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Domain name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Domain name cannot be more than 100 characters"],
    },

    code: {
      type: String,
      required: [true, "Domain code is required"],
      unique: true,
      uppercase: true,
      match: [/^[A-Z]{2,10}$/, "Domain code must be 2-10 uppercase letters"],
    },

    description: {
      type: String,
      required: [true, "Domain description is required"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },

    icon: String, // Icon class or URL
    color: String, // Hex color code for theming

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Member Schema
 * Handles detailed member information including roles, projects, and achievements
 */
const memberSchema = new mongoose.Schema(
  {
    // Reference to User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },

    // Basic Information
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, "Display name cannot be more than 100 characters"],
    },

    tagline: {
      type: String,
      maxlength: [200, "Tagline cannot be more than 200 characters"],
    },

    bio: {
      type: String,
      maxlength: [2000, "Bio cannot be more than 2000 characters"],
    },

    // Role and Position
    roles: [
      {
        position: {
          type: String,
          enum: [
            "president",
            "vice_president",
            "secretary",
            "treasurer",
            "domain_head",
            "assistant_domain_head",
            "core_member",
            "team_lead",
            "member",
            "mentor",
            "alumni",
          ],
          required: true,
        },
        domain: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Domain",
          required: true,
        },
        startDate: {
          type: Date,
          default: Date.now,
        },
        endDate: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
        responsibilities: [String],
        achievements: [String],
      },
    ],

    // Current primary role (computed)
    primaryRole: {
      position: String,
      domain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Domain",
      },
    },

    // Academic Information
    academicInfo: {
      year: {
        type: Number,
        min: 1,
        max: 4,
      },
      branch: String,
      rollNumber: String,
      cgpa: Number,
      graduationYear: Number,
    },

    // Contact Information
    contact: {
      email: String,
      phone: String,
      linkedIn: String,
      github: String,
      portfolio: String,
      resume: String, // URL to resume
      address: {
        current: String,
        permanent: String,
      },
    },

    // Professional Information
    skills: [
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
        yearsOfExperience: Number,
        certifications: [String],
      },
    ],

    // Experience and Projects
    experience: [
      {
        title: String,
        company: String,
        type: {
          type: String,
          enum: [
            "internship",
            "full_time",
            "part_time",
            "contract",
            "freelance",
          ],
        },
        startDate: Date,
        endDate: Date,
        isCurrentRole: {
          type: Boolean,
          default: false,
        },
        description: String,
        technologies: [String],
        achievements: [String],
      },
    ],

    projects: [
      {
        title: String,
        description: String,
        role: String,
        technologies: [String],
        githubUrl: String,
        liveUrl: String,
        startDate: Date,
        endDate: Date,
        status: {
          type: String,
          enum: ["completed", "in_progress", "on_hold", "cancelled"],
          default: "completed",
        },
        teamSize: Number,
        isPersonal: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Achievements and Recognition
    achievements: [
      {
        title: String,
        description: String,
        category: {
          type: String,
          enum: [
            "academic",
            "technical",
            "leadership",
            "competition",
            "certification",
            "other",
          ],
        },
        date: Date,
        organization: String,
        certificate: String, // URL
        rank: String,
        level: {
          type: String,
          enum: [
            "international",
            "national",
            "state",
            "university",
            "college",
            "local",
          ],
        },
      },
    ],

    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        credentialUrl: String,
        skills: [String],
      },
    ],

    // Media and Showcase
    media: {
      profilePicture: {
        url: String,
        filename: String,
      },
      coverPhoto: {
        url: String,
        filename: String,
      },
      gallery: [
        {
          url: String,
          filename: String,
          caption: String,
          type: {
            type: String,
            enum: ["image", "video", "document"],
          },
        },
      ],
    },

    // Social and Engagement
    social: {
      twitter: String,
      instagram: String,
      facebook: String,
      youtube: String,
      blog: String,
      personalWebsite: String,
    },

    // Interests and Preferences
    interests: [String],
    domains: [String], // Areas of interest

    // Availability and Status
    availability: {
      status: {
        type: String,
        enum: ["active", "inactive", "alumni", "graduated", "on_leave"],
        default: "active",
      },
      lastActive: {
        type: Date,
        default: Date.now,
      },
      isOpenToCollaboration: {
        type: Boolean,
        default: true,
      },
      isOpenToMentoring: {
        type: Boolean,
        default: false,
      },
    },

    // Statistics and Metrics
    stats: {
      projectsCompleted: {
        type: Number,
        default: 0,
      },
      eventsOrganized: {
        type: Number,
        default: 0,
      },
      eventsAttended: {
        type: Number,
        default: 0,
      },
      mentees: {
        type: Number,
        default: 0,
      },
      profileViews: {
        type: Number,
        default: 0,
      },
    },

    // Privacy Settings
    privacy: {
      showEmail: {
        type: Boolean,
        default: false,
      },
      showPhone: {
        type: Boolean,
        default: false,
      },
      showProjects: {
        type: Boolean,
        default: true,
      },
      showAchievements: {
        type: Boolean,
        default: true,
      },
      profileVisibility: {
        type: String,
        enum: ["public", "members_only", "private"],
        default: "members_only",
      },
    },

    // Admin fields
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verifiedAt: Date,

    notes: String, // Admin notes

    // Featured member
    isFeatured: {
      type: Boolean,
      default: false,
    },

    featuredAt: Date,

    // Alumni information
    alumniInfo: {
      graduationYear: Number,
      currentCompany: String,
      currentPosition: String,
      location: String,
      isWillingToMentor: {
        type: Boolean,
        default: false,
      },
      expertiseAreas: [String],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
domainSchema.index({ code: 1 });
domainSchema.index({ isActive: 1 });

memberSchema.index({ user: 1 });
memberSchema.index({ "roles.domain": 1, "roles.position": 1 });
memberSchema.index({ "availability.status": 1 });
memberSchema.index({ isFeatured: 1, featuredAt: -1 });
memberSchema.index({ "privacy.profileVisibility": 1 });
memberSchema.index({ skills: 1 });

// Virtuals
memberSchema.virtual("isAlumni").get(function () {
  return (
    this.availability.status === "alumni" ||
    this.availability.status === "graduated"
  );
});

memberSchema.virtual("currentRole").get(function () {
  const activeRoles = this.roles.filter((role) => role.isActive);
  return activeRoles.length > 0 ? activeRoles[0] : null;
});

memberSchema.virtual("experienceYears").get(function () {
  if (!this.experience || this.experience.length === 0) return 0;

  const totalMonths = this.experience.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return total + months;
  }, 0);

  return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal place
});

// Pre-save middleware to update primary role
memberSchema.pre("save", function (next) {
  const activeRoles = this.roles.filter((role) => role.isActive);
  if (activeRoles.length > 0) {
    // Prioritize based on position hierarchy
    const hierarchy = {
      president: 1,
      vice_president: 2,
      secretary: 3,
      treasurer: 4,
      domain_head: 5,
      assistant_domain_head: 6,
      core_member: 7,
      team_lead: 8,
      member: 9,
      mentor: 10,
      alumni: 11,
    };

    activeRoles.sort(
      (a, b) => (hierarchy[a.position] || 99) - (hierarchy[b.position] || 99)
    );

    this.primaryRole = {
      position: activeRoles[0].position,
      domain: activeRoles[0].domain,
    };
  }
  next();
});

// Instance methods
memberSchema.methods.addRole = function (
  position,
  domainId,
  responsibilities = []
) {
  this.roles.push({
    position,
    domain: domainId,
    responsibilities,
    isActive: true,
  });
  return this.save();
};

memberSchema.methods.deactivateRole = function (roleId) {
  const role = this.roles.id(roleId);
  if (role) {
    role.isActive = false;
    role.endDate = new Date();
  }
  return this.save();
};

memberSchema.methods.incrementProfileViews = function () {
  this.stats.profileViews += 1;
  this.availability.lastActive = new Date();
  return this.save();
};

memberSchema.methods.feature = function () {
  this.isFeatured = true;
  this.featuredAt = new Date();
  return this.save();
};

memberSchema.methods.verify = function (verifiedById) {
  this.isVerified = true;
  this.verifiedBy = verifiedById;
  this.verifiedAt = new Date();
  return this.save();
};

// Static methods
memberSchema.statics.getByDomain = function (domainId, position = null) {
  const query = {
    "roles.domain": domainId,
    "roles.isActive": true,
    "availability.status": { $ne: "inactive" },
  };

  if (position) {
    query["roles.position"] = position;
  }

  return this.find(query)
    .populate("user", "name email")
    .populate("roles.domain", "name code color")
    .sort({ "roles.position": 1, createdAt: 1 });
};

memberSchema.statics.getFeatured = function (limit = 6) {
  return this.find({
    isFeatured: true,
    "privacy.profileVisibility": { $ne: "private" },
    "availability.status": "active",
  })
    .populate("user", "name email")
    .populate("primaryRole.domain", "name code color")
    .sort({ featuredAt: -1 })
    .limit(limit);
};

memberSchema.statics.getLeadership = function () {
  return this.find({
    "roles.position": {
      $in: [
        "president",
        "vice_president",
        "secretary",
        "treasurer",
        "domain_head",
      ],
    },
    "roles.isActive": true,
    "availability.status": "active",
  })
    .populate("user", "name email")
    .populate("roles.domain", "name code color")
    .sort({ "roles.position": 1 });
};

memberSchema.statics.getAlumni = function (graduationYear = null) {
  const query = {
    "availability.status": { $in: ["alumni", "graduated"] },
  };

  if (graduationYear) {
    query["alumniInfo.graduationYear"] = graduationYear;
  }

  return this.find(query)
    .populate("user", "name email")
    .populate("primaryRole.domain", "name code color")
    .sort({ "alumniInfo.graduationYear": -1, createdAt: 1 });
};

memberSchema.statics.searchMembers = function (query, filters = {}) {
  const searchQuery = {
    "privacy.profileVisibility": { $ne: "private" },
    $or: [
      { displayName: { $regex: query, $options: "i" } },
      { tagline: { $regex: query, $options: "i" } },
      { "skills.name": { $regex: query, $options: "i" } },
      { interests: { $regex: query, $options: "i" } },
    ],
  };

  if (filters.domain) {
    searchQuery["roles.domain"] = filters.domain;
    searchQuery["roles.isActive"] = true;
  }

  if (filters.position) {
    searchQuery["roles.position"] = filters.position;
  }

  if (filters.status) {
    searchQuery["availability.status"] = filters.status;
  }

  if (filters.skills) {
    searchQuery["skills.name"] = { $in: filters.skills };
  }

  return this.find(searchQuery)
    .populate("user", "name email")
    .populate("primaryRole.domain", "name code color")
    .sort({ "stats.profileViews": -1, createdAt: -1 });
};

const Domain = mongoose.model("Domain", domainSchema);
const Member = mongoose.model("Member", memberSchema);

module.exports = { Domain, Member };
