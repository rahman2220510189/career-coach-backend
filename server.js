const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjuyyb2.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB Connected ");

    // Routes define 
    
    const db = client.db("career-coach");
    app.use("/api/analyze", require("./src/routes/analyze")(db));
    app.use("/api/interview", require("./src/routes/interview")(db));
    app.use("/api/auth", require("./src/routes/auth")(db));
    app.use("/api/admin", require("./src/routes/admin")(db));
    app.use("/api/cv", require("./src/routes/cv")(db));
 
    // Test route
    app.get("/", (req, res) => {
      res.json({ message: "Career Coach API running ✅" });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.log("MongoDB Error ", error.message);
  }
}

run().catch(console.dir);