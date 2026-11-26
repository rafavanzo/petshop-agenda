# 🐾 Patinha Limpa — Sistema de Agendamento de Petshop

Sistema web para gerenciar os **agendamentos de banho e tosa** de um petshop: agenda diária por horário, cadastro de pets e tutores, histórico de atendimentos e gestão da equipe.

O projeto é dividido em duas aplicações:

| Pasta | O que é | Stack |
|---|---|---|
| [`backend/`](backend/) | API REST | NestJS 12, Prisma 7, PostgreSQL 16, JWT |
| [`frontend/`](frontend/) | Interface web | React 19, React Router 7, Vite 8, CSS Modules |

---

## Funcionalidades

### Agenda
- Calendário mensal com a quantidade de agendamentos de cada dia.
- Agenda do dia dividida em horários de **8h às 17h** (um atendimento por horário).
- Novo agendamento com busca de pet e escolha de serviço (**Banho** ou **Tosa**).
- Fluxo de status: `AGENDADO → EM_ANDAMENTO → CONCLUIDO`, ou `AGENDADO → CANCELADO`.
- Regras validadas pela API:
  - não é possível agendar em horário que já passou;
  - um horário lotado não aceita novos agendamentos;
  - o mesmo pet não pode ter dois agendamentos no mesmo horário;
  - só agendamentos com status `AGENDADO` podem ser editados ou remarcados.

### Pets
- Lista com busca por nome do pet, nome do tutor ou telefone, e filtro por espécie (cachorro/gato).
- Cadastro com raça, porte, observações e dados do tutor (nome, telefone, endereço).
- Foto de perfil (JPG, PNG ou WEBP, até 2 MB — o tipo é conferido pelos bytes do arquivo, não pela extensão).
- Ficha do pet com histórico de agendamentos.
- Exclusão restrita ao gerente e bloqueada se o pet já tiver agendamentos.

### Usuários e acesso
- Login com usuário e senha; sessões registradas no banco (expiram em 8h por padrão).
- Dois perfis:
  - **Gerente** — acesso total, incluindo a tela de usuários e a exclusão de pets;
  - **Funcionário** — agenda e pets.
- O gerente cria funcionários, edita nomes, redefine senhas e ativa/desativa contas. Desativar um usuário ou trocar sua senha encerra as sessões abertas dele na hora.

---

## Pré-requisitos

- **Node.js 20.19+ ou 22.12+** (os pacotes do NestJS 12 são ESM)
- **npm**
- **Docker** (para subir o PostgreSQL) — ou um PostgreSQL 16 próprio

---

## Como rodar localmente

### 1. Subir o banco de dados

Na raiz do projeto:

```bash
docker compose up -d
```

Isso cria o container `petshop-db` com PostgreSQL 16 no fuso `America/Sao_Paulo`, acessível em **`localhost:5433`** (usuário `petshop`, senha `petshop123`, banco `petshop`).

### 2. Configurar e iniciar o backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o `.env`:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Conexão com o Postgres. O valor do exemplo já aponta para o container do Docker. |
| `SEED_ADMIN_USUARIO` | Login do gerente criado pelo seed (padrão `admin`). |
| `SEED_ADMIN_SENHA` | Senha desse gerente — **troque o valor do exemplo**. |
| `JWT_SECRET` | Segredo para assinar os tokens. Gere um com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `SESSAO_DURACAO_HORAS` | Duração da sessão em horas (padrão `8`). |
| `PORT` | *(opcional)* Porta da API (padrão `3000`). |

Depois, aplique as migrations, gere o Prisma Client e rode o seed:

```bash
npx prisma migrate deploy --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
npx prisma db seed --config prisma7.config.ts
```

O seed cria o usuário gerente e, se o banco estiver vazio, 3 pets de exemplo. Ele pode ser rodado de novo sem problemas: não duplica dados nem reseta a senha do gerente.

Inicie a API em modo de desenvolvimento:

```bash
npm run start:dev
```

A API fica em **http://localhost:3000**.

### 3. Iniciar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse **http://localhost:5173** e entre com o usuário e a senha definidos em `SEED_ADMIN_USUARIO` / `SEED_ADMIN_SENHA`.

> A API só aceita requisições (CORS) de `http://localhost:5173`. Se o backend estiver em outro endereço, defina `VITE_API_URL` em `frontend/.env` (ex.: `VITE_API_URL=http://localhost:3000`).

---

## Estrutura do projeto

```
petshop/
├── docker-compose.yml        # PostgreSQL 16
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # modelos: Usuario, Sessao, Pet, Agendamento
│   │   ├── migrations/
│   │   └── seed.ts           # gerente padrão + pets de exemplo
│   ├── prisma7.config.ts     # configuração do Prisma CLI (schema, migrations, seed)
│   ├── requests/             # arquivos .http para testar a API
│   ├── uploads/              # fotos dos pets (criada automaticamente, fora do git)
│   └── src/
│       ├── auth/             # login, logout, guards de sessão e de perfil
│       ├── usuarios/         # CRUD de usuários (só gerente)
│       ├── pets/             # CRUD de pets + upload de foto
│       ├── agendamentos/     # agenda, regras de horário e status
│       └── prisma/           # PrismaService
└── frontend/
    └── src/
        ├── api/cliente.ts    # wrapper do fetch com token e tratamento de erros
        ├── auth/             # contexto de autenticação e rotas protegidas
        ├── components/       # Layout, Modal, FotoPet, StatusBadge...
        ├── pages/
        │   ├── Login.tsx
        │   ├── agenda/       # calendário, agenda do dia, novo agendamento
        │   ├── pets/         # lista, formulário e ficha do pet
        │   └── usuarios/     # gestão de usuários
        └── styles/           # tema e estilos globais
```

---

## API

Todas as rotas exigem o header `Authorization: Bearer <token>`, exceto o login. Exemplos prontos estão em [`backend/requests/`](backend/requests/) (use com a extensão REST Client do VS Code ou similar).

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/login` | Login (`{ usuario, senha }`) → `{ token, expiraEm, usuario }` |
| `POST` | `/auth/logout` | Encerra a sessão atual |
| `GET` | `/auth/me` | Dados do usuário logado |

### Pets
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/pets?busca=&especie=` | Lista pets (busca por nome, tutor ou telefone) |
| `GET` | `/pets/:id` | Detalhes do pet |
| `POST` | `/pets` | Cadastra pet |
| `PATCH` | `/pets/:id` | Atualiza pet |
| `POST` | `/pets/:id/foto` | Envia foto (`multipart/form-data`, campo `foto`) |
| `DELETE` | `/pets/:id/foto` | Remove a foto |
| `DELETE` | `/pets/:id` | Exclui pet — **só gerente** |

As fotos são servidas em `/uploads/pets/<arquivo>`.

### Agendamentos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/agendamentos/agenda?data=AAAA-MM-DD` | Horários do dia com vagas e agendamentos |
| `GET` | `/agendamentos/mes?ano=&mes=` | Total de agendamentos por dia do mês |
| `GET` | `/agendamentos/pet/:petId` | Histórico do pet |
| `GET` | `/agendamentos/:id` | Detalhes do agendamento |
| `POST` | `/agendamentos` | Cria agendamento |
| `PATCH` | `/agendamentos/:id` | Edita / remarca |
| `PATCH` | `/agendamentos/:id/status` | Altera o status |

### Usuários (só gerente)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/usuarios` | Lista usuários |
| `GET` | `/usuarios/:id` | Detalhes do usuário |
| `POST` | `/usuarios` | Cria funcionário |
| `PATCH` | `/usuarios/:id` | Atualiza nome |
| `PATCH` | `/usuarios/:id/senha` | Redefine a senha |
| `PATCH` | `/usuarios/:id/desativar` | Desativa (não é possível desativar a si mesmo) |
| `PATCH` | `/usuarios/:id/ativar` | Reativa |

---

## Scripts úteis

### Backend (`backend/`)
| Comando | Descrição |
|---|---|
| `npm run start:dev` | API em modo watch |
| `npm run build` / `npm run start:prod` | Build e execução de produção |
| `npm run lint` | Lint com oxlint |
| `npm run format` | Formata com Prettier |
| `npm test` / `npm run test:e2e` | Testes unitários / e2e (Jest) |
| `npx prisma studio --config prisma7.config.ts` | Interface visual do banco |
| `npx prisma migrate dev --config prisma7.config.ts` | Cria uma nova migration após alterar o `schema.prisma` |

### Frontend (`frontend/`)
| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Checagem de tipos + build de produção |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | Lint com oxlint |

---

## Observações

- **Fuso horário:** banco e API rodam em `America/Sao_Paulo`; datas de agendamento são tratadas como data local (`AAAA-MM-DD`) e a hora como um inteiro de 8 a 17.
- **Capacidade por horário:** definida em `LIMITE_POR_HORARIO` em [`backend/src/agendamentos/agenda.constantes.ts`](backend/src/agendamentos/agenda.constantes.ts), junto com os horários de abertura e fechamento.
- **Prisma Client gerado:** fica em `backend/src/generated/prisma` (fora do git). Rode `prisma generate` sempre que clonar o projeto ou alterar o schema.
