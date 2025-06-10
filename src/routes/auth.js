const express = require('express');
const { User } = require('../models/user');
const { validateSignupData } = require('../utils/validation');
const bcrypt = require('bcrypt');
const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
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

            const allowedFields = ['firstName', 'lastName', 'emailId', 'gender', 'about', 'photoUrl', 'age', 'skills'];
            
            const userToSend = user.toObject();
            Object.keys(userToSend).forEach((feild) => {
                if(!allowedFields.includes(feild)) delete userToSend[feild];
            })

            res.send(userToSend);
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

authRouter.post("/signup", async (req, res) => {

    try {
        validateSignupData(req); 

        const {password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        req.body.password = hashedPassword;

        const user = new User(req.body);

        await user.save();
        res.send(user);
        console.log("User added to DB successfully");
    } catch (error) {
        console.error("error saving the user: " + error.message);
        res.send("Failed to add user to DB " + error.message);
    }

})

authRouter.post('/logout', async (req, res) => {
    res.cookie('token', null, { expires: new Date(0) }) 
    res.send('User logged out successfully');
});


module.exports = authRouter;