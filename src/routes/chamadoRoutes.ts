import { Router } from 'express';
import { ChamadoController } from '../controllers/ChamadoController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/permissoes';
import { validate, assigneeSchema, messageSchema, ratingSchema, statusSchema, ticketSchema } from '../middlewares/validation';

const router = Router();
router.use(authenticate);
router.get('/', ChamadoController.list);
router.post('/', validate(ticketSchema), ChamadoController.create);
router.get('/:id', ChamadoController.get);
router.put('/:id', validate(ticketSchema.partial()), ChamadoController.update);
router.delete('/:id', ChamadoController.remove);
router.post('/:id/mensagens', validate(messageSchema), ChamadoController.messages);
router.put('/:id/status', validate(statusSchema), ChamadoController.status);
router.put('/:id/atendente', requireRole('admin'), validate(assigneeSchema), ChamadoController.assign);
router.post('/:id/avaliacao', validate(ratingSchema), ChamadoController.rating);
export default router;