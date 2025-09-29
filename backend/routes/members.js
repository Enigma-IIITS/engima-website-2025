const express = require("express");
const router = express.Router();
const { Member, Domain } = require("../models/Member");
const User = require("../models/User");
const { auth, authorizeRoles } = require("../middleware/auth");
const { validateMember, validateDomain } = require("../utils/validation");
const { successResponse, errorResponse } = require("../utils/response");
const multer = require("multer");
const path = require("path");

// Multer configuration for profile uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/profiles");
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
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

// Domain Routes

/**
 * @route   POST /api/members/domains
 * @desc    Create new domain
 * @access  Private (Admin only)
 */
router.post("/domains", auth, authorizeRoles(["admin"]), async (req, res) => {
  try {
    const errors = validateDomain(req.body);
    if (errors.length > 0) {
      return errorResponse(res, "Validation failed", 400, errors);
    }

    const { name, code, description, icon, color } = req.body;

    // Check if domain already exists
    const existingDomain = await Domain.findOne({
      $or: [{ name }, { code }],
    });

    if (existingDomain) {
      return errorResponse(
        res,
        "Domain with this name or code already exists",
        400
      );
    }

    const domain = new Domain({
      name,
      code: code.toUpperCase(),
      description,
      icon,
      color,
    });

    await domain.save();

    successResponse(res, "Domain created successfully", domain, 201);
  } catch (error) {
    console.error("Create domain error:", error);
    errorResponse(res, "Failed to create domain", 500);
  }
});

/**
 * @route   GET /api/members/domains
 * @desc    Get all domains
 * @access  Public
 */
router.get("/domains", async (req, res) => {
  try {
    const { active = true } = req.query;

    const query = {};
    if (active === "true") {
      query.isActive = true;
    }

    const domains = await Domain.find(query).sort({ name: 1 });

    successResponse(res, "Domains retrieved successfully", domains);
  } catch (error) {
    console.error("Get domains error:", error);
    errorResponse(res, "Failed to retrieve domains", 500);
  }
});

/**
 * @route   PUT /api/members/domains/:domainId
 * @desc    Update domain
 * @access  Private (Admin only)
 */
router.put(
  "/domains/:domainId",
  auth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { domainId } = req.params;

      const domain = await Domain.findById(domainId);
      if (!domain) {
        return errorResponse(res, "Domain not found", 404);
      }

      const { name, description, icon, color, isActive } = req.body;

      if (name) domain.name = name;
      if (description) domain.description = description;
      if (icon) domain.icon = icon;
      if (color) domain.color = color;
      if (isActive !== undefined) domain.isActive = isActive;

      await domain.save();

      successResponse(res, "Domain updated successfully", domain);
    } catch (error) {
      console.error("Update domain error:", error);
      errorResponse(res, "Failed to update domain", 500);
    }
  }
);

// Member Routes

/**
 * @route   POST /api/members
 * @desc    Create/Update member profile
 * @access  Private
 */
router.post(
  "/",
  auth,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Check if member profile already exists
      let member = await Member.findOne({ user: userId });

      const {
        displayName,
        tagline,
        bio,
        academicInfo,
        contact,
        skills,
        experience,
        projects,
        achievements,
        certifications,
        interests,
        domains,
        privacy,
      } = req.body;

      // Process uploaded files
      const mediaUpdates = {};

      if (req.files) {
        if (req.files.profilePicture && req.files.profilePicture[0]) {
          const file = req.files.profilePicture[0];
          mediaUpdates["media.profilePicture"] = {
            url: `/uploads/profiles/${file.filename}`,
            filename: file.filename,
          };
        }

        if (req.files.coverPhoto && req.files.coverPhoto[0]) {
          const file = req.files.coverPhoto[0];
          mediaUpdates["media.coverPhoto"] = {
            url: `/uploads/profiles/${file.filename}`,
            filename: file.filename,
          };
        }

        if (req.files.resume && req.files.resume[0]) {
          const file = req.files.resume[0];
          mediaUpdates["contact.resume"] = `/uploads/profiles/${file.filename}`;
        }

        if (req.files.gallery) {
          const galleryItems = req.files.gallery.map((file) => ({
            url: `/uploads/profiles/${file.filename}`,
            filename: file.filename,
            type: file.mimetype.startsWith("image/") ? "image" : "document",
            caption: req.body[`gallery_caption_${file.fieldname}`] || "",
          }));

          if (member) {
            member.media.gallery.push(...galleryItems);
          } else {
            mediaUpdates["media.gallery"] = galleryItems;
          }
        }
      }

      if (member) {
        // Update existing member
        if (displayName) member.displayName = displayName;
        if (tagline) member.tagline = tagline;
        if (bio) member.bio = bio;

        if (academicInfo) {
          member.academicInfo = {
            ...member.academicInfo,
            ...JSON.parse(academicInfo),
          };
        }

        if (contact) {
          member.contact = { ...member.contact, ...JSON.parse(contact) };
        }

        if (skills) {
          member.skills = JSON.parse(skills);
        }

        if (experience) {
          member.experience = JSON.parse(experience);
        }

        if (projects) {
          member.projects = JSON.parse(projects);
        }

        if (achievements) {
          member.achievements = JSON.parse(achievements);
        }

        if (certifications) {
          member.certifications = JSON.parse(certifications);
        }

        if (interests) {
          member.interests = JSON.parse(interests);
        }

        if (domains) {
          member.domains = JSON.parse(domains);
        }

        if (privacy) {
          member.privacy = { ...member.privacy, ...JSON.parse(privacy) };
        }

        // Apply media updates
        Object.keys(mediaUpdates).forEach((key) => {
          const keys = key.split(".");
          if (keys.length === 2) {
            member[keys[0]][keys[1]] = mediaUpdates[key];
          } else {
            member[key] = mediaUpdates[key];
          }
        });

        await member.save();
      } else {
        // Create new member
        member = new Member({
          user: userId,
          displayName,
          tagline,
          bio,
          academicInfo: academicInfo ? JSON.parse(academicInfo) : {},
          contact: contact ? JSON.parse(contact) : {},
          skills: skills ? JSON.parse(skills) : [],
          experience: experience ? JSON.parse(experience) : [],
          projects: projects ? JSON.parse(projects) : [],
          achievements: achievements ? JSON.parse(achievements) : [],
          certifications: certifications ? JSON.parse(certifications) : [],
          interests: interests ? JSON.parse(interests) : [],
          domains: domains ? JSON.parse(domains) : [],
          privacy: privacy ? JSON.parse(privacy) : {},
          media: {
            profilePicture: mediaUpdates["media.profilePicture"] || {},
            coverPhoto: mediaUpdates["media.coverPhoto"] || {},
            gallery: mediaUpdates["media.gallery"] || [],
          },
        });

        if (mediaUpdates["contact.resume"]) {
          member.contact.resume = mediaUpdates["contact.resume"];
        }

        await member.save();
      }

      await member.populate([
        { path: "user", select: "name email" },
        { path: "roles.domain", select: "name code color" },
      ]);

      successResponse(
        res,
        member.isNew
          ? "Member profile created successfully"
          : "Member profile updated successfully",
        member,
        member.isNew ? 201 : 200
      );
    } catch (error) {
      console.error("Create/Update member error:", error);
      errorResponse(res, "Failed to save member profile", 500);
    }
  }
);

/**
 * @route   GET /api/members
 * @desc    Get all members
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const {
      domain,
      position,
      status = "active",
      featured,
      search,
      skills,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {
      "privacy.profileVisibility": { $ne: "private" },
    };

    if (status) {
      query["availability.status"] = status;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    if (domain) {
      query["roles.domain"] = domain;
      query["roles.isActive"] = true;
    }

    if (position) {
      query["roles.position"] = position;
    }

    if (skills) {
      const skillArray = skills.split(",");
      query["skills.name"] = { $in: skillArray };
    }

    // Search functionality
    if (search) {
      query.$or = [
        { displayName: { $regex: search, $options: "i" } },
        { tagline: { $regex: search, $options: "i" } },
        { "skills.name": { $regex: search, $options: "i" } },
        { interests: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const members = await Member.find(query)
      .populate("user", "name email")
      .populate("primaryRole.domain", "name code color")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Member.countDocuments(query);

    successResponse(res, "Members retrieved successfully", {
      members,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get members error:", error);
    errorResponse(res, "Failed to retrieve members", 500);
  }
});

/**
 * @route   GET /api/members/leadership
 * @desc    Get leadership team
 * @access  Public
 */
router.get("/leadership", async (req, res) => {
  try {
    const leadership = await Member.getLeadership();

    // Group by position for better organization
    const groupedLeadership = {
      president: [],
      vicePresident: [],
      secretary: [],
      treasurer: [],
      domainHeads: [],
    };

    leadership.forEach((member) => {
      const activeRole = member.roles.find((role) => role.isActive);
      if (activeRole) {
        switch (activeRole.position) {
          case "president":
            groupedLeadership.president.push(member);
            break;
          case "vice_president":
            groupedLeadership.vicePresident.push(member);
            break;
          case "secretary":
            groupedLeadership.secretary.push(member);
            break;
          case "treasurer":
            groupedLeadership.treasurer.push(member);
            break;
          case "domain_head":
            groupedLeadership.domainHeads.push(member);
            break;
        }
      }
    });

    successResponse(
      res,
      "Leadership team retrieved successfully",
      groupedLeadership
    );
  } catch (error) {
    console.error("Get leadership error:", error);
    errorResponse(res, "Failed to retrieve leadership team", 500);
  }
});

/**
 * @route   GET /api/members/featured
 * @desc    Get featured members
 * @access  Public
 */
router.get("/featured", async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const featured = await Member.getFeatured(parseInt(limit));

    successResponse(res, "Featured members retrieved successfully", featured);
  } catch (error) {
    console.error("Get featured members error:", error);
    errorResponse(res, "Failed to retrieve featured members", 500);
  }
});

/**
 * @route   GET /api/members/domain/:domainId
 * @desc    Get members by domain
 * @access  Public
 */
router.get("/domain/:domainId", async (req, res) => {
  try {
    const { domainId } = req.params;
    const { position } = req.query;

    const members = await Member.getByDomain(domainId, position);

    // Group by position
    const groupedMembers = {};
    members.forEach((member) => {
      const activeRole = member.roles.find(
        (role) => role.domain.equals(domainId) && role.isActive
      );

      if (activeRole) {
        if (!groupedMembers[activeRole.position]) {
          groupedMembers[activeRole.position] = [];
        }
        groupedMembers[activeRole.position].push(member);
      }
    });

    successResponse(res, "Domain members retrieved successfully", {
      members: groupedMembers,
      total: members.length,
    });
  } catch (error) {
    console.error("Get domain members error:", error);
    errorResponse(res, "Failed to retrieve domain members", 500);
  }
});

/**
 * @route   GET /api/members/alumni
 * @desc    Get alumni members
 * @access  Public
 */
router.get("/alumni", async (req, res) => {
  try {
    const { graduationYear, page = 1, limit = 20 } = req.query;

    const alumni = await Member.getAlumni(
      graduationYear ? parseInt(graduationYear) : null
    )
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Member.countDocuments({
      "availability.status": { $in: ["alumni", "graduated"] },
      ...(graduationYear && {
        "alumniInfo.graduationYear": parseInt(graduationYear),
      }),
    });

    // Group by graduation year
    const groupedAlumni = {};
    alumni.forEach((member) => {
      const year = member.alumniInfo?.graduationYear || "Unknown";
      if (!groupedAlumni[year]) {
        groupedAlumni[year] = [];
      }
      groupedAlumni[year].push(member);
    });

    successResponse(res, "Alumni retrieved successfully", {
      alumni: groupedAlumni,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get alumni error:", error);
    errorResponse(res, "Failed to retrieve alumni", 500);
  }
});

/**
 * @route   GET /api/members/profile/:memberId
 * @desc    Get detailed member profile
 * @access  Public
 */
router.get("/profile/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findById(memberId)
      .populate("user", "name email")
      .populate("roles.domain", "name code color description")
      .populate("verifiedBy", "name");

    if (!member) {
      return errorResponse(res, "Member not found", 404);
    }

    // Check privacy settings
    if (member.privacy.profileVisibility === "private") {
      if (
        !req.user ||
        (!member.user.equals(req.user.id) && req.user.role !== "admin")
      ) {
        return errorResponse(res, "Profile is private", 403);
      }
    }

    // Increment profile views (if not owner viewing)
    if (!req.user || !member.user.equals(req.user.id)) {
      await member.incrementProfileViews();
    }

    // Filter sensitive information based on privacy settings
    const filteredMember = member.toObject();

    if (!member.privacy.showEmail) {
      delete filteredMember.contact.email;
    }

    if (!member.privacy.showPhone) {
      delete filteredMember.contact.phone;
    }

    if (!member.privacy.showProjects) {
      filteredMember.projects = [];
    }

    if (!member.privacy.showAchievements) {
      filteredMember.achievements = [];
    }

    successResponse(
      res,
      "Member profile retrieved successfully",
      filteredMember
    );
  } catch (error) {
    console.error("Get member profile error:", error);
    errorResponse(res, "Failed to retrieve member profile", 500);
  }
});

/**
 * @route   GET /api/members/my-profile
 * @desc    Get current user's member profile
 * @access  Private
 */
router.get("/my-profile", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const member = await Member.findOne({ user: userId })
      .populate("user", "name email")
      .populate("roles.domain", "name code color description");

    if (!member) {
      return errorResponse(res, "Member profile not found", 404);
    }

    successResponse(res, "Your profile retrieved successfully", member);
  } catch (error) {
    console.error("Get my profile error:", error);
    errorResponse(res, "Failed to retrieve your profile", 500);
  }
});

/**
 * @route   POST /api/members/:memberId/role
 * @desc    Add role to member (Admin only)
 * @access  Private (Admin)
 */
router.post(
  "/:memberId/role",
  auth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const { position, domainId, responsibilities } = req.body;

      const member = await Member.findById(memberId);
      if (!member) {
        return errorResponse(res, "Member not found", 404);
      }

      const domain = await Domain.findById(domainId);
      if (!domain) {
        return errorResponse(res, "Domain not found", 404);
      }

      await member.addRole(position, domainId, responsibilities);

      await member.populate("roles.domain", "name code color");

      successResponse(res, "Role added successfully", member);
    } catch (error) {
      console.error("Add role error:", error);
      errorResponse(res, "Failed to add role", 500);
    }
  }
);

/**
 * @route   PUT /api/members/:memberId/role/:roleId/deactivate
 * @desc    Deactivate member role (Admin only)
 * @access  Private (Admin)
 */
router.put(
  "/:memberId/role/:roleId/deactivate",
  auth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { memberId, roleId } = req.params;

      const member = await Member.findById(memberId);
      if (!member) {
        return errorResponse(res, "Member not found", 404);
      }

      await member.deactivateRole(roleId);

      successResponse(res, "Role deactivated successfully", member);
    } catch (error) {
      console.error("Deactivate role error:", error);
      errorResponse(res, "Failed to deactivate role", 500);
    }
  }
);

/**
 * @route   POST /api/members/:memberId/verify
 * @desc    Verify member (Admin only)
 * @access  Private (Admin)
 */
router.post(
  "/:memberId/verify",
  auth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { memberId } = req.params;
      const userId = req.user.id;

      const member = await Member.findById(memberId);
      if (!member) {
        return errorResponse(res, "Member not found", 404);
      }

      await member.verify(userId);

      successResponse(res, "Member verified successfully", member);
    } catch (error) {
      console.error("Verify member error:", error);
      errorResponse(res, "Failed to verify member", 500);
    }
  }
);

/**
 * @route   POST /api/members/:memberId/feature
 * @desc    Feature/unfeature member (Admin only)
 * @access  Private (Admin)
 */
router.post(
  "/:memberId/feature",
  auth,
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { memberId } = req.params;

      const member = await Member.findById(memberId);
      if (!member) {
        return errorResponse(res, "Member not found", 404);
      }

      if (member.isFeatured) {
        member.isFeatured = false;
        member.featuredAt = null;
      } else {
        await member.feature();
      }

      await member.save();

      successResponse(
        res,
        `Member ${member.isFeatured ? "featured" : "unfeatured"} successfully`,
        {
          featured: member.isFeatured,
          featuredAt: member.featuredAt,
        }
      );
    } catch (error) {
      console.error("Feature member error:", error);
      errorResponse(res, "Failed to update feature status", 500);
    }
  }
);

module.exports = router;
