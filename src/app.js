const express = require('express');

const app = express();
const PORT = 9000;

app.use("/",(req, res) => {
    res.send("Hello from the server!");
})

app.use("/test",(req, res) => {
    res.send("From test route")
})

app.listen(PORT, () => console.log("Server running on", PORT))