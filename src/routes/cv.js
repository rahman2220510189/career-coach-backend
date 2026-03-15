const express = require("express");
const https = require("https");
const http = require("http");
const { buildCVPrompt } = require("../utils/cvPrompt");
const { callAI } = require("../../config/apiCall");
const { authMiddleware } = require("../middleware/auth");

const scrapeJobDescription = (url) => {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith("https") ? https : http;
      const req = client.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 8000,
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return scrapeJobDescription(res.headers.location).then(resolve);
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            let cleaned = data
              .replace(/<script[\s\S]*?<\/script>/gi, "")
              .replace(/<style[\s\S]*?<\/style>/gi, "")
              .replace(/<nav[\s\S]*?<\/nav>/gi, "")
              .replace(/<header[\s\S]*?<\/header>/gi, "")
              .replace(/<footer[\s\S]*?<\/footer>/gi, "")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s{2,}/g, " ")
              .trim();
            const maxLen = 4000;
            if (cleaned.length > maxLen) {
              const start = Math.floor(cleaned.length * 0.15);
              cleaned = cleaned.substring(start, start + maxLen);
            }
            resolve(cleaned || null);
          } catch { resolve(null); }
        });
      });
      req.on("error", () => resolve(null));
      req.on("timeout", () => { req.destroy(); resolve(null); });
    } catch { resolve(null); }
  });
};

module.exports = (db) => {
  const router = express.Router();

  router.post("/generate", authMiddleware(db), async (req, res) => {
    try {
      const { personalInfo, jobUrl, experience, education, skills, projects, volunteer, awards, references } = req.body;

      if (!personalInfo?.name || !personalInfo?.email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      let jobDescription = null;
      if (jobUrl?.trim()) {
        console.log("Scraping job URL:", jobUrl);
        jobDescription = await scrapeJobDescription(jobUrl.trim());
        console.log(jobDescription ? "Job scraped: " + jobDescription.length + " chars" : "Scrape failed, continuing without");
      }

      const cvData = {
        personalInfo,
        jobUrl: jobUrl || null,
        jobDescription,
        experience:  experience  || [],
        education:   education   || [],
        skills:      skills      || { technical: [], soft: [], languages: [], certificates: [] },
        projects:    projects    || [],
        volunteer:   volunteer   || [],
        awards:      awards      || [],
        references:  references  || [],
      };

      const prompt = buildCVPrompt(cvData);
      console.log("Generating CV...");
      const aiResponse = await callAI(prompt);
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);

      const cvCollection = db.collection("cvs");
      const saved = await cvCollection.insertOne({
        userId: req.user._id,
        ...result,
        rawData: cvData,
        jobUrl: jobUrl || null,
        createdAt: new Date(),
      });

      res.json({ success: true, cvId: saved.insertedId, data: result });

    } catch (err) {
      console.error("CV Generate Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/my-cvs", authMiddleware(db), async (req, res) => {
    try {
      const cvs = await db.collection("cvs")
        .find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .toArray();
      res.json({ success: true, data: cvs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get("/:id", authMiddleware(db), async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      const cv = await db.collection("cvs").findOne({
        _id: new ObjectId(req.params.id),
        userId: req.user._id,
      });
      if (!cv) return res.status(404).json({ error: "CV not found" });
      res.json({ success: true, data: cv });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.delete("/:id", authMiddleware(db), async (req, res) => {
    try {
      const { ObjectId } = require("mongodb");
      await db.collection("cvs").deleteOne({
        _id: new ObjectId(req.params.id),
        userId: req.user._id,
      });
      res.json({ success: true, message: "CV deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};