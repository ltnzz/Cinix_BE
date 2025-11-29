import prisma from "../config/db.js";

export const getTheatersByFilm = async (req, res) => {
    const { filmId } = req.params;

    try {
        const theaters = await prisma.theaters.findMany({
        where: {
            schedules: { some: { movie_id: filmId } }
        },
        include: {
            studios: {
            include: {
                schedules: {
                where: { movie_id: filmId },
                select: {
                    id_schedule: true,
                    show_date: true,
                    show_time: true,
                    price: true
                }
                }
            }
            }
        }
        });

        return res.status(200).json(theaters);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Terjadi kesalahan server", error: err.message });
    }
};
