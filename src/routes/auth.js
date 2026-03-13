const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/User");

module.exports = (db) => {
  const router = express.Router();

  // POST /api/auth/register
  router.post("/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields required ❌" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters ❌" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await createUser(db, {
        name,
        email,
        password: hashedPassword,
      });

      // Generate token
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

      // Validation
      if (!email || !password) {
        return res.status(400).json({ error: "All fields required ❌" });
      }

      // Find user
      const user = await findUserByEmail(db, email);
      if (!user) {
        return res.status(404).json({ error: "User not found ❌" });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Wrong password ❌" });
      }

      // Generate token
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
      // Get token from header
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "No token ❌" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      const { findUserById } = require("../models/User");
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

  return router;
};