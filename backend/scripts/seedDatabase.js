const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");
const RSVP = require("../models/RSVP"); // Import RSVP model for clearing

const seedData = async () => {
  try {
    // --- 1. Connect to MongoDB ---
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in your .env file!");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // --- 2. Clear Existing Data ---
    // WARNING: This will delete all users, events, and RSVPs.
    await User.deleteMany({});
    await Event.deleteMany({});
    await RSVP.deleteMany({});
    console.log("🧹 Cleared existing Users, Events, and RSVPs");

    // --- 3. Create Admin User ---
    const adminUser = new User({
      name: "Admin Enigma",
      email: "admin@enigma.com",
      password: "Admin@123", // Password meets validation rules
      role: "admin",
      college: "IIIT Sri City",
      isEmailVerified: true,
    });
    await adminUser.save();
    console.log("👤 Admin user created");

    // --- 4. Create a Regular User for Testing RSVP ---
    const testUser = new User({
      name: "John Doe",
      email: "john@example.com",
      password: "Password@123", // Password meets validation rules
      college: "IIIT Sri City",
      isEmailVerified: true,
    });
    await testUser.save();
    console.log("👤 Regular user 'John Doe' created");

    // --- 5. Create Sample Events ---
    const events = [
      {
        title: "Cybersecurity Capture The Flag",
        description:
          "A thrilling 24-hour Capture The Flag (CTF) competition. Test your ethical hacking skills, solve challenges across various domains like web exploitation, cryptography, and reverse engineering. Prizes for top teams!",
        category: "competition",
        eventType: "online",
        startDate: new Date("2025-10-18T10:00:00Z"),
        endDate: new Date("2025-10-19T10:00:00Z"),
        registrationEndDate: new Date("2025-10-15T23:59:59Z"),
        onlineLink: "https://ctf.enigma.com",
        maxParticipants: 100,
        registrationFee: 0,
        organizers: [adminUser._id],
        tags: ["cybersecurity", "ctf", "hacking", "competition"],
        status: "published",
        isFeatured: true,
      },
      {
        title: "Intro to Distributed Systems Workshop",
        description:
          "A hands-on workshop covering the fundamentals of distributed systems. Learn about scalability, fault tolerance, and consensus algorithms like Raft. Perfect for aspiring backend engineers.",
        category: "workshop",
        eventType: "hybrid",
        startDate: new Date("2025-11-05T09:00:00Z"),
        endDate: new Date("2025-11-05T13:00:00Z"),
        registrationEndDate: new Date("2025-11-01T23:59:59Z"),
        venue: "Seminar Hall C",
        onlineLink: "https://meet.google.com/enigma-workshop",
        maxParticipants: 50,
        registrationFee: 150,
        organizers: [adminUser._id],
        tags: ["distributed systems", "backend", "workshop", "scalability"],
        status: "published",
      },
    ];

    await Event.insertMany(events);
    console.log("🗓️  2 sample events created");
    console.log("\n✨ Database seeded successfully!");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedData();
