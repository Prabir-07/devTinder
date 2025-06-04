const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');



app.post("/signup", async (req, res) => {

    const user = new User({
        firstName : "Prabir",
        lastName : "Panda",
        emailId : "prabir@123",
        password : "Razz@123"
    })

    try {
        await user.save();
        res.sendfile("User added to DB successfully");
    } catch (error) {
        console.error("error saving the user: " + error.message);   
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
