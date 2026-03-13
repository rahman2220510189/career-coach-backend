const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/User");

const authMiddleware = (db) => async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token, access denied ❌" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await findUserById(db, decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found ❌" });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ error: "Invalid token ❌" });
  }
};

const adminMiddleware = (db) => async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token, access denied ❌" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await findUserById(db, decoded.id);
    if (!user) {
      return res.status(401).json({ error: "User not found ❌" });
    }

    // Check admin role
    if (user.role !== "admin") {
      return res.status(403).json({ error: "Admin access only ❌" });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (err) {
    console.error("Admin Middleware Error:", err.message);
    res.status(401).json({ error: "Invalid token ❌" });
  }
};

module.exports = { authMiddleware, adminMiddleware };