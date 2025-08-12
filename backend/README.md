# Sivoham Backend

A Node.js/Express backend for the Sivoham React App, providing RESTful APIs for user management, courses, events, progress tracking, and more. Uses MongoDB for data storage.

---

## Features
- User registration and authentication (JWT-based)
- Admin and user roles
- Course and event management
- Progress and feedback tracking
- Health check endpoint for load balancers
- New Relic monitoring support (optional)

---

## Setup Instructions

1. **Clone the repository** and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**

   Create a `.env` file in the `backend/` directory with the following variables:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ENABLE_NEWRELIC=false
   USE_STATELESS_MODE=false
   SKIP_AUTH=false
   # MongoDB connection is hardcoded, but you can update backend/db.js for custom URI
   # For New Relic (optional):
   NEW_RELIC_APP_NAME=Sivoham Backend
   NEW_RELIC_LICENSE_KEY=your_newrelic_license_key
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5000` by default.

---

## API Endpoints

- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – User login (OTP-based)
- `GET /api/user/` – Get all users (admin)
- `GET /api/user/:id` – Get user by ID (admin or self)
- `GET /api/courses/` – List courses
- `GET /api/events/` – List events
- `GET /api/progress/` – Get user progress
- `GET /api/health` – Health check endpoint

(See `sivoham-backend.postman_collection.json` for full API documentation and sample requests.)

---

## Project Structure
- `server.js` – Main server entry point
- `db.js` – MongoDB connection logic
- `models/` – Mongoose data models
- `routes/` – Express route handlers
- `middleware/` – Custom middleware (e.g., authentication)
- `scripts/` – Utility scripts (e.g., data migration)

---

## Development Notes
- Uses `nodemon` for auto-reloading in development.
- All backend instances must connect to the same MongoDB cluster for stateless mode.
- JWT secret must be consistent across all instances.
- No local file storage for user data (use CDN/cloud for videos).
- New Relic monitoring is optional and can be enabled via environment variables.

---

## License
MIT 