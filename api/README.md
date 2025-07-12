# Social Network API

A social network backend built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- User authentication with JWT
- Password-based registration and login
- User profiles with customizable bio and avatar
- Text and image posts
- Like/unlike posts
- User timeline with posts from followed users
- CORS configured for frontend integration

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up PostgreSQL database

4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

5. Update `.env` with your database credentials and configuration

6. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info (requires auth)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile (requires auth)
- `GET /api/users/:id/posts` - Get user's posts
- `GET /api/users/timeline` - Get user's timeline (requires auth)

### Posts
- `POST /api/posts` - Create a new post (requires auth)
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post (requires auth)
- `DELETE /api/posts/:id` - Delete post (requires auth)
- `POST /api/posts/:id/like` - Toggle like on post (requires auth)

## Database Schema

The application automatically creates the following tables:
- `users` - User accounts and profiles
- `posts` - User posts with content and images
- `likes` - Post likes
- `comments` - Post comments (structure ready)
- `followers` - User follow relationships (structure ready)

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking