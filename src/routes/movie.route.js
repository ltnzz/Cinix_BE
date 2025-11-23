import express from "express";
import { getAllMovies } from "../controlllers/movie.controller.js";

const router = express.Router();

router.get("/movies", getAllMovies);

export default router;