import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { start } from "../index.mjs";
import portfinder from "portfinder";
import logger from "../utils/logger.mjs";

let mongoServer;

export const initializeTestDB = async () => {
    try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        const port = await portfinder.getPortPromise();
        await start(mongoUri, port);

        logger.info(`* Test DB initialized. URI: ${mongoUri}, Port: ${port}`);
    } catch (error) {
        logger.error(`* Error initializing test DB: ${error.message}`, {
            error,
        });
        throw error;
    }
};

export const cleanUpTestDB = async () => {
    try {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();

        logger.info("* Test DB and server stopped successfully.");
    } catch (error) {
        logger.error(`* Error stopping test DB: ${error.message}`, { error });
    }
};

export const clearCollections = async () => {
    try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
        logger.info("Test DB collections cleared.");
    } catch (error) {
        logger.error(`Error clearing collections: ${error.message}`, {
            error,
        });
    }
};
