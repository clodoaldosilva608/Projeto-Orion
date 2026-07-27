# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 12

# AI MODULE SPECIFICATION

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Especificação do Módulo de Inteligência Artificial
**Classificação:** Confidencial — Uso Interno
**Última revisão:** 2025-01-15

---

## Sumário

1. Objetivo e Princípios
2. Casos de Uso da IA
3. Arquitetura Técnica Detalhada
4. RAG Pipeline Completo
5. Prompt Engineering — Templates Prontos
6. Function Calling / Tool Use
7. Streaming Responses (SSE)
8. Cost Tracking Detalhado
9. Model Evaluation Framework
10. A/B Testing de Prompts
11. Hallucination Detection
12. Guardrails — Input/Output Filtering
13. Privacy — Data Minimization, PII Filtering
14. Fallback Strategies
15. Cache Strategies — Semantic Cache
16. Stack Técnica e Schema
17. Métricas e Monitoramento
18. Roadmap

---

# Capítulo 1 — Objetivo e Princípios

Este documento especifica o módulo de Inteligência Artificial do Projeto Orion, cobrindo arquitetura técnica detalhada, casos de uso, estratégia de modelos, prompt engineering, RAG (Retrieval-Augmented Generation), function calling, streaming, custos, privacidade, fallback, cache, avaliação de qualidade e roadmap.

## 1.1 Princípios

1. **Human-in-the-loop:** Toda ação sugerida requer aprovação humana. A IA nunca executa mutações no banco sem confirmação explícita do usuário.
2. **Explicabilidade:** Toda sugestão deve explicar o raciocínio e citar as fontes de dados (links para registros no Orion).
3. **Privacidade:** Dados do cliente nunca treinam modelos públicos. Dados sensíveis (PII) são filtrados antes do envio ao LLM.
4. **Custo transparente:** Cliente sabe quanto gastou com IA em tempo real. Limite configurável.
5. **Fallback gracioso:** Se IA falhar (provider down, timeout, erro), sistema continua operacional sem IA.
6. **Determinismo sob demanda:** Para relatórios formais, temperatura 0 e seed fixo garantem reproducibilidade.
7. **Auditável:** Todas as interações (pergunta, contexto, resposta, custo) são logadas.
8. **Não-discriminação:** Guardrails bloqueiam respostas discriminatórias ou enviesadas.

---

# Capítulo 2 — Casos de Uso da IA

## 2.1 Para Gestores

### 2.1.1 Insight Automático Diário
Gera resumo executivo diário às 8h (timezone da empresa) com:
- Faturamento do dia anterior vs. meta
- Top 3 vendedores e bottom 3
- Anomalias detectadas (queda > 20% em algum indicador)
- Recomendações de ação priorizadas

### 2.1.2 Previsão de Fechamento do Mês
Com base no histórico e tendência atual, prevê:
- Probabilidade de atingir meta mensal (com intervalo de confiança)
- Faturamento projetado
- Vendedores com maior risco de não atingir
- Cenários: otimista, realista, pessimista

### 2.1.3 Análise de Causa Raiz
Pergunta em linguagem natural: "Por que a Loja Centro vendeu menos esta semana?"
Resposta estruturada com fatores identificados, comparação com período anterior, vendedores específicos com queda e sugestões de correção.

### 2.1.4 Sugestão de Campanhas
Com base no histórico e calendário comercial, sugere campanhas sazonais, indicadores com potencial de melhoria e premiações recomendadas.

### 2.1.5 Relatório de Desempenho Narrativo
Em vez de apenas números, gera relatório em linguagem natural profissional.

## 2.2 Para Vendedores

### 2.2.1 Coach Pessoal
Análise individual com pontos fortes, pontos de melhoria, comparação com melhores vendedores similares e sugestões práticas.

### 2.2.2 Previsão de Meta Pessoal
"Com base no seu ritmo atual, você tem 78% de chance de atingir a meta. Para chegar a 100%, você precisa de R$ 2.340 em vendas nos próximos 7 dias."

### 2.2.3 Sugestão de Próximas Ações
Baseado no histórico do cliente (em integração futura com CRM).

## 2.3 Para Administradores

### 2.3.1 Análise de Configuração
Avalia se a configuração de indicadores e metas está saudável: indicadores redundantes, metas irreais (sempre <50% ou >200%), campanhas com baixa adesão.

### 2.3.2 Auditoria de Qualidade de Dados
Detecta registros inconsistentes (ex: meta sem indicador, resultado sem aprovação pendente há >30 dias).

---

# Capítulo 3 — Arquitetura Técnica Detalhada

## 3.1 Visão Geral de Componentes

```
┌────────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                              │
│   ┌─────────────────┐  ┌──────────────┐  ┌──────────────────┐     │
│   │ Chat IA Widget  │  │ Insight Cards│  │ Daily Brief Modal│     │
│   └────────┬────────┘  └──────┬───────┘  └────────┬─────────┘     │
└────────────┼──────────────────┼────────────────────┼──────────────┘
             │                  │                    │
             ▼                  ▼                    ▼
┌────────────────────────────────────────────────────────────────────┐
│              API Gateway (Next.js API Routes)                       │
│   Auth · Rate Limit · Tenant Isolation · Audit                     │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│                  AI Gateway (Service)                                │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐  │
│  │ Rate Limiter│  │ Cost Tracker │  │ Audit Log │  │  Router   │  │
│  └─────────────┘  └──────────────┘  └───────────┘  └─────┬─────┘  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐        │        │
│  │ Guardrails  │  │ PII Filter   │  │   Cache   │        │        │
│  │ (in/out)    │  │              │  │ (semantic)│        │        │
│  └─────────────┘  └──────────────┘  └───────────┘        │        │
└──────────────────────────────────────────────────────────┼────────┘
                                                            │
                  ┌─────────────────────────────────────────┼───┐
                  │                                         │   │
                  ▼                                         ▼   ▼
┌─────────────────────────┐               ┌──────────────────────────┐
│      RAG Engine         │               │     LLM Router           │
│  ┌───────────────────┐  │               │  ┌────────────────────┐  │
│  │ Query Embedding   │  │               │  │ Provider Selection │  │
│  │ (text-embed-3)    │  │               │  │ (cost, latency,    │  │
│  └─────────┬─────────┘  │               │  │  context size)     │  │
│            │            │               │  └─────────┬──────────┘  │
│  ┌─────────▼─────────┐  │               │            │             │
│  │ Vector Search     │  │               │  ┌─────────▼──────────┐  │
│  │ (pgvector + HNSW) │  │               │  │   Failover Chain   │  │
│  └─────────┬─────────┘  │               │  │  OpenAI → Claude   │  │
│            │            │               │  │  → Gemini → Local  │  │
│  ┌─────────▼─────────┐  │               │  └────────────────────┘  │
│  │ Reranker (cross-  │  │               └──────────────────────────┘
│  │ encoder)          │  │
│  └─────────┬─────────┘  │
│            │            │
│  ┌─────────▼─────────┐  │
│  │ Context Builder   │  │
│  └───────────────────┘  │
└─────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────────────────────┐
│              Prompt Builder (templates + context)                  │
│   ┌────────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│   │ Template Engine│  │ Few-Shot Lib │  │ Tool Definitions   │    │
│   └────────────────┘  └──────────────┘  └────────────────────┘    │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│    OpenAI    │    │    Anthropic     │    │    Google    │
│  GPT-4o/mini │    │ Claude 3.5/3.7   │    │ Gemini 1.5   │
└──────────────┘    └──────────────────┘    └──────────────┘
```

## 3.2 AI Gateway

Camada de orquestração responsável por:

- **Rate limiting:** limite de requests por usuário/empresa (token bucket)
- **Controle de custo:** tracking de tokens e $$ gastos em tempo real
- **Audit log:** todas as interações registradas (pergunta, contexto, resposta, custo)
- **Fallback:** se um provedor cair, usa outro (com re-tentativa exponencial)
- **Cache:** respostas idênticas são cacheadas (semantic cache, TTL 1h)
- **Guardrails:** filtros de input (PII, prompt injection) e output (conteúdo inapropriado)
- **Routing:** seleciona modelo baseado em custo, latência, janela de contexto

## 3.3 Diagrama de Sequência — Chat IA

```
User            Frontend         API Gateway        AI Gateway         RAG          LLM
 │                 │                  │                  │              │              │
 │ 1. Pergunta     │                  │                  │              │              │
 ├────────────────>│                  │                  │              │              │
 │                 │ 2. POST /chat    │                  │              │              │
 │                 ├─────────────────>│                  │              │              │
 │                 │                  │ 3. Auth+RL+Audit │              │              │
 │                 │                  ├─────────────────>│              │              │
 │                 │                  │                  │ 4. Check cache             │
 │                 │                  │                  │  (semantic)  │              │
 │                 │                  │                  │ 5. PII filter               │
 │                 │                  │                  ├──────────────>│              │
 │                 │                  │                  │              │ 6. Embed     │
 │                 │                  │                  │              │   query      │
 │                 │                  │                  │              │ 7. Vector    │
 │                 │                  │                  │              │   search    │
 │                 │                  │                  │<─────────────┤              │
 │                 │                  │                  │ 8. Build prompt             │
 │                 │                  │                  │ 9. Call LLM  │              │
 │                 │                  │                  ├─────────────────────────────>│
 │                 │                  │                  │              │              │ 10. Stream
 │                 │                  │                  │              │              │     tokens
 │                 │                  │                  │<─────────────────────────────┤
 │                 │                  │                  │ 11. Output filter           │
 │                 │                  │                  │ 12. Cost track              │
 │                 │                  │                  │ 13. Audit                   │
 │                 │                  │                  │ 14. SSE stream              │
 │                 │                  │<─────────────────┤              │              │
 │                 │ 15. SSE chunks   │                  │              │              │
 │                 │<─────────────────┤                  │              │              │
 │ 16. Render      │                  │                  │              │              │
 │<────────────────┤                  │                  │              │              │
```

## 3.4 Componentes Detalhados

### 3.4.1 Frontend
- **Chat Widget:** interface conversacional com histórico, syntax highlighting para código, copy buttons, feedback (👍/👎)
- **Insight Cards:** cards não conversacionais com insights automáticos (anomalias, sugestões)
- **Daily Brief Modal:** resumo executivo matinal com ações recomendadas

### 3.4.2 API Gateway (Orion API)
- Rotas: `/api/ai/chat`, `/api/ai/insights/daily`, `/api/ai/insights/anomaly`, `/api/ai/forecast`
- Auth via JWT (mesmo do restante do app)
- Rate limiting específico para IA
- Audit log: registra quem perguntou o quê

### 3.4.3 AI Gateway (serviço dedicado)
- Microserviço Node.js (NestJS) ou função Lambda
- Isolado em subnet privada
- Acesso a: OpenAI/Anthropic APIs, pgvector (RAG), Redis (cache), KMS (PII)

### 3.4.4 RAG Engine
- Embeddings: OpenAI text-embedding-3-small (1536 dims)
- Vector store: pgvector com índice HNSW
- Reranker: cross-encoder (BGE-reranker-large ou Cohere Rerank)
- Chunking strategies por tipo de documento

### 3.4.5 LLM Router
- Roteia para o modelo mais adequado por tipo de task
- Failover chain: OpenAI → Anthropic → Gemini → Local (Ollama)
- Cost tracking por provider

### 3.4.6 Prompt Builder
- Templates versionados em `prompts/` diretório do repo
- Variáveis injetadas via handlebars
- Few-shot examples library

## 3.5 Deploy da IA por Edição

| Edição | IA |
|---|---|
| Local (Electron standalone) | Opcional — usa LLM via API key do cliente (OpenAI/Anthropic) |
| On-Premise | IA habilitada, usa cloud LLM (privacy concerns = opcional local LLM via Ollama) |
| Cloud SaaS | IA habilitada por padrão, opt-in por empresa |

---

# Capítulo 4 — RAG Pipeline Completo

RAG (Retrieval-Augmented Generation) é o coração da IA do Orion: permite que respostas sejam baseadas em dados reais do cliente, sem treinar modelo com dados privados.

## 4.1 Visão Geral do Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Source     │────>│  Chunking   │────>│  Embedding  │────>│   Vector    │
│  Data       │     │  Strategy   │     │  (1536 dim) │     │   Store     │
│             │     │             │     │             │     │ (pgvector)  │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                     │
                                                                     ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Query     │────>│   Query     │────>│  Vector     │────>│   Rerank    │
│  (user)     │     │  Embedding  │     │  Search     │     │  (cross-enc)│
└─────────────┘     └─────────────┘     │  (top-K)    │     └──────┬──────┘
                                        └─────────────┘            │
                                                                   ▼
                                                          ┌─────────────┐
                                                          │   Context   │
                                                          │   Builder   │
                                                          └──────┬──────┘
                                                                 │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │   Prompt    │
                                                          │   + LLM     │
                                                          └─────────────┘
```

## 4.2 Source Data (Dados Indexados)

| Entidade | Conteúdo Indexado | Freq. Atualização |
|---|---|---|
| `goals` | Nome, valor, período, filial, vendedor | On create/update |
| `results` | Valor, indicador, período, status | On create/approve |
| `campaigns` | Nome, descrição, indicador, período | On create/update |
| `indicators` | Nome, descrição, fórmula | On create/update |
| `rankings` | Posição, score, período | Diário (job) |
| `branches` | Nome, localização | On create/update |
| `users` (anon) | Nome anonimizado, cargo, filial | On create/update |
| `notifications_templates` | Assunto, corpo | On create/update |
| `audit_logs` (sumarizado) | Estatísticas diárias | Diário (job) |

## 4.3 Chunking Strategy

### 4.3.1 Por Tipo de Dado

**Resultados numéricos (results, goals):** cada registro vira um "chunk" completo com metadata:
```json
{
  "id": "result_42",
  "content": "Resultado do indicador 'Faturamento' da Loja Centro em agosto/2025: R$ 145.230 (meta: R$ 150.000, atingimento: 96.8%). Status: aprovado. Vendedor: USER_5.",
  "metadata": {
    "entityType": "result",
    "entityId": 42,
    "companyId": 1,
    "branchId": 1,
    "indicatorId": 3,
    "userId": 5,
    "period": "2025-08",
    "value": 145230,
    "target": 150000,
    "achievement": 0.968
  }
}
```

**Documentos longos (políticas, manuais):** chunking recursivo:
- Chunk size: 512 tokens
- Overlap: 64 tokens (12.5%)
- Split by: paragraph → sentence → word

```typescript
// src/lib/ai/chunking.ts
import { encode } from 'gpt-tokenizer';

export function chunkDocument(text: string, opts: {
  maxTokens?: number;
  overlapTokens?: number;
} = {}): string[] {
  const maxTokens = opts.maxTokens ?? 512;
  const overlap = opts.overlapTokens ?? 64;

  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current: string[] = [];
  let currentTokens = 0;

  for (const para of paragraphs) {
    const paraTokens = encode(para).length;

    if (paraTokens > maxTokens) {
      // Flush current
      if (current.length) {
        chunks.push(current.join('\n\n'));
        current = [];
        currentTokens = 0;
      }
      // Split paragraph by sentences
      const sentences = para.match(/[^.!?]+[.!?]+/g) ?? [para];
      let sentenceChunk: string[] = [];
      let sentenceTokens = 0;
      for (const s of sentences) {
        const sTokens = encode(s).length;
        if (sentenceTokens + sTokens > maxTokens && sentenceChunk.length) {
          chunks.push(sentenceChunk.join(' '));
          // Keep last sentence for overlap
          sentenceChunk = [sentenceChunk[sentenceChunk.length - 1]];
          sentenceTokens = encode(sentenceChunk[0]).length;
        }
        sentenceChunk.push(s);
        sentenceTokens += sTokens;
      }
      if (sentenceChunk.length) chunks.push(sentenceChunk.join(' '));
    } else if (currentTokens + paraTokens > maxTokens && current.length) {
      chunks.push(current.join('\n\n'));
      // Keep last paragraph for overlap
      const last = current[current.length - 1];
      current = [last];
      currentTokens = encode(last).length;
      current.push(para);
      currentTokens += paraTokens;
    } else {
      current.push(para);
      currentTokens += paraTokens;
    }
  }
  if (current.length) chunks.push(current.join('\n\n'));
  return chunks;
}
```

## 4.4 Embedding Generation

```typescript
// src/lib/ai/embeddings.ts
import OpenAI from 'openai';
import { chunkDocument } from './chunking';

const openai = new OpenAI();
const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIMS = 1536;

export async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBED_MODEL,
    input: text,
    dimensions: EMBED_DIMS,
  });
  return response.data[0].embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  // OpenAI suporta até 2048 inputs por request
  const batchSize = 256;
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: EMBED_MODEL,
      input: batch,
      dimensions: EMBED_DIMS,
    });
    results.push(...response.data.map(d => d.embedding));
  }
  return results;
}

export async function indexDocument(doc: {
  entityType: string;
  entityId: number;
  companyId: number;
  content: string;
  metadata: Record<string, any>;
}) {
  const chunks = chunkDocument(doc.content);
  const embeddings = await embedBatch(chunks);

  await db.aiEmbedding.createMany({
    data: chunks.map((chunk, i) => ({
      companyId: doc.companyId,
      entityType: doc.entityType,
      entityId: doc.entityId,
      chunkIndex: i,
      chunkText: chunk,
      embedding: embeddings[i],
      metadata: doc.metadata,
    })),
  });
}
```

## 4.5 Vector Store (pgvector)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE ai_embeddings (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  chunk_text TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índice HNSW para busca aproximada rápida (recall 95% + latência baixa)
CREATE INDEX ai_embeddings_vector_idx ON ai_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Filtro por tenant (RLS + índice)
CREATE INDEX ai_embeddings_company_entity_idx ON ai_embeddings(company_id, entity_type, entity_id);

ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ai_embeddings
  USING (company_id = current_setting('app.current_company_id', true)::bigint);
```

## 4.6 Retrieval (Busca)

```typescript
// src/lib/ai/rag.ts
export async function retrieveContext(
  query: string,
  opts: {
    companyId: number;
    topK?: number;
    filter?: Record<string, any>;
    rerank?: boolean;
  }
): Promise<RetrievedChunk[]> {
  const topK = opts.topK ?? 20; // retrieve mais para rerank

  // 1. Embedd query
  const queryEmbedding = await embedText(query);

  // 2. Vector search com filtros
  // Seta contexto do tenant
  await db.$executeRaw`SET LOCAL app.current_company_id = ${opts.companyId.toString()}`;

  const candidates = await db.$queryRaw<RetrievedChunk[]>`
    SELECT
      id, entity_type, entity_id, chunk_index, chunk_text, metadata,
      1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as score
    FROM ai_embeddings
    WHERE 1=1
      ${opts.filter?.entityType ? Prisma.sql`AND entity_type = ${opts.filter.entityType}` : Prisma.empty}
      ${opts.filter?.period ? Prisma.sql`AND metadata->>'period' = ${opts.filter.period}` : Prisma.empty}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${topK}
  `;

  if (!opts.rerank) {
    return candidates.slice(0, 10);
  }

  // 3. Rerank com cross-encoder (melhora precision)
  const reranked = await rerankWithCrossEncoder(query, candidates.map(c => c.chunkText));
  return reranked.slice(0, 10).map(idx => candidates[idx]);
}

async function rerankWithCrossEncoder(query: string, docs: string[]): Promise<number[]> {
  // Usa BGE-reranker-large local ou Cohere Rerank API
  const response = await fetch('https://api.cohere.ai/v1/rerank', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.COHERE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'rerank-multilingual-v3.0',
      query,
      documents: docs,
      top_n: docs.length,
    }),
  });
  const data = await response.json();
  return data.results.map((r: any) => r.index);
}
```

## 4.7 Context Builder

Após retrieval, contexto é estruturado e truncado para caber no budget de tokens:

```typescript
// src/lib/ai/context-builder.ts
import { encode } from 'gpt-tokenizer';

const MAX_CONTEXT_TOKENS = 6000; // deixa ~2000 para resposta + overhead

export function buildContext(chunks: RetrievedChunk[], opts: {
  systemPrompt: string;
  userQuery: string;
  conversationHistory?: { role: string; content: string }[];
}): { system: string; context: string; truncated: boolean } {
  const systemTokens = encode(opts.systemPrompt).length;
  const historyTokens = opts.conversationHistory
    ? opts.conversationHistory.reduce((s, m) => s + encode(m.content).length, 0)
    : 0;
  const queryTokens = encode(opts.userQuery).length;
  const availableForContext = MAX_CONTEXT_TOKENS - systemTokens - historyTokens - queryTokens - 500;

  let used = 0;
  const included: RetrievedChunk[] = [];
  for (const chunk of chunks) {
    const t = encode(chunk.chunkText).length;
    if (used + t > availableForContext) break;
    included.push(chunk);
    used += t;
  }

  const contextBlock = included
    .map((c, i) => `[${i + 1}] (${c.entityType} #${c.entityId}) ${c.chunkText}`)
    .join('\n\n');

  return {
    system: opts.systemPrompt,
    context: contextBlock,
    truncated: included.length < chunks.length,
  };
}
```

## 4.8 Indexação Incremental

Quando um registro é atualizado, seus embeddings são re-gerados:

```typescript
// src/lib/db/middleware/ai-indexing.ts
prisma.$use(async (params, next) => {
  const result = await next(params);

  const indexedModels = ['Goal', 'Result', 'Campaign', 'Indicator'];
  if (['create', 'update', 'delete'].includes(params.action) && indexedModels.includes(params.model)) {
    await indexQueue.add('reindex', {
      model: params.model,
      id: result?.id ?? params.args.where?.id,
      action: params.action,
      companyId: result?.companyId,
    }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });
  }

  return result;
});

async function reindexEntity(model: string, id: number, companyId: number) {
  // Apaga embeddings antigos
  await db.aiEmbedding.deleteMany({
    where: { entityType: model.toLowerCase(), entityId: id, companyId },
  });

  // Busca registro
  const record = await db[model.toLowerCase()].findUnique({ where: { id } });
  if (!record) return;

  // Gera texto a ser indexado
  const content = serializeForRAG(record);

  // Re-cria embeddings
  await indexDocument({
    entityType: model.toLowerCase(),
    entityId: id,
    companyId,
    content,
    metadata: extractMetadata(record),
  });
}
```

## 4.9 Avaliação do RAG

Métricas automáticas (mensais):
- **Recall@10:** % de queries onde a fonte correta está nos top-10 recuperados (test set manual de 200 queries)
- **Precision@5:** % dos top-5 chunks que são relevantes
- **MRR (Mean Reciprocal Rank):** posição média da fonte correta
- **Latência p50/p95:** tempo de retrieval
- **Custo:** $$ em embeddings por mês

---

# Capítulo 5 — Prompt Engineering — Templates Prontos

## 5.1 Estrutura Padrão

Todo prompt segue a estrutura:

```
[SYSTEM] — Define identidade, regras, formato de saída
[CONTEXT] — Dados do tenant, usuário, permissões
[RETRIEVED CONTEXT] — Chunks do RAG (com citações)
[CONVERSATION HISTORY] — Mensagens anteriores (se aplicável)
[USER] — Pergunta atual
[ASSISTANT] — (esperando resposta)
```

## 5.2 Templates por Tipo de Query

### Template 1 — Análise de Causa Raiz (Root Cause Analysis)

```yaml
id: tpl_root_cause_analysis
version: 1.2
model: gpt-4o
temperature: 0.3
max_tokens: 1500
system: |
  Você é o assistente de IA do Orion, plataforma de gestão comercial.
  Sua função é ajudar gestores a identificar causas raiz de problemas de performance.

  REGRAS:
  1. Sempre baseie respostas nos dados fornecidos em [RETRIEVED CONTEXT]
  2. Cite cada afirmação com [n] referenciando o número do chunk
  3. Se não houver dados suficientes, diga "Não tenho dados suficientes para responder completamente"
  4. Nunca invente números
  5. Seja conciso e direto (máx 500 palavras)
  6. Sugira ações práticas, não tome decisões

  FORMATO DE SAÍDA (Markdown):
  ## Diagnóstico
  [2-3 frases resumindo o problema]

  ## Fatores Identificados
  1. **[Fator 1]** — [evidência com citação [n]]
  2. **[Fator 2]** — [evidência com citação [n]]
  ...

  ## Recomendações
  - [Ação 1] (impacto esperado: alto/médio/baixo)
  - [Ação 2] ...
  - [Ação 3] ...

  ## Próximos Passos
  1. [Passo imediato]
  2. [Passo 7 dias]
  3. [Passo 30 dias]

  ## Fontes
  - [1] Orion [entity_type] #[entity_id]
  - [2] ...
context: |
  Empresa: {companyName} (ID: {companyId})
  Período analisado: {period}
  Usuário: {userName}, {userRole}
  Filial: {branchName}
retrieved_context: |
  {contextBlock}
user: |
  {userQuery}
```

### Template 2 — Previsão de Meta (Forecasting)

```yaml
id: tpl_forecast_goal
version: 1.0
model: gpt-4o
temperature: 0.2
max_tokens: 800
system: |
  Você é um analista de dados do Orion. Sua função é projetar atingimento de metas.

  REGRAS:
  1. Use regressão linear simples sobre o histórico disponível
  2. Calcule intervalo de confiança de 80% (média ± 1.28 * desvio padrão)
  3. Apresente 3 cenários: pessimista (P20), realista (P50), otimista (P80)
  4. Considere sazonalidade se houver dados de 12+ meses
  5. Cite fontes [n] para cada número
  6. Em hipótese alguma invente dados; se histórico < 3 meses, declare incerteza

  FORMATO:
  ## Projeção de Meta — {period}

  ### Cenário Realista (P50)
  - Faturamento projetado: R$ X (atingimento: Y%)
  - Probabilidade de atingir meta: Z%

  ### Cenário Pessimista (P20)
  ...

  ### Cenário Otimista (P80)
  ...

  ### Fatores que podem alterar a projeção
  - ...

  ### Histórico utilizado (últimos N meses)
  | Mês | Valor | Meta | Ating. |
  ...

  ### Aviso
  Esta projeção é estatística e não considera eventos extraordinários.
```

### Template 3 — Relatório Narrativo de Desempenho

```yaml
id: tpl_narrative_report
version: 1.3
model: claude-3-5-sonnet
temperature: 0.4
max_tokens: 2500
system: |
  Você é um consultor de gestão comercial do Orion. Gere relatório executivo em linguagem natural.

  TOM: profissional, direto, baseado em dados. Sem jargão excessivo.
  AUDIÊNCIA: diretores e gerentes.

  ESTRUTURA:
  # Relatório de Desempenho — {period}
  ## Resumo Executivo (3 frases máx)
  ## Destaques Positivos (3-5 bullets com números)
  ## Pontos de Atenção (3-5 bullets)
  ## Análise por Filial (tabela + 1 parágrafo por filial)
  ## Top 5 Vendedores (tabela + comentário)
  ## Bottom 5 Vendedores (tabela + recomendação de ação)
  ## Indicadores Críticos (variação > 10% em qualquer direção)
  ## Recomendações Estratégicas (3 bullets acionáveis)

  REGRAS:
  - Todo número deve ter fonte [n]
  - Comparações sempre com período anterior e mesmo período ano anterior
  - Não fazer recomendações de demissão/contratação
```

### Template 4 — Coach Pessoal de Vendas

```yaml
id: tpl_personal_coach
version: 1.1
model: gpt-4o-mini
temperature: 0.6
max_tokens: 600
system: |
  Você é o coach pessoal de vendas do Orion. Sua função é ajudar o vendedor a melhorar.

  TOM: encorajador, específico, baseado em dados, nunca punitivo.
  AUDIÊNCIA: vendedor individual.

  ESTRUTURA:
  ## Seu Desempenho — {period}
  ### Pontos Fortes
  - [Específico com número]
  ### Oportunidades de Melhoria
  - [Específico com sugestão prática]
  ### Comparação com Top Performers
  - [Vendedor similar que se destaca em X]
  ### Ações para esta semana
  1. [Ação específica, mensurável]
  2. ...
  3. ...

  REGRAS:
  - Nunca compare com vendedor nominalmente (use "vendedor top do seu perfil")
  - Foco em comportamentos, não personalidade
  - Sugestões práticas (não "seja mais proativo")
```

### Template 5 — Detecção de Anomalia

```yaml
id: tpl_anomaly_detection
version: 1.0
model: gpt-4o-mini
temperature: 0.1
max_tokens: 400
system: |
  Você é um detector de anomalias do Orion. Identifique padrões incomuns nos dados.

  DEFINIÇÃO DE ANOMALIA:
  - Variação > 20% vs média móvel 30 dias
  - Quebra de padrão sazonal
  - Outlier estatístico (z-score > 2)
  - Comportamento atípico por filial/vendedor

  FORMATO (JSON estrito):
  {
    "anomalies": [
      {
        "type": "drop|spike|outlier|break_pattern",
        "severity": "low|medium|high",
        "metric": "string",
        "entity": "string (filial/vendedor/empresa)",
        "expected": number,
        "actual": number,
        "deviation_pct": number,
        "explanation": "string (1 frase)",
        "recommendation": "string (1 ação)"
      }
    ]
  }

  Regras: máximo 5 anomalias. Ordene por severidade desc.
```

### Template 6 — Sugestão de Campanha

```yaml
id: tpl_campaign_suggestion
version: 1.0
model: gpt-4o
temperature: 0.7
max_tokens: 1000
system: |
  Você é um estrategista comercial do Orion. Sugira campanhas de incentivo.

  CONTEXTO CALENDÁRIO (eventos próximos):
  {calendarEvents}

  FORMATO:
  ## Campanhas Sugeridas — Próximos 30 dias
  ### 1. [Nome da campanha]
  - **Período:** DD/MM a DD/MM
  - **Indicador alvo:** [escolher entre os existentes]
  - **Premiação sugerida:** [valor em R$ ou tipo]
  - **Público:** [cargo(s) / filial(is)]
  - **Justificativa:** [2 frases com base em dados]
  - **Meta sugerida:** [número]
  ...
```

### Template 7 — Análise de Configuração (Admin)

```yaml
id: tpl_admin_config_review
version: 1.0
model: gpt-4o
temperature: 0.3
max_tokens: 1500
system: |
  Você é um auditor de configuração do Orion. Avalie a saúde da configuração da empresa.

  FORMATO (Markdown):
  ## Auditoria de Configuração — {companyName}

  ### Indicadores
  - [✓/⚠/✗] Total: N indicadores configurados
  - [⚠] Indicadores sem resultados há 30+ dias: [lista]
  - [✗] Indicadores duplicados (mesma fórmula): [lista]

  ### Metas
  - [✓/⚠/✗] Distribuição por filial
  - [⚠] Metas nunca atingidas (< 50% consistentemente): [lista]
  - [⚠] Metas sempre ultrapassadas (> 200%): [lista — possíveis metas baixas]

  ### Campanhas
  - [✓/⚠/✗] Campanhas ativas: N
  - [⚠] Campanhas com < 30% de adesão: [lista]

  ### Recomendações
  1. [Ação prioritária]
  2. ...
```

### Template 8 — Tradução de Query Natural para SQL (Read-Only)

```yaml
id: tpl_nl_to_sql
version: 1.0
model: gpt-4o
temperature: 0.0
max_tokens: 800
system: |
  Você é um tradutor de linguagem natural para SQL. Use o schema fornecido.

  SCHEMA (somente leitura):
  {schemaDescription}

  REGRAS:
  1. Gere apenas SELECT statements (jamais INSERT/UPDATE/DELETE)
  2. SEMPRE inclua `WHERE company_id = :companyId`
  3. Use parâmetros nomeados (:paramName) para valores
  4. Limite resultados com LIMIT 1000 por padrão
  5. Se query não for clara, retorne: "CLARIFY: [pergunta]"

  FORMATO:
  ```sql
  -- [explicação curta]
  SELECT ...
  ```
```

### Template 9 — Resumo de Conversa (Conversation Summary)

```yaml
id: tpl_conversation_summary
version: 1.0
model: gpt-4o-mini
temperature: 0.2
max_tokens: 200
system: |
  Gere um título curto (máx 60 chars) e resumo (máx 150 chars) para a conversa.

  FORMATO JSON:
  { "title": "...", "summary": "..." }
```

### Template 10 — Explicação de Indicador

```yaml
id: tpl_explain_indicator
version: 1.0
model: gpt-4o-mini
temperature: 0.4
max_tokens: 400
system: |
  Explique o que significa o indicador, como é calculado, e o que afeta o valor.

  INDICADOR:
  - Nome: {name}
  - Fórmula: {formula}
  - Unidade: {unit}
  - Categoria: {category}

  FORMATO (Markdown):
  ## {name}
  **O que é:** [1-2 frases]
  **Como é calculado:** [fórmula em linguagem natural]
  **O que afeta:** [3-5 bullets]
  **Benchmark típico:** [intervalo se conhecido]
```

### Template 11 — Boas-vindas IA (Onboarding)

```yaml
id: tpl_ai_onboarding
version: 1.0
model: gpt-4o-mini
temperature: 0.7
max_tokens: 300
system: |
  Mensagem de boas-vindas ao usuário que acabou de ativar a IA. Personalize com dados do tenant.
  TOM: amigável, não excessivamente formal. 3-4 frases.
```

### Template 12 — Análise de Equipe (Team Analysis)

```yaml
id: tpl_team_analysis
version: 1.0
model: gpt-4o
temperature: 0.4
max_tokens: 1500
system: |
  Analise a composição da equipe e identifique gaps de performance.

  FORMATO:
  ## Análise da Equipe — {branchName}
  ### Distribuição de Performance
  - Top performers (top 20%): [n] vendedores
  - Mid performers: [n]
  - Bottom performers: [n]

  ### Padrões Identificados
  - [cluster de vendedores com característica comum]

  ### Recomendações de Distribuição
  - [reorganização de equipes, se aplicável]
  - [pareamento mentor/aprendiz]
```

### Template 13 — Comparação entre Filiais

```yaml
id: tpl_branch_comparison
version: 1.0
model: gpt-4o
temperature: 0.3
max_tokens: 1200
system: |
  Compare o desempenho de 2+ filiais. Identifique melhores práticas e gaps.

  FORMATO:
  ## Comparativo de Filiais
  ### Visão Geral
  | Filial | Faturamento | Meta | Ating. | Top Vendedor |

  ### Análise Comparativa
  - [Aspecto onde filial A supera B]
  - [Aspecto onde filial B supera A]

  ### Melhores Práticas Identificadas
  - [Na filial X, observar Y que pode ser replicado]

  ### Gaps
  - [Na filial X, gap em Y comparado a B]
```

### Template 14 — Análise Sazonal

```yaml
id: tpl_seasonality_analysis
version: 1.0
model: gpt-4o
temperature: 0.3
max_tokens: 1000
system: |
  Analise padrões sazonais dos últimos 24 meses. Identifique picos, vales e ciclos.
  Requer ≥ 18 meses de dados.

  FORMATO:
  ## Análise de Sazonalidade
  ### Padrões Identificados
  - [Ciclo mensal/trimestral/anual]

  ### Meses de Pico
  - [mês] — média histórica: R$ X

  ### Meses de Vale
  - [mês] — média histórica: R$ Y

  ### Recomendações de Planejamento
  - [Ajuste de metas considerando sazonalidade]
```

### Template 15 — Justificativa de Ação Recomendada

```yaml
id: tpl_action_justification
version: 1.0
model: gpt-4o-mini
temperature: 0.2
max_tokens: 300
system: |
  Dada uma ação recomendada, gere justificativa executiva curta.

  FORMATO:
  **Ação:** [descrição]
  **Por quê:** [1 frase com dado]
  **Impacto esperado:** [métrica + variação]
  **Risco se não fizer:** [1 frase]
  **Custo estimado:** [se aplicável]
```

### Template 16 — Detecção de Inconsistência de Dados

```yaml
id: tpl_data_quality_check
version: 1.0
model: gpt-4o-mini
temperature: 0.1
max_tokens: 500
system: |
  Detecte inconsistências nos dados. Retorne JSON.
  FORMATO:
  { "issues": [
    { "type": "missing|duplicate|outlier|inconsistent",
      "entity": "...", "id": ..., "description": "..." }
  ]}
```

### Template 17 — Geração de Mensagem Motivacional

```yaml
id: tpl_motivational_message
version: 1.0
model: gpt-4o-mini
temperature: 0.8
max_tokens: 150
system: |
  Gere mensagem motivacional curta (max 100 chars) para vendedor baseada em desempenho.
  TOM: encorajador, específico, sem piegas.
```

### Template 18 — Análise de Conversão de Funil

```yaml
id: tpl_funnel_analysis
version: 1.0
model: gpt-4o
temperature: 0.4
max_tokens: 800
system: |
  Analise funil de vendas (se integração CRM disponível).
  FORMATO:
  ## Análise de Funil
  ### Etapas e Conversão
  | Etapa | Volume | Conversão | Tempo Médio |
  ### Gargalos Identificados
  - [etapa com menor conversão]
  ### Recomendações
```

### Template 19 — Resposta a Pergunta Frente a Falta de Dados

```yaml
id: tpl_insufficient_data
version: 1.0
model: gpt-4o-mini
temperature: 0.3
max_tokens: 200
system: |
  Responda educadamente que não há dados suficientes, explicando o que faltaria e como o usuário pode obter (configurar indicador, esperar X dias, etc).
```

### Template 20 — Sumarização de Documento Longo (Política, Manual)

```yaml
id: tpl_doc_summary
version: 1.0
model: claude-3-5-sonnet
temperature: 0.2
max_tokens: 600
system: |
  Resuma o documento em no máximo 5 bullets. Use linguagem acessível (não técnica).
```

## 5.3 Versionamento de Templates

- Templates versionados em Git (`prompts/v1.2/`)
- Cada mudança cria nova versão (semver)
- A/B testing compara versões (Capítulo 10)
- Histórico de versões preservado para auditoria

---

# Capítulo 6 — Function Calling / Tool Use

IA pode chamar "ferramentas" (tools) para obter dados dinâmicos que não estão no RAG (ex: cotação de moeda, cálculo de comissão, lookup em tempo real).

## 6.1 Ferramentas Disponíveis

```typescript
// src/lib/ai/tools.ts
import { tool } from 'ai';
import { z } from 'zod';

export const tools = {
  get_current_period_results: tool({
    description: 'Obtém resultados atualizados do período atual (mês em andamento) para um indicador ou filial específica. Use quando precisar de dados em tempo real não presentes no contexto.',
    parameters: z.object({
      indicatorId: z.number().optional().describe('ID do indicador. Se omitido, retorna todos.'),
      branchId: z.number().optional().describe('ID da filial. Se omitido, retorna todas.'),
      period: z.string().describe('Período no formato YYYY-MM'),
    }),
    execute: async ({ indicatorId, branchId, period }, { user }) => {
      const results = await db.result.findMany({
        where: {
          companyId: user.companyId,
          period,
          ...(indicatorId && { indicatorId }),
          ...(branchId && { branchId }),
        },
        include: { indicator: true, branch: true },
      });
      return results.map(r => ({
        indicator: r.indicator.name,
        branch: r.branch.name,
        value: r.value,
        target: r.target,
        achievement: r.achievement,
      }));
    },
  }),

  calculate_commission: tool({
    description: 'Calcula comissão estimada para um vendedor dado atingimento de meta. Útil quando pergunta envolve comissões.',
    parameters: z.object({
      userId: z.number(),
      period: z.string(),
    }),
    execute: async ({ userId, period }, { user }) => {
      // Verifica permissão: vendedor só pode ver própria comissão
      if (user.role === 'vendedor' && user.id !== userId) {
        throw new Error('Unauthorized: cannot calculate commission for other users');
      }
      const commission = await commissionService.calculate(userId, period);
      return commission;
    },
  }),

  create_goal_draft: tool({
    description: 'Cria um RASCUNHO de meta (não publicado) para o usuário revisar e aprovar. Não aplica mudanças no banco sem confirmação.',
    parameters: z.object({
      indicatorId: z.number(),
      branchId: z.number(),
      period: z.string(),
      targetValue: z.number(),
    }),
    execute: async (params, { user }) => {
      // Não cria no banco — retorna estrutura para usuário confirmar
      return {
        draftId: randomUUID(),
        type: 'goal_draft',
        ...params,
        requiresConfirmation: true,
        confirmationUrl: `/goals/drafts/${draftId}/review`,
      };
    },
  }),

  get_ranking: tool({
    description: 'Obtém ranking atual de vendedores por filial ou empresa.',
    parameters: z.object({
      period: z.string(),
      branchId: z.number().optional(),
      limit: z.number().default(10),
    }),
    execute: async ({ period, branchId, limit }, { user }) => {
      const rankings = await rankingService.get({
        companyId: user.companyId,
        period,
        branchId,
        limit,
      });
      // Anonimiza nomes se usuário não tem permissão
      if (user.role === 'vendedor') {
        return rankings.map((r, i) => ({ position: i + 1, achievement: r.achievement }));
      }
      return rankings;
    },
  }),

  export_results_csv: tool({
    description: 'Exporta resultados em CSV. Retorna URL de download temporária (válida 24h).',
    parameters: z.object({
      period: z.string(),
      indicatorId: z.number().optional(),
    }),
    execute: async (params, { user }) => {
      if (!user.permissions.includes('results.export')) {
        throw new Error('Forbidden: no results.export permission');
      }
      const url = await exportService.exportCSV({ ...params, companyId: user.companyId });
      return { downloadUrl: url, expiresInHours: 24 };
    },
  }),
};
```

## 6.2 Loop de Function Calling

```
User: "Quanto vou ganhar de comissão este mês?"

LLM: { tool_call: { name: "calculate_commission", args: { userId: 5, period: "2025-08" } } }

Orion: { tool_result: { baseSalary: 2500, commission: 1850, total: 4350 } }

LLM: "Sua comissão estimada para agosto/2025 é R$ 1.850, totalizando R$ 4.350 (salário + comissão).
      Esse valor considera seu atingimento atual de 92% da meta."
```

## 6.3 Segurança em Tool Use

- Tools validam permissões (RBAC) antes de executar
- Tools que causam mutação (create/update/delete) retornam `requiresConfirmation: true` — não executam sem click do usuário
- Tools sandboxed (sem acesso a filesystem, env vars)
- Resultados passam por PII filter antes de voltar ao LLM
- Rate limiting por tool

---

# Capítulo 7 — Streaming Responses (SSE)

Streaming melhora UX: usuário vê tokens sendo gerados em tempo real (latência percebida baixa).

## 7.1 Protocolo SSE (Server-Sent Events)

### 7.1.1 Endpoint

```typescript
// src/api/routes/ai/chat.ts
import { Router } from 'express';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { authenticate } from '../../middleware/auth';
import { rateLimitMiddleware } from '../../middleware/rate-limit';

const router = Router();

router.post('/chat',
  authenticate,
  rateLimitMiddleware({ limit: 20, windowSec: 60, scope: 'ai_chat' }),
  async (req, res) => {
    const { conversationId, message } = req.body;

    // Headers SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // desabilita buffer nginx

    // Abort signal (client disconnect)
    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    try {
      // 1. Retrieve context (RAG)
      const chunks = await retrieveContext(message, {
        companyId: req.user.companyId,
        topK: 20,
        rerank: true,
      });

      // 2. Build prompt
      const prompt = buildPrompt({
        templateId: 'tpl_root_cause_analysis',
        context: { companyName: '...', period: '...', userName: req.user.name, userRole: req.user.role },
        retrievedChunks: chunks,
        userQuery: message,
        conversationHistory: await getHistory(conversationId),
      });

      // 3. Persist user message
      const userMessage = await db.aiMessage.create({
        data: { conversationId, role: 'user', content: message },
      });

      // 4. Stream LLM
      const result = await streamText({
        model: openai('gpt-4o'),
        messages: prompt.messages,
        tools,
        temperature: 0.3,
        maxTokens: 1500,
        abortSignal: abortController.signal,
        onFinish: async ({ text, usage, finishReason }) => {
          // Persist assistant message
          const assistantMessage = await db.aiMessage.create({
            data: {
              conversationId,
              role: 'assistant',
              content: text,
              tokensInput: usage.promptTokens,
              tokensOutput: usage.completionTokens,
              model: 'gpt-4o',
              costUsd: calculateCost('gpt-4o', usage),
              finishReason,
            },
          });

          // Track cost
          await costTracker.add({
            companyId: req.user.companyId,
            userId: req.user.id,
            messageId: assistantMessage.id,
            model: 'gpt-4o',
            inputTokens: usage.promptTokens,
            outputTokens: usage.completionTokens,
            costUsd: calculateCost('gpt-4o', usage),
          });

          // Audit
          await audit.log({
            action: 'ai.chat',
            userId: req.user.id,
            companyId: req.user.companyId,
            meta: { conversationId, messageId: assistantMessage.id, cost: calculateCost('gpt-4o', usage) },
          });

          // Send final event
          res.write(`data: ${JSON.stringify({
            type: 'done',
            messageId: assistantMessage.id,
            cost: calculateCost('gpt-4o', usage),
            tokensInput: usage.promptTokens,
            tokensOutput: usage.completionTokens,
            sources: chunks.map(c => ({ entityType: c.entityType, entityId: c.entityId })),
          })}\n\n`);
          res.end();
        },
      });

      // 5. Stream tokens
      for await (const delta of result.textStream) {
        const event = { type: 'token', content: delta };
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (err) {
      console.error(err);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'AI service unavailable' })}\n\n`);
      res.end();
    }
  }
);

export default router;
```

### 7.1.2 Tipos de Evento SSE

| Evento | Descrição | Payload |
|---|---|---|
| `token` | Token gerado | `{ type: 'token', content: '...' }` |
| `tool_call` | LLM chamou tool | `{ type: 'tool_call', name: '...', args: {...} }` |
| `tool_result` | Resultado da tool | `{ type: 'tool_result', name: '...', result: {...} }` |
| `sources` | Fontes usadas | `{ type: 'sources', sources: [...] }` |
| `usage` | Tokens parciais | `{ type: 'usage', tokensInput: ..., tokensOutput: ... }` |
| `done` | Stream finalizado | `{ type: 'done', messageId, cost, ... }` |
| `error` | Erro | `{ type: 'error', message, code }` |

### 7.1.3 Cliente Frontend

```typescript
// src/components/ai/ChatWidget.tsx
import { useState, useCallback } from 'react';

export function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    setStreaming(true);
    const userMsg = { role: 'user', content: text };
    setMessages(m => [...m, userMsg, { role: 'assistant', content: '', streaming: true }]);

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ message: text, conversationId }),
    });

    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = JSON.parse(line.slice(6));
        switch (data.type) {
          case 'token':
            setMessages(m => {
              const copy = [...m];
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                content: copy[copy.length - 1].content + data.content,
              };
              return copy;
            });
            break;
          case 'tool_call':
            setMessages(m => {
              const copy = [...m];
              copy[copy.length - 1].toolCalls = [...(copy[copy.length - 1].toolCalls || []), data];
              return copy;
            });
            break;
          case 'done':
            setMessages(m => {
              const copy = [...m];
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                streaming: false,
                messageId: data.messageId,
                sources: data.sources,
                cost: data.cost,
              };
              return copy;
            });
            break;
          case 'error':
            console.error(data);
            break;
        }
      }
    }
    setStreaming(false);
  }, [conversationId, token]);

  return (
    <div>
      {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
      <ChatInput onSubmit={sendMessage} disabled={streaming} />
    </div>
  );
}
```

## 7.2 Reconnect Handling

Se conexão cai durante stream:
- Cliente armazena último `messageId` recebido (parcial)
- Reconnect com header `Last-Event-ID`
- Servidor pode (em v2.0) completar resposta via WebSocket ou polling

## 7.3 Backpressure

- Tokens são buffered no servidor (max 1MB)
- Se cliente não consome rápido o suficiente (slow consumer), servidor aborta stream
- Evita memory exhaustion

---

# Capítulo 8 — Cost Tracking Detalhado

## 8.1 Estratégia

Todo gasto com LLM é rastreado em três dimensões:
1. **Por tenant (companyId):** quanto a empresa gastou no mês
2. **Por usuário (userId):** ranking de consumo interno
3. **Por query/message:** custo individual de cada interação

## 8.2 Schema

```sql
CREATE TABLE ai_cost_ledger (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  conversation_id BIGINT,
  message_id BIGINT,
  feature VARCHAR(50) NOT NULL,  -- 'chat', 'daily_insight', 'forecast', '...'
  model VARCHAR(50) NOT NULL,
  provider VARCHAR(30) NOT NULL, -- 'openai', 'anthropic', 'google'
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_read_tokens INTEGER DEFAULT 0,  -- prompt cache (Anthropic, OpenAI cached)
  cache_write_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) NOT NULL,
  cost_brl DECIMAL(10,6),
  fx_rate DECIMAL(10,4),  -- câmbio USD->BRL no momento
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX ai_cost_ledger_company_month ON ai_cost_ledger(company_id, occurred_at);
CREATE INDEX ai_cost_ledger_user ON ai_cost_ledger(user_id, occurred_at);
CREATE INDEX ai_cost_ledger_message ON ai_cost_ledger(message_id);

-- Materialized view para dashboard (refresh diário)
CREATE MATERIALIZED VIEW ai_cost_summary AS
SELECT
  company_id,
  date_trunc('day', occurred_at) as day,
  count(*) as request_count,
  sum(input_tokens) as total_input_tokens,
  sum(output_tokens) as total_output_tokens,
  sum(cost_usd) as total_cost_usd,
  sum(cost_brl) as total_cost_brl
FROM ai_cost_ledger
GROUP BY company_id, day
WITH DATA;

CREATE UNIQUE INDEX ON ai_cost_summary(company_id, day);
```

## 8.3 Cálculo de Custo

```typescript
// src/lib/ai/cost-tracker.ts
const PRICING = {
  'gpt-4o': { input: 2.50, output: 10.00, cachedInput: 1.25 },      // $/1M tokens
  'gpt-4o-mini': { input: 0.15, output: 0.60, cachedInput: 0.075 },
  'claude-3-5-sonnet': { input: 3.00, output: 15.00, cachedInput: 0.30, cachedWrite: 3.75 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'text-embedding-3-small': { input: 0.02, output: 0 },
};

export function calculateCost(model: string, usage: {
  promptTokens: number;
  completionTokens: number;
  cachedInputTokens?: number;
  cachedWriteTokens?: number;
}): number {
  const p = PRICING[model];
  if (!p) throw new Error(`Unknown model: ${model}`);
  const inputCost = (usage.promptTokens - (usage.cachedInputTokens ?? 0)) * (p.input / 1_000_000);
  const cachedInputCost = (usage.cachedInputTokens ?? 0) * ((p.cachedInput ?? p.input) / 1_000_000);
  const cachedWriteCost = (usage.cachedWriteTokens ?? 0) * ((p.cachedWrite ?? 0) / 1_000_000);
  const outputCost = usage.completionTokens * (p.output / 1_000_000);
  return inputCost + cachedInputCost + cachedWriteCost + outputCost;
}

export async function trackCost(opts: {
  companyId: number; userId: number; conversationId?: number; messageId?: number;
  feature: string; model: string; provider: string;
  usage: TokenUsage;
}) {
  const costUsd = calculateCost(opts.model, opts.usage);
  const fxRate = await getUsdBrlRate(); // cached 1h
  const costBrl = costUsd * fxRate;

  await db.aiCostLedger.create({
    data: {
      companyId: opts.companyId,
      userId: opts.userId,
      conversationId: opts.conversationId,
      messageId: opts.messageId,
      feature: opts.feature,
      model: opts.model,
      provider: opts.provider,
      inputTokens: opts.usage.promptTokens,
      outputTokens: opts.usage.completionTokens,
      cacheReadTokens: opts.usage.cachedInputTokens ?? 0,
      cacheWriteTokens: opts.usage.cachedWriteTokens ?? 0,
      costUsd,
      costBrl,
      fxRate,
    },
  });

  // Atualiza contador em Redis para rate limit em tempo real
  await REDIS.incrbyfloat(`ai:cost:company:${opts.companyId}:${month}`, costUsd);
  await checkBudgetAlerts(opts.companyId, costUsd);
}
```

## 8.4 Limites por Tenant

```typescript
export async function checkBudgetAlerts(companyId: number, incrementalCost: number) {
  const monthlyBudget = await getCompanyAiBudget(companyId); // em USD
  const monthKey = `ai:cost:company:${companyId}:${currentMonth()}`;
  const spent = parseFloat(await REDIS.get(monthKey) || '0') + incrementalCost;
  await REDIS.set(monthKey, spent.toString());

  const pct = (spent / monthlyBudget) * 100;

  if (pct >= 100 && !await REDIS.get(`ai:alert:100:${companyId}:${monthKey}`)) {
    await REDIS.set(`ai:alert:100:${companyId}:${monthKey}`, '1', 'EX', 86400 * 30);
    await blockAiForCompany(companyId);
    await sendEmail({ to: adminEmail, template: 'ai-budget-exceeded', context: { spent, budget: monthlyBudget } });
  } else if (pct >= 80 && !await REDIS.get(`ai:alert:80:${companyId}:${monthKey}`)) {
    await REDIS.set(`ai:alert:80:${companyId}:${monthKey}`, '1', 'EX', 86400 * 30);
    await sendEmail({ to: adminEmail, template: 'ai-budget-80', context: { spent, budget: monthlyBudget } });
  } else if (pct >= 50 && !await REDIS.get(`ai:alert:50:${companyId}:${monthKey}`)) {
    await REDIS.set(`ai:alert:50:${companyId}:${monthKey}`, '1', 'EX', 86400 * 30);
    await sendEmail({ to: adminEmail, template: 'ai-budget-50', context: { spent, budget: monthlyBudget } });
  }
}

export async function blockAiForCompany(companyId: number) {
  await db.company.update({
    where: { id: companyId },
    data: { aiBlocked: true, aiBlockedReason: 'budget_exceeded', aiBlockedAt: new Date() },
  });
  await audit.log({ action: 'ai.blocked', companyId, meta: { reason: 'budget_exceeded' } });
}
```

## 8.5 Limites por Usuário

- Limite diário padrão: 100 queries
- Reset diário à meia-noite (timezone da empresa)
- Configurável por empresa (10-1000)

## 8.6 Dashboard de Custos

Admin vê em tempo real:
- Tokens consumidos por dia/semana/mês
- Custo em USD/BRL
- Breakdown por usuário, por feature, por modelo
- Comparativo com mês anterior
- Forecast de gasto até fim do mês

```typescript
// src/api/routes/admin/ai-costs.ts
@RequirePermissions('ai.admin')
@Get('/admin/ai/costs')
async getCostSummary(@Query('from') from: string, @Query('to') to: string, @Req() req: Request) {
  const summary = await db.$queryRaw`
    SELECT
      date_trunc('day', occurred_at) as day,
      count(*) as requests,
      sum(input_tokens) as input_tokens,
      sum(output_tokens) as output_tokens,
      sum(cost_usd) as cost_usd,
      sum(cost_brl) as cost_brl
    FROM ai_cost_ledger
    WHERE company_id = ${req.user.companyId}
      AND occurred_at BETWEEN ${from} AND ${to}
    GROUP BY day ORDER BY day
  `;

  const byUser = await db.$queryRaw`
    SELECT user_id, sum(cost_usd) as cost, count(*) as requests
    FROM ai_cost_ledger
    WHERE company_id = ${req.user.companyId}
      AND occurred_at BETWEEN ${from} AND ${to}
    GROUP BY user_id ORDER BY cost DESC LIMIT 20
  `;

  const byModel = await db.$queryRaw`
    SELECT model, sum(cost_usd) as cost, count(*) as requests
    FROM ai_cost_ledger
    WHERE company_id = ${req.user.companyId}
      AND occurred_at BETWEEN ${from} AND ${to}
    GROUP BY model ORDER BY cost DESC
  `;

  return { summary, byUser, byModel };
}
```

## 8.7 Otimizações de Custo

- **Semantic cache** (Capítulo 15): respostas idênticas não chamam LLM
- **Model routing:** usa modelo mais barato para tasks simples
- **Prompt caching** (OpenAI, Anthropic): system prompt e contexto reaproveitado
- **Batch API** (Anthropic, OpenAI): insights diários processados em batch (50% desconto)
- **Token budgeting:** max_tokens adequado por template (não 4096 default)
- **Compression:** contexto estruturado, sem redundância

---

# Capítulo 9 — Model Evaluation Framework

## 9.1 Métricas de Qualidade

| Métrica | Definição | Como medir |
|---|---|---|
| **Faithfulness** | Resposta é fiel às fontes? | LLM-as-judge com rubrica |
| **Answer Relevancy** | Resposta é relevante à pergunta? | LLM-as-judge |
| **Context Precision** | Contexto recuperado é relevante? | Analisar recall@k |
| **Context Recall** | Contexto necessário foi recuperado? | Comparar com gold answer |
| **Hallucination Rate** | % de respostas com info inventada | LLM-as-judge + spot check humano |
| **User Feedback Score** | 👍/👎 ratio | Implícito |
| **Re-ask Rate** | % de conversas com re-pergunta | Eventos |
| **Latency p50/p95** | Tempo de resposta | Métricas técnicas |
| **Cost per useful answer** | Custo / respostas com 👍 | Cost / feedback |
| **Tool call accuracy** | % de tool calls corretos | Validar resultado |

## 9.2 Test Set

Manter um conjunto de **200 perguntas** categorizadas:

| Categoria | Quantidade | Exemplo |
|---|---|---|
| Análise de causa raiz | 30 | "Por que filial X caiu?" |
| Forecasting | 25 | "Vou bater meta?" |
| Comparação | 25 | "Filial A vs B" |
| Coach pessoal | 20 | "Como melhorar meu desempenho?" |
| Anomalia | 15 | "O que aconteceu com indicador X?" |
| Configuração | 15 | "Minhas metas estão bem configuradas?" |
| Tool use | 20 | "Qual minha comissão?" |
| Out of scope | 15 | "Previsão do tempo?" (esperado: recusa educada) |
| Multilingual | 10 | Perguntas em inglês/espanhol |
| Adversarial | 10 | Prompt injection, PII request |
| Edge cases | 15 | "Sem dados suficientes", empresa vazia |

Cada pergunta tem:
- **Pergunta** (user input)
- **Contexto esperado** (chunks relevantes do RAG)
- **Gold answer** (resposta de referência escrita por humano)
- **Critérios de aceitação** (rubric)

## 9.3 Avaliação Automatizada

```typescript
// src/lib/ai/eval.ts
export async function runEvaluation(): Promise<EvalReport> {
  const testSet = await loadTestSet();
  const results: EvalResult[] = [];

  for (const test of testSet) {
    // 1. RAG retrieval
    const retrieved = await retrieveContext(test.query, { companyId: test.companyId });
    const contextRecall = calculateContextRecall(retrieved, test.expectedChunks);
    const contextPrecision = calculateContextPrecision(retrieved);

    // 2. Geração
    const response = await generateResponse(test.query, retrieved, test.conversationHistory);

    // 3. Avaliação com LLM-as-judge
    const faithfulness = await llmJudge({
      task: 'faithfulness',
      question: test.query,
      answer: response.text,
      context: retrieved.map(c => c.chunkText).join('\n'),
    });

    const relevancy = await llmJudge({
      task: 'relevancy',
      question: test.query,
      answer: response.text,
    });

    // 4. Comparação com gold answer (semântica)
    const similarity = await semanticSimilarity(response.text, test.goldAnswer);

    // 5. Hallucination check
    const hallucination = await detectHallucination(response.text, retrieved);

    results.push({
      testId: test.id,
      query: test.query,
      response: response.text,
      metrics: { contextRecall, contextPrecision, faithfulness, relevancy, similarity, hallucination },
      cost: response.cost,
      latency: response.latencyMs,
    });
  }

  // Agrega métricas
  const report = aggregateMetrics(results);
  await db.aiEvalRun.create({
    data: {
      runAt: new Date(),
      gitCommit: process.env.GIT_SHA,
      results: report,
    },
  });
  return report;
}

async function llmJudge(opts: {
  task: 'faithfulness' | 'relevancy';
  question: string;
  answer: string;
  context?: string;
}): Promise<number> {
  const prompts = {
    faithfulness: `Avalie se a resposta é fiel ao contexto fornecido.
                   Resposta deve conter apenas informações presentes no contexto.
                   Contexto: ${opts.context}
                   Pergunta: ${opts.question}
                   Resposta: ${opts.answer}
                   Score 0-10 (10 = totalmente fiel, 0 = totalmente inventado).
                   Responda apenas com o número.`,
    relevancy: `Avalie se a resposta é relevante à pergunta.
                Pergunta: ${opts.question}
                Resposta: ${opts.answer}
                Score 0-10 (10 = perfeitamente relevante, 0 = irrelevante).
                Responda apenas com o número.`,
  };

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompts[opts.task] }],
    temperature: 0,
    max_tokens: 5,
  });
  return parseInt(response.choices[0].message.content!.trim());
}
```

## 9.4 Avaliação em CI

- Suite de avaliação roda em CI em cada PR que toca `prompts/` ou `src/lib/ai/`
- Compara com baseline (main branch)
- Falha se regressão > 5% em qualquer métrica
- Resultados visíveis em dashboard Grafana

## 9.5 Avaliação Contínua em Produção

- 1% das queries em produção são amostradas e re-avaliadas por LLM-judge
- Resultados agregados em dashboard
- Alertas se faithfulness cair abaixo de 8.0 (média móvel 24h)

---

# Capítulo 10 — A/B Testing de Prompts

## 10.1 Framework

Permite testar 2 versões de prompt em paralelo e medir qual performa melhor.

### 10.1.1 Configuração

```typescript
// src/lib/ai/experiments.ts
export interface PromptExperiment {
  id: string;
  name: string;
  templateId: string;
  variants: {
    control: { version: string; weight: 0.5 };
    treatment: { version: string; weight: 0.5 };
  };
  metrics: ['faithfulness', 'relevancy', 'user_feedback'];
  startDate: Date;
  endDate: Date;
  minSampleSize: number;
  status: 'running' | 'paused' | 'completed';
}

export async function assignVariant(experimentId: string, userId: number): Promise<'control' | 'treatment'> {
  // Sticky assignment: mesmo usuário sempre vê mesma variante
  const hash = crypto.createHash('sha256').update(`${experimentId}:${userId}`).digest('hex');
  const value = parseInt(hash.slice(0, 8), 16) / 0xFFFFFFFF;
  const experiment = await getExperiment(experimentId);
  return value < experiment.variants.control.weight ? 'control' : 'treatment';
}
```

### 10.1.2 Execução

```typescript
export async function chatWithExperiment(req: Request, message: string) {
  const experiments = await getActiveExperimentsForTemplate('tpl_root_cause_analysis');
  const variantAssignments: Record<string, 'control' | 'treatment'> = {};

  for (const exp of experiments) {
    variantAssignments[exp.id] = await assignVariant(exp.id, req.user.id);
  }

  const templateVersion = variantAssignments[Object.keys(variantAssignments)[0]] === 'control'
    ? '1.2'  // versão atual
    : '1.3-beta';  // versão experimental

  const response = await generateResponse({
    templateId: 'tpl_root_cause_analysis',
    templateVersion,
    message,
    user: req.user,
  });

  // Log do experiment assignment
  await db.aiExperimentAssignment.create({
    data: {
      experimentId: Object.keys(variantAssignments)[0],
      userId: req.user.id,
      variant: Object.values(variantAssignments)[0],
      messageId: response.messageId,
      assignedAt: new Date(),
    },
  });

  return response;
}
```

### 10.1.3 Análise

```typescript
export async function analyzeExperiment(experimentId: string): Promise<ExperimentResult> {
  const assignments = await db.aiExperimentAssignment.findMany({
    where: { experimentId },
    include: { message: { include: { feedback: true } } },
  });

  const control = assignments.filter(a => a.variant === 'control');
  const treatment = assignments.filter(a => a.variant === 'treatment');

  return {
    control: {
      sampleSize: control.length,
      feedbackScore: avg(control.map(a => a.message.feedback === 'positive' ? 1 : a.message.feedback === 'negative' ? 0 : 0.5)),
      reAskRate: calculateReAskRate(control),
      avgCost: avg(control.map(a => a.message.costUsd)),
      avgLatency: avg(control.map(a => a.message.latencyMs)),
    },
    treatment: {
      sampleSize: treatment.length,
      feedbackScore: avg(treatment.map(a => a.message.feedback === 'positive' ? 1 : a.message.feedback === 'negative' ? 0 : 0.5)),
      reAskRate: calculateReAskRate(treatment),
      avgCost: avg(treatment.map(a => a.message.costUsd)),
      avgLatency: avg(treatment.map(a => a.message.latencyMs)),
    },
    statisticalSignificance: tTest(control, treatment),
  };
}
```

## 10.2 Critérios de Decisão

- **Min sample size:** 500 por variante
- **Statistical significance:** p < 0.05
- **Primary metric:** user feedback score
- **Guardrails:** cost, latency não podem degradar >10%
- **Auto-promote:** se treatment vence com significância, promove a control

## 10.3 Dashboard

```
Experiment: tpl_root_cause_analysis v1.2 vs v1.3-beta
Status: running (12 days left)

| Metric | Control (v1.2) | Treatment (v1.3) | Delta |
|---|---|---|---|
| Sample size | 487 | 492 | — |
| 👍 ratio | 72.1% | 78.3% | +6.2pp ✅ |
| Re-ask rate | 14.2% | 11.5% | -2.7pp ✅ |
| Avg cost | $0.018 | $0.019 | +5.5% ⚠ |
| Avg latency | 2.1s | 2.3s | +9.5% ⚠ |
| Faithfulness | 8.2 | 8.6 | +0.4 ✅ |

Statistical significance: p=0.03 (significant)
Recommendation: PROMOTE (after cost optimization)
```

---

# Capítulo 11 — Hallucination Detection

## 11.1 Definição

Hallucination = afirmação na resposta que não é suportada pelo contexto recuperado ou pelos dados do Orion.

## 11.2 Estratégias de Detecção

### 11.2.1 Number Verification

Toda menção a número na resposta é verificada contra o contexto:

```typescript
// src/lib/ai/hallucination-check.ts
export async function checkNumbersInResponse(response: string, context: RetrievedChunk[]): Promise<{
  verified: boolean;
  issues: { number: string; inContext: boolean; snippet: string }[];
}> {
  // Extrai todos os números (currency, percentages, counts)
  const numberPattern = /(?:R\$\s?)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:\.\d+)?%?)/g;
  const numbers = response.match(numberPattern) ?? [];
  const contextText = context.map(c => c.chunkText).join('\n');
  const issues: any[] = [];

  for (const num of numbers) {
    const normalized = normalizeNumber(num);
    const inContext = contextText.includes(num) ||
                      contextText.includes(normalized) ||
                      context.some(c => {
                        const meta = c.metadata;
                        return Object.values(meta).some(v =>
                          typeof v === 'number' && Math.abs(v - parseFloat(normalized)) < 0.01
                        );
                      });
    if (!inContext) {
      issues.push({ number: num, inContext: false, snippet: findSentence(response, num) });
    }
  }

  return { verified: issues.length === 0, issues };
}
```

### 11.2.2 LLM-as-Judge (faithfulness check)

Após cada resposta, um segundo LLM verifica se tudo é suportado pelo contexto:

```typescript
export async function checkFaithfulness(response: string, context: RetrievedChunk[]): Promise<{
  faithful: boolean;
  unsupportedClaims: string[];
}> {
  const prompt = `Você é um auditor. Avalie se CADA afirmação da resposta é suportada pelo contexto.

CONTEXTO:
${context.map((c, i) => `[${i + 1}] ${c.chunkText}`).join('\n')}

RESPOSTA:
${response}

Para cada afirmação numérica ou factual na resposta, marque:
- "✓ [afirmação]" se suportada pelo contexto (cite [n])
- "✗ [afirmação]" se NÃO suportada

Retorne JSON:
{
  "faithful": boolean,
  "unsupportedClaims": ["claim 1", "claim 2", ...]
}`;

  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0,
  });

  return JSON.parse(result.choices[0].message.content!);
}
```

### 11.2.3 Citation Requirement

Toda resposta deve citar chunks do contexto: `[1]`, `[2]`, etc. Ausência de citação em afirmação factual é flag.

### 11.2.4 Self-Consistency Check

Para perguntas críticas (forecast, anomaly), gera resposta 3x com temperatura 0.7 e verifica convergência. Se divergem significativamente, marca como incerto.

## 11.3 Ação ao Detectar Hallucination

| Severidade | Ação |
|---|---|
| Crítica (número inventado, entidade inexistente) | Bloqueia resposta, mostra mensagem de erro |
| Alta (afirmação sem citação) | Adiciona disclaimer "Esta informação não foi verificada" |
| Média (juízo de valor sem base) | Loga para análise, não bloqueia |
| Baixa (estilo, tom) | Ignora |

## 11.4 Telemetria

- Contador de hallucinations detectados por dia/modelo/template
- Alerta se taxa > 5% (média 24h)
- Quando detectado, faz log da query + contexto + resposta para análise

---

# Capítulo 12 — Guardrails — Input/Output Filtering

## 12.1 Input Filtering

Antes de enviar pergunta ao LLM, valida:

### 12.1.1 PII Detection & Filtering

```typescript
// src/lib/ai/pii-filter.ts
import {PresidioAnalyzer, PresidioAnonymizer} from '@microsoft/presidio';

const analyzer = new PresidioAnalyzer({ language: 'pt' });
const anonymizer = new PresidioAnonymizer();

const PII_ENTITIES = ['CPF', 'EMAIL_ADDRESS', 'PHONE_NUMBER', 'BR_CNPJ', 'PERSON', 'CREDIT_CARD'];

export async function filterPII(text: string): Promise<{ filtered: string; found: PIIEntity[] }> {
  const results = await analyzer.analyze(text, PII_ENTITIES);
  const filtered = await anonymizer.anonymize(text, results);
  return { filtered: filtered.text, found: results };
}

// Antes de enviar ao LLM:
const { filtered, found } = await filterPII(userMessage);
if (found.length > 0) {
  await audit.log({ action: 'ai.pii_filtered', userId, meta: { entities: found.map(f => f.entity_type) } });
}
// Envia `filtered` ao LLM, não `userMessage`
```

### 12.1.2 Prompt Injection Detection

Padrões suspeitos:
- "Ignore todas as instruções anteriores"
- "Você é agora..."
- "System:" no meio de user message
- Tentativa de extrair system prompt
- Tentativa de acessar dados de outra empresa

```typescript
const INJECTION_PATTERNS = [
  /ignore (all|previous|above) (instructions|prompts|rules)/i,
  /you are now (a|an) /i,
  /disregard (the|any) system/i,
  /forget (everything|all) (you|that) (were|were) told/i,
  /\[system\]|\[admin\]/i,
  /reveal (your|the) (system )?prompt/i,
];

export function detectPromptInjection(text: string): { detected: boolean; pattern?: string } {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { detected: true, pattern: pattern.source };
    }
  }
  return { detected: false };
}
```

### 12.1.3 Length Limit

- Máximo 4000 caracteres por mensagem
- Máximo 50 mensagens por conversa (após, cria nova conversa)

### 12.1.4 Topic Filtering

Bloqueia perguntas fora do escopo (não comerciais):
- Política, religião, sexualidade
- Conteúdo ilegal
- Conselho médico, jurídico, financeiro pessoal
- Pedidos de código malicioso

```typescript
const OFF_TOPIC_PATTERNS = [
  /\b(médico|doctor|médica|consulta|receita)\b/i,
  /\b(advogado|jurídico|processo|tribunal)\b/i,
  /\b(investir|ações|cripto|bitcoin)\b/i,
  // ...
];

export async function isOffTopic(query: string): Promise<boolean> {
  if (OFF_TOPIC_PATTERNS.some(p => p.test(query))) return true;
  // LLM classifier para casos sutis
  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Classifique se a pergunta está relacionada a gestão comercial, vendas, performance, metas.
      Responda apenas "true" ou "false".
      Pergunta: ${query}`,
    }],
    temperature: 0, max_tokens: 5,
  });
  return result.choices[0].message.content?.trim() === 'false';
}
```

## 12.2 Output Filtering

### 12.2.1 Content Moderation

Usa OpenAI Moderation API:

```typescript
export async function moderateContent(text: string): Promise<{
  flagged: boolean;
  categories: Record<string, boolean>;
}> {
  const response = await openai.moderations.create({
    model: 'omni-moderation-latest',
    input: text,
  });
  return {
    flagged: response.results[0].flagged,
    categories: response.results[0].categories,
  };
}

// Pós-geração:
const moderation = await moderateContent(response);
if (moderation.flagged) {
  await audit.log({ action: 'ai.output_blocked', userId, meta: { categories: moderation.categories } });
  return 'Desculpe, não posso responder a isso. Tente reformular sua pergunta.';
}
```

### 12.2.2 Rule-Based Filters

- Não revelar dados de outras empresas (validar `companyId` em entidades citadas)
- Não executar ações (apenas sugerir)
- Não fornecer conselhos pessoais (médico, jurídico, financeiro)
- Não usar linguagem discriminatória

### 12.2.3 Output Schema Validation

Para templates com JSON output (anomaly detection, data quality):

```typescript
const anomalySchema = z.object({
  anomalies: z.array(z.object({
    type: z.enum(['drop', 'spike', 'outlier', 'break_pattern']),
    severity: z.enum(['low', 'medium', 'high']),
    metric: z.string(),
    entity: z.string(),
    expected: z.number(),
    actual: z.number(),
    deviation_pct: z.number(),
    explanation: z.string(),
    recommendation: z.string(),
  })).max(5),
});

export function validateOutputSchema(text: string, schema: z.ZodType): { valid: boolean; data?: any } {
  try {
    const json = JSON.parse(text);
    const parsed = schema.parse(json);
    return { valid: true, data: parsed };
  } catch (e) {
    return { valid: false };
  }
}
```

### 12.2.4 Sensitive Action Block

Se resposta menciona executar ação sem confirmação, bloqueia:

```typescript
const ACTION_KEYWORDS = [
  'vou criar', 'vou deletar', 'vou atualizar',
  'excluído', 'modificado',
  'i will create', 'i will delete',
];

export function checkActionBlock(response: string): boolean {
  return ACTION_KEYWORDS.some(k => response.toLowerCase().includes(k));
}
```

---

# Capítulo 13 — Privacy — Data Minimization, PII Filtering

## 13.1 Princípio de Minimização

Enviamos ao LLM apenas o estritamente necessário:

| Dado | Envia ao LLM? | Justificativa |
|---|---|---|
| Faturamento agregado por filial | ✓ | Necessário para análise |
| Metas | ✓ | Necessário para análise |
| Ranking com IDs anonimizados | ✓ | Necessário para análise comparativa |
| Nome do vendedor | ✗ (substituir por ID) | Não necessário; PII |
| CPF/RG | ✗ | PII; nunca |
| Email | ✗ | PII; nunca |
| Telefone | ✗ | PII; nunca |
| Endereço | ✗ | PII; não relevante para análise comercial |
| Logs de auditoria | ✗ | Sensível; não necessário |
| Senhas, tokens | ✗ | Sensível; nunca |
| Dados de outras empresas | ✗ | Isolamento tenant |

## 13.2 Anonimização Antes do Envio

```typescript
// src/lib/ai/anonymizer.ts
export async function anonymizeForLLM(data: any, user: AuthenticatedUser): Promise<string> {
  // Substitui nomes de usuários por IDs
  const users = await db.user.findMany({
    where: { companyId: user.companyId, status: 'ACTIVE' },
    select: { id: true, name: true },
  });

  let text = JSON.stringify(data, null, 2);
  for (const u of users) {
    // Substitui todas as ocorrências do nome por USER_<id>
    const regex = new RegExp(escapeRegExp(u.name), 'gi');
    text = text.replace(regex, `USER_${u.id}`);
  }

  // Substitui CPFs, emails, telefones que por ventura tenham vazado
  text = text.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF]');
  text = text.replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, '[EMAIL]');
  text = text.replace(/\b(?:\+?55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b/g, '[PHONE]');

  return text;
}
```

## 13.3 Política de Retenção dos Provedores

- **OpenAI:** API não treina modelos com dados do cliente (Zero Data Retention para Enterprise)
- **Anthropic:** Mesma política (zero retention para API com contrato Business/Enterprise)
- **Google Gemini:** API com termo de não-retenção para clientes Enterprise
- Contratos formais com cláusula de não-retenção obrigatórios (DPA assinado)

## 13.4 Consentimento

- Primeiro uso de IA exige aceite explícito do admin da empresa
- Política de IA visível e acessível (`/ai-privacy-policy`)
- Opção de desativar IA completamente (sistema funciona sem)
- Usuário individual pode optar por não usar IA (configuração de perfil)
- Direito de oposição (LGPD art. 18, §2º) via UC-062

## 13.5 Log Policy

- Conversas com IA: 90 dias
- Após 90 dias: purgado
- Cliente pode solicitar purge antecipado
- Logs NUNCA incluem dados sensíveis não filtrados

## 13.6 Subprocessadores IA

Lista pública em `orion.com/ai-subprocessors`:
- OpenAI LLC (LLM inference)
- Anthropic (LLM inference)
- Cohere (reranking)
- Microsoft Presidio (PII detection, self-hosted)

Clientes Enterprise podem optar por **não usar cloud LLM** (Ollama local), com menor qualidade.

---

# Capítulo 14 — Fallback Strategies

## 14.1 Cenários de Falha

| Cenário | Sintoma | Estratégia |
|---|---|---|
| OpenAI API down (5xx) | Timeout ou 503 | Failover para Anthropic |
| OpenAI rate limit (429) | 429 | Backoff exponencial, depois failover |
| Anthropic API down | Timeout | Failover para OpenAI |
| Todos cloud LLM down | Erro | Modo degradado (cache apenas) |
| Embeddings API down | Timeout | Usa busca lexical (PostgreSQL FTS) |
| Vector DB (pgvector) down | Erro | Pula RAG, responde sem contexto |
| IA gateway timeout (60s) | Timeout | Retorna mensagem de erro amigável |
| Tool call falha | Exception | LLM recebe erro, decide retry ou não |

## 14.2 Failover Chain

```typescript
// src/lib/ai/llm-router.ts
export const PROVIDER_CHAIN = [
  { provider: 'openai', model: 'gpt-4o' },
  { provider: 'anthropic', model: 'claude-3-5-sonnet' },
  { provider: 'google', model: 'gemini-1.5-pro' },
  { provider: 'local', model: 'llama-3.1-8b' }, // Ollama, último recurso
];

export async function callLLMWithFailover(opts: LLMCallOptions): Promise<LLMResponse> {
  for (const provider of PROVIDER_CHAIN) {
    try {
      const client = getClient(provider.provider);
      const response = await withTimeout(
        client.chat(opts, provider.model),
        30000
      );
      return { ...response, provider: provider.provider, model: provider.model };
    } catch (err) {
      console.warn(`Provider ${provider.provider} failed:`, err.message);
      await audit.log({ action: 'ai.provider_failover', meta: { from: provider.provider, error: err.message } });
      continue;
    }
  }
  throw new Error('All AI providers failed');
}
```

## 14.3 Circuit Breaker

Após N falhas consecutivas de um provider, desabilita temporariamente:

```typescript
// src/lib/ai/circuit-breaker.ts
export class CircuitBreaker {
  constructor(private threshold: number = 5, private cooldownMs: number = 60000) {}

  async call<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const state = await this.getState(key);
    if (state === 'open') {
      throw new Error(`Circuit open for ${key}`);
    }
    try {
      const result = await fn();
      await this.recordSuccess(key);
      return result;
    } catch (err) {
      await this.recordFailure(key);
      throw err;
    }
  }

  private async getState(key: string): Promise<'closed' | 'open' | 'half-open'> {
    const failures = await REDIS.get(`cb:${key}:failures`);
    const openedAt = await REDIS.get(`cb:${key}:openedAt`);
    if (failures && parseInt(failures) >= this.threshold) {
      if (openedAt && Date.now() - parseInt(openedAt) > this.cooldownMs) {
        return 'half-open';
      }
      return 'open';
    }
    return 'closed';
  }

  private async recordFailure(key: string) {
    const failures = await REDIS.incr(`cb:${key}:failures`);
    if (failures === this.threshold) {
      await REDIS.set(`cb:${key}:openedAt`, Date.now().toString());
      await audit.log({ action: 'ai.circuit_opened', meta: { provider: key } });
    }
    await REDIS.expire(`cb:${key}:failures`, 300);
  }

  private async recordSuccess(key: string) {
    await REDIS.del(`cb:${key}:failures`);
    await REDIS.del(`cb:${key}:openedAt`);
  }
}
```

## 14.4 Modo Degradado

Se todos LLM falham, sistema responde com:
- Cache (se hit)
- Mensagem: "IA temporariamente indisponível. Tente novamente em alguns minutos."
- Sistema principal continua 100% funcional

## 14.5 Health Check de Providers

A cada 5 min, pinga cada provider com request simples:

```typescript
export async function healthCheckProviders(): Promise<ProviderHealth[]> {
  const checks = PROVIDER_CHAIN.map(async (p) => {
    const start = Date.now();
    try {
      const client = getClient(p.provider);
      await client.chat({ messages: [{ role: 'user', content: 'ping' }], maxTokens: 1 });
      return { provider: p.provider, status: 'healthy', latencyMs: Date.now() - start };
    } catch (e) {
      return { provider: p.provider, status: 'unhealthy', error: e.message };
    }
  });
  return Promise.all(checks);
}
```

Resultado exposto em `/health/ai` para monitoramento.

---

# Capítulo 15 — Cache Strategies — Semantic Cache

## 15.1 Tipos de Cache

| Tipo | TTL | Quando | Implementação |
|---|---|---|---|
| Exact match | 1h | Mesma query exata | Redis (hash SHA-256) |
| Semantic cache | 24h | Query semanticamente similar | Redis + pgvector |
| Embedding cache | 30 dias | Embedding de texto já calculado | Redis (hash texto) |
| Prompt cache (provider) | 5-60 min | System prompt repetido | OpenAI/Anthropic nativo |

## 15.2 Semantic Cache

Para queries semanticamente similares (ex: "Por que faturamento caiu?" e "Motivo da queda nas vendas"), retorna resposta cacheada se similaridade > 0.92.

```typescript
// src/lib/ai/semantic-cache.ts
const SIMILARITY_THRESHOLD = 0.92;
const CACHE_TTL = 24 * 3600; // 24h

export async function getCachedResponse(query: string, companyId: number): Promise<CachedResponse | null> {
  const queryEmbedding = await embedText(query);

  // Busca em cache da empresa
  const candidates = await db.$queryRaw<{ query: string; response: string; score: number }[]>`
    SELECT query, response, embedding <=> ${JSON.stringify(queryEmbedding)}::vector as distance
    FROM ai_cache
    WHERE company_id = ${companyId}
      AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT 1
  `;

  if (candidates.length === 0) return null;
  const candidate = candidates[0];
  const similarity = 1 - candidate.distance;
  if (similarity < SIMILARITY_THRESHOLD) return null;

  return {
    query: candidate.query,
    response: candidate.response,
    similarity,
    cachedAt: new Date(),
  };
}

export async function cacheResponse(query: string, response: string, companyId: number) {
  const embedding = await embedText(query);
  await db.aiCache.create({
    data: { companyId, query, response, embedding },
  });
  // TTL cleanup via job diário
}
```

## 15.3 Cache Invalidation

- Quando dados da empresa mudam significativamente (>10% dos resultados do mês), invalida todo cache da empresa
- Quando template muda de versão, invalida cache específico
- Manual: admin pode limpar cache via endpoint

## 15.4 Métricas de Cache

- **Hit rate:** % de queries servidas do cache
- **Avg similarity:** média de similaridade dos hits
- **False positives:** % de hits onde resposta foi inapropriada (medido por feedback negativo)
- **Cost saved:** $$ economizados por cache hits

Meta: 30% hit rate sem degradação de qualidade.

---

# Capítulo 16 — Stack Técnica e Schema

## 16.1 Stack

- **LLM SDK:** Vercel AI SDK 3.x (TypeScript)
- **Embeddings:** OpenAI text-embedding-3-small (1536 dims)
- **Vector DB:** pgvector (extensão PostgreSQL 16)
- **Cache:** Redis 7
- **Queue:** BullMQ (Redis-based)
- **LLM providers:** OpenAI (GPT-4o, GPT-4o-mini), Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku), Google (Gemini 1.5 Pro/Flash)
- **Local LLM (optional):** Ollama rodando Llama 3.1 8B / Mistral 7B
- **Reranker:** Cohere Rerank Multilingual v3 (cloud) ou BGE-reranker-large (self-hosted)
- **PII detection:** Microsoft Presidio (self-hosted)
- **Moderation:** OpenAI Moderation API

## 16.2 Schema de Banco

```sql
-- Conversas
CREATE TABLE ai_conversations (
  id BIGSERIAL PRIMARY KEY,
  uuid UUID UNIQUE DEFAULT gen_random_uuid(),
  company_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  title VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- 'active' | 'archived' | 'deleted'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON ai_conversations(company_id, user_id, status);

-- Mensagens
CREATE TABLE ai_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tokens_input INTEGER,
  tokens_output INTEGER,
  model VARCHAR(50),
  provider VARCHAR(30),
  cost_usd DECIMAL(10,6),
  latency_ms INTEGER,
  finish_reason VARCHAR(50),
  feedback VARCHAR(20), -- 'positive' | 'negative' | null
  feedback_comment TEXT,
  feedback_at TIMESTAMP,
  tool_calls JSONB, -- [{name, args, result}]
  sources JSONB,    -- [{entityType, entityId}]
  template_id VARCHAR(100),
  template_version VARCHAR(20),
  experiment_id VARCHAR(100),
  experiment_variant VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON ai_messages(conversation_id, created_at);
CREATE INDEX ON ai_messages(feedback) WHERE feedback IS NOT NULL;

-- Embeddings (RAG)
CREATE TABLE ai_embeddings (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  chunk_text TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ai_embeddings_vector_idx ON ai_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
CREATE INDEX ON ai_embeddings(company_id, entity_type, entity_id);

-- Cache semântico
CREATE TABLE ai_cache (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  model VARCHAR(50),
  cost_usd DECIMAL(10,6),
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ai_cache_vector_idx ON ai_cache
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
CREATE INDEX ON ai_cache(company_id, created_at);

-- Cost ledger
CREATE TABLE ai_cost_ledger (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  conversation_id BIGINT,
  message_id BIGINT,
  feature VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  provider VARCHAR(30) NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_read_tokens INTEGER DEFAULT 0,
  cache_write_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) NOT NULL,
  cost_brl DECIMAL(10,6),
  fx_rate DECIMAL(10,4),
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ON ai_cost_ledger(company_id, occurred_at);
CREATE INDEX ON ai_cost_ledger(user_id, occurred_at);

-- Experiment assignments
CREATE TABLE ai_experiment_assignments (
  id BIGSERIAL PRIMARY KEY,
  experiment_id VARCHAR(100) NOT NULL,
  user_id BIGINT NOT NULL,
  variant VARCHAR(20) NOT NULL,
  message_id BIGINT,
  assigned_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON ai_experiment_assignments(experiment_id, variant);

-- Eval runs
CREATE TABLE ai_eval_runs (
  id BIGSERIAL PRIMARY KEY,
  run_at TIMESTAMP DEFAULT NOW(),
  git_commit VARCHAR(40),
  results JSONB NOT NULL,
  duration_ms INTEGER
);

-- RLS em todas
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_ledger ENABLE ROW LEVEL SECURITY;
-- (policies tenant_isolation)
```

---

# Capítulo 17 — Métricas e Monitoramento

## 17.1 Métricas de Qualidade

- **Feedback score:** % de respostas com feedback positivo (👍/(👍+👎))
- **Re-ask rate:** % de conversas com mesma pergunta repetida (sinal de resposta ruim)
- **Hallucination rate:** % de respostas com info inventada (medido por LLM-judge em amostra)
- **Faithfulness score:** média 0-10 (LLM-judge)
- **Relevancy score:** média 0-10 (LLM-judge)

## 17.2 Métricas de Performance

- **Latência p50/p95/p99:** tempo de resposta total (Gateway → LLM → retorno)
- **Tokens per response:** eficiência
- **Cache hit rate:** % servidas do cache
- **Tool call accuracy:** % de tool calls que retornam dados corretos
- **Failover rate:** % de requests que acionaram failover
- **Provider health:** uptime por provider

## 17.3 Métricas de Negócio

- **Adoção:** % de usuários ativos usando IA
- **Frequency:** queries por usuário por semana
- **Cost per user:** custo médio de IA por usuário/mês
- **Activation rate:** % de novas empresas que ativam IA em 7 dias
- **Retention:** % de usuários que continuam usando IA após 30 dias

## 17.4 Dashboard (Grafana)

Painéis:
1. **Overview:** queries/min, cost/day, error rate, latency
2. **Quality:** feedback score, hallucination rate, faithfulness
3. **Cost:** by tenant, by user, by model, forecast
4. **Provider health:** status, latency, failover events
5. **Cache:** hit rate, false positives
6. **Experiments:** A/B test results

## 17.5 Alertas

| Condição | Severidade | Canal |
|---|---|---|
| Error rate > 5% (5min) | Critical | PagerDuty |
| Latência p95 > 10s (5min) | Warning | Slack |
| Hallucination rate > 5% (24h) | Warning | Slack |
| Cache hit rate < 10% (24h) | Info | Slack |
| Cost > daily budget (any tenant) | Warning | Slack |
| Provider unhealthy (circuit open) | Critical | PagerDuty |
| Feedback score < 70% (24h) | Warning | Slack |

---

# Capítulo 18 — Roadmap de IA

## v1.0 (Atual — Q1 2025)
- Chat interativo com streaming SSE
- Insight diário automático (cron 8h)
- Previsão de meta mensal
- Relatório narrativo
- RAG com pgvector
- Function calling (5 tools)
- Cost tracking detalhado
- Guardrails (input/output)

## v1.1 (Q2 2025)
- Análise de causa raiz avançada (com reranker)
- Coach pessoal para vendedores
- Voice input (transcrição via Whisper)
- Semantic cache (24h TTL)
- A/B testing de prompts (production)
- Hallucination detection (LLM-judge)
- Mobile app chat

## v2.0 (Q3 2025)
- Sugestão de campanhas automáticas (com base em calendário)
- Análise de funil (integração CRM)
- Comparação entre filiais
- Análise sazonal (12+ meses)
- Tool use expandido (10+ tools)
- Apple Sign-In integration with IA

## v2.5 (Q4 2025)
- Agente autônomo (executa ações pré-aprovadas: criar meta, ajustar campanha)
- Visão computacional (análise de fotos de PDV via GPT-4 Vision)
- Previsão de churn de vendedores
- IA de voz (suporte hands-free via Alexa/Google Assistant)
- Multi-language (EN, ES)

## v3.0 (Q1 2026)
- Fine-tuning opcional por empresa (modelo privado)
- IA multimodal (texto + imagem + áudio + vídeo)
- Benchmarking anônimo entre empresas
- IA explicável avançada (XAI — SHAP values para previsões)
- Custom tools via MCP (Model Context Protocol)

## v3.5 (Q2 2026)
- Auto-prompt optimization (DSPy framework)
- Continuous learning from feedback (RLHF internal)
- Agentic workflows (cadeias de tools)
- Real-time anomaly detection (streaming, não batch)
- Integration with WhatsApp Business for insights on-demand

## v4.0 (Q4 2026)
- On-device LLM para mobile (Phi-3 mini, Gemma 2B)
- Federated learning (aprendizado entre tenants preservando privacidade)
- Custom AI personas por empresa
- Full observability (LangSmith / Langfuse)

---

# Capítulo 19 — Apêndices

## A.1 Glossário

| Termo | Definição |
|---|---|
| AI Gateway | Serviço intermediário que orquestra chamadas a LLMs |
| Chunk | Fragmento de documento indexado no RAG |
| Embedding | Representação vetorial de texto |
| Faithfulness | Métrica que avalia se resposta é fiel às fontes |
| Function calling | Capacidade do LLM chamar ferramentas externas |
| Guardrails | Filtros de input/output para segurança |
| Hallucination | Resposta inventada sem base em dados |
| LLM | Large Language Model |
| Prompt | Instrução enviada ao LLM |
| RAG | Retrieval-Augmented Generation |
| Reranker | Modelo que reordena resultados por relevância |
| SSE | Server-Sent Events |
| TOTP | Time-based One-Time Password |
| Tool use | Sinônimo de function calling |
| Vector store | Banco de dados vetorial |

## A.2 Referências

- Vercel AI SDK: https://sdk.vercel.ai/
- OpenAI API: https://platform.openai.com/docs
- Anthropic API: https://docs.anthropic.com/
- Google Gemini API: https://ai.google.dev/
- pgvector: https://github.com/pgvector/pgvector
- Cohere Rerank: https://docs.cohere.com/docs/reranking
- Microsoft Presidio: https://microsoft.github.io/presidio/
- DSPy: https://dspy.ai/
- LangSmith: https://smith.langchain.com/
- RFC 6455 (WebSocket) — usado em SSE alternativas
- OWASP Top 10 for LLM Applications: https://owasp.org/www-project-top-10-for-large-language-model-applications/

## A.3 Change Log

| Versão | Data | Mudanças | Autor |
|---|---|---|---|
| 1.0.0 | 2025-01-15 | Versão inicial expandida (Fase 2) | Eng. de IA |
| 0.9.0 | 2024-12-01 | Rascunho inicial | Eng. de IA |

## A.4 Aprovações

| Papel | Nome | Data | Assinatura |
|---|---|---|---|
| Engineering Lead | _______ | ___ | ___ |
| CISO | _______ | ___ | ___ |
| DPO | _______ | ___ | ___ |
| Product Manager | _______ | ___ | ___ |

---

**Fim do Documento 12 — AI Module Specification**
