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

const validateEditProfileData = (req) => {
    const ALLOWED_EDITABLE_FIELDS = ['firstName', 'lastName', 'emailId', 'age', 'gender', 'about', 'skills', 'photoUrl'];

    const isAllowed = Object.keys(req.body).every((field) => ALLOWED_EDITABLE_FIELDS.includes(field));

    return isAllowed;
}

module.exports = {
    validateSignupData,
    validateEditProfileData,
};