// routes/seatRoutes.js
import express from 'express';
import { getKursiByStudio } from '../controlllers/seatController.js';

const router = express.Router();

// Definisikan endpoint: GET /api/studios/:studioId/seats
// :studioId adalah parameter dinamis yang akan diambil oleh controller
router.get('/studios/:studioId/seats', getKursiByStudio);

export default router;