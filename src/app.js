const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');
const { validateSignupData } = require('./utils/validation');
const bcrypt = require('bcrypt');

app.use(express.json());

app.post("/signup", async (req, res) => {
    
    try {
        validateSignupData(req); 

        const {password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        req.body.password = hashedPassword;

        const user = new User(req.body);

        await user.save();
        res.send("User added to DB successfully");
    } catch (error) {
        console.error("error saving the user: " + error.message);
        res.send("Failed to add user to DB " + error.message);
    }

})


app.post("/login", async (req, res) => {
    
    try {
        const { userEmail, userPassword }  = req.body;

        const user =  await User.findOne({emailId : userEmail});
        if(!user) {
            throw new Error("Invalid credentials");
        }
    
        const hashedPassword = user.password;
        const isPasswordMatching =  await bcrypt.compare(userPassword, hashedPassword);
        if(!isPasswordMatching) {
            throw new Error("Invalid credentials");
        }

        res.send("User logged in successfully");
    }
    catch (error) {
        console.error("error logging in the user: " + error.message);
        res.send("Failed to login user: " + error.message);
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


app.patch("/user/:userId", async (req, res) => {

    const userId =  req.params?.userId;
    const updatedUserData = req.body;
    
    try {
        const UPDATES_ALLOWED = ['password', 'age', 'gender','skills', 'photoUrl', 'about'];
        const updates = Object.keys(updatedUserData).every(key => UPDATES_ALLOWED.includes(key));

        if(!updates) {
            return res.status(400).send("Invalid updates");
        }

        if(updatedUserData?.skills?.length > 10) {
            throw new Error("Skills cannot exceed 10");
        }

        const user = await User.findByIdAndUpdate(userId, updatedUserData, {new: true, runValidators: true });
        if(!user) {
            return res.status(404).send("User not found");
        }
        res.send("User updated successfully");
    } catch (error) {
        console.error("error updating the user: " + error.message);
        res.send(error.message);
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
