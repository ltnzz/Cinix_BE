import prisma from "../src/config/db.js";
import bcrypt from "bcrypt";

const createDate = (days, hours) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(hours, 0, 0, 0);
    return d;
};

async function main() {
    console.log("🌱 Seeding started...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.admins.create({
        data: {
            name: "Super Admin",
            email: "admin@cinix.com",
            password: adminPassword,
        },
    });

    const userPassword = await bcrypt.hash("user123", 10);
    const usersData = [
        { name: "John Doe", email: "john@gmail.com", password: userPassword, phone: "081234567890" },
        { name: "Jane Smith", email: "jane@gmail.com", password: userPassword, phone: "081234567891" },
        { name: "Alice Brown", email: "alice@gmail.com", password: userPassword, phone: "081234567892" },
        { name: "Bob Green", email: "bob@gmail.com", password: userPassword, phone: "081234567893" },
    ];
    
    await prisma.users.createMany({ data: usersData });
    const userList = await prisma.users.findMany();

    const theatersData = [
        { name: "AEON TANJUNG BARAT", city: "Jakarta", address: "Jl. Thamrin No.1", latitude: -6.193, longitude: 106.822 },
        { name: "AEON TANJUNG BANDUNG", city: "Bandung", address: "Jl. Braga No.21", latitude: -6.914, longitude: 107.609 },
        { name: "AEON TANJUNG SURABAYA", city: "Surabaya", address: "Jl. Tunjungan No.5", latitude: -7.257, longitude: 112.752 },
    ];

    const theaterList = [];
    for (const item of theatersData) {
        const theater = await prisma.theaters.create({ data: item });
        theaterList.push(theater);

        const studioA = await prisma.studios.create({
            data: { name: "Studio A - Regular", theater_id: theater.id_theater, capacity: 132, layout_json: {} },
        });

        const studioB = await prisma.studios.create({
            data: { name: "Studio B - Premiere", theater_id: theater.id_theater, capacity: 60, layout_json: {} }, 
        });

        const studios = [studioA, studioB];

        const rows = "ABCDEFGHIJK".split("");
        
        for (const studio of studios) {
            const seatBatch = [];
            const seatType = studio.name.includes("Premiere") ? "Premiere" : "Regular";

            for (const row of rows) {
                if (seatType === "Premiere" && rows.indexOf(row) >= 5) continue; 
                
                for (let number = 1; number <= 12; number++) {
                    seatBatch.push({
                        studio_id: studio.id_studio,
                        seat_number: `${row}${number}`,
                        seat_type: seatType,
                        is_available: true,
                    });
                }
            }
            await prisma.seats.createMany({ data: seatBatch });
        }
    }

    const moviesData = [
        { title: "Avengers: Endgame", genre: "Action | Sci-Fi", duration: 181, rating: 8.4, poster_url: "https://placehold.co/300x450/4C4C4C/FFFFFF?text=Avengers" },
        { title: "The Lion King", genre: "Animation | Drama", duration: 118, rating: 7.0, poster_url: "https://placehold.co/300x450/B8860B/FFFFFF?text=Lion+King" },
        { title: "Inception", genre: "Sci-Fi | Thriller", duration: 148, rating: 8.8, poster_url: "https://placehold.co/300x450/1C1C1C/FFFFFF?text=Inception" },
        { title: "Interstellar", genre: "Adventure | Sci-Fi", duration: 169, rating: 8.6, poster_url: "https://placehold.co/300x450/4682B4/FFFFFF?text=Interstellar" },
        { title: "Parasite", genre: "Drama | Thriller", duration: 132, rating: 8.5, poster_url: "https://placehold.co/300x450/3CB371/FFFFFF?text=Parasite" },
        { title: "Toy Story 4", genre: "Animation | Comedy", duration: 100, rating: 7.7, poster_url: "https://placehold.co/300x450/FFA07A/000000?text=Toy+Story+4" },
        { title: "Joker", genre: "Crime | Drama", duration: 122, rating: 8.4, poster_url: "https://placehold.co/300x450/8B0000/FFFFFF?text=Joker" },
    ];

    await prisma.movies.createMany({ data: moviesData });
    const movies = await prisma.movies.findMany();

    const schedules = [];
    const showTimes = [8, 11, 14, 17, 20, 23]; 
    const movieCount = movies.length;
    let scheduleCounter = 0;

    for (let day = 0; day < 3; day++) { 
        for (const theater of theaterList) {
            const studiosInTheater = await prisma.studios.findMany({
                where: { theater_id: theater.id_theater },
            });

            for (const studio of studiosInTheater) {
                const isPremiere = studio.name.includes("Premiere");
                const basePrice = isPremiere ? 85000 : 50000; 

                for (let i = 0; i < showTimes.length; i++) {
                    if (scheduleCounter % movieCount < 3 || Math.random() > 0.5) { 
                        const movie = movies[scheduleCounter % movieCount];
                        const showTimeDate = createDate(day, showTimes[i]);
                        const schedulePrice = basePrice + (isPremiere ? 0 : 5000 * Math.floor(Math.random() * 3)); 

                        const schedule = await prisma.schedules.create({
                            data: {
                                movie_id: movie.id_movie,
                                theater_id: theater.id_theater,
                                studio_id: studio.id_studio,
                                admin_id: admin.id_admin,
                                show_date: showTimeDate,
                                show_time: showTimeDate, 
                                price: schedulePrice,
                            },
                        });
                        schedules.push(schedule);
                        scheduleCounter++;
                    }
                }
            }
        }
    }

    const allSeats = await prisma.seats.findMany();

    for (const user of userList) {
        const schedule = schedules[schedules.length - 1 - userList.indexOf(user)]; 

        if (schedule) {
            const seatsInStudio = allSeats.filter(s => s.studio_id === schedule.studio_id);
            const selectedSeats = seatsInStudio.sort(() => 0.5 - Math.random()).slice(0, 3); // 3 kursi

            const booking = await prisma.bookings.create({
                data: {
                    user_id: user.id_user,
                    schedule_id: schedule.id_schedule,
                    total_price: schedule.price * selectedSeats.length,
                },
            });

            for (const seat of selectedSeats) {
                await prisma.booking_seats.create({
                    data: {
                        booking_id: booking.id_booking,
                        seat_id: seat.id_seat,
                    },
                });
            }
        }
    }

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
                order_id: `PAY-${Date.now()}-${booking.id_booking}`,
                gross_amount: booking.total_price,
            },
        });
    }

    console.log("✅ Seeding complete!");
    console.log(`- Total Movies: ${movies.length}`);
    console.log(`- Total Schedules created for 3 days: ${schedules.length}`);
    console.log(`- Total Users: ${userList.length}`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });