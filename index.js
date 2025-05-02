require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const port = process.env.PORT || 8000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwtRoute = require("./routes/jwtRoute.js");
const verifyToken = require("./middlewares/verifyToken.js");

const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(morgan("dev"));

app.use("/jwt", jwtRoute);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3jtn0.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const usersCollection = client.db("ExploreEaseDB").collection("users");
    const packagesCollection = client
      .db("ExploreEaseDB")
      .collection("packages");
    const tourGuidesCollection = client
      .db("ExploreEaseDB")
      .collection("tourGuides");
    const touristStoryCollection = client
      .db("ExploreEaseDB")
      .collection("touristStories");

    // user related apis========================================
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const email = user?.email;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      try {
        const existingUser = await usersCollection.findOne({ email });

        if (existingUser) {
          return res.status(409).json({ message: "User already exists" });
        }

        const result = await usersCollection.insertOne({
          ...user,
          role: "tourist",
        });

        res.status(201).json({
          message: "User created",
          userId: result.insertedId,
        });
      } catch (err) {
        console.error("Error inserting user:", err);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // packages related Apis=======================================
    app.get("/package", async (req, res) => {
      try {
        const result = await packagesCollection
          .aggregate([{ $sample: { size: 3 } }])
          .toArray();
        res.json(result); // always prefer res.json for APIs
      } catch (error) {
        console.error("Error in /packages:", error);
        res.status(500).json({ message: "Failed to fetch packages" });
      }
    });

    app.get('/packages/:id', async (req, res) => {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await packagesCollection.findOne(query)
        res.json(result)
    })

    //     tourGuides related Apis==============================
    app.get("/tourGuides", async (req, res) => {

      try {
        const mode = req.query.mode;
        let result;
        if(mode === 'random'){
                 result = await tourGuidesCollection
          .aggregate([{ $sample: { size: 3 } }])
          .toArray();
        }else{
                result = await tourGuidesCollection.find().toArray()
        }
        
        res.json(result); 
      } catch (error) {
        console.error("Error in /tourGuides:", error);
        res.status(500).json({ message: "Failed to fetch tourGuides" });
      }
    });

    app.get('/tourGuidesProfile/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await tourGuidesCollection.findOne(query)
        res.json(result)
    })


   

    //     tourist stories related Apis========================
    app.get("/stories", async (req, res) => {
      const stories = await touristStoryCollection
        .aggregate([{ $sample: { size: 4 } }])
        .toArray();
      res.json(stories);
    });
    
    app.get("/all-stories", async (req, res) => {
      const stories = await touristStoryCollection.find()
        .toArray();
      res.json(stories);
    });

   
    //     );
  } finally {
  }
}
run().catch(console.dir);

app.get("", (req, res) => {
  res.send("ExploreEase is running.......");
});
app.listen(port, () => {
  console.log(`ExploreEase is running on ${port}`);
});
