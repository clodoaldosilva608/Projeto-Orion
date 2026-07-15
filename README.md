# Orion — Plataforma de Gestão Comercial

> Plataforma moderna, inteligente e altamente configurável para gestão de equipes comerciais.

## Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Banco de Dados**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticação**: Supabase Auth
- **Hospedagem**: Supabase (DB) + Vercel (App)

## Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Páginas de autenticação (login, register)
│   ├── (app)/              # Páginas autenticadas (dashboard, módulos)
│   ├── api/                # API Routes
│   └── auth/callback/      # OAuth callback
├── core/
│   ├── config/             # Configurações globais
│   ├── middleware/         # Middlewares (auth, tenant, etc.)
│   └── providers/          # React providers globais
├── modules/
│   ├── auth/               # Autenticação e sessão
│   ├── companies/          # Gestão de empresas
│   ├── users/              # Gestão de usuários
│   └── ...                 # Demais módulos
└── shared/
    ├── components/         # Componentes reutilizáveis
    ├── hooks/              # Custom hooks
    ├── lib/                # Clientes (Prisma, Supabase)
    ├── types/              # Tipos globais
    └── utils/              # Utilitários
```

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` com base no `.env.example`:

```bash
cp .env.example .env
```

### 2. Instalação

```bash
npm install
```

### 3. Migrations do banco

```bash
npx prisma migrate dev --name init
```

### 4. Gerar o cliente Prisma

```bash
npx prisma generate
```

### 5. Rodar em desenvolvimento

```bash
npm run dev
```

## Módulos Documentados

| Módulo | Status | Documento |
|--------|--------|-----------|
| Core / Auth | ✅ Configurado | Doc 06 |
| Empresas / Filiais | ✅ Schema criado | Doc 06 |
| Usuários / RBAC | ✅ Schema criado | Doc 06 |
| Metas / Indicadores | ✅ Schema criado | Doc 06 |
| Campanhas | ✅ Schema criado | Doc 06 |
| Dashboard / Widgets | ✅ Schema criado | Doc 06 |
| IA | 🔲 V2.0 | Doc 12 |
| Plugins | 🔲 V2.0 | Doc 24 |

## Documentação Completa

Consulte a pasta `../documentacao-01/` para acesso ao dossiê completo com 29 documentos técnicos.
