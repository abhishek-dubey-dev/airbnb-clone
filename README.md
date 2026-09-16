# WanderLust Airbnb Clone

A full-stack Airbnb-style accommodation listing application built with Node.js, Express, MongoDB, and EJS. Users can browse listings, create accounts, publish properties, upload images, and add or delete reviews.

## Features

- Browse all available listings
- View listing details, owner information, reviews, and location map
- User signup, login, logout, and session-based authentication
- Create, edit, and delete listings
- Owner-only listing management
- Image uploads through Cloudinary
- Local image upload fallback for development
- Add and delete reviews with ratings
- Joi request validation and Mongoose model validation
- Flash messages for success and error states
- MongoDB-backed sessions for production deployments
- Responsive EJS views with reusable layouts and partials

## Tech Stack

- **Runtime:** Node.js 24+
- **Backend:** Express 5
- **Database:** MongoDB with Mongoose
- **Templates:** EJS and EJS-Mate
- **Authentication:** Passport, Passport Local, Passport Local Mongoose
- **Sessions:** Express Session and Connect Mongo
- **Uploads:** Multer and Cloudinary
- **Validation:** Joi and Mongoose validators
- **Maps:** Mapbox GL JS
- **Frontend:** HTML, CSS, JavaScript, Bootstrap-based views

## Requirements

Install the following before running the project:

- Node.js 24 or a compatible recent LTS version
- npm
- MongoDB Atlas account, or MongoDB running locally
- Cloudinary account for cloud image uploads (optional during development)
- Mapbox public token for maps (optional)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
copy .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Example configuration:

```env
ATLASDB_URL=mongodb+srv://username:password@cluster.mongodb.net/wanderlust
SESSION_SECRET=replace_with_a_long_random_value

CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

MAPBOX_TOKEN=your_mapbox_public_token
```

`ATLASDB_URL` may be replaced with `MONGO_URL`. If neither is provided, the application tries the local database at `mongodb://127.0.0.1:27017/wanderlust`.

Cloudinary variables are optional. Without them, uploaded images are stored in the local `uploads/` directory and served from `/uploads`.

### 3. Start the application

Development mode with automatic restart:

```bash
npm run dev
```

Production-style local start:

```bash
npm start
```

The application uses `PORT` when provided and otherwise runs on port `8080`:

```text
http://localhost:8080
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start with Nodemon |
| `npm start` | Start the application |
| `npm test` | Test placeholder; automated tests are not configured yet |

## Project Structure

```text
.
├── app.js                 # Express app, middleware, routes, sessions, startup
├── cloudConfig.js         # Cloudinary and local upload configuration
├── schema.js              # Joi request validation schemas
├── middleware.js          # Authentication, ownership, and validation middleware
├── controllers/           # Listing, review, and user business logic
├── models/                # Mongoose models
├── routes/                # Listing, review, and user routes
├── views/                 # EJS pages, layouts, and partials
├── public/                # CSS and browser-side JavaScript
├── uploads/               # Local uploads when Cloudinary is not configured
├── init/                  # Seed data scripts
└── utils/                 # Shared error and async helpers
```

## Main Routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/listings` | Show all listings |
| `GET` | `/listings/new` | Show listing form |
| `POST` | `/listings` | Create a listing |
| `GET` | `/listings/:id` | Show listing details |
| `GET` | `/listings/:id/edit` | Show edit form |
| `PUT` | `/listings/:id` | Update an owned listing |
| `DELETE` | `/listings/:id` | Delete an owned listing |
| `POST` | `/listings/:id/reviews` | Add a review |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Delete an authored review |
| `GET` | `/signup` | Show signup form |
| `POST` | `/signup` | Create an account |
| `GET` | `/login` | Show login form |
| `POST` | `/login` | Authenticate a user |
| `GET` | `/logout` | End the current session |

## Database Setup

For MongoDB Atlas:

1. Create a database and database user.
2. Copy the connection string into `ATLASDB_URL`.
3. Replace the username, password, cluster host, and database name.
4. Add your local IP address to Atlas **Network Access** during development.
5. For Render, allow Render's outbound access in Atlas Network Access. A temporary `0.0.0.0/0` rule works for testing, but a restricted production setup is preferable when possible.

Do not commit `.env` or expose database credentials in source control.

## Deploying on Render

Create a Render **Web Service** connected to this repository.

### Render settings

If this folder is the repository root:

```text
Build Command: npm install
Start Command: npm start
```

If the repository contains this project inside a parent folder, set the Render **Root Directory** to the folder containing `package.json`, then use the same commands:

```text
Build Command: npm install
Start Command: npm start
```

Add these Render environment variables:

```env
ATLASDB_URL=your_mongodb_atlas_connection_string
SESSION_SECRET=your_long_random_secret
NODE_ENV=production
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
MAPBOX_TOKEN=your_mapbox_public_token
```

Important deployment checks:

- The Render service must be a **Web Service**, not a static site.
- The MongoDB Atlas connection string must be valid.
- The Atlas database user must have access to the selected database.
- Atlas Network Access must allow the Render service to connect.
- The service logs should contain `Connected to MongoDB` and `Server is running on port ...`.
- Never hardcode secrets in `app.js`, `.env.example`, or templates.

## Troubleshooting

### MongoDB connection error

Check `ATLASDB_URL`, database credentials, and Atlas Network Access. Errors mentioning an IP whitelist usually mean Atlas is blocking the current machine or Render.

### Render service does not open

Check the deploy logs for an application crash. Confirm the Root Directory points to the folder containing `package.json`, the Start Command is `npm start`, and MongoDB connects successfully.

### Images do not load

For Cloudinary uploads, check all three Cloudinary variables. For local development, confirm the `uploads/` directory exists and that the application is serving `/uploads`.

### Map is unavailable

Add a valid public Mapbox token as `MAPBOX_TOKEN`. The application can still run without the map.

## Security Notes

- Use a long, random `SESSION_SECRET` in production.
- Keep `.env` out of Git.
- Restrict MongoDB Atlas database users to the permissions they need.
- Review Atlas Network Access rules before production use.
- Keep dependencies updated and run `npm audit` regularly.

## Current Testing Status

The project currently has no automated test suite configured. Before production use, add route and controller tests for authentication, listing ownership, image uploads, validation, and review authorization.

## License

This project is currently marked as `ISC` in `package.json`.
