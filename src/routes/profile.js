const express = require('express');
const { userAuth }  = require('../middleware/auth');
const { validateEditProfileData } = require('../utils/validation');


const profileRouter =  express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {

    try {
        res.send(req.user);
    }
    catch (error) {
        console.error("error verifying the token: " + error.message);
        return res.status(403).send("Access denied: " + error.message);
    }
})


profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    // Add detailed logging
    console.log("Received data:", req.body);

    if (!validateEditProfileData(req)) {
      console.log("Validation failed for:", req.body);
      return res.status(400).json({
        error: "Invalid profile data",
        message: "Validation failed",
      });
    }

    const loggedInUser = req.user;

    // Validate that user exists
    if (!loggedInUser) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

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

    const userToSend = loggedInUser.toObject();
    Object.keys(userToSend).forEach((field) => {
      if (!allowedFields.includes(field)) delete userToSend[field];
    });

    res.json(userToSend);
  } catch (error) {
    console.error("Error updating user profile:", error.message);
    res.status(400).json({
      error: "Failed to update user profile",
      message: error.message,
    });
  }
});


module.exports = profileRouter;