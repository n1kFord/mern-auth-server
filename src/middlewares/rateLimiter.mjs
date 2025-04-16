import rateLimit from "express-rate-limit";

/**
 * Creates a rate limiter middleware based on provided options or defaults.
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // Default: 15 minutes
        max = 100, // Default: 100 requests per windowMs
        message = "Too many requests from this IP, please try again later.",
    } = options;

    // Define the rate limiter with the custom options
    const limiter = rateLimit({
        windowMs,
        max,
        message,
    });

    // Return a middleware that skips the limiter in the test environment
    return (req, res, next) => {
        if (process.env.NODE_ENV === "test") {
            return next(); // Disable rate limiting in test environment
        }
        return limiter(req, res, next); // Apply limiter in other environments
    };
};

export default createRateLimiter;
