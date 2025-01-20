const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// Middleware for checking JWT token
app.use("/customer/auth/*", function auth(req, res, next) {
    try {
        // Extract the token from the Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(' ')[1] // Extract token after "Bearer "
            : null;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized access: No token provided" });
        }

        // Verify the token using the secret key
        const secretKey = "NoneCanCrackThisKey";  // Use your secret key here
        const decoded = jwt.verify(token, secretKey); // Decoding the token
        
        // Attach decoded user information to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // If token is invalid or expired
        return res.status(401).json({ message: "Unauthorized access: Invalid or expired token", error: error.message });
    }
});


const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
