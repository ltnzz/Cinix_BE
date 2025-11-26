import prisma from "../config/db.js";

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;

        const lastPayment = await prisma.payments.findFirst({
        where: { userId, status: "success" },
        orderBy: { transaction_time: "desc" },
        include: { movie: true },
        });

        console.log("lastPayment:", lastPayment);
        if (!lastPayment) {
        return res.status(404).json({ message: "Belum ada film yang ditonton" });
        }

        const watched = await prisma.payments.findMany({
        where: { user_id: userId, status: "success" },
        select: { movie_id: true },
        });

        const watchedMovieIds = watched.map((r) => r.movie_id);

        // Ambil film dengan genre yang sama, tapi belum ditonton
        const recommendedMovies = await prisma.movies.findMany({
        where: {
            genre: lastPayment.movie.genre,
            id_movie: { notIn: watchedMovieIds },
        },
        });

        const randomized = recommendedMovies
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

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
