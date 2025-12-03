import prisma from "../config/db.js";

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        const lastPayment = await prisma.payments.findFirst({
            where: { 
                user_id: userId,
                status: "success" 
            },
            orderBy: { transaction_time: "desc" },
            include: { movie: true },
        });

        
        if (!lastPayment) {
            const randomMovies = await prisma.movies.findMany({ take: 5 });
            
            return res.status(200).json({ 
                success: true,
                message: "Rekomendasi film populer (New User)",
                recommendations: randomMovies 
            });
        }

        const watched = await prisma.payments.findMany({
            where: { 
                user_id: userId, 
                status: "success" 
            },
            select: { movie_id: true },
        });

        const watchedMovieIds = watched.map((r) => r.movie_id);

        const recommendedMovies = await prisma.movies.findMany({
            where: {
                genre: lastPayment.movie.genre,
                id_movie: { notIn: watchedMovieIds },
            },
            take: 20
        });

        const randomized = recommendedMovies
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        if (randomized.length === 0) {
            const fallbackMovies = await prisma.movies.findMany({
                where: { id_movie: { notIn: watchedMovieIds } },
                take: 5
            });
            return res.json({
                success: true,
                based_on: "Might Also Like",
                recommendations: fallbackMovies
            });
        }

        return res.json({
            success: true,
            based_on: lastPayment.movie.title,
            recommendations: randomized,
        });

    } catch (err) {
        console.error("Recommendation error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};