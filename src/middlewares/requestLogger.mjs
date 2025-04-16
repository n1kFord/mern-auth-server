import logger from "../utils/logger.mjs";

// Utility function to mask sensitive data in request body or headers
const maskSensitiveData = (data, fieldsToMask = []) => {
    const maskedData = { ...data };
    fieldsToMask.forEach((field) => {
        if (maskedData[field]) {
            maskedData[field] = "***";
        }
    });
    return maskedData;
};

// Middleware to log request details
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl } = req;
    const ip = req.ip;
    const userAgent = req.get("User-Agent") || "Unknown";

    // Mask sensitive data in the request body
    const maskedBody = maskSensitiveData(req.body, [
        "password",
        "currentPassword",
        "newPassword",
    ]);

    // Log initial request information
    logger.info(
        `${method} ${originalUrl} | IP: ${ip} | User-Agent: ${userAgent} | Body: ${JSON.stringify(
            maskedBody,
        )}`,
    );

    res.on("finish", () => {
        const { statusCode } = res;
        const duration = Date.now() - start;

        // Log response status and duration
        logger.info(`Status: ${statusCode} | Duration: ${duration}ms`);
    });

    next();
};

export default requestLogger;
