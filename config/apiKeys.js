const KEYS = [
  { key: process.env.GROQ_KEY_1, type: "groq" },
  { key: process.env.GROQ_KEY_2, type: "groq" },
].filter(k => k.key);

let currentIndex = 0;
const getNextKey = () => {
  const current = KEYS[currentIndex];
  currentIndex = (currentIndex + 1) % KEYS.length;
  return current;
};

module.exports = { getNextKey };