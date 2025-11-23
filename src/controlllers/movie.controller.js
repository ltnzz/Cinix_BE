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