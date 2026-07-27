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
