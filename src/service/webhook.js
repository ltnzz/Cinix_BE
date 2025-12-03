import prisma from "../config/db.js";
import crypto from "crypto";

export const midtransWebhook = async (req, res) => {
    try {
        const payload = req.body;

        // 1. Validasi Payload Basic
        if (!payload || Object.keys(payload).length === 0) {
            return res.status(400).json({ message: "Empty payload" });
        }

        const { order_id, gross_amount, signature_key, transaction_status, transaction_id, va_numbers, status_code } = payload;

        if (!order_id || !gross_amount || !signature_key || !transaction_status) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 2. Verifikasi Signature Manual (Ini sudah benar & aman)
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

        // 3. Mapping Status
        const statusMap = {
            capture: "success",
            settlement: "success", // Uang masuk
            pending: "pending",
            deny: "failed",
            cancel: "failed",
            expire: "expired",
            refund: "refunded",
        };
        const mappedStatus = statusMap[transaction_status] || "pending";

        console.log(`[WEBHOOK] Order ID: ${order_id} | Status: ${mappedStatus}`);

        // --- BAGIAN PERBAIKAN DATABASE ---

        // 4. Cari dulu datanya pakai findFirst (Karena order_id tidak @unique)
        const existingPayment = await prisma.payments.findFirst({
            where: { order_id: order_id }
        });

        // 5. Jika data tidak ketemu (Misal: Test Notification dari Dashboard Midtrans)
        if (!existingPayment) {
            console.warn(`[WEBHOOK] Order ID ${order_id} tidak ditemukan di DB. Mengabaikan.`);
            // Return 200 OK agar Midtrans tidak mengirim ulang notifikasi terus menerus
            return res.status(200).json({ message: "Order ID not found, but acknowledged" });
        }

        // 6. Update Payment menggunakan ID PRIMARY KEY (id_payment)
        const updatedPayment = await prisma.payments.update({
            where: { id_payment: existingPayment.id_payment }, // <--- INI KUNCINYA
            data: {
                status: mappedStatus,
                transaction_id: transaction_id,
                va_number: va_numbers?.[0]?.va_number || existingPayment.va_number, // Pakai lama kalau null
                midtrans_response: payload, // Pastikan kolom ini tipe Json di schema
                gross_amount: parseFloat(gross_amount) || undefined,
                currency: payload.currency || undefined,
                // Handle tanggal dengan aman
                transaction_time: payload.settlement_time ? new Date(payload.settlement_time) : new Date(),
            },
        });

        // 7. (Opsional) Update juga status Booking menjadi PAID jika payment success
        if (mappedStatus === 'success') {
            await prisma.bookings.update({
                where: { id_booking: existingPayment.booking_id },
                data: { 
                    // status: 'paid' // Uncomment jika ada kolom status di bookings
                }
            });
            console.log(`[WEBHOOK] Booking ${existingPayment.booking_id} updated to PAID`);
        }

        return res.status(200).json({ message: "Webhook processed" });

    } catch (err) {
        console.error("[WEBHOOK] Error:", err);
        // Tetap return 500 jika codingan error, biar ketahuan di log midtrans
        return res.status(500).json({ message: "Webhook error", error: err.message });
    }
};