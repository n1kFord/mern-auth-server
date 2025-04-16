import winston from "winston";
import chalk from "chalk";

const logFile =
    process.env.NODE_ENV === "test" ? "logs/tests.log" : "logs/server.log";

// Define a plain log format without colors for file logs
const plainFormat = winston.format.printf(({ timestamp, level, message }) => {
    const isRequestLog = /^(GET|POST|PUT|DELETE|PATCH|OPTIONS)\b/.test(message);
    const separator = isRequestLog || message.startsWith("* ") ? "\n" : "";

    return `${separator}${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Define a colored format for console output only
const colorizeFormat = winston.format.printf(
    ({ timestamp, level, message }) => {
        const isRequestLog = /^(GET|POST|PUT|DELETE|PATCH|OPTIONS)\b/.test(
            message,
        );
        const separator = isRequestLog || message.startsWith("* ") ? "\n" : "";

        const colorizeLevel = (level) => {
            switch (level) {
                case "info":
                    return chalk.blue(level.toUpperCase());
                case "warn":
                    return chalk.yellow(level.toUpperCase());
                case "error":
                    return chalk.red(level.toUpperCase());
                case "debug":
                    return chalk.cyan(level.toUpperCase());
                default:
                    return level.toUpperCase();
            }
        };

        const colorizeMessage = (level, msg) => {
            switch (level) {
                case "warn":
                    return chalk.yellow(msg);
                case "error":
                    return chalk.red(msg);
                default:
                    return msg;
            }
        };

        return `${separator}${chalk.gray(timestamp)} [${colorizeLevel(level)}]: ${colorizeMessage(level, message)}`;
    },
);

const logger = winston.createLogger({
    level: "info",
    transports: [
        new winston.transports.File({
            filename: logFile,
            level: "info",
            format: winston.format.combine(
                winston.format.timestamp(),
                plainFormat, // Plain format, without colors, for files
            ),
        }),
        ...(process.env.NODE_ENV !== "test"
            ? [
                  new winston.transports.Console({
                      format: winston.format.combine(
                          winston.format.timestamp(),
                          colorizeFormat, // Colored format, for console output only
                      ),
                  }),
              ]
            : []),
    ],
});

export default logger;
