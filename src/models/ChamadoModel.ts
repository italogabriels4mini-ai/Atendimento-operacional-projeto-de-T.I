import { query } from '../config/database';
import type { ResultSetHeader } from 'mysql2';
import type { Message, Priority, Role, Ticket, TicketStatus } from '../types';

const ticketSelect = `SELECT c.id, c.numero, c.titulo, c.descricao, c.categoria_id, cat.nome AS categoria_nome, c.prioridade, c.status, c.usuario_id, u.nome AS usuario_nome, u.email AS usuario_email, c.atendente_id, a.nome AS atendente_nome, c.setor_id, s.nome AS setor_nome, DATE_FORMAT(c.criado_em, '%Y-%m-%dT%H:%i:%sZ') AS criado_em, DATE_FORMAT(c.atualizado_em, '%Y-%m-%dT%H:%i:%sZ') AS atualizado_em, DATE_FORMAT(c.prazo_atendimento, '%Y-%m-%dT%H:%i:%sZ') AS prazo_atendimento, (SELECT m.conteudo FROM mensagens m WHERE m.chamado_id = c.id AND m.interna = 0 ORDER BY m.criado_em DESC LIMIT 1) AS ultima_mensagem, av.nota AS avaliacao, av.comentario AS nota_comentario FROM chamados c JOIN usuarios u ON u.id = c.usuario_id JOIN categorias cat ON cat.id = c.categoria_id LEFT JOIN usuarios a ON a.id = c.atendente_id LEFT JOIN setores s ON s.id = c.setor_id LEFT JOIN avaliacoes av ON av.chamado_id = c.id`;

export class ChamadoModel {
  static async list(userId: number, perfil: Role, filters: { status?: string; busca?: string } = {}): Promise<Ticket[]> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (perfil === 'cliente') { where.push('c.usuario_id = ?'); params.push(userId); }
    if (perfil === 'atendente') { where.push('(c.atendente_id = ? OR c.usuario_id = ?)'); params.push(userId, userId); }
    if (filters.status) { where.push('c.status = ?'); params.push(filters.status); }
    if (filters.busca) { where.push('(c.numero LIKE ? OR c.titulo LIKE ? OR c.descricao LIKE ?)'); const value = `%${filters.busca}%`; params.push(value, value, value); }
    return query<Ticket[]>(`${ticketSelect} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY FIELD(c.prioridade, 'Urgente', 'Alta', 'Normal', 'Baixa'), c.atualizado_em DESC`, params);
  }

  static async findById(id: number): Promise<Ticket | undefined> {
    const rows = await query<Ticket[]>(`${ticketSelect} WHERE c.id = ? LIMIT 1`, [id]);
    return rows[0];
  }

  static async create(data: { numero: string; titulo: string; descricao: string; categoriaId: number; prioridade: Priority; usuarioId: number; setorId?: number | null; prazo?: string }): Promise<Ticket | undefined> {
    const prazo = data.prazo || new Date(Date.now() + 48 * 60 * 60 * 1000);
    const result = await query<ResultSetHeader>(`INSERT INTO chamados (numero, titulo, descricao, categoria_id, prioridade, status, usuario_id, setor_id, prazo_atendimento) VALUES (?, ?, ?, ?, ?, 'Aberto', ?, ?, ?)`, [data.numero, data.titulo, data.descricao, data.categoriaId, data.prioridade, data.usuarioId, data.setorId ?? null, prazo]);
    await query<ResultSetHeader>(`INSERT INTO historico_chamados (chamado_id, usuario_id, status_novo, observacao) VALUES (?, ?, 'Aberto', 'Chamado criado pelo solicitante')`, [result.insertId, data.usuarioId]);
    return this.findById(result.insertId);
  }

  static async update(id: number, data: { titulo?: string; descricao?: string; prioridade?: Priority; categoriaId?: number; prazo?: string }): Promise<Ticket | undefined> {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (data.titulo !== undefined) { fields.push('titulo = ?'); values.push(data.titulo); }
    if (data.descricao !== undefined) { fields.push('descricao = ?'); values.push(data.descricao); }
    if (data.prioridade !== undefined) { fields.push('prioridade = ?'); values.push(data.prioridade); }
    if (data.categoriaId !== undefined) { fields.push('categoria_id = ?'); values.push(data.categoriaId); }
    if (data.prazo !== undefined) { fields.push('prazo_atendimento = ?'); values.push(data.prazo); }
    if (!fields.length) return this.findById(id);
    values.push(id);
    await query<ResultSetHeader>(`UPDATE chamados SET ${fields.join(', ')}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return this.findById(id);
  }

  static async remove(id: number): Promise<void> {
    await query<ResultSetHeader>(`DELETE FROM chamados WHERE id = ?`, [id]);
  }

  static async updateStatus(id: number, status: TicketStatus, userId: number, observacao?: string): Promise<Ticket | undefined> {
    await query<ResultSetHeader>(`UPDATE chamados SET status = ?, atualizado_em = CURRENT_TIMESTAMP${status === 'Resolvido' ? ', resolvido_em = CURRENT_TIMESTAMP' : ''}${status === 'Encerrado' ? ', encerrado_em = CURRENT_TIMESTAMP' : ''} WHERE id = ?`, [status, id]);
    await query<ResultSetHeader>(`INSERT INTO historico_chamados (chamado_id, usuario_id, status_novo, observacao) VALUES (?, ?, ?, ?)`, [id, userId, status, observacao || null]);
    return this.findById(id);
  }

  static async assign(id: number, atendenteId: number | null, setorId: number | null, userId: number): Promise<Ticket | undefined> {
    await query<ResultSetHeader>(`UPDATE chamados SET atendente_id = ?, setor_id = ?, atualizado_em = CURRENT_TIMESTAMP, status = CASE WHEN ? IS NOT NULL AND status = 'Aberto' THEN 'Em análise' ELSE status END WHERE id = ?`, [atendenteId, setorId, atendenteId, id]);
    await query<ResultSetHeader>(`INSERT INTO historico_chamados (chamado_id, usuario_id, status_novo, observacao) VALUES (?, ?, (SELECT status FROM chamados WHERE id = ?), ?)`, [id, userId, id, atendenteId ? 'Chamado distribuído para atendimento' : 'Responsável removido']);
    return this.findById(id);
  }

  static async messages(id: number, includeInternal: boolean): Promise<Message[]> {
    return query<Message[]>(`SELECT m.id, m.chamado_id, m.usuario_id, u.nome AS usuario_nome, u.perfil, m.conteudo, m.interna, DATE_FORMAT(m.criado_em, '%Y-%m-%dT%H:%i:%sZ') AS criado_em FROM mensagens m JOIN usuarios u ON u.id = m.usuario_id WHERE m.chamado_id = ? ${includeInternal ? '' : 'AND m.interna = 0'} ORDER BY m.criado_em ASC`, [id]);
  }

  static async addMessage(id: number, userId: number, conteudo: string, interna: boolean): Promise<Message[]> {
    await query<ResultSetHeader>(`INSERT INTO mensagens (chamado_id, usuario_id, conteudo, interna) VALUES (?, ?, ?, ?)`, [id, userId, conteudo, interna]);
    await query<ResultSetHeader>(`UPDATE chamados SET atualizado_em = CURRENT_TIMESTAMP${interna ? '' : ", status = CASE WHEN status IN ('Aberto', 'Em análise', 'Aguardando resposta') THEN 'Em atendimento' ELSE status END"} WHERE id = ?`, [id]);
    return this.messages(id, true);
  }

  static async addRating(id: number, userId: number, nota: number, comentario?: string): Promise<void> {
    await query<ResultSetHeader>(`INSERT INTO avaliacoes (chamado_id, usuario_id, nota, comentario) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE nota = VALUES(nota), comentario = VALUES(comentario), atualizado_em = CURRENT_TIMESTAMP`, [id, userId, nota, comentario || null]);
  }
}
