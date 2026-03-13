const express = require("express");
const { buildInterviewPrompt } = require("../utils/analysisPrompt");
const { callAI } = require("../../config/apiCall");

module.exports = (db) => {
  const router = express.Router();

  // POST /api/interview/start
  router.post("/start", async (req, res) => {
    try {
      const { jobTitle, interviewTopics, candidateName } = req.body;

      if (!jobTitle || !interviewTopics) {
        return res.status(400).json({ error: "Job title and topics required ❌" });
      }

      // Save session to MongoDB
      const interviewCollection = db.collection("interviews");
      const session = await interviewCollection.insertOne({
        candidateName,
        jobTitle,
        interviewTopics,
        questions: [],
        totalScore: 0,
        createdAt: new Date(),
        status: "ongoing",
      });

      // First question prompt
      const prompt = `
You are a professional interviewer.
Job Position: ${jobTitle}
Candidate: ${candidateName}
Topics to cover: ${interviewTopics.join(", ")}

Ask the first interview question.
Return ONLY a valid JSON object:
{
  "question": "<your first interview question>",
  "questionNumber": 1,
  "totalQuestions": 8
}`;

      const aiResponse = await callAI(prompt);
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);

      res.json({
        success: true,
        sessionId: session.insertedId,
        data: result,
      });

    } catch (err) {
      console.error("Interview Start Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/interview/answer
  router.post("/answer", async (req, res) => {
    try {
      const { sessionId, question, answer, context } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer required ❌" });
      }

      // Build prompt
      const prompt = buildInterviewPrompt(context, question, answer);

      // Call AI
      const aiResponse = await callAI(prompt);
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      const result = JSON.parse(clean);

      // Save to MongoDB
      const interviewCollection = db.collection("interviews");
      const { ObjectId } = require("mongodb");
      await interviewCollection.updateOne(
        { _id: new ObjectId(sessionId) },
        {
          $push: {
            questions: {
              question,
              answer,
              score: result.score,
              feedback: result.good,
              improvement: result.improve,
            },
          },
          $inc: { totalScore: result.score },
        }
      );

      res.json({ success: true, data: result });

    } catch (err) {
      console.error("Interview Answer Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/interview/finish
  router.post("/finish", async (req, res) => {
    try {
      const { sessionId } = req.body;
      const { ObjectId } = require("mongodb");

      const interviewCollection = db.collection("interviews");

      // Get session
      const session = await interviewCollection.findOne({
        _id: new ObjectId(sessionId),
      });

      if (!session) {
        return res.status(404).json({ error: "Session not found ❌" });
      }

      // Calculate final score
      const avgScore = session.questions.length > 0
        ? Math.round(session.totalScore / session.questions.length * 10)
        : 0;

      // Update status
      await interviewCollection.updateOne(
        { _id: new ObjectId(sessionId) },
        {
          $set: {
            status: "completed",
            finalScore: avgScore,
            completedAt: new Date(),
          },
        }
      );

      res.json({
        success: true,
        data: {
          finalScore: avgScore,
          totalQuestions: session.questions.length,
          questions: session.questions,
        },
      });

    } catch (err) {
      console.error("Interview Finish Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};