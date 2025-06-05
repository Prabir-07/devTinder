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
        if(!validateEditProfileData(req)) {
            throw new Error("Invalid profile data");
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, your profile updated successfully`,
            updatedUser: loggedInUser,
        });
        
    } catch (error) {
        console.error("error updating user profile: " + error.message);
        res.status(400).send("Failed to update user profile: " + error.message);
    }
})


module.exports = profileRouter;