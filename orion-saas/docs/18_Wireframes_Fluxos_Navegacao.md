# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 18

# WIREFRAMES & FLUXOS DE NAVEGAÇÃO

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Wireframes em ASCII e Fluxos de Navegação

---

# Capítulo 1 — Objetivo

Este documento apresenta os wireframes em ASCII art das telas principais do Projeto Orion e os fluxos de navegação entre elas. Servem como base para designers criarem mockups em Figma e para desenvolvedores entenderem a estrutura de cada tela antes de implementar.

---

# Capítulo 2 — Fluxo de Navegação Principal

```
                          ┌──────────┐
                          │  Login   │
                          └────┬─────┘
                               │
              ┌────────────────┼─────────────────┐
              │                │                 │
              ▼                ▼                 ▼
        ┌──────────┐    ┌──────────┐      ┌──────────┐
        │Dashboard │    │ Painel   │      │  Setup   │
        │Vendedor  │    │  Admin   │      │ Wizard   │
        └────┬─────┘    └────┬─────┘      └────┬─────┘
             │               │                 │
             ▼               ▼                 ▼
        ┌──────────┐    ┌──────────┐      ┌──────────┐
        │ Metas    │    │ Empresas │      │ 1.Empresa│
        │ Resultados│   │ Usuários │      │ 2.Filiais│
        │ Ranking  │    │ Indicad. │      │ 3.Cargos │
        │ Campanhas│    │ Licença  │      │ 4.Admin  │
        │ Perfil   │    │ Backup   │      │ 5.Indic. │
        └──────────┘    │ Auditoria│      └──────────┘
                        └──────────┘
```

---

# Capítulo 3 — Tela de Login

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    [LOGO ORION]                         │
│                                                         │
│              Plataforma de Gestão Comercial             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │  E-mail ou Matrícula                            │    │
│  │  ┌───────────────────────────────────────────┐  │    │
│  │  │                                           │  │    │
│  │  └───────────────────────────────────────────┘  │    │
│  │                                                 │    │
│  │  Senha                                          │    │
│  │  ┌──────────────────────────────┐ [👁️ Mostrar]  │    │
│  │  │                              │               │    │
│  │  └──────────────────────────────┘               │    │
│  │                                                 │    │
│  │  ☐ Lembrar de mim          Esqueci minha senha  │    │
│  │                                                 │    │
│  │  ┌───────────────────────────────────────────┐  │    │
│  │  │              ENTRAR                       │  │    │
│  │  └───────────────────────────────────────────┘  │    │
│  │                                                 │    │
│  │  ──────── ou ────────                          │    │
│  │                                                 │    │
│  │  [G] Google    [M] Microsoft                   │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  v1.0.0  |  Política de Privacidade  |  Suporte        │
└─────────────────────────────────────────────────────────┘
```

### Elementos
- **Logo:** personalizado por empresa (quando login via subdomínio)
- **Campo login:** aceita e-mail, matrícula, CPF ou username (configurável)
- **2FA:** se habilitado, segundo passo pede código TOTP
- **OAuth:** botões Google/Microsoft (se habilitados pela empresa)
- **Esqueci senha:** link leva para fluxo de reset via e-mail

---

# Capítulo 4 — Dashboard do Vendedor

```
┌──────────────────────────────────────────────────────────────────┐
│ [☰] Orion  | Farmácia São João - Loja Centro    [🔔3] [👤João▼] │
├────────┬─────────────────────────────────────────────────────────┤
│        │                                                         │
│ MENU   │  Dashboard                          [📅 Hoje, 15 Ago]  │
│        │  ─────────────────────────────────────────────────────  │
│ ▸ Dash │                                                         │
│ ▸ Metas│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│   Dia  │  │ FATURAM. │ │ CLIENTES │ │  TKM     │ │ CONVERSÃO│   │
│ ▸ Resul│  │  R$1.250 │ │    15    │ │  R$83   │ │   72%    │   │
│ ▸ Rank │  │ 42% meta │ │ 50% meta │ │ 95% meta│ │ 80% meta │   │
│ ▸ Camp │  │ 🟡       │ │ 🟡       │ │ 🟢      │ │ 🟡       │   │
│        │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│ ▸ Hist │                                                         │
│ ▸ Perf │  ┌─────────────────────────────────┐ ┌──────────────┐  │
│        │  │  EVOLUÇÃO DO DIA                │ │ RANKING HOJE │  │
│ Sair   │  │                                 │ │              │  │
│        │  │  📈                              │ │ 1. Maria 130%│  │
│        │  │    /\                           │ │ 2. João  125│  │
│        │  │   /  \    /\                    │ │ 3. José  110│  │
│        │  │  /    \  /  \                   │ │ 4. Ana   95 │  │
│        │  │ /      \/    \___               │ │ 5. Pedro 80 │  │
│        │  │                                 │ │              │  │
│        │  │ 08h  10h  12h  14h  16h        │ │ Você: #2 🏆  │  │
│        │  └─────────────────────────────────┘ └──────────────┘  │
│        │                                                         │
│        │  ┌────────────────────────────────────────────────────┐│
│        │  │  PRÓXIMAS AÇÕES                                     ││
│        │  │  • Lançar resultado do dia  [Lançar Agora →]       ││
│        │  │  • Campanha "Dia dos Pais" termina em 3 dias       ││
│        │  │  • Meta de perfume: faltam R$340 (89%)             ││
│        │  └────────────────────────────────────────────────────┘│
└────────┴─────────────────────────────────────────────────────────┘
```

### Elementos
- **Cards de KPI:** 4 cards topo com indicadores do dia, cor indica status (verde/amarelo/vermelho)
- **Gráfico:** evolução do faturamento durante o dia (atualiza a cada 15min)
- **Ranking:** top 5 vendedores do dia + posição do próprio
- **Ações rápidas:** CTA para lançar resultado + avisos inteligentes

---

# Capítulo 5 — Lançamento de Resultado

```
┌──────────────────────────────────────────────────────────────────┐
│ [☰] Orion  | Farmácia São João - Loja Centro    [🔔3] [👤João▼] │
├────────┬─────────────────────────────────────────────────────────┤
│        │                                                         │
│ MENU   │  ← Voltar    Lançar Resultado - 15/08/2025             │
│        │  ─────────────────────────────────────────────────────  │
│        │                                                         │
│        │  ┌─────────────────────────────────────────────────┐    │
│        │  │                                                 │    │
│        │  │  Indicadores do Dia                             │    │
│        │  │                                                 │    │
│        │  │  Faturamento (R$)              Meta: R$3.000    │    │
│        │  │  ┌───────────────────────────────────────────┐  │    │
│        │  │  │ R$ 1.250,00                               │  │    │
│        │  │  └───────────────────────────────────────────┘  │    │
│        │  │  ████████░░░░░░░░░░░░░░ 42% da meta            │    │
│        │  │                                                 │    │
│        │  │  Nº de Clientes                Meta: 30         │    │
│        │  │  ┌───────────────────────────────────────────┐  │    │
│        │  │  │ 15                                         │  │    │
│        │  │  └───────────────────────────────────────────┘  │    │
│        │  │  ████████████░░░░░░░░░░ 50% da meta            │    │
│        │  │                                                 │    │
│        │  │  Marcas Exclusivas             Meta: 8          │    │
│        │  │  ┌───────────────────────────────────────────┐  │    │
│        │  │  │ 5                                          │  │    │
│        │  │  └───────────────────────────────────────────┘  │    │
│        │  │  █████████████░░░░░░░░░ 62% da meta            │    │
│        │  │                                                 │    │
│        │  │  Observações                                    │    │
│        │  │  ┌───────────────────────────────────────────┐  │    │
│        │  │  │                                             │  │    │
│        │  │  │                                             │  │    │
│        │  │  └───────────────────────────────────────────┘  │    │
│        │  │  📎 Anexar comprovante  🎤 Gravar áudio         │    │
│        │  │                                                 │    │
│        │  │  [Cancelar]              [Salvar Resultado]     │    │
│        │  └─────────────────────────────────────────────────┘    │
└────────┴─────────────────────────────────────────────────────────┘
```

### Elementos
- **Indicadores:** apenas os atribuídos ao vendedor, na ordem configurada
- **Cálculo em tempo real:** barra de progresso atualiza ao digitar
- **Observações:** texto livre + anexar foto + gravar áudio
- **Validação:** se valor > 200% da meta, pede justificativa

---

# Capítulo 6 — Dashboard do Gerente

```
┌──────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria▼]│
├────────┬─────────────────────────────────────────────────────────┤
│        │                                                         │
│ ADMIN  │  Dashboard Gerente                       [📅 Hoje ▼]   │
│        │  ─────────────────────────────────────────────────────  │
│ ▸ Dash │                                                         │
│ ▸ Metas│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│ ▸ Equipe│  │ FATURAM. │ │ TICKET M.│ │ CONVERSÃO│ │ RANKING  │   │
│ ▸ Camp │  │ R$12.500 │ │  R$83   │ │   72%    │ │ 8 vend.  │   │
│ ▸ Relat│  │ 89% meta │ │ 95% meta│ │ 80% meta │ │ ativos   │   │
│ ▸ IA   │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│        │                                                         │
│ ▸ Config│  ┌─────────────────────────────────┐ ┌──────────────┐  │
│ ▸ Audit│  │  RANKING DA EQUIPE              │ │ IA INSIGHTS  │  │
│        │  │                                 │ │              │  │
│        │  │  1. 🥇 João Silva    125%       │ │ 💡 João está │  │
│        │  │  2. 🥈 Maria Souza   118%       │ │ com 82% chance│  │
│        │  │  3. 🥉 José Pereira  110%       │ │ de bater meta│  │
│        │  │  4. Ana Costa        95%       │ │              │  │
│        │  │  5. Pedro Lima       80%       │ │ ⚠️ Pedro caiu│  │
│        │  │  6. Carla Dias       65% ⚠️    │ │ 12% no TKM   │  │
│        │  │                                 │ │              │  │
│        │  │  [Ver ranking completo →]       │ │ [Ver mais →] │  │
│        │  └─────────────────────────────────┘ └──────────────┘  │
│        │                                                         │
│        │  ┌────────────────────────────────────────────────────┐│
│        │  │  METAS PENDENTES DE APROVAÇÃO (3)                  ││
│        │  │  ──────────────────────────────────────────────    ││
│        │  │  • Pedro Lima - 14/08 - R$450 (acima do esperado)  ││
│        │  │    [Aprovar] [Rejeitar] [Ver detalhes]             ││
│        │  │  • Ana Costa - 14/08 - R$680                       ││
│        │  │    [Aprovar] [Rejeitar] [Ver detalhes]             ││
│        │  └────────────────────────────────────────────────────┘│
└────────┴─────────────────────────────────────────────────────────┘
```

---

# Capítulo 7 — Lista de Metas (Gerente)

```
┌──────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria▼]│
├────────┬─────────────────────────────────────────────────────────┤
│        │                                                         │
│ ADMIN  │  Metas                          [+ Nova Meta] [Importar]│
│        │  ─────────────────────────────────────────────────────  │
│        │                                                         │
│        │  [Buscar...]  [Período: Agosto/2025 ▼] [Filtrar ▼]     │
│        │                                                         │
│        │  ┌────────────────────────────────────────────────────┐│
│        │  │ Vendedor    │ Indicador    │ Meta   │ Progresso    ││
│        │  ├────────────────────────────────────────────────────┤│
│        │  │ João Silva  │ Faturamento  │ R$3.000│ 125% 🟢      ││
│        │  │ Maria Souza │ Faturamento  │ R$3.000│ 118% 🟢      ││
│        │  │ José Pereira│ Faturamento  │ R$3.000│ 110% 🟢      ││
│        │  │ Ana Costa   │ Faturamento  │ R$3.000│  95% 🟡      ││
│        │  │ Pedro Lima  │ Faturamento  │ R$3.000│  80% 🟡      ││
│        │  │ Carla Dias  │ Faturamento  │ R$3.000│  65% 🔴      ││
│        │  │ João Silva  │ Clientes     │   30   │ 150% 🟢      ││
│        │  │ ...                                                  ││
│        │  │                                                      ││
│        │  │  Mostrando 1-20 de 48  [Anterior] [1] [2] [3] [Próx]││
│        │  └────────────────────────────────────────────────────┘│
└────────┴─────────────────────────────────────────────────────────┘
```

---

# Capítulo 8 — Wizard de Configuração Inicial

```
┌──────────────────────────────────────────────────────────────────┐
│                  PROJETO ORION - CONFIGURAÇÃO INICIAL            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ●━━━━━━━━○━━━━━━━━○━━━━━━━━○━━━━━━━━○                         │
│   1.Empresa 2.Filiais 3.Cargos 4.Admin  5.Indic.                 │
│                                                                  │
│   ETAPA 1 DE 5: DADOS DA EMPRESA                                 │
│   ─────────────────────────────────────────                      │
│                                                                  │
│   Razão Social *                                                 │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │ Farmácia São João LTDA                                   │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Nome Fantasia *                                                │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │ Farmácia São João                                        │   │
│   └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│   CNPJ *                       Inscrição Estadual                │
│   ┌──────────────────────┐     ┌──────────────────────┐          │
│   │ 12.345.678/0001-90   │     │ 123.456.789.012      │          │
│   └──────────────────────┘     └──────────────────────┘          │
│                                                                  │
│   CEP *           Endereço *              Número *               │
│   ┌────────┐      ┌────────────────────┐ ┌──────┐                │
│   │01000-00│      │Rua Augusta         │ │ 100  │                │
│   └────────┘      └────────────────────┘ └──────┘                │
│                                                                  │
│   Cidade *                Estado *        Telefone               │
│   ┌──────────────┐        ┌──────┐       ┌──────────────┐        │
│   │ São Paulo    │        │ SP   │       │(11)3333-4444 │        │
│   └──────────────┘        └──────┘       └──────────────┘        │
│                                                                  │
│   E-mail *                       Logo da Empresa                 │
│   ┌────────────────────────┐     ┌──────────────────┐            │
│   │contato@farmacia.com.br │     │ [+ Enviar arquivo]│            │
│   └────────────────────────┘     └──────────────────┘            │
│                                                                  │
│   Tema: ( ) Padrão  ( ) Azul  ( ) Verde  ( ) Personalizado       │
│                                                                  │
│                                          [Cancelar] [Próximo →]  │
└──────────────────────────────────────────────────────────────────┘
```

---

# Capítulo 9 — Construtor de Indicadores

```
┌──────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria▼]│
├────────┬─────────────────────────────────────────────────────────┤
│        │                                                         │
│ ADMIN  │  Indicadores > Novo Indicador                          │
│        │  ─────────────────────────────────────────────────────  │
│        │                                                         │
│        │  ┌─────────────────────────────────────────────────┐    │
│        │  │                                                 │    │
│        │  │  Nome do Indicador *                            │    │
│        │  │  ┌───────────────────────────────────────────┐  │    │
│        │  │  │ Venda de Perfumes                          │  │    │
│        │  │  └───────────────────────────────────────────┘  │    │
│        │  │                                                 │    │
│        │  │  Descrição                                      │    │
│        │  │  ┌───────────────────────────────────────────┐  │    │
│        │  │  │ Receita total com produtos de perfumaria  │  │    │
│        │  │  └───────────────────────────────────────────┘  │    │
│        │  │                                                 │    │
│        │  │  Categoria *            Tipo *                  │    │
│        │  │  [Produtos ▼]          [Moeda (R$) ▼]           │    │
│        │  │                                                 │    │
│        │  │  Ícone                  Cor                      │    │
│        │  │  [🌸 Floral ▼]         [🟣 Roxo ▼]               │    │
│        │  │                                                 │    │
│        │  │  Casas Decimais        Peso (Ranking)            │    │
│        │  │  [2 ▼]                 [1.5]                     │    │
│        │  │                                                 │    │
│        │  │  Exibir em:                                      │    │
│        │  │  [✓] Dashboard  [✓] Ranking  [✓] Relatórios     │    │
│        │  │                                                 │    │
│        │  │  ─── Fórmula (Avançado) ───                     │    │
│        │  │  [✓] Usar fórmula personalizada                 │    │
│        │  │  ┌───────────────────────────────────────────┐  │    │
│        │  │  │ SUM(sale_items.value WHERE cat='perfume') │  │    │
│        │  │  └───────────────────────────────────────────┘  │    │
│        │  │  [Validar Fórmula]                              │    │
│        │  │                                                 │    │
│        │  │  [Cancelar]                    [Criar Indicador] │    │
│        │  └─────────────────────────────────────────────────┘    │
└────────┴─────────────────────────────────────────────────────────┘
```

---

# Capítulo 10 — Painel de Auditoria

```
┌──────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria▼]│
├────────┬─────────────────────────────────────────────────────────┤
│        │                                                         │
│ ADMIN  │  Auditoria                            [Exportar CSV]     │
│        │  ─────────────────────────────────────────────────────  │
│        │                                                         │
│        │  [Data: 01/08 - 15/08] [Usuário: Todos ▼] [Ação ▼]     │
│        │  [Buscar...]                                            │
│        │                                                         │
│        │  ┌────────────────────────────────────────────────────┐│
│        │  │Data       │ Usuário  │ Ação    │ Tabela │ Registro ││
│        │  ├────────────────────────────────────────────────────┤│
│        │  │15/08 14:32│ Maria S. │ update  │ goals   │ #42      ││
│        │  │  Valor antigo: target=25000                        ││
│        │  │  Valor novo: target=30000                           ││
│        │  │  IP: 192.168.1.100  | Chrome 120  | Windows         ││
│        │  ├────────────────────────────────────────────────────┤│
│        │  │15/08 13:15│ João S.  │ create  │ results │ #156     ││
│        │  │  Valor novo: {value: 1250, indicator: 3}            ││
│        │  │  IP: 192.168.1.105  | Mobile Safari                 ││
│        │  ├────────────────────────────────────────────────────┤│
│        │  │15/08 10:00│ Maria S. │ login   │ -       │ -        ││
│        │  │  IP: 192.168.1.100  | Chrome 120  | Windows         ││
│        │  └────────────────────────────────────────────────────┘│
│        │                                                         │
│        │  Mostrando 1-20 de 1.247  [Anterior] [1] [2] ... [63]  │
└────────┴─────────────────────────────────────────────────────────┘
```

---

# Capítulo 11 — Fluxo: Primeiro Acesso (Onboarding)

```
INÍCIO
  │
  ▼
[Instalação do App]
  │
  ▼
[Primeira execução]
  │
  ▼
[Tela: Ativar Licença]
  │ Insere chave XXXX-XXXX-XXXX-XXXX
  ▼
[Validação online/offline] ──falha──▶ [Modo carência 7 dias]
  │ sucesso                                  │
  ▼                                          ▼
[Wizard Etapa 1: Empresa]              [Notifica admin]
  │ Preenche CNPJ, razão social
  ▼
[Wizard Etapa 2: Filiais]
  │ Adiciona 1+ filiais
  ▼
[Wizard Etapa 3: Cargos]
  │ Define cargos (defaults: Admin, Gerente, Supervisor, Vendedor)
  ▼
[Wizard Etapa 4: Admin]
  │ Cria primeiro usuário admin
  ▼
[Wizard Etapa 5: Indicadores]
  │ Escolhe template (Farmácia, Supermercado, etc.)
  │ OU cria do zero
  ▼
[Configuração completa]
  │
  ▼
[Redireciona para Dashboard Admin]
  │
  ▼
FIM
```

---

# Capítulo 12 — Fluxo: Lançar Resultado (Vendedor)

```
INÍCIO
  │
  ▼
[Vendedor clica "Lançar Resultado"]
  │
  ▼
[Sistema busca indicadores do dia para o vendedor]
  │
  ▼
[Exibe formulário com indicadores]
  │
  ▼
[Vendedor preenche valores] ──cálculo em tempo real──▶ [Barra de progresso atualiza]
  │
  ├──────── valor > 200% meta? ──sim──▶ [Pedir justificativa]
  │                                            │
  │ não                                        ▼
  │                                      [Vendedor justifica]
  │                                            │
  ▼ ◀──────────────────────────────────────────┘
[Vendedor clica "Salvar"]
  │
  ▼
[Sistema valida via Zod]
  │
  ├──────── validação falha? ──sim──▶ [Exibir erros]
  │                                         │
  │ não                                     ▼
  │                                    Vendedor corrige
  ▼ ◀────────────────────────────────────────┘
[Indicador exige aprovação?]
  │
  ├──── sim ──▶ [Marca como "Pendente"]
  │                     │
  │ não                 ▼
  │              [Notifica supervisor/gerente]
  ▼ ◀─────────────────────┘
[Salva no banco]
  │
  ▼
[Recalcula ranking]
  │
  ▼
[Registra auditoria]
  │
  ▼
[Emite evento result.created]
  │
  ▼
[Webhooks disparados (se configurado)]
  │
  ▼
[Tela: "Resultado salvo!"]
  │
  ▼
[Redireciona para Dashboard]
  │
  ▼
FIM
```

---

# Capítulo 13 — Fluxo: Criar Campanha (Gerente)

```
INÍCIO
  │
  ▼
[Gerente acessa Campanhas > Nova]
  │
  ▼
[Formulário: Dados básicos]
  │ - Nome, descrição, período, objetivo
  ▼
[Selecionar indicadores da campanha]
  │ (pode múltiplos com pesos)
  ▼
[Definir regras] ──opcional──▶ [Rule Builder visual]
  │                                  │
  │ ◀────────────────────────────────┘
  ▼
[Selecionar participantes]
  │ (vendedores, equipes, ou todos)
  ▼
[Configurar premiações]
  │ - Medalhas, troféus, pontos, bonificação
  ▼
[Salvar como rascunho] OU [Ativar campanha]
  │
  ├──── rascunho ──▶ [Fica visível apenas para gerente]
  │
  └──── ativar ────▶ [Notifica participantes]
                          │
                          ▼
                   [Inicia contagem de pontos]
                          │
                          ▼
                    FIM
```

---

# Capítulo 14 — Fluxo: Aprovação de Resultado

```
[Gerente recebe notificação: "3 resultados pendentes"]
  │
  ▼
[Acessa Dashboard > Aprovações pendentes]
  │
  ▼
[Lista de resultados com detalhes]
  │
  ▼
Para cada resultado:
  │
  ├──▶ [Aprovar] ──▶ [Status: approved]
  │                      │
  │                      ▼
  │                 [Atualiza ranking]
  │                      │
  │                      ▼
  │                 [Notifica vendedor]
  │
  ├──▶ [Rejeitar] ──▶ [Pedir justificativa]
  │                      │
  │                      ▼
  │                 [Status: rejected]
  │                      │
  │                      ▼
  │                 [Notifica vendedor c/ motivo]
  │
  └──▶ [Ver detalhes] ──▶ [Modal com info completa]
                                          │
                                          ▼
                                    [Decide aprovar/rejeitar]
  │
  ▼
[Auditoria registrada]
  │
  ▼
FIM
```

---

# Capítulo 15 — Fluxo: Recuperação de Senha

```
INÍCIO
  │
  ▼
[Tela de Login > "Esqueci minha senha"]
  │
  ▼
[Input: e-mail ou matrícula]
  │
  ▼
[Sistema verifica se usuário existe]
  │
  ├──── existe ──▶ [Gera token único (1h validade)]
  │                      │
  │                      ▼
  │                 [Envia e-mail c/ link]
  │                      │
  │                      ▼
  │                 [Tela: "E-mail enviado"]
  │
  └──── não existe ──▶ [Tela: "E-mail enviado"]
                       (mesma mensagem, não revela)
  │
  ▼
[Usuário clica link no e-mail]
  │
  ▼
[Tela: Nova Senha]
  │
  ▼
[Input: nova senha + confirmação]
  │ (valida política: 8+, maiúscula, número, especial)
  ▼
[Sistema valida token + atualiza senha]
  │
  ├──── token válido ──▶ [Senha atualizada]
  │                            │
  │                            ▼
  │                       [Invalida token]
  │                            │
  │                            ▼
  │                       [Notifica por e-mail: senha alterada]
  │                            │
  │                            ▼
  │                       [Redireciona para login]
  │
  └──── token expirado ──▶ [Erro: "Link expirado"]
                                │
                                ▼
                           [Botão: "Solicitar novo link"]
  │
  ▼
FIM
```

---

# Capítulo 16 — Responsividade (Mobile)

### Mobile (até 640px)

```
┌────────────────────────────┐
│ [☰] Orion      [🔔] [👤]   │
├────────────────────────────┤
│                            │
│  Dashboard                 │
│  Hoje, 15 Ago              │
│                            │
│  ┌──────────────────────┐  │
│  │ Faturamento          │  │
│  │ R$ 1.250             │  │
│  │ 42% da meta   🟡     │  │
│  │ ████░░░░░░░░         │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Clientes             │  │
│  │ 15 / 30              │  │
│  │ 50% da meta   🟡     │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ Ranking #2 🏆        │  │
│  │ Maria está em #1     │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │ [Lançar Resultado →] │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

### Drawer Mobile (menu hamburguer)

```
┌────────────────────────────┐
│ ✕ Fechar                   │
│                            │
│ Olá, João 👋               │
│ Vendedor - Loja Centro     │
│                            │
│ ────────────────────       │
│                            │
│ 📊 Dashboard               │
│ 🎯 Metas do Dia            │
│ 📝 Lançar Resultado        │
│ 🏆 Ranking                 │
│ 🎮 Campanhas               │
│ 📈 Histórico               │
│ 👤 Perfil                  │
│                            │
│ ────────────────────       │
│                            │
│ 🚪 Sair                    │
└────────────────────────────┘
```

---

# Capítulo 17 — Fluxo: Campanha em Andamento

```
[Campanha ativa]
  │
  ▼
[A cada resultado lançado]
  │
  ▼
[Sistema recalcula pontuação da campanha]
  │
  ▼
[Atualiza ranking da campanha]
  │
  ▼
[Verifica regras de premiação automática]
  │
  ├──── Atingiu condição ──▶ [Concede prêmio automaticamente]
  │                                  │
  │                                  ▼
  │                             [Notifica vendedor]
  │                                  │
  │                                  ▼
  │                             [Registra auditoria]
  │
  ▼
[Data fim da campanha?]
  │
  ├──── não ──▶ [Continua acompanhando]
  │
  └──── sim ──▶ [Finaliza campanha]
                     │
                     ▼
                [Calcula vencedores finais]
                     │
                     ▼
                [Atribui premiações finais]
                     │
                     ▼
                [Gera relatório automático]
                     │
                     ▼
                [Envia para gerente]
                     │
                     ▼
                [Status: ended]
                     │
                     ▼
                [Notifica participantes]
  │
  ▼
FIM
```

---

# Capítulo 18 — Mapa de Telas v1.0

| Tela | Rota | Ator |
|------|------|------|
| Login | `/login` | Todos |
| Esqueci Senha | `/forgot-password` | Todos |
| Reset Senha | `/reset-password` | Todos |
| Setup Wizard | `/setup` | Admin Master |
| Dashboard Vendedor | `/dashboard` | Vendedor |
| Metas do Dia | `/metas` | Vendedor |
| Lançar Resultado | `/resultados/novo` | Vendedor |
| Ranking | `/ranking` | Vendedor/Supervisor |
| Campanhas | `/campanhas` | Vendedor |
| Histórico | `/historico` | Vendedor |
| Perfil | `/perfil` | Todos |
| Dashboard Gerente | `/admin/dashboard` | Gerente+ |
| Metas (gestão) | `/admin/metas` | Gerente+ |
| Equipe | `/admin/equipe` | Gerente+ |
| Campanhas (gestão) | `/admin/campanhas` | Gerente+ |
| Relatórios | `/admin/relatorios` | Gerente+ |
| IA Insights | `/admin/ia` | Gerente+ |
| Empresas | `/admin/empresas` | Admin Empresa |
| Filiais | `/admin/filiais` | Admin Empresa |
| Usuários | `/admin/usuarios` | Admin Empresa |
| Indicadores | `/admin/indicadores` | Admin Empresa |
| Configurações | `/admin/config` | Admin Empresa |
| Auditoria | `/admin/auditoria` | Admin Master |
| Licença | `/admin/licenca` | Admin Master |
| Backup | `/admin/backup` | Admin Master |
| Atualizações | `/admin/atualizacoes` | Admin Master |
| Módulos | `/admin/modulos` | Admin Master |

---

# Capítulo 19 — Dashboard do Diretor (Executivo Consolidado)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Diretoria | Grupo São João              [🔔12] [👤Carlos Diretor▼] │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ DIRETOR  │  Dashboard Executivo                          [📅 Ago/2025 ▼]  │
│          │  ────────────────────────────────────────────────────────────  │
│ ▸ Exec   │                                                                │
│ ▸ Grupos │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│ ▸ Regiões│  │ FATURAM. │ │  METAS   │ │ MARGEM   │ │ CRESCIM. │ │ NPS    │ │
│ ▸ Equipe │  │ R$4.8M   │ │  92%     │ │  28%     │ │ +14% a.a │ │  74    │ │
│ ▸ Campanh│  │ 89% meta │ │ 138 metas│ │  ±3% a.a │ │  vs 2024 │ │  +6 p.p│ │
│ ▸ IA     │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│          │                                                                │
│ ▸ Relat  │  ┌────────────────────────────────────┐  ┌─────────────────────┐ │
│ ▸ Config │  │ EVOLUÇÃO CONSOLIDADA (12 meses)    │  │ TOP 5 REGIONAIS     │ │
│ ▸ Audit  │  │                                    │  │                     │ │
│          │  │  📈                                │  │ 1. Sul    R$1.4M 95%│ │
│ Sair     │  │       /\    /\                     │  │ 2. SP     R$1.1M 88%│ │
│          │  │      /  \  /  \    /\              │  │ 3. NE     R$0.8M 78%│ │
│          │  │  ___/    \/    \__/  \___          │  │ 4. CO     R$0.7M 91%│ │
│          │  │ /                       \          │  │ 5. Norte  R$0.4M 65%│ │
│          │  │ Set Out Nov Dez Jan Fev Mar...     │  │                     │ │
│          │  └────────────────────────────────────┘  └─────────────────────┘ │
│          │                                                                │
│          │  ┌────────────────────────────────────────────────────────────┐ │
│          │  │ DESEMPENHO POR FILIAL                                      │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ Filial           │ Faturamento │ Meta │ %  │ Tendência     │ │
│          │  ├────────────────────────────────────────────────────────────┤ │
│          │  │ Loja Centro      │  R$ 580.000 │ 550K │105%│ ▲ +6%         │ │
│          │  │ Loja Zona Sul    │  R$ 420.000 │ 450K │ 93%│ ▼ -2%         │ │
│          │  │ Loja Shopping    │  R$ 380.000 │ 350K │108%│ ▲ +9%         │ │
│          │  │ Loja Norte       │  R$ 280.000 │ 300K │ 93%│ →  0%         │ │
│          │  │ Loja Praia       │  R$ 220.000 │ 250K │ 88%│ ▼ -3%         │ │
│          │  │ Loja Centro-Oeste│  R$ 190.000 │ 200K │ 95%│ ▲ +1%         │ │
│          │  │ + 6 filiais...                                          [Ver todas →] │ │
│          │  └────────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌─────────────────────────────────┐  ┌────────────────────────┐ │
│          │  │ ALERTAS DA DIRETORIA (5)        │  │ METAS CORPORATIVAS     │ │
│          │  │ ───────────────────────────     │  │ (Aprovar/Revisar)      │ │
│          │  │ ⚠️ Loja Praia - 12% abaixo meta │  │ ─────────────────────  │ │
│          │  │ ⚠️ 3 filiais sem lançar hoje    │  │ Q3 2025 - Faturamento  │ │
│          │  │ ℹ️ Campanha Black Friday em 22d │  │   Status: Aguarda dir. │ │
│          │  │ ⚠️ Margem NE caiu 5 p.p.        │  │   [Ver detalhes →]     │ │
│          │  │ ℹ️ Nova filial em homologação   │  │                        │ │
│          │  └─────────────────────────────────┘  └────────────────────────┘ │
└──────────┴────────────────────────────────────────────────────────────────┘
```

### Elementos
- **KPIs executivos:** 5 cards com visão consolidada de todo o grupo (faturamento, metas atingidas, margem, crescimento YoY, NPS)
- **Gráfico de evolução:** 12 meses com comparativo ano anterior (linha tracejada)
- **Top 5 regionais:** ranking por região com % de meta atingida
- **Tabela de filiais:** faturamento, meta, % atingido, tendência (setas), scrollável com 12+ filiais
- **Alertas:** automáticos da IA, destacando desvios, riscos e eventos próximos
- **Metas corporativas:** pendências que precisam de aprovação do diretor

### Permissões
- **Diretor:** vê tudo do grupo, aprova metas corporativas
- **Admin Empresa:** vê tudo mas não aprova metas corporativas
- **Admin Master:** vê cross-empresa (multi-grupo)

---

# Capítulo 20 — Dashboard do Supervisor (Grupo)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion | Grupo Sul - Farmácia São João         [🔔8] [👤Paulo Supervisor▼]│
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ SUPERV.  │  Dashboard Supervisor - Grupo Sul          [📅 Hoje, 15 Ago]   │
│          │  ────────────────────────────────────────────────────────────  │
│ ▸ Dash   │                                                                │
│ ▸ Equipe │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│ ▸ Metas  │  │ FATURAM. │ │ VENDEDORES│ │ RANKING  │ │ APROVAÇ. │           │
│ ▸ Camp   │  │ R$1.2M   │ │  18 ativos│ │  Grupo   │ │  4 pend. │           │
│ ▸ Result.│  │ 96% meta │ │  2 inativos│ │  #2 / 5  │ │  [Ver →] │           │
│ ▸ Visitas│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│          │                                                                │
│ ▸ Visitas│  ┌────────────────────────────────────┐  ┌─────────────────────┐ │
│ ▸ Relat  │  │ RANKING DAS FILIAIS DO GRUPO       │  │ RANKING VENDEDORES  │ │
│ ▸ Perfil │  │ (3 filiais)                        │  │ (meu grupo)         │ │
│          │  │ ─────────────────────────────      │  │ ─────────────────── │ │
│ Sair     │  │ 1. 🥇 Loja Centro    105%          │  │ 1. 🥇 Maria     138%│ │
│          │  │ 2. 🥈 Loja Sul        93%          │  │ 2. 🥈 João      125%│ │
│          │  │ 3. 🥉 Loja Norte      88%          │  │ 3. 🥉 José      118%│ │
│          │  │                                    │  │ 4. Ana          95%│ │
│          │  │ Tendência semanal: ▲ +4%           │  │ 5. Pedro        80%│ │
│          │  └────────────────────────────────────┘  └─────────────────────┘ │
│          │                                                                │
│          │  ┌────────────────────────────────────────────────────────────┐ │
│          │  │ VISITAS AGENDADAS (Esta Semana)                            │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ Seg 18/08  09:00  Loja Centro   - Reunião 1:1 c/ gerente  │ │
│          │  │ Seg 18/08  14:00  Loja Sul      - Auditoria de estoque    │ │
│          │  │ Ter 19/08  10:00  Loja Norte    - Treino equipe nova      │ │
│          │  │ Qua 20/08  08:30  Loja Centro   - Reunião resultados      │ │
│          │  │ [+ Agendar visita]                                         │ │
│          │  └────────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌────────────────────────────────────────────────────────────┐ │
│          │  │ AÇÕES RÁPIDAS                                              │ │
│          │  │ [📊 Relatório de Grupo] [🎯 Lançar Meta de Equipe]         │ │
│          │  │ [🎮 Iniciar Campanha de Grupo] [📋 Check-list de Visita]   │ │
│          │  └────────────────────────────────────────────────────────────┘ │
└──────────┴────────────────────────────────────────────────────────────────┘
```

### Elementos
- **Visão de grupo:** supervisor gerencia 2-5 filiais de uma regional
- **KPIs do grupo:** faturamento agregado, vendedores ativos, posição no ranking de grupos, aprovações pendentes
- **Ranking duplo:** filiais do grupo + vendedores do grupo
- **Visitas:** agenda semanal com 1:1, auditorias e treinamentos
- **Ações rápidas:** relatório, meta de equipe, campanha, check-list

### Diferenças vs Gerente
- Gerente vê 1 filial; Supervisor vê múltiplas
- Supervisor pode criar campanhas restritas ao grupo
- Supervisor tem check-list de visita (gerente não)

---

# Capítulo 21 — Lista de Usuários (Admin)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Admin▼]   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Usuários                       [+ Novo Usuário] [Importar CSV]│
│          │  ────────────────────────────────────────────────────────────  │
│ ▸ Dash   │                                                                │
│ ▸ Metas  │  [🔍 Buscar por nome, e-mail, matrícula...]                    │
│ ▸ Equipe │                                                                │
│ ▸ Usuár. │  Filtros:                                                      │
│ ▸ Cargos │  Cargo: [Todos ▼]  Filial: [Todas ▼]  Status: [Ativos ▼]      │
│ ▸ Filiais│  Perfil: [Todos ▼]  Último acesso: [30 dias ▼]                │
│ ▸ Indic. │                                                                │
│ ▸ Camp   │  [✓] Marcar todos    [Exportar] [Ativar] [Desativar] [Excluir]│
│ ▸ Config │                                                                │
│ ▸ Audit  │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ ☐ │ Nome            │ Cargo     │ Filial    │ Status │ Acess│ │
│ ▸ Sair   │  ├───┼─────────────────┼───────────┼───────────┼────────┼─────┤ │
│          │  │ ☐ │ Maria Admin     │ Admin Emp │ Matriz    │ ●Ativo │ 2h  │ │
│          │  │ ☐ │ João Silva      │ Vendedor  │ Centro    │ ●Ativo │ 5m  │ │
│          │  │ ☐ │ Maria Souza     │ Vendedor  │ Centro    │ ●Ativo │ 1h  │ │
│          │  │ ☐ │ José Pereira    │ Vendedor  │ Sul       │ ●Ativo │ 30m │ │
│          │  │ ☐ │ Ana Costa       │ Supervisor│ Norte     │ ●Ativo │ 1h  │ │
│          │  │ ☐ │ Pedro Lima      │ Vendedor  │ Centro    │ ●Ativo │ 2h  │ │
│          │  │ ☐ │ Carla Dias      │ Vendedor  │ Sul       │ ⚠Inat. │ 15d │ │
│          │  │ ☐ │ Carlos Diretor  │ Diretor   │ Matriz    │ ●Ativo │ 1d  │ │
│          │  │ ☐ │ Paulo Supervisor│ Supervisor │ Centro   │ ●Ativo │ 3h  │ │
│          │  │ ☐ │ Renata Vended.  │ Vendedor  │ Norte     │ ●Ativo │ 4h  │ │
│          │  │                                                              │ │
│          │  │ Mostrando 1-10 de 47         [Anterior] [1] [2] [3] [4] [5] │ │
│          │  └──────────────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Busca textual:** nome, e-mail ou matrícula
- **Filtros combináveis:** cargo, filial, status, perfil, último acesso
- **Ações em lote:** marcar todos, exportar, ativar/desativar/excluir
- **Indicadores:** bolinha colorida de status (verde=ativo, amarelo=inativo recente, vermelho=bloqueado)
- **Tempo desde último acesso:** relativo (5m, 1h, 15d)
- **Paginação:** 10/25/50/100 por página

### Ações por Linha
- Clique no nome → abre formulário de edição
- Botão ⋮ (menu) → Opções: [Editar] [Resetar Senha] [2FA] [Suspender] [Ver Sessões] [Excluir]

---

# Capítulo 22 — Formulário de Usuário (Criar/Editar)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Admin▼]   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  ← Voltar    Usuários > Novo Usuário                           │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ DADOS PESSOAIS                                          │ │
│          │  │                                                          │ │
│          │  │ Foto:  ┌──────┐   Nome completo *                        │ │
│          │  │        │      │   ┌────────────────────────────────────┐ │ │
│          │  │        │  👤  │   │ João Silva                         │ │ │
│          │  │        │      │   └────────────────────────────────────┘ │ │
│          │  │        └──────┘   [Enviar foto]                          │ │
│          │  │                                                          │ │
│          │  │ CPF *                      RG                            │ │
│          │  │ ┌──────────────┐          ┌──────────────┐               │ │
│          │  │ │123.456.789-00│          │ 12.345.678-9 │               │ │
│          │  │ └──────────────┘          └──────────────┘               │ │
│          │  │                                                          │ │
│          │  │ Data Nascimento           Telefone                       │ │
│          │  │ ┌──────────────┐          ┌──────────────┐               │ │
│          │  │ │ 15/03/1990   │          │(11)98765-4321│               │ │
│          │  │ └──────────────┘          └──────────────┘               │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ DADOS PROFISSIONAIS                                    │ │
│          │  │                                                          │ │
│          │  │ Matrícula *            Cargo *                          │ │
│          │  │ ┌──────────────┐       ┌──────────────────────┐         │ │
│          │  │ │ FSJ-00125    │       │ Vendedor ▼            │         │ │
│          │  │ └──────────────┘       └──────────────────────┘         │ │
│          │  │                                                          │ │
│          │  │ Filial *               Equipe                            │ │
│          │  │ ┌──────────────┐       ┌──────────────────────┐         │ │
│          │  │ │ Centro ▼     │       │ Vendas Centro ▼       │         │ │
│          │  │ └──────────────┘       └──────────────────────┘         │ │
│          │  │                                                          │ │
│          │  │ Data Admissão           Supervisor Direto                │ │
│          │  │ ┌──────────────┐       ┌──────────────────────┐         │ │
│          │  │ │ 01/01/2023   │       │ Paulo Supervisor ▼    │         │ │
│          │  │ └──────────────┘       └──────────────────────┘         │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ ACESSO                                                   │ │
│          │  │                                                          │ │
│          │  │ E-mail *                Confirmar E-mail *              │ │
│          │  │ ┌──────────────────┐    ┌──────────────────┐            │ │
│          │  │ │joao@farmacia.com │    │joao@farmacia.com │            │ │
│          │  │ └──────────────────┘    └──────────────────┘            │ │
│          │  │                                                          │ │
│          │  │ Senha Inicial           Confirmar Senha                 │ │
│          │  │ ┌──────────────────┐    ┌──────────────────┐            │ │
│          │  │ │ ••••••••••        │    │ ••••••••••        │            │ │
│          │  │ └──────────────────┘    └──────────────────┘            │ │
│          │  │ ☐ Forçar troca de senha no primeiro acesso              │ │
│          │  │ ☐ Exigir 2FA (TOTP)                                     │ │
│          │  │                                                          │ │
│          │  │ Permissões especiais:                                    │ │
│          │  │ [✓] Lançar resultados próprios                           │ │
│          │  │ [ ] Aprovar resultados de outros                         │ │
│          │  │ [ ] Editar metas                                        │ │
│          │  │ [ ] Visualizar faturamento da filial                     │ │
│          │  │ [ ] Exportar relatórios                                  │ │
│          │  │ [Ver matriz completa →]                                 │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │           [Cancelar]                    [Salvar Usuário]      │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Foto:** opcional, aceita JPG/PNG até 2MB, corta automaticamente
- **CPF:** validado, único por empresa
- **Cargo:** combo, muda permissões padrão ao selecionar
- **Matrícula:** gerada automaticamente (sugestão), editável
- **Senha:** força política (8+, maiúscula, número, especial), medidor de força
- **Forçar troca:** obrigatório para senhas geradas pelo admin
- **2FA:** checkbox habilita exigência de TOTP no próximo login

### Validações
- CPF único por empresa
- E-mail único global
- Matrícula única por empresa
- Cargo e filial obrigatórios

---

# Capítulo 23 — Lista de Cargos e Permissões (Matriz Visual)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Admin▼]   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Cargos e Permissões                  [+ Novo Cargo] [Clonar]  │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ CARGOS CADASTRADOS                                       │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ Nome              │ Usuários │ Descrição           │ Ações│ │
│          │  ├────────────────────────────────────────────────────────────┤ │
│          │  │ Admin Master      │    1     │ Acesso total         │ ⋮   │ │
│          │  │ Admin Empresa     │    2     │ Gestão empresa       │ ⋮   │ │
│          │  │ Diretor           │    1     │ Visão corporativa    │ ⋮   │ │
│          │  │ Supervisor        │    4     │ Multi-filial grupo   │ ⋮   │ │
│          │  │ Gerente           │   12     │ Uma filial           │ ⋮   │ │
│          │  │ Vendedor          │   47     │ Lança resultados     │ ⋮   │ │
│          │  │ Vendedor Sênior   │    8     │ + treina novatos     │ ⋮   │ │
│          │  │ Caixa             │    3     │ Lança só vendas      │ ⋮   │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ MATRIZ DE PERMISSÕES — Cargo: Vendedor (47 usuários)     │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ Módulo / Ação           │ Ver │ Criar │ Editar │ Excluir  │ │
│          │  ├────────────────────────────────────────────────────────────┤ │
│          │  │ Dashboard (próprio)     │  ✓  │   -   │   -    │    -     │ │
│          │  │ Resultados (próprios)   │  ✓  │   ✓   │   ✓    │    -     │ │
│          │  │ Resultados (outros)     │  -  │   -   │   -    │    -     │ │
│          │  │ Metas (próprias)        │  ✓  │   -   │   -    │    -     │ │
│          │  │ Metas (da equipe)       │  -  │   -   │   -    │    -     │ │
│          │  │ Ranking (próprio nível) │  ✓  │   -   │   -    │    -     │ │
│          │  │ Campanhas (participar)  │  ✓  │   -   │   -    │    -     │ │
│          │  │ Campanhas (criar)       │  -  │   -   │   -    │    -     │ │
│          │  │ Equipe                  │  -  │   -   │   -    │    -     │ │
│          │  │ Filiais                 │  -  │   -   │   -    │    -     │ │
│          │  │ Indicadores             │  ✓  │   -   │   -    │    -     │ │
│          │  │ Usuários                │  -  │   -   │   -    │    -     │ │
│          │  │ Relatórios (próprios)   │  ✓  │   ✓   │   -    │    -     │ │
│          │  │ Auditoria               │  -  │   -   │   -    │    -     │ │
│          │  │ Configurações           │  -  │   -   │   -    │    -     │ │
│          │  │                                                            │ │
│          │  │ Permissões especiais:                                      │ │
│          │  │ [ ] Aprovar resultados                                     │ │
│          │  │ [ ] Exportar dados                                         │ │
│          │  │ [ ] Visualizar faturamento filial                          │ │
│          │  │ [✓] Receber notificações                                   │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │           [Cancelar]              [Salvar Permissões]          │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Lista de cargos:** nome, contagem de usuários, descrição, ações
- **Ações por cargo:** editar, clonar, excluir (se sem usuários), ver usuários
- **Matriz CRUD:** por módulo, com checkboxes ou traços (-) indicando não-aplicável
- **Permissões especiais:** fora do padrão CRUD (aprovar, exportar, etc.)
- **Botão "Clonar":** duplica um cargo como ponto de partida

### Regras
- **Cargos sistema:** Admin Master, Vendedor não podem ser excluídos
- **Herança:** Supervisor herda de Gerente, Diretor herda de Supervisor
- **Permissão de usuário:** pode sobrescrever cargo individualmente

---

# Capítulo 24 — Lista de Indicadores (com categorias)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Admin▼]   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Indicadores                  [+ Novo Indicador] [Templates]   │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  [🔍 Buscar...]                                                │
│          │                                                                │
│          │  Categorias:                                                   │
│          │  [ Todos (18) ] [ Vendas (8) ] [ Estoque (3) ] [ Clientes (4) ]│
│          │  [ Financeiro (3) ]                                            │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ VENDAS                                                   │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │ │
│          │  │ │ 💰       │ │ 👥       │ │ 🛒       │ │ 📊       │      │ │
│          │  │ │Faturamento│ │ Clientes │ │Conv. Vend.│ │ TKM      │      │ │
│          │  │ │ R$       │ │ inteiro  │ │ %        │ │ R$       │      │ │
│          │  │ │ 2 casas  │ │ 0 casas  │ │ 1 casa   │ │ 2 casas  │      │ │
│          │  │ │ Peso: 2.0│ │ Peso: 1.0│ │ Peso: 0.5│ │ Peso: 1.5│      │ │
│          │  │ │ ●Ativo   │ │ ●Ativo   │ │ ●Ativo   │ │ ●Ativo   │      │ │
│          │  │ │ [⋮]      │ │ [⋮]      │ │ [⋮]      │ │ [⋮]      │      │ │
│          │  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │ │
│          │  │                                                              │ │
│          │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │ │
│          │  │ │ 📱       │ │ 💳       │ │ 🔄       │ │ 📦       │      │ │
│          │  │ │V. Online │ │ Cartões  │ │Devoluções│ │Itens/Venda│     │ │
│          │  │ │ R$       │ │ %        │ │ qtd      │ │ inteiro  │      │ │
│          │  │ │ 2 casas  │ │ 1 casa   │ │ 0 casas  │ │ 0 casas  │      │ │
│          │  │ │ Peso: 0.8│ │ Peso: 0.3│ │ Peso: 0.4│ │ Peso: 0.6│      │ │
│          │  │ │ ●Ativo   │ │ ●Ativo   │ │ ○Inativo │ │ ●Ativo   │      │ │
│          │  │ │ [⋮]      │ │ [⋮]      │ │ [⋮]      │ │ [⋮]      │      │ │
│          │  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ ESTOQUE                                                  │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │ │
│          │  │ │ 📦       │ │ ⚠️       │ │ 🔄       │                   │ │
│          │  │ │Giro Est. │ │ Rupturas │ │ Cobertura│                   │ │
│          │  │ │ %        │ │ qtd      │ │ dias     │                   │ │
│          │  │ │ ●Ativo   │ │ ○Inativo │ │ ●Ativo   │                   │ │
│          │  │ └──────────┘ └──────────┘ └──────────┘                   │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ CLIENTES                                                 │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │ │
│          │  │ │ 🆕       │ │ 🔁       │ │ 💎       │ │ 😊       │      │ │
│          │  │ │Novos Cli.│ │Recorrentes│ │VIPs     │ │NPS        │      │ │
│          │  │ │ qtd      │ │ %        │ │ qtd      │ │ escala   │      │ │
│          │  │ │ ●Ativo   │ │ ●Ativo   │ │ ●Ativo   │ │ ●Ativo   │      │ │
│          │  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │ │
│          │  └──────────────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Categorias com contador:** botões filtram por categoria
- **Cards de indicador:** ícone, nome, tipo (R$/%/qtd), casas decimais, peso no ranking, status ativo/inativo
- **Ações por card (⋮):** editar, duplicar, arquivar, ver histórico de uso, excluir
- **Templates:** biblioteca de indicadores por segmento (Farmácia, Supermercado, etc.)

### Regras
- Indicador em uso em campanha/metá não pode ser excluído
- Peso no ranking afeta cálculo consolidado
- Inativo fica invisível para vendedor mas mantém histórico

---

# Capítulo 25 — Lista de Filiais

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Admin▼]   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Filiais                            [+ Nova Filial] [Importar]│
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  [🔍 Buscar filial...]    Região: [Todas ▼]  Status: [Todas ▼]│
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ Nome           │ Cidade/UF   │ Vendedores │ Status │ % Meta│ │
│          │  ├────────────────────────────────────────────────────────────┤ │
│          │  │ Loja Centro    │ São Paulo/SP│   8        │ ●Ativa │ 105%  │ │
│          │  │ Loja Zona Sul  │ São Paulo/SP│   6        │ ●Ativa │  93%  │ │
│          │  │ Loja Shopping  │ São Paulo/SP│   5        │ ●Ativa │ 108%  │ │
│          │  │ Loja Norte     │ Guarulhos/SP│   4        │ ●Ativa │  93%  │ │
│          │  │ Loja Praia     │ Santos/SP   │   4        │ ●Ativa │  88%  │ │
│          │  │ Loja CO        │ Campinas/SP │   5        │ ●Ativa │  95%  │ │
│          │  │ Loja ABC       │ Santo André │   4        │ ●Ativa │ 102%  │ │
│          │  │ Loja Osasco    │ Osasco/SP   │   4        │ ●Ativa │  85%  │ │
│          │  │ Loja Pinheiros │ São Paulo/SP│   3        │ ⚠Homol.│   -   │ │
│          │  │ Loja Mooca     │ São Paulo/SP│   0        │ ○Inativ│   -   │ │
│          │  │                                                              │ │
│          │  │ Mostrando 1-10 de 12 filiais                                │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ MAPA DE FILIAIS (SP)                                     │ │
│          │  │                                                          │ │
│          │  │        ┌──┐                                              │ │
│          │  │        │CO│ ●Pinheiros (Homolog.)                        │ │
│          │  │   ●Shopping  ●Centro                                    │ │
│          │  │                  ●Sul                                    │ │
│          │  │        ●Mooca      ●ABC                                  │ │
│          │  │                                                          │ │
│          │  │        ●Osasco                                           │ │
│          │  │                                                          │ │
│          │  │   ●Norte (Guarulhos)                                     │ │
│          │  │                                                          │ │
│          │  │                                ●Praia (Santos)           │ │
│          │  └──────────────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Status:** ● Ativa, ⚠ Em homologação, ○ Inativa
- **Mapa:** visualização geográfica opcional (Google Maps embed)
- **% Meta:** agregado do mês corrente de todas as metas
- **Ações por linha:** editar, suspender, arquivar, ver equipe, ver resultados

### Cadastro de Filial (modal)
- Razão social, CNPJ (filial), endereço, CEP, telefone
- Coordenadas geográficas (auto a partir do CEP)
- Gerente responsável, supervisor de grupo
- Configurações locais: fuso horário, moeda, idioma

---

# Capítulo 26 — Lista de Campanhas (com Abas)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Gerente▼] │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Campanhas                              [+ Nova Campanha]      │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  ┌──── ATIVAS (3) ────┐ ┌── PRÓXIMAS (2) ──┐ ┌── ENCERRADAS (12)──┐
│          │  │                    │ │                  │ │                    │
│          │  └────────────────────┘ └──────────────────┘ └────────────────────┘
│          │                                                                │
│          │  [🔍 Buscar...]    Indicador: [Todos ▼]   Período: [Todos ▼]   │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ CAMPO SETE DIAS                                            │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │  ⭐ Status: ATIVA    Período: 08/08 - 18/08 (faltam 3 dias)│ │
│          │  │  Indicadores: Faturamento (peso 2) + Clientes (peso 1)    │ │
│          │  │  Participantes: 18 vendedores (2 filiais)                  │ │
│          │  │  Premiação: 🥇 R$500  🥈 R$300  🥉 R$150                   │ │
│          │  │  Progresso geral: 78% da meta global                       │ │
│          │  │  [Ver Detalhes →] [Editar] [Pausar] [Encerrar]             │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ MEGA META Q3                                                │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │  ⭐ Status: ATIVA    Período: 01/07 - 30/09 (faltam 46 dias)│ │
│          │  │  Indicadores: Faturamento + Margem                          │ │
│          │  │  Participantes: 47 vendedores (todas as filiais)            │ │
│          │  │  Premiação: 🥉 Troféu + 1 dia off + Pontos (1000)           │ │
│          │  │  Progresso geral: 65% da meta global                        │ │
│          │  │  [Ver Detalhes →] [Editar] [Pausar] [Encerrar]             │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ DESAFIO SEMANAL - VENDAS ONLINE                            │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │  ⭐ Status: ATIVA    Período: 11/08 - 17/08 (último dia!)   │ │
│          │  │  Indicador: Vendas Online                                  │ │
│          │  │  Participantes: 12 vendedores                               │ │
│          │  │  Premiação: 🥇 Bonificação R$200                            │ │
│          │  │  Progresso geral: 92%                                       │ │
│          │  │  [Ver Detalhes →] [Editar] [Pausar] [Encerrar]             │ │
│          │  └──────────────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Abas:** Ativas, Próximas (agendadas), Encerradas
- **Cards de campanha:** nome, status, período com contador regressivo, indicadores/pesos, participantes, premiação, progresso
- **Ações:** ver detalhes, editar, pausar (ativa), encerrar (ativa), duplicar (encerrada), excluir (encerrada + sem resultados)

### Filtros
- Busca textual
- Indicador
- Período (mês corrente, custom)
- Tipo de premiação
- Escopo (filial, grupo, corporativo)

---

# Capítulo 27 — Detalhe de Campanha (com Ranking)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Gerente▼] │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  ← Voltar    Campanhas > Campo Sete Dias                       │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ ⭐ CAMPO SETE DIAS                                        │ │
│          │  │ Status: ●ATIVA   Período: 08/08 - 18/08 (faltam 3 dias)   │ │
│          │  │                                                            │ │
│          │  │ Objetivo: Estimular vendas de produtos sazonais            │ │
│          │  │ Regras: Faturamento (peso 2) + Clientes novos (peso 1)    │ │
│          │  │                                                            │ │
│          │  │ Premiação:                                                 │ │
│          │  │   🥇 1º lugar: R$500 + Troféu + Destaque no painel TV     │ │
│          │  │   🥈 2º lugar: R$300                                       │ │
│          │  │   🥉 3º lugar: R$150                                       │ │
│          │  │   Bônus: +R$100 se faturamento > 120% meta individual     │ │
│          │  │                                                            │ │
│          │  │ [Editar] [Pausar] [Encerrar] [Duplicar] [Exportar Ranking] │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌────────────────────┐  ┌────────────────────┐  ┌──────────┐ │
│          │  │ PARTICIPANTES      │  │ PROGRESSO GERAL    │  │ DIAS REST│ │
│          │  │      18            │  │ 78%                │  │    3     │ │
│          │  │ de 2 filiais       │  │ ████████░░         │  │ 08/08-18 │ │
│          │  └────────────────────┘  └────────────────────┘  └──────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ RANKING AO VIVO                                           │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ #  │ Vendedor      │ Fat.(R$) │ Clientes │ Pontos │ △      │ │
│          │  ├───┼────────────────┼──────────┼──────────┼────────┼───────┤ │
│          │  │ 1  │ 🥇 Maria S.   │  3.450   │   12     │ 87.0   │ ▲ +2   │ │
│          │  │ 2  │ 🥈 João S.    │  3.200   │   10     │ 78.0   │ ▼ -1   │ │
│          │  │ 3  │ 🥉 José P.    │  2.850   │    8     │ 67.0   │ ▲ +1   │ │
│          │  │ 4  │ Ana C.        │  2.500   │    9     │ 61.0   │ →  0   │ │
│          │  │ 5  │ Pedro L.      │  2.100   │    6     │ 50.0   │ ▼ -2   │ │
│          │  │ 6  │ Carla D.      │  1.900   │    5     │ 43.0   │ ▲ +1   │ │
│          │  │ 7  │ Renata V.     │  1.700   │    4     │ 38.0   │ →  0   │ │
│          │  │ 8  │ Bruno M.      │  1.500   │    3     │ 33.0   │ ▼ -1   │ │
│          │  │ ...                                                        │ │
│          │  │                                                              │ │
│          │  │ Atualizado há 2 minutos                          [Atualizar]│ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ GRÁFICO DE EVOLUÇÃO (Top 5)                              │ │
│          │  │                                                          │ │
│          │  │  Pontos                                                  │ │
│          │  │   90 ┤      ___                                          │ │
│          │  │   80 ┤ ___/   \___                                       │ │
│          │  │   70 ┤/          \___                                    │ │
│          │  │   60 ┤              \___                                 │ │
│          │  │   50 ┤                  \___                              │ │
│          │  │      08 09 10 11 12 13 14 15                             │ │
│          │  │      ─── Maria   ─── João   ─── José                      │ │
│          │  └──────────────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Cabeçalho:** status, período (com contador regressivo), objetivo, regras, premiação
- **Cards de resumo:** participantes, progresso, dias restantes
- **Ranking ao vivo:** posição, vendedor, indicadores, pontos, variação (△)
- **Variação:** ▲ subiu, ▼ desceu, → manteve desde o último cálculo
- **Gráfico de evolução:** top 5 ao longo dos dias da campanha
- **Atualização:** automática a cada 15 minutos ou manual

### Premiações Automáticas
- Ao encerrar, sistema calcula vencedores
- Atribui prêmios e registra auditoria
- Envia notificações (e-mail + in-app + push se PWA)
- Gera relatório PDF automático

---

# Capítulo 28 — Lista de Resultados (com Filtros)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Gerente▼] │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Resultados                              [Exportar CSV] [PDF]  │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  [🔍 Buscar...]                                                │
│          │                                                                │
│          │  Filtros:                                                      │
│          │  Período: [01/08 - 15/08]  Vendedor: [Todos ▼]                 │
│          │  Filial: [Todas ▼]  Indicador: [Todos ▼]  Status: [Todos ▼]    │
│          │  Aprovação: [Todos ▼]                                          │
│          │  [Limpar filtros]                                              │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │Data     │Vendedor   │Indicador   │Valor   │Status│Aprov.│ │
│          │  ├────────────────────────────────────────────────────────────┤ │
│          │  │15/08 Qui│Maria S.   │Faturamento │ R$1.450│ ✓    │ Auto │ │
│          │  │15/08 Qui│Maria S.   │Clientes    │   12   │ ✓    │ Auto │ │
│          │  │15/08 Qui│João S.    │Faturamento │ R$1.250│ ✓    │ Auto │ │
│          │  │15/08 Qui│João S.    │Clientes    │   15   │ ✓    │ Auto │ │
│          │  │15/08 Qui│José P.    │Faturamento │ R$1.800│ ⏳    │ Pend.│ │
│          │  │15/08 Qui│José P.    │Faturamento │ R$1.800│ ✗    │ Reje.│ │
│          │  │15/08 Qui│Ana C.     │Faturamento │ R$2.500│ ✓    │ Apr. │ │
│          │  │15/08 Qui│Pedro L.   │Faturamento │ R$1.100│ ✓    │ Auto │ │
│          │  │14/08 Qua│Maria S.   │Faturamento │ R$1.380│ ✓    │ Auto │ │
│          │  │14/08 Qua│João S.    │Faturamento │ R$1.420│ ✓    │ Auto │ │
│          │  │14/08 Qua│José P.    │Faturamento │ R$1.690│ ✓    │ Apr. │ │
│          │  │14/08 Qua│Ana C.     │Faturamento │ R$1.950│ ✓    │ Auto │ │
│          │  │14/08 Qua│Pedro L.   │Faturamento │ R$1.020│ ✓    │ Auto │ │
│          │  │14/08 Qua│Carla D.   │Faturamento │ R$1.150│ ✓    │ Auto │ │
│          │  │13/08 Ter│Maria S.   │Faturamento │ R$1.420│ ✓    │ Auto │ │
│          │  │...                                                         │ │
│          │  │                                                              │ │
│          │  │ Mostrando 1-15 de 1.247      [Anterior] [1] [2] [3] ... [84]│ │
│          │  └──────────────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Filtros avançados:** período, vendedor, filial, indicador, status, aprovação
- **Status:** ✓ aprovado, ⏳ pendente, ✗ rejeitado, ◐ rascunho
- **Aprovação:** Auto (sem regra de aprovação), Aprovado, Pendente, Rejeitado
- **Ações por linha:** ver detalhes (modal), editar (se próprio ou permissão), excluir (com confirmação)
- **Exportação:** CSV, PDF, Excel

### Atalhos
- Clique na linha → modal de detalhes
- Duplo clique → abre edição
- Clique com direito → menu de ações

---

# Capítulo 29 — Tela de Aprovações Pendentes

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Gerente▼] │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Aprovações Pendentes (7)                                      │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  Abas:  [ Resultados (5) ] [ Metas (2) ] [ Campanhas (0) ]    │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ ⏳ José Pereira - Faturamento - 15/08/2025                │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ Valor: R$ 1.800,00   (Meta: R$ 3.000 - 60%)               │ │
│          │  │ Observação do vendedor: "Venda corporativa grande"        │ │
│          │  │ Motivo de pendência: Valor 30% acima da média histórica   │ │
│          │  │                                                            │ │
│          │  │ 📎 comprovante_venda.pdf (anexo)                          │ │
│          │  │                                                            │ │
│          │  │ Histórico:                                                 │ │
│          │  │  • 15/08 14:30 - Lançado por José                         │ │
│          │  │  • 15/08 14:31 - Sistema marcou como pendente (regra)     │ │
│          │  │                                                            │ │
│          │  │ [Ver detalhes completos →]                                 │ │
│          │  │                                                            │ │
│          │  │ Decisão:                                                   │ │
│          │  │ [✓ Aprovar]  [✗ Rejeitar]  [Pedir Justificativa]          │ │
│          │  │ Comentário (opcional):                                     │ │
│          │  │ ┌────────────────────────────────────────────────────────┐ │ │
│          │  │ │                                                        │ │ │
│          │  │ └────────────────────────────────────────────────────────┘ │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ ⏳ Ana Costa - Clientes Novos - 15/08/2025                 │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ Valor: 25 (Meta: 30 - 83%)                                │ │
│          │  │ Motivo: Excede +50% da média diária                       │ │
│          │  │ [Ver detalhes →] [✓ Aprovar] [✗ Rejeitar]                 │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ AÇÕES EM LOTE                                             │ │
│          │  │ [✓] Selecionar todos                                       │ │
│          │  │ [Aprovar Selecionados (5)] [Rejeitar Selecionados]        │ │
│          │  └──────────────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Abas:** Resultados, Metas, Campanhas — cada uma com contador
- **Card de pendência:** vendedor, indicador, data, valor, % da meta, motivo, observação, anexo, histórico
- **Decisão:** aprovar / rejeitar / pedir justificativa
- **Comentário:** opcional, enviado ao vendedor
- **Ações em lote:** aprovar/rejeitar múltiplos

### Regras de Aprovação
- Resultados com valor > X% acima da média histórica
- Resultados com anexos suspeitos
- Metas com valores discrepantes da filial
- Campanhas com prêmios financeiros acima do limite

---

# Capítulo 30 — Lista de Notificações

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Gerente▼] │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Notificações                  [Marcar todas como lidas]       │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  Abas:  [ Todas (12) ] [ Não lidas (5) ] [ Arquivadas (3) ]   │
│          │                                                                │
│          │  Filtros: Tipo: [Todos ▼]  Prioridade: [Todas ▼]              │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ ● 🔴 ALTA  Campanha termina em 3 dias                     │ │
│          │  │   15/08 14:32  Campanha "Campo Sete Dias"                 │ │
│          │  │   Faltam 3 dias para o encerramento. Progresso: 78%       │ │
│          │  │   [Ver Campanha →] [Adiar Lembrete]                       │ │
│          │  ├──────────────────────────────────────────────────────────┤ │
│          │  │ ● 🟡 MÉDIA  3 resultados pendentes de aprovação           │ │
│          │  │   15/08 14:30  Aprovações                                │ │
│          │  │   José P., Ana C., Pedro L. aguardando revisão            │ │
│          │  │   [Ver Aprovações →]                                      │ │
│          │  ├──────────────────────────────────────────────────────────┤ │
│          │  │ ● 🟡 MÉDIA  Meta corporativa Q3 aguarda aprovação         │ │
│          │  │   15/08 10:15  Diretoria                                 │ │
│          │  │   Solicitada por Maria Gerente em 14/08                   │ │
│          │  │   [Aprovar Meta →] [Ver Detalhes →]                       │ │
│          │  ├──────────────────────────────────────────────────────────┤ │
│          │  │ ● 🔵 BAIXA  João Silva bateu meta de faturamento          │ │
│          │  │   15/08 09:45  Resultados                                │ │
│          │  │   Atingiu 125% da meta de hoje 🎉                         │ │
│          │  │   [Ver Resultado →]                                       │ │
│          │  ├──────────────────────────────────────────────────────────┤ │
│          │  │ ● 🔵 BAIXA  Backup automático concluído                   │ │
│          │  │   15/08 03:00  Sistema                                  │ │
│          │  │   Backup das 03:00 realizado com sucesso (245MB)          │ │
│          │  │   [Ver Backup →]                                          │ │
│          │  ├──────────────────────────────────────────────────────────┤ │
│          │  │ ○ 🟢 INFO  Atualização do sistema disponível              │ │
│          │  │   14/08 18:00  Sistema                                  │ │
│          │  │   Versão 1.4.2 disponível (melhorias e correções)         │ │
│          │  │   [Atualizar Agora →] [Adiar]                             │ │
│          │  ├──────────────────────────────────────────────────────────┤ │
│          │  │ ○ 🟢 INFO  Novo relatório mensal disponível                │ │
│          │  │   14/08 06:00  Relatórios                                │ │
│          │  │   Relatório de Julho/2025 foi gerado automaticamente      │ │
│          │  │   [Baixar PDF →] [Ver Online →]                           │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  Mostrando 1-7 de 12  [Anterior] [1] [2] [Próxima]            │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Abas:** Todas, Não lidas (com badge), Arquivadas
- **Prioridades:** 🔴 Alta (urgente), 🟡 Média, 🔵 Baixa, 🟢 Info
- **Indicador de leitura:** ● não lida, ○ lida
- **Ações por notificação:** ver entidade relacionada, adiar lembrete, arquivar
- **Ações em lote:** marcar como lida, arquivar, excluir

### Tipos de Notificação
- **Sistema:** backup, atualização, erro
- **Resultado:** pendência, aprovação, recorde
- **Meta:** aprovação, atingida, vencendo
- **Campanha:** início, encerramento, premiação
- **Segurança:** login suspeito, 2FA, senha alterada

---

# Capítulo 31 — Perfil do Usuário

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion | Farmácia São João - Loja Centro       [🔔3] [👤João Silva▼]  │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ MENU     │  Meu Perfil                                                    │
│          │  ────────────────────────────────────────────────────────────  │
│ ▸ Dash   │                                                                │
│ ▸ Metas  │  ┌──────────┐  ┌──────────────────────────────────────────┐  │
│ ▸ Result.│  │          │  │ João Silva                                 │  │
│ ▸ Rank   │  │   👤     │  │ Vendedor - Loja Centro                     │  │
│ ▸ Camp   │  │          │  │ Matrícula: FSJ-00125  |  Desde: 01/01/2023 │  │
│ ▸ Hist   │  │          │  │                                            │  │
│ ▸ Perfil │  └──────────┘  │ [Editar Perfil] [Alterar Senha] [2FA]      │  │
│          │                └──────────────────────────────────────────┘  │
│ Sair     │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ ESTATÍSTICAS PESSOAIS                                    │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │ │
│          │  │ │ METAS    │ │ RANKING  │ │ CAMPANHAS│ │ DIAS    │       │ │
│          │  │ │ ATINGID.│ │ MÉDIO    │ │ VENCIDAS │ │ SEQUÊNC.│       │ │
│          │  │ │   187    │ │  #3 / 12 │ │    8     │ │   15    │       │ │
│          │  │ │  82%     │ │  mensal  │ │  🏆       │ │  🔥      │       │ │
│          │  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ CONQUISTAS (12 de 25)                                    │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ 🏆 Primeira Meta  🥇 Top 1 Mensal  💯 100 Meta  🔄 7 dias │ │
│          │  │ ⭐ 1000 Resultados  📈 Bateu 3x seguida  💎 Cliente VIP   │ │
│          │  │ 🔥 15 dias sequência  🎯 Meta Perfeita  ⚡ Velocidade     │ │
│          │  │ 🌟 Estrela do Mês  📊 Analytics Master                   │ │
│          │  │                                                            │ │
│          │  │ Próximas: 🏆 Top 1 Anual (75%)  💎 Cliente Premium (60%) │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ PREFERÊNCIAS                                             │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ Tema:               ( ) Claro  (●) Escuro  ( ) Automático│ │
│          │  │ Idioma:             [Português (BR) ▼]                   │ │
│          │  │ Fuso horário:       [America/Sao_Paulo ▼]                │ │
│          │  │ Notif. push:        [✓] Habilitadas                      │ │
│          │  │ Notif. e-mail:      [✓] Apenas urgentes                  │ │
│          │  │ Som:                [✓] Habilitado (volume 70%)          │ │
│          │  │ Densidade:          ( ) Compacto  (●) Confortável        │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ SESSÕES ATIVAS                                           │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ ● Chrome - Windows  | São Paulo, SP  | Agora              │ │
│          │  │   [Sessão atual]                                          │ │
│          │  │ ● Chrome - Android   | São Paulo, SP  | 2 horas atrás     │ │
│          │  │   [Encerrar]                                              │ │
│          │  │ ● Safari - iPhone    | São Paulo, SP  | 1 dia atrás       │ │
│          │  │   [Encerrar]                                              │ │
│          │  │                                                            │ │
│          │  │ [Encerrar Todas as Outras Sessões]                        │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ ZONA DE PERIGO                                           │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ [Exportar meus dados (LGPD)]                              │ │
│          │  │ [Solicitar exclusão da conta]                             │ │
│          │  └──────────────────────────────────────────────────────────┘ │
└──────────┴────────────────────────────────────────────────────────────────┘
```

### Elementos
- **Avatar:** foto + nome + cargo + filial + matrícula + data admissão
- **Estatísticas:** metas atingidas, ranking médio, campanhas vencidas, dias de sequência
- **Conquistas (badges):** gamificação visual, 25 disponíveis
- **Preferências:** tema, idioma, fuso, notificações, som, densidade
- **Sessões ativas:** lista de dispositivos com opção de encerrar
- **LGPD:** exportar dados pessoais, solicitar exclusão

---

# Capítulo 32 — Configurações de Tema/Identidade

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Admin▼]   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Configurações > Tema e Identidade Visual                      │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ LOGO DA EMPRESA                                          │ │
│          │  │                                                          │ │
│          │  │ ┌──────────┐  Formatos aceitos: PNG, SVG (recomendado)  │ │
│          │  │ │          │  Tamanho máx: 2MB                            │ │
│          │  │ │  LOGO    │  Dimensões: 200x60px (proporção 10:3)        │ │
│          │  │ │  ATUAL   │                                              │ │
│          │  │ │          │  [Enviar nova logo]  [Restaurar padrão]     │ │
│          │  │ └──────────┘                                              │ │
│          │  │                                                            │ │
│          │  │ Logo para fundo escuro (opcional):                         │ │
│          │  │ ┌──────────┐  [Enviar logo clara]                          │ │
│          │  │ │   +      │                                              │ │
│          │  │ └──────────┘                                              │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ PALETA DE CORES                                          │ │
│          │  │                                                          │ │
│          │  │ Tema base: ( ) Padrão Orion  (●) Personalizado           │ │
│          │  │                                                          │ │
│          │  │ Cor primária:        [■ #4F46E5]   [▽]                   │ │
│          │  │ Cor secundária:      [■ #10B981]   [▽]                   │ │
│          │  │ Cor de destaque:     [■ #F59E0B]   [▽]                   │ │
│          │  │ Cor de fundo:        [■ #F9FAFB]   [▽]                   │ │
│          │  │ Cor do texto:        [■ #111827]   [▽]                   │ │
│          │  │ Cor de sucesso:      [■ #22C55E]   [▽]                   │ │
│          │  │ Cor de erro:         [■ #EF4444]   [▽]                   │ │
│          │  │ Cor de aviso:        [■ #F59E0B]   [▽]                   │ │
│          │  │                                                          │ │
│          │  │ ─── PREVIEW ───                                          │ │
│          │  │ ┌────────────────────────────────────────────────────┐   │ │
│          │  │ │ [Botão Primário]  [Botão Secundário]  [Botão Alt] │   │ │
│          │  │ │ ┌──────────────────────────────────────────────┐  │   │ │
│          │  │ │ │ Input de exemplo                             │  │   │ │
│          │  │ │ └──────────────────────────────────────────────┘  │   │ │
│          │  │ │ ● Status  ⚠ Aviso  ✗ Erro                          │   │ │
│          │  │ └────────────────────────────────────────────────────┘   │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ FONTE                                                    │ │
│          │  │                                                          │ │
│          │  │ Família: [Inter ▼]  Padrão: [14px ▼]  Cabeçalho: [18px ▼]│ │
│          │  │ Tamanho título: [24px ▼]                                 │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ IDENTIDADE EM E-MAILS E NOTIFICAÇÕES                    │ │
│          │  │                                                          │ │
│          │  │ Nome remetente:   [Farmácia São João]                    │ │
│          │  │ E-mail remetente: [noreply@farmacia.com.br]              │ │
│          │  │ Assunto prefixo:  [Orion]                                 │ │
│          │  │ Rodapá:           [Farmácia São João - CNPJ 12.345...]    │ │
│          │  │                                                          │ │
│          │  │ [Enviar e-mail de teste]                                 │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │           [Cancelar]                    [Salvar Alterações]   │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Logo:** PNG/SVG, versão clara e escura
- **Paleta:** 8 cores configuráveis com color picker
- **Preview ao vivo:** botões, inputs e indicadores com as cores escolhidas
- **Fonte:** família, 4 tamanhos
- **Identidade de e-mail:** remetente, prefixo de assunto, rodapá

### Aplicação
- Tema aplica-se a: web, PWA, Desktop (Electron), e-mails, relatórios PDF
- Painel TV usa o mesmo tema

---

# Capítulo 33 — Configurações de Notificações

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [☰] Orion Admin | Farmácia São João              [🔔5] [👤Maria Admin▼]   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                                │
│ ADMIN    │  Configurações > Notificações                                  │
│          │  ────────────────────────────────────────────────────────────  │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ CANAIS DE NOTIFICAÇÃO                                    │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ Canal           │ Status   │ Configuração                │ │
│          │  ├────────────────────────────────────────────────────────────┤ │
│          │  │ In-app          │ ●Ativo   │ [Configurar]                │ │
│          │  │ Push (Web)      │ ●Ativo   │ [Configurar]                │ │
│          │  │ E-mail          │ ●Ativo   │ [Configurar SMTP]           │ │
│          │  │ WhatsApp        │ ○Inativo │ [Configurar]                │ │
│          │  │ SMS             │ ○Inativo │ [Configurar]                │ │
│          │  │ Slack           │ ○Inativo │ [Configurar Webhook]        │ │
│          │  │ Teams           │ ○Inativo │ [Configurar Webhook]        │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ MATRIZ DE EVENTOS × CANAIS                              │ │
│          │  │ ─────────────────────────────────────────────────────────  │ │
│          │  │ Evento                          │ In-app │Push│E-mail│Wpp│ │
│          │  ├────────────────────────────────────────────────────────────┤ │
│          │  │ Resultado pendente              │   ✓    │ ✓  │  ✓   │ - │ │
│          │  │ Resultado aprovado              │   ✓    │ -  │  -   │ - │ │
│          │  │ Resultado rejeitado             │   ✓    │ ✓  │  ✓   │ - │ │
│          │  │ Meta diária atingida            │   ✓    │ ✓  │  -   │ - │ │
│          │  │ Meta mensal atingida            │   ✓    │ ✓  │  ✓   │ ✓ │ │
│          │  │ Ranking atualizado              │   ✓    │ -  │  -   │ - │ │
│          │  │ Campanha iniciada              │   ✓    │ ✓  │  ✓   │ ✓ │ │
│          │  │ Campanha encerra em 24h        │   ✓    │ ✓  │  ✓   │ - │ │
│          │  │ Campanha encerrada             │   ✓    │ -  │  ✓   │ - │ │
│          │  │ Premiação recebida             │   ✓    │ ✓  │  ✓   │ ✓ │ │
│          │  │ Nova meta atribuída            │   ✓    │ ✓  │  -   │ - │ │
│          │  │ Backup concluído               │   ✓    │ -  │  -   │ - │ │
│          │  │ Atualização disponível         │   ✓    │ -  │  ✓   │ - │ │
│          │  │ Login suspeito                 │   ✓    │ ✓  │  ✓   │ ✓ │ │
│          │  │ Senha alterada                 │   -    │ -  │  ✓   │ - │ │
│          │  │ 2FA ativado/desativado         │   -    │ -  │  ✓   │ - │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ HORÁRIO DE ENVIO (Quiet Hours)                          │ │
│          │  │                                                          │ │
│          │  │ Não enviar notificações entre:                           │ │
│          │  │ [22:00] e [07:00]                                        │ │
│          │  │                                                          │ │
│          │  │ Dias da semana:                                          │ │
│          │  │ [✓]Seg [✓]Ter [✓]Qua [✓]Qui [✓]Sex [✓]Sáb [✓]Dom       │ │
│          │  │                                                          │ │
│          │  │ ☐ Exceção: notificações de segurança ignoram quiet hours│ │
│          │  │ ☐ Exceção: notificações urgentes ignoram quiet hours    │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │  ┌──────────────────────────────────────────────────────────┐ │
│          │  │ TEMPLATES DE MENSAGEM                                    │ │
│          │  │                                                          │ │
│          │  │ Evento: [Resultado pendente ▼]                            │ │
│          │  │ Canal: [E-mail ▼]                                         │ │
│          │  │                                                          │ │
│          │  │ Assunto:                                                 │ │
│          │  │ ┌──────────────────────────────────────────────────────┐ │ │
│          │  │ │ [Orion] Resultado pendente de aprovação              │ │ │
│          │  │ └──────────────────────────────────────────────────────┘ │ │
│          │  │                                                          │ │
│          │  │ Corpo (Markdown + variáveis):                            │ │
│          │  │ ┌──────────────────────────────────────────────────────┐ │ │
│          │  │ │ Olá {{gerente_nome}},                                │ │ │
│          │  │ │                                                      │ │ │
│          │  │ │ O vendedor {{vendedor_nome}} lançou um resultado    │ │ │
│          │  │ │ que requer sua aprovação:                            │ │ │
│          │  │ │                                                      │ │ │
│          │  │ │ - Indicador: {{indicador_nome}}                      │ │ │
│          │  │ │ - Valor: {{valor}}                                   │ │ │
│          │  │ │ - Data: {{data}}                                     │ │ │
│          │  │ │                                                      │ │ │
│          │  │ │ [Aprovar Agora]  [Ver Detalhes]                      │ │ │
│          │  │ └──────────────────────────────────────────────────────┘ │ │
│          │  │ Variáveis disponíveis: {{vendedor_nome}} {{valor}} ...    │ │
│          │  │ [Restaurar padrão]  [Enviar teste]                       │ │
│          │  └──────────────────────────────────────────────────────────┘ │
│          │                                                                │
│          │           [Cancelar]                    [Salvar Alterações]   │
└──────────┴───────────────────────────────────────────────────────────────┘
```

### Elementos
- **Canais:** in-app, push, e-mail, WhatsApp, SMS, Slack, Teams
- **Matriz eventos × canais:** checkbox por combinação
- **Quiet hours:** horário de silêncio com exceções
- **Templates:** editáveis com variáveis dinâmicas

### Variáveis Disponíveis
- `{{empresa_nome}}`, `{{vendedor_nome}}`, `{{gerente_nome}}`
- `{{indicador_nome}}`, `{{valor}}`, `{{meta}}`, `{{percentual}}`
- `{{data}}`, `{{link_detalhes}}`, `{{link_acao}}`

---

# Capítulo 34 — Painel TV (Smart TV para Exibição Pública)

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                          │
│   [LOGO] Farmácia São João - Loja Centro                          15/08/2025  14:32:15   │
│   ─────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                          │
│   ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────┐   │
│   │                                         │  │                                     │   │
│   │            FATURAMENTO HOJE             │  │          RANKING DO DIA             │   │
│   │                                         │  │                                     │   │
│   │             R$ 12.450                   │  │   🥇  Maria Souza     138%          │   │
│   │                                         │  │   🥈  João Silva      125%          │   │
│   │        ████████████████░░░░             │  │   🥉  José Pereira   118%          │   │
│   │             85% da meta                 │  │       Ana Costa       95%          │   │
│   │                                         │  │       Pedro Lima      80%          │   │
│   │   Faltam: R$ 2.200  |  4h até meta      │  │                                     │   │
│   │                                         │  │                                     │   │
│   └─────────────────────────────────────────┘  └─────────────────────────────────────┘   │
│                                                                                          │
│   ┌─────────────────────────────────────────┐  ┌─────────────────────────────────────┐   │
│   │                                         │  │                                     │   │
│   │            CAMPANHA ATIVA                │  │          PRÓXIMA META              │   │
│   │                                         │  │                                     │   │
│   │      ⭐ CAMPO SETE DIAS                  │  │       Vendendor destaque           │   │
│   │                                         │  │                                     │   │
│   │      Faltam: 3 dias                     │  │       🏆 Maria Souza                │   │
│   │      Progresso: 78%                     │  │                                     │   │
│   │      1º lugar: R$ 500                   │  │       Bateu meta 5x seguidas!       │   │
│   │                                         │  │                                     │   │
│   │      Líder atual: Maria S. (87 pts)     │  │                                     │   │
│   │                                         │  │                                     │   │
│   └─────────────────────────────────────────┘  └─────────────────────────────────────┘   │
│                                                                                          │
│   ┌────────────────────────────────────────────────────────────────────────────────────┐ │
│   │                                                                                  │ │
│   │                              FEED DE VENDAS                                      │ │
│   │   ───────────────────────────────────────────────────────────────────────────    │ │
│   │                                                                                  │ │
│   │   💰 Maria S. acabou de registrar R$ 450 em vendas!            há 2 minutos      │ │
│   │   🎉 João S. bateu meta de hoje!                              há 5 minutos      │ │
│   │   ⭐ José P. atingiu 110% da meta diária                      há 8 minutos      │ │
│   │   💎 Ana C. fechou venda corporativa de R$ 1.200              há 15 minutos     │ │
│   │   🚀 Pedro L. superou média dos últimos 7 dias                há 22 minutos     │ │
│   │                                                                                  │ │
│   └────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                          │
│   ─────────────────────────────────────────────────────────────────────────────────────  │
│   Powered by Orion  |  F11 para tela cheia  |  Configurações: orion.com.br/tv-admin     │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Elementos
- **Header:** logo, filial, data/hora (atualiza a cada segundo)
- **4 quadrantes:** faturamento, ranking, campanha, destaque
- **Feed de vendas:** scroll automático com últimas conquistas
- **Rodapá:** powered by + atalhos
- **Sem login:** URL pública com token (configurável), expira em 24h

### Modos de Exibição
- **Modo Completo:** 4 quadrantes (default)
- **Modo Ranking:** ranking em tela cheia (transições a cada 10s)
- **Modo Campanha:** foco em campanha ativa
- **Modo Slide:** carrossel automático entre dashboards

### Configurações (via admin)
- Filial exibida
- Atualização automática (a cada 30s/1min/5min)
- Volume do som (efeitos sonoros ao bater meta)
- Modo noturno (escurecer fora do horário comercial)
- Tempo de inatividade para screensaver

### Acessos
- `/tv/:token` — URL pública
- `/tv/admin` — gerenciar TVs cadastradas
- Token único por TV, revogável

---

# Capítulo 35 — Tela de Erro 404

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                                                                  │
│                          ╭──────────╮                            │
│                          │          │                            │
│                          │    404   │                            │
│                          │          │                            │
│                          ╰──────────╯                            │
│                                                                  │
│                                                                  │
│                    🤔 Página não encontrada                       │
│                                                                  │
│              A página que você tentou acessar não existe          │
│              ou foi movida para outro endereço.                   │
│                                                                  │
│                                                                  │
│              ┌──────────────────────────────────────┐            │
│              │                                      │            │
│              │       [Voltar ao Dashboard]          │            │
│              │                                      │            │
│              └──────────────────────────────────────┘            │
│                                                                  │
│                                                                  │
│              Links úteis:                                        │
│              • Dashboard                                         │
│              • Metas                                             │
│              • Lançar Resultado                                  │
│              • Suporte                                           │
│                                                                  │
│                                                                  │
│   ─────────────────────────────────────────────────────────────  │
│   Orion v1.4.2  |  Erro ID: err_8f3a2b1c  |  Reportar problema   │
└──────────────────────────────────────────────────────────────────┘
```

### Elementos
- **Código 404:** destaque visual grande
- **Mensagem amigável:** sem jargão técnico
- **CTA principal:** voltar ao dashboard
- **Links úteis:** atalhos para telas comuns
- **Erro ID:** para referência ao suporte
- **Reportar:** link opcional para abrir ticket

### Casos de Uso
- URL incorreta digitada manualmente
- Bookmark desatualizado após mudança de rotas
- Permissão revogada enquanto usuário navegava

---

# Capítulo 36 — Tela de Erro 500

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                                                                  │
│                          ╭──────────╮                            │
│                          │          │                            │
│                          │    500   │                            │
│                          │          │                            │
│                          ╰──────────╯                            │
│                                                                  │
│                                                                  │
│                      😵 Ocorreu um erro                          │
│                                                                  │
│              Algo deu errado no servidor. Nossa equipe            │
│              já foi notificada automaticamente e está             │
│              trabalhando na solução.                              │
│                                                                  │
│                                                                  │
│              ┌──────────────────────────────────────┐            │
│              │                                      │            │
│              │       [Tentar Novamente]             │            │
│              │                                      │            │
│              └──────────────────────────────────────┘            │
│                                                                  │
│                                                                  │
│              O que você pode fazer:                              │
│              • Aguardar 1-2 minutos e tentar novamente           │
│              • Verificar sua conexão com a internet              │
│              • Entrar em contato com o suporte                   │
│                                                                  │
│                                                                  │
│   ─────────────────────────────────────────────────────────────  │
│   Orion v1.4.2                                                   │
│   Erro ID: err_8f3a2b1c_20250815_143215                          │
│   Trace: a4f2c8e1...3b9d   [Copiar]                              │
│   [📋 Reportar problema]  [📞 Contatar Suporte]                  │
└──────────────────────────────────────────────────────────────────┘
```

### Elementos
- **Código 500:** destaque visual
- **Mensagem:** tranquiliza o usuário (equipe notificada)
- **CTA:** tentar novamente
- **Sugestões:** ações que o usuário pode tomar
- **Erro ID + Trace:** para diagnóstico técnico
- **Botão copiar:** facilita envio ao suporte

### Tratamento
- Erro capturado por Sentry/error tracking automaticamente
- Se recorrente, dispara alerta para equipe DevOps
- Após 3 tentativas, sugere limpar cache ou contatar suporte

---

# Capítulo 37 — Tela de Manutenção

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                                                                  │
│                                                                  │
│                          🔧  ⚙️  🛠️                              │
│                                                                  │
│                                                                  │
│                    Manutenção Programada                         │
│                                                                  │
│              Estamos melhorando o Orion para você!                │
│                                                                  │
│              O sistema estará indisponível enquanto              │
│              realizamos manutenção programada.                   │
│                                                                  │
│                                                                  │
│              ⏰ Início: 15/08/2025 23:00                          │
│              ⏳ Fim previsto: 16/08/2025 03:00                    │
│              🔄 Tempo restante: 2h 15min                         │
│                                                                  │
│              ████████████████░░░░░░░░░░░░░░  56% concluído       │
│                                                                  │
│                                                                  │
│              💡 Dica: Durante a manutenção, você pode usar       │
│              o app mobile no modo offline para lançar             │
│              resultados. Eles serão sincronizados quando          │
│              o sistema voltar.                                    │
│                                                                  │
│                                                                  │
│              Status: orionstatus.com.br                          │
│              Acompanhe: @orionstatus no Twitter                  │
│                                                                  │
│                                                                  │
│   ─────────────────────────────────────────────────────────────  │
│   Obrigado pela compreensão!                                     │
│   Equipe Orion                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Elementos
- **Mensagem amigável:** explica o motivo
- **Horários:** início, fim previsto, tempo restante
- **Barra de progresso:** atualiza automaticamente
- **Dica de contingência:** uso do modo offline mobile
- **Links de status:** página externa e Twitter
- **Auto-refresh:** a cada 30 segundos, tenta reconectar

### Implementação
- Modo manutenção ativado via flag no banco
- Página servida por CDN (sobrevive a queda do app)
- Quando concluído, redireciona automaticamente para login

---

# Capítulo 38 — Modal de Confirmação Genérico

```
                           ┌──────────────────────────────────────────────┐
                           │                                              │
                           │   ⚠️  Confirmar Exclusão                     │
                           │   ──────────────────────────────────────     │
                           │                                              │
                           │   Você tem certeza que deseja excluir o      │
                           │   usuário "João Silva"?                      │
                           │                                              │
                           │   Esta ação:                                 │
                           │   • Não pode ser desfeita                    │
                           │   • Removerá acesso imediato ao sistema      │
                           │   • Manterá histórico de resultados          │
                           │   • Arquivará dados pessoais por 90 dias     │
                           │     (conforme política LGPD)                  │
                           │                                              │
                           │   Para confirmar, digite o nome do usuário:  │
                           │   ┌──────────────────────────────────────┐   │
                           │   │                                      │   │
                           │   └──────────────────────────────────────┘   │
                           │                                              │
                           │   [✓] Entendo as consequências               │
                           │                                              │
                           │                                              │
                           │    [Cancelar]              [Excluir]         │
                           │                                              │
                           └──────────────────────────────────────────────┘
                  ──────────────────────────────────────────────────────────
                  (overlay escuro 50% opacidade cobre a tela de fundo)
```

### Variantes
- **Simples:** apenas botões Cancelar / Confirmar
- **Com checkbox:** exige reconhecimento de consequências
- **Com input:** exige digitação de confirmação (excluir, transferir)
- **Destrutivo:** botão vermelho, exige dupla confirmação

### Estados
- **Abrindo:** fade-in do overlay + scale-up do modal (200ms)
- **Aberto:** foco automático no botão de ação principal
- **Fechando:** fade-out + scale-down (150ms)

### Acessibilidade
- ESC fecha o modal
- Tab navega apenas dentro do modal
- Click fora do modal fecha (se allowCloseOutside=true)
- aria-modal="true", role="dialog"

---

# Capítulo 39 — Modal de Loading

```
                           ┌──────────────────────────────────────────┐
                           │                                          │
                           │              ╭──────────╮                 │
                           │              │          │                 │
                           │              │  ◉  ◉  ◉ │                 │
                           │              │          │                 │
                           │              ╰──────────╯                 │
                           │                                          │
                           │           Processando sua solicitação     │
                           │                                          │
                           │           Isso pode levar alguns          │
                           │           segundos. Por favor, aguarde.   │
                           │                                          │
                           │           ───────────────────────         │
                           │           Etapa atual:                    │
                           │           ✓ Validando dados               │
                           │           ✓ Salvando no banco             │
                           │           ◐ Enviando notificações         │
                           │           ○ Recalculando ranking          │
                           │           ○ Atualizando cache             │
                           │                                          │
                           │           Tempo decorrido: 4s             │
                           │                                          │
                           └──────────────────────────────────────────┘
                  ──────────────────────────────────────────────────────────
                  (overlay escuro 70% opacidade, bloqueia interação)
```

### Variantes
- **Simples:** apenas spinner + mensagem
- **Com etapas:** lista de passos com checkmarks
- **Com progresso:** barra de 0 a 100%
- **Indeterminado:** spinner infinito (quando tempo desconhecido)

### Regras
- **Bloqueio:** impede interação com a tela (overlay)
- **Timeout:** após 30s sem resposta, mostra "Parece demorado. Deseja cancelar?"
- **Cancelável:** opcional, botão "Cancelar operação"
- **Auto-close:** fecha automaticamente ao concluir

---

# Capítulo 40 — Toast Notifications

```
TOAST — SUCCESS (verde, canto superior direito)
                                                          ┌────────────────────────────┐
                                                          │ ✓  Sucesso!                │
                                                          │ Resultado salvo com        │
                                                          │ sucesso.                   │
                                                          │                            │
                                                          │ [Ver resultado]  [✕]      │
                                                          └────────────────────────────┘

TOAST — ERROR (vermelho)
                                                          ┌────────────────────────────┐
                                                          │ ✗  Erro                    │
                                                          │ Falha ao salvar resultado. │
                                                          │ Tente novamente.           │
                                                          │                            │
                                                          │ [Tentar novamente]  [✕]   │
                                                          └────────────────────────────┘

TOAST — WARNING (amarelo)
                                                          ┌────────────────────────────┐
                                                          │ ⚠  Atenção                 │
                                                          │ Você tem 3 resultados      │
                                                          │ pendentes de aprovação.    │
                                                          │                            │
                                                          │ [Ver aprovações]  [✕]     │
                                                          └────────────────────────────┘

TOAST — INFO (azul)
                                                          ┌────────────────────────────┐
                                                          │ ℹ  Informação              │
                                                          │ Nova versão disponível.    │
                                                          │ Recarregue para atualizar. │
                                                          │                            │
                                                          │ [Atualizar agora]  [✕]    │
                                                          └────────────────────────────┘

TOAST — INDEFINIDO (loading)
                                                          ┌────────────────────────────┐
                                                          │ ◉  Sincronizando...        │
                                                          │ Enviando resultados        │
                                                          │ pendentes (3 de 5).        │
                                                          │                            │
                                                          │ [✕]                       │
                                                          └────────────────────────────┘
```

### Elementos
- **Ícone:** ✓ (success), ✗ (error), ⚠ (warning), ℹ (info), ◉ (loading)
- **Título:** curto, claro
- **Mensagem:** detalhe opcional
- **Ação:** botão opcional (Ver, Tentar novamente, etc.)
- **Fechar:** botão ✕ sempre presente

### Comportamento
- **Posição:** canto superior direito (configurável)
- **Animação:** slide-in da direita (300ms), fade-out ao fechar (200ms)
- **Duração padrão:** 5s (success/info), 8s (warning), persistente (error/loading)
- **Stack:** múltiplos toasts empilham verticalmente, máx 4 visíveis
- **Hover:** pausa auto-close
- **Click fora:** não fecha (apenas ✕ ou ação)

### Acessibilidade
- aria-live="polite" (success/info/warning)
- aria-live="assertive" (error)
- role="status" (loading)

---

# Capítulo 41 — Empty States

### Empty State — Sem Dados (inicial)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                                                                  │
│                          ┌──────────┐                            │
│                          │          │                            │
│                          │   📭    │                            │
│                          │          │                            │
│                          └──────────┘                            │
│                                                                  │
│                                                                  │
│                    Nenhum resultado encontrado                   │
│                                                                  │
│              Você ainda não lançou nenhum resultado.              │
│              Comece agora registrando o resultado de hoje.        │
│                                                                  │
│                                                                  │
│              ┌──────────────────────────────────────┐            │
│              │                                      │            │
│              │       [Lançar Resultado]             │            │
│              │                                      │            │
│              └──────────────────────────────────────┘            │
│                                                                  │
│              Precisa de ajuda? [Ver tutorial]                    │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Empty State — Sem Resultados de Busca

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                                                                  │
│                          ┌──────────┐                            │
│                          │          │                            │
│                          │   🔍    │                            │
│                          │          │                            │
│                          └──────────┘                            │
│                                                                  │
│                                                                  │
│                    Nenhum resultado para "maria"                  │
│                                                                  │
│              Sua busca por "maria" não retornou resultados.       │
│              Tente refinar seus filtros ou use outras palavras.   │
│                                                                  │
│                                                                  │
│              Sugestões:                                          │
│              • Verifique a ortografia                            │
│              • Use termos mais gerais (ex: "Maria")              │
│              • Remova alguns filtros                             │
│                                                                  │
│                                                                  │
│              [Limpar filtros]    [Buscar novamente]              │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Empty State — Sem Metas Configuradas

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                                                                  │
│                          ┌──────────┐                            │
│                          │          │                            │
│                          │   🎯    │                            │
│                          │          │                            │
│                          └──────────┘                            │
│                                                                  │
│                                                                  │
│                    Nenhuma meta configurada                       │
│                                                                  │
│              Você ainda não definiu metas para seus vendedores.   │
│              Crie a primeira meta para acompanhar o progresso.    │
│                                                                  │
│                                                                  │
│              ┌──────────────────────────────────────┐            │
│              │                                      │            │
│              │       [+ Criar Primeira Meta]        │            │
│              │                                      │            │
│              └──────────────────────────────────────┘            │
│                                                                  │
│              Ou use um modelo:                                   │
│              [📋 Farmácia Padrão]                                │
│              [📋 Supermercado Padrão]                            │
│              [📋 Varejo Geral]                                   │
│                                                                  │
│              [Ver guia de metas →]                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Padrões de Empty State

| Contexto | Ícone | CTA Principal | CTA Secundário |
|----------|-------|---------------|----------------|
| Sem dados | 📭 | Criar primeiro item | Ver tutorial |
| Sem resultados de busca | 🔍 | Limpar filtros | Buscar novamente |
| Sem metas | 🎯 | Criar primeira meta | Templates |
| Sem campanhas | 🎮 | Criar campanha | Ver exemplos |
| Sem notificações | 🔔 | - | Configurar notificações |
| Sem permissão | 🔒 | Solicitar acesso | Contatar admin |
| Erro de conexão | 📡 | Tentar novamente | Modo offline |
| Filial vazia | 🏪 | Cadastrar filial | Importar |

### Estrutura Recomendada
1. **Ícone ilustrativo** (centralizado, 80x80px)
2. **Título** (curto, descritivo)
3. **Descrição** (1-2 linhas, orienta o que fazer)
4. **CTA principal** (botão preenchido)
5. **CTA secundário** (link ou botão outline)

---

# Capítulo 42 — Tela de Instalação PWA

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│                          [LOGO ORION]                            │
│                                                                  │
│                                                                  │
│                  Instale o App no seu dispositivo                │
│                                                                  │
│              Acesso rápido e recursos exclusivos:                │
│              📱 Funciona offline                                 │
│              ⚡ Abre em tela cheia                                │
│              🔔 Notificações push                                │
│              📊 Sincronização automática                         │
│                                                                  │
│                                                                  │
│              ┌──────────────────────────────────────┐            │
│              │                                      │            │
│              │    📲  Instalar Agora                │            │
│              │                                      │            │
│              └──────────────────────────────────────┘            │
│                                                                  │
│              [Agora não, continuar no navegador]                 │
│                                                                  │
│                                                                  │
│   ─────────────────────────────────────────────────────────────  │
│                                                                  │
│   📌 Instruções por navegador:                                   │
│                                                                  │
│   Chrome (Android):                                              │
│   1. Menu (⋮) > Instalar aplicativo                             │
│   2. Ou use o banner acima                                       │
│                                                                  │
│   Safari (iOS):                                                  │
│   1. Botão Compartilhar (□↑)                                     │
│   2. "Adicionar à Tela de Início"                                │
│                                                                  │
│   Edge / Chrome (Desktop):                                       │
│   1. Ícone de instalação (⊕) na barra de endereço               │
│   2. Ou Menu > Instalar este site como aplicativo               │
│                                                                  │
│   ─────────────────────────────────────────────────────────────  │
│                                                                  │
│   Requisitos:                                                    │
│   • Android 8+ / iOS 14+ / Windows 10+ / macOS 11+               │
│   • 50MB de espaço livre                                         │
│   • Conexão com internet para primeira sincronização             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Elementos
- **Logo + identidade:** reafirma marca
- **Benefícios:** 4 destaques do PWA
- **CTA principal:** dispara prompt nativo de instalação
- **CTA secundário:** fecha modal, continua no navegador
- **Instruções por plataforma:** passo a passo manual
- **Requisitos mínimos:** SO, espaço, conectividade

### Trigger
- Exibido após 2ª visita (não enche na 1ª)
- Pode ser disparado manualmente via menu: "Instalar app"
- Se usuário recusar 2x, não mostra mais (configuração persistente)

### Pós-instalação
- Splash screen com logo
- Tutorial rápido (3 telas): dashboard, lançamento, notificações
- Configuração de permissões (notificações, etc.)

---

# Capítulo 43 — Estados de Componentes Críticos

## 43.1 — Botão (todos os estados)

```
BOTÃO — DEFAULT (estado normal)

  ┌──────────────────────────┐
  │  Salvar Resultado        │
  └──────────────────────────┘
  Cor de fundo: primária (#4F46E5)
  Cor do texto: branca
  Padding: 12px 24px
  Border-radius: 8px
  Cursor: pointer

BOTÃO — HOVER (mouse sobre)

  ┌──────────────────────────┐
  │  Salvar Resultado        │  ←  sombra sutil (0 2px 8px rgba(0,0,0,0.15))
  └──────────────────────────┘     fundo 10% mais escuro (#4338CA)
  Transição: 150ms ease-in-out
  Cursor: pointer

BOTÃO — ACTIVE (clicado/segurando)

  ┌──────────────────────────┐
  │  Salvar Resultado        │  ←  fundo 20% mais escuro (#3730A3)
  └──────────────────────────┘     scale(0.98)
  Duração: 100ms

BOTÃO — DISABLED (desabilitado)

  ┌──────────────────────────┐
  │  Salvar Resultado        │  ←  fundo cinza (#9CA3AF)
  └──────────────────────────┘     texto cinza claro
  Opacidade: 60%
  Cursor: not-allowed

BOTÃO — LOADING (processando)

  ┌──────────────────────────┐
  │  ◉  Salvando...          │  ←  spinner gira (1s linear infinite)
  └──────────────────────────┘     botão desabilitado (não clicável)
  Texto muda para "Salvando..."

BOTÃO — FOCUS (foco do teclado)

  ┌─ ─────────────────────── ─┐    ←  outline azul 2px (focus ring)
  │                           │       distância 2px do botão
  │  Salvar Resultado        │
  │                           │
  └─ ─────────────────────── ─┘
  Necessário para acessibilidade (navegação por Tab)

VARIANTES POR COR:

  Primário:     ┌──────────┐  (azul, ação principal)
                │  Salvar  │
                └──────────┘

  Secundário:   ┌──────────┐  (cinza, ação alternativa)
                │  Cancelar│
                └──────────┘

  Destrutivo:   ┌──────────┐  (vermelho, ações irreversíveis)
                │  Excluir │
                └──────────┘

  Sucesso:      ┌──────────┐  (verde, confirmar)
                │ Aprovar  │
                └──────────┘

  Fantasma:     ┌──────────┐  (transparente, ações secundárias)
                │  Voltar  │
                └──────────┘

  Link:         Voltar ao dashboard  (apenas texto, sublinhado no hover)
```

### Regras de Uso
- **Ação principal:** sempre primário
- **Cancelar/Fechar:** sempre secundário
- **Excluir/Remover:** sempre destrutivo, com modal de confirmação
- **Um primário por tela:** não competir por atenção
- **Desabilitado:** quando validação falha ou dados obrigatórios faltam

---

## 43.2 — Input (todos os estados)

```
INPUT — DEFAULT (sem foco)

  E-mail
  ┌──────────────────────────────────────┐
  │                                      │
  └──────────────────────────────────────┘
  Borda: cinza claro (#D1D5DB)
  Fundo: branco
  Texto: cinza escuro (#111827)
  Placeholder: cinza médio (#9CA3AF)
  Padding: 10px 12px

INPUT — FOCUS (clicado/ativo)

  E-mail
  ┌══════════════════════════════════════┐    ←  borda azul 2px (#4F46E5)
  │ joao@farmacia.com|                   │       sombra azul sutil
  └══════════════════════════════════════┘       (0 0 0 3px rgba(79,70,229,0.1))
  Cursor de texto piscando (|)

INPUT — ERROR (validação falhou)

  E-mail
  ┌──────────────────────────────────────┐    ←  borda vermelha 2px
  │ joao@invalid                          │       (#EF4444)
  └──────────────────────────────────────┘
  ⚠ E-mail inválido. Verifique o formato.    ←  mensagem vermelha abaixo

INPUT — DISABLED (desabilitado)

  E-mail
  ┌──────────────────────────────────────┐    ←  fundo cinza claro (#F3F4F6)
  │ joao@farmacia.com                     │       borda cinza claro
  └──────────────────────────────────────┘       texto cinza médio
  Cursor: not-allowed

INPUT — WITH ICON (ícone à esquerda)

  E-mail
  ┌──────────────────────────────────────┐
  │ ✉  joao@farmacia.com                 │    ←  ícone cinza à esquerda
  └──────────────────────────────────────┘       padding-left aumentado

INPUT — WITH ICON (ação à direita)

  Senha
  ┌──────────────────────────────────────┐
  │ ••••••••••              [👁️ Mostrar] │    ←  botão à direita
  └──────────────────────────────────────┘       toggle de visibilidade

INPUT — LOADING (validando em tempo real)

  CPF
  ┌──────────────────────────────────────┐
  │ 123.456.789-00              ◉        │    ←  spinner à direita
  └──────────────────────────────────────┘       validação assíncrona

INPUT — WITH HELPER TEXT (dica abaixo)

  CNPJ
  ┌──────────────────────────────────────┐
  │ 12.345.678/0001-90                   │
  └──────────────────────────────────────┘
  ℹ Digite apenas números, será formatado automaticamente.

INPUT — WITH COUNTER (contador de caracteres)

  Observações
  ┌──────────────────────────────────────┐
  │ Cliente solicitou entrega expressa   │
  │                                      │
  └──────────────────────────────────────┘
  37 / 500 caracteres                              ←  contador à direita

INPUT — READONLY (apenas leitura)

  Matrícula
  ┌──────────────────────────────────────┐    ←  fundo cinza claro
  │ FSJ-00125                             │       sem borda
  └──────────────────────────────────────┘       não editável

INPUT — REQUIRED (campo obrigatório)

  Nome completo *
  ┌──────────────────────────────────────┐
  │                                      │
  └──────────────────────────────────────┘
  (*) indica obrigatório
```

### Regras de Validação
- **On blur:** valida quando perde foco
- **On submit:** valida ao submeter formulário
- **On change:** valida enquanto digita (após primeiro blur)
- **Mensagem:** sempre abaixo do input, vermelha, com ícone ⚠
- **Acessibilidade:** aria-invalid="true" e aria-describedby para mensagem

---

## 43.3 — Tabela (todos os estados)

### Tabela — COM DADOS

```
┌──────────────────────────────────────────────────────────────────┐
│ Nome           │ Cargo     │ Filial   │ Status   │ Ações        │
├──────────────────────────────────────────────────────────────────┤
│ Maria Admin    │ Admin Emp │ Matriz   │ ●Ativo   │ [⋮]          │
│ João Silva     │ Vendedor  │ Centro   │ ●Ativo   │ [⋮]          │
│ Maria Souza    │ Vendedor  │ Centro   │ ●Ativo   │ [⋮]          │
│ José Pereira   │ Vendedor  │ Sul      │ ●Ativo   │ [⋮]          │
│ Ana Costa      │ Supervisor│ Norte    │ ●Ativo   │ [⋮]          │
│ Pedro Lima     │ Vendedor  │ Centro   │ ●Ativo   │ [⋮]          │
│ Carla Dias     │ Vendedor  │ Sul      │ ⚠Inat.   │ [⋮]          │
└──────────────────────────────────────────────────────────────────┘
```

### Tabela — VAZIA (empty state)

```
┌──────────────────────────────────────────────────────────────────┐
│ Nome           │ Cargo     │ Filial   │ Status   │ Ações        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                          ┌──────────┐                            │
│                          │   📭    │                            │
│                          └──────────┘                            │
│                                                                  │
│                    Nenhum usuário encontrado                     │
│                                                                  │
│              Comece cadastrando seu primeiro usuário.            │
│                                                                  │
│                  [+ Novo Usuário]                                │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tabela — CARREGANDO (loading skeleton)

```
┌──────────────────────────────────────────────────────────────────┐
│ Nome           │ Cargo     │ Filial   │ Status   │ Ações        │
├──────────────────────────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓     │ ▓▓▓▓▓    │ ▓▓▓▓▓   │ ▓▓▓▓    │ ▓▓▓          │
│ ▓▓▓▓▓▓▓▓       │ ▓▓▓▓▓    │ ▓▓▓▓▓   │ ▓▓▓▓    │ ▓▓▓          │
│ ▓▓▓▓▓▓▓▓▓      │ ▓▓▓▓▓    │ ▓▓▓▓▓   │ ▓▓▓▓    │ ▓▓▓          │
│ ▓▓▓▓▓▓▓        │ ▓▓▓▓▓    │ ▓▓▓▓▓   │ ▓▓▓▓    │ ▓▓▓          │
│ ▓▓▓▓▓▓▓▓▓▓     │ ▓▓▓▓▓    │ ▓▓▓▓▓   │ ▓▓▓▓    │ ▓▓▓          │
│ ▓▓▓▓▓▓▓▓▓      │ ▓▓▓▓▓    │ ▓▓▓▓▓   │ ▓▓▓▓    │ ▓▓▓          │
└──────────────────────────────────────────────────────────────────┘
Carregando dados... (skeleton com animação shimmer)
```

### Tabela — COM ERRO (falha ao carregar)

```
┌──────────────────────────────────────────────────────────────────┐
│ Nome           │ Cargo     │ Filial   │ Status   │ Ações        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                                                                  │
│                          ┌──────────┐                            │
│                          │   ⚠️    │                            │
│                          └──────────┘                            │
│                                                                  │
│                    Falha ao carregar dados                       │
│                                                                  │
│              Não foi possível conectar ao servidor.              │
│              Verifique sua conexão e tente novamente.            │
│                                                                  │
│                  [Tentar novamente]                              │
│                                                                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Tabela — COM PAGINAÇÃO

```
┌──────────────────────────────────────────────────────────────────┐
│ ... (linhas da tabela) ...                                       │
└──────────────────────────────────────────────────────────────────┘
Mostrando 1-10 de 47                              [Anterior] [1] [2] [3] [4] [5] [Próxima]
```

### Tabela — COM ORDENAÇÃO

```
┌──────────────────────────────────────────────────────────────────┐
│ Nome ▲         │ Cargo     │ Filial ▼ │ Status   │ Ações        │
└──────────────────────────────────────────────────────────────────┘
▲ = ordenação ascendente ativa
▼ = ordenação descendente ativa
(clique no header alterna: asc → desc → sem ordem)
```

### Tabela — COM SELEÇÃO

```
┌──────────────────────────────────────────────────────────────────┐
│ ☑ │ Nome           │ Cargo     │ Filial   │ Status   │ Ações    │
├──────────────────────────────────────────────────────────────────┤
│ ☑ │ Maria Admin    │ Admin Emp │ Matriz   │ ●Ativo   │ [⋮]      │
│ ☐ │ João Silva     │ Vendedor  │ Centro   │ ●Ativo   │ [⋮]      │
│ ☑ │ Maria Souza    │ Vendedor  │ Centro   │ ●Ativo   │ [⋮]      │
│ ☐ │ José Pereira   │ Vendedor  │ Sul      │ ●Ativo   │ [⋮]      │
└──────────────────────────────────────────────────────────────────┘
[✓] Marcar todos    2 selecionados    [Ativar] [Desativar] [Excluir]
```

### Tabela — DENSIDADES

```
DENSA (compacta):
┌──────────┬──────────┬──────────┐
│ Nome     │ Cargo    │ Status   │  padding: 4px 8px, font 13px
├──────────┼──────────┼──────────┤
│ João S.  │ Vendedor │ ●Ativo   │
│ Maria S. │ Vendedor │ ●Ativo   │
└──────────┴──────────┴──────────┘

CONFORTÁVEL (padrão):
┌──────────────┬──────────────┬──────────────┐
│              │              │              │  padding: 12px 16px, font 14px
│ Nome         │ Cargo        │ Status       │
│              │              │              │
├──────────────┼──────────────┼──────────────┤
│              │              │              │
│ João Silva   │ Vendedor     │ ●Ativo       │
│              │              │              │
└──────────────┴──────────────┴──────────────┘
```

---

## 43.4 — Modal (todos os estados)

### MODAL — ABRINDO (animação de entrada)

```
   T = 0ms (overlay aparecendo, modal começa a surgir)
   ─────────────────────────────────────────────────────────────
                       ╭──────────────────────────╮
                       │                          │  ←  scale: 0.95
                       │                          │      opacity: 0
                       │      Modal               │      translateY: 10px
                       │                          │
                       │                          │
                       ╰──────────────────────────╯
   overlay: opacity 0

   T = 100ms (overlay parcial, modal escalando)
   ─────────────────────────────────────────────────────────────
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░╭──────────────────────────╮░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░│                          │░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░│      Modal               │░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░│                          │░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░╰──────────────────────────╯░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   overlay: opacity 0.5
   modal: scale 0.97, opacity 0.7

   T = 200ms (completo)
   ─────────────────────────────────────────────────────────────
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╭──────────────────────────╮▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      Modal               │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╰──────────────────────────╯▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   overlay: opacity 1 (50% visible)
   modal: scale 1, opacity 1
```

### MODAL — ABERTO (estado final, com foco)

```
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╭──────────────────────────╮▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ──────────────────────── │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ⚠️  Título do Modal   ✕ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ──────────────────────── │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  Conteúdo do modal...    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  [Cancelar]  [Confirmar] │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                          │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╰──────────────────────────╯▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

   Características:
   • Foco preso dentro do modal (Tab não sai)
   • ESC fecha o modal
   • Click no overlay fecha (opcional)
   • Primeiro elemento focável recebe foco
   • aria-modal="true", role="dialog"
```

### MODAL — FECHANDO (animação de saída)

```
   T = 0ms (início do fechamento)
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╭──────────────────────────╮▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      Modal (escala 1)    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓╰──────────────────────────╯▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
   overlay: opacity 1
   modal: scale 1, opacity 1

   T = 100ms (escala diminuindo)
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░╭──────────────────────────╮░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░│  Modal (escala 0.97)    │░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░╰──────────────────────────╯░░░░░░░░░░░░░░░
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   overlay: opacity 0.5
   modal: scale 0.97, opacity 0.7

   T = 150ms (sumiu)
   (tela volta ao normal, sem overlay, foco volta ao elemento que abriu)
```

### Tipos de Modal

| Tipo | Tamanho | Uso |
|------|---------|-----|
| Diálogo | 400-600px | Confirmação simples, alerta |
| Formulário | 600-800px | Criar/editar registros |
| Drawer lateral | 400px (lateral) | Filtros, detalhes rápidos |
| Fullscreen | 100% | Wizards, formulários longos |
| Bottom sheet (mobile) | 100% bottom | Ações contextuais |

---

# Capítulo 44 — Wireframes Mobile Específicos

## 44.1 — Dashboard Mobile (com cards empilhados)

```
┌───────────────────────────┐
│ [☰]  Orion    [🔔3] [👤]  │
├───────────────────────────┤
│                           │
│  Olá, João 👋             │
│  Hoje, 15 de Agosto       │
│                           │
│  ┌─────────────────────┐  │
│  │ Faturamento         │  │
│  │ ─────────────────── │  │
│  │ R$ 1.250            │  │
│  │ Meta: R$ 3.000      │  │
│  │ ████████░░░ 42%     │  │
│  │                   🟡 │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ Clientes            │  │
│  │ ─────────────────── │  │
│  │ 15                  │  │
│  │ Meta: 30            │  │
│  │ ████████████░ 50%   │  │
│  │                   🟡 │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ Ticket Médio        │  │
│  │ ─────────────────── │  │
│  │ R$ 83               │  │
│  │ Meta: R$ 87         │  │
│  │ █████████████░ 95%  │  │
│  │                   🟢 │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ Conversão           │  │
│  │ ─────────────────── │  │
│  │ 72%                 │  │
│  │ Meta: 90%           │  │
│  │ ████████████░ 80%   │  │
│  │                   🟡 │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🏆 Ranking #2       │  │
│  │ Maria está em #1    │  │
│  │ [Ver ranking →]     │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 📝 Lançar Resultado │  │
│  │   [Lançar Agora →]  │  │
│  └─────────────────────┘  │
│                           │
├───────────────────────────┤
│ [🏠][🎯][📝][🏆][👤]      │
└───────────────────────────┘
   Bottom Navigation (5 itens)
```

### Elementos Mobile
- **Header compacto:** logo + sininho + avatar
- **Saudação:** personalizada
- **Cards empilhados:** um KPI por card, scroll vertical
- **Barra de progresso:** visual e percentual
- **Atalho ranking:** card com posição atual
- **CTA flutuante:** lançar resultado em destaque
- **Bottom nav:** 5 ícones (dashboard, metas, lançar, ranking, perfil)

### Diferenças vs Desktop
- KPIs em coluna única (não grade 4x1)
- Sem gráfico de evolução (mobile mostra só valor atual)
- Ranking resumido (1 linha)
- Botão de lançar sempre visível

---

## 44.2 — Lançamento Mobile (com teclado numérico)

```
┌───────────────────────────┐
│ ← Lançar Resultado        │
│ 15/08/2025                │
├───────────────────────────┤
│                           │
│  Indicador 1 de 3         │
│  ●━━━━○━━━━○               │
│                           │
│  Faturamento (R$)         │
│  Meta: R$ 3.000           │
│                           │
│  ┌─────────────────────┐  │
│  │ R$ 1.250            │  │
│  └─────────────────────┘  │
│  ████████░░░░░░░░ 42%    │
│                           │
│  ┌─────────────────────┐  │
│  │   1   2   3         │  │
│  │   4   5   6         │  │
│  │   7   8   9         │  │
│  │   .   0   ⌫         │  │
│  └─────────────────────┘  │
│                           │
│  [Próximo →]              │
│                           │
└───────────────────────────┘
   (teclado numérico otimizado)

APÓS PREENCHER TODOS OS INDICADORES:

┌───────────────────────────┐
│ ← Lançar Resultado        │
│ 15/08/2025                │
├───────────────────────────┤
│                           │
│  Indicador 3 de 3         │
│  ●━━━━●━━━━○               │
│                           │
│  Conversão (%)            │
│  Meta: 90%                │
│                           │
│  ┌─────────────────────┐  │
│  │ 72                  │  │
│  └─────────────────────┘  │
│  ████████████░░░░ 80%    │
│                           │
│  ┌─────────────────────┐  │
│  │   1   2   3         │  │
│  │   4   5   6         │  │
│  │   7   8   9         │  │
│  │   .   0   ⌫         │  │
│  └─────────────────────┘  │
│                           │
│  Observações (opcional)   │
│  ┌─────────────────────┐  │
│  │                     │  │
│  └─────────────────────┘  │
│  📎 Anexar  🎤 Gravar    │
│                           │
│  [Salvar Resultado]       │
│                           │
└───────────────────────────┘
```

### Elementos Mobile
- **Stepper:** progresso entre indicadores (1 de 3)
- **Teclado numérico custom:** aparece automaticamente, com vírgula decimal e backspace
- **Próximo/Salvar:** muda conforme etapa
- **Validação inline:** barra de progresso atualiza em tempo real
- **Observações:** expansível no último passo
- **Anexos:** câmera nativa (foto) + microfone (áudio)

### Acessibilidade
- Haptics ao digitar (vibração leve)
- Leitura de tela (VoiceOver/TalkBack)
- Suporte a teclado Bluetooth

---

## 44.3 — Ranking Mobile (com swipe)

```
┌───────────────────────────┐
│ ← Ranking                 │
├───────────────────────────┤
│                           │
│  ┌─────┬─────┬─────┐      │
│  │ Hoje│ Sem.│ Mens│      │  ← tabs com swipe horizontal
│  └─────┴─────┴─────┘      │
│                           │
│  ┌─────────────────────┐  │
│  │ 🥇 Maria Souza      │  │
│  │ Vendedora - Centro  │  │
│  │ 138%  ████████████  │  │
│  │ R$ 4.140            │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🥈 João Silva       │  │
│  │ Você - Centro       │  │
│  │ 125%  ███████████   │  │
│  │ R$ 3.750            │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 🥉 José Pereira     │  │
│  │ Vendedor - Sul      │  │
│  │ 118%  ██████████    │  │
│  │ R$ 3.540            │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 4. Ana Costa        │  │
│  │ Superv. - Norte     │  │
│  │ 95%   ████████      │  │
│  │ R$ 2.850            │  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 5. Pedro Lima       │  │
│  │ Vendedor - Centro   │  │
│  │ 80%   ██████        │  │
│  │ R$ 2.400            │  │
│  └─────────────────────┘  │
│                           │
│  Sua posição: #2 🏆       │
│  Faltam R$ 390 p/ #1     │
│                           │
├───────────────────────────┤
│ [🏠][🎯][📝][🏆][👤]      │
└───────────────────────────┘

GESTOS:
  ← swipe left  → próxima tab (semana, mês)
  → swipe right → tab anterior
  ↑ swipe up    → carrega mais (próximas posições)
  ↓ swipe down  → atualiza ranking (refresh)

  Tap em card  → ver detalhes do vendedor
  Long press   → compartilhar / ver histórico
```

### Elementos Mobile
- **Tabs com swipe:** Hoje, Semana, Mês — navegação por gesto
- **Cards de posição:** destacam top 3 com medalhas
- **Card próprio:** destacado com borda colorida
- **Resumo inferior:** posição + gap para líder
- **Gestos:** swipe horizontal (tabs), vertical (refresh/scroll), tap, long press

---

## 44.4 — Notificações Mobile (drawer)

```
┌───────────────────────────┐        ┌───────────────────────────┐
│ [☰]  Orion    [🔔3] [👤]  │        │ ✕ Fechar          [⚙️]    │
├───────────────────────────┤        ├───────────────────────────┤
│                           │        │                           │
│  Dashboard                │        │  Notificações (5)         │
│  Hoje, 15 Ago             │        │  ─────────────────────    │
│                           │        │                           │
│  ┌─────────────────────┐  │        │  ● 🔴 Campanha termina    │
│  │ Faturamento         │  │        │    em 3 dias              │
│  │ R$ 1.250            │  │        │    Faltam 3 dias. 78%     │
│  │ 42% da meta   🟡    │  │        │    há 2 min               │
│  └─────────────────────┘  │        │    [Ver →]                │
│                           │        │  ─────────────────────    │
│  (resto da tela)          │        │                           │
│                           │        │  ● 🟡 3 resultados        │
│                           │        │    pendentes              │
│                           │        │    José, Ana, Pedro       │
│                           │        │    aguardam               │
│                           │        │    há 5 min               │
│                           │        │    [Ver →]                │
│                           │        │  ─────────────────────    │
│                           │        │                           │
│                           │        │  ● 🟡 Meta Q3 aguarda     │
│                           │        │    aprovação do diretor   │
│                           │        │    há 4h                  │
│                           │        │    [Aprovar →]            │
│                           │        │  ─────────────────────    │
│                           │        │                           │
│                           │        │  ● 🔵 João bateu meta!    │
│                           │        │    125% de faturamento    │
│                           │        │    há 5h                  │
│                           │        │    [Ver →]                │
│                           │        │  ─────────────────────    │
│                           │        │                           │
│                           │        │  ● 🟢 Atualização         │
│                           │        │    disponível v1.4.2      │
│                           │        │    há 1d                  │
│                           │        │    [Atualizar →]          │
│                           │        │                           │
│                           │        │                           │
│                           │        │  [Marcar todas como lidas]│
│                           │        │  [Ver todas →]            │
│                           │        │                           │
└───────────────────────────┘        └───────────────────────────┘
   (tela ao fundo)                      (drawer desliza da direita)

GESTOS:
  → swipe right (na borda direita)  → abre drawer
  ← swipe left  (no drawer)         → fecha drawer
  Tap fora do drawer                → fecha
  Tap em notificação                → navega para entidade
  Long press                        → arquivar / excluir
```

### Elementos Mobile
- **Drawer lateral:** desliza da direita, ocupa 85% da largura
- **Lista vertical:** scroll nativo
- **Item:** prioridade (cor), título, descrição, tempo relativo, ação
- **Ações rodapé:** marcar todas como lidas, ver todas (tela cheia)
- **Ícone ⚙️:** abre configurações de notificação

### Estados
- **Vazio:** "Sem notificações. Você está em dia! 🎉"
- **Carregando:** skeleton com shimmer
- **Erro:** "Falha ao carregar. [Tentar novamente]"

---

# Capítulo 45 — Fluxo: Aprovação de Meta Corporativa (Gerente → Diretor)

```
INÍCIO
  │
  ▼
[Gerente acessa Metas > Nova Meta Corporativa]
  │
  ▼
[Formulário: meta de faturamento Q3 2025]
  │ - Valor: R$ 4.500.000
  │ - Período: 01/07 - 30/09
  │ - Filiais: Todas (12)
  │ - Indicadores: Faturamento + Margem
  │
  ▼
[Gerente clica "Solicitar Aprovação"]
  │
  ▼
[Sistema valida dados]
  │
  ├──── validação falha ──▶ [Exibir erros]
  │                              │
  │ não                         ▼
  │                        Gerente corrige
  │ ◀────────────────────────────┘
  ▼
[Meta criada com status: pending_director_approval]
  │
  ▼
[Sistema envia notificação ao Diretor]
  │
  ├──▶ Canal: in-app  → Badge no menu + lista de notificações
  ├──▶ Canal: e-mail  → "Meta corporativa Q3 aguarda sua aprovação"
  └──▶ Canal: push    → Notificação no celular (se habilitado)
  │
  ▼
[Diretor recebe notificação]
  │
  ▼
[Diretor acessa Dashboard > Metas Corporativas]
  │
  ▼
[Diretor revisa detalhes da meta]
  │ - Valor solicitado
  │ - Período
  │ - Filiais afetadas
  │ - Histórico de metas anteriores
  │ - Comparação com ano anterior
  │ - Projeção da IA (atingibilidade)
  │
  ▼
[Diretor decide]
  │
  ├──▶ [Aprovar]
  │       │
  │       ▼
  │   [Status: approved]
  │       │
  │       ▼
  │   [Sistema ativa meta para todas as filiais]
  │       │
  │       ▼
  │   [Notifica gerentes de cada filial]
  │       │
  │       ▼
  │   [Cascata: metas mensais/diárias recalculadas]
  │       │
  │       ▼
  │   [Vendedores veem nova meta no dashboard]
  │       │
  │       ▼
  │   [Auditoria: "Diretor X aprovou meta Y em DD/MM"]
  │
  ├──▶ [Rejeitar]
  │       │
  │       ▼
  │   [Diretor preenche motivo da rejeição]
  │       │
  │       ▼
  │   [Status: rejected]
  │       │
  │       ▼
  │   [Notifica gerente com motivo]
  │       │
  │       ▼
  │   [Gerente ajusta e reenvia] ──▶ (volta ao passo "Solicitar Aprovação")
  │
  └──▶ [Pedir Ajustes]
          │
          ▼
      [Diretor preenche comentários]
          │
          ▼
      [Status: changes_requested]
          │
          ▼
      [Notifica gerente com comentários]
          │
          ▼
      [Gerente ajusta meta]
          │
          ▼
      [Reenvia para aprovação] ──▶ (volta ao passo "Diretor revisa")
  │
  ▼
[Fluxo encerra quando meta está approved ou rejected final]
  │
  ▼
FIM
```

### SLAs do Fluxo
- **Notificação ao diretor:** imediata (< 5s)
- **Aprovação esperada:** até 48h (configurável)
- **Lembrete:** se não aprovado em 24h, reenvia notificação
- **Escalonamento:** se não aprovado em 72h, notifica Admin Empresa

### Rastreabilidade
- Toda ação registrada em `audit_log`
- Status transições visíveis no histórico da meta
- Notificações têm `entity_type=meta`, `entity_id=X`

---

# Capítulo 46 — Fluxo: Campanha do Início ao Fim

```
FASE 1: CRIAÇÃO
───────────────
INÍCIO
  │
  ▼
[Gerente acessa Campanhas > Nova]
  │
  ▼
[Etapa 1: Dados Básicos]
  │ - Nome: "Campo Sete Dias"
  │ - Descrição: "Campanha de vendas sazonais"
  │ - Período: 08/08 - 18/08
  │ - Tipo: Competição (ranking)
  │
  ▼
[Etapa 2: Indicadores]
  │ - Faturamento (peso 2)
  │ - Clientes novos (peso 1)
  │ - Fórmula: (fat * 0.02) + (clientes * 5)
  │
  ▼
[Etapa 3: Participantes]
  │ - Seleção: 18 vendedores de 2 filiais
  │ - Filtro: cargo = Vendedor AND filial IN (Centro, Sul)
  │
  ▼
[Etapa 4: Premiação]
  │ - 1º lugar: R$ 500 + Troféu + Destaque TV
  │ - 2º lugar: R$ 300
  │ - 3º lugar: R$ 150
  │ - Bônus: +R$ 100 se fat > 120% meta
  │
  ▼
[Etapa 5: Regras Especiais (opcional)]
  │ - Excluir vendedores com < 30 dias de casa
  │ - Considerar apenas dias úteis
  │
  ▼
[Salvar como Rascunho] OU [Ativar Agora] OU [Agendar]

FASE 2: ATIVAÇÃO
────────────────
  │
  ├──── Rascunho ──▶ [Status: draft]
  │                      │
  │                      ▼
  │                 [Editável, visível só p/ gerente]
  │                      │
  │                      ▼
  │                 [Pode ativar depois]
  │
  ├──── Ativar ────▶ [Status: active]
  │                      │
  │                      ▼
  │                 [Notifica participantes: "Nova campanha!"]
  │                      │
  │                      ▼
  │                 [Atualiza dashboard de cada vendedor]
  │                      │
  │                      ▼
  │                 [Inicia contagem de pontos]
  │
  └──── Agendar ───▶ [Status: scheduled]
                       │
                       ▼
                  [Data início: cron job ativa]
                       │
                       ▼
                  (transita para active na data)

FASE 3: EXECUÇÃO
────────────────
[Campanha ativa]
  │
  ▼
[A cada resultado lançado por participante]
  │
  ▼
[Sistema recalcula pontuação da campanha]
  │
  ├──── Cálculo ──▶ pontos = (fat * peso1) + (clientes * peso2)
  │
  ▼
[Atualiza ranking da campanha em tempo real]
  │
  ▼
[Push via WebSocket para participantes logados]
  │
  ▼
[Atualiza Painel TV (se exibindo campanha)]
  │
  ▼
[Verifica regras de premiação automática]
  │
  ├──▶ Atingiu condição de bônus?
  │       │
  │       ▼ sim
  │    [Concede bônus imediatamente]
  │       │
  │       ▼
  │    [Notifica vendedor: "Você ganhou um bônus!"]
  │       │
  │       ▼
  │    [Registra em premios_campanha]
  │
  ▼
[Verifica fim do dia (23:59)]
  │
  ├──▶ Sim ──▶ [Gera snapshot diário do ranking]
  │              │
  │              ▼
  │           [Envia resumo diário por e-mail]
  │              │
  │              ▼
  │           [Atualiza gráfico de evolução]
  │
  ▼
[Continua execução até data fim]

FASE 4: ENCERRAMENTO
─────────────────────
[Data fim chegou (18/08 23:59)]
  │
  ▼
[Job cron: finaliza campanhas vencidas]
  │
  ▼
[Status: ended]
  │
  ▼
[Sistema calcula vencedores finais]
  │
  ▼
[Aplica regras de desempate]
  │ - Maior pontuação
  │ - Maior faturamento
  │ - Mais antigo na empresa
  │
  ▼
[Atribui premiações finais]
  │
  ▼
[Registra em premios_campanha]
  │
  ▼
[Notifica vencedores]
  │
  ├──▶ In-app: "🏆 Parabéns! Você venceu a campanha!"
  ├──▶ E-mail: detalhes + instruções para resgate
  └──▶ Push: "Você é o campeão!"
  │
  ▼
[Notifica não-vencedores]
  │ - "Campanha encerrada. Veja o ranking final."
  │
  ▼
[Gera relatório PDF automático]
  │ - Estatísticas (participantes, total atingido)
  │ - Ranking final
  │ - Vencedores com foto
  │ - Gráficos de evolução
  │ - Insights da IA
  │
  ▼
[Envia relatório ao gerente]
  │
  ▼
[Atualiza Painel TV: "Campanha encerrada - Vencedor: X"]
  │ (mantém destaque por 7 dias)
  │
  ▼
[Conquistas atribuídas aos vencedores]
  │ - Badge "Campeão Campo Sete Dias"
  │ - Pontos para ranking anual
  │
  ▼
[Auditoria final registrada]
  │
  ▼
[Status final: ended + finalizado=true]

FASE 5: PÓS-CAMPANHA
────────────────────
[Campanha disponível em "Encerradas"]
  │
  ▼
[Ações disponíveis]
  │
  ├──▶ [Ver detalhes] → tela de detalhe com ranking histórico
  ├──▶ [Duplicar]     → cria nova com mesmas regras
  ├──▶ [Exportar]     → CSV/PDF do ranking
  └──▶ [Excluir]      → apenas se sem resultados vinculados
                          (soft delete + auditoria)
  │
  ▼
FIM
```

### Pontos de Atenção
- **Reabertura:** apenas Admin Master pode reabrir campanha encerrada (com justificativa)
- **Pausa:** gerente pode pausar (status: paused) — pontos congelam
- **Cancelamento:** pode cancelar (status: canceled) — notifica participantes
- **Edição:** apenas rascunho é editável; ativa apenas regras periféricas

---

# Capítulo 47 — Fluxo: Notificação (do Evento à Entrega)

```
INÍCIO
  │
  ▼
[Evento disparado no sistema]
  │
  ├──▶ Tipos de evento:
  │    • result.created
  │    • result.pending_approval
  │    • result.approved / rejected
  │    • goal.reached
  │    • campaign.started / ended
  │    • campaign.won
  │    • user.login_suspicious
  │    • system.backup_completed
  │    • system.update_available
  │
  ▼
[Sistema cria registro em notifications_queue]
  │
  ├──▶ Payload:
  │    {
  │      event: "result.pending_approval",
  │      entity_type: "result",
  │      entity_id: 156,
  │      recipient_id: 5,  // gerente
  │      data: { vendedor_nome: "José", valor: 1800, ... },
  │      priority: "medium",
  │      channels: ["in-app", "email", "push"],
  │      created_at: "2025-08-15T14:30:00Z"
  │    }
  │
  ▼
[Worker processa fila (a cada 5s)]
  │
  ▼
[Para cada canal configurado:]
  │
  ├──▶ [IN-APP]
  │       │
  │       ▼
  │    [Salva em notifications table]
  │       │
  │       ▼
  │    [Badge count atualizado no Redis]
  │       │
  │       ▼
  │    [Push via WebSocket se usuário online]
  │       │
  │       ├──▶ Usuário online?
  │       │       │
  │       │       ▼ sim
  │       │    [Toast aparece imediatamente]
  │       │
  │       │       ▼ não
  │       │    [Aparece no sino 🔔 na próxima conexão]
  │       │
  │       ▼
  │    [Entrega confirmada]
  │
  ├──▶ [PUSH (Web Push API)]
  │       │
  │       ▼
  │    [Verifica se usuário tem subscription push]
  │       │
  │       ├──▶ Tem subscription?
  │       │       │
  │       │       ▼ sim
  │       │    [Envia via FCM (Android) / APNs (iOS) / Web Push]
  │       │       │
  │       │       ▼
  │       │    [Sistema operacional exibe notificação]
  │       │       │
  │       │       ├──▶ Usuário clica?
  │       │       │       │
  │       │       │       ▼ sim
  │       │       │    [Abre app + navega para entidade]
  │       │       │    [Marca notificação como clicada]
  │       │       │
  │       │       │       ▼ não
  │       │       │    [Aguarda (notificação permanece no SO)]
  │       │       │
  │       │       ▼
  │       │    [Entrega confirmada (callback do FCM/APNs)]
  │       │
  │       │       ▼ não
  │       │    [Pula canal push]
  │       │
  │       ▼
  │    [Verifica quiet hours]
  │       │
  │       ├──▶ Dentro do quiet hours?
  │       │       │
  │       │       ▼ sim (e não é urgente)
  │       │    [Agenda para próximo horário permitido]
  │       │
  │       │       ▼ não
  │       │    [Envia imediatamente]
  │
  ├──▶ [E-MAIL]
  │       │
  │       ▼
  │    [Seleciona template por evento + canal]
  │       │
  │       ▼
  │    [Renderiza com variáveis dinâmicas]
  │       │ - {{vendedor_nome}}, {{valor}}, {{link_detalhes}}
  │       │
  │       ▼
  │    [Adiciona header: List-Unsubscribe (LGPD)]
  │       │
  │       ▼
  │    [Envia via SMTP ou provedor (SendGrid/SES)]
  │       │
  │       ▼
  │    [Webhook de entrega (delivered/bounced/opened)]
  │       │
  │       ├──▶ Bounced?
  │       │       │
  │       │       ▼ sim
  │       │    [Marca e-mail como inválido]
  │       │    [Notifica admin: "E-mail de X bounceou"]
  │       │
  │       ▼
  │    [Entrega confirmada]
  │
  ├──▶ [WHATSAPP (se habilitado)]
  │       │
  │       ▼
  │    [Verifica consentimento LGPD do usuário]
  │       │
  │       ├──▶ Consentiu?
  │       │       │
  │       │       ▼ sim
  │       │    [Envia via API (Twilio/WhatsApp Business)]
  │       │    [Entrega confirmada via webhook]
  │       │
  │       │       ▼ não
  │       │    [Pula canal WhatsApp]
  │
  └──▶ [SLACK / TEAMS (se habilitado)]
          │
          ▼
       [Envia via webhook configurado]
          │
          ▼
       [Entrega confirmada (HTTP 200)]
  │
  ▼
[Todas entregas registradas em notifications_log]
  │
  ▼
[Status da notificação: delivered]
  │
  ▼
[Usuário interage?]
  │
  ├──▶ Clica / lê / arquiva
  │       │
  │       ▼
  │    [Status atualizado: read / clicked / archived]
  │       │
  │       ▼
  │    [Métricas: taxa de leitura, taxa de clique]
  │
  ▼
FIM
```

### Métricas Coletadas
- **Taxa de entrega:** % entregues / total enviados
- **Taxa de leitura:** % lidos / entregues
- **Taxa de clique:** % clicados / lidos
- **Tempo até leitura:** mediana
- **Canal mais efetivo:** por evento
- **Opt-out:** % que cancelaram canal

### Tratamento de Falhas
- **Retry:** 3 tentativas com backoff exponencial
- **Dead letter queue:** após falhas, move para DLQ
- **Alerta:** se > 10% de falhas em 1h, alerta DevOps
- **Fallback:** se push falha, tenta e-mail

---

# Capítulo 48 — Fluxo: Sincronização Offline

```
INÍCIO
  │
  ▼
[Vendedor abre app mobile]
  │
  ▼
[App verifica conectividade]
  │
  ├──▶ Online?
  │       │
  │       ▼ sim
  │    [Modo online normal]
  │    [Sincronização em background]
  │
  │       ▼ não
  │    [MODO OFFLINE ATIVADO]
  │       │
  │       ▼
  │    [Banner: "Você está offline. Mudanças serão sincronizadas."]
  │       │
  │       ▼
  │    [Indicador 📡 no header]
  │       │
  │       ▼
  │    [Carrega dados do cache local (IndexedDB)]
  │
  ▼
[Vendedor trabalha normalmente]
  │
  ├──▶ Pode:
  │    • Ver dashboard (dados em cache, até 24h atrás)
  │    • Lançar resultados (salvos localmente)
  │    • Ver metas (em cache)
  │    • Ver ranking (pode estar desatualizado)
  │    • Ver campanhas (em cache)
  │
  └──▶ Não pode:
       • Ver dados em tempo real
       • Receber notificações push
       • Aprovar/rejeitar (requer servidor)
       • Editar perfil (requer servidor)
  │
  ▼
[Vendedor lança resultado offline]
  │
  ▼
[App valida localmente via Zod schema]
  │
  ▼
[Salva em fila local (outbox pattern)]
  │
  ├──▶ Registro:
  │    {
  │      id_local: uuid,
  │      type: "result.create",
  │      payload: { ... },
  │      created_at: timestamp,
  │      status: "pending_sync"
  │    }
  │
  ▼
[Atualiza UI: "Pendente de sincronização ⏳"]
  │
  ▼
[Atualiza cache local do ranking (estimativa)]
  │
  ▼
[Continua trabalhando...]
  │
  ▼
[App periodicamente testa conectividade]
  │ (a cada 30s)
  │
  ├──▶ Ainda offline?
  │       │
  │       ▼ sim
  │    [Mantém fila local]
  │
  │       ▼ não
  │    [CONEXÃO RESTAURADA]
  │       │
  │       ▼
  │    [Banner: "Sincronizando... ⏳"]
  │       │
  │       ▼
  │    [App autentica com servidor (token válido?)]
  │       │
  │       ├──▶ Token expirado?
  │       │       │
  │       │       ▼ sim
  │       │    [Tenta refresh token]
  │       │       │
  │       │       ├──▶ Refresh OK ─▶ [Continua sync]
  │       │       │
  │       │       └──▶ Refresh falhou ─▶ [Pede login novamente]
  │       │                              [Mantém fila local]
  │       │
  │       ▼
  │    [Processa fila local (FIFO)]
  │       │
  │       ▼
  │    Para cada item na fila:
  │       │
  │       ├──▶ Envia para API
  │       │       │
  │       │       ├──▶ Sucesso (201 Created)
  │       │       │       │
  │       │       │       ▼
  │       │       │    [Remove da fila local]
  │       │       │    [Atualiza UI: "Sincronizado ✓"]
  │       │       │    [Toast: "Resultado sincronizado"]
  │       │       │
  │       │       ├──▶ Conflito (409)
  │       │       │       │
  │       │       │       ▼
  │       │       │    [Resolução de conflito]
  │       │       │       │
  │       │       │       ├──▶ Estratégia: servidor vence
  │       │       │       │    (resultado já existente)
  │       │       │       │
  │       │       │       ├──▶ Estratégia: cliente vence
  │       │       │       │    (raro, com justificativa)
  │       │       │       │
  │       │       │       └──▶ Estratégia: perguntar usuário
  │       │       │            (modal de merge)
  │       │       │
  │       │       └──▶ Erro (400/500)
  │       │               │
  │       │               ▼
  │       │            [Mantém na fila]
  │       │            [Marca como error]
  │       │            [Notifica usuário: "Falha ao sincronizar"]
  │       │            [Oferece: Editar / Descartar / Tentar depois]
  │       │
  │       ▼
  │    [Fila vazia?]
  │       │
  │       ├──▶ Sim ─▶ [Banner: "Tudo sincronizado ✓"]
  │       │            [Baixa dados atualizados do servidor]
  │       │            [Atualiza cache local]
  │       │            [Recalcula ranking com dados novos]
  │       │
  │       └──▶ Não (restaram erros) ─▶ [Banner: "X itens com erro"]
  │                                  [Lista de itens para revisar]
  │
  ▼
[Modo online restaurado]
  │
  ▼
FIM
```

### Conflitos Comuns
- **Resultado duplicado:** mesmo indicador+data lançado online e offline
- **Meta alterada:** meta mudou no servidor enquanto vendedor tinha cache antigo
- **Vendedor desativado:** admin suspendeu vendedor enquanto ele estava offline

### Estratégia de Resolução (default)
1. Dados do servidor têm prioridade (true source)
2. Criações locais são aceitas (idempotentes via UUID)
3. Atualizações locais em registros modificados no servidor → usuário decide

### Limites
- **Cache máximo:** 7 dias (após, força sincronização)
- **Fila máxima:** 100 itens (após, bloqueia novos lançamentos)
- **Tamanho do cache:** 50MB (LRU eviction)

---

# Capítulo 49 — Fluxo: Gestão de Sessões (Login em Múltiplos Dispositivos)

```
INÍCIO
  │
  ▼
[Usuário faz login no Device A (Chrome/Windows)]
  │
  ▼
[Sistema valida credenciais]
  │
  ▼
[Gera token JWT (access: 15min) + refresh token (7 dias)]
  │
  ▼
[Cria sessão em sessions table]
  │
  ├──▶ Registro:
  │    {
  │      id: sess_abc123,
  │      user_id: 5,
  │      device: "Chrome 120 - Windows 10",
  │      ip: "189.45.67.89",
  │      location: "São Paulo, SP",
  │      created_at: now,
  │      last_activity: now,
  │      refresh_token_hash: "..."
  │    }
  │
  ▼
[Salva tokens no cliente (httpOnly cookie + localStorage)]
  │
  ▼
[Usuário logado no Device A]
  │
  ▼
[Usuário faz login no Device B (Mobile/Android)]
  │
  ▼
[Sistema valida credenciais]
  │
  ├──▶ 2FA habilitado?
  │       │
  │       ▼ sim
  │    [Pede código TOTP]
  │       │
  │       ▼
  │    [Usuário digita código do app autenticador]
  │       │
  │       ├──▶ Válido?
  │       │       │
  │       │       ▼ sim
  │       │    [Continua login]
  │       │
  │       │       ▼ não
  │       │    [Bloqueia após 5 tentativas]
  │       │
  │       ▼ não
  │    [Continua login]
  │
  ▼
[Cria segunda sessão em sessions table]
  │
  ▼
[Notifica Device A: "Novo login em Android/São Paulo"]
  │
  ├──▶ Canal: in-app (toast na próxima interação)
  ├──▶ Canal: e-mail ("Novo login detectado")
  └──▶ Canal: push (se device A tem push)
  │
  ▼
[Ambos dispositivos agora têm sessões ativas]
  │
  ▼
[Configuração: máximo de sessões concorrentes?]
  │
  ├──▶ Ilimitado (default)
  │       │
  │       ▼
  │    [Usuário pode ter N sessões ativas]
  │
  ├──▶ Limitado (ex: 3)
  │       │
  │       ▼
  │    [Quando exceder, encerra sessão mais antiga]
  │       │
  │       ▼
  │    [Notifica device antigo: "Sessão encerrada (novo login)"]
  │
  └──▶ Único (strict mode)
          │
          ▼
       [Encerra todas as outras sessões]
          │
          ▼
       [Notifica dispositivos: "Sessão encerrada"]
  │
  ▼
[Durante uso, sessão é renovada:]
  │
  ├──▶ Access token expira (15min)
  │       │
  │       ▼
  │    [Cliente usa refresh token para renovar]
  │       │
  │       ▼
  │    [Sistema valida refresh token]
  │       │
  │       ├──▶ Válido?
  │       │       │
  │       │       ▼ sim
  │       │    [Gera novo access token]
  │       │    [Atualiza last_activity da sessão]
  │       │
  │       │       ▼ não
  │       │    [Encerra sessão]
  │       │    [Redireciona para login]
  │       │
  │       ▼
  │    [Continua uso]
  │
  ▼
[Atividade monitorada]
  │
  ├──▶ IP mudou drasticamente? (ex: SP → China)
  │       │
  │       ▼
  │    [Sinaliza como suspeito]
  │       │
  │       ▼
  │    [Pede reautenticação (2FA obrigatório)]
  │       │
  │       ▼
  │    [Notifica usuário por e-mail]
  │
  ├──▶ User-Agent mudou?
  │       │
  │       ▼
  │    [Atualiza device da sessão]
  │       │
  │       ▼
  │    [Log de auditoria]
  │
  ▼
[Usuário pode ver sessões ativas em Perfil > Sessões]
  │
  ▼
[Pode encerrar sessão específica ou todas]
  │
  ▼
FIM (ou continuação)

CENÁRIO: LOGOUT EM UM DISPOSITIVO
─────────────────────────────────
[Usuário clica "Sair" no Device A]
  │
  ▼
[Cliente chama /auth/logout com refresh token]
  │
  ▼
[Sistema invalida refresh token no banco]
  │
  ▼
[Remove sessão de sessions table]
  │
  ▼
[Cliente limpa tokens locais]
  │
  ▼
[Redireciona para login]
  │
  ▼
[Device B permanece logado (sessão independente)]

CENÁRIO: ADMIN FORCE LOGOUT
───────────────────────────
[Admin acessa Usuários > João > Sessões]
  │
  ▼
[Vê 3 sessões ativas]
  │
  ▼
[Admin clica "Encerrar todas" ou sessão específica]
  │
  ▼
[Sistema invalida refresh tokens]
  │
  ▼
[Remove sessões]
  │
  ▼
[Push via WebSocket: "Sua sessão foi encerrada"]
  │
  ▼
[Clientes redirecionam para login]
  │
  ▼
[Auditoria: "Admin encerrou sessões de João"]
```

### Configurações por Empresa
- **Máximo de sessões:** 1, 3, 5, ilimitado
- **2FA obrigatório:** sim/não (default: não)
- **2FA para novos dispositivos:** sim/não (default: sim)
- **Timeout de inatividade:** 15min, 30min, 1h, 4h, nunca
- **Notificar novo login:** sim/não (default: sim)

---

# Capítulo 50 — Fluxo: Revogação de Acesso

```
INÍCIO
  │
  ▼
[Admin acessa Usuários > João Silva > ⋮ > Suspender Acesso]
  │
  ▼
[Modal de confirmação]
  │
  ├──▶ "Tem certeza que deseja suspender o acesso de João Silva?"
  │    [ ] Notificar usuário por e-mail
  │    [ ] Motivo (opcional)
  │    [Cancelar] [Suspender]
  │
  ▼
[Admin confirma suspensão]
  │
  ▼
[Sistema marca usuário como status: suspended]
  │
  ▼
[Invalida TODOS os refresh tokens do usuário]
  │
  ├──▶ DELETE FROM refresh_tokens WHERE user_id = X
  │
  ▼
[Remove TODAS as sessões ativas]
  │
  ├──▶ DELETE FROM sessions WHERE user_id = X
  │
  ▼
[Adiciona JWT à blacklist (até expirar naturalmente)]
  │
  ├──▶ Redis: SET blacklist:jwt:{token} 1 EX 900
  │
  ▼
[Push via WebSocket para clientes conectados]
  │
  ├──▶ Mensagem: { type: "session_revoked", reason: "..." }
  │
  ▼
[Clientes recebem mensagem]
  │
  ▼
[Clientes redirecionam para login com mensagem]
  │
  ├──▶ "Seu acesso foi suspenso. Contate o administrador."
  │
  ▼
[Se usuário tentar logar novamente]
  │
  ▼
[Sistema verifica status]
  │
  ├──▶ Status: suspended?
  │       │
  │       ▼ sim
  │    [Bloqueia login]
  │    [Mensagem: "Conta suspensa. Contate o administrador."]
  │    [Registra tentativa em audit_log]
  │
  ▼
[Notifica usuário por e-mail (se optado)]
  │
  ├──▶ "Seu acesso ao Orion foi suspenso."
  │    "Motivo: {{motivo}}"
  │    "Para mais informações, contate {{admin_email}}"
  │
  ▼
[Registra auditoria completa]
  │
  ├──▶ audit_log:
  │    {
  │      actor: "Maria Admin",
  │      action: "user.suspend",
  │      entity: "user",
  │      entity_id: 125,
  │      details: { motivo: "..." },
  │      ip: "...",
  │      timestamp: now
  │    }
  │
  ▼
FIM DA SUSPENSÃO

────────────────────────────────────────────────

CENÁRIO: REATIVAÇÃO DE ACESSO
─────────────────────────────
[Admin acessa Usuários > João Silva (suspenso) > ⋮ > Reativar]
  │
  ▼
[Modal de confirmação]
  │
  ▼
[Admin confirma]
  │
  ▼
[Sistema marca usuário como status: active]
  │
  ▼
[NÃO recria sessões antigas (segurança)]
  │
  ▼
[Usuário precisa fazer login novamente]
  │
  ├──▶ Se 2FA habilitado, passa por fluxo 2FA
  │
  ▼
[Senha ainda válida?]
  │
  ├──▶ Sim ──▶ [Login normal]
  │
  └──▶ Admin resetou senha durante suspensão?
          │
          ▼ sim
       [Exige troca de senha no primeiro acesso]
  │
  ▼
[Notifica usuário por e-mail: "Seu acesso foi reativado"]
  │
  ▼
[Registra auditoria: user.reactivate]
  │
  ▼
FIM

────────────────────────────────────────────────

CENÁRIO: EXCLUSÃO DE USUÁRIO (LGPD)
───────────────────────────────────
[Admin acessa Usuários > João Silva > ⋮ > Excluir]
  │
  ▼
[Modal de confirmação com checkbox obrigatório]
  │
  ├──▶ "Esta ação NÃO pode ser desfeita."
  │    "Para confirmar, digite o nome do usuário:"
  │    [input: ____]
  │    [ ] Entendo que dados pessoais serão anonimizados
  │    [ ] Entendo que histórico de resultados será mantido (anonimizado)
  │    [Cancelar] [Excluir Definitivamente]
  │
  ▼
[Admin digita nome exato e marca checkboxes]
  │
  ▼
[Sistema processa exclusão (soft delete + anonimização)]
  │
  ├──▶ Etapas:
  │    1. Anonimiza dados pessoais (nome, CPF, e-mail, telefone)
  │       - Substitui por "Usuário Excluído" + hash
  │    2. Mantém resultados (vinculados ao ID anonimizado)
  │    3. Mantém auditoria (vinculada ao ID)
  │    4. Remove sessões e tokens
  │    5. Marca user.deleted_at = now
  │
  ▼
[Registra auditoria: user.delete (LGPD)]
  │
  ▼
[Notifica admin: "Usuário excluído com sucesso"]
  │
  ▼
FIM
```

### Diferenças: Suspender vs Desativar vs Excluir

| Ação | Status | Login | Sessões | Dados | Reversível |
|------|--------|-------|---------|-------|------------|
| Suspender | suspended | Bloqueado | Encerradas | Mantidos | Sim |
| Desativar | inactive | Bloqueado | Encerradas | Mantidos | Sim |
| Excluir | deleted | Bloqueado | Encerradas | Anonimados | Não |

### Quando Usar Cada
- **Suspender:** suspeita de fraude, investigação, temporário
- **Desativar:** férias, licença maternidade, desligamento amigável
- **Excluir:** solicitação LGPD, GDPR compliance

---

# Capítulo 51 — Fluxo: Exportação LGPD

```
INÍCIO
  │
  ▼
[Usuário acessa Perfil > Zona de Perigo > Exportar meus dados]
  │
  ▼
[Modal de confirmação]
  │
  ├──▶ "Você está solicitando a exportação de todos os seus dados pessoais."
  │    "Isso inclui:"
  │    "• Dados de cadastro (nome, CPF, e-mail, etc.)"
  │    "• Histórico de resultados (5 anos)"
  │    "• Metas atribuídas"
  │    "• Sessões de login (últimos 90 dias)"
  │    "• Notificações recebidas (últimos 90 dias)"
  │    "• Auditoria relacionada (últimos 90 dias)"
  │    ""
  │    "O arquivo será gerado em até 24h e enviado por e-mail."
  │    ""
  │    [ ] Confirmo que sou o titular dos dados
  │    [Cancelar] [Solicitar Exportação]
  │
  ▼
[Usuário confirma]
  │
  ▼
[Sistema cria solicitação em data_export_requests]
  │
  ├──▶ Registro:
  │    {
  │      id: req_xyz,
  │      user_id: 5,
  │      type: "lgpd_full_export",
  │      status: "pending",
  │      requested_at: now,
  │      expires_at: now + 30 days  // prazo legal
  │    }
  │
  ▼
[Notifica usuário: "Solicitação recebida"]
  │
  ├──▶ In-app: "Exportação em processamento. Você receberá por e-mail."
  ├──▶ E-mail: "Confirmação de solicitação LGPD"
  │
  ▼
[Job assíncrono processa (background worker)]
  │
  ▼
[Worker coleta dados]
  │
  ├──▶ 1. Dados de cadastro (users table)
  ├──▶ 2. Histórico de resultados (results, 5 anos)
  ├──▶ 3. Metas atribuídas (goals)
  ├──▶ 4. Sessões de login (sessions, 90 dias)
  ├──▶ 5. Notificações (notifications, 90 dias)
  ├──▶ 6. Auditoria (audit_log, 90 dias)
  ├──▶ 7. Campanhas participadas
  ├──▶ 8. Premiações recebidas
  ├──▶ 9. Configurações pessoais
  ├──▶ 10. Consentimentos (lgpd_consents)
  │
  ▼
[Worker gera arquivo estruturado]
  │
  ├──▶ Formato: ZIP contendo:
  │    • README.md (explicação dos arquivos)
  │    • dados_pessoais.json
  │    • resultados.csv
  │    • metas.csv
  │    • sessoes.csv
  │    • notificacoes.csv
  │    • auditoria.csv
  │    • campanhas.csv
  │    • premiacoes.csv
  │    • consentimentos.json
  │
  ▼
[Criptografa ZIP com senha temporária]
  │
  ├──▶ Senha gerada aleatoriamente (32 chars)
  │
  ▼
[Faz upload para storage privado (S3/GCS)]
  │
  ├──▶ URL assinada (expira em 7 dias)
  │
  ▼
[Atualiza solicitação: status=completed]
  │
  ▼
[Envia e-mail ao usuário]
  │
  ├──▶ Assunto: "Seus dados estão prontos para download"
  │    Corpo:
  │    "Olá João,"
  │    "Sua solicitação de exportação de dados foi processada."
  │    ""
  │    "Baixe o arquivo em: [LINK] (expira em 7 dias)"
  │    ""
  │    "Senha para abrir o arquivo: [SENHA]"
  │    "(Enviamos a senha separadamente por segurança)"
  │    ""
  │    "Após o download, recomendamos excluir o arquivo do servidor."
  │
  ▼
[Envia e-mail separado com a senha]
  │
  ├──▶ Assunto: "Senha para acessar seus dados exportados"
  │    Corpo: "Senha: [SENHA]"
  │
  ▼
[Notifica in-app: "Dados prontos. Verifique seu e-mail."]
  │
  ▼
[Registra auditoria: lgpd.export_completed]
  │
  ▼
[Após 7 dias, URL expira automaticamente]
  │
  ├──▶ Storage delete o arquivo
  │
  ▼
FIM

CENÁRIO: ADMIN SOLICITA EXPORTAÇÃO PARA USUÁRIO
───────────────────────────────────────────────
[Admin Master acessa Usuários > João > ⋮ > Exportar Dados (LGPD)]
  │
  ▼
[Modal: "Exportar dados em nome do usuário?"]
  │
  ├──▶ "Esta ação será registrada na auditoria."
  │    "Motivo (obrigatório): [______________]"
  │    [Cancelar] [Exportar]
  │
  ▼
[Admin preenche motivo]
  │
  ▼
[Fluxo igual ao do usuário, mas:]
  • Solicitação registrada com requested_by=admin
  • E-mail enviado ao USUÁRIO (não ao admin)
  • Auditoria dupla: lgpd.export_on_behalf
  │
  ▼
FIM
```

### Compliance LGPD
- **Prazo legal:** 15 dias (Art. 19) — sistema entrega em 24h
- **Formato:** estruturado e de uso comum (Art. 20)
- **Gratis:** não pode cobrar taxa
- **Auditável:** toda solicitação registrada
- **Consentimento:** implícito (é direito do titular)

### Limitações
- **Dados de terceiros:** se resultados contêm nomes de clientes, são filtrados
- **Segredos comerciais:** fórmulas de indicadores NÃO são incluídas
- **Logs de sistema:** incluídos apenas os do próprio usuário

---

# Capítulo 52 — Fluxo: Atualização do Sistema (com Rollback)

```
FASE 1: PREPARAÇÃO
──────────────────
INÍCIO
  │
  ▼
[Nova versão disponível (v1.5.0)]
  │
  ▼
[Admin Master acessa Atualizações]
  │
  ▼
[Vê: "Nova versão 1.5.0 disponível"]
  │
  ├──▶ Detalhes:
  │    • Versão atual: 1.4.2
  │    • Versão nova: 1.5.0
  │    • Tipo: minor (sem breaking changes)
  │    • Tamanho: 45MB
  │    • Changelog: [Ver notas]
  │    • Compatibilidade: DB migrável
  │    • Estimativa: 5-10 min
  │
  ▼
[Admin clica "Agendar Atualização"]
  │
  ▼
[Seleciona janela de manutenção]
  │
  ├──▶ Sugestão: próximo domingo 23:00 (low traffic)
  │    Alternativa: data/hora customizada
  │
  ▼
[Sistema agenda atualização (cron job)]
  │
  ▼
[Notifica todos os usuários: "Manutenção programada"]
  │
  ├──▶ 24h antes: e-mail + in-app
  ├──▶ 1h antes: banner topo
  └──── 15 min antes: modal bloqueante
  │
  ▼
FIM DA PREPARAÇÃO

FASE 2: EXECUÇÃO
────────────────
[Horário agendado chegou]
  │
  ▼
[Sistema ativa modo manutenção]
  │
  ├──▶ Flag no banco: maintenance_mode = true
  ├──▶ Página de manutenção servida
  ├──▶ Workers param de processar fila
  └── WebSocket connections fechadas graciosa
  │
  ▼
[Backup automático (pre-update)]
  │
  ├──▶ Backup completo do banco de dados
  ├──▶ Backup dos arquivos de configuração
  ├──▶ Backup do código atual (versão 1.4.2)
  └── Snapshot da VM (se cloud)
  │
  ▼
[Verificação de integridade do backup]
  │
  ├──▶ Backup válido?
  │       │
  │       ▼ sim
  │    [Continua atualização]
  │
  │       ▼ não
  │    [ABORTA atualização]
  │       │
  │       ▼
  │    [Notifica admin: "Backup falhou. Atualização cancelada."]
  │       │
  │       ▼
  │    [Desativa modo manutenção]
  │       │
  │       ▼
  │    [Sistema volta ao normal (v1.4.2)]
  │       │
  │       ▼
  │    FIM (tentar novamente depois)
  │
  ▼
[Download da nova versão]
  │
  ├──▶ Baixa pacote v1.5.0 do repositório
  ├──▶ Verifica assinatura GPG
  ├──▶ Verifica checksum SHA256
  │
  ├──▶ Verificação OK?
  │       │
  │       ▼ não
  │    [ABORTA: "Pacote inválido"]
  │    [Rollback automático]
  │
  │       ▼ sim
  │    [Continua]
  │
  ▼
[Aplica migrações de banco (Drift)]
  │
  ├──▶ Para cada migration:
  │    1. Backup da tabela afetada
  │    2. Executa migration
  │    3. Valida resultado
  │
  ├──▶ Migration falhou?
  │       │
  │       ▼ sim
  │    [Rollback da migration]
  │       │
  │       ▼
  │    [Restaura tabelas afetadas do backup]
  │       │
  │       ▼
  │    [ABORTA atualização]
  │       │
  │       ▼
  │    [Rollback para v1.4.2]
  │
  │       ▼ não
  │    [Continua]
  │
  ▼
[Substitui código da aplicação]
  │
  ├──▶ Stop app v1.4.2
  ├──▶ Deploy app v1.5.0
  ├──▶ Start app v1.5.0
  │
  ▼
[Health checks]
  │
  ├──▶ App responde?
  │       │
  │       ▼ não
  │    [Tenta reiniciar (até 3x)]
  │       │
  │       ├──▶ Subiu?
  │       │       │
  │       │       ▼ não
  │       │    [ROLLBACK AUTOMÁTICO]
  │       │
  │       ▼ sim
  │    [Continua]
  │
  ├──▶ DB acessível?
  ├──▶ Redis acessível?
  ├──▶ Storage acessível?
  ├──▶ Cron jobs configurados?
  │
  ▼
[Smoke tests]
  │
  ├──▶ Login funciona?
  ├──▶ Criar resultado funciona?
  ├──▶ Listar metas funciona?
  ├──▶ Ranking calcula?
  │
  ├──▶ Tudo passou?
  │       │
  │       ▼ sim
  │    [Atualização concluída]
  │
  │       ▼ não
  │    [ROLLBACK AUTOMÁTICO]

FASE 3: PÓS-ATUALIZAÇÃO
───────────────────────
  │
  ▼
[Desativa modo manutenção]
  │
  ▼
[Notifica usuários: "Sistema atualizado para v1.5.0"]
  │
  ▼
[Notifica admin: "Atualização concluída com sucesso"]
  │
  ├──▶ E-mail com:
  │    • Versão: 1.5.0
  │    • Duração: 8 min
  │    • Mudanças aplicadas
  │    • Backup disponível em: [URL]
  │
  ▼
[Registra em update_history]
  │
  ├──▶ {
  │      from_version: "1.4.2",
  │      to_version: "1.5.0",
  │      started_at: "...",
  │      completed_at: "...",
  │      duration: "8min",
  │      status: "success",
  │      backup_id: "bkp_xyz"
  │    }
  │
  ▼
[Monitora por 24h]
  │
  ├──▶ Erro 500 aumentou?
  ├──▶ Latência aumentou?
  ├──▶ Usuários reclamando?
  │
  ├──▶ Tudo OK?
  │       │
  │       ▼ sim
  │    [Atualização considerada estável]
  │
  │       ▼ não (problemas críticos)
  │    [Notifica admin: "Problemas detectados"]
  │    [Oferece rollback manual]

FASE 4: ROLLBACK (se necessário)
────────────────────────────────
[Admin decide reverter]
  │
  ▼
[Admin clica "Reverter para v1.4.2"]
  │
  ▼
[Modal de confirmação]
  │
  ├──▶ "Tem certeza? Dados criados após a atualização podem ser perdidos."
  │    [ ] Entendo os riscos
  │    [Cancelar] [Reverter]
  │
  ▼
[Admin confirma]
  │
  ▼
[Ativa modo manutenção]
  │
  ▼
[Stop app v1.5.0]
  │
  ▼
[Restaura backup do banco (pre-update)]
  │
  ├──▶ AVISO: dados pós-atualização serão perdidos
  │       │
  │       ▼
  │    [Restaura backup]
  │
  ▼
[Restaura código v1.4.2]
  │
  ▼
[Start app v1.4.2]
  │
  ▼
[Health checks]
  │
  ▼
[Desativa modo manutenção]
  │
  ▼
[Notifica: "Sistema revertido para v1.4.2"]
  │
  ▼
[Registra em update_history: rollback]
  │
  ▼
[Post-mortem obrigatório]
  │
  ├──▶ Admin preenche: motivo do rollback
  ├──▶ Envia para equipe Dev (Jira/Linear)
  │
  ▼
FIM
```

### Estratégias de Segurança
- **Backup triplo:** banco + código + VM snapshot
- **Health checks:** 5 endpoints críticos
- **Smoke tests:** 10 cenários de usuário
- **Rollback automático:** se health checks falham 3x
- **Rollback manual:** sempre disponível por 7 dias
- **Post-mortem:** se rollback, análise obrigatória

### Tipos de Atualização

| Tipo | Compatibility | Downtime | Rollback |
|------|---------------|----------|----------|
| Patch (1.4.2→1.4.3) | Total | 1-2 min | Automático |
| Minor (1.4→1.5) | Migrável | 5-10 min | Manual |
| Major (1→2) | Pode quebrar | 30-60 min | Difícil |

### Comunicação
- **Notas de versão:** público em orion.com.br/changelog
- **E-mail admins:** 7 dias antes (minor/major)
- **In-app banner:** 24h antes
- **Status page:** orionstatus.com.br

---

# Capítulo 53 — Mapa de Telas Expandido v2.0

## Telas Públicas (sem autenticação)

| Tela | Rota | Ator | Capítulo |
|------|------|------|----------|
| Login | `/login` | Todos | 3 |
| Esqueci Senha | `/forgot-password` | Todos | - |
| Reset Senha | `/reset-password` | Todos | - |
| Página 404 | `*` | Todos | 35 |
| Página 500 | (erro) | Todos | 36 |
| Manutenção | `/manutencao` | Todos | 37 |
| Status | `orionstatus.com.br` | Todos | - |
| Instalação PWA | `/instalar` | Todos | 42 |
| Painel TV | `/tv/:token` | Público | 34 |
| Landing Page | `/` | Visitante | - |

## Telas de Vendedor

| Tela | Rota | Ator | Capítulo |
|------|------|------|----------|
| Dashboard Vendedor | `/dashboard` | Vendedor | 4 |
| Metas do Dia | `/metas` | Vendedor | - |
| Lançar Resultado | `/resultados/novo` | Vendedor | 5 |
| Ranking | `/ranking` | Vendedor | - |
| Campanhas | `/campanhas` | Vendedor | 26 |
| Histórico | `/historico` | Vendedor | - |
| Perfil | `/perfil` | Todos | 31 |
| Notificações | `/notificacoes` | Todos | 30 |
| Config. Notificações | `/perfil/notificacoes` | Todos | 33 |

## Telas de Supervisor

| Tela | Rota | Ator | Capítulo |
|------|------|------|----------|
| Dashboard Supervisor | `/supervisor/dashboard` | Supervisor | 20 |
| Equipe do Grupo | `/supervisor/equipe` | Supervisor | - |
| Visitas | `/supervisor/visitas` | Supervisor | - |
| Relatórios de Grupo | `/supervisor/relatorios` | Supervisor | - |

## Telas de Gerente

| Tela | Rota | Ator | Capítulo |
|------|------|------|----------|
| Dashboard Gerente | `/admin/dashboard` | Gerente+ | 6 |
| Metas (gestão) | `/admin/metas` | Gerente+ | 7 |
| Aprovações Pendentes | `/admin/aprovacoes` | Gerente+ | 29 |
| Equipe | `/admin/equipe` | Gerente+ | - |
| Campanhas (gestão) | `/admin/campanhas` | Gerente+ | 26 |
| Detalhe Campanha | `/admin/campanhas/:id` | Gerente+ | 27 |
| Resultados (gestão) | `/admin/resultados` | Gerente+ | 28 |
| Relatórios | `/admin/relatorios` | Gerente+ | - |
| IA Insights | `/admin/ia` | Gerente+ | - |

## Telas de Diretor

| Tela | Rota | Ator | Capítulo |
|------|------|------|----------|
| Dashboard Diretor | `/diretor/dashboard` | Diretor+ | 19 |
| Metas Corporativas | `/diretor/metas-corporativas` | Diretor+ | - |
| Aprovação de Metas | `/diretor/aprovar-metas` | Diretor+ | 45 |
| Filiais (consolidado) | `/diretor/filiais` | Diretor+ | 25 |
| Relatórios Executivos | `/diretor/relatorios` | Diretor+ | - |

## Telas de Admin Empresa

| Tela | Rota | Ator | Capítulo |
|------|------|------|----------|
| Empresas | `/admin/empresas` | Admin Empresa | - |
| Filiais | `/admin/filiais` | Admin Empresa | 25 |
| Usuários | `/admin/usuarios` | Admin Empresa | 21 |
| Form. Usuário | `/admin/usuarios/novo` | Admin Empresa | 22 |
| Editar Usuário | `/admin/usuarios/:id` | Admin Empresa | 22 |
| Cargos e Permissões | `/admin/cargos` | Admin Empresa | 23 |
| Indicadores | `/admin/indicadores` | Admin Empresa | 24 |
| Construtor Indicador | `/admin/indicadores/novo` | Admin Empresa | 9 |
| Configurações | `/admin/config` | Admin Empresa | - |
| Tema/Identidade | `/admin/config/tema` | Admin Empresa | 32 |
| Notificações | `/admin/config/notificacoes` | Admin Empresa | 33 |
| Auditoria | `/admin/auditoria` | Admin Master | 10 |
| Licença | `/admin/licenca` | Admin Master | - |
| Backup | `/admin/backup` | Admin Master | - |
| Atualizações | `/admin/atualizacoes` | Admin Master | 52 |
| Módulos | `/admin/modulos` | Admin Master | - |
| Logs | `/admin/logs` | Admin Master | - |
| Sessões | `/admin/sessoes` | Admin Master | - |

## Telas de Setup

| Tela | Rota | Ator | Capítulo |
|------|------|------|----------|
| Setup Wizard | `/setup` | Admin Master | 8 |
| Setup Empresa | `/setup/empresa` | Admin Master | 8 |
| Setup Filiais | `/setup/filiais` | Admin Master | 8 |
| Setup Cargos | `/setup/cargos` | Admin Master | 8 |
| Setup Admin | `/setup/admin` | Admin Master | 8 |
| Setup Indicadores | `/setup/indicadores` | Admin Master | 8 |

## Componentes Reutilizáveis

| Componente | Capítulo | Estados |
|------------|----------|---------|
| Botão | 43.1 | default, hover, active, disabled, loading, focus |
| Input | 43.2 | default, focus, error, disabled, with icon, loading, helper, counter, readonly, required |
| Tabela | 43.3 | com dados, vazia, carregando, com erro, paginação, ordenação, seleção, densidades |
| Modal | 43.4 | abrindo, aberto, fechando |
| Toast | 40 | success, error, warning, info, loading |
| Empty States | 41 | sem dados, sem busca, sem metas |
| Loading Modal | 39 | simples, com etapas, com progresso, indeterminado |

## Fluxos de Navegação Detalhados

| Fluxo | Capítulo |
|-------|----------|
| Navegação Principal | 2 |
| Onboarding (primeiro acesso) | 11 |
| Lançar Resultado | 12 |
| Criar Campanha | 13 |
| Aprovação de Resultado | 14 |
| Recuperação de Senha | 15 |
| Campanha em Andamento | 17 |
| Aprovação de Meta Corporativa | 45 |
| Campanha do Início ao Fim | 46 |
| Notificação (evento→entrega) | 47 |
| Sincronização Offline | 48 |
| Gestão de Sessões | 49 |
| Revogação de Acesso | 50 |
| Exportação LGPD | 51 |
| Atualização do Sistema | 52 |

## Telas Mobile Específicas

| Tela | Capítulo |
|------|----------|
| Dashboard Mobile | 16 + 44.1 |
| Lançamento Mobile (c/ teclado) | 44.2 |
| Ranking Mobile (c/ swipe) | 44.3 |
| Notificações Mobile (drawer) | 44.4 |
| Drawer Mobile (menu) | 16 |

## Telas de Erro e Estado

| Tela | Capítulo |
|------|----------|
| Erro 404 | 35 |
| Erro 500 | 36 |
| Manutenção | 37 |
| Empty States | 41 |
| Instalação PWA | 42 |

## Painéis Especiais

| Painel | Rota | Capítulo |
|--------|------|----------|
| Painel TV | `/tv/:token` | 34 |
| Admin de TVs | `/admin/tvs` | 34 |
| Status Externo | `orionstatus.com.br` | - |

---

# Capítulo 54 — Padrões Visuais e Convenções

## 54.1 — Cores de Status

| Cor | Significado | Hex | Uso |
|-----|-------------|-----|-----|
| 🟢 Verde | Sucesso/Ativo/Meta atingida | `#22C55E` | Status positivo, meta ≥ 100% |
| 🟡 Amarelo | Atenção/Parcial | `#F59E0B` | Status intermediário, meta 80-99% |
| 🔴 Vermelho | Erro/Crítico/Abaixo meta | `#EF4444` | Status negativo, meta < 80% |
| 🔵 Azul | Info/Neutro | `#3B82F6` | Informações, links |
| ⚪ Cinza | Inativo/Desabilitado | `#9CA3AF` | Status neutro, disabled |
| 🟣 Roxo | Destaque/Premium | `#A855F7` | Campanhas, premiações |

## 54.2 — Ícones Padrão

| Ícone | Significado | Contexto |
|-------|-------------|----------|
| ✓ | Confirmado/Aprovado | Status positivo |
| ✗ | Rejeitado/Erro | Status negativo |
| ⚠️ | Atenção/Warning | Alertas |
| ℹ️ | Informação | Tooltips, helpers |
| ⏳ | Pendente | Em espera |
| 🔄 | Sincronizando | Loading |
| ◉ | Loading spinner | Processando |
| 🟢 ● | Ativo | Status de usuário |
| ⚪ ○ | Inativo | Status de usuário |
| 🔴 ● | Bloqueado | Status de usuário |
| ▲ | Subiu | Tendência positiva |
| ▼ | Desceu | Tendência negativa |
| → | Estável | Tendência neutra |
| 🏆 | Vencedor | Ranking |
| 🥇🥈🥉 | Top 3 | Ranking |
| ⭐ | Destaque | Campanhas |

## 54.3 — Espaçamentos (Sistema 8px)

```
4px   = 0.5 unidade (micro)
8px   = 1 unidade (padrão)
16px  = 2 unidades (médio)
24px  = 3 unidades (grande)
32px  = 4 unidades (seções)
48px  = 6 unidades (entre seções)
64px  = 8 unidades (hero)
```

## 54.4 — Tipografia

| Tipo | Tamanho | Peso | Uso |
|------|---------|------|-----|
| H1 | 32px | 700 | Títulos de página |
| H2 | 24px | 600 | Seções |
| H3 | 20px | 600 | Sub-seções |
| H4 | 18px | 500 | Cards |
| Body | 14px | 400 | Texto padrão |
| Small | 12px | 400 | Labels, captions |
| Tiny | 10px | 500 | Badges, tags |

## 54.5 — Breakpoints Responsivos

```
Mobile:         0 - 640px     (1 coluna, bottom nav)
Tablet:         641 - 1024px  (2 colunas, sidebar collapsed)
Desktop:        1025 - 1440px (sidebar expandida, multi-coluna)
Desktop Large:  1441px+       (sidebar + conteúdo + painel lateral)
```

## 54.6 — Z-Index (camadas)

```
Z-0:     Background
Z-10:    Sidebar, header
Z-20:    Conteúdo principal
Z-30:    Dropdowns
Z-40:    Sticky headers
Z-50:    Modais (overlay)
Z-50:    Toasts (acima de modais)
Z-60:    Tooltips
Z-100:   Notifications urgentes
Z-9999:  Modais de confirmação crítica
```

---

# Capítulo 55 — Resumo e Próximos Passos

## Resumo do Documento

Este documento apresentou **55 capítulos** cobrindo:

- **Fluxo de navegação principal** (Capítulo 2)
- **32 wireframes de telas** (Capítulos 3-42, excluindo fluxos)
  - Telas de autenticação (login, recuperação senha)
  - Dashboards por persona (vendedor, gerente, supervisor, diretor)
  - Telas de gestão (usuários, cargos, indicadores, filiais, campanhas, resultados, aprovações)
  - Telas de configuração (tema, notificações)
  - Telas de erro e empty states
  - Painel TV público
  - Tela de instalação PWA
- **9 fluxos detalhados** (Capítulos 11-17, 45-52)
  - Onboarding, lançamento, campanha, aprovação
  - Aprovação de meta corporativa, notificação, sincronização offline
  - Gestão de sessões, revogação de acesso, LGPD, atualização
- **4 wireframes mobile** específicos (Capítulo 44)
- **Estados de componentes** críticos (Capítulo 43): botão, input, tabela, modal
- **Mapa de telas expandido** v2.0 (Capítulo 53)
- **Padrões visuais e convenções** (Capítulo 54)

## Cobertura por Persona

| Persona | Telas Cobertas | Fluxos Cobertos |
|---------|----------------|-----------------|
| Admin Master | Setup wizard, configurações, auditoria, atualizações, LGPD | Onboarding, atualização sistema |
| Admin Empresa | Usuários, cargos, filiais, indicadores, tema, notificações | Criação usuário, revogação acesso |
| Diretor | Dashboard executivo, metas corporativas | Aprovação meta corporativa |
| Supervisor | Dashboard grupo, visitas, ranking | Campanha grupo |
| Gerente | Dashboard, metas, aprovações, campanhas, resultados | Lançamento, criar campanha, aprovação resultado |
| Vendedor | Dashboard, lançar resultado, ranking, campanhas, perfil, notificações | Lançar resultado, sincronização offline |

## Próximos Passos

1. **Design Figma:** usar este documento como base para mockups de alta fidelidade
2. **Protótipo interativo:** construir no Figma com navegação entre telas
3. **Teste com usuários:** validar fluxos críticos com cada persona
4. **Design System:** extrair componentes (Capítulo 43) para biblioteca
5. **Implementação:** usar wireframes como referência durante desenvolvimento
6. **Iteração:** revisar após testes de usabilidade

## Considerações Finais

- **ASCII art** é uma representação simplificada; o designer tem liberdade para aprimorar visualmente
- **Tamanhos de tela** são aproximados; responsividade é tratada no Capítulo 16
- **Cores** são sugeridas no Capítulo 54; podem variar conforme identidade da empresa
- **Fluxos** são lineares por clareza; condições de erro estão marcadas mas podem ter variações
- **Estados de componente** cobrem casos comuns; casos extremos devem ser tratados caso a caso

---

**Fim do Documento 18 — Wireframes & Fluxos de Navegação v2.0**

**Versão:** 2.0
**Total de capítulos:** 55
**Total de wireframes:** 32+
**Total de fluxos:** 9
**Total de estados de componente:** 4 (botão, input, tabela, modal)
**Total de wireframes mobile:** 4
**Cobertura de personas:** 6/6 (100%)
