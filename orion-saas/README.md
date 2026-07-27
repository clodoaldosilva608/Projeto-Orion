# Orion SaaS Platform

Plataforma SaaS para criação, publicação e gestão de aplicações com IA.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (design system dark + glassmorphism)
- Supabase Auth (login/logout via API routes)
- Prisma ORM (reservado para uso futuro; o dashboard usa dados estáticos)

## Páginas

- `/` — Landing page pública
- `/login` — Login (glassmorphism, form POST para `/api/auth/login`)
- `/dashboard` — Painel admin (6 KPIs, receita, donut, status, projetos, atividades, alertas, uso de IA, distribuição, recursos)
- `/produtos` — Catálogo (PagueMenos — R$ 299,00)
- `/deployments` — Tabela de deploys

## Auth

- `POST /api/auth/login` — Supabase `signInWithPassword`, seta cookie `sb-<ref>-auth-token`, redireciona 303 para `/dashboard`
- `POST /api/auth/logout` — limpa o cookie, redireciona para `/login`
- `src/proxy.ts` — proxy do Next.js 16 (antigo middleware). Apenas verifica existência do cookie. ZERO chamadas à API do Supabase.

## Variáveis de ambiente

Veja `.env.example`. Necessário:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

## Desenvolvimento

```bash
bun install
bun run dev
```

## Build

```bash
bun run build   # prisma generate && next build
```

## Credenciais admin

- Email: clodoaldosilva608@gmail.com
- Senha: Silva88677488
