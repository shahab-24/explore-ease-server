const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middlewares/verifyToken");
const bookingsRoute = require("./bookingsRoute");
const router = express.Router();

module.exports = function (tourGuidesCollection,bookingsCollection) {
        
  router.get("/tourGuides", async (req, res) => {
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

  router.get("/tourGuidesProfile/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid Id Format" });
      }
      const query = { _id: new ObjectId(id) };
      const result = await tourGuidesCollection.findOne(query);
      res.json(result);
    } catch (error) {
      console.log("tourguide profile error", error);
    }
  });

  router.get('/tourGuide/assingned-tours', verifyToken, async ( req, res) => {
        const tourGuide =req.query.name;
        if(!tourGuide) return res.status(400).json({error: "tourGuide not found" })

                const tours = await bookingsCollection.find({tourGuide}).toArray()
                res.json(tours)
  })
  router.patch('/tourGuide/assigned-tours/:id', verifyToken, async (req, res) => {
        const {status} = req.body;
        const {id} = req.params;
        const result = await bookingsCollection.updateOne({_id: new ObjectId(id)}, {$set: {status}})
        res.json(result)
  })


  return router;
};
