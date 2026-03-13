const axios = require("axios");
const { getNextKey } = require("./apiKeys");

const GROQ_MODEL = "llama-3.3-70b-versatile";

const callAI = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    const { key, type } = getNextKey();
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      return res.data.choices[0]?.message?.content || "";

    } catch (err) {
      const status = err.response?.status;
      console.log(`Key ${i + 1} failed (${type}) — Status: ${status}, trying next...`);
      if (status === 429 || status === 503 || status === 500) {
        continue;
      }
      throw err;
    }
  }
  throw new Error("All API keys exhausted ❌");
};

module.exports = { callAI };