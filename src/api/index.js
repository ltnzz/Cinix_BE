import express from 'express';
import bodyParser from 'body-parser';
import FormData from "express-form-data"
import cors from 'cors';
import dotenv from "dotenv";
import authRouter from "../routes/authRoute.js";
import movieRouter from "../routes/movie.route.js";
import { sessionConfig } from '../utils/sessions.js';
import { cleanup } from '../service/cron.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(FormData.parse());

dotenv.config();
const PORT = process.env.PORT || 3000;

const allowedOrigin = ["https://CINIX-FE.vercel.app", "http://localhost:5432"];

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
app.use(cors());

app.get('/', (req, res) => {
    res.send('Cinix berjalan di Server.');
})

app.use(sessionConfig);

app.use("/", authRouter);
app.use("/", movieRouter);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
})