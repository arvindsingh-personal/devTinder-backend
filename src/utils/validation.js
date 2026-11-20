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

module.exports = {
    validateSignup
}