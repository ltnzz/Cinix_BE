import prisma from "../config/db.js";
import crypto from "crypto";

export const midtransWebhook = async (req, res) => {
    try {
        const payload = req.body;

        const {
        order_id,
        transaction_status,
        status_code,
        gross_amount,
        signature_key,
        } = payload;

        const serverKey = process.env.MIDTRANS_SERVER_KEY;

        const expectedSignature = crypto
        .createHash("sha512")
        .update(order_id + status_code + gross_amount + serverKey)
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
            midtrans_response: payload,
        },
        });

        if (mappedStatus === "success" && payment.booking_id) {
        await prisma.bookings.update({
            where: { id_booking: payment.booking_id },
            data: { status: "confirmed" },
        });
        }

        return res.status(200).json({ message: "Webhook processed" });
    } catch (err) {
        console.error("Webhook error:", err);
        return res.status(500).json({ message: "Webhook error" });
    }
};
