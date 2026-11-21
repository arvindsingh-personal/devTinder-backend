const validator = require("validator");

const validateSignup = (req) => {
    const {firstName, lastName, emailId, password} = req.body;
    if(!firstName || !lastName) {
        throw new Error("Name is not valid!")
    }
    if(!validator.isEmail(emailId)){
        throw new Error("Email is not valide!");
    } else if(!validator.isStrongPassword(password)) {
        throw new Error("Password is not strong!")
    }
}

const validateEditData = (req) => {
    const ALLOWED_OPERATIONS = ["firstName", "lastName", "phototUrl", "skills", "about"];
    const isEditAllowed = Object.keys(req.body).every((key) => ALLOWED_OPERATIONS.includes(key));
    return isEditAllowed;
}

module.exports = {
    validateSignup,
    validateEditData
}