import prisma from "../config/db.js";
import crypto from "crypto";

export const midtransWebhook = async (req, res) => {
    try {
        const payload = req.body;

        if (!payload || Object.keys(payload).length === 0) {
        return res.status(400).json({ message: "Empty payload" });
        }

        const { order_id, gross_amount, signature_key, transaction_status, transaction_id, va_numbers } = payload;

        if (!order_id || !gross_amount || !signature_key || !transaction_status) {
        return res.status(400).json({ message: "Missing required fields" });
        }

        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const signatureString = order_id + payload.status_code + gross_amount + serverKey;
        const expectedSignature = crypto
        .createHash("sha512")
        .update(signatureString)
        .digest("hex");

        if (expectedSignature !== signature_key) {
        return res.status(403).json({ message: "Invalid signature" });
        }

        const statusMap = {
        capture: "success",
        settlement: "success",
        pending: "pending",
        deny: "failed",
        cancel: "failed",
        expire: "expired",
        refund: "refunded",
        };
        const mappedStatus = statusMap[transaction_status] || "pending";

        const payment = await prisma.payments.update({
        where: { order_id },
        data: {
            status: mappedStatus,
            transaction_id: transaction_id,
            va_number: va_numbers?.[0]?.va_number || null,
            midtrans_response: payload,
            gross_amount: parseFloat(gross_amount) || null,
            currency: payload.currency || null,
            transaction_time: transaction_status === "settlement" ? new Date(payload.settlement_time) : new Date(),
        },
        });

        return res.status(200).json({ message: "Webhook processed" });
    } catch (err) {
        console.error("[WEBHOOK] Error:", err);
        return res.status(500).json({ message: "Webhook error", error: err.message });
    }
};
