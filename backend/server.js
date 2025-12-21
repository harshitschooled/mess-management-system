const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("./models/User");
const Attendance = require("./models/Attendance");
const adminMiddleware = require("./middleware/admin");

const app = express();
const PORT = process.env.PORT || 5000;


// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= MONGODB CONNECTION =================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("Backend running OK");
});

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  await new User({
    name,
    email,
    password: hashed,
    role: role || "student",
  }).save();

  res.json({ message: "User registered successfully" });
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ message: "Login successful", token, role: user.role });
});

// ================= ATTENDANCE =================
app.post("/attendance", authMiddleware, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const exists = await Attendance.findOne({
    user: req.user.id,
    date: today,
  });

  if (exists)
    return res.status(400).json({ message: "Attendance already marked today" });

  await new Attendance({
    user: req.user.id,
    date: today,
    willEat: req.body.willEat,
  }).save();

  res.json({ message: "Attendance marked", willEat: req.body.willEat });
});

// ================= ADMIN: DAILY SUMMARY =================
app.get(
  "/admin/summary",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    const today = new Date().toISOString().split("T")[0];

    const total = await Attendance.countDocuments({ date: today });
    const eating = await Attendance.countDocuments({
      date: today,
      willEat: true,
    });

    res.json({
      date: today,
      totalStudentsResponded: total,
      studentsEating: eating,
      studentsNotEating: total - eating,
    });
  }
);

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
