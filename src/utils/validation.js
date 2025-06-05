const validator = require('validator');

const validateSignupData =  (req) => {
    const {firstName, lastName, emailId, password} = req.body;

    // Validate first name
    if(!firstName || firstName.trim() === '') {
        throw new Error("First name is required");
    }

    // Validate last name
    if(!lastName || lastName.trim() === '') {
        throw new Error("Last name is required");
    }

    // Validate email
    if(!emailId ||!emailId.includes('@') || emailId.trim() === '' || !validator.isEmail(emailId)) {
        throw new Error("Valid email is required");
    }

    // Validate password
    if(!password || password.trim() === '' || !validator.isStrongPassword(password)) {
        throw new Error("Strong password is required");
    }
}

module.exports = {
    validateSignupData
};