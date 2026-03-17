// utils/seeder.js
// Sample test data for development/demo purposes
// Run with: node utils/seeder.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Skill = require("../models/Skill");

const connectDB = require("../config/db");

const seedData = async () => {
  await connectDB();

  try {
    // Clear existing data
    await User.deleteMany();
    await Skill.deleteMany();
    console.log("🗑️  Cleared existing data");

    // Create sample users
    const users = await User.create([
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: "password123",
        bio: "Frontend developer who loves to teach React and learn Python.",
        skillsToTeach: ["React", "JavaScript", "CSS"],
        skillsToLearn: ["Python", "Machine Learning", "Data Analysis"],
        lmsScore: 20,
      },
      {
        name: "Bob Smith",
        email: "bob@example.com",
        password: "password123",
        bio: "Python developer interested in web development.",
        skillsToTeach: ["Python", "Data Analysis", "Flask"],
        skillsToLearn: ["React", "Node.js", "UI Design"],
        lmsScore: 15,
      },
      {
        name: "Carol Davis",
        email: "carol@example.com",
        password: "password123",
        bio: "UX Designer who wants to learn coding.",
        skillsToTeach: ["UI Design", "Figma", "User Research"],
        skillsToLearn: ["JavaScript", "React", "CSS"],
        lmsScore: 10,
      },
      {
        name: "David Lee",
        email: "david@example.com",
        password: "password123",
        bio: "Full stack developer and music producer.",
        skillsToTeach: ["Node.js", "MongoDB", "Music Production"],
        skillsToLearn: ["UI Design", "Figma", "Flutter"],
        lmsScore: 25,
      },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample skill listings
    await Skill.create([
      {
        user: users[0]._id,
        title: "Learn React from scratch",
        description: "I will teach you React including hooks, state management and component design.",
        category: "Web Development",
        offering: "React",
        seeking: "Python",
        level: "Beginner",
      },
      {
        user: users[1]._id,
        title: "Python for data science",
        description: "Learn Python, pandas, and numpy with real projects.",
        category: "Data Science",
        offering: "Python",
        seeking: "React",
        level: "Intermediate",
      },
      {
        user: users[2]._id,
        title: "UI/UX Design fundamentals",
        description: "Learn Figma, wireframing, and user-centered design principles.",
        category: "Design",
        offering: "UI Design",
        seeking: "JavaScript",
        level: "Beginner",
      },
      {
        user: users[3]._id,
        title: "Backend development with Node.js",
        description: "Build REST APIs with Express, connect MongoDB, and deploy.",
        category: "Web Development",
        offering: "Node.js",
        seeking: "UI Design",
        level: "Intermediate",
      },
    ]);

    console.log("✅ Created skill listings");
    console.log("\n🎉 Seed complete! Test credentials:");
    console.log("   alice@example.com / password123");
    console.log("   bob@example.com   / password123");
    console.log("   carol@example.com / password123");
    console.log("   david@example.com / password123\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeder error:", err);
    process.exit(1);
  }
};

seedData();
