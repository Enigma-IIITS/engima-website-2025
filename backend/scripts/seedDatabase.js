const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");
require("dotenv").config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    console.log("Cleared existing data");

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "admin@enigma.com",
      password: "admin123",
      role: "admin",
      college: "IIIT Sri City",
      year: "Graduate",
      department: "Computer Science",
      isEmailVerified: true,
    });
    await adminUser.save();
    console.log("Admin user created");

    // Create moderator user
    const moderatorUser = new User({
      name: "Moderator User",
      email: "moderator@enigma.com",
      password: "mod123",
      role: "moderator",
      college: "IIIT Sri City",
      year: "3rd",
      department: "Computer Science",
      isEmailVerified: true,
    });
    await moderatorUser.save();
    console.log("Moderator user created");

    // Create regular users
    const users = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        college: "IIIT Sri City",
        year: "2nd",
        department: "Computer Science",
        phone: "+1234567890",
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
        college: "IIIT Sri City",
        year: "3rd",
        department: "Electronics",
        phone: "+1234567891",
      },
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: "password123",
        college: "NIT Warangal",
        year: "1st",
        department: "Mechanical",
        phone: "+1234567892",
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log("Regular users created");

    // Create sample events
    const events = [
      {
        title: "TechFest 2025",
        description:
          "Annual technical festival featuring competitions, workshops, and exhibitions showcasing the latest in technology and innovation.",
        shortDescription:
          "Annual technical festival with competitions and workshops",
        category: "technical",
        eventType: "offline",
        startDate: new Date("2025-03-15T09:00:00Z"),
        endDate: new Date("2025-03-17T18:00:00Z"),
        registrationEndDate: new Date("2025-03-10T23:59:59Z"),
        venue: "IIIT Sri City Campus",
        maxParticipants: 500,
        registrationFee: 100,
        organizers: [adminUser._id, moderatorUser._id],
        coordinators: [
          {
            name: "Coordinator 1",
            email: "coord1@enigma.com",
            phone: "+1234567893",
          },
        ],
        requirements: ["Laptop", "Student ID"],
        rules: ["Follow event guidelines", "Maintain discipline"],
        tags: ["technology", "competition", "workshop"],
        status: "published",
        isFeatured: true,
        prizes: [
          { position: "1st Place", amount: 10000, description: "Winner prize" },
          {
            position: "2nd Place",
            amount: 5000,
            description: "Runner-up prize",
          },
          {
            position: "3rd Place",
            amount: 2500,
            description: "Third place prize",
          },
        ],
      },
      {
        title: "Cultural Night",
        description:
          "A vibrant evening celebrating diverse cultures through music, dance, and performances by talented students.",
        shortDescription: "Evening of cultural performances and entertainment",
        category: "cultural",
        eventType: "offline",
        startDate: new Date("2025-04-20T18:00:00Z"),
        endDate: new Date("2025-04-20T22:00:00Z"),
        registrationEndDate: new Date("2025-04-15T23:59:59Z"),
        venue: "Main Auditorium",
        maxParticipants: 200,
        registrationFee: 50,
        organizers: [moderatorUser._id],
        coordinators: [
          {
            name: "Cultural Coordinator",
            email: "cultural@enigma.com",
            phone: "+1234567894",
          },
        ],
        requirements: ["Costume (if performing)", "Entry ticket"],
        rules: ["No outside food", "Maintain silence during performances"],
        tags: ["culture", "entertainment", "music", "dance"],
        status: "published",
      },
      {
        title: "Coding Bootcamp",
        description:
          "Intensive 3-day coding bootcamp covering modern web development technologies including React, Node.js, and MongoDB.",
        shortDescription: "Intensive web development bootcamp",
        category: "workshop",
        eventType: "hybrid",
        startDate: new Date("2025-05-01T10:00:00Z"),
        endDate: new Date("2025-05-03T17:00:00Z"),
        registrationEndDate: new Date("2025-04-25T23:59:59Z"),
        venue: "Computer Lab A",
        onlineLink: "https://meet.google.com/bootcamp-2025",
        maxParticipants: 50,
        registrationFee: 200,
        organizers: [adminUser._id],
        coordinators: [
          {
            name: "Tech Lead",
            email: "tech@enigma.com",
            phone: "+1234567895",
          },
        ],
        requirements: [
          "Laptop with development environment",
          "Basic programming knowledge",
        ],
        rules: ["Attend all sessions", "Complete assignments"],
        tags: ["coding", "web development", "programming", "bootcamp"],
        status: "published",
      },
    ];

    const createdEvents = await Event.insertMany(events);
    console.log("Sample events created");

    // Add some registrations
    await createdEvents[0].registerUser(createdUsers[0]._id, {
      additionalInfo: "Excited to participate!",
    });
    await createdEvents[1].registerUser(createdUsers[1]._id);
    await createdEvents[2].registerUser(createdUsers[2]._id, {
      additionalInfo: "Looking forward to learning new technologies",
    });

    console.log("Sample registrations added");
    console.log("Database seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
