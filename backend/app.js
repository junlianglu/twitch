// backend/app.js
const express = require('express');
const app = express();
const cors = require('cors');

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }));
app.options('*', cors()); // enable pre-flight across-the-board

// Set up the API routes
// TODO

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));