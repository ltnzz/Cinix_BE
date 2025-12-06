import prisma from "../config/db.js";

export const searchMovies = async (req, res) => {
try {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            status: false,
            message: "Query parameter 'query' is required",
            data: null
        });
    }

    const movies = await prisma.movies.findMany({
        where: {
            title: {
            contains: query, 
            mode: 'insensitive' 
            },
        },
        select: {
            id_movie: true,
            title: true,
            poster_url: true,
            age_rating: true,
            duration: true,
            description: true
        },
        take: 10,
        orderBy: {
            release_date: 'desc' 
        }
    });

    if (movies.length === 0) {
        return res.status(200).json({
            status: true,
            message: "No movies found matching your query",
            data: []
        });
    }

    return res.status(200).json({
        status: true,
        message: "Movies found",
        data: movies
    });

} catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error: error.message
        });
    }
};

