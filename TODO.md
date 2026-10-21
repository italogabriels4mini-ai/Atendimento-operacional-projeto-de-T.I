# Entregas do Atendimento Operacional

## 1. Base executável e organização MVC
- [ ] O projeto usa HTML, CSS e JavaScript no front-end, TypeScript no back-end, Node.js, Express, JSON para configurações e arquitetura MVC.
- [ ] A estrutura contém `public/`, `src/config`, `controllers`, `middlewares`, `models`, `routes`, `types`, `database/`, `package.json`, `tsconfig.json`, `.gitignore` e `README.md`, com os módulos solicitados.
- [ ] O servidor inicia em uma porta configurável, serve a interface e expõe `/manus-routes.json`.

## 2. Banco MySQL e dados persistidos
- [ ] `database/schema.sql` cria `atendimento_operacional` e as tabelas `usuarios`, `setores`, `categorias`, `chamados`, `mensagens`, `historico_chamados`, `avaliacoes` e `notificacoes` com chaves, relacionamentos e índices.
- [ ] A aplicação lê `DATABASE_URL`/configuração JSON, usa pool MySQL e não depende de `localStorage` para os dados principais.
- [ ] `database/dados-exemplo.sql` fornece setores, categorias, usuários e chamados reais em português para apresentar o dashboard.

## 3. Autenticação, contas e autorização
- [ ] Existem cadastro, login e logout; a senha é protegida com hash; a sessão/token é validada por middleware.
- [ ] O middleware de permissão impede que cliente ou atendente acesse rotas administrativas apenas digitando a URL.
- [ ] Cliente/funcionário cria chamados, acompanha apenas os próprios, consulta histórico, envia mensagens e avalia após encerramento; não vê chamados alheios, permissões ou relatórios.
- [ ] Atendente vê chamados encaminhados, altera status, responde, registra observações internas, encaminha para setor e marca atendimento como resolvido.
- [ ] Administrador/gerente vê todos os chamados e usuários, cadastra atendentes, cria setores, distribui chamados, gerencia categorias/status/prioridades e consulta relatórios.

## 4. Chamados e API REST
- [ ] A API possui `POST /api/auth/cadastro`, `/login`, `/logout`; `GET/POST/PUT/DELETE /api/chamados`; mensagens; status; atendente; usuários; relatórios e dashboard.
- [ ] Cada chamado mantém número, título, descrição, categoria, prioridade, status, usuário, atendente, setor, datas, prazo, histórico, mensagens e avaliação.
- [ ] Os status são Aberto, Em análise, Em atendimento, Aguardando resposta, Resolvido, Encerrado e Cancelado; prioridades são Baixa, Normal, Alta e Urgente; categorias incluem as oito categorias solicitadas.
- [ ] Entradas são validadas e consultas usam parâmetros, com filtros por perfil e erros HTTP coerentes.

## 5. Interface profissional e responsiva
- [ ] Existem tela de login/cadastro, menu lateral, dashboard, lista de chamados, detalhe, abertura de chamado, mensagens, painel administrativo, usuários, relatórios e configurações.
- [ ] O dashboard mostra total, abertos, em atendimento, aguardando resposta, resolvidos, atrasados, média de avaliação e tempo médio, além de gráficos simples não vazios.
- [ ] O layout é profissional, tem textos reais em português do Brasil, cards, tabelas, botões claros e boa leitura em computador e celular.

## 6. Documentação e verificação
- [ ] O README explica Node.js, dependências, criação/execução do MySQL, `schema.sql`, senha/DSN, inicialização, navegador, usuários de teste, Windows pelo VS Code e commits no GitHub.
- [ ] O TypeScript compila, o servidor inicia e os fluxos de cadastro, login, criação de chamado, status e permissões são exercitáveis.
