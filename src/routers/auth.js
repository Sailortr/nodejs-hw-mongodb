import express from 'express';
import { register, login, refreshToken, logout } from '../controllers/auth.js';
import validateBody from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../validation/authValidation.js';
import { emailSchema } from '../validation/authValidation.js';
import { sendResetEmail } from '../controllers/auth.js';
import { resetPwdSchema } from '../validation/authValidation.js';
import { resetPwd } from '../controllers/auth.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/send-reset-email', validateBody(emailSchema), sendResetEmail);
router.post('/reset-pwd', validateBody(resetPwdSchema), resetPwd);

export default router;
