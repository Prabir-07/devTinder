const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');

app.use(express.json());

app.post("/signup", async (req, res) => {

    // Create a new User object from the request body
    const user = new User(req.body);

    try {
        await user.save();
        res.send("User added to DB successfully");
    } catch (error) {
        console.error("error saving the user: " + error.message);   
    }

})


app.get("/user", async (req, res) => {

    // Get the user's email from the request body
    const userEmail = req.body.emailId;

    // Find the user in the DB by their email
    try {
        const userData = await User.find({emailId: userEmail});
        if(userData.length === 0) {
            return res.status(404).send("User not found");
        }
        res.send(userData);
    } catch (error) {
        console.error("error fetching the user: " + error.message);
    }
})


app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        console.error("error fetching the users: " + error.message);
    }
})


app.delete("/user", async (req, res) => {

    const userId = req.body.userId;

    try {
        const user = await User.findByIdAndDelete(userId);
        if(!user) {
            return res.status(404).send("User not found");
        } else {
            res.send("User deleted successfully");
        }
    } catch (error) {
        console.error("error deleting the user: " + error.message);
    }
})


app.put("/user", async (req, res) => {

    // Get the user's id from the request body and the updated user data from the request body
    const userId =  req.body.userId;
    const updatedUserData = req.body;

    // Update the user in the DB with the updated user data by their id
    try {
        const user = await User.findByIdAndUpdate(userId, updatedUserData, {new: true});
        if(!user) {
            return res.status(404).send("User not found");
        }
        res.send("User updated successfully");
    } catch (error) {
        console.error("error updating the user: " + error.message);
    }
})





connectDB()
    .then(() => {
        console.log('MongoDB connected...');
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((err) => {
        console.log("error connecting to MongoDB: ", err);
    });
