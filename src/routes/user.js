const express = require('express');
const { userAuth } = require('../middleware/auth');
const { Connection } = require('../models/connectionRequest');
const { User } = require('../models/user');
const userRouter =  express.Router();

userRouter.get("/user/requests/received", userAuth,  async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests =  await Connection.find({
            receiverId: loggedInUser._id,
            status: "interested"
        }).populate("senderId", ["firstName", "lastName", "photoUrl", "skills", "about"]);

        res.json({
            message: "User requests fetched successfully",
            requests: connectionRequests,
        })
        
    } catch (error) {
        console.error("Error fetching user requests: " + error.message);
        return res.status(500).send("Failed to fetch user requests");   
    }

});

userRouter.get("/user/connections", userAuth,  async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections =  await Connection.find({
            $or: [
                { senderId: loggedInUser._id },
                { receiverId: loggedInUser._id }
            ],
            status: "accepted"
        }).populate("receiverId senderId", ["firstName", "lastName", "photoUrl", "skills", "about"])


        const response = connections.map((curr) => curr.senderId._id.equals(loggedInUser._id)? curr.receiverId : curr.senderId)

        if(connections.length === 0) {
            return res.json({
                message: "No connections found",
            })
        }

        res.json({
            message: "User connections fetched successfully",
            connections: response,
        })
    }
    catch (error) {
        console.error("Error fetching user requests: " + error.message);
        return res.status(500).send("Failed to fetch user requests");   
    }
})

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        limit = Math.min(limit, 50);

        const allUsers = await User.find({ _id: { $ne: loggedInUser._id } });

        const usersWithNoConnection = [];

        for (let user of allUsers) {
            const connection = await Connection.findOne({
                $or: [
                    { senderId: loggedInUser._id, receiverId: user._id },
                    { senderId: user._id, receiverId: loggedInUser._id }
                ]
            });

            if (!connection) {
                usersWithNoConnection.push(user);
            }
        }


        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const usersToShow = usersWithNoConnection.slice(startIndex, endIndex);

        res.json({
            message: "User feed fetched successfully",
            page,
            totalResults: usersWithNoConnection.length,
            users: usersToShow
        });

    } catch (error) {
        console.error("Error fetching user feed:", error.message);
        return res.status(500).send("Failed to fetch user feed");
    }
});




module.exports = userRouter;