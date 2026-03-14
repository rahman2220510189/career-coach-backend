const express = require("express");
const { buildCVPrompt } = require("../utils/cvPrompt");
const { callAI } = require("../../config/apiCall");
const { authMiddleware } = require("../middleware/auth");

module.exports = (db) => {
  const router = express.Router();

  // POST /api/cv/generate
  router.post("/generate", authMiddleware(db), async (req, res) => {
    try {
      const {
        personalInfo,
        experience,
        education,
        skills,
        projects,
        volunteer,
        awards,
        references,
      } = req.body;

      // Validation — only name & email required, everything else optional
      if (!personalInfo?.name || !personalInfo?.email) {
        return res.status(400).json({ error: "Name and email are required ❌" });
      }

      // Build prompt with full data
      const cvData = {
        personalInfo,
        experience:  experience  || [],
        education:   education   || [],
        skills:      skills      || { technical: [], soft: [], languages: [], certificates: [] },
        projects:    projects    || [],
        volunteer:   volunteer   || [],
        awards:      awards      || [],
        references:  references  || [],   // ← optional, included if provided
      };

      const prompt = buildCVPrompt(cvData);

      // Call AI
      console.log("🤖 Generating ATS-friendly CV...");
      const aiResponse = await callAI(prompt);
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);

      // Save to MongoDB
      const cvCollection = db.collection("cvs");
      const saved = await cvCollection.insertOne({
        userId: req.user._id,
        ...result,
        rawData: cvData,
        createdAt: new Date(),
      });

      res.json({
        success: true,
        cvId: saved.insertedId,
        data: result,
      });

    } catch (err) {
      console.error("CV Generate Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/cv/my-cvs — Get all CVs of logged in user
  router.get("/my-cvs", authMiddleware(db), async (req, res) => {
    try {
      const cvCollection = db.collection("cvs");
      const cvs = await cvCollection
        .find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .toArray();

      res.json({ success: true, data: cvs });

    } catch (err) {
      console.error("Get CVs Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /api/cv/:id — Get single CV
  router.get("/:id", authMiddleware(db), async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const cvCollection = db.collection("cvs");

      const cv = await cvCollection.findOne({
        _id: new ObjectId(req.params.id),
        userId: req.user._id,
      });

      if (!cv) {
        return res.status(404).json({ error: "CV not found ❌" });
      }

      res.json({ success: true, data: cv });

    } catch (err) {
      console.error("Get CV Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/cv/:id — Delete CV
  router.delete("/:id", authMiddleware(db), async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const cvCollection = db.collection("cvs");

      await cvCollection.deleteOne({
        _id: new ObjectId(req.params.id),
        userId: req.user._id,
      });

      res.json({ success: true, message: "CV deleted ✅" });

    } catch (err) {
      console.error("Delete CV Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};