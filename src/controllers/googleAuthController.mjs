import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.mjs";
import { generateToken } from "../utils/authUtils.mjs";
import logger from "../utils/logger.mjs";

dotenv.config();

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
);

const cookieOptions = {
    sameSite: "strict",
    maxAge: 3600000,
};

export const googleLogin = (req, res) => {
    try {
        const url = client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent",
            scope: ["profile", "email"],
        });
        logger.info(`Redirecting to Google OAuth URL: ${url}`);
        res.redirect(url);
    } catch (err) {
        logger.error(`Google login URL error: ${err.message}`);
        res.status(500).json({ msg: "Google login failed" });
    }
};

export const googleCallback = async (req, res) => {
    const code = req.query.code;
    if (!code) {
        logger.warn("Missing authorization code in callback");
        return res.status(400).json({ msg: "Missing authorization code" });
    }

    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload || {};

        if (!email) {
            logger.warn("Email not found in Google token");
            return res.status(401).json({ msg: "Invalid Google token" });
        }

        logger.info(`Authenticated Google email: ${email}`);

        const user =
            (await User.findOne({ email })) ||
            (await User.create({
                email,
                username: name,
                password: crypto.randomUUID(),
                logo: picture,
                authProvider: "google",
            }));

        const token = generateToken(user._id);
        res.cookie("token", token, cookieOptions);

        logger.info(`User authenticated: ${email}`);
        res.redirect("http://localhost:3000/dashboard");
    } catch (err) {
        logger.error(`Google callback error: ${err.message}`);
        res.status(401).json({ msg: "Google authentication failed" });
    }
};
