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

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateEventCreation,
  validateEventUpdate,
  handleValidationErrors,
};
