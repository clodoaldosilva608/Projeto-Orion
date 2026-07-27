# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 24

# MARKETPLACE DE PLUGINS

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento (Roadmap v2.0)
**Documento:** Especificação do Marketplace de Plugins

---

# Capítulo 1 — Visão Geral

O Marketplace de Plugins é um dos maiores diferenciais estratégicos do Projeto Orion. Permite que desenvolvedores terceiros criem e vendam extensões para o Orion, transformando-o de produto em plataforma. Este documento especifica a arquitetura técnica, o ciclo de vida de plugins, o modelo de negócio, e o processo de certificação.

## 1.1 Objetivos

- Permitir extensão do Orion sem alterar o núcleo
- Criar ecossistema onde terceiros possam monetizar
- Oferecer funcionalidades específicas por segmento via plugins
- Reduzir custo de desenvolvimento do fornecedor (comunidade cria)

## 1.2 Disponibilidade

- **v1.0:** Arquitetura preparada (plugin hooks, API interna)
- **v2.0:** Marketplace launch com 5-10 plugins oficiais
- **v3.0:** Aberto a terceiros com revenue share
- **v4.0:** Marketplace maduro com 100+ plugins

---

# Capítulo 2 — Arquitetura de Plugins

## 2.1 Modelo Técnico

Plugins são **módulos Node.js** que implementam interfaces contratuais definidas pelo Core do Orion. São carregados dinamicamente em runtime.

```typescript
// Contrato que todo plugin deve implementar
interface OrionPlugin {
  name: string;
  version: string;
  author: string;
  description: string;
  
  // Lifecycle hooks
  install(): Promise<void>;
  activate(context: PluginContext): Promise<void>;
  deactivate(): Promise<void>;
  uninstall(): Promise<void>;
  
  // Opcional: registra rotas de API
  registerRoutes?(router: PluginRouter): void;
  
  // Opcional: registra componentes UI
  registerUI?(registry: UIRegistry): void;
  
  // Opcional: escuta eventos do Event Bus
  registerEventHandlers?(bus: EventBus): void;
  
  // Opcional: registra widgets de dashboard
  registerWidgets?(registry: WidgetRegistry): void;
}
```

## 2.2 Sandbox de Segurança

Plugins rodam em sandbox com permissões explícitas:

```typescript
// package.json do plugin
{
  "name": "orion-whatsapp-plugin",
  "orion": {
    "permissions": [
      "api:read:users",
      "api:write:notifications",
      "event:subscribe:result.created",
      "event:subscribe:goal.achieved",
      "ui:inject:dashboard.widget",
      "ui:inject:menu.item"
    ],
    "config": {
      "type": "object",
      "properties": {
        "apiKey": { "type": "string" },
        "phoneNumberId": { "type": "string" }
      },
      "required": ["apiKey", "phoneNumberId"]
    }
  }
}
```

### Permissões Granulares
- `api:read:{resource}` — pode ler
- `api:write:{resource}` — pode criar/editar
- `event:subscribe:{event}` — escuta evento
- `event:publish:{event}` — publica evento
- `ui:inject:{location}` — injeta UI em local

## 2.3 Contexto do Plugin

Cada plugin recebe um `PluginContext` com APIs permitidas:

```typescript
interface PluginContext {
  // Identidade do tenant
  companyId: number;
  
  // APIs do Orion (limitadas às permissões)
  api: OrionAPIClient;
  
  // Logger estruturado
  logger: Logger;
  
  // Configurações (definidas pelo admin)
  config: PluginConfig;
  
  // Cache (Redis namespaced)
  cache: CacheClient;
  
  // Storage (S3 namespaced)
  storage: StorageClient;
  
  // Banco de dados (schema isolado do plugin)
  db: PrismaClient;
}
```

## 2.4 Isolamento de Dados

Cada plugin tem **schema próprio** no PostgreSQL:
- Schema `plugin_whatsapp` (apenas plugin acessa)
- Não pode ler schema `public` diretamente
- Acesso a dados do Orion apenas via API

---

# Capítulo 3 — Ciclo de Vida de Plugin

## 3.1 Estados

```
                    ┌─────────────┐
                    │  UNINSTALLED │
                    └──────┬──────┘
                           │ install()
                           ▼
                    ┌─────────────┐
                    │   INSTALLED  │
                    └──────┬──────┘
                           │ activate()
                           ▼
                    ┌─────────────┐
        ┌───────────│   ACTIVATED  │───────────┐
        │           └─────────────┘           │
        │ deactivate()              error()   │
        ▼                                      ▼
┌─────────────┐                        ┌─────────────┐
│  DEACTIVATED│                        │   ERROR     │
└──────┬──────┘                        └──────┬──────┘
       │ activate()                           │ fix + activate()
       └──────────────────────────────────────┘
                    ┌─────────────┐
                    │  UNINSTALLED │
                    └─────────────┘
```

## 3.2 Instalação

1. Admin seleciona plugin no marketplace
2. Sistema baixa pacote (`.tgz` ou via npm)
3. Valida assinatura criptográfica
4. Verifica compatibilidade de versão
5. Cria schema no banco
6. Roda migrations do plugin
7. Executa `plugin.install()`
8. Plugin fica como INSTALLED (ainda inativo)

## 3.3 Ativação

1. Admin configura plugin (fornece API keys, etc.)
2. Sistema valida config via schema
3. Executa `plugin.activate(context)`
4. Plugin registra rotas, UI, eventos
5. Estado muda para ACTIVATED
6. Recursos do plugin ficam disponíveis

## 3.4 Desativação

1. Admin desativa
2. Sistema notifica plugin (`plugin.deactivate()`)
3. Plugin limpa recursos (timers, listeners)
4. Rotas/UI removidas
5. Dados preservados (apenas inacessíveis)
6. Estado: DEACTIVATED

## 3.5 Desinstalação

1. Admin desinstala
2. Confirma (warning sobre dados)
3. Executa `plugin.uninstall()`
4. Remove schema do banco
5. Remove arquivos do plugin
6. Estado: UNINSTALLED

---

# Capítulo 4 — Marketplace (Loja)

## 4.1 Estrutura

```
Marketplace
├── Categorias
│   ├── Comunicação (WhatsApp, Telegram, Email)
│   ├── Integrações (ERP, CRM, E-commerce)
│   ├── BI e Relatórios
│   ├── Gamificação
│   ├── IA
│   ├── RH
│   ├── Financeiro
│   └── Setoriais (Farmácia, Supermercado, etc.)
├── Plugins Oficiais (by Orion team)
├── Plugins Parceiros (certified)
└── Plugins Comunidade (reviewed)
```

## 4.2 Página de Plugin

Cada plugin tem página com:
- **Nome, logo, descrição**
- **Screenshots** (5-10)
- **Vídeo demo** (opcional)
- **Documentação**
- **Avaliações** (1-5 estrelas + comentários)
- **Compatibilidade** (versões do Orion suportadas)
- **Permissões solicitadas** (transparente)
- **Preço** (gratuito, mensal, anual, one-time)
- **Botão instalar**
- **Changelog**

## 4.3 Categorias de Plugins Oficiais (v2.0)

| Plugin | Categoria | Preço | Descrição |
|--------|-----------|-------|-----------|
| WhatsApp Business | Comunicação | R$ 99/mês | Notificações via WhatsApp |
| Telegram Bot | Comunicação | R$ 49/mês | Bot para notificações e consultas |
| Email Avançado | Comunicação | R$ 79/mês | Templates, automações, tracking |
| Totvs Integration | Integração | R$ 199/mês | Sync com Totvs Protheus/RM |
| SAP B1 Integration | Integração | R$ 249/mês | Sync com SAP Business One |
| Sankhya Integration | Integração | R$ 199/mês | Sync com Sankhya |
| Salesforce CRM | Integração | R$ 299/mês | Sync com Salesforce |
| HubSpot CRM | Integração | R$ 199/mês | Sync com HubSpot |
| Shopify E-commerce | Integração | R$ 149/mês | Importa pedidos Shopify |
| Power BI Connector | BI | R$ 149/mês | Conector OData para Power BI |
| Gamificação Plus | Gamificação | R$ 99/mês | Medalhas avançadas, missões, níveis |
| IA Premium | IA | R$ 299/mês | IA com GPT-4, análise avançada |
| Gestão de Comissões | Financeiro | R$ 199/mês | Cálculo e pagamento de comissões |
| Controle de Estoque | Operacional | R$ 149/mês | Sync com sistemas de estoque |
| Treinamentos LMS | RH | R$ 199/mês | Biblioteca de treinamentos |

---

# Capítulo 5 — Modelo de Negócio

## 5.1 Revenue Share

| Categoria | % para Dev | % para Orion |
|-----------|------------|--------------|
| Plugins Oficiais (Orion) | 100% (Orion) | 100% (Orion) |
| Plugins Parceiros (certified) | 70% | 30% |
| Plugins Comunidade (reviewed) | 80% | 20% |

## 5.2 Modelos de Preço Suportados

- **Gratuito:** sem custo
- **One-time:** paga uma vez, usa para sempre
- **Mensal:** R$ X/mês
- **Anual:** R$ Y/ano (15% desconto)
- **Por usuário:** R$ X/usuário/mês
- **Por uso:** R$ X por 1000 calls
- **Freemium:** grátis até limite, paga para mais

## 5.3 Pagamentos

- Cliente paga via Orion (cartão, boleto, PIX)
- Orion repassa ao dev no mês seguinte
- Mínimo para saque: R$ 100
- Relatório de vendas no painel do desenvolvedor

---

# Capítulo 6 — Processo de Certificação

## 6.1 Níveis de Certificação

### Oficial (Orion Team)
- Desenvolvido pela equipe Orion
- Suporte prioritário
- SLA 24h
- Marcado com badge dourado

### Parceiro Certificado
- Desenvolvedor aprovado no programa
- Passou por code review da Orion
- Suporte pelo desenvolvedor (SLA 48h)
- Badge prateado

### Comunidade Reviewed
- Submetido por qualquer dev
- Passou por review automático + manual
- Suporte pelo desenvolvedor (best effort)
- Badge verde

## 6.2 Checklist de Certificação

### Segurança (Obrigatório)
- [ ] Código assinado criptograficamente
- [ ] Sem hardcoded secrets
- [ ] Validação de input em todas as APIs
- [ ] Sem chamadas a `eval()`, `Function()` ou `child_process`
- [ ] Sem uso de `any` em TypeScript
- [ ] Cobertura de testes > 60%
- [ ] Passou em SAST (SonarQube)
- [ ] Sem vulnerabilidades conhecidas (npm audit)

### Qualidade
- [ ] Documentação completa
- [ ] README com exemplos
- [ ] Screenshots atualizados
- [ ] Compatível com versão atual do Orion
- [ ] Performance aceitável (< 200ms overhead)

### Compliance
- [ ] LGPD: não coleta dados desnecessários
- [ ] Política de privacidade do plugin
- [ ] Termos de uso
- [ ] Sem coleta de dados sem consentimento

## 6.3 Processo de Submissão

```
1. Dev cria plugin localmente
2. Testa em ambiente de dev
3. Submete via Developer Portal
4. Validação automática (CI):
   - Lint
   - Testes
   - SAST
   - Tamanho do bundle
5. Review manual (equipe Orion):
   - Code review
   - Teste funcional
   - Verificação de segurança
6. Aprovação ou rejeição (com feedback)
7. Publicação no marketplace
8. Disponível para clientes
```

Tempo médio: 5-10 dias úteis.

---

# Capítulo 7 — Developer Portal

## 7.1 Cadastro de Desenvolvedor

1. Acesse `https://developers.orion.com`
2. Cadastre-se (pessoa ou empresa)
3. Verifique e-mail
4. Para Parceiro Certificado: submeta documentação da empresa
5. Aceite terms of service

## 7.2 Painel do Desenvolvedor

```
┌─────────────────────────────────────────────────┐
│  DEVELOPER PORTAL                               │
├─────────────────────────────────────────────────┤
│                                                 │
│  Meus Plugins                                   │
│  ├── WhatsApp Plus (Publicado, v1.2.0)         │
│  │   Vendas este mês: R$ 3.450                 │
│  │   Avaliação: 4.7 ⭐ (124 reviews)           │
│  ├── CRM Sync (Publicado, v2.0.1)              │
│  │   Vendas este mês: R$ 1.890                 │
│  └── Beta Plugin (Em review)                   │
│                                                 │
│  [+ Novo Plugin]                               │
│                                                 │
│  Documentação                                   │
│  ├── Guia de início rápido                     │
│  ├── API Reference                              │
│  ├── Exemplos                                   │
│  └── SDK                                        │
│                                                 │
│  Analytics                                      │
│  ├── Instalações ativas: 187                   │
│  ├── Receita total: R$ 28.450                  │
│  └── Próximo pagamento: R$ 5.340 (15/09)       │
└─────────────────────────────────────────────────┘
```

## 7.3 SDK para Desenvolvedores

```bash
# CLI para criar plugins
npx @orion/create-plugin my-plugin

# Desenvolver localmente
cd my-plugin
npm run dev  # Hot reload com Orion local

# Testar
npm test

# Build
npm run build  # Gera .tgz

# Submeter
npx @orion/publish my-plugin-1.0.0.tgz
```

## 7.4 Template de Plugin

```
my-plugin/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes.ts         # Rotas de API
│   ├── events.ts         # Handlers de eventos
│   ├── widgets/          # Widgets de UI
│   └── utils/
├── prisma/
│   └── schema.prisma     # Schema do plugin
├── tests/
├── docs/
│   └── README.md
├── screenshots/
├── package.json
├── orion.config.json     # Config do plugin
└── tsconfig.json
```

---

# Capítulo 8 — Hooks de Extensão

## 8.1 UI Hooks

Plugins podem injetar UI em pontos pré-definidos:

### Dashboard Widget
```typescript
// Widget no dashboard
registry.addWidget({
  id: 'whatsapp-stats',
  title: 'WhatsApp Stats',
  component: WhatsAppStatsWidget,
  size: 'medium', // small | medium | large
  position: 'right-column',
});
```

### Menu Item
```typescript
registry.addMenuItem({
  id: 'crm-sync',
  label: 'CRM Sync',
  icon: 'sync',
  route: '/plugins/crm-sync',
  permission: 'admin',
});
```

### Settings Tab
```typescript
registry.addSettingsTab({
  id: 'whatsapp-config',
  label: 'WhatsApp',
  component: WhatsAppConfig,
  order: 10,
});
```

## 8.2 Event Handlers

```typescript
// Reagir a eventos do Orion
bus.subscribe('result.created', async (event) => {
  // Plugin pode processar
  await sendWhatsAppNotification(event.data.userId);
});

bus.subscribe('goal.achieved', async (event) => {
  // Envia parabéns via WhatsApp
  await sendWhatsAppMessage(event.data.userId, 
    `Parabéns! Você atingiu ${event.data.achievementPercent}% da meta!`);
});
```

## 8.3 API Routes

Plugins podem expor APIs próprias:

```typescript
router.get('/stats', async (req, res) => {
  const stats = await getWhatsAppStats(req.user.companyId);
  res.json(stats);
});

router.post('/send-test', async (req, res) => {
  await sendTestMessage(req.body.phoneNumber);
  res.json({ success: true });
});
```

Rotas ficam em `/api/plugins/{plugin-name}/...`

## 8.4 Scheduled Tasks

```typescript
// Plugin pode agendar tasks
scheduler.addTask({
  id: 'daily-summary',
  cron: '0 18 * * *', // 18h diariamente
  handler: async (context) => {
    const summary = await generateDailySummary(context.companyId);
    await sendSummaryToManagers(summary);
  },
});
```

---

# Capítulo 9 — Segurança de Plugins

## 9.1 Sandbox

Plugins rodam em processo Node.js isolado (via `worker_threads` ou `vm2`):
- Não acessam filesystem diretamente
- Não acessam env do Orion
- Acesso a rede apenas via API client

## 9.2 Rate Limiting

Cada plugin tem rate limits:
- 1000 API calls/min
- 10000 API calls/hora
- Excede: plugin desativado temporariamente

## 9.3 Auditoria de Plugin

Toda ação do plugin é auditada:
- Quais endpoints chamou
- Quais eventos publicou
- Quais dados acessou
- Latência introduzida

## 9.4 Quarentena

Se plugin causar:
- Erro 500 em mais de 5% das requests
- Latência > 5s em mais de 10% das requests
- Exceção não tratada

Sistema automaticamente desativa plugin e notifica admin.

---

# Capítulo 10 — Versionamento de Plugins

## 10.1 SemVer

Plugins usam Semantic Versioning:
- `1.0.0` → `1.0.1`: bug fix (compatível)
- `1.0.0` → `1.1.0`: nova feature (compatível)
- `1.0.0` → `2.0.0`: breaking change (requer migração)

## 10.2 Atualização

1. Dev publica nova versão no marketplace
2. Clientes veem "Atualização disponível"
3. Admin decide atualizar
4. Sistema roda migrations do plugin
5. Plugin reinicia com nova versão
6. Rollback possível se quebrar

## 10.3 Compatibilidade

Dev declara compatibilidade:
```json
{
  "orion": {
    "compatibility": ">=1.5.0 <2.0.0"
  }
}
```

Sistema bloqueia instalação se Orion não compatível.

---

# Capítulo 11 — Métricas de Sucesso do Marketplace

## 11.1 KPIs do Marketplace

| Métrica | Meta v2.0 | Meta v3.0 | Meta v4.0 |
|---------|-----------|-----------|-----------|
| Plugins disponíveis | 15 | 50 | 150 |
| Desenvolvedores ativos | 5 | 30 | 100 |
| Plugins instalados/cliente | 1.5 | 2.5 | 4.0 |
| Receita marketplace (mensal) | R$ 50k | R$ 250k | R$ 1M |
| Avaliação média | 4.3+ | 4.5+ | 4.6+ |
| Taxa de desinstalação (30d) | < 15% | < 10% | < 8% |

## 11.2 Métricas por Plugin

Cada dev vê no painel:
- Instalações ativas
- Instalações por período
- Desinstalações
- Receita
- Avaliação média
- Issues reportadas
- Latência média
- Uso de API

---

# Capítulo 12 — Roadmap do Marketplace

## v2.0 (Q1-Q2 2026)
- Lançamento do marketplace
- 5-10 plugins oficiais
- SDK JavaScript
- Developer Portal
- Revenue share 70/30
- Certificação manual

## v2.5 (Q3 2026)
- SDK Python
- Plugins certificados por parceiros
- Mais 10-15 plugins
- Analytics avançados para devs

## v3.0 (Q1-Q2 2027)
- Abertura para comunidade
- 30+ plugins
- SDK PHP
- Auto-certificação para plugins gratuitos
- Marketplace themes (além de plugins)

## v4.0 (2028)
- 100+ plugins
- Programa de parceiros premium
- Hackathons anuais
- Comunidade open-source
- Marketplace em múltiplos países

---

# Capítulo 13 — Concorrência e Diferenciação

## 13.1 Comparação com Outros Marketplaces

| Plataforma | Modelo | % Dev | Diferencial Orion |
|------------|--------|-------|--------------------|
| Shopify App Store | E-commerce | 80/20 | Foco em gestão comercial (não e-com) |
| Atlassian Marketplace | Dev tools | 75/25 | Foco em vendas (não dev) |
| HubSpot Marketplace | CRM/Marketing | 80/20 | Multi-segmento (não só marketing) |
| Salesforce AppExchange | Enterprise | 70/30 | Acessível para PMEs (não só enterprise) |

## 13.2 Vantagem Competitiva do Orion Marketplace

1. **Único marketplace nacional** para gestão comercial
2. **Construtor de indicadores** permite plugins setoriais sem alterar core
3. **Multi-segmento** → plugins podem atender qualquer nicho
4. **Comunidade brasileira** → menos barreira de idioma
5. **Plugin-based desde v1.0** → arquitetura madura quando marketplace lançar

---

# Capítulo 14 — Plugin Development Guide Detalhado

Guia completo para desenvolvedores criarem plugins do Orion. Do conceito à publicação.

## 14.1 Pré-Requisitos

### Conhecimento Técnico
- JavaScript/TypeScript (intermediário+)
- Node.js 20+ e npm
- React 18+ (para UI)
- Conceitos de API REST
- Prisma ORM (básico)

### Ambiente de Desenvolvimento
- Node.js 20+ instalado
- VS Code (recomendado) com extensões:
  - ESLint
  - Prettier
  - TypeScript Vue Plugin (Volar)
- Conta no GitHub (para versionamento)
- Conta no Developer Portal Orion

## 14.2 Criando Seu Primeiro Plugin

### Passo 1: Scaffold
```bash
# Instalar CLI Orion
npm install -g @orion/cli

# Criar plugin
orion create-plugin my-first-plugin
# ? Descrição: Meu primeiro plugin para o Orion
# ? Categoria: (selecione) Comunicação
# ? Tipo: Free ou Paid
# ? Revenue share: 70/30 (default)

cd my-first-plugin
```

### Passo 2: Entender Estrutura
```
my-first-plugin/
├── src/
│   ├── index.ts              # Entry point (orquestra lifecycle)
│   ├── plugin.ts             # Classe principal do plugin
│   ├── routes.ts             # Rotas HTTP do plugin
│   ├── events.ts             # Handlers de eventos
│   ├── widgets/              # Componentes React
│   │   ├── MyWidget.tsx
│   │   └── MySettings.tsx
│   ├── services/             # Lógica de negócio
│   │   └── MyService.ts
│   └── utils/
├── prisma/
│   ├── schema.prisma         # Schema do banco do plugin
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── README.md
│   ├── INSTALL.md
│   └── CHANGELOG.md
├── screenshots/              # Para marketplace
├── package.json
├── orion.config.json         # Config do plugin
├── tsconfig.json
├── jest.config.js
└── .eslintrc.json
```

### Passo 3: package.json
```json
{
  "name": "orion-my-first-plugin",
  "version": "1.0.0",
  "description": "Meu primeiro plugin para o Orion",
  "main": "dist/index.js",
  "scripts": {
    "dev": "orion-plugin dev",
    "build": "tsc && orion-plugin build",
    "test": "jest",
    "test:e2e": "orion-plugin test:e2e",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "publish": "orion-plugin publish"
  },
  "orion": {
    "type": "plugin",
    "category": "communication",
    "compatibility": ">=1.5.0 <2.0.0",
    "permissions": [
      "api:read:users",
      "api:write:notifications",
      "event:subscribe:result.created",
      "event:subscribe:goal.achieved",
      "ui:inject:dashboard.widget",
      "ui:inject:settings.tab"
    ],
    "config": {
      "type": "object",
      "properties": {
        "apiKey": {
          "type": "string",
          "title": "API Key",
          "description": "Chave de API do serviço externo"
        },
        "enabledEvents": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["result.created", "goal.achieved"]
          },
          "default": ["goal.achieved"]
        }
      },
      "required": ["apiKey"]
    }
  },
  "dependencies": {
    "@orion/plugin-sdk": "^1.5.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@orion/plugin-cli": "^1.5.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "eslint": "^8.0.0"
  },
  "peerDependencies": {
    "@orion/core": "^1.5.0"
  }
}
```

### Passo 4: Implementar Lifecycle (plugin.ts)
```typescript
import { OrionPlugin, PluginContext, PluginRouter, UIRegistry, EventBus } from '@orion/plugin-sdk';
import { MyService } from './services/MyService';
import { registerRoutes } from './routes';
import { registerEventHandlers } from './events';
import { MyWidget } from './widgets/MyWidget';
import { MySettings } from './widgets/MySettings';

export class MyFirstPlugin implements OrionPlugin {
  name = 'orion-my-first-plugin';
  version = '1.0.0';
  author = 'João Silva <joao@example.com>';
  description = 'Meu primeiro plugin para o Orion';
  
  private service?: MyService;
  private context?: PluginContext;
  
  async install(): Promise<void> {
    // Rodado uma vez na instalação
    // Pode criar dados iniciais, validar pré-requisitos, etc.
    console.log('Plugin instalando...');
  }
  
  async activate(context: PluginContext): Promise<void> {
    this.context = context;
    this.service = new MyService(context);
    
    context.logger.info({ version: this.version }, 'Plugin ativado');
    
    // Verificar saúde do serviço externo
    const health = await this.service.checkHealth();
    if (!health.ok) {
      throw new Error(`Serviço externo indisponível: ${health.error}`);
    }
  }
  
  async deactivate(): Promise<void> {
    // Limpar recursos
    this.service?.cleanup();
    this.context?.logger.info('Plugin desativado');
  }
  
  async uninstall(): Promise<void> {
    // Limpar dados (opcional — geralmente preservamos para reinstalação)
    this.context?.logger.info('Plugin desinstalado');
  }
  
  registerRoutes(router: PluginRouter): void {
    registerRoutes(router, this.service!);
  }
  
  registerUI(registry: UIRegistry): void {
    registry.addWidget({
      id: 'my-widget',
      title: 'My Widget',
      component: MyWidget,
      size: 'medium',
      position: 'right-column',
      defaultEnabled: true
    });
    
    registry.addSettingsTab({
      id: 'my-plugin-settings',
      label: 'My Plugin',
      component: MySettings,
      order: 50
    });
  }
  
  registerEventHandlers(bus: EventBus): void {
    registerEventHandlers(bus, this.service!);
  }
}

export default MyFirstPlugin;
```

### Passo 5: Routes (routes.ts)
```typescript
import { PluginRouter } from '@orion/plugin-sdk';
import { MyService } from './services/MyService';
import { z } from 'zod';

const sendTestSchema = z.object({
  message: z.string().min(1).max(500)
});

export function registerRoutes(router: PluginRouter, service: MyService): void {
  // GET /api/plugins/orion-my-first-plugin/stats
  router.get('/stats', async (req, res) => {
    const stats = await service.getStats(req.user.tenantId);
    res.json(stats);
  });
  
  // POST /api/plugins/orion-my-first-plugin/send-test
  router.post('/send-test', async (req, res) => {
    try {
      const { message } = sendTestSchema.parse(req.body);
      const result = await service.sendTest(req.user.tenantId, message);
      res.json({ success: true, id: result.id });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  
  // GET /api/plugins/orion-my-first-plugin/config
  router.get('/config', async (req, res) => {
    const config = await service.getConfig(req.user.tenantId);
    res.json(config);
  });
}
```

### Passo 6: Event Handlers (events.ts)
```typescript
import { EventBus } from '@orion/plugin-sdk';
import { MyService } from './services/MyService';

export function registerEventHandlers(bus: EventBus, service: MyService): void {
  bus.subscribe('result.created', async (event) => {
    try {
      await service.handleNewResult(event.data);
    } catch (e) {
      bus.logger.error({ err: e, eventId: event.id }, 'Failed to handle result.created');
    }
  });
  
  bus.subscribe('goal.achieved', async (event) => {
    try {
      await service.sendCongratulations(event.data);
    } catch (e) {
      bus.logger.error({ err: e }, 'Failed to send congratulations');
    }
  });
}
```

### Passo 7: Service (services/MyService.ts)
```typescript
import { PluginContext } from '@orion/plugin-sdk';

export class MyService {
  constructor(private context: PluginContext) {}
  
  async checkHealth(): Promise<{ ok: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.context.config.apiBaseUrl}/health`);
      return { ok: response.ok };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
  
  async getStats(tenantId: number) {
    const cacheKey = `stats:${tenantId}`;
    const cached = await this.context.cache.get(cacheKey);
    if (cached) return cached;
    
    const count = await this.context.db.notification.count({
      where: { tenant_id: tenantId, plugin: 'my-first-plugin' }
    });
    
    const stats = {
      totalSent: count,
      lastSent: await this.getLastSentDate(tenantId)
    };
    
    await this.context.cache.set(cacheKey, stats, 300);  // 5 min
    return stats;
  }
  
  async sendTest(tenantId: number, message: string) {
    const response = await fetch(`${this.context.config.apiBaseUrl}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.context.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tenantId, message, timestamp: Date.now() })
    });
    
    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    await this.context.db.notification.create({
      data: {
        tenant_id: tenantId,
        plugin: 'my-first-plugin',
        external_id: result.id,
        sent_at: new Date()
      }
    });
    
    return result;
  }
  
  async handleNewResult(data: any) {
    if (!this.context.config.enabledEvents.includes('result.created')) return;
    
    this.context.logger.info({ resultId: data.resultId }, 'Processing new result');
    // Implementar lógica
  }
  
  async sendCongratulations(data: any) {
    const message = `Parabéns ${data.userName}! Você atingiu ${data.achievementPercent}% da meta!`;
    await this.sendTest(data.tenantId, message);
  }
  
  private async getLastSentDate(tenantId: number) {
    const last = await this.context.db.notification.findFirst({
      where: { tenant_id: tenantId, plugin: 'my-first-plugin' },
      orderBy: { sent_at: 'desc' }
    });
    return last?.sent_at;
  }
  
  async getConfig(tenantId: number) {
    return {
      apiBaseUrl: this.context.config.apiBaseUrl,
      hasApiKey: !!this.context.config.apiKey,
      enabledEvents: this.context.config.enabledEvents
    };
  }
  
  cleanup() {
    // Cleanup timers, connections, etc.
  }
}
```

### Passo 8: Widget (widgets/MyWidget.tsx)
```tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Stat, Button } from '@orion/plugin-sdk/ui';
import { usePluginApi } from '@orion/plugin-sdk/react';

export function MyWidget() {
  const api = usePluginApi();
  const [stats, setStats] = useState<{ totalSent: number; lastSent: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    api.get('/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [api]);
  
  if (loading) return <div>Carregando...</div>;
  if (!stats) return <div>Erro ao carregar</div>;
  
  return (
    <Card>
      <CardHeader title="My Plugin Stats" />
      <CardBody>
        <Stat label="Total enviado" value={stats.totalSent} />
        <Stat label="Último envio" value={new Date(stats.lastSent).toLocaleString('pt-BR')} />
        <Button onClick={() => api.post('/send-test', { message: 'Teste!' })}>
          Enviar Teste
        </Button>
      </CardBody>
    </Card>
  );
}
```

### Passo 9: Settings (widgets/MySettings.tsx)
```tsx
import React, { useState } from 'react';
import { Form, Input, Button, Alert } from '@orion/plugin-sdk/ui';

export function MySettings() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  
  const handleSave = async () => {
    // Salvar via API admin
    setSaved(true);
  };
  
  return (
    <div>
      <h3>Configurações do My Plugin</h3>
      {saved && <Alert type="success">Configurações salvas!</Alert>}
      <Form onSubmit={handleSave}>
        <Input
          label="API Key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          required
        />
        <Button type="submit">Salvar</Button>
      </Form>
    </div>
  );
}
```

### Passo 10: Testar Localmente
```bash
# Iniciar em modo dev (conecta a Orion local)
npm run dev

# Plugin fica disponível em http://localhost:3000/plugins/orion-my-first-plugin
# Hot reload ativo

# Rodar testes
npm test

# Build
npm run build

# Gerar pacote
orion-plugin pack
# Gera my-first-plugin-1.0.0.tgz
```

---

# Capítulo 15 — 10+ Exemplos de Plugins Completos

Catálogo de plugins de referência com código completo. Cada exemplo demonstra um padrão arquitetural diferente.

## 15.1 Plugin: Daily Quote (Motivacional)
**Categoria:** Gamificação
**Preço:** Grátis
**Pattern:** Event-driven + widget simples

```typescript
// plugin.ts
export class DailyQuotePlugin implements OrionPlugin {
  name = 'orion-daily-quote';
  version = '1.0.0';
  
  private quotes = [
    'O sucesso é a soma de pequenos esforços repetidos dia após dia.',
    'Vender é ajudar pessoas a tomarem decisões que beneficiem elas.',
    'Meta sem data é só um desejo. Coloque data!',
    // ... 100+ quotes
  ];
  
  async activate(context: PluginContext) {
    // Schedule: 9h todo dia
    context.scheduler.addTask({
      id: 'daily-quote',
      cron: '0 9 * * *',
      handler: async (ctx) => {
        const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        const users = await ctx.api.users.list({ active: true });
        for (const user of users) {
          await ctx.api.notifications.create({
            userId: user.id,
            type: 'info',
            title: 'Frase do dia',
            message: quote,
            category: 'motivational'
          });
        }
      }
    });
  }
  
  registerUI(registry: UIRegistry) {
    registry.addWidget({
      id: 'daily-quote-widget',
      title: 'Frase do Dia',
      component: DailyQuoteWidget,
      size: 'small'
    });
  }
}

// Widget
function DailyQuoteWidget() {
  const [quote, setQuote] = useState('');
  useEffect(() => {
    fetch('/api/plugins/orion-daily-quote/today')
      .then(r => r.json())
      .then(d => setQuote(d.quote));
  }, []);
  return <Card><Blockquote>{quote}</Blockquote></Card>;
}
```

## 15.2 Plugin: Birthday Reminder
**Categoria:** RH
**Preço:** R$ 49/mês
**Pattern:** Schedule + notification

```typescript
export class BirthdayPlugin implements OrionPlugin {
  async activate(context: PluginContext) {
    context.scheduler.addTask({
      id: 'birthday-check',
      cron: '0 8 * * *',  // 8h todo dia
      handler: async (ctx) => {
        const today = new Date();
        const monthDay = `${today.getMonth() + 1}-${today.getDate()}`;
        
        const birthdayUsers = await ctx.db.user.findMany({
          where: {
            active: true,
            birth_date: { not: null },
            // Query: aniversariantes do dia
          }
        });
        
        for (const user of birthdayUsers) {
          // Notificar toda a empresa
          await ctx.api.notifications.create({
            type: 'celebration',
            title: '🎂 Aniversariante do dia!',
            message: `Hoje é aniversário de ${user.full_name}! Dê os parabéns!`,
            broadcast: true,
            tenantId: ctx.companyId
          });
          
          // Email para o aniversariante
          await ctx.api.emails.send({
            to: user.email,
            template: 'birthday-wishes',
            data: { name: user.full_name }
          });
        }
      }
    });
  }
}
```

## 15.3 Plugin: Weather Forecast (Alerta de chuva para vendedores externos)
**Categoria:** Produtividade
**Preço:** R$ 79/mês
**Pattern:** API externa + scheduled

```typescript
export class WeatherPlugin implements OrionPlugin {
  async activate(context: PluginContext) {
    context.scheduler.addTask({
      id: 'weather-morning',
      cron: '0 6 * * *',  // 6h
      handler: async (ctx) => {
        const branches = await ctx.api.branches.list();
        for (const branch of branches) {
          const weather = await this.getWeather(branch.city);
          if (weather.willRain) {
            const users = await ctx.api.users.list({ branchId: branch.id, role: 'seller' });
            for (const user of users) {
              await ctx.api.notifications.create({
                userId: user.id,
                type: 'warning',
                title: '☔ Chuva prevista hoje',
                message: `${weather.rainProbability}% de chance de chuva em ${branch.city} às ${weather.rainTime}. Leve guarda-chuva!`,
                category: 'weather'
              });
            }
          }
        }
      }
    });
  }
  
  private async getWeather(city: string) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=pt_br`);
    const data = await response.json();
    return {
      willRain: data.list.some((item: any) => item.weather[0].main === 'Rain'),
      rainProbability: Math.max(...data.list.map((item: any) => item.pop * 100)),
      rainTime: data.list.find((item: any) => item.weather[0].main === 'Rain')?.dt_txt
    };
  }
}
```

## 15.4 Plugin: KPI Forecast (IA)
**Categoria:** IA
**Preço:** R$ 299/mês
**Pattern:** ML prediction + insight

```typescript
export class KpiForecastPlugin implements OrionPlugin {
  async activate(context: PluginContext) {
    context.scheduler.addTask({
      id: 'daily-forecast',
      cron: '0 7 * * *',  // 7h
      handler: async (ctx) => {
        const activeGoals = await ctx.api.goals.list({ status: 'active' });
        for (const goal of activeGoals) {
          const historicalData = await this.getHistorical(ctx, goal.userId, goal.indicatorId);
          const forecast = await this.predict(ctx, historicalData, goal);
          
          if (forecast.willMiss) {
            await ctx.api.insights.create({
              userId: goal.userId,
              type: 'warning',
              title: '⚠️ Meta em risco',
              message: `Baseado no ritmo atual, você atingirá ${forecast.predictedPercent}% da meta. Falta ${forecast.shortfall} para atingir.`,
              actionUrl: '/dashboard',
              actionLabel: 'Ver detalhes'
            });
          }
        }
      }
    });
  }
  
  private async predict(ctx, history, goal) {
    // Linear regression on last 30 days
    const slope = this.calculateSlope(history);
    const remainingDays = this.daysUntil(goal.endDate);
    const projected = history[history.length - 1] + (slope * remainingDays);
    return {
      predictedPercent: (projected / goal.targetValue) * 100,
      willMiss: projected < goal.targetValue * 0.95,
      shortfall: Math.max(0, goal.targetValue - projected)
    };
  }
}
```

## 15.5 Plugin: Multi-tenant CRM Sync (Bidirectional)
**Categoria:** Integração
**Preço:** R$ 199/mês
**Pattern:** Bidirectional sync

```typescript
export class CRMSyncPlugin implements OrionPlugin {
  private syncInterval?: NodeJS.Timeout;
  
  async activate(context: PluginContext) {
    // Bidirectional sync every 5 min
    this.syncInterval = setInterval(() => this.sync(context), 5 * 60 * 1000);
    
    // Real-time on result.created
    context.eventBus.subscribe('result.created', async (event) => {
      await this.pushToCRM(context, event.data);
    });
  }
  
  async deactivate() {
    clearInterval(this.syncInterval);
  }
  
  private async sync(ctx) {
    // Pull from CRM
    const crmDeals = await this.fetchCRMDeals(ctx);
    for (const deal of crmDeals) {
      const exists = await ctx.api.results.findByExternalId(deal.id);
      if (!exists) {
        await ctx.api.results.create({
          userId: await this.mapSeller(ctx, deal.ownerId),
          value: deal.amount,
          date: deal.closeDate,
          externalId: deal.id,
          externalSource: 'crm-sync'
        });
      }
    }
    
    // Push to CRM (results not synced yet)
    const unpushed = await ctx.db.result.findMany({
      where: { crm_synced_at: null, deleted_at: null }
    });
    for (const result of unpushed) {
      await this.pushToCRM(ctx, result);
      await ctx.db.result.update({
        where: { id: result.id },
        data: { crm_synced_at: new Date() }
      });
    }
  }
}
```

## 15.6 Plugin: PDF Report Generator
**Categoria:** BI
**Preço:** R$ 149/mês
**Pattern:** Async job + storage

```typescript
export class PDFReportPlugin implements OrionPlugin {
  registerRoutes(router: PluginRouter) {
    router.post('/generate', async (req, res) => {
      const { period, branchId } = req.body;
      
      // Enfileira job
      const job = await this.queue.add('generate-pdf', {
        tenantId: req.user.tenantId,
        period,
        branchId,
        requestedBy: req.user.id
      });
      
      res.json({ jobId: job.id, status: 'queued' });
    });
    
    router.get('/status/:jobId', async (req, res) => {
      const job = await this.queue.getJob(req.params.jobId);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      res.json({
        status: await job.getState(),
        progress: job.progress,
        result: job.returnvalue
      });
    });
  }
  
  async activate(context: PluginContext) {
    this.queue = new Queue('pdf-generation', { connection: context.redis });
    
    new Worker('pdf-generation', async (job) => {
      const { tenantId, period, branchId } = job.data;
      
      job.updateProgress(10);
      const data = await this.collectData(tenantId, period, branchId);
      
      job.updateProgress(50);
      const html = await this.renderHTML(data);
      
      job.updateProgress(70);
      const pdf = await this.htmlToPdf(html);
      
      job.updateProgress(90);
      const path = `tenants/t${tenantId}/reports/${period}-${branchId}.pdf`;
      const url = await context.storage.put(path, pdf);
      
      job.updateProgress(100);
      return { url, expiresAt: Date.now() + 86400000 };
    }, { connection: context.redis, concurrency: 3 });
  }
  
  private async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdf;
  }
}
```

## 15.7 Plugin: Slack Integration
**Categoria:** Comunicação
**Preço:** R$ 99/mês
**Pattern:** Webhook outbound

```typescript
export class SlackPlugin implements OrionPlugin {
  registerEventHandlers(bus: EventBus) {
    bus.subscribe('goal.achieved', async (event) => {
      await this.postMessage(bus.context, {
        channel: '#vendas',
        text: `🎯 ${event.data.userName} atingiu ${event.data.achievementPercent}% da meta!`,
        attachments: [{
          color: 'good',
          fields: [
            { title: 'Meta', value: `R$ ${event.data.targetValue}`, short: true },
            { title: 'Atingido', value: `R$ ${event.data.achievedValue}`, short: true }
          ]
        }]
      });
    });
    
    bus.subscribe('campaign.ended', async (event) => {
      const winners = event.data.winners;
      const text = winners.map((w, i) => 
        `${i + 1}º ${w.userName} - ${w.score} pontos - ${w.award}`
      ).join('\n');
      
      await this.postMessage(bus.context, {
        channel: '#vendas',
        text: `🏆 Campanha "${event.data.name}" encerrada! Ganhadores:\n${text}`
      });
    });
  }
  
  private async postMessage(context, payload) {
    await fetch(context.config.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
}
```

## 15.8 Plugin: Goal Template Library
**Categoria:** Produtividade
**Preço:** Grátis
**Pattern:** UI-heavy + CRUD

```typescript
export class GoalTemplatePlugin implements OrionPlugin {
  registerRoutes(router: PluginRouter) {
    router.get('/templates', async (req, res) => {
      const templates = await this.getTemplates(req.query.category);
      res.json(templates);
    });
    
    router.post('/apply/:templateId', async (req, res) => {
      const template = await this.getTemplate(req.params.templateId);
      const users = req.body.userIds || await this.api.users.list({ active: true });
      
      for (const userId of users) {
        await this.api.goals.create({
          userId,
          indicatorId: template.indicatorId,
          targetValue: template.targetValue * this.adjustForUser(userId),
          goalType: template.type,
          startDate: template.startDate,
          endDate: template.endDate
        });
      }
      
      res.json({ applied: users.length });
    });
  }
  
  registerUI(registry: UIRegistry) {
    registry.addMenuItem({
      id: 'goal-templates',
      label: 'Modelos de Meta',
      icon: 'template',
      route: '/plugins/goal-templates'
    });
  }
}
```

## 15.9 Plugin: Performance Coach (IA Conversacional)
**Categoria:** IA
**Preço:** R$ 199/mês
**Pattern:** Chat interface + LLM

```typescript
export class PerformanceCoachPlugin implements OrionPlugin {
  registerRoutes(router: PluginRouter) {
    router.post('/chat', async (req, res) => {
      const { message, userId } = req.body;
      
      // Context: user's recent performance
      const context = await this.buildContext(userId);
      
      // LLM call
      const response = await this.callLLM(message, context);
      
      // Store conversation
      await this.context.db.message.create({
        data: {
          user_id: userId,
          role: 'user',
          content: message,
          timestamp: new Date()
        }
      });
      await this.context.db.message.create({
        data: {
          user_id: userId,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }
      });
      
      res.json({ response });
    });
  }
  
  private async buildContext(userId: number) {
    const goals = await this.context.api.goals.list({ userId, status: 'active' });
    const results = await this.context.api.results.list({ 
      userId, 
      dateFrom: subDays(new Date(), 30) 
    });
    return `
User has ${goals.length} active goals.
Latest goal: ${goals[0]?.indicatorName} - ${goals[0]?.achievementPercent}% achieved.
Last 30 days results: ${results.length} entries, total value R$ ${this.sum(results)}.
Average daily: R$ ${this.avg(results)}.
    `;
  }
  
  private async callLLM(message: string, context: string) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are a sales performance coach. Be encouraging and specific. Context: ${context}` },
          { role: 'user', content: message }
        ],
        max_tokens: 500
      })
    });
    return (await response.json()).choices[0].message.content;
  }
}
```

## 15.10 Plugin: Commission Calculator
**Categoria:** Financeiro
**Preço:** R$ 199/mês
**Pattern:** Background calculation + reporting

```typescript
export class CommissionPlugin implements OrionPlugin {
  async activate(context: PluginContext) {
    // Recalcular comissões diariamente
    context.scheduler.addTask({
      id: 'commission-daily',
      cron: '0 23 * * *',  // 23h
      handler: async (ctx) => {
        const today = new Date();
        const users = await ctx.api.users.list({ active: true, role: 'seller' });
        
        for (const user of users) {
          const results = await ctx.api.results.list({
            userId: user.id,
            dateFrom: startOfDay(today),
            dateTo: endOfDay(today),
            status: 'approved'
          });
          
          const totalSales = results.reduce((sum, r) => sum + r.value, 0);
          const rule = await this.getCommissionRule(ctx, user.id);
          const commission = this.calculate(totalSales, rule);
          
          await ctx.db.commission.upsert({
            where: { user_id_date: { user_id: user.id, date: today } },
            create: {
              user_id: user.id,
              date: today,
              total_sales: totalSales,
              commission_rate: rule.rate,
              commission_value: commission,
              rule_id: rule.id
            },
            update: {
              total_sales: totalSales,
              commission_value: commission
            }
          });
        }
      }
    });
  }
  
  registerRoutes(router: PluginRouter) {
    router.get('/commissions', async (req, res) => {
      const { userId, dateFrom, dateTo } = req.query;
      const commissions = await this.context.db.commission.findMany({
        where: {
          user_id: userId ? parseInt(userId) : undefined,
          date: { gte: dateFrom, lte: dateTo }
        }
      });
      res.json(commissions);
    });
    
    router.post('/export', async (req, res) => {
      const { month } = req.body;
      const data = await this.context.db.commission.findMany({
        where: { date: { gte: `${month}-01`, lte: `${month}-31` } }
      });
      const excel = await this.generateExcel(data);
      res.json({ downloadUrl: excel });
    });
  }
}
```

## 15.11 Plugin: A/B Test Framework
**Categoria:** Analytics
**Preço:** R$ 199/mês
**Pattern:** Experimentation framework

```typescript
export class ABTestPlugin implements OrionPlugin {
  registerRoutes(router: PluginRouter) {
    router.post('/experiments', async (req, res) => {
      const { name, variants, metric } = req.body;
      const experiment = await this.context.db.experiment.create({
        data: {
          name,
          variants: JSON.stringify(variants),
          metric,
          status: 'running',
          start_date: new Date()
        }
      });
      res.json(experiment);
    });
    
    router.get('/assign/:experimentId/:userId', async (req, res) => {
      const { experimentId, userId } = req.params;
      
      // Hash-based deterministic assignment
      const hash = this.hash(`${experimentId}-${userId}`);
      const experiment = await this.context.db.experiment.findUnique({
        where: { id: parseInt(experimentId) }
      });
      const variants = JSON.parse(experiment.variants);
      const variantIndex = hash % variants.length;
      
      res.json({ variant: variants[variantIndex] });
    });
    
    router.get('/results/:experimentId', async (req, res) => {
      const results = await this.calculateResults(parseInt(req.params.experimentId));
      res.json(results);
    });
  }
}
```

---

# Capítulo 16 — Plugin Lifecycle Hooks Detalhado

## 16.1 Hooks Disponíveis

| Hook | Quando Executa | Síncrono? | Pode Falhar? |
|------|----------------|-----------|--------------|
| `install()` | Após download e validação | Sim | Sim (aborta instalação) |
| `activate(context)` | Após install ou manualmente | Sim | Sim (vai para ERROR) |
| `deactivate()` | Manual ou antes de uninstall | Sim | Sim (loga mas continua) |
| `uninstall()` | Quando admin remove | Sim | Sim (continua com cleanup) |
| `onConfigChange(newConfig)` | Quando admin atualiza config | Sim | Sim (reverte config) |
| `onUserCreated(user)` | Event user.created | Assíncrono | Sim (loga) |
| `onUserDeleted(userId)` | Event user.deleted | Assíncrono | Sim |
| `onCompanyConfigChanged(config)` | Quando config empresa muda | Assíncrono | Sim |
| `onTenantUpgraded(newPlan)` | Quando tenant muda de plano | Assíncrono | Sim |
| `beforeResultCreate(data)` | Hook antes de criar resultado | Síncrono | Sim (aborta) |
| `afterResultCreate(result)` | Hook depois de criar resultado | Assíncrono | Sim |
| `beforeGoalUpdate(goal)` | Hook antes de atualizar meta | Síncrono | Sim |
| `onError(error, context)` | Quando plugin gera erro | Assíncrono | N/A |
| `healthCheck()` | Periodicamente | Síncrono | Sim |

## 16.2 Exemplos

### install() com Validação
```typescript
async install(): Promise<void> {
  // Verificar se config tem pré-requisitos
  const config = await this.context!.config.getAll();
  if (!config.apiKey) {
    throw new Error('API Key é obrigatória. Configure antes de instalar.');
  }
  
  // Verificar conectividade
  const response = await fetch(`${config.apiBaseUrl}/health`);
  if (!response.ok) {
    throw new Error(`Não foi possível conectar a ${config.apiBaseUrl}. Verifique URL e API Key.`);
  }
  
  // Criar tabelas adicionais (além das migrations automáticas)
  await this.context!.db.$executeRaw`CREATE INDEX IF NOT EXISTS idx_plugin_lookup ON plugin_table(tenant_id, external_id)`;
  
  // Pré-popular dados
  await this.seedInitialData();
  
  this.context!.logger.info('Plugin instalado com sucesso');
}
```

### onConfigChange com Migração
```typescript
async onConfigChange(newConfig: any): Promise<void> {
  const oldConfig = await this.context!.config.getAll();
  
  // Se webhook URL mudou, re-registrar
  if (newConfig.webhookUrl !== oldConfig.webhookUrl) {
    await this.unregisterWebhook(oldConfig.webhookUrl);
    await this.registerWebhook(newConfig.webhookUrl);
  }
  
  // Se eventos mudaram, atualizar subscriptions
  if (JSON.stringify(newConfig.events) !== JSON.stringify(oldConfig.events)) {
    await this.context!.eventBus.resubscribe(newConfig.events);
  }
  
  await this.context!.config.update(newConfig);
  this.context!.logger.info({ newConfig }, 'Configuração atualizada');
}
```

### healthCheck
```typescript
async healthCheck(): Promise<{ ok: boolean; details?: any }> {
  try {
    const start = Date.now();
    const response = await fetch(`${this.context!.config.apiBaseUrl}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    const latency = Date.now() - start;
    
    return {
      ok: response.ok,
      details: {
        latency,
        statusCode: response.status,
        checkedAt: new Date().toISOString()
      }
    };
  } catch (e) {
    return {
      ok: false,
      details: { error: e.message }
    };
  }
}
```

## 16.3 Estado vs Hooks
```
UNINSTALLED → install() → INSTALLED → activate() → ACTIVATED
                                                          │
                                                          │ onConfigChange()
                                                          │ healthCheck()
                                                          │ onUserCreated()
                                                          │ onUserDeleted()
                                                          │ beforeResultCreate()
                                                          │ afterResultCreate()
                                                          │ onError()
                                                          ▼
                                                       (running)
                                                          │
                                                deactivate()│error()
                                                          ▼
                                                       DEACTIVATED/ERROR
                                                          │
                                                  activate()│uninstall()
                                                          ▼
                                                       ACTIVATED/UNINSTALLED
```

---

# Capítulo 17 — API Surface para Plugins

## 17.1 OrionAPIClient (Disponível no PluginContext)

### Users
```typescript
interface UsersApi {
  list(filter?: { active?: boolean; role?: string; branchId?: number }): Promise<User[]>;
  get(id: number): Promise<User>;
  getByEmail(email: string): Promise<User | null>;
  create(data: { email: string; fullName: string; role: string; branchId: number }): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
  deactivate(id: number): Promise<void>;
}
```

### Goals
```typescript
interface GoalsApi {
  list(filter?: { userId?: number; status?: string; indicatorId?: number }): Promise<Goal[]>;
  get(id: number): Promise<Goal>;
  create(data: GoalCreateInput): Promise<Goal>;
  update(id: number, data: Partial<GoalCreateInput>): Promise<Goal>;
  delete(id: number): Promise<void>;
  recalculate(tenantId: number, period: string): Promise<void>;
}
```

### Results
```typescript
interface ResultsApi {
  list(filter?: { userId?: number; dateFrom?: string; dateTo?: string; status?: string }): Promise<Result[]>;
  get(id: number): Promise<Result>;
  findByExternalId(externalId: string): Promise<Result | null>;
  create(data: ResultCreateInput): Promise<Result>;
  approve(id: number, notes?: string): Promise<Result>;
  reject(id: number, reason: string): Promise<Result>;
  delete(id: number): Promise<void>;
}
```

### Notifications
```typescript
interface NotificationsApi {
  create(data: {
    userId?: number;  // omitir para broadcast
    broadcast?: boolean;
    type: 'info' | 'success' | 'warning' | 'error' | 'celebration';
    title: string;
    message: string;
    category?: string;
    actionUrl?: string;
    actionLabel?: string;
    expiresAt?: Date;
  }): Promise<Notification>;
  list(userId: number): Promise<Notification[]>;
  markAsRead(id: number): Promise<void>;
  delete(id: number): Promise<void>;
}
```

### Branches
```typescript
interface BranchesApi {
  list(): Promise<Branch[]>;
  get(id: number): Promise<Branch>;
  create(data: BranchCreateInput): Promise<Branch>;
  update(id: number, data: Partial<BranchCreateInput>): Promise<Branch>;
}
```

### Companies
```typescript
interface CompaniesApi {
  get(id: number): Promise<Company>;
  update(id: number, data: Partial<Company>): Promise<Company>;
  getConfig(key: string): Promise<any>;
  setConfig(key: string, value: any): Promise<void>;
}
```

### Indicators
```typescript
interface IndicatorsApi {
  list(): Promise<Indicator[]>;
  get(id: number): Promise<Indicator>;
  create(data: IndicatorCreateInput): Promise<Indicator>;
  calculate(indicatorId: number, userId: number, period: string): Promise<number>;
}
```

### Campaigns
```typescript
interface CampaignsApi {
  list(filter?: { status?: string }): Promise<Campaign[]>;
  get(id: number): Promise<Campaign>;
  create(data: CampaignCreateInput): Promise<Campaign>;
  start(id: number): Promise<void>;
  end(id: number): Promise<void>;
  addParticipant(campaignId: number, userId: number): Promise<void>;
}
```

### Email
```typescript
interface EmailApi {
  send(data: {
    to: string | string[];
    template: string;
    data: Record<string, any>;
    attachments?: Array<{ filename: string; content: Buffer }>;
  }): Promise<{ messageId: string }>;
}
```

### Insights
```typescript
interface InsightsApi {
  create(data: {
    userId?: number;
    broadcast?: boolean;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    actionUrl?: string;
    actionLabel?: string;
    metadata?: Record<string, any>;
  }): Promise<Insight>;
}
```

### Storage
```typescript
interface StorageApi {
  put(path: string, content: Buffer | Readable): Promise<{ url: string }>;
  get(path: string): Promise<Readable>;
  delete(path: string): Promise<void>;
  signUrl(path: string, expiresInSec: number): Promise<string>;
}
```

### Cache
```typescript
interface CacheApi {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSec: number): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;
}
```

### Database
```typescript
interface DbApi {
  // Prisma client scoped to plugin's schema
  // Tables from prisma/schema.prisma do plugin
  $queryRaw<T>(sql: string, ...params: any[]): Promise<T>;
  $transaction<T>(fn: (tx: DbApi) => Promise<T>): Promise<T>;
  // ... models gerados do schema.prisma
}
```

### EventBus
```typescript
interface EventBusApi {
  subscribe(event: string, handler: (event: any) => Promise<void>): void;
  publish(event: string, data: any): Promise<void>;
  unsubscribe(event: string, handler: Function): void;
}
```

### Scheduler
```typescript
interface SchedulerApi {
  addTask(task: {
    id: string;
    cron: string;
    handler: (context: TaskContext) => Promise<void>;
  }): void;
  removeTask(id: string): void;
  runOnce(id: string, when: Date): Promise<void>;
}
```

### Logger
```typescript
interface LoggerApi {
  debug(msg: string, data?: any): void;
  info(msg: string, data?: any): void;
  warn(msg: string, data?: any): void;
  error(msg: string, data?: any): void;
  child(bindings: any): LoggerApi;
}
```

### HTTP
```typescript
interface HttpApi {
  // Para chamadas a APIs externas (com tracing)
  fetch(url: string, options?: RequestInit): Promise<Response>;
}
```

## 17.2 UI Registry API

```typescript
interface UIRegistry {
  addWidget(config: WidgetConfig): void;
  addMenuItem(config: MenuItemConfig): void;
  addSettingsTab(config: SettingsTabConfig): void;
  addDashboardTab(config: DashboardTabConfig): void;
  injectComponent(location: string, component: React.FC, props?: any): void;
  addRoute(path: string, component: React.FC): void;
  addModal(id: string, component: React.FC): void;
  addCommandPaletteItem(item: CommandItem): void;
}

interface WidgetConfig {
  id: string;
  title: string;
  component: React.FC;
  size: 'small' | 'medium' | 'large';
  position?: 'left-column' | 'right-column' | 'full-width';
  defaultEnabled?: boolean;
  permission?: string;
  refreshInterval?: number;
}

interface MenuItemConfig {
  id: string;
  label: string;
  icon: string;
  route: string;
  permission?: string;
  order?: number;
  badge?: number | string;
}
```

## 17.3 Router API
```typescript
interface PluginRouter {
  get(path: string, handler: RouteHandler): void;
  post(path: string, handler: RouteHandler): void;
  put(path: string, handler: RouteHandler): void;
  delete(path: string, handler: RouteHandler): void;
  patch(path: string, handler: RouteHandler): void;
  use(middleware: Middleware): void;
}

interface RouteHandler {
  (req: PluginRequest, res: PluginResponse): Promise<void>;
}

interface PluginRequest {
  user: { id: number; tenantId: number; role: string };
  body: any;
  query: Record<string, string>;
  params: Record<string, string>;
  headers: Record<string, string>;
}

interface PluginResponse {
  json(data: any): void;
  status(code: number): PluginResponse;
  send(data: any): void;
  error(code: number, message: string): void;
}
```

---

# Capítulo 18 — Security Sandbox Detalhado

## 18.1 Modelo de Isolamento

Plugins rodam em **sandbox isolado** com múltiplas camadas de defesa:

### Camada 1: Permissões Explícitas (Capability Model)
Plugin declara permissões necessárias em `package.json`. Sistema só permite acesso ao que foi declarado e aprovado pelo admin na instalação.

### Camada 2: Isolamento de Processo
Plugins rodam em `worker_threads` (Node.js) ou processo filho separado. Crash do plugin não derruba app principal.

### Camada 3: Schema Isolado no DB
Cada plugin tem schema PostgreSQL próprio. Não pode ler dados do schema `public` (do Orion core) diretamente. Acesso a dados do Orion apenas via API.

### Camada 4: Rate Limiting
Cada plugin tem limites de:
- 1000 API calls/minuto
- 10000 API calls/hora
- Memory: 256MB
- CPU: 50% de um core
- Tempo de execução por hook: 30s

### Camada 5: Code Review + SAST
Antes de publicado no marketplace, plugins passam por:
- Análise estática (SonarQube, CodeQL)
- Scan de vulnerabilidades (npm audit, Snyk)
- Code review manual pela equipe Orion
- Testes em sandbox isolado

## 18.2 Permissões Granulares

### Read Permissions
```
api:read:users              # Ler usuários
api:read:goals              # Ler metas
api:read:results            # Ler resultados
api:read:campaigns          # Ler campanhas
api:read:branches           # Ler filiais
api:read:companies          # Ler empresas
api:read:indicators         # Ler indicadores
api:read:notifications      # Ler notificações
api:read:audit_logs         # Ler logs de auditoria
```

### Write Permissions
```
api:write:users             # Criar/editar usuários
api:write:goals             # Criar/editar metas
api:write:results           # Criar/editar resultados
api:write:campaigns         # Criar/editar campanhas
api:write:notifications     # Criar notificações
api:write:insights          # Criar insights
```

### Event Permissions
```
event:subscribe:result.created
event:subscribe:goal.achieved
event:subscribe:campaign.started
event:subscribe:user.created
event:subscribe:user.updated
event:publish:plugin.custom_event  # eventos customizados do plugin
```

### UI Permissions
```
ui:inject:dashboard.widget
ui:inject:menu.item
ui:inject:settings.tab
ui:inject:dashboard.tab
ui:inject:route
ui:inject:modal
ui:inject:command_palette
```

### System Permissions (raras)
```
storage:read                # Ler arquivos do storage
storage:write               # Escrever arquivos
cache:read
cache:write
scheduler:use               # Agendar tasks
http:external               # Fazer chamadas HTTP externas
```

## 18.3 Proibições (Bloqueado no Sandbox)

```javascript
// ❌ PROIBIDO — plugin não pode usar:
require('child_process')          // Executar comandos do SO
require('fs')                     // Acesso ao filesystem
require('net')                    // Sockets TCP brutos
require('http')                   // HTTP direto (usar context.http)
require('https')                  // HTTPS direto
process.env                       // Variáveis de ambiente do Orion
eval()                            // Eval dinâmico
Function()                        // Constructor de função
import('child_process')           // Dynamic import proibido

// ❌ PADRÕES SUSPEITOS (bloqueado em review):
fetch('http://attacker.com/...')  // URLs hardcoded suspeitas
JSON.parse(req.body).exec         // Injeção de código
Buffer.from(secret).toString()    // Exfiltração de segredos
```

## 18.4 Auditoria de Plugin

Toda ação do plugin é auditada:

```sql
CREATE TABLE plugin_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id INT NOT NULL,
  plugin_name VARCHAR(100) NOT NULL,
  plugin_version VARCHAR(20),
  action VARCHAR(50) NOT NULL,  -- 'api.call', 'event.publish', 'storage.write'
  resource VARCHAR(100),        -- 'users', 'goals', etc.
  resource_id VARCHAR(50),
  method VARCHAR(10),           -- GET, POST, etc.
  status_code INT,
  duration_ms INT,
  payload_hash VARCHAR(64),     -- Hash do payload (não payload completo — LGPD)
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_plugin_tenant ON plugin_audit_logs(tenant_id, plugin_name, timestamp);
```

Admin pode ver log completo em `Admin > Plugins > {Plugin} > Auditoria`.

## 18.5 Quarentena Automática

Sistema monitora plugins em runtime. Se plugin apresenta:
- Erro 500 em > 5% das chamadas API em 5min
- Latência > 5s em > 10% das chamadas em 5min
- Exceção não tratada
- Uso de memória > 256MB
- Rate limit excedido 5x em 1h

Sistema:
1. Desativa plugin automaticamente
2. Notifica admin via email + Slack
3. Loga incidente detalhado
4. Permite reativação manual após correção

---

# Capítulo 19 — Performance Budgets por Plugin

## 19.1 Orçamentos Padrão

| Métrica | Limite Soft | Limite Hard | Ação se Exceder |
|--------|-------------|-------------|-----------------|
| Bundle size | 500KB | 1MB | Warning (soft), Reject publish (hard) |
| Memory usage | 128MB | 256MB | Warning (soft), Quarentena (hard) |
| CPU usage | 25% core | 50% core | Warning (soft), Quarentena (hard) |
| API call latency | 200ms | 1s | Warning (soft), Throttle (hard) |
| Event handler duration | 100ms | 1s | Warning (soft), Skip handler (hard) |
| Widget render time | 50ms | 200ms | Warning (soft), Disable widget (hard) |
| DB query duration | 100ms | 500ms | Warning (soft), Kill query (hard) |
| Storage operations | 10/sec | 50/sec | Warning (soft), Throttle (hard) |

## 19.2 Métricas Reportadas

Cada plugin reporta ao Prometheus:

```
plugin_bundle_size_bytes{plugin="orion-my-plugin"} 487432
plugin_memory_usage_bytes{plugin="orion-my-plugin"} 134217728
plugin_cpu_usage_percent{plugin="orion-my-plugin"} 18.5
plugin_api_calls_total{plugin="orion-my-plugin", endpoint="/stats", status="200"} 1234
plugin_api_duration_seconds{plugin="orion-my-plugin", endpoint="/stats"} 0.045
plugin_event_handler_duration_seconds{plugin="orion-my-plugin", event="result.created"} 0.023
plugin_widget_render_seconds{plugin="orion-my-plugin", widget="my-widget"} 0.012
plugin_db_query_duration_seconds{plugin="orion-my-plugin"} 0.034
plugin_storage_operations_total{plugin="orion-my-plugin", operation="put"} 23
```

## 19.3 Optimization Guidelines para Devs

### Bundle Size
```javascript
// ❌ Errado — importa biblioteca inteira
import _ from 'lodash';

// ✅ Certo — importa apenas o que usa
import debounce from 'lodash/debounce';

// ❌ Errado — moment.js (230KB)
import moment from 'moment';

// ✅ Certo — date-fns (tree-shakeable)
import { format, addDays } from 'date-fns';
```

### Memory
```javascript
// ❌ Errado — cache ilimitado em memória
const cache = {};
function getData(key) {
  if (!cache[key]) cache[key] = fetch(...);
  return cache[key];
}

// ✅ Certo — usa LRU cache com limite
import LRU from 'lru-cache';
const cache = new LRU({ max: 100, maxAge: 300000 });
```

### API Calls
```javascript
// ❌ Errado — N+1 queries
for (const userId of userIds) {
  const user = await api.users.get(userId);  // 50 chamadas
}

// ✅ Certo — batch
const users = await api.users.list({ ids: userIds });  // 1 chamada
```

### Event Handler
```javascript
// ❌ Errado — handler síncrono pesado
bus.subscribe('result.created', async (event) => {
  await heavyProcessing(event.data);  // 5s
});

// ✅ Certo — queue para processamento assíncrono
bus.subscribe('result.created', async (event) => {
  await queue.add('process-result', event.data);  // 50ms
});
```

## 19.4 Performance Review no Publish

Antes de publicar plugin, CI roda:
1. Bundle size check (rejeita se > 1MB)
2. Memory leak detection (rodar 1000 cycles, verificar se memória cresce)
3. Load test (1000 req/sec por 1min, latência p99 < 1s)
4. Cold start time (< 2s)

---

# Capítulo 20 — Review Process Passo-a-Passo

## 20.1 Pipeline de Review

```
SUBMIT
  │
  ▼
┌─────────────────────────────────────────────────┐
│ 1. VALIDAÇÃO AUTOMÁTICA (CI)                    │
│    • Lint (eslint + prettier)                   │
│    • Typecheck (tsc --noEmit)                   │
│    • Unit tests (jest, cobertura > 60%)         │
│    • Bundle size < 1MB                          │
│    • npm audit (sem High/Critical)              │
│    • SAST (SonarQube)                           │
│    • CodeQL scan                                │
│    • Compatibility check (Orion version)        │
└────────────────────┬────────────────────────────┘
                     │ pass
                     ▼
┌─────────────────────────────────────────────────┐
│ 2. REVIEW MANUAL TÉCNICO (1-2 dias)             │
│    • Code review por dev sênior Orion           │
│    • Verificação de segurança                   │
│    • Verificação de UX (screenshots)            │
│    • Verificação de documentação                │
│    • Verificação de testes E2E                  │
└────────────────────┬────────────────────────────┘
                     │ pass
                     ▼
┌─────────────────────────────────────────────────┐
│ 3. TESTE FUNCIONAL (1-2 dias)                   │
│    • Instalar em sandbox                        │
│    • Executar cenários de teste                 │
│    • Testar upgrade de versão                   │
│    • Testar uninstall/reinstall                 │
│    • Verificar performance                      │
└────────────────────┬────────────────────────────┘
                     │ pass
                     ▼
┌─────────────────────────────────────────────────┐
│ 4. REVIEW DE COMPLIANCE (1 dia)                 │
│    • LGPD checklist                             │
│    • Política de privacidade                    │
│    • Termos de uso                              │
│    • Verificar coleta de dados                  │
└────────────────────┬────────────────────────────┘
                     │ pass
                     ▼
┌─────────────────────────────────────────────────┐
│ 5. APROVAÇÃO FINAL (1 dia)                      │
│    • Tech Lead Orion aprova                     │
│    • Plugin publicado no marketplace            │
│    • Dev notificado                             │
└─────────────────────────────────────────────────┘

Tempo total: 5-10 dias úteis
```

## 20.2 Checklist Detalhado

### Validação Automática
- [ ] ESLint passa (0 errors, 0 warnings)
- [ ] Prettier formata (sem diff)
- [ ] TypeScript compila (`tsc --noEmit`)
- [ ] Jest: 100% pass, cobertura > 60%
- [ ] Bundle size < 1MB (`orion-plugin bundle-size`)
- [ ] `npm audit`: 0 vulnerabilities High/Critical
- [ ] SonarQube: 0 bugs, 0 vulnerabilities, < 5 code smells
- [ ] CodeQL: 0 alerts
- [ ] Orion compatibility: versão declarada é válida
- [ ] README.md existe e tem ≥ 500 palavras
- [ ] CHANGELOG.md existe
- [ ] Screenshots: ≥ 3 imagens em `/screenshots/`
- [ ] License file existe (MIT, Apache 2.0, etc.)

### Review Manual Técnico
- [ ] Código segue padrões Orion (Clean Architecture, types)
- [ ] Sem `any` em TypeScript
- [ ] Sem `eval()`, `Function()`, `child_process`
- [ ] Sem hardcoded secrets
- [ ] Validação de input em todas as rotas (Zod)
- [ ] Tratamento de erro em todos os handlers
- [ ] Logging estruturado (não console.log)
- [ ] Sem dependências desnecessárias
- [ ] Versionamento SemVer correto
- [ ] Migrations Prisma testadas

### Teste Funcional
- [ ] Instalação em sandbox limpa funciona
- [ ] Config wizard funciona
- [ ] Ativação não falha
- [ ] Features principais funcionam
- [ ] Webhooks (se houver) recebem e respondem
- [ ] Event handlers (se houver) disparam corretamente
- [ ] Widget renderiza sem erro
- [ ] Settings tab funciona
- [ ] Desativação limpa recursos
- [ ] Desinstalação remove dados (ou preserva conforme declarado)
- [ ] Upgrade de versão funciona (migrations)
- [ ] Downgrade é seguro (ou documentado como não-suportado)
- [ ] Performance aceitável (latência < 200ms)

### Compliance
- [ ] Política de privacidade do plugin publicada
- [ ] Termos de uso do plugin publicados
- [ ] LGPD: não coleta dados desnecessários
- [ ] LGPD: dados pessoais criptografados em trânsito
- [ ] LGPD: opção de export e delete de dados
- [ ] Sem coleta de dados sem consentimento
- [ ] Sem venda de dados para terceiros
- [ ] Logs não contêm PII (CPF, email, etc.)

---

# Capítulo 21 — Rejection Criteria

## 21.1 Rejeição Automática (CI)

Plugin é rejeitado automaticamente se:
- ❌ Falha em qualquer check do CI
- ❌ Bundle size > 1MB
- ❌ Vulnerabilidades High/Critical em `npm audit`
- ❌ Código não compila
- ❌ Testes falham
- ❌ Compatibilidade com Orion inválida

## 21.2 Rejeição Manual (Review)

### Segurança
- ❌ Uso de `eval()`, `Function()`, `child_process`
- ❌ Hardcoded secrets (API keys, passwords)
- ❌ Chamadas HTTP para URLs hardcoded não-whitelisted
- ❌ Falta de validação de input em rotas
- ❌ SQL injection possível
- ❌ XSS possível em widgets
- ❌ Falta de rate limiting em rotas customizadas
- ❌ Logs expõem dados sensíveis (PII)

### Qualidade
- ❌ Código sem TypeScript (usando `any` extensivamente)
- ❌ Sem testes unitários
- ❌ Cobertura < 60%
- ❌ Sem documentação (README mínimo)
- ❌ Sem screenshots
- ❌ Sem tratamento de erro
- ❌ Estrutura de pastas fora do padrão

### UX
- ❌ Widget não respeita tema do Orion
- ❌ Não funciona em mobile (responsividade)
- ❌ Não tem loading state
- ❌ Não tem error state
- ❌ Não tem empty state
- ❌ Não tem disabled state
- ❌ Acessibilidade WCAG 2.1 AA não atendida

### Compliance
- ❌ Coleta dados pessoais sem documentar
- ❌ Não tem política de privacidade
- ❌ Não tem termos de uso
- ❌ Envia dados para servidores fora do Brasil (LGPD)
- ❌ Não tem opção de delete de dados do plugin

### Negócio
- ❌ Preço irreal (R$ 50k/mês para plugin simples)
- ❌ Concorrente direto de plugin oficial Orion
- ❌ Plugin duplicado (mesma funcionalidade de outro existente)
- ❌ Requer integração com serviço não-documentado

## 21.3 Exemplos de Rejeição

### Caso 1: Plugin de WhatsApp não-oficial
**Status:** Rejeitado
**Razão:** "Plugin usa API não-oficial do WhatsApp, violando ToS da Meta. Use WhatsApp Business API oficial via Twilio."
**Ação:** Dev refaz usando Twilio API.

### Caso 2: Plugin com eval()
**Status:** Rejeitado
**Razão:** "Uso de eval() em src/utils/parser.ts linha 23. Proibido por security policy."
**Ação:** Dev substitui eval por parser específico.

### Caso 3: Plugin sem documentação
**Status:** Rejeitado
**Razão:** "README.md tem 50 palavras. Mínimo 500 palavras com: descrição, instalação, configuração, exemplos."
**Ação:** Dev expande README.

### Caso 4: Plugin expõe dados em logs
**Status:** Rejeitado
**Razão:** "console.log(req.body) em routes.ts linha 15. Body pode conter CPF/email. Use logger estruturado com redação."
**Ação:** Dev troca console.log por logger com redação.

### Caso 5: Plugin cobra R$ 5.000/mês por widget simples
**Status:** Rejeitado
**Razão:** "Preço desproporcional ao valor entregue. Plugin é um widget estático."
**Ação:** Dev ajusta preço (recomendação: R$ 49-99/mês).

---

# Capítulo 22 — Appeals Process

## 22.1 Quando Apelar
Dev pode apelar se:
- Rejeição foi injusta (razão não se aplica)
- Rejeição foi baseada em mal-entendido
- Política mudou desde rejeição
- Plugin foi atualizado para corrigir problema

## 22.2 Processo de Apelação

```
REJEITADO
    │
    ▼
┌─────────────────────────────────────────────────┐
│ Dev envia apelação via Developer Portal         │
│ Inclui: justificativa + evidências + diffs      │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ Tech Lead Orion revisa apelação (3-5 dias)      │
│ Pode:                                            │
│ • Aceitar (publicar)                            │
│ • Rejeitar (com nova justificativa)              │
│ • Pedir mais informações                         │
└────────────────────┬────────────────────────────┘
                     │
              ┌──────┴──────┐
              ▼             ▼
         ACEITO        REJEITADO
              │             │
              ▼             ▼
         Publicado   Dev pode apelar de novo
                      (max 3 apelações)
```

## 22.3 Template de Apelação

```markdown
## Apelação: [Plugin Name] v1.0.0

**Data:** 2025-08-15
**Motivo da rejeição:** [citado pelo reviewer]
**Razão da apelação:** [por que a rejeição foi injusta]

### Evidências
1. [Evidência 1: código corrigido, etc.]
2. [Evidência 2: testes passando]
3. [Evidência 3: documentação atualizada]

### Diffs
[link para PR/commit com correções]

### Contexto Adicional
[qualquer coisa relevante]
```

## 22.4 Política de Re-Apelação
- Máximo 3 apelações por plugin
- Após 3ª rejeição, dev deve esperar 30 dias para reenviar
- Apelações vexatórias ou repetitivas podem resultar em banimento do Developer Portal

## 22.5 Mediação
Em casos de disputa técnica, dev pode solicitar mediação com:
- Head of Engineering Orion
- Head of Security Orion
- Head of Product Orion

Mediação é por convite only (não garantida).

---

# Capítulo 23 — Featured Plugins Criteria

Plugins "Featured" aparecem em destaque no marketplace首页. Critérios:

## 23.1 Critérios Obrigatórios
- ✅ Plugin oficial OU parceiro certificado
- ✅ Mais de 100 instalações ativas
- ✅ Avaliação média ≥ 4.5 estrelas
- ✅ Última atualização < 90 dias
- ✅ Sem incidentes críticos nos últimos 30 dias
- ✅ Documentação completa
- ✅ Suporte responsivo (SLA atendido)

## 23.2 Critérios Desejáveis (3+ necessários)
- ⭐ Resolve problema único não coberto por outros plugins
- ⭐ Excelente UX (reconhecido por design review)
- ⭐ Performance excepcional (latência < 100ms)
- ⭐ Adoção por clientes Enterprise (>10 Enterprise usando)
- ⭐ Casos de sucesso publicados
- ⭐ Open-source (código público no GitHub)
- ⭐ Traduzido para EN e ES (multi-idioma)
- ⭐ Integra com 3+ outros plugins do marketplace
- ⭐ Receita > R$ 10k/mês (validation de mercado)

## 23.3 Processo de Seleção
1. **Mensalmente:** time de Produto Orion avalia plugins elegíveis
2. **Votação interna:** 3+ aprovações de Produto + Eng + Biz
3. **Contrato de featured:** dev concorda em manter qualidade (atualizações < 90 dias, SLA)
4. **Período featured:** 90 dias (renovável)
5. **Remoção:** se qualidade cair, plugin perde featured status

## 23.4 Benefícios do Featured
- Posição destacada no marketplace首页
- Badge "Featured" no card
- Incluído em campanhas de marketing
- Mention em newsletter
- Acesso beta a novas features do SDK
- Suporte prioritário da equipe Orion

---

# Capítulo 24 — Plugin Analytics Dashboard

## 24.1 Métricas Disponíveis para Devs

### Adoption
- Installs ativas (por dia, semana, mês)
- Installs cumulativas
- Uninstalls (e taxa de uninstall em 30 dias)
- Net new installs (installs - uninstalls)
- Por plano de cliente (Starter, Professional, Enterprise)
- Por região

### Engagement
- DAU (Daily Active Users using plugin)
- WAU
- MAU
- Sticky factor (DAU/MAU)
- Session duration (tempo médio usando plugin)
- Features mais usadas (por rota/widget)
- API calls per install per day

### Performance
- API latency p50, p95, p99
- Error rate
- Memory usage médio
- CPU usage médio
- DB query duration

### Business
- MRR gerado (para plugins pagos)
- Receita acumulada
- Churn rate (uninstalls de plugins pagos)
- LTV
- Refund rate

### Reviews
- Avaliação média
- Distribuição (1-5 estrelas)
- Reviews por mês
- Sentiment analysis (positivo/negativo)
- Issues reportadas

## 24.2 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  PLUGIN ANALYTICS — WhatsApp Plus v1.2.0                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │  INST   │ │  MRR    │ │  AVG    │ │ UNINST  │              │
│  │  ATIVOS │ │  MENSAL │ │  RATING │ │  30D    │              │
│  │  187    │ │  R$ 18k │ │  4.7 ⭐  │ │  4.2%   │              │
│  │  +12 ↑  │ │  +8% ↑  │ │         │ │         │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
│  INSTALLS (últimos 30 dias)                                     │
│  ▁▂▅▇▆▄▃▅▇█▆▄▂▁▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃▂                          │
│                                                                 │
│  DAU (usuários ativos por dia)                                  │
│  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃                              │
│                                                                 │
│  ┌──────────────────────────┐ ┌────────────────────────────┐   │
│  │ ERROS POR ENDPOINT       │ │ REVIEWS RECENTES           │   │
│  │ /stats      1.2%         │ │ ⭐⭐⭐⭐⭐ "Excelente!"       │   │
│  │ /send-test  0.5%         │ │ ⭐⭐⭐⭐☆ "Bom, mas lento"   │   │
│  │ /config     0.0%         │ │ ⭐⭐⭐⭐⭐ "Mudou meu time"  │   │
│  └──────────────────────────┘ └────────────────────────────┘   │
│                                                                 │
│  PRÓXIMO PAGAMENTO: R$ 12.810 em 15/09                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 24.3 Alertas para Devs
Dev recebe alertas se:
- ⚠️ Uninstall rate > 10% em 7 dias
- ⚠️ Avaliação média cair abaixo de 4.0
- ⚠️ Error rate > 5%
- ⚠️ Latência p95 > 1s
- ⚠️ Review negativo (1-2 estrelas)
- ℹ️ Novo review positivo (5 estrelas)
- ℹ️ Marco atingido (100 installs, 1000 installs)

---

# Capítulo 25 — Revenue Share Calculation Examples

## 25.1 Fórmula Geral

```
Receita Dev = (Receita Bruta × % Dev) − Taxas de Processamento − Impostos
```

Onde:
- **Receita Bruta** = preço do plugin × número de clientes pagantes no mês
- **% Dev** = 70% (Parceiro) ou 80% (Comunidade) ou 100% (Oficial)
- **Taxas de Processamento** = ~3% + R$ 0,40 por transação (cartão) ou 0,99% (PIX)
- **Impostos** = depende do regime fiscal do dev

## 25.2 Exemplo 1: Plugin Parceiro R$ 99/mês

**Cenário:**
- Preço: R$ 99/mês
- Clientes pagantes: 50
- Receita Bruta: R$ 4.950/mês
- Categoria: Parceiro (70% dev)
- Pagamento: cartão de crédito (3% + R$ 0,40)

**Cálculo:**
```
Receita Bruta: R$ 4.950,00
Taxa processamento (50 transações × R$ 0,40 + 3%): R$ 208,50
Receita Líquida: R$ 4.741,50
Participação Dev (70%): R$ 3.319,05
Participação Orion (30%): R$ 1.422,45
```

**Impostos (exemplo Simples Nacional, 6%):**
```
Faturamento Dev: R$ 3.319,05
Imposto (6%): R$ 199,14
Receita Dev Final: R$ 3.119,91
```

## 25.3 Exemplo 2: Plugin Comunidade R$ 199/mês

**Cenário:**
- Preço: R$ 199/mês
- Clientes pagantes: 100
- Receita Bruta: R$ 19.900/mês
- Categoria: Comunidade (80% dev)
- Pagamento: PIX (0,99%)

**Cálculo:**
```
Receita Bruta: R$ 19.900,00
Taxa PIX (0,99%): R$ 197,01
Receita Líquida: R$ 19.702,99
Participação Dev (80%): R$ 15.762,39
Participação Orion (20%): R$ 3.940,60
```

## 25.4 Exemplo 3: Plugin Annual Pre-paid

**Cenário:**
- Preço: R$ 1.000/ano (pago upfront)
- Clientes: 30 (assinaturas anuais)
- Receita Bruta: R$ 30.000 (recebidos no mês 1)
- Categoria: Parceiro (70%)

**Reconhecimento de Receita:**
- R$ 30.000 recebidos no mês 1
- Reconhecimento: R$ 2.500/mês por 12 meses
- Dev recebe: R$ 2.500 × 70% = R$ 1.750/mês por 12 meses

**Cálculo:**
```
Receita Bruta (mês 1): R$ 30.000,00
Taxa cartão (3,5%): R$ 1.050,00
Receita Líquida: R$ 28.950,00
Participação Dev (70%): R$ 20.265,00 (total ano)
Mensal: R$ 1.688,75/mês por 12 meses
```

## 25.5 Exemplo 4: Plugin Freemium

**Cenário:**
- Free tier: até 100 usuários
- Paid tier: R$ 199/mês acima de 100 usuários
- 200 installs: 150 free, 50 paid
- Receita: 50 × R$ 199 = R$ 9.950/mês

**Cálculo:**
```
Receita Bruta: R$ 9.950,00 (apenas pagantes)
Taxas: ~3% = R$ 298,50
Receita Líquida: R$ 9.651,50
Dev (80% Comunidade): R$ 7.721,20
Orion (20%): R$ 1.930,30
```

## 25.6 Exemplo 5: Plugin por Usage (R$ 0,05 por 1000 calls)

**Cenário:**
- 30 clientes ativos
- Cada um faz 500k calls/mês em média
- Total: 15M calls/mês
- Preço: R$ 0,05 por 1000 = R$ 750/mês por cliente

**Cálculo:**
```
Receita Bruta: 30 × R$ 750 = R$ 22.500/mês
Taxas: 3% = R$ 675
Receita Líquida: R$ 21.825
Dev (70% Parceiro): R$ 15.277,50
Orion (30%): R$ 6.547,50
```

## 25.7 Payout Schedule

- Dev recebido até dia 15 do mês seguinte
- Mínimo para saque: R$ 100
- Se abaixo de R$ 100, acumula para próximo mês
- Pagamento via:
  - PIX (grátis)
  - Transferência bancária (TED, grátis)
  - PayPal (3% taxa adicional)

## 25.8 Relatório Mensal

Dev recebe PDF mensal com:
- Resumo financeiro
- Lista de transações
- Cálculos detalhados
- Impostos retidos (se aplicável)
- Próximo pagamento

---

# Capítulo 26 — Tax Implications

## 26.1 Para Devs Pessoa Física (Autônomo)

### Regime: Simples Nacional (MEI)
- Faturamento anual até R$ 81.000
- Tributação fixa: ~5% sobre faturamento
- Sem adicional de IR se abaixo de isenção

### Regime: Simples Nacional (Microempresa)
- Faturamento anual até R$ 360.000
- Alíquota: 6% a 15% (depende do anexo)
- Para SaaS/software: geralmente Anexo III (6% a 10%)

### Exemplo MEI
- Receita dev: R$ 5.000/mês = R$ 60.000/ano
- Tributação MEI: R$ 65/mês fixo (DAS)
- Sem adicional
- Receita líquida: R$ 4.935/mês

### Exemplo Simples (Anexo III, 6%)
- Receita dev: R$ 15.000/mês = R$ 180.000/ano
- Tributação 6%: R$ 900/mês
- Receita líquida: R$ 14.100/mês

## 26.2 Para Devs Pessoa Jurídica (LTDA)

### Regime: Lucro Presumido
- Presunção: 32% para serviços
- IRPJ: 15% sobre lucro presumido
- Adicional IRPJ: 10% se lucro > R$ 20k/mês
- CSLL: 9% sobre lucro presumido
- PIS: 0,65% sobre receita
- COFINS: 3% sobre receita
- Total efetivo: ~11,5% a 16%

### Exemplo Lucro Presumido
- Receita dev: R$ 30.000/mês = R$ 360.000/ano
- Lucro presumido (32%): R$ 9.600/mês
- IRPJ (15%): R$ 1.440/mês
- CSLL (9%): R$ 864/mês
- PIS (0,65%): R$ 195/mês
- COFINS (3%): R$ 900/mês
- Total impostos: R$ 3.399/mês (~11,3%)
- Receita líquida: R$ 26.601/mês

### Regime: Lucro Real
- Para faturamento > R$ 78 milhões/ano
- Tributação sobre lucro real (contabilidade completa)
- Geralmente menos vantajoso para SaaS pequeno

## 26.3 Para Devs Internacionais

### Recebedores via Stripe Atlas / similar
- Stripe emite 1099-K (EUA) ou equivalente
- Dev responsável por declarar e pagar impostos no país de residência
- Orion retém 0% (sem retenção na fonte Brasil)
- Dev deve consultar contador local

### Double Taxation Treaties
- Brasil tem tratados com 70+ países
- Dev pode creditar imposto pago no Brasil contra imposto devido no país
- Documentação: Certificado de Residência Fiscal

## 26.4 Obrigações Acessórias

### Pessoa Física
- DARM (mensal, se MEI)
- DIRPF (anual, até 31/maio)
- DASN-SIMEI (anual, se MEI)

### Pessoa Jurídica
- DCTF (mensal)
- SPED Fiscal (mensal)
- SPED Contribuições (mensal)
- ECF (anual)
- ECD (anual, se aplicável)

## 26.5 Notas Fiscais

Orion emite NF de repasse de receita para dev:
- Pessoa Física: NF de serviço (ISS devido pelo dev)
- Pessoa Jurídica: NF de serviço (NF-e)
- Dev deve emitir nota fiscal contrapartida para Orion

## 26.6 Disclaimer

**Este capítulo é informativo e não constitui aconselhamento fiscal.** Devs devem consultar contador profissional para sua situação específica. Orion não se responsabiliza por decisões fiscais tomadas com base neste documento.

## 26.7 Recomendações Orion

1. **Abra MEI se faturar < R$ 81k/ano** — simples, barato
2. **Migre para Microempresa (Simples) se faturar R$ 81k–360k/ano**
3. **Consulte contador se faturar > R$ 360k/ano** — avaliar Lucro Presumido vs Real
4. **Para devs internacionais:** consulte especialista em tributação cross-border
5. **Reserve 30% da receita para impostos** — segurança

---

# Capítulo 27 — Marketplace Governance

## 27.1 Conseilho de Marketplace

Comitê mensal para governança do marketplace:
- Head of Product Orion (chair)
- Head of Engineering Orion
- Head of Security Orion
- Head of Legal Orion
- 2 representantes de devs parceiros (eleitos anualmente)

### Responsabilidades
- Aprovar mudanças na política
- Revisar appeals complexos
- Definir critérios de featured
- Discutir novas categorias
- Avaliar métricas de saúde do marketplace

## 27.2 Código de Conduta para Devs

Todo dev aceita ao se cadastrar:
1. Não plagiar outros plugins
2. Não usar dados de clientes para fins não autorizados
3. Responder a reviews profissionalmente
4. Manter plugins atualizados (≤ 90 dias sem update = warning)
5. Não vender dados de usuários
6. Respeitar LGPD
7. Não discriminar clientes
8. Não pagar por reviews
9. Não manipular ratings
10. Reportar vulnerabilidades de segurança ao Orion

Violações resultam em:
- 1ª: Aviso
- 2ª: Suspensão 30 dias
- 3ª: Banimento permanente

## 27.3 Dispute Resolution

Disputas entre dev e cliente:
1. Tentativa de resolução direta (7 dias)
2. Mediação Orion (15 dias)
3. Arbitragem ( Câmara FGV, custos divididos)

## 27.4 Roadmap do Marketplace

- **Q1 2026:** Lançamento v2.0 (plugins oficiais)
- **Q2 2026:** Programa de parceiros certificados
- **Q3 2026:** Abertura para comunidade
- **Q4 2026:** Themes (além de plugins)
- **Q1 2027:** Marketplace em LATAM (ES)
- **Q2 2027:** Mobile plugins (React Native)
- **Q3 2027:** AI Plugin Studio (gerar plugins com IA)
- **Q4 2027:** Plugin revenue analytics avançado

---

# Capítulo 28 — Conclusão e Próximos Passos

## 28.1 Resumo do Documento

Este documento especificou:
1. Arquitetura técnica completa de plugins
2. Sandbox de segurança multi-camada
3. Lifecycle e hooks detalhados
4. API surface para devs
5. 11+ exemplos completos de plugins
6. Processo de review passo-a-passo
7. Critérios de featured e rejeição
8. Modelo de negócio (revenue share, preços, payout)
9. Compliance fiscal e tributário
10. Governance do marketplace

## 28.2 Princípios Norteadores

1. **Segurança first:** nunca expor dados de cliente a plugin sem permissionamento explícito
2. **Simplicidade para dev:** SDK intuitivo, documentação clara, examples prontos
3. **Transparência:** dev tem acesso a métricas, código de review, critérios
4. **Equilíbrio:** justos para dev (70-80% revenue) e sustentáveis para Orion (20-30%)
5. **Evolução incremental:** marketplace v2.0 (oficiais) → v2.5 (parceiros) → v3.0 (comunidade)

## 28.3 Como Começar

### Para Devs Interessados
1. Cadastre-se em `developers.orion.com`
2. Leia este documento e a API reference
3. Clone o plugin exemplo oficial (`orion-example-plugin` no GitHub)
4. Desenvolva localmente com `@orion/cli`
5. Submeta para review quando pronto

### Para Clientes (Admins)
1. Acesse Marketplace no painel admin
2. Browse por categoria
3. Instale com 1 clique
4. Configure
5. Use

### Para Parceiros Implementadores
1. Candidate-se ao programa de parceiros
2. Passe por certificação técnica
3. Receba acesso a plugins beta e comissões de venda
4. Implemente para clientes

## 28.4 Métricas de Sucesso (3 anos)

- 150+ plugins publicados
- 100+ devs ativos
- 4+ plugins por cliente (média)
- R$ 1M/mês receita marketplace
- 4.5+ avaliação média
- < 8% churn de plugins em 30 dias
- 30+ parceiros certificados
- Marketplace em 3 países (BR, MX, AR)

## 28.5 Contato

- **Developer Portal:** developers.orion.com
- **Suporte Devs:** dev-support@orion.com
- **Slack da comunidade:** orion-plugins.slack.com
- **GitHub:** github.com/orion-plugins
- **Documentação:** docs.orion.com/plugins
- **Bug bounty:** security@orion.com (para vulnerabilidades)

---

# Apêndice A — Template de Plugin (Boilerplate)

```typescript
// package.json
{
  "name": "orion-plugin-template",
  "version": "1.0.0",
  "orion": {
    "type": "plugin",
    "category": "productivity",
    "compatibility": ">=1.5.0",
    "permissions": ["api:read:users", "ui:inject:dashboard.widget"]
  }
}

// src/index.ts
export { default } from './plugin';

// src/plugin.ts
import { OrionPlugin, PluginContext, UIRegistry } from '@orion/plugin-sdk';

export default class MyPlugin implements OrionPlugin {
  name = 'orion-plugin-template';
  version = '1.0.0';
  author = 'Seu Nome <email@example.com>';
  description = 'Template de plugin para começar rapidamente';
  
  async install(): Promise<void> {}
  async activate(context: PluginContext): Promise<void> {
    context.logger.info('Plugin ativado');
  }
  async deactivate(): Promise<void> {}
  async uninstall(): Promise<void> {}
  
  registerUI(registry: UIRegistry): void {
    registry.addWidget({
      id: 'my-widget',
      title: 'My Widget',
      component: () => <div>Hello World</div>,
      size: 'small'
    });
  }
}
```

# Apêndice B — Recursos Adicionais

## Documentação Oficial
- [Plugin SDK Reference](https://docs.orion.com/plugins/sdk)
- [API Reference](https://docs.orion.com/plugins/api)
- [Examples Gallery](https://docs.orion.com/plugins/examples)
- [Migration Guide](https://docs.orion.com/plugins/migrate)

## Comunidade
- [Slack](https://orion-plugins.slack.com)
- [GitHub Discussions](https://github.com/orion-plugins/discussions)
- [Discord](https://discord.gg/orion-plugins)
- [Stack Overflow tag: orion-plugin](https://stackoverflow.com/questions/tagged/orion-plugin)

## Vídeos e Tutoriais
- [YouTube: Criando seu primeiro plugin](https://youtube.com/watch?v=...)
- [Webinar: Best practices de plugins](https://...)
- [Curso gratuito: Plugin Development 101](https://...)

## Open Source
- [Plugin SDK](https://github.com/orion-plugins/sdk)
- [CLI](https://github.com/orion-plugins/cli)
- [Exemplos](https://github.com/orion-plugins/examples)
- [Templates](https://github.com/orion-plugins/templates)
