import prisma from "../config/db.js";
import { snap } from "../service/midtrans.js";

export const createTransaction = async (req, res) => {
  try {
    const { schedule_id, seats, amount } = req.body;
    const user_id = req.user?.id_user || req.user?.id;
    
    // 1. Validasi Dasar
    if (!user_id) return res.status(401).json({ message: "Unauthorized" });
    if (!schedule_id || !seats || !amount) return res.status(400).json({ message: "Data tidak lengkap" });

    // Handle format input (Array atau String)
    let seatArray = Array.isArray(seats) ? seats : seats.split(",");
    if (!seatArray.length) return res.status(400).json({ message: "Seats harus berupa array" });

    // 2. Ambil Schedule + STUDIO_ID (PENTING!)
    const schedule = await prisma.schedules.findUnique({
      where: { id_schedule: schedule_id },
      select: {
        id_schedule: true,
        studio_id: true, // <--- TAMBAHKAN INI (Biar tau kursi ini di studio mana)
        movie: { select: { id_movie: true, title: true } },
      },
    });

    if (!schedule) return res.status(404).json({ message: "Schedule tidak ditemukan" });

    // 3. Query Seats dengan filter STUDIO_ID
    const seatsData = await prisma.seats.findMany({
      where: { 
        seat_number: { in: seatArray },
        studio_id: schedule.studio_id // <--- FILTER INI YANG BIKIN ERROR HILANG
      }, 
    });

    // Validasi jumlah kursi yang ditemukan
    if (seatsData.length !== seatArray.length) {
      return res.status(404).json({ 
        message: "Validasi kursi gagal. Kursi tidak valid untuk studio ini.",
        requested: seatArray.length,
        found: seatsData.length,
        detail: "Pastikan kursi yang dipilih ada di Studio ID: " + schedule.studio_id
      });
    }

    // 4. Hitung Harga Satuan (Karena 'amount' dari FE biasanya Total Harga)
    const totalAmount = Number(amount);
    const seatPrice = Math.floor(totalAmount / seatArray.length); // Harga per item
    
    // Logic Midtrans item_details
    const item_details = seatsData.map((seat, idx) => {
        // Handle pembulatan harga (sisa ditaruh di item pertama)
        const isLast = idx === seatsData.length - 1;
        const currentTotal = seatPrice * (idx + 1);
        // Kalau ada selisih karena pembagian ganjil, adjust di item terakhir/pertama
        
        return {
            id: seat.id_seat,
            name: `Seat ${seat.seat_number}`,
            price: seatPrice, 
            quantity: 1,
        };
    });

    // Pastikan total di item_details SAMA PERSIS dengan gross_amount
    // (Kadang pembagian membuat selisih 1 rupiah, Midtrans akan nolak kalau beda)
    const calculatedTotal = item_details.reduce((acc, item) => acc + item.price, 0);
    if (calculatedTotal !== totalAmount) {
        // Fix selisih di item pertama
        item_details[0].price += (totalAmount - calculatedTotal);
    }

    const order_id = `ORDER-${Date.now()}-${schedule_id}`; // Tambah unik

    // 5. Hit ke Midtrans
    const transaction = await snap.createTransaction({
      transaction_details: { order_id, gross_amount: totalAmount },
      credit_card: { secure: true },
      customer_details: { id: user_id, first_name: "User" },
      item_details,
    });

    // 6. Simpan Booking ke DB
    const booking = await prisma.bookings.create({
      data: {
        user_id,
        schedule_id,
        total_price: totalAmount,
        bookingSeats: {
          create: seatsData.map((seat) => ({ seat_id: seat.id_seat })),
        },
      },
    });

    // 7. Simpan Payment ke DB
    const payment = await prisma.payments.create({
      data: {
        user_id,
        movie_id: schedule.movie.id_movie,
        booking_id: booking.id_booking,
        amount: totalAmount,
        payment_type: "midtrans",
        status: "pending",
        order_id,
        transaction_time: new Date(),
        va_number: transaction.va_numbers?.[0]?.va_number || null,
        qr_code_url: transaction.qr_code_url || null,
        gross_amount: totalAmount,
        midtrans_response: transaction, 
      },
    });

    return res.status(200).json({
      message: "Transaksi berhasil dibuat",
      token: transaction.token, 
      redirect_url: transaction.redirect_url
    });

  } catch (err) {
    console.error("Error createTransaction:", err);
    return res.status(500).json({
      message: "Gagal membuat transaksi",
      error: err.message,
    });
  }
};