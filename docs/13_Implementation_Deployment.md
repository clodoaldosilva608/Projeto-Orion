# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 13

# IMPLEMENTATION & DEPLOYMENT

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Implantação, Instalação e Deployment
**Classificação:** Confidencial — Uso Interno
**Última revisão:** 2025-01-15

---

## Sumário

1. Objetivo e Modalidades de Implantação
2. Requisitos do Sistema
3. Empacotamento (Electron, Docker, PWA)
4. Variáveis de Ambiente
5. Migrações de Banco
6. CI/CD Pipeline
7. Atualizações
8. Runbooks Operacionais (20+ operações)
9. Kubernetes Manifests (Cloud Edition)
10. Terraform (AWS/GCP)
11. Monitoring Stack (Prometheus, Grafana, AlertManager)
12. Logging Stack (ELK, Loki)
13. Distributed Tracing (Jaeger)
14. Blue-Green Deployment
15. Canary Deployment
16. Database Migration Strategies (Zero-Downtime)
17. Cache Warming Strategies
18. CDN Configuration
19. WAF Rules
20. DDoS Protection
21. Capacity Planning
22. Cost Optimization
23. Disaster Recovery
24. Apêndices

---

# Capítulo 1 — Objetivo e Modalidades de Implantação

Este documento define as estratégias de implantação do Projeto Orion nas três modalidades suportadas: Local (single-machine), Rede Local (on-premise server) e Cloud (multi-tenant SaaS). Cobre empacotamento (Electron, Docker), CI/CD, ambientes, procedimentos de atualização, runbooks operacionais, manifests Kubernetes, Terraform, observabilidade (monitoring, logging, tracing), estratégias de deploy (blue-green, canary), migrations zero-downtime, cache warming, CDN, WAF, DDoS protection, capacity planning e otimização de custos.

## 1.1 Modalidades Suportadas

| Edição | Caso de Uso | Multi-tenant | Atualização |
|---|---|---|---|
| Local (Electron) | 1-5 usuários, 1 PC | Não (single-tenant) | Auto-update via GitHub Releases |
| On-Premise (Docker Compose) | Empresa média, rede local | Não (single-tenant) | Manual via docker compose pull |
| Cloud (Kubernetes SaaS) | Multi-tenant SaaS | Sim | CI/CD automatizado, blue-green |

---

# Capítulo 2 — Requisitos do Sistema

## 2.1 Edição Local (Electron)

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | Dual-core 2 GHz | Quad-core 2.5 GHz |
| RAM | 4 GB | 8 GB |
| Disco | 500 MB livres | 2 GB SSD |
| SO | Windows 10+, macOS 11+, Ubuntu 20+ | Windows 11, macOS 14, Ubuntu 22+ |
| Browser | Embutido (Electron Chromium) | — |

## 2.2 Edição On-Premise (Docker Compose)

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | Quad-core 2 GHz | 8-core 3 GHz |
| RAM | 8 GB | 16 GB |
| Disco | 20 GB SSD | 100 GB SSD |
| SO | Ubuntu 22+ | Ubuntu 24 LTS |
| Docker | 24+ | 26+ |
| Rede | 100 Mbps | 1 Gbps |

## 2.3 Edição Cloud (Kubernetes)

| Recurso | Setup Inicial | Escala |
|---|---|---|
| CPU | 8 vCPU | Auto-scale até 64 vCPU |
| RAM | 32 GB | Auto-scale até 256 GB |
| Disco (DB) | 100 GB SSD | Até 10 TB |
| Disco (Storage) | 50 GB S3 | Ilimitado |
| Rede | 1 Gbps | 10 Gbps |

---

# Capítulo 3 — Empacotamento

## 3.1 Aplicativo Desktop (Electron)

### Build
```bash
npm run build:web
npm run build:api
npm run dist  # Empacotamento Electron
```

### Output
- **Windows:** `Orion-Setup-1.0.0.exe` (NSIS installer)
- **macOS:** `Orion-1.0.0.dmg` (disk image, notarizado)
- **Linux:** `Orion-1.0.0.AppImage` (universal)

### Auto-Update
- Electron Updater integrado
- Verificação diária de atualizações no GitHub Releases
- Download em background
- Instalação na próxima reinicialização
- Code signing obrigatório (Authenticode Windows, Apple Developer ID macOS)

## 3.2 Docker Image

### Dockerfile

```dockerfile
# syntax=docker/dockerfile:1.6
FROM node:20-alpine AS builder
WORKDIR /app

# Cache de dependências
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build
RUN npx prisma generate

# Multistage: separa dev deps
FROM node:20-alpine AS deps-prod
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Runtime final
FROM node:20-alpine AS runner
WORKDIR /app

# User não-root
RUN addgroup -g 1001 -S orion && \
    adduser -u 1001 -S orion -G orion

# Instala only essential
RUN apk add --no-cache wget curl tini

# Copia artefatos
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

USER orion
EXPOSE 3001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
```

### docker-compose.yml (On-Premise)

```yaml
version: '3.8'

services:
  orion-web:
    image: orion/app:1.0.0
    ports:
      - "8080:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://orion:${DB_PASSWORD}@orion-postgres:5432/orion
      - REDIS_URL=redis://orion-redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - LICENSE_KEY=${LICENSE_KEY}
      - APP_URL=http://servidor.local:8080
      - LOG_LEVEL=info
    depends_on:
      orion-postgres:
        condition: service_healthy
      orion-redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  orion-postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=orion
      - POSTGRES_USER=orion
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - orion_pg_data:/var/lib/postgresql/data
      - ./postgres-init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orion"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  orion-redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - orion_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  orion-backup:
    image: orion/backup:1.0.0
    environment:
      - DATABASE_URL=postgresql://orion:${DB_PASSWORD}@orion-postgres:5432/orion
      - BACKUP_SCHEDULE=0 2 * * *
      - BACKUP_RETENTION_DAYS=30
      - BACKUP_PATH=/backups
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    volumes:
      - ./backups:/backups
    depends_on:
      - orion-postgres
    restart: unless-stopped

volumes:
  orion_pg_data:
  orion_redis_data:
```

## 3.3 PWA (Progressive Web App)

### Manifest
```json
{
  "name": "Orion - Gestão Comercial",
  "short_name": "Orion",
  "description": "Plataforma de gestão de equipes comerciais",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#FFFFFF",
  "theme_color": "#1E3A8A",
  "icons": [
    {"src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"}
  ]
}
```

### Service Worker
- Workbox para cache de assets
- Estratégia: Cache First para assets, Network First para API
- Offline: tela "Você está offline" com dados em cache

---

# Capítulo 4 — Variáveis de Ambiente

## 4.1 Backend (.env)

```bash
# App
NODE_ENV=production
PORT=3001
APP_URL=https://app.orion.com
API_URL=https://api.orion.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/orion
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_CONNECTION_TIMEOUT=10000

# Redis
REDIS_URL=redis://host:6379
REDIS_PASSWORD=xxx

# Auth
JWT_SECRET=your-super-secret-key-change-me
JWT_PRIVATE_KEY_PATH=/etc/orion/keys/jwt-private.pem
JWT_PUBLIC_KEY_PATH=/etc/orion/keys/jwt-public.pem
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_COST=12
TOKEN_PEPPER=base64-encoded-pepper

# OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx

# Encryption
ENCRYPTION_KEY=base64-encoded-32-byte-key
KMS_KEY_ID=orion-app-data-key

# AI
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-xxx
COHERE_API_KEY=xxx
AI_DEFAULT_MODEL=gpt-4o-mini
AI_DEFAULT_MAX_TOKENS=1500

# Storage
S3_BUCKET=orion-assets
S3_REGION=sa-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=xxx
FROM_EMAIL=noreply@orion.com

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_SERVICE_NAME=orion-api

# Feature flags
FEATURE_AI_ENABLED=true
FEATURE_VOICE_INPUT=false
```

## 4.2 Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=https://api.orion.com
NEXT_PUBLIC_APP_NAME=Orion
NEXT_PUBLIC_SUPPORT_EMAIL=suporte@orion.com
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_GA_ID=G-XXXXXX
```

---

# Capítulo 5 — Migrações de Banco

## 5.1 ORM

Prisma como ORM. Schema em `prisma/schema.prisma`.

## 5.2 Comandos

```bash
# Desenvolvimento (aplica mudanças + gera migration)
npx prisma migrate dev --name nome_da_migracao

# Produção (aplica migracoes pendentes sem prompt)
npx prisma migrate deploy

# Status
npx prisma migrate status

# Reset (CUIDADO - apaga dados)
npx prisma migrate reset

# Seed
npx prisma db seed

# Prisma Studio (admin visual)
npx prisma studio
```

## 5.3 Práticas

- Migration names: `YYYYMMDDHHmmss_human_readable_name`
- Sem `DROP TABLE` direto (deprecia primeiro)
- Sem `DELETE` em massa (soft delete first)
- DDLs grandes em horário de baixo tráfego
- Testar em staging antes de produção
- Backup antes de qualquer migration crítica

## 5.4 Seed

Cria dados iniciais:
- Roles padrão (Admin Master, Admin Empresa, Diretor, Gerente, Supervisor, Vendedor)
- Permissões padrão por módulo
- Templates de indicadores por segmento
- Templates de notificação
- Templates de email

---

# Capítulo 6 — CI/CD Pipeline

## 6.1 GitHub Actions — Main Pipeline

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: orion_test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports: ['6379:6379']
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test:unit -- --coverage
      - run: npm test:integration
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/orion_test
      - run: npm audit --audit-level=high
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      - uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Trivy FS scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: fs
          scan-ref: .
          severity: CRITICAL,HIGH
          exit-code: 1
      - name: Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/owasp-top-ten
            p/typescript
            p/react
      - name: CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/analyze@v3

  build:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
      id-token: write  # OIDC para AWS
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/orion-github-actions
          aws-region: sa-east-1

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build & tag Docker image
        run: |
          docker build -t orion/app:${{ github.sha }} .
          docker tag orion/app:${{ github.sha }} $ECR_REGISTRY/orion/app:${{ github.sha }}
          docker tag orion/app:${{ github.sha }} $ECR_REGISTRY/orion/app:latest

      - name: Sign image with Cosign
        run: |
          cosign sign --key awskms:///alias/orion-signing-key $ECR_REGISTRY/orion/app:${{ github.sha }}

      - name: Generate SBOM
        run: |
          npm install -g @cyclonedx/cyclonedx-cli
          cyclonedx-npm --output-file sbom.json

      - name: Push to ECR
        run: |
          docker push $ECR_REGISTRY/orion/app:${{ github.sha }}
          docker push $ECR_REGISTRY/orion/app:latest

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.json

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Configure kubectl
        uses: azure/setup-kubectl@v3
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/orion-deploy-staging
          aws-region: sa-east-1
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name orion-staging --region sa-east-1
      - name: Deploy to staging
        run: |
          helm upgrade --install orion ./deploy/helm/orion \
            --namespace orion-staging \
            --set image.tag=${{ github.sha }} \
            --set environment=staging \
            --wait --timeout 5m
      - name: Run smoke tests
        run: |
          kubectl -n orion-staging port-forward svc/orion-api 8080:80 &
          sleep 10
          curl -f http://localhost:8080/health || exit 1
          curl -f http://localhost:8080/api/smoke-test || exit 1

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/orion-deploy-prod
          aws-region: sa-east-1
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name orion-production --region sa-east-1
      - name: Deploy to production (canary)
        run: |
          helm upgrade --install orion ./deploy/helm/orion \
            --namespace orion-production \
            --set image.tag=${{ github.sha }} \
            --set environment=production \
            --set deployment.strategy=canary \
            --set deployment.canary.weight=10 \
            --wait --timeout 10m
      - name: Wait and validate canary (10 min)
        run: |
          sleep 600
          ERROR_RATE=$(kubectl -n orion-production exec deploy/orion-api -- \
            curl -s localhost:3001/metrics | grep http_error_rate | tail -1 | awk '{print $2}')
          if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
            echo "Error rate too high: $ERROR_RATE"
            helm rollback orion --namespace orion-production
            exit 1
          fi
      - name: Promote to 100%
        run: |
          helm upgrade --install orion ./deploy/helm/orion \
            --namespace orion-production \
            --set image.tag=${{ github.sha }} \
            --set environment=production \
            --set deployment.strategy=rolling \
            --wait --timeout 15m
      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          fields: repo,message,commit,author
```

## 6.2 Electron Build Pipeline

```yaml
name: Desktop Build

on:
  push:
    tags: ['v*']

jobs:
  build-desktop:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build:desktop
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
      - uses: softprops/action-gh-release@v2
        with:
          files: |
            dist/*.exe
            dist/*.dmg
            dist/*.AppImage
            dist/latest*.yml
          generate_release_notes: true
```

---

# Capítulo 7 — Atualizações

## 7.1 Edição Desktop (Electron)

1. App verifica nova versão no GitHub Releases (a cada 24h)
2. Se houver, baixa em background (delta updates quando possível)
3. Notifica usuário: "Nova versão disponível, clique para reiniciar"
4. Usuário reinicia → versão aplicada
5. Auto-rollback: se nova versão falhar ao iniciar 3x, volta para anterior

## 7.2 Edição On-Premise (Docker)

1. Admin acessa painel > Atualizações
2. Sistema verifica nova imagem no registry
3. Admin clica "Atualizar agora"
4. Sistema: backup → `docker compose pull` → `docker compose up -d` → migrations
5. Health check pós-deploy
6. Se falhar: restaura backup e mantém versão anterior

## 7.3 Edição Cloud (SaaS)

1. Deploy automatizado via CI/CD após merge na `main`
2. Canary deployment (10% → 100% em 30 min)
3. Migrations aplicadas em janela de baixo tráfego (02h-04h UTC)
4. Monitoramento intensivo por 1h pós-deploy
5. Auto-rollback se error rate > 5% em 5 minutos

---

# Capítulo 8 — Runbooks Operacionais (20+ operações)

Cada runbook documenta: contexto, pré-requisitos, passos, validação, rollback, contato.

## Runbook 01 — Reiniciar serviço orion-api

**Contexto:** API indisponível ou behaving errático.
**Sintomas:** 5xx errors, latência alta, health check falhando.

```bash
# 1. Verificar estado atual
kubectl -n orion-production get pods -l app=orion-api
kubectl -n orion-production logs deploy/orion-api --tail=100

# 2. Rolling restart (sem downtime)
kubectl -n orion-production rollout restart deploy/orion-api

# 3. Acompanhar rollout
kubectl -n orion-production rollout status deploy/orion-api --timeout=5m

# 4. Validar
curl -f https://api.orion.com/health
kubectl -n orion-production top pods -l app=orion-api
```

**Rollback:** `kubectl -n orion-production rollout undo deploy/orion-api`
**Contato:** SRE on-call (PagerDuty).

## Runbook 02 — Escalar orion-api horizontalmente

**Contexto:** Alta carga prevista (campanha Black Friday, fechamento de mês).

```bash
# Verificar HPA atual
kubectl -n orion-production get hpa orion-api

# Escalar manualmente
kubectl -n orion-production scale deploy/orion-api --replicas=20

# Ou ajustar HPA
kubectl -n orion-production patch hpa orion-api --type='json' -p='[{"op":"replace","path":"/spec/maxReplicas","value":30}]'
```

**Validação:** `kubectl -n orion-production top pods -l app=orion-api`

## Runbook 03 — Aplicar migration manualmente

**Contexto:** Migration crítica fora de janela de deploy.

```bash
# 1. Backup
kubectl -n orion-production exec deploy/orion-postgres -- \
  pg_dump -U orion orion | gzip > backup_pre_migration_$(date +%s).sql.gz

# 2. Verificar migrations pendentes
kubectl -n orion-production exec deploy/orion-api -- \
  npx prisma migrate status

# 3. Aplicar
kubectl -n orion-production exec deploy/orion-api -- \
  npx prisma migrate deploy

# 4. Validar
kubectl -n orion-production exec deploy/orion-postgres -- \
  psql -U orion -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"
```

**Rollback:** Restaurar backup pre-migration.

## Runbook 04 — Restaurar backup PostgreSQL

**Contexto:** Perda de dados, corrupção, ou desastre.

```bash
# 1. Identificar backup (PITR preferencial)
aws rds describe-db-snapshots --db-instance-identifier orion-production

# 2. Restaurar snapshot para nova instância
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier orion-restored \
  --db-snapshot-identifier orion-production-2025-01-15

# 3. Aguardar available
aws rds wait db-instance-available --db-instance-identifier orion-restored

# 4. Point-in-time recovery (até 35 dias)
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier orion-production \
  --target-db-instance-identifier orion-pitr \
  --restore-time 2025-01-15T13:00:00Z

# 5. Validar contagem de registros
psql -h orion-restored.xxx.sa-east-1.rds.amazonaws.com -U orion -c \
  "SELECT (SELECT count(*) FROM users) as users, (SELECT count(*) FROM results) as results;"

# 6. Switch app connection (com downtime curto)
kubectl -n orion-production edit secret orion-db-credentials  # atualizar DATABASE_URL
kubectl -n orion-production rollout restart deploy/orion-api
```

## Runbook 05 — Reset de senha admin (On-Premise)

```bash
docker exec -it orion-web node scripts/reset-admin-password.js
# Siga prompts interativos
# Ou via env:
docker exec -it orion-web node scripts/reset-admin-password.js --email=admin@empresa.com --new-password=TempPass123!
```

## Runbook 06 — Reset de senha admin (Cloud)

```bash
# 1. Acessar pod
kubectl -n orion-production exec -it deploy/orion-api -- bash

# 2. Rodar script
node scripts/reset-admin-password.js --email=admin@empresa.com

# 3. Forçar troca no próximo login
psql $DATABASE_URL -c "UPDATE users SET must_change_password=true WHERE email='admin@empresa.com';"

# 4. Audit
psql $DATABASE_URL -c "INSERT INTO audit_logs (action, user_id, ...) VALUES ('admin.password_reset', ...);"
```

## Runbook 07 — Verificar licença expirada / reativar

```bash
# Status
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/license-status.js --company-id=42

# Reativar com nova chave
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/activate-license.js --company-id=42 --key=NEW-KEY-HERE

# Verificar
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/license-status.js --company-id=42
```

## Runbook 08 — Diagnóstico de problemas gerais

```bash
# Logs em tempo real
kubectl -n orion-production logs -f deploy/orion-api --tail=200

# Logs de erro apenas (última 1h)
kubectl -n orion-production logs deploy/orion-api --since=1h | jq 'select(.level=="error" or .level=="fatal")'

# Migrações pendentes
kubectl -n orion-production exec deploy/orion-api -- npx prisma migrate status

# Health check
kubectl -n orion-production exec deploy/orion-api -- node scripts/health-check.js

# Conexões DB
kubectl -n orion-production exec deploy/orion-postgres -- \
  psql -U orion -c "SELECT count(*) FROM pg_stat_activity;"

# Redis info
kubectl -n orion-production exec deploy/orion-redis -- redis-cli info

# Métricas Prometheus
kubectl -n orion-production port-forward svc/prometheus 9090:9090
# Acesse http://localhost:9090
```

## Runbook 09 — Limpar cache Redis

**Contexto:** Cache stale causando dados inconsistentes.

```bash
# Cache específico (recomendado)
kubectl -n orion-production exec deploy/orion-redis -- \
  redis-cli -a $REDIS_PASSWORD DEL "ratelimit:ai_chat:5"

# Cache de uma empresa
kubectl -n orion-production exec deploy/orion-redis -- \
  redis-cli -a $REDIS_PASSWORD --scan --pattern "company:42:*" | xargs redis-cli -a $REDIS_PASSWORD DEL

# Flush completo (CUIDADO — invalida todas as sessões)
kubectl -n orion-production exec deploy/orion-redis -- \
  redis-cli -a $REDIS_PASSWORD FLUSHDB
```

**Pós-operação:** Forçar re-login dos usuários (sessões invalidadas).

## Runbook 10 — Reindexar embeddings IA (RAG)

**Contexto:** Embeddings desatualizados, novos dados não aparecem no chat.

```bash
# Reindexar empresa específica
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/ai-reindex.js --company-id=42

# Reindexar todas (longo)
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/ai-reindex.js --all --batch-size=100

# Verificar contagem
kubectl -n orion-production exec deploy/orion-postgres -- \
  psql -U orion -c "SELECT company_id, count(*) FROM ai_embeddings GROUP BY company_id;"
```

## Runbook 11 — Forçar logout de todos os usuários

**Contexto:** Comprometimento de chave JWT, breach suspeito.

```bash
# 1. Rotacionar chave JWT (causa re-login obrigatório)
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/rotate-jwt-keys.js

# 2. Flush Redis (invalida refresh tokens whitelist)
kubectl -n orion-production exec deploy/orion-redis -- \
  redis-cli -a $REDIS_PASSWORD --scan --pattern "refresh:*" | xargs redis-cli -a $REDIS_PASSWORD DEL
kubectl -n orion-production exec deploy/orion-redis -- \
  redis-cli -a $REDIS_PASSWORD --scan --pattern "session:*" | xargs redis-cli -a $REDIS_PASSWORD DEL

# 3. Restart API (carrega novas chaves)
kubectl -n orion-production rollout restart deploy/orion-api

# 4. Notificar usuários
node scripts/send-bulk-email.js --template=forced-logout-notification
```

## Runbook 12 — Bloquear empresa (tenant suspension)

**Contexto:** Non-payment, abuso, solicitação legal.

```bash
# Bloquear
kubectl -n orion-production exec deploy/orion-postgres -- \
  psql -U orion -c "UPDATE companies SET status='SUSPENDED', suspended_at=NOW() WHERE id=42;"

# Flush sessões
kubectl -n orion-production exec deploy/orion-redis -- \
  redis-cli -a $REDIS_PASSWORD --scan --pattern "session:*" | \
  xargs -I {} redis-cli -a $REDIS_PASSWORD DEL {}

# Verificar
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/check-company-status.js --company-id=42
```

## Runbook 13 — Restaurar config do Vault

**Contexto:** Vault indisponível, secrets precisam ser restaurados.

```bash
# 1. Verificar backup mais recente
aws s3 ls s3://orion-vault-backup/ --recursive | sort | tail -5

# 2. Restaurar
aws s3 cp s3://orion-vault-backup/vault-2025-01-15.snap /tmp/vault.snap
vault operator raft snapshot restore /tmp/vault.snap

# 3. Unseal (requer quórum de unseal keys)
vault operator unseal
# (3 dos 5 keyholders digitam suas shares)

# 4. Validar
vault status
vault kv list secret/orion
```

## Runbook 14 — Limpar fila BullMQ (jobs presos)

```bash
# Listar filas
kubectl -n orion-production exec deploy/orion-redis -- \
  redis-cli -a $REDIS_PASSWORD KEYS "bull:*"

# Limpar jobs falhos
kubectl -n orion-production exec deploy/orion-redis -- \
  redis-cli -a $REDIS_PASSWORD --scan --pattern "bull:export-queue:failed" | \
  xargs redis-cli -a $REDIS_PASSWORD DEL

# Reiniciar workers
kubectl -n orion-production rollout restart deploy/orion-worker
```

## Runbook 15 — Escalar banco PostgreSQL (vertical)

**Contexto:** CPU/IO alto, queries lentas.

```bash
# Verificar uso atual
aws rds describe-db-instances --db-instance-identifier orion-production
kubectl -n orion-production exec deploy/orion-postgres -- \
  psql -U orion -c "SELECT * FROM pg_stat_activity WHERE state='active';"

# Escalar (com downtime ~5 min)
aws rds modify-db-instance \
  --db-instance-identifier orion-production \
  --db-instance-class db.r6g.2xlarge \
  --apply-immediately

# Aguardar
aws rds wait db-instance-available --db-instance-identifier orion-production
```

## Runbook 16 — Adicionar read replica PostgreSQL

```bash
aws rds create-db-instance-read-replica \
  --db-instance-identifier orion-replica-1 \
  --source-db-instance-identifier orion-production \
  --db-instance-class db.r6g.large

aws rds wait db-instance-available --db-instance-identifier orion-replica-1

# Configurar app para usar replica em reads
kubectl -n orion-production edit secret orion-db-credentials
# Adicionar DATABASE_READ_REPLICA_URL=...
kubectl -n orion-production rollout restart deploy/orion-api
```

## Runbook 17 — Renovar certificado TLS

```bash
# ACM gerencia automaticamente, mas para verificar:
aws acm list-certificates
aws acm describe-certificate --certificate-arn arn:aws:acm:...:certificate/xxx

# Para certificados Let's Encrypt (on-premise):
certbot renew --dry-run
certbot renew
systemctl reload nginx
```

## Runbook 18 — Limpar logs antigos

```bash
# PostgreSQL audit logs > 5 anos
kubectl -n orion-production exec deploy/orion-postgres -- \
  psql -U orion -c "DELETE FROM audit_logs WHERE timestamp < NOW() - INTERVAL '5 years';"

# App logs no Loki (auto-expira em 90 dias, mas força):
kubectl -n orion-logging exec deploy/loki -- \
  curl -X POST -g 'http://localhost:3100/loki/api/v1/delete' \
  -d '{"query":"{app=\"orion-api\"}","start":"1704067200000000000","end":"1706745600000000000"}'

# S3 logs > 1 ano
aws s3api list-objects-v2 --bucket orion-logs --query 'Contents[?LastModified<`2024-01-01`]' | \
  jq -r '.[].Key' | xargs -I {} aws s3 rm s3://orion-logs/{}
```

## Runbook 19 — Reaplicar pods após node failure

```bash
# Identificar node com problema
kubectl get nodes
kubectl describe node ip-10-0-x-x.sa-east-1.compute.internal

# Cordoar e drenar
kubectl cordon ip-10-0-x-x.sa-east-1.compute.internal
kubectl drain ip-10-0-x-x.sa-east-1.compute.internal --ignore-daemonsets --delete-emptydir-data

# Verificar pods reescalonados
kubectl -n orion-production get pods -o wide

# Remover node
kubectl delete node ip-10-0-x-x.sa-east-1.compute.internal

# Cluster autoscaler criará novo node automaticamente
```

## Runbook 20 — Executar pen test agendado

```bash
# 1. Notificar stakeholders
node scripts/notify-pentest.js --date=2025-02-01 --window=02:00-06:00

# 2. Snapshot de DB (para rollback)
aws rds create-db-snapshot \
  --db-instance-identifier orion-production \
  --db-snapshot-identifier orion-pre-pentest-$(date +%Y%m%d)

# 3. Habilitar logging intensivo
kubectl -n orion-production set env deploy/orion-api LOG_LEVEL=debug
kubectl -n orion-production rollout restart deploy/orion-api

# 4. Executar scan (ZAP)
docker run -t owasp/zap2docker-stable zap-baseline.py -t https://api.orion.com

# 5. Ao final: restaurar log_level, notificar fim
kubectl -n orion-production set env deploy/orion-api LOG_LEVEL=info
```

## Runbook 21 — Restabelecer integração WhatsApp (quando cai)

```bash
# Verificar status
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/integration-status.js --name=whatsapp

# Re-autenticar (se token expirou)
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/whatsapp-reauth.js --company-id=42

# Reenviar fila pendente
kubectl -n orion-production exec deploy/orion-api -- \
  node scripts/whatsapp-flush-queue.js
```

## Runbook 22 — Failover para região DR

**Contexto:** Desastre regional (região primary indisponível).

```bash
# 1. Promover replica DR para primary
aws rds promote-read-replica --db-instance-identifier orion-dr-replica

# 2. Atualizar Route53 para apontar para nova região
aws route53 change-resource-record-sets --hosted-zone-id Z123 --change-batch '{
  "Changes":[{"Action":"UPSERT","ResourceRecordSet":{"Name":"api.orion.com","Type":"CNAME","TTL":60,"ResourceRecords":[{"Value":"orion-dr.xxx.sa-east-1.rds.amazonaws.com"}]}}]
}'

# 3. Reconfigurar app para nova região
kubectl config use-context orion-dr
kubectl -n orion-production rollout restart deploy/orion-api

# 4. Validar
curl -f https://api.orion.com/health
```

---

# Capítulo 9 — Kubernetes Manifests (Cloud Edition)

## 9.1 Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: orion-production
  labels:
    name: orion-production
    environment: production
    istio-injection: enabled
```

## 9.2 ConfigMap

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: orion-config
  namespace: orion-production
data:
  NODE_ENV: "production"
  APP_URL: "https://app.orion.com"
  API_URL: "https://api.orion.com"
  DATABASE_POOL_MIN: "5"
  DATABASE_POOL_MAX: "20"
  LOG_LEVEL: "info"
  REDIS_URL: "redis://orion-redis.orion-production.svc.cluster.local:6379"
  OTEL_EXPORTER_OTLP_ENDPOINT: "http://otel-collector.observability.svc.cluster.local:4318"
  OTEL_SERVICE_NAME: "orion-api"
```

## 9.3 Secret (via External Secrets Operator)

```yaml
# k8s/externalsecret.yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: orion-secrets
  namespace: orion-production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: orion-secrets
    creationPolicy: Owner
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: secret/orion/production
        property: database_url
    - secretKey: JWT_SECRET
      remoteRef:
        key: secret/orion/production
        property: jwt_secret
    - secretKey: ENCRYPTION_KEY
      remoteRef:
        key: secret/orion/production
        property: encryption_key
    - secretKey: OPENAI_API_KEY
      remoteRef:
        key: secret/orion/production
        property: openai_api_key
    - secretKey: S3_BUCKET
      remoteRef:
        key: secret/orion/production
        property: s3_bucket
```

## 9.4 Deployment (orion-api)

```yaml
# k8s/deployment-api.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orion-api
  namespace: orion-production
  labels:
    app: orion-api
    version: "1.0.0"
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: orion-api
  template:
    metadata:
      labels:
        app: orion-api
        version: "1.0.0"
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: orion-api
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
        seccompProfile:
          type: RuntimeDefault
      containers:
        - name: orion-api
          image: 123456789012.dkr.ecr.sa-east-1.amazonaws.com/orion/app:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3001
              name: http
              protocol: TCP
          envFrom:
            - configMapRef:
                name: orion-config
            - secretRef:
                name: orion-secrets
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 3
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 2
            failureThreshold: 2
          startupProbe:
            httpGet:
              path: /health
              port: http
            failureThreshold: 30
            periodSeconds: 10
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          volumeMounts:
            - name: tmp
              mountPath: /tmp
            - name: jwt-keys
              mountPath: /etc/orion/keys
              readOnly: true
      volumes:
        - name: tmp
          emptyDir: {}
        - name: jwt-keys
          secret:
            secretName: orion-jwt-keys
            defaultMode: 0400
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - orion-api
                topologyKey: kubernetes.io/hostname
      tolerations:
        - key: "dedicated"
          operator: "Equal"
          value: "orion"
          effect: "NoSchedule"
```

## 9.5 HorizontalPodAutoscaler

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: orion-api
  namespace: orion-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: orion-api
  minReplicas: 3
  maxReplicas: 30
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "100"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Percent
          value: 100
          periodSeconds: 30
        - type: Pods
          value: 5
          periodSeconds: 30
      selectPolicy: Max
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 25
          periodSeconds: 60
```

## 9.6 PodDisruptionBudget

```yaml
# k8s/pdb.yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: orion-api
  namespace: orion-production
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: orion-api
```

## 9.7 Service

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: orion-api
  namespace: orion-production
spec:
  type: ClusterIP
  selector:
    app: orion-api
  ports:
    - name: http
      port: 80
      targetPort: 3001
      protocol: TCP
```

## 9.8 Ingress

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: orion-api
  namespace: orion-production
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS":443}]'
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:sa-east-1:xxx:certificate/yyy
    alb.ingress.kubernetes.io/ssl-policy: ELBSecurityPolicy-TLS13-1-2-2021-06
    alb.ingress.kubernetes.io/ssl-redirect: '443'
    alb.ingress.kubernetes.io/wafv2-acl-arn: arn:aws:wafv2:sa-east-1:xxx:webacl/orion-waf/yyy
    alb.ingress.kubernetes.io/load-balancer-attributes: routing.http.drop_invalid_header_fields.enabled=true
    alb.ingress.kubernetes.io/healthcheck-path: /health
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: '10'
    alb.ingress.kubernetes.io/healthcheck-timeout-seconds: '3'
spec:
  rules:
    - host: api.orion.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: orion-api
                port:
                  number: 80
```

## 9.9 NetworkPolicy

```yaml
# k8s/networkpolicy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: orion-api
  namespace: orion-production
spec:
  podSelector:
    matchLabels:
      app: orion-api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: ingress-nginx
      ports:
        - protocol: TCP
          port: 3001
  egress:
    # DNS
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: UDP
          port: 53
    # PostgreSQL
    - to:
        - podSelector:
            matchLabels:
              app: orion-postgres
      ports:
        - protocol: TCP
          port: 5432
    # Redis
    - to:
        - podSelector:
            matchLabels:
              app: orion-redis
      ports:
        - protocol: TCP
          port: 6379
    # HTTPS to external APIs (OpenAI, etc.)
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
      ports:
        - protocol: TCP
          port: 443
```

## 9.10 ServiceAccount e RBAC

```yaml
# k8s/serviceaccount.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: orion-api
  namespace: orion-production
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/orion-api-irsa
automountServiceAccountToken: true
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: orion-api
  namespace: orion-production
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: orion-api
  namespace: orion-production
subjects:
  - kind: ServiceAccount
    name: orion-api
roleRef:
  kind: Role
  name: orion-api
  apiGroup: rbac.authorization.k8s.io
```

## 9.11 StatefulSet (PostgreSQL) — Para ambientes self-managed

(Em cloud, usamos RDS gerenciado. Manifest abaixo para on-prem Kubernetes.)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: orion-postgres
  namespace: orion-production
spec:
  serviceName: orion-postgres
  replicas: 1
  selector:
    matchLabels:
      app: orion-postgres
  template:
    metadata:
      labels:
        app: orion-postgres
    spec:
      securityContext:
        fsGroup: 999
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              valueFrom:
                secretKeyRef:
                  name: orion-db
                  key: database
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: orion-db
                  key: username
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: orion-db
                  key: password
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          resources:
            requests:
              cpu: 1000m
              memory: 2Gi
            limits:
              cpu: 4000m
              memory: 8Gi
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
          livenessProbe:
            exec:
              command: ["pg_isready", "-U", "orion"]
            initialDelaySeconds: 30
            periodSeconds: 10
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: gp3
        resources:
          requests:
            storage: 100Gi
```

---

# Capítulo 10 — Terraform (AWS/GCP)

## 10.1 Estrutura de Diretórios

```
infra/
├── modules/
│   ├── vpc/
│   ├── eks/
│   ├── rds/
│   ├── redis/
│   ├── s3/
│   ├── cloudfront/
│   ├── waf/
│   ├── route53/
│   └── kms/
├── environments/
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── terraform.tfvars
└── shared/
    └── modules.tf
```

## 10.2 VPC Module

```hcl
# modules/vpc/main.tf
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "${var.project}-${var.environment}"
  cidr = var.cidr

  azs             = ["${var.region}a", "${var.region}b", "${var.region}c"]
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets
  database_subnets = var.database_subnets

  enable_nat_gateway   = true
  single_nat_gateway   = var.environment != "production"
  enable_dns_hostnames = true
  enable_dns_support   = true

  enable_flow_log = true
  flow_log_destination_type = "cloud-watch-logs"
  flow_log_cloud_watch_log_group_name = "/aws/vpc/${var.project}-${var.environment}"

  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/${var.project}-${var.environment}" = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/${var.project}-${var.environment}" = "shared"
  }

  tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
```

## 10.3 EKS Cluster

```hcl
# modules/eks/main.tf
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  version = "20.0.0"

  cluster_name    = "${var.project}-${var.environment}"
  cluster_version = "1.29"

  cluster_endpoint_public_access       = true
  cluster_endpoint_public_access_cidrs = var.admin_cidrs
  cluster_endpoint_private_access      = true

  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks.arn
    resources        = ["secrets"]
  }

  enable_irsa = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent              = true
      service_account_role_arn = module.vpc_cni_irsa.iam_role_arn
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    general = {
      name = "general"

      instance_types = ["t3.large"]
      min_size     = 2
      max_size     = 5
      desired_size = 3

      labels = {
        role = "general"
      }

      taints = []

      disk_size = 50
      disk_type = "gp3"

      create_security_group = false
      vpc_security_group_ids = [aws_security_group.node_additional.id]
    }

    orion-api = {
      name = "orion-api"

      instance_types = ["c6i.xlarge"]
      min_size     = 3
      max_size     = 20
      desired_size = 5

      labels = {
        role = "orion-api"
        dedicated = "orion"
      }

      taints = [{
        key    = "dedicated"
        value  = "orion"
        effect = "NO_SCHEDULE"
      }]

      disk_size = 100
      disk_type = "gp3"
      k8s_labels = {
        Environment = var.environment
      }
    }
  }

  access_entries = {
    admin = {
      principal_arn = var.admin_role_arn
      policy_associations = {
        cluster_admin = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
          access_scope = { type = "cluster" }
        }
      }
    }
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

resource "aws_kms_key" "eks" {
  description             = "EKS secret encryption key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}
```

## 10.4 RDS PostgreSQL

```hcl
# modules/rds/main.tf
module "rds" {
  source = "terraform-aws-modules/rds/aws"
  version = "6.0.0"

  identifier = "${var.project}-${var.environment}"

  engine            = "postgres"
  engine_version    = "16.2"
  instance_class    = var.environment == "production" ? "db.r6g.2xlarge" : "db.t4g.large"
  allocated_storage = 100
  storage_type      = "gp3"
  storage_encrypted = true
  kms_key_id        = aws_kms_key.rds.arn

  db_name  = "orion"
  username = "orion_admin"
  manage_master_user_password = true
  master_user_secret_kms_key_id = aws_kms_key.rds.arn

  multi_az               = var.environment == "production"
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [aws_security_group.rds.id]

  backup_retention_period = 35
  backup_window           = "02:00-03:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot   = true
  deletion_protection     = var.environment == "production"
  skip_final_snapshot     = false
  final_snapshot_identifier = "${var.project}-${var.environment}-final"

  performance_insights_enabled = true
  performance_insights_retention_period = 731
  monitoring_interval          = 30
  monitoring_role_arn          = aws_iam_role.rds_enhanced_monitoring.arn
  create_monitoring_role       = true

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  family = "postgres16"

  parameters = [
    { name = "log_connections",      value = "1" },
    { name = "log_disconnections",   value = "1" },
    { name = "log_min_duration_statement", value = "500" },
    { name = "log_lock_waits",       value = "1" },
    { name = "log_temp_files",       value = "0" },
    { name = "log_autovacuum_min_duration", value = "0" },
    { name = "shared_preload_libraries", value = "pgaudit,pg_stat_statements,vector" },
    { name = "pgvector.max_cache_size", value = "1048576" },
  ]

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}

# Read replicas
resource "aws_db_instance" "replica" {
  count = var.environment == "production" ? 2 : 0

  identifier              = "${var.project}-${var.environment}-replica-${count.index + 1}"
  replicate_source_db     = module.rds.db_instance_id
  instance_class          = "db.r6g.xlarge"
  db_subnet_group_name    = module.vpc.database_subnet_group_name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  storage_encrypted       = true
  kms_key_id              = aws_kms_key.rds.arn
  multi_az                = false
  backup_retention_period = 0
  deletion_protection     = true
  copy_tags_to_snapshot   = true

  tags = {
    Project     = var.project
    Environment = var.environment
    Role        = "read-replica"
  }
}
```

## 10.5 ElastiCache Redis

```hcl
# modules/redis/main.tf
resource "aws_elasticache_replication_group" "orion" {
  replication_group_id = "${var.project}-${var.environment}"
  description          = "Orion Redis cluster"

  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.environment == "production" ? "cache.r6g.2xlarge" : "cache.t4g.medium"
  num_cache_clusters   = var.environment == "production" ? 3 : 1
  parameter_group_name = "default.redis7"

  subnet_group_name    = aws_elasticache_subnet_group.orion.name
  security_group_ids   = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  kms_key_id                = aws_kms_key.redis.arn
  transit_encryption_enabled = true
  auth_token                 = random_password.redis_auth.result
  auth_token_update_strategy = "ROTATE"

  automatic_failover_enabled = var.environment == "production"
  multi_az_enabled           = var.environment == "production"

  snapshot_retention_limit = 7
  snapshot_window          = "03:00-05:00"
  maintenance_window       = "sun:06:00-sun:07:00"

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }

  tags = {
    Project     = var.project
    Environment = var.environment
  }
}
```

## 10.6 CloudFront (CDN para Frontend)

```hcl
# modules/cloudfront/main.tf
resource "aws_cloudfront_distribution" "orion_frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "Orion Frontend CDN"
  default_root_object = "index.html"
  price_class         = "PriceClass_200"  # North America + Europe + Asia (no South America cheapest)
  # Para SA: PriceClass_100 inclui SA edge locations

  aliases = ["app.orion.com", "www.orion.com"]

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-frontend"
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-frontend"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true

    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
  }

  # SPA fallback
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.orion.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  web_acl_id = aws_wafv2_web_acl.orion.arn

  tags = {
    Project = var.project
  }
}

resource "aws_cloudfront_response_headers_policy" "security" {
  name = "orion-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
    content_type_options { override = true }
    frame_options { frame_option = "DENY" override = true }
    referrer_policy { referrer_policy = "strict-origin-when-cross-origin" override = true }
    content_security_policy {
      content_security_policy = "default-src 'self'; img-src 'self' data: https:; object-src 'none'"
      override = true
    }
  }
}
```

## 10.7 WAF (Web Application Firewall)

```hcl
# modules/waf/main.tf
resource "aws_wafv2_web_acl" "orion" {
  name        = "orion-waf"
  description = "WAF for Orion API and Frontend"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Rate limit por IP
  rule {
    name     = "rate-limit-per-ip"
    priority = 1
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "rate-limit-per-ip"
      sampled_requests_enabled   = true
    }
  }

  # SQL injection
  rule {
    name     = "sql-injection"
    priority = 2
    action { block {} }
    statement {
      sqli_match_statement {
        field_to_match { all_query_arguments {} }
        text_transformation { priority = 0 type = "URL_DECODE" }
        text_transformation { priority = 1 type = "HTML_ENTITY_DECODE" }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "sql-injection"
      sampled_requests_enabled   = true
    }
  }

  # XSS
  rule {
    name     = "xss"
    priority = 3
    action { block {} }
    statement {
      xss_match_statement {
        field_to_match { all_query_arguments {} }
        text_transformation { priority = 0 type = "URL_DECODE" }
        text_transformation { priority = 1 type = "HTML_ENTITY_DECODE" }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "xss"
      sampled_requests_enabled   = true
    }
  }

  # AWS Managed Rules
  rule {
    name     = "aws-managed-core"
    priority = 10
    override_action { count {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "aws-managed-core"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "aws-managed-ip-rep"
    priority = 11
    override_action { count {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesAmazonIpReputationList"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "aws-managed-ip-rep"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "aws-managed-bot"
    priority = 12
    override_action { count {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesBotControlRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "aws-managed-bot"
      sampled_requests_enabled   = true
    }
  }

  # Geo block (opcional — bloqueia países não atendidos)
  rule {
    name     = "geo-block"
    priority = 20
    action { block {} }
    statement {
      geo_match_statement {
        country_codes = ["CN", "RU", "KP", "IR"]
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "geo-block"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name               = "orion-waf"
    sampled_requests_enabled   = true
  }

  tags = {
    Project = var.project
  }
}
```

## 10.8 Outputs

```hcl
# outputs.tf
output "vpc_id" {
  value = module.vpc.vpc_id
}

output "rds_endpoint" {
  value     = module.rds.db_instance_endpoint
  sensitive = false
}

output "redis_endpoint" {
  value = aws_elasticache_replication_group.orion.primary_endpoint_address
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.orion_frontend.domain_name
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}
```

---

# Capítulo 11 — Monitoring Stack (Prometheus, Grafana, AlertManager)

## 11.1 Instalação (via Helm)

```bash
# Namespace
kubectl create namespace observability

# Prometheus Stack (Prometheus + AlertManager + Grafana)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace observability \
  --version 55.0.0 \
  -f monitoring-values.yaml
```

## 11.2 Values Customizados

```yaml
# monitoring-values.yaml
prometheus:
  prometheusSpec:
    retention: 30d
    retentionSize: 50GB
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: gp3
          resources:
            requests:
              storage: 100Gi
    serviceMonitorSelectorNilUsesHelmValues: false
    podMonitorSelectorNilUsesHelmValues: false
    ruleSelectorNilUsesHelmValues: false

    additionalScrapeConfigs:
      - job_name: 'orion-api'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port, __meta_kubernetes_pod_ip]
            action: replace
            regex: (.+);(([A-Fa-f0-9]{1,4}::?){1,7}[A-Fa-f0-9]{1,4}|(\d{1,3}\.){3}\d{1,3})
            target_label: __address__
            replacement: $2:$1

alertmanager:
  config:
    route:
      group_by: ['alertname', 'namespace', 'severity']
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 4h
      receiver: 'slack-default'
      routes:
        - matchers: ['severity="critical"']
          receiver: 'pagerduty-critical'
        - matchers: ['severity="warning"']
          receiver: 'slack-warning'
    receivers:
      - name: 'slack-default'
        slack_configs:
          - api_url: 'https://hooks.slack.com/services/xxx'
            channel: '#orion-alerts'
      - name: 'slack-warning'
        slack_configs:
          - api_url: 'https://hooks.slack.com/services/xxx'
            channel: '#orion-alerts'
            send_resolved: true
      - name: 'pagerduty-critical'
        pagerduty_configs:
          - service_key: 'xxx'

grafana:
  adminPassword: "${GRAFANA_ADMIN_PASSWORD}"
  persistence:
    enabled: true
    size: 10Gi
    storageClassName: gp3
  ingress:
    enabled: true
    hosts: [grafana.orion.internal]
    tls:
      - hosts: [grafana.orion.internal]
        secretName: grafana-tls
  datasources:
    - name: Prometheus
      type: prometheus
      url: http://kube-prometheus-stack-prometheus.observability.svc.cluster.local:9090
      isDefault: true
    - name: Loki
      type: loki
      url: http://loki.observability.svc.cluster.local:3100
    - name: Jaeger
      type: jaeger
      url: http://jaeger-query.observability.svc.cluster.local:16686
```

## 11.3 Prometheus Rules (Alerts)

```yaml
# prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: orion-alerts
  namespace: orion-production
spec:
  groups:
    - name: orion-api.rules
      rules:
        - alert: HighErrorRate
          expr: |
            sum(rate(http_requests_total{job="orion-api",code=~"5.."}[5m])) by (namespace)
            /
            sum(rate(http_requests_total{job="orion-api"}[5m])) by (namespace)
            > 0.05
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "High error rate in {{ $labels.namespace }}"
            description: "Error rate is {{ $value | humanizePercentage }} (> 5%) for 5 minutes"

        - alert: HighLatencyP95
          expr: |
            histogram_quantile(0.95,
              sum(rate(http_request_duration_seconds_bucket{job="orion-api"}[5m])) by (le)
            ) > 2
          for: 10m
          labels:
            severity: warning
          annotations:
            summary: "High latency p95"
            description: "p95 latency is {{ $value }}s (> 2s) for 10 minutes"

        - alert: PodCrashLooping
          expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
          for: 5m
          labels:
            severity: warning
          annotations:
            summary: "Pod {{ $labels.pod }} is restarting"

        - alert: DatabaseConnectionsHigh
          expr: pg_stat_activity_count{state="active"} > 80
          for: 5m
          labels:
            severity: warning

        - alert: DiskSpaceLow
          expr: |
            (node_filesystem_avail_bytes{mountpoint="/"}
              / node_filesystem_size_bytes{mountpoint="/"}) < 0.20
          for: 10m
          labels:
            severity: warning

        - alert: DiskSpaceCritical
          expr: |
            (node_filesystem_avail_bytes{mountpoint="/"}
              / node_filesystem_size_bytes{mountpoint="/"}) < 0.05
          for: 5m
          labels:
            severity: critical

        - alert: RedisMemoryHigh
          expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.8
          for: 5m
          labels:
            severity: warning

        - alert: BackupFailed
          expr: orion_backup_last_success_timestamp > (time() - 86400)
          for: 1h
          labels:
            severity: critical
```

## 11.4 Métricas Customizadas (App)

```typescript
// src/lib/monitoring/metrics.ts
import { Counter, Histogram, Gauge, register } from 'prom-client';

register.setDefaultLabels({ service: 'orion-api' });

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'code'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

export const dbConnections = new Gauge({
  name: 'db_connections_active',
  help: 'Active DB connections',
});

export const cacheHitRate = new Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate',
  labelNames: ['cache_name'],
});

export const aiTokensUsed = new Counter({
  name: 'ai_tokens_total',
  help: 'AI tokens used',
  labelNames: ['provider', 'model', 'type'], // type: input|output
});

export const aiCost = new Counter({
  name: 'ai_cost_usd_total',
  help: 'AI cost in USD',
  labelNames: ['provider', 'model'],
});

// Endpoint /metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

## 11.5 Dashboards Grafana

JSON dashboards versionados em `monitoring/dashboards/`:
1. **Orion Overview:** requests/min, error rate, latency, pods
2. **Database:** connections, slow queries, replication lag
3. **Redis:** memory, hit rate, evictions
4. **AI:** tokens/min, cost/day, latency, cache hit rate
5. **Kubernetes:** node CPU/memory, pod restarts
6. **Business:** active users, goals created, results approved

---

# Capítulo 12 — Logging Stack (ELK, Loki)

## 12.1 Loki (recomendado — mais leve que ELK)

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack \
  --namespace observability \
  --set loki.persistence.enabled=true \
  --set loki.persistence.size=100Gi \
  --set promtail.enabled=true \
  --set promtail.config.lokiUrl=http://loki.observability.svc.cluster.local:3100/loki/api/v1/push
```

## 12.2 Promtail Config

```yaml
# promtail-config.yaml
server:
  http_listen_port: 9080

positions:
  filename: /positions/positions.yaml

clients:
  - url: http://loki.observability.svc.cluster.local:3100/loki/api/v1/push
    tenant_id: orion

scrape_configs:
  - job_name: kubernetes-pods
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_namespace]
        target_label: namespace
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod
      - source_labels: [__meta_kubernetes_pod_label_app]
        target_label: app
    pipeline_stages:
      - json:
          expressions:
            level: level
            timestamp: timestamp
            message: message
            userId: meta.userId
            requestId: meta.requestId
      - labels:
          level:
      - timestamp:
          source: timestamp
          format: RFC3339Nano
      - output:
          source: message
```

## 12.3 Estrutura de Log

```typescript
// src/lib/logger.ts
import winston from 'winston';
import { redactPII } from './pii-redact';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format((info) => {
    info.message = redactPII(info.message);
    if (info.meta) info.meta = redactPII(JSON.stringify(info.meta));
    return info;
  })()
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'orion-api', version: process.env.APP_VERSION },
  transports: [new winston.transports.Console()],
});

// Uso
logger.info('Goal created', { userId: 5, goalId: 42, requestId: 'req_abc' });
logger.error('Database error', { error: err.message, stack: err.stack });
```

Exemplo de saída:
```json
{
  "level": "info",
  "timestamp": "2025-08-15T14:30:00.123Z",
  "service": "orion-api",
  "version": "1.0.0",
  "message": "Goal created",
  "meta": { "userId": 5, "goalId": 42, "requestId": "req_abc" }
}
```

## 12.4 ELK Stack (alternativa)

Para ambientes que exigem ELK:
- Elasticsearch: 3-node cluster, 30GB cada, index pattern `orion-logs-*`
- Logstash: pipeline parse JSON → enrich (geoip, user agent) → ES
- Kibana: dashboards, saved searches, alerts

## 12.5 Retenção

| Tipo | Período | Local |
|---|---|---|
| App logs | 90 dias | Loki |
| Audit logs | 5 anos | PostgreSQL + S3 (WORM) |
| Access logs (ALB) | 90 dias | S3 + Athena |
| Error logs | 1 ano | Sentry + Loki |
| AI conversation logs | 90 dias | PostgreSQL |

## 12.6 Consultas Loki (LogQL)

```
# Erros nas últimas 1h
{app="orion-api"} |= "error" | json | level="error"

# Latência > 1s nas últimas 5m
{app="orion-api"} | json | duration > 1000

# Requests de um usuário específico
{app="orion-api"} | json | meta_userId="5"

# Contagem de erros por rota (última 1h)
sum(count_over_time({app="orion-api"} | json | level="error" [1h])) by (meta_route)
```

---

# Capítulo 13 — Distributed Tracing (Jaeger)

## 13.1 Instalação

```bash
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm install jaeger jaegertracing/jaeger \
  --namespace observability \
  --set provisionDataStore.cassandra=true \
  --set storage.type=cassandra \
  --set cassandra.persistence.size=50Gi
```

## 13.2 OpenTelemetry SDK no App

```typescript
// src/lib/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis-4';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { trace, context } from '@opentelemetry/api';

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'orion-api',
    [ATTR_SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PgInstrumentation(),
    new RedisInstrumentation(),
  ],
});

sdk.start();

export function getTracer() {
  return trace.getTracer('orion-api');
}

export function withSpan<T>(name: string, fn: () => T): T {
  const tracer = getTracer();
  return tracer.startActiveSpan(name, (span) => {
    try {
      const result = fn();
      span.end();
      return result;
    } catch (err) {
      span.recordException(err);
      span.setStatus({ code: 2, message: err.message });
      span.end();
      throw err;
    }
  });
}
```

## 13.3 Propagação de Trace Context

```typescript
// Middleware: extrai trace context do incoming request
import { context, propagation } from '@opentelemetry/api';

app.use((req, res, next) => {
  const extractedContext = propagation.extract(context.active(), {
    traceparent: req.headers['traceparent'],
    tracestate: req.headers['tracestate'],
  });
  context.with(extractedContext, next);
});

// Quando chama serviços externos (LLM, S3, etc), injeta trace context
import { context, propagation } from '@opentelemetry/api';

const headers = {};
propagation.inject(context.active(), headers);
await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { ...headers, 'Authorization': `Bearer ${apiKey}` },
});
```

## 13.4 Spans Customizados

```typescript
export async function createGoal(dto: CreateGoalDto, user: User) {
  return withSpan('createGoal', async () => {
    const span = trace.getActiveSpan();
    span?.setAttributes({
      'user.id': user.id,
      'goal.branchId': dto.branchId,
      'goal.targetValue': dto.targetValue,
    });

    const goal = await withSpan('db.create', () => db.goal.create({ data: dto }));
    span?.setAttribute('goal.id', goal.id);

    await withSpan('ai.reindex', () => aiService.reindex('goal', goal.id));
    await withSpan('notify', () => notificationService.notifyGoalCreated(goal));

    return goal;
  });
}
```

## 13.5 Dashboards Jaeger

- UI: `http://jaeger.observability.svc.cluster.local:16686`
- Busca por service, operation, tags
- Visualização de trace completo (HTTP → DB → Redis → External API)
- Análise de latência por span

---

# Capítulo 14 — Blue-Green Deployment

## 14.1 Conceito

Mantém dois ambientes idênticos (blue e green). Apenas um recebe tráfego. Deploy novo vai para o inativo, testes, então switch de tráfego.

```
         ┌─────────────┐
Traffic ─►│   Blue (v1) │◄── ativo
         └─────────────┘
         ┌─────────────┐
         │  Green (v2) │◄── novo deploy, sem tráfego
         └─────────────┘
```

## 14.2 Implementação Kubernetes

```yaml
# k8s/deployment-blue.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orion-api-blue
  namespace: orion-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: orion-api
      slot: blue
  template:
    metadata:
      labels:
        app: orion-api
        slot: blue
    spec:
      containers:
        - name: orion-api
          image: orion/app:1.0.0  # versão atual
          # ...
---
# k8s/deployment-green.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orion-api-green
  namespace: orion-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: orion-api
      slot: green
  template:
    metadata:
      labels:
        app: orion-api
        slot: green
    spec:
      containers:
        - name: orion-api
          image: orion/app:1.1.0  # nova versão
---
# k8s/service-blue-green.yaml
apiVersion: v1
kind: Service
metadata:
  name: orion-api
  namespace: orion-production
spec:
  selector:
    app: orion-api
    slot: blue  # muda para green no switch
  ports:
    - port: 80
      targetPort: 3001
```

## 14.3 Script de Switch

```bash
#!/bin/bash
# scripts/blue-green-switch.sh
set -euo pipefail

NEW_SLOT=${1:?Usage: ./switch.sh blue|green}
NAMESPACE=orion-production

echo "Switching traffic to $NEW_SLOT"

# 1. Verificar novo slot está healthy
kubectl -n $NAMESPACE wait --for=condition=available deployment/orion-api-$NEW_SLOT --timeout=5m

# 2. Patch service
kubectl -n $NAMESPACE patch svc orion-api -p "{\"spec\":{\"selector\":{\"slot\":\"$NEW_SLOT\"}}}"

# 3. Validar tráfego
sleep 30
curl -f https://api.orion.com/health

# 4. Scale down old slot
OLD_SLOT=$([ "$NEW_SLOT" = "blue" ] && echo "green" || echo "blue")
kubectl -n $NAMESPACE scale deployment orion-api-$OLD_SLOT --replicas=0

echo "Switch complete. Active: $NEW_SLOT"
```

## 14.4 Rollback

```bash
# Imediato: switch de volta
./scripts/blue-green-switch.sh $OLD_SLOT

# Old slot ainda tem replicas=0, mas pode re-scalonar rápido
kubectl -n orion-production scale deployment orion-api-$OLD_SLOT --replicas=3
./scripts/blue-green-switch.sh $OLD_SLOT
```

## 14.5 Considerações

- **Migrations:** devem ser backward compatible (Capítulo 16)
- **Sessions:** armazenadas em Redis (compartilhado entre blue/green)
- **Uploads:** S3 (compartilhado)
- **WebSockets:** precisam reconnect após switch (graceful shutdown)
- **Custos:** 2x replicas durante switch (breve)

---

# Capítulo 15 — Canary Deployment

## 15.1 Conceito

Roteia gradualmente tráfego para nova versão: 5% → 25% → 50% → 100%. Se anomalia, rollback rápido.

## 15.2 Implementação com Istio / Argo Rollouts

### 15.2.1 Argo Rollouts

```yaml
# k8s/rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: orion-api
  namespace: orion-production
spec:
  replicas: 10
  strategy:
    canary:
      canaryService: orion-api-canary
      stableService: orion-api-stable
      trafficRouting:
        istio:
          virtualService:
            name: orion-api-vs
            routes:
            - primary
      steps:
      - setWeight: 5
      - pause: { duration: 10m }
      - analysis:
          templates:
          - templateName: success-rate
          args:
          - name: service-name
            value: orion-api-canary
      - setWeight: 25
      - pause: { duration: 10m }
      - analysis:
          templates:
          - templateName: success-rate
      - setWeight: 50
      - pause: { duration: 10m }
      - setWeight: 100
  selector:
    matchLabels:
      app: orion-api
  template:
    metadata:
      labels:
        app: orion-api
    spec:
      containers:
      - name: orion-api
        image: orion/app:1.1.0
        # ...
```

### 15.2.2 Analysis Template

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
  namespace: orion-production
spec:
  args:
  - name: service-name
  metrics:
  - name: success-rate
    interval: 1m
    successCondition: result[0] >= 0.95
    failureLimit: 3
    provider:
      prometheus:
        address: http://prometheus.observability.svc.cluster.local:9090
        query: |
          sum(rate(http_requests_total{service="{{args.service-name}}",code!~"5.."}[2m]))
          /
          sum(rate(http_requests_total{service="{{args.service-name}}"}[2m]))
```

### 15.2.3 Istio VirtualService

```yaml
apiVersion: networking.istio.io/v1
kind: VirtualService
metadata:
  name: orion-api-vs
  namespace: orion-production
spec:
  gateways:
  - orion-gateway
  hosts:
  - api.orion.com
  http:
  - name: primary
    route:
    - destination:
        host: orion-api-stable
        port:
          number: 80
      weight: 100
    - destination:
        host: orion-api-canary
        port:
          number: 80
      weight: 0
```

## 15.3 Auto-rollback

- Analysis template falha 3x consecutivas → Argo Rollouts aborta canary
- Tráfego volta 100% para stable
- Notificação Slack: "Canary failed, rolled back"
- Equipe investiga logs/metrics do canary

## 15.4 Feature Flags Complementares

Para features novas (não só versões), usar feature flags:

```typescript
// LaunchDarkly ou Unleash
if (await featureFlags.isEnabled('new-dashboard-v2', user)) {
  return renderDashboardV2();
}
return renderDashboardV1();
```

Permite ligar/desligar feature sem deploy.

---

# Capítulo 16 — Database Migration Strategies (Zero-Downtime)

Migrations em produção sem downtime seguem 4 fases. Princípio: cada migration deve ser backward compatible com a versão anterior do app.

## 16.1 Tipos de Mudança

| Mudança | Estratégia | Downtime |
|---|---|---|
| Add column (nullable) | Direto | 0 |
| Add column (NOT NULL with default) | Multi-step | 0 |
| Remove column | Multi-step (deprecate, then drop) | 0 |
| Rename column | Multi-step (add new, copy, drop old) | 0 |
| Change column type | Multi-step (add new, copy, drop old) | 0 |
| Add index | CREATE INDEX CONCURRENTLY | 0 |
| Add constraint | Multi-step (validate, then add) | 0 |
| Drop table | Multi-step (deprecate, then drop) | 0 |
| Large data backfill | Batch updates with throttling | 0 |

## 16.2 Padrão Multi-Step (Exemplo: rename column)

**Cenário:** Renomear `users.name` para `users.full_name`.

### Step 1: Add new column (deploy v1.1)

```sql
-- Migration: 20250115_add_full_name_column
ALTER TABLE users ADD COLUMN full_name TEXT;
```

App v1.1: continua escrevendo em `name`, lê de `name` (fallback) ou `full_name` se existir.

```typescript
// App code (v1.1)
async function getUserName(user) {
  return user.full_name ?? user.name;
}
async function setUserName(user, value) {
  await db.user.update({ where: { id: user.id }, data: { name: value, full_name: value } });
}
```

### Step 2: Backfill (background job)

```sql
-- Roda em batches (sem lock prolongado)
UPDATE users SET full_name = name WHERE full_name IS NULL AND id BETWEEN 1 AND 10000;
-- Próximo batch: 10001-20000
-- ...
```

Script: `scripts/backfill-full-name.js` com throttle (sleep 100ms entre batches).

### Step 3: Validate backfill completo

```sql
SELECT count(*) FROM users WHERE full_name IS NULL;  -- deve ser 0
```

### Step 4: App v1.2 para de escrever em `name`

App v1.2: escreve apenas em `full_name`, lê apenas de `full_name`.

### Step 5: Drop old column (deploy v1.3, após v1.2 100% rolled out)

```sql
-- Migration: 20250120_drop_name_column
ALTER TABLE users DROP COLUMN name;
```

## 16.3 Add Index (Zero-Downtime)

```sql
-- NUNCA use CREATE INDEX (locka tabela para writes)
-- CREATE INDEX idx_name ON users(name);

-- USE CREATE INDEX CONCURRENTLY (não locka, mas leva mais tempo)
CREATE INDEX CONCURRENTLY idx_users_full_name ON users(full_name);

-- Para índices únicos:
CREATE UNIQUE INDEX CONCURRENTLY idx_users_email_unique ON users(email);
```

Cuidado: `CONCURRENTLY` não pode rodar dentro de transação. Prisma migrations precisam de configuração especial:

```sql
-- prisma/migrations/20250115_add_index/migration.sql
-- Prisma: desabilitar transaction wrapper
-- Criar arquivo manualmente com:
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_full_name ON users(full_name);
```

```typescript
// prisma/migrations/20250115_add_index/migration.sql
-- Manual migration (no transaction)
```

## 16.4 Add NOT NULL Column com Default

```sql
-- PROBLEMA: ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'vendedor';
-- Em tabela grande: locka por minutos

-- SOLUÇÃO multi-step:
-- Step 1: add nullable sem default
ALTER TABLE users ADD COLUMN role TEXT;

-- Step 2: backfill em batches
UPDATE users SET role = 'vendedor' WHERE role IS NULL AND id BETWEEN 1 AND 10000;
-- ...

-- Step 3: add default
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'vendedor';

-- Step 4: add NOT NULL
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
```

## 16.5 Backfill Script (Throttled)

```typescript
// scripts/backfill-column.ts
async function backfillColumn() {
  const batchSize = 1000;
  const sleepMs = 100;
  let offset = 0;

  while (true) {
    const result = await db.$executeRaw`
      UPDATE users
      SET full_name = name
      WHERE id IN (
        SELECT id FROM users WHERE full_name IS NULL LIMIT ${batchSize}
      )
    `;

    console.log(`Updated ${result} rows (offset ${offset})`);

    if (result === 0) break;
    offset += result;

    await sleep(sleepMs);  // throttle para não saturar DB
  }
  console.log('Backfill complete');
}

backfillColumn().catch(console.error);
```

## 16.6 Checklist de Migration Zero-Downtime

- [ ] Migration é backward compatible com versão anterior do app?
- [ ] Para tabelas > 1M linhas: usa `CONCURRENTLY` para indexes?
- [ ] Para columns NOT NULL: seguiu padrão multi-step?
- [ ] Backfill script testado em staging com volume prod-like?
- [ ] Janela de deploy em horário de baixo tráfego?
- [ ] Backup automático rodou antes?
- [ ] Rollback plan documentado (drop new column / restore backup)?
- [ ] Monitoramento ativo durante migration?
- [ ] Pair programming ou revisão por DBA senior?

---

# Capítulo 17 — Cache Warming Strategies

## 17.1 Por Que Aquecer Cache?

Após deploy ou restart, cache Redis está frio → spike de load no DB. Cache warming preenche cache antes de receber tráfego.

## 17.2 Estratégias

### 17.2.1 Cache Warming no Startup

```typescript
// src/scripts/warm-cache.ts
import { warmDashboardCache, warmRankingCache, warmUserCache } from '../lib/cache/warming';

async function warmCache() {
  console.log('Warming cache...');
  const start = Date.now();

  await Promise.allSettled([
    warmDashboardCache(),  // dashboards mais acessados (top 100 empresas)
    warmRankingCache(),    // rankings do mês atual
    warmUserCache(),       // perfis de usuários ativos
    warmPermissionsCache(), // roles e permissões
    warmConfigurationCache(), // configs de empresas ativas
  ]);

  console.log(`Cache warmed in ${Date.now() - start}ms`);
}

warmCache().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
```

### 17.2.2 Implementação

```typescript
// src/lib/cache/warming.ts
export async function warmDashboardCache() {
  const topCompanies = await db.company.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { lastActivityAt: 'desc' },
    take: 100,
    select: { id: true },
  });

  for (const { id } of topCompanies) {
    await refreshDashboardCache(id);
    await sleep(50); // throttle
  }
}

export async function refreshDashboardCache(companyId: number) {
  const key = `dashboard:${companyId}:current_month`;
  const cached = await REDIS.get(key);
  if (cached) return; // já aquecido

  const data = await dashboardService.getForCompany(companyId, currentMonth());
  await REDIS.set(key, JSON.stringify(data), 'EX', 3600); // 1h TTL
}

export async function warmRankingCache() {
  const companies = await db.company.findMany({ where: { status: 'ACTIVE' } });
  for (const c of companies) {
    const rankings = await rankingService.computeForCompany(c.id, currentMonth());
    await REDIS.set(`ranking:${c.id}:${currentMonth()}`, JSON.stringify(rankings), 'EX', 3600);
    await sleep(20);
  }
}
```

### 17.2.3 Readiness Probe Diferenciado

```yaml
# k8s/deployment.yaml
readinessProbe:
  httpGet:
    path: /ready  # diferente de /health
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5
```

```typescript
// src/api/health.ts
let cacheWarmed = false;

app.get('/ready', (req, res) => {
  if (!cacheWarmed) {
    return res.status(503).json({ status: 'warming' });
  }
  res.json({ status: 'ready' });
});

app.on('listening', async () => {
  await warmCache();
  cacheWarmed = true;
  logger.info('Cache warmed, ready to receive traffic');
});
```

### 17.2.4 Cron de Refresh

Cache aquecido e atualizado periodicamente:

```typescript
// src/jobs/cache-refresh.ts
import { Cron } from 'croner';

new Cron('*/15 * * * *', async () => {
  await refreshDashboardCacheForActiveCompanies();
});

new Cron('0 8 * * *', async () => {
  // 8h: refresh matinal antes do pico
  await warmDashboardCache();
  await warmRankingCache();
});
```

## 17.3 Métricas

- Cache hit rate (meta: >80%)
- Cache warm duration
- DB load após restart (deve ser suave)

---

# Capítulo 18 — CDN Configuration

## 18.1 CloudFront Distribution (Frontend)

```hcl
# Já definido em Terraform (Capítulo 10.6)
# Comportamentos de cache:

# /_next/static/*  → Cache First, max-age=1 year (immutable)
# /icons/*, /images/*  → Cache First, max-age=30 days
# /api/*  → No cache (proxy to ALB/API)
# /*  → Network First (HTML always fresh)
```

## 18.2 Cache Behaviors

```yaml
CacheBehaviors:
  - PathPattern: '/_next/static/*'
    TargetOriginId: S3-frontend
    ViewerProtocolPolicy: redirect-to-https
    DefaultTTL: 31536000  # 1 year
    MaxTTL: 31536000
    MinTTL: 0
    ForwardedValues:
      QueryString: false
      Cookies:
        Forward: none
    Compress: true

  - PathPattern: '/icons/*'
    TargetOriginId: S3-frontend
    ViewerProtocolPolicy: redirect-to-https
    DefaultTTL: 2592000  # 30 days
    Compress: true

  - PathPattern: '/api/*'
    TargetOriginId: ALB-api
    ViewerProtocolPolicy: redirect-to-https
    DefaultTTL: 0
    MinTTL: 0
    MaxTTL: 0
    ForwardedValues:
      QueryString: true
      Headers:
        - Authorization
        - Content-Type
        - X-CSRF-Token
      Cookies:
        Forward: all
```

## 18.3 Cache Invalidation

Após deploy de frontend:

```bash
aws cloudfront create-invalidation \
  --distribution-id E123ABCXYZ \
  --paths "/*"
```

Para deploys incrementais, invalidar apenas mudanças:
```bash
aws cloudfront create-invalidation \
  --distribution-id E123ABCXYZ \
  --paths "/_next/static/*" "/index.html"
```

## 18.4 Multi-Region CDN

CloudFront com edge locations globais. Para clientes Brasil:
- Edge locations: São Paulo, Rio de Janeiro, Fortaleza
- Origin: S3 + ALB em sa-east-1
- Latência esperada: <50ms para 95% dos usuários BR

## 18.5 Signed URLs / Cookies (Para Conteúdo Restrito)

Relatórios exportados, arquivos enviados: signed URLs com expiração 7 dias.

```typescript
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

const url = getSignedUrl({
  url: 'https://cdn.orion.com/exports/report-123.pdf',
  keyPairId: 'APKAI123',
  privateKey: process.env.CLOUDFRONT_PRIVATE_KEY!,
  expiresOn: new Date(Date.now() + 7 * 86400 * 1000),
});
```

---

# Capítulo 19 — WAF Rules

(WAF já provisionado em Terraform — Capítulo 10.7)

## 19.1 Regras Customizadas

### 19.1.1 Bloqueio de Bots Conhecidos

```yaml
rules:
  - name: block-known-bad-bots
    priority: 5
    action: block
    statement:
      or_statement:
        statements:
          - byte_match_statement:
              field_to_match:
                single_header: { name: 'user-agent' }
              search_string: 'sqlmap'
              text_transformation: [{ type: 'LOWERCASE', priority: 0 }]
          - byte_match_statement:
              field_to_match:
                single_header: { name: 'user-agent' }
              search_string: 'nikto'
              text_transformation: [{ type: 'LOWERCASE', priority: 0 }]
          - byte_match_statement:
              field_to_match:
                single_header: { name: 'user-agent' }
              search_string: 'nmap'
              text_transformation: [{ type: 'LOWERCASE', priority: 0 }]
```

### 19.1.2 Rate Limit por Endpoint Sensível

```yaml
rules:
  - name: rate-limit-login
    priority: 6
    action: block
    statement:
      and_statement:
        statements:
          - byte_match_statement:
              field_to_match: { uri_path: {} }
              search_string: '/api/auth/login'
              text_transformation: [{ type: 'LOWERCASE', priority: 0 }]
          - rate_based_statement:
              limit: 10
              aggregate_key_type: IP
              evaluation_window_sec: 60
```

### 19.1.3 Bloqueio de Países (Geoblocking)

```yaml
rules:
  - name: geo-block
    priority: 20
    action: block
    statement:
      geo_match_statement:
        country_codes: ['CN', 'RU', 'KP', 'IR', 'SY', 'CU']
```

### 19.1.4 Challenge para Tráfego Suspeito

```yaml
rules:
  - name: challenge-suspicious
    priority: 15
    action: captcha  # ou challenge
    statement:
      and_statement:
        statements:
          - not_statement:
              statement:
                byte_match_statement:
                  field_to_match: { single_header: { name: 'user-agent' } }
                  search_string: 'Mozilla'
                  text_transformation: [{ type: 'LOWERCASE', priority: 0 }]
          - rate_based_statement:
              limit: 100
              aggregate_key_type: IP
```

## 19.2 Monitoramento WAF

- CloudWatch metrics: blocked requests, allowed requests, by rule
- Sampled requests (gratis, 100/1000 requests)
- Logs completos para S3 (pagos, todos os requests)
- Alertas: spike de blocks > 1000/min

## 19.3 Tuning

1. Começar em modo `count` (não bloqueia, apenas conta)
2. Analisar falsos positivos
3. Migrar para `block` após validação
4. Tuning contínuo baseado em logs

---

# Capítulo 20 — DDoS Protection

## 20.1 Camadas de Defesa

| Camada | Mecanismo | AWS Service |
|---|---|---|
| Edge | Anycast IP, traffic absorption | CloudFront + Route53 + AWS Shield |
| Application | WAF rate limits, bot detection | AWS WAF |
| Network | SYN cookies, connection limits | AWS Shield Advanced |
| Origin | Connection pooling, autoscaling | ALB + EKS |

## 20.2 AWS Shield

- **Standard:** gratuito, protege contra L3/L4 comuns
- **Advanced:** $3k/mês, DDoS response team, financial protection, advanced detection

Para Orion Cloud, Shield Standard é suficiente (CloudFront absorve a maioria dos ataques). Shield Advanced é considerado para clientes Enterprise que exigem SLA.

## 20.3 Estratégias de Mitigação

### 20.3.1 Rate Limiting em Múltiplas Camadas

```
CloudFront: 2000 req/min/IP (global)
WAF: 100 req/min/IP em /api/auth/* (específico)
App: 60 req/min/user (autenticado)
DB: pool limit (20 connections per app instance)
```

### 20.3.2 Autoscaling

- HPA escala pods em alta carga
- Cluster Autoscaler adiciona nodes
- DB read replicas distribuem load

### 20.3.3 Circuit Breakers

- App circuit breaker para dependências (LLM, webhooks)
- Evita cascade failure

### 20.3.4 Static Content Offload

- CloudFront serve static assets (S3 origin)
- Reduz load na aplicação

## 20.4 Plano de Resposta a DDoS

1. **Detecção:** CloudWatch alarm em spike de tráfego (5x normal em 5 min)
2. **Classificação:** verificar origem (geográfica, AS), tipo (L3/L4/L7)
3. **Mitigação imediata:**
   - Ativar WAF rules adicionais (geo-block, rate limit mais agressivo)
   - Scale up app pods
4. **Engajamento AWS:** se Shield Advanced, abrir case com DDoS response team
5. **Comunicação:** status page, notificar clientes
6. **Pós-ataque:** postmortem, ajustar regras

## 20.5 Synthetic Monitoring

Para detectar DDoS que afeta disponibilidade:
- Datadog Synthetic tests a cada 1 min
- Se falha de múltiplas localizações → alerta

---

# Capítulo 21 — Capacity Planning

## 21.1 Métricas Base

| Recurso | Métrica | Limite | Ação |
|---|---|---|---|
| CPU pods | utilization % | >70% sustained | scale up |
| Memory pods | utilization % | >80% sustained | scale up |
| DB CPU | % | >70% | vertical scale |
| DB connections | count | >80% of max | add replicas or pool tuning |
| DB storage | GB | >80% of allocated | increase storage |
| Redis memory | % | >80% of max | scale up or eviction policy |
| Redis connections | count | >80% | scale up |
| ALB 5xx | rate | >0.1% | investigate |
| Latency p95 | seconds | >2s | investigate |

## 21.2 Forecast

Modelo de crescimento baseado em:
- Novos tenants (signup rate)
- Crescimento por tenant (queries/dia/user)
- Sazonalidade (Black Friday, fechamento de mês)

```typescript
// scripts/capacity-forecast.ts
function forecastCapacity(monthsAhead: number) {
  const currentTenants = 250;
  const signupRate = 20; // new tenants/month
  const queriesPerUserPerDay = 50;
  const usersPerTenant = 15;

  const futureTenants = currentTenants + (signupRate * monthsAhead);
  const futureUsers = futureTenants * usersPerTenant;
  const futureQueriesPerDay = futureUsers * queriesPerUserPerDay;
  const futureQueriesPerSecond = futureQueriesPerDay / 86400 * 5; // pico 5x média

  // Cada pod handle 100 req/s
  const requiredPods = Math.ceil(futureQueriesPerSecond / 100);
  const requiredDBConnections = requiredPods * 20;
  const requiredRedisMemory = futureQueriesPerDay * 0.5; // bytes

  return {
    monthsAhead,
    futureTenants,
    futureUsers,
    futureQueriesPerDay,
    requiredPods,
    requiredDBConnections,
    requiredRedisMemoryGB: requiredRedisMemory / 1024 / 1024 / 1024,
  };
}
```

## 21.3 Capacity Review Mensal

- Revisão 1º dia de cada mês
- Comparar forecast vs realidade
- Ajustar modelos
- Provisionar recursos com 30% headroom

## 21.4 Load Testing

Antes de eventos esperados (campanhas, novo release crítico):

```bash
# k6 load test
k6 run --vus 100 --duration 10m load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // ramp up
    { duration: '5m', target: 100 },  // steady
    { duration: '2m', target: 200 },  // spike
    { duration: '5m', target: 200 },  // steady
    { duration: '2m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('https://api.orion.com/api/dashboard', {
    headers: { Authorization: `Bearer ${__ENV.TOKEN}` },
  });
  check(res, { 'status 200': r => r.status === 200 });
  sleep(1);
}
```

---

# Capítulo 22 — Cost Optimization

## 22.1 Áreas de Otimização

| Área | Estratégia | Economia Esperada |
|---|---|---|
| Compute | Spot instances para workers não-críticos | 60-90% |
| Compute | Right-sizing (analisar usage, downscale se possível) | 20-40% |
| Compute | Scale-to-zero para dev/staging fora de horário | 50-70% |
| DB | Reserved instances (1y/3y commitment) | 30-60% |
| DB | Read replicas apenas quando necessário | Variável |
| Storage | S3 lifecycle (transition to IA after 30d, Glacier after 90d) | 30-50% |
| Storage | EBS gp3 (vs gp2) | 20% |
| Network | CloudFront data transfer (vs direct S3) | 50%+ |
| Network | VPC endpoints (avoid NAT for AWS services) | 50%+ |
| Logs | Sample logs em produção (drop debug/info) | 70% |
| AI | Semantic cache, model routing | 30-50% |
| AI | Batch API for non-real-time | 50% |

## 22.2 Tagging Policy

Todos os recursos AWS tagged com:
- `Project`: orion
- `Environment`: production | staging | dev
- `Service`: api | db | cache | ...
- `Owner`: team-name
- `CostCenter`: cc-xxx

## 22.3 Cost Reports

- AWS Cost Explorer: diário, por service, por tag
- Budgets com alertas (50%, 80%, 100%)
- Monthly review com finance team
- Anomaly detection (AWS Cost Anomaly Detection)

## 22.4 Right-Sizing

```bash
# Análise de uso de instâncias
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,InstanceType,State.Name,Tags[?Key==`Name`].Value | [0]]' --output table

# Compute Optimizer recommendations
aws compute-optimizer get-ec2-instance-recommendations
```

## 22.5 Spot Instances para Workers

```yaml
# k8s/spot-node-group.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orion-worker  # jobs não-críticos (backups, reindex, relatórios)
spec:
  template:
    spec:
      nodeSelector:
        karpenter.sh/capacity-type: spot
      tolerations:
        - key: spot
          value: "true"
          effect: NoSchedule
      containers:
        - name: worker
          resources:
            requests:
              cpu: 500m
              memory: 1Gi
```

Para pods stateful/críticos: usar on-demand nodes.

## 22.6 S3 Lifecycle

```hcl
resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id

  rule {
    name     = "transition-to-ia"
    enabled  = true

    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 90
      storage_class = "GLACIER"
    }

    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }

    expiration {
      days = 2555  # 7 years for compliance
    }
  }
}
```

## 22.7 Commitments

- **Reserved Instances:** DB (1y no-upfront, ~30% saving)
- **Savings Plans:** Compute (1y/3y, ~40% saving)
- **CDN:** CloudFront security bundle (WAF + bot control)

---

# Capítulo 23 — Disaster Recovery

## 23.1 RTO e RPO

| Cenário | RTO | RPO |
|---|---|---|
| Falha de container | 5 min | 0 (stateless) |
| Falha de disco | 1h | 1h |
| Falha de servidor | 4h | 4h |
| Desastre regional | 24h | 24h |
| Falha de provedor cloud | 48h | 24h |

## 23.2 Multi-Region Strategy

- **Primary:** sa-east-1 (São Paulo)
- **DR:** us-east-1 (N. Virginia) — cross-region replication
- **Cold standby:** infra mínima em DR, escala em caso de failover

## 23.3 Cross-Region Replication

- **RDS:** cross-region read replica (assíncrono, lag <1s)
- **S3:** cross-region replication
- **Redis:** Global Datastore (ElastiCache)
- **Secrets:** Vault multi-region

## 23.4 Backup Strategy 3-2-1

- **3** cópias dos dados
- **2** mídias diferentes (EBS + S3)
- **1** cópia offsite (outra região)

## 23.5 Plano de Recuperação

### Passo 1: Detectar
- CloudWatch alarm em multi-AZ failure
- Health check falha em todas as AZs

### Passo 2: Decisão
- CISO + Eng Lead declaram desastre regional
- Acionam DR runbook

### Passo 3: Provisionar Nova Infra
- Terraform aplica em nova região (cold standby → hot)
- Promover read replica DR para primary

### Passo 4: Restaurar Backup
- Restaurar último backup do PostgreSQL (se PITR necessário)
- Restaurar arquivos do S3 (replicado)
- Re-emitir chaves JWT (forçar re-login)

### Passo 5: Atualizar DNS
- Route53 health-checked failover
- TTL baixo (60s) para propagação rápida

### Passo 6: Validar
- Smoke tests automatizados
- Verificar contagem de registros
- Verificar último log de auditoria (continuidade)

### Passo 7: Comunicação
- Status page update
- Email a clientes
- Post-mortem em 1 semana

## 23.6 DR Drill

- Trimestral: simulação em ambiente isolado
- Anual: failover completo para região DR por 1h
- Documentar tempo total de recuperação
- Identificar gargalos

---

# Capítulo 24 — Apêndices

## A.1 Glossário

| Termo | Definição |
|---|---|
| ALB | Application Load Balancer |
| Argo Rollouts | Tool para progressive delivery (canary, blue-green) |
| Blue-Green | Estratégia de deploy com dois ambientes idênticos |
| Canary | Estratégia de deploy gradual (5% → 100%) |
| CDN | Content Delivery Network |
| DR | Disaster Recovery |
| EKS | Elastic Kubernetes Service |
| HPA | Horizontal Pod Autoscaler |
| Istio | Service mesh com traffic management |
| KMS | Key Management Service |
| Loki | Log aggregation system (Grafana) |
| OpenTelemetry | Observability standard (tracing, metrics) |
| PDB | PodDisruptionBudget |
| PITR | Point-In-Time Recovery |
| Prometheus | Monitoring system |
| RDS | Relational Database Service |
| RPO | Recovery Point Objective (perda máxima aceitável) |
| RTO | Recovery Time Objective (tempo máximo de recuperação) |
| SBOM | Software Bill of Materials |
| Service Mesh | Camada de infra para service-to-service communication |
| Shield (AWS) | DDoS protection service |
| Terraform | Infrastructure as Code tool |
| VPC | Virtual Private Cloud |
| WAF | Web Application Firewall |

## A.2 Links Internos

- Runbooks completos: `docs/runbooks/`
- Terraform modules: `infra/modules/`
- K8s manifests: `k8s/`
- Helm charts: `deploy/helm/`
- Grafana dashboards: `monitoring/dashboards/`
- Prometheus rules: `monitoring/rules/`

## A.3 Referências Externas

- Kubernetes docs: https://kubernetes.io/docs/
- AWS Well-Architected Framework: https://aws.amazon.com/architecture/well-architected/
- Terraform best practices: https://www.terraform.io/docs/style.html
- Prometheus best practices: https://prometheus.io/docs/practices/
- OpenTelemetry: https://opentelemetry.io/docs/
- Cloud Native Security: https://owasp.org/www-project-kubernetes-top-ten/
- CIS Kubernetes Benchmark: https://www.cisecurity.org/benchmark/kubernetes

## A.4 Change Log

| Versão | Data | Mudanças | Autor |
|---|---|---|---|
| 1.0.0 | 2025-01-15 | Versão inicial expandida (Fase 2) | DevOps Lead |
| 0.9.0 | 2024-12-01 | Rascunho inicial | DevOps Lead |

## A.5 Aprovações

| Papel | Nome | Data | Assinatura |
|---|---|---|---|
| Engineering Lead | _______ | ___ | ___ |
| DevOps Lead | _______ | ___ | ___ |
| CISO | _______ | ___ | ___ |
| CTO | _______ | ___ | ___ |

---

**Fim do Documento 13 — Implementation & Deployment**
