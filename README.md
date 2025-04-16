# 🔐 MERN Auth Server

**Personal Fullstack Project — Backend**  
A secure, modular, and extensible **Node.js** backend built with **Express**, **MongoDB**, and **JWT**, powering the authentication logic of a MERN-based fullstack application.

💡 _Follows modern best practices, with structured logging and OAuth integrations._

🔗 Frontend repository: [mern-auth-frontend](https://github.com/n1kFord/mern-auth-frontend)

---

## ✨ Overview

This is the **backend API** that supports a full authentication flow for a MERN-based application.

Supports a full authentication flow, including JWT and OAuth logins, user account management, and secure route protection for MERN-based apps.

---

## 🏁 Getting Started

Clone the repository and install dependencies:

```bash
git clone https://github.com/n1kFord/mern-auth-server.git
cd mern-auth-server
npm install
npm start
```

Make sure your MongoDB instance is running and configured properly.

### 📦 Environment Variables

Create a `.env` file in the root with the following:

```env
PORT=8080
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8080/api/auth/github/callback
```

> Adjust values as needed for your local or production environment.

---

## 🚀 Features

-   🔐 JWT-based authentication (register, login, logout)
-   🌐 OAuth 2.0 login with Google and GitHub
-   👤 User profile updates: change username/password, delete account
-   🖼️ Avatar support: local or OAuth-derived
-   🧱 Modular Express structure with separation of concerns
-   🔍 Request validation and rate-limiting
-   🧰 Structured logs with `winston` (console + file)
-   ♻️ Secure environment variable management with `dotenv`
-   🧪 Full test coverage using Jest + Supertest for all critical flows
-   💡 ES Modules (`.mjs`) with Babel support

---

## 🧱 Tech Stack

| Category   | Stack / Library                  |
| ---------- | -------------------------------- |
| Runtime    | Node.js                          |
| Framework  | Express                          |
| Database   | MongoDB + Mongoose               |
| Auth       | JWT, Google OAuth, GitHub OAuth  |
| Logging    | Winston                          |
| Middleware | express-rate-limit, cors, helmet |
| Tooling    | dotenv, babel, nodemon           |
| Testing    | Jest, Supertest                  |

---

## 📁 NPM Scripts

```bash
npm run dev          # Start dev server with nodemon
npm start            # Start server (production)
npm test             # Run Jest tests with logging to logs/tests.log
```

Note: The test script clears logs/tests.log before each run:

---

## ✅ Tests

Tests are written using **Jest** and **supertest**, covering registration, login, protected routes, and user actions such as updating username, changing password, and deleting the account.

Each test suite:

-   Initializes a test MongoDB instance
-   Cleans up test data afterward
-   Uses realistic HTTP requests and assertions

> All tests run with logging redirected to `logs/tests.log` for better debugging.

---

## 🗂️ Project Structure

```
server/
├── logs/                    # Winston log files
├── src/
│   ├── avatars/             # Avatar utility logic
│   ├── controllers/         # Express route handlers
│   ├── middlewares/         # Custom middlewares (auth, logging, rate-limit)
│   ├── models/              # Mongoose models
│   ├── routes/              # Route definitions (auth, user, etc.)
│   ├── tests/               # Jest test files
│   ├── utils/               # Utility functions (JWT, logging, etc.)
│   └── index.mjs            # Entry point (Express app + server startup)
├── .env                     # Environment variables
├── .babelrc                 # Babel config
├── .prettierrc              # Prettier config
├── jest.config.mjs          # Jest config
├── package.json
├── package-lock.json
└── LICENSE
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE) — feel free to use, modify, and distribute with attribution.

> 💡 Created with care by [@n1kFord](https://github.com/n1kFord)
