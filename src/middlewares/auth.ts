import jwt from 'jsonwebtoken';
import type { NextFunction, Response } from 'express';
import { parse, serialize } from 'cookie';
import { query } from '../config/database';
import type { AuthRequest, User } from '../types';

const COOKIE_NAME = 'atendimento_session';
const JWT_SECRET = process.env.JWT_SECRET || 'atendimento-operacional-segredo-local';

function tokenFromRequest(req: AuthRequest): string | undefined {
  const cookies = parse(req.headers.cookie || '');
  const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined;
  return cookies[COOKIE_NAME] || bearer;
}

export function setSessionCookie(res: Response, user: User): void {
  const token = jwt.sign({ id: user.id, email: user.email, perfil: user.perfil }, JWT_SECRET, { expiresIn: '8h' });
  const isPreviewHttps = process.env.MANUS_PROJECT_ID || process.env.NODE_ENV === 'production';
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isPreviewHttps ? 'none' : 'lax',
    secure: Boolean(isPreviewHttps),
    maxAge: 60 * 60 * 8,
    path: '/'
  }));
}

export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', serialize(COOKIE_NAME, '', { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 0, path: '/' }));
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const token = tokenFromRequest(req);
  if (!token) {
    res.status(401).json({ error: 'Faça login para continuar.' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number };
    const rows = await query<User[]>(
      `SELECT u.id, u.nome, u.email, u.perfil, u.setor_id, u.ativo, s.nome AS setor_nome
       FROM usuarios u LEFT JOIN setores s ON s.id = u.setor_id WHERE u.id = ? AND u.ativo = 1 LIMIT 1`, [payload.id]);
    if (!rows[0]) {
      res.status(401).json({ error: 'Sessão inválida ou usuário inativo.' });
      return;
    }
    req.user = rows[0];
    next();
  } catch {
    res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const token = tokenFromRequest(req);
  if (!token) { next(); return; }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number };
    query<User[]>(`SELECT u.id, u.nome, u.email, u.perfil, u.setor_id, u.ativo, s.nome AS setor_nome FROM usuarios u LEFT JOIN setores s ON s.id = u.setor_id WHERE u.id = ? AND u.ativo = 1 LIMIT 1`, [payload.id])
      .then((rows) => { req.user = rows[0]; next(); }).catch(() => next());
  } catch { next(); }
}
