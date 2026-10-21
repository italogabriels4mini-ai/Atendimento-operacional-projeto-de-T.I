import { query } from '../config/database';
import type { DashboardMetrics, Role } from '../types';

export class RelatorioModel {
  static async dashboard(userId: number, perfil: Role): Promise<DashboardMetrics> {
    const scope = perfil === 'admin' ? '' : perfil === 'atendente' ? ' AND (c.atendente_id = ? OR c.usuario_id = ?)' : ' AND c.usuario_id = ?';
    const scopeParams = perfil === 'admin' ? [] : perfil === 'atendente' ? [userId, userId] : [userId];
    const [summary] = await query<Array<{ total: number; abertos: number; emAtendimento: number; aguardando: number; resolvidos: number; atrasados: number; mediaAvaliacao: number | null; tempoMedioHoras: number | null }>>(`SELECT COUNT(*) AS total, SUM(c.status IN ('Aberto', 'Em análise')) AS abertos, SUM(c.status = 'Em atendimento') AS emAtendimento, SUM(c.status = 'Aguardando resposta') AS aguardando, SUM(c.status IN ('Resolvido', 'Encerrado')) AS resolvidos, SUM(c.status NOT IN ('Resolvido', 'Encerrado', 'Cancelado') AND c.prazo_atendimento < NOW()) AS atrasados, (SELECT AVG(av.nota) FROM avaliacoes av JOIN chamados cx ON cx.id = av.chamado_id WHERE 1=1 ${scope.replaceAll('c.', 'cx.')}) AS mediaAvaliacao, AVG(CASE WHEN c.resolvido_em IS NOT NULL THEN TIMESTAMPDIFF(HOUR, c.criado_em, c.resolvido_em) END) AS tempoMedioHoras FROM chamados c WHERE 1=1 ${scope}`, [...scopeParams, ...scopeParams]);
    const porStatus = await query<Array<{ status: string; quantidade: number }>>(`SELECT c.status, COUNT(*) AS quantidade FROM chamados c WHERE 1=1 ${scope} GROUP BY c.status ORDER BY quantidade DESC`, scopeParams);
    const porCategoria = await query<Array<{ categoria: string; quantidade: number }>>(`SELECT cat.nome AS categoria, COUNT(*) AS quantidade FROM chamados c JOIN categorias cat ON cat.id = c.categoria_id WHERE 1=1 ${scope} GROUP BY cat.nome ORDER BY quantidade DESC`, scopeParams);
    return { total: Number(summary?.total || 0), abertos: Number(summary?.abertos || 0), emAtendimento: Number(summary?.emAtendimento || 0), aguardando: Number(summary?.aguardando || 0), resolvidos: Number(summary?.resolvidos || 0), atrasados: Number(summary?.atrasados || 0), mediaAvaliacao: Number(Number(summary?.mediaAvaliacao || 0).toFixed(1)), tempoMedioHoras: Number(Number(summary?.tempoMedioHoras || 0).toFixed(1)), porStatus, porCategoria };
  }

  static async reports(): Promise<{ porStatus: Array<{ status: string; quantidade: number }>; porPrioridade: Array<{ prioridade: string; quantidade: number }>; porSetor: Array<{ setor: string; quantidade: number }>; ultimos: Array<Record<string, unknown>> }> {
    const porStatus = await query<Array<{ status: string; quantidade: number }>>(`SELECT status, COUNT(*) AS quantidade FROM chamados GROUP BY status ORDER BY quantidade DESC`);
    const porPrioridade = await query<Array<{ prioridade: string; quantidade: number }>>(`SELECT prioridade, COUNT(*) AS quantidade FROM chamados GROUP BY prioridade ORDER BY FIELD(prioridade, 'Urgente', 'Alta', 'Normal', 'Baixa')`);
    const porSetor = await query<Array<{ setor: string; quantidade: number }>>(`SELECT COALESCE(s.nome, 'Não definido') AS setor, COUNT(*) AS quantidade FROM chamados c LEFT JOIN setores s ON s.id = c.setor_id GROUP BY COALESCE(s.nome, 'Não definido') ORDER BY quantidade DESC`);
    const ultimos = await query<Array<Record<string, unknown>>>(`SELECT numero, titulo, status, prioridade, DATE_FORMAT(criado_em, '%Y-%m-%dT%H:%i:%sZ') AS criado_em FROM chamados ORDER BY criado_em DESC LIMIT 8`);
    return { porStatus, porPrioridade, porSetor, ultimos };
  }
}
