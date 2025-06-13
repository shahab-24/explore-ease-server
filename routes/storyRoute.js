const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { ObjectId } = require("mongodb");
const { app } = require("..");
const { verify } = require("jsonwebtoken");
const router = express.Router();

module.exports = function (touristStoryCollection) {
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

  router.get("/:id", verifyToken, async (req, res) => {
    const story = await touristStoryCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(story);
  });

  router.get("/stories/random", async (req, res) => {
    const stories = await touristStoryCollection
      .aggregate([{ $sample: { size: 4 } }])
      .toArray();
    res.json(stories);
  });

  router.get("/stories/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristStoryCollection.findOne(query);
      res.json(result);
    } catch (error) {
      console.log("story not found", error);
    }
  });

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

  router.put("/stories/edit/:id", verifyToken, async (req, res) => {
    try {
      const { title, description } = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristStoryCollection.updateOne(query, {
        $set: { title, description },
      });

      res.json(result);
    } catch (error) {
      console.log("update error", error);
    }
  });

  router.patch("/:id/remove-image", verifyToken, async (req, res) => {
    try {
      const { url } = req.body;
      const result = await storyCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $pull: { images: url } }
      );
      res.json(result);
    } catch (error) {
      console.log("something error removing image", error);
    }
  });

  router.patch("/stories/:id/add-image", verifyToken, async (req, res) => {
    try {
      const { url } = req.body;
      const result = await touristStoryCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $push: { images: url } }
      );
      res.json(result);
    } catch (error) {
      console.log("something error in adding image", error);
    }
  });

  router.delete("/stories/:id", async (req, res) => {
    const result = await touristStoryCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.json(result);
  });

  return router;
};
