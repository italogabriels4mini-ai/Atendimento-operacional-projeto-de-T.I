import type { Response } from 'express';
import { RelatorioModel } from '../models/RelatorioModel';
import type { AuthRequest } from '../types';

export class RelatorioController {
  static async dashboard(req: AuthRequest, res: Response): Promise<void> { res.json({ metricas: await RelatorioModel.dashboard(req.user!.id, req.user!.perfil) }); }
  static async relatorios(_req: AuthRequest, res: Response): Promise<void> { res.json(await RelatorioModel.reports()); }
}
