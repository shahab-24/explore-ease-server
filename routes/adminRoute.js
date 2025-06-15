const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const { ObjectId } = require("mongodb");
const router = express.Router();

module.exports = function (
  usersCollection,
  packagesCollection,
  guideRequestsCollection,
  touristStoryCollection,
  tourGuidesCollection
) {
  router.get("/admin/manage-users", verifyToken, async (req, res) => {
        console.log("Manage users hit");
    const { search, role } = req.query;

    const filters = {};

    if (search)
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    if (role) filters.role = role;

    const users = await usersCollection.find(filters).toArray();
    res.json(users);
  });

  router.patch(
    "/admin/:email/role",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
      const email = req.params.email;
      const { newRole } = req.body;
      try {
        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(404).send({ message: "User not found" });

        const result = await usersCollection.updateOne(
          { email },
          { $set: { role: newRole } }
        );

        res.json({ message: "role updated", result });

        if (newRole === "guide") {
          await tourGuidesCollection.updateOne(
            { email },
            {
              $set: {
                name: user.name,
                email: user.email,
                createdAt: new Date(),
                addedByAdmin: true,
              },
            },
            { upsert: true }
          );
          await usersCollection.deleteOne({ email });
        } else if (newRole === "tourist") {
          await usersCollection.updateOne(
            { email },
            {
              $set: {
                email: user.email,
                createdAt: new Date(),
                addedByAdmin: true,
              },
            },
            { upsert: true }
          );
          await usersCollection.deleteOne({ email });
        }
        res.json({ message: `role updated ${newRole}`, result });
      } catch (error) {
        console.error("Role change error:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    }
  );

  router.delete(
    "/admin/delete-user/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id))
        return res.status(400).send({ error: "Invalid ID" });
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      res.json({ message: "users rejected", result });
    }
  );

  //       packages
  router.post("/admin/add-package", verifyToken, async (req, res) => {
    const packageData = req.body;

    if (
      !packageData.name ||
      !packageData.images?.length ||
      !packageData.tourPlan?.length
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const package = await packagesCollection.insertOne(packageData);
    res.status(201).json(package);
  });

//   guide request=================
router.get('/admin/guide-requests', verifyToken, async (req, res) => {
        try {
                const applications = await guideRequestsCollection.find().toArray();
                res.json(applications)
        } catch (error) {
                res.status(500).json({ message: "Failed to fetch guide requests" });
                
        }
})

router.delete('/admin/guide-requestes/:id', verifyToken, async (req, res) => {
        const id = req.params.id;
        const result = await guideRequestsCollection.deleteOne({_id: new ObjectId(id)})
        res.json(result)
})

router.patch('/admin/users/upgrade-role', verifyToken, async (req, res) => {
        const {email, newRole} = req.body;
        const result = await usersCollection.updateOne({email},
                {$set: {role: newRole}}
        )
        res.json(result)
})

  return router;
};
