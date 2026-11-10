# Plano — Atendimento Operacional

## Objetivo

Entregar um sistema web escolar, porém funcional, para abertura, distribuição, acompanhamento e encerramento de chamados operacionais. O front-end será servido pelo mesmo processo Node/Express, mantendo HTML, CSS e JavaScript sem framework; o back-end será TypeScript em arquitetura MVC; a persistência será MySQL compatível via `DATABASE_URL` do ambiente e configuração JSON local.

## Implementação

- **Servidor:** Express em `src/server.ts`, middleware JSON, CORS local, arquivos estáticos de `public/`, rota `/api/health` e tratamento centralizado de erros.
- **Persistência:** `mysql2/promise`, pool de conexões em `src/config/database.ts`, SQL determinístico em `database/schema.sql` e dados demonstrativos em `database/dados-exemplo.sql`. O DSN do ambiente tem prioridade; `src/config/database.json` documenta os valores locais.
- **MVC:** controllers recebem requisições e validam entrada; models concentram SQL parametrizado; routes declaram a API; middlewares controlam autenticação e perfis; tipos compartilhados ficam em `src/types/index.ts`.
- **Autenticação:** cadastro e login por e-mail e senha explicitamente solicitados pelo projeto, com `bcryptjs`, JWT em cookie `atendimento_session` e suporte a Bearer token. O cookie é `SameSite=None; Secure` em Preview HTTPS e permite HTTP local separado. Cada rota protegida resolve o usuário no banco e aplica `requireRole`.
- **API:** CRUD de chamados, mensagens, status, responsável, usuários, dashboard e relatórios; cliente só enxerga seus chamados, atendente enxerga os atribuídos e administrador enxerga o conjunto completo.
- **Front-end:** SPA leve em `public/index.html`, `public/css/style.css` e `public/js/app.js`, com navegação por seções, modais, gráficos em CSS/JS, dados reais vindos da API e fallback de demonstração somente quando o banco ainda não foi preparado para permitir apresentação local.
- **Rotina de banco:** `ensureDatabase()` cria tabelas mínimas idempotentes quando a conexão está disponível e registra o estado de prontidão; dados de exemplo podem ser carregados pelo SQL fornecido.

## Estrutura principal

```text
public/                  Interface HTML/CSS/JS e manifesto de rotas
src/config/              Configuração JSON e pool MySQL
src/controllers/         Auth, chamados, usuários e relatórios
src/middlewares/         Autenticação, papéis e validação
src/models/              Consultas SQL por entidade
src/routes/              Rotas REST da API
src/types/               Tipos de domínio e Express
src/server.ts            Composição da aplicação e inicialização
 database/               Schema e dados demonstrativos
```

## Design

### Direções consideradas

1. **Painel editorial azul-petróleo** — 0,06: uma central operacional com navegação lateral, tipografia forte e cartões de leitura rápida.
2. **Glassmorphism corporativo** — 0,04: transparências e brilhos como linguagem dominante.
3. **Terminal neon técnico** — 0,02: alto contraste escuro e acentos fluorescentes.

### Direção escolhida: Painel editorial azul-petróleo

- **Movimento:** dashboard operacional editorial, inspirado em centrais de comando de serviços internos.
- **Princípios:** hierarquia imediata, densidade legível, estado sempre visível e ações com consequência clara.
- **Filosofia de cor:** azul-petróleo comunica confiança e continuidade; fundo marfim reduz fadiga; coral/âmbar sinalizam ação e atenção sem transformar a tela em alerta constante.
- **Paradigma de layout:** trilho lateral persistente + canvas assimétrico com faixa de contexto, resumo numérico e área de trabalho; no celular o trilho vira barra compacta.
- **Elementos assinatura:** marca “AO” em monograma, etiquetas de status em pílula e uma linha de progresso de atendimento em cada detalhe.
- **Interação:** toda ação mostra estado carregando, feedback textual curto e atualização da lista sem recarregar a página.
- **Animação:** entradas suaves de 180–240 ms, transições de cartões e nenhum movimento decorativo contínuo.
- **Tipografia:** Manrope para títulos e Inter para corpo/interface, com números grandes para indicadores e labels curtas em caixa alta.
- **Essência:** “clareza para resolver o que não pode esperar”; direto, acolhedor, responsável.
- **Voz:** títulos como “O que precisa de atenção hoje?” e CTAs como “Abrir chamado”; microcopy objetiva, sem lorem ipsum.
- **Marca:** monograma AO formado por duas barras que sugerem encaminhamento e resolução.
- **Cor proprietária:** `#0F766E`, o teal operacional usado em marca, links e estados positivos.

## Entrega

A aplicação será compilável com `npm run build`, iniciará em `PORT`/3000 com `npm run dev` ou `npm start`,documentação de instalação no Windows/VS Code e arquivos SQL para criação e carga do banco.
