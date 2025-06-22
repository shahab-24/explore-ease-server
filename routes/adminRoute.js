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
  router.get(
    "/admin/manage-users",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
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
    }
  );

  router.get("/debug/tourguides", async (req, res) => {
        const data = await tourGuidesCollection
          .find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray();
        res.json(data);
      });
      

//   router.patch(
//     "/admin/:email/role",
//     verifyToken,
//     verifyAdmin,
//     async (req, res) => {
//       const email = req.params.email.toLowerCase();
//       const { newRole } = req.body;
//       console.log(newRole, email, "manage admin route,,,,,,,,,,,");

//       console.log("==== PATCH /admin/:email/role ====");
// console.log("Body:", req.body);
// console.log("Email param:", email);


//       try {
//         const user = await usersCollection.findOne({ email });
//         console.log(user, "user by email\\\\\\\\\\\\")
//         // const tourGuides  = await tourGuidesCollection.find().toArray()

//         if (!user) return res.status(404).send({ message: "User not found" });
//   const userUpdate = await usersCollection.updateOne({ email }, { $set: { role: newRole } });
//         console.log(userUpdate, "user Updated======")
        

//         let result = null;

//         if (newRole === user.role) {
//                 console.log("✅ newRole is tourGuide, preparing to insert in tourGuides");
//           const tourData = {
//             name: user.name,
//             email: user.email,
//             photo: user?.photo || user?.image || "",
//             phone: user?.phone  || "",
//             bio: user?.bio || "",
//             specialty: user?.specialty || "",
//             createdAt: new Date(),
//             addedByAdmin: true,
//             role: "tourGuide",
//             stories: [],
//           };
//           console.log(tourData, "🟡 tourData to be inserted");

//            result = await tourGuidesCollection.updateOne(
//             { email: {$regex : new RegExp(`^${user.email}`, 'i')}  },
//             { $set: tourData },
//             { upsert: true }
//           );
//          console.log(result, "🟢 tourGuidesCollection insert/update result");
//           //   await usersCollection.deleteOne({ email });
//           return res.status(200).json({
//             message: `User promoted to tourGuide and saved in tourGuidesCollection`,userUpdate, result,
//           });

//         } else {
         
//           //   await usersCollection.deleteOne({ email });
        

//           return res.status(200).json({
//             message: `role updated ${newRole} in usersCollection`, 
            
//           });
//         }
//       } catch (error) {
//         console.error("Role change error:", error);
//         res.status(500).send({ message: "Internal Server Error" });
//       }
//     }
//   );


router.patch(
        "/admin/:email/role",
        verifyToken,
        verifyAdmin,
        async (req, res) => {
          const email = req.params.email.toLowerCase();
          const { newRole } = req.body;
      
          console.log("📩 PATCH /admin/:email/role ====");
          console.log("Body:", req.body);
          console.log("Email param:", email);
      
          try {
            const user = await usersCollection.findOne({ email });
      
            if (!user) return res.status(404).send({ message: "User not found" });
      
            //  Update user role
            const userUpdate = await usersCollection.updateOne(
              { email },
              { $set: { role: newRole } }
            );
            console.log(userUpdate, " User role updated");
      
            //  If role is tourGuide → add to tourGuidesCollection
            if (newRole.toLowerCase() === "tourguide") {
              const tourData = {
                name: user.name,
                email: user.email,
                photo: user?.photo || user?.image || "",
                phone: user?.phone || "",
                bio: user?.bio || "",
                specialty: user?.specialty || "",
                createdAt: new Date(),
                addedByAdmin: true,
                role: "tourGuide",
                stories: [],
              };
      
              console.log(tourData, " tourGuide data to insert");
      
              const guideResult = await tourGuidesCollection.updateOne(
                { email: user.email },
                { $set: tourData },
                { upsert: true }
              );
      
              console.log(guideResult, " Inserted/Updated in tourGuidesCollection");
      
              return res.status(200).json({
                message: "User promoted to tourGuide and saved in tourGuidesCollection",
                userUpdate,
                guideResult,
              });
            }
            const guideDelete = await tourGuidesCollection.deleteOne({ email });
            //  For other roles
            return res.status(200).json({
              message: `Role updated to ${newRole} in usersCollection`,
              userUpdate,
              guideDelete
            });
      
          } catch (error) {
            console.error(" Role change error:", error);
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
  router.get("/admin/guide-requests", verifyToken, async (req, res) => {
    try {
      const applications = await guideRequestsCollection.find().toArray();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guide requests" });
    }
  });

  router.delete(
    "/admin/guide-requestes/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
      const id = req.params.id;
      const result = await guideRequestsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json(result);
    }
  );

  // router.patch('/admin/users/upgrade-role', verifyToken, verifyAdmin, async (req, res) => {
  //         const {email, newRole} = req.body;
  //         const result = await usersCollection.updateOne({email},
  //                 {$set: {role: newRole}}
  //         )
  //         res.json(result)
  // })

  router.post(
    "/admin/guide-requests/accept/:id",
    verifyToken,
    verifyAdmin,
    async (req, res) => {
      const id = req.params.id;

      const request = await guideRequestsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!request)
        return res.status(404).json({ message: "Request not found" });
      const email = request.email; // || request.userEmail
      console.log(email, "request email");

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
      };

      await tourGuidesCollection.insertOne(tourGuideData);
      await guideRequestsCollection.deleteOne({ _id: new ObjectId(id) });
      await usersCollection.deleteOne({ _id: new ObjectId(id) });

      res.json({ message: "Guide accepted and added to tourguide" });
    }
  );

  return router;
};
