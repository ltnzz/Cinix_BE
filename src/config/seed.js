import prisma from "../config/db.js";

async function main() {
    await prisma.movies.create({
        data: {
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

    await prisma.movies.create({
        data: {
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

    console.log("Seeding selesai.");
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
