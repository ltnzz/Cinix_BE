import prisma from "../config/db.js";
import { snap } from "../service/midtrans.js";

export const createTransaction = async (req, res) => {
  try {
    const { schedule_id, seats, amount } = req.body;
    const user_id = req.user?.id_user || req.user?.id;
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });
    if (!schedule_id || !seats || !amount) return res.status(400).json({ message: "Data tidak lengkap" });

    let seatArray = Array.isArray(seats) ? seats : seats.split(",");
    if (!seatArray.length) return res.status(400).json({ message: "Seats harus berupa array" });

    const schedule = await prisma.schedules.findUnique({
      where: { id_schedule: schedule_id },
      select: {
        movie: { select: { id_movie: true, title: true } },
      },
    });
    if (!schedule) return res.status(404).json({ message: "Schedule tidak ditemukan" });

    const order_id = `ORDER-${Date.now()}`;
    const seatPrice = Math.floor(Number(amount));
    const remainder = Number(amount) - seatPrice * seatArray.length;

    const seatsData = await prisma.seats.findMany({
      where: { seat_number: { in: seatArray } }, // Changed from id_seat
    });

    if (seatsData.length !== seatArray.length) {
      return res.status(404).json({ 
        message: "Beberapa kursi tidak ditemukan",
        requested: seatArray.length,
        found: seatsData.length
      });
    }

    const item_details = seatsData.map((seat, idx) => ({
      id: seat.id_seat,
      name: `Seat ${seat.seat_number}`,
      price: seatPrice + (idx === 0 ? remainder : 0),
      quantity: 1,
    }));

    const transaction = await snap.createTransaction({
      transaction_details: { order_id, gross_amount: Number(amount) },
      credit_card: { secure: true },
      customer_details: { id: user_id, first_name: "User" },
      item_details,
    });

    const booking = await prisma.bookings.create({
      data: {
        user_id,
        schedule_id,
        total_price: Number(amount),
        bookingSeats: {
          create: seatsData.map((seat) => ({ seat_id: seat.id_seat })), // Use id_seat from found seats
        },
      },
    });

    const payment = await prisma.payments.create({
      data: {
        user_id,
        movie_id: schedule.movie.id_movie,
        booking_id: booking.id_booking,
        amount: Number(amount),
        payment_type: "midtrans",
        status: "pending",
        order_id,
        transaction_time: new Date(),
        va_number: transaction.va_numbers?.[0]?.va_number || null,
        qr_code_url: transaction.qr_code_url || null,
        gross_amount: transaction.gross_amount || Number(amount),
        midtrans_response: transaction,
      },
    });

    return res.status(200).json({
      message: "Transaksi berhasil dibuat",
      token: transaction.token, 
      booking,
      payment,
      snap: transaction,
    });
  } catch (err) {
    console.error("Error createTransaction:", err);
    return res.status(500).json({
      message: "Gagal membuat transaksi",
      error: err.message,
    });
  }
};