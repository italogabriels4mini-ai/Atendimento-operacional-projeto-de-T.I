import type { Request } from 'express';

export type Role = 'cliente' | 'atendente' | 'admin';
export type TicketStatus = 'Aberto' | 'Em análise' | 'Em atendimento' | 'Aguardando resposta' | 'Resolvido' | 'Encerrado' | 'Cancelado';
export type Priority = 'Baixa' | 'Normal' | 'Alta' | 'Urgente';

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: Role;
  setor_id?: number | null;
  setor_nome?: string | null;
  ativo?: boolean;
  criado_em?: string;
}

export interface AuthRequest extends Request {
  user?: User;
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
  atendente_id?: number | null;
  atendente_nome?: string | null;
  setor_id?: number | null;
  setor_nome?: string | null;
  criado_em: string;
  atualizado_em: string;
  prazo_atendimento: string;
  ultima_mensagem?: string | null;
  avaliacao?: number | null;
  nota_comentario?: string | null;
}

export interface Message {
  id: number;
  chamado_id: number;
  usuario_id: number;
  usuario_nome?: string;
  perfil?: Role;
  conteudo: string;
  interna: boolean;
  criado_em: string;
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
  porStatus: Array<{ status: string; quantidade: number }>;
  porCategoria: Array<{ categoria: string; quantidade: number }>;
}

export const ROLES: Role[] = ['cliente', 'atendente', 'admin'];
export const STATUSES: TicketStatus[] = ['Aberto', 'Em análise', 'Em atendimento', 'Aguardando resposta', 'Resolvido', 'Encerrado', 'Cancelado'];
export const PRIORITIES: Priority[] = ['Baixa', 'Normal', 'Alta', 'Urgente'];
export const CATEGORIES = ['Problema técnico', 'Solicitação de documento', 'Manutenção', 'Dúvida operacional', 'Acesso ao sistema', 'Financeiro', 'Recursos humanos', 'Outros'];
