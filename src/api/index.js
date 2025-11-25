    import express from 'express';
    import cors from 'cors';
    import dotenv from "dotenv";
    import cookieParser from 'cookie-parser';
    import authRouter from "../routes/authRoute.js";
    import movieRouter from "../routes/movie.route.js";
    import adminRouter from "../routes/admin.route.js";
    import userRouter from "../routes/user.route.js";
    import { sessionConfig } from '../utils/sessions.js';
    import { cleanup } from '../service/cron.js';

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser());

    dotenv.config();
    const PORT = process.env.PORT || 2000;

    const allowedOrigin = ["https://CINIX-FE.vercel.app", "http://localhost:5173"];

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

    app.use(sessionConfig);

    app.use("/", authRouter);
    app.use("/", movieRouter);
    app.use("/", adminRouter);
    app.use("/", userRouter);

    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    })