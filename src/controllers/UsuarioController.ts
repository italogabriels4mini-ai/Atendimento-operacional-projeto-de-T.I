import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { UsuarioModel } from '../models/UsuarioModel';
import { parseId } from '../middlewares/permissoes';
import type { AuthRequest, Role } from '../types';

export class UsuarioController {
  static async list(_req: AuthRequest, res: Response): Promise<void> { res.json({ usuarios: await UsuarioModel.list(), atendentes: await UsuarioModel.listAgents(), setores: await UsuarioModel.listSectors(), categorias: await UsuarioModel.listCategories() }); }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    const { nome, email, senha, perfil, setor_id } = req.body;
    if (await UsuarioModel.findByEmail(email)) { res.status(409).json({ error: 'E-mail já cadastrado.' }); return; }
    const senhaHash = await bcrypt.hash(senha || 'Acesso@123', 12);
    const user = await UsuarioModel.create({ nome, email, senhaHash, perfil: (perfil || 'atendente') as Role, setorId: setor_id });
    res.status(201).json({ usuario: user, message: 'Usuário cadastrado.' });
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id as string, res); if (!id) return;
    const user = await UsuarioModel.update(id, { nome: req.body.nome, perfil: req.body.perfil, setorId: req.body.setor_id, ativo: req.body.ativo });
    if (!user) { res.status(404).json({ error: 'Usuário não encontrado.' }); return; }
    res.json({ usuario: user });
  }

  static async createSector(req: AuthRequest, res: Response): Promise<void> { res.status(201).json({ setor: await UsuarioModel.createSector(req.body.nome, req.body.descricao) }); }
}
