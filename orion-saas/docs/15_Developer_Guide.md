# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 15

# DEVELOPER GUIDE

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Guia do Desenvolvedor

---

# Capítulo 1 — Objetivo

Este documento é a referência rápida para qualquer desenvolvedor que entre no projeto Orion. Cobre setup do ambiente, estrutura de pastas, padrões de código, fluxo de trabalho com Git, convenções de commit, processo de PR, troubleshooting comum, profiling de performance, debug avançado, otimização de banco, análise de bundle, detecção de memory leaks, estratégias de teste por módulo, deployment do ambiente de dev, onboarding 30-60-90 dias e diretrizes de pair/mob programming.

Este guia é **obrigatório** para todo dev (funcionário, contratado, estagiário ou contribuidor open-source) e **recomendado** para QAs, DevOps e tech leads de equipes que integram com o Orion via API.

**Princípio fundamental:** Nenhuma linha de código deve chegar à `main` sem passar por este guia. Desvios devem ser justificados em ADR (Doc 21) e aprovados por 2 arquitetos.

---

# Capítulo 2 — Setup do Ambiente

## 2.1 Pré-requisitos

| Ferramenta | Versão Mínima | Versão Recomendada | Como Verificar |
|------------|---------------|--------------------|----------------|
| Node.js | 20 LTS | 20.17+ | `node -v` |
| pnpm | 9+ | 9.12+ | `pnpm -v` |
| Docker Desktop | 4.30+ | 4.35+ | `docker -v` |
| Docker Compose | v2.27+ | v2.32+ | `docker compose version` |
| Git | 2.40+ | 2.46+ | `git --version` |
| VS Code | 1.90+ | 1.95+ | `code -v` |
| PostgreSQL Client (psql) | 16+ | 16+ | `psql --version` |
| Redis CLI | 7+ | 7.4+ | `redis-cli --version` |

### Extensões VS Code Recomendadas

**Obrigatórias (instalação via workspace recommendations):**

```jsonc
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "Prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "Vue.volar",
    "ritwickdey.liveserver",
    "ms-vscode.vscode-typescript-next",
    "ms-azuretools.vscode-docker",
    "ms-playwright.playwright",
    "firsttris.vscode-jest-runner",
    "wayou.vscode-todo-highlight",
    "redhat.vscode-yaml",
    "GitHub.vscode-pull-request-github",
    "eamodio.gitlens",
    "mikestead.dotenv",
    "bierner.markdown-mermaid",
    "streetsidesoftware.code-spell-checker",
    "streetsidesoftware.code-spell-checker-portuguese-brazil"
  ]
}
```

**Opcionais (instalação por desenvolvedor):**

- `Console Ninja` — logs no editor
- `Error Lens` — erros inline
- `Turbo Console Log` — atalho p/ console.log
- `Material Icon Theme` — ícones de arquivos
- `Git Graph` — visualização de histórico
- `Postman API` — alternativa ao Insomnia
- `Tailwind Fold` — colapsa classes longas
- `Inline Parameters` — mostra nome de parâmetros

### Settings VS Code Recomendadas

```jsonc
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    "cva\\(([^)]*)\\)",
    ["cn\\(([^)]*)\\)", "\"([^\"]*)\""]
  ],
  "search.exclude": {
    "**/node_modules": true,
    "**/.next": true,
    "**/dist": true,
    "**/coverage": true,
    "**/pnpm-lock.yaml": true
  },
  "editor.rulers": [100],
  "editor.tabSize": 2,
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
  "[markdown]": {
    "editor.wordWrap": "on",
    "editor.previewMode": false
  }
}
```

## 2.2 Setup Windows (10/11)

### Passo 1 — Habilitar WSL 2

```powershell
# PowerShell como Administrador
wsl --install
# Reinicie o computador
wsl --set-default-version 2
wsl --install -d Ubuntu-24.04
```

### Passo 2 — Configurar WSL com Ubuntu

```bash
# Dentro do WSL Ubuntu
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl wget git gnupg lsb-release ca-certificates

# Configurar nome de usuário/git
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
git config --global core.autocrlf input
git config --global core.eol lf
```

### Passo 3 — Instalar Node.js via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20
corepack enable
corepack prepare pnpm@latest --activate
```

### Passo 4 — Docker Desktop

1. Baixe [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).
2. Durante a instalação, marque **"Use WSL 2 instead of Hyper-V"**.
3. Em **Settings → Resources → WSL Integration**, habilite a distro Ubuntu.
4. Valide dentro do WSL:

```bash
docker --version
docker compose version
docker run hello-world
```

### Passo 5 — Ajustes de Performance

```bash
# Limitar recursos do Docker (dentro do WSL ~/.wslconfig)
cat > /mnt/c/Users/$USER/.wslconfig <<'EOF'
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true
EOF

# Reinicie WSL
wsl --shutdown  # no PowerShell
```

### Passo 6 — Line Endings (LF obrigatório)

```bash
# Crie .gitattributes na raiz do projeto
cat > .gitattributes <<'EOF'
* text=auto eol=lf
*.ps1 text eol=crlf
*.bat text eol=crlf
*.cmd text eol=crlf
*.png binary
*.jpg binary
*.woff binary
*.woff2 binary
EOF
```

### Troubleshooting Windows Comum

| Problema | Solução |
|----------|---------|
| `EACCES: permission denied` em `node_modules` | `sudo chown -R $USER ~/.npm` ou use nvm (não instale Node com apt sem nvm) |
| Docker Desktop não inicia | Reinicie serviço `com.docker.service` e valide virtualização na BIOS |
| WSL2 sem internet | `wsl --shutdown` e edite `/etc/resolv.conf` com nameserver 8.8.8.8 |
| `pnpm` não encontrado após instalar | `corepack enable && corepack prepare pnpm@latest --activate` |
| Build lento no Windows | Use WSL2 (5-10× mais rápido que Node nativo Windows) |
| Hot reload não detecta mudanças | Adicione `WATCHPACK_POLLING=true` no `.env.local` |

## 2.3 Setup macOS (Intel e Apple Silicon)

### Passo 1 — Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Apple Silicon: siga as instruções para adicionar ao PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Passo 2 — Ferramentas base

```bash
brew install git node@20 pnpm postgresql@16 redis libpq
brew install --cask docker visual-studio-code

# Linkar versões
brew link --force --overwrite node@20
brew link --force --overwrite libpq

# PSQL no PATH
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Passo 3 — Configuração Apple Silicon específica

```bash
# Confirme que node está usando arm64 (não x86 via Rosetta)
node -p "process.arch"
# Deve retornar 'arm64'. Se retornar 'x64':
# Remova node x64 e reinstale via brew

# Para bibliotecas nativas (better-sqlite3, sharp, bcrypt)
# Sempre use arm64. Se houver erro:
npm rebuild --architecture=arm64
```

### Passo 4 — Configurar Docker Desktop

1. Abra Docker Desktop → **Settings → Resources**.
2. Aloque: **CPUs: 4+, Memory: 6GB+, Swap: 1GB, Disk: 64GB+**.
3. Habilite: **Use Virtualization framework**, **Use Rosetta for x86/amd64 emulation**.

### Passo 5 — Ajustes específicos

```bash
# Aumentar limite de arquivos abertos
echo 'ulimit -n 65536' >> ~/.zshrc

# Configurar git line endings (LF obrigatório)
git config --global core.autocrlf input
git config --global core.eol lf

# SSH key
ssh-keygen -t ed25519 -C "seu@email.com"
eval "$(ssh-agent -s)"
echo "Host github.com\n  AddKeysToAgent yes\n  UseKeychain yes\n  IdentityFile ~/.ssh/id_ed25519" >> ~/.ssh/config
pbcopy < ~/.ssh/id_ed25519.pub
# Adicione a chave em https://github.com/settings/keys
```

### Troubleshooting macOS Comum

| Problema | Solução |
|----------|---------|
| `gyp ERR! find Python` ao instalar bcrypt | `brew install python@3.12` e `xcode-select --install` |
| Docker Desktop com uso alto de CPU | Desabilite "Use Rosetta" se não necessário; ou atualize para versão 4.35+ |
| Erro "EADDRINUSE" em porta 3000 | `lsof -i :3000` e `kill -9 <PID>` |
| Build em Intel mais lento que Apple Silicon | Esperado (~2×). Para dev crítico, considere migrar para M2/M3 |
| `sharp` falha em M1 | `npm rebuild sharp` ou use `brew install vips` |
| Comando `code` não encontrado | Abra VS Code → Cmd+Shift+P → "Shell Command: Install 'code' command in PATH" |

## 2.4 Setup Linux (Ubuntu/Debian)

### Passo 1 — Pacotes base

```bash
sudo apt update
sudo apt install -y build-essential curl wget git unzip \
  ca-certificates gnupg lsb-release software-properties-common \
  libssl-dev libpq-dev libsqlite3-dev zlib1g-dev

# PostgreSQL client
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
sudo apt update
sudo apt install -y postgresql-client-16

# Redis CLI
sudo apt install -y redis-tools
```

### Passo 2 — Node.js via NodeSource

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo corepack enable
sudo corepack prepare pnpm@latest --activate

# Alternativa com nvm (recomendado para múltiplas versões):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm alias default 20
corepack enable
```

### Passo 3 — Docker Engine (sem Docker Desktop)

```bash
# Adicione repositório oficial
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adicione usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Valide
docker --version
docker compose version
docker run hello-world
```

### Passo 4 — VS Code

```bash
# Baixe o .deb
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -D -o root -g root -m 644 packages.microsoft.gpg /etc/apt/keyrings/packages.microsoft.gpg
echo "deb [arch=amd64,arm64 signed-by=/etc/apt/keyrings/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" | sudo tee /etc/apt/sources.list.d/vscode.list > /dev/null
rm -f packages.microsoft.gpg
sudo apt update
sudo apt install -y code
```

### Passo 5 — Configurações específicas Linux

```bash
# inotify (necessário para hot reload do Next.js)
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Limite de arquivos abertos
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Logout/login para aplicar
```

### Troubleshooting Linux Comum

| Problema | Solução |
|----------|---------|
| `permission denied while trying to connect to docker daemon` | `sudo usermod -aG docker $USER && newgrp docker` |
| `ENOSPC: System limit for number of file watchers reached` | Aumente `fs.inotify.max_user_watches` (acima) |
| `pnpm: command not found` | `sudo corepack enable` ou instale via `npm i -g pnpm` |
| Erro ao rodar Playwright | `npx playwright install-deps` instala libs de sistema |
| Erro `EACCES` ao instalar pacotes | **Nunca use `sudo npm install`** — ajuste permissões em `~/.npm` |
| Chrome não abre em Linux Server | Use `--headless=new --no-sandbox` nos args do Playwright |

## 2.5 Clone e Setup Inicial

```bash
# Clone via SSH (preferencial)
git clone git@github.com:sua-empresa/orion.git
cd orion

# Ou HTTPS
git clone https://github.com/sua-empresa/orion.git
cd orion

# Configure remote upstream se fork
git remote add upstream git@github.com:sua-empresa/orion.git

# Instale dependências
pnpm install

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com seus valores:
# - DATABASE_URL=postgresql://orion:orion@localhost:5432/orion
# - REDIS_URL=redis://localhost:6379
# - JWT_SECRET=dev-only-secret-change-in-prod-min-32-chars
# - NEXTAUTH_URL=http://localhost:3000
# - NEXTAUTH_SECRET=dev-only-secret-change-in-prod
# - OPENAI_API_KEY=sk-... (opcional em dev)
# - SMTP_HOST=localhost
# - SMTP_PORT=1025 (MailHog)

# Suba serviços (PostgreSQL, Redis, MailHog, MinIO)
docker compose up -d

# Verifique se serviços estão saudáveis
docker compose ps

# Rode migrations
pnpm prisma migrate dev

# Popule dados iniciais (seed)
pnpm prisma db seed

# Gere tipos do Prisma
pnpm prisma generate

# Inicie o servidor de desenvolvimento
pnpm dev
```

## 2.6 Validação do Setup

Após rodar `pnpm dev`, valide:

```bash
# 1. Frontend
curl http://localhost:3000
# Esperado: HTML da página de login

# 2. API healthcheck
curl http://localhost:3000/api/v1/health
# Esperado: { "status": "ok", "version": "1.0.0", "db": "connected", "redis": "connected" }

# 3. Login funcional (após seed)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@orion.com","password":"Admin@123"}'
# Esperado: { "token": "eyJ...", "refreshToken": "..." }

# 4. Tipos TypeScript compilando
pnpm typecheck

# 5. Lint sem warnings
pnpm lint

# 6. Testes passando
pnpm test:unit
```

## 2.7 Acesso ao Banco

```bash
# Prisma Studio (GUI — recomendado para edição)
pnpm prisma studio
# Abre http://localhost:5555

# Conexão direta via Docker
docker exec -it orion-postgres psql -U orion -d orion

# Conexão direta via host
psql postgresql://orion:orion@localhost:5432/orion

# Redis CLI
docker exec -it orion-redis redis-cli

# MailHog
# Abra http://localhost:8025 no navegador

# MinIO Console
# Abra http://localhost:9001 (user: minioadmin, pass: minioadmin)
```

## 2.8 Usuários de Teste (após seed)

| Perfil | E-mail | Senha | Permissões-chave |
|--------|--------|-------|------------------|
| Admin Master | admin@orion.com | Admin@123 | system.admin (todas) |
| Admin Empresa | empresa@empresa.com | Empresa@123 | company.admin |
| Diretor | diretor@empresa.com | Diretor@123 | company.read, branches.read, users.read |
| Gerente | gerente@empresa.com | Gerente@123 | goals.create, results.approve, team.read |
| Supervisor | supervisor@empresa.com | Supervisor@123 | team.read, results.create |
| Vendedor | vendedor@empresa.com | Vendedor@123 | results.create (próprios), goals.read (próprios) |

**Importante:** Estas credenciais são apenas para ambiente de desenvolvimento e staging. Em produção, cada empresa recebe credenciais únicas geradas pelo wizard de instalação.

## 2.9 Variáveis de Ambiente Completas

```bash
# .env.example (referência — NUNCA commite .env real)

# === App ===
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=Orion
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_VERSION=v1
PORT=3000

# === Database ===
DATABASE_URL=postgresql://orion:orion@localhost:5432/orion?schema=public
SHADOW_DATABASE_URL=postgresql://orion:orion@localhost:5432/orion_shadow?schema=public
# Para SQLite local (offline):
# DATABASE_URL=file:./dev.db

# === Redis ===
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=orion:dev:

# === Auth ===
JWT_SECRET=dev-only-secret-change-in-prod-min-32-characters-long
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-only-secret-change-in-prod-min-32-characters-long

# === Encryption ===
ENCRYPTION_KEY=base64:dev-only-key-change-in-prod
# Gerar novo: openssl rand -base64 32

# === OAuth (opcional) ===
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# === IA ===
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.3
AI_DAILY_LIMIT_PER_COMPANY=50
AI_MAX_COST_PER_REQUEST=0.10

# === SMTP ===
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Orion <noreply@orion.com>"
SMTP_SECURE=false

# === Storage ===
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=orion-uploads
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_FORCE_PATH_STYLE=true

# === Observabilidade ===
SENTRY_DSN=
DATADOG_API_KEY=
LOG_LEVEL=debug
LOG_PRETTY=true

# === Feature Flags ===
FEATURE_AI=true
FEATURE_MARKETPLACE=false
FEATURE_BI=false
FEATURE_MOBILE_NATIVE=false

# === Rate Limiting ===
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100

# === CORS ===
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,capacitor://localhost
```

## 2.10 Scripts npm Disponíveis

```jsonc
// package.json (resumo)
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=web",
    "dev:desktop": "turbo run dev --filter=desktop",
    "build": "turbo run build",
    "build:web": "turbo run build --filter=web",
    "build:desktop": "turbo run build --filter=desktop",
    "test": "turbo run test",
    "test:unit": "turbo run test:unit",
    "test:integration": "turbo run test:integration",
    "test:e2e": "turbo run test:e2e",
    "test:watch": "turbo run test:watch",
    "test:coverage": "turbo run test:coverage",
    "test:ui": "turbo run test:ui",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "prisma db seed",
    "prisma:reset": "prisma migrate reset --force",
    "prisma:deploy": "prisma migrate deploy",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "analyze": "ANALYZE=true turbo run build --filter=web",
    "depcheck": "depcheck --ignores=\"@types/*,eslint-*\"",
    "prepare": "husky install",
    "precommit": "lint-staged",
    "clean": "turbo run clean && rm -rf node_modules",
    "fresh-start": "pnpm clean && pnpm install && pnpm prisma:reset && pnpm prisma:seed"
  }
}
```

---

# Capítulo 3 — Estrutura de Pastas

```
orion/
├── apps/
│   ├── web/                      # Next.js app (frontend + API routes)
│   │   ├── app/                  # App Router (Next.js 14+)
│   │   │   ├── (auth)/           # Rotas com layout de auth
│   │   │   ├── (dashboard)/      # Rotas com layout autenticado
│   │   │   ├── admin/            # Painel admin (domínio separado em prod)
│   │   │   └── api/              # API Routes
│   │   ├── components/           # Componentes React
│   │   │   ├── ui/               # Primitivos (Button, Input, Card)
│   │   │   ├── forms/            # Formulários compostos
│   │   │   ├── charts/           # Gráficos
│   │   │   └── layout/           # Layout (Sidebar, Header)
│   │   ├── hooks/                # Custom hooks
│   │   ├── lib/                  # Utils, auth, prisma client
│   │   ├── modules/              # Módulos de domínio (ver 3.1)
│   │   ├── public/               # Assets estáticos
│   │   └── styles/               # CSS global, Tailwind config
│   ├── desktop/                  # Electron app
│   │   ├── main.ts               # Entry point
│   │   ├── preload.ts            # Preload script
│   │   └── electron-builder.yml  # Config de build
│   └── storybook/                # Storybook isolado
├── packages/
│   ├── ui/                       # Design System compartilhado
│   ├── types/                    # Tipos TypeScript compartilhados
│   ├── config/                   # ESLint, TS, Tailwind configs
│   └── utils/                    # Funções utilitárias
├── prisma/
│   ├── schema.prisma             # Schema do banco
│   ├── migrations/               # Migrations versionadas
│   └── seed.ts                   # Script de seed
├── tests/
│   ├── unit/                     # Testes unitários
│   ├── integration/              # Testes de integração
│   ├── e2e/                      # Testes E2E (Playwright)
│   └── fixtures/                 # Dados de teste
├── docs/                         # Documentação (Markdown)
├── scripts/                      # Scripts de automação
├── .github/
│   └── workflows/                # CI/CD
├── docker-compose.yml            # Ambiente de dev
├── docker-compose.test.yml       # Ambiente de testes
├── Dockerfile                    # Build de produção
├── package.json
├── pnpm-workspace.yaml
├── turbo.json                    # Turborepo config
└── README.md
```

## 3.1 Estrutura de um Módulo

Cada módulo de domínio segue a mesma estrutura:

```
modules/goals/
├── components/
│   ├── GoalForm.tsx              # Formulário de criar/editar
│   ├── GoalList.tsx              # Listagem
│   ├── GoalCard.tsx              # Card individual
│   └── GoalProgress.tsx          # Widget de progresso
├── hooks/
│   ├── useGoals.ts               # Listar metas
│   ├── useGoal.ts                # Meta individual
│   └── useCreateGoal.ts          # Mutação criar
├── services/
│   ├── GoalService.ts            # Lógica de negócio
│   └── GoalCalculator.ts         # Cálculos específicos
├── api/
│   ├── routes.ts                 # Rotas do módulo
│   └── controllers/
│       ├── CreateGoalController.ts
│       ├── ListGoalsController.ts
│       └── UpdateGoalController.ts
├── repositories/
│   └── GoalRepository.ts         # Acesso a dados (Prisma)
├── dto/
│   ├── CreateGoalDTO.ts          # Schema de entrada (Zod)
│   └── GoalResponseDTO.ts        # Schema de saída
├── types/
│   └── index.ts                  # Tipos do módulo
├── utils/
│   └── goalValidations.ts        # Validações específicas
├── tests/
│   ├── GoalService.test.ts
│   └── GoalCalculator.test.ts
└── index.ts                      # Barrel export
```

### 3.1.1 Princípios da Estrutura Modular

1. **Módulo = Bounded Context (DDD):** cada módulo é uma fronteira de domínio. Comunicação entre módulos via interfaces explícitas (não via banco).
2. **Dependências unidirecionais:** `components → hooks → services → repositories → prisma`. Nunca o contrário.
3. **Barrel exports:** todo módulo expõe apenas o necessário via `index.ts`. Detalhes internos não são acessíveis externamente.
4. **Co-localização:** testes, hooks, componentes e serviços do módulo no mesmo diretório.
5. **Sem código compartilhado entre módulos via import direto:** use `packages/utils` ou `shared/`.

---

# Capítulo 4 — Padrões de Código

## 4.1 TypeScript

### Strict Mode
Sempre habilitado em `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Regras
- **NUNCA usar `any`** — use `unknown` se necessário, depois faça type guard
- **Sempre tipar retornos de funções públicas**
- **Prefira `interface` para objetos, `type` para unions**
- **Use `as const` para constantes literais**
- **Evite `enum`** — prefira `union type` ou `const object`
- **Não use `// @ts-ignore`** — use `// @ts-expect-error` com motivo documentado
- **NUNCA use `as` para forçar tipo** sem type guard — prefira `zod.parse` ou `schema.validate`

### Exemplo 1 — Tipo Union ao invés de Enum

```typescript
// ❌ ERRADO
enum GoalType {
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly',
}

// ✅ CORRETO
type GoalType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Quando precisar iterar:
const GOAL_TYPES = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const;
type GoalType = typeof GOAL_TYPES[number];
```

### Exemplo 2 — `unknown` com Type Guard ao invés de `any`

```typescript
// ❌ ERRADO
function parseInput(data: any) {
  return data.userId as number;
}

// ✅ CORRETO
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseInput(data: unknown): { userId: number } {
  if (!isRecord(data) || typeof data.userId !== 'number') {
    throw new Error('Invalid input: expected { userId: number }');
  }
  return { userId: data.userId };
}
```

### Exemplo 3 — `as const` para constantes

```typescript
const MODULES = ['auth', 'users', 'goals', 'results', 'campaigns'] as const;
type Module = typeof MODULES[number];

// Ou com objeto:
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
```

### Exemplo 4 — Funções com Retorno Tipado

```typescript
// ❌ ERRADO (retorno implícito)
export function getGoal(id: number) {
  return prisma.goal.findUnique({ where: { id } });
}

// ✅ CORRETO
export function getGoal(id: number): Promise<Goal | null> {
  return prisma.goal.findUnique({ where: { id } });
}

// Funções async SEMPRE tipam Promise<T>
async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const goal = await prisma.goal.create({ data: input });
  return goal;
}
```

### Exemplo 5 — Discriminated Unions para Erros

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

type GoalError =
  | { type: 'NOT_FOUND'; id: number }
  | { type: 'INVALID_INPUT'; field: string; message: string }
  | { type: 'PERMISSION_DENIED'; userId: number };

async function getGoal(id: number, userId: number): Promise<Result<Goal, GoalError>> {
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return { success: false, error: { type: 'NOT_FOUND', id } };
  if (goal.userId !== userId) return { success: false, error: { type: 'PERMISSION_DENIED', userId } };
  return { success: true, data: goal };
}

// Uso:
const result = await getGoal(42, 1);
if (!result.success) {
  switch (result.error.type) {
    case 'NOT_FOUND': console.log(`Goal ${result.error.id} not found`); break;
    case 'PERMISSION_DENIED': console.log(`User ${result.error.userId} not allowed`); break;
    case 'INVALID_INPUT': console.log(`Field ${result.error.field}: ${result.error.message}`); break;
  }
  return;
}
console.log(result.data);
```

### Exemplo 6 — Utility Types (uso correto)

```typescript
import type { Goal } from '../types';

// Pick — para criar DTOs
type GoalSummary = Pick<Goal, 'id' | 'targetValue' | 'startDate' | 'endDate'>;

// Omit — para criar inputs de criação
type CreateGoalInput = Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

// Partial — para updates
type UpdateGoalInput = Partial<CreateGoalInput>;

// Required — para garantir campos opcionais
type CompleteGoal = Required<Pick<Goal, 'id' | 'notes' | 'weight'>>;

// Readonly — para configurações imutáveis
type AppConfig = Readonly<{
  apiUrl: string;
  timeout: number;
  features: readonly string[];
}>;
```

### Exemplo 7 — Generics Constrained

```typescript
// ❌ ERRADO (sem constraint)
function getField<T>(obj: T, key: string): unknown {
  return (obj as any)[key];
}

// ✅ CORRETO
function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const goal: Goal = { id: 1, targetValue: 100, ... };
const id = getField(goal, 'id');     // number
const target = getField(goal, 'targetValue'); // number
// const x = getField(goal, 'invalid'); // ❌ Compile error
```

### Exemplo 8 — Conditional Types

```typescript
type ApiResponse<T> = T extends Error
  ? { error: true; message: string }
  : { error: false; data: T };

type Test1 = ApiResponse<Error>;      // { error: true; message: string }
type Test2 = ApiResponse<Goal>;       // { error: false; data: Goal }

// Mapped types
type ReadonlyGoal = { readonly [K in keyof Goal]: Goal[K] };
type NullableGoal = { [K in keyof Goal]: Goal[K] | null };
type GoalWithStringDates = { [K in keyof Goal]: Goal[K] extends Date ? string : Goal[K] };
```

### Exemplo 9 — Brand Types para IDs

```typescript
// Evita misturar IDs de entidades diferentes
type Brand<T, B> = T & { readonly __brand: B };

type UserId = Brand<number, 'UserId'>;
type GoalId = Brand<number, 'GoalId'>;
type CompanyId = Brand<number, 'CompanyId'>;

function createGoal(userId: UserId, indicatorId: IndicatorId): Promise<Goal> { ... }

const uid = 1 as UserId;
const gid = 1 as GoalId;
createGoal(uid, gid);  // ❌ Compile error: gid is GoalId, not IndicatorId
```

### Exemplo 10 — Template Literal Types

```typescript
type Permission = `${string}.${'create' | 'read' | 'update' | 'delete'}`;
// 'goals.create', 'users.read', 'campaigns.delete', etc.

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ApiEndpoint = `${HttpMethod} /api/v1/${string}`;
// 'GET /api/v1/goals', 'POST /api/v1/campaigns', etc.

type EventName = `${string}.${'created' | 'updated' | 'deleted'}`;
// 'goal.created', 'campaign.updated', etc.
```

## 4.2 React/Next.js

### Server Components por Padrão

```typescript
// app/dashboard/page.tsx (Server Component)
import { getGoals } from '@/modules/goals/services/GoalService';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await requireAuth();
  if (!user) redirect('/login');

  const goals = await getGoals({ userId: user.id, companyId: user.companyId });
  return <Dashboard goals={goals} />;
}
```

### 'use client' Apenas Quando Necessário
- Interação (onClick, useState)
- useEffect, useRef
- Browser APIs (localStorage, etc.)
- Third-party libraries que exigem client

### Hooks Customizados

```typescript
// modules/goals/hooks/useGoals.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchGoals } from '../services/GoalService';

interface UseGoalsOptions {
  filters?: GoalFilters;
  enabled?: boolean;
}

export function useGoals({ filters, enabled = true }: UseGoalsOptions = {}) {
  return useQuery({
    queryKey: ['goals', filters],
    queryFn: () => fetchGoals(filters),
    enabled,
    staleTime: 60_000, // 1 minuto
    gcTime: 5 * 60_000, // 5 minutos (garbage collection)
    retry: (failureCount, error) => {
      if (error instanceof DomainError && error.statusCode === 404) return false;
      return failureCount < 3;
    },
  });
}

// Hook de mutação com optimistic update
export function useCreateGoal() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: CreateGoalInput) => GoalService.create(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['goals'] });
      const previousGoals = queryClient.getQueryData<Goal[]>(['goals']);
      const optimisticGoal: Goal = {
        ...input,
        id: Date.now(), // temp ID
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      queryClient.setQueryData<Goal[]>(['goals'], (old = []) => [...old, optimisticGoal]);
      return { previousGoals };
    },
    onError: (err, _input, context) => {
      queryClient.setQueryData(['goals'], context?.previousGoals);
      toast.error('Falha ao criar meta');
    },
    onSuccess: (goal) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta criada com sucesso');
    },
  });
}
```

### Componentes

```typescript
// Padrão: function declaration com props tipadas
interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

export function GoalCard({ goal, onEdit, onDelete, className }: GoalCardProps) {
  return (
    <Card className={className}>
      {/* ... */}
    </Card>
  );
}
```

### Forward Ref quando necessário

```typescript
import { forwardRef } from 'react';

interface GoalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const GoalInput = forwardRef<HTMLInputElement, GoalInputProps>(
  function GoalInput({ label, error, className, ...props }, ref) {
    return (
      <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <input
          ref={ref}
          className={cn(
            'w-full h-10 px-3 rounded-md border border-slate-300',
            error && 'border-red-500',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
```

## 4.3 Styling (Tailwind)

### Regras
- **Sem CSS-in-JS** (sem styled-components, emotion)
- **Sem CSS modules** (exceto casos raros)
- **Tudo via Tailwind**
- **Componentes UI reutilizáveis** no `packages/ui`

### Padrão de Classes
```tsx
// Ordem: layout → spacing → typography → colors → effects
<div className="flex flex-col gap-4 p-6 text-sm text-slate-900 bg-white shadow-sm rounded-lg">
```

### Variantes com cva

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonStyles = cva('inline-flex items-center justify-center rounded-md font-medium', {
  variants: {
    variant: {
      primary: 'bg-blue-900 text-white hover:bg-blue-800',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    },
    size: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});
```

### Tailwind Merge para Overrides

```typescript
import { twMerge } from 'tailwind-merge';
import clsx, { type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Uso — classes posteriores sobrepõem anteriores:
<Button className="bg-red-500" />  // sobrescreve bg-blue-900
```

## 4.4 Validação de Dados (Zod)

Toda entrada de API é validada com Zod:

```typescript
import { z } from 'zod';

export const createGoalSchema = z.object({
  userId: z.number().int().positive(),
  indicatorId: z.number().int().positive(),
  goalType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  targetValue: z.number().positive(),
  startDate: z.string().transform(s => new Date(s)),
  endDate: z.string().transform(s => new Date(s)),
}).refine(data => data.endDate > data.startDate, {
  message: 'Data final deve ser maior que inicial',
  path: ['endDate'],
});

export type CreateGoalDTO = z.infer<typeof createGoalSchema>;
```

### Zod Avançado — Discriminated Unions

```typescript
const notificationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  z.object({
    type: z.literal('push'),
    deviceId: z.string(),
    title: z.string(),
    body: z.string(),
  }),
  z.object({
    type: z.literal('sms'),
    phone: z.string().regex(/^\+\d{10,15}$/),
    message: z.string().max(160),
  }),
]);

type Notification = z.infer<typeof notificationSchema>;
// Discriminated union — TS sabe qual schema aplicar baseado em 'type'
```

### Zod — Transformações

```typescript
const goalInputSchema = z.object({
  targetValue: z.union([z.string(), z.number()]).transform(val => Number(val)),
  startDate: z.union([z.string(), z.date()]).transform(val => new Date(val)),
  tags: z.string().transform(s => s.split(',').map(t => t.trim())).pipe(z.array(z.string()).min(1)),
  metadata: z.string().transform(s => JSON.parse(s)).pipe(z.record(z.unknown())),
});
```

## 4.5 Tratamento de Erros

### Padrão de Erro de Domínio

```typescript
export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    // Mantém stack trace em V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class LicenseInvalidError extends DomainError {
  constructor() {
    super('LICENSE_INVALID', 'Licença inválida ou expirada', 403);
  }
}

export class GoalNotFoundError extends DomainError {
  constructor(id: number) {
    super('GOAL_NOT_FOUND', `Meta ${id} não encontrada`, 404, { goalId: id });
  }
}

export class ValidationError extends DomainError {
  constructor(field: string, message: string) {
    super('VALIDATION_ERROR', message, 422, { field });
  }
}
```

### Middleware de Erro

```typescript
// app/api/_middleware/errorHandler.ts
export function errorHandler(err: unknown, req: NextRequest) {
  if (err instanceof DomainError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.statusCode }
    );
  }
  
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: err.issues } },
      { status: 422 }
    );
  }
  
  // Log unknown errors
  logger.error('Unexpected error', { error: err, path: req.url });
  
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } },
    { status: 500 }
  );
}
```

### Result Pattern (alternativa para casos críticos)

```typescript
// Para fluxos críticos onde erros são esperados e tratáveis
type Result<T, E> = { success: true; data: T } | { success: false; error: E };

function tryParseInt(value: string): Result<number, string> {
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isInteger(num)) {
    return { success: false, error: `${value} is not a valid integer` };
  }
  return { success: true, data: num };
}

// Uso:
const result = tryParseInt('42');
if (result.success) {
  console.log(result.data); // number
} else {
  console.log(result.error); // string
}
```

## 4.6 Padrões Adicionais (50+ Exemplos)

### Exemplo 11 — Repository Pattern com Prisma

```typescript
// modules/goals/repositories/GoalRepository.ts
import { prisma } from '@/lib/prisma';
import type { Goal, GoalFilters } from '../types';

export interface IGoalRepository {
  findById(id: number, companyId: number): Promise<Goal | null>;
  findMany(filters: GoalFilters): Promise<Goal[]>;
  create(data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal>;
  update(id: number, companyId: number, data: Partial<Goal>): Promise<Goal>;
  softDelete(id: number, companyId: number): Promise<void>;
}

export class GoalRepository implements IGoalRepository {
  async findById(id: number, companyId: number): Promise<Goal | null> {
    return prisma.goal.findFirst({
      where: { id, companyId, deletedAt: null },
    });
  }

  async findMany(filters: GoalFilters): Promise<Goal[]> {
    return prisma.goal.findMany({
      where: {
        companyId: filters.companyId,
        userId: filters.userId,
        deletedAt: null,
        ...(filters.status && { status: filters.status }),
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    return prisma.goal.create({ data });
  }

  async update(id: number, companyId: number, data: Partial<Goal>): Promise<Goal> {
    return prisma.goal.update({
      where: { id, companyId },
      data: { ...data, version: { increment: 1 } },
    });
  }

  async softDelete(id: number, companyId: number): Promise<void> {
    await prisma.goal.update({
      where: { id, companyId },
      data: { deletedAt: new Date(), active: false },
    });
  }
}

// Singleton export
export const goalRepository = new GoalRepository();
```

### Exemplo 12 — Service Layer com Validação de Domínio

```typescript
// modules/goals/services/GoalService.ts
import { goalRepository } from '../repositories/GoalRepository';
import { indicatorRepository } from '@/modules/indicators/repositories';
import { licenseRepository } from '@/modules/license/repositories';
import { audit } from '@/modules/audit/services/AuditService';
import { eventBus } from '@/shared/events/eventBus';
import { DomainError } from '@/shared/errors/DomainError';
import type { CreateGoalInput } from '../dto/CreateGoalDTO';

export class GoalService {
  static async create(input: CreateGoalInput): Promise<Goal> {
    // 1. Validação de domínio
    const indicator = await indicatorRepository.findById(input.indicatorId, input.companyId);
    if (!indicator || !indicator.active) {
      throw new DomainError('INDICATOR_NOT_FOUND', 'Indicador não encontrado ou inativo', 404);
    }

    // 2. Verificação de licença
    const license = await licenseRepository.findActiveByCompany(input.companyId);
    if (!license || !license.isValid()) {
      throw new DomainError('LICENSE_INVALID', 'Licença inválida', 403);
    }

    // 3. Verificação de usuário
    const user = await userRepository.findById(input.userId, input.companyId);
    if (!user || !user.active) {
      throw new DomainError('USER_NOT_FOUND', 'Usuário não encontrado ou inativo', 404);
    }

    // 4. Cria com transaction
    const goal = await prisma.$transaction(async (tx) => {
      const created = await goalRepository.create({ ...input, uuid: crypto.randomUUID() });
      await audit.record({
        userId: input.createdBy,
        companyId: input.companyId,
        action: 'create',
        tableName: 'goals',
        recordId: created.id,
        newValue: created,
      }, tx);
      return created;
    });

    // 5. Evento assíncrono
    await eventBus.emit('goal.created', { goalId: goal.id, companyId: input.companyId });

    return goal;
  }
}
```

### Exemplo 13 — Event Bus Interno

```typescript
// shared/events/eventBus.ts
type EventHandler<T = unknown> = (payload: T) => Promise<void> | void;

interface EventMap {
  'goal.created': { goalId: number; companyId: number };
  'goal.updated': { goalId: number; companyId: number; changes: Partial<Goal> };
  'goal.deleted': { goalId: number; companyId: number };
  'result.approved': { resultId: number; userId: number };
  'campaign.ended': { campaignId: number; companyId: number };
  'user.invited': { userId: number; companyId: number };
}

class EventBus {
  private handlers: { [K in keyof EventMap]?: EventHandler<EventMap[K]>[] } = {};

  on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): () => void {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event]!.push(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const handlers = this.handlers[event];
    if (handlers) {
      this.handlers[event] = handlers.filter(h => h !== handler);
    }
  }

  async emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): Promise<void> {
    const handlers = this.handlers[event] ?? [];
    await Promise.all(handlers.map(h => h(payload)));
  }
}

export const eventBus = new EventBus();

// Uso:
eventBus.on('goal.created', async ({ goalId, companyId }) => {
  await notificationService.notifyGoalCreated(goalId, companyId);
});
```

### Exemplo 14 — Custom Hook para Formulários

```typescript
// shared/hooks/useForm.ts
'use client';
import { useState, useCallback } from 'react';
import type { z } from 'zod';
import type { ZodSchema } from 'zod';

interface UseFormOptions<T> {
  schema: ZodSchema<T>;
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldError: <K extends keyof T>(field: K, error: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useForm<T extends Record<string, unknown>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validated = schema.parse(values);
      await onSubmit(validated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        for (const issue of err.issues) {
          const field = issue.path[0] as keyof T;
          if (!fieldErrors[field]) fieldErrors[field] = issue.message;
        }
        setErrors(fieldErrors);
      } else {
        throw err;
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, schema, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return { values, errors, isSubmitting, setValue, setFieldError, handleSubmit, reset };
}
```

### Exemplo 15 — Logger Estruturado

```typescript
// lib/logger.ts
import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev ? {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' },
  } : undefined,
  redact: {
    paths: [
      'password', '*.password', 'token', '*.token', 'apiKey', '*.apiKey',
      'jwt', '*.jwt', 'authorization', '*.authorization',
      'cpf', '*.cpf', 'cnpj', '*.cnpj', 'email', '*.email',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: { 'user-agent': req.headers['user-agent'] },
    }),
    err: pino.stdSerializers.err,
  },
});

// Uso:
logger.info('User logged in', { userId: 42, companyId: 1 });
logger.warn('Rate limit approaching', { ip: '1.2.3.4', count: 95, limit: 100 });
logger.error('Database connection failed', { error: err });
```

### Exemplo 16 — Middleware de Autenticação

```typescript
// lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { DomainError } from '@/shared/errors/DomainError';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  companyId: number;
  roles: string[];
  permissions: string[];
}

export async function requireAuth(req: NextRequest): Promise<AuthUser> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new DomainError('UNAUTHORIZED', 'Token não fornecido', 401);
  }

  const token = authHeader.slice(7);
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
  } catch {
    throw new DomainError('INVALID_TOKEN', 'Token inválido ou expirado', 401);
  }

  // Verifica se a sessão ainda está ativa (revogação imediata)
  const session = await prisma.session.findFirst({
    where: { token, userId: payload.userId, active: true, expiresAt: { gt: new Date() } },
  });
  if (!session) {
    throw new DomainError('SESSION_EXPIRED', 'Sessão expirada', 401);
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, companyId: payload.companyId, active: true, deletedAt: null },
    include: { roles: { include: { permissions: true } } },
  });
  if (!user) {
    throw new DomainError('USER_NOT_FOUND', 'Usuário não encontrado', 404);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    companyId: user.companyId,
    roles: user.roles.map(r => r.name),
    permissions: [...new Set(user.roles.flatMap(r => r.permissions.map(p => p.name)))],
  };
}
```

### Exemplo 17 — Verificação de Permissão

```typescript
// shared/auth/permissions.ts
import type { AuthUser } from '@/lib/auth';
import { DomainError } from '@/shared/errors/DomainError';

export function requirePermission(user: AuthUser, permission: string): void {
  if (!user.permissions.includes(permission) && !user.permissions.includes('*')) {
    throw new DomainError('FORBIDDEN', `Permissão necessária: ${permission}`, 403);
  }
}

export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions.includes(permission) || user.permissions.includes('*');
}

export function requireRole(user: AuthUser, role: string): void {
  if (!user.roles.includes(role) && !user.roles.includes('admin')) {
    throw new DomainError('FORBIDDEN', `Role necessária: ${role}`, 403);
  }
}
```

### Exemplo 18 — Cache com Redis

```typescript
// shared/cache/redisCache.ts
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

export class Cache {
  constructor(private prefix: string) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(`${this.prefix}:${key}`);
      return data ? JSON.parse(data) as T : null;
    } catch (err) {
      logger.warn('Cache get failed', { key, error: err });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await redis.set(`${this.prefix}:${key}`, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      logger.warn('Cache set failed', { key, error: err });
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      await redis.del(`${this.prefix}:${key}`);
    } catch (err) {
      logger.warn('Cache invalidate failed', { key, error: err });
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(`${this.prefix}:${pattern}`);
      if (keys.length > 0) await redis.del(...keys);
    } catch (err) {
      logger.warn('Cache invalidatePattern failed', { pattern, error: err });
    }
  }
}

// Uso:
const goalCache = new Cache('orion:goals');
await goalCache.set(`user:${userId}`, goals, 60); // 1 minuto
const cached = await goalCache.get<Goal[]>(`user:${userId}`);
```

### Exemplo 19 — Rate Limiting

```typescript
// shared/middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export function rateLimit(options: { windowMs: number; max: number; key?: (req: NextRequest) => string }) {
  return async function (req: NextRequest, next: () => Promise<NextResponse>): Promise<NextResponse> {
    const key = options.key?.(req) ?? req.headers.get('x-forwarded-for') ?? 'anonymous';
    const redisKey = `orion:ratelimit:${key}:${Math.floor(Date.now() / options.windowMs)}`;
    
    const count = await redis.incr(redisKey);
    if (count === 1) await redis.expire(redisKey, Math.ceil(options.windowMs / 1000));
    
    if (count > options.max) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Limite de requisições excedido' } },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(options.windowMs / 1000)) } },
      );
    }
    
    return next();
  };
}

// Uso:
export const POST = rateLimit({ windowMs: 60_000, max: 10 })(async (req) => {
  // handler
});
```

### Exemplo 20 — Background Jobs com BullMQ

```typescript
// shared/queue/queue.ts
import { Queue, Worker } from 'bullmq';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

export const emailQueue = new Queue('emails', { connection: redis });
export const auditQueue = new Queue('audit', { connection: redis });
export const rankingQueue = new Queue('rankings', { connection: redis });

// Worker exemplo
const emailWorker = new Worker('emails', async (job) => {
  const { to, subject, body } = job.data;
  await sendEmail({ to, subject, body });
  logger.info('Email sent', { to, jobId: job.id });
}, { connection: redis, concurrency: 5 });

emailWorker.on('failed', (job, err) => {
  logger.error('Email job failed', { jobId: job?.id, error: err });
});

// Uso:
await emailQueue.add('send-welcome', { to: 'user@example.com', subject: 'Bem-vindo', body: '...' });
```

### Exemplo 21 — Transação com Prisma

```typescript
// Transação interativa (recomendada para múltiplas operações)
async function transferGoalToUser(goalId: number, fromUserId: number, toUserId: number, companyId: number) {
  return prisma.$transaction(async (tx) => {
    // 1. Verifica propriedade atual
    const goal = await tx.goal.findFirst({
      where: { id: goalId, userId: fromUserId, companyId, deletedAt: null },
    });
    if (!goal) throw new DomainError('GOAL_NOT_FOUND', 'Meta não encontrada', 404);

    // 2. Atualiza dono
    await tx.goal.update({
      where: { id: goalId },
      data: { userId: toUserId, updatedBy: fromUserId, version: { increment: 1 } },
    });

    // 3. Auditoria
    await tx.auditLog.create({
      data: {
        userId: fromUserId,
        companyId,
        action: 'transfer',
        tableName: 'goals',
        recordId: goalId,
        oldValue: { userId: fromUserId },
        newValue: { userId: toUserId },
      },
    });
  });
}

// Transação batch (para operações simples em paralelo)
const [user, goals] = await prisma.$transaction([
  prisma.user.create({ data: { ... } }),
  prisma.goal.createMany({ data: [...] }),
]);
```

### Exemplo 22 — Soft Delete Universal

```typescript
// shared/extensions/softDelete.ts
import { Prisma } from '@prisma/client';

// Prisma extension para soft delete automático
export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      async delete({ model, args, query }) {
        // Substitui delete físico por update
        return (query as any)({
          ...args,
          data: { deletedAt: new Date(), active: false },
        });
      },
      async deleteMany({ model, args, query }) {
        return query({
          ...args,
          data: { deletedAt: new Date(), active: false },
        });
      },
      async findMany({ args, query }) {
        // Filtra automaticamente registros deletados
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ args, query }) {
        args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
    },
  },
});

// Aplicar:
// const prisma = new PrismaClient().$extends(softDeleteExtension);
```

### Exemplo 23 — DTO com Transform

```typescript
// modules/goals/dto/CreateGoalDTO.ts
import { z } from 'zod';

export const createGoalSchema = z.object({
  userId: z.coerce.number().int().positive(),
  indicatorId: z.coerce.number().int().positive(),
  goalType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
  targetValue: z.coerce.number().positive('Valor deve ser positivo'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  weight: z.coerce.number().min(0).max(10).default(1.0),
  notes: z.string().max(1000).optional(),
  distribution: z.object({
    type: z.enum(['equal', 'weighted', 'manual']),
    weights: z.array(z.object({ userId: z.number(), weight: z.number() })).optional(),
  }).optional(),
}).refine(
  data => data.endDate > data.startDate,
  { message: 'Data final deve ser maior que data inicial', path: ['endDate'] },
);

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

// Response DTO (separa do tipo de entidade)
export const goalResponseSchema = z.object({
  id: z.number(),
  uuid: z.string().uuid(),
  userId: z.number(),
  indicatorId: z.number(),
  goalType: z.string(),
  targetValue: z.number(),
  achievedValue: z.number(),
  progress: z.number(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.string(),
  weight: z.number(),
  notes: z.string().nullable(),
});

export type GoalResponse = z.infer<typeof goalResponseSchema>;
```

### Exemplo 24 — Optimistic Locking

```typescript
// shared/utils/optimisticLock.ts
import { DomainError } from '@/shared/errors/DomainError';

export async function withOptimisticLock<T>(
  operation: () => Promise<T>,
  retries = 3,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2034') {
        // Version mismatch
        if (attempt === retries - 1) {
          throw new DomainError('CONFLICT', 'Conflito de versão — recurso foi modificado', 409);
        }
        await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Unreachable');
}

// Uso:
await withOptimisticLock(async () => {
  await prisma.goal.update({
    where: { id: goalId, version: currentVersion },
    data: { ...changes, version: { increment: 1 } },
  });
});
```

### Exemplo 25 — Testing Helpers

```typescript
// tests/helpers/factories.ts
import { prisma } from '@/lib/prisma';
import { faker } from '@faker-js/faker';

export async function createGoalFixture(overrides: Partial<Goal> = {}): Promise<Goal> {
  const company = overrides.companyId ?? (await createCompanyFixture()).id;
  const user = overrides.userId ?? (await createUserFixture({ companyId: company })).id;
  const indicator = overrides.indicatorId ?? (await createIndicatorFixture({ companyId: company })).id;

  return prisma.goal.create({
    data: {
      uuid: faker.string.uuid(),
      companyId: company,
      userId: user,
      indicatorId: indicator,
      goalType: overrides.goalType ?? 'monthly',
      targetValue: overrides.targetValue ?? faker.number.float({ min: 1000, max: 100000 }),
      startDate: overrides.startDate ?? new Date(),
      endDate: overrides.endDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      weight: overrides.weight ?? 1.0,
      notes: overrides.notes ?? faker.lorem.sentence(),
      createdBy: overrides.createdBy ?? user,
      ...overrides,
    },
  });
}

export async function createUserFixture(overrides: Partial<User> = {}): Promise<User> {
  return prisma.user.create({
    data: {
      uuid: faker.string.uuid(),
      companyId: overrides.companyId ?? 1,
      email: overrides.email ?? faker.internet.email(),
      name: overrides.name ?? faker.person.fullName(),
      passwordHash: overrides.passwordHash ?? '$2b$10$...', // 'Password@123'
      role: overrides.role ?? 'vendedor',
      active: overrides.active ?? true,
      createdBy: overrides.createdBy ?? 1,
    },
  });
}
```

### Exemplo 26 — Sentry Error Boundary

```typescript
// shared/components/ErrorBoundary.tsx
'use client';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/nextjs';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  resetKeys?: unknown[];
}

export function ErrorBoundary({ children, fallback, resetKeys }: ErrorBoundaryProps) {
  return (
    <SentryErrorBoundary
      fallback={({ error, resetError }) => (
        fallback ?? <ErrorFallback error={error} onReset={resetError} />
      )}
      resetKeys={resetKeys}
      beforeCapture={(scope) => {
        scope.setTag('component', 'error-boundary');
        scope.setLevel('error');
      }}
      onError={(error, componentStack) => {
        console.error('Error caught by boundary:', error, componentStack);
      }}
    >
      {children}
    </SentryErrorBoundary>
  );
}
```

### Exemplo 27 — Feature Flag

```typescript
// shared/featureFlags/flags.ts
import { redis } from '@/lib/redis';

const FLAGS = {
  AI_INSIGHTS: 'ai_insights',
  MARKETPLACE: 'marketplace',
  BI_DASHBOARDS: 'bi_dashboards',
  MOBILE_NATIVE: 'mobile_native',
  DARK_MODE: 'dark_mode',
} as const;

type FlagName = typeof FLAGS[keyof typeof FLAGS];

export async function isFeatureEnabled(flag: FlagName, companyId?: number): Promise<boolean> {
  // Global flag
  const globalEnabled = await redis.get(`orion:flag:${flag}:global`);
  if (globalEnabled === 'false') return false;

  // Per-company override
  if (companyId) {
    const companyFlag = await redis.get(`orion:flag:${flag}:company:${companyId}`);
    if (companyFlag !== null) return companyFlag === 'true';
  }

  // Default
  return globalEnabled === 'true';
}

// Hook para React
'use client';
import { useQuery } from '@tanstack/react-query';
export function useFeatureFlag(flag: FlagName, companyId?: number) {
  return useQuery({
    queryKey: ['feature-flag', flag, companyId],
    queryFn: () => fetch(`/api/v1/feature-flags/${flag}`).then(r => r.json()).then(d => d.enabled),
    staleTime: 60_000,
  });
}
```

### Exemplo 28 — Pagination Cursor-based

```typescript
// shared/utils/pagination.ts
import type { Prisma } from '@prisma/client';

export interface CursorPagination {
  cursor?: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

export async function paginateCursor<T>(
  query: Prisma.PromiseReturnType<() => Promise<T[]>>,
  options: { cursor?: number; limit: number; orderBy: 'id'; order: 'asc' | 'desc' },
): Promise<PaginatedResult<T>> {
  const items = await query({
    where: options.cursor ? { id: { [options.order === 'asc' ? 'gt' : 'lt']: options.cursor } } : {},
    orderBy: { [options.orderBy]: options.order },
    take: options.limit + 1,
  });

  const hasMore = items.length > options.limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { data, nextCursor, hasMore };
}
```

### Exemplo 29 — Error Mapping para API

```typescript
// shared/errors/errorMapper.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { DomainError } from './DomainError';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

export function handleError(err: unknown, context?: Record<string, unknown>): NextResponse {
  if (err instanceof DomainError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.statusCode },
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: err.issues } },
      { status: 422 },
    );
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapping: Record<string, { code: string; message: string; status: number }> = {
      P2002: { code: 'DUPLICATE_ENTRY', message: 'Registro duplicado', status: 409 },
      P2025: { code: 'NOT_FOUND', message: 'Registro não encontrado', status: 404 },
      P2003: { code: 'FOREIGN_KEY_VIOLATION', message: 'Referência inválida', status: 400 },
      P2034: { code: 'CONFLICT', message: 'Conflito de concorrência', status: 409 },
    };
    const mapped = mapping[err.code];
    if (mapped) {
      return NextResponse.json(
        { error: { code: mapped.code, message: mapped.message, details: { meta: err.meta } } },
        { status: mapped.status },
      );
    }
  }

  logger.error('Unhandled error', { error: err, ...context });
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } },
    { status: 500 },
  );
}
```

### Exemplo 30 — Mock Pattern para Testes

```typescript
// tests/mocks/prisma.ts
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

afterEach(() => {
  mockReset(prismaMock);
});

// Uso em teste:
it('creates a goal', async () => {
  prismaMock.goal.create.mockResolvedValueOnce({ id: 1, ... });
  const result = await GoalService.create({ ... });
  expect(result.id).toBe(1);
  expect(prismaMock.goal.create).toHaveBeenCalledWith(expect.objectContaining({ ... }));
});
```

### Exemplos 31-50 — Padrões Adicionais (resumo)

Os padrões abaixo são referenciados em ADRs e documentação de módulos específicos:

31. **Singleton Pattern** — `prisma`, `redis`, `logger` (instância única por processo)
32. **Factory Pattern** — `UserFactory.create()`, `GoalBuilder.build()` (testes)
33. **Builder Pattern** — `GoalBuilder().withUser().withIndicator().build()` (testes)
34. **Adapter Pattern** — `ERPAdapter` para Totvs/SAP/Sankhya (mesma interface)
35. **Strategy Pattern** — `RankingStrategy` (equal/weighted/percentile)
36. **Observer Pattern** — `eventBus` (pub/sub interno)
37. **Decorator Pattern** — middleware composition em Next.js
38. **Command Pattern** — `CommandBus` para CQRS (futuro)
39. **CQRS Pattern** — `QueryHandler` vs `CommandHandler` (planejado v2.0)
40. **Specification Pattern** — `GoalSpecification.isSatisfiedBy(goal)` (regras complexas)
41. **Value Object Pattern** — `Money`, `DateRange`, `Email` (imutáveis)
42. **Aggregate Root Pattern** — `Campaign` é raiz de `CampaignParticipant`, `CampaignAward`
43. **Domain Event Pattern** — `GoalCreatedEvent` com timestamp + payload
44. **Repository Pattern** — todos os repositórios seguem `IXxxRepository`
45. **Unit of Work Pattern** — `prisma.$transaction()` como UoW
46. **Anti-Corruption Layer** — `ERPAdapter` traduz modelos externos para internos
47. **CQRS Read Model** — `RankingView` (materializado em Redis)
48. **Saga Pattern** — para transações distribuídas (ex.: pagamentos)
49. **Circuit Breaker** — em integrações externas (ERP, IA)
50. **Bulkhead Pattern** — isolamento de recursos por tenant (connection pool por empresa)

---

# Capítulo 5 — Git Workflow

## 5.1 Branches

### Convenção de Nomes
```
main                        # Produção
develop                     # Staging
feature/UC-029-cadastrar-metas    # Feature nova
bugfix/login-redirect-loop       # Correção de bug
hotfix/security-patch            # Hotfix produção
refactor/auth-module             # Refatoração
docs/api-specification           # Apenas documentação
chore/update-dependencies        # Manutenção
experiment/ai-prompt-v2          # Experimentação (pode ser descartado)
release/v1.2.0                   # Preparação de release
```

### Regras
- `main` e `develop` são **protected branches**
- Nenhum push direto — sempre via PR
- PR exige: 2 approvals, CI verde, sem conflitos
- Squash and merge em `develop`
- Hotfix em `main` é backported para `develop`
- Branches `experiment/*` podem ser forçadas (`--force-with-lease`)
- Branches antigas (>30 dias sem commit) são automaticamente deletadas

## 5.2 Commits (Conventional Commits)

### Formato
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types Válidos
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Apenas documentação
- `style`: Formatação (não muda código)
- `refactor`: Refatoração (não muda comportamento)
- `test`: Adiciona/corrige testes
- `chore`: Manutenção (deps, configs)
- `perf`: Melhoria de performance
- `ci`: Mudanças em CI
- `build`: Mudanças em build system
- `revert`: Reverte commit anterior

### Exemplos
```
feat(goals): implementa UC-029 cadastrar metas em lote

- Adiciona endpoint POST /v1/goals/batch
- Cria GoalBatchService com validação por linha
- Importação via Excel com template

Closes #123
```

```
fix(auth): corrige redirect loop após login OAuth

O problema ocorria quando usuário tentava acessar /dashboard
direto sem estar autenticado. Agora redireciona para /login
preservando a URL original.

Closes #456
```

### Scopes Padrão
`auth`, `users`, `goals`, `results`, `campaigns`, `ranking`, `dashboard`, `ai`, `audit`, `license`, `backup`, `api`, `ui`, `docs`, `ci`, `db`, `security`, `tests`

## 5.3 Processo de PR

### Template de PR
```markdown
## Descrição
[O que este PR faz? Por quê?]

## Tipo de Mudança
- [ ] Bug fix (breaking: não)
- [ ] Nova feature (breaking: não)
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código segue padrões do projeto
- [ ] Adicionei testes
- [ ] Todos os testes passam localmente
- [ ] Documentação atualizada
- [ ] Sem warnings no lint
- [ ] Screenshots (se UI)

## Issues Relacionadas
Closes #123
```

### Code Review
- **2 approvals obrigatórios**
- Reviewer deve:
  - Verificar lógica
  - Checar testes
  - Validar performance
  - Considerar edge cases
  - Sugerir melhorias

---

# Capítulo 6 — Comandos Úteis

```bash
# Desenvolvimento
pnpm dev                    # Inicia tudo (web, desktop)
pnpm dev:web                # Apenas web
pnpm dev:desktop            # Apenas Electron

# Build
pnpm build                  # Build tudo
pnpm build:web              # Build web
pnpm build:desktop          # Build Electron installers

# Testes
pnpm test                   # Roda todos os testes
pnpm test:unit              # Apenas unitários
pnpm test:integration       # Apenas integração
pnpm test:e2e               # E2E (Playwright)
pnpm test:watch             # Modo watch
pnpm test:coverage          # Com cobertura
pnpm test:ui                # Vitest UI

# Quality
pnpm lint                   # ESLint
pnpm lint:fix               # ESLint com auto-fix
pnpm typecheck              # TypeScript check
pnpm format                 # Prettier

# Database
pnpm prisma:generate        # Gera client Prisma
pnpm prisma:migrate         # Cria migration
pnpm prisma:studio          # Abre Prisma Studio
pnpm prisma:seed            # Roda seed
pnpm prisma:reset           # Reset DB (CUIDADO)

# Docker
docker compose up -d        # Sobe serviços
docker compose down         # Para serviços
docker compose logs -f      # Ver logs

# Storybook
pnpm storybook              # Inicia Storybook
pnpm build-storybook        # Build estático

# Análise
pnpm analyze                # Bundle analyzer
pnpm depcheck               # Verifica deps não usadas
```

---

# Capítulo 7 — Troubleshooting Estendido (40+ Cenários)

## 7.1 "Cannot connect to database"

```bash
# Verifique se Docker está rodando
docker ps

# Reinicie containers
docker compose down && docker compose up -d

# Verifique a URL no .env
cat .env | grep DATABASE_URL

# Verifique se PostgreSQL está saudável
docker compose exec postgres pg_isready -U orion

# Verifique logs do Postgres
docker compose logs postgres --tail 50

# Se estiver usando SQLite local, verifique permissões:
ls -la prisma/dev.db
chmod 644 prisma/dev.db
```

## 7.2 "Prisma Client not generated"

```bash
pnpm prisma:generate
# Reinicie o servidor (Ctrl+C e pnpm dev)

# Se persistir, force regeneração:
rm -rf node_modules/.prisma
pnpm prisma:generate
```

## 7.3 "Port 3000 already in use"

```bash
# Encontre o processo
lsof -i :3000           # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Mate
kill -9 <PID>           # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Ou use outra porta
PORT=3001 pnpm dev
```

## 7.4 Tests E2E falhando intermitentemente

- Aumente timeout: `test.setTimeout(60_000)`
- Adicione `await page.waitForLoadState('networkidle')`
- Use `data-testid` ao invés de CSS selectors
- Verifique se não há animation pendente
- Use `page.waitForSelector('[data-testid="goal-card"]', { state: 'visible' })`
- Desabilite transições CSS em testes: `page.addStyleTag({ content: '* { transition: none !important; }' })`

## 7.5 "Type error" após instalar nova dep

```bash
pnpm prisma:generate  # Recria tipos do Prisma
pnpm typecheck
```

## 7.6 Hot reload não funciona

- Reinicie o servidor: `Ctrl+C` + `pnpm dev`
- Verifique se não há erro de sintaxe silencioso
- Delete `.next`: `rm -rf .next && pnpm dev`
- No Windows, certifique-se de estar usando WSL2
- Verifique `fs.inotify.max_user_watches` (Linux)

## 7.7 "Cannot find module '@/modules/...'"

```typescript
// Verifique tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/modules/*": ["./src/modules/*"]
    }
  }
}

// Reinicie o servidor TS: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

## 7.8 "JWT_SECRET is not defined"

```bash
# Verifique se .env está carregado
cat .env | grep JWT_SECRET

# Gere um secret seguro
openssl rand -base64 32
```

## 7.9 "EADDRINUSE: address already in use :::5432"

```bash
# PostgreSQL local conflitando com Docker
# Opção 1: Pare o PostgreSQL local
sudo service postgresql stop  # Linux
brew services stop postgresql  # macOS

# Opção 2: Mude a porta do Docker
# Em docker-compose.yml:
# ports:
#   - "5433:5432"
```

## 7.10 "Permission denied" ao instalar dependências

```bash
# NUNCA use sudo npm install
# Corrija permissões:
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER /usr/local/lib/node_modules
# Ou use nvm (recomendado)
```

## 7.11 "Husky: command not found" após clone

```bash
pnpm install
pnpm prepare  # Executa "husky install"
ls -la .husky/  # Deve ter _/, pre-commit, commit-msg
```

## 7.12 Build de produção falha mas dev funciona

- Verifique variáveis de ambiente de produção
- Confirme que não há `console.log` com dados sensíveis
- Verifique imports dinâmicos (`dynamic(() => import(...))`)
- Veja se não há uso de `process.env.NEXT_PUBLIC_*` em Server Components

## 7.13 "Module not found: Can't resolve 'crypto'"

```javascript
// next.config.js — adicione fallbacks
module.exports = {
  webpack: {
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
};
```

## 7.14 Storybook não carrega componentes

- Verifique `.storybook/main.ts` paths
- Confirme que imports usam `@/` alias
- Limpe cache: `rm -rf node_modules/.cache/storybook`
- Rode com debug: `storybook dev --debug-webpack`

## 7.15 "Maximum call stack size exceeded"

- Verifique recursão infinita em computed properties
- Confirme que não há import circular (`A → B → A`)
- Use `--stack-trace-limit=100` ao rodar Node:
  ```bash
  node --stack-trace-limit=100 node_modules/.bin/next dev
  ```

## 7.16 "Prisma migration failed: database does not exist"

```bash
# Crie o banco manualmente
docker exec -it orion-postgres psql -U orion -c "CREATE DATABASE orion;"

# Ou reset completo
pnpm prisma:reset
```

## 7.17 "Email não chega" em desenvolvimento

```bash
# Verifique MailHog
docker compose ps mailhog
# Deve estar rodando na porta 1025 (SMTP) e 8025 (UI)

# Abra a UI
open http://localhost:8025  # macOS
xdg-open http://localhost:8025  # Linux
start http://localhost:8025  # Windows

# Verifique config no .env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
```

## 7.18 "Cannot read properties of null (reading 'map')"

```typescript
// Use optional chaining e default value
const items = data?.items ?? [];
return items.map(item => <li key={item.id}>{item.name}</li>);

// Ou valide antes
if (!data?.items) return <EmptyState />;
```

## 7.19 "Hydration mismatch" no Next.js

- Verifique se não está usando `Date.now()`, `Math.random()` em render
- Confirme que não há uso de `localStorage`/`window` em SSR
- Use `useEffect` para código que depende do browser
- Use `suppressHydrationWarning` apenas em último caso

## 7.20 "TypeError: Cannot read property 'id' of undefined" em contexto de usuário

- Verifique que `requireAuth()` está sendo chamado antes de acessar `user.id`
- Confirme que o token JWT está sendo enviado no header `Authorization: Bearer <token>`
- Verifique se a sessão não expirou (cache de sessão)

## 7.21 "Out of memory" em build

```bash
# Aumente memória do Node
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build

# Em CI:
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

## 7.22 Lint extremamente lento

```bash
# Use cache
pnpm lint --cache

# Rode apenas em arquivos modificados
pnpm lint $(git diff --name-only --cached | grep -E '\.(ts|tsx)$')

# Desabilite regras pesadas em desenvolvimento
ESLINT_DEV=true pnpm dev
```

## 7.23 "fetch failed" ao chamar IA

```bash
# Verifique conectividade
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"

# Verifique rate limit
# Verifique saldo na conta OpenAI

# Em dev, use mock:
AI_MOCK=true pnpm dev
```

## 7.24 Redis desconecta frequentemente

```bash
# Verifique keepalive
# lib/redis.ts
redis.on('error', (err) => logger.error('Redis error', err));
redis.on('reconnecting', () => logger.warn('Redis reconnecting'));

# Aumente timeout em docker-compose.yml
# command: redis-server --timeout 300 --tcp-keepalive 60
```

## 7.25 "CSRF token mismatch"

```typescript
// NextAuth: garanta que CSRF está configurado
// app/api/auth/[...nextauth]/route.ts
export const authOptions = {
  // ...
  csrf: {
    token: 'csrfToken',
    cookie: { name: 'orion.csrf', options: { sameSite: 'lax', path: '/', httpOnly: true } },
  },
};
```

## 7.26 Testes lentos (>30s)

```bash
# Rode em paralelo
vitest --pool=threads --poolOptions.threads.maxThreads=4

# Use sharding em CI
vitest --shard=1/4
vitest --shard=2/4

# Identifique testes lentos
vitest --reporter=verbose | grep -E '\d+ms$'
```

## 7.27 "Wallet error" ao conectar via SSH em repositório privado

```bash
# Use token ao invés de SSH
git remote set-url origin https://<token>@github.com/sua-empresa/orion.git

# Ou configure SSH agent forwarding
# ~/.ssh/config
Host github.com
  ForwardAgent yes
```

## 7.28 Migrations fora de sync

```bash
# Verifique estado
pnpm prisma migrate status

# Se migrations marcadas como aplicadas mas não estão no DB:
pnpm prisma migrate resolve --rolled-back <migration_name>

# Se DB tem tabelas que não estão no schema:
pnpm prisma db pull  # CUIDADO: pode sobrescrever schema
```

## 7.29 Bundle size explodiu

```bash
# Analise bundle
pnpm analyze

# Identifique imports pesados
pnpm depcheck

# Substitua libs pesadas:
# - moment → date-fns ou dayjs
# - lodash → lodash-es com tree-shaking ou funções nativas
# - rxjs → importe apenas o que precisa
```

## 7.30 "Cannot find name 'process'"

```typescript
// Instale tipos do Node
pnpm add -D @types/node

// Em componentes client, use NEXT_PUBLIC_ vars:
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## 7.31 Vários cenários rápidos

| Problema | Solução |
|----------|---------|
| `useEffect` roda duas vezes | Esperado em React 18 Strict Mode (dev) |
| `pnpm install` lento | `pnpm config set network-concurrency 1` |
| `git pull` com conflitos de lockfile | `pnpm install --frozen-lockfile=false` |
| `tsc` não reconhece `.vue` | Instale `vue-tsc` e configure |
| WSL2 fecha sozinho | `wsl --update` no PowerShell |
| Docker usa muita CPU | Desabilite sync de arquivos desnecessários |
| Chrome DevTools lento | Desabilite source maps em dev |
| WebSocket desconecta | Verifique proxy/reverse proxy timeout |
| `pnpm prune` removeu deps necessárias | Rode `pnpm install` novamente |
| `lint-staged` não roda | Verifique `.husky/pre-commit` e `lint-staged` config |

---

# Capítulo 8 — Code Review Guidelines Detalhadas

## 8.1 Objetivos do Code Review

1. **Garantir qualidade:** detectar bugs, anti-patterns, problemas de segurança.
2. **Compartilhar conhecimento:** espalhar contexto do domínio entre o time.
3. **Manter consistência:** aplicar padrões do projeto uniformemente.
4. **Mentoria:** ajudar devs juniores a crescerem com feedback construtivo.
5. **Auditabilidade:** trilha de quem revisou e aprovou cada mudança.

## 8.2 O que Revisar (Checklist)

### 8.2.1 Funcionalidade
- [ ] O código resolve o problema proposto?
- [ ] Edge cases foram considerados (null, undefined, empty array, negative numbers)?
- [ ] Comportamento em erro é apropriado (não silencioso, não crasha)?
- [ ] Testes cobrem caminho feliz + erros + edge cases?
- [ ] Performance foi considerada (queries N+1, loops desnecessários)?

### 8.2.2 Arquitetura
- [ ] Mudança está no módulo correto (não vaza para outro domínio)?
- [ ] Não introduz dependência circular?
- [ ] Respeita camadas (component → hook → service → repository → prisma)?
- [ ] Não duplica lógica já existente?
- [ ] Aproveita abstrações existentes (eventBus, cache, audit)?

### 8.2.3 Código
- [ ] Nomes são claros e descritivos (não abreviações obscuras)?
- [ ] Funções são curtas (< 50 linhas, idealmente < 20)?
- [ ] Classes têm responsabilidade única?
- [ ] Sem "magic numbers" (constantes nomeadas)?
- [ ] Sem comentários óbvios (código se explica)?

### 8.2.4 TypeScript
- [ ] Sem `any` (use `unknown` + type guard)?
- [ ] Retornos de funções públicas tipados?
- [ ] Sem `as` para forçar tipos sem type guard?
- [ ] `interface` para objetos, `type` para unions?
- [ ] Sem `// @ts-ignore` (use `@ts-expect-error` com motivo)?

### 8.2.5 Segurança
- [ ] Input validado com Zod?
- [ ] Queries têm `companyId` do JWT (não do body)?
- [ ] Senhas/tokens não logados?
- [ ] Sem SQL injection (queries parametrizadas)?
- [ ] Sem XSS (output escapado)?
- [ ] Secrets em variáveis de ambiente (não hardcoded)?

### 8.2.6 Performance
- [ ] Sem N+1 queries (use `include` ou `select`)?
- [ ] Paginação em listagens?
- [ ] Cache onde apropriado?
- [ ] Sem fetch desnecessário em loops?
- [ ] Índices apropriados para novas queries?

### 8.2.7 Manutenibilidade
- [ ] Documentação atualizada (JSDoc em funções públicas)?
- [ ] ADR criada para decisões arquiteturais?
- [ ] Breaking changes comunicadas?
- [ ] Migration script documentado?
- [ ] Comportamento novo é monitorável (logs/métricas)?

### 8.2.8 Testes
- [ ] Novas funcionalidades têm testes?
- [ ] Bugs corrigidos têm teste de regressão?
- [ ] Testes rodam em < 10s (unit)?
- [ ] Testes não flaky?
- [ ] Cobertura não diminuiu?

## 8.3 Níveis de Severidade de Comentários

| Nível | Cor | Ação | Exemplo |
|-------|-----|------|---------|
| **Bloqueador** | 🔴 | PR não pode mergear | Bug crítico, vulnerabilidade de segurança, quebra de contrato |
| **Must fix** | 🟠 | Deve corrigir antes do merge | Performance problemática, edge case não tratado, teste faltante |
| **Should fix** | 🟡 | Recomendado, mas pode ser follow-up | Refatoração menor, nome melhoria, comentário explicativo |
| **Nice to have** | 🟢 | Sugestão opcional | Alternativa elegante, micro-otimização, ideia para futuro |
| **Praise** | 🔵 | Reconhecimento positivo | Código particularmente elegante, boa captura de edge case |

### Formato de Comentário

```markdown
[🔴 Bloqueador] Esta query não filtra por companyId, permitindo vazar dados entre tenants.

```typescript
// ❌ Atual
const goals = await prisma.goal.findMany({ where: { userId } });

// ✅ Correção
const goals = await prisma.goal.findMany({ where: { userId, companyId: user.companyId } });
```

[🟡 Should fix] Considere extrair essa validação para uma função separada — ficará mais testável.

[🔵 Praise] Excelente uso do pattern Result aqui! Resolveu elegatemente o problema de múltiplos tipos de erro.
```

## 8.4 Princípios do Reviewer

1. **Seja específico:** mostre o código sugerido, não apenas "isso está errado".
2. **Seja construtivo:** sugira alternativas, não apenas critique.
3. **Assuma boas intenções:** não ataque o autor.
4. **Foque no código, não na pessoa:** "isso pode causar bug" ≠ "você fez errado".
5. **Pergunte quando não entender:** "por que escolheu essa abordagem?" em vez de "isso está errado".
6. **Respeite o tempo:** não peça refatoração gigante em PR que está quase pronto.
7. **Aprenda também:** se o autor fez algo novo para você, reconheça.

## 8.5 Princípios do Autor

1. **Faça self-review antes de pedir:** leia seu próprio PR com olhos críticos.
2. **Peça reviewer certo:** especialista no domínio (ex.: módulo IA → dev que conhece LLMs).
3. **Não leve para o lado pessoal:** feedback é sobre código, não sobre você.
4. **Explique decisões:** se fez algo não-óbvio, deixe comentário no PR.
5. **Responda todos os comentários:** mesmo que seja "concordo, vou fazer no follow-up".
6. **Não force merge:** se 2 reviewers pediram mudança, mude (ou justifique).

## 8.6 Processo de Aprovação

```
1. Autor abre PR com:
   - Descrição clara
   - Checklist preenchido
   - Screenshots (se UI)
   - Links para issues
   - Testes incluídos

2. Autor designa:
   - 2 reviewers (1 sênior + 1 pleno/júnior)
   - 1 reviewer do módulo afetado
   - Tech lead se for breaking change

3. Reviewers revisam em até 24h (PRs normais) ou 4h (hotfix)

4. Discussão:
   - Comentários no GitHub (público)
   - Pair review síncrono para PRs complexos
   - Reviewer pode aprovar, pedir mudanças, ou rejeitar

5. Aprovação:
   - 2 approvals obrigatórios
   - CI verde (lint, typecheck, testes, security scan)
   - Sem conflitos com develop
   - Sem breaking changes sem ADR

6. Merge:
   - Squash and merge (commits limpos)
   - Delete branch
   - Mova ticket para "Done"
```

## 8.7 Anti-patterns de Code Review

| Anti-pattern | Por que é ruim | Solução |
|--------------|----------------|---------|
| "LGTM" sem revisar | Aprovação cega | Use checklist; leia cada linha |
| Comentar estilo quando lint já pega | Desperdiça tempo | Configure Prettier/ESLint |
| Pedir refatoração gigante em PR pequeno | Autor fica frustrado | Peça ADR + issue separada |
| Rejeitar PR por preferência pessoal | Subjetividade | Foque em padrões do projeto |
| Comentar linha-a-linha sem contexto | Visão parcial | Revise arquitetura primeiro |
| Não responder comentários | Perda de conhecimento | Autor responde todos |
| Demorar > 48h para review | Bloqueia time | Defina SLA de review |
| Aprovar só para "ajudar" | Falsa aprovação | Não aprove se não revisou |

---

# Capítulo 9 — Performance Profiling Guide

## 9.1 Ferramentas de Profiling

### 9.1.1 Frontend

| Ferramenta | Uso | Quando |
|------------|-----|--------|
| Chrome DevTools — Performance | CPU profiling, flamechart | Animações lentas, render travado |
| Chrome DevTools — Network | Waterfall de requests | Página demora a carregar |
| Chrome DevTools — Memory | Heap snapshots, allocation timeline | Suspeita de memory leak |
| React DevTools — Profiler | Component render time | Re-renders excessivos |
| Next.js Build Analyzer | Bundle composition | Bundle size grande |
| Lighthouse | Score geral de perf | Auditoria periódica |
| WebPageTest | Real device testing | Validação cross-device |
| Sentry Performance | RUM em produção | Performance real de usuários |

### 9.1.2 Backend

| Ferramenta | Uso | Quando |
|------------|-----|--------|
| Node.js `--prof` | CPU profile | Endpoint lento |
| `--inspect` + Chrome DevTools | Debug + profile | Desenvolvimento |
| Clinic.js | CPU/Memory/IO profiling | Diagnóstico profundo |
| Datadog APM | Tracing distribuído | Produção |
| `pg_stat_statements` | Top queries | DB lento |
| `EXPLAIN ANALYZE` | Plano de execução | Query específica lenta |
| Redis `MONITOR` (dev only) | Comandos Redis | Cache misses |
| `pprof` (em containers) | Heap/CPU profile | Produção |

## 9.2 Profiling Passo-a-Passo

### 9.2.1 Endpoint Lento (Backend)

```bash
# 1. Ative inspect mode
node --inspect=0.0.0.0:9229 node_modules/.bin/next dev

# 2. Abra chrome://inspect no Chrome
# 3. Clique em "inspect" no processo Node
# 4. Vá em "Profiler" → "Start"
# 5. Faça a requisição que está lenta
# 6. Stop e analise flamechart
```

Alternativa via código:

```typescript
// profile-endpoint.ts
import { Session } from 'inspector/promises';
import { writeFileSync } from 'fs';

async function profileRequest(name: string, fn: () => Promise<void>) {
  const session = new Session();
  session.connect();
  await session.post('Profiler.enable');
  await session.post('Profiler.start');
  
  await fn();
  
  const { profile } = await session.post('Profiler.stop');
  writeFileSync(`./profiles/${name}.cpuprofile`, JSON.stringify(profile));
  session.disconnect();
}

// Uso:
await profileRequest('goal-list', async () => {
  await fetch('http://localhost:3000/api/v1/goals?page=1&limit=100');
});

# Carregar no Chrome DevTools → Performance → Load Profile
```

### 9.2.2 Componente React Lento

```typescript
// Use React DevTools Profiler
// 1. Instale React DevTools extension
// 2. Abra aba "Profiler"
// 3. Clique em "Record"
// 4. Reproduza a ação lenta
// 5. Stop e analise

// Em código, use o hook de profiling:
import { useRenderCounter } from '@/shared/hooks/useRenderCounter';

function MyComponent() {
  useRenderCounter('MyComponent');  // Loga no console quando re-renderiza
  // ...
}

// Ou com React.Profiler:
<React.Profiler id="GoalList" onRender={(id, phase, actualTime) => {
  if (actualTime > 16) {
    console.warn(`${id} ${phase} took ${actualTime}ms`);
  }
}}>
  <GoalList />
</React.Profiler>
```

### 9.2.3 Query de Banco Lenta

```sql
-- 1. Ative log de queries lentas
ALTER SYSTEM SET log_min_duration_statement = '100ms';
SELECT pg_reload_conf();

-- 2. Verifique queries mais lentas
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- 3. Para uma query específica:
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM goals 
WHERE company_id = 1 
  AND deleted_at IS NULL 
  AND start_date >= '2025-01-01'
ORDER BY created_at DESC
LIMIT 20;
```

### 9.2.4 Memory Leak

```typescript
// 1. No Chrome DevTools → Memory
// 2. Tire um heap snapshot inicial
// 3. Faça a ação suspeita de causar leak (ex.: navegar entre páginas)
// 4. Force GC (botão "Collect garbage")
// 5. Tire outro snapshot
// 6. Compare (segundo - primeiro)
// 7. Olhe "Delta" coluna — objetos que aumentaram

// Em Node.js:
import { writeHeapSnapshot } from 'v8';

// Adicione um endpoint de debug (APENAS em staging):
app.get('/debug/heapdump', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(404).end();
  const filename = `./heapdump-${Date.now()}.heapsnapshot`;
  writeHeapSnapshot(filename);
  res.json({ filename });
});

// Carregue o .heapsnapshot no Chrome DevTools → Memory
```

## 9.3 Otimização Comum

### 9.3.1 Reduzir Re-renders no React

```typescript
// ❌ Problemático — novo objeto a cada render
function Parent() {
  return <Child style={{ color: 'red' }} onClick={() => console.log('click')} />;
}

// ✅ Otimizado
const childStyle = { color: 'red' };
const handleClick = () => console.log('click');

function Parent() {
  return <Child style={childStyle} onClick={handleClick} />;
}

// Ou com useMemo/useCallback:
function Parent({ data }) {
  const processedData = useMemo(() => expensiveProcess(data), [data]);
  const handleClick = useCallback(() => console.log('click'), []);
  return <Child data={processedData} onClick={handleClick} />;
}
```

### 9.3.2 Paginação e Virtualização

```typescript
// Lista longa — use virtualização
import { useVirtualizer } from '@tanstack/react-virtual';

function BigList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ItemRow item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 9.3.3 Debounce e Throttle

```typescript
// Debounce — espera X ms de inatividade
import { useEffect, useState } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Uso: busca com debounce
function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  
  const { data } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchAPI(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });
}
```

---

# Capítulo 10 — Debug Techniques

## 10.1 VS Code Debugging

### Configuração launch.json

```jsonc
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js (debug)",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "cwd": "${workspaceFolder}/apps/web",
      "env": {
        "NODE_OPTIONS": "--inspect"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Vitest (current file)",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["vitest", "run", "${relativeFile}"],
      "console": "integratedTerminal"
    },
    {
      "name": "Vitest (debug)",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["vitest", "--inspect-brk", "--no-file-parallelism"],
      "console": "integratedTerminal"
    },
    {
      "name": "Playwright (debug)",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["playwright", "test", "--debug"],
      "console": "integratedTerminal"
    },
    {
      "name": "Attach to Next.js",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Técnicas de Debug no VS Code

1. **Breakpoints condicionais:** clique direito no breakpoint → "Edit Breakpoint" → condição (ex.: `userId === 42`)
2. **Logpoints:** clique direito → "Add Logpoint" → loga sem parar
3. **Watch expressions:** variáveis/expressões monitoradas
4. **Call Stack:** pilha de chamadas para rastrear origem
5. **Step over/into/out:** F10/F11/Shift+F11
6. **Multi-thread debugging:** útil para Worker threads (BullMQ)

## 10.2 Chrome DevTools para Frontend

### Atalhos Essenciais

| Atalho | Ação |
|--------|------|
| F12 / Cmd+Opt+I | Abrir DevTools |
| Cmd+R | Reload (mantém DevTools) |
| Cmd+Shift+R | Hard reload (ignora cache) |
| Cmd+P | Quick open arquivo |
| Cmd+Shift+P | Command palette |
| Cmd+F | Busca em arquivos |
| Esc | Toggle console |

### Abas Principais

#### Elements
- Inspecionar DOM
- Editar CSS live
- Force element state (:hover, :focus, :active)
- Break on DOM mutation

#### Console
- `$0` — último elemento selecionado
- `$$('selector')` — querySelectorAll
- `copy(obj)` — copia para clipboard
- `monitorEvents($0)` — loga eventos do elemento
- `debug(fn)` — breakpoint quando função é chamada

#### Sources
- Debug JavaScript com breakpoints
- Snippets (código reutilizável)
- Local modifications (ver mudanças)
- Workspace (sync com arquivos locais)

#### Network
- Filtre por XHR, JS, CSS, Img, WS
- Right-click → "Copy as fetch" / "Copy as cURL"
- Throttle: 3G slow / Fast 3G / Custom
- Block request URL (para testar fallback)
- Replay XHR

#### Performance
- Record → faça ação → Stop
- Flamechart mostra CPU time
- Main thread, GPU, Network em paralelo
- Identifica long tasks (> 50ms)

#### Memory
- Heap snapshot — compara antes/depois
- Allocation timeline — quando objetos são criados
- Allocation sampling — overhead menor

#### Application
- Local Storage, Session Storage, IndexedDB
- Service Workers (debug PWA)
- Cache Storage
- Cookies (incluindo httpOnly — apenas ver, não editar)

## 10.3 Debugging Node.js Backend

### Console Avançado

```typescript
// Console com namespace
import debug from 'debug';
const log = debug('orion:goals:service');

log('Creating goal for user %d', userId);
// Ativa: DEBUG=orion:goals:* pnpm dev
// Ativa tudo: DEBUG=orion:* pnpm dev

// Log estruturado temporário (NÃO commite)
console.log(JSON.stringify({ userId, input, error }, null, 2));

// Ou use o logger em modo debug:
logger.debug('Goal creation payload', { input });
```

### Inspecting Running Process

```bash
# Inicie com inspect
NODE_OPTIONS='--inspect=0.0.0.0:9229' pnpm dev

# Conecte via Chrome
open chrome://inspect

# Em produção (NÃO recomendado, mas possível):
kill -USR2 <pid>  # Ativa inspector
# Conecte via chrome://inspect
```

### Profiling CPU

```bash
# Profile de 30s em produção
node --prof http_server.js
# Gera isolate-0x...-v8.log

# Converte para legível
node --prof-process isolate-0x...-v8.log > profile.txt
```

### Memory Snapshots

```typescript
import { writeHeapSnapshot } from 'node:v8';

// Em código:
if (process.env.DEBUG_HEAP) {
  setInterval(() => {
    const filename = `./heap-${Date.now()}.heapsnapshot`;
    writeHeapSnapshot(filename);
    console.log(`Heap snapshot: ${filename}`);
  }, 60_000);
}
```

## 10.4 Debugging Next.js Específico

### Server vs Client Components

```typescript
// Adicione log no início de cada component para saber onde está rodando:
export function MyComponent() {
  console.log('MyComponent rendered on', typeof window === 'undefined' ? 'server' : 'client');
  // ...
}

// Ou:
'use client';
import { useEffect } from 'react';

export function MyComponent() {
  useEffect(() => {
    console.log('Component mounted on client');
  }, []);
}
```

### Debug NextAuth

```typescript
// auth.ts
export const authOptions = {
  debug: true,  // Log detalhado
  logger: {
    error(code, metadata) {
      console.error('NextAuth error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth warn:', code);
    },
  },
  events: {
    async signIn(message) { console.log('Signed in:', message); },
    async signOut(message) { console.log('Signed out:', message); },
    async createUser(message) { console.log('User created:', message); },
  },
};
```

### Debug Middleware

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  console.log('Middleware:', {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
  });
  // ...
}
```

## 10.5 Debugging Prisma

```typescript
// Ative log de queries
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
  ],
});

// Ou para eventos:
prisma.$on('query', (e) => {
  console.log('Query:', e.query);
  console.log('Params:', e.params);
  console.log('Duration:', e.duration, 'ms');
});
```

## 10.6 Debugging Testes

### Vitest

```bash
# Rode um arquivo específico
pnpm vitest run path/to/test.test.ts

# Modo watch
pnpm vitest path/to/test.test.ts

# UI mode (recomendado)
pnpm vitest --ui

# Debug com inspector
pnpm vitest --inspect-brk

# Verbose output
pnpm vitest run --reporter=verbose
```

### Playwright

```bash
# Modo debug (UI mode)
pnpm playwright test --debug

# Mostra navegador
HEADED=true pnpm playwright test

# Vídeo em caso de falha
pnpm playwright test --video=on

# Screenshot em caso de falha
pnpm playwright test --screenshot=only-on-failure

# Trace viewer
pnpm playwright test --trace=on
pnpm playwright show-trace trace.zip
```

## 10.7 Debugging em Produção

### Sentry

```typescript
// Capture contexto adicional
Sentry.configureScope(scope => {
  scope.setUser({ id: user.id, email: user.email });
  scope.setTag('company_id', user.companyId);
  scope.setContext('goal', { id: goalId, targetValue });
});

Sentry.captureException(error);
Sentry.captureMessage('Unusual behavior detected', 'warning');
```

### Datadog APM

```typescript
import { tracer } from 'dd-trace';

tracer.init({
  logInjection: true,
  samplingRules: [{ sample_rate: 1, service: 'orion-api' }],
});

// Spans customizados
const span = tracer.startSpan('goal.calculation');
try {
  await calculateGoal();
  span.finish();
} catch (err) {
  span.setTag('error', err);
  span.finish();
  throw err;
}
```

---

# Capítulo 11 — Database Query Optimization

## 11.1 Identificação de Queries Lentas

### Ativar pg_stat_statements

```sql
-- postgresql.conf
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.max = 10000
pg_stat_statements.track = all

-- Após restart:
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 20 queries mais lentas (média)
SELECT 
  substring(query, 1, 100) as query,
  calls,
  round(total_exec_time::numeric, 2) as total_ms,
  round(mean_exec_time::numeric, 2) as mean_ms,
  round(max_exec_time::numeric, 2) as max_ms,
  rows
FROM pg_stat_statements
WHERE query NOT ILIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Top 20 queries mais chamadas
SELECT 
  substring(query, 1, 100) as query,
  calls,
  round(total_exec_time::numeric, 2) as total_ms
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 20;
```

## 11.2 EXPLAIN ANALYZE

```sql
-- Sempre use ANALYZE para tempo real
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, FORMAT TEXT)
SELECT g.*, u.name as user_name, i.name as indicator_name
FROM goals g
JOIN users u ON g.user_id = u.id
JOIN indicators i ON g.indicator_id = i.id
WHERE g.company_id = 1 
  AND g.deleted_at IS NULL
  AND g.start_date >= '2025-01-01'
ORDER BY g.created_at DESC
LIMIT 20;

-- Saída interpretada:
-- Seq Scan = BAD (sem índice)
-- Index Scan = GOOD
-- Index Only Scan = BEST (covering index)
-- Hash Join = OK para grandes volumes
-- Nested Loop = bom para volumes pequenos, ruim para grandes
-- Sort = pode ser otimizado com índice
-- Buffers: shared hit = cache, shared read = disco
```

## 11.3 Padrões de Otimização

### 11.3.1 Evitar N+1

```typescript
// ❌ N+1 — faz 1 + N queries
const goals = await prisma.goal.findMany({ where: { companyId: 1 } });
for (const goal of goals) {
  const user = await prisma.user.findUnique({ where: { id: goal.userId } }); // N queries!
  console.log(user.name);
}

// ✅ Inclua relações
const goals = await prisma.goal.findMany({
  where: { companyId: 1 },
  include: { user: { select: { name: true } } },
});

// ✅ Use select para trazer apenas necessário
const goals = await prisma.goal.findMany({
  where: { companyId: 1 },
  select: {
    id: true,
    targetValue: true,
    user: { select: { name: true } },
  },
});
```

### 11.3.2 Índices Compostos

```sql
-- Para query com WHERE company_id = ? AND user_id = ? AND deleted_at IS NULL
CREATE INDEX idx_goals_company_user_active 
ON goals (company_id, user_id) 
WHERE deleted_at IS NULL;

-- Para ORDER BY created_at DESC com filtro de company
CREATE INDEX idx_goals_company_created 
ON goals (company_id, created_at DESC);

-- Para filtro temporal
CREATE INDEX idx_goals_date_range 
ON goals (company_id, start_date, end_date);
```

### 11.3.3 Paginação Eficiente

```typescript
// ❌ OFFSET é lento em grandes volumes
const page5 = await prisma.goal.findMany({
  where: { companyId: 1 },
  skip: 100000,  // Lento!
  take: 20,
});

// ✅ Cursor-based (sempre rápido)
const nextPage = await prisma.goal.findMany({
  where: { 
    companyId: 1,
    id: { gt: lastSeenId },
  },
  orderBy: { id: 'asc' },
  take: 20,
});
```

### 11.3.4 Agregações Otimizadas

```sql
-- ❌ Agregação em tempo real — lenta em grandes volumes
SELECT 
  user_id, 
  SUM(value) as total,
  COUNT(*) as count
FROM results 
WHERE company_id = 1 
  AND result_date >= '2025-01-01'
GROUP BY user_id;

-- ✅ Materialized View pré-calculada
CREATE MATERIALIZED VIEW mv_user_results_monthly AS
SELECT 
  company_id,
  user_id,
  DATE_TRUNC('month', result_date) as month,
  SUM(value) as total,
  COUNT(*) as count
FROM results
WHERE deleted_at IS NULL
GROUP BY company_id, user_id, DATE_TRUNC('month', result_date);

CREATE UNIQUE INDEX ON mv_user_results_monthly (company_id, user_id, month);

-- Refresh diário
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_results_monthly;
```

### 11.3.5 Connection Pooling

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"
  // Pool size via PgBouncer em produção
}

// docker-compose.yml
postgres:
  environment:
    - POSTGRES_MAX_CONNECTIONS=100
    - POSTGRES_SHARED_BUFFERS=256MB
    - POSTGRES_WORK_MEM=4MB
    - POSTGRES_MAINTENANCE_WORK_MEM=64MB
```

### 11.3.6 Query Batching

```typescript
// Use prisma.$transaction para múltiplas queries
const [goals, indicators, users] = await prisma.$transaction([
  prisma.goal.findMany({ where: { companyId: 1 } }),
  prisma.indicator.findMany({ where: { companyId: 1 } }),
  prisma.user.findMany({ where: { companyId: 1 } }),
]);

// Para bulk insert
await prisma.goal.createMany({
  data: goalsArray,
  skipDuplicates: true,
});
```

## 11.4 Monitoramento Contínuo

```sql
-- Queries ativas agora
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity 
WHERE state = 'active' 
  AND now() - pg_stat_activity.query_start > interval '5 minutes';

-- Locks
SELECT 
  blocked_locks.pid AS blocked_pid,
  blocked_activity.query AS blocked_query,
  blocking_locks.pid AS blocking_pid,
  blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_locks.pid = blocked_activity.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocked_locks.locktype = blocking_locks.locktype
  AND blocked_locks.relation = blocking_locks.relation
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_locks.pid = blocking_activity.pid
WHERE NOT blocked_locks.granted;

-- Índices não usados (candidatos a remoção)
SELECT 
  schemaname, relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY relname, indexrelname;

-- Tamanho das tabelas
SELECT 
  schemaname, relname,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  pg_size_pretty(pg_relation_size(relid)) as table_size,
  n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;
```

---

# Capítulo 12 — Bundle Analysis

## 12.1 Setup

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // outras configs
});
```

```bash
# Rode análise
ANALYZE=true pnpm build

# Abre visualização
# Client bundle: .next/analyze/client.html
# Server bundle: .next/analyze/server.html
```

## 12.2 Identificação de Problemas

```typescript
// ❌ Importa biblioteca inteira
import _ from 'lodash';  // 70KB
const result = _.groupBy(items, 'category');

// ✅ Importa apenas o necessário
import groupBy from 'lodash/groupBy';  // 1KB
const result = groupBy(items, 'category');

// Ou use lodash-es com tree-shaking
import { groupBy } from 'lodash-es';
```

```typescript
// ❌ moment.js é pesado (230KB)
import moment from 'moment';
const formatted = moment(date).format('DD/MM/YYYY');

// ✅ date-fns é modular
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
const formatted = format(date, 'dd/MM/yyyy', { locale: ptBR });
```

## 12.3 Code Splitting

```typescript
// Dynamic import para componentes pesados (ex.: editor Rico)
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <Skeleton />,
});

// Lazy load de charts
const Chart = dynamic(() => import('@/components/charts/BarChart'), {
  loading: () => <div className="h-64" />,
});
```

## 12.4 Tree Shaking

```typescript
// Verifique sideEffects no package.json
{
  "sideEffects": false  // Permite tree-shaking
}

// Ou liste arquivos com side effects:
{
  "sideEffects": [
    "*.css",
    "./src/polyfills.ts"
  ]
}
```

## 12.5 Metas de Bundle

| Tipo | Tamanho Máximo (gzipped) | Ação se exceder |
|------|--------------------------|-----------------|
| Página inicial (login) | 100KB | Code split, lazy load |
| Dashboard | 200KB | Lazy load charts |
| Lista padrão | 150KB | Virtualização, paginação |
| Formulário complexo | 180KB | Dynamic import do editor |
| Total First Load JS | 250KB | Bundle analysis obrigatório |
| Vendor chunk | 150KB | Estabilize deps |

---

# Capítulo 13 — Memory Leak Detection

## 13.1 Causas Comuns

1. **Event listeners não removidos**
2. **Intervals/timeouts não limpos**
3. **Closures mantendo referências**
4. **Cache crescente sem TTL**
5. **Singletons acumulando dados**
6. **Refs não limpos em React**
7. **Subscriptions (WebSocket, EventSource)**

## 13.2 Padrões de Prevenção

### React — cleanup em useEffect

```typescript
// ❌ Leak: listener nunca removido
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ Cleanup
useEffect(() => {
  const handler = (e: UIEvent) => handleResize(e);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
```

### Interval

```typescript
// ❌ Leak: interval nunca limpo
useEffect(() => {
  setInterval(() => fetchUpdates(), 5000);
}, []);

// ✅ Cleanup
useEffect(() => {
  const id = setInterval(() => fetchUpdates(), 5000);
  return () => clearInterval(id);
}, []);
```

### WebSocket

```typescript
// ✅ Cleanup adequado
useEffect(() => {
  const ws = new WebSocket('ws://localhost:8080');
  ws.onmessage = (e) => setMessages(prev => [...prev, JSON.parse(e.data)]);
  return () => {
    ws.close();
  };
}, []);
```

### AbortController para fetch

```typescript
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') console.error(err);
    });
  return () => controller.abort();
}, []);
```

## 13.3 Detecção de Leaks

### Chrome DevTools — Heap Snapshots

1. Abra DevTools → Memory
2. Selecione "Heap snapshot"
3. Tire snapshot 1 (baseline)
4. Faça a ação suspeita (ex.: navegar entre páginas 5x)
5. Force GC: clique em "Collect garbage"
6. Tire snapshot 2
7. Clique em snapshot 2 → "Comparison" → compare com snapshot 1
8. Ordene por "Delta" — veja o que cresceu

### Node.js — heap snapshots em produção

```typescript
import { writeHeapSnapshot } from 'node:v8';
import { useMemoryMonitor } from './memoryMonitor';

// Em produção, exponha via endpoint protegido:
app.post('/debug/heapdump', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).end();
  const filename = `/tmp/heap-${Date.now()}.heapsnapshot`;
  writeHeapSnapshot(filename);
  res.download(filename);
});

// Monitor automático — alerta se heap crescer
setInterval(() => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  if (used > 500) {  // 500MB
    logger.error('Memory leak suspected', { heapMB: used });
    writeHeapSnapshot(`/tmp/heap-alert-${Date.now()}.heapsnapshot`);
  }
}, 60_000);
```

### Clinic.js

```bash
# Instale
pnpm add -D clinic

# Rode com doctor (diagnóstico geral)
clinic doctor --on-port 'curl http://localhost:3000' -- node node_modules/.bin/next dev

# CPU profile
clinic flame --on-port 'curl http://localhost:3000/api/v1/goals' -- node --inspect node_modules/.bin/next dev

# Memory profile
clinic heapprofiler --on-port 'curl http://localhost:3000' -- node node_modules/.bin/next dev
```

---

# Capítulo 14 — Testing Strategies por Módulo

Cada módulo do Orion tem características específicas que exigem estratégias de teste diferenciadas. Esta seção detalha a estratégia para cada um.

## 14.1 Módulo Auth

**Estratégia:** Security-first. Cobertura mínima 95%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | Hash de senha, JWT encode/decode, refresh token rotation |
| Integration | Login flow completo, logout, MFA |
| E2E | Fluxo completo de login com 2FA, brute force, account lock |
| Security | SQL injection, XSS, CSRF, brute force, session fixation |
| Property-based | Token generation uniqueness, hash collision resistance |

```typescript
// Exemplo — teste de brute force
describe('Auth - Brute Force Protection', () => {
  it('locks account after 5 failed attempts', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'user@orion.com',
        password: 'wrong',
      });
      expect(res.status).toBe(401);
    }
    
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'user@orion.com',
      password: 'Admin@123', // senha correta
    });
    expect(res.status).toBe(423); // Locked
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
  });
});
```

## 14.2 Módulo Goals (Metas)

**Estratégia:** Business rules. Cobertura mínima 90%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | GoalCalculator (progress, projection, distribution) |
| Integration | CRUD completo, distribuição em lote, validações de domínio |
| E2E | Criar meta, distribuir para equipe, ver ranking |
| Property-based | Distribuição igualitária soma 100%, weights positivos |
| Performance | Listagem de 1000 metas < 500ms |

## 14.3 Módulo Results (Resultados)

**Estratégia:** Audit + concurrency. Cobertura mínima 90%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | Validação de resultado, cálculo de progresso |
| Integration | Aprovação/rejeição, recálculo de ranking |
| Concurrency | Dois usuários editando mesmo resultado (optimistic lock) |
| Audit | Toda mudança gera log de auditoria |
| E2E | Lançar resultado, aprovar, ver no ranking |

## 14.4 Módulo Campaigns (Campanhas)

**Estratégia:** State machine + temporal. Cobertura mínima 85%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | State transitions (draft → active → paused → ended) |
| Integration | Criar campanha, adicionar participantes, awards |
| Temporal | Campanha termina automaticamente em endDate |
| Performance | Listar campanhas ativas com ranking |
| E2E | Ciclo de vida completo de campanha |

## 14.5 Módulo Rankings

**Estratégia:** Real-time + computation. Cobertura mínima 90%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | Ranking calculation (equal, weighted, percentile) |
| Integration | Ranking recalcula quando resultado é lançado |
| Real-time | WebSocket atualiza ranking em tempo real |
| Performance | Ranking de 1000 usuários < 100ms (usando cache) |
| Property-based | Ranking é sempre bijetivo (1º lugar único) |

## 14.6 Módulo AI

**Estratégia:** Mocking + cost control. Cobertura mínima 80%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | Prompt templates, response parsing, cost calculation |
| Mock | Mock OpenAI/Anthropic responses |
| Integration | Chat flow, suggest-goals |
| Cost | Limite por empresa, por request, por dia |
| Privacy | Dados pessoais (CPF, email) não enviados à IA |
| Eval | Qualidade das respostas (mustContain, mustNotContain) |

## 14.7 Módulo Audit

**Estratégia:** Immutability + completeness. Cobertura mínima 95%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | Log creation, field diff calculation |
| Integration | Toda mutation gera log |
| Immutability | Logs não podem ser editados/deletados |
| Performance | Query de logs com filtros complexos |
| LGPD | Anonimização preserva auditoria |

## 14.8 Módulo License

**Estratégia:** Critical path. Cobertura mínima 95%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | License validation, expiration check, feature flags |
| Integration | Ativação, renovação, revogação |
| Concurrency | Race condition na validação |
| End-to-end | Sistema para de funcionar quando licença expira |
| Security | Não é possível forjar licença |

## 14.9 Módulo Dashboard

**Estratégia:** Composition + caching. Cobertura mínima 75%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | Widget configuration, layout |
| Integration | Carrega dados de múltiplos módulos |
| Cache | Dados cached corretamente |
| E2E | Drag-and-drop de widgets |
| Performance | Carrega < 1s |

## 14.10 Módulo Notifications

**Estratégia:** Delivery + retry. Cobertura mínima 85%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | Template rendering (Handlebars), queue management |
| Integration | Email, push, in-app |
| Retry | Falha temporária → retry exponencial |
| Idempotency | Mesma notificação não enviada 2x |
| Performance | 1000 notificações/min |

## 14.11 Módulo Backup

**Estratégia:** Reliability + restore. Cobertura mínima 90%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | Backup scheduling, retention policy |
| Integration | Backup para S3, restore |
| Disaster | Restore completo após data loss |
| Integrity | Backup não corrompido |
| Security | Backups criptografados |

## 14.12 Módulo Updates

**Estratégia:** Safety + rollback. Cobertura mínima 90%.

| Tipo de Teste | Foco |
|---------------|------|
| Unit | Version comparison, update planning |
| Integration | Download, install, verify |
| Rollback | Falha no update → rollback automático |
| E2E | Update de v1.0 para v1.1 |

---

# Capítulo 15 — Deployment do Ambiente de Dev

## 15.1 Ambientes

| Ambiente | URL | Propósito | Deploy |
|----------|-----|-----------|--------|
| Local | http://localhost:3000 | Dev individual | Manual (`pnpm dev`) |
| Preview | https://pr-{N}.orion-preview.com | PR review | Automático (Vercel preview) |
| Staging | https://staging.orion.com | QA, demos | Automático (merge em develop) |
| Production | https://app.orion.com | Clientes | Manual (tag v1.x.x) |
| Admin Prod | https://admin.orion.com | Painel admin | Manual (tag v1.x.x) |

## 15.2 Deploy para Preview (Vercel)

Cada PR automaticamente gera um preview deployment:

```yaml
# .github/workflows/preview.yml
name: Preview Deploy
on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma generate
      - run: pnpm build
      - name: Deploy to Vercel
        run: |
          npx vercel --token ${{ secrets.VERCEL_TOKEN }} \
            --scope orion-team \
            --yes \
            --prod=false
```

## 15.3 Deploy para Staging

```yaml
# .github/workflows/staging.yml
name: Staging Deploy
on:
  push:
    branches: [develop]

jobs:
  staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma generate
      - run: pnpm build
      
      - name: Database migration
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
      
      - name: Deploy to Vercel
        run: |
          npx vercel --token ${{ secrets.VERCEL_TOKEN }} \
            --scope orion-team \
            --yes \
            --prod=true
        env:
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_STAGING_PROJECT_ID }}
      
      - name: Run smoke tests
        run: pnpm test:smoke
        env:
          BASE_URL: https://staging.orion.com
      
      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          slack-message: "Staging deploy: ${{ job.status }}"
```

## 15.4 Deploy para Produção

### Tag de Release

```bash
# Criar tag
git checkout main
git pull
git tag -a v1.2.0 -m "Release v1.2.0

Features:
- UC-029 Cadastrar metas em lote
- UC-030 Distribuição ponderada

Fixes:
- Bug no cálculo de ranking
- Ajuste em timezone de campanhas

Breaking: nenhuma"

git push origin v1.2.0
```

### Workflow de Produção

```yaml
# .github/workflows/production.yml
name: Production Deploy
on:
  push:
    tags: ['v*']

jobs:
  production:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Verify tag matches package version
        run: |
          TAG=${GITHUB_REF#refs/tags/v}
          PKG=$(jq -r .version package.json)
          if [ "$TAG" != "$PKG" ]; then
            echo "Tag $TAG doesn't match package.json version $PKG"
            exit 1
          fi
      
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma generate
      - run: pnpm build
      
      - name: Database migration (with backup)
        run: |
          ./scripts/backup-before-migration.sh
          pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
      
      - name: Deploy to Vercel
        run: |
          npx vercel --token ${{ secrets.VERCEL_TOKEN }} \
            --scope orion-team \
            --yes \
            --prod=true
        env:
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROD_PROJECT_ID }}
      
      - name: Run smoke tests
        run: pnpm test:smoke
        env:
          BASE_URL: https://app.orion.com
      
      - name: Notify Slack + Email
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} -d "{
            \"text\": \"🚀 Produção atualizada para ${{ github.ref_name }}\"
          }"
      
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
          draft: false
          prerelease: false
```

## 15.5 Rollback

```bash
# Vercel — rollback instantâneo via CLI
vercel rollback orion-web --token $VERCEL_TOKEN

# Ou via Dashboard:
# Vercel → Project → Deployments → Previous → "Promote to Production"

# Database rollback (se necessário):
pnpm prisma migrate resolve --rolled-back <migration_name>

# Revert código:
git revert <commit>
git push origin main
```

## 15.6 Deploy Local (Docker)

Para ambiente on-premise (cliente):

```bash
# Build
docker build -t orion-web:1.2.0 .

# Run
docker run -d \
  --name orion-web \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@db:5432/orion \
  -e REDIS_URL=redis://redis:6379 \
  -e JWT_SECRET=$JWT_SECRET \
  -v orion-uploads:/app/uploads \
  --restart unless-stopped \
  orion-web:1.2.0

# Health check
curl http://localhost:3000/api/v1/health
```

## 15.7 Deploy com Docker Compose (Cliente On-Premise)

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  web:
    image: orion-web:1.2.0
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://orion:${DB_PASSWORD}@postgres:5432/orion
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    volumes:
      - uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=orion
      - POSTGRES_USER=orion
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orion"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  backup:
    image: orion-backup:1.2.0
    environment:
      - DATABASE_URL=postgresql://orion:${DB_PASSWORD}@postgres:5432/orion
      - S3_BUCKET=${BACKUP_BUCKET}
      - S3_ACCESS_KEY=${S3_ACCESS_KEY}
      - S3_SECRET_KEY=${S3_SECRET_KEY}
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
  uploads:
```

## 15.8 Checklist Pré-Deploy (Produção)

```markdown
## 24h antes
- [ ] Tag criada e pushada
- [ ] CHANGELOG.md atualizado
- [ ] ADRs relevantes criados/atualizados
- [ ] Comunicado em #orion-releases no Slack
- [ ] Backup automático validado
- [ ] Stakeholders notificados (suporte, customer success)

## 1h antes
- [ ] Staging passou em todos os testes E2E
- [ ] Performance baseline não degradou
- [ ] Sentry sem novos erros em staging
- [ ] Datadog APM sem regressões
- [ ] Database migrations testadas em staging
- [ ] Plano de rollback documentado

## Durante deploy
- [ ] Window de baixo tráfego (janela 22h-04h BRT)
- [ ] On-call engineer disponível
- [ ] Monitoramento ao vivo (Datadog dashboard)
- [ ] Comunicar início em #orion-releases

## Após deploy
- [ ] Smoke tests passaram
- [ ] Healthcheck OK
- [ ] Sem erros P0 em Sentry (primeiros 30min)
- [ ] Latência p95 dentro do baseline
- [ ] Comunicar sucesso em #orion-releases
- [ ] Atualizar status page (se necessário)

## 24h depois
- [ ] Sem regressão em métricas de negócio
- [ ] Sem aumento de tickets de suporte
- [ ] Post-mortem (se houve incidente)
- [ ] Retrospectiva do release
```

---

# Capítulo 16 — Onboarding 30-60-90 Days

## 16.1 Filosofia

O onboarding do Orion é estruturado para que um novo desenvolvedor seja **produtivo** em 30 dias, **autônomo** em 60 dias, e **multiplicador** em 90 dias. Não é um processo de "leia tudo e boa sorte" — é um plano estruturado com mentor designado, metas claras e checkpoints semanais.

## 16.2 Pré-Dia 1 (Setup)

Antes do primeiro dia, a pessoa recebe:
- Acesso ao Google Workspace (email, calendar)
- Convite para Slack (`orion-team.slack.com`)
- Convite para GitHub (`github.com/sua-empresa`)
- Convite para Linear
- Convite para Vercel (preview)
- Convite para Sentry (read-only)
- Acesso ao 1Password (vault da equipe)
- Equipamento (notebook + monitor + periféricos)
- Mentor designado (dev sênior do time)

## 16.3 Dia 1 — Boas-vindas

### Manhã (4h)
- [ ] Café com mentor (30min)
- [ ] Setup do ambiente (Capítulo 2 deste doc)
- [ ] Clone, build, run local
- [ ] Login no sistema como admin
- [ ] Tour pela aplicação (mentor demonstra)

### Tarde (4h)
- [ ] Leitura: PVD (Doc 01) — 1h
- [ ] Leitura: PRD (Doc 03) — 1h
- [ ] Leitura: SAD (Doc 04) — 1h
- [ ] Configurar assinaturas no Slack: `#general`, `#orion-dev`, `#orion-releases`, `#orion-incidents`

### Fim do Dia 1
- [ ] Consegue rodar `pnpm dev` sem erros
- [ ] Consegue logar como admin
- [ ] Consegue criar uma meta e um resultado
- [ ] Entende o propósito do Orion

## 16.4 Semana 1 — Fundações

### Dia 2-3
- [ ] Pegar uma issue `good-first-issue` no Linear
- [ ] Fazer primeiro PR (pequeno: bugfix, typo, refatoração menor)
- [ ] Experimentar code review como reviewer secundário
- [ ] Leitura: UX/UI Design System (Doc 09) — 2h

### Dia 4-5
- [ ] Leitura: API Spec (Doc 10) — 2h
- [ ] Leitura: Security & LGPD (Doc 11) — 2h
- [ ] Estudar um módulo existente em profundidade (sugerido: `goals`)
- [ ] Pair programming com mentor (2h): debug de um bug real

### Fim da Semana 1
- [ ] Primeiro PR merged
- [ ] Consegue explicar a arquitetura modular
- [ ] Consegue encontrar código rapidamente
- [ ] Conhece o time (almoço 1:1 com cada um)

## 16.5 Semana 2 — Primeira Feature

- [ ] Pegar uma feature pequena (ex.: adicionar campo a um formulário)
- [ ] Implementar com mentor como pairing partner (4h/semana)
- [ ] Escrever testes (unit + integration)
- [ ] Documentar (JSDoc, atualizar README do módulo)
- [ ] Fazer PR com 2 reviewers
- [ ] Deploy para staging
- [ ] Demo no all-hands de sexta

### Checkpoint Semana 2
- [ ] Implementou feature completa end-to-end
- [ ] Entende fluxo: issue → branch → PR → review → staging → demo
- [ ] Consegue explicar decisões técnicas do próprio código

## 16.6 Dia 30 — Produtivo

### Semanas 3-4
- [ ] Pegar 2-3 features pequenas/médias
- [ ] Primeira feature de backend (CRUD completo)
- [ ] Primeira feature de frontend (componente + página)
- [ ] Participar de code review como reviewer primário (em PRs pequenos)
- [ ] Leitura: Implementation & Deployment (Doc 13) — 2h
- [ ] Leitura: Testing & QA Plan (Doc 14) — 2h

### Métricas de Sucesso Dia 30
| Métrica | Meta |
|---------|------|
| PRs merged | 5+ |
| Testes escritos | 20+ |
| Issues fechadas | 3+ |
| Code reviews dados | 5+ |
| Deploy para staging | 2+ |
| Documentação atualizada | 1+ seção |

### 1:1 com Mentor (Semanas 4)
- O que aprendeu?
- O que foi difícil?
- O que ajudou mais?
- Próximos 30 dias?

## 16.7 Dia 60 — Autônomo

### Semanas 5-8
- [ ] Pegar feature complexa (multi-módulo, com IA ou integração)
- [ ] Liderar a implementação (sem pair programming constante)
- [ ] Participar de planejamento de sprint (sprint planning)
- [ ] Fazer code review em PRs grandes
- [ ] Mentorear outro dev novo (se houver)
- [ ] Leitura: Developer Guide completo (este doc) — 4h
- [ ] Leitura: ADRs (Doc 21) — 1h

### Atividades Esperadas
- Aprender um módulo em profundidade e ser referência nele
- Contribuir para ADRs (Architecture Decision Records)
- Propor melhorias de processo
- Participar de on-call rotation (apenas shadow, sem ser primário)

### Métricas de Sucesso Dia 60
| Métrica | Meta |
|---------|------|
| PRs merged | 15+ |
| Features completas | 5+ |
| Code reviews dados | 20+ |
| Issues fechadas | 10+ |
| Documentação criada | 2+ seções |

## 16.8 Dia 90 — Multiplicador

### Semanas 9-12
- [ ] Liderar uma feature grande (1-2 sprints)
- [ ] Participar de on-call como primário
- [ ] Mentorear ativamente um dev júnior
- [ ] Apresentar no all-hands (10min) sobre algo que aprendeu
- [ ] Propor ADR para melhoria arquitetural
- [ ] Contribuir para roadmap (sugestões de features)
- [ ] Participar de entrevista de novos devs (1-2)

### Métricas de Sucesso Dia 90
| Métrica | Meta |
|---------|------|
| PRs merged | 30+ |
| Features lideradas | 2+ |
| On-call primário | 1+ semana |
| Mentoria | 1+ dev |
| Apresentações | 1+ no all-hands |
| ADRs propostos | 1+ |

## 16.9 Após 90 Dias — Continuidade

- Plano de carreira definido (com tech lead)
- Especialização em área (frontend, backend, devops, IA, security)
- Conferências/cursos financiados pela empresa
- Contribuição open-source (tempo pago)
- Path para sênior/pleno definido

## 16.10 Responsabilidades do Mentor

### Semana 1
- Pair programming diário (2h)
- Review de todos os PRs
- Disponibilidade no Slack para dúvidas (resposta < 15min)

### Semana 2-4
- Pair programming 3x/semana (1h)
- Code review em todos os PRs
- 1:1 semanal (30min) — feedback bidirecional

### Semana 5-8
- Pair programming 1x/semana (1h)
- Code review quando requisitado
- 1:1 quinzenal (30min)

### Semana 9-12
- Code review quando requisitado
- 1:1 mensal (1h)
- Suporte para autonomia (não para pairing)

### Avaliação do Mentor
Ao final dos 90 dias, mentor avalia:
- Aprendeu rápido?
- Segue padrões?
- Comunica bem?
- Autônomo?
- Recomenda para contratação plena?

---

# Capítulo 17 — Pair Programming Guidelines

## 17.1 Quando Usar Pair Programming

**Use pair programming quando:**
- Feature complexa (multi-módulo, algoritmo não-trivial)
- Área nova do códigobase (nenhum dos dois conhece bem)
- Onboarding de dev novo
- Bug difícil de reproduzir
- Refatoração arriscada (afeta múltiplos módulos)
- Security-sensitive (auth, criptografia, pagamentos)
- Teaching moment (sênior ↔ júnior)

**NÃO use pair programming para:**
- Tasks triviais (typo, mudança de CSS)
- Tasks que exigem concentração profunda solitária
- Quando um dos devs tem contexto profundo e o outro não (context switching caro)
- Reuniões de status (use sync written)

## 17.2 Formatos

### Driver-Navigator (clássico)

- **Driver:** escreve código, foca na sintaxe e implementação
- **Navigator:** revisa em tempo real, pensa em big picture, edge cases
- Troca a cada 25min (Pomodoro)

### Ping-Pong

- Ideal para TDD
- Pessoa A escreve teste que falha
- Pessoa B implementa para fazer passar
- Pessoa A refatora
- Repete

### Strong-Style Pairing

- Para contexto novo / tecnologia desconhecida
- Uma pessoa "sabe" e "ensina" enquanto a outra digita
- Pensar deve ser explicitado em voz alta

### Mob Programming

- 3+ pessoas em uma tela (ver Capítulo 18)

## 17.3 Boas Práticas

### Setup Físico/Virtual

- **Presencial:** mesa compartilhada, 2 monitores, 2 teclados/mouses
- **Remoto:** VS Code Live Share, screen share com audio, botão "passar controle"
- **Hybrid:** io.js ou Tuple.app para pairing remoto premium

### Princípios

1. **Ego-less:** o código é do time, não de quem digitou
2. **Pense alto:** verbalize o pensamento
3. **Pergunte:** "por que essa abordagem?"
4. **Respeite o ritmo:** não atropele o driver
5. **Pausas regulares:** a cada 90min, 15min de pausa
6. **Sem multitarefa:** celular no silencioso, Slack fechado
7. **Troca de papéis explícita:** "agora você dirige"

### Anti-patterns

| Anti-pattern | Problema | Solução |
|--------------|----------|---------|
| Driver silencioso | Navigator fica perdido | Verbalize pensamento |
| Navigator micro-gerenciando | Driver vira digitador | Foque em big picture |
| Não trocar papéis | Burnout, desequilíbrio | Timer de 25min |
| Pairing 8h seguidas | Exaustão | Máximo 4h/dia |
| Pairing em tudo | Ineficiente | Use critérios do 17.1 |

## 17.4 Ferramentas

### VS Code Live Share

```bash
# Instalar extensão
code --install-extension ms-vsliveshare.vsliveshare

# Compartilhar sessão
# Cmd+Shift+P → "Live Share: Start Collaborative Session"
# Compartilhe link com o pair
```

### Tuple.app (premium, recomendado para pairing intenso)

- Latência baixa
- Controle remoto fluido
- Áudio integrado
- Suporte a multi-monitores

### CodeSandbox / Gitpod (para pairing assíncrono)

- Branches efêmeros
- Preview live
- Comentários inline

## 17.5 Avaliação de Pairing

Após cada sessão de pairing (especialmente > 2h), faça retrospective de 5min:

1. O que funcionou bem?
2. O que podemos melhorar?
3. Próxima sessão: o que mudar?

---

# Capítulo 18 — Mob Programming para Features Complexas

## 18.1 O que é Mob Programming

Mob programming é uma extensão do pair programming para 3+ pessoas trabalhando simultaneamente na mesma tarefa, em uma única estação de trabalho. Todo o time escreve, desenha, discute e aprende junto.

**Diferença de Pair:**
- Pair: 2 pessoas, foco em produtividade
- Mob: 3-8 pessoas, foco em conhecimento compartilhado e qualidade

## 18.2 Quando Usar Mob

**Use mob programming quando:**
- Feature crítica com muitos edge cases (ex.: cálculo de comissões)
- Refatoração arquitetural grande (ex.: migração de monólito para microsserviços)
- Problem solving complexo (ex.: bug em produção que ninguém reproduz)
- Definição de arquitetura de novo módulo
- Treinamento de time em nova tecnologia
- Cross-team knowledge sharing (frontend + backend + devops juntos)

**NÃO use mob para:**
- Tasks triviais
- Quando time tem muitas tasks paralelas
- Para 1 issue comum — melhor pair ou solo

## 18.3 Formato Clássico (3-5 pessoas)

### Papéis

- **Driver (1):** digita no teclado. Não decide, apenas implementa o que o Navigator diz.
- **Navigator (1):** decide o que fazer. Pensar alto, dar instruções claras.
- **Mob (1-3):** observa, sugere, faz perguntas, pesquisa. Anota ideias para depois.

### Rotação

- Timer de 7-10min
- Driver vira Mob
- Navigator vira Driver
- Pessoa do Mob vira Navigator
- Continua até completar sessão (idealmente 90min)

### Regras

1. **Driver não decide:** apenas executa o que Navigator diz
2. **Navigator verbaliza:** "abra o arquivo X", "crie função Y com parâmetro Z"
3. **Mob fala para o Navigator, não para o Driver** (evita confusão)
4. **Anote, não interrompa:** ideias não-críticas vão para um "parking lot"
5. **Sem egos:** não importa quem teve a ideia
6. **Pausas obrigatórias:** 5min a cada 25min
7. **Sessões curtas:** máximo 2h por sessão

## 18.4 Setup

### Físico

- Sala com projetor ou TV grande (50"+)
- Mesa redonda (todos veem a tela)
- 1 teclado + 1 mouse (sem multi-input)
- Whiteboard ao lado para diagramas
- Post-its para parking lot

### Remoto

- Video call com screen share de alta qualidade
- Driver principal compartilha tela
- Chat para parking lot
- Ferramentas: VS Code Live Share, Miro/FigJam para diagramas

## 18.5 Exemplo de Sessão (Refatoração de Ranking)

### Contexto

- Sistema de ranking tem 3 estratégias (equal, weighted, percentile)
- Bug: ranking muda quando novos resultados entram (deveria ser estável até refresh)
- Ninguém conhece todo o código
- 4 devs disponíveis

### Sessão 1 (90min): Entendimento

- **Driver (Ana):** abre `RankingCalculator.ts`
- **Navigator (Bruno):** "vamos mapear todas as funções"
- **Mob (Carla, Diego):** anota fluxo no whiteboard
- Após 90min: diagrama no Miro, todos entendem o problema

### Sessão 2 (90min): Brainstorm de Solução

- **Driver (Carla):** escreve testes que capturam o bug
- **Navigator (Diego):** "teste 1: lança resultado, ranking não muda"
- **Mob (Ana, Bruno):** sugere abordagens
- Após 90min: 3 testes vermelhos capturando o bug

### Sessão 3 (90min): Implementação

- **Driver (Bruno):** implementa cache de ranking
- **Navigator (Ana):** "cria RankingCacheService com TTL de 60s"
- **Mob (Carla, Diego):** revisa, sugere edge cases
- Após 90min: testes verdes

### Sessão 4 (60min): Refatoração + Revisão

- **Driver (Diego):** refatora nomes, extrai constantes
- **Navigator (Carla):** "renomeia calculate para refresh"
- **Mob:** valida
- Após 60min: PR pronto, todos aprovam

## 18.6 Avaliação de Mob

Após cada sessão de mob:

1. **O que aprendemos juntos?**
2. **A sessão foi produtiva?**
3. **Próxima sessão: o que mudar?**
4. **Knowledge spreading: o que devemos documentar?**

## 18.7 Custo vs Benefício

| Métrica | Solo | Pair | Mob (4) |
|---------|------|------|---------|
| Velocidade de implementação | 1× | 0.8× | 0.5× |
| Bugs encontrados em produção | 100% | 60% | 20% |
| Conhecimento compartilhado | Baixo | Médio | Alto |
| Tempo de onboarding | 90 dias | 60 dias | 30 dias |
| Velocidade de code review | 1× | 0.7× | 0.3× (já revisado) |

**Conclusão:** Mob é mais lento para implementar, mas gera menos bugs e espalha conhecimento. Use para tarefas críticas.

---

# Capítulo 19 — Recursos

## 19.1 Documentação Interna
- `/docs` — Documentação técnica (este dossiê)
- `/docs/decisions` — ADRs (Architecture Decision Records)
- Storybook — Componentes vivos

## 19.2 Ferramentas
- **Linear** — Gestão de projetos
- **Slack** — Comunicação
- **GitHub** — Código e PRs
- **Vercel** — Preview deployments
- **Sentry** — Error tracking
- **Datadog** — APM e logs
- **1Password** — Senhas e secrets
- **Notion** — Documentação de processo
- **Figma** — Design (integrado com Doc 09)
- **Miro** — Diagramas colaborativos

## 19.3 Padrões de Referência
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Docs](https://react.dev)
- [Vitest Docs](https://vitest.dev)
- [Playwright Docs](https://playwright.dev)
- [Conventional Commits](https://www.conventionalcommits.org)

## 19.4 Canais Slack

| Canal | Propósito |
|-------|-----------|
| `#general` | Anúncios gerais |
| `#orion-dev` | Discussão técnica |
| `#orion-releases` | Deploys e releases |
| `#orion-incidents` | Incidentes em produção |
| `#orion-prs` | Notificação de PRs |
| `#orion-support` | Suporte a clientes |
| `#orion-random` | Off-topic |
| `#orion-help` | Dúvidas (qualquer nível) |

## 19.5 Onboarding de Novo Dev (Resumo)

### Dia 1
- Setup do ambiente (este doc)
- Clone, build, run local
- Leia: PVD, PRD, SAD (Docs 01, 03, 04)

### Dia 2-3
- Pegue uma issue `good-first-issue`
- Faça primeiro PR
- Leia: UX/UI Design System, Developer Guide (Docs 09, 15)

### Semana 1
- Contribua em feature pequena
- Participe de code review como reviewer secundário
- Leia: API Spec, Security (Docs 10, 11)

### Semana 2
- Pegue feature média com mentor
- Primeiro deploy para staging
- Onboarding completo

### Mês 1-3
- Ver Capítulo 16 (Onboarding 30-60-90)

---

# Capítulo 20 — Glossário

| Termo | Significado |
|-------|-------------|
| ADR | Architecture Decision Record |
| API | Application Programming Interface |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| SSR | Server-Side Rendering |
| CSR | Client-Side Rendering |
| SSG | Static Site Generation |
| ISR | Incremental Static Regeneration |
| RSC | React Server Components |
| PWA | Progressive Web App |
| SPA | Single Page Application |
| BFF | Backend for Frontend |
| CQRS | Command Query Responsibility Segregation |
| DDD | Domain-Driven Design |
| Bounded Context | Fronteira de domínio em DDD |
| Aggregate Root | Raiz de agregado em DDD |
| DTO | Data Transfer Object |
| ORM | Object-Relational Mapping |
| Migration | Script de evolução do schema |
| Seed | Dados iniciais do banco |
| Fixture | Dados de teste |
| Mock | Substituto de dependência em teste |
| Stub | Mock simplificado |
| Spy | Mock que registra chamadas |
| E2E | End-to-End (teste) |
| Smoke Test | Teste rápido de sanidade |
| DoD | Definition of Done |
| DoR | Definition of Ready |
| PR | Pull Request |
| MR | Merge Request |
| LGTM | Looks Good To Me |
| TBR | To Be Reviewed |
| WIP | Work In Progress |
| NFR | Non-Functional Requirement |
| SLO | Service Level Objective |
| SLA | Service Level Agreement |
| RTO | Recovery Time Objective |
| RPO | Recovery Point Objective |
| P95 | 95th percentile |
| TPS | Transactions Per Second |
| QPS | Queries Per Second |

---

# Conclusão

Este Developer Guide é um documento **vivo**. Toda melhoria de processo, novo padrão, nova ferramenta deve ser refletida aqui. Se você encontrou algo desatualizado, abra um PR.

**Princípios fundamentais:**

1. **Consistência acima de preferência pessoal** — siga os padrões, mesmo se discordar (ou proponha mudança via ADR).
2. **Qualidade acima de velocidade** — um dia a mais economiza uma semana de debug.
3. **Comunicação acima de assunção** — pergunte, documente, compartilhe.
4. **Simplicidade acima de cleverness** — código que ninguém entende é débito técnico.
5. **Testes acima de confiança** — se não está testado, está quebrado.

O Orion não é apenas um software — é uma plataforma que vai evoluir por décadas. Cada linha de código escrita hoje será lida por dezenas de devs nos próximos anos. Escreva com eles em mente.

**Lembre-se:** Desvios dos padrões aqui descritos devem ser justificados em ADR (Doc 21) e aprovados por 2 arquitetos.

---

*Fim do Developer Guide — Documento 15 do Dossiê Master do Projeto Orion*
