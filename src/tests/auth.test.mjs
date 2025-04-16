import request from "supertest";
import fs from "fs";
import path from "path";
import { app } from "../index.mjs";
import {
    cleanUpTestDB,
    clearCollections,
    initializeTestDB,
} from "./mongoSetup.mjs";
import {
    deleteAvatars,
    addAvatarFilename,
    clearAvatarFilenames,
    avatarsDir,
} from "../utils/avatarUtils.mjs";

beforeAll(async () => {
    await initializeTestDB();
});

afterEach(async () => {
    await clearCollections();
});

afterAll(async () => {
    await deleteAvatars();
    clearAvatarFilenames();
    await cleanUpTestDB();
});

// Helper function for registering and logging in users
const registerUser = async (userData) => {
    const res = await request(app).post("/api/auth/register").send(userData);
    if (res?.body?.user) {
        const avatarFileName = path.basename(res.body?.user?.logo);
        addAvatarFilename(avatarFileName);
    }
    return res;
};

const loginUser = async (userData) => {
    const res = await request(app).post("/api/auth/login").send(userData);
    return res;
};

describe("User Authentication API", () => {
    jest.setTimeout(12000);

    // --- Registration Tests ---
    describe("POST /api/auth/register", () => {
        it("should register a user successfully and save the avatar with the correct filename", async () => {
            const username = "testuser";
            const email = "testuser@example.com";
            const password = "password123";

            const res = await registerUser({
                username,
                email,
                password,
            });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("msg", "Registration successful!");
            expect(res.body.user).toHaveProperty("username", username);
            expect(res.body.user).toHaveProperty("email", email);

            await new Promise((resolve) => setTimeout(resolve, 100));

            const avatarFileName = path.basename(res.body?.user?.logo);
            const avatarPath = path.join(avatarsDir, avatarFileName);

            const fileExists = fs.existsSync(avatarPath);

            expect(fileExists).toBe(true);
        });

        it("should fail if the email is already in use", async () => {
            await registerUser({
                username: "testuser1",
                email: "testuser@example.com",
                password: "password123",
            });
            const res = await registerUser({
                username: "testuser2",
                email: "testuser@example.com",
                password: "password456",
            });
            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty("msg", "Email already in use");
        });

        it("should fail if the username is invalid", async () => {
            const res = await registerUser({
                username: "ab",
                email: "test@example.com",
                password: "password123",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Username too short");
        });

        it("should fail if the password is too short", async () => {
            const res = await registerUser({
                username: "newuser",
                email: "newuser@example.com",
                password: "123",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Password too short");
        });

        it("should fail if extra fields are included", async () => {
            const res = await registerUser({
                username: "newuser",
                email: "newuser@example.com",
                password: "password123",
                extraField: "shouldFail",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toContain("Invalid field");
        });

        // Edge-case tests for registration
        it("should fail if username contains invalid characters", async () => {
            const res = await registerUser({
                username: "invalid$user",
                email: "invaliduser@example.com",
                password: "password123",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Invalid username");
        });

        it("should fail if email format is invalid", async () => {
            const res = await registerUser({
                username: "userwithinvalidemail",
                email: "invalid-email-format",
                password: "password123",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Enter a valid email");
        });

        it("should fail if password is missing", async () => {
            const res = await registerUser({
                username: "nopassworduser",
                email: "nopassword@example.com",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Password required");
        });
    });

    // --- Login Tests ---
    describe("POST /api/auth/login", () => {
        beforeAll(async () => {
            await registerUser({
                username: "loginuser",
                email: "loginuser@example.com",
                password: "password123",
            });
        });

        it("should login a user successfully", async () => {
            const res = await loginUser({
                email: "loginuser@example.com",
                password: "password123",
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("msg", "Logged in successfully!");
            expect(res.body.user).toHaveProperty("username", "loginuser");
            expect(res.body.user).toHaveProperty(
                "email",
                "loginuser@example.com",
            );
            expect(res.body.user).toHaveProperty("logo");
            expect(res.body.user).toHaveProperty("created_at");
            expect(res.body.user).toHaveProperty("_id");
            expect(res.headers["set-cookie"]).toBeDefined();
        });

        it("should fail for invalid credentials (wrong password)", async () => {
            const res = await loginUser({
                email: "loginuser@example.com",
                password: "wrongpassword",
            });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty(
                "msg",
                "Invalid credentials. Ensure that your email and password are correct.",
            );
        });

        it("should fail for non-existent email", async () => {
            const res = await loginUser({
                email: "nonexistent@example.com",
                password: "password123",
            });
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty(
                "msg",
                "Invalid credentials. Ensure that your email and password are correct.",
            );
        });

        it("should fail if extra fields are included", async () => {
            const res = await loginUser({
                email: "loginuser@example.com",
                password: "password123",
                extraField: "shouldFail",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toContain("Invalid field");
        });

        // Edge-case tests for login
        it("should fail if email format is invalid", async () => {
            const res = await loginUser({
                email: "invalid-email-format",
                password: "password123",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Enter a valid email");
        });

        it("should fail if password is missing", async () => {
            const res = await loginUser({
                email: "loginuser@example.com",
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body.errors[0].msg).toBe("Password required");
        });
    });

    // --- Logout Tests ---
    describe("POST /api/auth/logout", () => {
        beforeAll(async () => {
            await registerUser({
                username: "logoutUser",
                email: "logoutuser@example.com",
                password: "password123",
            });
        });

        it("should logout a user successfully and clear the token cookie", async () => {
            const loginRes = await loginUser({
                email: "logoutuser@example.com",
                password: "password123",
            });
            const token = loginRes.headers["set-cookie"];

            const res = await request(app)
                .post("/api/auth/logout")
                .set("Cookie", token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("msg", "Logged out successfully");
            expect(res.headers["set-cookie"]).toBeDefined();
            const cookie = res.headers["set-cookie"][0];
            expect(cookie).toContain("token=;"); // Token cookie should be cleared
        });
    });

    // --- Get Authenticated User Tests ---
    describe("GET /api/auth/me", () => {
        it("should fetch authenticated user data successfully", async () => {
            const registerRes = await registerUser({
                username: "fetchuser",
                email: "fetchuser@example.com",
                password: "password123",
            });
            const token = registerRes.headers["set-cookie"];

            const res = await request(app)
                .get("/api/auth/me")
                .set("Cookie", token);

            expect(res.statusCode).toEqual(200);
            expect(res.body.user).toHaveProperty("username", "fetchuser");
            expect(res.body.user).toHaveProperty(
                "email",
                "fetchuser@example.com",
            );
            expect(res.body.user).toHaveProperty("logo");
            expect(res.body.user).toHaveProperty("created_at");
            expect(res.body.user).toHaveProperty("_id");
        });

        it("should return 401 if not authenticated", async () => {
            const res = await request(app).get("/api/auth/me");
            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty(
                "msg",
                "No token, authorization denied",
            );
        });
    });
});
