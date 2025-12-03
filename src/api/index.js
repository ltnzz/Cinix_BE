import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';

import authRouter from "../routes/authRoute.js";
import movieRouter from "../routes/movie.route.js";
import adminRouter from "../routes/admin.route.js"; 
import userRouter from '../routes/user.route.js';
import seatRouter from '../routes/seatRoutes.js'; 
import midtransRouter from '../routes/midtrans.route.js';
import theaterRouter from '../routes/theater.route.js'

import { cleanup } from '../service/cron.js';
import bodyParser from 'body-parser';

const app = express();
dotenv.config(); 
const PORT = process.env.PORT || 2000;

app.use(cookieParser()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());

const allowedOrigin = ["https://cinix.vercel.app/", "http://localhost:5173"];

app.use(
    cors({
        origin: allowedOrigin,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

cleanup.start();

app.get('/', (req, res) => {
    res.send('Cinix berjalan di Server.');
})

app.use("/", authRouter);
app.use("/", movieRouter);
app.use("/", adminRouter); 
app.use("/", userRouter);
app.use("/", seatRouter);
app.use("/", midtransRouter); 
app.use("/", theaterRouter);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
})