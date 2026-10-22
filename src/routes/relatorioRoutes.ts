import { Router } from 'express';
import { RelatorioController } from '../controllers/RelatorioController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/permissoes';

const router = Router();
router.use(authenticate, requireRole('admin'));
router.get('/dashboard', RelatorioController.dashboard);
router.get('/', RelatorioController.relatorios);
export default router;