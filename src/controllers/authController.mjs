import path from "path";
import bcrypt from "bcrypt";
import User from "../models/User.mjs";
import logger from "../utils/logger.mjs";
import {
    hashPassword,
    generateToken,
    filterUserData,
} from "../utils/authUtils.mjs";
import {
    validateRegisterUser,
    validateLoginUser,
} from "../utils/validationSchemas.mjs";
import { downloadAvatar } from "../utils/avatarUtils.mjs";

const cookieOptions = {
    sameSite: "strict",
    maxAge: 3600000, // 1 hour
};

// Registration handler
export const registerUser = [
    validateRegisterUser,
    async (req, res) => {
        try {
            const { username, email, password } = req.body;
            logger.info(`Registration attempt for email: ${email}`);

            const userExists = await User.findOne({ email });
            if (userExists) {
                logger.warn(
                    `Registration failed: Email ${email} already in use`,
                );
                return res.status(409).json({ msg: "Email already in use" });
            }

            // Hash password and download avatar
            const hashedPassword = await hashPassword(password);
            const avatarPath = await downloadAvatar(username);

            // Extracting just the avatar file name from the path
            const avatarFileName = path.basename(avatarPath);
            const avatarUrl = `${req.protocol}://${req.get("host")}/avatars/${avatarFileName}`;

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                logo: avatarUrl, // Save the URL of the avatar
            });

            await newUser.save();
            logger.info(`User registered successfully: ${email}`);

            const token = generateToken(newUser._id);
            res.cookie("token", token, cookieOptions);

            res.status(201).json({
                msg: "Registration successful!",
                user: filterUserData(newUser),
            });
        } catch (error) {
            logger.error(`Registration error: ${error.message}`);
            res.status(500).json({ msg: "Internal server error" });
        }
    },
];

// Login handler
export const loginUser = [
    validateLoginUser,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            logger.info(`Login attempt for email: ${email}`);

            const user = await User.findOne({ email });
            if (!user) {
                logger.warn(`Login failed: No user found with email ${email}`);
                return res.status(401).json({
                    msg: "Invalid credentials. Ensure that your email and password are correct.",
                });
            }

            const isPasswordValid = await bcrypt.compare(
                password,
                user.password,
            );
            if (!isPasswordValid) {
                logger.warn(
                    `Login failed: Invalid password for email ${email}`,
                );
                return res.status(401).json({
                    msg: "Invalid credentials. Ensure that your email and password are correct.",
                });
            }

            const token = generateToken(user._id);
            res.cookie("token", token, cookieOptions);

            logger.info(`User logged in successfully: ${email}`);
            res.status(200).json({
                msg: "Logged in successfully!",
                user: filterUserData(user),
            });
        } catch (error) {
            logger.error(`Login error: ${error.message}`);
            res.status(500).json({ msg: "Internal server error" });
        }
    },
];

// Logout handler
export const logOut = (req, res) => {
    res.clearCookie("token", { sameSite: "strict" });
    logger.info("User logged out successfully");
    return res.status(200).json({ msg: "Logged out successfully" });
};

// Fetch authenticated user data
export const getAuthenticatedUser = async (req, res) => {
    try {
        const userId = req.userId;
        logger.info(`Fetching data for authenticated user: ${userId}`);

        const user = await User.findById(userId);
        if (!user) {
            logger.warn(`User data not found for ID: ${userId}`);
            return res.status(404).json({ msg: "User not found" });
        }

        const filteredUser = filterUserData(user);
        logger.info(`User data retrieved successfully for ID: ${userId}`);

        res.status(200).json({ user: filteredUser });
    } catch (error) {
        logger.error(`Error fetching user data: ${error.message}`);
        res.status(500).json({ msg: "Internal server error" });
    }
};
