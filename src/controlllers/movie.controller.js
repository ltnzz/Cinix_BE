import prisma from "../config/db.js";

export const getAllMovies = async (req, res) => {
    try {
        const movies = await prisma.movies.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });
        res.status(200).json({
            status: true,
            data: movies
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: false,
            message: "Server Error"
        });
    }
}

export const getMoviebyID = async (req, res) => {
    try {
        const { id_movie } = req.params;

        const movie = await prisma.movies.findUnique({
            where: {
                id_movie: id_movie
            },
            select: {
                // Pilih info film yang penting aja
                id_movie: id_movie,
                title: true,
                poster_url: true,
                genre: true,
                duration: true,
                
                // Masuk ke tabel schedules
                schedules: {
                    // Filter: Cuma ambil jadwal masa depan (opsional)
                    // where: {
                    //     show_date: {
                    //         gte: new Date() // gte = greater than or equal (mulai hari ini)
                    //     }
                    // },
                    // Urutkan dari jam paling pagi
                    orderBy: {
                        show_time: 'asc'
                    },
                    // Pilih kolom schedule yang mau ditampilkan
                    select: {
                        id_schedule: true,
                        show_time: true,
                        price: true,
                        
                        // JOIN LAGI: Ambil nama Theater (Bioskop) & Studio
                        theater: {
                            select: {
                                name: true // Misal: "CGV Grand Indonesia"
                            }
                        },
                        studio: {
                            select: {
                                name: true // Misal: "Studio 1"
                            }
                        }
                    }
                }
            }
        })

        if (!movie) {
            return res.status(404).json({message: "Movie not found."})
        }

        return res.status(200).json({ movie })
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Internal Server Error"})
    }
}
