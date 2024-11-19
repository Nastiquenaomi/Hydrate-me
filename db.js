const mongoose = require("mongoose");
require('dotenv').config();


// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongoose connected successfully");
  })
  .catch((error) => {
    console.error("Failed to connect to Mongoose:", error);
  });

// Define the Login Schema
const signUpSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true, // Ensure each email is unique
  },

  password: {
    type: String,
    required: true,
  }
});

// Create the Login Collection
const collections = mongoose.model("users", signUpSchema);

// Export the Model
module.exports = collections;
