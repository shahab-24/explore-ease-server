const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middlewares/verifyToken");
const bookingsRoute = require("./bookingsRoute");
const router = express.Router();

module.exports = function (tourGuidesCollection,bookingsCollection) {
        
  router.get("/tourGuides", async (req, res) => {
        // const data = await tourGuidesCollection
        //   .find({})
        //   .sort({ createdAt: -1 })
        //   .limit(10)
        //   .toArray();
        // res.json(data);
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


  //  routes/tourGuide.js


  //  Get assigned tours for a tour guide
  router.get("/tourGuide/assigned-tours", verifyToken, async (req, res) => {
    try {
      const guideEmail = req.user?.email;

      const assignedTours = await bookingsCollection
        .find({ "selectedGuide.email": guideEmail })
        .sort({ createdAt: -1 })
        .toArray();

//       const formatted = assignedTours.map((b) => ({
//         _id: b._id,
//         packageName: b.packageName,
//         touristName: b.userName,
//         tourDate: b.tourDate,
//         tourPrice: b.price,
//         status: b.status, // pending | in-review | accepted | rejected
//       }));

      res.json(assignedTours);
    } catch (err) {
      console.error("Error fetching assigned tours", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  //  Update booking status: Accept / Reject
  router.patch(
    "/tourGuide/:id/status",
    verifyToken,
    async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;

      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      try {
        const result = await bookingsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        if (result.modifiedCount > 0) {
          res.json({ message: `Tour status updated to ${status}` });
        } else {
          res.status(404).json({ message: "Booking not found or unchanged" });
        }
      } catch (error) {
        console.error("Error updating tour status", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

 



//   router.get('/tourGuide/assingned-tours', verifyToken, async ( req, res) => {
//         const tourGuide =req.query?.name;
//         if(!tourGuide) return res.status(400).json({error: "tourGuide not found" })

//                 const tours = await bookingsCollection.find({tourGuide}).toArray()
//                 res.json(tours)
//   })
//   router.patch('/tourGuide/assigned-tours/:id', verifyToken, async (req, res) => {
//         const {status} = req.body;
//         const {id} = req.params;
//         const result = await bookingsCollection.updateOne({_id: new ObjectId(id)}, {$set: {status}})
//         res.json(result)
//   })

// router.get("/tourGuide/assigned-tours", verifyToken, async (req, res) => {
//         try {
//           const guideEmail = req.user?.email;
    
//           const assignedTours = await bookingsCollection
//             .find({ "selectedGuide.email": guideEmail })
//             .sort({ createdAt: -1 })
//             .toArray();
    
//           const formatted = assignedTours.map((b) => ({
//             _id: b._id,
//             packageName: b.packageName,
//             touristName: b.userName,
//             tourDate: b.tourDate,
//             tourPrice: b.price,
//             status: b.status, // pending | in-review | accepted | rejected
//           }));
    
//           res.json(formatted);
//         } catch (err) {
//           console.error("Error fetching assigned tours", err);
//           res.status(500).json({ message: "Server error" });
//         }
//       });
    
      // 🟡 Update booking status: Accept / Reject
//       router.patch(
//         "/tourGuide/tours/:id/status",
//         verifyToken,
//         async (req, res) => {
//           const id = req.params.id;
//           const { status } = req.body;
    
//           if (!["accepted", "rejected"].includes(status)) {
//             return res.status(400).json({ message: "Invalid status" });
//           }
    
//           try {
//             const result = await bookingsCollection.updateOne(
//               { _id: new ObjectId(id) },
//               { $set: { status } }
//             );
    
//             if (result.modifiedCount > 0) {
//               res.json({ message: `Tour status updated to ${status}` });
//             } else {
//               res.status(404).json({ message: "Booking not found or unchanged" });
//             }
//           } catch (error) {
//             console.error("Error updating tour status", error);
//             res.status(500).json({ message: "Server error" });
//           }
//         }
//       );


  return router;
};
