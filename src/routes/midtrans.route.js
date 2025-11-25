import express from "express";
import { createTransaction } from "../controlllers/midtrans.controller.js";
import { midtransWebhook } from "../service/webhook.js";

const router = express.Router();

router.post("/payment", createTransaction);
router.post("/midtrans/webhook", midtransWebhook);

export default router;
