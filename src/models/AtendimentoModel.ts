import { query } from '../config/database';
import type { Message } from '../types';

export interface HistoryEntry {
  id: number;
  chamado_id: number;
  usuario_id: number;
  usuario_nome: string;
  status_anterior: string | null;
  status_novo: string;
  observacao: string | null;
  criado_em: string;
}

export class AtendimentoModel {
  static async history(chamadoId: number): Promise<HistoryEntry[]> {
    return query<HistoryEntry[]>(`SELECT h.id, h.chamado_id, h.usuario_id, u.nome AS usuario_nome, h.status_anterior, h.status_novo, h.observacao, DATE_FORMAT(h.criado_em, '%Y-%m-%dT%H:%i:%sZ') AS criado_em FROM historico_chamados h JOIN usuarios u ON u.id = h.usuario_id WHERE h.chamado_id = ? ORDER BY h.criado_em DESC`, [chamadoId]);
  }

  static async internalNotes(chamadoId: number): Promise<Message[]> {
    return query<Message[]>(`SELECT m.id, m.chamado_id, m.usuario_id, u.nome AS usuario_nome, u.perfil, m.conteudo, m.interna, DATE_FORMAT(m.criado_em, '%Y-%m-%dT%H:%i:%sZ') AS criado_em FROM mensagens m JOIN usuarios u ON u.id = m.usuario_id WHERE m.chamado_id = ? AND m.interna = 1 ORDER BY m.criado_em DESC`, [chamadoId]);
  }
}
