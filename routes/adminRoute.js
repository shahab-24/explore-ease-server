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
  router.get("/admin/manage-users", verifyToken, verifyAdmin, async (req, res) => {
        // console.log("Manage users hit");
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
      console.log(newRole)
      try {
        const user = await usersCollection.findOne({ email });

        if (!user) return res.status(404).send({ message: "User not found" });

        let result;

        if (newRole === "tourGuide") {
          result= await tourGuidesCollection.updateOne(
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

        } else {
         result = await usersCollection.updateOne(
            { email },
            {
              $set: {
                role: newRole
            }},
            { upsert: true }
          );
        //   await usersCollection.deleteOne({ email });
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
  router.delete(
    "/admin/guide-requests/reject/:id",
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

router.delete('/admin/guide-requestes/:id', verifyToken, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const result = await guideRequestsCollection.deleteOne({_id: new ObjectId(id)})
        res.json(result)
})

// router.patch('/admin/users/upgrade-role', verifyToken, verifyAdmin, async (req, res) => {
//         const {email, newRole} = req.body;
//         const result = await usersCollection.updateOne({email},
//                 {$set: {role: newRole}}
//         )
//         res.json(result)
// })

router.post('/admin/guide-requests/accept/:id', verifyToken, verifyAdmin, async (req, res) => {
        const id = req.params.id;

        const request = await guideRequestsCollection.findOne({_id: new ObjectId(id)})

        if (!request) return res.status(404).json({ message: "Request not found" });
        const email = request.email // || request.userEmail
        console.log(email, 'request email')

        const tourGuideData = {
                name: request?.name || request?.userName || "unnamed",
                // email: request?.email || request?.userEmail,
                email,
                photo: request?.photo || "",
                phone: request?.phone || "",
                experience: request?.experience || "",
                specialty: request?.specialty || "",
                bio: request?.reason,
                role: "tourGuide",
                stories: [],
        }

        await tourGuidesCollection.insertOne(tourGuideData)
        await guideRequestsCollection.deleteOne({_id: new ObjectId(id)})
        await usersCollection.deleteOne({_id: new ObjectId(id)})

        res.json({message: 'Guide accepted and added to tourguide'})
})

  return router;
};
