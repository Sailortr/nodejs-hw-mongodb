import express from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.js';
import validateBody from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../validation/authValidation.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
