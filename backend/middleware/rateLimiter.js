const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const { RateLimitError } = require('../utils/errorHandler');

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    logger.warn({
      message: 'Rate limit exceeded',
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
      },
    });
  },
});

// Auth endpoints rate limiter (more strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn({
      message: 'Auth rate limit exceeded',
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many authentication attempts, please try again later.',
      },
    });
  },
});

// Video upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    success: false,
    error: {
      message: 'Too many upload attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn({
      message: 'Upload rate limit exceeded',
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many upload attempts, please try again later.',
      },
    });
  },
});

// Recommendation API rate limiter
const recommendationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per 5 minutes
  message: {
    success: false,
    error: {
      message: 'Too many recommendation requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn({
      message: 'Recommendation rate limit exceeded',
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many recommendation requests, please try again later.',
      },
    });
  },
});

// Admin endpoints rate limiter (very strict)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many admin requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn({
      message: 'Admin rate limit exceeded',
      ip: req.ip,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many admin requests, please try again later.',
      },
    });
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  recommendationLimiter,
  adminLimiter,
}; 