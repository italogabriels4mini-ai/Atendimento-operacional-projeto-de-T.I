import { Router } from 'express';
import { z } from 'zod';
import { UsuarioController } from '../controllers/UsuarioController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/permissoes';
import { validate } from '../middlewares/validation';

const router = Router();
const userSchema = z.object({ nome: z.string().trim().min(3), email: z.string().email(), senha: z.string().min(6).optional(), perfil: z.enum(['cliente', 'atendente', 'admin']).default('atendente'), setor_id: z.coerce.number().int().positive().nullable().optional() });
const updateSchema = z.object({ nome: z.string().trim().min(3).optional(), perfil: z.enum(['cliente', 'atendente', 'admin']).optional(), setor_id: z.coerce.number().int().positive().nullable().optional(), ativo: z.boolean().optional() });
const sectorSchema = z.object({ nome: z.string().trim().min(2), descricao: z.string().trim().max(300).optional() });
router.use(authenticate, requireRole('admin'));
router.get('/', UsuarioController.list);
router.post('/', validate(userSchema), UsuarioController.create);
router.put('/:id', validate(updateSchema), UsuarioController.update);
router.post('/setores', validate(sectorSchema), UsuarioController.createSector);
export default router;