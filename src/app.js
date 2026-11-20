const express = require('express');
const connectDB = require("./config/database");
const User = require('./models/user');
const { validateSignup } = require('./utils/validation');
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {userAuth} = require("./middlewares/auth")

const app = express();
const PORT = 9000;

app.use(express.json());
app.use(cookieParser());

app.post("/signup", async(req, res) => {
    try {
        // Validate the data
        validateSignup(req);
        const {
            firstName, lastName, emailId,password
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
})

app.post("/login", async(req, res) => {
    try {
        const {emailId, password} = req.body;
        const user = await User.findOne({emailId: emailId})
        // console.log("user", user)
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
            res.send("Login successful!");
        } else {
            throw new Error("Invalid credentials");
        }
    } catch (err) {
        res.status(400).send("Error login user: " + err.message);
    }
})

app.get("/profile", userAuth, async (req, res) => {
    try {
    const user = req.user;
    // console.log(user);
    res.send(user);
    } catch (err) {
         res.status(400).send("Error: " + err.message);
    }
})

app.get("/connectionRequest", userAuth, (req, res) => {

    console.log("Connection request send!");

    res.send("Request sent!")
})

app.get("/user", async (req, res) => {
    try {
        const users = await User.find({emailId: req.body.emailId});
        if(users?.length > 0) {
            res.send(users);
        }
        else {
            res.status(400).send("User not found");
        }
    } catch (error) {
        res.status(404).send("Something went wrong!");
    }
});

app.get("/feed", async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(404).send("Something went wrong!");
    }
});

app.patch("/user/:userId", async(req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        console.log("userid", userId, "data", data);
        const ALLOWED_OPERATIONS = ["userId", "firstName", "lastName", "password"];
        const isUpdateAllowed = Object.keys(data).every((k) =>
            ALLOWED_OPERATIONS.includes(k)
        );
        if(!isUpdateAllowed) {
            throw new Error("Update not allowed");
        }
        
        const user = await User.findByIdAndUpdate({_id: userId}, data, {
            returnDocument: "after",
            runValidators: true
        })
        console.log("User", user);
        res.send("User updated successfully!");
    } catch (err) {
        res.status(400).send("Update Failed: " + err.message);
    }
})

connectDB().then(() => {
    console.log("Database connection established...");  
    app.listen(PORT, () => console.log("Server running on", PORT));
}).catch(err => {
    console.log("Databse can not be connected!!", err);
});