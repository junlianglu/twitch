// backend/app.js
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { initializePostgres } = require('./config/sequelize');
const channelRoutes = require('./routes/channelRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }));
app.options('*', cors()); // enable pre-flight across-the-board

// Set up the API routes
app.use('/api/channels', channelRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8080;
initializePostgres().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});