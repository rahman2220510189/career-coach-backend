const axios = require("axios");
const cheerio = require("cheerio");

const scrapeJobDescription = async (url) => {
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      timeout: 15000,
    });

    const $ = cheerio.load(res.data);

    
    $("script, style, nav, footer, header, img").remove();

   
    const text = $("body").text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000); 

    return text;
  } catch (err) {
    throw new Error("Problem scraping job description ❌");
  }
};

module.exports = { scrapeJobDescription };