import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middlewares/auth';
import { validate, loginSchema, registerSchema } from '../middlewares/validation';

const router = Router();
router.post('/cadastro', validate(registerSchema), AuthController.cadastro);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);
export default router;