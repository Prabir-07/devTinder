const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const userAuth = async (req, res, next) => {

    try {   
        const { token } = req.cookies;
        if(!token) {
            throw new Error("You are not authenticated");
        }

        const decodedToken = jwt.verify(token, 'Dev@Tinder$4321');
        const { userId } = decodedToken;

        const user = await User.findById(userId);
        if(!user) {
            throw new Error("User not found");
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("Error in user authentication: " + error.message);
        res.status(401).send({ error: 'You are not authenticated' });
  }

}

module.exports = {
    userAuth,
};