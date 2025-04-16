import { Router } from "express";
import {
    registerUser,
    loginUser,
    logOut,
    getAuthenticatedUser,
} from "../controllers/authController.mjs";
import { authenticateUser } from "../middlewares/authenticateUser.mjs";
import createRateLimiter from "../middlewares/rateLimiter.mjs";
import {
    googleCallback,
    googleLogin,
} from "../controllers/googleAuthController.mjs";
import {
    githubCallback,
    githubLogin,
} from "../controllers/githubAuthController.mjs";

const router = new Router();

const registerLimit = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 registration requests per windowMs
    message:
        "You have registered too many accounts in a short period. Please try again later.",
});

router.post("/register", registerLimit, registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateUser, logOut);
router.get("/me", authenticateUser, getAuthenticatedUser);

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/github", githubLogin);
router.get("/github/callback", githubCallback);

export default router;
