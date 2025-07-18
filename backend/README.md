# Twitch-like Backend API

A Node.js/Express backend API for a Twitch-like streaming platform with user authentication, video management, and recommendation system.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Video Management**: Upload, stream, and manage video content
- **Channel System**: User channels with profiles and content
- **Recommendation Engine**: AI-powered video recommendations
- **Watch History**: Track user viewing patterns
- **Rate Limiting**: API protection against abuse
- **Logging**: Comprehensive request and error logging
- **Security**: Helmet security headers, CORS configuration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston, Morgan
- **File Upload**: Multer
- **AI Integration**: OpenAI API

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd twitch/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the backend directory:

   ```env
   # Database Configuration
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_DB=twitch_db
   POSTGRES_USER=your_username
   POSTGRES_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Server Configuration
   PORT=8080
   NODE_ENV=development

   # AWS Configuration (optional)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-s3-bucket-name

   # OpenAI Configuration (optional)
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Database Setup**

   - Create a PostgreSQL database
   - Update the `.env` file with your database credentials
   - The application will automatically create tables on startup

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run prod

   # Default mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── app.js                 # Main application entry point
├── config/
│   └── sequelize.js      # Database configuration
├── controller/           # Request handlers
│   ├── userController.js
│   ├── videoController.js
│   ├── channelController.js
│   └── recommendationController.js
├── entity/              # Database models
│   ├── User.js
│   ├── Video.js
│   ├── Channel.js
│   ├── UserWatchHistory.js
│   └── Recommendation.js
├── middleware/          # Custom middleware
│   ├── authMiddleware.js
│   ├── rateLimiter.js
│   └── requestLogger.js
├── routes/             # API route definitions
│   ├── userRoutes.js
│   ├── videoRoutes.js
│   ├── channelRoutes.js
│   └── recommendationRoutes.js
├── service/            # Business logic
│   ├── userService.js
│   ├── videoService.js
│   ├── channelService.js
│   └── recommendationService.js
└── utils/             # Utility functions
    ├── errorHandler.js
    ├── jwtUtils.js
    ├── logger.js
    └── validation.js
```

## 🔌 API Endpoints

### Authentication

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/verify-token` - Verify JWT token

### User Management

- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `PUT /api/users/preferences` - Update user preferences (protected)
- `GET /api/users/watch-history` - Get watch history (protected)
- `POST /api/users/watch-history` - Add watch history entry (protected)

### Video Management

- `GET /api/videos` - Get videos with pagination
- `POST /api/videos` - Upload new video (protected)
- `GET /api/videos/:id` - Get video details
- `PUT /api/videos/:id` - Update video (protected)
- `DELETE /api/videos/:id` - Delete video (protected)

### Channel Management

- `GET /api/channels` - Get channels
- `POST /api/channels` - Create channel (protected)
- `GET /api/channels/:id` - Get channel details
- `PUT /api/channels/:id` - Update channel (protected)

### Recommendations

- `GET /api/recommendations` - Get personalized recommendations (protected)
- `POST /api/recommendations/refresh` - Refresh recommendations (protected)

### Health Check

- `GET /health` - Server health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

### Users

- Basic user information (username, email, password)
- Profile preferences and settings
- Recommendation preferences

### Videos

- Video metadata (title, description, URL)
- Engagement metrics (views, likes, dislikes)
- Channel association

### Channels

- Channel information (name, description, avatar)
- User association

### UserWatchHistory

- Tracks user viewing behavior
- Watch time and completion percentage
- Like/dislike status

### Recommendations

- AI-generated video recommendations
- Algorithm type and scoring
- Expiration tracking

## 🚨 Error Handling

The API uses standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

Common error codes:

- `VALIDATION_ERROR` - Invalid input data
- `AUTHENTICATION_ERROR` - Invalid or missing token
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: API protection against abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Input Validation**: Request data validation
- **Error Logging**: Comprehensive error tracking

## 📝 Logging

The application uses Winston for structured logging:

- Request/response logging
- Error tracking
- Performance monitoring
- Security event logging

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT_SECRET
4. Configure SSL certificates
5. Set up reverse proxy (nginx)
6. Use PM2 for process management

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the repository.
