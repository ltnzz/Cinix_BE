import prisma from "../config/db.js";

export const getMovies = async (req, res) => {
  try {
    const movies = await prisma.movies.findMany({
      select: {
        id_movie: true,
        title: true,
        genre: true,
        rating: true,
        poster_url: true,
      },
    });

    res.json({
      message: "Daftar film berhasil diambil",
      data: movies,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
