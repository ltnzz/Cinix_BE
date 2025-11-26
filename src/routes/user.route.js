import express from 'express';
import { getRecommendations } from '../controlllers/user.controller.js';
import { verifyUser } from '../middlewares/validation/verify.user.js';

const router = express.Router();

router.get('/recommendations', verifyUser, getRecommendations);

export default router;