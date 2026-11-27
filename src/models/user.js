const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 40
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
    },
    age: {
        type: String,
        min: 18
    },
    gender: {
        type: String,
        validate(value) {
            if(!["male", "female", "others"].includes(value)) {
                throw new Error("Gender data is not valid");
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://www.shutterstock.com/image-vector/user-profile-icon-yellow-circle-logo-1484290709"
    },
    skills: {
        type: [String]
    }
},{
    timestamps: true
})

userSchema.methods.getJWT = async function() {
    const user = this;

    const token = await jwt.sign({id: user._id}, "Dev@Tinder@123", {expiresIn: '1d'});

    return token;
}

userSchema.methods.validatePassword = async function(passwordInput) {
    const user = this;
    const isValidPassword = await bcrypt.compare(passwordInput, user.password);

    return isValidPassword;
}

const User = mongoose.model("User", userSchema);

module.exports = User;