# Enigma Backend API Documentation

## Overview

This is the comprehensive backend API for the Enigma website, built with Node.js, Express.js, and MongoDB. The API provides complete functionality for event management, user registration, feedback collection, member showcases, and team management.

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Event Management APIs](#event-management-apis)
4. [RSVP/Registration APIs](#rsvpregistration-apis)
5. [Feedback APIs](#feedback-apis)
6. [Showcase APIs](#showcase-apis)
7. [Member/Domain APIs](#memberdomain-apis)
8. [File Upload Guidelines](#file-upload-guidelines)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## Authentication APIs

### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "1234567890",
  "college": "IIIT Sri City",
  "year": 2,
  "branch": "CSE"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login

Authenticate user and get access token.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### POST /auth/forgot-password

Request password reset.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

### POST /auth/reset-password/:token

Reset password using token.

**Request Body:**

```json
{
  "password": "NewSecurePass123"
}
```

---

## RSVP/Registration APIs

### POST /rsvp

Register for an event.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "eventId": "event_id_here",
  "contactInfo": {
    "email": "john@example.com",
    "phone": "1234567890",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "0987654321",
      "relation": "Mother"
    }
  },
  "additionalInfo": {
    "teamName": "Code Warriors",
    "teamMembers": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "role": "Leader"
      }
    ],
    "dietaryRestrictions": ["Vegetarian"],
    "specialNeeds": "Wheelchair access required",
    "tshirtSize": "L",
    "accommodationNeeded": false,
    "customFields": {
      "experience": "Intermediate",
      "portfolio": "https://johndoe.dev"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Successfully registered for event",
  "data": {
    "registrationId": "REG-ABC123-DEF456",
    "checkInCode": "ABC123",
    "status": "confirmed",
    "event": {...},
    "user": {...}
  }
}
```

### GET /rsvp/my-registrations

Get current user's event registrations.

**Query Parameters:**

- `status` (optional): Filter by status (pending, confirmed, cancelled, waitlist, attended)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### GET /rsvp/event/:eventId

Get all registrations for an event (Admin/Organizer only).

**Query Parameters:**

- `status` (optional): Filter by status
- `export` (optional): Set to 'true' for CSV export
- `page`, `limit`: Pagination

### PUT /rsvp/:rsvpId

Update registration details.

### DELETE /rsvp/:rsvpId

Cancel registration.

### POST /rsvp/:rsvpId/check-in

Check in participant for event (Admin/Organizer only).

**Request Body:**

```json
{
  "checkInCode": "ABC123"
}
```

### GET /rsvp/:rsvpId/qr-code

Get QR code for registration.

### GET /rsvp/stats/:eventId

Get registration statistics for an event.

**Response:**

```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 150,
      "pending": 10,
      "confirmed": 120,
      "cancelled": 15,
      "attended": 95
    },
    "availability": {
      "available": true,
      "remaining": 50,
      "total": 200
    },
    "dailyTrend": [...]
  }
}
```

---

## Feedback APIs

### POST /feedback

Submit feedback.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "type": "event",
  "event": "event_id_here",
  "title": "Great event organization",
  "content": "The event was well organized and informative...",
  "ratings": {
    "overall": 5,
    "organization": 5,
    "content": 4,
    "venue": 4,
    "speakers": 5,
    "networking": 4
  },
  "categories": {
    "liked": ["Good speakers", "Well organized"],
    "improvements": ["Better snacks", "More networking time"],
    "suggestions": ["Include more hands-on sessions"]
  },
  "priority": "medium",
  "urgency": "low",
  "contactPreferences": {
    "followUp": true,
    "anonymous": false,
    "preferredMethod": "email"
  },
  "tags": ["event", "technical", "workshop"]
}
```

### GET /feedback

Get all feedback (Admin only).

**Query Parameters:**

- `type`: Filter by type (event, general, website, suggestion, complaint, bug_report)
- `status`: Filter by status
- `priority`: Filter by priority
- `page`, `limit`: Pagination

### GET /feedback/my-feedback

Get current user's feedback.

### GET /feedback/event/:eventId

Get feedback for specific event (Admin/Organizer only).

**Query Parameters:**

- `ratings=true`: Include ratings summary
- `page`, `limit`: Pagination

### GET /feedback/:feedbackId

Get specific feedback details.

### PUT /feedback/:feedbackId

Update feedback.

### DELETE /feedback/:feedbackId

Delete feedback.

### POST /feedback/:feedbackId/resolve

Resolve feedback (Admin only).

**Request Body:**

```json
{
  "notes": "Issue has been resolved by updating the system",
  "actionsTaken": ["System update", "User notification sent"]
}
```

### POST /feedback/:feedbackId/note

Add admin note to feedback.

**Request Body:**

```json
{
  "note": "Following up on this issue",
  "isInternal": true
}
```

### POST /feedback/:feedbackId/vote

Vote on feedback helpfulness.

**Request Body:**

```json
{
  "vote": "helpful"
}
```

### GET /feedback/analytics/summary

Get feedback analytics summary (Admin only).

---

## Showcase APIs

### POST /showcase

Create new showcase item.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**

```
title: "AI Chatbot Project"
description: "An intelligent chatbot built using natural language processing..."
shortDescription: "AI-powered customer service chatbot"
type: "project"
category: "artificial_intelligence"
technologies: [{"name": "Python", "proficiency": "advanced"}, {"name": "TensorFlow", "proficiency": "intermediate"}]
skills: ["Machine Learning", "NLP", "Python"]
status: "completed"
startDate: "2024-01-01"
endDate: "2024-03-01"
duration: "3 months"
links: {"github": "https://github.com/user/chatbot", "live": "https://chatbot.example.com"}
visibility: "public"
tags: ["AI", "chatbot", "NLP"]
thumbnail: [file]
images: [file1, file2]
videos: [file1]
documents: [file1, file2]
```

### GET /showcase

Get all public showcase items.

**Query Parameters:**

- `type`: Filter by type
- `category`: Filter by category
- `status`: Filter by status
- `featured`: Filter featured items
- `search`: Search in title, description, tags
- `technologies`: Filter by technologies (comma-separated)
- `page`, `limit`: Pagination
- `sortBy`, `sortOrder`: Sorting

### GET /showcase/featured

Get featured showcase items.

### GET /showcase/trending

Get trending showcase items.

### GET /showcase/category/:category

Get showcase items by category.

### GET /showcase/my-showcase

Get current user's showcase items.

### GET /showcase/:showcaseId

Get specific showcase item.

### PUT /showcase/:showcaseId

Update showcase item.

### DELETE /showcase/:showcaseId

Delete showcase item.

### POST /showcase/:showcaseId/like

Like/unlike showcase item.

### POST /showcase/:showcaseId/comment

Add comment to showcase item.

**Request Body:**

```json
{
  "content": "Great project! Really impressive work."
}
```

### POST /showcase/:showcaseId/approve

Approve showcase item (Admin only).

### POST /showcase/:showcaseId/feature

Feature/unfeature showcase item (Admin only).

### GET /showcase/stats/analytics

Get showcase analytics (Admin only).

---

## Member/Domain APIs

### Domains

#### POST /members/domains

Create new domain (Admin only).

**Request Body:**

```json
{
  "name": "Web Development",
  "code": "WEB",
  "description": "Frontend and backend web development technologies",
  "icon": "fa-code",
  "color": "#3498db"
}
```

#### GET /members/domains

Get all domains.

#### PUT /members/domains/:domainId

Update domain (Admin only).

### Members

#### POST /members

Create/Update member profile.

**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Form Data:**

```
displayName: "John Doe"
tagline: "Full Stack Developer & AI Enthusiast"
bio: "Passionate about creating innovative solutions..."
academicInfo: {"year": 3, "branch": "CSE", "cgpa": 8.5}
contact: {"email": "john@example.com", "phone": "1234567890", "linkedIn": "linkedin.com/in/johndoe"}
skills: [{"name": "React", "proficiency": "advanced"}, {"name": "Node.js", "proficiency": "intermediate"}]
experience: [{"title": "Frontend Developer", "company": "Tech Corp", "type": "internship"}]
projects: [{"title": "E-commerce Website", "description": "Built with MERN stack"}]
achievements: [{"title": "Hackathon Winner", "category": "competition", "date": "2024-01-15"}]
interests: ["Machine Learning", "Web Development"]
privacy: {"profileVisibility": "public", "showEmail": false}
profilePicture: [file]
coverPhoto: [file]
resume: [file]
gallery: [file1, file2]
```

#### GET /members

Get all members.

**Query Parameters:**

- `domain`: Filter by domain
- `position`: Filter by position
- `status`: Filter by status (active, inactive, alumni)
- `featured`: Filter featured members
- `search`: Search in name, tagline, skills
- `skills`: Filter by skills
- `page`, `limit`: Pagination

#### GET /members/leadership

Get leadership team.

#### GET /members/featured

Get featured members.

#### GET /members/domain/:domainId

Get members by domain.

#### GET /members/alumni

Get alumni members.

#### GET /members/profile/:memberId

Get detailed member profile.

#### GET /members/my-profile

Get current user's member profile.

#### POST /members/:memberId/role

Add role to member (Admin only).

**Request Body:**

```json
{
  "position": "domain_head",
  "domainId": "domain_id_here",
  "responsibilities": ["Lead domain activities", "Mentor junior members"]
}
```

#### PUT /members/:memberId/role/:roleId/deactivate

Deactivate member role (Admin only).

#### POST /members/:memberId/verify

Verify member (Admin only).

#### POST /members/:memberId/feature

Feature/unfeature member (Admin only).

---

## File Upload Guidelines

### Supported File Types

**Images:** JPEG, JPG, PNG, GIF
**Documents:** PDF, DOC, DOCX
**Videos:** MP4, MOV, AVI

### File Size Limits

- **Profile Pictures/Images:** 5MB
- **Showcase Media:** 10MB
- **Documents:** 10MB

### Upload Endpoints

Files are uploaded using `multipart/form-data`. Include files as form fields:

```javascript
const formData = new FormData();
formData.append("thumbnail", file);
formData.append("title", "Project Title");
// ... other fields
```

### File URLs

Uploaded files are accessible at:

```
http://localhost:3000/uploads/profiles/<filename>
http://localhost:3000/uploads/showcase/<filename>
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limiting

### Basic Rate Limit

- **All endpoints:** 100 requests per 15 minutes per IP

### Authentication Rate Limit

- **Auth endpoints:** 5 requests per 15 minutes per IP

### Rate Limit Headers

Response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Authentication Roles

### User Roles

- **user**: Basic user access
- **admin**: Full administrative access
- **organizer**: Event management access
- **member**: Organization member access

### Permission Levels

- **Public**: No authentication required
- **Private**: Requires authentication
- **Admin**: Requires admin role
- **Organizer**: Requires organizer or admin role

---

## Data Models

### User Model

```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  college: String,
  year: Number,
  branch: String,
  role: String,
  isVerified: Boolean,
  profilePicture: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model

```javascript
{
  title: String,
  description: String,
  category: String,
  eventType: String,
  startDate: Date,
  endDate: Date,
  venue: String,
  maxParticipants: Number,
  currentParticipants: Number,
  registrationFee: Number,
  organizers: [ObjectId],
  status: String
}
```

### RSVP Model

```javascript
{
  user: ObjectId,
  event: ObjectId,
  status: String,
  contactInfo: Object,
  additionalInfo: Object,
  payment: Object,
  registeredAt: Date,
  checkInCode: String
}
```

### Feedback Model

```javascript
{
  user: ObjectId,
  event: ObjectId,
  type: String,
  title: String,
  content: String,
  ratings: Object,
  categories: Object,
  status: String,
  priority: String,
  createdAt: Date
}
```

### Showcase Model

```javascript
{
  owner: ObjectId,
  title: String,
  description: String,
  type: String,
  category: String,
  technologies: [Object],
  status: String,
  media: Object,
  visibility: String,
  metrics: Object,
  createdAt: Date
}
```

### Member Model

```javascript
{
  user: ObjectId,
  displayName: String,
  tagline: String,
  bio: String,
  roles: [Object],
  academicInfo: Object,
  contact: Object,
  skills: [Object],
  experience: [Object],
  projects: [Object],
  achievements: [Object],
  privacy: Object
}
```

---

## Testing

### Test Scripts

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test authentication
npm run test:auth

# Test database connection
npm run test:db

# Seed sample data
npm run seed
```

### Sample API Calls

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'

# Get events
curl -X GET http://localhost:3000/api/events

# Register for event (with token)
curl -X POST http://localhost:3000/api/rsvp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventId":"EVENT_ID","contactInfo":{"email":"john@example.com"}}'
```

---

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/enigma_dev

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
```

---

## Support

For questions or support, please contact:

- **Email:** tech@enigma-iiits.org
- **GitHub:** https://github.com/Enigma-IIITS/enigma-website-2025

---

**Version:** 1.0.0  
**Last Updated:** September 29, 2025
