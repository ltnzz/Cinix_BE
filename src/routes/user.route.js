import express from 'express';
import { getRecommendations } from '../controlllers/user.controller.js';
import { authenticate } from '../middlewares/validation/user.auth.js';

const router = express.Router();

router.get('/recommendations', authenticate, getRecommendations);

export default router;