<div align="center">
  <h1>💰 Wallet API</h1>
  <p>
    <strong>A modern, secure, and scalable backend for personal finance management</strong>
  </p>
  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-api-documentation">API Docs</a> •
    <a href="#-deployment">Deployment</a>
  </p>
  
  [![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
  [![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)
  
  <!-- add express, passport, nodemailer, google and apple gateways, with pretty logo colors -->

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
[![Passport](https://img.shields.io/badge/Passport-000000?style=for-the-badge&logo=passport&logoColor=white)](https://passportjs.org/)
![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)
![Apple](https://img.shields.io/badge/Apple-%23000000.svg?style=for-the-badge&logo=apple&logoColor=white)
[![Nodemailer](https://img.shields.io/badge/Nodemailer-000000?style=for-the-badge&logo=nodemailer&logoColor=white)](https://nodemailer.com/)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

</div>

## 🚀 Features

### 🔐 Authentication & Authorization

- **JWT Authentication** with access and refresh tokens
- **OAuth 2.0** integration (Google, Apple)
- **Email verification** for new accounts
- **Role-based access control** (USER, ADMIN)
- **Secure password** hashing with bcrypt

### 👥 User Management

- **Complete user profiles** with email, name, and profile picture
- **Email verification** workflow
- **Password reset** functionality
- **Role-based permissions** system

### 💰 Transaction Management

- **Track income and expenses** with detailed categorization
- **Transaction history** with filtering and pagination
- **Financial summaries** with analytics
- **Secure transaction processing**

### 🛡️ Security

- **HTTPS** enabled
- **Rate limiting** on authentication endpoints
- **CORS** protection
- **Input validation** and sanitization
- **Helmet** for HTTP headers security
- **CSRF protection**

## 🛠️ Tech Stack

| Category       | Technologies                                           |
| -------------- | ------------------------------------------------------ |
| **Core**       | Node.js, NestJS, TypeScript                            |
| **Database**   | PostgreSQL, Prisma ORM                                 |
| **Auth**       | JWT, Passport.js, OAuth 2.0 (Google, Apple)            |
| **APIs**       | RESTful, Swagger/OpenAPI documentation                 |
| **Security**   | bcrypt, class-validator, Helmet, CORS, CSRF Protection |
| **Dev Tools**  | ESLint, Prettier, Husky, Jest, Docker                  |
| **Monitoring** | Pino for logging                                       |

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- PostgreSQL 13+
- Redis (for rate limiting)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ragab0/wallet-backend.git
   cd wallet-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # general variables
   NODE_ENV=development
   DATABASE_URL=
   PORT=5000
   FRONTEND_URL=
   # jwt variables
   JWT_SECRET=
   JWT_ACCESS_EXPIRES_IN=
   JWT_REFRESH_EXPIRES_IN=
   # mail variables
   MAIL_HOST=
   MAIL_PORT=
   MAIL_USER=
   MAIL_PASS=
   MAIL_FROM=
   # google variables
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GOOGLE_CALLBACK_URL=
   # apple variables
   APPLE_CLIENT_ID=
   APPLE_TEAM_ID=
   APPLE_KEY_ID=
   APPLE_PRIVATE_KEY_PATH=
   APPLE_CALLBACK_URL=
   ```

4. **Database setup**

   ```bash
   # Run database migrations
   npx prisma migrate dev

   # Generate Prisma client
   npx prisma generate
   ```

5. **Start the development server**

   ```bash
   # Development
   npm run start:dev

   # Production
   npm run build
   npm run start:prod
   ```

## 📚 API Documentation

Interactive API documentation is available when running the application:

- **Swagger UI**: `http://localhost:${PORT}/docs`

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer your-jwt-token
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🏗️ Project Structure

```
├── src/
│   ├── auth/               # Authentication module
│   ├── users/              # User management
│   ├── transactions/       # Transaction management
│   ├── common/             # Shared modules and utilities
│   ├── prisma/             # Database schema and migrations
│   └── main.ts             # Application entry point
├── test/                   # Test files
├── .env.example            # Environment variables example
└── package.json            # Project dependencies and scripts
```

## 📝 API Endpoints

### Authentication

- `POST /auth/signup`: Register a new user.
- `POST /auth/login`: Log in a user.
- `POST /auth/refresh`: Refresh an access token.
- `POST /auth/send-verification`: Send a verification email.
- `POST /auth/verify-email`: Verify a user's email.
- `GET /auth/google`: Initiate Google OAuth.
- `GET /auth/google/callback`: Google OAuth callback.

### Users

- `GET /users`: Get all users.
- `GET /users/me`: Get the current user's profile.
- `PATCH /users/me`: Update the current user's profile.
- `DELETE /users/me`: Delete the current user's account.
- `PATCH /users/me/password`: Change the current user's password.
- `GET /users/:id`: Get a user by ID.
- `PATCH /users/:id`: Update a user by ID.
- `DELETE /users/:id`: Delete a user by ID.

### Transactions

- `POST /transactions`: Create a new transaction.
- `GET /transactions`: Get all transactions for the current user.
- `GET /transactions/:id`: Get a transaction by ID.
- `PATCH /transactions/:id`: Update a transaction by ID.
- `DELETE /transactions/:id`: Delete a transaction by ID.

---

Made with ❤️ by Ragab | 2025
