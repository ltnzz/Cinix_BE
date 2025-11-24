import express from 'express';
import { addMovie, updateMovie, deleteMovie } from '../controlllers/admin.controller.js';
import uploadValidator from '../middlewares/validation/upload.js';
import validateMovie from '../middlewares/validation/movie.validation.js';

const router = express.Router();

router.post('/admin/addmovie', uploadValidator({ fieldName: "poster" }), validateMovie, addMovie);
router.put('/admin/updatemovie/:id_movie', uploadValidator({ fieldName: "poster" }), validateMovie, updateMovie);
router.delete('/admin/deletemovie/:id_movie', deleteMovie);

export default router;
