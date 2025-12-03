import prisma from "../config/db.js";
import crypto from "crypto";

export const midtransWebhook = async (req, res) => {
    try {
        const payload = req.body;

        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).json({ message: "Empty payload" });
        }

        const { order_id, gross_amount, signature_key, transaction_status, transaction_id, va_numbers, status_code } = payload;

        if (!order_id || !gross_amount || !signature_key || !transaction_status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const signatureString = order_id + status_code + gross_amount + serverKey;
        const expectedSignature = crypto
            .createHash("sha512")
            .update(signatureString)
            .digest("hex");

        if (expectedSignature !== signature_key) {
            console.error("Invalid Signature Key");
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

        const existingPayment = await prisma.payments.findFirst({
            where: { order_id: order_id }
        });

        if (!existingPayment) {
            console.warn(`[WEBHOOK] Order ID ${order_id} tidak ditemukan di DB. Mengabaikan.`);
            return res.status(200).json({ message: "Order ID not found, but acknowledged" });
        }

        const updatedPayment = await prisma.payments.update({
            where: { id_payment: existingPayment.id_payment },
            data: {
                status: mappedStatus,
                transaction_id: transaction_id,
                va_number: va_numbers?.[0]?.va_number || existingPayment.va_number,
                midtrans_response: payload, 
                gross_amount: parseFloat(gross_amount) || undefined,
                currency: payload.currency || undefined,
                transaction_time: payload.settlement_time ? new Date(payload.settlement_time) : new Date(),
            },
        });

        if (mappedStatus === 'success') {
            await prisma.bookings.update({
                where: { id_booking: existingPayment.booking_id },
                data: { 
                }
            });
        }

        return res.status(200).json({ message: "Webhook processed" });

    } catch (err) {
        return res.status(500).json({ message: "Webhook error", error: err.message });
    }
};