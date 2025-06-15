const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

module.exports = function (usersCollection, packagesCollection, guideRequestsCollection, touristStoryCollection, tourGuidesCollection) {

        
  router.get("/admin/manage-users", verifyToken, async (req, res) => {
        const { search, role } = req.query;
        // console.log("🔥 /admin/manage-users hit");  // <-- Add this
        // console.log("Query:", req.query);
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

      router.patch('/admin/:email/role', verifyToken, async ( req, res) => {
        const email = req.params.email;
        const {newRole} = req.body;
        try {
                const user = await usersCollection.findOne({email});
                if (!user) return res.status(404).send({ message: "User not found" });

                const result = await usersCollection.updateOne({email}, {$set: { role: newRole}})

                res.json({message: 'role updated', result})

                if(newRole === "guide"){
                        await tourGuidesCollection.updateOne({email}, {
                                $set: {
                                        name: user.name,
            email: user.email,
            createdAt: new Date(),
            addedByAdmin: true,
                                }
                        }, {upsert: true})
                        await usersCollection.deleteOne({email})
                } else if (newRole === "tourist"){
                        await usersCollection.updateOne({email}, {
                                $set: {
                                        email: user.email,
            createdAt: new Date(),
            addedByAdmin: true,
                                }
                        }, {upsert: true})
                        await usersCollection.deleteOne({email}) 

                } 
                res.json({message: `role updated ${newRole}`, result})

                 

                
      
                
        } catch (error) {
                console.error("Role change error:", error);
    res.status(500).send({ message: "Internal Server Error" });
        }})
        

      
    
//       packages
      router.post("/admin/add-package", verifyToken, async (req, res) => {
        const packageData = req.body;

        if (!packageData.name || !packageData.images?.length || !packageData.tourPlan?.length) {
                return res.status(400).json({ message: "Missing required fields" });
              }
          
        const package = await packagesCollection.insertOne(packageData);
        res.status(201).json(package);
      });

      return router;
}