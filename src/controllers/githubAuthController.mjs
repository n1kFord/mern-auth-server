import dotenv from "dotenv";
import axios from "axios";
import User from "../models/User.mjs";
import { generateToken } from "../utils/authUtils.mjs";
import logger from "../utils/logger.mjs";

dotenv.config();

const cookieOptions = {
    sameSite: "strict",
    maxAge: 3600000,
};

export const githubLogin = (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email`;
    logger.info(`Redirecting to GitHub OAuth URL: ${githubAuthUrl}`);
    res.redirect(githubAuthUrl);
};

export const githubCallback = async (req, res) => {
    const code = req.query.code;

    if (!code) {
        logger.warn("Missing GitHub code");
        return res.status(400).json({ msg: "Missing GitHub code" });
    }

    try {
        // Get access token
        const { data: tokenData } = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: process.env.GITHUB_REDIRECT_URI,
            },
            {
                headers: { Accept: "application/json" },
            },
        );

        const accessToken = tokenData.access_token;

        if (!accessToken) {
            logger.warn("Failed to get GitHub access token");
            return res.status(401).json({ msg: "GitHub token error" });
        }

        // Get user profile
        const { data: profile } = await axios.get(
            "https://api.github.com/user",
            {
                headers: {
                    Authorization: `token ${accessToken}`,
                },
            },
        );

        // Get user emails
        const { data: emails } = await axios.get(
            "https://api.github.com/user/emails",
            {
                headers: {
                    Authorization: `token ${accessToken}`,
                },
            },
        );

        const primaryEmail = emails.find((e) => e.primary && e.verified)?.email;

        if (!primaryEmail) {
            logger.warn("GitHub email not found");
            return res.status(401).json({ msg: "GitHub email not found" });
        }

        logger.info(`GitHub authenticated email: ${primaryEmail}`);

        const user =
            (await User.findOne({ email: primaryEmail })) ||
            (await User.create({
                email: primaryEmail,
                username: profile.name || profile.login,
                password: crypto.randomUUID(),
                logo: profile.avatar_url,
                authProvider: "github",
            }));

        const token = generateToken(user._id);
        res.cookie("token", token, cookieOptions);

        logger.info(`User logged in via GitHub: ${primaryEmail}`);
        res.redirect(
            `${process.env.CLIENT_URI || "http://localhost:3000"}/dashboard`,
        );
    } catch (err) {
        logger.error(`GitHub Auth error: ${err.message}`);
        res.status(500).json({ msg: "GitHub authentication failed" });
    }
};
