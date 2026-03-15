const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // POST /api/contact
  router.post("/", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validation
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields required ❌" });
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format ❌" });
      }

      // Save to MongoDB
      const contactCollection = db.collection("contacts");
      await contactCollection.insertOne({
        name,
        email,
        subject,
        message,
        status: "unread",
        createdAt: new Date(),
      });

      res.json({ success: true, message: "Message sent successfully ✅" });

    } catch (err) {
      console.error("Contact Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/contact — Admin only — Get all messages
  router.get("/", async (req, res) => {
    try {
      const contactCollection = db.collection("contacts");
      const contacts = await contactCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();

      res.json({ success: true, data: contacts });

    } catch (err) {
      console.error("Get Contacts Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // PATCH /api/contact/:id/read — Mark as read
  router.patch("/:id/read", async (req, res) => {
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