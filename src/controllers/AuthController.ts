import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { UsuarioModel } from '../models/UsuarioModel';
import { clearSessionCookie, setSessionCookie } from '../middlewares/auth';
import type { AuthRequest, Role } from '../types';

export class AuthController {
  static async cadastro(req: Request, res: Response): Promise<void> {
    const { nome, email, senha } = req.body as { nome: string; email: string; senha: string };
    try {
      if (await UsuarioModel.findByEmail(email)) { res.status(409).json({ error: 'Já existe uma conta com este e-mail.' }); return; }
      const senhaHash = await bcrypt.hash(senha, 12);
      const user = await UsuarioModel.create({ nome, email, senhaHash, perfil: 'cliente' });
      setSessionCookie(res, user);
      res.status(201).json({ user, message: 'Conta criada com sucesso.' });
    } catch (error) { res.status(500).json({ error: 'Não foi possível criar a conta.', detail: error instanceof Error ? error.message : undefined }); }
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, senha } = req.body as { email: string; senha: string };
    try {
      const user = await UsuarioModel.findByEmail(email);
      if (!user || !user.senha_hash || !(await bcrypt.compare(senha, user.senha_hash))) { res.status(401).json({ error: 'E-mail ou senha incorretos.' }); return; }
      if (user.ativo === false) { res.status(403).json({ error: 'Esta conta está desativada. Procure o administrador.' }); return; }
      const { senha_hash: _senha, ...publicUser } = user;
      setSessionCookie(res, publicUser);
      res.json({ user: publicUser, message: 'Login realizado.' });
    } catch (error) { res.status(500).json({ error: 'Não foi possível realizar o login.', detail: error instanceof Error ? error.message : undefined }); }
  }

  static async logout(_req: Request, res: Response): Promise<void> { clearSessionCookie(res); res.json({ message: 'Sessão encerrada.' }); }

  static async me(req: AuthRequest, res: Response): Promise<void> { res.json({ user: req.user }); }
}
