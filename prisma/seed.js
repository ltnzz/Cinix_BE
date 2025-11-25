import prisma from "../src/config/db.js";

// ID statis agar seeding bisa diulang tanpa error foreign key
const THEATER_ID = "66a01860-2621-4d37-8898-1e434f3c7e7e"; 
const STUDIO_ID = "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"; 

async function main() {
  console.log('Memulai Seeding Database...');

  // --- 1. SEED THEATER (Prasyarat Studio) ---
  const theater = await prisma.theaters.upsert({
    where: { id_theater: THEATER_ID },
    update: {},
    create: {
      id_theater: THEATER_ID,
      city: "Jakarta",
      address: "Jl. Sudirman Kav. 52-53",
    },
  });
  console.log(`✅ Theater Created/Found: ${theater.city}`);

  // --- 2. SEED STUDIO (Prasyarat Seats) ---
  const STUDIO_CAPACITY = 150; 
  const studio = await prisma.studios.upsert({
    where: { id_studio: STUDIO_ID },
    update: {},
    create: {
      id_studio: STUDIO_ID,
      theater_id: THEATER_ID,
      name: "Studio 1 - Gold",
      capacity: STUDIO_CAPACITY,
    },
  });
  console.log(`✅ Studio Created/Found: ${studio.name}`);

  // --- 3. SEED SEATS (Logika untuk mengisi tabel 'seats') ---
  
  // Baris dari atas ke bawah
  const rows = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']; 
  const totalColumns = 15; 
  const seatTypes = {
    'K': 'VIP', 'J': 'VIP', 'I': 'Standard', 'H': 'Standard', 'G': 'Standard', 
    'F': 'Standard', 'E': 'Couple', 'D': 'Couple', 'C': 'Standard', 'B': 'Standard', 'A': 'Standard'
  };

  const allSeats = [];

  for (const rowLetter of rows) {
    for (let colNum = totalColumns; colNum >= 1; colNum--) {
      const seatId = `${rowLetter}${colNum}`;

      allSeats.push({
        studio_id: STUDIO_ID,
        seat_number: seatId,
        seat_type: seatTypes[rowLetter] || 'Standard',
        is_available: true,
      });
    }
  }

  // Masukkan semua kursi ke database
  const seatsCreated = await prisma.seats.createMany({
    data: allSeats,
    skipDuplicates: true,
  });

  console.log(`✅ Berhasil membuat ${seatsCreated.count} kursi dengan penamaan grid.`);
  
  // ------------------------------------------------------------------
  // --- INI ADALAH KODE ASLI FILM DARI ANDA (menggunakan upsert) ---
  // ------------------------------------------------------------------

  await prisma.movies.upsert({
      where: { title: "Interstellar" },
      update: {},
      create: {
        title: "Interstellar",
        description: "A sci-fi movie about space exploration.",
        genre: "Sci-Fi",
        language: "English",
        age_rating: "PG-13",
        duration: 169,
        rating: 8.6,
        poster_url: "https://res.cloudinary.com/demo/image/upload/interstellar.jpg",
        trailer_url: "https://youtube.com/watch?v=zSWdZVtXT7E",
        release_date: new Date("2014-11-07")
      },
  });

  await prisma.movies.upsert({
      where: { title: "Oppenheimer" },
      update: {},
      create: {
        title: "Oppenheimer",
        description: "Biography of J. Robert Oppenheimer.",
        genre: "Drama",
        language: "English",
        age_rating: "R",
        duration: 180,
        rating: 8.4,
        poster_url: "https://res.cloudinary.com/demo/image/upload/oppenheimer.jpg",
        trailer_url: "https://youtube.com/watch?v=bK6ldnjE3Y0",
        release_date: new Date("2023-07-21")
      },
  });
  
  // ------------------------------------------------------------------

  console.log("Seeding selesai.");
}

main().catch((e) => {
    console.error('--- ERROR SEEDING ---');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Menghapus koneksi database setelah semua operasi selesai
    if (prisma && prisma.$disconnect) { 
        await prisma.$disconnect();
    }
  });