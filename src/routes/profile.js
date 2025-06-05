const express = require('express');
const { userAuth }  = require('../middleware/auth');


const profileRouter =  express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {

    try {
        res.send(req.user);
    }
    catch (error) {
        console.error("error verifying the token: " + error.message);
        return res.status(403).send("Access denied: " + error.message);
    }
})


module.exports = profileRouter;