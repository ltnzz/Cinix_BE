import express from "express";
import { createTransaction } from "../controlllers/midtrans.controller.js";
import { midtransWebhook } from "../service/webhook.js";
import { authentication } from "../middlewares/validation/payment.validation.js";

const router = express.Router();

router.post("/payment", authentication, createTransaction);
router.post("/midtrans/webhook", midtransWebhook);

export default router;
