import express from 'express';
import bodyParser from 'body-parser';
import FormData from "express-form-data"
import cors from 'cors';
import dotenv from "dotenv";
import authRouter from "./routes/authRoute.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(FormData.parse());

dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Cinix berjalan di Server.');
})

app.use("/", authRouter);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
})