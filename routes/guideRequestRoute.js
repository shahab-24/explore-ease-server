const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

module.exports = function (guideRequestsCollection) {
  router.post("/guide-requests", verifyToken, async (req, res) => {
    const { userEmail, title, reason, cvLink, status, appliedAt } = req.body;

    if (!userEmail || !title || !reason || !cvLink) {
      return res.status(400).json({ message: "All fields are required" });
    }

    try {
      const guideData = {
        userEmail,
        title,
        reason,
        cvLink,
        status: status || "pending",
        appliedAt: appliedAt || new Date(),
      };

      const result = await guideRequestsCollection.insertOne(guideData);
      res.status(201).json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Guide request failed:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  });
  return router;
};
