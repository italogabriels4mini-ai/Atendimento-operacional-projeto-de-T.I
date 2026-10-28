# Atendimento Operacional

Sistema web MVC para controlar atendimentos operacionais de uma empresa. O projeto foi feito para ser funcional e fácil de apresentar em um projeto escolar: o front-end usa HTML, CSS e JavaScript sem framework; o back-end usa TypeScript, Node.js e Express; a persistência usa MySQL/MySQL compatível; a API é REST.

## Funcionalidades

O sistema possui cadastro, login, logout, senha com hash bcrypt, sessão por cookie JWT, permissões por perfil e telas responsivas para dashboard, lista de chamados, detalhe com histórico e mensagens, abertura de chamado, avaliação, relatórios, usuários e configurações.

Existem três perfis. Cliente/funcionário abre chamados, consulta apenas os próprios, acompanha mensagens, histórico e avaliação. Atendente operacional acompanha os chamados encaminhados, responde, registra nota interna, atualiza status e responsável. Administrador/gerente acessa todos os chamados, usuários, distribuição, categorias, setores, dashboard e relatórios.

## 1. Instalar no Windows

1. Instale o **Node.js LTS** em [nodejs.org](https://nodejs.org/) e aceite a opção de adicionar o Node ao PATH.
2. Instale o **MySQL Community Server** e, se desejar, o MySQL Workbench em [dev.mysql.com/downloads/](https://dev.mysql.com/downloads/).
3. Instale o **Visual Studio Code** em [code.visualstudio.com](https://code.visualstudio.com/).
4. No VS Code, abra a pasta `atendimento-operacional` e abra o terminal integrado em **Terminal > Novo Terminal**.
5. Confirme as versões com `node --version` e `npm --version`. O projeto usa Node 20 ou superior.

O projeto usa pnpm 10 como gerenciador fixado no `package.json`. Se ainda não possuir pnpm, execute uma vez:

```powershell
corepack enable
corepack prepare pnpm@10.15.0 --activate
```

## 2. Instalar dependências

No terminal do VS Code, dentro da pasta do projeto:

```powershell
pnpm install
```

Também é possível usar `npm install`, mas os scripts documentados e a versão fixada usam pnpm.

## 3. Criar e configurar o banco MySQL

Abra o MySQL Workbench ou o cliente `mysql` e execute o arquivo `database/schema.sql`. Ele cria o banco `atendimento_operacional` e as tabelas `usuarios`, `setores`, `categorias`, `chamados`, `mensagens`, `historico_chamados`, `avaliacoes` e `notificacoes`.

Pelo terminal, um exemplo é:

```powershell
mysql -u root -p < database/schema.sql
```

Depois carregue os dados demonstrativos:

```powershell
mysql -u root -p atendimento_operacional < database/dados-exemplo.sql
```

Para o acesso local, copie o exemplo abaixo para um arquivo `.env` na raiz e altere a senha:

```env
PORT=3000
DATABASE_URL=mysql://root:SUA_SENHA@localhost:3306/atendimento_operacional
JWT_SECRET=troque-esta-chave-em-um-projeto-real
```

Não coloque `.env` no GitHub. Ele já está protegido pelo `.gitignore`. Em ambientes WebDev gerenciados, `DATABASE_URL` pode ser fornecida pelo ambiente; a aplicação usa essa variável antes da configuração de `src/config/database.json`.

## 4. Iniciar o projeto

Para desenvolvimento com atualização automática:

```powershell
pnpm dev
```

Para verificar a compilação:

```powershell
pnpm run check
pnpm run build
```

Para executar a versão compilada:

```powershell
pnpm start
```

Abra [http://localhost:3000](http://localhost:3000). A API de saúde fica em [http://localhost:3000/api/health](http://localhost:3000/api/health).

Se preferir deixar o sistema criar as tabelas a partir do schema na inicialização, use `pnpm run db:init` antes de iniciar. Esse comando não apaga dados: executa instruções `CREATE TABLE IF NOT EXISTS`.

## 5. Usuários de teste

O arquivo `database/dados-exemplo.sql` cria usuários com senha protegida por bcrypt:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@atendops.com` | `Admin@123` |
| Atendente | `atendente@atendops.com` | `Atendente@123` |
| Cliente/funcionário | `cliente@atendops.com` | `Cliente@123` |

O cadastro público sempre cria perfil de cliente/funcionário. A criação de atendentes e administradores fica protegida na área de Usuários do administrador.

## 6. API principal

A API segue REST e usa JSON:

```text
POST   /api/auth/cadastro
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/chamados
POST   /api/chamados
GET    /api/chamados/:id
PUT    /api/chamados/:id
DELETE /api/chamados/:id
POST   /api/chamados/:id/mensagens
PUT    /api/chamados/:id/status
PUT    /api/chamados/:id/atendente
POST   /api/chamados/:id/avaliacao

GET    /api/usuarios
POST   /api/usuarios
PUT    /api/usuarios/:id
POST   /api/usuarios/setores

GET    /api/dashboard
GET    /api/relatorios
GET    /api/catalogos
```

As rotas de usuário e relatório exigem `perfil = admin`. O filtro dos chamados é aplicado no servidor: cliente vê os próprios, atendente vê os atribuídos e o administrador vê todos.

## 7. Arquitetura para explicar em sala

`src/server.ts` monta o Express e as rotas. `src/routes` descreve os endereços da API. `src/controllers` coordena entrada, permissão e resposta. `src/models` concentra SQL parametrizado. `src/middlewares` valida payloads e bloqueia acessos. `src/config/database.ts` cria o pool MySQL e executa o schema idempotente. `public/` contém a página, o CSS e o JavaScript da interface.

A sessão é um JWT assinado no servidor e armazenado em cookie HTTP-only. As senhas nunca são salvas em texto puro: o cadastro usa `bcryptjs`. O front-end não usa `localStorage` para os dados principais; cada dashboard e lista consulta a API e o MySQL.

## 8. Commits e GitHub

No terminal do VS Code:

```powershell
git init
git add .
git commit -m "feat: cria sistema de atendimento operacional"
git branch -M main
git remote add origin https://github.com/italogabriels4mini-ai/Atendimento-operacional-projeto-de-T.I.git
git push -u origin main
```

Antes do commit, confirme que `.env` não aparece em `git status`. Faça commits menores, por exemplo `feat: adiciona autenticação`, `feat: cria API de chamados` e `style: finaliza dashboard`.

## Verificação rápida

Com o servidor ligado, teste login pelo navegador. Depois abra um chamado pelo botão **Abrir chamado**, consulte seu detalhe, envie uma mensagem e entre com o administrador para alterar o status e distribuir o responsável. O comando `pnpm run check` verifica o TypeScript e `GET /api/health` mostra o estado da conexão com o banco.


# Acesso de ADM

Acesso de demonstração: admin@atendops.com / Admin@123
