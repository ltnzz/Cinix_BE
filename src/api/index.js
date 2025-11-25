// index.js (Sudah disesuaikan untuk integrasi Seat Routes)
import express from 'express';
import bodyParser from 'body-parser';
import FormData from "express-form-data"
import cors from 'cors';
import dotenv from "dotenv";
// Import Routes yang sudah ada (dengan path '../routes/'):
import authRouter from "../routes/authRoute.js";
import movieRouter from "../routes/movie.route.js";
// Hapus import getmovieroute.js yang bermasalah, dan GANTI dengan seatRoutes:
import seatRoutes from '../routes/seatRoutes.js'; // <-- INTEGRASI ROUTE KURSI

import { sessionConfig } from '../utils/sessions.js';
import { cleanup } from '../service/cron.js';

const app = express();
dotenv.config(); // Pindahkan dotenv.config() ke atas
const PORT = process.env.PORT || 3000;

const allowedOrigin = ["https://CINIX-FE.vercel.app", "http://localhost:5432"];

// --- MIDDLEWARE UTAMA ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))
app.use(FormData.parse());

app.use(
    cors({
        origin: allowedOrigin,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

cleanup.start();

app.use(bodyParser.json()); 
app.use(cors()); // Redundant, tapi kita biarkan agar logic Anda tetap utuh.

app.get('/', (req, res) => {
    res.send('Cinix berjalan di Server.');
})

app.use(sessionConfig);

// --- REGISTRASI ROUTES ---
app.use("/", authRouter);
app.use("/", movieRouter);

// DAFTARKAN ROUTE KURSI DENGAN PREFIX /api
// Endpoint akan menjadi: /api/studios/:studioId/seats
app.use("/api", seatRoutes); // <-- INTEGRASI ROUTE KURSI DI SINI

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
})