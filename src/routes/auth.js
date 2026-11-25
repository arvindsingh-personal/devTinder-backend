const express = require("express");
const {validateSignup} = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async(req, res) => {
    try {
        // Validate the data
        validateSignup(req);
        const {
            firstName, lastName, emailId, password
        } = req.body

        //encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            firstName, lastName, emailId,  password: passwordHash
        });
   
        await user.save();
        res.send("User registered!")
    } catch (err) {
       res.status(400).send("Error registering user: " + err.message);
    }
});

authRouter.post("/login", async(req, res) => {
    try {
        const {emailId, password} = req.body;
        const user = await User.findOne({emailId: emailId})
        if(!user) {
            throw new Error("Invalid credentials");
        }
        const isValid = await user.validatePassword(password);
        console.log("isvalid", isValid)
        if(isValid) {
            // Create a JWT Token
            const token = await user.getJWT();

            // Add the token to cookie and send the response back to the user
            res.cookie("token", token, {expires: new Date(Date.now() + 8 * 3600000), httpOnly: true});
            res.json({
                message: "LoggedIn successfully!",
                data: user
            })
        } else {
            throw new Error("Invalid credentials");
        }
    } catch (err) {
        res.status(400).send("Error login user: " + err.message);
    }
})

authRouter.post('/logout', (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now())
    })

    res.send("Logout successful!");
})

module.exports = authRouter;