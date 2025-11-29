import prisma from "../../config/db.js";

export const validateFilmId = async (req, res, next) => {
    const { filmId } = req.params;
    if (!filmId) return res.status(400).json({ message: "Film ID dibutuhkan" });

    try {
        const movieExists = await prisma.movies.findUnique({ where: { id_movie: filmId } });
        if (!movieExists) return res.status(404).json({ message: "Film tidak ditemukan" });
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};
