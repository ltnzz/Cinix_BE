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
                title: true,
                poster_url: true,
                genre: true,
                duration: true,
                age_rating: true,
                language: true,
                description: true,
                schedules: {
                    // where: {
                    //     show_date: {
                    //         gte: new Date()
                    //     }
                    // },
                    // orderBy: {
                    //     show_time: 'asc'
                    // },
                    select: {
                        id_schedule: true,
                        show_time: true,
                        price: true,
                        theater: {
                            select: {
                                id_theater: true,
                                name: true 
                            }
                        },
                        studio: {
                            select: {
                                id_studio: true,
                                name: true
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
