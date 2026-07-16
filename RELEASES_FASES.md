# Releases por Fase — Projeto Orion

As tags fase-4, fase-5 e fase-6 ja estao no GitHub.
Para criar os Releases: GitHub -> aba "Releases" -> "Draft a new release"
-> escolha a tag (fase-4 / fase-5 / fase-6) -> cole o texto abaixo em "Describe this release".

================================================================
## Release fase-4  (tag: fase-4  |  commit: ccd859b)
================================================================

**Fase 4 — Ranking, Equipe, Configuracoes e Empresa**

Implementacao dos modulos centrais de gestao de equipes comerciais:

- **Ranking**: podio top 3 (ouro/prata/bronze) + tabela completa de classificacao,
  com filtro de periodo (semana / mes / trimestre / geral). Calculado a partir de
  resultados aprovados pelo gestor.
- **Equipe**: listagem de usuarios da empresa (com cargo, status, filial e role) +
  modal de convite por e-mail via Supabase Admin (cria o usuario ja vinculado a empresa).
- **Configuracoes**: abas Empresa / Aparência / Notificacoes. Aba Empresa permite editar
  dados cadastrais, contato, endereco e preferencias regionais (fuso, moeda, idioma).
  Aparencia e Notificacoes ficam como placeholders ("em breve").
- **Empresa**: tela de dados da organizacao (KPIs de plano, membros ativos, desde;
  identificacao e contato).

Regra de negocio: resultados lancados ficam com status `pending` ate aprovacao do gestor;
ranking e progresso consideram apenas resultados `approved`.

================================================================
## Release fase-5  (tag: fase-5  |  commit: 29dd9ab)
================================================================

**Fase 5 — Notificacoes, Campanhas, Dashboard e Metas**

- **Notificacoes**: modulo de Central de Notificacoes (estrutura inicial da tela).
- **Campanhas**: modulo de Campanhas integrado ao menu e ao schema (campaigns/campaign_participants).
- **Dashboard**: logicas de Dashboard aprimoradas (cards de Metas Ativas, Resultado Geral %,
  Posicao no Ranking e Equipe Ativa; podio de top performers; atividade recente).
- **Metas**: logicas de Metas consolidadas (listagem com progresso realizado vs alvo,
  criacao de metas vinculadas a indicadores).

Banco de dados (Supabase) sincronizado via `prisma db push`.

================================================================
## Release fase-6  (tag: fase-6  |  commit: 34ba692)
================================================================

**Fase 6 — Dashboard aprimorado + Badge de Notificacoes**

- **Dashboard (src/app/(app)/dashboard/page.tsx)**: reformulacao completa —
  podio de destaque, widgets de progresso de metas e grafico de evolucao de resultados aprimorado.
- **Layout (src/app/(app)/layout.tsx)**: busca a contagem de notificacoes pendentes no servidor.
- **Header (src/shared/components/Header.tsx)**: badge dinamico de notificacoes com link para /notificacoes.

3 arquivos alterados, 291 insercoes.

================================================================
Status: Fases 4, 5 e 6 concluidas e sincronizadas no GitHub (tags) e no Supabase.
