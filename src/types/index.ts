import type { Request } from 'express';

export type Role = 'cliente' | 'atendente' | 'admin';

export type Priority =
  | 'Baixa'
  | 'Normal'
  | 'Alta'
  | 'Urgente';

export type TicketStatus =
  | 'Aberto'
  | 'Em análise'
  | 'Em atendimento'
  | 'Aguardando resposta'
  | 'Resolvido'
  | 'Encerrado'
  | 'Cancelado';

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: Role;
  setor_id: number | null;
  setor_nome?: string | null;
  ativo: boolean | number;
  criado_em?: string;
}

export interface Message {
  id: number;
  chamado_id: number;
  usuario_id: number;
  usuario_nome: string;
  perfil: Role;
  conteudo: string;
  interna: boolean | number;
  criado_em: string;
}

export interface Ticket {
  id: number;
  numero: string;
  titulo: string;
  descricao: string;
  categoria_id: number;
  categoria_nome?: string;
  prioridade: Priority;
  status: TicketStatus;
  usuario_id: number;
  usuario_nome?: string;
  usuario_email?: string;
  atendente_id: number | null;
  atendente_nome?: string | null;
  setor_id: number | null;
  setor_nome?: string | null;
  criado_em: string;
  atualizado_em: string;
  prazo_atendimento: string;
  ultima_mensagem?: string | null;
  avaliacao?: number | null;
  nota_comentario?: string | null;
}

export interface DashboardMetrics {
  total: number;
  abertos: number;
  emAtendimento: number;
  aguardando: number;
  resolvidos: number;
  atrasados: number;
  mediaAvaliacao: number;
  tempoMedioHoras: number;
  porStatus: Array<{
    status: string;
    quantidade: number;
  }>;
  porCategoria: Array<{
    categoria: string;
    quantidade: number;
  }>;
}

export interface AuthRequest extends Request {
  user?: User;
}

export type Usuario = User;
export type Chamado = Ticket;
