// src/controllers/admin.controller.js
import id from "dayjs/locale/id.js";
import prisma from "../config/db.js";
import cloudinary from "../service/cloudinary.js";

export const addMovie = async (req, res) => {
    try {
        const { title, description, genre, language, age_rating, duration, rating, trailer_url, release_date } = req.body;

        if (!req.file) {
        return res.status(400).json({ message: "Poster wajib diupload" });
        }

        const posterResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "movies" },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
        });

        const movie = await prisma.movies.create({
        data: {
            title,
            description,
            genre,
            language,
            age_rating,
            duration: duration ? parseInt(duration) : null,
            rating: rating ? parseFloat(rating) : null,
            poster_url: posterResult.secure_url,
            trailer_url,
            release_date: release_date ? new Date(release_date) : null,
        },
        });

        res.status(201).json(movie);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateMovie = async (req, res) => {
    try {
        const { id_movie } = req.params;
        const { title, description, genre, language, age_rating, duration, rating, trailer_url, release_date } = req.body;

        const oldMovie = await prisma.movies.findUnique({ where: { id_movie } });
        if (!oldMovie) return res.status(404).json({ message: "Movie not found" });

        let data = {
        title,
        description,
        genre,
        language,
        age_rating,
        duration: duration ? parseInt(duration) : null,
        rating: rating ? parseFloat(rating) : null,
        trailer_url,
        release_date: release_date ? new Date(release_date) : null,
        };

        if (req.file) {
        const posterResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
            { folder: "movies" },
            (error, result) => (error ? reject(error) : resolve(result))
            );
            stream.end(req.file.buffer);
        });

        if (oldMovie.poster_url) {
            const segments = oldMovie.poster_url.split("/");
            const publicIdWithExt = segments.slice(-2).join("/").replace(/\.[^/.]+$/, "");
            await cloudinary.uploader.destroy(publicIdWithExt);
        }

        data.poster_url = posterResult.secure_url;
        }

        const movie = await prisma.movies.update({
        where: { id_movie },
        data,
        });

        res.json(movie);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteMovie = async (req, res) => {
    try {
        const { id_movie } = req.params;

        const movie = await prisma.movies.findUnique({ where: { id_movie } });
        if (!movie) return res.status(404).json({ message: "Movie not found" });

        if (movie.poster_url) {
            const segments = movie.poster_url.split("/");
            const publicIdWithExt = segments.slice(-2).join("/").replace(/\.[^/.]+$/, "");
            await cloudinary.uploader.destroy(publicIdWithExt);
        }

        await prisma.movies.delete({ where: { id_movie } });

        res.json({ message: `Movie "${movie.title}" berhasil dihapus` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};
