const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
//   console.log(token, 'token from verify')

  if (!token) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "forbidden" });
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
