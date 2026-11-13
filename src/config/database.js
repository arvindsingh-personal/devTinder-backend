const mongoose = require("mongoose");

const connectDB = async() => {
    await mongoose.connect("mongodb+srv://arvindsingh00030_db_user:DsGU5De8Z6sAdhqE@nodecluster.aefrrqc.mongodb.net/devTinder")
}

module.exports = connectDB;