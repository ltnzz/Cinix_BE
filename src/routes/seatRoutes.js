import express from 'express';
import { getKursiByStudio } from '../controlllers/seatController.js';

const router = express.Router();

router.get('/studios/:studioId/seats', getKursiByStudio);

export default router;