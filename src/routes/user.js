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
            toUserId: loggedInUser._id,
            status: "interested"
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

userRouter.get("/user/feed", userAuth, async (req, res) => {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 100 ? 10 : limit;
    const skip = (page-1) * limit;

    try {
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser._id},
                {toUserId: loggedInUser._id}
            ]
        });
        const hideUsersFromFeed = new Set();

        connectionRequest.forEach(request => {
            hideUsersFromFeed.add(request.fromUserId.toString()),
            hideUsersFromFeed.add(request.toUserId.toString())
        });
        hideUsersFromFeed.add(loggedInUser._id.toString());
        console.log("hideUsersFromFeed", hideUsersFromFeed);

        const users = await User.find({
            _id: { $nin: Array.from(hideUsersFromFeed)}
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        console.log("users", users);

        res.json({
            message: "User feed fetched successfully!",
            data: users
        });

    } catch (err) {
        res.status(400).json({message: "Error: " + err.message});
    }
});

module.exports = userRouter;