const express = require("express");
const { User } = require("../models/user");
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const userEmail = req.body.emailId;
  const userPassword = req.body.password;

  try {
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordMatching = await user.comparePassword(userPassword);

    if (isPasswordMatching) {
      const token = await user.getJWT();
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      const allowedFields = [
        "firstName",
        "lastName",
        "emailId",
        "gender",
        "about",
        "photoUrl",
        "age",
        "skills",
      ];

      const userToSend = user.toObject();
      Object.keys(userToSend).forEach((field) => {
        if (!allowedFields.includes(field)) delete userToSend[field];
      });

      res.status(200).json(userToSend);
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error logging in the user: " + error.message);
    res.status(500).json({ message: "Failed to login user: " + error.message });
  }
});

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignupData(req);

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    const user = new User(req.body);
    await user.save();

    console.log("User added to DB successfully");
    res.status(201).json({ message: "User created successfully", user: user });
  } catch (error) {
    console.error("Error saving the user: " + error.message);
    res
      .status(400)
      .json({ message: "Failed to add user to DB: " + error.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ message: "Failed to logout" });
  }
});

module.exports = authRouter;
