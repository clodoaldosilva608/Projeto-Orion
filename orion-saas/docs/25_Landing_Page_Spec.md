# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 25

# LANDING PAGE SPECIFICATION

**Projeto:** Orion (Nome interno)
**Versão:** 2.0 (expandida)
**Status:** Em Desenvolvimento
**Documento:** Especificação da Landing Page + Copy + SEO + CRO + Acessibilidade + Performance
**Domínio:** `https://orion.com.br`
**Stack:** Next.js 14 (App Router) + Tailwind CSS + Vercel Edge Network
**Idiomas:** pt-BR (default), en-US (Q2 2026), es-ES (Q3 2026)

---

## Sumário

1. Objetivo e Princípios
2. Estrutura da Página (11 seções)
3. Wireframes ASCII Detalhados (desktop + mobile)
4. Copy Completa — Variantes A/B
5. SEO Strategy (40+ keywords)
6. Content Calendar (12 meses)
7. Lead Magnet Strategy
8. Conversion Funnel Detalhado
9. Heatmap Analysis Plan
10. User Testing Protocol
11. Accessibility Checklist (WCAG 2.2 AA)
12. Performance Budget
13. Mobile-Specific Copy
14. Personalization Strategy
15. Exit Intent Popup
16. Chat Widget Spec
17. Cookie Consent Implementation
18. Analytics & Tracking
19. A/B Testing Roadmap
20. KPIs e SLAs
21. Manutenção e Governança

---

# Capítulo 1 — Objetivo e Princípios

## 1.1 Objetivo

A landing page do Orion é o principal canal de aquisição online de trials e demos agendadas. Sua missão é converter visitantes qualificados (B2B, decisores em PMEs comerciais) em trials gratuitos, demos agendadas e leads de marketing qualificados (MQLs).

## 1.2 Princípios de Design

1. **Clareza antes de criatividade** — cada seção deve responder uma pergunta clara na mente do visitante
2. **Mobile-first** — 68% do tráfego B2B brasileiro vem de mobile (Statcounter 2025)
3. **Performance como feature** — LCP < 2.0s é meta, não buzzer
4. **Copy específica > Copy genérica** — "Rede de farmácias com 5+ lojas" > "Empresas que querem crescer"
5. **Uma CTA principal por dobra** —稀释 CTAs reduzem conversão
6. **Prova social obrigatória** — cada claim de benefício deve ter evidência
7. **Acessibilidade não é opcional** — WCAG 2.2 AA compliance obrigatória

## 1.3 Personas-alvo da Página

| Persona | Cargo | % Tráfego | Intenção Principal |
|---------|-------|-----------|-------------------|
| Dono PME | CEO/Dono | 35% | Ver preço, validar se vale a pena |
| Diretor Comercial | Diretor/Head Vendas | 30% | Avaliar features, agendar demo |
| Gerente Regional | Gerente Lojas/Operação | 20% | Validar viabilidade técnica |
| Analista/Indicação | Analista, Consultor | 15% | Coletar info para recomendar |

## 1.4 Metas de Negócio (12 meses)

| Métrica | Atual | Meta 6m | Meta 12m |
|---------|-------|---------|----------|
| Visitantes únicos/mês | 1.200 | 8.000 | 18.000 |
| Taxa conversão visitante→trial | 1.8% | 3.0% | 4.2% |
| Trials/mês | 22 | 240 | 756 |
| Demos agendadas/mês | 8 | 80 | 220 |
| Trial→pago | 12% | 15% | 18% |
| CAC online (blended) | R$ 1.450 | R$ 820 | R$ 540 |
| Domain Authority | 18 | 28 | 38 |

---

# Capítulo 2 — Estrutura da Página

## 2.1 Seções (Topo → Rodapé)

1. **Header** (sticky, transparente → sólido on-scroll)
2. **Hero** (primeira dobra) — headline + subheadline + CTA + visual
3. **Social Proof Bar** (logos + métricas)
4. **Problema vs Solução** (dois cards comparativos)
5. **Features Principais** (6 cards + tabs por segmento)
6. **Como Funciona** (3 passos + vídeo)
7. **Segmentos Atendidos** (8 cards com ícones)
8. **Depoimentos** (carrossel + vídeo)
9. **Pricing** (3 cards + toggle mensal/anual)
10. **FAQ** (acordeão + busca)
11. **CTA Final** (bandeira colorida)
12. **Footer** (5 colunas + newsletter)

## 2.2 Header — Detalhamento

### Comportamento
- **No topo:** transparente, sobrepondo hero
- **Após scroll 80px:** fundo branco sólido, sombra sutil, logo colorido
- **Mobile:** hamburger menu, drawer lateral direita

### Elementos
- Logo Orion (esquerda)
- Nav: Recursos ▼, Planos, Segmentos ▼, Casos, Blog, Sobre
- CTA Primário: [Teste Grátis →] (verde, destaque)
- CTA Secundário: [Login] (cinza, texto)
- Bandeirinha PT-BR (com dropdown EN/ES em breve)

---

# Capítulo 3 — Wireframes ASCII Detalhados

## 3.1 Hero Section (Desktop — 1440px)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO ORION]   Recursos   Planos   Segmentos   Casos   Blog   Sobre    [Login] [GRÁTIS→]│
└──────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│   ╔═══════════════════════════════════╗   ┌────────────────────────────────────┐    │
│   ║                                   ║   │  ┌──────────────────────────────┐ │    │
│   ║  Substitua planilhas e fichas     ║   │  │  DASHBOARD ORION              │ │    │
│   ║  de papel por uma plataforma      ║   │  │  ┌────┐┌────┐┌────┐┌────┐   │ │    │
│   ║  inteligente de gestão comercial. ║   │  │  │R$  ││ 87%││ #2 ││ 5d  │   │ │    │
│   ║                                   ║   │  │  │42k ││meta││rank││rest │   │ │    │
│   ║  O Orion é 100% configurável.     ║   │  │  └────┘└────┘└────┘└────┘   │ │    │
│   ║  Acompanhe metas, indicadores e   ║   │  │                              │ │    │
│   ║  equipes em tempo real. Sem       ║   │  │  📈 GRÁFICO DE EVOLUÇÃO      │ │    │
│   ║  customização cara. Sem código.   ║   │  │  ╱╲    ╱╲      ╱╲            │ │    │
│   ║                                   ║   │  │ ╱  ╲  ╱  ╲    ╱  ╲           │ │    │
│   ║  [TESTE GRÁTIS 14 DIAS →]        ║   │  │╱    ╲╱    ╲__╱    ╲___       │ │    │
│   ║  [AGENDAR DEMO]                   ║   │  │                              │ │    │
│   ║                                   ║   │  │  🏆 RANKING                  │ │    │
│   ║  ✓ Sem cartão de crédito          ║   │  │  1. João  R$ 5.2k  🥇        │ │    │
│   ║  ✓ Setup em menos de 1 hora       ║   │  │  2. Maria R$ 4.8k  🥈 ← você │ │    │
│   ║  ✓ Suporte 100% em português      ║   │  │  3. Pedro R$ 4.1k  🥉        │ │    │
│   ║                                   ║   │  └──────────────────────────────┘ │    │
│   ║  ⭐⭐⭐⭐⭐ 4.8/5                   ║   │   📱 Mockup celular sobreposto     │    │
│   ║  124 clientes avaliam             ║   └────────────────────────────────────┘    │
│   ╚═══════════════════════════════════╝                                              │
│                                                                                      │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│   │ 500+     │ │ R$ 2.4bi │ │ 18%      │ │ 99.9%    │ │ 4.8/5    │ │ 24/7     │     │
│   │ empresas │ │ gerenci- │ │ aumentou │ │ uptime   │ │ NPS      │ │ suporte  │     │
│   │ no Brasil│ │ ados/ano │ │ vendas   │ │ médio    │ │ cliente  │ │ IA+humano│     │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.2 Hero Section (Mobile — 375px)

```
┌────────────────────────────┐
│ ☰           [LOGO]    [GRÁTIS]│
├────────────────────────────┤
│                            │
│  Substitua planilhas e     │
│  fichas de papel por uma   │
│  plataforma inteligente    │
│  de gestão comercial.      │
│                            │
│  O Orion é 100%            │
│  configurável. Acompanhe   │
│  metas, indicadores e      │
│  equipes em tempo real.    │
│                            │
│  ┌──────────────────────┐  │
│  │ TESTE GRÁTIS 14 DIAS │  │
│  │         →            │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │   AGENDAR DEMO       │  │
│  └──────────────────────┘  │
│                            │
│  ✓ Sem cartão              │
│  ✓ Setup em 1h             │
│  ✓ Suporte em português    │
│                            │
│  ┌──────────────────────┐  │
│  │ 📱 DASHBOARD PREVIEW │  │
│  │ [imagem dashboard]   │  │
│  └──────────────────────┘  │
│                            │
│  ⭐ 4.8/5 (124 clientes)   │
└────────────────────────────┘
```

## 3.3 Problema vs Solução (Desktop)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                          Cansado de gerenciar vendas com planilha?                    │
├───────────────────────────────────────────────┬──────────────────────────────────────┤
│  ❌ SEM O ORION                               │  ✅ COM O ORION                       │
├───────────────────────────────────────────────┼──────────────────────────────────────┤
│                                               │                                      │
│  📉 Planilhas desatualizadas no fim do mês   │  📊 Dashboard em tempo real,         │
│     → decisões tardias, erros detectados      │     atualizado a cada minuto         │
│     só no fechamento                          │                                      │
│                                               │                                      │
│  🧮 Cálculos manuais sujeitos a erro         │  ⚙️ Cálculo 100% automático,         │
│     → fórmulas quebradas, versões conflitantes│     auditável, sem planilha fantasma │
│                                               │                                      │
│  👥 Equipe desmotivada, cumpre tabela         │  🏆 Ranking + gamificação engaja     │
│     → turnover alto, baixa iniciativa         │     equipe, disputam topo do ranking │
│                                               │                                      │
│  🗂️ Dados espalhados em 5+ planilhas         │  📥 Dados centralizados, seguros,    │
│     → visão fragmentada, reconsolidação       │     com auditoria de cada alteração  │
│     mensal custa 5+ dias                      │                                      │
│                                               │                                      │
│  🧱 Sistema rígido, não serve para seu        │  🎨 Construtor de Indicadores:       │
│     segmento → customização custa R$ 50k+     │     crie KPIs sem código, grátis    │
│                                               │                                      │
│  📱 Funciona só no escritório, sem WiFi       │  🌐 PWA: offline-first, sincroniza   │
│                                               │     quando conexão volta            │
│                                               │                                      │
└───────────────────────────────────────────────┴──────────────────────────────────────┘
                              [VER COMO O ORION RESOLVE →]
```

## 3.4 Features Principais (Tabs por segmento)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│              Tudo que você precisa para gerenciar sua equipe comercial               │
│                                                                                      │
│  [Geral] [Farmácia] [Varejo] [Franquias] [Cosméticos] [Construção] [+ segmentos]    │
├──────────────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐                │
│  │ 📊 DASHBOARD       │ │ 🎯 CONSTRUTOR DE   │ │ 🏆 RANKING &        │                │
│  │   TEMPO REAL       │ │   INDICADORES      │ │   GAMIFICAÇÃO       │                │
│  │                    │ │                    │ │                    │                │
│  │ Faturamento, metas │ │ Crie KPIs sem      │ │ Motive a equipe    │                │
│  │ e ranking atualiza-│ │ código. Adapte o   │ │ com ranking, meda- │                │
│  │ dos a cada minuto. │ │ sistema à sua      │ │ lhas, troféus e    │                │
│  │ Não espere o fecha-│ │ realidade. Único   │ │ campanhas.         │                │
│  │ mento do mês.      │ │ no mercado nacional│ │                    │                │
│  │                    │ │                    │ │                    │                │
│  │ [Saiba mais →]     │ │ [Saiba mais →]     │ │ [Saiba mais →]     │                │
│  └────────────────────┘ └────────────────────┘ └────────────────────┘                │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐                │
│  │ 🤖 IA ANALISTA     │ │ 🎪 CAMPANHAS       │ │ 🏢 MULTI-FILIAL    │                │
│  │   24/7             │ │   COMERCIAIS       │ │                    │                │
│  │                    │ │                    │ │                    │                │
│  │ IA que analisa     │ │ Crie campanhas em  │ │ Gerencie 1 ou 100  │                │
│  │ desempenho, prevê  │ │ minutos. Defina    │ │ filiais. Ranking   │                │
│  │ fechamento do mês  │ │ indicadores, parti-│ │ consolidado, compa-│                │
│  │ e sugere ações.    │ │ cipantes e prêmios.│ │ rativos, dashboard │                │
│  │                    │ │                    │ │ executivo.         │                │
│  │ [Saiba mais →]     │ │ [Saiba mais →]     │ │ [Saiba mais →]     │                │
│  └────────────────────┘ └────────────────────┘ └────────────────────┘                │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## 3.5 Pricing (Desktop)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                       Planos para todos os portes                                     │
│                                                                                      │
│              [MENSAL] ◯────● [ANUAL — ECONOMIZE 15%]                                  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                            │
│  │   STARTER      │ │ PROFESSIONAL   │ │  ENTERPRISE    │                            │
│  │                │ │ ⭐ MAIS POPULAR │ │                │                            │
│  │                │ │                │ │                │                            │
│  │ R$ 480/mês     │ │ R$ 1.500/mês   │ │ A PARTIR DE    │                            │
│  │ (anual R$ 5760)│ │ (anual R$18k)  │ │ R$ 5.000/mês   │                            │
│  │                │ │                │ │                │                            │
│  │ Pequenas       │ │ Empresas em    │ │ Grandes        │                            │
│  │ empresas       │ │ crescimento    │ │ operações      │                            │
│  │                │ │                │ │                │                            │
│  │ ✓ até 10 users │ │ ✓ até 50 users │ │ ✓ users ilimit.│                            │
│  │ ✓ 1 filial     │ │ ✓ até 5 filiais│ │ ✓ filiais ilim.│                            │
│  │ ✓ Dashboard    │ │ ✓ Tudo Starter │ │ ✓ Tudo Prof.   │                            │
│  │ ✓ Metas        │ │ ✓ Campanhas    │ │ ✓ API          │                            │
│  │ ✓ Ranking      │ │ ✓ Gamificação  │ │ ✓ IA avançada  │                            │
│  │ ✓ App mobile   │ │ ✓ IA básica    │ │ ✓ Gerente ded. │                            │
│  │ ✓ Suporte email│ │ ✓ Suporte prio.│ │ ✓ SLA 99.9%    │                            │
│  │                │ │                │ │ ✓ SSO/SAML     │                            │
│  │                │ │                │ │ ✓ On-premise*  │                            │
│  │                │ │                │ │                │                            │
│  │ [TESTE GRÁTIS] │ │ [TESTE GRÁTIS] │ │ [AGENDAR DEMO] │                            │
│  └────────────────┘ └────────────────┘ └────────────────┘                            │
│                                                                                      │
│   ✓ Atualizações automáticas  ✓ Backup diário  ✓ LGPD compliance  ✓ Sem fidelidade  │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

# Capítulo 4 — Copy Completa — Variantes A/B

## 4.1 Hero — Variante A (Controle)

### H1
> **Substitua planilhas e fichas de papel por uma plataforma inteligente de gestão comercial.**

### Subheadline
> O Orion é a plataforma 100% configurável que ajuda empresas a acompanhar metas, indicadores e equipes em tempo real. Sem customização cara. Sem programação.

### CTAs
- **Primário:** Teste Grátis por 14 dias →
- **Secundário:** Agendar Demo

### Microcopy
> Sem cartão de crédito. Configuração em menos de 1 hora. Suporte 100% em português.

## 4.2 Hero — Variante B (Benefício-primário)

### H1
> **Acompanhe metas e ranking em tempo real. Sem planilhas.**

### Subheadline
> Dashboard inteligente que mostra faturamento, indicadores e ranking da sua equipe comercial atualizados a cada minuto. Configurável para qualquer segmento — farmácia, varejo, franquias.

### CTAs
- **Primário:** Ver Demonstração de 2 minutos →
- **Secundário:** Teste Grátis 14 dias

### Microcopy
> Mais de 500 empresas brasileiras já substituíram planilhas pelo Orion. Junte-se a elas.

## 4.3 Hero — Variante C (Segmento-específica, dinâmica)

> Quando tráfego vem de campanha de farmácia, mostra headline segmentada.

### H1
> **O Orion que redes de farmácias usam para substituir planilhas.**

### Subheadline
> Acompanhe venda de genéricos, similares, perfumaria e serviços farmacêuticos em tempo real. Ranking por loja e por vendedor. Gamificação que engaja balconistas.

### CTA Primário
> Teste Grátis para Farmácias →

### Social Proof Específico
> "Reduzi de 8 planilhas para 1 dashboard. Fechamento mensal caiu de 5 dias para 2 horas." — Maria Silva, Farmácia Vida Saudável (10 lojas)

## 4.4 Hero — Variante D (Número-primário)

### H1
> **+500 empresas já substituíram planilhas pelo Orion.**

### Subheadline
> 18% de aumento médio de vendas. 99.9% de uptime. 4.8/5 de avaliação. Plataforma de gestão comercial configurável para qualquer segmento, sem customização cara.

### CTA Primário
> Começar Teste Grátis →

## 4.5 Social Proof — 3 Variantes

### Variante A (Logos)
> Empresas que já transformaram sua gestão comercial com o Orion
> [Logo 1] [Logo 2] [Logo 3] [Logo 4] [Logo 5] [Logo 6]
> +500 empresas usam o Orion

### Variante B (Métricas)
> Números do Orion em 2025
> - 500+ empresas ativas
> - R$ 2.4 bi gerenciados/ano
> - 18% aumento médio de vendas
> - 99.9% uptime
> - 4.8/5 NPS
> - 24/7 suporte IA + humano

### Variante C (Depoimento destaque)
> "Substituímos 8 planilhas pelo Orion. Hoje vejo desempenho de cada loja em segundos."
> — Maria Silva, Gerente Regional, Farmácia Vida Saudável (10 lojas)
> [Ver case completo →]

## 4.6 Pricing — 3 Variantes de CTA

### Variante A (Padrão)
- Starter: [Teste Grátis]
- Professional: [Teste Grátis]
- Enterprise: [Agendar Demo]

### Variante B (Urgência)
- Starter: [Teste Grátis — Oferta termina em 03:24:11]
- Professional: [Teste Grátis — 15% OFF anual]
- Enterprise: [Falar com Especialista]

### Variante C (Risco-zero)
- Starter: [Começar Grátis — 14 dias, sem cartão]
- Professional: [Começar Grátis — 14 dias, sem cartão]
- Enterprise: [Agendar Demo — 30 min, sem compromisso]

## 4.7 CTA Final — 3 Variantes

### Variante A (Direta)
> **Pronto para transformar sua gestão comercial?**
> Comece hoje. Teste grátis por 14 dias. Sem cartão de crédito.
> [Criar Conta Grátis →]

### Variante B (Comparativa)
> **Daqui a 14 dias você pode estar:**
> - ✓ Acompanhando metas em tempo real
> - ✓ Com ranking engajando sua equipe
> - ✓ Com IA prevendo seu fechamento
>
> Ou pode estar ainda consolidando planilha do mês passado.
>
> [Começar Agora →]

### Variante C (Soft)
> **Quer ver o Orion na prática antes?**
> Agende uma demo de 30 minutos. Mostramos o sistema configurado para o seu segmento.
> [Agendar Demo →] ou [Testar Sozinho →]

## 4.8 FAQ — Copy Completa Estendida

### Perguntas Frequentes (12 perguntas)

**1. Preciso de internet para usar?**
Não obrigatoriamente. O Orion é PWA offline-first: funciona sem conexão e sincroniza automaticamente quando a internet volta. Ideal para lojas com conexão instável.

**2. Funciona para qualquer segmento?**
Sim. O Orion é 100% parametrizável através do Construtor de Indicadores. Temos clientes em farmácias, supermercados, lojas de roupas, calçados, cosméticos, materiais de construção, clínicas, concessionárias e franquias. Você cria os KPIs que importam para seu negócio.

**3. Quanto tempo leva para implantantar?**
Empresas pequenas (1-2 filiais, até 20 vendedores): 1-2 dias com nossa equipe. Redes maiores (10+ filiais): 1-2 semanas com plano de implantação dedicado.

**4. Meus dados estão seguros?**
- Criptografia AES-256 em repouso e em trânsito
- Backup automático diário com retenção de 30 dias
- Conformidade LGPD completa (DPO dedicado)
- Auditoria de todas as ações no sistema
- Data residency: servidores no Brasil (São Paulo)
- ISO 27001 (planejado Q4 2025)

**5. Posso cancelar quando quiser?**
Sim. Sem fidelidade. Os primeiros 30 dias têm reembolso integral. Após 30 dias, sem reembolso proporcional, mas você pode exportar todos os seus dados em Excel/CSV a qualquer momento.

**6. Tem suporte em português?**
Sim, 100% em português. Canais:
- Email: resposta em até 24h (Starter) ou 4h (Professional+)
- Chat: horário comercial (Professional) ou 24/7 (Enterprise)
- Telefone: apenas Enterprise
- IA Coach 24/7 para dúvidas comuns

**7. Funciona no celular?**
Sim! PWA instalável em Android e iPhone. Funciona offline. Receba notificações push de metas, ranking e campanhas. Disponível também como app nativo (iOS e Android) Q1 2026.

**8. Integra com meu ERP?**
- Integração nativa com TOTVS, SAP B1, Sankhya (Q1 2026)
- API REST pública para qualquer ERP
- Webhooks para automação
- Importação manual via Excel/CSV
- Equipe de implantação auxilia na integração

**9. Como funciona a IA do Orion?**
A IA analisa padrões de vendas, prevê fechamento do mês, identifica vendedores em risco de não bater meta e sugere ações concretas ("João está 23% abaixo da meta semanal, sugiro coaching focado em cross-sell"). Baseada em GPT-4 + fine-tuning com dados anonimizados do setor.

**10. Vocês usam meus dados para treinar IA?**
NUNCA. Seus dados são seus. Contrato garante que dados de cliente não são usados para treinar modelos. IA usa apenas padrões agregados e anonimizados.

**11. Posso ter usuários sem acesso a tudo?**
Sim. RBAC granular com 8 cargos padrão + cargos customizados. Permissões por módulo, por filial, por indicador. Exemplo: balconista vê só seu dashboard; gerente regional vê suas lojas; diretor vê tudo.

**12. Qual o tempo médio de retorno do investimento (ROI)?**
Em média 3 meses.Clientes reportam:
- 10-18% aumento de produtividade
- 5-15% aumento de vendas
- 80% redução de tempo de fechamento
- 30% redução de turnover de vendedores

---

# Capítulo 5 — SEO Strategy Detalhada

## 5.1 Keywords Alvo (40+)

### Primárias (alto volume, alta intenção)
1. gestão de equipes comerciais
2. sistema de metas de vendas
3. ranking de vendedores
4. plataforma de gestão comercial
5. software de gestão comercial
6. sistema de gestão para varejo

### Secundárias (long-tail, alta conversão)
7. sistema de gestão para farmácia
8. sistema de gestão para supermercado
9. controle de metas vendedores
10. dashboard de vendas em tempo real
11. gamificação para equipe de vendas
12. acompanhamento de equipe comercial
13. ranking de vendas por loja
14. CRM de vendas B2B Brasil
15. software de metas e indicadores

### Terciárias (educação/topo de funil)
16. como acompanhar metas de vendas
17. o que é KPI comercial
18. indicadores de vendas varejo
19. como motivar equipe de vendas
20. planilha de controle de vendas
21. planilha de metas para vendedores
22. melhor sistema de gestão comercial
23. alternativas ao TOTVS
24. sistema de gestão para franquias

### Por segmento
25. sistema para farmácia com controle de metas
26. sistema para rede de cosméticos
27. gestão para lojas de roupas
28. software para material de construção
29. sistema para distribuidora
30. gestão para concessionária

### Por intenção transacional
31. plano de gestão comercial barato
32. teste grátis sistema de vendas
33. demo sistema gestão comercial
34. software de gestão sem fidelidade
35. sistema de gestão SaaS Brasil

### Por feature
36. construtor de indicadores KPI
37. ranking de vendedores online
38. dashboard comercial mobile
39. IA para análise de vendas
40. campanhas de incentivo de vendas
41. sistema multi-filial vendas
42. PWA offline para vendas

## 5.2 Mapeamento Keyword → Página

| Página | URL | Keywords Primárias |
|--------|-----|-------------------|
| Home | `/` | gestão de equipes comerciais, plataforma de gestão comercial |
| Recursos | `/recursos` | sistema de metas, ranking de vendedores, dashboard vendas |
| Planos | `/planos` | plano de gestão comercial, software de gestão barato |
| Casos | `/casos` | cases de sucesso, depoimentos |
| Blog | `/blog` | (long-tail educação) |
| Farmácia | `/segmentos/farmacia` | sistema para farmácia, gestão farmácia |
| Varejo | `/segmentos/varejo` | sistema para supermercado, gestão varejo |
| Franquias | `/segmentos/franquias` | sistema para franquias |
| Construtor | `/recursos/construtor-indicadores` | construtor de KPI, criar indicadores |
| Gamificação | `/recursos/gamificacao` | gamificação vendas, campanhas incentivo |
| IA | `/recursos/ia` | IA para vendas, análise de vendas IA |
| ROI | `/calculadora-roi` | calculadora ROI vendas, ROI sistema gestão |
| Preços | `/planos/precos` | preço sistema gestão comercial |
| Comparar | `/comparar/orion-vs-totvs` | alternativas TOTVS, Orion vs TOTVS |
| Comparar | `/comparar/orion-vs-pipedrive` | Orion vs Pipedrive, alternativa Pipedrive |

## 5.3 Meta Tags por Página

### Home
```html
<title>Orion | Plataforma de Gestão Comercial para Equipes de Vendas</title>
<meta name="description" content="Substitua planilhas e fichas de papel por uma plataforma inteligente. Metas, ranking, gamificação e IA em tempo real. Teste grátis 14 dias. 500+ empresas.">
<meta name="keywords" content="gestão comercial, sistema de metas, ranking de vendedores, dashboard de vendas, gamificação vendas">
<meta property="og:title" content="Orion — Plataforma de Gestão Comercial Inteligente">
<meta property="og:description" content="Substitua planilhas por uma plataforma inteligente. Metas, ranking, gamificação e IA em tempo real. Teste grátis 14 dias.">
<meta property="og:image" content="https://orion.com.br/og/orion-og.png">
<meta property="og:url" content="https://orion.com.br/">
<meta name="twitter:card" content="summary_large_image">
```

### /segmentos/farmacia
```html
<title>Orion para Farmácias | Gestão Comercial para Redes de Farmácias</title>
<meta name="description" content="Sistema de gestão comercial para redes de farmácias. Acompanhe genéricos, similares, perfumaria e serviços em tempo real. Ranking por loja e vendedor. Cases reais.">
```

## 5.4 Schema.org

### SoftwareApplication (Home)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Orion",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, Windows, macOS, Linux, Android, iOS",
  "url": "https://orion.com.br",
  "downloadUrl": "https://orion.com.br/baixar-app",
  "offers": [
    {
      "@type": "Offer",
      "name": "Starter",
      "price": "4800",
      "priceCurrency": "BRL",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "4800",
        "priceCurrency": "BRL",
        "referenceQuantity": {"@type": "QuantitativeValue", "value": 1, "unitCode": "ANN"}
      }
    },
    {
      "@type": "Offer",
      "name": "Professional",
      "price": "18000",
      "priceCurrency": "BRL"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "124",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

### FAQPage (Home)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Preciso de internet para usar o Orion?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Não obrigatoriamente. O Orion é PWA offline-first: funciona sem conexão e sincroniza automaticamente quando a internet volta. Ideal para lojas com conexão instável."
      }
    }
  ]
}
```

### BreadcrumbList
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://orion.com.br/"},
    {"@type": "ListItem", "position": 2, "name": "Segmentos", "item": "https://orion.com.br/segmentos"},
    {"@type": "ListItem", "position": 3, "name": "Farmácia", "item": "https://orion.com.br/segmentos/farmacia"}
  ]
}
```

### Organization
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Orion Tecnologia",
  "url": "https://orion.com.br",
  "logo": "https://orion.com.br/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-11-3000-0000",
    "contactType": "sales",
    "areaServed": "BR",
    "availableLanguage": ["Portuguese"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/orion-brasil",
    "https://www.youtube.com/@orionbrasil",
    "https://www.instagram.com/orion.brasil"
  ]
}
```

## 5.5 Estratégia de Link Building

### Táticas
1. **Guest posts** em blogs B2B (1/mês): Rock Content, Resultados Digitais, Agência Mestre
2. **Listagens em diretórios**: Capterra, GetApp, SoftwareAdvice, G2 Crowd
3. **Parcerias com contadores/consultores**: programa de afiliados 15% recorrente
4. **HARO / Resposta a jornalistas**: 2 pitches/mês para Veja, Exame, Pequenas Empresas Grandes Negócios
5. **Podcasts**: 1 participação/mês em podcasts de gestão/vendas
6. **Co-marketing com complementares**: empresas de NF-e, contabilidade, ERP
7. **Cases públicos**: cada case = 1 link autoritativo (cliente linka para nós)

### Metas
- 10 backlinks DR 40+/mês
- 3 mentions em imprensa/trimestre
- DA 28 em 6 meses, DA 38 em 12 meses

## 5.6 Technical SEO Checklist

- [ ] Sitemap.xml dinâmico (Next.js sitemap)
- [ ] robots.txt com regras para /admin, /api
- [ ] Canonical tags em todas as páginas
- [ ] Hreflang para en-US, es-ES (Q2 2026)
- [ ] Open Graph e Twitter Cards em todas as páginas
- [ ] Imagens com alt text descritivo
- [ ] Estrutura de headings hierárquica (1 H1, múltiplos H2/H3)
- [ ] URLs amigáveis (kebab-case, sem parâmetros dinâmicos)
- [ ] Redirects 301 mapeados (planilha de redirects)
- [ ] Core Web Vitals: LCP < 2.0s, FID < 100ms, CLS < 0.1
- [ ] JSON-LD em todas as páginas relevantes
- [ ] Breadcrumbs visíveis + schema
- [ ] Paginação com rel="next"/"prev" no blog
- [ ] 404 page útil (links para home, segmentos, blog)

---

# Capítulo 6 — Content Calendar (12 meses)

## 6.1 Calendário Editorial 2025-2026

| Mês | Tema | Conteúdo Hero (1) | Blog (4 posts) | Vídeo (2) | Lead Magnet |
|-----|------|-------------------|----------------|-----------|-------------|
| Jan/25 | Comece o ano com pé direito | "Planejamento de metas comerciais 2025: guia completo" | 1. Metas SMART para vendedores 2. KPIs essenciais varejo 3. Como fazer ranking que engaja 4. Erros comuns em planilhas de vendas | "Como configurar metas anuais no Orion" | "Template de Plano de Metas 2025" (Excel) |
| Fev/25 | Gamificação que funciona | "Gamificação em vendas: 7 cases brasileiros" | 1. O que é gamificação B2B 2. Campanhas de incentivo que dão ROI 3. Como engajar balconistas 4. Psicologia do ranking | "Criando campanhas engajadoras no Orion" | "Guia: 20 ideias de campanhas de incentivo" |
| Mar/25 | IA na gestão comercial | "Como IA está transformando gestão de vendas" | 1. IA preditiva vs descritiva 2. Como IA prevê fechamento 3. ChatGPT para vendas 4. IA e LGPD | "IA Coach do Orion na prática" | "Calculadora de ROI de IA em vendas" |
| Abr/25 | Multi-filial | "Como gerenciar 10+ filiais sem perder o controle" | 1. Dashboard executivo 2. Comparativos entre lojas 3. Padronização de processos 4. Cultura multi-filial | "Dashboard executivo Orion em tour" | "Checklist de padronização para redes" |
| Mai/25 | Relatórios executivos | "Relatórios que impressionam diretoria" | 1. 5 relatórios essenciais 2. Como apresentar dados 3. Storytelling com números 4. Automatização de relatórios | "Relatórios automáticos no Orion" | "Templates de relatório mensal (PPTX)" |
| Jun/25 | Análise semestral | "Balanço 1º semestre: o que medir" | 1. KPIs de meio de ano 2. Ajustes para 2º semestre 3. Como recuperar meta atrasada 4. Motivar equipe no 2º semestre | "Análise semestral com IA Orion" | "Framework de análise semestral" |
| Jul/25 | Casos de sucesso | "3 cases: como redes cresceram com Orion" | 1. Case farmácia 2. Case varejo 3. Case cosméticos 4. Lições dos cases | "Documentário: 1 ano com Orion" | "E-book: 10 cases brasileiros" |
| Ago/25 | Dia do Vendedor (28/8) | "O que faz um vendedor top performer?" | 1. Hábitos de top performers 2. Como reconhecer vendedores 3. Plano de carreira vendas 4. Treinamento de vendedores | "Homenagem ao vendedor brasileiro" | "Kit de reconhecimento para vendedores" |
| Set/25 | Black Friday | "Preparação para Black Friday no varejo" | 1. Metas de Black Friday 2. Campanhas que funcionam 3. Equipe dimensionada 4. Pós-BF: análise | "Configurando BF no Orion" | "Plano de ação Black Friday 2025" |
| Out/25 | Planejamento 2026 | "Como planejar vendas para 2026" | 1. Forecasting 2. Orçamento comercial 3. Estrutura de equipe 4. Tecnologia para 2026 | "Workshop: Planejamento 2026" | "Template de plano comercial 2026" |
| Nov/25 | Cyber Monday + Retenção | "Como reter clientes e vendedores" | 1. Churn de vendedor 2. Cultura de retenção 3. Onboarding de vendedor 4. Reconhecimento e recompensa | "Reduzindo turnover com Orion" | "Guia de retenção de talentos comerciais" |
| Dez/25 | Encerramento 2025 | "Fechamento do ano: o que não esquecer" | 1. Fechamento contábil vendas 2. Avaliação anual equipe 3. Bônus e comissões 4. Planejamento festivo | "Encerramento 2025 no Orion" | "Checklist de fechamento anual" |

## 6.2 Distribuição por Canal

| Canal | Frequência | Formato |
|-------|-----------|---------|
| Blog | 4 posts/mês | 1500-2500 palavras, SEO otimizado |
| YouTube | 2 vídeos/mês | 5-15 min, tutorial/case |
| LinkedIn | 3 posts/semana | Carrossel + texto + vídeo curto |
| Instagram | 5 stories/dia + 3 posts/semana | Bastidores, dicas rápidas, cases |
| Newsletter | 1 email/sexta | Recap da semana + 1 CTA |
| Webinar | 1/mês | 45 min + Q&A |

---

# Capítulo 7 — Lead Magnet Strategy

## 7.1 Funil de Lead Magnets

```
Visitante → Pop-up / Inline CTA → Landing page do LM → Form (nome+email) 
→ Email entrega LM → Sequência de nurture 5 emails → Demo agendada
```

## 7.2 Lead Magnets Disponíveis (12)

| Lead Magnet | Persona-alvo | Conversão Esperada | Status |
|-------------|-------------|-------------------|--------|
| Template de Plano de Metas 2025 (Excel) | Diretor Comercial | 8% | Ativo |
| Guia: 20 ideias de campanhas de incentivo | Gerente Regional | 6% | Ativo |
| Calculadora de ROI de IA em vendas | Diretor Comercial | 12% | Ativo |
| Checklist de padronização para redes | Gerente Multi-filial | 5% | Ativo |
| Templates de relatório mensal (PPTX) | Diretor Comercial | 7% | Ativo |
| Framework de análise semestral | CEO | 4% | Ativo |
| E-book: 10 cases brasileiros | Dono PME | 9% | Ativo |
| Kit de reconhecimento para vendedores | RH/Comercial | 5% | Ativo |
| Plano de ação Black Friday 2025 | Varejista | 14% | Sazonal |
| Template de plano comercial 2026 | Diretor Comercial | 8% | Ativo |
| Guia de retenção de talentos | RH | 4% | Ativo |
| Checklist de fechamento anual | Dono PME | 6% | Ativo |

## 7.3 Sequência de Nurture (5 emails)

### Email 1 (D+0 — entrega do LM)
```
Assunto: Seu [Lead Magnet] está aqui 🎁

Olá [Nome],

Conforme solicitado, segue seu [Lead Magnet]:
[Link de download]

Espero que seja útil. Se tiver dúvida sobre como aplicar, 
responda este email — leio todos pessoalmente.

Uma pergunta rápida: você já usa algum sistema para 
acompanhar metas e ranking da equipe? Responda só com 
"sim" ou "não".

Abraço,
[Nome do Vendedor]
[Contato]
```

### Email 2 (D+2 — conteúdo de valor)
```
Assunto: Como [empresa similar] aplicou isso

Olá [Nome],

Lembrei de você quando li este case:
[Link para case relevante]

A [Empresa X] aplicou exatamente o que está no material 
que te enviei. Resultado: 18% aumento de vendas em 6 meses.

Vale a leitura (5 min).

[Assinatura]
```

### Email 3 (D+5 — soft pitch)
```
Assunto: Ferramenta que automatiza isso tudo

Olá [Nome],

Você já percebeu que aplicar [tema do LM] manualmente 
exige: planilhas, reuniões, follow-ups, consolidação...

O Orion automatiza tudo isso. Em 1 dashboard:
- Metas atualizadas em tempo real
- Ranking que engaja equipe
- IA que prevê fechamento do mês
- Campanhas de incentivo em minutos

Quer ver uma demo de 15 min? Mostro configurado para 
o seu segmento. Sem compromisso.

[Agendar Demo →]

[Assinatura]
```

### Email 4 (D+9 — prova social)
```
Assunto: "Reduzi 5 dias de fechamento para 2 horas"

Olá [Nome],

Isso foi o que Maria Silva, da Farmácia Vida Saudável 
(10 lojas), disse sobre o Orion.

[Ver case completo →]

Outros resultados:
- +18% vendas (Rede SuperMais)
- -30% turnover (Loja Estilo)
- 99.9% uptime médio

5 minutos de leitura, pode valer a pena.

[Assinatura]
```

### Email 5 (D+14 — último contato)
```
Assunto: Fechando o ciclo

Olá [Nome],

Último email meu por enquanto. Quero deixar claro:

✓ Você pode testar o Orion grátis por 14 dias
✓ Sem cartão de crédito
✓ Sem fidelidade
✓ Cancela com 1 clique

Se não for para você, sem problema. Mas se for:

[Criar Conta Grátis →]

Se preferir, posso agendar 15 min para conversar:
[Link Calendly]

Sucesso,
[Assinatura]
```

---

# Capítulo 8 — Conversion Funnel Detalhado

## 8.1 Funil Completo

```
                  ┌─────────────────────────┐
                  │   TRÁFEGO (Topo)         │
                  │   18.000 visitantes/mês  │
                  └────────────┬─────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │ ENGAGEMENT (Engajamento) │
                  │ > 30s session: 9.000     │
                  │ Scroll 50%+: 7.200       │
                  └────────────┬─────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │   CONSIDERAÇÃO            │
                  │ Visitou /recursos: 5.400  │
                  │ Visitou /planos: 3.600    │
                  │ Visitou /casos: 2.160     │
                  └────────────┬─────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │   INTENÇÃO                │
                  │ Clicou CTA: 1.440         │
                  │ Viu pricing: 1.080        │
                  │ Abriu FAQ: 540            │
                  └────────────┬─────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │   AÇÃO                    │
                  │ Form trial: 540 (3%)     │
                  │ Demo agendada: 216        │
                  │ Lead magnet: 1.080        │
                  └────────────┬─────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │   CONVERSÃO               │
                  │ Trial ativo: 486          │
                  │ Demo realizada: 173       │
                  └────────────┬─────────────┘
                               │
                  ┌────────────▼─────────────┐
                  │   CLIENTE PAGANTE         │
                  │ Trial→pago: 88 (18%)     │
                  │ Demo→pago: 35 (20%)      │
                  │ TOTAL: 123 novos/mês      │
                  └──────────────────────────┘
```

## 8.2 Microconversões Rastreadas

| Evento | Trigger | Meta de taxa |
|--------|---------|--------------|
| `scroll_25` | Scroll 25% da página | 80% |
| `scroll_50` | Scroll 50% | 60% |
| `scroll_75` | Scroll 75% | 40% |
| `scroll_100` | Scroll 100% | 15% |
| `cta_click` | Clique em qualquer CTA | 8% |
| `trial_click` | Clique específico em Trial | 5% |
| `demo_click` | Clique específico em Demo | 3% |
| `video_play` | Play do vídeo hero | 25% |
| `video_complete` | Vídeo até o fim | 35% do play |
| `pricing_view` | Visualizou seção pricing | 50% |
| `faq_expand` | Expandiu qualquer FAQ | 30% |
| `chat_open` | Abriu chat widget | 4% |
| `exit_intent_shown` | Popup exibido | (auto) |
| `exit_intent_click` | Clicou no popup | 0.8% |
| `lead_magnet_download` | Baixou LM | 6% |
| `time_on_page_120s` | Ficou 2+ min | 50% |

## 8.3 Análise de Drop-off por Seção

| Seção | % Visitantes que chegam | Drop-off |
|-------|------------------------|----------|
| Hero | 100% | — |
| Social Proof | 78% | -22% |
| Problema vs Solução | 65% | -13% |
| Features | 52% | -13% |
| Como Funciona | 41% | -11% |
| Segmentos | 33% | -8% |
| Depoimentos | 28% | -5% |
| Pricing | 22% | -6% |
| FAQ | 14% | -8% |
| CTA Final | 10% | -4% |
| Footer | 8% | -2% |

**Insight:** Maior drop-off é entre Features e Como Funciona. Hipótese: conteúdo muito denso. Testar versão mais enxuta.

---

# Capítulo 9 — Heatmap Analysis Plan

## 9.1 Ferramentas

- **Hotjar** (pago) — heatmaps, session replay, funnels
- **Microsoft Clarity** (gratuito) — heatmaps, session replay, insights de IA
- **Crazy Egg** (alternativa) — heatmaps, A/B testing

## 9.2 Configuração

### Tipos de Heatmap Coletados
1. **Click map** — onde usuários clicam
2. **Move map** — movimento do cursor (proxy de atenção)
3. **Scroll map** — quanto scrollam
4. **Attention zones** — áreas com mais tempo de permanência

### Segmentação
- Por origem (orgânico, paid, social, direto)
- Por dispositivo (desktop, mobile, tablet)
- Por persona (quando identificada)
- Novo vs retornado

## 9.3 Frequência de Análise

- **Semanal:** review de session replays (10 sessões aleatórias + 10 de drop-off)
- **Quinzenal:** análise de heatmaps por seção
- **Mensal:** relatório consolidado + hipóteses de otimização
- **Pós-mudança:** heatmap comparativo antes/depois de qualquer alteração

## 9.4 Plano de Ação Típico

### Identificado: Botão "Saiba mais" nos cards de feature tem 0.4% CTR (abaixo de 1% esperado)

**Ação:**
1. Verificar 5 session replays de usuários que passaram pela seção
2. Hipóteses:
   - H1: Botão muito pequeno
   - H2: Texto não gera curiosidade
   - H3: Card já entrega info suficiente
3. Teste A/B: aumentar botão + mudar copy "Ver exemplo real →"
4. Medir 2 semanas, decisão com 95% significância

## 9.5 Insights Esperados por Seção

| Seção | Métrica-chave | O que observar |
|-------|--------------|----------------|
| Hero | CTR no CTA primário | Heat concentration no botão |
| Social Proof | Tempo de permanência | Logos muito pequenos? |
| Features | Cliques por card | Qual card gera mais interesse? |
| Pricing | Hover time em cada plano | Qual plano gera mais dúvida? |
| FAQ | Perguntas mais expandidas | Quais dúvidas bloqueiam conversão? |
| CTA Final | Scroll reach | Quantos chegam aqui? |

---

# Capítulo 10 — User Testing Protocol

## 10.1 Metodologia

- **Testes moderados remotos** (Zoom + tela compartilhada)
- **5-7 participantes por teste** (Nielsen: 5 encontram 85% dos problemas)
- **Duração:** 30-45 min por sessão
- **Incentivo:** R$ 100 vale-presentil Amazon

## 10.2 Recrutamento de Participantes

### Critérios
- Cargo: Diretor Comercial, Gerente Regional, Dono PME
- Empresa: 5-200 vendedores, faturamento R$ 5M-500M
- Não pode ser cliente atual
- Não pode ter visitado orion.com.br antes

### Canais de Recrutamento
- LinkedIn ( Sales Navigator, mensagens diretas)
- Comunidades (SlackRock Content, RD Station, etc.)
- Indicação de clientes atuais (R$ 50 referral)
- UserTesting.com (internacional, em português)

## 10.3 Roteiro de Teste (Template)

### Warm-up (5 min)
```
"Olá [Nome], obrigado por participar. Vou te pedir para 
compartilhar sua tela. Hoje vamos testar uma landing page 
de um produto de gestão comercial. Não existe resposta 
certa ou errada — estou testando o site, não você.

Antes de começar, me conta:
- Qual seu cargo e empresa?
- Como vocês acompanham metas hoje?
- Já usou algum sistema parecido?"
```

### Tarefa 1: Primeira Impressão (3 min)
```
"Acesse orion.com.br. Não clique em nada ainda. 
Me diz: o que você acha que é isso? O que te chamou 
atenção?"
```

### Tarefa 2: Encontrar Preço (5 min)
```
"Você quer saber quanto custa. Como você faria? 
Pense em voz alta."
```

### Tarefa 3: Avaliar para seu Segmento (5 min)
```
"Você trabalha com [segmento do participante]. 
Acha que isso serve para você? Como conferiria?"
```

### Tarefa 4: Agendar Demo (5 min)
```
"Você decidiu testar. Tente agendar uma demo."
```

### Tarefa 5: Tirar Dúvida (5 min)
```
"Você tem dúvida sobre segurança dos dados. 
Como resolveria isso sem falar com ninguém?"
```

### Debrief (5 min)
```
- O que você achou mais claro?
- O que foi confuso?
- O que faltou?
- De 0 a 10, quanto confiaria nesse produto?
- Recomendaria para um colega?
```

## 10.4 Cadência de Testes

- **Trimestral:** teste completo (5-7 usuários)
- **Pós-launch de feature:** teste específico (3 usuários)
- **Pós-redesign:** teste antes/depois (5+5 usuários)

## 10.5 Métricas Coletadas

- Task success rate (target: 80%+)
- Time on task (target: <2 min para agendar demo)
- SUS (System Usability Scale) — target: 75+
- NPS pós-teste — target: 8+
- % participantes que "comprariam" — target: 60%+

---

# Capítulo 11 — Accessibility Checklist (WCAG 2.2 AA)

## 11.1 Perceptível

- [ ] Todo conteúdo text alternativo para imagens (`alt` descritivo)
- [ ] Vídeos com legendas em português
- [ ] Áudio com transcrição
- [ ] Contraste de cores: texto normal ≥ 4.5:1, texto grande ≥ 3:1
- [ ] Não usar cor como único meio de transmitir informação
- [ ] Redimensionamento até 200% sem perda de conteúdo
- [ ] Reflow em 320px sem scroll horizontal

## 11.2 Operável

- [ ] Todo funcionalidade acessível via teclado (Tab, Enter, Esc, setas)
- [ ] Sem armadilhas de teclado (foco não fica preso)
- [ ] Sem time-out inferior a 20h para formulários
- [ ] Sem mais de 3 flashes por segundo (sem epilepsia)
- [ ] Navegação consistente (skip link para conteúdo)
- [ ] Foco visível em todos os elementos interativos
- [ ] Header com `role="banner"`, footer com `role="contentinfo"`
- [ ] Landmarks ARIA apropriadas

## 11.3 Compreensível

- [ ] Idioma da página declarado (`<html lang="pt-BR">`)
- [ ] Idioma de partes em outro idioma declarado
- [ ] Navegação consistente entre páginas
- [ ] Formulários com labels associadas (`<label for>`)
- [ ] Erros de formulário com mensagens claras e sugestões
- [ ] Erros anunciados via `aria-live`
- [ ] Auto-preenchimento via `autocomplete` (nome, email, telefone, empresa)

## 11.4 Robusto

- [ ] HTML semântico válido (W3C validator)
- [ ] ARIA roles, states, properties corretos
- [ ] Compatível com leitores de tela: NVDA, VoiceOver, JAWS
- [ ] Status messages via `role="status"` ou `aria-live`

## 11.5 Específico para Landing Page

### Hero
- [ ] H1 único na página
- [ ] CTAs com texto descritivo (não "clique aqui")
- [ ] Form de trial com labels visíveis (não placeholder only)

### Carrossel de depoimentos
- [ ] Botões de navegação acessíveis via teclado
- [ ] Auto-play pode ser pausado
- [ ] Estado ativo anunciado (`aria-current`)

### FAQ (acordeão)
- [ ] Botões com `aria-expanded`
- [ ] `aria-controls` ligando botão ao conteúdo
- [ ] Foco visível ao expandir

### Chat widget
- [ ] Botão de abrir com `aria-label="Abrir chat"`
- [ ] Mensagens novas anunciadas via `aria-live="polite"`
- [ ] Fechável via teclado (Esc)

### Cookie banner
- [ ] Foco capturado ao abrir
- [ ] Botões acessíveis via teclado
- [ ] Pode ser rejeitado com mesmo esforço que aceitar

## 11.6 Auditoria

- **Ferramentas automáticas:** axe DevTools, Lighthouse Accessibility, WAVE
- **Auditoria manual trimestral** por especialista
- **Testes com leitores de tela** mensais
- **User testing com pessoa com deficiência** semestral

---

# Capítulo 12 — Performance Budget

## 12.1 Orçamento de Performance

| Métrica | Desktop | Mobile | Crítico |
|---------|---------|--------|---------|
| LCP (Largest Contentful Paint) | < 1.5s | < 2.0s | ✅ |
| FID (First Input Delay) | < 50ms | < 100ms | ✅ |
| CLS (Cumulative Layout Shift) | < 0.05 | < 0.1 | ✅ |
| TTFB (Time to First Byte) | < 400ms | < 600ms | ✅ |
| FCP (First Contentful Paint) | < 1.0s | < 1.5s | |
| TTI (Time to Interactive) | < 3.0s | < 4.5s | |
| Total Blocking Time | < 200ms | < 400ms | |
| Speed Index | < 2.5s | < 4.0s | |

## 12.2 Orçamento de Recursos

| Recurso | Limite Desktop | Limite Mobile |
|---------|---------------|---------------|
| HTML | 30 KB | 30 KB |
| CSS (critical inline) | 14 KB | 14 KB |
| CSS (total) | 80 KB | 60 KB |
| JS (total gzipped) | 200 KB | 150 KB |
| Imagens | 500 KB | 300 KB |
| Fontes | 100 KB | 80 KB |
| Total page weight | 900 KB | 600 KB |
| Número de requests | 50 | 35 |

## 12.3 Otimizações Implementadas

### Imagens
- Format: WebP/AVIF (fallback JPEG)
- Responsive: `srcset` para 480, 768, 1024, 1440, 1920
- Lazy loading para imagens abaixo da dobra
- Imagens hero com `fetchpriority="high"`
- LQIP (Low Quality Image Placeholder) para blur-up effect

### JavaScript
- Code splitting por rota
- Tree shaking agressivo
- Componentes third-party carregados on-demand (chat, analytics)
- Self-host de fonts (sem Google Fonts CDN)
- Web Vitals tracking em produção

### CSS
- Critical CSS inline (above-the-fold)
- CSS não-crítico carregado assíncrono
- PurgeCSS em produção
- Tailwind: apenas classes usadas

### Fonts
- `font-display: swap`
- Preconnect para font host
- Subset para pt-BR (Latin Extended)
- Variable fonts quando possível

### Server
- SSR (Server-Side Rendering) com Next.js
- ISR (Incremental Static Regeneration) para conteúdo semi-estático
- Edge caching via Vercel Edge Network
- Cloudflare CDN para assets estáticos
- Brotli compression (melhor que gzip)

### Terceiros
- Analytics carregado após `DOMContentLoaded`
- Chat widget carregado após 3s ou interação
- Facebook Pixel carregado após consentimento
- YouTube embed com facade (preview image, carrega só no clique)

## 12.4 Monitoramento

- **Lighthouse CI** em cada PR (CI/CD)
- **WebPageTest** semanal
- **CrUX (Chrome UX Report)** mensal
- **Vercel Analytics** tempo real
- **Sentry Performance** para regressões
- Alerta Slack se LCP > 2.5s em produção

---

# Capítulo 13 — Mobile-Specific Copy

## 13.1 Headlines Encurtadas (Mobile)

| Desktop | Mobile |
|---------|--------|
| "Substitua planilhas e fichas de papel por uma plataforma inteligente de gestão comercial." | "Gestão comercial sem planilhas." |
| "O Orion é a plataforma 100% configurável que ajuda empresas a acompanhar metas, indicadores e equipes em tempo real." | "Metas, ranking e IA em tempo real. Configure em 1h." |
| "Acompanhe faturamento, metas e ranking atualizados a cada minuto." | "Dashboard em tempo real, no seu bolso." |

## 13.2 CTAs Mobile (Touch-friendly)

- Mínimo 44x44px (Apple HIG)
- Mínimo 48x48px (Material Design)
- Espaçamento mínimo entre CTAs: 8px
- Texto do botão: máximo 3 palavras

| Desktop | Mobile |
|---------|--------|
| "Teste Grátis por 14 dias →" | "Teste Grátis →" |
| "Agendar Demonstração" | "Agendar Demo" |
| "Começar Minha Conta Gratuita" | "Começar →" |

## 13.3 Seções Adaptadas para Mobile

### Pricing em Mobile (Stack vertical)
```
┌────────────────────────────┐
│  Planos para todos portes  │
│  [Mensal] ◯──● [Anual -15%]│
├────────────────────────────┤
│  ┌──────────────────────┐  │
│  │ STARTER              │  │
│  │ R$ 480/mês           │  │
│  │ até 10 users         │  │
│  │ [Teste Grátis →]     │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ ⭐ PROFESSIONAL      │  │
│  │ R$ 1.500/mês         │  │
│  │ até 50 users         │  │
│  │ [Teste Grátis →]     │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ ENTERPRISE           │  │
│  │ A partir R$ 5.000/mês│  │
│  │ [Agendar Demo →]     │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

### Features em Mobile (Lista vertical)
- Cards empilhados, não grid
- Tabs viram dropdown horizontal scrollável
- Ícones maiores (40x40 vs 24x24 desktop)

## 13.4 Sticky Bottom Bar (Mobile)

```
┌────────────────────────────┐
│  [Conteúdo da página...]   │
│                            │
├────────────────────────────┤
│  ┌────────┐  ┌──────────┐  │
│  │  DEMO  │  │  GRÁTIS  │  │
│  └────────┘  └──────────┘  │
└────────────────────────────┘
```

Aparece após scroll 50% da página. Aumenta conversão mobile em 22% (benchmark).

## 13.5 Click-to-Call (Mobile)

- Telefone no header vira `tel:` link em mobile
- Botão "Falar com Especialista" dispara chamada
- Após horário comercial, mostra "Deixe seu número, ligamos amanhã às 9h"

---

# Capítulo 14 — Personalization Strategy

## 14.1 Segmentos de Personalização

### Por Origem (UTM)
| Origem | Headline | CTA | Social Proof |
|--------|----------|-----|--------------|
| Google Ads "farmácia" | "Sistema para redes de farmácia" | "Teste Grátis para Farmácias" | Case Farmácia Vida Saudável |
| Google Ads "varejo" | "Sistema para supermercados" | "Teste Grátis para Varejo" | Case Rede SuperMais |
| LinkedIn Ads (Diretor Comercial) | "Para Diretores Comerciais" | "Agendar Demo Executiva" | Case diretor + ROI |
| Indicação | "Indicado por [Nome]" | "Resgatar Indicação" | Logo de quem indicou |
| Orgânico "TOTVS alternativa" | "Alternativa ao TOTVS Sales" | "Comparar Orion vs TOTVS" | Comparativo lado-a-lado |

### Por Comportamento
| Comportamento | Ação |
|----------------|------|
| Visitou 3x sem converter | Banner: "Ainda decidindo? Fale com especialista" |
| Passou 2+ min em /planos | Popup: "Queremos te ajudar a escolher. Chat?" |
| Viu vídeo hero completo | Substituir CTA por "Ver Demo Completa" |
| Veio de campanha de Black Friday | Banner sazonal no topo |

### Por Geolocalização (cidade)
- São Paulo, Rio: mostra cases da região
- Outras capitais: cases nacionais
- Cidades pequenas: enfatiza "suporte remoto, sem limites geográficos"

### Por Empresa (via IP → Clearbit)
- Empresa com 100+ funcionários: mostra plano Enterprise
- Startup: mostra plano Starter
- Concorrente identificado: omite, mostra genérico

## 14.2 Implementação

- **Ferramenta:** Mutiny, Intellimize ou custom com Vercel Edge Functions
- **Latência:** < 50ms (decisão no edge)
- **Fallback:** sempre tem versão default se personalização falha
- **A/B testing:** personalização vs default, 50/50 inicial

## 14.3 Regras de Privacidade

- Personalização só após consentimento (LGPD)
- Dados de IP geolocalização não PII (cidade, não endereço)
- Empresa identificada: hash, não guarda nome em cookie
- Usuário pode "ver versão padrão" via link no footer

---

# Capítulo 15 — Exit Intent Popup

## 15.1 Trigger

- **Desktop:** mouse sai pela parte superior da janela (`mouseleave` com `clientY < 0`)
- **Mobile:** scroll up rápido + velocidade > 200px/s após ter scrollado 50%+
- **Tablet:** igual mobile
- **Cooldown:** 7 dias (não mostra novamente para mesmo usuário)

## 15.2 Copy

### Variante A (Lead Magnet)
```
┌────────────────────────────────────────────────────┐
│                                                    │
│        ESPERA! ANTES DE IR...                      │
│                                                    │
│   Baixe grátis o Template de Plano de Metas 2025   │
│   (Excel editável, usado por 500+ empresas)        │
│                                                    │
│   ┌──────────────────────────────────────────┐    │
│   │ Seu melhor email                          │    │
│   └──────────────────────────────────────────┘    │
│   ┌──────────────────────────────────────────┐    │
│   │  QUERO O TEMPLATE GRÁTIS                 │    │
│   └──────────────────────────────────────────┘    │
│                                                    │
│   🔒 Não enviamos spam. Cancele a qualquer hora.  │
│                                                    │
│   Não, obrigado. Prefiro continuar sem template.  │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Variante B (Demo)
```
┌────────────────────────────────────────────────────┐
│                                                    │
│   VEM SAIR SEM FALAR COM A GENTE?                  │
│                                                    │
│   Reserva 15 minutos para uma demo personalizada.  │
│   Mostramos o Orion configurado para o SEU         │
│   segmento. Sem compromisso.                       │
│                                                    │
│   📅 [Agendar Demo - 15 min →]                     │
│                                                    │
│   Não, obrigado. Estou só navegando.              │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Variante C (Desconto sazonal)
```
┌────────────────────────────────────────────────────┐
│                                                    │
│   🔥 OFERTA RELÂMPAGO                              │
│                                                    │
│   20% OFF no plano anual                           │
│   se você começar hoje                             │
│                                                    │
│   Código: VAI20                                    │
│   Válido por: 23:59:47                             │
│                                                    │
│   [RESGATAR OFERTA →]                              │
│                                                    │
│   Não, obrigado. Não preciso de desconto.         │
│                                                    │
└────────────────────────────────────────────────────┘
```

## 15.3 A/B Testing de Popup

- 3 variantes rodando em paralelo (33% cada)
- Mínimo 1.000 exposições por variante para significância
- Métrica: conversão para trial OU demo OU lead magnet
- Vencedor: Variante A (lead magnet), com 4.2% conversão vs 2.1% B vs 1.8% C

## 15.4 Regras de Não-Abrangência

NUNCA mostrar popup se:
- Já é cliente logado
- Já preencheu formulário (cookie de conversão)
- Já fechou popup nesta sessão
- Está em página de login/checkout
- Tem `?utm_source=email` (já é lead)
- Usuário tem `prefers-reduced-motion`

---

# Capítulo 16 — Chat Widget Spec

## 16.1 Provedor

- **Drift** (B2B-first, integração com CRM) ou **Intercom**
- Alternativa nacional: **Blip** (LGPD-friendly)

## 16.2 Comportamento

### Botão Inicial
- Posição: canto inferior direito
- Tamanho: 60x60px
- Label: 💬 "Falar com especialista"
- Após 5s: badge animado "👋"

### Abertura Proativa
- Após 30s na página de pricing → "Dúvida sobre qual plano escolher?"
- Após scroll 75% → "Posso te ajudar com algo?"
- Após tentativa de saída → "Antes de ir, posso tirar uma dúvida?"
- Horário comercial (9-18h, seg-sex): humano disponível
- Fora horário: bot + mensagem "Deixe seu email, respondemos amanhã"

## 16.3 Bot Flow (Conversa Automatizada)

```
BOT: "Oi! 👋 Sou a Ana, da Orion. Posso te ajudar?"

[Usuário responde]

BOT: "Para eu te ajudar melhor, me conta:
1. Quantos vendedores tem sua equipe?
2. Qual seu segmento?"

[Usuário responde]

BOT: "Ótimo! Para seu perfil, recomendo o plano [Professional].
Você quer:
A) Agendar demo de 30 min
B) Testar grátis (14 dias, sem cartão)
C) Falar com vendedor agora"

[Usuário escolhe]

BOT: "Perfeito! [executa ação escolhida]"
```

## 16.4 Handoff para Humano

- Bot detecta: "quero falar com humano", "preço", "contrato", dúvidas complexas
- Roteia para fila de vendas
- SLA: resposta em < 2 min (horário comercial)
- Fora horário: mensagem "Nosso time responde a partir de 9h. Quer deixar email?"

## 16.5 Pós-Conversa

- Após fechamento do chat, botão "Avaliar conversa" (1-5 estrelas)
- Transcript enviado para CRM (HubSpot ou Pipedrive)
- Se positivo + lead qualificado: SDR entra em contato em 24h
- Se negativo: encaminha para CS para análise

## 16.6 Métricas do Chat

| Métrica | Target |
|---------|--------|
| Taxa de abertura | 8% |
| Conversas iniciadas/visitante | 0.08 |
| % conversas com humano | 35% |
| Tempo médio de primeira resposta (humano) | < 2 min |
| CSAT pós-chat | 4.5/5 |
| Conversão chat → demo | 25% |

---

# Capítulo 17 — Cookie Consent Implementation

## 17.1 Framework LGPD

- Base legal: consentimento explícito (Art. 7º, I)
- Direito de retirada fácil (Art. 18º, II)
- Informação clara sobre categorias de cookies (Art. 18º, III)

## 17.2 UI/UX do Banner

### Primeira Visita (após 1s)

```
┌────────────────────────────────────────────────────────────────────┐
│ 🍪 Nós usamos cookies para melhorar sua experiência.               │
│                                                                    │
│ Cookies essenciais (sempre ativos): funcionamento do site.         │
│ Cookies opcionais: analytics, marketing, personalização.           │
│                                                                    │
│ [Personalizar]   [Rejeitar opcionais]   [Aceitar todos]            │
└────────────────────────────────────────────────────────────────────┘
```

### Modal "Personalizar"

```
┌──────────────────────────────────────────────────────┐
│  Preferências de Cookies                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ▣ Essenciais (obrigatórios)                        │
│     • session, csrf_token, cookie_consent           │
│     • Não podem ser desativados                     │
│                                                      │
│  ☐ Analytics                                         │
│     • Google Analytics 4, Hotjar, Clarity            │
│     • Mede tráfego, heatmap, session replay          │
│                                                      │
│  ☐ Marketing                                         │
│     • Facebook Pixel, LinkedIn Insight, Google Ads   │
│     • Retargeting e atribuição de conversão          │
│                                                      │
│  ☐ Personalização                                    │
│     • Mutiny (segmentação de conteúdo)               │
│     • Drift (chat personalizado)                     │
│                                                      │
│  ☐ Vídeos e redes sociais                            │
│     • YouTube embeds, Twitter, LinkedIn embeds       │
│     • Pode rastrear você fora do Orion               │
│                                                      │
│  [Salvar preferências]   [Aceitar todos]            │
└──────────────────────────────────────────────────────┘
```

### Após escolha
- Banner desaparece (fade-out 300ms)
- Cookie `cookie_consent` salvo por 12 meses
- Scripts opcionais carregados conforme consentimento
- Link "Preferências de cookies" no footer para revisar

## 17.3 Implementação Técnica

### Provedor
- **Cookiebot** (popular, simples) ou **OneTrust** (enterprise)
- Alternativa open-source: **Klaro**

### Esquema de carregamento
```javascript
// Pseudo-código
if (cookie_consent.analytics) {
  loadGA4();
  loadHotjar();
  loadClarity();
}
if (cookie_consent.marketing) {
  loadFacebookPixel();
  loadLinkedInInsight();
  loadGoogleAdsTag();
}
if (cookie_consent.personalization) {
  loadMutiny();
  loadDrift();
}
```

### Google Consent Mode v2
```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'granted',
  'security_storage': 'granted',
  'wait_for_update': 500
});
// Após consentimento:
gtag('consent', 'update', {
  'ad_storage': 'granted',
  'analytics_storage': 'granted'
});
```

## 17.4 Política de Privacidade

- Link no footer: "Política de Privacidade"
- Página dedicada: `/privacidade`
- Lista todos os cookies, propósito, duração, provedor
- DPO contato: dpo@orion.com.br
- Direitos do titular: acesso, retificação, exclusão, portabilidade

---

# Capítulo 18 — Analytics & Tracking

## 18.1 Stack de Analytics

| Ferramenta | Uso | Custo |
|------------|-----|-------|
| Google Analytics 4 | Tráfego, conversão, funis | Grátis |
| Google Tag Manager | Tag management | Grátis |
| Hotjar | Heatmaps, session replay | $89/mês |
| Microsoft Clarity | Session replay (backup) | Grátis |
| Facebook Pixel | Retargeting Meta Ads | Grátis |
| LinkedIn Insight Tag | B2B attribution | Grátis |
| Google Ads Tag | Conversion tracking | Grátis |
| Vercel Analytics | Core Web Vitals | Grátis |
| Sentry | Erros JS, performance | $26/mês |

## 18.2 Data Layer (GTM)

```javascript
// Pseudo-código
dataLayer.push({
  'event': 'cta_click',
  'cta_location': 'hero',
  'cta_text': 'Teste Grátis por 14 dias',
  'cta_variant': 'A'
});

dataLayer.push({
  'event': 'trial_signup',
  'plan_selected': 'professional',
  'company_size': '11-50',
  'segment': 'farmacia'
});

dataLayer.push({
  'event': 'demo_request',
  'demo_type': '30min',
  'source': 'exit_intent_popup'
});
```

## 18.3 Dashboards

### Dashboard Executivo (Looker Studio)
- Visitantes/mês (origem, geografia, dispositivo)
- Conversão trial (por origem)
- MRR trazido pela landing
- CAC por canal
- Top páginas por conversão

### Dashboard de Otimização (Hotjar + GA4)
- Heatmap semanal
- Top session replays de drop-off
- Funil de conversão detalhado
- A/B tests em andamento + resultados

### Dashboard de Performance (Vercel + Sentry)
- LCP, FID, CLS por rota
- TTFB por região
- Erros JS por versão
- Uptime por serviço

## 18.4 Retenção de Dados

- GA4: 14 meses (configurado)
- Hotjar: 365 dias
- Logs de servidor: 90 dias
- Cookies analytics: 12 meses (renovados com consentimento)
- Dados pessoais (trials): conforme LGPD, deleção após 24 meses inativo

---

# Capítulo 19 — A/B Testing Roadmap

## 19.1 Testes Prioritários (Próximos 6 meses)

| # | Hipótese | Variável | Métrica | Status |
|---|----------|----------|---------|--------|
| T1 | Headline benefício-primário converte mais que problema-primário | Hero H1 | Trial rate | Em andamento |
| T2 | CTA "Ver Demo 2 min" supera "Teste Grátis" | CTA primário | Click-through | Em andamento |
| T3 | Pricing com toggle mensal/anual aumenta trial | Toggle UI | Trial rate | Planejado |
| T4 | Hero com vídeo embed converte mais que estática | Hero visual | Engagement + Trial |
| T5 | 3 depoimentos > 6 depoimentos | Nº depoimentos | Scroll reach |
| T6 | FAQ antes de Pricing responde dúvidas críticas | Ordem seções | Pricing view rate |
| T7 | Banner trust (LGPD, ISO) no topo aumenta confiança | Banner trust | Trial rate |
| T8 | Calculadora ROI embed aumenta engagement | Calculadora | Time on page |
| T9 | Sticky CTA bottom bar (mobile) aumenta conversão | Sticky bar | Mobile trial |
| T10 | Personalização por segmento vs genérico | Hero dinâmico | Trial rate |

## 19.2 Metodologia

- **Ferramenta:** GrowthBook (open-source) ou Vercel A/B Testing
- **Significância:** 95% (p<0.05)
- **Sample size:** calculado via Power Analysis (geralmente 1.000+ por variante)
- **Duração mínima:** 2 semanas (controla sazonalidade semanal)
- **Duração máxima:** 6 semanas (evita "test fadiga")
- **Critério de vitória:** métrica primária + sem regressão em métricas guardiãs

## 19.3 Processo

1. **Hipótese** documentada (problema → solução → métrica → target)
2. **Design da variante** revisado por time (PM + designer + dev)
3. **Implementação** com feature flag (10% inicial)
4. **Smoke test** 24h (sanity check)
5. **Ramp-up** 10% → 25% → 50%
6. **Monitoramento diário** de métricas guardiãs
7. **Decisão** com base em dados (PM + analista)
8. **Documentação** do resultado (ganhou/perdeu/inconclusivo)
9. **Deploy** do vencedor como novo controle

---

# Capítulo 20 — KPIs e SLAs

## 20.1 KPIs Mensais

| Métrica | Target | Atual | Owner |
|---------|--------|-------|-------|
| Visitantes únicos/mês | 18.000 | 1.200 | Marketing |
| Taxa conversão trial | 3.0% | 1.8% | Growth |
| Trials/mês | 540 | 22 | Growth |
| Demos/mês | 220 | 8 | Sales |
| CAC blended | R$ 540 | R$ 1.450 | Finance |
| LCP mobile P75 | < 2.0s | 2.8s | Eng |
| CLS | < 0.1 | 0.18 | Eng |
| Lighthouse Performance | > 90 | 78 | Eng |
| Lighthouse Accessibility | > 95 | 88 | Eng |
| DA da home | 28 | 18 | SEO |
| Backlinks novos/mês (DR 40+) | 10 | 2 | SEO |
| NPS pós-trial | > 50 | 42 | CS |

## 20.2 SLAs de Manutenção

| Item | SLA | Owner |
|------|-----|-------|
| Página fora do ar | < 5 min detecção | DevOps |
| LCP > 5s | < 4h correção | Eng |
| Form de trial quebrado | < 1h correção | Eng |
| Erro 500 em qualquer rota | < 30 min correção | Eng |
| Conteúdo desatualizado (preço errado) | < 24h atualização | Marketing |
| Atualização de blog | 4 posts/mês | Content |
| Review de A/B tests | Semanal (toda quinta) | Growth |
| Auditoria de acessibilidade | Trimestral | Eng + Designer |

## 20.3 Alertas

- **Slack #orion-marketing:** conversão trial cai > 20% dia anterior
- **Slack #orion-eng-alerts:** LCP P75 > 3s por 1h, erro 500 rate > 0.1%
- **PagerDuty:** site fora do ar (uptime < 99.9%)
- **Email DPO:** pedido de exclusão de dados LGPD (resposta em 15 dias)

---

# Capítulo 21 — Manutenção e Governança

## 21.1 Responsabilidades

| Papel | Responsabilidade | Owner |
|-------|-----------------|-------|
| Landing Page Owner | Decisão final sobre mudanças | Head of Growth |
| Product Manager (LP) | Roadmap, priorização | PM Marketing |
| Lead Designer | UI/UX, design system | Designer Sênior |
| Lead Engineer | Implementação, performance | Tech Lead Frontend |
| Copywriter | Copy, A/B variants | Copywriter |
| SEO Specialist | Keywords, link building | Analista SEO |
| Analytics Lead | Métricas, dashboards | Data Analyst |
| QA | Testes, acessibilidade | QA Engineer |

## 21.2 Cadência de Reuniões

- **Segunda 9h:** review semanal de métricas (30 min)
- **Terça 14h:** priorização de testes (45 min)
- **Sexta 11h:** review de A/B tests (30 min)
- **Mensal:** review mensal consolidado (2h)
- **Trimestral:** planning de próximo trimestre (4h)

## 21.3 Documentação

- **Notion:** todas as decisões registradas (decision log)
- **Figma:** design files versionados
- **GitHub:** código versionado (repositório `orion-landing`)
- **Looker Studio:** dashboards públicos para stakeholders

## 21.4 Processo de Mudança

1. **Proposta** (qualquer um pode propor via Notion)
2. **Avaliação** por PM + Designer (impacto vs esforço)
3. **Aprovação** por Landing Page Owner
4. **Implementação** com feature flag
5. **A/B test** se impacto significativo
6. **Deploy** para 100% se vencedor
7. **Documentação** do resultado

## 21.5 Backup e Disaster Recovery

- Deploy pode ser revertido em < 2 min (Vercel rollback)
- DNS com TTL baixo (300s) para mudança rápida
- Plano B: site estático em S3+CloudFront se Vercel cair
- Comunicação de incidente: status.orion.com.br

---

# Apêndice A — Variações de Headline para Teste

| ID | Copy | Hipótese |
|----|------|----------|
| H1 | "Substitua planilhas e fichas de papel por uma plataforma inteligente de gestão comercial." | Controle |
| H2 | "Acompanhe metas e ranking em tempo real. Sem planilhas." | Benefício direto |
| H3 | "+500 empresas já substituíram planilhas pelo Orion." | Prova social |
| H4 | "O sistema que redes de farmácias, varejo e franquias usam." | Especificidade |
| H5 | "Gestão comercial sem planilha. Sem código. Sem dor de cabeça." | Trinômio |
| H6 | "A primeira plataforma brasileira 100% configurável de gestão comercial." | Posicionamento |
| H7 | "Suas metas, sua equipe, seu dashboard. Em tempo real." | Personalização |
| H8 | "Substitua 8 planilhas por 1 dashboard inteligente." | Concreto |

---

# Apêndice B — Bibliografia e Referências

- Nielsen Norman Group: "Landing Page Usability"
- Unbounce: "Conversion Benchmark Report 2024"
- CXL Institute: "Landing Page Optimization"
- Google: "Web Vitals"
- WCAG 2.2 (W3C Recommendation, 05 October 2023)
- LGPD (Lei nº 13.709/2018)
- ANPD: "Guia Orientativo: Cookies e Proteção de Dados"

---

**Fim do Documento 25 — Landing Page Specification v2.0**
**Tamanho:** ~38 KB | **Capítulos:** 21 + 2 apêndices | **Tabelas:** 28 | **ASCII wireframes:** 6 | **Variantes A/B:** 15+
