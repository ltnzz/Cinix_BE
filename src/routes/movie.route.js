import express from "express";
import { getAllMovies, getMoviebyID } from "../controlllers/movie.controller.js";

const router = express.Router();

router.get("/movies", getAllMovies);
router.get("/movies/:id_movie", getMoviebyID)
router.get("/:id_movie/booking", getMoviebyID)

export default router;