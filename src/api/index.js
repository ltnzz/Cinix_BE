import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import FormData from "express-form-data" // Diperlukan untuk upload file

// Import Routes
import authRouter from "../routes/authRoute.js";
import movieRouter from "../routes/movie.route.js";
import adminRouter from "../routes/admin.route.js"; // Dari Remote
import seatRoutes from '../routes/seatRoutes.js'; // Dari Lokal Anda

import { sessionConfig } from '../utils/sessions.js';
import { cleanup } from '../service/cron.js';

const app = express();
dotenv.config(); // Konfigurasi dotenv di sini
const PORT = process.env.PORT || 3000;

const allowedOrigin = ["https://CINIX-FE.vercel.app", "http://localhost:5173"];

// --- MIDDLEWARE UTAMA ---
app.use(express.json()); // Untuk parsing JSON
app.use(express.urlencoded({ extended: true })) // Untuk parsing URL-encoded data
app.use(cookieParser()); // Dari Remote
app.use(FormData.parse()); // Dari Lokal Anda (untuk upload file)

app.use(
    cors({
        origin: allowedOrigin,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

cleanup.start();

app.use(sessionConfig);

app.get('/', (req, res) => {
    res.send('Cinix berjalan di Server.');
})

// --- REGISTRASI ROUTES ---
app.use("/", authRouter);
app.use("/", movieRouter);
app.use("/", adminRouter); // Dari Remote
app.use("/api", seatRoutes); // Route Kursi Anda

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
})