import prisma from "../config/db.js";
import { snap } from "../service/midtrans.js";

export const createTransaction = async (req, res) => {
  try {
    // Asumsi: 'amount' yang dikirim adalah TOTAL HARGA TIKET SAJA (Subtotal)
    const { schedule_id, seats, amount } = req.body;
    const user_id = req.user?.id_user || req.user?.id;
    
    // Konstanta Biaya
    const TAX_RATE = 0.11; // 11%
    const SERVICE_FEE = 3000; // Rp 3.000

    if (!user_id) return res.status(401).json({ message: "Unauthorized" });
    if (!schedule_id || !seats || !amount) return res.status(400).json({ message: "Data tidak lengkap" });

    let seatArray = Array.isArray(seats) ? seats : seats.split(",");
    if (!seatArray.length) return res.status(400).json({ message: "Seats harus berupa array" });

    // 1. Ambil Data Schedule
    const schedule = await prisma.schedules.findUnique({
      where: { id_schedule: schedule_id },
      select: {
        id_schedule: true,
        studio_id: true,
        movie: { select: { id_movie: true, title: true } },
      },
    });

    if (!schedule) return res.status(404).json({ message: "Schedule tidak ditemukan" });

    // 2. Validasi Kursi di Database
    const seatsData = await prisma.seats.findMany({
      where: { 
        seat_number: { in: seatArray },
        studio_id: schedule.studio_id 
      }, 
    });

    if (seatsData.length !== seatArray.length) {
      return res.status(404).json({ 
        message: "Validasi kursi gagal. Beberapa kursi tidak valid.",
        found: seatsData.length,
        expected: seatArray.length
      });
    }

    // --- PERHITUNGAN BIAYA ---
    const ticketSubtotal = Number(amount); // Harga Tiket Murni
    const taxAmount = Math.round(ticketSubtotal * TAX_RATE); // Pajak 11% (dibulatkan)
    const serviceFee = SERVICE_FEE; // Biaya Layanan
    
    // Total yang harus dibayar ke Midtrans
    const grossAmount = ticketSubtotal + taxAmount + serviceFee;

    // --- MENYUSUN ITEM DETAILS MIDTRANS ---
    
    // A. Rincian Tiket
    const seatPrice = Math.floor(ticketSubtotal / seatArray.length);
    
    const item_details = seatsData.map((seat, idx) => {
        // Handle pembulatan harga tiket jika hasil bagi tidak bulat
        const isLast = idx === seatsData.length - 1;
        // Jika ini item terakhir, sesuaikan harga agar totalnya pas dengan ticketSubtotal
        // (Misal total 100 perak bagi 3 orang -> 33, 33, 34)
        const currentSum = seatPrice * (seatsData.length - 1);
        const adjustedPrice = isLast ? (ticketSubtotal - currentSum) : seatPrice;
        
        return {
            id: seat.id_seat,
            name: `Seat ${seat.seat_number}`,
            price: adjustedPrice, 
            quantity: 1,
            category: "Ticket"
        };
    });

    // B. Tambah Item Pajak
    if (taxAmount > 0) {
        item_details.push({
            id: "TAX-11",
            name: "PPN 11%",
            price: taxAmount,
            quantity: 1,
            category: "Tax"
        });
    }

    // C. Tambah Item Biaya Layanan
    if (serviceFee > 0) {
        item_details.push({
            id: "SRV-FEE",
            name: "Biaya Layanan",
            price: serviceFee,
            quantity: 1,
            category: "Service"
        });
    }

    // 4. Buat Order ID Unik
    const order_id = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 5. Request ke Midtrans Snap
    const transaction = await snap.createTransaction({
      transaction_details: { 
          order_id, 
          gross_amount: grossAmount // Total Akhir (Tiket + Pajak + Fee)
      },
      credit_card: { secure: true },
      customer_details: { 
          id: user_id, 
          first_name: "Cinix User" // Bisa ambil dari DB user jika ada
      },
      item_details,
    });

    // 6. Simpan ke Database (Booking)
    const booking = await prisma.bookings.create({
      data: {
        user_id,
        schedule_id,
        total_price: grossAmount, // Simpan total yang dibayar user
        bookingSeats: {
          create: seatsData.map((seat) => ({ seat_id: seat.id_seat })),
        },
      },
    });

    // 7. Simpan ke Database (Payment)
    const payment = await prisma.payments.create({
      data: {
        user_id,
        movie_id: schedule.movie.id_movie,
        booking_id: booking.id_booking,
        amount: grossAmount, // Total bayar
        payment_type: "midtrans",
        status: "pending",
        order_id,
        transaction_time: new Date(),
        va_number: transaction.va_numbers?.[0]?.va_number || null,
        qr_code_url: transaction.qr_code_url || null,
        gross_amount: grossAmount,
        midtrans_response: transaction, 
      },
    });

    return res.status(200).json({
      message: "Transaksi berhasil dibuat",
      token: transaction.token, 
      redirect_url: transaction.redirect_url,
      details: {
          subtotal: ticketSubtotal,
          tax: taxAmount,
          service_fee: serviceFee,
          total: grossAmount
      }
    });

  } catch (err) {
    console.error("Midtrans Error:", err);
    return res.status(500).json({
      message: "Gagal membuat transaksi",
      error: err.message,
    });
  }
};