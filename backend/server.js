import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { configureCloudinary } from './config/cloudinary.js';

import userRouter from './routes/user.route.js';
import paperRouter from './routes/paper.route.js';
import subjectRouter from './routes/subject.route.js';
import favoriteRouter from './routes/favorite.route.js';
import commentRouter from './routes/comment.route.js';
import notesRouter from './routes/notes.route.js';
import analyticsRouter from './routes/analytics.route.js';
import announcementRoutes from "./routes/announcement.route.js";


const app = express();
const PORT = process.env.PORT || 5000;

// Fail fast when DB is down instead of buffering for 10s+.
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 2000);

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://frontend-examvault.vercel.app',
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: origin '${origin}' not allowed`));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
}

//middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Configure Cloudinary before starting server
configureCloudinary();

// routes
app.use('/user', userRouter);
app.use('/paper', paperRouter);
app.use('/notes', notesRouter);
app.use('/subject', subjectRouter);
app.use('/favorite', favoriteRouter);
app.use('/comments', commentRouter);
app.use('/analytics', analyticsRouter);
app.use("/announcements", announcementRoutes);

app.get("/health", (req, res) => {
    const state = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
    res.status(200).json({
        status: "ok",
        port: PORT,
        db: {
            readyState: state,
            readyStateLabel: ["disconnected", "connected", "connecting", "disconnecting"][state] || "unknown"
        }
    });
});

// Start HTTP server immediately so the frontend doesn't get connection-refused.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Connect to DB (fail fast + log clearly)
const DB_URL = process.env.MONGO_DB_URL;
if (!DB_URL) {
    console.error("❌ MONGO_DB_URL is missing. Backend will run without DB.");
} else {
    mongoose
        .connect(DB_URL, { serverSelectionTimeoutMS: 8000 })
        .then(() => console.log("Connected to DB"))
        .catch((err) => {
            console.error("❌ Failed to connect to DB (backend still running):", err?.message || err);
        });
}

// Always return JSON errors (avoid Express default HTML error pages).
app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err);
    if (res.headersSent) return next(err);

    const status = err?.statusCode || err?.status || 500;
    res.status(status).json({
        message: err?.message || "Internal Server Error"
    });
});