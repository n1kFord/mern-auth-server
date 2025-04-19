import fs from "fs";
import path from "path";
import { __dirname } from "../utils/dirnameHelper.mjs";
import bcrypt from "bcrypt";
import User from "../models/User.mjs";
import logger from "../utils/logger.mjs";
import { hashPassword } from "../utils/authUtils.mjs";
import {
    validateChangeUsername,
    validateChangePassword,
} from "../utils/validationSchemas.mjs";

// Change Username handler
export const changeUsername = [
    validateChangeUsername,
    async (req, res) => {
        try {
            const userId = req.userId;
            const { username } = req.body;
            logger.info(`Username change attempt for user ID: ${userId}`);

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { username },
                { new: true },
            );

            if (!updatedUser) {
                logger.warn(
                    `Username change failed: User not found for ID: ${userId}`,
                );
                return res.status(404).json({ msg: "User not found" });
            }

            logger.info(`Username updated successfully for user ID: ${userId}`);
            res.status(200).json({
                msg: "Username updated successfully!",
                newUsername: username,
            });
        } catch (error) {
            logger.error(
                `Error changing username for user ID ${userId}: ${error.message}`,
            );
            res.status(500).json({ msg: "Internal server error" });
        }
    },
];

// Change Password handler
export const changePassword = [
    validateChangePassword,
    async (req, res) => {
        try {
            const userId = req.userId;
            const { currentPassword, newPassword } = req.body;
            logger.info(`Password change attempt for user ID: ${userId}`);

            const user = await User.findById(userId);
            if (!user) {
                logger.warn(
                    `Password change failed: User not found for ID: ${userId}`,
                );
                return res.status(404).json({ msg: "User not found" });
            }

            const isMatch = await bcrypt.compare(
                currentPassword,
                user.password,
            );
            if (!isMatch) {
                logger.warn(
                    `Password change failed: Incorrect current password for user ID: ${userId}`,
                );
                return res
                    .status(400)
                    .json({ msg: "Incorrect current password" });
            }

            const hashedPassword = await hashPassword(newPassword);
            user.password = hashedPassword;
            await user.save();

            logger.info(`Password changed successfully for user ID: ${userId}`);
            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            return res.status(200).json({
                msg: "Password changed successfully! Please log in again.",
            });
        } catch (error) {
            logger.error(
                `Error changing password for user ID ${userId}: ${error.message}`,
            );
            res.status(500).json({ msg: "Internal server error" });
        }
    },
];

// Delete Account handler
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.userId;
        logger.info(`Account deletion attempt for user ID: ${userId}`);

        const user = await User.findById(userId);
        if (!user) {
            logger.warn(
                `Account deletion failed: User not found for ID: ${userId}`,
            );
            return res.status(404).json({ msg: "User not found" });
        }

        const avatarPath = path.join(
            __dirname,
            "../avatars",
            path.basename(user.logo),
        );

        if (fs.existsSync(avatarPath)) {
            fs.unlinkSync(avatarPath);
            logger.info(`Avatar file deleted for user ID: ${userId}`);
        }

        await user.deleteOne();
        logger.info(`Account deleted successfully for user ID: ${userId}`);

        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        return res.status(200).json({
            msg: "Account deleted successfully!",
        });
    } catch (error) {
        logger.error(
            `Error deleting account for user ID ${userId}: ${error.message}`,
        );
        res.status(500).json({ msg: "Internal server error" });
    }
};
