const pdfParse = require("pdf-parse");

const extractTextFromPDF = async (fileBuffer) => {
  try {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (err) {
    throw new Error("Problem extracting text from PDF ❌");
  }
};

module.exports = { extractTextFromPDF };