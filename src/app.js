const express = require('express');
const connectDB = require('./config/database');
const app = express();
const { User } = require('./models/user');
const { validateSignupData } = require('./utils/validation');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { userAuth }  = require('./middleware/auth');


app.use(express.json());
app.use(cookieParser());


app.post("/login", async (req, res) => {
    const userEmail = req.body.emailId;
    const userPassword  = req.body.password;

    
    try {
        const user =  await User.findOne({emailId : userEmail});
        if(!user) {
            throw new Error("Invalid credentials");
        }
    
        const isPasswordMatching =  await user.comparePassword(userPassword);
        
        if(isPasswordMatching) {

            const token = await user.getJWT();
            res.cookie('token', token);
            res.send("User logged in successfully");
        }
        else {
            throw new Error("Invalid credentials");
        }

    }
    catch (error) {
        console.error("error logging in the user: " + error.message);
        res.send("Failed to login user: " + error.message);
    }
})


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


app.get("/profile", userAuth, async (req, res) => {

    try {
        res.send(req.user);
    }
    catch (error) {
        console.error("error verifying the token: " + error.message);
        return res.status(403).send("Access denied: " + error.message);
    }
})


app.post("/sendConnectionRequest", userAuth, async (req, res) => {

    try {
        const user = await User.findOne({_id: req.user._id});
        console.log(`${user.firstName} is sending a connection request.`);
        res.send(`${user.firstName} is sending a connection request.`);
    }
    catch (error) {
        console.error("error sending the connection request: " + error.message);
        res.send("Failed to send the connection request: " + error.message);
    }
})


app.get("/user", userAuth, async (req, res) => {


    const userEmail = req.body.emailId;

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
