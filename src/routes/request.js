const express = require('express');
const { userAuth }  = require('../middleware/auth');


const requestRouter =  express.Router();

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
    try {
        const user = req.user;
        console.log(`${user.firstName} is sending a connection request.`);
        res.send(`${user.firstName} is sending a connection request.`);
    }
    catch (error) {
        console.error("error sending the connection request: " + error.message);
        res.send("Failed to send the connection request: " + error.message);
    }
})


module.exports = requestRouter;