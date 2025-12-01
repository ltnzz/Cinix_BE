// prisma/seed.js
import prisma from "../src/config/db.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding started...");

  // ==============================
  // 1. ADMINS
  // ==============================
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admins.create({
    data: {
      name: "Super Admin",
      email: "admin@cinix.com",
      password: adminPassword,
    },
  });

  // ==============================
  // 2. USERS
  // ==============================
  const userPassword = await bcrypt.hash("user123", 10);
  const users = await prisma.users.createMany({
    data: [
      {
        name: "John Doe",
        email: "john@gmail.com",
        password: userPassword,
        phone: "081234567890",
      },
      {
        name: "Jane Smith",
        email: "jane@gmail.com",
        password: userPassword,
        phone: "081234567891",
      },
    ],
  });

  const userList = await prisma.users.findMany();

  // ==============================
  // 3. THEATERS + STUDIOS + SEATS
  // ==============================
  const theatersData = [
    {
      name: "AEON TANJUNG BARAT",
      city: "Jakarta",
      address: "Jl. Thamrin No.1",
      latitude: -6.193,
      longitude: 106.822,
    },
    {
      name: "AEON TANJUNG BANDUNG",
      city: "Bandung",
      address: "Jl. Braga No.21",
      latitude: -6.914,
      longitude: 107.609,
    },
    {
      name: "AEON TANJUNG SURABAYA",
      city: "Surabaya",
      address: "Jl. Tunjungan No.5",
      latitude: -7.257,
      longitude: 112.752,
    },
  ];

  const theaterList = [];
  for (const item of theatersData) {
    const theater = await prisma.theaters.create({ data: item });
    theaterList.push(theater);

    // Studios
    const studioA = await prisma.studios.create({
      data: {
        name: "Studio A",
        theater_id: theater.id_theater,
        capacity: 132,
        layout_json: {},
      },
    });

    const studioB = await prisma.studios.create({
      data: {
        name: "Studio B",
        theater_id: theater.id_theater,
        capacity: 132,
        layout_json: {},
      },
    });

    const studios = [studioA, studioB];

    // Seats A–K (11 rows) * 12
    const rows = "ABCDEFGHIJK".split("");

    for (const studio of studios) {
      const seatBatch = [];

      for (const row of rows) {
        for (let number = 1; number <= 12; number++) {
          seatBatch.push({
            studio_id: studio.id_studio,
            seat_number: `${row}${number}`,
            seat_type: "regular",
            is_available: true,
          });
        }
      }

      await prisma.seats.createMany({ data: seatBatch });
    }
  }

  // ==============================
  // 4. MOVIES
  // ==============================
  const movieList = await prisma.movies.createMany({
    data: [
      {
        title: "Avengers: Endgame",
        genre: "Action",
        duration: 181,
        rating: 8.4,
      },
      {
        title: "The Lion King",
        genre: "Animation",
        duration: 118,
        rating: 7.0,
      },
    ],
  });

  const movies = await prisma.movies.findMany();

  // ==============================
  // 5. SCHEDULES
  // ==============================
  const schedules = [];

  for (const movie of movies) {
    for (const theater of theaterList) {
      const studiosInTheater = await prisma.studios.findMany({
        where: { theater_id: theater.id_theater },
      });

      for (const studio of studiosInTheater) {
        const schedule = await prisma.schedules.create({
          data: {
            movie_id: movie.id_movie,
            theater_id: theater.id_theater,
            studio_id: studio.id_studio,
            admin_id: admin.id_admin,
            show_date: new Date(),
            show_time: new Date(),
            price: 50000,
          },
        });

        schedules.push(schedule);
      }
    }
  }

  // ==============================
  // 6. BOOKINGS + BOOKING_SEATS
  // ==============================
  for (const user of userList) {
    const schedule = schedules[Math.floor(Math.random() * schedules.length)];

    const booking = await prisma.bookings.create({
      data: {
        user_id: user.id_user,
        schedule_id: schedule.id_schedule,
        total_price: schedule.price * 2,
      },
    });

    const seatsInStudio = await prisma.seats.findMany({
      where: { studio_id: schedule.studio_id },
    });

    const selectedSeats = seatsInStudio.sort(() => 0.5 - Math.random()).slice(0, 2);

    for (const seat of selectedSeats) {
      await prisma.booking_seats.create({
        data: {
          booking_id: booking.id_booking,
          seat_id: seat.id_seat,
        },
      });
    }
  }

  // ==============================
  // 7. PAYMENTS
  // ==============================
  const allBookings = await prisma.bookings.findMany();

  for (const booking of allBookings) {
    const schedule = await prisma.schedules.findUnique({
      where: { id_schedule: booking.schedule_id },
    });

    await prisma.payments.create({
      data: {
        user_id: booking.user_id,
        movie_id: schedule.movie_id,
        booking_id: booking.id_booking,
        amount: booking.total_price,
        payment_type: "bank_transfer",
        status: "success",
      },
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
