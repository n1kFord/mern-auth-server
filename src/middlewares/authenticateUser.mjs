import jwt from "jsonwebtoken";
import logger from "../utils/logger.mjs";

export const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        logger.warn(
            `No token provided for ${req.method} ${req.originalUrl} | IP: ${req.ip}`,
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
            `Invalid token provided for ${req.method} ${req.originalUrl} | IP: ${req.ip} | Error: ${error.message}`,
        );
        return res.status(401).json({ msg: "Token is not valid" });
    }
};
