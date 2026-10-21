import type { Response } from 'express';
import { ChamadoModel } from '../models/ChamadoModel';
import { AtendimentoModel } from '../models/AtendimentoModel';
import { parseId } from '../middlewares/permissoes';
import type { AuthRequest, TicketStatus } from '../types';

async function canAccess(req: AuthRequest, id: number): Promise<boolean> {
  if (req.user?.perfil === 'admin') return true;
  const ticket = await ChamadoModel.findById(id);
  if (!ticket || !req.user) return false;
  return ticket.usuario_id === req.user.id || ticket.atendente_id === req.user.id;
}

export class ChamadoController {
  static async list(req: AuthRequest, res: Response): Promise<void> {
    const tickets = await ChamadoModel.list(req.user!.id, req.user!.perfil, { status: req.query.status as string | undefined, busca: req.query.busca as string | undefined });
    res.json({ chamados: tickets });
  }

  static async get(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id as string, res); if (!id) return;
    const ticket = await ChamadoModel.findById(id);
    if (!ticket || !(await canAccess(req, id))) { res.status(404).json({ error: 'Chamado não encontrado.' }); return; }
    const messages = await ChamadoModel.messages(id, req.user!.perfil !== 'cliente');
    const history = await AtendimentoModel.history(id);
    res.json({ chamado: ticket, mensagens: messages, historico: history });
  }

  static async create(req: AuthRequest, res: Response): Promise<void> {
    const { titulo, descricao, categoria_id, prioridade, setor_id, prazo_atendimento } = req.body;
    const numero = `CH-${String(Date.now()).slice(-8)}`;
    const ticket = await ChamadoModel.create({ numero, titulo, descricao, categoriaId: categoria_id, prioridade, usuarioId: req.user!.id, setorId: setor_id, prazo: prazo_atendimento });
    res.status(201).json({ chamado: ticket, message: 'Chamado aberto e encaminhado para a fila operacional.' });
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id as string, res); if (!id) return;
    const ticket = await ChamadoModel.findById(id);
    if (!ticket || !(await canAccess(req, id))) { res.status(404).json({ error: 'Chamado não encontrado.' }); return; }
    if (req.user!.perfil === 'cliente' && (ticket.usuario_id !== req.user!.id || !['Aberto', 'Em análise'].includes(ticket.status))) { res.status(403).json({ error: 'Este chamado não pode mais ser editado.' }); return; }
    const updated = await ChamadoModel.update(id, { titulo: req.body.titulo, descricao: req.body.descricao, prioridade: req.body.prioridade, categoriaId: req.body.categoria_id, prazo: req.body.prazo_atendimento });
    res.json({ chamado: updated });
  }

  static async remove(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id as string, res); if (!id) return;
    const ticket = await ChamadoModel.findById(id);
    if (!ticket || (req.user!.perfil === 'cliente' && (ticket.usuario_id !== req.user!.id || ticket.status !== 'Aberto'))) { res.status(403).json({ error: 'Chamado não pode ser excluído.' }); return; }
    await ChamadoModel.remove(id); res.json({ message: 'Chamado excluído.' });
  }

  static async status(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id as string, res); if (!id) return;
    if (!(await canAccess(req, id))) { res.status(404).json({ error: 'Chamado não encontrado.' }); return; }
    if (req.user!.perfil === 'cliente' && !['Aguardando resposta', 'Encerrado'].includes(req.body.status)) { res.status(403).json({ error: 'Cliente não pode escolher este status.' }); return; }
    const updated = await ChamadoModel.updateStatus(id, req.body.status as TicketStatus, req.user!.id, req.body.observacao);
    res.json({ chamado: updated });
  }

  static async assign(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id as string, res); if (!id) return;
    const updated = await ChamadoModel.assign(id, req.body.atendente_id ?? null, req.body.setor_id ?? null, req.user!.id);
    if (!updated) { res.status(404).json({ error: 'Chamado não encontrado.' }); return; }
    res.json({ chamado: updated, message: 'Distribuição atualizada.' });
  }

  static async messages(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id as string, res); if (!id || !(await canAccess(req, id))) { if (id) res.status(404).json({ error: 'Chamado não encontrado.' }); return; }
    const interna = Boolean(req.body.interna) && req.user!.perfil !== 'cliente';
    const messages = await ChamadoModel.addMessage(id, req.user!.id, req.body.conteudo, interna);
    res.status(201).json({ mensagens: messages });
  }

  static async rating(req: AuthRequest, res: Response): Promise<void> {
    const id = parseId(req.params.id as string, res); if (!id) return;
    const ticket = await ChamadoModel.findById(id);
    if (!ticket || ticket.usuario_id !== req.user!.id) { res.status(404).json({ error: 'Chamado não encontrado.' }); return; }
    if (!['Resolvido', 'Encerrado'].includes(ticket.status)) { res.status(400).json({ error: 'A avaliação fica disponível após a resolução.' }); return; }
    await ChamadoModel.addRating(id, req.user!.id, req.body.nota, req.body.comentario);
    res.status(201).json({ message: 'Avaliação registrada. Obrigado pelo retorno.' });
  }
}
