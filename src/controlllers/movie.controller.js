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