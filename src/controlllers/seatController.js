import prisma from "../config/db.js"; 

export const getKursiByStudio = async (req, res) => {
    try {
        const { studioId } = req.params; 
        
        if (!studioId) {
            return res.status(400).json({ message: "ID Studio tidak valid." });
        }
        
        const seats = await prisma.seats.findMany({
            where: {
                studio_id: studioId 
            },
            select: {
                seat_number: true,
                seat_type: true,
                is_available: true,
            },
            orderBy: {
                seat_number: 'asc'
            }
        });

        if (seats.length === 0) {
            return res.status(404).json({ message: "Kursi tidak ditemukan untuk Studio ini." });
        }

        return res.status(200).json({
            message: "Data kursi berhasil diambil",
            data: seats,
        });

    } catch (error) {
        console.error("Error saat mengambil kursi:", error);
        return res.status(500).json({
            message: "Terjadi kesalahan server",
            error: error.message
        });
    }
};