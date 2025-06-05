const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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
        trim: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error("Invalid email");
            }
        }
    },
    password: {
        type : String,
        required: true,
        validate(value) {
            if(!validator.isStrongPassword(value)) {
                throw new Error("Password must be strong");
            }
        }
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
        default: "https://kristalle.com/team/david-and-audrey-lloyd/dummy-profile-pic/",
        validate(value) {
            if(!validator.isURL(value)) {
                throw new Error("Invalid URL");
            }
        }
    },
    about: {
        type : String,
        default: "No description provided"
    }
},
{
    timestamps: true
})


userSchema.index({firstName: 1, lastName: 1});

userSchema.methods.getJWT = async function() {
    const user = this;
    const token = await jwt.sign({ userId: user._id }, 'Dev@Tinder$4321', { expiresIn: '1h' });
    return token;
}

userSchema.methods.comparePassword = async function(userPassword) {
    const user = this;
    return await bcrypt.compare(userPassword, user.password);
}


const UserModel = mongoose.model("User", userSchema);

module.exports = {
    User : UserModel,
    userSchema : userSchema,
}