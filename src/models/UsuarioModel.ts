import { query } from '../config/database';
import type { ResultSetHeader } from 'mysql2';
import type { Role, User } from '../types';

type UserRow = User & { senha_hash?: string };

export class UsuarioModel {
  static async findByEmail(email: string): Promise<UserRow | undefined> {
    const rows = await query<UserRow[]>(`SELECT u.id, u.nome, u.email, u.senha_hash, u.perfil, u.setor_id, u.ativo, s.nome AS setor_nome, u.criado_em FROM usuarios u LEFT JOIN setores s ON s.id = u.setor_id WHERE LOWER(u.email) = LOWER(?) LIMIT 1`, [email]);
    return rows[0];
  }

  static async findById(id: number): Promise<User | undefined> {
    const rows = await query<User[]>(`SELECT u.id, u.nome, u.email, u.perfil, u.setor_id, u.ativo, s.nome AS setor_nome, u.criado_em FROM usuarios u LEFT JOIN setores s ON s.id = u.setor_id WHERE u.id = ? LIMIT 1`, [id]);
    return rows[0];
  }

  static async create(data: { nome: string; email: string; senhaHash: string; perfil: Role; setorId?: number | null }): Promise<User> {
    const result = await query<ResultSetHeader>(`INSERT INTO usuarios (nome, email, senha_hash, perfil, setor_id) VALUES (?, ?, ?, ?, ?)`, [data.nome, data.email, data.senhaHash, data.perfil, data.setorId ?? null]);
    return (await this.findById(result.insertId)) as User;
  }

  static async list(): Promise<User[]> {
    return query<User[]>(`SELECT u.id, u.nome, u.email, u.perfil, u.setor_id, u.ativo, s.nome AS setor_nome, u.criado_em FROM usuarios u LEFT JOIN setores s ON s.id = u.setor_id ORDER BY u.nome`);
  }

  static async listAgents(): Promise<User[]> {
    return query<User[]>(`SELECT u.id, u.nome, u.email, u.perfil, u.setor_id, u.ativo, s.nome AS setor_nome FROM usuarios u LEFT JOIN setores s ON s.id = u.setor_id WHERE u.perfil IN ('atendente', 'admin') AND u.ativo = 1 ORDER BY u.nome`);
  }

  static async update(id: number, data: { nome?: string; perfil?: Role; setorId?: number | null; ativo?: boolean }): Promise<User | undefined> {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (data.nome !== undefined) { fields.push('nome = ?'); values.push(data.nome); }
    if (data.perfil !== undefined) { fields.push('perfil = ?'); values.push(data.perfil); }
    if (data.setorId !== undefined) { fields.push('setor_id = ?'); values.push(data.setorId); }
    if (data.ativo !== undefined) { fields.push('ativo = ?'); values.push(data.ativo); }
    if (!fields.length) return this.findById(id);
    values.push(id);
    await query<ResultSetHeader>(`UPDATE usuarios SET ${fields.join(', ')}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return this.findById(id);
  }

  static async listSectors(): Promise<Array<{ id: number; nome: string; descricao: string | null }>> {
    return query<Array<{ id: number; nome: string; descricao: string | null }>>(`SELECT id, nome, descricao FROM setores ORDER BY nome`);
  }

  static async createSector(nome: string, descricao?: string): Promise<{ id: number; nome: string; descricao: string | null }> {
    const result = await query<ResultSetHeader>(`INSERT INTO setores (nome, descricao) VALUES (?, ?)`, [nome, descricao || null]);
    const rows = await query<Array<{ id: number; nome: string; descricao: string | null }>>(`SELECT id, nome, descricao FROM setores WHERE id = ?`, [result.insertId]);
    return rows[0];
  }

  static async listCategories(): Promise<Array<{ id: number; nome: string }>> {
    return query<Array<{ id: number; nome: string }>>(`SELECT id, nome FROM categorias WHERE ativo = 1 ORDER BY nome`);
  }
}
