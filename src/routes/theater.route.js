import express from "express";
import { getTheatersByFilm } from "../controlllers/theater.controller.js";
import { validateFilmId } from "../middlewares/validation/theater.validation.js";

const router = express.Router();

router.get("/films/:filmId/theaters", validateFilmId, getTheatersByFilm);

export default router;
