const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const router = express.Router();

module.exports = function (bookingsCollection) {
  router.get("/bookings", verifyToken ,async (req, res) => {
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
  return router
};
