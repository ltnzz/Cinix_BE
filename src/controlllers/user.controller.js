import prisma from "../config/db.js";

export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const lastPayment = await prisma.payments.findFirst({
            where: { 
                user_id: userId,
                status: { in: ["success", "settlement", "capture"] } 
            },
            orderBy: { transaction_time: "desc" },
            include: { movie: true },
        });

        if (!lastPayment) {
            const randomMovies = await prisma.movies.findMany({ take: 8 });
            
            return res.status(200).json({ 
                success: true,
                based_on: "New User",
                recommendations: randomMovies 
            });
        }

        const watched = await prisma.payments.findMany({
            where: { 
                user_id: userId, 
                status: { in: ["success", "settlement", "capture"] } 
            },
            select: { movie_id: true },
        });

        const watchedMovieIds = watched.map((r) => r.movie_id);

        const mainGenre = lastPayment.movie.genre ? lastPayment.movie.genre.split(',')[0].trim() : "";

        const recommendedMovies = await prisma.movies.findMany({
            where: {
                genre: { contains: mainGenre }, 
                id_movie: { notIn: watchedMovieIds }, 
            },
            take: 20
        });

        console.log(`✅ Ditemukan ${recommendedMovies.length} film dengan genre '${mainGenre}'`);

        const randomized = recommendedMovies
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        if (randomized.length === 0) {
            console.log("⚠️ Tidak ada film genre serupa. Mengambil fallback film acak.");
            const fallbackMovies = await prisma.movies.findMany({
                where: { id_movie: { notIn: watchedMovieIds } },
                take: 5
            });
            return res.json({
                success: true,
                based_on: "Might Also Like (General)",
                recommendations: fallbackMovies
            });
        }

        return res.json({
            success: true,
            based_on: `Karena kamu suka ${lastPayment.movie.title}`,
            recommendations: randomized,
        });

    } catch (err) {
        console.error("❌ Recommendation error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
};