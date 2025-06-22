const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { ObjectId } = require("mongodb");

const router = express.Router();

module.exports = function (bookingsCollection) {
        // for tourist
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
  
  router.get('/bookings/:id', verifyToken, async ( req, res) => {
        const id = req.params.id;
        const result = await bookingsCollection.findOne({_id: new ObjectId(id)})
        res.json(result)
  })

  router.post('/bookings', verifyToken, async( req, res) => {
         
      const booking = req.body;
      const result = await bookingsCollection.insertOne({
        ...booking,
        status: "pending",
        paymentStatus: 'unpaid',
        createdAt: new Date().toISOString()
      });
      res.json(result);
   
  })

//   for tourGuide assigned=======
// router.get("/bookings/assigned", async (req, res) => {
//         const guide = req.query.guide;
//         const result = await bookingsCollection.find({ guideName: guide }).toArray();
//         res.json(result);
//       });

// tourist cancel tours
      router.patch("/bookings/:id/cancel", verifyToken, async (req, res) => {
        const id = req.params.id;
        const touristEmail = req.user.email;
        
        const result = await bookingsCollection.updateOne(
          { _id: new ObjectId(id),touristEmail },
          { $set: { status: "cancelled" } }
        );
        res.json(result);
      });

//       refund
router.post('/bookings/:id/refund', verifyToken, async ( req, res) => {
        const id = req.params.id;
        const {reason} = req.body;
        const result = await bookingsCollection.updateOne({_id: new ObjectId(id), touristEmail: req.user.email},
{$set: {
        refundRequest: {reason, status: 'requested'}
}})
res.json(result)
})

// reschedule===
router.post('/bookings/:id/reschedule', verifyToken, async (req, res) => {
        const {newDate, reason} = req.body;
        const result = await bookingsCollection.updateOne({_id: new ObjectId(req.params.id), touristEmail: req.user.email}, {$set: {
                rescheduleRequest: {newDate: new Date(newDate), reason, approved: 'false'}
        }})
        res.json(result)
})

      
  return router
};
