import prisma from "../config/db.js";
import { snap } from "../service/midtrans.js";

export const createTransaction = async (req, res) => {
    try {
        const { user_id, schedule_id, seats, amount } = req.body;

        if (!user_id || !schedule_id || !seats || !amount) {
        return res.status(400).json({ message: "Data tidak lengkap" });
        }

        let seatArray = seats;
        if (typeof seats === "string") seatArray = seats.split(",");
        if (!Array.isArray(seatArray) || seatArray.length === 0) {
        return res.status(400).json({ message: "Seats harus berupa array" });
        }

        const amountFloat = parseFloat(amount);
        if (isNaN(amountFloat)) {
        return res.status(400).json({ message: "Amount harus berupa angka" });
        }

        const schedule = await prisma.schedules.findUnique({
        where: { id_schedule: schedule_id },
        select: { movie_id: true },
        });
        if (!schedule) {
        return res.status(404).json({ message: "Schedule tidak ditemukan" });
        }

        const order_id = `ORDER-${Date.now()}`;

        const transaction = await snap.createTransaction({
        transaction_details: { order_id, gross_amount: amountFloat },
        credit_card: { secure: true },
        customer_details: { id: user_id, first_name: "User" },
        });

        const booking = await prisma.bookings.create({
        data: {
            user_id,
            schedule_id,
            total_price: amountFloat,
            bookingSeats: { create: seatArray.map((seat_id) => ({ seat_id })) },
        },
        });

        const payment = await prisma.payments.create({
        data: {
            user_id,
            movie_id: schedule.movie_id,
            booking_id: booking.id_booking,
            amount: amountFloat,
            payment_type: "midtrans",
            status: "pending",
            transaction_id: transaction.transaction_id,
            order_id,
            transaction_time: new Date(),
            va_number: transaction.va_numbers?.[0]?.va_number || null,
            qr_code_url: transaction.qr_code_url || null,
            gross_amount: transaction.gross_amount,
            midtrans_response: transaction,
        },
        });

        return res.status(200).json({
        message: "Transaksi berhasil dibuat",
        booking,
        payment,
        transaction,
        });
    } catch (err) {
        console.error("Error createTransaction:", err);
        return res.status(500).json({
        message: "Gagal membuat transaksi",
        error: err.message,
        });
    }
};
