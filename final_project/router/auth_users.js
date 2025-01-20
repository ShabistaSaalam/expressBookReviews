// auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();
const axios = require('axios');
//users array
users = [{
    "username": "JuniorDeveloper", // example credentials
    "password": "122334"
  },{
    "username": "AdminUser", 
    "password": "555666"
  }];

// Validate if the username exists
const isValid = (username) => {
  return username && username.length > 3; // Example: Username must be at least 4 characters
};

// Check if username and password match
const authenticatedUser = (username, password) => {
  const user = users.find((u) => u.username === username);
  return user && user.password === password;
};

// Login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
    console.log({ username, password });
  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ status: "failure", message: "Username and password are required" });
  }

  // Validate credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ status: "failure", message: "Invalid username or password" });
  }

  // Generate JWT token
  const token = jwt.sign({ user:username}, "NoneCanCrackThisKey", { expiresIn: "1h" });

  // Store token in session
  req.session.token = token;
  req.session.username = username;

  return res.send(`${username} logged in successfully`);
});


// PUT route for adding or modifying a review for a book
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;  // Get the review from the query parameter
  const username = req.user.username; // Get the username from the session
  
  // Log the received data for debugging
  console.log("Received ISBN:", isbn);
  console.log("Received Review:", review);
  console.log("User from Token:", username);

  // Check if review is provided
  if (!review) {
    return res.status(400).json({ status: "failure", message: "Review is required" });
  }

  // Check if the book with the given ISBN exists
  if (!books[isbn]) {
    books[isbn] = { reviews: [] }; // Initialize reviews array if book doesn't exist
    console.log("New book added with ISBN:", isbn);
  }

  // Find existing review by the user
  const existingReviewIndex = books[isbn].reviews.findIndex((rev) => rev.username === username);

  if (existingReviewIndex !== -1) {
    // Modify the existing review if user has already reviewed the book
    books[isbn].reviews[existingReviewIndex].review = review;
    console.log("Existing review modified:", books[isbn].reviews[existingReviewIndex]);
    return res.status(200).send(`Review updated successfully and the updated review is:${review}`);
  } else {
    // Add new review if user hasn't reviewed the book
    books[isbn].reviews.push({ username, review });
    console.log("New review added:", { username, review });
    return res.status(201).json({ status: "success", message: `Review added for ISBN ${isbn}`, review: `review added=${review}` });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(401).json({ status: "failure", message: "User not logged in" });
  }

  // Check if the book with the given ISBN exists
  const book = books[isbn];
  if (!book || !book.reviews) {
    return res.status(404).json({ status: "failure", message: "No reviews found for the book" });
  }

  // Find and delete the review of the logged-in user
  const reviewIndex = book.reviews.findIndex((rev) => rev.username === username);

  if (reviewIndex !== -1) {
    // Delete the review
    book.reviews.splice(reviewIndex, 1);
    return res.status(200).send(`Review posted by ${username} for ISBN ${isbn} is deleted successfully`)
  } else {
    return res.status(404).json({ status: "failure", message: "Review not found for the user" });
  }
});


module.exports.authenticated = regd_users;
module.exports.users=users

