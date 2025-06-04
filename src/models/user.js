const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type : String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    lastName: {
        type : String,
        minlength: 3,
        maxlength: 30
    },
    emailId: {
        type : String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type : String,
        required: true
    },
    age: {
        type : Number,
        min: 18,
        max: 100
    },
    gender: {
        type : String,
        validate(value) {
            if(!['male', 'female', 'others'].includes(value)) {
                throw new Error("Gender must be either male, female, or others");
            }
        }
    },
    skills: {
        type : [String],
        
    },
    photoUrl: {
        type : String,
        default: "https://kristalle.com/team/david-and-audrey-lloyd/dummy-profile-pic/"
    },
    about: {
        type : String,
        default: "No description provided"
    }
},
{
    timestamps: true
})


const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;