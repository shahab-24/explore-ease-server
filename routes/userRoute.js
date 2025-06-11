const express = require("express");
const { ObjectId, ReturnDocument } = require("mongodb");
const verifyToken = require("../middlewares/verifyToken");

module.exports = function (usersCollection) {
  const router = express.Router();

  router.get('/users/profile', verifyToken, async (req, res) => {
        // const {id} = req.params;
        const {email} = req.query;
        const user = await usersCollection.findOne({email})
        res.json(user)
  })

  router.put("/users/profile", verifyToken, async (req, res) => {
//     const { id } = req.params;
    const {email, name, photo, phone, address} = req.body;

    if( req.user.email != email) return res.status(400).json({message: "forbidden, token mismatch"})

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
      const result = await usersCollection.updateOne({email}, updatedDoc, {returnDocument: "after"});

      if (result.modifiedCount > 0) {
        res.status(200).json({ message: "Profile updated" });
      } else {
        res.status(404).json({ message: "user not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "failed to update user profile" });
    }
  });
  return router;
};
