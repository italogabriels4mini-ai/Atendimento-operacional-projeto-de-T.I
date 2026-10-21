import type { NextFunction, Response } from 'express';
import type { AuthRequest, Role } from '../types';

export function requireRole(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) { res.status(401).json({ error: 'Autenticação necessária.' }); return; }
    if (!roles.includes(req.user.perfil)) { res.status(403).json({ error: 'Você não tem permissão para esta ação.' }); return; }
    next();
  };
}

export function parseId(value: string, res: Response): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ error: 'Identificador inválido.' }); return null; }
  return id;
}
