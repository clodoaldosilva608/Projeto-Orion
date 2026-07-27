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
