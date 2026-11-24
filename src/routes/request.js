const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
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

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        });
        if(existingConnectionRequest) {
            throw new Error("Connection request already exists!");
        }

        const request = await ConnectionRequest({
            fromUserId, toUserId, status
        })
        const data = await request.save();

        res.json({
            message: "Connection request sent successfully!",
            data
        });

    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async(req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        const allowed_status = ["accepted", "rejected"];
        if(!allowed_status.includes(status)) {
            return res.status(404).json({message: "Status not found!"});
        }

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested"
        })
        
        if(!connectionRequest) {
            return res.status(404).json({message: "connection request not found!"});
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();

        res.json({
            message: "Connection request " + status,
            data
        });
    } catch (error) {
        res.status(400).json({message: "Error: " + error.message});
    }
});

module.exports = requestRouter;