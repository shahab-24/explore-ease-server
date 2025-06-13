const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { ObjectId } = require("mongodb");
const { app } = require("..");
const router = express.Router();

module.exports = function (touristStoryCollection) {
  router.post("/stories-add", verifyToken, async (req, res) => {
    try {
      const { title, description, images, author } = req.body;

      const story = {
        title,
        description,
        images,
        author,
        createdAt: new Date(),
      };
      const result = await touristStoryCollection.insertOne(story);
      res.json(result);
    } catch (error) {
      console.log("story not uploaded", error);
    }
  });

  router.get("/stories", verifyToken, async (req, res) => {
    try {
      const email = req.query.email;
      const stories = await touristStoryCollection
        .find({ "author.email": email })
        .toArray();
      res.json(stories);
    } catch (error) {
      console.log("stories not found", error);
    }
  });

  router.get("/stories/random", async (req, res) => {
    const stories = await touristStoryCollection
      .aggregate([{ $sample: { size: 4 } }])
      .toArray();
    res.json(stories);
  });

  return router;
};
