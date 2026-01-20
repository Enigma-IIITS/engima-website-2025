const User = require("../models/User");
const { Member, Domain } = require("../models/Member");

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL?.trim();
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD?.trim();

    if (!adminEmail || !adminPassword) return;

    // 1. Cleanup
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      await Member.deleteOne({ user: existingUser._id });
      await User.deleteOne({ _id: existingUser._id });
    }

    // 2. Ensure Domain
    let coreDomain = await Domain.findOne({ code: "CORE" });
    if (!coreDomain) {
      coreDomain = new Domain({ name: "Core", code: "CORE", color: "#00FF00" });
      await coreDomain.save();
    }

    // 3. Create User - DO NOT BCRYPT HERE
    // Your model's pre-save hook will handle the hashing automatically.
    const newAdminUser = new User({
      name: process.env.DEFAULT_ADMIN_NAME?.trim() || "Main Admin",
      email: adminEmail,
      password: adminPassword, // Raw password goes here
      role: "admin",
    });

    const savedUser = await newAdminUser.save();

    // 4. Create Member Profile
    await new Member({
      user: savedUser._id,
      displayName: savedUser.name,
      primaryRole: { position: "president", domain: coreDomain._id },
      roles: [
        {
          position: "president",
          domain: coreDomain._id,
          isActive: true,
          startDate: new Date(),
        },
      ],
    }).save();

    console.log("✨ Admin seeded and hashed by Model.");
  } catch (error) {
    console.error("❌ Seeder Error:", error);
  }
};
module.exports = seedAdmin;
