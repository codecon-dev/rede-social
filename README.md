# Social Network Platform

A full-stack social network application built with Node.js, Express, TypeScript, PostgreSQL, and React.

## Features

- User authentication and authorization
- Create, read, update, and delete posts
- Like/unlike posts
- User profiles and timelines
- File upload support
- RESTful API with comprehensive endpoints

## Tech Stack

### Backend (`/api`)
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer

### Frontend (`/app`)
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4 <- NOT UNDER MY WATCH 
- **Routing**: React Router DOM

### API Documentation
- **Tool**: Bruno Collections (in `/collections`)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Running with Docker Compose

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rede-social
   ```

2. **Start the backend services**
   ```bash
   docker-compose up -d
   ```
   This will start:
   - PostgreSQL database on port `5432`
   - API server on port `8080` (with debug port `9229`)

3. **Start the frontend**
   ```bash
   cd app
   npm install
   npm run dev
   ```
   The React app will be available at `http://localhost:5173`

### Manual Setup

#### Backend Setup
```bash
cd api
npm install
npm run dev
```

#### Frontend Setup
```bash
cd app
npm install
npm run dev
```

#### Database Setup
1. Create a PostgreSQL database
2. Copy `api/.env.example` to `api/.env` and configure your database connection
3. Run the SQL schema from `api/schema.sql`

## API Endpoints

The API provides the following main endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

### Posts
- `GET /posts` - Get timeline posts
- `POST /posts` - Create new post
- `GET /posts/:id` - Get specific post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Toggle post like

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile
- `GET /users/:id/posts` - Get user's posts

### Health Check
- `GET /health` - API health status

## Development

### Backend Commands
```bash
cd api
npm run dev      # Start development server
npm run build    # Build TypeScript
npm run lint     # Run ESLint
npm run typecheck # Type checking
```

### Frontend Commands
```bash
cd app
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Environment Variables

Configure the following variables in `api/.env`:

```env
PORT=8080
NODE_ENV=development

# Database
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_DB=social_network
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=86400

# CORS
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
```

## API Testing

Use the Bruno collections in the `/collections` directory to test the API endpoints. Import the collection into Bruno to access pre-configured requests for:

- Authentication flows
- Post management
- User operations
- Health checks

## Docker Services

The `docker-compose.yml` includes:

- **API Container**: Node.js 18 Alpine with development hot-reload
- **Database Container**: PostgreSQL 15 with automatic schema initialization
- **Health Checks**: Built-in health monitoring for both services
- **Debug Support**: Remote debugging on port 9229

## License

MIT