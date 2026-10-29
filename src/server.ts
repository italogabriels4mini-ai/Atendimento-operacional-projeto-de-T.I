import 'dotenv/config';
import express, { type ErrorRequestHandler } from 'express';
import path from 'node:path';
import { ensureDatabase, checkDatabase } from './config/database';
import authRoutes from './routes/authRoutes';
import chamadoRoutes from './routes/chamadoRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import relatorioRoutes from './routes/relatorioRoutes';
import { authenticate } from './middlewares/auth';
import { UsuarioModel } from './models/UsuarioModel';
import { RelatorioController } from './controllers/RelatorioController';

const app = express();
const port = Number(process.env.PORT || 3000);
const publicDir = path.resolve(process.cwd(), 'public');

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => { res.setHeader('Cache-Control', req.path.startsWith('/api') ? 'no-store' : 'no-cache'); next(); });
app.use(express.static(publicDir));

app.get('/api/health', async (_req, res) => { res.json({ ok: true, service: 'atendimento-operacional', database: await checkDatabase(), timestamp: new Date().toISOString() }); });
app.use('/api/auth', authRoutes);
app.use('/api/chamados', chamadoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.get('/api/dashboard', authenticate, async (req, res, next) => { try { await RelatorioController.dashboard(req, res); } catch (error) { next(error); } });
app.get('/api/catalogos', authenticate, async (_req, res, next) => { try { res.json({ categorias: await UsuarioModel.listCategories(), setores: await UsuarioModel.listSectors() }); } catch (error) { next(error); } });

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) { res.status(404).json({ error: 'Rota não encontrada.' }); return; }
  if (req.method === 'GET' && req.accepts('html')) { res.sendFile(path.join(publicDir, 'index.html')); return; }
  next();
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => { console.error('[API]', error); res.status(500).json({ error: 'Ocorreu um erro inesperado. Tente novamente.' }); };
app.use(errorHandler);

ensureDatabase().finally(() => {
  app.listen(port, '0.0.0.0', () => console.log(`Atendimento Operacional ouvindo em http://localhost:3000`));
});

export default app;  
