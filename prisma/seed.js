// prisma/seed.js
import prisma from "../src/config/db.js";
import bcrypt from "bcrypt";

async function main() {
  // 1. Admins
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admins.create({
    data: {
      name: "Super Admin",
      email: "admin@cinix.com",
      password: passwordHash,
    },
  });

  // 2. Users
  const userPassword = await bcrypt.hash("user123", 10);
  const usersData = [
    { name: "John Doe", email: "john@gmail.com", password: userPassword, phone: "081234567890" },
    { name: "Jane Smith", email: "jane@gmail.com", password: userPassword, phone: "081234567891" },
  ];
  const users = [];
  for (const u of usersData) {
    users.push(await prisma.users.create({ data: u }));
  }

  // 3. Theaters & Studios & Seats
  const theatersData = [
    { city: "Jakarta", address: "Jl. Thamrin No.1", latitude: -6.193, longitude: 106.822 },
    { city: "Bandung", address: "Jl. Braga No.21", latitude: -6.914, longitude: 107.609 },
    { city: "Surabaya", address: "Jl. Tunjungan No.5", latitude: -7.257, longitude: 112.752 },
  ];

  const theaters = [];
  for (const theater of theatersData) {
    const t = await prisma.theaters.create({ data: theater });
    theaters.push(t);

    const studioNames = ["Studio A", "Studio B"];
    for (const name of studioNames) {
      const s = await prisma.studios.create({
        data: {
          theater_id: t.id_theater,
          name,
          capacity: 132,
          layout_json: {},
        },
      });

      // Seats A-K, 1-12
      const rows = "ABCDEFGHIJK".split("");
      const seatsToCreate = [];
      for (const row of rows) {
        for (let n = 1; n <= 12; n++) {
          seatsToCreate.push({
            studio_id: s.id_studio,
            seat_number: `${row}${n}`,
            seat_type: "regular",
            is_available: true,
          });
        }
      }
      await prisma.seats.createMany({ data: seatsToCreate });
    }
  }

  // 4. Movies
  const moviesData = [
    { title: "Avengers: Endgame", genre: "Action", duration: 181, rating: 8.4 },
    { title: "The Lion King", genre: "Animation", duration: 118, rating: 7.0 },
  ];
  const movies = [];
  for (const m of moviesData) {
    movies.push(await prisma.movies.create({ data: m }));
  }

  // 5. Schedules (random for each movie & studio)
  const schedules = [];
  for (const movie of movies) {
    for (const theater of theaters) {
      const studios = await prisma.studios.findMany({ where: { theater_id: theater.id_theater } });
      for (const studio of studios) {
        schedules.push(
          await prisma.schedules.create({
            data: {
              movie_id: movie.id_movie,
              theater_id: theater.id_theater,
              studio_id: studio.id_studio,
              admin_id: admin.id_admin,
              show_date: new Date(),
              show_time: new Date(),
              price: 50000,
            },
          })
        );
      }
    }
  }

  // 6. Bookings & Booking Seats
  for (const user of users) {
    const schedule = schedules[Math.floor(Math.random() * schedules.length)];
    const booking = await prisma.bookings.create({
      data: {
        user_id: user.id_user,
        schedule_id: schedule.id_schedule,
        total_price: schedule.price * 2,
      },
    });

    // ambil 2 seat acak dari studio schedule
    const seatsInStudio = await prisma.seats.findMany({ where: { studio_id: schedule.studio_id } });
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

  // 7. Payments (dummy)
  const allBookings = await prisma.bookings.findMany();
  for (const booking of allBookings) {
    const user = users[Math.floor(Math.random() * users.length)];
    const schedule = await prisma.schedules.findUnique({ where: { id_schedule: booking.schedule_id } });
    await prisma.payments.create({
      data: {
        user_id: user.id_user,
        movie_id: schedule.movie_id,
        booking_id: booking.id_booking,
        amount: booking.total_price,
        payment_type: "bank_transfer",
        status: "success",
      },
    });
  }

  console.log("✅ Seed selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
