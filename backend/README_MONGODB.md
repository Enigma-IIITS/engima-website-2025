# Enigma Backend API

A comprehensive RESTful API backend for the Enigma website built with Express.js, Node.js, and MongoDB.

## Features

- **Express.js** - Fast, unopinionated web framework
- **MongoDB & Mongoose** - NoSQL database with object modeling
- **JWT Authentication** - Secure token-based authentication
- **Security** - Helmet for security headers, CORS enabled, Rate limiting
- **Logging** - Morgan for HTTP request logging
- **Environment Configuration** - dotenv for environment variables
- **Input Validation** - express-validator for request validation
- **Password Hashing** - bcryptjs for secure password storage
- **Modular Routes** - Organized route structure with middleware

## Project Structure

```
backend/
├── config/
│   └── database.js         # MongoDB connection configuration
├── middleware/
│   ├── auth.js            # Authentication & authorization middleware
│   └── rateLimiter.js     # Rate limiting middleware
├── models/
│   ├── User.js            # User model with authentication features
│   └── Event.js           # Event model with registration system
├── routes/
│   ├── auth.js            # Authentication routes (register, login, logout)
│   ├── users.js           # User management routes
│   └── events.js          # Events management routes
├── scripts/
│   └── seedDatabase.js    # Database seeding script
├── utils/
│   ├── jwt.js             # JWT token utilities
│   ├── response.js        # API response utilities
│   └── validation.js      # Input validation rules
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Dependencies and scripts
├── server.js             # Main application file
└── README.md             # Project documentation
```

## MongoDB Features

### User Model

- **Authentication**: Password hashing with bcrypt, JWT tokens
- **User Roles**: admin, moderator, user
- **Profile Management**: College, year, department info
- **Email Verification**: Built-in email verification system
- **Password Reset**: Token-based password reset

### Event Model

- **Event Management**: Create, update, delete events
- **Registration System**: User registration with team support
- **Event Types**: online, offline, hybrid
- **Categories**: technical, cultural, sports, workshop, seminar, competition
- **Status Management**: draft, published, ongoing, completed, cancelled
- **Feedback System**: Event ratings and comments

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env` file and configure:

   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/enigma_db
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   ```

4. Start MongoDB:

   - **Local MongoDB**: Make sure MongoDB is running
   - **MongoDB Atlas**: Use the connection string in MONGODB_URI

5. Seed the database (optional):

   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run seed` - Seed the database with sample data
- `npm test` - Run tests (to be implemented)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Users

- `GET /api/users` - Get all users (Admin only, with pagination & search)
- `GET /api/users/:id` - Get user by ID (Own profile or Admin)
- `PUT /api/users/:id` - Update user profile (Own profile or Admin)
- `PUT /api/users/:id/role` - Update user role (Admin only)
- `DELETE /api/users/:id` - Deactivate user (Admin only)

### Events

- `GET /api/events` - Get all events (Public, with filters & pagination)
- `GET /api/events/:id` - Get event by ID (Public)
- `POST /api/events` - Create new event (Admin/Moderator)
- `PUT /api/events/:id` - Update event (Admin/Moderator/Organizer)
- `DELETE /api/events/:id` - Delete event (Admin only)
- `POST /api/events/:id/register` - Register for event (Authenticated users)
- `DELETE /api/events/:id/register` - Cancel event registration (Authenticated users)

### Query Parameters

#### Events

- `page` - Page number for pagination
- `limit` - Items per page
- `category` - Filter by event category
- `eventType` - Filter by event type (online/offline/hybrid)
- `status` - Filter by event status
- `isFeatured` - Filter featured events
- `search` - Search in title, description, tags
- `upcoming` - Filter upcoming events
- `ongoing` - Filter ongoing events

#### Users (Admin only)

- `page` - Page number for pagination
- `limit` - Items per page
- `search` - Search in name, email, college
- `role` - Filter by user role
- `isActive` - Filter active/inactive users

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- **user** - Regular users (can register for events, update own profile)
- **moderator** - Can create and manage events
- **admin** - Full access to all resources

## Database Schema

### User Schema

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin/moderator),
  avatar: String,
  phone: String,
  college: String,
  year: String,
  department: String,
  isEmailVerified: Boolean,
  lastLogin: Date,
  isActive: Boolean,
  timestamps: true
}
```

### Event Schema

```javascript
{
  title: String,
  description: String,
  category: String,
  eventType: String,
  startDate: Date,
  endDate: Date,
  registrationEndDate: Date,
  venue: String,
  onlineLink: String,
  maxParticipants: Number,
  currentParticipants: Number,
  registrationFee: Number,
  organizers: [ObjectId],
  coordinators: [Object],
  registrations: [Object],
  status: String,
  isActive: Boolean,
  isFeatured: Boolean,
  timestamps: true
}
```

## Security Features

- **Helmet** - Sets various HTTP headers for security
- **CORS** - Configured for cross-origin requests
- **Rate Limiting** - Prevents abuse and DoS attacks
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - express-validator for request validation
- **MongoDB Injection Protection** - Mongoose built-in protection

## Error Handling

The API provides consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Validation errors if applicable
}
```

## Success Responses

All successful responses follow this format:

```javascript
{
  "success": true,
  "message": "Success description",
  "data": {...} // Response data
}
```

## Sample Data

Run the seed script to populate the database with sample data:

```bash
npm run seed
```

This creates:

- 1 Admin user (admin@enigma.com / admin123)
- 1 Moderator user (moderator@enigma.com / mod123)
- 3 Regular users
- 3 Sample events with registrations

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/enigma_db
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/enigma_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Email Configuration (for future features)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

## Development Tips

1. **MongoDB Connection**: Ensure MongoDB is running before starting the server
2. **Environment Variables**: Never commit real secrets to version control
3. **Database Indexing**: Indexes are set up for optimal query performance
4. **Validation**: All inputs are validated before database operations
5. **Error Logging**: Check console for detailed error information

## Future Enhancements

- [ ] Email verification system
- [ ] Password reset functionality
- [ ] File upload for event posters and user avatars
- [ ] Event feedback and rating system
- [ ] Push notifications
- [ ] Payment integration for event fees
- [ ] Advanced search with Elasticsearch
- [ ] API documentation with Swagger
- [ ] Unit and integration tests
- [ ] Redis caching for better performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
