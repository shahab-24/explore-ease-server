const express = require("express");
const { ObjectId, ReturnDocument } = require("mongodb");
const verifyToken = require("../middlewares/verifyToken");
const { app } = require("..");
const guideRoute = require("./guideRoute");
const packageRoute = require("./packageRoute");

module.exports = function (usersCollection) {
  const router = express.Router();

  router.get("/users/profile", verifyToken, async (req, res) => {
    // const {id} = req.params;
    const { email } = req.query;
    const user = await usersCollection.findOne({ email });
    res.json(user);
  });

  router.put("/users/profile", verifyToken, async (req, res) => {
    //     const { id } = req.params;
    const { email, name, photo, phone, address } = req.body;

    if (req.user.email != email)
      return res.status(400).json({ message: "forbidden, token mismatch" });

    //     const query = { _id: new ObjectId(id) };

    const updatedDoc = {
      $set: {
        name,
        photo,
        phone,
        address,
      },
    };
    try {
      const result = await usersCollection.updateOne({ email }, updatedDoc, {
        returnDocument: "after",
      });

      if (result.modifiedCount > 0) {
        res.status(200).json({ message: "Profile updated" });
      } else {
        res.status(404).json({ message: "user not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "failed to update user profile" });
    }
  });

  router.get("/users", async (req, res) => {
    const result = await usersCollection.find().toArray();
    res.send(result);
  });

  router.post("/users", async (req, res) => {
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

  return router;
};
