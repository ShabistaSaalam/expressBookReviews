const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
const public_users = express.Router();
let users=require('./auth_users.js').users;

//register a new user with the specified username and password
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;
    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({
            status: "failure",
            message: "Username and password are required"
        });
    }

    // Check if username already exists
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({
            status: "failure",
            message: `Username ${username} already exists`
        });
    }

    // Register the new user
    users.push({ username: username, password: password })
    // Success response
    return res.status(201).json({
        status: "success",
        message: `${username} registered successfully, now you can login`
    });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  try {
      // Create an object where each book is keyed by its index
      const response = { 
          books: Object.keys(books).reduce((acc, isbn, index) => {
              acc[index + 1] = books[isbn]; // Use index + 1 as key for each book
              return acc;
          }, {})
      };

      res.status(200).json(response); // Send the structured response
  } catch (error) {
      res.status(500).json({ message: "Unable to fetch books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  try {
      // Retrieve the ISBN from the request parameters
      const isbn = req.params.isbn;

      // Check if the book exists in the books object
      const book = books[isbn];

      if (book) {
          // If book found, send it as the response
          res.status(200).json(book);
      } else {
          // If book not found, send an error message
          res.status(404).json({ message: "Book not found" });
      }
  } catch (error) {
      // Catch any errors and return a 500 response
      res.status(500).json({ message: "Error fetching book details", error: error.message });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    try {
        const author = req.params.author.toLowerCase(); // Case-insensitive matching
        const matchingBooks = [];
        let serialNumber = 1; // Start the serial number

        // Iterate through the books object with serial numbering
        for (let isbn in books) {
            if (books[isbn].author.toLowerCase() === author) {
                const { author, ...bookWithoutAuthor } = books[isbn]; // Exclude the author field
                matchingBooks.push({ serial: serialNumber, ...bookWithoutAuthor });
            }
            serialNumber++; // Increment serial number regardless of match
        }

        if (matchingBooks.length > 0) {
            // If matching books are found, return them
            res.status(200).json({ books_by_author: matchingBooks });
        } else {
            // If no books match the given author
            res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
    try {
        const title = req.params.title.toLowerCase(); // Case-insensitive matching
        const matchingBooks = [];
        let serialNumber = 1; // Start the serial number

        // Iterate through the books object with serial numbering
        for (let isbn in books) {
            if (books[isbn].title.toLowerCase() === title) {
                const { title, ...bookWithoutTitle } = books[isbn]; // Exclude the title field
                matchingBooks.push({ serial: serialNumber, ...bookWithoutTitle });
            }
            serialNumber++; // Increment serial number regardless of match
        }

        if (matchingBooks.length > 0) {
            // If matching books are found, return them
            res.status(200).json({ books_by_title: matchingBooks });
        } else {
            // If no books match the given title
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    try {
        const isbn = req.params.isbn; // Retrieve ISBN from request parameters

        if (books[isbn]) {
            const bookReviews = books[isbn].reviews; // Get reviews for the book
            res.status(200).json(bookReviews); // Send only the review object
        } else {
            // If no book is found for the given ISBN
            res.status(404).json({ message: "No book found with the given ISBN" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching reviews", error: error.message });
    }
});


// Task 10: Fetch list of all books
public_users.get('/', async (req, res) => {
    try {
      // Simulate a delay with a Promise 
      const bookList = await new Promise((resolve, reject) => {
        setTimeout(() => resolve(books), 100); // Simulate async delay
      });
      res.status(200).json(bookList); // Send the list of books
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch book list', details: err.message });
    }
  });
  
  // Task 11: Fetch book details by ISBN
  public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
      const book = await new Promise((resolve, reject) => {
        const foundBook = books[isbn];
        if (foundBook) {
          resolve(foundBook); // Resolve the Promise with the found book
        } else {
          reject(`Book with ISBN ${isbn} not found`); // Reject with an error if the book is not found
        }
      });
      res.status(200).json(book); // Send the found book
    } catch (err) {
      res.status(404).json({ error: err });
    }
  });
  
  // Task 12: Fetch books by author
  public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
      const result = await new Promise((resolve) => {
        const booksByAuthor = Object.values(books).filter((book) =>
          book.author.toLowerCase() === author.toLowerCase()
        );
        resolve(booksByAuthor);
      });
  
      if (result.length > 0) {
        res.status(200).json(result); // Send books found by the author
      } else {
        res.status(404).json({ error: `No books found by ${author}` });
      }
    } catch (err) {
      res.status(500).json({ error: 'An error occurred', details: err.message });
    }
  });
  
  // Task 13: Fetch books by title
  public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
      const result = await new Promise((resolve) => {
        const booksByTitle = Object.values(books).filter((book) =>
          book.title.toLowerCase() === title.toLowerCase()
        );
        resolve(booksByTitle);
      });
  
      if (result.length > 0) {
        res.status(200).json(result); // Send books found by the title
      } else {
        res.status(404).json({ error: `No books found with title ${title}` });
      }
    } catch (err) {
      res.status(500).json({ error: 'Unable to fetch data', details: err.message });
    }
  });
  
module.exports.general = public_users;

