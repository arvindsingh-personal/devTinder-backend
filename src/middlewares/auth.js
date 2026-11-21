const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const {token} = req.cookies
        if(!token) {
            throw new Error("Login to continue!");
        }
        const decodedMessage = jwt.verify(token, "Dev@Tinder@123");
        const { id } = decodedMessage;
        const user = await User.findById({_id:id});
        console.log(user)
        if(!user) {
            throw new Error("User not found");
        }
        req.user = user;
        next();
    } catch (err) {
         res.status(400).send("Error: " + err.message); 
    }
}

module.exports = {
    userAuth
}