import { body, validationResult } from "express-validator";
import logger from "../utils/logger.mjs";

// Middleware to validate that only allowed fields are present in the request body
export const validateAllowedFields = (allowedFields) => {
    return body().custom((body) => {
        const invalidFields = Object.keys(body).filter(
            (field) => !allowedFields.includes(field),
        );

        if (invalidFields.length > 0) {
            const formattedFields = invalidFields
                .join(", ")
                .replace(/, ([^,]*)$/, " and $1");
            const fieldMessage =
                invalidFields.length === 1
                    ? `Invalid field: ${invalidFields[0]}`
                    : `Invalid fields: ${formattedFields}`;

            // Log invalid fields
            logger.warn(`Validation failed. ${fieldMessage}`);

            throw new Error(fieldMessage);
        }

        return true;
    });
};

// Middleware to handle validation errors
export const validationErrorHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors
            .array()
            .map((error) => {
                return `Field: "${error.path}", Value: "${error.value}", Issue: "${error.msg}", Location: "${error.location}"`;
            })
            .join("; ");

        // Log formatted validation errors
        logger.warn(`Validation errors: ${formattedErrors}`);

        return res.status(400).json({
            errors: errors.array(),
        });
    }

    logger.info("No validation errors.");
    next();
};
