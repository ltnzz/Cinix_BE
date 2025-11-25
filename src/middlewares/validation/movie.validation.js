import prisma from "../../config/db.js";

const validateMovie = async (req, res, next) => {
    try {
        const { title, description, genre, language, age_rating, duration, rating, release_date } = req.body;
        const id_movie = req.params.id_movie;

        if (!title || !description || !genre || !language || !age_rating || !duration || !rating || !release_date) {
            return res.status(400).json({ message: "Semua field wajib diisi" });
        }

        const durationNum = parseInt(duration);
        const ratingNum = parseFloat(rating);
        const dateObj = new Date(release_date);

        if (isNaN(durationNum) || durationNum <= 0) {
            return res.status(400).json({ message: "Duration harus angka positif" });
        }
        if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 10) {
            return res.status(400).json({ message: "Rating harus antara 0-10" });
        }
        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ message: "Release date tidak valid" });
        }

        
        const existingMovie = await prisma.movies.findFirst({
        where: {
            title,
            NOT: id_movie ? { id_movie } : undefined,
        },
        });

        if (existingMovie) {
        return res.status(400).json({ message: "Title sudah digunakan" });
        }

        req.body.duration = durationNum;
        req.body.rating = ratingNum;
        req.body.release_date = dateObj;

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export default validateMovie;
