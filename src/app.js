const express = require('express');
const connectDB = require("./config/database");
const User = require('./models/user');

const app = express();
const PORT = 9000;

app.post("/signup", async(req, res) => {
    const userObj = {
        firstName:"Arivnd",
        lastName: "Singh",
        emailId: "arvind@gmail.com",
        password: 1234
    }
    const user = new User(userObj);
    try {
        await user.save()
    res.send("User registered!")
    } catch (err) {
       res.status(400).send("Error registering user", err.message); 
    }
    
})

connectDB().then(() => {
    console.log("Database connection established...");  
    app.listen(PORT, () => console.log("Server running on", PORT));
}).catch(err => {
    console.log("Databse can not be connected!!", err);
});