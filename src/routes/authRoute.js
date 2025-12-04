import express from 'express';
import { login, regist, logout, forgotPassword } from '../controlllers/auth.controller.js';
import { registerValidate } from '../middlewares/validation/create.user.validation.js';
import { userValidate } from '../middlewares/validation/user.validation.js';
import { sessionConfig } from '../utils/sessions.js';
import { checkSession } from '../service/checksession.js';
import { validateForgotPassword } from '../middlewares/validation/limitEmail.js';
import { authMiddleware } from '../middlewares/validation/auth.validation.js';
import { resetPassword } from '../controlllers/auth.controller.js';

const router = express.Router();

router.post('/login', userValidate, login, sessionConfig);
router.post('/register', registerValidate, regist);
router.post("/forgot-password", authMiddleware, validateForgotPassword, forgotPassword)
router.post('/reset-password/:token', authMiddleware, resetPassword)
router.post('/logout', logout)
router.get("/check", checkSession)

export default router;