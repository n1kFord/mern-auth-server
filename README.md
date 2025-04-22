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

## 🌐 Live Demo

You can try the full app here:  
🔗 **[mern-auth-frontend-beta-two.vercel.app](https://mern-auth-frontend-beta-two.vercel.app)**

> ⚠️ **Note:** When opening the app for the first time, the **backend server may take up to one minute to respond**, as it's hosted on a free-tier platform with cold start delays.

> ⚠️ **Safari Users:** Due to cross-site cookie restrictions in Safari, authentication may not work properly out of the box.  
> Please either:
>
> -   Use **Chrome** or **Firefox** for the full experience
> -   Or **enable third-party cookies** in Safari settings (Settings → Privacy → Uncheck _“Prevent cross-site tracking”_)

---

## 🌍 Live API

You can access the deployed backend here:  
🔗 **https://mern-auth-server-o28m.onrender.com**

> Use this to test the frontend or API routes directly (e.g. via Postman or browser dev tools).

## 🏁 Getting Started Locally

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
CLIENT_URI=your_frontend_uri
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

## 📚 API Endpoints

#### 🔐 Auth Routes

-   `POST /api/auth/register` – Register a new user
-   `POST /api/auth/login` – Log in with email and password
-   `GET /api/auth/logout` – Log out (clears the JWT cookie)
-   `GET /api/auth/me` – Get current authenticated user
-   `GET /api/auth/google` – Redirect to Google OAuth
-   `GET /api/auth/google/callback` – Handle Google OAuth callback
-   `GET /api/auth/github` – Redirect to GitHub OAuth
-   `GET /api/auth/github/callback` – Handle GitHub OAuth callback

#### 👤 User Routes

_Requires authentication (JWT in HTTP-only cookie)_

-   `POST /api/user/change-username` – Change username
-   `POST /api/user/change-password` – Change password
-   `DELETE /api/user/delete-account` – Delete user account

#### 🔒 Authentication Details

This API uses **JWT-based authentication** with tokens stored in **HTTP-only cookies**.  
To access protected routes, the client must include the JWT cookie in the request.

Example middleware:

```js
import jwt from "jsonwebtoken";
import logger from "../utils/logger.mjs";

export const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        logger.warn(
            \`No token provided for \${req.method} \${req.originalUrl} | IP: \${req.ip}\`,
        );
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "my-secret",
        );

        req.userId = decoded.userId;
        next();
    } catch (error) {
        logger.error(
            \`Invalid token provided for \${req.method} \${req.originalUrl} | IP: \${req.ip} | Error: \${error.message}\`,
        );
        return res.status(401).json({ msg: "Token is not valid" });
    }
};
```

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
