require("dotenv").config();
const express = require("express");
const app = express();
exports.app = app;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const port = process.env.PORT || 8000;
const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  ReturnDocument,
} = require("mongodb");
const jwtRoute = require("./routes/jwtRoute.js");
const userRoute = require("./routes/userRoute.js");
const guideRoute = require("./routes/guideRoute.js");
const verifyToken = require("./middlewares/verifyToken.js");
const packageRoute = require("./routes/packageRoute.js");
const bookingsRoute = require("./routes/bookingsRoute.js");

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

app.use("/api/jwt", jwtRoute);

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

    const bookingsCollection = client
      .db("ExploreEaseDB")
      .collection("bookings");

    const guideRequestsCollection = client
      .db("ExploreEaseDB")
      .collection("guideRequests");

    // user related apis========================================

    //     user Profile and update user profile===========
    app.use("/api", userRoute(usersCollection));
    app.use("/api", userRoute(usersCollection));
    app.post("/api", userRoute(usersCollection));

    app.use("/api", guideRoute(guideRequestsCollection));

    // packages related Apis==============================
    app.use("/api", packageRoute(packagesCollection));
    app.use("/api", packageRoute(packagesCollection));

    app.use('/api', bookingsRoute(bookingsCollection))




    app.get("/trips", async (req, res) => {
      const result = await packagesCollection.find().toArray();
      res.json(result);
    });
    app.get("/trips/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await packagesCollection.findOne(query);
      res.json(result);
    });

    //     tourGuides related Apis==============================
    app.get("/api/tourGuides", async (req, res) => {
      try {
        const mode = req.query.mode;
        let result;
        if (mode === "random") {
          result = await tourGuidesCollection
            .aggregate([{ $sample: { size: 3 } }])
            .toArray();
        } else {
          result = await tourGuidesCollection.find().toArray();
        }

        res.json(result);
      } catch (error) {
        console.error("Error in /tourGuides:", error);
        res.status(500).json({ message: "Failed to fetch tourGuides" });
      }
    });

    app.get("/api/tourGuidesProfile/:id", async (req, res) => {
      const { id } = req.params;
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid Id Format" });
      }
      const query = { _id: new ObjectId(id) };
      const result = await tourGuidesCollection.findOne(query);
      res.json(result);
    });

    //     tourist stories related Apis========================
    app.get("/stories", async (req, res) => {
      const stories = await touristStoryCollection
        .aggregate([{ $sample: { size: 4 } }])
        .toArray();
      res.json(stories);
    });
    app.get("/stories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristStoryCollection.findOne(query);
      res.json(result);
    });

    app.get("/all-stories", async (req, res) => {
      const stories = await touristStoryCollection.find().toArray();
      res.json(stories);
    });

    app.patch("/stories/:id/like", async (req, res) => {
      const storyId = req.params.id;
      const { userEmail } = req.body;
      const query = { _id: new ObjectId(storyId) };
      const story = await touristStoryCollection.findOne(query);
      if (!story.likedBy?.includes(userEmail)) {
        const updatedStory = {
          $inc: { likes: 1 },
          $push: { likedBy: userEmail },
        };

        const result = await touristStoryCollection.updateOne(
          query,
          updatedStory,
          { returnDocument: "after" }
        );

        return res.json({ likes: result.value.likes });
      } else {
        return res.json({ likes: story.likes });
      }
    });

    //     bookings related Apis===============================
//     app.get("/api/my-bookings/:id", async (req, res) => {
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };
//       const result = await bookingsCollection.findOne(query);
//       res.json(result);
//     });


    app.post("/api/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne({
        ...booking,
        status: "pending",
      });
      res.json(result);
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
