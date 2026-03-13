const express = require("express");
const { adminMiddleware } = require("../Middleware/auth");

module.exports = (db) => {
  const router = express.Router();

  // GET /api/admin/users — Get all users
  router.get("/users", adminMiddleware(db), async (req, res) => {
    try {
      const usersCollection = db.collection("users");
      const users = await usersCollection
        .find({}, { projection: { password: 0 } })
        .toArray();

      res.json({ success: true, data: users });

    } catch (err) {
      console.error("Admin Users Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/analyses — Get all analyses
  router.get("/analyses", adminMiddleware(db), async (req, res) => {
    try {
      const analysisCollection = db.collection("analyses");
      const analyses = await analysisCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();

      res.json({ success: true, data: analyses });

    } catch (err) {
      console.error("Admin Analyses Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/interviews — Get all interviews
  router.get("/interviews", adminMiddleware(db), async (req, res) => {
    try {
      const interviewCollection = db.collection("interviews");
      const interviews = await interviewCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();

      res.json({ success: true, data: interviews });

    } catch (err) {
      console.error("Admin Interviews Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/stats — Dashboard stats
  router.get("/stats", adminMiddleware(db), async (req, res) => {
    try {
      const usersCollection = db.collection("users");
      const analysisCollection = db.collection("analyses");
      const interviewCollection = db.collection("interviews");

      // Count all
      const totalUsers = await usersCollection.countDocuments();
      const totalAnalyses = await analysisCollection.countDocuments();
      const totalInterviews = await interviewCollection.countDocuments();
      const completedInterviews = await interviewCollection.countDocuments({ status: "completed" });

      res.json({
        success: true,
        data: {
          totalUsers,
          totalAnalyses,
          totalInterviews,
          completedInterviews,
        },
      });

    } catch (err) {
      console.error("Admin Stats Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/admin/user/:id — Delete a user
  router.delete("/user/:id", adminMiddleware(db), async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const usersCollection = db.collection("users");

      await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });

      res.json({ success: true, message: "User deleted ✅" });

    } catch (err) {
      console.error("Admin Delete User Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /api/admin/user/:id/role — Change user role
  router.patch("/user/:id/role", adminMiddleware(db), async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const { role } = req.body;
      const usersCollection = db.collection("users");

      await usersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { role } }
      );

      res.json({ success: true, message: "Role updated ✅" });

    } catch (err) {
      console.error("Admin Update Role Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};