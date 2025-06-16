const express = require('express');
const {User} = require('../models/user');
const { userAuth }  = require('../middleware/auth');
const { Connection } = require('../models/connectionRequest');


const requestRouter =  express.Router();

requestRouter.post("/request/send/:status/:receiverId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const receiverId = req.params.receiverId;
        const receiverUser = await User.findById(receiverId);
        const senderId = loggedInUser._id;
        const status = req.params.status;

        const allowedStatuses = ["interested", "ignored"];
        if (!allowedStatuses.includes(status)) {
            throw new Error("Invalid status");
        }

        if (!receiverUser) {
            throw new Error("Invalid user ID");
        }

        if (receiverId.toString() === senderId.toString()) {
            throw new Error("Cannot send a connection request to yourself");
        }

        const existingConnection = await Connection.findOne({
            $or : [
                { senderId: receiverId, receiverId: senderId },
                { senderId: senderId, receiverId: receiverId },
            ]
        });

        if (existingConnection) {
            if (existingConnection.status === status) {
                throw new Error("Connection request already exists and is in the same status");
            }

        }

        const connection = new Connection({ senderId, receiverId, status });

        await connection.save();

        let message = '';
        if (status === "interested") {
            message = `${loggedInUser.firstName} has sent connection request to ${receiverUser.firstName}`;
        } else {
            message = `${loggedInUser.firstName} has ignored ${receiverUser.firstName}`;
        }

        res.json({
            message: message,
            connection,
        });

    } catch (error) {
        console.error("error sending the connection request: " + error.message);
        res.status(400).send("Failed to send the connection request: " + error.message);
    }
})


requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const requestId = req.params.requestId;
        const status = req.params.status;

        const allowedStatuses = ["accepted", "rejected"];
        if (!allowedStatuses.includes(status)) {
            throw new Error("Invalid status");
        }
        
        const connection = await Connection.findOne({
            _id : requestId,
            receiverId : loggedInUser._id,
            status : "interested",
        });

        if (!connection) {
            throw new Error("Invalid connection request ID");
        }

        connection.status = status;

        await connection.save();

        const senderUser = await User.findById(connection.senderId);
        let message = '';
        if (status === "accepted") {
            message = `${loggedInUser.firstName} has accepted the connection request from ${senderUser.firstName}`;
        } else {
            message = `${loggedInUser.firstName} has rejected the connection request from ${senderUser.firstName}`;
        }

        res.json({
            message: message,
            connection,
        });
        
        
    } catch (error) {
        console.error("error reviewing the connection request: " + error.message);
        res.status(400).send("Failed to review the connection request: " + error.message);
    }
})


module.exports = requestRouter;