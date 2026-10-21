import { z } from 'zod';
import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../types';

export function validate(schema: z.ZodType) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Confira os dados informados.', details: parsed.error.issues.map((issue) => issue.message) });
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export const registerSchema = z.object({ nome: z.string().trim().min(3), email: z.string().trim().email(), senha: z.string().min(6), perfil: z.enum(['cliente', 'atendente', 'admin']).optional() });
export const loginSchema = z.object({ email: z.string().trim().email(), senha: z.string().min(1) });
export const ticketSchema = z.object({ titulo: z.string().trim().min(5), descricao: z.string().trim().min(10), categoria_id: z.coerce.number().int().positive(), prioridade: z.enum(['Baixa', 'Normal', 'Alta', 'Urgente']), setor_id: z.coerce.number().int().positive().optional(), prazo_atendimento: z.string().optional() });
export const messageSchema = z.object({ conteudo: z.string().trim().min(1).max(2000), interna: z.boolean().optional() });
export const statusSchema = z.object({ status: z.enum(['Aberto', 'Em análise', 'Em atendimento', 'Aguardando resposta', 'Resolvido', 'Encerrado', 'Cancelado']) });
export const assigneeSchema = z.object({ atendente_id: z.coerce.number().int().positive().nullable().optional(), setor_id: z.coerce.number().int().positive().nullable().optional() });
export const ratingSchema = z.object({ nota: z.coerce.number().int().min(1).max(5), comentario: z.string().trim().max(500).optional() });
