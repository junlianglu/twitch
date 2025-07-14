// backend/app.js
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Import middleware
const { initializePostgres } = require('./config/sequelize');
const { errorHandler, notFound } = require('./utils/errorHandler');
const { requestLogger, requestTimer, requestId, responseLogger } = require('./middleware/requestLogger');
const { generalLimiter, authLimiter, uploadLimiter, recommendationLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Import routes
const channelRoutes = require('./routes/channelRoutes');
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Request logging and timing
app.use(requestId);
app.use(requestTimer);
app.use(requestLogger);
app.use(responseLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Apply rate limiting to different route groups
app.use('/api/users/auth', authLimiter); // Stricter limits for auth
app.use('/api/videos/upload', uploadLimiter); // Stricter limits for uploads
app.use('/api/recommendations', recommendationLimiter); // Specific limits for recommendations
app.use('/api', generalLimiter); // General API rate limiting

// API routes
app.use('/api/channels', channelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/recommendations', recommendationRoutes);

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const PORT = process.env.PORT || 8080;

// Initialize database and start server
const startServer = async () => {
  try {
    await initializePostgres();
    logger.info('Database connected successfully');
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();