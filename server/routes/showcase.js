const express = require("express");
const router = express.Router();
const Showcase = require("../models/Showcase");
const { auth, admin, moderator } = require("../middleware/auth");
const {
  validateShowcase,
  validateShowcaseUpdate,
} = require("../utils/validation");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
const multer = require("multer");
const path = require("path");

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/showcase");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mov|avi/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

/**
 * @route   POST /api/showcase
 * @desc    Create new showcase item
 * @access  Private
 */
router.post(
  "/",
  auth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 3 },
    { name: "documents", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      // Validate input
      const errors = validateShowcase(req.body);
      if (errors.length > 0) {
        return sendErrorResponse(res, "Validation failed", 400, errors);
      }

      const userId = req.user.id;
      const {
        title,
        description,
        shortDescription,
        type,
        category,
        technologies,
        skills,
        status,
        startDate,
        endDate,
        duration,
        links,
        collaborators,
        teamSize,
        isTeamProject,
        achievements,
        awards,
        visibility,
        tags,
      } = req.body;

      // Process uploaded files
      const media = {
        images: [],
        videos: [],
        documents: [],
      };

      if (req.files) {
        // Process thumbnail
        if (req.files.thumbnail && req.files.thumbnail[0]) {
          const thumbnailFile = req.files.thumbnail[0];
          media.thumbnail = {
            url: `/uploads/showcase/${thumbnailFile.filename}`,
            filename: thumbnailFile.filename,
            size: thumbnailFile.size,
            mimetype: thumbnailFile.mimetype,
          };
        }

        // Process images
        if (req.files.images) {
          media.images = req.files.images.map((file) => ({
            url: `/uploads/showcase/${file.filename}`,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            caption: req.body[`image_caption_${file.fieldname}`] || "",
          }));
        }

        // Process videos
        if (req.files.videos) {
          media.videos = req.files.videos.map((file) => ({
            url: `/uploads/showcase/${file.filename}`,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            title:
              req.body[`video_title_${file.fieldname}`] || file.originalname,
          }));
        }

        // Process documents
        if (req.files.documents) {
          media.documents = req.files.documents.map((file) => ({
            url: `/uploads/showcase/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            description: req.body[`doc_description_${file.fieldname}`] || "",
          }));
        }
      }

      // Create showcase item
      const showcase = new Showcase({
        owner: userId,
        title,
        description,
        shortDescription,
        type,
        category,
        technologies:
          typeof technologies === "string"
            ? JSON.parse(technologies)
            : technologies,
        skills: typeof skills === "string" ? JSON.parse(skills) : skills,
        status,
        startDate,
        endDate,
        duration,
        links: typeof links === "string" ? JSON.parse(links) : links,
        media,
        collaborators:
          typeof collaborators === "string"
            ? JSON.parse(collaborators)
            : collaborators,
        teamSize: parseInt(teamSize) || 1,
        isTeamProject: isTeamProject === "true",
        achievements:
          typeof achievements === "string"
            ? JSON.parse(achievements)
            : achievements,
        awards: typeof awards === "string" ? JSON.parse(awards) : awards,
        visibility: visibility || "draft",
        tags: typeof tags === "string" ? JSON.parse(tags) : tags || [],
      });

      await showcase.save();

      await showcase.populate("owner", "name email profilePicture");

      sendSuccessResponse(
        res,
        "Showcase item created successfully",
        showcase,
        201
      );
    } catch (error) {
      console.error("Create showcase error:", error);
      sendErrorResponse(res, "Failed to create showcase item", 500);
    }
  }
);

/**
 * @route   GET /api/showcase
 * @desc    Get all public showcase items
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const {
      type,
      category,
      status,
      featured,
      search,
      technologies,
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query for public items
    const query = {
      visibility: "public",
      "moderation.status": "approved",
    };

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (featured === "true") query.featured = true;

    if (technologies) {
      const techArray = technologies.split(",");
      query["technologies.name"] = { $in: techArray };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { "technologies.name": { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const showcase = await Showcase.find(query)
      .populate("owner", "name profilePicture year domain")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Showcase.countDocuments(query);

    sendSuccessResponse(res, "Showcase items retrieved successfully", {
      showcase,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get showcase error:", error);
    sendErrorResponse(res, "Failed to retrieve showcase items", 500);
  }
});

/**
 * @route   GET /api/showcase/featured
 * @desc    Get featured showcase items
 * @access  Public
 */
router.get("/featured", async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const featured = await Showcase.getFeatured(parseInt(limit));

    sendSuccessResponse(
      res,
      "Featured showcase items retrieved successfully",
      featured
    );
  } catch (error) {
    console.error("Get featured showcase error:", error);
    sendErrorResponse(res, "Failed to retrieve featured showcase items", 500);
  }
});

/**
 * @route   GET /api/showcase/trending
 * @desc    Get trending showcase items
 * @access  Public
 */
router.get("/trending", async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;

    const trending = await Showcase.getTrending(
      parseInt(days),
      parseInt(limit)
    );

    sendSuccessResponse(
      res,
      "Trending showcase items retrieved successfully",
      trending
    );
  } catch (error) {
    console.error("Get trending showcase error:", error);
    sendErrorResponse(res, "Failed to retrieve trending showcase items", 500);
  }
});

/**
 * @route   GET /api/showcase/category/:category
 * @desc    Get showcase items by category
 * @access  Public
 */
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 12 } = req.query;

    const showcase = await Showcase.getByCategory(category, parseInt(limit));

    sendSuccessResponse(
      res,
      `Showcase items in ${category} retrieved successfully`,
      showcase
    );
  } catch (error) {
    console.error("Get showcase by category error:", error);
    sendErrorResponse(res, "Failed to retrieve showcase items", 500);
  }
});

/**
 * @route   GET /api/showcase/my-showcase
 * @desc    Get current user's showcase items
 * @access  Private
 */
router.get("/my-showcase", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;

    const query = { owner: userId };
    if (status) query.status = status;

    const showcase = await Showcase.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Showcase.countDocuments(query);

    sendSuccessResponse(res, "Your showcase items retrieved successfully", {
      showcase,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get user showcase error:", error);
    sendErrorResponse(res, "Failed to retrieve your showcase items", 500);
  }
});

/**
 * @route   GET /api/showcase/:showcaseId
 * @desc    Get specific showcase item
 * @access  Public
 */
router.get("/:showcaseId", async (req, res) => {
  try {
    const { showcaseId } = req.params;

    const showcase = await Showcase.findById(showcaseId)
      .populate("owner", "name email profilePicture year domain")
      .populate("collaborators.user", "name profilePicture")
      .populate("interactions.comments.user", "name profilePicture")
      .populate("interactions.comments.replies.user", "name profilePicture");

    if (!showcase) {
      return sendErrorResponse(res, "Showcase item not found", 404);
    }

    // Check if user can view this showcase
    if (
      showcase.visibility === "private" ||
      showcase.moderation.status !== "approved"
    ) {
      // Only owner, admins can view private/unapproved items
      if (
        !req.user ||
        (!showcase.owner.equals(req.user.id) && req.user.role !== "admin")
      ) {
        return sendErrorResponse(
          res,
          "Not authorized to view this showcase item",
          403
        );
      }
    }

    // Increment view count (if not owner viewing)
    if (!req.user || !showcase.owner.equals(req.user.id)) {
      await showcase.incrementViews();
    }

    sendSuccessResponse(res, "Showcase item retrieved successfully", showcase);
  } catch (error) {
    console.error("Get showcase item error:", error);
    sendErrorResponse(res, "Failed to retrieve showcase item", 500);
  }
});

/**
 * @route   PUT /api/showcase/:showcaseId
 * @desc    Update showcase item
 * @access  Private
 */
router.put(
  "/:showcaseId",
  auth,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 3 },
    { name: "documents", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const { showcaseId } = req.params;
      const userId = req.user.id;

      const showcase = await Showcase.findById(showcaseId);
      if (!showcase) {
        return sendErrorResponse(res, "Showcase item not found", 404);
      }

      // Check if user owns this showcase or is admin
      if (!showcase.owner.equals(userId) && req.user.role !== "admin") {
        return sendErrorResponse(
          res,
          "Not authorized to update this showcase item",
          403
        );
      }

      // Validate update data
      const errors = validateShowcaseUpdate(req.body);
      if (errors.length > 0) {
        return sendErrorResponse(res, "Validation failed", 400, errors);
      }

      // Update allowed fields
      const allowedUpdates = [
        "title",
        "description",
        "shortDescription",
        "type",
        "category",
        "technologies",
        "skills",
        "status",
        "startDate",
        "endDate",
        "duration",
        "links",
        "collaborators",
        "teamSize",
        "isTeamProject",
        "achievements",
        "awards",
        "visibility",
        "tags",
      ];

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (
            typeof req.body[field] === "string" &&
            [
              "technologies",
              "skills",
              "links",
              "collaborators",
              "achievements",
              "awards",
              "tags",
            ].includes(field)
          ) {
            try {
              showcase[field] = JSON.parse(req.body[field]);
            } catch (e) {
              showcase[field] = req.body[field];
            }
          } else {
            showcase[field] = req.body[field];
          }
        }
      });

      // Handle new file uploads
      if (req.files) {
        // Update thumbnail
        if (req.files.thumbnail && req.files.thumbnail[0]) {
          const thumbnailFile = req.files.thumbnail[0];
          showcase.media.thumbnail = {
            url: `/uploads/showcase/${thumbnailFile.filename}`,
            filename: thumbnailFile.filename,
            size: thumbnailFile.size,
            mimetype: thumbnailFile.mimetype,
          };
        }

        // Add new images
        if (req.files.images) {
          const newImages = req.files.images.map((file) => ({
            url: `/uploads/showcase/${file.filename}`,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            caption: req.body[`image_caption_${file.fieldname}`] || "",
          }));
          showcase.media.images.push(...newImages);
        }

        // Add new videos
        if (req.files.videos) {
          const newVideos = req.files.videos.map((file) => ({
            url: `/uploads/showcase/${file.filename}`,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            title:
              req.body[`video_title_${file.fieldname}`] || file.originalname,
          }));
          showcase.media.videos.push(...newVideos);
        }

        // Add new documents
        if (req.files.documents) {
          const newDocuments = req.files.documents.map((file) => ({
            url: `/uploads/showcase/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            description: req.body[`doc_description_${file.fieldname}`] || "",
          }));
          showcase.media.documents.push(...newDocuments);
        }
      }

      // Reset moderation status if content changed significantly
      if (
        req.body.title ||
        req.body.description ||
        req.body.type ||
        req.body.category
      ) {
        showcase.moderation.status = "pending";
        showcase.moderation.reviewedAt = null;
        showcase.moderation.reviewedBy = null;
      }

      await showcase.save();

      await showcase.populate("owner", "name email profilePicture");

      sendSuccessResponse(res, "Showcase item updated successfully", showcase);
    } catch (error) {
      console.error("Update showcase error:", error);
      sendErrorResponse(res, "Failed to update showcase item", 500);
    }
  }
);

/**
 * @route   DELETE /api/showcase/:showcaseId
 * @desc    Delete showcase item
 * @access  Private
 */
router.delete("/:showcaseId", auth, async (req, res) => {
  try {
    const { showcaseId } = req.params;
    const userId = req.user.id;

    const showcase = await Showcase.findById(showcaseId);
    if (!showcase) {
      return sendErrorResponse(res, "Showcase item not found", 404);
    }

    // Check if user owns this showcase or is admin
    if (!showcase.owner.equals(userId) && req.user.role !== "admin") {
      return sendErrorResponse(
        res,
        "Not authorized to delete this showcase item",
        403
      );
    }

    await Showcase.findByIdAndDelete(showcaseId);

    sendSuccessResponse(res, "Showcase item deleted successfully");
  } catch (error) {
    console.error("Delete showcase error:", error);
    sendErrorResponse(res, "Failed to delete showcase item", 500);
  }
});

/**
 * @route   POST /api/showcase/:showcaseId/like
 * @desc    Like/unlike showcase item
 * @access  Private
 */
router.post("/:showcaseId/like", auth, async (req, res) => {
  try {
    const { showcaseId } = req.params;
    const userId = req.user.id;

    const showcase = await Showcase.findById(showcaseId);
    if (!showcase) {
      return sendErrorResponse(res, "Showcase item not found", 404);
    }

    const isLiked = showcase.interactions.likedBy.includes(userId);

    if (isLiked) {
      await showcase.unlike(userId);
    } else {
      await showcase.like(userId);
    }

    sendSuccessResponse(
      res,
      `Showcase item ${isLiked ? "unliked" : "liked"} successfully`,
      {
        liked: !isLiked,
        likesCount: showcase.metrics.likes,
      }
    );
  } catch (error) {
    console.error("Like showcase error:", error);
    sendErrorResponse(res, "Failed to update like status", 500);
  }
});

/**
 * @route   POST /api/showcase/:showcaseId/comment
 * @desc    Add comment to showcase item
 * @access  Private
 */
router.post("/:showcaseId/comment", auth, async (req, res) => {
  try {
    const { showcaseId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return sendErrorResponse(res, "Comment content is required", 400);
    }

    const showcase = await Showcase.findById(showcaseId);
    if (!showcase) {
      return sendErrorResponse(res, "Showcase item not found", 404);
    }

    await showcase.addComment(userId, content.trim());

    await showcase.populate(
      "interactions.comments.user",
      "name profilePicture"
    );

    const newComment =
      showcase.interactions.comments[showcase.interactions.comments.length - 1];

    sendSuccessResponse(res, "Comment added successfully", newComment);
  } catch (error) {
    console.error("Add comment error:", error);
    sendErrorResponse(res, "Failed to add comment", 500);
  }
});

/**
 * @route   POST /api/showcase/:showcaseId/approve
 * @desc    Approve showcase item (Admin only)
 * @access  Private (Admin)
 */
router.post("/:showcaseId/approve", auth, admin, async (req, res) => {
  try {
    const { showcaseId } = req.params;
    const { notes = "" } = req.body;
    const userId = req.user.id;

    const showcase = await Showcase.findById(showcaseId);
    if (!showcase) {
      return sendErrorResponse(res, "Showcase item not found", 404);
    }

    await showcase.approve(userId, notes);

    await showcase.populate("owner", "name email");

    sendSuccessResponse(res, "Showcase item approved successfully", showcase);
  } catch (error) {
    console.error("Approve showcase error:", error);
    sendErrorResponse(res, "Failed to approve showcase item", 500);
  }
});

/**
 * @route   POST /api/showcase/:showcaseId/feature
 * @desc    Feature/unfeature showcase item (Admin only)
 * @access  Private (Admin)
 */
router.post("/:showcaseId/feature", auth, admin, async (req, res) => {
  try {
    const { showcaseId } = req.params;

    const showcase = await Showcase.findById(showcaseId);
    if (!showcase) {
      return sendErrorResponse(res, "Showcase item not found", 404);
    }

    if (showcase.featured) {
      showcase.featured = false;
      showcase.featuredAt = null;
    } else {
      await showcase.feature();
    }

    await showcase.save();

    sendSuccessResponse(
      res,
      `Showcase item ${
        showcase.featured ? "featured" : "unfeatured"
      } successfully`,
      {
        featured: showcase.featured,
        featuredAt: showcase.featuredAt,
      }
    );
  } catch (error) {
    console.error("Feature showcase error:", error);
    sendErrorResponse(res, "Failed to update feature status", 500);
  }
});

/**
 * @route   GET /api/showcase/stats/analytics
 * @desc    Get showcase analytics (Admin only)
 * @access  Private (Admin)
 */
router.get("/stats/analytics", auth, admin, async (req, res) => {
  try {
    const stats = await Showcase.getStats();

    // Get total counts by status
    const statusStats = await Showcase.aggregate([
      {
        $group: {
          _id: "$moderation.status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get top contributors
    const topContributors = await Showcase.aggregate([
      {
        $match: {
          visibility: "public",
          "moderation.status": "approved",
        },
      },
      {
        $group: {
          _id: "$owner",
          count: { $sum: 1 },
          totalViews: { $sum: "$metrics.views" },
          totalLikes: { $sum: "$metrics.likes" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          profilePicture: "$user.profilePicture",
          count: 1,
          totalViews: 1,
          totalLikes: 1,
        },
      },
    ]);

    sendSuccessResponse(res, "Showcase analytics retrieved successfully", {
      categoryStats: stats,
      statusStats,
      topContributors,
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    sendErrorResponse(res, "Failed to retrieve analytics", 500);
  }
});

module.exports = router;
