import prisma from "../config/db.js"

export const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const lastPayment = await prisma.payments.findFirst({
        where: { user_id: userId, status: "success" },
        orderBy: { transaction_time: "desc" },
        include: { movie: true },
        });

        if (!lastPayment) {
        return res.status(404).json({ message: "Belum ada film yang ditonton" });
        }

        const watchedMovieIds = await prisma.payments.findMany({
        where: { user_id: userId },
        select: { movie_id: true }
        }).then(res => res.map(r => r.movie_id));

        const recommendedMovies = await prisma.movies.findMany({
        where: {
            genre: lastPayment.movie.genre,
            NOT: { id_movie: { in: watchedMovieIds } }
        }
        });

        const shuffled = recommendedMovies.sort(() => Math.random() - 0.5).slice(0, 5);

        res.json({ success: true, data: shuffled });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
