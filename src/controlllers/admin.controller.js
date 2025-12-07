import prisma from "../config/db.js";
import cloudinary from "../service/cloudinary.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await prisma.admins.findUnique({ where: { email } });
        if (!admin) {
            return res.status(401).json({ message: "Email tidak ditemukan." });
        }

        const match = await bcrypt.compare(password, admin.password);
        if (!match) {
            return res.status(401).json({ message: "Password salah." });
        }

        const token = jsonwebtoken.sign({
            id: admin.id_admin,
            name: admin.name,
            email: admin.email,
            isAdmin: true            
        }, process.env.jwt_secret, { expiresIn: "6h"})

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 6 * 60 * 60 * 1000,
        })

        return res.json({ 
            message: `Halo ${admin.name}. Selamat datang di dashboard admin.`,
            token,
            data: {
                name: admin.name,
                email: admin.email,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

export const adminLogout = (req, res) => {
    try {
        res.clearCookie("token");
        res.json({ message: "Logout Berhasil!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

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
        console.log("Upload sukses:", posterResult.secure_url);
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

export const getTheaters = async (req, res) => {
    try {
        const theaters = await prisma.theaters.findMany({
            orderBy: { created_at: 'desc' },
            include: {
                _count: {
                    select: { studios: true }
                }
            }
        });
        res.json({ status: 'success', data: theaters });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getTheaterDetail = async (req, res) => {
    try {
        const { id_theater } = req.params;
        const theater = await prisma.theaters.findUnique({
            where: { id_theater },
            include: { studios: true }
        });
        if (!theater) return res.status(404).json({ message: "Theater not found" });
        res.json({ status: 'success', data: theater });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const createTheater = async (req, res) => {
    try {
        const { name, city, address, latitude, longitude } = req.body;

        const existing = await prisma.theaters.findUnique({ where: { name } });
        if (existing) return res.status(400).json({ message: "Nama bioskop sudah ada" });

        const theater = await prisma.theaters.create({
            data: {
                name,
                city,
                address,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            }
        });
        res.status(201).json({ message: "Bioskop berhasil dibuat", data: theater });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateTheater = async (req, res) => {
    try {
        const { id_theater } = req.params;
        const { name, city, address, latitude, longitude } = req.body;

        const theater = await prisma.theaters.update({
            where: { id_theater },
            data: {
                name,
                city,
                address,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined
            }
        });
        res.json({ message: "Bioskop berhasil diupdate", data: theater });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteTheater = async (req, res) => {
    try {
        const { id_theater } = req.params;

        const studioCount = await prisma.studios.count({ where: { theater_id: id_theater } });
        if (studioCount > 0) {
            return res.status(400).json({ message: "Tidak bisa menghapus bioskop yang masih memiliki studio aktif." });
        }

        await prisma.theaters.delete({ where: { id_theater } });
        res.json({ message: "Bioskop berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getStudios = async (req, res) => {
    try {
        const { theater_id } = req.query;
        const whereClause = theater_id ? { theater_id } : {};

        const studios = await prisma.studios.findMany({
            where: whereClause,
            include: { theater: { select: { name: true } } }
        });
        res.json({ status: 'success', data: studios });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getStudioDetail = async (req, res) => {
    try {
        const { id_studio } = req.params;
        const studio = await prisma.studios.findUnique({
            where: { id_studio },
            include: { seats: true, theater: true }
        });
        if (!studio) return res.status(404).json({ message: "Studio not found" });
        res.json({ status: 'success', data: studio });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const createStudio = async (req, res) => {
    try {
        const { theater_id, name, capacity, layout_json } = req.body;

        const existing = await prisma.studios.findFirst({
            where: { theater_id, name }
        });
        if (existing) return res.status(400).json({ message: `Studio ${name} sudah ada di bioskop ini` });

        const studio = await prisma.studios.create({
            data: {
                theater_id,
                name,
                capacity: parseInt(capacity),
                layout_json
            }
        });
        res.status(201).json({ message: "Studio berhasil dibuat", data: studio });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateStudio = async (req, res) => {
    try {
        const { id_studio } = req.params;
        const { name, capacity, layout_json } = req.body;

        const studio = await prisma.studios.update({
            where: { id_studio },
            data: {
                name,
                capacity: capacity ? parseInt(capacity) : undefined,
                layout_json
            }
        });
        res.json({ message: "Studio berhasil diupdate", data: studio });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getSeatsByStudio = async (req, res) => {
    try {
        const { id_studio } = req.params;
        const seats = await prisma.seats.findMany({
            where: { studio_id: id_studio },
            orderBy: { seat_number: 'asc' }
        });
        res.json({ status: 'success', data: seats });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const generateSeatsBulk = async (req, res) => {
    try {
        const { id_studio } = req.params;
        const { rows, cols } = req.body;

        if (!rows || !cols) return res.status(400).json({ message: "Rows dan Cols wajib diisi" });

        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const seatData = [];

        for (let r = 0; r < rows; r++) {
            for (let c = 1; c <= cols; c++) {
                seatData.push({
                    studio_id: id_studio,
                    seat_number: `${alphabet[r]}${c}`,
                    seat_type: 'Regular',
                    is_available: true
                });
            }
        }

        const result = await prisma.seats.createMany({
            data: seatData,
            skipDuplicates: true
        });

        const totalSeats = await prisma.seats.count({ where: { studio_id: id_studio } });
        await prisma.studios.update({
            where: { id_studio },
            data: { capacity: totalSeats }
        });

        res.json({ message: `Berhasil generate ${result.count} kursi` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const getSchedules = async (req, res) => {
    try {
        const schedules = await prisma.schedules.findMany({
            include: {
                movie: { select: { title: true, duration: true } },
                studio: { select: { name: true } },
                theater: { select: { name: true, city: true } }
            },
            orderBy: { show_date: 'desc' }
        });
        res.json({ status: 'success', data: schedules });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const createSchedule = async (req, res) => {
    try {
        const { movie_id, studio_id, theater_id, show_date, show_time, price } = req.body;

        const validStudio = await prisma.studios.findFirst({
            where: { id_studio: studio_id, theater_id }
        });
        if (!validStudio) return res.status(400).json({ message: "Studio tidak berada di Theater ini" });

        const movie = await prisma.movies.findUnique({ where: { id_movie: movie_id } });
        if (!movie) return res.status(404).json({ message: "Movie not found" });

        const datePart = new Date(show_date).toISOString().split('T')[0]; 
        const startDateTime = new Date(`${datePart}T${show_time}:00.000Z`);
        
        const durationMs = (movie.duration || 120) * 60000;
        const endDateTime = new Date(startDateTime.getTime() + durationMs);

        const conflicts = await prisma.schedules.findMany({
            where: {
                studio_id,
                show_date: { equals: new Date(show_date) }
            },
            include: { movie: true }
        });

        for (let schedule of conflicts) {
            const sDate = schedule.show_date.toISOString().split('T')[0];
            const sTime = schedule.show_time.toISOString().split('T')[1];
            
            const existStart = new Date(`${sDate}T${sTime}`);
            const existDuration = (schedule.movie.duration || 120) * 60000;
            const existEnd = new Date(existStart.getTime() + existDuration);

            if (startDateTime < existEnd && endDateTime > existStart) {
                return res.status(409).json({ 
                    message: `Jadwal bentrok dengan film ${schedule.movie.title} di jam ${sTime}` 
                });
            }
        }

        const newSchedule = await prisma.schedules.create({
            data: {
                movie_id,
                studio_id,
                theater_id,
                show_date: new Date(show_date),
                show_time: startDateTime,
                price: parseFloat(price),
            }
        });

        res.status(201).json({ message: "Jadwal berhasil dibuat", data: newSchedule });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const { id_schedule } = req.params;
        await prisma.schedules.delete({ where: { id_schedule } });
        res.json({ message: "Jadwal berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};