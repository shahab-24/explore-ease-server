const { ObjectId } = require("mongodb");

const express = require("express");
const router = express.Router();

module.exports = function (packagesCollection) {
  router.get("/packages", async (req, res) => {
    try {
      const result = await packagesCollection
        .aggregate([{ $sample: { size: 3 } }])
        .toArray();
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in GET /api/package/random:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  router.get("/packages/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid package ID" });
      }
      const query = { _id: new ObjectId(id) };
      const result = await packagesCollection.findOne(query);
      if (!result) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.status(200).json(result);
    } catch (error) {
      console.error("Error in GET /api/package/:id:", error);
      res.status(500).json({ message: "Failed to fetch package by ID" });
    }
  });

  return router;
};
