const pdf = require("pdf-parse-fork");

const extractTextFromPDF = async (fileBuffer) => {
  try {

    const data = await pdf(fileBuffer);

    if (!data || !data.text || data.text.trim().length === 0) {
      throw new Error("PDF is empty or scanned image ❌");
    }

    return data.text;
  } catch (err) {
    console.error("PDF Parse Error Detail:", err.message);
    throw new Error("Problem extracting text from PDF ❌");
  }
};

module.exports = { extractTextFromPDF };