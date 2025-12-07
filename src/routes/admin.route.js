import express from 'express';
import { 
    adminLogin, 
    adminLogout, 
    
    addMovie, 
    updateMovie, 
    deleteMovie,

    getTheaters,
    getTheaterDetail,
    createTheater,
    updateTheater,
    deleteTheater,

    getStudios,
    getStudioDetail,
    createStudio,
    updateStudio,

    getSeatsByStudio,
    generateSeatsBulk,

    getSchedules,
    createSchedule,
    deleteSchedule
} from '../controlllers/admin.controller.js';
import uploadValidator from '../middlewares/validation/upload.js';
import validateMovie from '../middlewares/validation/movie.validation.js';
import { adminAuth } from '../middlewares/validation/admin.auth.js';

const router = express.Router();

router.post('/admin/login', adminLogin);
router.post('/admin/logout', adminAuth, adminLogout);

router.post('/admin/addmovie', adminAuth, uploadValidator({ fieldName: "poster" }), validateMovie, addMovie);
router.put('/admin/updatemovie/:id_movie', adminAuth, uploadValidator({ fieldName: "poster" }), validateMovie, updateMovie);
router.delete('/admin/deletemovie/:id_movie', deleteMovie);

router.get('/theaters', adminAuth, getTheaters);
router.get('/theaters/:id_theater', adminAuth, getTheaterDetail);
router.post('/theaters', adminAuth, createTheater);
router.put('/theaters/:id_theater', adminAuth, updateTheater);
router.delete('/theaters/:id_theater', adminAuth, deleteTheater);

router.get('/studios', adminAuth, getStudios);
router.get('/studios/:id_studio', adminAuth, getStudioDetail);
router.post('/studios', adminAuth, createStudio);
router.put('/studios/:id_studio', adminAuth, updateStudio);

router.get('/studios/:id_studio/seats', adminAuth, getSeatsByStudio);
router.post('/studios/:id_studio/seats/generate', adminAuth, generateSeatsBulk);

router.get('/schedules', adminAuth, getSchedules);
router.post('/schedules', adminAuth, createSchedule);
router.delete('/schedules/:id_schedule', adminAuth, deleteSchedule);

export default router;
