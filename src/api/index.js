// import express from 'express';
// import cors from 'cors';
// import dotenv from "dotenv";
// import cookieParser from 'cookie-parser';

// import authRouter from "../routes/authRoute.js";
// import movieRouter from "../routes/movie.route.js";
// import adminRouter from "../routes/admin.route.js"; 
// import userRouter from '../routes/user.route.js';
// import seatRouter from '../routes/seatRoutes.js'; 
// import midtransRouter from '../routes/midtrans.route.js';

// import { cleanup } from '../service/cron.js';
// import bodyParser from 'body-parser';

// const app = express();
// dotenv.config(); 
// const PORT = process.env.PORT || 2000;

// app.use(express.json()); 
// app.use(express.urlencoded({ extended: true }))
// app.use(cookieParser()); 
// app.use(bodyParser.json());

// const allowedOrigin = ["https://fe-cinix.vercel.app", "http://localhost:5173"];

// app.use(
//     cors({
//         origin: allowedOrigin,
//         methods: ["GET", "POST", "PUT", "DELETE"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//         credentials: true
//     })
// );

// app.options("*", cors());

// cleanup.start();

// app.get('/', (req, res) => {
//     res.send('Cinix berjalan di Server.');
// })

// app.use("/", authRouter);
// app.use("/", movieRouter);
// app.use("/", adminRouter); 
// app.use("/", userRouter);
// app.use("/", seatRouter);
// app.use("/", midtransRouter); 

// app.listen(PORT, () => {
//     console.log(`Server berjalan di http://localhost:${PORT}`);
// })

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

import { cleanup } from '../service/cron.js';
import bodyParser from 'body-parser';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 2000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// FIXED: tanpa slash
const allowedOrigin = ["https://fe-cinix.vercel.app", "http://localhost:5173"];

// CORS utama
app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// FIX: handle preflight di Express v5
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Origin", allowedOrigin);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        return res.sendStatus(200);
    }
    next();
});

// cron
cleanup.start();

app.get('/', (req, res) => {
    res.send('Cinix berjalan di Server.');
});

app.use("/", authRouter);
app.use("/", movieRouter);
app.use("/", adminRouter);
app.use("/", userRouter);
app.use("/", seatRouter);
app.use("/", midtransRouter);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
