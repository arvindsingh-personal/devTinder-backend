const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

const USER_SAFE_DATA = "firstName lastName emailId photoUrl skills";

userRouter.get("/user/request/received", userAuth, async(req, res) => {
    const loggedInUser = req.user;
    try {
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id
        }).populate("fromUserId", USER_SAFE_DATA);

        res.json({
            message: "Requests fetched successfully!",
            data: connectionRequest
        });
    } catch (err) {
        res.status(400).json({message: "Error: " + err.message});
    }
})

userRouter.get("/user/connections", userAuth, async(req, res) => {
    const loggedInUser = req.user;

    try {
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser._id, status: "accepted"},
                {toUserId: loggedInUser._id, status: "accepted"}
            ]
        })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequest.map((connection) => {
            if(connection.fromUserId._id.toString() == loggedInUser._id.toString()) {
                return connection.toUserId;
            }
            return connection.fromUserId;
        } )

        res.json({
            message: "Connections fetched successfully!",
            data
        });
    } catch (err) {
        res.status(400).json({message: "Error: " + err.message});
    }
});



module.exports = userRouter;