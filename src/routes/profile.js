const express = require("express");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const { validateEditData } = require("../utils/validation");
const bcrypt = require("bcrypt");


const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
    try {
    const user = req.user;
    res.send(user);
    } catch (err) {
         res.status(400).send("Error: " + err.message);
    }
})

profileRouter.get("/user", userAuth, async (req, res) => {
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

profileRouter.get("/feed", userAuth,  async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(404).send("Something went wrong!");
    }
});

profileRouter.patch("/user/:userId", async(req, res) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        const ALLOWED_OPERATIONS = ["firstName", "lastName", "password"];
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
        res.send("User updated successfully!");
    } catch (err) {
        res.status(400).send("Update Failed: " + err.message);
    }
})

profileRouter.patch("/profile/edit", userAuth, async(req, res) => {
    try {
        if(!validateEditData(req)) {
            throw new Error("Invalide edit operation!")
        }
        const loggedInUser = req.user;
        Object.keys(req.body).every((key) => (loggedInUser[key] = req.body[key]));
        await loggedInUser.save()
        res.send({
            message: `${loggedInUser.firstName}'s profile updated successfully!`,
            data: loggedInUser
        });
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
});

  profileRouter.patch("/profile/password", userAuth, async (req, res) => {
        try {
            const loggedInUser = req.user;
            const newPassword = req.body.password;
            const passwordHash = await bcrypt.hash(newPassword, 10);

            loggedInUser['password'] = passwordHash;
            loggedInUser.save();
            res.send("Password updated successfully!")
        } catch (err) {
            res.status(400).send('Error: ' + err.message);
        }
    })

module.exports = profileRouter;