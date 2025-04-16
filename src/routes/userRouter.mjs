import { Router } from "express";
import {
    changeUsername,
    changePassword,
    deleteAccount,
} from "../controllers/userController.mjs";
import { authenticateUser } from "../middlewares/authenticateUser.mjs";

const router = new Router();

router.post("/change-username", authenticateUser, changeUsername);
router.post("/change-password", authenticateUser, changePassword);
router.delete("/delete-account", authenticateUser, deleteAccount);

export default router;
