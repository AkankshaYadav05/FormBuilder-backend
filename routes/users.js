import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.js";
import Form from "../models/Form.js";
import Response from "../models/Response.js";

const router = express.Router();

// ===== SIGNUP =====
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.status(400).json({ msg: "Account already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    req.session.userId = user._id; 
    res.status(200).json({ msg: "Signup successful", username: user.username });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// ===== LOGIN =====
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    req.session.userId = user._id;
    res.json({ msg: "Login successful", username: user.username });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server error" });
  }
});



// ===== GET PROFILE =====
router.get("/profile", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ msg: "Not logged in" });
    }

    const user = await User.findById(req.session.userId)
      .select("username email profileImage createdAt");
    if (!user) return res.status(404).json({ msg: "User not found" });

    const forms = await Form.find({ user: req.session.userId }).select("_id");

    const totalResponses = await Response.countDocuments({
      formId: { $in: forms.map(f => f._id) }
    });

    res.status(200).json({
       _id: user._id, 
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      totalForms: forms.length,
      totalResponses   
    });

  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ msg: err.message });
  }
});

// ===== UPDATE PROFILE =====
router.put("/profile", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ msg: "Not logged in" });
    }

    const updateData = {};
    if (req.body.username) updateData.username = req.body.username;
    if (req.body.profileImage) updateData.profileImage = req.body.profileImage;

    const updatedUser = await User.findByIdAndUpdate(
      req.session.userId,
      updateData,
      { new: true }
    ).select("username email profileImage");

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});



// ===== CHECK SESSION =====
router.get("/me", async (req, res) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('username email');
      if (user) {
        return res.json({ loggedIn: true, userId: req.session.userId, username: user.username });
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  }
  res.json({ loggedIn: false });
});

// ===== LOGOUT =====
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ msg: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ msg: "Logged out successfully" });
  });
});

export default router;
