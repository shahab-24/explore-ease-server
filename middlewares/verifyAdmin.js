
const verifyAdmin = async (req, res, next) => {
        const usersCollection = req.app.locals.usersCollection
        const userEmail = req.user.email;
        if(!userEmail){
                return res.status(401).json({ error: "Unauthorized access" });
            }
            try {
                const user = await usersCollection.findOne({ email: userEmail });
            
                if (!user || user.role !== "admin") {
                  return res.status(403).json({ error: "Access denied. Admins only." });
                }
            
                next();
              } catch (error) {
                res.status(500).json({ error: "Internal server error." });
              }

}
module.exports = verifyAdmin