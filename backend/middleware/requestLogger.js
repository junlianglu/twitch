const morgan = require('morgan');
const logger = require('../utils/logger');

// Custom token for request ID
morgan.token('id', (req) => req.id);

// Custom token for response time
morgan.token('response-time', (req, res) => {
  if (!res._header || !req._startAt) return '';
  const diff = process.hrtime(req._startAt);
  const time = diff[0] * 1e3 + diff[1] * 1e-6;
  return time.toFixed(2);
});

// Custom token for user ID
morgan.token('user-id', (req) => req.user?.id || 'anonymous');

// Custom token for request body (for POST/PUT requests)
morgan.token('body', (req) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    // Don't log sensitive data
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    return JSON.stringify(sanitizedBody);
  }
  return '';
});

// Custom token for query parameters
morgan.token('query', (req) => {
  return Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '';
});

// Development format
const devFormat = ':method :url :status :response-time ms - :user-id';

// Production format (more detailed)
const prodFormat = ':method :url :status :response-time ms - :user-id - :user-agent';

// Custom format for detailed logging
const detailedFormat = ':method :url :status :response-time ms - :user-id - :user-agent - :body - :query';

// Create different Morgan instances
const requestLogger = morgan(devFormat, {
  stream: logger.stream,
  skip: (req, res) => {
    // Skip logging for health checks and static files
    return req.url === '/health' || req.url.startsWith('/static/');
  },
});

const detailedLogger = morgan(detailedFormat, {
  stream: logger.stream,
  skip: (req, res) => {
    // Skip logging for health checks and static files
    return req.url === '/health' || req.url.startsWith('/static/');
  },
});

// Request timing middleware
const requestTimer = (req, res, next) => {
  req._startAt = process.hrtime();
  next();
};

// Request ID middleware
const requestId = (req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Response logging middleware
const responseLogger = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    const responseTime = process.hrtime(req._startAt);
    const time = responseTime[0] * 1e3 + responseTime[1] * 1e-6;
    
    logger.info({
      message: 'HTTP Response',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${time.toFixed(2)}ms`,
      userId: req.user?.id || 'anonymous',
      requestId: req.id,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      contentLength: data ? data.length : 0,
    });
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = {
  requestLogger,
  detailedLogger,
  requestTimer,
  requestId,
  responseLogger,
}; 