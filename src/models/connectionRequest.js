const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: {
           values: ["interested", "ignored", "accepted", "rejected"],
           message: `{VALUE} status is incorrect type`
        }
    }
}, {
    timestamps: true
})

connectionRequestSchema.index({fromUserId: 1});

connectionRequestSchema.pre("save", function(next) {
    const connectionRequest = this;
    // check if fromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("Connect send connection request to your self!")
    }
    next();
})

const ConnectionRequest = new mongoose.model("connectionRequest", connectionRequestSchema);

module.exports = ConnectionRequest;