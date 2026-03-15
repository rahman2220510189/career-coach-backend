const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { createUser, findUserByEmail, findUserById } = require("../models/User");
const { sendResetEmail } = require("../utils/sendEmail");

module.exports = (db) => {
  const router = express.Router();

  // POST /api/auth/register
  router.post("/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields required ❌" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters ❌" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await createUser(db, { name, email, password: hashedPassword });

      const token = jwt.sign(
        { id: result.insertedId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.status(201).json({
        success: true,
        token,
        user: { name, email },
      });
    } catch (err) {
      console.error("Register Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/auth/login
  router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "All fields required ❌" });
      }

      const user = await findUserByEmail(db, email);
      if (!user) {
        return res.status(404).json({ error: "User not found ❌" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Wrong password ❌" });
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Login Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/auth/me
  router.get("/me", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token ❌" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findUserById(db, decoded.id);
      if (!user) {
        return res.status(404).json({ error: "User not found ❌" });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Auth Me Error:", err.message);
      res.status(401).json({ error: "Invalid token ❌" });
    }
  });

  // POST /api/auth/forgot-password
  router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email required ❌" });
      }

      const user = await findUserByEmail(db, email);
      if (!user) {
        // Security: same message even if email not found
        return res.json({ success: true, message: "If this email exists, a reset link has been sent ✅" });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save token to DB
      const usersCollection = db.collection("users");
      await usersCollection.updateOne(
        { email },
        { $set: { resetToken, resetTokenExpiry } }
      );

      // Send email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendResetEmail(email, user.name, resetUrl);

      res.json({ success: true, message: "Reset link sent to your email ✅" });

    } catch (err) {
      console.error("Forgot Password Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/auth/reset-password
  router.post("/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: "Token and password required ❌" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters ❌" });
      }

      // Find user with valid token
      const usersCollection = db.collection("users");
      const user = await usersCollection.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset link ❌" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password + remove token
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: { password: hashedPassword },
          $unset: { resetToken: "", resetTokenExpiry: "" },
        }
      );

      res.json({ success: true, message: "Password reset successful ✅" });

    } catch (err) {
      console.error("Reset Password Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};