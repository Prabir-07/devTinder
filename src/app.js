const express = require('express');

const app = express();

app.get("/",(req, res) => {
    res.send('Welcome to the DevTinder API!');
});

app.get("/test", (req, res) => {
    res.send('Welcome to the Test API!');
});

app.get("/help", (req, res) => {
    res.send('Welcome to the Help API!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});