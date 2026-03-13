const KEYS = [
  { key: process.env.HF_KEY_1, type: "huggingface" },
  { key: process.env.HF_KEY_2, type: "huggingface" },
  { key: process.env.HF_KEY_3, type: "huggingface" },
  { key: process.env.GROK_KEY_1, type: "grok" },
  { key: process.env.GROK_KEY_2, type: "grok" },
];

let currentIndex = 0;

const getNextKey = () => {
  const current = KEYS[currentIndex];
  currentIndex = (currentIndex + 1) % KEYS.length;
  return current;
};

module.exports = { getNextKey };