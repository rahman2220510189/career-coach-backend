const axios = require("axios");
const cheerio = require("cheerio");

const scrapeJobDescription = async (url) => {
  try {
    const res = await axios.get(url, {
      headers: {
        // আরও রিয়েলিস্টিক ইউজার এজেন্ট
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(res.data);
    $("script, style, nav, footer, header, img, noscript").remove();

    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 3000); 

    if (!text) throw new Error("No text found");
    return text;
  } catch (err) {
    // এখানে এরর স্ট্যাটাসটা প্রিন্ট করুন তাহলে বুঝতে পারবেন ৪১০ কোথা থেকে আসছে
    console.error(`Scraping Error [${url}]:`, err.response?.status || err.message);
    throw new Error(`Problem scraping job description: ${err.message} ❌`);
  }
};

   

module.exports = { scrapeJobDescription };