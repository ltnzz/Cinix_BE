import express from "express";
import { getAllMovies, getMoviebyID } from "../controlllers/movie.controller.js";

const router = express.Router();

router.get("/movies", getAllMovies);
router.get("/movies/:id_movie", getMoviebyID)

export default router;