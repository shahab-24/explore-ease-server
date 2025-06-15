const express = require("express");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

module.exports = function (bookingsCollection) {
  router.get("/bookings", verifyToken , async(req, res) => {
    try {
      const email = req.query?.email;
      let query = {};
      if (email) {
        query = { touristEmail: email };

        const result = await bookingsCollection.find(query).toArray();
        res.json(result);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }

    
  });

  router.post('/bookings', verifyToken, async( req, res) => {
         
      const booking = req.body;
      const result = await bookingsCollection.insertOne({
        ...booking,
        status: "pending",
      });
      res.json(result);
   
  })

//   guide assigned api=======
router.get("/bookings/assigned", async (req, res) => {
        const guide = req.query.guide;
        const result = await bookingsCollection.find({ guideName: guide }).toArray();
        res.json(result);
      });

      router.patch("/bookings/:id/status", async (req, res) => {
        const id = req.params.id;
        const { status } = req.body;
        const result = await bookingsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );
        res.json(result);
      });
  return router
};
