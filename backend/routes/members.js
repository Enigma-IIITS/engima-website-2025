const express = require("express");
const router = express.Router();
const { Member, Domain } = require("../models/Member");
const User = require("../models/User");
const { auth, admin, moderator } = require("../middleware/auth");
const { validateMember, validateDomain } = require("../utils/validation");
const { sendSuccessResponse, sendErrorResponse } = require("../utils/response");
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
router.post("/domains", auth, admin, async (req, res) => {
  try {
    const errors = validateDomain(req.body);
    if (errors.length > 0) {
      return sendErrorResponse(res, "Validation failed", 400, errors);
    }

    const { name, code, description, icon, color } = req.body;

    // Check if domain already exists
    const existingDomain = await Domain.findOne({
      $or: [{ name }, { code }],
    });

    if (existingDomain) {
      return sendErrorResponse(
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

    sendSuccessResponse(res, "Domain created successfully", domain, 201);
  } catch (error) {
    console.error("Create domain error:", error);
    sendErrorResponse(res, "Failed to create domain", 500);
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

    sendSuccessResponse(res, "Domains retrieved successfully", domains);
  } catch (error) {
    console.error("Get domains error:", error);
    sendErrorResponse(res, "Failed to retrieve domains", 500);
  }
});

/**
 * @route   PUT /api/members/domains/:domainId
 * @desc    Update domain
 * @access  Private (Admin only)
 */
router.put("/domains/:domainId", auth, admin, async (req, res) => {
  try {
    const { domainId } = req.params;

    const domain = await Domain.findById(domainId);
    if (!domain) {
      return sendErrorResponse(res, "Domain not found", 404);
    }

    const { name, description, icon, color, isActive } = req.body;

    if (name) domain.name = name;
    if (description) domain.description = description;
    if (icon) domain.icon = icon;
    if (color) domain.color = color;
    if (isActive !== undefined) domain.isActive = isActive;

    await domain.save();

    sendSuccessResponse(res, "Domain updated successfully", domain);
  } catch (error) {
    console.error("Update domain error:", error);
    sendErrorResponse(res, "Failed to update domain", 500);
  }
});

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

      sendSuccessResponse(
        res,
        member.isNew
          ? "Member profile created successfully"
          : "Member profile updated successfully",
        member,
        member.isNew ? 201 : 200
      );
    } catch (error) {
      console.error("Create/Update member error:", error);
      sendErrorResponse(res, "Failed to save member profile", 500);
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
      status,
      featured,
      search,
      skills,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    console.log("Members query params:", req.query);

    // Build query - make it less restrictive initially
    const query = {};

    // Only filter by privacy if explicitly requested
    if (!search && status !== "all") {
      // Don't apply privacy filter by default
      // query["privacy.profileVisibility"] = { $ne: "private" };
    }

    // Make status filtering optional
    if (status && status !== "all" && status !== "") {
      query["availability.status"] = status;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    // Fix domain filtering - make more flexible with ObjectId conversion
    if (domain) {
      const mongoose = require('mongoose');
      let domainId;
      
      if (mongoose.Types.ObjectId.isValid(domain)) {
        domainId = new mongoose.Types.ObjectId(domain);
      } else {
        domainId = domain;
      }

      // Try both approaches
      query.$or = [
        {
          "roles": {
            $elemMatch: {
              domain: domainId,
              isActive: true,
            },
          }
        },
        {
          "roles.domain": domainId,
        }
      ];
    }

    // Fix position filtering
    if (position && !domain) {
      // If only position specified, don't use domain-specific logic
      query["roles.position"] = position;
    } else if (position && domain) {
      // If both specified, need to update the $or query
      if (query.$or) {
        query.$or[0]["roles"].$elemMatch.position = position;
      }
    }    GET /api/members?status=all

    if (skills) {
      const skillArray = skills.split(",").map((skill) => skill.trim());
      query["skills.name"] = { $in: skillArray };
    }

    // Search functionality - make it more comprehensive
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { displayName: searchRegex },
        { tagline: searchRegex },
        { bio: searchRegex },
        { "skills.name": searchRegex },
        { interests: searchRegex },
        { "academicInfo.branch": searchRegex },
        { "contact.github": searchRegex },
        { "contact.portfolio": searchRegex },
      ];
    }

    console.log("Final MongoDB query:", JSON.stringify(query, null, 2));

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with proper population
    const members = await Member.find(query)
      .populate("user", "name email")
      .populate("roles.domain", "name code color")
      .populate("primaryRole.domain", "name code color")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Member.countDocuments(query);

    console.log(`Query returned ${members.length} members, total: ${total}`);

    // If no results, try progressive fallbacks
    if (members.length === 0 && Object.keys(query).length > 0) {
      console.log("No members found with query, trying fallbacks...");

      // Try without any filters
      const allMembers = await Member.find({}).limit(5);
      console.log(`Total members in DB: ${allMembers.length}`);

      // If domain was specified, check if it exists
      if (domain) {
        const { Domain } = require("../models/Member");
        const domainExists = await Domain.findById(domain);
        console.log("Domain exists:", !!domainExists);
        if (domainExists) {
          console.log("Domain details:", domainExists.name, domainExists.code);
        }

        // Check how many members have ANY roles
        const membersWithRoles = await Member.find({ "roles.0": { $exists: true } }).limit(5);
        console.log(`Members with roles: ${membersWithRoles.length}`);

        // Check specific domain matches
        const mongoose = require('mongoose');
        const domainMatches = await Member.find({
          "roles.domain": mongoose.Types.ObjectId.isValid(domain) 
            ? new mongoose.Types.ObjectId(domain) 
            : domain
        }).limit(5);
        console.log(`Members with domain ${domain}: ${domainMatches.length}`);
      }
    }

    sendSuccessResponse(res, "Members retrieved successfully", {
      members,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      debug: {
        queryParams: req.query,
        mongoQuery: query,
        totalFound: total,
        resultsReturned: members.length,
      },
    });
  } catch (error) {
    console.error("Get members error:", error);
    sendErrorResponse(res, "Failed to retrieve members", 500);
  }
});

/**
 * @route   GET /api/members/debug
 * @desc    Debug route to check member data
 * @access  Public (temporary for debugging)
 */
router.get("/debug", async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments({});
    const membersWithPrivacy = await Member.countDocuments({
      "privacy.profileVisibility": { $ne: "private" },
    });
    const activeMembers = await Member.countDocuments({
      "availability.status": "active",
    });

    const sampleMembers = await Member.find({})
      .populate("user", "name email")
      .limit(3);

    const availabilityStatuses = await Member.distinct("availability.status");
    const privacySettings = await Member.distinct("privacy.profileVisibility");

    sendSuccessResponse(res, "Debug information retrieved", {
      counts: {
        total: totalMembers,
        withPrivacy: membersWithPrivacy,
        active: activeMembers,
      },
      availableStatuses: availabilityStatuses,
      privacySettings: privacySettings,
      sampleMembers: sampleMembers.map((m) => ({
        id: m._id,
        displayName: m.displayName,
        user: m.user,
        availability: m.availability,
        privacy: m.privacy,
        roles: m.roles?.length || 0,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    sendErrorResponse(res, "Failed to get debug info", 500);
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

    sendSuccessResponse(
      res,
      "Leadership team retrieved successfully",
      groupedLeadership
    );
  } catch (error) {
    console.error("Get leadership error:", error);
    sendErrorResponse(res, "Failed to retrieve leadership team", 500);
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

    sendSuccessResponse(
      res,
      "Featured members retrieved successfully",
      featured
    );
  } catch (error) {
    console.error("Get featured members error:", error);
    sendErrorResponse(res, "Failed to retrieve featured members", 500);
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

    sendSuccessResponse(res, "Domain members retrieved successfully", {
      members: groupedMembers,
      total: members.length,
    });
  } catch (error) {
    console.error("Get domain members error:", error);
    sendErrorResponse(res, "Failed to retrieve domain members", 500);
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

    sendSuccessResponse(res, "Alumni retrieved successfully", {
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
    sendErrorResponse(res, "Failed to retrieve alumni", 500);
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
      return sendErrorResponse(res, "Member not found", 404);
    }

    // Check privacy settings
    if (member.privacy.profileVisibility === "private") {
      if (
        !req.user ||
        (!member.user.equals(req.user.id) && req.user.role !== "admin")
      ) {
        return sendErrorResponse(res, "Profile is private", 403);
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

    sendSuccessResponse(
      res,
      "Member profile retrieved successfully",
      filteredMember
    );
  } catch (error) {
    console.error("Get member profile error:", error);
    sendErrorResponse(res, "Failed to retrieve member profile", 500);
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
      return sendErrorResponse(res, "Member profile not found", 404);
    }

    sendSuccessResponse(res, "Your profile retrieved successfully", member);
  } catch (error) {
    console.error("Get my profile error:", error);
    sendErrorResponse(res, "Failed to retrieve your profile", 500);
  }
});

/**
 * @route   POST /api/members/:memberId/role
 * @desc    Add role to member (Admin only)
 * @access  Private (Admin)
 */
router.post("/:memberId/role", auth, admin, async (req, res) => {
  try {
    const { memberId } = req.params;
    const { position, domainId, responsibilities } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return sendErrorResponse(res, "Member not found", 404);
    }

    const domain = await Domain.findById(domainId);
    if (!domain) {
      return sendErrorResponse(res, "Domain not found", 404);
    }

    await member.addRole(position, domainId, responsibilities);

    await member.populate("roles.domain", "name code color");

    sendSuccessResponse(res, "Role added successfully", member);
  } catch (error) {
    console.error("Add role error:", error);
    sendErrorResponse(res, "Failed to add role", 500);
  }
});

/**
 * @route   PUT /api/members/:memberId/role/:roleId/deactivate
 * @desc    Deactivate member role (Admin only)
 * @access  Private (Admin)
 */
router.put(
  "/:memberId/role/:roleId/deactivate",
  auth,
  admin,
  async (req, res) => {
    try {
      const { memberId, roleId } = req.params;

      const member = await Member.findById(memberId);
      if (!member) {
        return sendErrorResponse(res, "Member not found", 404);
      }

      await member.deactivateRole(roleId);

      sendSuccessResponse(res, "Role deactivated successfully", member);
    } catch (error) {
      console.error("Deactivate role error:", error);
      sendErrorResponse(res, "Failed to deactivate role", 500);
    }
  }
);

/**
 * @route   POST /api/members/:memberId/verify
 * @desc    Verify member (Admin only)
 * @access  Private (Admin)
 */
router.post("/:memberId/verify", auth, admin, async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user.id;

    const member = await Member.findById(memberId);
    if (!member) {
      return sendErrorResponse(res, "Member not found", 404);
    }

    await member.verify(userId);

    sendSuccessResponse(res, "Member verified successfully", member);
  } catch (error) {
    console.error("Verify member error:", error);
    sendErrorResponse(res, "Failed to verify member", 500);
  }
});

/**
 * @route   POST /api/members/:memberId/feature
 * @desc    Feature/unfeature member (Admin only)
 * @access  Private (Admin)
 */
router.post("/:memberId/feature", auth, admin, async (req, res) => {
  try {
    const { memberId } = req.params;

    const member = await Member.findById(memberId);
    if (!member) {
      return sendErrorResponse(res, "Member not found", 404);
    }

    if (member.isFeatured) {
      member.isFeatured = false;
      member.featuredAt = null;
    } else {
      await member.feature();
    }

    await member.save();

    sendSuccessResponse(
      res,
      `Member ${member.isFeatured ? "featured" : "unfeatured"} successfully`,
      {
        featured: member.isFeatured,
        featuredAt: member.featuredAt,
      }
    );
  } catch (error) {
    console.error("Feature member error:", error);
    sendErrorResponse(res, "Failed to update feature status", 500);
  }
});

module.exports = router;
