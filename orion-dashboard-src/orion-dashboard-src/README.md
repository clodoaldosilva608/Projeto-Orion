# Orion Dashboard - Código de Implementação

Código fonte do painel do Orion SaaS Platform, conforme Documento 29 (Customer Journey and License Lifecycle v1.0.0).

## 📁 Estrutura de Arquivos

```
orion-dashboard-src/
├── prisma/
│   ├── schema.prisma          # 11 modelos do banco de dados
│   └── seed.ts                # Dados de demonstração
└── src/
    ├── app/
    │   └── page.tsx           # Página principal (Server Component)
    ├── lib/
    │   ├── db.ts              # Cliente Prisma
    │   └── orion-data.ts      # Serviço de dados do dashboard
    └── components/
        └── orion/
            └── orion-dashboard.tsx  # Componente principal (6 views)
```

## 🚀 Instalação

### 1. Pré-requisitos

- Node.js 18+ (recomendado 20+)
- Next.js 14+ com App Router
- TypeScript 5+
- Prisma ORM

### 2. Instalar dependências

```bash
npm install bcryptjs @types/bcryptjs framer-motion lucide-react
# ou
bun add bcryptjs @types/bcryptjs framer-motion lucide-react
```

### 3. Componentes shadcn/ui necessários

```bash
npx shadcn@latest add button card badge avatar separator
```

### 4. Configurar variável de ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# SQLite (desenvolvimento)
DATABASE_URL="file:./db/custom.db"

# PostgreSQL (produção)
# DATABASE_URL="postgresql://user:pass@host:5432/orion"
```

### 5. Aplicar schema e gerar cliente Prisma

```bash
npx prisma db push
npx prisma generate
```

### 6. Popular banco com dados de demonstração

```bash
npx tsx prisma/seed.ts
# ou
npx prisma db seed
```

### 7. Rodar projeto

```bash
npm run dev
# ou
bun run dev
```

Acesse: http://localhost:3000

## 📊 Funcionalidades Implementadas

O dashboard possui **7 views** (alinhado aos Documentos 06, 08, 09 e 10):

### 1. Dashboard (Overview)
- Cards de estatísticas: Aplicações, Licenças Ativas, Total Investido, Chamados
- Aplicações recentes
- Notificações
- **Atividade Recente (feed de AuditLog)** — logins, downloads, publicações etc.

### 2. Aplicações
- Lista completa com 8 estados (Draft → Publicada → Arquivada)
- Versão, nicho, complexidade, data de publicação
- **Tags de funcionalidades (features)** por aplicação

### 3. Atualizações (NOVA)
- Versionamento (AppUpdate) com changelog por aplicação
- Tipo: Correção / Melhoria / Novidade / Segurança
- Status: Pendente / Publicada / Revertida
- Badge de pendentes no menu lateral

### 4. Licenças
- License key, plano (Starter/Professional/Enterprise/Trial)
- Validade, auto-renovação, trial expiry
- 7 estados (Criada → Ativa → Suspensa → Expirada)

### 5. Downloads
- Apps disponíveis para download
- Histórico com dispositivo, IP, status
- URL assinada + token único

### 6. Financeiro
- Total pago, pendências
- Histórico de pagamentos via Stripe (cartão/PIX/boleto)
- Notas fiscais com link

### 7. Suporte
- Chamados com prioridade (Baixa/Normal/Alta/Urgente)
- Status (Aberto/Em Andamento/Resolvido/Fechado)
- Categorias (Técnico/Financeiro/Licença/Geral)

## 🗄️ Modelos do Banco de Dados (11)

| Modelo | Descrição |
|--------|-----------|
| Customer | Clientes com MFA, status, niche |
| Application | Aplicações com 8 estados de ciclo de vida |
| AppUpdate | Versionamento de aplicações |
| License | Licenças com 7 estados, trial, auto-renovação |
| Payment | Pagamentos Stripe (card, pix, boleto) |
| Download | Downloads com URL assinada e token único |
| SupportTicket | Chamados de suporte |
| TicketMessage | Mensagens dos chamados |
| Notification | Notificações (6 tipos) |
| AuditLog | Logs de auditoria |

## 🔧 Configuração do package.json

Adicione ao seu `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## 🎨 Design System (Doc 09)

O arquivo `src/app/globals.css` traz os tokens oficiais do Documento 09:
- **Cor primária:** `#1E3A8A` (azul corporativo Orion) — aplicada em logo, avatar, item de menu ativo, IA Coach e destaques.
- **Tipografia:** Inter (utilitários `.text-h1`, `.text-h2`, `.text-h3`, `.text-overline`) + JetBrains Mono para IDs/versões.
- **Cores semânticas** (success/warning/danger/info/accent), **neutras**, **tema escuro** (`.dark`), **raios** e **sombras**.

Importe uma vez no layout raiz: `import '@/app/globals.css'`.

## 📝 Notas

- O componente `orion-dashboard.tsx` é um Client Component ('use client')
- A página `page.tsx` é um Server Component que busca dados do banco
- O serviço `orion-data.ts` contém todas as queries do banco
- O seed cria 5 clientes, 6 aplicações, 5 licenças, 5 pagamentos, 3 downloads, 5 tickets, 5 notificações
- Para PostgreSQL, basta trocar o provider no schema.prisma de `sqlite` para `postgresql`

## 🔗 Documentação Relacionada

- Documento 29: Customer Journey and License Lifecycle v1.0.0
- Documento 04: Software Architecture Document
- Documento 06: Logical Database Model
- Documento 09: UX/UI Design System
