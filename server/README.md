# Enigma Backend API

A RESTful API backend for the Enigma website built with Express.js and Node.js.

## Features

- **Express.js** - Fast, unopinionated web framework
- **Security** - Helmet for security headers, CORS enabled
- **Logging** - Morgan for HTTP request logging
- **Environment Configuration** - dotenv for environment variables
- **Rate Limiting** - Protection against abuse
- **Authentication** - JWT-based authentication (to be implemented)
- **Modular Routes** - Organized route structure

## Project Structure

```
backend/
├── middleware/          # Custom middleware
│   ├── auth.js         # Authentication middleware
│   └── rateLimiter.js  # Rate limiting middleware
├── routes/             # API routes
│   ├── auth.js         # Authentication routes
│   ├── users.js        # User management routes
│   └── events.js       # Events routes
├── .env                # Environment variables
├── .gitignore          # Git ignore file
├── package.json        # Dependencies and scripts
└── server.js           # Main application file
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
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

3. Copy and configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Or start in production mode:

   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests (to be implemented)

## API Endpoints

### Health Check

- `GET /` - Welcome message and API status
- `GET /api/health` - Health check endpoint

### Authentication (TODO)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users (TODO)

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)

### Events (TODO)

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=5432
DB_NAME=enigma_db
DB_USER=your_username
DB_PASSWORD=your_password
```

## Security Features

- **Helmet** - Sets various HTTP headers for security
- **CORS** - Configured for cross-origin requests
- **Rate Limiting** - Prevents abuse and DoS attacks
- **JWT Authentication** - Secure token-based authentication (to be implemented)

## TODO

- [ ] Implement database integration (MongoDB/PostgreSQL)
- [ ] Complete JWT authentication system
- [ ] Add input validation and sanitization
- [ ] Implement proper error handling
- [ ] Add unit and integration tests
- [ ] Add API documentation with Swagger
- [ ] Implement file upload functionality
- [ ] Add email service integration
- [ ] Set up database migrations
- [ ] Add comprehensive logging system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
