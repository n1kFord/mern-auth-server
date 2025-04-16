import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { format } from "date-fns";

export const hashPassword = async (password) => {
    const saltRounds = 10;
    try {
        const hashed = await bcrypt.hash(password, saltRounds);
        return hashed;
    } catch (error) {
        throw new Error("Error hashing password");
    }
};

export const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "my-secret", {
        expiresIn: "1h",
    });
};

export const filterUserData = (user) => ({
    username: user.username,
    email: user.email,
    logo: user.logo,
    created_at: format(new Date(user.created_at), "yyyy-MM-dd"),
    _id: user._id,
    authProvider: user.authProvider,
});
