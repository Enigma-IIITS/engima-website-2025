# ENIGMA Club Website - Full Stack Application

![ENIGMA](https://www.enigma-iiits.in/assets/img/logo.png)

This repository contains the full-stack code for the official ENIGMA club website. It's a modern, feature-rich platform built with Node.js/Express on the backend and Next.js/React on the frontend, designed to manage events, users, and club activities.

**Motto:** _Where Code Meets Curiosity._

---

## Features

This application includes a comprehensive set of features for both regular users and administrators.

### User Features
* **User Authentication:** Secure user registration and login system using JWT (JSON Web Tokens).
* **Event Discovery:** View a list of upcoming club events with details and poster images.
* **RSVP System:** Logged-in users can easily register for events.
* **Feedback Submission:** A dedicated form for users to submit feedback to the club.

### Admin Features
* **Admin Dashboard:** A secure, role-protected dashboard for managing the platform.
* **Full Event CRUD:** Admins can Create, Read, Update, and Delete events.
* **Event Poster Uploads:** An easy-to-use interface for uploading and changing event poster images.
* **RSVP Viewer:** Admins can view a detailed list of all registered attendees for any event, including their status.
* **User Management:** Admins can view a list of all users and promote regular users to the 'admin' role.

---

## Tech Stack

The project is built using a modern MERN-like stack.

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose ODM
* **Authentication:** `jsonwebtoken` (JWT) for tokens, `bcryptjs` for password hashing.
* **File Uploads:** `multer` for handling image uploads.
* **Middleware:** `cors`, `helmet`, `morgan`, `express-rate-limit`.

### Frontend
* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **UI Library:** React
* **Styling:** Tailwind CSS
* **Animation:** Framer Motion
* **API Communication:** Axios
* **State Management:** React Context API for authentication.
* **Package Manager:** `pnpm` (recommended for performance and reliability).

---

## Getting Started

Follow these instructions to set up and run the project locally on your machine.

### Prerequisites
* Node.js (v18 or later)
* `pnpm` package manager (`npm install -g pnpm`)
* A MongoDB database connection string (from MongoDB Atlas or a local instance).

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create an environment file:**
    Create a file named `.env` in the `backend` root and add the following variables.

    ```env
    # backend/.env

    # Your MongoDB connection string
    MONGO_URI=mongodb+srv://...

    # A long, random string for signing JWT tokens
    JWT_SECRET=THIS_IS_A_VERY_SECRET_KEY_FOR_ENIGMA_PROJECT_2025

    # How long tokens should last (e.g., 7d, 24h)
    JWT_EXPIRES_IN=7d
    ```

3.  **Install dependencies:**
    ```bash
    pnpm install
    ```

4.  **Seed the database (Optional but Recommended):**
    This script will clear the database and create a test admin, a regular user, and two sample events so you can test the application immediately.
    ```bash
    pnpm run seed
    ```
    * **Admin Login:** `admin@enigma.com` / `Admin@123`
    * **User Login:** `john@example.com` / `Password@123`

5.  **Start the server:**
    ```bash
    pnpm run dev
    ```
    The backend server will now be running on `http://localhost:3000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Create an environment file:**
    Create a file named `.env.local` in the `frontend` root and add the following variable.

    ```env
    # frontend/.env.local

    # The base URL of your running backend server
    NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
    ```

3.  **Install dependencies:**
    ```bash
    pnpm install
    ```

4.  **Start the server:**
    ```bash
    pnpm run dev
    ```
    The frontend application will now be running on `http://localhost:3001` (or the next available port).

---

## API Endpoints Overview

The backend exposes the following main REST API routes:

* **`POST /api/auth/register`**: Create a new user account.
* **`POST /api/auth/login`**: Log in a user and receive a JWT.
* **`GET /api/events`**: Get a list of all events (can be filtered).
* **`POST /api/events`**: (Admin) Create a new event.
* **`PUT /api/events/:id`**: (Admin) Update an existing event.
* **`DELETE /api/events/:id`**: (Admin) Delete an event.
* **`GET /api/users`**: (Admin) Get a list of all users.
* **`PUT /api/users/:id/role`**: (Admin) Promote a user to the admin role.
* **`POST /api/rsvp`**: (User) Register for an event.
* **`GET /api/rsvp/event/:eventId`**: (Admin) View all registrations for an event.
