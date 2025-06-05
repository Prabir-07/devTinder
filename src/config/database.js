const mongoose = require('mongoose');

// Connect to MongoDB

const URL = "mongodb+srv://namasteDev:cchqhg1XSKqGVgpc@namastenode.ctrtrwf.mongodb.net/devTinder";
const connectDB = async () => {
    await mongoose.connect(URL);
}

module.exports = connectDB;