const { body, validationResult } = require("express-validator");

// User validation rules
const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("college")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("College name cannot exceed 100 characters"),
];

const validateUserLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

const validateUserUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Please provide a valid phone number"),

  body("college")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("College name cannot exceed 100 characters"),
];

// Event validation rules
const validateEventCreation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("category")
    .isIn([
      "technical",
      "cultural",
      "sports",
      "workshop",
      "seminar",
      "competition",
      "other",
    ])
    .withMessage("Invalid event category"),

  body("eventType")
    .isIn(["online", "offline", "hybrid"])
    .withMessage("Invalid event type"),

  body("startDate").isISO8601().withMessage("Invalid start date format"),

  body("endDate")
    .isISO8601()
    .withMessage("Invalid end date format")
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("registrationEndDate")
    .isISO8601()
    .withMessage("Invalid registration end date format"),

  body("maxParticipants")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max participants must be a positive number"),

  body("registrationFee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Registration fee must be a positive number"),
];

const validateEventUpdate = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage("Description must be between 10 and 2000 characters"),

  body("category")
    .optional()
    .isIn([
      "technical",
      "cultural",
      "sports",
      "workshop",
      "seminar",
      "competition",
      "other",
    ])
    .withMessage("Invalid event category"),

  body("eventType")
    .optional()
    .isIn(["online", "offline", "hybrid"])
    .withMessage("Invalid event type"),
];

// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * RSVP validation
 */
const validateRSVP = (data) => {
  const errors = [];

  if (!data.eventId) {
    errors.push({ field: "eventId", message: "Event ID is required" });
  }

  if (!data.contactInfo) {
    errors.push({
      field: "contactInfo",
      message: "Contact information is required",
    });
  } else {
    if (!data.contactInfo.email) {
      errors.push({ field: "contactInfo.email", message: "Email is required" });
    } else if (
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
        data.contactInfo.email
      )
    ) {
      errors.push({
        field: "contactInfo.email",
        message: "Invalid email format",
      });
    }

    if (data.contactInfo.phone && !/^\d{10}$/.test(data.contactInfo.phone)) {
      errors.push({
        field: "contactInfo.phone",
        message: "Phone number must be 10 digits",
      });
    }
  }

  if (data.additionalInfo) {
    if (
      data.additionalInfo.teamName &&
      data.additionalInfo.teamName.length > 100
    ) {
      errors.push({
        field: "additionalInfo.teamName",
        message: "Team name cannot exceed 100 characters",
      });
    }

    if (
      data.additionalInfo.specialNeeds &&
      data.additionalInfo.specialNeeds.length > 500
    ) {
      errors.push({
        field: "additionalInfo.specialNeeds",
        message: "Special needs description cannot exceed 500 characters",
      });
    }
  }

  return errors;
};

const validateRSVPUpdate = (data) => {
  const errors = [];

  if (data.contactInfo) {
    if (
      data.contactInfo.email &&
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
        data.contactInfo.email
      )
    ) {
      errors.push({
        field: "contactInfo.email",
        message: "Invalid email format",
      });
    }

    if (data.contactInfo.phone && !/^\d{10}$/.test(data.contactInfo.phone)) {
      errors.push({
        field: "contactInfo.phone",
        message: "Phone number must be 10 digits",
      });
    }
  }

  if (
    data.status &&
    ![
      "pending",
      "confirmed",
      "cancelled",
      "waitlist",
      "attended",
      "no-show",
    ].includes(data.status)
  ) {
    errors.push({ field: "status", message: "Invalid status value" });
  }

  return errors;
};

/**
 * Feedback validation
 */
const validateFeedback = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required" });
  } else if (data.title.length > 200) {
    errors.push({
      field: "title",
      message: "Title cannot exceed 200 characters",
    });
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.push({ field: "content", message: "Content is required" });
  } else if (data.content.length > 2000) {
    errors.push({
      field: "content",
      message: "Content cannot exceed 2000 characters",
    });
  }

  if (!data.type) {
    errors.push({ field: "type", message: "Feedback type is required" });
  } else if (
    ![
      "event",
      "general",
      "website",
      "suggestion",
      "complaint",
      "bug_report",
    ].includes(data.type)
  ) {
    errors.push({ field: "type", message: "Invalid feedback type" });
  }

  if (data.type === "event" && !data.event) {
    errors.push({
      field: "event",
      message: "Event ID is required for event feedback",
    });
  }

  if (data.type === "event" && data.ratings) {
    if (
      !data.ratings.overall ||
      data.ratings.overall < 1 ||
      data.ratings.overall > 5
    ) {
      errors.push({
        field: "ratings.overall",
        message: "Overall rating is required and must be between 1 and 5",
      });
    }

    Object.keys(data.ratings).forEach((key) => {
      if (
        key !== "overall" &&
        data.ratings[key] &&
        (data.ratings[key] < 1 || data.ratings[key] > 5)
      ) {
        errors.push({
          field: `ratings.${key}`,
          message: `${key} rating must be between 1 and 5`,
        });
      }
    });
  }

  if (
    data.priority &&
    !["low", "medium", "high", "critical"].includes(data.priority)
  ) {
    errors.push({ field: "priority", message: "Invalid priority value" });
  }

  if (
    data.urgency &&
    !["low", "medium", "high", "urgent"].includes(data.urgency)
  ) {
    errors.push({ field: "urgency", message: "Invalid urgency value" });
  }

  return errors;
};

const validateFeedbackUpdate = (data) => {
  const errors = [];

  if (data.title && data.title.length > 200) {
    errors.push({
      field: "title",
      message: "Title cannot exceed 200 characters",
    });
  }

  if (data.content && data.content.length > 2000) {
    errors.push({
      field: "content",
      message: "Content cannot exceed 2000 characters",
    });
  }

  if (
    data.status &&
    ![
      "pending",
      "under_review",
      "in_progress",
      "resolved",
      "closed",
      "rejected",
    ].includes(data.status)
  ) {
    errors.push({ field: "status", message: "Invalid status value" });
  }

  if (
    data.priority &&
    !["low", "medium", "high", "critical"].includes(data.priority)
  ) {
    errors.push({ field: "priority", message: "Invalid priority value" });
  }

  if (
    data.urgency &&
    !["low", "medium", "high", "urgent"].includes(data.urgency)
  ) {
    errors.push({ field: "urgency", message: "Invalid urgency value" });
  }

  return errors;
};

/**
 * Showcase validation
 */
const validateShowcase = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push({ field: "title", message: "Title is required" });
  } else if (data.title.length > 150) {
    errors.push({
      field: "title",
      message: "Title cannot exceed 150 characters",
    });
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push({ field: "description", message: "Description is required" });
  } else if (data.description.length > 2000) {
    errors.push({
      field: "description",
      message: "Description cannot exceed 2000 characters",
    });
  }

  if (data.shortDescription && data.shortDescription.length > 300) {
    errors.push({
      field: "shortDescription",
      message: "Short description cannot exceed 300 characters",
    });
  }

  if (!data.type) {
    errors.push({ field: "type", message: "Type is required" });
  } else if (
    ![
      "project",
      "blog",
      "demo",
      "research",
      "achievement",
      "tutorial",
      "open_source",
    ].includes(data.type)
  ) {
    errors.push({ field: "type", message: "Invalid type value" });
  }

  if (!data.category) {
    errors.push({ field: "category", message: "Category is required" });
  } else {
    const validCategories = [
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
    ];
    if (!validCategories.includes(data.category)) {
      errors.push({ field: "category", message: "Invalid category value" });
    }
  }

  if (
    data.status &&
    !["concept", "in_progress", "completed", "deployed", "archived"].includes(
      data.status
    )
  ) {
    errors.push({ field: "status", message: "Invalid status value" });
  }

  if (
    data.visibility &&
    !["public", "members_only", "private", "draft"].includes(data.visibility)
  ) {
    errors.push({ field: "visibility", message: "Invalid visibility value" });
  }

  return errors;
};

const validateShowcaseUpdate = (data) => {
  const errors = [];

  if (data.title && data.title.length > 150) {
    errors.push({
      field: "title",
      message: "Title cannot exceed 150 characters",
    });
  }

  if (data.description && data.description.length > 2000) {
    errors.push({
      field: "description",
      message: "Description cannot exceed 2000 characters",
    });
  }

  if (data.shortDescription && data.shortDescription.length > 300) {
    errors.push({
      field: "shortDescription",
      message: "Short description cannot exceed 300 characters",
    });
  }

  if (
    data.type &&
    ![
      "project",
      "blog",
      "demo",
      "research",
      "achievement",
      "tutorial",
      "open_source",
    ].includes(data.type)
  ) {
    errors.push({ field: "type", message: "Invalid type value" });
  }

  if (
    data.status &&
    !["concept", "in_progress", "completed", "deployed", "archived"].includes(
      data.status
    )
  ) {
    errors.push({ field: "status", message: "Invalid status value" });
  }

  if (
    data.visibility &&
    !["public", "members_only", "private", "draft"].includes(data.visibility)
  ) {
    errors.push({ field: "visibility", message: "Invalid visibility value" });
  }

  return errors;
};

/**
 * Domain validation
 */
const validateDomain = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: "name", message: "Domain name is required" });
  } else if (data.name.length > 100) {
    errors.push({
      field: "name",
      message: "Domain name cannot exceed 100 characters",
    });
  }

  if (!data.code || data.code.trim().length === 0) {
    errors.push({ field: "code", message: "Domain code is required" });
  } else if (!/^[A-Z]{2,10}$/.test(data.code.toUpperCase())) {
    errors.push({
      field: "code",
      message: "Domain code must be 2-10 uppercase letters",
    });
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push({
      field: "description",
      message: "Domain description is required",
    });
  } else if (data.description.length > 1000) {
    errors.push({
      field: "description",
      message: "Domain description cannot exceed 1000 characters",
    });
  }

  if (data.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data.color)) {
    errors.push({
      field: "color",
      message: "Color must be a valid hex color code",
    });
  }

  return errors;
};

/**
 * Member validation
 */
const validateMember = (data) => {
  const errors = [];

  if (data.displayName && data.displayName.length > 100) {
    errors.push({
      field: "displayName",
      message: "Display name cannot exceed 100 characters",
    });
  }

  if (data.tagline && data.tagline.length > 200) {
    errors.push({
      field: "tagline",
      message: "Tagline cannot exceed 200 characters",
    });
  }

  if (data.bio && data.bio.length > 2000) {
    errors.push({ field: "bio", message: "Bio cannot exceed 2000 characters" });
  }

  if (data.academicInfo) {
    if (
      data.academicInfo.year &&
      (data.academicInfo.year < 1 || data.academicInfo.year > 4)
    ) {
      errors.push({
        field: "academicInfo.year",
        message: "Academic year must be between 1 and 4",
      });
    }

    if (
      data.academicInfo.cgpa &&
      (data.academicInfo.cgpa < 0 || data.academicInfo.cgpa > 10)
    ) {
      errors.push({
        field: "academicInfo.cgpa",
        message: "CGPA must be between 0 and 10",
      });
    }
  }

  if (data.contact) {
    if (
      data.contact.email &&
      !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.contact.email)
    ) {
      errors.push({ field: "contact.email", message: "Invalid email format" });
    }

    if (data.contact.phone && !/^\d{10}$/.test(data.contact.phone)) {
      errors.push({
        field: "contact.phone",
        message: "Phone number must be 10 digits",
      });
    }
  }

  return errors;
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateEventCreation,
  validateEventUpdate,
  handleValidationErrors,
  validateRSVP,
  validateRSVPUpdate,
  validateFeedback,
  validateFeedbackUpdate,
  validateShowcase,
  validateShowcaseUpdate,
  validateDomain,
  validateMember,
};
