const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();

router.post("/", (req, res) => {
  const user = req.body;
  if (!user?.email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const token = jwt.sign(
    { email: user.email, role: user.role || "tourist" },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ token });
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ success: true });
});

module.exports = router;
