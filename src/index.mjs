import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import authRouter from "./routes/authRoutes.mjs";
import userRouter from "./routes/userRouter.mjs";
import createRateLimiter from "./middlewares/rateLimiter.mjs";
import logger from "./utils/logger.mjs";
import requestLogger from "./middlewares/requestLogger.mjs";

dotenv.config();

const app = express();

// --- Body parsing and cookie handling ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --- Request logging middleware ---
app.use(requestLogger);

// --- CORS configuration ---
const corsOptions = {
    origin: process.env.CLIENT_URI || "http://localhost:3000",
    credentials: true,
};

app.use(cors(corsOptions));

// --- Rate limiting for security ---
app.use(createRateLimiter());

// --- Serve static files for avatars ---
const avatarsPath = path.resolve("src", "avatars");
app.use("/avatars", express.static(avatarsPath));

// --- Routes ---
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// --- Database and Server Initialization ---
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mydb";

async function start(uri = MONGO_URI, port = PORT) {
    try {
        await mongoose.connect(uri);
        app.listen(port, () => {
            logger.info(`Server is running, database connected. PORT: ${port}`);
        });
    } catch (error) {
        logger.error(`Database connection error: ${error.message}`, { error });
        process.exit(1); // Exit on critical error
    }
}

if (process.env.NODE_ENV !== "test") {
    start();
}

export { app, start };
