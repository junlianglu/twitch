#!/bin/bash

# Install new dependencies for error handling and logging
echo "Installing new dependencies for error handling and logging..."

npm install winston morgan express-rate-limit helmet compression

echo "Creating logs directory..."
mkdir -p logs

echo "Dependencies installed successfully!"
echo ""
echo "New features added:"
echo "- Winston logging system"
echo "- Morgan HTTP request logging"
echo "- Express rate limiting"
echo "- Helmet security headers"
echo "- Compression middleware"
echo "- Custom error classes"
echo "- Global error handler"
echo "- Request tracing with unique IDs"
echo ""
echo "To start the server:"
echo "  npm run dev    # Development mode with debug logging"
echo "  npm run prod   # Production mode with file logging"
echo "  npm start      # Default mode" 