import { body } from "express-validator";
import {
    validateAllowedFields,
    validationErrorHandler,
} from "./validateUtils.mjs";

export const validateRegisterUser = [
    body("username")
        .notEmpty()
        .withMessage("Username required")
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username too short")
        .isLength({ max: 20 })
        .withMessage("Username too long")
        .matches(/^[a-zA-Z]/)
        .withMessage("Username must start with a letter")
        .matches(/^\S*$/)
        .withMessage("Username cannot contain spaces")
        .matches(/^[a-zA-Z][a-zA-Z0-9_.]*$/)
        .withMessage("Invalid username"),

    body("email")
        .notEmpty()
        .withMessage("Email required")
        .matches(/^[\w.%+-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/)
        .withMessage("Enter a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password required")
        .isString()
        .withMessage("Password must be a string")
        .isLength({ min: 6 })
        .withMessage("Password too short")
        .isLength({ max: 128 })
        .withMessage("Password too long"),

    validateAllowedFields(["username", "email", "password"]),
    validationErrorHandler,
];

export const validateLoginUser = [
    body("email")
        .notEmpty()
        .withMessage("Email required")
        .matches(/^[\w.%+-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/)
        .withMessage("Enter a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password required")
        .isString()
        .withMessage("Password must be a string")
        .isLength({ min: 6 })
        .withMessage("Password too short")
        .isLength({ max: 128 })
        .withMessage("Password too long"),

    validateAllowedFields(["email", "password"]),
    validationErrorHandler,
];

export const validateChangeUsername = [
    body("username")
        .notEmpty()
        .withMessage("Username required")
        .isString()
        .withMessage("Username must be a string")
        .isLength({ min: 3 })
        .withMessage("Username too short")
        .isLength({ max: 20 })
        .withMessage("Username too long")
        .matches(/^[a-zA-Z]/)
        .withMessage("Username must start with a letter")
        .matches(/^\S*$/)
        .withMessage("Username cannot contain spaces")
        .matches(/^[a-zA-Z][a-zA-Z0-9_.]*$/)
        .withMessage("Invalid username"),

    validateAllowedFields(["username"]),
    validationErrorHandler,
];

export const validateChangePassword = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password required")
        .isString()
        .withMessage("Current password must be a string")
        .isLength({ min: 6 })
        .withMessage("Current password too short")
        .isLength({ max: 128 })
        .withMessage("Current password too long"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password required")
        .isString()
        .withMessage("New password must be a string")
        .isLength({ min: 6 })
        .withMessage("New password too short")
        .isLength({ max: 128 })
        .withMessage("New password too long"),

    validateAllowedFields(["currentPassword", "newPassword"]),
    validationErrorHandler,
];
