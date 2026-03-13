const express = require("express");
const multer = require("multer");
const { extractTextFromPDF } = require("../utils/pdfParse");
const { scrapeJobDescription } = require("../utils/scrapeJob");
const { buildAnalysisPrompt } = require("../utils/analysisPrompt");
const { callAI } = require("../../config/apiCall");

const upload = multer({ storage: multer.memoryStorage() });

// Accept db as parameter
module.exports = (db) => {
  const router = express.Router();

  // POST /api/analyze
  router.post("/", upload.single("cv"), async (req, res) => {
    try {
      const { jobUrl } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "CV PDF required ❌" });
      }
      if (!jobUrl) {
        return res.status(400).json({ error: "Job URL required ❌" });
      }

      // Step 1 — Extract text from PDF
      console.log("📄 PDF parsing...");
      const cvText = await extractTextFromPDF(req.file.buffer);

      // Step 2 — Scrape job description
      console.log("🌐 Scraping job description...");
      const jobDescription = await scrapeJobDescription(jobUrl);

      // Step 3 — Build AI prompt
      console.log("🤖 Calling AI...");
      const prompt = buildAnalysisPrompt(cvText, jobDescription);

      // Step 4 — Call AI
      const aiResponse = await callAI(prompt);

      // Step 5 — Parse JSON response
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);

      // Step 6 — Save to MongoDB
      const analysisCollection = db.collection("analyses");
      await analysisCollection.insertOne({
        ...result,
        createdAt: new Date(),
      });

      res.json({ success: true, data: result });

    } catch (err) {
      console.error("Analysis Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};