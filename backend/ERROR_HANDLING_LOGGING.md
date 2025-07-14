# Error Handling & Logging System

## Overview

This document describes the comprehensive error handling and logging system implemented for the Twitch-like backend API.

## Error Handling System

### Custom Error Classes

The system uses custom error classes for different types of errors:

- **AppError**: Base error class with status code and operational flag
- **ValidationError**: For input validation errors (400)
- **AuthenticationError**: For authentication failures (401)
- **AuthorizationError**: For authorization failures (403)
- **NotFoundError**: For resource not found (404)
- **ConflictError**: For resource conflicts (409)
- **RateLimitError**: For rate limiting violations (429)

### Usage Examples

```javascript
// In controllers
const { ValidationError, NotFoundError } = require("../utils/errorHandler");

// Validation error
if (!requiredField) {
  throw new ValidationError("Required field is missing");
}

// Not found error
if (!user) {
  throw new NotFoundError("User not found");
}
```

### Global Error Handler

The global error handler (`errorHandler`) automatically:

1. Logs all errors with context
2. Handles database-specific errors (Sequelize, Mongoose)
3. Handles JWT errors
4. Sanitizes error responses for production
5. Provides detailed error information in development

### Async Error Wrapper

Use `asyncHandler` to automatically catch async errors:

```javascript
const { asyncHandler } = require("../utils/errorHandler");

const myController = asyncHandler(async (req, res) => {
  // Your controller logic here
  // Any thrown error will be caught and passed to error handler
});
```

## Logging System

### Winston Logger Configuration

The logging system uses Winston with:

- **Multiple log levels**: error, warn, info, http, debug
- **Colorized console output** for development
- **File-based logging** for production
- **Structured JSON logging** for machine processing
- **Environment-based log levels**

### Log Files

- `logs/error.log`: Only error-level logs
- `logs/combined.log`: All log levels

### Usage Examples

```javascript
const logger = require("../utils/logger");

// Different log levels
logger.error("Critical error occurred", { error: err.message });
logger.warn("Warning message", { userId: req.user.id });
logger.info("Information message", { action: "user_login" });
logger.debug("Debug information", { requestId: req.id });
logger.http("HTTP request", { method: req.method, url: req.url });
```

### Request Logging

The system includes comprehensive request logging:

- **Morgan integration** for HTTP request logging
- **Request timing** with response time measurement
- **Request ID generation** for request tracing
- **User context** logging (user ID, IP, user agent)
- **Sanitized request body** logging (passwords/tokens redacted)

## Rate Limiting

### Rate Limiters

Different rate limiters for different endpoints:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Upload endpoints**: 10 requests per hour
- **Recommendation API**: 50 requests per 5 minutes
- **Admin endpoints**: 20 requests per 15 minutes

### Usage

```javascript
const { authLimiter, uploadLimiter } = require("../middleware/rateLimiter");

// Apply to specific routes
app.use("/api/users/auth", authLimiter);
app.use("/api/videos/upload", uploadLimiter);
```

## Security Features

### Helmet Integration

- **Content Security Policy** headers
- **XSS protection**
- **Frame options**
- **Content type sniffing protection**

### CORS Configuration

- **Origin restrictions** for production
- **Credential support**
- **Method restrictions**

## Environment Configuration

### Development Mode

- **Debug-level logging**
- **Detailed error responses**
- **Colorized console output**
- **Verbose request logging**

### Production Mode

- **Warn-level logging**
- **Sanitized error responses**
- **File-based logging**
- **Compressed responses**

## Monitoring and Debugging

### Health Check Endpoint

```
GET /health
```

Returns server status, uptime, and timestamp.

### Request Tracing

Each request gets a unique ID for tracing:

```javascript
// Request ID is automatically added to headers
X-Request-ID: abc123def
```

### Performance Monitoring

Response times are automatically logged:

```javascript
// Example log entry
2024-01-15 10:30:45.123 info: HTTP Response - GET /api/users/profile - 200 - 45.67ms - user123
```

## Best Practices

### Error Handling

1. **Use custom error classes** for specific error types
2. **Wrap async controllers** with `asyncHandler`
3. **Log errors with context** (user ID, request ID, etc.)
4. **Sanitize sensitive data** in logs
5. **Provide meaningful error messages**

### Logging

1. **Use appropriate log levels**
2. **Include relevant context** (user ID, request ID, etc.)
3. **Don't log sensitive information**
4. **Use structured logging** for machine processing
5. **Monitor log file sizes**

### Rate Limiting

1. **Apply appropriate limits** for different endpoints
2. **Monitor rate limit violations**
3. **Provide clear error messages**
4. **Consider user experience** when setting limits

## Configuration

### Environment Variables

```bash
NODE_ENV=development|production
PORT=8080
LOG_LEVEL=debug|info|warn|error
```

### Log Directory

Create the logs directory:

```bash
mkdir -p backend/logs
```

## Troubleshooting

### Common Issues

1. **Log files not created**: Ensure logs directory exists
2. **Rate limiting too strict**: Adjust limits in rateLimiter.js
3. **Error responses too verbose**: Check NODE_ENV setting
4. **Performance issues**: Monitor response times in logs

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development npm start
```

This will provide detailed logging for debugging purposes.
