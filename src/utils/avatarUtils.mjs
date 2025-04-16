import fs from "fs";
import path from "path";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import logger from "./logger.mjs";

// Directory for storing avatars
export const avatarsDir = path.resolve("src", "avatars");

// Download avatar and save it in /src/avatars
export const downloadAvatar = async (username) => {
    try {
        const avatarUrl = `https://icotar.com/initials/${username}.svg?bg=55676e&fg=36454b&s=121`;
        const uniqueFileName = `${username}_${uuidv4()}.svg`; // Generate a unique file name
        const avatarPath = path.join(avatarsDir, uniqueFileName);

        // Create the avatars directory if it doesn't exist
        if (!fs.existsSync(avatarsDir)) {
            try {
                fs.mkdirSync(avatarsDir, { recursive: true });
            } catch (error) {
                logger.error("Error creating avatars directory:", error);
                throw new Error("Failed to create avatars directory.");
            }
        }

        // Download the avatar and save it to the avatars directory
        const response = await axios.get(avatarUrl, { responseType: "stream" });
        response.data.pipe(fs.createWriteStream(avatarPath));

        // Return the local path to the saved avatar
        return avatarPath;
    } catch (error) {
        logger.error("Error downloading avatar:", error);
        throw new Error("Failed to download avatar.");
    }
};

// Array to hold avatar filenames
let avatarFilenames = [];

// Function to delete avatar files
export const deleteAvatars = async () => {
    try {
        await Promise.all(
            avatarFilenames.map(async (fileName) => {
                const filePath = path.join(avatarsDir, fileName);
                await fs.promises.unlink(filePath);
            }),
        );
    } catch (error) {
        logger.error("Error deleting avatars:", error);
        throw new Error("Failed to delete avatars.");
    }
};

// Function to add filename to the array
export const addAvatarFilename = (fileName) => {
    avatarFilenames.push(fileName);
};

// Function to clear the array after tests
export const clearAvatarFilenames = () => {
    avatarFilenames = [];
};
