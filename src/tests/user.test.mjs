import fs from "fs";
import path from "path";
import request from "supertest";
import { __dirname } from "../utils/dirnameHelper.mjs";
import { app } from "../index.mjs";
import { generateToken } from "../utils/authUtils.mjs";
import { cleanUpTestDB, initializeTestDB } from "./mongoSetup.mjs";
import { avatarsDir } from "../utils/avatarUtils.mjs";
import logger from "../utils/logger.mjs";

let token; // Token for authenticated requests
let userId; // Store the ID of the created user for testing

beforeAll(async () => {
    await initializeTestDB();

    // Attempt to register a test user
    const res = await request(app).post("/api/auth/register").send({
        email: "testuser@example.com",
        username: "testUser",
        password: "testPassword123",
    });

    if (res.status === 201 && res.body?.user?._id) {
        userId = res.body.user._id;
        token = generateToken(userId); // Generate a token for authenticated requests
    } else {
        logger.error(`Failed to create user: ${JSON.stringify(res.body)}`);
        throw new Error("User registration failed during test setup.");
    }
});

// Clean up the test database after all tests are done
afterAll(async () => {
    await cleanUpTestDB();
});

describe("User Actions API", () => {
    // --- Change Username Tests ---
    describe("POST /api/user/change-username", () => {
        it("should change a username successfully", async () => {
            const res = await request(app)
                .post("/api/user/change-username")
                .set("Cookie", `token=${token}`)
                .send({ username: "newNameUserForChange" });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty(
                "msg",
                "Username updated successfully!",
            );
            expect(res.body).toHaveProperty(
                "newUsername",
                "newNameUserForChange",
            );
        });

        it("should return 400 for empty username", async () => {
            const res = await request(app)
                .post("/api/user/change-username")
                .set("Cookie", `token=${token}`)
                .send({ username: "" });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Username required");
        });

        it("should return 400 for username too short", async () => {
            const res = await request(app)
                .post("/api/user/change-username")
                .set("Cookie", `token=${token}`)
                .send({ username: "ab" });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Username too short");
        });

        it("should return 400 for username too long", async () => {
            const res = await request(app)
                .post("/api/user/change-username")
                .set("Cookie", `token=${token}`)
                .send({ username: "a".repeat(21) });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Username too long");
        });

        it("should return 400 for username containing spaces", async () => {
            const res = await request(app)
                .post("/api/user/change-username")
                .set("Cookie", `token=${token}`)
                .send({ username: "user name" });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe(
                "Username cannot contain spaces",
            );
        });

        it("should return 400 for invalid username format", async () => {
            const res = await request(app)
                .post("/api/user/change-username")
                .set("Cookie", `token=${token}`)
                .send({ username: "123user" });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe(
                "Username must start with a letter",
            );
        });

        it("should return 401 if not authenticated", async () => {
            const res = await request(app)
                .post("/api/user/change-username")
                .send({ username: "newNameUserForChange1" });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty(
                "msg",
                "No token, authorization denied",
            );
        });
    });

    // --- Change Password Tests ---
    describe("POST /api/user/change-password", () => {
        it("should change a password successfully", async () => {
            const res = await request(app)
                .post("/api/user/change-password")
                .set("Cookie", `token=${token}`)
                .send({
                    currentPassword: "testPassword123",
                    newPassword: "newPassword123",
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty(
                "msg",
                "Password changed successfully! Please log in again.",
            );
        });

        it("should return 400 for incorrect current password", async () => {
            const res = await request(app)
                .post("/api/user/change-password")
                .set("Cookie", `token=${token}`)
                .send({
                    currentPassword: "wrongPassword",
                    newPassword: "newPassword123",
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty(
                "msg",
                "Incorrect current password",
            );
        });

        it("should return 400 for empty current password", async () => {
            const res = await request(app)
                .post("/api/user/change-password")
                .set("Cookie", `token=${token}`)
                .send({
                    currentPassword: "",
                    newPassword: "newPassword123",
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Current password required");
        });

        it("should return 400 for empty new password", async () => {
            const res = await request(app)
                .post("/api/user/change-password")
                .set("Cookie", `token=${token}`)
                .send({
                    currentPassword: "testPassword123",
                    newPassword: "",
                });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("New password required");
        });

        it("should return 401 if not authenticated", async () => {
            const res = await request(app)
                .post("/api/user/change-password")
                .send({
                    currentPassword: "testPassword123",
                    newPassword: "newPassword123",
                });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty(
                "msg",
                "No token, authorization denied",
            );
        });
    });

    // --- Delete Account Tests ---
    describe("DELETE /api/user/delete-account", () => {
        it("should delete account and avatar successfully", async () => {
            const userRes = await request(app)
                .get("/api/auth/me")
                .set("Cookie", `token=${token}`);

            const avatarFileName = path.basename(userRes.body?.user?.logo);
            const avatarPath = path.join(avatarsDir, avatarFileName);
            expect(fs.existsSync(avatarPath)).toBe(true);

            const res = await request(app)
                .delete("/api/user/delete-account")
                .set("Cookie", `token=${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty(
                "msg",
                "Account deleted successfully!",
            );

            expect(fs.existsSync(avatarPath)).toBe(false);
        });

        it("should return 401 if not authenticated", async () => {
            const res = await request(app).delete("/api/user/delete-account");
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty(
                "msg",
                "No token, authorization denied",
            );
        });
    });
});
