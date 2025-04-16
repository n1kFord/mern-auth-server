import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: { type: String, required: true },
        logo: { type: String, required: true },
        authProvider: {
            type: String,
            enum: ["local", "google", "github"],
            default: "local",
        },
    },
    { timestamps: { createdAt: "created_at" } },
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
