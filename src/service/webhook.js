import prisma from "../config/db.js";

export const midtransWebhook = async (req, res) => {
    try {
        const payload = req.body;
        const { order_id, transaction_status } = payload;

        const statusMap = {
        capture: "success",
        settlement: "success",
        pending: "pending",
        deny: "failed",
        cancel: "failed",
        expire: "expired"
        };

        const payments = await prisma.payments.updateMany({
        where: { order_id },
        data: { status: statusMap[transaction_status] || "pending", midtrans_response: payload }
        });

        if (transaction_status === "capture" || transaction_status === "settlement") {
        const paymentRecords = await prisma.payments.findMany({ where: { order_id } });
        for (const p of paymentRecords) {
            if (p.booking_id) {
            await prisma.bookings.update({
                where: { id_booking: p.booking_id },
                data: { status: "confirmed" }
            });
            }
        }
        }

        return res.status(200).json({ message: "Webhook processed" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Webhook error" });
    }
};
