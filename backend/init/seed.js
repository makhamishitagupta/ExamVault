import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config(); 

const DB_URL = process.env.MONGO_DB_URL;
await mongoose.connect(DB_URL);

// Create admin user
const adminHashedPassword = await bcrypt.hash("admin123", 10);
await User.create({
  name: "Admin",
  email: "admin@examvault.com",
  username: "examvault_admin",
  password: adminHashedPassword,
  role: "admin"
});

// Create student user
const studentHashedPassword = await bcrypt.hash("student123", 10);
await User.create({
  name: "Student",
  email: "student@examvault.com",
  username: "examvault_student",
  password: studentHashedPassword,
  role: "student"
});

console.log("Users created successfully");
console.log("Admin: admin@examvault.com / admin123");
console.log("Student: student@examvault.com / student123");
process.exit();
