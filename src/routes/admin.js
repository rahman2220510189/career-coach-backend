const express = require("express");
const { adminMiddleware } = require("../Middleware/auth");

module.exports = (db) => {
  const router = express.Router();

  // GET /api/admin/stats
  router.get("/stats", adminMiddleware(db), async (req, res) => {
    try {
      const usersCollection = db.collection("users");
      const analysisCollection = db.collection("analyses");
      const interviewCollection = db.collection("interviews");
      const cvCollection = db.collection("cvs");
      const contactCollection = db.collection("contacts");

      const totalUsers = await usersCollection.countDocuments();
      const totalAnalyses = await analysisCollection.countDocuments();
      const totalInterviews = await interviewCollection.countDocuments();
      const completedInterviews = await interviewCollection.countDocuments({ status: "completed" });
      const totalCVs = await cvCollection.countDocuments();
      const unreadMessages = await contactCollection.countDocuments({ status: "unread" });

      res.json({
        success: true,
        data: {
          totalUsers,
          totalAnalyses,
          totalInterviews,
          completedInterviews,
          totalCVs,
          unreadMessages,
        },
      });
    } catch (err) {
      console.error("Stats Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/users
  router.get("/users", adminMiddleware(db), async (req, res) => {
    try {
      const usersCollection = db.collection("users");
      const users = await usersCollection
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, data: users });
    } catch (err) {
      console.error("Users Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/admin/user/:id
  router.delete("/user/:id", adminMiddleware(db), async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const usersCollection = db.collection("users");
      await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ success: true, message: "User deleted ✅" });
    } catch (err) {
      console.error("Delete User Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /api/admin/user/:id/role
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
      console.error("Role Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/analyses
  router.get("/analyses", adminMiddleware(db), async (req, res) => {
    try {
      const analysisCollection = db.collection("analyses");
      const analyses = await analysisCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, data: analyses });
    } catch (err) {
      console.error("Analyses Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/interviews
  router.get("/interviews", adminMiddleware(db), async (req, res) => {
    try {
      const interviewCollection = db.collection("interviews");
      const interviews = await interviewCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, data: interviews });
    } catch (err) {
      console.error("Interviews Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/cvs
  router.get("/cvs", adminMiddleware(db), async (req, res) => {
    try {
      const cvCollection = db.collection("cvs");
      const cvs = await cvCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, data: cvs });
    } catch (err) {
      console.error("CVs Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/admin/contacts
  router.get("/contacts", adminMiddleware(db), async (req, res) => {
    try {
      const contactCollection = db.collection("contacts");
      const contacts = await contactCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, data: contacts });
    } catch (err) {
      console.error("Contacts Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /api/admin/contact/:id/read
  router.patch("/contact/:id/read", adminMiddleware(db), async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const contactCollection = db.collection("contacts");
      await contactCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: "read" } }
      );
      res.json({ success: true, message: "Marked as read ✅" });
    } catch (err) {
      console.error("Mark Read Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};