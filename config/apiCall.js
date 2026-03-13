const axios = require("axios");
const { getNextKey } = require("./apiKeys");

const HF_MODEL = "mistralai/Mistral-7B-Instruct-v0.2";
const GROK_MODEL = "grok-2-latest";

const callAI = async (prompt, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    const { key, type } = getNextKey();

    try {
      if (type === "huggingface") {
        const res = await axios.post(
          `https://api-inference.huggingface.co/models/${HF_MODEL}`,
          {
            inputs: prompt,
            parameters: { max_new_tokens: 1000, temperature: 0.7 },
          },
          {
            headers: { Authorization: `Bearer ${key}` },
            timeout: 30000,
          }
        );
        return res.data[0]?.generated_text || "";

      } else if (type === "grok") {
        const res = await axios.post(
          "https://api.x.ai/v1/chat/completions",
          {
            model: GROK_MODEL,
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
      }

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
