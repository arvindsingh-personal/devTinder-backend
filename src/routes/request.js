const express = require("express");
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId", userAuth, async(req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const ALLOWED_STATUS = ["ignored", "interested"];
        if(!ALLOWED_STATUS.includes(status)) {
            throw new Error("Invalide status type:" + status);
        }

        const toUser = await User.findById(toUserId);
        if(!toUser) {
            return res.status(404).json({message: "User not found!"});
        }

        const existingConnectionRequest = await connectionRequest.findOne({
            $or:[
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        });
        if(existingConnectionRequest) {
            throw new Error("Connection request already exists!");
        }

        const request = await connectionRequest({
            fromUserId, toUserId, status
        })
        const data = await request.save();
        console.log(data);

        res.json({
            message: "Connection request sent successfully!",
            data
        });

    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
});

module.exports = requestRouter;