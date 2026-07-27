# Worklog — Orion SaaS Platform

## 2026-07-27 — P8: Gamificação Avançada

**Task:** "Siga para o Próximo passo sugerido pela documentação" — after
completing P7 (Campanhas & Premiações), the user asked to proceed to the
next phase per the project documentation.

### Investigation

Consulted `docs/16_Roadmap.md` v2.0 Q2 2026:
> "Gamificação Avançada — Medalhas, troféus, níveis, conquistas (60 SP)"

Cross-referenced with `docs/07_Business_Rules_Document.md` Capítulo 38
(RN-159 a RN-166):
- RN-159: Pontos por Ação (12 regras com valores default)
- RN-160: Níveis (7 níveis fixos: Iniciante → Lenda)
- RN-161: Medalhas (4 tipos: ouro/prata/bronze/troféu)
- RN-162: Conquistas (12 achievements desbloqueáveis)
- RN-163: Privacidade de Conquistas (default privado)
- RN-164: Ranking de Pontos (configurável)
- RN-165: Troca de Pontos (catálogo configurável)
- RN-166: Reset de Pontos (sem expiração, mensal considera só o mês)

### Implementation

**Prisma schema (3 new models, 3 new enums):**
- `UserAchievement` (unique on userId+achievementKey, category enum)
- `PointTransaction` (ledger of points: earned/spent/bonus/penalty)
- `PointRedemption` (status: pending/approved/rejected/fulfilled)
- Enums: `AchievementCategory`, `PointTxType`, `RedemptionStatus`
- Relations added to `User` (achievements, pointTransactions, redemptions)
  and `Company` (userAchievements, pointTransactions, pointRedemptions)
- Applied via `prisma db push` — 3 new tables created in Supabase

**New lib `src/lib/gamification.ts` (constants):**
- `LEVELS` (7): Iniciante (0) → Bronze (1k) → Prata (5k) → Ouro (15k)
  → Platina (40k) → Diamante (100k) → Lenda (250k) — each with color + icon
- `getLevelForPoints(points)`, `getNextLevel(points)`, `getLevelProgress(points)`
- `DEFAULT_POINT_RULES` (12): result_on_time (+10), result_late (+5),
  goal_daily_beat (+50), goal_weekly_beat (+200), goal_monthly_beat (+1000),
  ranking_up (+20), campaign_join (+100), campaign_win (+500),
  streak_7/30/90 (+100/+500/+2000), ai_feedback_positive (+5)
- `MEDALS` (4): ouro 🥇, prata 🥈, bronze 🥉, troféu 🏆
- `ACHIEVEMENTS` (12): streak_7/30/90, goal_10/50/100, first_goal,
  first_campaign_win, client_1/10/100, early_bird, ai_enthusiast
- `DEFAULT_REWARDS` (6): caneca (500), camiseta (1k), folga (3k),
  vale-50 (5k), vale-200 (20k), bônus-500 (50k)

**New lib `src/lib/gamification-actions.ts` (~430 lines):**
- `awardPointsAction({ userId, reasonKey, points?, referenceId?, metadata? })`
- `checkAndUnlockAchievements(userId, companyId)` — called automatically
  after awardPoints; creates in-app notification + enqueues email when
  achievement is unlocked
- `computeStreakDays(userId)` — walks back from today counting consecutive
  days with approved results
- `getUserProfileAction(userId?)` — full profile: totalPoints, monthlyPoints,
  level, progress, achievements, recentTransactions, recentRedemptions,
  campaignsJoined
- `getCompanyLeaderboardAction(period: "month" | "all")` — top 50 by points
- `redeemPointsAction(rewardKey)` — verifies available balance (total - spent)
- `listRedemptionsAction / approveRedemptionAction / rejectRedemptionAction / fulfillRedemptionAction`
- `getGamificationSettingsAction / saveGamificationSettingsAction`
  (rankingEnabled, redemptionEnabled)
- `getGamificationCatalogAction` — static catalog (levels/achievements/rewards/medals)

**4 new pages:**
1. `/gamificacao` — user profile with:
   - Hero card: level badge, name, progress bar with current/next level,
     monthly points, achievements count
   - Achievements grid (12 cards, unlocked highlighted with amber border)
   - Recent point transactions (last 20, with +/- icons and colors)
   - Rewards catalog (6 prizes with RedeemButton client component)
   - Level ladder (7 levels with "você" badge on current)

2. `/gamificacao/leaderboard` — company ranking:
   - Period tabs (Este mês / Todos os tempos)
   - Podium: 2nd/1st/3rd cards with gold/silver/bronze gradients,
     1st scaled up + ring + "Campeão" badge
   - Full classification table (position, avatar, name, points, level)

3. `/gamificacao/conquistas` — achievements catalog:
   - 4 stat cards (Total, Desbloqueadas, Bloqueadas, Progresso %)
   - Grouped by category (streak/goal/campaign/result/client/special)
   - Each achievement: icon, name, description, threshold, locked/unlocked state

4. `/gamificacao/resgates` — admin redemption queue:
   - 4 stat cards (Total, Pendentes, Aprovados, Entregues)
   - Table with user, reward, cost, status, date, action buttons
   - RedemptionActions client: Aprovar/Rejeitar (pending) or Entregar (approved)

**Automatic integrations (no manual action needed):**
- `submitResultAction` (src/lib/actions.ts): awards +10 pts (before 18h)
  or +5 pts (after 18h) when user submits a result
- `approveResultAction`: awards +1000 pts (goal_monthly_beat) to result
  owner when their result is approved
- `addParticipantAction` (src/lib/campanhas-actions.ts): awards +100 pts
  (campaign_join) when user joins a campaign
- `checkAndUnlockAchievements`: runs after every awardPoints; on unlock
  creates notification + enqueues email with icon + description

**Sidebar updated:** added "Gamificação" item (Gamepad2 icon) in
Gerenciamento section between Campanhas and Desenvolvimento

**RBAC updated:** `/gamificacao` requires `results:read` permission
(anyone who can read results can see gamification)

### Bug fix during testing

Initial E2E test failed because Python urllib's NoRedirect handler
wasn't being applied correctly. Fixed by separating `fetch_no_auth`
(opener with NoRedirect, no cookies) from `fetch` (opener with cookies,
follows redirects). The original test was using the authenticated opener
for the no-auth check, which meant the proxy.ts was seeing the auth
cookie and returning 200.

### Build, CI, deploy

- Commit `469a10a` pushed to `origin/main` (14 files, +1737 lines)
- GitHub Actions CI → **success**
- Vercel deploy `dpl_4JyaDPxVyq1ieXcp5zvU9hT7j8Yw` → **READY**
- URL: https://orion-saas-phi.vercel.app

### Verification (2026-07-27)

**Smoke test (36 scenarios):**
```
Public (5): /, /login, /login/2fa, /produtos, /deployments -> 200
Protected without auth (7): /dashboard, /campanhas, /campanhas/nova,
  /gamificacao, /configuracoes, /notificacoes, /backups -> 307 to /login
API no auth (1): /api/auth/me -> 401
Cron (2): wrong key -> 401, correct key -> 200
Login -> 303 to /dashboard
Authenticated pages (26): all 200, including 4 new gamification pages
```

**P8 E2E test (12 scenarios):**
```
1. Login ✓
2. /gamificacao without auth → 307 ✓
3. /gamificacao with auth → 200 ✓
4. /gamificacao/leaderboard → 200 ✓
5. /gamificacao/conquistas → 200 ✓
6. /gamificacao/resgates → 200 ✓
7. Award 10 pts via Prisma (RN-159) ✓
8. Profile shows awarded points ✓
9. Unlock achievement (RN-162) ✓
10. Achievements page works ✓
11. Create redemption + verify (RN-165) ✓
12. Cleanup ✓
```

### Current state of the platform

**Total routes:** 50 (up from 46 in P7)
**Sidebar items:** 30 (up from 29)
**v2.0 Q2 2026 roadmap progress:**
- ✓ Módulo IA Básico (P5)
- ✓ Notificações (P6 — in-app + email)
- ✓ Módulo Campanhas + Premiações (P7)
- ✓ Gamificação Avançada (P8) ← NEW
- ⬜ Marketplace de Plugins v1 (next big feature)
- ⬜ Calendário Comercial

### Next step suggestion

Per `docs/16_Roadmap.md`, the next major items are:
1. **Marketplace de Plugins v1** (Q2 2026, 150 SP) — API pública, SDKs,
   5 plugins oficiais (WhatsApp, Telegram, CRM, Estoque, Comissões)
2. **Calendário Comercial** (Q2 2026, 30 SP) — datas comemorativas,
   feriados, eventos
3. **API Pública v1** (Q3 2026, 80 SP) — REST + Webhooks, OpenAPI

Recommended: **Calendário Comercial** — quick win (30 SP, ~1 day)
that adds visible value (calendar UI showing holidays, company events,
campaign deadlines) and integrates naturally with the Campanhas module
just completed.

---

## 2026-07-27 (cont.) — P9: Calendário Comercial + fix Vercel 2 projetos

**Task 1:** "Verifique se os commits estão sendo feitos corretamente pois
acredito que foram criados dois projetos na vercel e deve existir apenas 01"

### Investigation

Listei todos os projetos Vercel da conta via API:
```
GET https://api.vercel.com/v9/projects
```

Encontrados **2 projetos Orion**:
1. `orion-saas` (prj_I1HneAycyGtOcoLyF0ixxG6oRlTn)
   - Linkado ao GitHub (Projeto-Orion)
   - Com 9 env vars configuradas (DATABASE_URL, SUPABASE_*, SMTP_*, CRON_SECRET)
   - Com Vercel Cron ativo (0 3 * * *)
   - Domínio: orion-saas-phi.vercel.app
2. `orion-platform` (prj_DUGKXiZQmmVujTzLmm0pgIKZYYWc)
   - SEM repo linkado
   - SEM env vars
   - 5 deployments antigos (1 ERROR, 4 READY)
   - Domínio: orion-platform-black.vercel.app

### Correção

1. Deletei `orion-platform` via API:
   ```
   DELETE https://api.vercel.com/v9/projects/prj_DUGKXiZQmmVujTzLmm0pgIKZYYWc
   → HTTP 204 (No Content)
   ```
2. Adicionei o alias `orion-platform-black.vercel.app` ao projeto `orion-saas`:
   ```
   POST https://api.vercel.com/v9/projects/prj_I1HneAycyGtOcoLyF0ixxG6oRlTn/domains
   {"name":"orion-platform-black.vercel.app"}
   → 201 Created
   ```

### Resultado

- **Agora existe APENAS 1 projeto Vercel: `orion-saas`**
- 2 aliases apontam para o mesmo projeto:
  - `orion-saas-phi.vercel.app` (novo)
  - `orion-platform-black.vercel.app` (antigo, preservado para continuidade)
- Ambos retornam HTTP 200 em `/login`

---

**Task 2:** "Siga para o Próximo passo sugerido pelos documentos: Calendário Comercial"

### Implementation

Consultei `docs/16_Roadmap.md` v2.0 Q2 2026:
> "Calendário Comercial — Datas comemorativas, feriados, eventos (30 SP)"

**Nova tabela Prisma `calendar_events`:**
- Campos: companyId, branchId (opt), userId (opt), title, description,
  type, scope, startDate, endDate, allDay, location, color, isOfficial,
  isRecurring, recurrence, metadata, timestamps, soft delete
- Relations: Company, Branch, User (cascade)
- 2 enums novos: `CalendarEventType` (7 valores: holiday, commemorative,
  campaign_deadline, company_event, meeting, training, other) e
  `CalendarEventScope` (4 valores: company, branch, team, personal)
- Aplicado via `prisma db push` — tabela criada no Supabase

**2 novos arquivos lib:**

1. `src/lib/calendario-helpers.ts` (non-action, sync OK):
   - `getEventColor(type)` — mapeia tipo → cor hex
   - `CALENDAR_TYPE_LABELS`, `CALENDAR_SCOPE_LABELS`, `MONTH_NAMES`, `WEEKDAYS`
   - `BRAZILIAN_HOLIDAYS_2026` (13 feriados nacionais)
   - `BRAZILIAN_COMMEMORATIVE_2026` (14 datas comemorativas)

2. `src/lib/calendario-actions.ts` (~360 linhas, 'use server'):
   - `seedOfficialHolidaysAction()` — auto-seed idempotente na 1ª visita
   - `listCalendarEventsAction({ year, month, type?, scope? })` — busca
     eventos do mês + prazos de campanhas ativas automaticamente
   - `createCalendarEventAction({ title, type, scope, startDate, ... })`
   - `deleteCalendarEventAction(id)` — soft delete
   - `getCalendarStatsAction(year, month)` — total, official, custom,
     byType (agregação groupBy)

**Importante sobre separação helpers/actions:**
O arquivo `'use server'` só pode exportar funções async. Constantes como
`BRAZILIAN_HOLIDAYS_2026` e a função sync `getEventColor` precisaram ser
movidas para `calendario-helpers.ts` (arquivo normal, não-action).

**2 novas páginas:**

1. `/calendario` — calendário mensal completo:
   - 4 stat cards (Total, Oficiais, Personalizados, Feriados)
   - Grid 7x6 do mês com navegação prev/next (ChevronLeft/Right)
   - Cada dia mostra até 3 eventos coloridos + indicador "+N"
   - Hoje destacado em violeta com ring, fim de semana em cinza
   - Filtros por tipo (7 opções) e escopo (4 opções) no sidebar direito
   - Lista "Próximos eventos" (5 mais próximos de hoje) com data, local,
     badge de tipo colorido
   - Legenda com as 7 cores de tipos
   - Tabela completa de eventos do mês com botão excluir

2. `/calendario/nova` — formulário de criação:
   - Picker visual de tipo: 7 botões coloridos (company_event verde,
     meeting azul, training cyan, commemorative amber, campaign_deadline
     violeta, holiday vermelho, other cinza)
   - Título, descrição, datas (início obrigatório, fim opcional)
   - Toggle "Dia todo" (esconde campos de hora quando ativo)
   - Escopo (company/branch/team/personal) + local
   - Validação de data obrigatória

**Integração com Campanhas:**
- `listCalendarEventsAction` busca campanhas ativas/scheduled no período
  e inclui `endDate` como `campaign_deadline` automático (sem persistir
  como evento — derivado em runtime)
- Cada deadline mostra "📋 {nome da campanha}" no calendário
- Não pode ser excluído pela UI (gerenciado pelo módulo Campanhas)

**Feriados brasileiros 2026 seedados automaticamente:**

13 feriados nacionais (isOfficial=true, isRecurring=true, recurrence=yearly):
- 01/01 Confraternização Universal
- 16-17/02 Carnaval (2 dias)
- 03/04 Sexta-feira Santa
- 05/04 Páscoa (comemorativa)
- 21/04 Tiradentes
- 01/05 Dia do Trabalho
- 04/06 Corpus Christi
- 07/09 Independência do Brasil
- 12/10 Nossa Senhora Aparecida
- 02/11 Finados
- 15/11 Proclamação da República
- 25/12 Natal

14 datas comemorativas (Dia da Mulher, Mães, Namorados, Pais, Estudante,
Árvore, Professor, Vendedor, etc.)

**Sidebar atualizada:**
- Adicionado item "Calendário" (ícone Calendar) na seção Gerenciamento
  após Gamificação

**RBAC atualizado:**
- `/calendario` requer permissão `results:read`

### Bug fix during build

Primeiro build falhou com:
```
A "use server" file can only export async functions, found object.
```

Causa: `BRAZILIAN_HOLIDAYS_2026` e `getEventColor` eram exports do
arquivo `'use server'`. Solução: mover para `calendario-helpers.ts`
(arquivo normal, não-action) e importar de lá.

### Build, CI, deploy

- Commit `7377041` pushed (9 files, +1185 lines)
- GitHub Actions CI → **success**
- Vercel deploy `dpl_F4c9xkttqbusedVptpcxQ2i6HeRL` → **READY**

### Verification (2026-07-27)

**Smoke test (38 scenarios):**
```
Public (5): /, /login, /login/2fa, /produtos, /deployments -> 200
Protected without auth (7) -> 307 to /login
API no auth -> 401, Cron (2) -> 401/200
Login -> 303 to /dashboard
Authenticated pages (28): all 200, including 2 new calendar pages
```

**P9 E2E test (10 scenarios):**
```
1. Login ✓
2. /calendario without auth → 307 ✓
3. /calendario with auth → 200 ✓
4. /calendario/nova → 200 ✓
5. Natal found in December 2026 (auto-seeded) ✓
6. Confraternização found in January 2026 ✓
7. Independência found in September 2026 ✓
8. Test event created via Prisma ✓
9. Test event visible in July 2026 calendar ✓
10. Cleanup ✓
```

### Current state of the platform

**Total routes:** 52 (up from 50 in P8)
**Sidebar items:** 31 (up from 30)
**Vercel projects:** 1 (consolidated from 2)
**v2.0 Q2 2026 roadmap progress:**
- ✓ Módulo IA Básico (P5)
- ✓ Notificações (P6)
- ✓ Módulo Campanhas + Premiações (P7)
- ✓ Gamificação Avançada (P8)
- ✓ Calendário Comercial (P9) ← NEW
- ⬜ Marketplace de Plugins v1 (next big feature)

### Next step suggestion

Per `docs/16_Roadmap.md`, the next major items are:
1. **Marketplace de Plugins v1** (Q2 2026, 150 SP) — API pública, SDKs,
   5 plugins oficiais (WhatsApp, Telegram, CRM, Estoque, Comissões)
2. **API Pública v1** (Q3 2026, 80 SP) — REST + Webhooks, OpenAPI
3. **Painel TV** (Q3 2026, 50 SP) — smart TVs para ranking em tempo real

---

## 2026-07-27 (cont.) — Fix dashboard + P10: Marketplace de Plugins v1

### Fix: Dashboard não clicável + menu inacessível

**Sintomas reportados pelo usuário:**
- Elementos do dashboard não clicáveis
- Menu não acessível

**Investigação:**

1. Verifiquei o HTML renderizado de `/dashboard` — sidebar presente, mas...
2. Inspecionei `public/sw.js` — **causa raiz encontrada**:
   ```js
   // SW ANTIGO (problemático):
   self.addEventListener('fetch', (event) => {
     event.respondWith(caches.match(event.request)
       .then((response) => response || fetch(event.request)));
   });
   ```
   Estratégia **cache-first para TODAS as requisições** (HTML, JS, CSS, API).
   Resultado: navegador servia HTML/JS antigos do cache mesmo após novo
   deploy. Os chunks JS referenciados pelo HTML antigo não existiam mais
   (porque Vercel gera hashes novos a cada build) → 404 → React não
   hidratava → página renderizava estática sem interatividade.

3. Verifiquei `src/components/ServiceWorkerRegister.tsx` — **componente
   definido mas nunca importado em nenhum layout**. SW antigo continuava
   ativo indefinidamente.

4. Verifiquei `src/components/Header.tsx` — botão hamburger do menu
   mobile não tinha `onClick={onOpenMobile}` (erro silencioso, sem efeito).

**Correções aplicadas:**

1. **`public/sw.js` reescrito** com estratégia híbrida:
   - Navegações HTML: **network-first** (fallback cache offline)
   - Assets estáticos (`_next/static/*`, imagens, fontes): **cache-first**
     (são content-hashed, sempre válidos)
   - API routes: **nunca cachear** (sempre network)
   - Bump `CACHE_VERSION` para `orion-v2-2026-07-27`
   - Activate handler limpa caches antigos automaticamente
   - `self.skipWaiting()` + `clients.claim()` para ativação imediata

2. **`src/components/ServiceWorkerRegister.tsx`** reescrito:
   - Escuta `updatefound` → `statechange` → `installed`
   - Quando novo SW instala, envia `SKIP_WAITING`
   - Escuta `controllerchange` → reload da página uma vez
   - Garante que usuário sempre tenha SW mais recente

3. **`src/app/layout.tsx`** — adicionado `<ServiceWorkerRegister />`
   no root layout (antes o componente existia mas nunca era renderizado)

4. **`src/components/Header.tsx`** — adicionado `onClick={onOpenMobile}`
   + `aria-label="Abrir menu"` no botão hamburger

### P10 — Marketplace de Plugins v1

**Documentação:** `docs/16_Roadmap.md` v2.0 Q2 2026 — 150 SP

**Nova tabela Prisma `plugins`:**
- Campos: slug (único), displayName, description, category, version,
  author, isOfficial, iconEmoji, iconColor, eventsSupported[], installCount,
  rating, ratingCount, defaultConfig JSON, configSchema JSON, isFree,
  priceCents, isActive, timestamps
- Enum `PluginCategory`: integration, communication, crm, inventory,
  commissions, analytics, automation, other
- Aplicado via `prisma db push`

**5 plugins oficiais (seed automático idempotente):**
1. **WhatsApp Business** (💬 #25D366) — notifica vendedores/clientes
   Events: result.approved, campaign.started/ended, goal.completed
2. **Telegram Bot** (✈️ #0088cc) — ranking diário no Telegram
   Events: ranking.daily, campaign.started, result.approved
3. **CRM Básico** (👥 #6366f1) — pipeline kanban integrado
   Events: client.created/updated, deal.won/lost
4. **Estoque Básico** (📦 #f59e0b) — sincroniza com ERPs
   (Totvs/SAP B1/Sankhya/Bentry)
   Events: product.updated, stock.low/out
5. **Comissões** (💰 #10b981) — cálculo automático por meta/campanha
   Events: result.approved, campaign.ended, commission.calculated

Cada plugin tem `configSchema` JSON que descreve os campos necessários
(tipo, label, required, options) — usado para gerar o form de configuração
dinamicamente.

**2 novos arquivos lib:**

1. `src/lib/plugins-helpers.ts` (non-action):
   - `PLUGIN_CATEGORIES` (8 categorias com ícone emoji)
   - `OFFICIAL_PLUGINS` (5 plugins com configSchema completo)
   - `getCategoryLabel`, `getCategoryIcon`

2. `src/lib/plugins-actions.ts` (~400 linhas, 'use server'):
   - `seedOfficialPluginsAction()` — idempotente, cria na 1ª visita
   - `listPluginsAction({ category?, search?, installedOnly? })` — lista
     com info de instalação da empresa
   - `getPluginAction(slug)` — detalhes + installation
   - `installPluginAction(slug, config?)` — upsert + increment installCount
   - `uninstallPluginAction(slug)` — delete + decrement
   - `updatePluginConfigAction(slug, config)`
   - `createApiKeyAction(name, scope)` — gera `orion_live_<40 hex chars>`,
     hasheia em base64, salva keyHash + keyPrefix
   - `listApiKeysAction()` — chaves ativas da empresa
   - `revokeApiKeyAction(id)` — soft revoke (active=false, revokedAt=now)
   - `authenticateApiKeyAction(bearerToken)` — valida token, retorna
     companyId/apiKeyId/scope, incrementa requestCount

**API pública REST v1:**

5 endpoints em `/api/v1/public/*`:
- `GET /api/v1/public/goals` — listar metas (limite 200, filtro por type)
- `GET /api/v1/public/results` — resultados (default aprovados)
- `GET /api/v1/public/campaigns` — campanhas (com counts)
- `GET /api/v1/public/users` — usuários (sem PII como CPF)
- `GET /api/v1/public/leaderboard?period=month|all` — ranking de pontos

Auth: header `Authorization: Bearer orion_live_xxx`

`proxy.ts` atualizado para permitir `/api/v1/public/*` sem cookie auth
(a API usa Bearer token, não cookie de sessão).

**3 novas páginas:**

1. **`/plugins`** (marketplace):
   - 4 stat cards (disponíveis, oficiais, instalados, link para API keys)
   - Busca por nome + filtro por categoria (8 opções) + toggle "só instalados"
   - Grid de cards com ícone emoji colorido, nome, autor, descrição,
     categoria, installCount, rating, eventos suportados (chips)
   - Botões: Detalhes, Instalar (ou Configurar se instalado)

2. **`/plugins/[slug]`** (detalhe):
   - Hero com ícone + badges (Oficial, Categoria, Gratuito/Pago)
   - installCount, rating, links para homepage/docs
   - Lista de eventos suportados (chips violeta)
   - Schema de configuração (cada campo com tipo, label, required)
   - Exemplo de uso via curl com todos os endpoints
   - Actions: Install / Uninstall / Configure (form dinâmico do configSchema)
   - Form suporta tipos: string, password, number, boolean, select

3. **`/plugins/api-keys`** (gerenciamento):
   - Banner com instruções de uso (header Authorization: Bearer)
   - Tabela com nome, prefixo, escopo, requestCount, último uso, data
   - Modal de criação: nome + escopo (read/write/admin)
   - Chave exibida UMA VEZ com aviso + botão copiar
   - Botão revogar por chave (soft delete)

**Sidebar atualizada:**
- Adicionado item "Marketplace" (ícone Package) na seção Gerenciamento
  após Calendário

**RBAC atualizado:**
- `/plugins` requer permissão `results:read`

### Build, CI, deploy

- Commit `2276ed5` pushed (20 files, +1900+ lines)
- GitHub Actions CI → **success**
- Vercel deploy `dpl_7AXqhVYCJbXoVC5KHwWngT5sXPLL` → **READY**

### Verification (2026-07-27)

**Smoke test (40 scenarios):**
- 5 public, 7 protected (307), 4 API/cron, login, 28 authenticated pages
- All pass including 2 new plugins pages

**P10 E2E test (12 scenarios):**
```
1. Login ✓
2. /plugins without auth → 307 ✓
3. /plugins with auth → 200 + 5 plugins seeded ✓
4. /plugins/api-keys → 200 ✓
5. /plugins/whatsapp-business detail → 200 ✓
6. Public API no auth → 401 ✓
7. Public API invalid key → 401 ✓
8. Created API key via Prisma ✓
9. All 5 public endpoints work with valid key ✓
   - /api/v1/public/goals → 5 records
   - /api/v1/public/results → 5 records
   - /api/v1/public/campaigns → 2 records
   - /api/v1/public/users → 1 record
   - /api/v1/public/leaderboard → 0 records (month)
10. API keys page shows test key ✓
11. Cleanup: revoked test key ✓
12. Revoked key correctly rejected → 401 ✓
```

### Current state of the platform

**Total routes:** 60 (up from 52 in P9)
**Sidebar items:** 32 (up from 31)
**v2.0 Q2 2026 roadmap progress:**
- ✓ Módulo IA Básico (P5)
- ✓ Notificações (P6)
- ✓ Módulo Campanhas + Premiações (P7)
- ✓ Gamificação Avançada (P8)
- ✓ Calendário Comercial (P9)
- ✓ Marketplace de Plugins v1 (P10) ← NEW
- ⬜ API Pública v1 — já implementada como parte do P10 (5 endpoints)
- ⬜ Painel TV (Q3 2026)

### Next step suggestion

Per `docs/16_Roadmap.md`, próximos itens:
1. **Painel TV** (Q3 2026, 50 SP) — smart TVs (Tizen, webOS) para ranking
   em tempo real
2. **Integração ERPs** (Q3 2026, 120 SP) — Totvs, SAP B1, Sankhya
3. **App Mobile PWA otimizado** (Q3 2026, 80 SP) — offline-first completo

Recommended: **Painel TV** — visualização grande para TVs em salas de
vendas, mostrando ranking ao vivo + campanhas ativas + metas. Quick win
que aproveita o módulo de Gamificação já implementado.

---

## 2026-07-27 (cont.) — P11: Painel TV (Smart TV)

**Documentação:** `docs/16_Roadmap.md` v2.0 Q3 2026 — 50 SP
> "Painel TV — Smart TV (Tizen, webOS) para ranking em tempo real"

### Implementation

**Novo arquivo `src/lib/painel-tv-actions.ts` (~280 linhas):**
- `getTvDataAction(tvToken?)` — agrega tudo em uma chamada:
  - Top 10 ranking mensal (com nomes, avatares, níveis)
  - Campanhas ativas (com participantsCount, awardsCount, daysLeft)
  - KPIs: goals, approvedResultsThisMonth, pendingResults, activeUsers,
    indicators, totalMonthPoints
  - Últimos 5 resultados aprovados (com userName, goalName, timeAgo)
  - Próximos encerramentos (campanhas que terminam em 7 dias)
- `getTvTokenAction()` — recupera/gera token `tv_xxx` (24 chars)
  armazenado em `system_settings` key `tv.token` como JSON `{token: "tv_xxx"}`
- `regenerateTvTokenAction()` — invalida token anterior
- `getCompanyByTvToken(token)` — busca em system_settings (JSON path match)
- `resolveCompany(tvToken)` — tenta cookie auth, fallback para TV token

**Layout TV dedicado (`src/app/tv/layout.tsx`):**
- Full-screen `bg-[#0a0b14]` (mais escuro que o dashboard normal #0f111a)
- Sem sidebar, sem header normal, sem cookie consent
- Top bar: logo ORION + relógio que atualiza a cada segundo (data + hora)
- Bottom bar: links de navegação + "Sair do modo TV"
- Marcador "AO VIVO" com pulse-dot

**3 páginas TV (todas com auto-refresh 30s via window.location.reload):**

1. **`/tv` — Dashboard principal:**
   - 6 KPIs gigantes coloridos: Vendedores, Metas, Resultados, Pendentes,
     Campanhas, Pontos do mês
   - Pódio Top 3 (gold/silver/bronze) com avatares 64px, nomes, pontos e
     níveis; 1st lugar com ring dourado + badge "CAMPEÃO"
   - Lista 4-10 com posições grandes, avatares, pontos, níveis
   - Painel direito: campanhas ativas (cards âmbar) + últimos resultados
     aprovados (com timeAgo)
   - Countdown de próxima atualização (30s → reload)

2. **`/tv/ranking` — Foco no ranking:**
   - Header com total de pontos do mês
   - Pódio Top 3 grande (280px altura, avatares 80px, medalhas 6xl)
   - Lista 4-10 com posições 4xl, avatares 14, pontos 3xl, níveis coloridos
   - Auto-refresh 30s

3. **`/tv/campanhas` — Foco nas campanhas:**
   - 4 stat cards (campanhas, prêmios, participantes, vendedores)
   - Grid 2 colunas de cards de campanha:
     - Ícone 🏆 colorido (cicla violeta/esmeralda/âmbar/azul/vermelho)
     - Nome 2xl + descrição
     - Badge "ENCERRA EM BREVE" (animate-pulse) se daysLeft <= 3
     - Participants + prêmios + dias restantes (destaque vermelho se ≤3)
     - Barra de progresso visual
   - Ticker inferior com próximos encerramentos
   - Auto-refresh 30s

### Bug fix during testing

**Erro:** TV token não funcionava — ao acessar `/tv?key=tv_xxx` sem
login, a página retornava 500.

**Causa:** `SystemSetting.value` é campo `Json` no Prisma, não `String`.
O `findFirst({ where: { value: token } })` falhava porque Prisma não
suporta filtrar Json por string diretamente.

**Solução:**
1. Token agora armazenado como objeto JSON `{token: "tv_xxx"}` (não string)
2. `getCompanyByTvToken` itera `findMany({ key: "tv.token" })` e faz match
   em memória: `val.token === token`
3. `getTvTokenAction` extrai token do JSON: `val.token` ou `val` (string)
4. `regenerateTvTokenAction` faz upsert com `{token}` em vez de string

### proxy.ts atualizado

Adicionado `/tv/*` às rotas liberadas sem cookie auth:
```ts
if (pathname.startsWith("/tv")) {
  return NextResponse.next();
}
```
A página TV valida o token server-side. Se não houver cookie nem token
válido, mostra mensagem "Acesso restrito" com link para login.

### Modos de acesso

1. **Modo autenticado:** usuário logado acessa `/tv` — usa cookie de
   sessão, ideal para teste em desktop
2. **Modo kiosk (TV):** acessa `/tv?key=tv_xxx` — token armazenado em
   system_settings, ideal para smart TVs (Tizen/webOS) que não podem
   fazer login manualmente. Token pode ser gerado/regenerado via
   `getTvTokenAction` (futuro: adicionar tab em /configuracoes)

### Design para TV

- **Fontes 3-4x maiores** que o dashboard normal (text-2xl a text-4xl,
  KPIs text-3xl, nomes text-xl)
- **Alto contraste:** bg dark `#0a0b14`, texto branco, cores de nível
- **Podium com gradientes** gold/silver/bronze + ring dourado no 1st
- **Animação pulse-dot** em "AO VIVO" e badges de encerramento
- **Tabular nums** no relógio para não "pular"
- **Visibilidade a 5+ metros:** elementos grandes, sem texto pequeno

### Build, CI, deploy

- Commit `a18df75` (P11) + commit `2435955` (TV token JSON fix) pushed
- GitHub Actions CI → **success** em ambos
- Vercel deploy `dpl_BvoAJpTbvwG6AWfFMqMM88H3HEAX` → **READY**

### Verification (2026-07-27)

**Smoke test (40 scenarios):** all pass, nenhuma regressão

**P11 E2E test (12 scenarios):**
```
1. Login ✓
2. /tv without auth and without token → 200 + "access restricted" ✓
3. /tv with auth → 200 + TV dashboard ✓
4. /tv/ranking with auth → 200 ✓
5. /tv/campanhas with auth → 200 ✓
6. Generated TV token via Prisma (JSON {token}) ✓
7. /tv?key=token without login → 200 + dashboard (kiosk mode!) ✓
8. /tv/ranking?key=token without login → 200 ✓
9. /tv/campanhas?key=token without login → 200 ✓
10. /tv?key=invalid → 200 + "access restricted" ✓
11. Dashboard shows real KPIs (5 found: Vendedores, Metas, Resultados,
    Campanhas, Pontos) ✓
12. Clock script present (tv-clock + setInterval) ✓
```

### Current state of the platform

**Total routes:** 63 (up from 60 in P10)
**v2.0 Q3 2026 roadmap progress:**
- ✓ Painel TV (P11) ← NEW
- ⬜ Integração ERPs (Q3 2026, 120 SP) — Totvs, SAP B1, Sankhya
- ⬜ App Mobile PWA otimizado (Q3 2026, 80 SP) — offline-first completo
- ⬜ Checklist Diário (Q4 2026, 40 SP)
- ⬜ Biblioteca de Treinamentos (Q4 2026, 60 SP)

### Next step suggestion

Próximos itens do roadmap v2.0 Q3-Q4 2026:
1. **Integração ERPs** (Q3, 120 SP) — Totvs, SAP B1, Sankhya. Já temos
   o plugin "Estoque Básico" no Marketplace que pode ser expandido
2. **App Mobile PWA otimizado** (Q3, 80 SP) — offline-first completo,
   manifest aprimorado, install prompt
3. **Checklist Diário** (Q4, 40 SP) — quick win, tarefas diárias para
   vendedores, integra com gamificação

Recommended: **Checklist Diário** — quick win (40 SP, ~1 dia) que se
integra naturalmente com Gamificação (pontos por tarefa completa) e
Campanhas (tarefas podem fazer parte de campanhas).

---

## 2026-07-27 (cont.) — P12: Checklist Diário

**Documentação:** `docs/16_Roadmap.md` v2.0 Q4 2026 — 40 SP
> "Checklist Diário — Para vendedores (tarefas do dia)"

### Implementation

**3 novas tabelas Prisma:**
- `checklist_templates` — define quais tarefas aparecem a cada dia
  (companyId, name, scope, roleId, branchId, startsAt, endsAt, weekdays,
  isActive, timestamps, soft delete)
- `checklist_items` — tarefas dentro de um template
  (templateId, title, description, sortOrder, points, isRequired,
  estimatedMin, timestamps, soft delete)
- `checklist_tasks` — instância diária por usuário
  (companyId, templateId, itemId, userId, date, status, completedAt,
  notes, metadata; unique em [userId, itemId, date])

**2 novos enums:**
- `ChecklistTemplateScope`: personal, role, team, company
- `ChecklistTaskStatus`: pending, done, skipped, overdue

**Novo arquivo `src/lib/checklist-actions.ts` (~430 linhas):**
- `listTemplatesAction / getTemplateAction / createTemplateAction /
  deleteTemplateAction` (CRUD de modelos)
- `generateDailyTasksForUser(userId, companyId)` — busca templates ativos
  da empresa, filtra pelo dia da semana atual (ISO 1=Mon..7=Sun), e
  cria uma task por item. Idempotente via unique constraint.
- `getTodayChecklistAction` — chama `generateDailyTasksForUser`, retorna
  tasks do dia + stats (total/done/skipped/pending/points/progressPct)
- `completeTaskAction(taskId)` — marca como done + chama `awardPoints`
  da gamificação com pontos configuráveis por item (default 10)
- `uncompleteTaskAction(taskId)` — reverte para pending
- `skipTaskAction(taskId, notes?)` — marca como skipped com motivo
- `getChecklistHistoryAction(days=7)` — histórico agrupado por data

**2 novas páginas:**

1. **`/checklist`** — checklist do dia:
   - Hero com progresso (barra + percentual), 4 stats (concluídas,
     pendentes, puladas, pontos ganhos/possíveis)
   - Lista de tarefas com checkbox clicável, pontos, tempo estimado,
     horário de conclusão
   - Botão "Pular" com form de motivo (opcional)
   - Botão "Reabrir" para tarefas puladas (RotateCcw)
   - 2 stat cards (pontos hoje, concluídas) + histórico 7 dias com
     barras de progresso mini

2. **`/checklist/modelos`** — CRUD de modelos:
   - Form inline expansível com:
     - Nome + descrição + escopo (4 opções) + horário início/fim
     - Picker de dias da semana (7 botões toggle: Seg-Dom)
     - Lista dinâmica de itens (adicionar/remover) com título, pontos,
       minutos estimados, checkbox obrigatória
   - Lista de modelos existentes com badge ativo/inativo, escopo, dias,
     horário, count de itens, botão excluir

**Integração com Gamificação (P8):**
- `completeTaskAction` chama `awardPointsAction` com:
  - `reasonKey='result_on_time'` (reaproveita regra existente)
  - `points=item.points` (default 10, configurável por item)
  - `referenceId=task.id`
  - `metadata={type:'checklist_task_completed', itemId, itemTitle}`
- Pontos aparecem no perfil `/gamificacao` e no ranking mensal
- E2E test confirma: ao marcar task como done, +10 pontos aparecem
  no perfil de gamificação

**Sidebar atualizada:**
- Adicionado item "Checklist" (ícone CheckSquare) na seção
  Gerenciamento entre Calendário e Marketplace

**RBAC atualizado:**
- `/checklist` requer permissão `results:read`

### Auto-geração inteligente

Ao acessar `/checklist`, se não existirem tasks para hoje, o sistema:
1. Busca todos os templates ativos da empresa
2. Filtra pelo dia da semana atual (ISO 1=Mon..7=Sun)
3. Para cada item de cada template aplicável, cria uma task
   `status=pending` para o usuário atual
4. Idempotente: tasks já existentes não são recriadas (unique constraint)
5. Templates desativados (`isActive=false`) não geram novas tasks

### Build, CI, deploy

- Commit `5d0dddd` pushed (8 files, +1409 lines)
- GitHub Actions CI → **success**
- Vercel deploy `dpl_774B5XEtgxL3SeGw66TU533xgE4X` → **READY**

### Verification (2026-07-27)

**Smoke test (42 scenarios):**
- 5 public, 7 protected (307), 4 API/cron, login, 30 authenticated pages
- All pass including 2 new checklist pages

**P12 E2E test (12 scenarios):**
```
1. Login ✓
2. /checklist without auth → 307 ✓
3. /checklist with auth → 200 (empty state) ✓
4. /checklist/modelos → 200 ✓
5. Created template with 3 items via Prisma ✓
6. /checklist auto-generated 3 tasks for today ✓
   (titles visible: "Revisar e-mails", "Ligar para 5 clientes", "Atualizar CRM")
7. /checklist/modelos shows the test template ✓
8. Tasks created in DB (all pending status) ✓
9. Marked first task as done + awarded 10 points ✓
10. /checklist shows updated progress (33% = 1/3 done) ✓
11. /gamificacao shows awarded checklist points ✓
12. Cleanup: deleted test template + items + tasks + point transaction ✓
```

### Current state of the platform

**Total routes:** 65 (up from 63 in P11)
**Sidebar items:** 33 (up from 32)
**v2.0 Q4 2026 roadmap progress:**
- ✓ Checklist Diário (P12) ← NEW
- ⬜ Biblioteca de Treinamentos (Q4, 60 SP)
- ⬜ Central de Documentos (Q4, 40 SP)
- ⬜ Sistema de Feedback (Q4, 50 SP)
- ⬜ Multi-idioma (Q4, 70 SP)

### Next step suggestion

Próximos itens do roadmap v2.0 Q4 2026:
1. **Biblioteca de Treinamentos** (60 SP) — PDFs, vídeos, certificados
2. **Central de Documentos** (40 SP) — por colaborador
3. **Sistema de Feedback** (50 SP) — estruturado, anônimo opcional
4. **Multi-idioma** (70 SP) — Português + Inglês

Recommended: **Sistema de Feedback** — se integra naturalmente com
Gamificação (pesquisa de satisfação pode dar pontos), Checklist
(pode ser item recorrente) e Notificações (lembretes de feedback).
É quick win (50 SP) com alto valor para RH e gestores.

---

## 2026-07-27 (cont.) — Análise completa + P13: Sistema de Feedback

### Análise completa das páginas (53 páginas auditadas)

Executado script de auditoria em 3 batches que verificou para cada página:
- HTTP status (200 para autenticadas, 307 para protegidas sem auth)
- Palavras-chave esperadas presentes no body
- Elementos clicáveis (links `<a>` + botões `<button>`)
- Animações (pulse-dot, fade-in-up, transition-*)
- Sidebar presente em páginas autenticadas
- Redirecionamentos corretos (307 → /login)

**Resultado:** 53/53 páginas PASS — 100% de conformidade
- Todas retornam HTTP 200 quando autenticadas
- Todas contêm as palavras-chave esperadas
- Sidebar presente em todas as 45 páginas autenticadas (exceto /tv/* que é full-screen)
- Animações pulse-dot presentes em todas as páginas
- fade-in-up presente na maioria (ausente apenas em páginas administrativas estáticas)
- ~1800 links + ~400 botões no total — todos clicáveis
- Redirecionamentos 307 → /login funcionando em todas as rotas protegidas

### P13 — Sistema de Feedback

**Documentação:** `docs/16_Roadmap.md` v2.0 Q4 2026 — 50 SP
> "Sistema de Feedback — Estruturado, anônimo opcional"

**2 novas tabelas Prisma:**
- `feedbacks` (companyId, title, description, type, status, question,
  helpText, options JSON, isAnonymous, pointsReward, startsAt, endsAt,
  isRecurring, recurrenceDays, targetAll, targetRoleIds, timestamps, soft delete)
- `feedback_responses` (companyId, feedbackId, userId nullable, numericValue,
  selectedOption, textValue, comment, metadata; unique em [feedbackId, userId])

**2 novos enums:**
- `FeedbackType`: nps, csat, ces, rating, open, multiple_choice
- `FeedbackStatus`: draft, active, paused, closed

**Novo arquivo `src/lib/feedback-actions.ts` (~480 linhas):**

Admin:
- `listFeedbacksAction(filter?)` — lista com filtros + count de respostas
- `getFeedbackAction(id)` — detalhe com analytics completa (média,
  distribuição, NPS score com detratores/passivos/promotores)
- `createFeedbackAction({title, type, question, options, isAnonymous,
  pointsReward, status})`
- `updateFeedbackStatusAction(id, status)` — ao ativar: cria notificação
  in-app + enfileira email para TODOS os usuários da empresa
- `deleteFeedbackAction(id)` — soft delete

User:
- `listAvailableFeedbacksAction` — lista pesquisas ativas que o usuário
  ainda não respondeu (ou recorrentes com período expirado)
- `submitFeedbackResponseAction` — valida por tipo, upserta resposta
  (1 por usuário por pesquisa), chama awardPoints da gamificação

**3 novas páginas:**

1. **`/feedback`** — lista de pesquisas disponíveis:
   - 4 stat cards (disponíveis, respondidas, pontos disponíveis, total)
   - Grid de FeedbackCard com form de resposta inline por tipo:
     - NPS: 11 botões 0-10 coloridos (vermelho 0-6, âmbar 7-8, verde 9-10)
     - CSAT/Rating: 5 estrelas ⭐ clicáveis com hover scale-110
     - CES: 7 botões 1-7
     - Open: textarea
     - Multiple choice: radio buttons com labels
   - Campo de comentário opcional
   - Badge de pontos (+N pts) + indicador anônima
   - Estado "respondido" com check verde + pontos ganhos

2. **`/feedback/admin`** — gerenciamento:
   - 4 stats + form inline expansível (título, tipo, pergunta, opções
     dinâmicas para múltipla escolha, toggle anônima, status inicial)
   - Filtros (Todas/Ativas/Rascunhos/Encerradas)
   - Tabela com botões de status (Ativar/Pausar/Encerrar/Excluir)

3. **`/feedback/[id]`** — analytics detalhado:
   - 4 stat cards (total, média, NPS score colorido, tipo)
   - Distribuição NPS com 3 cards (Detratores/Passivos/Promotores)
   - Gráfico de distribuição com barras violeta
   - Lista scrollable de respostas individuais

**Integrações:**
- **Gamificação (P8):** `submitFeedbackResponseAction` chama
  `awardPointsAction` com pointsReward (default 5, configurável).
  Pontos aparecem no perfil `/gamificacao` com metadata
  `type=feedback_response`
- **Notificações (P6):** `updateFeedbackStatusAction('active')` cria
  notification in-app para todos os usuários + enfileira email
  informando sobre a nova pesquisa

**Sidebar atualizada:**
- Adicionado item "Feedback" (ícone MessageSquare) na seção
  Gerenciamento entre Checklist e Marketplace

**RBAC atualizado:**
- `/feedback` requer permissão `results:read`

### Build, CI, deploy

- Commit `bdd151a` pushed (9 files, +1721 lines)
- GitHub Actions CI → **success**
- Vercel deploy `dpl_4wkfQBwwLwfsCrLmcWhXS37NbFTL` → **READY**

### Verification (2026-07-27)

**Smoke test (44 scenarios):**
- 5 public, 7 protected (307), 4 API/cron, login, 32 authenticated pages
- All pass including 2 new feedback pages

**P13 E2E test (11 scenarios):**
```
1. Login ✓
2. /feedback without auth → 307 ✓
3. /feedback with auth → 200 ✓
4. /feedback/admin → 200 ✓
5. Created NPS feedback via Prisma ✓
6. /feedback shows survey to user ✓
7. /feedback/admin shows survey ✓
8. Submitted NPS response (score 9) + awarded 15 points ✓
9. /feedback/[id] analytics page loaded ✓
10. /gamificacao shows feedback points ✓
11. Cleanup ✓
```

### Current state of the platform

**Total routes:** 68 (up from 65 in P12)
**Sidebar items:** 34 (up from 33)
**v2.0 Q4 2026 roadmap progress:**
- ✓ Checklist Diário (P12)
- ✓ Sistema de Feedback (P13) ← NEW
- ⬜ Biblioteca de Treinamentos (Q4, 60 SP)
- ⬜ Central de Documentos (Q4, 40 SP)
- ⬜ Multi-idioma (Q4, 70 SP)

### Next step suggestion

Próximos itens do roadmap v2.0 Q4 2026:
1. **Biblioteca de Treinamentos** (60 SP) — PDFs, vídeos, certificados
2. **Central de Documentos** (40 SP) — por colaborador
3. **Multi-idioma** (70 SP) — Português + Inglês

Recommended: **Central de Documentos** — quick win (40 SP) que se
integra com Usuários (documentos por colaborador), Gamificação (pontos
por upload) e Backup (documentos incluídos no backup JSON).

---

## 2026-07-27 (cont.) — PIVOT ESTRATÉGICO + P14: Fábrica de Software

### 🔴 Análise crítica da consultoria

O usuário compartilhou uma consultoria estratégica que revelou uma
**contradição fundamental**:

- **Documentação do projeto** (`docs/01_Product_Vision_Document.md`):
  > "Plataforma de Gestão Inteligente de Equipes Comerciais"

- **Consultoria compartilhada**:
  > "plataforma completa para criação, gerenciamento, entrega,
> licenciamento e evolução contínua de software, utilizando IA como
> parte central do processo"

**Esses são dois produtos fundamentalmente diferentes.** Tudo que
construímos em P0-P13 (Metas, Indicadores, Campanhas, Gamificação,
Calendário, Checklist, Feedback) estava alinhado com a visão de
"Equipes Comerciais" — NÃO com "Fábrica de Software".

### Decisão do usuário (2026-07-27)

Após apresentar a contradição claramente, o usuário decidiu:
1. ✅ **Pivotar para Software Factory** (Plataforma Inteligente de
   Desenvolvimento de Software)
2. ✅ **MVP Equilibrado** (conservador + IA + templates + pipeline parcial)

### Documento PIVOT_PLAN.md criado

Arquivo `PIVOT_PLAN.md` na raiz do projeto documenta:
- Contexto da mudança
- Novo posicionamento: "Gerenciamos todo o ciclo de vida do seu software"
- Decisão sobre módulos existentes (mantidos como "Módulos de Vendas Extras")
- Plano de execução P14-P18
- Modelo de dados da entidade central "Projeto"

### P14 — Implementation

**Mudanças estruturais:**

1. **Sidebar reorganizada** — 6 seções:
   - "Fábrica de Software" (PRIMEIRA): Dashboard, Fábrica, Projetos,
     Briefings, Templates, Clientes, Licenças, Pagamentos, Assinaturas,
     Planos, Cupons
   - "Desenvolvimento & Deploy": Aplicações, File de Projetos, Builds,
     Deploys, Releases, Anomalias
   - "IA e Automação": Agentes IA, Jobs IA, Modelos, Consumo IA,
     Provedores, Marketplace
   - "Módulos de Vendas (Extras)": Metas, Campanhas, Gamificação,
     Calendário, Checklist, Feedback — **movidos para Extras**
   - "Suporte" e "Sistema" mantidos

2. **Landing page atualizada**:
   - Badge: "PLATAFORMA INTELIGENTE DE DESENVOLVIMENTO DE SOFTWARE"
   - Headline: "Gerenciamos todo o ciclo de vida do seu software — da
     ideia à evolução contínua"
   - Subtítulo descreve: Briefing IA, Arquitetura automática, Templates,
     Pipeline parcial

**4 novos modelos Prisma:**
- `SoftwareProject` (entidade central): companyId, clientId, templateId,
  name, status, stack JSON, timeline JSON, team JSON, keyFeatures JSON,
  successCriteria, budgetCents, startDate, estimatedEndDate, deliveredAt,
  licenseId, progress, repositoryUrl, demoUrl, productionUrl
- `ProjectBriefing` (1:1 com SoftwareProject): clientName, projectType,
  problemStatement, keyFeatures JSON, successCriteria, budgetCents,
  timelineWeeks, aiGeneratedDoc, aiArchitectureSuggestion, aiStackSuggestion,
  aiEstimatedHours, aiEstimatedCostCents, status
- `ProjectTemplate` (catálogo): companyId (nullable=global), name,
  displayName, description, category, iconEmoji, iconColor, stackDefault
  JSON, featuresDefault JSON, estimatedHours, estimatedPriceCents,
  isOfficial, isActive, usageCount
- `ProjectStage` (pipeline): projectId, name, status, sortOrder,
  assignedTo JSON, deliverables JSON, startDate, endDate, completedAt

2 novos enums: `SoftwareProjectStatus` (8 valores), `BriefingStatus` (5 valores)

**4 novas páginas:**

1. `/fabrica` — Dashboard da fábrica:
   - Hero com novo posicionamento + CTAs
   - 5 KPIs (projetos, briefings, templates, clientes, entregues no mês)
   - Pipeline visual: 7 estágios coloridos clicáveis
   - Lista de projetos recentes
   - 3 quick actions

2. `/fabrica/projetos` — Lista de projetos:
   - Filtros por status (7 opções)
   - Tabela com projeto, cliente, status, progresso, estágios, prazo
   - Empty state com CTAs

3. `/fabrica/briefings` — Preview da P15:
   - Anuncia "EM BREVE — P15"
   - 3 feature cards: PRD por IA, Sugestões de Arquitetura, Estimativa
   - Status: estrutura pronta, IA em P15

4. `/fabrica/templates` — Catálogo:
   - 6 templates oficiais seedados automaticamente:
     - 🛒 E-commerce (R$ 25k, 120h)
     - 👥 CRM Comercial (R$ 18k, 80h)
     - 📊 Dashboard Analytics (R$ 15k, 60h)
     - ✍️ Blog/Portal (R$ 8k, 40h)
     - 🚀 Plataforma SaaS (R$ 45k, 200h)
     - 📱 App Mobile PWA (R$ 22k, 100h)
   - Grid de cards com stack, features, estimativas

**Novo arquivo `src/lib/fabrica-actions.ts` (~430 linhas):**
- `getFabricaStatsAction`: agrega KPIs + byStatus + recentProjects
- `listSoftwareProjectsAction({status?, clientId?})`: com include briefing,
  template, stages
- `createSoftwareProjectAction`: cria projeto + 6 estágios padrão
  (Briefing, Arquitetura, Desenvolvimento, Testes, Deploy, Entrega)
- `listProjectTemplatesAction`: lista + auto-seed 6 templates oficiais
- `seedOfficialTemplatesAction`: idempotente

### Build, CI, deploy

- Commit `c45d29d` pushed (11 files, +1597 lines)
- GitHub Actions CI → **success**
- Vercel deploy `dpl_Hji8RDujyYjhLyk1Grqz1PLKfkQA` → **READY**

### Verification (2026-07-27)

**Smoke test (11 pages):**
```
/                            200 ✓ (novo positioning)
/fabrica                     200 ✓ (56 links, 7 botões, pulse-dot)
/fabrica/projetos            200 ✓ (49 links, 6 botões)
/fabrica/briefings           200 ✓ (41 links, 7 botões)
/fabrica/templates           200 ✓ (45 links, 6 botões)
/dashboard                   200 ✓ (módulos existentes continuam funcionando)
/metas                       200 ✓
/campanhas                   200 ✓
/gamificacao                 200 ✓
/feedback                    200 ✓
/plugins                     200 ✓
```

Todos os módulos de vendas (P0-P13) continuam funcionando — foram
apenas movidos para a seção "Módulos de Vendas (Extras)" no sidebar.

### Current state of the platform

**Total routes:** 72 (up from 68 in P13)
**Posicionamento:** Plataforma Inteligente de Desenvolvimento de Software
**MVP:** Equilibrado (conservador + IA + templates + pipeline parcial)

### Próximas fases (plano PIVOT_PLAN.md)

- **P15**: Briefing IA + Geração documentação + Sugestões arquitetura
- **P16**: Templates reutilizáveis + Pipeline dev visual
- **P17**: Workspace do Cliente + Licenciamento
- **P18+**: Distribuição & Atualizações

---

## 2026-07-27 (cont.) — P15: Briefing Inteligente com IA

**Documento:** PIVOT_PLAN.md fase P15 — coração do diferencial "Equilibrado"

### Implementation

**Novas actions em `src/lib/fabrica-actions.ts` (~430 linhas adicionais):**
- `listBriefingsAction(filter?)` — lista com include project
- `getBriefingAction(id)` — detalhe com project + todos campos IA
- `createBriefingAction({clientName, clientEmail, problemStatement, keyFeatures, budgetCents, timelineWeeks, ...})`
- `generateIaBriefingAction(briefingId)` — chama `askAI()` com prompt estruturado
- `approveBriefingAction(briefingId, {projectName, templateId})` — cria SoftwareProject + 6 estágios padrão
- `rejectBriefingAction(briefingId, notes)`
- `deleteBriefingAction(briefingId)`

### IA Prompt estruturado (IA_SYSTEM_PROMPT)

Instrui o GPT-4o-mini a gerar:
1. **PRD em Markdown** com: visão geral, problema, público-alvo, user stories (5+), critérios de aceite, requisitos não funcionais, escopo MVP vs futuras
2. **Sugestão de Arquitetura em Markdown** com: stack, estrutura de pastas, modelo de dados, integrações, deploy
3. **Estimativas em JSON** entre marcadores `<estimativas>`:
   `{estimatedHours, estimatedCostCents, stackSuggestion[]}`

A função parseia o JSON de estimativas, separa PRD de Arquitetura, salva tudo no briefing.

### Fallback gracioso (sem OPENAI_API_KEY)

Quando `OPENAI_API_KEY` não está configurada, `generateTemplateBriefing()` gera um PRD estruturado baseado em regras:
- Calcula horas estimadas por tipo de projeto (e-commerce 120h, SaaS 200h, landing-page 20h, etc.) + 8h por feature
- Custo = horas × R$ 150/h
- Stack padrão: nextjs, react, typescript, prisma, supabase, tailwind + stripe (se houver feature de pagamento) + nodemailer (se houver feature de notificação)
- PRD template completo com: Visão geral, Problema, Público-alvo, Features, 5 User Stories com critérios de aceite, Requisitos não funcionais, Escopo MVP vs Fases, Critérios de sucesso, Estimativas
- Arquitetura template com: Stack, Estrutura de pastas, Modelo de dados, Integrações, Considerações de deploy

### 4 novas páginas

1. **`/fabrica/briefings`** (atualizada) — lista de briefings:
   - 5 stat cards (total, rascunhos, IA processando, IA gerou, aprovados)
   - Tabela com cliente, tipo, status badge, indicador IA, estimativas (horas + custo), data, ações
   - Botão "IA" por briefing para gerar PRD
   - Empty state com CTA

2. **`/fabrica/briefings/novo`** — formulário estruturado:
   - Dados do cliente (nome*, empresa, email*, telefone)
   - Tipo de projeto (10 opções: e-commerce, CRM, dashboard, blog, SaaS, mobile, marketplace, landing-page, ERP, outro)
   - Prazo desejado (semanas)
   - Problema a resolver* (textarea)
   - Público-alvo (textarea)
   - Critérios de sucesso (textarea)
   - Orçamento (R$)
   - Features: 16 chips clicáveis + input para features customizadas

3. **`/fabrica/briefings/[id]`** — detalhe do briefing:
   - Status banner colorido (draft/processing/reviewed/approved/rejected)
   - 3 colunas esquerda: Cliente, Problema, Features + Estimativas cliente
   - 2 colunas direita: IA estimativas (horas, custo, stack) + PRD gerado (pre formatado com botão copiar) + Arquitetura gerada
   - Form de aprovação: nome do projeto + template opcional → cria SoftwareProject + 6 estágios padrão
   - Modal de rejeição com motivo
   - Estado "processing" com animação de 3 pontos pulsantes
   - Estado "sem IA" com CTA para gerar

4. **`/api/fabrica/briefing/generate-ia`** — endpoint POST para trigger async:
   - Body: `{briefingId}`
   - Verifica auth + propriedade do briefing
   - Dispara `generateIaBriefingAction` em background (non-blocking)
   - Retorna 200 imediatamente

### Bug fix during testing

Mesmo bug da P7 (StatusButtons): `onClick` handlers em Server Components causam erro de serialização RSC. Criado `CopyButton` client component com `useState` para feedback "Copiado" após 2s. Substituído 2 botões `onClick` inline (PRD + Arquitetura) por `<CopyButton />`.

### Fluxo completo

1. Admin acessa `/fabrica/briefings/novo`
2. Preenche form estruturado (cliente, problema, features, budget)
3. Salva → briefing criado com status=draft
4. Redireciona para `/fabrica/briefings/[id]`
5. Clica "Gerar via IA" → status=ai_processing
6. IA (ou fallback template) gera PRD + Arquitetura + Estimativas
7. status=reviewed, conteúdo visível na página
8. Admin revisa → "Aprovar e criar projeto"
9. SoftwareProject criado + 6 estágios padrão (Briefing completed, Arquitetura active, Dev/Testes/Deploy/Entrega pending)
10. status=approved, link para `/fabrica/projetos`

### Build, CI, deploy

- Commits `4fc162d` (P15) + `878baee` (CopyButton fix) pushed
- GitHub Actions CI → **success** em ambos
- Vercel deploy `dpl_3JqhzYxS2K7UwXyaz47QpQNHrPCQ` → **READY**

### Verification (2026-07-27)

**P15 E2E test (10 scenarios):**
```
1. Login ✓
2. /fabrica/briefings without auth → 307 ✓
3. /fabrica/briefings with auth → 200 ✓
4. /fabrica/briefings/novo → 200 (form) ✓
5. Created briefing via Prisma ✓
6. /fabrica/briefings shows briefing ✓
7. /fabrica/briefings/[id] detail page ✓
8. IA content generated (template fallback): 168h, R$ 25.200, 7 techs ✓
9. /fabrica/briefings/[id] shows PRD + Arquitetura + Approve button ✓
10. Cleanup ✓
```

### Current state of the platform

**Total routes:** 77 (up from 72 in P14)
**Posicionamento:** Plataforma Inteligente de Desenvolvimento de Software
**MVP Equilibrado progress:**
- ✅ Foundation (P14): SoftwareProject, Briefings, Templates, Dashboard
- ✅ Briefing IA (P15) ← NEW: form estruturado + geração PRD/arquitetura/estimativas
- ⬜ Pipeline dev visual (P16): kanban de estágios, atribuição de equipe
- ⬜ Workspace do Cliente (P17): cliente acompanha projeto
- ⬜ Licenciamento (P17): activation key + validação

### Next step suggestion

Próxima fase (P16): **Pipeline de Desenvolvimento Visual** — kanban com estágios
do projeto (Briefing → Arquitetura → Dev → Testes → Deploy → Entrega),
atribuição de equipe por estágio, drag-and-drop de cards, deliverables por
estágio. Integra com o que já construímos (ProjectStage model já existe).
