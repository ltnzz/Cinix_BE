// controllers/seatController.js
import prisma from "../config/db.js"; 

// Fungsi untuk mengambil semua data kursi di studio tertentu
export const getKursiByStudio = async (req, res) => {
    try {
        // Ambil ID Studio dari parameter URL
        const { studioId } = req.params; 
        
        // Memastikan studioId adalah UUID yang valid (opsional tapi disarankan)
        if (!studioId) {
             return res.status(400).json({ message: "ID Studio tidak valid." });
        }
        
        // Query Prisma: Ambil semua kursi berdasarkan studio_id
        const seats = await prisma.seats.findMany({
            where: {
                studio_id: studioId 
            },
            select: {
                seat_number: true,
                seat_type: true,
                is_available: true,
            },
            // Urutkan berdasarkan nomor kursi untuk representasi grid yang benar
            orderBy: {
                seat_number: 'asc'
            }
        });

        // Cek jika tidak ada kursi yang ditemukan
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