import User from '../models/user.model.js';

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from "jsonwebtoken";

const isDbReady = () => User.db?.readyState === 1;

const buildAuthCookieOptions = () => {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    };
};

const signAccessToken = (user) => {
    const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev_secret_change_me" : null);
    if (!jwtSecret) throw new Error("JWT_SECRET missing");

    // `sub` is the standard JWT subject claim.
    return jwt.sign(
        { role: user.role, email: user.email },
        jwtSecret,
        { subject: String(user._id), expiresIn: "1d" }
    );
};

export const getProfile = async (req, res) => {
    res.status(200).json({
        status: "ok",
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            username: req.user.username,
        },
    });
};

export const registerUser = async (req, res) => {
    if (!isDbReady()) {
        return res.status(503).set('Retry-After', '5').json({ status: "error", message: "Server is warming up, please retry in a few seconds." });
    }

    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
        return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ status: "error", message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        username,
    });
    await newUser.save();

    res.status(201).json({ status: "ok", message: "User registered successfully" });
}

export const loginUser = async (req, res) => {
    if (!isDbReady()) {
        return res.status(503).set('Retry-After', '5').json({ status: "error", message: "Server is warming up, please retry in a few seconds." });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ status: "error", message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ status: "error", message: "Password is incorrect" });
    }

    // JWT (preferred). We still keep the legacy token fields for backwards compatibility.
    const token = signAccessToken(user);

    // Optional legacy token (kept to avoid breaking older clients that still send x-auth-token)
    const legacyToken = crypto.randomBytes(32).toString('hex');
    user.token = legacyToken;
    user.tokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 1 day
    await user.save();

    res.cookie("token", token, {
        ...buildAuthCookieOptions(),
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        status: "ok",
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            username: user.username
        }
    });
}

export const logoutUser = async (req, res) => {
    try {
        // Clear JWT cookie regardless of current auth state
        res.clearCookie("token", buildAuthCookieOptions());

        // Best-effort: also clear legacy token if provided
        const legacyToken = req.headers["x-auth-token"];
        if (legacyToken) {
            const user = await User.findOne({ token: legacyToken });
            if (user) {
                await User.updateOne({ _id: user._id }, { token: "", tokenExpires: null });
            }
        }

        res.status(200).json({ status: "ok", message: "Logout successful" });
    } catch (err) {
        console.error("Logout failed", err);
        res.status(500).json({ status: "error", message: "Logout failed" });
    }
}

export const updateProfile = async (req, res) => {
    const { name, username } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ status: "error", message: "Unauthorized" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
        return res.status(400).json({ status: "error", message: "Username already taken" });
    }

    Object.assign(user, { name, username });
    await user.save();

    res.status(200).json({ 
        status: "ok", 
        message: "Profile updated successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        }
    });
}

export const deleteProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ status: "error", message: "Unauthorized" });

        await User.findByIdAndDelete(user._id);
        res.clearCookie("token", buildAuthCookieOptions());

        res.status(200).json({ 
            status: "ok", 
            message: "Profile deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting profile:", error);
        res.status(500).json({ status: "error", message: "Failed to delete profile" });
    }
}

/**
 * Create a new admin user. Protected: auth + adminOnly.
 * Body: { name, username, email, password }
 */
export const createAdmin = async (req, res) => {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
        return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    const existingByEmail = await User.findOne({ email });
    if (existingByEmail) {
        return res.status(400).json({ status: "error", message: "Email already in use" });
    }

    const existingByUsername = await User.findOne({ username });
    if (existingByUsername) {
        return res.status(400).json({ status: "error", message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        username: username.trim(),
        role: "admin",
    });
    await newAdmin.save();

    res.status(201).json({ status: "ok", message: "Admin created successfully" });
}