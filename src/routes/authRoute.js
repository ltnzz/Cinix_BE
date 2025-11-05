import express from 'express';
import { login, regist, logout } from '../controlllers/auth.controller.js';
import { registerValidate } from '../middlewares/validation/create.user.validation.js';
import { userValidate } from '../middlewares/validation/user.validation.js';

const router = express.Router();

router.post('/login', userValidate, login);
router.post('/register', registerValidate, regist);
router.post('/logout', logout)

export default router;