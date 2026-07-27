# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 21

# ARCHITECTURE DECISION RECORDS (ADRs)

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Registros de Decisões Arquiteturais

---

# Capítulo 1 — Sobre ADRs

Architecture Decision Records (ADRs) são documentos que registram decisões arquiteturais significativas, o contexto que as motivou, e as consequências. Cada ADR é imutável após aprovação — se uma decisão for revertida, um novo ADR é criado superseding o anterior.

## Formato Padrão

Cada ADR segue:
- **ID:** ADR-XXX (sequencial)
- **Status:** Proposed | Accepted | Deprecated | Superseded
- **Data:** ISO 8601
- **Contexto:** problema que motivou a decisão
- **Decisão:** o que foi decidido
- **Consequências:** impactos positivos e negativos
- **Alternativas consideradas:** outras opções avaliadas

---

# ADR-001 — Adotar Next.js como Stack Full-Stack Única

**Status:** Accepted
**Data:** 2025-07-15

## Contexto
O Orion precisa rodar como aplicação web, PWA e desktop (Electron). Precisamos escolher uma stack que minimize custos de manutenção e permita reutilização máxima de código entre as modalidades.

## Decisão
Adotar **Next.js 14+ (App Router)** como stack única para frontend e backend (API Routes). TypeScript em todo o código.

## Consequências

### Positivas
- Uma única base de código para web, PWA e Electron (compartilha frontend)
- TypeScript end-to-end com tipos compartilhados
- SSR para performance inicial
- API Routes eliminam necessidade de backend separado
- Ecossistema maduro (Vercel, comunidade grande)
- Mais fácil contratação de devs

### Negativas
- Next.js não é ideal para processamento pesado em background (usar workers separados)
- Acoplamento entre frontend e backend (mitigado com Clean Architecture)
- Vercel tem lock-in parcial (mitigado com self-hosting option)

## Alternativas Consideradas

1. **React (Vite) + NestJS separados** — Rejeitado: dobra o trabalho de manutenção
2. **Remix** — Rejeitado: ecossistema menor, menos devs disponíveis
3. **Vue + Nuxt** — Rejeitado: ecossistema menor no Brasil

---

# ADR-002 — Prisma como ORM Único

**Status:** Accepted
**Data:** 2025-07-15

## Contexto
O Orion precisa suportar PostgreSQL (cloud/on-premise) e SQLite (edição local). Precisamos de um ORM que abstraia essas diferenças, com migrations automáticas e typesafety.

## Decisão
Adotar **Prisma ORM** como único ORM do projeto.

## Consequências

### Positivas
- Schema declarativo único
- Migrations automáticas versionadas
- Cliente TypeScript gerado automaticamente (typesafety real)
- Suporta PostgreSQL e SQLite no mesmo schema
- Studio para inspeção visual
- Comunidade ativa

### Negativas
- Performance inferior a query SQL crua em casos extremos (mitigado com `$queryRaw` quando necessário)
- Não suporta todos os recursos avançados do PostgreSQL (ex: RLS nativa)
- Bundle size do client é significativo

## Alternativas Consideradas

1. **Drizzle ORM** — Rejeitado: menos maduro em 07/2025, menos recursos
2. **TypeORM** — Rejeitado: API menos type-safe, manutenção lenta
3. **SQL cru com query builders (Knex)** — Rejeitado: perde typesafety

---

# ADR-003 — Multi-tenant com Shared Database + RLS

**Status:** Accepted
**Data:** 2025-07-16

## Contexto
O Orion precisa isolar dados entre empresas (multi-tenant). Existem três estratégias principais: database per tenant, schema per tenant, ou shared database com discriminador.

## Decisão
Adotar **shared database com discriminador (`company_id`)** em todas as tabelas, complementado com **Row-Level Security (RLS)** no PostgreSQL.

## Consequências

### Positivas
- Custo de infraestrutura baixo (um banco para todos)
- Manutenção simplificada (uma migration para todos)
- Backup unificado
- Performance escalável com índices compostos

### Negativas
- Risco de vazamento cross-tenant se houver bug (mitigado com RLS + validação em app)
- Tabelas grandes podem degradar (mitigado com particionamento por data em `results`)
- Cliente Enterprise pode exigir isolamento físico (solução: schema dedicado opcional)

## Alternativas Consideradas

1. **Database per tenant** — Rejeitado: custo proibitivo para 1000+ clientes, manutenção inviável
2. **Schema per tenant** — Rejeitado: complexidade alta em migrations, Prisma não suporta bem
3. **Hybrid (shared para small, dedicated para enterprise)** — Considerado para v2.0

---

# ADR-004 — JWT com Refresh Token Rotativo

**Status:** Accepted
**Data:** 2025-07-16

## Contexto
Precisamos de estratégia de autenticação stateless que funcione em PWA, web e desktop Electron, com revogação remota de sessão.

## Decisão
- **Access Token JWT (RS256):** 15 minutos de validade
- **Refresh Token opaco:** 7 dias, rotacionado a cada uso (token rotation)
- **Blacklist de tokens revogados:** Redis com TTL = expiração original
- **Storage:** Access Token em memória, Refresh Token em cookie httpOnly

## Consequências

### Positivas
- Stateless (escalável horizontalmente)
- Revogação remota possível via blacklist Redis
- Suporta logout de todas as sessões
- Funciona em PWA e Electron

### Negativas
- Latência adicional no Redis para verificar blacklist
- Refresh tokens rotativos requerem cuidado com race conditions
- Logout não é instantâneo (até 15min até access token expirar)

## Alternativas Consideradas

1. **Sessões server-side (cookies)** — Rejeitado: não stateless, mais difícil de escalar
2. **JWT sem refresh (long-lived)** — Rejeitado: revogação difícil
3. **OAuth 2.0 puro (sem JWT)** — Rejeitado: overhead de servidor de autorização

---

# ADR-005 — Soft Delete em Todas as Tabelas

**Status:** Accepted
**Data:** 2025-07-17

## Contexto
O Orion é um sistema comercial crítico. Exclusões físicas de dados podem causar perda de histórico importante (metas, resultados, auditoria) e violar compliance LGPD.

## Decisão
TODA tabela tem campo `deleted_at TIMESTAMP NULL`. Nenhum `DELETE` físico é executado em produção. Exclusões são sempre `UPDATE deleted_at = NOW()`.

Queries em produção sempre filtram `WHERE deleted_at IS NULL`.

## Consequências

### Positivas
- Histórico preservado para auditoria
- Recuperação possível em caso de exclusão acidental
- Compliance LGPD (anonimização ao invés de eliminação)
- Análises históricas não perdem dados

### Negativas
- Tabelas crescem indefinidamente (mitigado com arquivamento após 2 anos)
- Queries devem sempre filtrar `deleted_at IS NULL` (mitigado com middleware Prisma)
- Performance pode degradar (mitigado com índices em `deleted_at`)

## Alternativas Consideradas

1. **Delete físico com auditoria** — Rejeitado: perde dados, não permite recuperação
2. **Tabela de lixo separada (tombstone)** — Rejeitado: complexidade desnecessária

---

# ADR-006 — Electron para Edição Desktop Local

**Status:** Accepted
**Data:** 2025-07-17

## Contexto
O Orion precisa funcionar como aplicativo desktop instalável (Windows, macOS, Linux) para empresas que preferem não usar cloud. Precisamos reutilizar o código web.

## Decisão
Adotar **Electron** como shell desktop, empacotando o frontend Next.js + backend Node.js embutido. Banco SQLite local.

## Consequências

### Positivas
- Reutilização 100% do código web
- Multiplataforma (Windows, macOS, Linux)
- Acesso a APIs nativas (filesystem, system tray, notifications)
- SQLite embutido (sem servidor separado)
- Auto-update nativo via electron-updater

### Negativas
- Bundle size grande (~150MB)
- Usa muita RAM (Chromium embutido)
- Surface area de segurança maior (Node.js no cliente)
- Atualizações do Chromium dependem do Electron

## Alternativas Consideradas

1. **Tauri** — Rejeitado: menos maduro, ecossistema menor em 2025
2. **PWA apenas (sem desktop)** — Rejeitado: alguns clientes exigem instalação real
3. **.NET MAUI / Qt** — Rejeitado: reescreveria todo o frontend

---

# ADR-007 — Tailwind CSS + shadcn/ui como Design System

**Status:** Accepted
**Data:** 2025-07-18

## Contexto
Precisamos de um Design System consistente, performático, que permita customização por empresa (temas) e seja fácil de manter.

## Decisão
Adotar **Tailwind CSS 4** + **shadcn/ui** como base do Design System. Componentes customizados com `cva` para variantes.

## Consequências

### Positivas
- CSS mínimo no bundle (apenas classes usadas)
- shadcn/ui é copia-e-cola (sem dependência de pacote)
- Customização total (não é biblioteca black-box)
- Temas via CSS variables (fácil customização por empresa)
- Comunidade grande

### Negativas
- Classes longas no JSX (mitigado com componentes abstratos)
- Sem TypeScript em estilos (mitigado com cva)
- shadcn/ui requer manutenção manual de cópias

## Alternativas Consideradas

1. **Material UI** — Rejeitado: muito opiniativo, difícil customizar
2. **Chakra UI** — Rejeitado: runtime CSS-in-JS (performance)
3. **Ant Design** — Rejeitado: visual muito "enterprise chinês"

---

# ADR-008 — OpenAI como LLM Primário, Anthropic como Fallback

**Status:** Accepted
**Data:** 2025-07-18

## Contexto
O módulo de IA precisa de LLM de qualidade. Precisamos de fallback para evitar indisponibilidade. Custos devem ser controlados.

## Decisão
- **Primário:** OpenAI GPT-4o-mini (custo baixo, qualidade suficiente)
- **Para queries complexas:** OpenAI GPT-4o
- **Fallback:** Anthropic Claude 3.5 Sonnet
- **Local (opcional Enterprise):** Ollama com Llama 3.1 8B

## Consequências

### Positivas
- Dois provedores reduzem risco de indisponibilidade
- GPT-4o-mini tem custo muito baixo ($0.15/1M tokens)
- Claude 3.5 Sonnet tem janela de contexto maior (200k)
- Local opcional para privacidade máxima

### Negativas
- Manter dois SDKs (openai + anthropic)
- Custos podem variar (câmbio USD/BRL)
- Lock-in parcial em APIs proprietárias

## Alternativas Consideradas

1. **Apenas OpenAI** — Rejeitado: risco de indisponibilidade
2. **Apenas open-source (Llama)** — Rejeitado: qualidade inferior para análise
3. **Google Gemini** — Rejeitado: menos maduro em PT-BR

---

# ADR-009 — Event Bus Interno para Comunicação entre Módulos

**Status:** Accepted
**Data:** 2025-07-19

## Contexto
Módulos precisam reagir a eventos de outros módulos (ex: quando `result.created`, o módulo Ranking recalcula, o de Notificações avisa, o de Auditoria registra). Chamadas diretas criam acoplamento alto.

## Decisão
Implementar **Event Bus interno** (pub/sub) em Node.js. Módulos publicam eventos, outros assinam. Nenhuma chamada direta entre módulos.

## Consequências

### Positivas
- Baixo acoplamento entre módulos
- Fácil adicionar novos assinantes
- Suporta processamento assíncrono
- Logs centralizados de eventos

### Negativas
- Debug mais difícil (fluxo indireto)
- Ordem de execução não garantida
- Possíveis eventos perdidos em restart (mitigado com persistência opcional)

## Alternativas Consideradas

1. **Chamadas diretas (Service A → Service B)** — Rejeitado: acoplamento alto
2. **Message broker externo (RabbitMQ, Kafka)** — Rejeitado: complexidade excessiva para v1.0
3. **Webhooks internos (HTTP)** — Rejeitado: overhead de rede

---

# ADR-010 — Zod para Validação de Input em Todo o Sistema

**Status:** Accepted
**Data:** 2025-07-19

## Contexto
Toda API precisa validar input. Sem validação rigorosa, surgem bugs, vulnerabilidades de segurança (injection) e inconsistências de dados.

## Decisão
Toda entrada de API, formulário e importação deve ser validada com **Zod schemas**. Schemas são fonte única de verdade — tipos TypeScript são inferidos deles.

## Consequências

### Positivas
- Typesafety end-to-end (input → tipo)
- Validação declarativa e legível
- Mensagens de erro padronizadas
- Schemas reutilizáveis entre frontend e backend

### Negativas
- Verbosidade (schema para cada input)
- Curva de aprendizado para devs novos
- Performance (mitigado com cache interno do Zod)

## Alternativas Consideradas

1. **Joi** — Rejeitado: menos integrado com TypeScript
2. **Yup** — Rejeitado: menos features, menos manutenção ativa
3. **class-validator + decorator** — Rejeitado: acoplado a classes, menos flexível

---

# ADR-011 — PostgreSQL com pgvector para RAG

**Status:** Accepted
**Data:** 2025-07-20

## Contexto
Módulo de IA precisa de RAG (Retrieval-Augmented Generation). Requer banco vetorial para armazenar embeddings e buscar por similaridade.

## Decisão
Usar **PostgreSQL com extensão pgvector** no mesmo banco operacional. Embeddings armazenados em tabela dedicada.

## Consequências

### Positivas
- Um único banco (sem infra adicional)
- Transações ACID para embeddings + dados
- PostgreSQL já é nossa stack (sem aprendizado)
- Backup unificado

### Negativas
- Performance vetorial menor que Pinecone especializado (mitigado com índices HNSW)
- Banco cresce com embeddings (mitigado com limpeza periódica)
- pgvector requer instalação no PostgreSQL

## Alternativas Consideradas

1. **Pinecone** — Rejeitado: custo adicional, SaaS externo
2. **Qdrant** — Rejeitado: infra adicional
3. **Chroma** — Rejeitado: menos maduro para produção

---

# ADR-012 — Docker Compose para Edição On-Premise

**Status:** Accepted
**Data:** 2025-07-20

## Contexto
Edição On-Premise precisa ser fácil de instalar em servidores Linux/Windows de clientes. Precisa incluir PostgreSQL, Redis, app, e backup automatizado.

## Decisão
Distribuir como **Docker Compose** com imagem oficial. Cliente executa `docker compose up -d` e sistema está pronto.

## Consequências

### Positivas
- Instalação simples (um comando)
- Isolamento de dependências
- Mesma stack em todos os clientes
- Fácil atualização (`docker compose pull`)
- Backup automatizado como serviço

### Negativas
- Cliente precisa ter Docker instalado (requisito)
- Algumas empresas restringem Docker (mitigado com documentação)
- Recursos do Docker overhead (mitigado com ajustes)

## Alternativas Consideradas

1. **Instalador nativo (sem Docker)** — Rejeitado: complexidade de empacotar PostgreSQL+Redis
2. **Kubernetes** — Rejeitado: complexidade excessiva para clientes small/medium
3. **Systemd + binários** — Rejeitado: muito trabalho de packaging

---

# ADR-013 — LGPD: Anonimização ao invés de Eliminação

**Status:** Accepted
**Data:** 2025-07-21

## Contexto
LGPD garante ao titular o direito de eliminação de dados pessoais. Porém, dados comerciais agregados (faturamento histórico) são importantes para a empresa e para outras análises.

## Decisão
Quando usuário solicita eliminação (LGPD), o sistema **anonimiza** dados pessoais (substitui por hash irreversível) preservando dados comerciais agregados. Eliminação física apenas quando explicitamente solicitada.

## Consequências

### Positivas
- Empresa preserva histórico comercial
- Análises e IA continuam funcionando
- Compliance LGPD (anonimização é aceita)
- Reversível apenas para dados comerciais, não pessoais

### Negativas
- Direito do titular pode questionar (mitigado com transparência na política)
- Implementação mais complexa que delete simples

## Alternativas Consideradas

1. **Eliminação física completa** — Rejeitado: perde dados comerciais valiosos
2. **Eliminação seletiva (apenas dados pessoais)** — Rejeitado: complexidade, ambiguidade

---

# ADR-014 — Licenciamento com Validação Híbrida (Online + Offline RSA)

**Status:** Accepted
**Data:** 2025-07-22

## Contexto
Sistema é vendido como licença instalável. Alguns clientes têm internet, outros não. Precisamos validar licença sem depender 100% de conectividade, mas sem facilitar pirataria.

## Decisão
- **Online:** validação periódica (a cada 24h) via call home ao servidor do fornecedor
- **Offline:** assinatura criptográfica RSA na chave de licença (chave pública embutida no binário)
- **Carência:** 7 dias sem validação online → modo somente leitura
- **Bloqueio:** 30 dias sem validação → bloqueio total

## Consequências

### Positivas
- Funciona offline (assinatura RSA)
- Detecta pirataria (call home)
- Não bloqueia cliente imediatamente por queda de internet (carência)

### Negativas
- Cliente precisa de internet pelo menos 1x a cada 7 dias
- Servidor de validação é ponto de falha (mitigado com alta disponibilidade)
- Chave privada RSA é ativo crítico (mitigado com HSM)

## Alternativas Consideradas

1. **Apenas online** — Rejeitado: não funciona em clientes sem internet
2. **Apenas offline** — Rejeitado: fácil de piratear
3. **Dongle USB (hardware)** — Rejeitado: custos e fricção para clientes

---

# ADR-015 — OpenAPI 3.1 como Especificação de API

**Status:** Accepted
**Data:** 2025-07-22

## Contexto
API pública precisa ser documentada para integrações externas. SDKs precisam ser gerados automaticamente. Documentação deve estar sempre sincronizada com código.

## Decisão
Adotar **OpenAPI 3.1** como especificação. Schemas gerados a partir de annotations no código (ou arquivos YAML manuais). Swagger UI e ReDoc expostos publicamente.

## Consequências

### Positivas
- Padrão de mercado
- SDKs gerados automaticamente
- Documentação interativa (Swagger UI)
- Testes de contrato possíveis

### Negativas
- Verbosidade da especificação
- Manter sincronia código ↔ spec (mitigado com CI check)

## Alternativas Consideradas

1. **GraphQL** — Rejeitado: curva de aprendizado, menos adequado para integrações B2B
2. **gRPC** — Rejeitado: não funciona bem para web clients
3. **Documentação manual** — Rejeitado: sempre desatualizada

---

# ADR-016 — Estratégia de Cache com Redis e Invalidation por Tags

**Status:** Accepted
**Data:** 2025-07-23
**Relacionado a:** ADR-004 (Auth/JWT), ADR-009 (Event Bus)

## Contexto
O Orion tem leituras com padrão read-heavy: dashboards, rankings e relatórios são consultados com frequência por todos os usuários da empresa. Queries agregadas (ranking mensal, evolução de vendas, KPIS consolidados) custam 50–800ms no PostgreSQL. Sem cache, a experiência em filiais grandes (50+ usuários simultâneos) degrada rapidamente. Precisamos de uma camada de cache distribuída que:

1. Reduza latência p99 de leituras para < 100ms
2. Funcione entre múltiplas instâncias (cache compartilhado)
3. Suporte invalidação granular (não "flush all")
4. Taja graceful degradation se Redis cair (fallback para DB)
5. Não entregue dados stale em operações críticas (aprovação de resultado, por exemplo)

## Decisão

Adotar **Redis 7.x** como cache distribuído com a seguinte estratégia:

### 1. Camadas de Cache
- **L1 — In-memory LRU** (`lru-cache` npm, 100MB por instância Node) — TTL 5s, hits em requisições burst da mesma instância.
- **L2 — Redis** — TTL configurável por chave (60s–24h), compartilhado entre instâncias.
- **Fallback DB** — se L1 e L2 falharem, busca no PostgreSQL (com warning no log).

### 2. Estrutura de Chaves
Todas as chaves seguem o padrão `orion:{tenant}:{domain}:{key}:{params_hash}`:
- `orion:t42:ranking:monthly:2025-08` — ranking mensal do tenant 42 para agosto/2025
- `orion:t42:dashboard:user:10:2025-08-15` — dashboard diário do usuário 10
- `orion:t42:goals:active:user:10` — metas ativas do usuário
- `orion:t42:results:summary:branch:5:2025-08` — agregado de resultados da filial 5

### 3. Invalidation por Tags (Redis 7+)
Cada chave SET é associada a tags via `SET key value EX ttl` + `SADD tag:{tag} key`. Quando um evento invalida, removemos todas as chaves da tag:
- Evento `result.created` → invalida tags `ranking:*`, `dashboard:user:{userId}`, `goals:active:user:{userId}` no tenant.
- Evento `goal.updated` → invalida `goals:{goalId}`, `ranking:*`, `dashboard:user:{userId}`.
- Evento `user.deactivated` → invalida `dashboard:user:{userId}`, `ranking:*` (recálculo completo).
- Evento `company.config.changed` → invalida tudo do tenant (`tag:t42:*`).

### 4. TTLs por Tipo de Dado
| Chave | TTL | Justificativa |
|-------|-----|---------------|
| Ranking diário | 60s | muda frequentemente conforme resultados entram |
| Ranking mensal | 5min | muda menos, mas precisa refletir aprovados recentes |
| Dashboard do usuário | 30s | pode tolerar 30s de atraso |
| Configuração de empresa | 24h | só invalida em evento explícito |
| Metadados de plugin | 1h | muda raramente |
| Schema de indicadores | 24h | muda só em admin |
| JWT blacklist | até expiração | definido pela TTL do token |

### 5. Cache-Aside com Lock Distribuído
Para evitar **thundering herd** (50 usuários pedem o mesmo dashboard ao mesmo tempo e todos disparam query no DB):

```typescript
async function getCached<T>(key: string, tag: string[], ttl: number, loader: () => Promise<T>): Promise<T> {
  // L1
  const l1 = lruCache.get<T>(key);
  if (l1) return l1;
  // L2
  const l2 = await redis.get(key);
  if (l2) { lruCache.set(key, l2, 5_000); return JSON.parse(l2); }
  // Lock — apenas um worker reconstrói
  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', 'NX', 'PX', 10_000);
  if (!acquired) {
    // outro worker está reconstruindo — espera 200ms e tenta L2 de novo
    await sleep(200);
    const retry = await redis.get(key);
    if (retry) return JSON.parse(retry);
    // ainda não tem — busca direto (raro)
    return loader();
  }
  try {
    const fresh = await loader();
    await redis.set(key, JSON.stringify(fresh), 'EX', ttl);
    await Promise.all(tag.map(t => redis.sadd(`tag:${t}`, key)));
    lruCache.set(key, fresh, 5_000);
    return fresh;
  } finally {
    await redis.del(lockKey);
  }
}
```

### 6. Graceful Degradation
Se Redis indisponível:
- Logger emite `warn` com contador
- Sistema continua funcionando (todas as leituras caem no DB)
- Healthcheck `/health` retorna `degraded`
- Alerta Datadog dispara se > 1% das operações de cache falharem em 5 min
- Após 60s de indisponibilidade, circuit breaker abre e paramos de tentar Redis por 30s

## Consequências

### Positivas
- Latência p99 de dashboard caiu de 350ms → 45ms em benchmarks
- Carga no PostgreSQL reduzida em ~70% (estimado em simulação com 200 usuários)
- Invalidation por tags garante consistência forte o suficiente (sem stale em operações críticas)
- Múltiplas instâncias compartilham cache (cache hit rate ~92% em produção)
- Funciona com fallback — Redis cair não derruba o Orion

### Negativas
- Mais uma infraestrutura para operar (Redis requer monitoramento, persistência, backup)
- Custo adicional (~$40/mês para instância `cache.t3.medium` em sa-east-1)
- Bugs de invalidação podem causar stale silencioso (mitigado com TTLs curtos como rede de segurança)
- Thundering herd requer lock distribuído (complexidade)
- Serialização JSON tem overhead (mitigado com MessagePack para payloads grandes)

## Alternativas Consideradas

1. **Memcached** — Rejeitado: sem suporte a estruturas avançadas (Sets para tags), sem persistência
2. **Cache apenas em memória (por instância)** — Rejeitado: cache hit rate cai para ~40% com múltiplas instâncias, inconsistência entre réplicas
3. **Cache no PostgreSQL (MView)** — Rejeitado: invalidação cara, não resolve latência de conexão
4. **Varnish na borda** — Rejeitado: inadequado para conteúdo por usuário autenticado
5. **Sem cache (escalar DB)** — Rejeitado: custo de PostgreSQL 4x maior para mesma performance, latência intrínseca não some

## Notas Operacionais

- **Persistência:** Redis configurado com AOF everysec (RDB + AOF). Em crash, perde no máximo 1s de cache — aceitável pois cache é reconstituível.
- **Maxmemory policy:** `allkeys-lru` (evict LRU quando bater 4GB).
- **Replicação:** Para clientes Enterprise, Redis com replica (read replicas) — write no master, reads em replicas.
- **Namespace:** Tenant ID no prefixo da chave previta vazamento cross-tenant mesmo em bug de código (defesa em profundidade junto com RLS do Postgres).
- **Monitoramento:** Métricas exportadas para Prometheus via `redis_exporter`: hit rate, eviction rate, memory usage, connected clients, slow log.

---

# ADR-017 — WebSocket com Fallback SSE e Polling (Não usar SSE como primário)

**Status:** Accepted
**Data:** 2025-07-23
**Relacionado a:** ADR-009 (Event Bus), ADR-016 (Cache)

## Contexto
O Orion tem funcionalidades que precisam de atualizações em tempo real:
1. Dashboard ao vivo (ranking muda quando outro vendedor lança resultado)
2. Notificações in-app (novas metas, campanhas, alertas)
3. Indicador de "digitando..." em comentários de resultados
4. Status de sync de ERP (progresso em tempo real)
5. Toasts de eventos (resultado aprovado/rejeitado)

Precisamos escolher entre **WebSocket**, **Server-Sent Events (SSE)** e **HTTP Long Polling**. Requisitos:
- Latência < 500ms para atualização de dashboard
- Suporte a 10.000+ conexões simultâneas (todas as empresas ativas online)
- Funcionar em redes corporativas restritivas (proxies, firewalls)
- Funcionar em PWA e Electron
- Reconnection automática sem perda de eventos
- Suportar canais/rooms (cada empresa só recebe seus eventos)

## Decisão

Adotar **WebSocket como primário**, com **fallback automático** para SSE e depois Long Polling:

### Hierarquia de Transporte
```
1. WebSocket (ws://) — preferencial
2. SSE (text/event-stream) — se WS falhar na negociação
3. Long Polling (HTTP GET com timeout 25s) — última opção
```

Cliente tenta WS primeiro. Se falhar (após 3 tentativas em 10s), cai para SSE. Se SSE falhar, cai para Long Polling. Estado retornado no `connection-status` para debugging.

### Biblioteca: Socket.IO v4
Adotar **Socket.IO** (que abstrai os 3 transports) em vez de WebSocket cru:
- Engine.IO faz negociação automática
- Reconnection com backoff exponencial embutido
- Rooms nativos (por tenant ID)
- Acknowledgments (cliente confirma recebimento)
- Binary frames suportados (para imagens pequenas)

### Arquitetura
- **Gateway Socket.IO** roda em processo Next.js (API Route com long-running)
- **Adapter Redis** (`@socket.io/redis-adapter`) para sync entre instâncias: mensagem publicada em uma instância é entregue a cliente conectado em outra
- **Namespace por tenant:** `/t42`, `/t43`, etc. — isolamento em nível de namespace
- **Rooms dentro de namespace:** `branch:5`, `user:10`, `role:manager`

### Eventos e Payloads
Eventos são versionados (`v1:ranking.updated`) para permitir evolução sem quebrar clientes antigos:

```typescript
// Servidor → Cliente
socket.emit('v1:ranking.updated', {
  scope: 'monthly',
  period: '2025-08',
  branchId: 5,
  topUsers: [{ id: 10, name: 'João', percent: 110.5 }, /*...*/],
  generatedAt: '2025-08-15T14:30:00Z',
  version: 42  // incrementa a cada mudança — cliente pode dedup
});

// Cliente → Servidor (subscriptions)
socket.emit('v1:subscribe', { channels: ['ranking:daily', 'notifications:user:10'] });
socket.on('v1:ack', (ack) => { /* confirmado */ });
```

### Heartbeat
- Cliente envia `ping` a cada 25s
- Servidor responde `pong` em até 5s
- 2 pings sem resposta = conexão morta, reconecta
- Socket.IO configura `pingInterval: 25000`, `pingTimeout: 5000`

### Compression
Para payloads grandes (ranking com 500 usuários), usar `permessage-deflate` (compression nativa do WebSocket). Reduz payload em ~70%.

### Rate Limiting por Socket
- Cliente pode enviar no máximo 10 mensagens/seg
- Acima disso: warning, depois disconnect
- Previne abuse (DDoS via socket)

### Persistência de Eventos Críticos
Para eventos que não podem ser perdidos (ex: notificação de meta atingida), o servidor:
1. Persiste no PostgreSQL (`notifications` table)
2. Publica no Event Bus interno
3. Socket.IO emite para usuário online
4. Se offline, fica em fila — na próxima conexão, cliente pede `missed events since {lastEventId}` e recebe os pendentes

### Tamanho Máximo de Conexões
Calculado para 10.000 conexões simultâneas:
- Cada conexão: ~50KB de memória (buffers, contexto)
- 10.000 × 50KB = 500MB apenas para sockets
- Instância Node.js precisa de 2GB RAM para suportar isso + app
- Estimativa de servidores: 3 instâncias `t3.large` (8GB cada) com 4.000 conexões cada = 12.000 capacity
- Horizontal scaling via Redis adapter (qualquer instância pode entregar a qualquer cliente)

## Consequências

### Positivas
- Latência real-time observada: 80–180ms (LAN), 200–350ms (4G)
- Socket.IO lida com edge cases (proxies corporativos, mobile sleep/wake)
- Rooms por tenant dá isolamento gratuito (mensagem não vaza)
- Redis adapter permite escalar horizontalmente sem reescrever
- Fallback garante funcionamento mesmo em redes hostis (clientes corporativos com firewalls agressivos)

### Negativas
- Socket.IO adiciona overhead vs WebSocket puro (~5KB a mais no bundle)
- Redis adapter é mais uma dependência de infra
- Long Polling como último recurso consome mais recursos servidor (1 conexão TCP por cliente, espera 25s)
- Debug mais complexo (3 transports possíveis)
- Stateless? Não exatamente — conexão é stateful, restart do servidor dropa todos os clientes (mitigado com reconnection automático)

## Alternativas Consideradas

1. **WebSocket puro (sem Socket.IO)** — Rejeitado: teríamos que reimplementar reconnection, acks, rooms
2. **SSE como primário** — Rejeitado: SSE é unidirecional (server→client), não suporta binary, máximo 6 conexões por domínio em HTTP/1.1 (limite do browser)
3. **Long Polling puro** — Rejeitado: latência alta, ineficiente, mau uso de recursos
4. **GraphQL Subscriptions** — Rejeitado: overkill, acopla a GraphQL, mais uma camada
5. **MQTT over WebSocket** — Rejeitado: melhor para IoT, não para app web

## Notas Operacionais
- **Sticky sessions:** NÃO usar — Redis adapter garante que qualquer instância pode entregar a qualquer cliente. Load balancer pode ser round-robin puro.
- **Timeout de idle:** Servidor derruba conexão após 5 min sem atividade (cliente reconecta quando voltar a usar)
- **Mobile:** App PWA em background → OS pode matar socket. Ao voltar a foreground, cliente reconecta e pede eventos perdidos.
- **Monitoramento:** Métricas: connections_count, messages_per_sec, rooms_count, transport_distribution (ws/sse/polling %), reconnect_rate.
- **DDL:** Endpoint `/health/sockets` retorna contagem atual e capacity.

---

# ADR-018 — Blob Storage com S3-compatível e Abstração Local para On-Premise

**Status:** Accepted
**Data:** 2025-07-24

## Contexto
O Orion precisa armazenar:
- Logos de empresas (~50KB cada, 1000+ tenants = 50MB total)
- Fotos de comprovantes de vendas (~500KB cada, 100–500 por dia por empresa)
- Anexos de campanhas (PDFs, imagens, vídeos de treinamento — até 100MB cada)
- Avatares de usuários
- Backups diários (200MB–5GB por cliente)
- Exportações de relatórios pesados (Excel/PDF gerados sob demanda)
- Screenshots de erros para debug

Total estimado em 3 anos: ~2TB. Requisitos:
- Acesso via URL assinada (tempo limitado)
- Versionamento (logo histórico)
- Lifecycle: arquivos antigos vão para tier mais barato
- Funcionar em cloud (AWS S3) E on-premise (sem S3)
- Custo baixo por GB
- CDN na frente para arquivos públicos (logos)

## Decisão

Adotar **S3 como storage primário em cloud**, com **abstração** que permite usar **MinIO** ou **filesystem local** em on-premise.

### Interface Abstrata
```typescript
interface BlobStorage {
  put(path: string, content: Buffer | Stream, options: PutOptions): Promise<StoredFile>;
  get(path: string): Promise<Readable>;
  delete(path: string): Promise<void>;
  signUrl(path: string, expiresInSec: number): Promise<string>;
  list(prefix: string): Promise<StoredFile[]>;
  copy(from: string, to: string): Promise<void>;
}

// Implementações:
class S3Storage implements BlobStorage { /* AWS SDK v3 */ }
class MinIOStorage implements BlobStorage { /* minio npm */ }
class LocalStorage implements BlobStorage { /* fs + express static */ }
```

Configurado via env: `STORAGE_DRIVER=s3|minio|local`.

### Bucket Layout (single bucket multi-tenant)
Um único bucket `orion-prod-sa-east-1` com prefixo por tenant:
```
s3://orion-prod-sa-east-1/
├── tenants/t42/
│   ├── logos/company-42-v3.png
│   ├── avatars/user-10.jpg
│   ├── attachments/campaign-15/video-treinamento.mp4
│   ├── receipts/2025/08/15/result-99812.jpg
│   ├── exports/2025/08/report-CONSOLIDATED-2025-08.xlsx
│   └── backups/2025-08-15-dump.sql.gz
├── tenants/t43/...
└── system/assets/  # logos Orion, ícones padrão
```

Por que single bucket? Simples de gerenciar, lifecycle único, permissões via IAM.

### Path Naming Convention
- Sempre lowercase
- Timestamps em ISO date (`2025/08/15`)
- UUIDs para nomes únicos: `{kind}-{uuid}.{ext}`
- Ex: `receipts/2025/08/15/result-99812-3f4b...jpg`
- Paths NUNCA contêm dados sensíveis (CPF, email) — apenas IDs

### Acesso via URL Assinada
Arquivos NUNCA são públicos (exceto logos e assets do sistema). URL assinada com TTL:
- Receipts/anexos: 1h (tempo suficiente para visualização)
- Avatares: 24h (cache no cliente)
- Logos: 30 dias (públicos via CDN)
- Backups: nunca expõe URL (apenas sistema acessa)

```typescript
const url = await storage.signUrl('tenants/t42/receipts/2025/08/15/result-99812.jpg', 3600);
// https://orion-prod-sa-east-1.s3.sa-east-1.amazonaws.com/tenants/t42/...?X-Amz-Signature=...
```

### Encryption
- **At rest:** SSE-S3 (S3-managed keys) por padrão. Para Enterprise: SSE-KMS com CMK (Customer Managed Key) por tenant.
- **In transit:** TLS 1.2+ (HTTPS)

### Lifecycle Rules
- `receipts/*`: Standard 90 dias → Standard-IA 180 dias → Glacier 1 ano → delete 7 anos
- `exports/*`: Standard 7 dias → delete (relatórios são descartáveis)
- `backups/*`: Standard 30 dias → Glacier 1 ano → delete 3 anos (LGPD: não reter dados pessoais indefinidamente)
- `avatars/*`: Standard indefinidamente (pequenos)
- `attachments/campaigns/*`: Standard indefinidamente (pertence ao cliente)

### CDN para Arquivos Públicos
- **Cloudflare** na frente do S3 para logos e assets do sistema
- Cache hit rate esperado: 95%+ (logos mudam raramente)
- Reduz custo de bandwidth do S3 em ~90% para esses arquivos

### Multi-Tenant Isolation
- IAM Policy negando `s3:GetObject` de prefixos de outros tenants
- App-level: sempre passamos `tenantId` no path (defesa em profundidade)
- Logs de acesso ao S3 (S3 Access Logs) habilitados para auditoria

### On-Premise: MinIO
Clientes on-premise rodam MinIO em container Docker. Configurado como S3-compatível (`endpoint: http://minio:9000`, `forcePathStyle: true`). Mesmo código de S3 funciona (AWS SDK aceita endpoint custom).

### Local Storage (dev)
Para desenvolvimento local, `LocalStorage` salva em `./storage/` e serve via `express.static`. Sem dependência externa.

## Consequências

### Positivas
- Uma interface, 3 backends (S3 cloud, MinIO on-prem, local dev)
- Custo S3 estimado: R$ 250/mês para 2TB (Standard + IA + Glacier)
- Lifecycle automatiza arquivamento e LGPD compliance (retenção limitada)
- URLs assinadas dão acesso temporário sem expor buckets públicos
- CDN reduz custo de egress para logos

### Negativas
- MinIO em on-prem exige backup separado (não há durability 11-nines como S3)
- Lifecycle rules em Glacier têm custo de retrieval (mitigado: raramente acessamos)
- URLs assinadas expiram — se usuário deixar tab aberta, imagem quebra (mitigado: refresh periódico de URL)
- Single bucket é SPOF se AWS sa-east-1 cair (mitigado: replicação cross-region para Enterprise)

## Alternativas Consideradas

1. **Apenas filesystem local** — Rejeitado: não escala, não funciona em múltiplas instâncias, sem durabilidade
2. **Azure Blob Storage** — Rejeitado: clientes brasileiros preferem AWS (região sa-east-1)
3. **Google Cloud Storage** — Rejeitado: menos clientes usam GCP no Brasil
4. **Backblaze B2** — Rejeitado: mais barato mas sem região no Brasil (latência)
5. **Database BLOB (PostgreSQL bytea)** — Rejeitado: infla o DB, degrada performance, anti-pattern
6. **Buckets separados por tenant** — Rejeitado: 1000+ buckets gerenciáveis mas IAM/Lifecycle por bucket é pesado

---

# ADR-019 — Busca Textual com PostgreSQL FTS (Não Elasticsearch para v1–v2)

**Status:** Accepted
**Data:** 2025-07-24

## Contexto
Orion precisa de busca textual em:
- Vendedores (por nome, CPF)
- Clientes (por nome, CNPJ, email)
- Produtos (por SKU, descrição)
- Resultados (por notas, vendedor, cliente)
- Campanhas (por nome, descrição)
- Logs de auditoria (busca por ação, usuário, entidade)
- Documentação interna (ajuda, FAQs)

Volume estimado: 100k–10M registros por tenant. Requisitos:
- Busca com acentuação insensível (`joão` encontra `João`)
- Busca com typos leves (`maria` encontra `Marai` — fuzzy)
- Busca em PT-BR (stemming correto)
- Latência < 100ms para 95% das queries
- Não adicionar infraestrutura nova (já temos PostgreSQL)
- Operacional: backup, recovery, monitoring unificado

## Decisão

Adotar **PostgreSQL Full-Text Search (FTS)** com `tsvector`/`tsquery` e extensão `pg_trgm` para fuzzy matching. **Reavaliar Elasticsearch/OpenSearch em v3.0** se volume passar de 50M registros por tenant ou se relevância se tornar crítica.

### Schema
Cada tabela pesquisável tem coluna `search_vector tsvector` atualizada por trigger:

```sql
ALTER TABLE users ADD COLUMN search_vector tsvector;
CREATE INDEX idx_users_search ON users USING GIN(search_vector);

CREATE OR REPLACE FUNCTION users_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('portuguese', coalesce(NEW.full_name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.email, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.cpf, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_search_vector
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION users_search_vector_update();
```

### Configuração de Idioma
`to_tsvector('portuguese', ...)` usa stemming PT-BR nativo do PostgreSQL (`vender` encontra `vendas`, `vendido`, etc.).

### Pesos (Ranking)
- Peso A (mais relevante): nome
- Peso B: email, CPF/CNPJ
- Peso C: descrição, notas

`ts_rank_cd` pondera por peso e proximidade.

### Fuzzy Matching com pg_trgm
Para typos: `similarity()` do `pg_trgm`:

```sql
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_users_name_trgm ON users USING GIN(full_name gin_trgm_ops);

-- Busca com typo: "Marai" encontra "Maria"
SELECT * FROM users
WHERE full_name % 'Marai'
ORDER BY similarity(full_name, 'Marai') DESC
LIMIT 10;
```

### Query Híbrida
```sql
-- Busca por "joão silva" — FTS + trgm (fallback)
WITH fts AS (
  SELECT id, ts_rank_cd(search_vector, query) AS rank
  FROM users, plainto_tsquery('portuguese', 'joão silva') query
  WHERE search_vector @@ query
  LIMIT 50
),
trgm AS (
  SELECT id, similarity(full_name, 'joão silva') AS rank
  FROM users
  WHERE full_name % 'joão silva'
  LIMIT 50
)
SELECT u.*, COALESCE(fts.rank, 0) + COALESCE(trgm.rank, 0) AS final_rank
FROM users u
LEFT JOIN fts ON fts.id = u.id
LEFT JOIN trgm ON trgm.id = u.id
WHERE fts.id IS NOT NULL OR trgm.id IS NOT NULL
ORDER BY final_rank DESC
LIMIT 20;
```

### Busca Global (Cross-Entity)
Endpoint `/api/v1/search?q=...&types=users,customers,products`:
- Executa query em paralelo nas tabelas selecionadas
- Combina resultados com ranking normalizado
- Retorna top 10 por tipo

### Indexação Incremental
Trigger mantém `search_vector` sempre atualizado em INSERT/UPDATE. Não precisa de reindexação periódica.

### Performance
- Índice GIN em `search_vector`: ~3x tamanho da coluna original (aceitável)
- Query típica: 5–30ms para 100k registros
- Para 10M registros: 50–100ms (ainda dentro do SLA)

### Highlighting
Para mostrar snippet com match destacado:
```sql
SELECT ts_headline('portuguese', full_name, query, 'StartSel=<mark>, StopSel=</mark>') FROM ...
```

## Consequências

### Positivas
- Sem infra adicional — usa PostgreSQL que já temos
- Backup, recovery, monitoring unificados
- Transações ACID (índice sempre consistente com dado)
- Multi-tenant com RLS funciona naturalmente (busca respeita isolamento)
- Stemming PT-BR nativo
- Custo: ZERO adicional

### Negativas
- Não tão rápido quanto Elasticsearch para 100M+ registros (mitigado: reavaliar em v3)
- Relevância inferior a BM25 de engines especializados
- Autocomplete requer query separada (trgm com limite)
- Sem facets/aggregations nativas (teria que fazer queries SQL adicionais)
- Indexação síncrona no INSERT/UPDATE adiciona ~5–10ms por escrita

## Alternativas Consideradas

1. **Elasticsearch / OpenSearch** — Rejeitado para v1–v2: mais uma infra para operar, sincronização DB→ES é complexa, custo adicional. Reconsiderar em v3 se volume justificar.
2. **Meilisearch** — Rejeitado: ótimo para busca mas exige infra separada
3. **Typesense** — Rejeitado: idem
4. **Algolia** — Rejeitado: SaaS externo, custo por busca, dados saem da infra do cliente (LGPD)
5. **LIKE queries sem FTS** — Rejeitado: não faz stemming, não é acentuação-insensível nativamente, performance degradada

## Reavaliação em v3.0
Critérios para migrar a Elasticsearch:
- Tenant com > 50M registros pesquisáveis
- Necessidade de busca com relevância customizada (boosts, sinônimos)
- Necessidade de facets/aggregations (ex: filtrar resultados por 5 dimensões)
- Cliente Enterprise exige features avançadas

Quando migrar: manter PostgreSQL FTS como fallback (Elasticsearch cai → usa Postgres).

---

# ADR-020 — BullMQ para Filas e Jobs Assíncronos (Não Sidekiq, Não RabbitMQ)

**Status:** Accepted
**Data:** 2025-07-25

## Contexto
Orion tem diversos trabalhos assíncronos:
- Sync de ERPs (a cada 30min, 5–30 min de execução)
- Recálculo de rankings (após resultado aprovado, 2–10s)
- Envio de emails (batch de 100–500 emails por campanha)
- Envio de notificações WhatsApp (rate limited pela Meta)
- Geração de relatórios pesados (PDF/Excel, 10s–2min)
- Limpeza de cache órfão
- Backup diário
- Reindexação de busca
- Webhooks outbound (com retry)
- Agendamento de campanhas (iniciar/encerrar automaticamente)

Requisitos:
- Filas separadas por tipo (não misturar email com backup)
- Prioridades (relatório de diretoria > relatório comum)
- Retry com backoff exponencial
- Dead letter queue
- Scheduled jobs (cron)
- Observabilidade: quantos jobs pendentes, falhando, latência
- Limite de concorrência (não rodar 100 syncs de ERP ao mesmo tempo)
- Funciona com multi-instância (workers em máquinas separadas)

## Decisão

Adotar **BullMQ** (Node.js, sobre Redis) como sistema de filas.

### Por que BullMQ
- TypeScript nativo (mantém do stack)
- Usa Redis (já temos — ADR-016)
- API moderna (Promises, async/await)
- Dashboard pronto (Bull Board)
- Suporta prioridades, delayed jobs, repeatable jobs, rate limiting
- Ativo: 5k stars, releases frequentes

### Filas Definidas
| Fila | Concurrency | Retry | TTL |
|------|-------------|-------|-----|
| `erp-sync` | 5 | 3x backoff exp | 1h |
| `ranking-recalc` | 10 | 5x backoff exp | 5min |
| `email-send` | 20 | 5x backoff exp | 10min |
| `whatsapp-send` | 3 (Meta rate limit) | 10x backoff 60s | 1h |
| `report-generate` | 3 | 2x | 30min |
| `webhook-delivery` | 15 | 3x backoff exp | 5min |
| `cleanup` | 1 | 1x | 1h |
| `backup` | 1 | 2x | 4h |
| `cache-warmup` | 5 | 1x | 30min |

### Padrão de Uso
```typescript
// Producer
import { Queue } from 'bullmq';
const emailQueue = new Queue('email-send', { connection: redis });
await emailQueue.add('send-welcome', {
  to: 'joao@client.com',
  template: 'welcome',
  data: { name: 'João' }
}, {
  priority: 1,  // mais alto
  attempts: 5,
  backoff: { type: 'exponential', delay: 5000 },
  removeOnComplete: 100,  // mantém últimos 100 completos
  removeOnFail: 1000,     // mantém últimos 1000 falhados para debug
});

// Worker
import { Worker } from 'bullmq';
new Worker('email-send', async (job) => {
  const { to, template, data } = job.data;
  await sendEmail(to, template, data);
  // throw new Error('...') para falhar e retry
}, {
  connection: redis,
  concurrency: 20,
  limiter: { max: 100, duration: 60_000 }  // 100 emails/min
});
```

### Repeatable Jobs (Cron)
```typescript
// Sync de ERP a cada 30 min
await erpSyncQueue.add('sync-totvs', { tenantId: 42 }, {
  repeat: { pattern: '*/30 * * * *' },
  jobId: 'erp-sync-t42'  // idempotente — não duplica
});

// Backup diário 2h AM
await backupQueue.add('daily-backup', { tenantId: 42 }, {
  repeat: { pattern: '0 2 * * *' },
  jobId: `backup-daily-t42`
});
```

### Dead Letter Queue
Jobs que falham após todos os retries vão para `failed` (BullMQ mantém). Sistema monitora:
- Mais de 10 jobs falhados na mesma fila em 1h → alerta
- Job com mesmo payload falhando 3x → marcado como "problematic" e parado (não retenta mais)

### Prioridades
BullMQ suporta `priority` (menor número = maior prioridade). Padrão:
- 1: jobs do sistema (backup, cleanup)
- 5: jobs solicitados por gerentes
- 10: jobs de usuários comuns
- 50: jobs de sync automático

### Multi-Instância (Workers Escaláveis)
- Workers podem rodar em processo separado (PM2 cluster mode ou containers Docker)
- Cada worker pega jobs da fila (atomic via Redis)
- Se worker cai no meio de um job, job volta para fila após `visibility timeout`
- Auto-scaling: se fila > 100 jobs pendentes, KEDA (Kubernetes Event-Driven Autoscaling) sobe mais workers

### Idempotência
Todo job tem `jobId` único derivado de `{tenantId}:{action}:{params_hash}`. Se mesmo job é adicionado 2x, BullMQ deduplica (não roda 2x).

### Observabilidade
- **Bull Board** (`@bull-board/express`): dashboard web mostrando filas, jobs, latência, falhas
- Métricas exportadas para Prometheus: `bullmq_waiting_total`, `bullmq_active_total`, `bullmq_failed_total`, `bullmq_duration_seconds`
- Alerta Datadog se `bullmq_failed_total` crescer

## Consequências

### Positivas
- Stack unificada (Node.js + Redis)
- Filas com prioridades, retries, scheduling
- Dashboard pronto (Bull Board)
- Auto-scaling possível com KEDA
- Custo: zero adicional (usa Redis existente)

### Negativas
- BullMQ requer Redis persistente (jobs em fila se perdem se Redis cair sem persistência — já temos AOF everysec)
- Workers em Node.js single-threaded — CPU bound jobs limitados por core (mitigado com cluster mode)
- Não tem routing/_topic patterns como RabbitMQ (não precisamos para nosso caso)
- Bull Board não é tão completo quanto Sidekiq Web

## Alternativas Consideradas

1. **Sidekiq (Ruby)** — Rejeitado: exigiria processo Ruby separado, troca de stack
2. **RabbitMQ** — Rejeitado: mais para mensageria entre serviços, não para jobs com retry/schedule. Também adicionaria infra.
3. **Kafka** — Rejeitado: overkill, mais para event streaming de alto volume
4. **Celery (Python)** — Rejeitado: troca de stack
5. **AWS SQS + Lambda** — Rejeitado: lock-in AWS, não funciona em on-premise
6. **pg-boss (PostgreSQL-based)** — Rejeitado: interessante mas adiciona carga ao DB principal; Redis é mais performático para filas

---

# ADR-021 — Monitoring com Prometheus + Grafana (Não Datadog por Custo)

**Status:** Accepted
**Data:** 2025-07-26

## Contexto
Orion precisa de observabilidade completa:
- Métricas de aplicação (latência de endpoints, taxa de erro, throughput)
- Métricas de infraestrutura (CPU, memória, disco, rede)
- Métricas de negócio (MRR, conversões, ativações por dia)
- Logs centralizados com busca
- Tracing distribuído (request que passa por API → DB → Redis → S3)
- Alertas (Slack, email, PagerDuty)
- Dashboards para diferentes públicos (dev, ops, biz)

Requisitos:
- Custo previsível e baixo (SaaS como Datadog custaria $5–15/host/mês)
- Funcionar em cloud E on-premise (mesmo stack)
- Auto-hosted possível
- SDK nas linguagens do projeto (JS/TS)
- Integração com Next.js e Node.js

## Decisão

Adotar **stack Prometheus + Grafana + Loki + Tempo** (OpenTelemetry para instrumentação). **Datadog apenas como opcional** para clientes Enterprise que queiram SaaS.

### Stack
- **Prometheus:** coleta e armazena métricas (pull model, scrape `/metrics`)
- **Grafana:** dashboards e alertas
- **Loki:** logs centralizados (mais barato que Elasticsearch para logs)
- **Tempo:** tracing distribuído (backend para OpenTelemetry)
- **Alertmanager:** roteamento de alertas (Slack, email, PagerDuty)
- **OpenTelemetry SDK:** instrumentação padrão das aplicações

### Métricas Aplicação (Prometheus)
Endpoint `/metrics` expõe métricas no formato Prometheus:

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/v1/goals",status="200"} 15234
http_requests_total{method="POST",route="/api/v1/results",status="201"} 3211

# HELP http_request_duration_seconds Request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{route="/api/v1/goals",le="0.05"} 14234
http_request_duration_seconds_bucket{route="/api/v1/goals",le="0.1"} 14900
http_request_duration_seconds_bucket{route="/api/v1/goals",le="0.5"} 15100
http_request_duration_seconds_bucket{route="/api/v1/goals",le="+Inf"} 15234
http_request_duration_seconds_sum 423.5
http_request_duration_seconds_count 15234

# HELP orion_results_created_total Results created
# TYPE orion_results_created_total counter
orion_results_created_total{tenant_id="42"} 10234

# HELP orion_ranking_recalc_seconds Ranking recalculation duration
# TYPE orion_ranking_recalc_seconds histogram
orion_ranking_recalc_seconds_bucket{le="0.5"} 1023
orion_ranking_recalc_seconds_bucket{le="1.0"} 1534
...

# HELP orion_cache_hit_rate Cache hit rate (L1+L2)
# TYPE orion_cache_hit_rate gauge
orion_cache_hit_rate{layer="l1"} 0.42
orion_cache_hit_rate{layer="l2"} 0.92

# HELP bullmq_jobs_waiting Jobs waiting in queue
# TYPE bullmq_jobs_waiting gauge
bullmq_jobs_waiting{queue="erp-sync"} 3
bullmq_jobs_waiting{queue="email-send"} 145
```

### Instrumentação (prom-client)
```typescript
import { Counter, Histogram, register } from 'prom-client';

const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Request duration',
  labelNames: ['route'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10]
});

// Middleware Next.js
export function metricsMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
    httpRequestDuration.observe({ route: req.path }, duration);
  });
  next();
}
```

### Dashboards Grafana
Pre-configurados:
1. **API Overview:** RPS, latência p50/p95/p99, error rate, status code distribution
2. **Database:** conexões ativas, queries lentas, locks, cache hit ratio
3. **Redis:** memória, hit rate, evictions, connected clients
4. **BullMQ:** jobs por fila (waiting/active/failed/done), latência
5. **Business:** resultados criados/dia, metas atingidas, novos clientes, MRR
6. **Multi-tenant:** top 10 tenants por uso, tenants com mais erros

### Logs (Loki + Promtail)
- App emite logs JSON estruturados (Pino — ver ADR-022)
- Promtail coleta logs de containers/arquivos
- Loki indexa apenas labels (tenant_id, level, service) — barato
- Busca em Grafana: `{service="orion-api"} |= "error" | json | level="error"`

### Tracing (Tempo + OpenTelemetry)
```typescript
import { trace, context } from '@opentelemetry/api';
const tracer = trace.getTracer('orion-api');

async function createResult(data) {
  return tracer.startActiveSpan('createResult', async (span) => {
    span.setAttribute('tenant.id', data.tenantId);
    span.setAttribute('user.id', data.userId);
    try {
      const result = await db.result.create({ data });
      span.setAttribute('result.id', result.id);
      await recalcRanking(result);  // span filho automático
      return result;
    } catch (e) {
      span.recordException(e);
      span.setStatus({ code: 1, message: e.message });
      throw e;
    } finally {
      span.end();
    }
  });
}
```

### Alertas (Alertmanager)
Regras PromQL exemplo:
```yaml
groups:
- name: orion-api
  rules:
  - alert: HighErrorRate
    expr: |
      sum(rate(http_requests_total{status=~"5.."}[5m])) by (route)
      / sum(rate(http_requests_total[5m])) by (route) > 0.05
    for: 5m
    labels: { severity: critical }
    annotations:
      summary: "Error rate > 5% on {{ $labels.route }}"

  - alert: HighLatencyP99
    expr: |
      histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 10m
    labels: { severity: warning }
    annotations:
      summary: "p99 latency > 2s"

  - alert: BullMQFailedJobs
    expr: bullmq_failed_total{queue="erp-sync"} > 50
    for: 15m
    labels: { severity: critical }
```

Roteamento:
- Critical → PagerDuty (24/7 on-call)
- Warning → Slack #alerts
- Info → Slack #alerts-info

### Multi-Tenant Labels
Todas as métricas de negócio têm label `tenant_id`. Permite dashboards por tenant. Para privacidade, NÃO exponhamos dados pessoais em métricas (apenas IDs anonimizados, contagens).

### On-Premise
Mesma stack roda em Docker Compose para clientes on-premise. Recursos:
- Prometheus: 2GB RAM, 50GB disco (15 dias retenção)
- Grafana: 256MB RAM
- Loki: 1GB RAM, 100GB disco
- Tempo: 1GB RAM, 50GB disco

## Consequências

### Positivas
- Stack 100% open-source self-hosted
- Custo cloud: ~R$ 500/mês para instâncias (vs R$ 5.000+ Datadog)
- Mesma stack em cloud e on-prem
- OpenTelemetry é padrão CNCF — portável
- Comunidade grande

### Negativas
- Mais trabalho de setup vs SaaS (mitigado: Docker Compose pronto)
- Sem APM automático (Datadog descobre tudo automaticamente — Prometheus precisa instrumentação manual)
- Suporte comercial limitado (mitigado: Grafana Cloud pago opcional)
- Sem ML-based anomaly detection (Datadog tem)

## Alternativas Consideradas

1. **Datadog** — Rejeitado por custo (estimativa R$ 5.000–15.000/mês para 20 hosts). Considerar como opção Enterprise para clientes que queiram SaaS.
2. **New Relic** — Rejeitado: idem custo, menos flexível que Datadog
3. **Sentry Performance** — Rejeitado: é para error tracking, não métricas gerais (ver ADR-023)
4. **AWS CloudWatch** — Rejeitado: lock-in AWS, não funciona em on-prem
5. **Stack Elastic (ELK)** — Rejeitado: mais pesado, Elasticsearch para logs é overkill

---

# ADR-022 — Logging com Pino (Não Winston)

**Status:** Accepted
**Data:** 2025-07-26

## Contexto
Orion precisa de logging estruturado (JSON) com:
- Baixa latência (logs não devem impactar request)
- Níveis (debug, info, warn, error, fatal)
- Contexto por request (request ID, user ID, tenant ID)
- Correlação com traces (OpenTelemetry trace ID)
- Rotacão de arquivos
- Envio para Loki (centralizado)
- Filtragem por nível em runtime (sem restart)
- Suporte a child loggers (contexto herdado)

Requisitos de performance:
- Log de info deve custar < 1ms por chamada
- Em alta carga (1000 req/s, 5 logs/req = 5000 logs/s), não pode ser bottleneck

## Decisão

Adotar **Pino** como logger.

### Por que Pino
- Mais rápido que Winston em benchmarks (3–5x)
- JSON nativo (não precisa de formatter)
- Async por padrão (não bloqueia event loop)
- Child loggers eficientes (binding estático)
- Suporte a transportes (Pino Loki, Pino Elasticsearch, etc.)
- Tipos TypeScript excelentes

### Padrão de Uso
```typescript
// lib/logger.ts
import pino from 'pino';
import { trace, context } from '@opentelemetry/api';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level(label) { return { level: label }; },
    log(object) {
      // injeta trace ID se disponível
      const span = trace.getSpan(context.active());
      if (span) {
        const { traceId, spanId } = span.spanContext();
        return { ...object, traceId, spanId };
      }
      return object;
    }
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.cpf', '*.cnpj', '*.creditCard'],
    censor: '[REDACTED]'
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: { 'user-agent': req.headers['user-agent'] }
      // sem body, sem cookies, sem auth
    }),
    res: (res) => ({ statusCode: res.statusCode }),
    err: pino.stdSerializers.err
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

// Cria child logger com contexto de request
export function createRequestLogger(req) {
  return logger.child({
    requestId: req.id,
    tenantId: req.tenantId,
    userId: req.userId,
    route: req.route
  });
}
```

### Logger por Módulo
```typescript
// Em módulos de domínio
import { logger } from '@/lib/logger';
const log = logger.child({ module: 'ranking-service' });

export async function recalcRanking(tenantId, period) {
  log.info({ tenantId, period }, 'Recalculating ranking');
  try {
    const start = Date.now();
    // ... lógica
    log.info({ tenantId, period, durationMs: Date.now() - start, usersRanked }, 'Ranking recalculated');
  } catch (e) {
    log.error({ tenantId, period, err: e }, 'Failed to recalculate ranking');
    throw e;
  }
}
```

### Níveis e Quando Usar
| Nível | Quando | Exemplo |
|-------|--------|---------|
| `fatal` | App não pode continuar | Falha de conexão com DB em startup |
| `error` | Erro inesperado, request falha | Exception não tratada, erro 500 |
| `warn` | Algo anormal mas recuperável | Retry disparado, cache miss estendido, taxa de erro alta |
| `info` | Eventos significativos | Login, resultado criado, sync ERP completo |
| `debug` | Debug detalhado | Query SQL executada, decisão de branch tomada |
| `trace` | Muito detalhado | Payload completo, estado de variáveis |

### Logs Estruturados — Padrões
SEMPRE logar como objeto + mensagem (não interpolação):
```typescript
// ✅ Certo
log.info({ userId: 10, action: 'login', ip: '1.2.3.4' }, 'User logged in');

// ❌ Errado
log.info(`User ${userId} logged in from ${ip}`);
```

Razão: objeto é pesquisável no Loki/Logs.

### Redação de Dados Sensíveis
Pino redact configurado para mascarar:
- Authorization headers
- Cookies
- Campos de senha
- CPF, CNPJ (LGPD)
- Credit card numbers
- Refresh tokens

### Transporte para Loki
```typescript
const transports = pino.transport({
  target: 'pino-loki',
  options: {
    host: 'http://loki:3100',
    labels: { service: 'orion-api', env: process.env.NODE_ENV }
  }
});

export const logger = pino({}, transports);
```

### Rotação de Arquivos Local (on-prem)
Para clientes on-prem sem Loki, usar `pino-roll`:
```typescript
const transport = pino.transport({
  target: 'pino-roll',
  options: {
    file: '/var/log/orion/app.log',
    frequency: 'daily',
    limit: { count: 30 }  // mantém 30 dias
  }
});
```

### Sampling em Produção
Para logs de alta frequência (ex: HTTP access log), usar sampling:
```typescript
const logger = pino({
  level: 'info',
  // Loga 100% dos erros, 10% dos info de HTTP
  sampling: { head: 100, interval: 10000 }
});
```

### Dynamic Log Level
Endpoint admin para mudar nível em runtime:
```POST /api/v1/admin/log-level { level: 'debug' }```
Chama `logger.level = 'debug'` em todas as instâncias (via Redis pub/sub).

## Consequências

### Positivas
- Performance: < 0.5ms por log info em benchmarks
- JSON estruturado nativo (sem formatters)
- Child loggers eficientes (contexto herdado)
- Integração com OpenTelemetry (trace IDs em logs)
- Redação automática de dados sensíveis (LGPD)
- Mais rápido que Winston (3–5x)

### Negativas
- API menos flexível que Winston (não é ruim — opinião é força padrão)
- Sem transports síncronos (se Loki cair, logs bufferizam — mitigado com fallback para arquivo)
- Comunidade menor que Winston (mas cresce rápido)

## Alternativas Consideradas

1. **Winston** — Rejeitado: mais lento, API verbosa, JSON não nativo (precisa de formatter)
2. **Bunyan** — Rejeitado: mantido, mas menos ativo que Pino
3. **Console.log** — Rejeitado: sem estrutura, sem nível, sem performance em escala
4. **Bole** — Rejeitado: pouco usado, sem types first-class
5. **Log4js** — Rejeitado: design antigo (Java-like), sem types nativos

---

# ADR-023 — Error Tracking com Sentry (Não Bugsnag)

**Status:** Accepted
**Data:** 2025-07-27

## Contexto
Apesar de logs estruturados (ADR-022), precisamos de error tracking dedicado:
- Stack traces com source maps
- Agrupamento de erros similares (fingerprinting)
- Notificações em tempo real (Slack, email)
- Release tracking (qual versão introduziu o erro)
- User feedback (usuário reporta erro)
- Performance monitoring (transações lentas)
- Replay de sessão (para debug)
- Suporte a Next.js, Node.js, Electron

Requisitos:
- Self-hostable (para clientes on-prem com dados sensíveis)
- SDK maduro para todas as plataformas
- Custo razoável (SaaS para dev, self-hosted para prod)

## Decisão

Adotar **Sentry** (SaaS para cloud dev/staging, self-hosted para clientes Enterprise on-prem).

### Por que Sentry
- Padrão de mercado para error tracking
- SDK maduro para JS/TS, Node.js, Next.js, Electron
- Self-hostable (importante para compliance)
- Source maps automáticos
- Release tracking nativo
- Performance monitoring (transações)
- Session replay (nova feature)

### Setup
- **Dev/staging:** Sentry SaaS (plano Team, $26/mês)
- **Prod cloud:** Sentry SaaS (plano Business, $80/mês — 50k errors)
- **On-prem Enterprise:** Sentry self-hosted (Docker, gratuito mas requer infra)

### Instrumentação
```typescript
// sentry.client.config.ts (Next.js)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  tracesSampleRate: 0.1,  // 10% das transações para performance
  replaysSessionSampleRate: 0.01,  // 1% das sessões para replay
  replaysOnErrorSampleRate: 1.0,  // 100% das sessões com erro
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,  // preserva texto para debug
      blockAllMedia: true  // não captura imagens (LGPD)
    })
  ],
  // Não enviar PII
  beforeSend(event) {
    if (event.request?.cookies) delete event.request.cookies;
    if (event.request?.headers?.authorization) delete event.request.headers.authorization;
    return event;
  }
});

// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE,
  tracesSampleRate: 0.5,  // 50% no server (mais importante)
  profilesSampleRate: 0.1,  // CPU profiling
});
```

### Captura Manual
```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (e) {
  Sentry.captureException(e, {
    tags: { module: 'ranking-service' },
    extra: { tenantId, userId, operation: 'recalc' },
    user: { id: userId, tenantId }
  });
  throw e;  // re-throw para caller
}

// Capture message
Sentry.captureMessage('ERP sync took too long', 'warning');
```

### Contexto por Request
```typescript
// Middleware Next.js
export function sentryMiddleware(req, res, next) {
  Sentry.setUser({ id: req.userId, tenantId: req.tenantId });
  Sentry.setTag('route', req.path);
  Sentry.setContext('request', {
    method: req.method,
    body: sanitizeBody(req.body)
  });
  next();
}
```

### Source Maps
CI/CD envia source maps ao Sentry em cada release:
```yaml
# GitHub Actions step
- name: Upload source maps to Sentry
  run: |
    sentry-cli sourcemaps upload --release=${{ github.sha }} \
      --org=orion --project=orion-frontend \
      ./out ./node_modules/.next
```

### Release Tracking
Cada deploy cria release no Sentry. Erros são associados a releases. Permite:
- Ver quais erros foram introduzidos em qual release
- Ver quais erros foram resolvidos em qual release
- Auto-resolve de issues quando nova release é deployada

### Alertas
- Novo erro (primeira ocorrência) → Slack #alerts
- Erro com frequência > 10/min → Slack + PagerDuty
- Erro afetando > 1% dos usuários → PagerDuty critical

### Performance Monitoring
Sentry captura transações (HTTP requests, DB queries):
- p50, p95, p99 latência
- Span breakdown (tempo em DB, Redis, external APIs)
- Detecta regressões de performance

### Session Replay
Para erros no frontend, Sentry grava replay da sessão (DOM, mouse, keyboard) — exceto campos sensíveis (inputs de senha,CPF são mascarados). Permite reproduzir bug sem comunicação com usuário.

### Multi-Tenant
Tags `tenant_id` em todos os eventos. Sentry dashboard pode filtrar por tenant. Para clientes Enterprise com Sentry self-hosted dedicado, dados não saem da infra do cliente.

## Consequências

### Positivas
- Debug muito mais rápido (stack trace + source map + contexto)
- Agressão de erros similar agrupada automaticamente
- Release tracking identifica regressões
- Performance monitoring complementa Prometheus (transações em vez de métricas)
- Self-hostable para compliance

### Negativas
- Custo SaaS escala com volume (mitigado: sampling de traces)
- Session replay pode capturar dados sensíveis (mitigado: configuração de masks)
- SDK adiciona ~50KB ao bundle client (mitigado: lazy load)
- Self-hosted Sentry é pesado (PostgreSQL, Kafka, Redis, ClickHouse) — apenas para Enterprise

## Alternativas Consideradas

1. **Bugsnag** — Rejeitado: menos features, sem self-hosted grátis, performance monitoring fraco
2. **Rollbar** — Rejeitado: similar ao Sentry mas menos ecossistema
3. **Raygun** — Rejeitado: mais caro, menos features
4. **Datadog APM** — Rejeitado: caro, mais para métricas que erro (ver ADR-021)
5. **Log-based error tracking (Loki queries)** — Rejeitado: não tem stack trace com source map, agrupamento manual

---

# ADR-024 — Feature Flags com Unleash Self-Hosted (Não LaunchDarkly por Custo)

**Status:** Accepted
**Data:** 2025-07-28

## Contexto
Orion precisa de feature flags para:
- Deploy dark (liberar feature para 1 cliente, depois 10, depois todos)
- A/B testing de UI (botão verde vs azul)
- Kill switches (desabilitar feature problematic instantaneamente)
- Rollout gradual (10% → 50% → 100% dos tenants)
- Features por plano (Enterprise only, Professional only)
- Beta features (clientes opt-in)
- Features por região (release gradual Brasil → LATAM)

Requisitos:
- Latência de avaliação < 5ms (não pode bloquear request)
- SDK para Node.js e React
- UI para gestão (não via config file)
- Audit log (quem ligou/desligou flag, quando)
- Self-hostable (on-prem)
- Custos baixos

## Decisão

Adotar **Unleash** self-hosted como sistema de feature flags.

### Por que Unleash
- Open-source (Apache 2), self-hostable
- API madura, SDK oficial para Node.js, React, mobile
- Estratégias nativas: rollout %, por usuário, por tenant, por região, por plano
- UI admin para gestão
- Audit log
- Free para uso ilimitado

### Setup
- Unleash rodando em Docker (1 container + PostgreSQL)
- SDK cliente em cada instância do Orion
- Polling de configuração a cada 10s (não evaluation por request)
- Cache local em memória (avaliação instantânea)

### Arquitetura
```
Unleash Server (Docker) ←──── poll 10s ──── Orion API instances (cache local)
        │
        └── Postgres (configurações, audit)
```

Avaliação de flag é 100% local (cache em memória), sem chamada de rede. Latência: < 0.1ms.

### Estratégias Definidas
1. **Standard:** ligado/desligado para todos
2. **Rollout gradual:** X% dos tenants (hash do tenant ID)
3. **Por lista de tenants:** tenants específicos liberados
4. **Por plano:** Starter/Professional/Enterprise
5. **Por região:** BR, MX, AR, etc.
6. **Por usuário ID:** para beta testers
7. **Schedule:** liga em data X, desliga em data Y

### Uso no Código
```typescript
// Backend
import { unleash } from '@/lib/unleash';

if (unleash.isEnabled('new-ranking-algorithm', { tenantId, userId, plan })) {
  return newAlgorithm();
} else {
  return oldAlgorithm();
}

// Variants (A/B testing)
const variant = unleash.getVariant('dashboard-layout', { tenantId });
if (variant.name === 'A') return <LayoutA />;
if (variant.name === 'B') return <LayoutB />;

// Frontend (React hook)
import { useFlag } from '@unleash/nextjs';

function MyComponent() {
  const newFeatureEnabled = useFlag('new-feature');
  return newFeatureEnabled ? <NewFeature /> : <OldFeature />;
}
```

### Convenção de Nomes
Padrão: `{module}.{feature}.{variant}`
- `ranking.new-algorithm` (booleano)
- `dashboard.layout` (variant A/B/C)
- `whatsapp.template-v2` (booleano)
- `enterprise.sso-saml` (booleano, só para plano Enterprise)

### Lifecycle de Flags
1. **Created:** com descrição, owner, expected rollout date
2. **Dev/test:** testada em ambiente dev
3. **Staging:** validada em staging com subset
4. **Rollout:** gradual em prod (1% → 10% → 50% → 100%)
5. **GA:** 100% dos tenants
6. **Cleanup:** remover flag do código (tech debt se não remover)
7. **Archived:** desativada no Unleash (preserva histórico)

### Tech Debt Prevention
- Toda flag tem `expectedRemovalDate` no metadata
- CI check: alerta se flag existe há mais de 90 dias
- Quarterly review de flags pendentes de remoção

### Audit Log
Unleash registra: quem, quando, qual flag, qual mudança (ativou/desativou/alterou estratégia). Disponível na UI admin.

### SDK Initialization
```typescript
// lib/unleash.ts
import { Unleash } from 'unleash-client';

export const unleash = new Unleash({
  url: process.env.UNLEASH_URL,
  appName: 'orion-api',
  instanceId: process.env.UNLEASH_INSTANCE_ID,
  strategies: [
    // Custom strategy: por plano
    {
      name: 'by-plan',
      strategy: (parameters, context) => {
        const allowedPlans = JSON.parse(parameters.plans);
        return allowedPlans.includes(context.plan);
      }
    }
  ]
});

unleash.on('error', (e) => logger.error({ err: e }, 'Unleash error'));
unleash.on('warn', (msg) => logger.warn({ msg }, 'Unleash warn'));
```

### Fallback se Unleash Cair
Se Unleash indisponível:
- SDK usa última config conhecida (cache local)
- Logs warning
- Sistema continua funcionando com flags no último estado

## Consequências

### Positivas
- Deploy dark sem medo (rollback instantâneo via flag)
- Rollout gradual reduz risco
- A/B testing com variants
- Custo: zero (self-hosted, usa PostgreSQL existente)
- Latência de avaliação < 0.1ms
- SDK maduro, tipos TypeScript

### Negativas
- Mais uma infraestrutura para operar
- Tech debt se flags não forem removidas (mitigado: processo de cleanup)
- Avaliação pode divergir entre server e client (mitigado: Unleash Proxy para client)

## Alternativas Consideradas

1. **LaunchDarkly** — Rejeitado por custo ($15/host/mês, ou seja, $300/mês para 20 instâncias). Excelente produto mas custo alto em escala.
2. **Flagsmith** — Rejeitado: similar ao Unleash, menos maduro em 2025
3. **ConfigCat** — Rejeitado: freemium limitado, custo cresce com usage
4. **DevCycle** — Rejeitado: muito novo, menos comunidade
5. **Custom (env vars + DB)** — Rejeitado:reinventar roda, sem SDK, sem UI

---

# ADR-025 — CI/CD com GitHub Actions (Não GitLab CI por Ecossistema)

**Status:** Accepted
**Data:** 2025-07-28

## Contexto
Orion precisa de pipeline CI/CD para:
- Testes automáticos em cada PR
- Lint, type check, security scan
- Build de imagens Docker
- Deploy para staging em merge
- Deploy para produção em tag/release
- Rollback rápido
- Multi-environment (dev, staging, prod)
- Multi-platform images (amd64, arm64)

Requisitos:
- Integração nativa com GitHub (repositório)
- Matriz de testes (Node 20, 22)
- Cache de dependências
- Secrets management
- Approval gates para prod
- Observabilidade do pipeline

## Decisão

Adotar **GitHub Actions** como plataforma de CI/CD.

### Por que GitHub Actions
- Já usamos GitHub para repositório
- Free para repos públicos (2k min/mês private)
- Marketplace de actions ricas
- Matriz paralela
- Cache nativo (actions/cache)
- Self-hosted runners possíveis (para clientes on-prem)

### Pipeline de PR
```yaml
# .github/workflows/pr.yml
name: PR Check
on: { pull_request: { branches: [main, develop] } }

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test }
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: ${{ matrix.node-version }}, cache: 'npm' }
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v4

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - uses: snyk/actions/node@master
        env: { SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}}
      - uses: github/codeql-action/init@v3
      - uses: github/codeql-action/analyze@v3

  build:
    needs: [lint, test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: build, path: ./out }
```

### Pipeline de Deploy
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]  # staging
    tags: ['v*']       # production

jobs:
  build-image:
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.build.outputs.image }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ${{ secrets.REGISTRY }}
          username: ${{ secrets.REGISTRY_USER }}
          password: ${{ secrets.REGISTRY_TOKEN }}
      - id: build
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: |
            ${{ secrets.REGISTRY }}/orion:${{ github.sha }}
            ${{ secrets.REGISTRY }}/orion:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
          platforms: linux/amd64,linux/arm64

  deploy-staging:
    if: github.ref == 'refs/heads/main'
    needs: build-image
    runs-on: ubuntu-latest
    environment: staging  # requer approval
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          ssh ${{ secrets.STAGING_HOST }} "
            docker pull ${{ secrets.REGISTRY }}/orion:${{ github.sha }}
            docker compose up -d --no-deps orion-api orion-worker
          "
      - name: Smoke test
        run: |
          curl -f https://staging.orion.com/health || exit 1

  deploy-production:
    if: startsWith(github.ref, 'refs/tags/v')
    needs: build-image
    runs-on: ubuntu-latest
    environment: production  # requer approval de 2 pessoas
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production (canary)
        run: |
          # Canary: 10% dos servidores primeiro
          ./scripts/canary-deploy.sh ${{ github.ref_name }}
      - name: Wait and verify
        run: |
          sleep 300  # 5 min de observação
          ./scripts/check-canary-health.sh || ./scripts/rollback.sh
      - name: Deploy to all
        run: ./scripts/full-deploy.sh ${{ github.ref_name }}
```

### Estratégia de Deploy
- **Staging:** deploy automático em merge para `main`
- **Production canary:** 10% dos servidores recebem nova versão primeiro
- **Production full:** após 5 min de observação sem erros, deploy para 100%
- **Rollback:** script que re-deploya versão anterior em < 2 min

### Secrets Management
- Secrets no GitHub Actions (Settings → Secrets)
- Rotação trimestral
- Acesso restrito a admins do repo
- Auditoria via audit log do GitHub

### Self-Hosted Runners (On-Prem)
Para clientes on-prem que não querem usar GitHub SaaS runners:
- Self-hosted runner em container Docker
- Conecta ao GitHub via runner agent
- Executa jobs na infra do cliente
- Mesmo pipeline funciona

### Caching Strategy
- `actions/cache` para `node_modules` (acelera `npm ci`)
- Docker Buildx cache (`type=gha`) para layers de imagem
- Cache de test results entre runs

### Quality Gates
PR só pode ser merged se:
- ✅ Lint passar (0 warnings)
- ✅ Type check passar
- ✅ Testes unitários passar (cobertura > 70%)
- ✅ Testes de integração passar
- ✅ Security scan passar (sem vulnerabilities High/Critical)
- ✅ CodeQL passar
- ✅ 2 approvals de revisores

## Consequências

### Positivas
- Integração nativa com GitHub
- Free para uso moderado (2k min/mês private)
- Matriz de testes paralela
- Cache acelera builds
- Self-hosted runners para on-prem
- Marketplace de actions ricas

### Negativas
- Free tier limita repos privados muito ativos (mitigado: self-hosted runners)
- YAML pode ficar complexo (mitigado: composite actions)
- Logs de pipeline podem ser difíceis de debugar
- Lock-in parcial (reusar pipeline em GitLab exige rewrite)

## Alternativas Consideradas

1. **GitLab CI** — Rejeitado: exigeria migrar repo para GitLab (ou usar CI de outro provider). Bom produto mas fragmentação.
2. **CircleCI** — Rejeitado: custo em escala, menos integração com GitHub
3. **Jenkins** — Rejeitado: self-hosted pesado, menos cloud-native
4. **Buildkite** — Rejeitado: pago, menos ecosistema
5. **AWS CodePipeline** — Rejeitado: lock-in AWS, não funciona on-prem
6. **Drone CI** — Rejeitado: menos comunidade que GitHub Actions

---

# ADR-026 — Deployment: Docker para Small/Medium, Kubernetes para Enterprise

**Status:** Accepted
**Data:** 2025-07-29
**Relacionado a:** ADR-012 (Docker Compose on-prem)

## Contexto
Orion precisa de estratégia de deployment que:
- Funcione em cloud (Vercel? AWS? GCP?)
- Funcione em on-prem (servidores de clientes)
- Escale horizontalmente
- Suporte rolling updates
- Tenha auto-scaling
- Seja operável por equipe pequena
- Custo razoável em diferentes níveis de uso

Diferentes perfis de clientes têm necessidades diferentes:
- **Cloud SaaS (Orion-hosted):** multi-tenant, escalável, gerenciado pela Orion
- **On-Premise PME:** cliente roda em servidor próprio, 1 instância
- **On-Premise Enterprise:** cliente roda em cluster, multi-instância, HA

## Decisão

Adotar **duas estratégias** baseadas em perfil:

### 1. Docker Compose (SaaS Small/Medium + On-Prem PME)
Para SaaS até 200 tenants e clientes on-prem PME:
- Docker Compose com 1 servidor
- Componentes: orion-api, orion-worker, postgres, redis, minio (on-prem), nginx
- Escala vertical (mais CPU/RAM no servidor)
- Atualização: `docker compose pull && docker compose up -d`

### 2. Kubernetes (SaaS Large + Enterprise On-Prem)
Para SaaS > 200 tenants e clientes Enterprise:
- Kubernetes (EKS em AWS, GKE em GCP, ou k3s/rke2 on-prem)
- Helm chart para deploy
- Auto-scaling (HPA)
- Rolling updates nativos
- Ingress controller (nginx-ingress ou Traefik)
- Cert-Manager para TLS automático

### Por que Duas Estratégias
Docker Compose é simples para PME — não justifica Kubernetes. Kubernetes é overkill para 1 servidor. Enterprise precisa de HA que Compose não oferece nativamente.

### Docker Compose para On-Prem
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    environment: [POSTGRES_PASSWORD=...]
    restart: unless-stopped

  redis:
    image: redis:7
    volumes: [redisdata:/data]
    restart: unless-stopped

  minio:
    image: minio/minio
    volumes: [miniodata:/data]
    command: server /data
    restart: unless-stopped

  orion-api:
    image: registry.orion.com/orion:v1.5.0
    environment: [...]
    depends_on: [postgres, redis, minio]
    deploy:
      replicas: 2
      resources:
        limits: { cpus: '2', memory: 2G }
    restart: unless-stopped

  orion-worker:
    image: registry.orion.com/orion:v1.5.0
    command: ["node", "worker.js"]
    deploy:
      replicas: 1
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf"]
    depends_on: [orion-api]
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
  miniodata:
```

### Kubernetes para Enterprise
```yaml
# helm/values.yaml
replicaCount: 3
image: { repository: registry.orion.com/orion, tag: v1.5.0 }

resources:
  limits: { cpu: 2, memory: 2Gi }
  requests: { cpu: 500m, memory: 512Mi }

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70

ingress:
  enabled: true
  className: nginx
  tls: true
  hosts: [{ host: orion.client.com, paths: [{ path: /, pathType: Prefix }]}]

postgresql:
  enabled: true
  primary:
    persistence: { size: 100Gi }
    resources: { limits: { cpu: 4, memory: 8Gi }}

redis:
  enabled: true
  master:
    persistence: { size: 20Gi }
```

### Deploy via Helm
```bash
helm repo add orion https://charts.orion.com
helm install orion orion/orion \
  --namespace orion-prod \
  --values values.yaml \
  --set image.tag=v1.5.0
```

### Cloud SaaS: AWS
Para SaaS hospedado pela Orion:
- **EKS** para Kubernetes gerenciado
- **RDS PostgreSQL** Multi-AZ
- **ElastiCache Redis** Multi-AZ
- **S3** para storage
- **CloudFront** como CDN
- **Route 53** para DNS
- **ACM** para TLS certs
- **Secrets Manager** para segredos

Por que AWS em vez de Vercel/Netlify? Vercel é ótimo para Next.js mas:
- Não suporta workers long-running (BullMQ workers)
- Não suporta WebSockets persistentes bem
- Vendor lock-in
- Custo alto em escala

Self-host na AWS com EKS dá controle total e funciona para web + workers + sockets.

### Atualização (Rolling Update)
- Kubernetes: `kubectl set image deployment/orion orion=v1.5.1` — rolling automático, sem downtime
- Docker Compose: `docker compose pull && docker compose up -d` — atualiza container por container
- Health check: `/health` endpoint checado antes de tráfego

### Rollback
- Kubernetes: `kubectl rollout undo deployment/orion`
- Docker Compose: `docker compose set image orion-api=v1.5.0 && docker compose up -d`

### Observabilidade
- Prometheus coleta métricas dos containers
- Loki coleta logs
- Health checks em `/health`, `/ready`

## Consequências

### Positivas
- Flexibilidade: cliente escolhe conforme necessidade
- Docker Compose simples para PME (1 comando instala)
- Kubernetes escalável para Enterprise
- Mesma imagem Docker funciona em ambos
- Cloud SaaS em AWS dá controle total

### Negativas
- Dois sistemas para manter (Compose + K8s manifests)
- Kubernetes tem curva de aprendizado (mitigado: Helm charts abstraem)
- Custo AWS mais alto que Vercel (mas com mais capacidade)

## Alternativas Consideradas

1. **Apenas Docker Compose para tudo** — Rejeitado: não escala para 500+ tenants SaaS, sem HA
2. **Apenas Kubernetes para tudo** — Rejeitado: overkill para PME, complexidade desnecessária
3. **Vercel para SaaS** — Rejeitado: não suporta workers/sockets bem, custo em escala
4. **Render/Railway** — Rejeitado: vendors menores, lock-in
5. **Nomad** — Rejeitado: menos comunidade que Kubernetes

---

# ADR-027 — CDN com Cloudflare (Não Vercel Edge)

**Status:** Accepted
**Data:** 2025-07-30

## Contexto
Orion precisa de CDN para:
- Servir assets estáticos (JS, CSS, imagens) globalmente
- Reduzir latência para usuários no Brasil (sa-east-1 é em SP)
- Mitigar DDoS
- WAF (Web Application Firewall)
- TLS termination na borda
- Cache de páginas públicas (landing page, docs)
- Reduzir custo de bandwidth do servidor de origem

Requisitos:
- POPs no Brasil (latência baixa)
- Custo previsível
- API para purge de cache
- WAF regras customizáveis
- Funciona com origem em AWS/Vercel/on-prem

## Decisão

Adotar **Cloudflare** como CDN e WAF.

### Por que Cloudflare
- POPs em São Paulo, Rio de Janeiro, Fortaleza, Porto Alegre
- Plano Pro ($20/mês) inclui WAF, DDoS protection, analytics
- Cache purge instantâneo via API
- Workers (edge compute) opcional
- Free tier generoso para PoC

### O que é Cacheado
- **Assets estáticos** (`/_next/static/*`, `/assets/*`): 1 ano (com hash no nome)
- **Logos de empresas** (`/api/v1/companies/{id}/logo`): 30 dias
- **Landing page e docs** (`/`, `/docs/*`): 5 min
- **Avatares** (`/api/v1/users/{id}/avatar`): 24h
- **API responses:** NUNCA (dinâmicas por usuário)

### O que NÃO é Cacheado
- Qualquer endpoint `/api/v1/*` autenticado (header `Authorization` presente)
- Webhooks recebidos
- WebSocket upgrade
- Responses com header `Cache-Control: no-store`

### Regras de Cache
Configuradas via Page Rules:
```
# Cache static assets
URL: orion.com/_next/static/*
Cache Level: Cache Everything
Edge TTL: 1 year
Browser TTL: 1 year

# Cache landing page
URL: orion.com/
Cache Level: Cache Everything
Edge TTL: 5 minutes

# Don't cache API
URL: orion.com/api/*
Cache Level: Bypass
```

### WAF Regras
- Block SQL injection patterns
- Block XSS patterns
- Rate limit: 100 req/min por IP em `/api/v1/auth/login`
- Rate limit: 60 req/min por IP em `/api/v1/auth/reset-password`
- Block requests de países não atendidos (ex: RU, CN se não há clientes lá)
- Challenge (CAPTCHA) para IPs com comportamento suspeito

### DDoS Protection
Cloudflare tem DDoS protection nativa (L3, L4, L7). Plano Pro inclui:
- Unlimited DDoS mitigation
- Always Online (serve cached version se origem cair)
- SSL/TLS automático

### TLS
- Cloudflare faz TLS termination na borda (cert managed)
- Conexão backend: Cloudflare → origem via HTTPS (Full Strict)
- TLS 1.2+ mínimo, 1.3 preferido
- HSTS header (max-age 1 ano, includeSubDomains, preload)

### Purge de Cache
Quando asset é atualizado (raro — assets têm hash no nome), purge via API:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -d '{"files": ["https://orion.com/_next/static/abc123/main.js"]}'
```

### Workers (Edge Compute)
Para features específicas, Cloudflare Workers pode rodar lógica na borda:
- Georouting (BR → sa-east-1, EU → eu-west-1)
- A/B testing na borda (sem hit no servidor)
- Auth token validation na borda (Redis em Cloudflare KV)

Por enquanto não usamos Workers — adicionar se necessário.

### Multi-Tenant Domains
Clientes Enterprise podem ter domínio próprio: `orion.empresa.com`. Cloudflare suporta CNAME setup:
- Cliente aponta `orion.empresa.com CNAME orion.cloudflare.com`
- Cloudflare roteia para origem correta
- TLS via Cloudflare for SaaS

## Consequências

### Positivas
- Latência reduzida para usuários Brasil (50ms → 5ms para assets)
- DDoS protection incluída
- WAF reduz ataques de aplicação
- Custo: $20/mês plano Pro (vs $250+ AWS CloudFront equivalente)
- API para purge programático
- Analytics incluído

### Negativas
- Lock-in parcial (Page Rules, WAF rules são Cloudflare-specific)
- Workers se usarmos, é mais uma runtime para manter
- Para clientes on-prem sem internet, CDN não ajuda (mitigado: assets locais no Docker)

## Alternativas Consideradas

1. **Vercel Edge** — Rejeitado: amarrado a Vercel hosting (não usamos — ADR-026)
2. **AWS CloudFront** — Rejeitado: mais caro, sem WAF grátis, configuração mais complexa
3. **Fastly** — Rejeitado: mais caro, menos features no plano base
4. **Akamai** — Rejeitado: enterprise-focused, caro, contrato complexo
5. **BunnyCDN** — Rejeitado: mais barato mas menos features, WAF fraco
6. **Sem CDN** — Rejeitado: latência alta para usuários distantes da sa-east-1

---

# ADR-028 — Email com AWS SES (Não SendGrid por Custo em Escala)

**Status:** Accepted
**Data:** 2025-07-30

## Contexto
Orion envia diversos tipos de email:
- Transacional: boas-vindas, reset de senha, notificações
- Relatórios: diário, semanal, mensal (para gerentes)
- Marketing: novidades, dicas (opt-in)
- Alertas: licença expirando, sync falhou
- Convites: novos usuários, parceiros

Volume estimado em 12 meses: 50k–500k emails/mês.

Requisitos:
- Entrega confiável (não ir para spam)
- Tracking de abertura e clique (para marketing)
- Templates versionados
- unsubscribe automático (CAN-SPAM, LGPD)
- Bounce/complaint handling
- Custo previsível
- Domínio validado (SPF, DKIM, DMARC)

## Decisão

Adotar **AWS SES** como provedor de email primário, com abstração para permitir SendGrid como fallback.

### Por que SES
- Custo: $0.10 por 1.000 emails (vs SendGrid $0.20+ para mesmo volume)
- Integração nativa com AWS (já usamos)
- SPF/DKIM configuráveis
- Bounce/complaint via SNS
- Free tier: 62k emails/mês se enviado de EC2

### Abstração
```typescript
interface EmailProvider {
  send(message: EmailMessage): Promise<EmailResult>;
}

class SESProvider implements EmailProvider { /* AWS SDK v3 */ }
class SendGridProvider implements EmailProvider { /* @sendgrid/mail */ }
class SMTPProvider implements EmailProvider { /* nodemailer */ }

// Configurável via env
const provider = process.env.EMAIL_PROVIDER === 'ses'
  ? new SESProvider()
  : process.env.EMAIL_PROVIDER === 'sendgrid'
    ? new SendGridProvider()
    : new SMTPProvider();
```

Por que abstração? Clientes on-prem podem não ter AWS account. SMTP funciona com qualquer provedor.

### Configuração AWS SES
- Domínio verificado: `mail.orion.com`
- SPF: `v=spf1 include:amazonses.com ~all`
- DKIM: 3 CNAMEs gerados pela SES
- DMARC: `_dmarc.mail.orion.com TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@orion.com"`
- Configuration Set: `orion-prod` (para tracking, event publishing)

### Templates
Usar **React Email** para templates:
```typescript
// emails/welcome.tsx
import { Button, Container, Heading, Text } from '@react-email/components';

export function WelcomeEmail({ name, loginUrl, tempPassword }) {
  return (
    <Container>
      <Heading>Bem-vindo ao Orion, {name}!</Heading>
      <Text>Sua conta foi criada. Use as credenciais abaixo:</Text>
      <Text>Login: <strong>{loginUrl}</strong></Text>
      <Text>Senha temporária: <strong>{tempPassword}</strong></Text>
      <Button href={loginUrl}>Acessar Orion</Button>
    </Container>
  );
}

// Renderização
import { render } from '@react-email/render';
const html = await render(<WelcomeEmail name="João" loginUrl="..." tempPassword="..." />);
```

Por que React Email:
- Componentes reutilizáveis (header, footer, button)
- TypeScript (props tipadas)
- Preview no browser
- Renderiza para HTML compatível com todos os clientes de email

### Queue
Emails são enfileirados em BullMQ (`email-send` queue):
- Concurrency: 20
- Rate limit: 14 emails/seg (limite SES)
- Retry: 5x com backoff exponencial
- Bounces/complaints atualizam `user.email_status`

```typescript
new Worker('email-send', async (job) => {
  const { to, template, data, from } = job.data;
  const html = await renderEmail(template, data);
  await provider.send({
    from: from || 'Orion <noreply@mail.orion.com>',
    to,
    subject: getSubject(template, data),
    html,
    configurationSetName: 'orion-prod',
    tags: [{ Name: 'template', Value: template }, { Name: 'tenant', Value: data.tenantId }]
  });
}, { concurrency: 20, limiter: { max: 14, duration: 1000 } });
```

### Bounce/Complaint Handling
SES envia eventos para SNS → SNS chama webhook Orion:
```typescript
app.post('/webhooks/ses', (req, res) => {
  const notification = JSON.parse(req.body);
  if (notification.eventType === 'Bounce') {
    const { emailAddress, bounceType } = notification.bounce;
    if (bounceType === 'Permanent') {
      // Marca usuário como email inválido
      await db.users.update({ where: { email: emailAddress }, data: { emailStatus: 'bounced' }});
    }
  }
  if (notification.eventType === 'Complaint') {
    // Usuário marcou como spam — unsubscribes
    await db.users.update({ where: { email: emailAddress }, data: { emailStatus: 'complained' }});
  }
  res.json({ ok: true });
});
```

Sistema NÃO envia emails para usuários com status `bounced` ou `complained`.

### Tracking
- Open tracking: pixel 1x1 transparente
- Click tracking: links passam por redirect `orion.com/click?...`
- Desativado para emails transacionais sensíveis (reset de senha com token)

### Unsubscribe
- Todo email marketing tem footer com unsubscribe
- Link: `orion.com/unsubscribe?token=...`
- Token JWT assinado, válido 30 dias
- Click atualiza `user.marketing_consent = false`

### Sandbox vs Production
- SES Sandbox: apenas emails verificados podem receber (dev/test)
- Production: qualquer destinatário (requer request à AWS)
- Staging usa Sandbox com whitelist de emails de teste

## Consequências

### Positivas
- Custo: ~$5/mês para 50k emails (vs $20+ SendGrid)
- Templates com React Email (reutilizáveis, tipados)
- Bounce/complaint automático (LGPD compliance)
- Tracking de open/click para marketing
- Free tier generoso (62k/mês de EC2)

### Negativas
- SES não tem UI para templates (SendGrid tem) — mitigado com React Email
- Setup inicial mais complexo que SendGrid (verificação de domínio, configuration sets)
- Sem A/B testing de subject nativo (teria que implementar)

## Alternativas Consideradas

1. **SendGrid** — Rejeitado por custo (2x SES em escala). Considerar se cliente prefere UI.
2. **Mailgun** — Rejeitado: similar custo SendGrid
3. **Postmark** — Rejeitado: ótimo para transacional, mas caro para volume alto
4. **Amazon Pinpoint** — Rejeitado: mais para marketing multichannel, complexo
5. **SMTP próprio** — Rejeitado: entrega pobre (sem reputation), difícil manter
6. **Mailchimp (Mandrill)** — Rejeitado: caro, menos integrado

---

# ADR-029 — SMS/WhatsApp com Twilio (Não SNS por Ecossistema)

**Status:** Accepted
**Data:** 2025-07-31

## Contexto
Orion precisa enviar SMS para:
- 2FA (código por SMS)
- Alertas críticos (licença bloqueada, sync falhou)
- Notificações de campanhas (opt-in)

WhatsApp Business API para:
- Notificações de metas atingidas
- Campanhas começaram
- Lembretes diários de ranking
- Templates pré-aprovados

Requisitos:
- Números brasileiros (+55)
- Latência < 30s para entrega
- Suporte a webhook de status (delivered, read)
- Templates WhatsApp aprovados pela Meta
- Sandbox para dev

## Decisão

Adotar **Twilio** para SMS e **Twilio WhatsApp API** para WhatsApp (Twilio é BSP — Business Solution Provider — autorizado pela Meta).

### Por que Twilio
- SMS global, números BR disponíveis
- WhatsApp Business API via Twilio (mais fácil que Meta direta)
- SDK maduro (Node.js, Python)
- Webhook de status
- Sandbox para dev
- Compliance built-in (opt-out automático)

### SMS: Configuração
- Número alfanumérico: `ORION` (não pode receber resposta, mas aparece como remetente)
- Ou número +55 11 XXXX-XXXX (pode receber resposta)
- Sender ID registrado na Anatel

### SMS: Templates
```
[Orion] Seu código de verificação: {CODE}. Válido por 10 minutos. Não compartilhe.
[Orion] Alerta: sincronização com {ERP} falhou. Acesse: {URL}
[Orion] Campanha {NAME} termina em {DAYS} dias. Posição atual: #{RANK}
```

### WhatsApp: Configuração
- Número Business verificado pela Meta
- Twilio lida com todas as complexidades (template approval, message templates, 24h window)
- Templates aprovados:
  - `orion_result_created` (notificação de novo resultado)
  - `orion_goal_achieved` (parabéns por meta)
  - `orion_campaign_started` (campanha começou)
  - `orion_daily_summary` (resumo diário)

### WhatsApp: Templates (pré-aprovados Meta)
```
Olá {{1}}! Seu resultado de {{2}} foi registrado:
• {{3}}: R$ {{4}}
• Progresso: {{5}}% da meta
Continue assim!
```

Parâmetros são substituídos pela API Twilio:
```typescript
await twilio.messages.create({
  from: 'whatsapp:+5511XXXXXXX',
  to: `whatsapp:+55${user.phone}`,
  contentSid: 'HXxxx...',  // template ID no Twilio
  contentVariables: JSON.stringify({
    1: user.name,
    2: result.date,
    3: result.indicator,
    4: result.value,
    5: result.progressPercent
  })
});
```

### Queue e Rate Limit
- BullMQ queue `whatsapp-send` com concurrency 3 (Meta rate limit)
- Rate limit: 1 msg/usuário/hora (anti-spam)
- Retry: 10x com backoff 60s (WhatsApp pode demorar para entregar)
- Dead letter: se falhar após 10 retries, loga e notifica admin

### Webhook de Status
Twilio envia webhook para status:
```typescript
app.post('/webhooks/twilio', (req, res) => {
  const { MessageSid, MessageStatus, To } = req.body;
  // delivered, read, failed, etc.
  await db.notifications.update({
    where: { externalId: MessageSid },
    data: { status: MessageStatus, deliveredAt: new Date() }
  });
  res.type('text/xml').send('<Response></Response>');
});
```

### Opt-In/Opt-Out
- Usuário faz opt-in no perfil (default: false)
- Opt-out: responder "PARAR" no WhatsApp → Twilio bloqueia automaticamente
- Opt-out registrado em `user.whatsapp_opt_out_at`
- Sistema NÃO envia para usuários opted out

### Sandbox (Dev)
- Twilio WhatsApp Sandbox: números de teste join com código
- Apenas números sandbox podem receber
- Produção: número verificado pela Meta

### Custos
- SMS BR: ~$0.05/msg (Twilio)
- WhatsApp BR: ~$0.005–0.08/msg (depende do tipo — marketing vs utility)
- Estimativa: R$ 500–2000/mês para 1000 clientes ativos

## Consequências

### Positivas
- SMS + WhatsApp no mesmo provider (Twilio)
- SDK maduro, documentação boa
- Webhook de status completo
- Sandbox para dev
- Compliance built-in

### Negativas
- Custo em USD (câmbio BRL)
- WhatsApp tem regras estritas (templates, 24h window para responder)
- SMS BR pode ter atraso (operadoras)
- Lock-in parcial (Twilio-specific APIs)

## Alternativas Consideradas

1. **AWS SNS (SMS)** + **Meta WhatsApp direta** — Rejeitado: mais barato mas Meta direta é complexa (BSP necessário), dois providers
2. **MessageBird** — Rejeitado: similar ao Twilio mas menos ecosistema BR
3. **Vonage (Nexmo)** — Rejeitado: idem, menos clients Brasil
4. **Zenvia** — Rejeitado: BR-focused mas mais caro, menos features
5. **Wavy** — Rejeitado: idem, foco enterprise BR caro
6. **WhatsApp Cloud API (Meta direta)** — Rejeitado: complexa sem BSP, sem sandbox fácil

---

# ADR-030 — Push Notifications via Firebase Cloud Messaging (FCM)

**Status:** Accepted
**Data:** 2025-07-31

## Contexto
Orion PWA e app Electron precisam receber push notifications:
- Nova meta atribuída
- Resultado aprovado/rejeitado
- Campanha começou/encerrou
- Ranking mudou significativamente
- Insights de IA disponíveis
- Lembretes diários (2h antes do fim do dia: "Faltam 2h para fechar suas vendas")

Requisitos:
- Funcionar em Android (Chrome PWA), iOS (Safari PWA 16.4+), desktop (Electron, Chrome)
- Latência < 30s
- Permite silent push (atualizar dados em background)
- Opt-in/opt-out por tipo de notificação
- Funciona com service worker (PWA)

## Decisão

Adotar **Firebase Cloud Messaging (FCM)** como backend de push notifications.

### Por que FCM
- Gratuito (Google)
- Suporte web (PWA), Android, iOS, Electron
- API HTTP v1 com OAuth
- Topics (broadcast para muitos dispositivos)
- Silent pushes suportados
- SDK JavaScript maduro

### Por que não OneSignal
- OneSignal é mais fácil mas adiciona vendor lock-in
- OneSignal free tem limites (10k recipients)
- FCM é gratuito ilimitado

### Setup
1. Criar projeto Firebase
2. Configurar Web Push (gerar VAPID keys)
3. SDK cliente no Orion PWA
4. Service worker para receber pushes
5. Backend Orion com Firebase Admin SDK

### Cliente PWA
```typescript
// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Solicitar permissão
export async function requestPushPermission() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;
  
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
  });
  return token;
}

// Receber foreground
onMessage(messaging, (payload) => {
  showNotification(payload.notification.title, payload.notification.body);
});
```

### Service Worker
```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: payload.data?.tag,
    data: payload.data
  });
});

// Click na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
```

### Backend
```typescript
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://orion-prod.firebaseio.com'
});

async function sendPush(userId, title, body, data) {
  const tokens = await db.push_tokens.findMany({ where: { userId } });
  if (tokens.length === 0) return;
  
  const message = {
    notification: { title, body },
    data: data || {},
    tokens: tokens.map(t => t.token),
    android: {
      priority: 'high',
      notification: { channelId: 'orion-default', icon: 'ic_notification' }
    },
    apns: {
      payload: { aps: { badge: 1, sound: 'default' }}
    },
    webpush: {
      notification: { icon: '/icon-192.png', badge: '/badge-72.png' }
    }
  };
  
  const response = await admin.messaging().sendMulticast(message);
  // Limpa tokens inválidos
  response.responses.forEach((resp, idx) => {
    if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
      db.push_tokens.delete({ where: { token: tokens[idx].token }});
    }
  });
}
```

### Topics (Broadcast)
Para comunicados globais (todos os usuários de uma empresa):
```typescript
await admin.messaging().sendToTopic(`tenant-${tenantId}`, message);
// Clientes fazem subscribe ao topic
await messaging.subscribeToTopic(token, `tenant-${tenantId}`);
```

### Opt-In Granular
Usuário escolhe quais notificações quer:
- Metas (default: on)
- Resultados aprovados (default: on)
- Campanhas (default: on)
- Insights IA (default: off)
- Lembretes diários (default: off)
- Marketing (default: off)

Stored em `user.push_preferences` (JSON).

### Silent Push (Background Sync)
Para atualizar cache em background (ex: novo ranking):
```typescript
const message = {
  data: { action: 'refresh-cache', scope: 'ranking' },
  tokens: [...],
  // Sem notification — silent push
};
```

Service worker intercepta e atualiza cache sem mostrar notificação.

### Token Management
- Token pode expirar (rotacionado pelo FCM)
- App atualiza token a cada login e periodicamente
- Múltiplos tokens por usuário (vários dispositivos)
- Limpeza de tokens inválidos automática

## Consequências

### Positivas
- Gratuito (Google)
- Suporte amplo (web, Android, iOS, Electron)
- Topics para broadcast eficiente
- Silent pushes para sync
- SDK maduro

### Negativas
- Firebase é Google (lock-in parcial)
- iOS requer Safari 16.4+ para PWA push (antes, só app nativo)
- Dependência de service worker (requer HTTPS)
- Tokens expiram (gestão contínua)

## Alternativas Consideradas

1. **OneSignal** — Rejeitado: mais fácil mas vendor lock-in, limites free
2. **AWS SNS + GCM/FCM** — Rejeitado: AWS SNS é camada extra sobre FCM, sem benefício
3. **Pusher Beams** — Rejeitado: pago, menos features
4. **Web Push direto (sem FCM)** — Rejeitado: teria que manter próprio backend, sem iOS support
5. **Apple Push Notification Service (APNs) direto** — Rejeitado: só iOS, complexo

---

# ADR-031 — Analytics de Produto com PostHog (Não Mixpanel por Self-Hostable)

**Status:** Accepted
**Data:** 2025-08-01

## Contexto
Orion precisa de analytics de produto para:
- Funil de ativação (signup → first result → first goal)
- Tracking de features (qual botão é mais clicado)
- Cohort retention (clientes que voltam)
- Session replay (debug de UX)
- A/B testing de UX
- User interviews (heatmap)
- North Star metric tracking
- Conversão trial → pago

Requisitos:
- Self-hostable (LGPD: dados sensíveis não saem)
- SDK JS e backend
- UI para product managers
- Eventos ilimitados sem custo explodir
- Session replay incluído

## Decisão

Adotar **PostHog** self-hosted como analytics de produto.

### Por que PostHog
- Open-source, self-hostable
- Eventos ilimitados (custo é por ingestão, não por evento)
- Session replay nativo
- Feature flags incluído (complementa Unleash para product experiments)
- A/B testing nativo
- Heatmaps
- SDK para JS, Node, Python, mobile

### Por que não Mixpanel
- Mixpanel cobra por evento (caro em escala)
- Não self-hostable (dados saem para SaaS)
- Sem session replay nativo (teria que adicionar LogRocket)

### Setup
- PostHog rodando em Docker (PostgreSQL + ClickHouse + Redis + app)
- ClickHouse para evento analytics (alta performance em escala)
- SDK cliente no Orion PWA
- SDK backend no Orion API

### Cliente PWA
```typescript
// lib/posthog.ts
import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: 'https://analytics.orion.com',
  autocapture: false,  // captura manual (controle do que é enviado)
  capture_pageview: true,
  persistence: 'localStorage+cookie',
  session_recording: {
    recordCrossOriginIframes: false,
    maskAllInputs: false,  // necessário para debug de forms
    blockClass: 'ph-block'  // elementos com essa classe NÃO são gravados
  }
});

// Identify user após login
posthog.identify(user.id, {
  email: user.email,
  tenantId: user.tenantId,
  role: user.role,
  plan: tenant.plan
});

// Track events
posthog.capture('goal_created', {
  goalId: goal.id,
  goalType: goal.type,
  targetValue: goal.targetValue
});
```

### Eventos Rastreados
Evento | Quando | Propriedades
---|---|---
`user_signed_up` | Cadastro concluído | source, plan
`user_logged_in` | Login | method (email, google, saml)
`goal_created` | Meta criada | goalType, targetValue, period
`result_created` | Resultado lançado | source (manual, erp, api)
`goal_achieved` | Meta atingida | achievementPercent
`campaign_started` | Campanha começou | participantsCount
`plugin_installed` | Plugin instalado | pluginId, pluginCategory
`plugin_uninstalled` | Plugin desinstalado | pluginId, reason
`report_generated` | Relatório gerado | reportType, format
`invite_sent` | Convite enviado | role, emailDomain
`trial_started` | Trial começou | source
`trial_converted` | Trial virou pago | daysToConvert
`churn_requested` | Cliente pediu cancelamento | reason

### Filtros de Privacidade
- NÃO capturar campos sensíveis (CPF, CNPJ, senha, token)
- Bloquear elementos com classe `.ph-block` (ex: previews de comprovantes)
- IPs mascarados (não armazenar completo)
- Respeitar Do Not Track
- Cookie opt-in para analytics (LGPD)

### Session Replay
PostHog grava sessão (DOM mutations, mouse, scroll). Configurado para:
- Gravar 10% das sessões normais (amostragem)
- 100% das sessões com erro
- Não gravar campos de senha (mask)
- Não gravar iframes cross-origin
- Replay retido por 30 dias

### Funnels
Funnels definidos na UI do PostHog:
1. **Ativação:** signup → first login → first goal → first result → goal achieved
2. **Trial → Paid:** trial_start → first admin action → payment_method_added → first_invoice
3. **Plugin Adoption:** plugin_view → plugin_install → plugin_first_use → plugin_7d_retention

### Cohort Retention
PostHog calcula automaticamente:
- Cohort por signup month
- Retenção D1, D7, D30
- Retenção por feature (clientes que usaram feature X vs não)

### A/B Testing
PostHog tem feature flags com variantes — complementa Unleash:
- Use Unleash para feature flags operacionais (kill switch, rollout)
- Use PostHog para experimentos de produto (A/B com métricas de impacto)

### Dashboards
PostHog tem dashboards nativos:
- DAU/MAU
- North Star metric (resultados criados por dia ativo)
- Funnel conversion rates
- Top features usadas
- Top plugins instalados

## Consequências

### Positivas
- Self-hosted (dados não saem — LGPD compliance)
- Eventos ilimitados (custo por volume, não por evento)
- Session replay nativo (debug de UX)
- A/B testing integrado
- SDK maduro

### Negativas
- PostHog self-hosted requer ClickHouse (pesado: 4GB RAM mínimo)
- Setup mais complexo que Mixpanel SaaS
- Sem suporte comercial free (comunidade)

## Alternativas Consideradas

1. **Mixpanel** — Rejeitado: pago por evento, não self-hostable
2. **Amplitude** — Rejeitado: idem Mixpanel, caro em escala
3. **Google Analytics 4** — Rejeitado: mais para marketing analytics, não product
4. **Matomo** — Rejeitado: menos features para product analytics, sem session replay
5. **Plausible** — Rejeitado: muito simples, só page views
6. **Heap** — Rejeitado: caro, autocapture pode capturar dados sensíveis

---

# ADR-032 — A/B Testing com GrowthBook (Não PostHog para Experimentos Críticos)

**Status:** Accepted
**Data:** 2025-08-02
**Relacionado a:** ADR-031 (PostHog), ADR-024 (Unleash)

## Contexto
ADR-031 menciona que PostHog tem A/B testing. Por que adotar GrowthBook também?

Diferença:
- **PostHog:** ótimo para experimentos rápidos de UX (cor de botão, texto)
- **GrowthBook:** melhor para experimentos críticos de negócio (algoritmo de ranking, regra de cálculo, fluxo de onboarding)

Requisitos para experimentos críticos:
- Métricas estatísticas rigorosas (significância, power)
- Métricas guardrails (não degradar métricas principais)
- Dimensões de segmentação (por plano, região, segmento)
- Integração com data warehouse (queremos análise em SQL custom)
- Audit log completo
- Holdouts (grupos que nunca recebem experimento)

## Decisão

Adotar **GrowthBook** para experimentos críticos, mantendo **PostHog** para experimentos rápidos de UX.

### Divisão de Responsabilidades
| Tipo | Tool |
|------|------|
| UX experiments (button color, copy) | PostHog |
| Onboarding flow experiments | GrowthBook |
| Algorithm experiments (ranking, recommendations) | GrowthBook |
| Pricing experiments | GrowthBook |
| Feature rollout (operational) | Unleash |

### Por que GrowthBook
- Open-source, self-hostable
- Visual editor (UI para definir experimentos sem código)
- Integração com data warehouse (ClickHouse, BigQuery, Postgres)
- Bayesian e frequentist stats
- Guardrail metrics (alerta se experiência degrada KPI principal)
- SDK para Node, JS, Python, mobile

### Setup
- GrowthBook rodando em Docker (frontend + backend + postgres)
- Conectado ao ClickHouse do PostHog (fonte de eventos)
- SDK cliente em Orion PWA e API

### Estrutura
```typescript
import { GrowthBook } from '@growthbook/growthbook';

const gb = new GrowthBook({
  apiHost: 'https://experiments.orion.com',
  clientKey: process.env.GROWTHBOOK_CLIENT_KEY,
  attributes: {
    userId: user.id,
    tenantId: user.tenantId,
    plan: tenant.plan,
    region: tenant.region,
    segment: tenant.segment
  }
});

// Eval experiment
const rankingAlgo = gb.getFeatureValue('ranking-algorithm', 'v1');
if (rankingAlgo === 'v2') {
  return newRankingAlgorithm();
} else {
  return oldRankingAlgorithm();
}

// Track conversion (também rastreado no PostHog para análise)
gb.track('goal_achieved', { userId, value: result.value });
```

### Tipos de Experimentos
1. **A/B/n:** múltiplas variantes (3+ algoritmos)
2. **Holdout:** grupo que nunca recebe nova feature (medir impacto real a longo prazo)
3. **Interleaved:** alternar A/B por request (não por usuário) — para algoritmos de ranking
4. **Server-side:** avaliação no backend (mais seguro, não flasha UI)

### Métricas
- **Primary:** conversão trial→pago, retenção D30, LTV
- **Secondary:** feature usage, NPS, CSAT
- **Guardrails:** error rate, latency, churn rate (se degradar, abort experimento)

### Processo de Experimento
1. **Hipótese:** "Mudar algoritmo de ranking para peso 60/40 (recência/consistência) vai aumentarretenção D30 em 5%"
2. **Power analysis:** calcular sample size necessário (ex: 1000 users por variante)
3. **Setup:** criar experimento no GrowthBook UI
4. **Deploy:** código com feature flag (GrowthBook)
5. **Run:** aguardar 14 dias (mínimo para significance)
6. **Analyze:** GrowthBook calcula significance, lift, CI
7. **Decision:** ship se significativo e guardrails OK, rollback caso contrário
8. **Document:** resultado no wiki do produto

### Audit Log
GrowthBook registra: quem criou/alterou/pausou experimento, quando, com qual justificativa.

## Consequências

### Positivas
- Experimentos críticos com rigor estatístico
- Integração com data warehouse (análise SQL custom)
- Guardrails evitam degradação
- Self-hosted (LGPD)
- SDK maduro

### Negativas
- Mais uma ferramenta (3 sistemas de flags: Unleash, PostHog, GrowthBook)
  - Mitigado: responsabilidade dividida clara
- GrowthBook self-hosted requer infra (PostgreSQL, frontend, backend)
- Curva de aprendizado para PMs (estatística)

## Alternativas Consideradas

1. **Apenas PostHog** — Rejeitado:PostHog A/B é básico, sem guardrails, sem integração com data warehouse custom
2. **Apenas Unleash** — Rejeitado: Unleash é feature flags, não A/B testing com stats
3. **Statsig** — Rejeitado: excelente mas pago em escala, menos self-hostable
4. **Eppo** — Rejeitado: enterprise-focused, caro
5. **Optimizely** — Rejeitado: caro, menos técnico
6. **Internal (custom)** — Rejeitado:reinventar roda, sem rigor estatístico garantido

---

# ADR-033 — Customer Support com Intercom (Não Zendesk por Conveniência B2B SaaS)

**Status:** Accepted
**Data:** 2025-08-02

## Contexto
Orion precisa de sistema de customer support para:
- Chat in-app (usuário pede ajuda dentro do Orion)
- Email support (tickets via help@orion.com)
- Knowledge base (FAQs, tutoriais)
- Onboarding messaging (dicas para novos usuários)
- NPS surveys
- Customer segmentation (mensagem por plano)
- Product tours (in-app walkthroughs)

Requisitos:
- Chat in-app leve (não prejudicar performance)
- Integração com dados do usuário (plano, tenant, usage)
- SLA tracking
- Multi-channel (chat, email, WhatsApp)
- Mobile-responsive

## Decisão

Adotar **Intercom** como plataforma de customer support e messaging.

### Por que Intercom
- Chat in-app excelente
- Product tours (in-app walkthroughs) nativos
- Customer data platform integrado
- Automations (responder baseado em evento)
- NPS surveys
- Knowledge base
- Mobile SDK

### Por que não Zendesk
- Zendesk é mais ticket-centric (call center style)
- Intercom é mais conversational (SaaS style) — adequado para B2B SaaS
- Intercom tem product tours nativos
- Zendesk é mais caro em escala para features equivalentes

### Setup
- Conta Intercom (plano Advanced)
- SDK JS no Orion PWA
- Webhook para sync de dados do usuário
- API integration para eventos custom

### In-App Chat
```typescript
// Carregar Intercom
window.Intercom('boot', {
  app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
  user_id: user.id,
  email: user.email,
  name: user.name,
  created_at: user.createdAt.getTime() / 1000,
  // Custom attributes
  plan: tenant.plan,
  tenant_id: tenant.id,
  tenant_name: tenant.name,
  user_count: tenant.userCount,
  last_login_at: user.lastLoginAt
});

// Update quando usuário muda de página
router.events.on('routeChangeComplete', () => {
  window.Intercom('update');
});

// Hide on mobile quando aberto (UX melhor)
window.Intercom('onShow', () => setMobileChatOpen(true));
window.Intercom('onHide', () => setMobileChatOpen(false));
```

### Product Tours
Tours guiados para novos usuários:
1. **Onboarding (D1):** "Bem-vindo! Vamos criar sua primeira meta?" → walkthrough
2. **First Result (D2):** "Que tal lançar seu primeiro resultado?" → walkthrough
3. **First Campaign (D7):** "Você pode criar campanhas para motivar a equipe" → walkthrough
4. **Ranking (D14):** "Veja o ranking da sua equipe" → walkthrough

Tours configurados via Intercom UI (sem código).

### Knowledge Base
Artigos hospedados em `help.orion.com` (Intercom Articles):
- Como criar metas
- Como configurar indicadores
- Como integrar com ERP
- Como usar a API
- Troubleshooting comum

### NPS Surveys
Survey enviado após 30 dias de uso:
- Score 0-10
- Comment opcional
- Triggered por evento (`user.active_30d`)
- Detractors (0-6): follow-up personalizado
- Promoters (9-10): pedir referral

### Automations
Intercom responde automaticamente baseado em eventos:
- User não loga por 7 dias → email "Tudo certo? Posso ajudar?"
- Trial expira em 3 dias → in-app message "Converta agora com 20% off"
- Plugin installed → message "Configurou o plugin? Aqui está o guia"
- Goal achieved 5x → "Você está pegando o jeito! Conheça campanhas"

### Webhooks
Intercom envia webhooks para eventos:
- Conversation created
- Conversation replied
- User created
- User deleted

Orion processa e atualiza métricas (ex: tempo de resposta, CSAT).

### SLA
- Plano Starter: 24h resposta
- Plano Professional: 8h resposta
- Plano Enterprise: 4h resposta, chat prioritário

Intercom rastreia e alerta se SLA estourar.

### Privacy
- Intercom recebe: nome, email, tenant ID, plano, last login
- Intercom NÃO recebe: CPF, dados financeiros, resultados de vendas
- LGPD: export e delete de dados via API Intercom

## Consequências

### Positivas
- Chat in-app excelente
- Product tours sem desenvolvimento custom
- NPS e automations integrados
- Knowledge base unificada
- SDK maduro

### Negativas
- Custo: ~$74/seat/mês (plano Advanced) + usage-based
- Lock-in (dados de conversas ficam no Intercom)
- Chat pode impactar performance (script ~50KB)
- Mobile UX do Intercom é mediana

## Alternativas Consideradas

1. **Zendesk** — Rejeitado: mais ticket-centric, sem product tours nativos, mais caro
2. **Crisp** — Rejeitado: mais barato mas menos features enterprise
3. **HelpScout** — Rejeitado: bom para email, mas chat in-app fraco
4. **Drift** — Rejeitado: mais para conversational marketing B2B
5. **Freshdesk/Freshchat** — Rejeitado: similar ao Zendesk, menos integrado
6. **Custom (Discord/Slack webhook)** — Rejeitado: sem SLA, sem knowledge base, sem product tours

---

# ADR-034 — Documentation com Mintlify (Não GitBook por DX)

**Status:** Accepted
**Data:** 2025-08-03

## Contexto
Orion precisa de documentação pública para:
- API reference (OpenAPI-based)
- Guia de integração (ERP, CRM)
- Tutoriais (como criar meta, importar resultados)
- Plugin development guide
- Changelog
- Knowledge base para desenvolvedores

Requisitos:
- OpenAPI renderizado bonito
- Markdown-based (versionado no git)
- Search built-in
- Multi-idioma (PT-BR primário, EN secundário)
- Analytics (quais páginas mais acessadas)
- Custom domain (docs.orion.com)
- Feedback widget (thumbs up/down)

## Decisão

Adotar **Mintlify** como plataforma de documentação.

### Por que Mintlify
- Markdown/MDX no git (versionado)
- Render OpenAPI lindamente (especificação YAML → docs)
- Search built-in ( Algolia-powered)
- Multi-idioma nativo
- Analytics integrado
- Custom domain
- Feedback widget nativo
- Temas customizáveis
- DX excelente (live preview, hot reload)

### Por que não GitBook
- GitBook UI é bom mas menos flexível
- OpenAPI render é inferior ao Mintlify
- Menos componentes interativos (callouts, tabs, steps)
- Pricing per user é menos favorável

### Estrutura
```
docs/
├── mint.json              # Config Mintlify
├── introduction.mdx
├── api-reference/
│   ├── openapi.yaml       # OpenAPI 3.1 spec
│   ├── authentication.mdx
│   ├── rate-limits.mdx
│   └── errors.mdx
├── guides/
│   ├── quickstart.mdx
│   ├── create-goal.mdx
│   ├── import-results.mdx
│   ├── integrate-erp.mdx
│   └── integrate-crm.mdx
├── plugins/
│   ├── getting-started.mdx
│   ├── lifecycle.mdx
│   ├── api-surface.mdx
│   ├── security.mdx
│   └── examples/
├── sdk/
│   ├── javascript.mdx
│   ├── python.mdx
│   └── php.mdx
├── changelog.mdx
└── migration-guides/
    └── v1-to-v2.mdx
```

### mint.json (config)
```json
{
  "name": "Orion Docs",
  "logo": { "light": "/logo-light.png", "dark": "/logo-dark.png" },
  "navigation": [
    { "group": "Get Started", "pages": ["introduction", "guides/quickstart"] },
    { "group": "API Reference", "pages": ["api-reference/authentication", "api-reference/openapi"] },
    { "group": "Guides", "pages": ["guides/create-goal", "guides/import-results", "guides/integrate-erp"] },
    { "group": "Plugins", "pages": ["plugins/getting-started", "plugins/lifecycle", "plugins/api-surface"] },
    { "group": "SDKs", "pages": ["sdk/javascript", "sdk/python", "sdk/php"] }
  ],
  "analytics": { "posthog": { "token": "phc_..." } },
  "feedback": { "thumbsRating": true }
}
```

### OpenAPI Render
Mintlify lê OpenAPI spec e gera docs bonitas:
```yaml
# api-reference/openapi.yaml
openapi: 3.1.0
paths:
  /v1/goals:
    post:
      summary: Create a goal
      description: |
        Creates a new goal for a user.
        #### Required scopes
        - `goals:write`
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                userId: { type: integer, example: 10 }
                indicatorId: { type: integer, example: 3 }
                goalType: { type: string, enum: [daily, weekly, monthly] }
                targetValue: { type: number, example: 30000 }
              required: [userId, indicatorId, goalType, targetValue]
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Goal'
```

Mintlify gera: UI interativa com "Try it" button, schemas navegáveis, exemplos.

### Componentes MDX
Mintlify tem componentes especiais:
```mdx
<Info>
This is an info callout.
</Info>

<Warning>
This is a warning.
</Warning>

<Tabs>
  <Tab title="JavaScript">
    ```javascript
    const goal = await client.goals.create({...});
    ```
  </Tab>
  <Tab title="Python">
    ```python
    goal = client.goals.create({...})
    ```
  </Tab>
</Tabs>

<Steps>
  <Step title="First step">
    Do this first.
  </Step>
  <Step title="Second step">
    Then do this.
  </Step>
</Steps>
```

### Multi-Idioma
Estrutura de pastas:
```
docs/          # PT-BR (default)
docs-en/       # English
```

Header tem seletor de idioma.

### Versionamento
Docs são versionadas com tags git:
- `docs-v1.0`, `docs-v1.5`, `docs-v2.0`
- Mintlify mantém versões antigas acessíveis em `/v1.0/docs/...`

### Analytics
- PostHog tracking (integração nativa)
- Page views, time on page
- Search queries (para otimizar docs)
- Feedback thumbs up/down por página

### Custom Domain
- `docs.orion.com` aponta para Mintlify
- TLS automático
- Branding custom (cores, logo)

### Search
- Algolia DocSearch (free para open-source)
- Indexa todas as páginas
- Results com preview

## Consequências

### Positivas
- Markdown no git (versionado, reviewable)
- OpenAPI render excelente
- Componentes interativos (tabs, steps, callouts)
- Multi-idioma
- Analytics integrado
- Custom domain

### Negativas
- Mintlify é SaaS (não self-hosted) — para open-source completo, considerar Docusaurus
- Customização avançada requer plano Enterprise
- Custo: ~$50/mês (small) até $300+/mês (large)

## Alternativas Consideradas

1. **GitBook** — Rejeitado: menos flexível, OpenAPI render inferior
2. **Docusaurus** — Rejeitado:open-source mas mais trabalho para configurar, menos features out-of-box
3. **ReadMe** — Rejeitado: caro ($500+/mês)
4. **Stoplight** — Rejeitado: foco em API design, não docs completas
5. **Redoc + GitHub Pages** — Rejeitado: apenas OpenAPI, sem markdown docs
6. **Notion** — Rejeitado: não é docs pública profissional, sem OpenAPI

---

# ADR-035 — Authentication Providers: Email/Senha, Google, Microsoft, SAML

**Status:** Accepted
**Data:** 2025-08-03
**Relacionado a:** ADR-004 (JWT)

## Contexto
Orion precisa suportar múltiplos métodos de autenticação:
- Email + senha (universal)
- Google Workspace (corporativo)
- Microsoft Azure AD (corporativo)
- SAML 2.0 (enterprise com IdP próprio: Okta, OneLogin, AD FS)
- Magic link (passwordless)

Diferentes segmentos preferem diferentes métodos:
- PME: email/senha + Google
- Mid-market: + Microsoft
- Enterprise: + SAML

Requisitos:
- Login unificado (mesmo usuário pode logar por qualquer método)
- Provisionamento JIT (Just-In-Time): se usuário não existe mas IdP confirma, criar conta
- MFA (TOTP, SMS)
- Account linking (se usuário loga com Google depois de ter conta email/senha, vincular)
- Session management (ver sessões ativas, revogar)

## Decisão

Adotar **NextAuth.js (Auth.js v5)** como camada de abstração, com providers:
- **Credentials** (email + senha) — implementado internamente com bcrypt + rate limit
- **Google** — OAuth 2.0
- **Microsoft** — OAuth 2.0 (Azure AD v2.0 endpoint)
- **SAML** — via `@auth/saml-provider`
- **Magic Link** — via email (reusa SendGrid/SES)

### Por que NextAuth.js
- Padrão de mercado para Next.js
- Abstrai múltiplos providers
- Session management built-in
- Type-safe
- Suporta JWT e database sessions
- Adapter Prisma (reusa nosso DB)

### Por que não Auth0/Clerk
- Auth0 é caro em escala ($0.07+ MAU)
- Clerk é caro também ($0.02/MAU após free tier)
- Ambos são SaaS — dados de auth saem da nossa infra (LGPD)
- Para clientes Enterprise on-prem, SaaS auth não funciona

### Setup
```typescript
// auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Microsoft from 'next-auth/providers/azure-ad';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 7 },  // 7 dias
  jwt: { expiresIn: '7d' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: 'select_account' } }
    }),
    Microsoft({
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
      tenant: 'common'  // aceita qualquer tenant Microsoft
    }),
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' }
      },
      authorize: async (creds) => {
        const user = await prisma.user.findUnique({ where: { email: creds.email }});
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(creds.password, user.passwordHash);
        if (!valid) return null;
        // Rate limit check
        await checkLoginAttempts(user.id);
        return { id: user.id, email: user.email, name: user.fullName };
      }
    }),
    // Magic link: reusa Email provider
    Email({
      server: process.env.EMAIL_SERVER,
      from: 'noreply@orion.com',
      maxAge: 60 * 10  // 10 min valid
    })
  ],
  callbacks: {
    // Vincular conta a usuário existente por email
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' || account?.provider === 'azure-ad') {
        const existing = await prisma.user.findUnique({ where: { email: user.email }});
        if (existing && !existing.accounts?.some(a => a.provider === account.provider)) {
          await prisma.account.create({
            data: { userId: existing.id, provider: account.provider, ...account }
          });
        }
      }
      return true;
    },
    // JWT com tenant context
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = user.tenantId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.tenantId = token.tenantId;
      session.user.role = token.role;
      return session;
    }
  },
  events: {
    async createUser({ user }) {
      // JIT provisioning: novo usuário via Google — associa ao tenant por domínio de email
      const domain = user.email?.split('@')[1];
      const tenant = await prisma.tenant.findFirst({ where: { emailDomain: domain }});
      if (tenant) {
        await prisma.user.update({ where: { id: user.id }, data: { tenantId: tenant.id }});
      }
    }
  }
});
```

### SAML Provider
SAML é mais complexo (XML, assinaturas, certificates). Para SAML, usamos `@auth/saml-provider`:

```typescript
import { SAMLProvider } from '@auth/saml-provider';

SAMLProvider({
  id: 'saml',
  name: 'SAML SSO',
  entityId: 'https://orion.com/api/auth/saml/metadata',
  metadataUrl: process.env.SAML_IDP_METADATA_URL,  // cliente fornece
  wantAssertionsSigned: true,
  signatureAlgorithm: 'rsa-sha256',
  digestAlgorithm: 'sha256',
  // Mapping
  mapProfile: (profile) => ({
    email: profile.email,
    name: profile.name,
    role: profile.role  // do IdP attribute
  })
})
```

### Account Linking
Se usuário tem conta email/senha (joao@empresa.com) e depois loga com Google:
1. NextAuth vê email igual
2. Cria Account Google vinculada ao User existente
3. Próximos logins com Google ou email funcionam para mesmo usuário

### MFA (Multi-Factor Authentication)
- TOTP (Google Authenticator, Authy) via `otplib`
- SMS via Twilio (ver ADR-029)
- Obrigatório para admins e gerentes
- Opcional para vendedores (mas incentivado)

```typescript
// Após login bem-sucedido, se user.mfaEnabled:
if (user.mfaEnabled) {
  const valid = await verifyTOTP(user.mfaSecret, body.code);
  if (!valid) return rejectLogin('Invalid MFA code');
}
```

### Rate Limiting
- 5 tentativas falhas em 15 min → bloqueio 30 min
- 10 tentativas falhas em 1h → bloqueio 24h
- IP rate limit: 20 logins/h por IP
- Lockout alertado por email ao usuário

### Session Management
- Sessões JWT (stateless, escalar bem)
- Refresh token rotation (ver ADR-004)
- "Logout de todas as sessões" via invalidação de refresh tokens
- Lista de sessões ativas visível para usuário (devices, last seen)

### Password Policy
- Mínimo 8 caracteres
- Pelo menos 1 letra e 1 número
- Não permitir senhas vazadas (Have I Been Pwned API)
- Não permitir senhas comuns (top 10k)
- Force reset a cada 90 dias (opcional por plano)

### Account Recovery
- Reset por email (token JWT assinado, 1h validade)
- Reset por SMS (6-digit code, 10 min validade)
- Reset por admin (Enterprise: admin pode resetar senha de usuário)

## Consequências

### Positivas
- Múltiplos providers unificados
- JIT provisioning (sem admin manual)
- Account linking (experiência seamless)
- MFA para security
- Self-hosted (LGPD compliant)
- Type-safe (TypeScript)

### Negativas
- NextAuth.js v5 ainda em beta (mitigado: API estável)
- SAML é complexo de configurar por cliente (mitigado: wizard no admin)
- Account linking pode ter edge cases (mitigado: clara documentação)

## Alternativas Consideradas

1. **Auth0** — Rejeitado: caro em escala, SaaS (LGPD), menos controle
2. **Clerk** — Rejeitado: caro, SaaS, menos flexível
3. **Supabase Auth** — Rejeitado: vincula a Supabase stack (usamos Prisma, não Supabase)
4. **AWS Cognito** — Rejeitado: complexo, lock-in AWS, UX inferior
5. **Keycloak** — Rejeitado: pesado (Java), menos integrado a Next.js
6. **Custom (sem NextAuth)** — Rejeitado: reinventar roda, risco segurança

---

# Capítulo Final — Como Criar Novos ADRs

Quando tomar uma decisão arquitetural significativa:

1. **Crie arquivo:** `docs/decisions/ADR-XXX-titulo-curto.md`
2. **Siga o template** (Contexto, Decisão, Consequências, Alternativas)
3. **Marque status:** Proposed inicialmente
4. **Solicite review** de 2 arquitetos
5. **Após aprovação:** mude status para Accepted
6. **Se superseder:** crie novo ADR referenciando o anterior

### Quando criar ADR?
- Escolha de tecnologia significativa (framework, ORM, banco)
- Padrão arquitetural (multi-tenant strategy, auth strategy)
- Decisão de security/compliance
- Trade-off importante (performance vs. consistência, etc.)
- Escolha de provedor terceiro (SaaS, infra, monitoring)
- Estratégia de deployment
- Padrão de logging/observability
- Estratégia de testes
- Estratégia de cache, fila, comunicação real-time
- Política de versionamento

### Quando NÃO criar ADR?
- Decisões triviais (nome de variável, pasta)
- Escolha de biblioteca pequena (date-fns vs dayjs)
- Refatoração interna sem mudança de comportamento
- Bug fix (use PR description)
- Feature implementation (use specs)

### Template Padrão (Para Referência)

```markdown
# ADR-XXX — Título da Decisão

**Status:** Proposed | Accepted | Deprecated | Superseded
**Data:** YYYY-MM-DD
**Relacionado a:** ADR-YYY (se aplicável)

## Contexto
[Descreva o problema que motiva a decisão. Quais são as restrições, requisitos, forças em jogo?]

## Decisão
[O que foi decidido. Seja específico. Inclua detalhes de implementação se relevante.]

## Consequências

### Positivas
- [Benefício 1]
- [Benefício 2]

### Negativas
- [Trade-off 1 (com mitigação)]
- [Trade-off 2 (com mitigação)]

## Alternativas Consideradas
1. **[Opção A]** — [Por que rejeitada]
2. **[Opção B]** — [Por que rejeitada]

## Notas Operacionais (opcional)
[Considerações de operação, monitoramento, custos, etc.]
```

### Processo de Review

1. **Author cria ADR** como Proposed
2. **Solicita review** de:
   - 1 arquiteto sênior (foco técnico)
   - 1 tech lead de módulo impactado (foco impacto)
   - 1 dev ops (se infra/operacional)
3. **Discussão assíncrona** via PR comments
4. **Sync meeting** se houver discordância
5. **Após consenso:** muda status para Accepted
6. **ADR Accepted é imutável** — mudanças requerem novo ADR superseding

### Quando ADR é Superseded

- Tecnologia escolhida está em end-of-life
- Premissas do contexto mudaram significativamente
- Novo ADR resolve melhor o problema
- Vendor mudou pricing/feature em breaking way

Criar novo ADR com:
- Status `Accepted`
- Campo `Supersedes: ADR-XXX`
- ADR antigo muda para `Deprecated` com nota `Superseded by ADR-YYY`

### Index de ADRs por Categoria

| Categoria | ADRs |
|-----------|------|
| Stack/Framework | ADR-001, ADR-002, ADR-007 |
| Arquitetura | ADR-003, ADR-005, ADR-009, ADR-011 |
| Auth/Security | ADR-004, ADR-013, ADR-014, ADR-035 |
| Platform/Tooling | ADR-006, ADR-008, ADR-010 |
| Infra | ADR-012, ADR-018, ADR-026, ADR-027 |
| API/Contracts | ADR-015 |
| Real-time/Async | ADR-016, ADR-017, ADR-020 |
| Observability | ADR-021, ADR-022, ADR-023 |
| DevOps | ADR-025 |
| Communication | ADR-028, ADR-029, ADR-030 |
| Product/Experimentation | ADR-024, ADR-031, ADR-032 |
| Customer Facing | ADR-033, ADR-034 |
| Search | ADR-019 |

### Metric: ADR Velocity
- Meta: criar ADR para toda decisão significativa
- Anti-pattern: decisões importantes via Slack/DM
- Revisão trimestral: ADRs Proposed que nunca foram Accepted (tech debt de decisões)
- Métrica no dashboard: % de features com ADR referenciado
