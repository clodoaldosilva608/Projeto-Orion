# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 20

# MANUAL DO ADMINISTRADOR

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Manual do Administrador (Admin Master, Admin Empresa, Gerente)

---

## Sumário

- Capítulo 1 — Visão Geral
- Capítulo 2 — Painel Administrativo
- Capítulo 3 — Configuração Inicial (Wizard)
- Capítulo 4 — Gestão de Usuários
- Capítulo 5 — Cargos e Permissões (RBAC)
- Capítulo 6 — Construtor de Indicadores
- Capítulo 7 — Gestão de Metas
- Capítulo 8 — Gestão de Campanhas
- Capítulo 9 — Aprovação de Resultados
- Capítulo 10 — Relatórios
- Capítulo 11 — IA Insights
- Capítulo 12 — Auditoria
- Capítulo 13 — Backup e Restauração
- Capítulo 14 — Licenciamento
- Capítulo 15 — Atualizações
- Capítulo 16 — Integrações
- Capítulo 17 — Configurações de Identidade Visual
- Capítulo 18 — Parâmetros Globais
- Capítulo 19 — Monitoramento e Saúde
- Capítulo 20 — Procedimentos Operacionais (SOPs)
- Capítulo 21 — Troubleshooting Comum
- Capítulo 22 — Contato e Suporte
- Capítulo 23 — Cenários Administrativos Comuns (30+)
- Capítulo 24 — Best Practices por Módulo
- Capítulo 25 — Configurações por Porte de Empresa
- Capítulo 26 — Maintenance Schedules
- Capítulo 27 — Health Check Procedures
- Capítulo 28 — Performance Tuning Guide
- Capítulo 29 — Security Hardening Checklist
- Capítulo 30 — Backup Verification Procedures
- Capítulo 31 — Disaster Recovery Runbook
- Capítulo 32 — User Management Best Practices
- Capítulo 33 — License Management Detailed
- Capítulo 34 — Integration Setup Walkthroughs

---

# Capítulo 1 — Visão Geral

Este manual é destinado aos administradores do Orion: Admin Master (responsável técnico), Admin da Empresa (responsável por dados de negócio) e Gerentes (gestores de equipe). Cada papel tem responsabilidades e permissões diferentes, descritas neste documento.

## 1.1 Papéis e Responsabilidades

### Admin Master
- Instala e atualiza o sistema
- Gerencia licenças e módulos
- Configura parâmetros globais
- Acesso total à auditoria
- Gerencia backups e restaurações
- Gerencia infraestrutura e segurança
- Suporte L3/L4 a usuários
- Monitoramento de saúde do sistema

### Admin da Empresa
- Cadastra filiais, departamentos, usuários
- Cria indicadores e categorias
- Define cargos e permissões
- Configura identidade visual (cores, logo)
- Gerencia idiomas e moedas
- Configura integrações de negócio
- Suporte L1/L2 a usuários
- Acompanha métricas de uso

### Gerente
- Cria metas para a equipe
- Cria campanhas e premiações
- Aprova resultados pendentes
- Visualiza dashboard da equipe
- Consulta IA para insights
- Gerencia sua equipe direta
- Relatórios gerenciais

## 1.2 Separação de ambientes

Para segurança, o Orion mantém:

| Ambiente | URL | Acesso |
|----------|-----|--------|
| App vendedores | `app.suaempresa.com` | Todos usuários |
| Painel admin | `admin.suaempresa.com` | Admin Master, Admin Empresa, Gerentes |
| API | `api.suaempresa.com` | Integrações |
| Health check | `api.suaempresa.com/health` | Público (status only) |
| Logs | `logs.suaempresa.com` | Admin Master |

## 1.3 Princípios fundamentais

Como administrador, você deve seguir:

1. **Menor privilégio:** cada usuário com o mínimo necessário
2. **Auditoria completa:** toda ação crítica é registrada
3. **Backup antes de tudo:** sempre faça backup antes de operações destrutivas
4. **Testar em sandbox:** validar mudanças em ambiente de teste
5. **Documentar:** manter este manual e runbooks atualizados
6. **Comunicar:** avisar usuários de manutenções e mudanças
7. **Monitorar:** acompanhar métricas de saúde continuamente
8. **Educar:** treinar usuários em boas práticas

---

# Capítulo 2 — Painel Administrativo

O painel administrativo fica em domínio separado do app dos vendedores para maior segurança:
- **App vendedores:** `app.suaempresa.com`
- **Painel admin:** `admin.suaempresa.com`

## 2.1 Estrutura do Menu

```
ADMINISTRAÇÃO
├── Dashboard (gerencial)
├── Metas
├── Equipe
├── Campanhas
├── Relatórios
├── IA Insights
├── Configurações
│   ├── Empresa
│   ├── Filiais
│   ├── Departamentos
├── Usuários
├── Cargos e Permissões
│   ├── Indicadores
│   ├── Categorias
│   ├── Temas e Identidade
│   ├── Idiomas e Moeda
│   └── Regras de Cálculo
├── Sistema (apenas Master)
│   ├── Módulos
│   ├── Licenciamento
│   ├── Atualizações
│   ├── Backup
│   ├── Auditoria
│   ├── Integrações
│   └── Parâmetros Globais
└── Sair
```

## 2.2 Dashboard gerencial

A tela inicial do admin mostra:

- Total de usuários ativos
- Filiais ativas
- Resultados lançados hoje
- Aprovações pendentes
- Campanhas ativas
- Erros do sistema (se Master)
- Uso de IA (queries hoje)
- Backup mais recente

## 2.3 Busca global

Use `Ctrl + K` para buscar:

- Usuários (por nome, CPF, e-mail, matrícula)
- Indicadores
- Campanhas
- Metas
- Logs de auditoria
- Configurações

## 2.4 Notificações administrativas

Como admin, você recebe notificações adicionais:

- Usuário bloqueado por tentativas
- Backup falhou
- Licença expira em X dias
- Erro de sistema
- Limite de IA atingido
- Atualização disponível
- Integração com problema

---

# Capítulo 3 — Configuração Inicial (Wizard)

Na primeira vez que o sistema é ativado, um assistente de configuração é exibido em 5 etapas:

## 3.1 Etapa 1 — Dados da Empresa

Preencha:
- Razão Social (obrigatório)
- Nome Fantasia
- CNPJ (validado)
- Inscrição Estadual
- Endereço completo (CEP busca automaticamente)
- Telefone e e-mail de contato
- Logo da empresa (PNG ou SVG, até 2MB)
- Segmento (Farmácia, Supermercado, Varejo, Serviços, Indústria, Outro)

## 3.2 Etapa 2 — Filiais

Cadastre as filiais da empresa:
- Código da filial
- Nome
- Endereço
- Gerente responsável
- Horário de funcionamento
- Fuso horário

Você pode adicionar mais filiais depois (conforme limite da licença).

## 3.3 Etapa 3 — Cargos

O sistema vem com cargos pré-definidos:
- Administrador
- Diretor
- Gerente
- Supervisor
- Vendedor
- Caixa
- Auxiliar

Você pode:
- Editar os existentes
- Criar novos cargos
- Definir permissões para cada cargo

## 3.4 Etapa 4 — Usuário Administrador

Crie o primeiro usuário com perfil de Administrador da Empresa:
- Nome completo
- CPF
- E-mail
- Login
- Senha (deve atender à política: 8+ caracteres, 1 maiúscula, 1 número, 1 especial)

Este usuário terá acesso total ao painel administrativo.

## 3.5 Etapa 5 — Indicadores Iniciais

Escolha como configurar indicadores:

### Opção A: Template por Segmento
Selecione o segmento (Farmácia, Supermercado, Varejo, etc.) e o sistema cria indicadores típicos automaticamente.

Exemplos por segmento:

**Farmácia:**
- Faturamento Total
- Venda de Perfumaria
- Venda de Medicamentos (Receita)
- Venda de Genéricos
- Venda de Éticos
- Ticket Médio
- Clientes Atendidos
- Conversão de Venda
- Itens por Cupom
- Plano Fidelidade

**Supermercado:**
- Faturamento Total
- Número de Clientes
- Ticket Médio
- Itens por Cupom
- Venda de Hortifruti
- Venda de Padaria
- Venda de Açougue
- Conversão de Promoções

**Varejo em Geral:**
- Faturamento
- Clientes
- Ticket Médio
- Conversão
- Devoluções
- Produtos mais vendidos

### Opção B: Começar do Zero
Crie cada indicador manualmente usando o Construtor de Indicadores (Capítulo 6).

### Opção C: Importar
Importe indicadores de outra instalação ou arquivo `.json` de configuração.

## 3.6 Pós-instalação

Após concluir o wizard:

1. **Teste login** com o usuário admin criado
2. **Configure SMTP** para envio de e-mails (Capítulo 18)
3. **Configure backup automático** (Capítulo 13)
4. **Crie usuários** iniciais (Capítulo 4)
5. **Defina metas** do mês corrente (Capítulo 7)
6. **Crie primeira campanha** (Capítulo 8)
7. **Teste PWA** no celular
8. **Documente** URLs e credenciais em local seguro

---

# Capítulo 4 — Gestão de Usuários

## 4.1 Cadastrando um novo usuário

1. Acesse **Configurações > Usuários > Novo Usuário**
2. Preencha os dados:
   - Nome completo (obrigatório)
   - CPF (obrigatório, único)
   - Matrícula (opcional)
   - E-mail (obrigatório, único)
   - Telefone e celular
   - Filial (obrigatório)
   - Cargo (obrigatório)
   - Supervisor (opcional)
3. Defina login e senha temporária
4. Clique em **Criar Usuário**

O usuário receberá um e-mail com credenciais e será obrigado a trocar a senha no primeiro acesso.

## 4.2 Importando usuários em lote

Para cadastrar muitos usuários de uma vez:

1. Acesse **Usuários > Importar**
2. Baixe o template Excel
3. Preencha conforme o template:

```
| nome_completo       | cpf            | matricula | email                  | filial | cargo      | supervisor   |
|---------------------|----------------|-----------|------------------------|--------|------------|--------------|
| Maria Santos Silva  | 12345678901    | V001      | maria@empresa.com      | 001    | Vendedor   | João Gerente |
| Pedro Oliveira      | 98765432100    | V002      | pedro@empresa.com      | 001    | Vendedor   | João Gerente |
| Ana Costa           | 11122233344    | S001      | ana@empresa.com        | 001    | Supervisor | Maria Dir    |
```

4. Envie o arquivo
5. O sistema valida e mostra preview:

```
┌──────────────────────────────────────────────────┐
│  📋 Preview da Importação                        │
│                                                  │
│  ✅ 245 usuários válidos                         │
│  ⚠️ 3 com avisos (CPF sem formatação - OK)       │
│  ❌ 2 com erros (e-mail duplicado)               │
│                                                  │
│  [ Baixar relatório de erros ]                  │
│  [ Cancelar ]   [ Importar 245 válidos ]        │
└──────────────────────────────────────────────────┘
```

6. Confirme a importação

## 4.3 Editando usuário

- Dados pessoais: edite normalmente
- Cargo: mudança gera auditoria
- Filial: mudança requer confirmação (afeta metas históricas)
- Permissões: herda do cargo, mas pode personalizar

## 4.4 Bloqueando/desbloqueando

- **Bloquear:** usuário não pode mais acessar o sistema (mantém dados históricos)
- **Desbloquear:** restaura acesso
- **Excluir:** soft delete — dados preservados, acesso removido
- **Anonimizar:** (LGPD) remove dados pessoais após 2 anos de desligamento

## 4.5 Reset de senha

Como administrador, você pode resetar a senha de um usuário:

1. Acesse o usuário
2. Clique em **Resetar Senha**
3. O sistema gera uma senha temporária
4. Mostre a senha ao usuário (não envie por e-mail em texto)
5. Usuário será obrigado a trocar no próximo login

> **Importante:** Nunca envie a senha temporária por e-mail. Ela deve ser entregue pessoalmente ou por canal seguro.

## 4.6 Desbloqueando conta

Após 5 tentativas inválidas, a conta é bloqueada por 15 minutos. Como admin:

1. Acesse o usuário
2. Clique em **Desbloquear**
3. O bloqueio é removido imediatamente

## 4.7 Offboarding (desligamento)

Quando um funcionário sai da empresa:

1. **Bloquear** usuário (não excluir — mantém histórico)
2. Revogar tokens ativos (Sessões > Encerrar todas)
3. Desativar 2FA (se ativo)
4. Revogar API keys pessoais (se houver)
5. Documentar data de saída no campo "observações"
6. Reatribuir metas/campanhas (se aplicável)
7. Após 2 anos: anonimizar dados pessoais (LGPD)

## 4.8 Movendo usuário entre filiais

Se um usuário muda de filial:

1. Acesse o usuário
2. Edite a filial
3. O sistema alerta sobre impacto em metas históricas
4. Escolha:
   - **Manter histórico na filial antiga** (recomendado)
   - **Migrar histórico** (afeta rankings históricos)
5. Confirme com justificativa
6. Auditoria registra a mudança

## 4.9 Política de senhas

Configure em **Parâmetros Globais > Segurança > Política de Senhas**:

- Mínimo de caracteres (8 padrão, 12 recomendado)
- Exigir maiúscula
- Exigir minúscula
- Exigir número
- Exigir caractere especial
- Não permitir senhas comuns (lista de senhas vazadas)
- Não permitir repetir últimas 5 senhas
- Expiração (90, 180, 365 dias ou nunca)
- Bloqueio após 5 tentativas (15 min)

## 4.10 Verificando atividade suspeita

Em **Usuários > [usuário] > Atividade**, você vê:

- Logins recentes (data, IP, dispositivo, localização)
- Ações suspeitas (login de IP novo, país diferente)
- Mudanças de senha
- Criação/edição de registros

Se houver atividade suspeita:

1. Bloqueie o usuário
2. Reset a senha
3. Notifique o usuário
4. Verifique logs de auditoria

---

# Capítulo 5 — Cargos e Permissões (RBAC)

## 5.1 Criando um cargo

1. Acesse **Configurações > Cargos > Novo Cargo**
2. Nome do cargo (ex: "Vendedor Externo")
3. Descrição
4. Se é cargo de sistema (não pode excluir)
5. Defina as permissões (ver 5.2)

## 5.2 Configurando permissões

Para cada módulo, defina quais ações o cargo pode executar:

| Módulo | Ações possíveis |
|--------|-----------------|
| Usuários | criar, ler, editar, excluir, exportar, importar |
| Metas | criar, ler, editar, excluir, importar |
| Resultados | criar, ler, editar, excluir, aprovar |
| Indicadores | criar, ler, editar, excluir |
| Campanhas | criar, ler, editar, excluir |
| Ranking | ler, exportar |
| Dashboard | ler, configurar |
| Relatórios | ler, exportar, imprimir |
| Auditoria | ler, exportar |
| Configurações | ler, editar |

## 5.3 Hierarquia de cargos

Cargos podem herdar permissões de cargos inferiores:
- Diretor herda de Gerente
- Gerente herda de Supervisor
- Supervisor herda de Vendedor

Isso evita reconfigurar tudo quando criar novo cargo.

## 5.4 Permissões especiais

- **`audit.read`** — acesso a logs de auditoria
- **`license.manage`** — gestão de licenças (só Admin Master)
- **`system.admin`** — acesso total ao sistema
- **`company.config`** — alterar dados da empresa
- **`users.impersonate`** — acessar como outro usuário (debugging)
- **`results.approve`** — aprovar resultados pendentes
- **`ia.manage`** — configurar limites de IA
- **`integrations.manage`** — configurar integrações

## 5.5 Permissões por escopo

Algumas permissões podem ser limitadas por escopo:

- **Próprio:** apenas seus próprios dados
- **Equipe:** dados dos subordinados diretos
- **Filial:** dados de toda a filial
- **Empresa:** dados de todas as filiais

Exemplo: um gerente pode ter `results.read` no escopo **Equipe**, vendo apenas resultados de seus subordinados.

## 5.6 Matriz de permissões recomendada

| Cargo | Usuários | Metas | Resultados | Campanhas | Indicadores | Auditoria |
|-------|----------|-------|------------|-----------|-------------|-----------|
| Admin Master | CRUDall | CRUDall | CRUDall | CRUDall | CRUDall | read |
| Admin Empresa | CRUDall filial | CRUDall filial | read, approve | CRUDall | CRUDall | read (filtrado) |
| Diretor | read | CRUDall empresa | read | CRUDall | read | - |
| Gerente | read equipe | CRUDall equipe | read, approve equipe | CRUDall equipe | read | - |
| Supervisor | read equipe | read equipe | read, approve equipe | read | read | - |
| Vendedor | read self | read self | create self | read | read | - |

## 5.7 Auditoria de permissões

Toda mudança em permissões é auditada:

- Quem alterou
- Quando
- Qual cargo
- Qual permissão foi adicionada/removida
- Justificativa (se exigida pela política)

Reveja permissões trimestralmente (Capítulo 24).

---

# Capítulo 6 — Construtor de Indicadores

Esta é uma das funcionalidades mais poderosas do Orion. Permite criar KPIs personalizados sem programação.

## 6.1 Criando um indicador

1. Acesse **Configurações > Indicadores > Novo Indicador**
2. Preencha:

### Campos básicos
- **Nome:** (ex: "Venda de Perfumes")
- **Descrição:** o que o indicador mede
- **Categoria:** Financeiro, Clientes, Produtos, etc.
- **Tipo:** Moeda, Percentual, Número, Decimal, Tempo, Pontuação

### Aparência
- **Ícone:** escolha da biblioteca (ex: 🌸, 📊, 💊)
- **Cor:** para destacar em dashboards

### Comportamento
- **Casas decimais:** 0, 1, 2, ou 3
- **Peso:** para ranking (1.0 = normal, 1.5 = importante, 0.5 = menos relevante)
- **Exibir em:** Dashboard ✓/✗, Ranking ✓/✗, Relatórios ✓/✗
- **Obrigatório:** se vendedor precisa lançar todo dia

### Fórmula (avançado)
Se quiser que o indicador seja calculado a partir de outros:
- Marque **Usar fórmula personalizada**
- Digite a fórmula (ex: `SUM(sale_items.value WHERE category = 'perfume')`)
- Clique em **Validar Fórmula** para testar

## 6.2 Tipos de indicador

| Tipo | Use para | Exemplo |
|------|----------|---------|
| Moeda | Valores em R$ | Faturamento, Ticket Médio |
| Percentual | Taxas e proporções | Conversão, Atingimento |
| Número | Quantidades | Nº de clientes, Nº de vendas |
| Decimal | Valores precisos | Peso, Volume |
| Tempo | Duração | Tempo médio de atendimento |
| Pontuação | Scores | NPS, Satisfação |

## 6.3 Categorias de indicadores

Organize indicadores em categorias para facilitar navegação:
- **Financeiro:** Faturamento, Ticket Médio, Margem
- **Clientes:** Nº clientes, Conversão, Retenção
- **Produtos:** Marcas exclusivas, Genéricos, Perfumes
- **Operacional:** Tempo atendimento, Produtividade
- **Personalizado:** qualquer outra

## 6.4 Fórmulas avançadas

### Operadores suportados
- Aritméticos: `+`, `-`, `*`, `/`, `%`, `^`
- Comparação: `=`, `<>`, `>`, `<`, `>=`, `<=`
- Lógicos: `AND`, `OR`, `NOT`
- Agregação: `SUM`, `AVG`, `MIN`, `MAX`, `COUNT`
- Condicionais: `IF`, `CASE WHEN`

### Funções especiais
- `SUMI(indicator_name)` — soma de outro indicador no período
- `AVGI(indicator_name)` — média de outro indicador
- `PREVIOUS(period)` — valor do período anterior
- `TODAY()` — data atual
- `DAYS_IN_PERIOD()` — dias no período

### Exemplos

**Ticket Médio:**
```
Faturamento / NumeroClientes
```

**Crescimento vs. mês anterior:**
```
(Faturamento - PREVIOUS(MONTH)) / PREVIOUS(MONTH) * 100
```

**Meta ajustada por dia:**
```
MonthlyGoal / DAYS_IN_PERIOD()
```

**Conversão composta:**
```
IF(NumeroClientes > 0, NumeroVendas / NumeroClientes * 100, 0)
```

## 6.5 Editando e versionando

Quando você edita um indicador existente:
- Uma nova versão é criada
- A versão anterior fica preservada
- Dados históricos continuam associados à versão antiga
- Você pode restaurar versão anterior se necessário

## 6.6 Desativando indicador

- Não é possível excluir (mantém histórico)
- Desative: indicador some de novos lançamentos, mas histórico permanece
- Reative quando quiser

## 6.7 Templates de indicadores

O Orion oferece templates prontos por segmento:

- **Farmácia:** 15 indicadores pré-configurados
- **Supermercado:** 12 indicadores
- **Varejo de Moda:** 10 indicadores
- **Varejo de Eletrônicos:** 8 indicadores
- **Serviços:** 10 indicadores

Aplique via **Indicadores > Aplicar Template**.

---

# Capítulo 7 — Gestão de Metas

## 7.1 Criando meta individual

1. Acesse **Metas > Nova Meta**
2. Selecione escopo: **Individual**
3. Escolha o vendedor
4. Selecione o indicador
5. Defina:
   - Tipo: Diária, Semanal, Mensal, Trimestral, Anual
   - Período: data início e fim
   - Valor-alvo: R$ X ou N unidades
   - Peso: para ranking
6. Opcional: observações
7. Salve

O vendedor receberá notificação sobre a nova meta.

## 7.2 Criando meta para equipe (em lote)

Para criar a mesma meta para todos os vendedores da equipe:

1. Selecione escopo: **Equipe**
2. Escolha a equipe ou filial
3. Configure a meta normalmente
4. O sistema cria uma meta para cada vendedor ativo

## 7.3 Importando metas via Excel

Para muitas metas:

1. Acesse **Metas > Importar**
2. Baixe o template
3. Preencha: vendedor, indicador, tipo, período, valor
4. Envie o arquivo
5. Valide o preview
6. Confirme

## 7.4 Distribuição automática de metas

O Orion pode distribuir metas automaticamente:

- **Por igual:** divide o total igualmente entre todos
- **Por histórico:** baseado na média dos últimos 3 meses
- **Por cargo:** vendedores 100%, supervisores 80%, etc.
- **Por filial:** pesos diferentes por filial
- **Manual:** você define cada uma

## 7.5 Editando meta

- Edite valor, período ou peso
- Mudanças são auditadas
- Versão anterior preservada

## 7.6 Desativando meta

- Meta desativada não conta mais no ranking
- Histórico mantido
- Reativação possível

## 7.7 Simulador de metas

Use o simulador para testar cenários:

1. **Metas > Simular**
2. Selecione vendedor ou equipe
3. Informe valores hipotéticos
4. Veja impacto em:
   - Ranking
   - Atingimento
   - Campanhas
5. Aplique se desejar

## 7.8 Calendário de metas

Em **Metas > Calendário**, veja todas as metas do mês:

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Calendário de Metas — Março 2025                        │
│                                                             │
│  Seg  Ter  Qua  Qui  Sex  Sáb  Dom                         │
│       1    2    3    4    5    6    7                      │
│       •    ••   •    ••   •                                 │
│  8    9    10   11   12   13   14                          │
│  •    •    •    •    ••   •                                 │
│  15   16   17   18   19   20   21                          │
│  •    •    •    •    ••   •                                 │
│  22   23   24   25   26   27   28                          │
│  •    •    •    •    ••   •                                 │
│  29   30   31                                               │
│  •    •    •                                                │
│                                                             │
│  Legenda:                                                   │
│  • Meta diária (5 vendedores)                              │
│  •• Meta semanal (3 equipes)                               │
│  ★ Campanha ativa                                          │
└─────────────────────────────────────────────────────────────┘
```

---

# Capítulo 8 — Gestão de Campanhas

## 8.1 Criando uma campanha

1. Acesse **Campanhas > Nova Campanha**
2. Dados básicos:
   - Nome (ex: "Campanha Dia dos Pais")
   - Descrição
   - Objetivo
   - Período: início e fim

3. Indicadores da campanha:
   - Selecione um ou mais indicadores
   - Defina peso de cada um no ranking da campanha

4. Participantes:
   - Todos os vendedores
   - Equipes específicas
   - Vendedores individuais

5. Premiações:
   - 1º lugar: Medalha Ouro + R$500
   - 2º lugar: Medalha Prata + R$300
   - 3º lugar: Medalha Bronze + R$200
   - Ou configure outras premiações

6. Regras (opcional):
   - Use o Rule Builder visual
   - Ex: "SE vendedor bater 150% da meta da campanha, conceder Troféu Especial"

7. Salve como rascunho ou ative

## 8.2 Ativando uma campanha

- Rascunho: só você vê
- Ativa: vendedores são notificados e acompanham
- Pausada: temporariamente suspensa
- Encerrada: acabou o período

## 8.3 Acompanhando campanha ativa

Na tela da campanha, você vê:
- Ranking atualizado em tempo real
- Quem está ganhando
- Quem subiu/caiu posições
- Engajamento (% de vendedores ativos)

## 8.4 Encerrando campanha

Ao fim do período, o sistema:
- Calcula vencedores automaticamente
- Concede premiações
- Gera relatório final
- Envia para você

Você também pode encerrar manualmente antes do prazo.

## 8.5 Tipos de campanha

### Ranking puro
- Vencedor: quem tiver maior valor no indicador
- Simples e direto
- Ex: "Vendedor com maior faturamento"

### Meta individual
- Vencedor: quem bater a meta
- Pode ter múltiplos vencedores
- Ex: "Bata R$50.000 no mês"

### Por equipe
- Vencedora: equipe com maior média
- Fomenta trabalho em equipe
- Ex: "Equipe com maior conversão"

### Desafio pessoal
- Vencedor: superar recorde próprio
- Apenas vs. si mesmo
- Ex: "Bata seu melhor mês"

### Crescimento
- Vencedor: maior crescimento vs. mês anterior
- Justo para iniciantes
- Ex: "Maior % de crescimento"

### Reativar clientes
- Vencedor: mais clientes inativos reativados
- Estratégico
- Ex: "Ligue para 20 clientes inativos"

## 8.6 Templates de campanhas

Templates prontos para datas comemorativas:

- Dia das Mães
- Dia dos Pais
- Dia das Crianças
- Black Friday
- Natal
- Ano Novo
- Dia da Mulher
- Dia do Consumidor
- Verão
- Inverno

Cada template inclui:

- Sugestão de período
- Indicador recomendado
- Sugestão de premiações
- Imagem/ilustração
- Mensagem para vendedores

Aplique via **Campanhas > Novo a partir de Template**.

---

# Capítulo 9 — Aprovação de Resultados

Alguns indicadores podem exigir aprovação antes de entrarem oficialmente no ranking.

## 9.1 Resultados pendentes

No Dashboard, você vê um card "Aprovações Pendentes" com a contagem. Clique para ver a lista.

## 9.2 Aprovando ou rejeitando

Para cada resultado pendente:

1. Veja detalhes: vendedor, indicador, valor, observações, anexos
2. Decida:
   - **Aprovar:** resultado entra oficialmente
   - **Rejeitar:** peça justificativa, resultado é descartado
3. Sua decisão é auditada

## 9.3 Aprovação em lote

Para aprovar múltiplos resultados:

1. Selecione vários na lista
2. Clique em **Aprovar Selecionados**
3. Confirme

## 9.4 Configurando exigência de aprovação

Por padrão, indicadores não exigem aprovação. Para ativar:

1. Edite o indicador
2. Marque **Exigir aprovação**
3. Defina quem aprova (Gerente, Supervisor)

## 9.5 SLA de aprovação

Configure prazos:

- Aprovação em até 4h (urgente)
- Aprovação em até 24h (padrão)
- Aprovação em até 72h (flexível)

Se exceder, o sistema:

- Notifica o aprovador
- Escala para superior
- Marca como "Atrasado"

## 9.6 Delegação de aprovação

Se você (gerente) vai viajar/férias:

1. **Aprovações > Delegar**
2. Escolha um substituto
3. Defina período
4. Salve

O substituto recebe suas aprovações no período. Auditoria registra quem aprovou o quê.

---

# Capítulo 10 — Relatórios

## 10.1 Relatórios disponíveis

- **Desempenho da Equipe:** ranking completo com todos os indicadores
- **Comparativo de Períodos:** este mês vs. mês anterior
- **Evolução Individual:** histórico de um vendedor específico
- **Análise de Campanha:** resultados de uma campanha encerrada
- **Auditoria:** logs de alterações (apenas Master/Admin)
- **Auditoria de Gestores:** ações gerenciais (Diretor+)
- **Atingimento de Metas:** % de metas batidas por período
- **Produtividade:** lançamentos por usuário, horário
- **Engajamento:** uso do sistema por usuário
- **Consumo de IA:** queries por usuário, custo

## 10.2 Gerando um relatório

1. Acesse **Relatórios**
2. Escolha o tipo
3. Defina filtros (período, vendedor, filial, indicador)
4. Escolha formato: PDF, Excel, ou Tela
5. Clique em **Gerar**

## 10.3 Relatórios agendados

Automatize relatórios recorrentes:

1. Crie um relatório
2. Clique em **Agendar**
3. Defina periodicidade (diário, semanal, mensal)
4. Defina destinatários (e-mails)
5. Salve

O sistema enviará automaticamente por e-mail no horário definido.

## 10.4 Relatórios personalizados

Use o construtor visual:

1. **Relatórios > Novo Personalizado**
2. Arraste campos para a grade
3. Defina filtros
4. Escolha agrupamento
5. Adicione gráficos
6. Salve como template

## 10.5 Compartilhamento de relatórios

- Por e-mail (anexo PDF/Excel)
- Por link (válido por 7 dias)
- No painel (acessível a quem tem permissão)
- Webhook (para sistemas externos)

---

# Capítulo 11 — IA Insights

## 11.1 O que a IA pode fazer

Como gerente/administrador, você tem acesso a insights de IA:

- **Insight diário automático:** resumo executivo das 8h
- **Análise de causa raiz:** "Por que a Loja X vendeu menos?"
- **Previsão de meta:** probabilidade de atingir meta mensal
- **Sugestão de campanhas:** baseadas no histórico e calendário
- **Relatório narrativo:** em linguagem natural

## 11.2 Consultando a IA

1. Acesse **IA Insights**
2. Veja insights automáticos no topo
3. Use o chat para perguntas específicas:
   - "Quais vendedores tiveram queda no ticket médio?"
   - "Previsão de fechamento da Loja Centro"
   - "Sugira uma campanha para outubro"
4. A IA responde baseada nos seus dados

## 11.3 Custo da IA

Cada empresa tem limite mensal de queries:
- Visualize uso em **IA > Consumo**
- Alertas em 50%, 80%, 100%
- Bloqueio ao atingir limite (com opção de upgrade)

## 11.4 Aceitando sugestões

A IA sugere ações. Você decide:
- **Aceitar:** ação é executada
- **Recusar:** sugestão é descartada
- **Modificar:** ajusta antes de aceitar

Toda decisão é auditada.

## 11.5 Configurando limites de IA

Em **IA > Configurações**:

- Limite mensal de queries (por empresa)
- Limite por usuário (opcional)
- Tipos de IA habilitados (insights, chat, projeções)
- Filtros de dados (LGPD — quais dados a IA pode acessar)
- Horário de geração de insights automáticos

## 11.6 Prompts pré-configurados

Disponibilize perguntas frequentes para sua equipe:

- "Como está minha equipe hoje?"
- "Quem são os destaques do mês?"
- "Quem precisa de atenção?"

Em **IA > Prompts Pré-configurados** > criar/atualizar.

---

# Capítulo 12 — Auditoria

## 12.1 Consultando logs

Acesse **Sistema > Auditoria** (apenas Admin Master) ou **Auditoria** (Admin Empresa).

Filtros disponíveis:
- Período
- Usuário
- Ação (create, update, delete, login, etc.)
- Tabela afetada
- Registro específico

## 12.2 O que está auditado

- Login e logout (com IP)
- Criação, edição, exclusão de qualquer registro
- Aprovação/rejeição de resultados
- Alterações de permissões
- Alterações de metas e indicadores
- Acesso a dados sensíveis (CPF, relatórios)
- Configurações do sistema
- Backup e restauração
- Alterações de licença
- Uso de IA (queries)
- Integrações (chamadas de API)

## 12.3 Exportando logs

Para investigações ou compliance:

1. Aplique filtros
2. Clique em **Exportar CSV** ou **PDF**
3. Arquivo é gerado com todos os registros filtrados

## 12.4 Retenção

- Logs de auditoria: 5 anos
- Logs de sistema: 90 dias
- Logs de erro: 1 ano
- Logs de acesso (login/logout): 2 anos
- Logs de IA: 1 ano

Nenhum log pode ser apagado manualmente.

## 12.5 Alertas de auditoria

Configure alertas automáticos:

- Mudança de permissões críticas
- Acesso a dados sensíveis fora do horário
- Login de IP desconhecido
- Múltiplas tentativas de login falhas
- Exportação de grande volume de dados
- Backup restaurado
- Licença alterada

Em **Sistema > Auditoria > Alertas**.

## 12.6 Investigação de incidentes

Para investigar um incidente:

1. Identifique o período do incidente
2. Filtre auditoria por período
3. Identifique usuários ativos no período
4. Cruze com logs de acesso
5. Verifique alterações em registros relevantes
6. Documente conclusões
7. Aplique medidas corretivas

---

# Capítulo 13 — Backup e Restauração (Admin Master)

## 13.1 Tipos de backup

- **Manual:** você clica em "Criar Backup"
- **Automático:** diário às 02h (configurável)
- **Agendado:** você define periodicidade
- **Pré-atualização:** automático antes de qualquer atualização
- **Pré-operação crítica:** automático antes de deleções em massa

## 13.2 Criando backup manual

1. Acesse **Sistema > Backup**
2. Clique em **Criar Backup Manual**
3. Aguarde (pode levar alguns minutos)
4. Backup aparece na lista

## 13.3 Restaurando backup

⚠️ **Operação crítica** — restaura o sistema ao estado do backup

1. Selecione o backup na lista
2. Clique em **Restaurar**
3. Digite sua senha para confirmar
4. Sistema valida integridade do backup
5. Confirme novamente
6. Sistema é reiniciado com dados do backup

Toda restauração é auditada.

## 13.4 Exportando backup

Para guardar fora do sistema:

1. Selecione o backup
2. Clique em **Exportar**
3. Arquivo `.bak` é baixado
4. Guarde em local seguro

## 13.5 Configurando retenção

- Padrão: 30 dias (configurável)
- Backups antigos são automaticamente removidos
- Você pode proteger backups específicos (não expiram)

## 13.6 Backup externo (recomendado)

Configure backup adicional para outro local:

- **S3 AWS:** configure bucket + credenciais
- **Google Cloud Storage:** configure bucket
- **Azure Blob Storage:** configure container
- **FTP/SFTP:** configure servidor

Em **Sistema > Backup > Destino Externo**.

## 13.7 Verificação de backup

NÃO basta criar backups — é preciso verificar:

1. Backup criado: ✅ ok
2. Backup integro: ✅ (validação automática)
3. Backup restaurável: ⚠️ testar mensalmente

Ver procedimento completo no Capítulo 30.

## 13.8 Retenção vs. LGPD

- Backups contêm dados pessoais
- LGPD exige exclusão sob solicitação
- Solução: ao restaurar backup antigo, executar script de anonimização
- Documentar processo no Capítulo 31

---

# Capítulo 14 — Licenciamento (Admin Master)

## 14.1 Status da licença

Acesse **Sistema > Licença** para ver:
- Plano atual (Starter, Professional, Enterprise)
- Data de ativação
- Data de expiração
- Limite de usuários e filiais
- Módulos habilitados
- Status

## 14.2 Ativando nova licença

1. Obtenha nova chave com o fornecedor
2. Acesse **Sistema > Licença > Ativar Nova Licença**
3. Digite a chave
4. Sistema valida online (ou offline)
5. Confirme

## 14.3 Verificação de limite

Se tentar criar usuário além do limite:
- Sistema bloqueia
- Exibe mensagem: "Limite de usuários atingido (X de Y)"
- Sugere upgrade de plano

## 14.4 Renovação

- Sistema notifica 30 dias antes da expiração
- Após expirar: 7 dias de carência (somente leitura)
- Após carência: bloqueio total (apenas admin pode exportar dados)

## 14.5 Planos disponíveis

| Plano | Usuários | Filiais | IA queries/mês | Módulos | Suporte |
|-------|----------|---------|----------------|---------|---------|
| Starter | 50 | 3 | 500 | Básicos | Email 48h |
| Professional | 500 | 20 | 5.000 | + IA, Integrações | Email 24h |
| Enterprise | Ilimitado | Ilimitado | 50.000+ | Todos | Phone 4h + SLA |
| Custom | Custom | Custom | Custom | Custom | Custom SLA |

## 14.6 Upgrade e downgrade

### Upgrade
- Imediato após pagamento
- Novos limites aplicados
- Não há perda de dados
- Pró-rateamento do valor

### Downgrade
- Só efetivo no fim do período atual
- Se exceder novos limites: bloqueio até adequação
- Não há perda de dados (mas pode haver ocultação)

## 14.7 Compliance de licença

Monitore uso para evitar surpresas:

- Usuários ativos vs. limite
- Filiais ativas vs. limite
- Queries de IA vs. limite
- Espaço de armazenamento vs. limite

Em **Sistema > Licença > Uso Atual**.

---

# Capítulo 15 — Atualizações (Admin Master)

## 15.1 Verificando atualizações

- Verificação automática: a cada 24h
- Manual: **Sistema > Atualizações > Verificar Agora**

## 15.2 Aplicando atualização

1. Veja o changelog da nova versão
2. Clique em **Atualizar Agora**
3. Sistema cria backup automático (CRÍTICO)
4. Download da nova versão
5. Aplicação das migrations
6. Reinicialização do sistema

## 15.3 Rollback

Se algo der errado:

1. Sistema detecta falha automaticamente
2. Restaura backup criado antes da atualização
3. Volta à versão anterior
4. Exibe relatório do erro

## 15.4 Atualizações automáticas

Você pode habilitar:
- **Auto-update de segurança:** aplicada automaticamente
- **Auto-update de minor:** aplicada com 7 dias de delay
- **Auto-update de major:** sempre manual (breaking changes)

## 15.5 Janela de manutenção

Configure horário de baixo uso para atualizações:

- Dia da semana (ex: domingo)
- Horário (ex: 02h-05h)
- Duração máxima (ex: 2h)

O sistema:

- Envia notificação a usuários 24h antes
- Avisa durante o processo
- Restaura acesso após conclusão

## 15.6 Versionamento

Versões seguem SemVer: `MAJOR.MINOR.PATCH`

- **PATCH (1.0.1):** correções de bugs, sem breaking changes
- **MINOR (1.1.0):** novas features, sem breaking changes
- **MAJOR (2.0.0):** breaking changes, exige migração

## 15.7 Changelog

Cada versão traz changelog detalhado:

- ✅ Novas funcionalidades
- 🐛 Correções de bugs
- ⚠️ Mudanças breaking
- 🔒 Correções de segurança
- 📊 Melhorias de performance
- 🗑️ Depreciações

Leia atentamente antes de atualizar.

---

# Capítulo 16 — Integrações (Admin Master)

## 16.1 Integrações disponíveis

- **Webhooks:** para sistemas externos
- **API REST:** para integração customizada
- **ERP:** Totvs, SAP B1, Sankhya (v2.0)
- **CRM:** Salesforce, HubSpot (v3.0)
- **WhatsApp:** notificações via WhatsApp (plugin)
- **Telegram:** notificações via Telegram (plugin)
- **Slack:** notificações em canais
- **Microsoft Teams:** notificações em canais
- **Power BI:** exportação de dados
- **Zapier:** conecta com 3.000+ apps
- **Make (Integromat):** automações

## 16.2 Configurando webhook

1. Acesse **Sistema > Integrações > Webhooks**
2. Clique em **Novo Webhook**
3. Defina:
   - URL de destino
   - Eventos que disparam (ex: goal.created, result.approved)
   - Headers customizados
   - Segredo (para assinatura HMAC)
4. Salve
5. Teste com botão **Enviar Evento Teste**

## 16.3 API Key

Para integração via API:

1. Acesse **Sistema > Integrações > API Keys**
2. Clique em **Nova API Key**
3. Defina nome, permissões, expiração
4. Copie a chave (não será mostrada novamente!)
5. Use nos seus sistemas externos

## 16.4 Integração com ERP (Totvs)

Passo a passo:

1. **Sistema > Integrações > ERP > Totvs**
2. Configure:
   - URL do serviço Totvs
   - Usuário e senha
   - Código da empresa no Totvs
   - Filial correspondente
3. Mapeamento de campos:
   - Produto: `produto_cod` → `orion_product_id`
   - Vendedor: `vendedor_cod` → `orion_user_id`
   - Venda: `nota_fiscal` → `orion_sale_id`
4. Defina frequência de sincronização (ex: a cada 15 min)
5. Teste conexão
6. Ative

## 16.5 Integração com WhatsApp

Para enviar notificações via WhatsApp:

1. **Sistema > Integrações > WhatsApp**
2. Escolha provedor:
   - **WhatsApp Business API oficial** (Meta)
   - **Z-API** (não oficial)
   - **Evolution API** (self-hosted)
3. Configure credenciais
4. Configure template de mensagens
5. Defina quais notificações enviar por WhatsApp
6. Teste enviando mensagem para seu número

## 16.6 Logs de integração

Em **Sistema > Integrações > Logs**, veja:

- Últimas chamadas (sucesso/falha)
- Latência média
- Erros recentes
- Volume por dia

Configure alertas para falhas prolongadas.

---

# Capítulo 17 — Configurações de Identidade Visual

## 17.1 Personalizando cores

Acesse **Configurações > Temas e Identidade**:

- **Cor primária:** substitui o azul padrão
- **Cor secundária:** para elementos de destaque
- **Cor de fundo:** branco, cinza claro, ou personalizado
- **Modo padrão:** claro, escuro, ou seguir sistema

## 17.2 Logo

- Faça upload de PNG (recomendado 512x512) ou SVG
- Logo aparece no header, login e relatórios
- Tamanho máximo: 2MB

## 17.3 Nome exibido

- Nome que aparece no header e no título do browser
- Pode ser diferente da razão social

## 17.4 Temas pré-definidos

Escolha temas prontos:
- Padrão (azul corporativo)
- Verde (saúde/farmácia)
- Vermelho (varejo alimentício)
- Roxo (cosméticos)
- Personalizado

## 17.5 Personalização avançada

Para identidade visual completa:

- **Favicon:** ícone na aba do navegador
- **Splash screen:** tela de carregamento do PWA
- **Cores de status:** verde/amarelo/vermelho personalizáveis
- **Fonte:** escolha da biblioteca Google Fonts
- **Logo secundário:** para relatórios (versão monocromática)

## 17.6 Preview de mudanças

Antes de aplicar mudanças visualmente:

1. Faça alterações em **Tema > Editar**
2. Clique em **Preview**
3. Veja como ficaria em telas diferentes (desktop, mobile, tablet)
4. Aprove ou ajuste
5. Publique quando estiver satisfeito

---

# Capítulo 18 — Parâmetros Globais (Admin Master)

## 18.1 Configurações disponíveis

- **Idioma padrão:** para novos usuários
- **Timezone padrão:** para a empresa
- **Moeda:** R$ (padrão), USD, EUR (multi-moeda v3.0)
- **Política de senhas:** mínimo de caracteres, complexidade
- **Tentativas de login:** antes do bloqueio (padrão: 5)
- **Tempo de sessão:** tempo até expirar (padrão: 8h)
- **Retenção de logs:** 5 anos (mínimo LGPD)
- **Retenção de backups:** 30 dias (configurável)

## 18.2 Notificações globais

- Servidor SMTP para envio de e-mails
- Template de e-mail de boas-vindas
- Template de e-mail de reset de senha
- Remetente padrão (ex: noreply@suaempresa.com)

## 18.3 Configurando SMTP

1. **Parâmetros > E-mail > SMTP**
2. Preencha:
   - Host: `smtp.gmail.com` (exemplo)
   - Porta: `587`
   - Usuário: `seu-email@gmail.com`
   - Senha: `app-password` (não a senha normal)
   - TLS: habilitado
3. Clique em **Testar envio**
4. Informe um e-mail destinatário
5. Verifique se chegou

> **Dica:** Para Gmail, use "App Password" (não a senha principal). Crie em security.google.com.

## 18.4 Configurações de IA

- Provedor (OpenAI, Anthropic, Azure OpenAI)
- API Key
- Modelo padrão (ex: gpt-4o-mini para chat, gpt-4o para análises)
- Limite mensal de queries
- Limite de tokens por query
- Filtros de dados (LGPD)
- Fallback behavior (se IA indisponível)

## 18.5 Configurações de cache

- TTL padrão do cache (segundos)
- Cache de ranking: habilitado, TTL 300s
- Cache de dashboard: habilitado, TTL 60s
- Cache de metas: habilitado, TTL 600s
- Invalidação automática ao atualizar dados

## 18.6 Configurações de rate limiting

- API REST: 1000 req/min por usuário
- API REST: 10000 req/min por IP
- Login: 5 tentativas por 5 min
- Reset de senha: 3 por hora por IP
- IA: 10 queries/min por usuário

## 18.7 Configurações de segurança

- Forçar HTTPS (recomendado)
- HSTS header
- CSP header
- X-Frame-Options: DENY
- Cookie httpOnly, secure, sameSite=strict
- 2FA obrigatório para admins
- IP whitelist (opcional)

---

# Capítulo 19 — Monitoramento e Saúde

## 19.1 Dashboard de sistema

Acesse **Sistema > Status** para ver:
- Uso de CPU e RAM
- Espaço em disco
- Conexões ativas
- Latência média
- Erros recentes

## 19.2 Logs de erro

Acesse **Sistema > Logs**:
- Erros recentes com stack trace
- Filtre por severidade
- Exporte para análise

## 19.3 Health check

Endpoint: `https://api.suaempresa.com/health`

Retorna status de:
- Banco de dados
- Redis
- Storage
- Serviços externos

Exemplo de resposta:

```json
{
  "status": "healthy",
  "timestamp": "2025-03-12T14:35:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy",
    "email": "degraded",
    "ia": "healthy"
  },
  "metrics": {
    "uptime_seconds": 86400,
    "requests_per_minute": 245,
    "avg_response_ms": 145,
    "error_rate": 0.02
  }
}
```

## 19.4 Alertas proativos

Configure alertas:

- CPU > 80% por 5 min
- RAM > 90% por 5 min
- Disco > 85%
- Latência > 2s por 5 min
- Erro rate > 1%
- Backup falhou
- Licença expira em 30 dias
- IA indisponível

Envie alertas para:

- E-mail
- Slack
- Microsoft Teams
- Webhook
- PagerDuty

## 19.5 Métricas de negócio

Acompanhe:

- Usuários ativos diários (DAU)
- Resultados lançados por dia
- Aprovações pendentes há mais de 24h
- Campanhas ativas
- Engajamento (% usuários ativos)
- Uso de IA

## 19.6 Logs centralizados

Integre com:

- Datadog
- New Relic
- Sentry
- ELK Stack (Elasticsearch + Logstash + Kibana)
- Grafana + Loki

Configure via **Sistema > Monitoramento > Logs Externos**.

---

# Capítulo 20 — Procedimentos Operacionais (SOPs)

Procedimentos operacionais padrão (Standard Operating Procedures) para situações comuns.

## 20.1 Onboarding de novo gerente

Quando um novo gerente entrar:

1. Crie usuário com cargo "Gerente"
2. Mostre este manual
3. Configure 2FA (obrigatório para gerente)
4. Apresente o dashboard gerencial
5. Ensine a criar metas e campanhas
6. Treine em aprovação de resultados
7. Configure delegação de aprovações (férias)
8. Agende acompanhamento em 30 dias

**Documentação:**
- Checklist de onboarding impresso
- Vídeos de treinamento (Capítulo 28)
- Acesso à base de conhecimento
- Contato do admin da empresa

## 20.2 Offboarding de funcionário

Quando um funcionário sair da empresa:

1. **No mesmo dia:**
   - Bloquear usuário (não excluir)
   - Revogar tokens ativos
   - Desativar 2FA
   - Revogar API keys pessoais
   - Documentar data de saída
   - Reatribuir metas/campanhas (se aplicável)

2. **Em 30 dias:**
   - Confirmar com RH se pode anonimizar
   - Backup final dos dados do usuário

3. **Em 2 anos:**
   - Anonimizar dados pessoais (LGPD)
   - Manter apenas dados comerciais agregados

## 20.3 Migração de servidor

Se precisar migrar o Orion para outro servidor:

1. Backup completo
2. Instale Orion no novo servidor
3. Restaure o backup
4. Valide com smoke tests:
   - Login funciona
   - Lançamento de resultado funciona
   - Ranking atualiza
   - Notificações chegam
   - IA responde
5. Atualize DNS
6. Mantenha servidor antigo por 7 dias (rollback)
7. Desligue servidor antigo

## 20.4 Rotação de senha de serviço

Senhas de serviços (banco, SMTP, APIs) devem ser rotacionadas:

- Banco de dados: a cada 90 dias
- SMTP: a cada 90 dias
- API keys externas: a cada 90 dias
- 2FA admin: a cada 180 dias (re-emitir backup codes)

Procedimento:

1. Gere nova senha/credencial
2. Atualize em **Parâmetros Globais**
3. Teste integração
4. Confirme funcionamento por 24h
5. Revogue credencial antiga
6. Documente

## 20.5 Revisão trimestral de permissões

A cada trimestre:

1. Exporte matriz de usuários × cargos
2. Verifique mudanças no quadro
3. Confirme com gestores se permissões ainda adequadas
4. Revogue permissões não utilizadas
5. Documente revisão (auditoria)

## 20.6 Fechamento mensal

No fim de cada mês:

1. **Dia 1 do mês seguinte, 8h:**
   - Verifique se todos os resultados foram lançados
   - Aprove pendências críticas
   - Encerre campanhas do mês anterior

2. **Dia 2:**
   - Gere relatório de fechamento
   - Envie para diretoria
   - Processe premiações

3. **Dia 5:**
   - Defina metas do novo mês
   - Configure novas campanhas
   - Notifique vendedores

## 20.7 Backup mensal de verificação

Toda primeira segunda-feira do mês:

1. Pegue o backup mais recente
2. Restaure em ambiente de teste
3. Valide:
   - Login funcionou
   - Dados estão íntegros
   - Quantidade de registros confere
4. Documente o teste
5. Se houver problema: investigar antes do próximo backup

## 20.8 Aplicação de patch de segurança

Quando houver patch de segurança crítico:

1. **Imediatamente:**
   - Leia o changelog
   - Avalie impacto
   - Avise usuários sobre manutenção emergencial

2. **Em até 4h:**
   - Backup completo
   - Aplique patch em ambiente de teste
   - Smoke tests
   - Aplique em produção
   - Valide

3. **Pós-aplicação:**
   - Documente
   - Verifique logs de erro
   - Acompanhe por 48h

## 20.9 Investigação de incidente de segurança

Se houver suspeita de incidente (login suspeito, vazamento):

1. **Isolamento (até 1h):**
   - Bloqueie usuários suspeitos
   - Revogue tokens
   - Verifique IPs anômalos

2. **Investigação (até 24h):**
   - Analise logs de auditoria
   - Identifique registros acessados
   - Avalie impacto

3. **Notificação (até 72h):**
   - Notifique ANPD se for vazamento pessoal (LGPD)
   - Notifique usuários afetados
   - Documente incidente

4. **Remediação:**
   - Corrija vulnerabilidade
   - Requisite reset de senhas
   - Reforce treinamento

## 20.10 Resposta a insatisfação de cliente (gestor)

Se um gestor reclamar do sistema:

1. Ouça com atenção
2. Documente a reclamação
3. Identifique se é:
   - Bug → abrir ticket
   - Dúvida → treinar
   - Sugestão → encaminhar ao produto
4. Acompanhe resolução
5. Notifique o gestor da solução
6. Acompanhe satisfação pós-resolução

---

# Capítulo 21 — Troubleshooting Comum

## 21.1 Sistema lento

1. Verifique uso de CPU/RAM em **Status**
2. Se CPU > 80%: reinicie serviços
3. Se RAM > 90%: investigue memory leak
4. Verifique disco (backup acumulado?)
5. Reinicie se necessário

## 21.2 Usuário não recebe e-mail

1. Verifique SMTP em **Parâmetros > E-mail**
2. Verifique spam do usuário
3. Teste envio em **Sistema > Testar E-mail**
4. Verifique logs de erro
5. Verifique se o e-mail do usuário está correto

## 21.3 Licença expirou inesperadamente

1. Verifique validade em **Sistema > Licença**
2. Verifique se há conexão com internet (validação online)
3. Contate o fornecedor

## 21.4 Backup falhou

1. Verifique espaço em disco
2. Verifique permissões da pasta de backup
3. Tente backup manual
4. Veja logs de erro
5. Se persistir, contate suporte

## 21.5 Atualização falhou

1. Sistema deve ter feito rollback automático
2. Se não restaurou: restaure último backup manualmente
3. Não tente atualizar novamente sem análise
4. Contate suporte com logs da falha

## 21.6 Usuário não consegue logar

1. Verifique se conta está ativa
2. Verifique se não está bloqueada (5 tentativas)
3. Verifique se 2FA está funcionando
4. Verifique se e-mail/senha estão corretos
5. Veja logs de login em **Auditoria**

## 21.7 Resultados não aparecem no ranking

1. Verifique se foram aprovados (se exigirem aprovação)
2. Verifique se o indicador está no ranking
3. Verifique se a data está correta
4. Force recálculo: **Sistema > Recalcular Rankings**

## 21.8 IA não responde

1. Verifique status em **Sistema > Status > IA**
2. Verifique se há crédito no **Sistema > IA > Consumo**
3. Verifique se API key é válida
4. Reinicie serviço de IA
5. Contate suporte se persistir

## 21.9 Webhook não dispara

1. Verifique configuração do webhook
2. Verifique URL de destino (acessível?)
3. Veja logs em **Sistema > Integrações > Webhooks > Logs**
4. Teste com botão **Enviar Evento Teste**
5. Verifique se há fila de webhooks presa

## 21.10 Erro 500 em telas

1. Veja logs em **Sistema > Logs**
2. Identifique stack trace
3. Tente reproduzir o erro
4. Se for bug: contate suporte com logs
5. Se for dados corrompidos: restaure backup

---

# Capítulo 22 — Contato e Suporte

## 22.1 Níveis de suporte

| Nível | Quando | Contato |
|-------|--------|---------|
| L1 - Básico | Dúvidas de uso | Supervisor ou gerente |
| L2 - Avançado | Problemas de configuração | Admin da empresa |
| L3 - Técnico | Bugs, falhas | Fornecedor (suporte@orion.com) |
| L4 - Crítico | Sistema indisponível | Fornecedor (telefone 24h) |

## 22.2 Antes de contatar suporte

Tenha em mãos:
- Versão do Orion (**Sistema > Sobre**)
- Descrição do problema
- Prints de erro
- Logs relevantes (exporte de **Sistema > Logs**)
- Data e hora do problema
- Usuário afetado

## 22.3 SLA de suporte

| Severidade | Tempo de resposta |
|------------|-------------------|
| P0 - Sistema indisponível | 1h |
| P1 - Funcionalidade核心 não funciona | 4h |
| P2 - Bug com workaround | 1 dia útil |
| P3 - Dúvida ou bug pequeno | 3 dias úteis |

---

# Capítulo 23 — Cenários Administrativos Comuns (30+)

## Cenário 1: Adicionar nova filial

**Situação:** Empresa abriu nova loja.

**Passo a passo:**
1. Verifique limite de filiais em **Sistema > Licença**
2. Se exceder: faça upgrade primeiro
3. **Configurações > Filiais > Nova Filial**
4. Preencha: código, nome, endereço, gerente, horário
5. Salve
6. Crie usuários para a nova filial
7. Configure metas para a nova filial
8. Teste login com um usuário da nova filial

## Cenário 2: Migrar usuários entre filiais

**Situação:** Reorganização interna.

**Passo a passo:**
1. Liste usuários afetados
2. **Usuários > Editar > Filial**
3. Escolha manter histórico na filial antiga
4. Justifique a mudança
5. Auditoria registra
6. Reconfigure metas se necessário

## Cenário 3: Reset de senha em massa

**Situação:** Vazamento de senhas suspeito.

**Passo a passo:**
1. **Sistema > Segurança > Reset em Massa**
2. Selecione: todos, ou filial específica, ou cargo específico
3. Defina: forçar troca no próximo login
4. Gere senhas temporárias
5. Exporte lista (CSV)
6. Distribua de forma segura (não por e-mail)
7. Acompanhe trocas

## Cenário 4: Criar campanha sazonal

**Situação:** Black Friday chegando.

**Passo a passo:**
1. **Campanhas > Novo a partir de Template > Black Friday**
2. Ajuste período (última semana de novembro)
3. Defina indicador (Faturamento)
4. Configure premiações:
   - 1º: R$2.000 + Troféu
   - 2º: R$1.000 + Medalha
   - 3º: R$500 + Medalha
5. Adicione imagem promocional
6. Salve como rascunho
7. Ative 7 dias antes do início
8. Monitore engajamento diariamente

## Cenário 5: Investigar queda de desempenho

**Situação:** Filial X caiu 30% no faturamento.

**Passo a passo:**
1. Verifique ranking da filial
2. Identifique vendedores com maior queda
3. Use IA: "Por que a filial X caiu?"
4. Verifique:
   - Houve troca de equipe?
   - Houve problema operacional?
   - Campanha terminou?
   - Sazonalidade?
5. Aplique correção:
   - Treinar vendedores
   - Criar campanha motivacional
   - Ajustar metas
6. Acompanhe semanalmente

## Cenário 6: Configurar nova integração

**Situação:** Integrar com Totvs.

**Passo a passo:**
1. Obtenha credenciais do Totvs com TI
2. **Sistema > Integrações > ERP > Totvs**
3. Configure URL, usuário, senha
4. Faça mapeamento de campos
5. Teste conexão
6. Configure frequência (15 min)
7. Ative
8. Monitore logs por 24h

## Cenário 7: Bloquear funcionário desligado

**Situação:** Funcionário foi demitido.

**Passo a passo:**
1. Confirme com RH a data de desligamento
2. **Usuários > [usuário] > Bloquear**
3. Confirme
4. Revogue tokens em **Sessões > Encerrar todas**
5. Desative 2FA
6. Revogue API keys pessoais
7. Documente data no campo observações
8. Reatribua metas/campanhas (se aplicável)

## Cenário 8: Resolver conflito de metas

**Situação:** Vendedor reclama que meta está errada.

**Passo a passo:**
1. Verifique a meta em **Metas**
2. Confirme valores e período
3. Compare com histórico do vendedor
4. Se errada: edite e justifique
5. Se correta: explique o cálculo ao vendedor
6. Documente conversa

## Cenário 9: Aplicar atualização crítica

**Situação:** Patch de segurança urgente.

**Passo a passo:**
1. Leia changelog
2. Avalie impacto
3. Avise usuários sobre manutenção emergencial
4. Backup completo
5. Aplique patch em ambiente de teste
6. Smoke tests
7. Aplique em produção
8. Valide
9. Acompanhe 48h

## Cenário 10: Restaurar backup após erro

**Situação:** Atualização quebrou o sistema.

**Passo a passo:**
1. Tente rollback automático primeiro
2. Se não funcionou: **Sistema > Backup > Restaurar**
3. Selecione backup pré-atualização
4. Confirme com senha
5. Aguarde restauração
6. Smoke tests
7. Avise usuários
8. Documente incidente

## Cenário 11: Configurar 2FA para todos admins

**Situação:** Política de segurança nova.

**Passo a passo:**
1. Comunique admins sobre nova política
2. Dê prazo: 7 dias para ativar
3. Acompanhe adesão em **Usuários > 2FA Status**
4. Após prazo, force 2FA em **Parâmetros > Segurança > 2FA Obrigatório para Admins**
5. Usuários sem 2FA são bloqueados no login
6. Ajude quem teve dificuldade

## Cenário 12: Ativar módulo de IA

**Situação:** Empresa contratou módulo IA.

**Passo a passo:**
1. Confirme ativação com fornecedor
2. **Sistema > Licença** > ver módulo IA ativo
3. **Parâmetros > IA** > configurar provedor e API key
4. Defina limites mensais
5. Defina filtros LGPD
6. Ative para cargos específicos (Gerente, Diretor)
7. Teste com poucos usuários
8. Libere para todos

## Cenário 13: Configurar WhatsApp

**Situação:** Empresa quer notificações via WhatsApp.

**Passo a passo:**
1. Escolha provedor (Meta oficial recomendado)
2. Obtenha credenciais
3. **Sistema > Integrações > WhatsApp**
4. Configure credenciais
5. Crie templates de mensagens
6. Aprove templates no Meta Business
7. Defina quais notificações enviar
8. Teste enviando para seu número

## Cenário 14: Migrar de plano (upgrade)

**Situação:** Empresa cresceu, precisa de mais usuários.

**Passo a passo:**
1. Verifique uso atual vs. limite em **Sistema > Licença**
2. Contate fornecedor para nova licença
3. Receba nova chave
4. **Sistema > Licença > Ativar Nova Licença**
5. Digite a chave
6. Valide online
7. Confirme
8. Novos limites são aplicados imediatamente

## Cenário 15: Configurar relatório automático

**Situação:** Diretoria quer relatório toda segunda às 8h.

**Passo a passo:**
1. **Relatórios > Novo**
2. Configure: Desempenho da Equipe, semana anterior
3. Clique em **Agendar**
4. Periodicidade: semanal (segunda)
5. Horário: 08:00
6. Destinatários: diretoria@empresa.com
7. Formato: PDF
8. Salve

## Cenário 16: Responder a incidente de segurança

**Situação:** Detectado login suspeito.

**Passo a passo:**
1. Bloqueie usuário suspeito
2. Revogue tokens
3. Investigue logs de auditoria
4. Identifique IPs e horários
5. Verifique acessos a dados sensíveis
6. Notifique usuário (se legítimo, esclareça)
7. Se vazamento: notifique ANPD em 72h
8. Documente incidente

## Cenário 17: Treinar novo admin

**Situação:** Promoção de admin.

**Passo a passo:**
1. Crie usuário com cargo Admin Empresa
2. Configure 2FA (obrigatório)
3. Apresente este manual
4. Treine em:
   - Gestão de usuários
   - Cargos e permissões
   - Indicadores e metas
   - Campanhas
   - Relatórios
5. Acompanhe por 30 dias
6. Libere autonomia total

## Cenário 18: Anonimizar dados de ex-funcionário

**Situação:** Funcionário saiu há 2 anos.

**Passo a passo:**
1. Verifique data de desligamento
2. Confirme com RH que pode anonimizar
3. **Usuários > [usuário] > Anonimizar (LGPD)**
4. Confirme com senha
5. Sistema:
   - Remove CPF, e-mail, telefone
   - Mantém dados comerciais agregados
   - Auditoria registra anonimização
6. Documente

## Cenário 19: Configurar IP whitelist

**Situação:** Empresa quer restringir acesso por IP.

**Passo a passo:**
1. **Parâmetros > Segurança > IP Whitelist**
2. Ative recurso
3. Adicione IPs permitidos (empresa, filiais)
4. Defina comportamento: bloquear ou avisar
5. Teste com usuário fora do IP
6. Monitore bloqueios em **Auditoria**

## Cenário 20: Migrar de servidor

**Situação:** Servidor antigo não aguenta mais.

**Passo a passo:**
1. Provisione novo servidor
2. Instale Orion (mesma versão)
3. Backup completo do antigo
4. Restaure no novo
5. Smoke tests no novo
6. Atualize DNS (aponte para novo)
7. Aguarde propagação DNS (24-48h)
8. Mantenha antigo por 7 dias (rollback)
9. Desligue antigo

## Cenário 21: Resolver lentidão do sistema

**Situação:** Usuários reclamam de lentidão.

**Passo a passo:**
1. Verifique **Sistema > Status**:
   - CPU > 80%?
   - RAM > 90%?
   - Disco > 85%?
   - Latência > 2s?
2. Identifique causa:
   - Query lenta? → otimize índices
   - Muitos usuários? → escale horizontalmente
   - Backup rodando? → ajuste horário
3. Aplique correção
4. Monitore 48h

## Cenário 22: Resolver problema de SMTP

**Situação:** E-mails não chegam.

**Passo a passo:**
1. **Parâmetros > E-mail > Testar envio**
2. Se falhar:
   - Verifique credenciais
   - Verifique host e porta
   - Verifique TLS
3. Se passar mas não chega:
   - Verifique spam do destinatário
   - Verifique DNS (SPF, DKIM, DMARC)
   - Verifique se IP não está em blacklist
4. Aplique correção
5. Teste novamente

## Cenário 23: Configurar SSO (SAML)

**Situação:** Empresa quer login único (Azure AD).

**Passo a passo:**
1. **Parâmetros > Segurança > SSO (SAML)**
2. Configure:
   - Entity ID
   - Login URL
   - Logout URL
   - Certificate fingerprint
3. Faça upload do metadata XML
4. Mapeie atributos (e-mail, nome, cargo)
5. Teste com um usuário
6. Libere gradualmente
7. Acompanhe adoção

## Cenário 24: Criar dashboard personalizado por gestor

**Situação:** Cada gerente quer ver diferentes KPIs.

**Passo a passo:**
1. Acesse como gerente (ou impersonate)
2. **Dashboard > Editar Layout**
3. Adicione widgets relevantes
4. Remova irrelevantes
5. Reordene
6. Salve
7. Repita para cada gerente
8. Documente layouts

## Cenário 25: Configurar webhook para BI externo

**Situação:** Empresa quer dados no Power BI.

**Passo a passo:**
1. **Sistema > Integrações > Webhooks**
2. URL: endpoint do Power BI / middleware
3. Eventos: result.approved, goal.created, campaign.ended
4. Headers: Content-Type, Authorization
5. Teste com evento de teste
6. Monitore logs

## Cenário 26: Investigar erro 500 recorrente

**Situação:** Tela X sempre dá erro 500.

**Passo a passo:**
1. Reproduza o erro
2. **Sistema > Logs** > filtre por erro 500
3. Identifique stack trace
4. Veja qual query está falhando
5. Verifique:
   - Dados corrompidos?
   - Schema desatualizado?
   - Permissões?
6. Aplique correção (ou contate suporte)
7. Documente

## Cenário 27: Reativar funcionário que voltou

**Situação:** Ex-funcionário recontratado.

**Passo a passo:**
1. Verifique se dados foram anonimizados (se sim, criar novo)
2. Se não: **Usuários > [usuário] > Desbloquear**
3. Atualize dados (cargo, filial, supervisor)
4. Reset senha temporária
5. Reconfigure 2FA
6. Crie novas metas
7. Treine se necessário

## Cenário 28: Aplicar reajuste de metas

**Situação:** Metas precisam ser ajustadas no meio do mês.

**Passo a passo:**
1. Justifique o ajuste (auditoria)
2. **Metas > [meta] > Editar**
3. Ajuste valor
4. Escolha: aplicar retroativamente ou apenas dali em diante
5. Salve
6. Notifique vendedores afetados
7. Acompanhe impacto no ranking

## Cenário 29: Configurar alertas de auditoria

**Situação:** Quer saber de mudanças críticas.

**Passo a passo:**
1. **Sistema > Auditoria > Alertas**
2. Crie alerta:
   - Evento: mudança de permissões
   - Destinatário: admin@empresa.com
3. Repita para outros eventos críticos:
   - Backup restaurado
   - Licença alterada
   - Login fora de horário
   - Múltiplas tentativas falhas
4. Teste
5. Acompanhe

## Cenário 30: Encerrar campanha antes do prazo

**Situação:** Campanha precisa ser cancelada.

**Passo a passo:**
1. **Campanhas > [campanha] > Encerrar**
2. Justifique (auditoria)
3. Escolha:
   - Premiar conforme ranking atual
   - Não premiar
4. Confirme
5. Notifique participantes
6. Documente

## Cenário 31: Configurar retenção de logs diferente

**Situação:** Empresa quer logs por 7 anos.

**Passo a passo:**
1. **Parâmetros > Auditoria > Retenção**
2. Altere de 5 para 7 anos
3. Avalie impacto em disco (pode precisar mais storage)
4. Salve
5. Monitore espaço

## Cenário 32: Investigar uso excessivo de IA

**Situação:** Um usuário fez 500 queries de IA em 1 dia.

**Passo a passo:**
1. **Sistema > IA > Consumo por usuário**
2. Identifique usuário
3. Verifique queries (em **Auditoria**)
4. Se abuso:
   - Limite por usuário em **Parâmetros > IA**
   - Converse com o usuário
5. Se uso legítimo:
   - Considere upgrade de plano
6. Documente

---

# Capítulo 24 — Best Practices por Módulo

## 24.1 Usuários

✅ **Faça:**
- Use nomes completos (não apelidos)
- Verifique CPF antes de salvar
- Use e-mail corporativo (não pessoal)
- Configure 2FA para admins
- Bloqueie imediatamente ao desligar
- Revise permissões trimestralmente

❌ **Não faça:**
- Não compartilhe contas entre usuários
- Não use senhas fracas
- Não dê permissões além do necessário
- Não deixe usuários inativos sem bloquear
- Não envie senhas por e-mail

## 24.2 Metas

✅ **Faça:**
- Defina metas realistas (baseadas em histórico)
- Comunique mudanças de meta com antecedência
- Use simulador antes de aplicar
- Distribua proporcionalmente ao histórico
- Reavalie trimestralmente

❌ **Não faça:**
- Não mude metas no meio do período sem justificativa
- Não defina metas impossíveis (causa desmotivação)
- Não ignore reclamações de vendedores

## 24.3 Campanhas

✅ **Faça:**
- Planeje campanhas com antecedência
- Comunique início e fim claramente
- Tenha premiações atrativas
- Avalie resultados pós-campanha
- Alterne tipos (ranking, meta, crescimento)

❌ **Não faça:**
- Não sobreponha campanhas demais (cansa vendedores)
- Não mude regras no meio
- Não prometa prêmios que não pode entregar

## 24.4 Indicadores

✅ **Faça:**
- Use nomes claros e descritivos
- Agrupe em categorias lógicas
- Teste fórmulas antes de aplicar
- Versione ao editar
- Desative em vez de excluir

❌ **Não faça:**
- Não crie indicadores duplicados
- Não mude tipo de indicador existente (use novo)
- Não exclua indicadores com histórico

## 24.5 Backup

✅ **Faça:**
- Backup automático diário
- Backup externo (offsite)
- Teste restauração mensal
- Verifique integridade
- Mantenha retenção adequada

❌ **Não faça:**
- Não confie só em backup local
- Não apague backups antigos sem revisar
- Não restaure em produção sem testar antes

## 24.6 Segurança

✅ **Faça:**
- 2FA para todos admins
- Políticas de senha forte
- Revise permissões trimestralmente
- Monitore logins suspeitos
- Mantenha sistema atualizado
- Use HTTPS sempre

❌ **Não faça:**
- Não compartilhe credenciais admin
- Não deixe 2FA opcional para admins
- Não ignore alertas de segurança
- Não use senhas padrão

## 24.7 IA

✅ **Faça:**
- Defina limites mensais
- Monitore uso por usuário
- Configure filtros LGPD
- Treine usuários em prompts bons
- Avalie qualidade das respostas

❌ **Não faça:**
- Não permita IA sem consentimento
- Não deixe usuários usarem sem supervisão
- Não confie cegamente em insights

## 24.8 Integrações

✅ **Faça:**
- Teste em ambiente de homologação
- Monitore logs de integração
- Tenha fallback para integrações críticas
- Documente mapeamento de campos
- Renove credenciais periodicamente

❌ **Não faça:**
- Não deixe credenciais expiradas
- Não ignore falhas de integração
- Não integre sem testar

---

# Capítulo 25 — Configurações por Porte de Empresa

## 25.1 Pequena empresa (até 50 usuários)

### Recursos adequados
- Servidor: 4 vCPU, 8GB RAM, 100GB disco
- Banco: PostgreSQL single instance
- Cache: Redis (opcional)
- Backup: diário local + semanal externo

### Configurações recomendadas
- Política de senha: 8 caracteres, 1 maiúscula, 1 número
- Sessão: 8h
- 2FA: opcional (recomendado para admin)
- Backup retention: 30 dias
- Logs retention: 1 ano
- Atualizações: automáticas (security e minor)

### Estrutura administrativa
- 1 Admin da Empresa (acumula com gerente)
- 1-2 Gerentes
- Sem Admin Master dedicado (suporte do fornecedor)

## 25.2 Média empresa (50-500 usuários)

### Recursos adequados
- Servidor: 8 vCPU, 16GB RAM, 500GB disco
- Banco: PostgreSQL primary + replica
- Cache: Redis (necessário)
- Backup: diário local + diário externo

### Configurações recomendadas
- Política de senha: 10 caracteres, complexidade
- Sessão: 8h
- 2FA: obrigatório para admins e gerentes
- Backup retention: 60 dias
- Logs retention: 3 anos
- Atualizações: automáticas security, manual minor

### Estrutura administrativa
- 1 Admin Master (dedicado ou TI)
- 1-2 Admins da Empresa
- 3-5 Gerentes
- Suporte L1 interno

## 25.3 Grande empresa (500-5000 usuários)

### Recursos adequados
- Servidor: cluster Kubernetes (3+ nodes)
- Banco: PostgreSQL cluster (primary + 2 replicas)
- Cache: Redis cluster
- Storage: S3 ou equivalente
- CDN para assets
- Load balancer

### Configurações recomendadas
- Política de senha: 12 caracteres, complexidade, sem repetição
- Sessão: 4h
- 2FA: obrigatório para todos
- Backup retention: 90 dias + arquivamento 5 anos
- Logs retention: 5 anos
- Atualizações: todas manuais com janela de manutenção

### Estrutura administrativa
- 1+ Admin Master dedicado
- 2-3 Admins da Empresa
- 10+ Gerentes
- Suporte L1, L2 interno
- NOC para monitoramento 24/7

## 25.4 Enterprise (5000+ usuários)

### Recursos adequados
- Multi-region deployment
- Database sharding
- Cache distribuído
- Storage multi-region
- CDN global
- DDoS protection
- WAF

### Configurações recomendadas
- Política de senha: 14+ caracteres, complexidade, rotação 90 dias
- Sessão: 2h com renovação
- 2FA: obrigatório + certificado digital opcional
- Backup: contínuo (point-in-time recovery)
- Logs: 7+ anos
- Atualizações: blue-green deployment

### Estrutura administrativa
- Equipe DevOps/SRE dedicada
- Admin Master por região
- Admins da Empresa por BU
- Suporte L1, L2, L3 interno
- NOC 24/7
- Security team dedicado

---

# Capítulo 26 — Maintenance Schedules

## 26.1 Diário

| Horário | Tarefa | Responsável |
|---------|--------|-------------|
| 02:00 | Backup automático | Sistema |
| 02:30 | Limpeza de cache expirado | Sistema |
| 03:00 | Recálculo de rankings | Sistema |
| 04:00 | Sync de integrações | Sistema |
| 06:00 | Geração de insights IA | Sistema |
| 08:00 | Envio de insights por e-mail | Sistema |
| 08:00 | Verificação de saúde | Admin Master |
| 12:00 | Verificação de alertas | Admin Master |
| 18:00 | Verificação de backups | Admin Master |

## 26.2 Semanal

| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Domingo 02h | Backup completo + externo | Sistema |
| Domingo 03h | Vacuum do banco | Sistema |
| Segunda 08h | Relatório semanal | Admin Empresa |
| Segunda 09h | Revisão de aprovações pendentes | Gerentes |
| Terça 10h | Revisão de erros da semana | Admin Master |
| Quarta 14h | Revisão de permissões (amostra) | Admin Master |
| Sexta 16h | Revisão de campanhas ativas | Admin Empresa |

## 26.3 Mensal

| Dia | Tarefa | Responsável |
|-----|--------|-------------|
| Dia 1 | Fechamento do mês anterior | Admin Empresa |
| Dia 1 | Encerramento de campanhas mensais | Admin Empresa |
| Dia 2 | Geração de relatório de fechamento | Admin Empresa |
| Dia 5 | Definição de metas do mês | Gerentes |
| Dia 5 | Lançamento de novas campanhas | Admin Empresa |
| Primeira segunda | Teste de restauração de backup | Admin Master |
| Dia 15 | Verificação de uso de licença | Admin Master |
| Dia 20 | Verificação de expiração de licenças | Admin Master |
| Dia 25 | Planejamento do próximo mês | Admin Empresa |
| Último dia | Backup mensal arquivado | Sistema |

## 26.4 Trimestral

| Tarefa | Responsável |
|--------|-------------|
| Revisão completa de permissões | Admin Master |
| Auditoria de segurança | Admin Master |
| Revisão de metas vs. realidade | Admin Empresa |
| Revisão de indicadores ativos | Admin Empresa |
| Rotação de senhas de serviço | Admin Master |
| Revisão de integrações | Admin Master |
| Avaliação de satisfação de usuários | Admin Empresa |
| Treinamento de refresco para gestores | Admin Empresa |

## 26.5 Anual

| Tarefa | Responsável |
|--------|-------------|
| Renovação de licença | Admin Master |
| Revisão de política de segurança | Admin Master |
| Análise de crescimento de uso | Admin Master |
| Planejamento de capacidade | Admin Master |
| Auditoria de LGPD | Admin Master |
| Revisão de SLA com fornecedor | Admin Master |
| Treinamento anual completo | Admin Empresa |
| Atualização deste manual | Admin Master |
| Revisão de planos de disaster recovery | Admin Master |
| Pentest de segurança | Admin Master |

---

# Capítulo 27 — Health Check Procedures

## 27.1 Health check diário

Realize diariamente em até 15 minutos:

### Verificações automáticas (sistema)

```
┌────────────────────────────────────────────────────────────────┐
│  🏥 Health Check — 12/03/2025 08:00                            │
│                                                                │
│  Sistema: ✅ Saudável                                          │
│  Uptime: 23h 45min                                             │
│                                                                │
│  Serviços:                                                     │
│  ✅ Banco de dados (latência: 12ms)                            │
│  ✅ Redis (latência: 2ms)                                      │
│  ✅ Storage (latência: 45ms)                                   │
│  ✅ E-mail (SMTP conectado)                                    │
│  ✅ IA (API respondendo)                                       │
│  ✅ Webhooks (fila vazia)                                      │
│                                                                │
│  Recursos:                                                     │
│  CPU: 35% ✅                                                   │
│  RAM: 62% ✅                                                   │
│  Disco: 48% ✅                                                 │
│                                                                │
│  Métricas (24h):                                               │
│  Requisições: 145.250                                          │
│  Erros: 28 (0.02%) ✅                                          │
│  Latência média: 145ms ✅                                      │
│  Usuários ativos: 412                                          │
│                                                                │
│  Backup: ✅ Último: hoje 02:00 (5.2 GB)                       │
│  Licença: ✅ Válida até 15/12/2025                            │
└────────────────────────────────────────────────────────────────┘
```

### Verificações manuais

1. Verifique alertas ativos em **Sistema > Alertas**
2. Verifique erros recentes em **Sistema > Logs**
3. Verifique fila de webhooks em **Sistema > Integrações > Logs**
4. Verifique aprovações pendentes em **Dashboard**
5. Verifique backup em **Sistema > Backup**

## 27.2 Health check semanal

Mais detalhado, em até 1h:

### Performance
- Latência p95 das APIs
- Queries mais lentas do banco
- Cache hit ratio
- Throughput por endpoint

### Capacidade
- Tendência de uso de disco
- Tendência de uso de CPU
- Tendência de uso de RAM
- Previsão de saturação

### Segurança
- Tentativas de login falhas
- Logins de IPs novos
- Acessos fora de horário
- Mudanças críticas

### Negócio
- DAU (usuários ativos diários)
- Lançamentos por dia
- Engajamento de campanhas
- Uso de IA

## 27.3 Health check mensal

Profundo, em até 4h:

### Infraestrutura
- Revisão deCapacity planning
- Avaliação de necessidade de upgrade
- Revisão de custos cloud

### Banco de dados
- Análise de índices (queries não using index)
- Vacuum full (se necessário)
- Reindex (se necessário)
- Análise de queries lentas
- Tamanho das tabelas

### Aplicação
- Análise de erros recorrentes
- Revisão de logs de erro
- Avaliação de bugs conhecidos

### Segurança
- Pentest interno (automatizado)
- Revisão de usuários admin
- Revisão de API keys ativas
- Revisão de integrações

## 27.4 Health check anual

Profundo, com equipe dedicada:

- Pentest externo
- Auditoria de segurança completa
- Revisão de disaster recovery
- Revisão de LGPD
- Análise de capacity para próximo ano
- Avaliação de fornecedores
- Revisão de SLAs

---

# Capítulo 28 — Performance Tuning Guide

## 28.1 Identificação de gargalos

### Sinais de problema
- Latência média > 500ms
- Latência p95 > 2s
- Erro rate > 1%
- CPU > 80% sustentado
- RAM > 85% sustentado
- Disco I/O > 90%
- Queries lentas > 1s

### Ferramentas de diagnóstico
- **Sistema > Status** (dashboard)
- **Sistema > Logs > Performance**
- APM externo (Datadog, New Relic)
- PostgreSQL EXPLAIN ANALYZE
- Redis SLOWLOG

## 28.2 Otimização de banco de dados

### Índices
- Verifique queries lentas (pg_stat_statements)
- Adicione índices para queries frequentes
- Remova índices não utilizados (overhead)
- Reindex periodicamente

### Vacuum
- Autovacuum habilitado (padrão)
- Vacuum full mensal em tabelas grandes
- Analyze após grandes importações

### Particionamento
- Tabela `results`: particionada por mês
- Tabela `audit_logs`: particionada por mês
- Reduz tamanho de índices
- Melhora queries por data

### Conexões
- Pool de conexões (PgBouncer)
- Max connections adequado (100-200)
- Timeout de queries (30s)

## 28.3 Otimização de cache

### O que cachear
- Ranking (TTL 300s)
- Dashboard widgets (TTL 60s)
- Metas (TTL 600s)
- Indicadores (TTL 1800s)
- Configurações (TTL 3600s)

### Invalidação
- Ao atualizar resultado: invalida ranking + dashboard
- Ao criar meta: invalida metas
- Ao editar indicador: invalida indicadores

### Redis
- Max memory policy: allkeys-lru
- Persistência: RDB + AOF
- Cluster para alta disponibilidade

## 28.4 Otimização de aplicação

### N+1 queries
- Use eager loading (Prisma `include`)
- DataLoader para batch
- Cache de lookups

### Paginação
- Use cursor-based pagination (mais eficiente)
- Evite OFFSET grande
- Limite máximo: 100 por página

### Async processing
- Jobs em background (BullMQ)
- Filas separadas por prioridade
- Retry com backoff exponencial

## 28.5 Otimização de frontend

### Bundle
- Code splitting por rota
- Tree shaking
- Lazy loading de componentes pesados
- Compressão gzip/brotli

### Imagens
- WebP em vez de PNG/JPG
- Lazy loading
- Responsive images (srcset)
- CDN para assets

### Cache
- Service Worker para PWA
- Cache de assets estáticos (1 ano)
- Stale-while-revalidate para APIs

## 28.6 Otimização de IA

### Cache de respostas
- Cache perguntas frequentes
- TTL 24h

### Batch processing
- Insights diários em batch
- Não gerar sob demanda

### Modelo adequado
- Use gpt-4o-mini para chat simples
- Use gpt-4o apenas para análises complexas
- Reduz custo e latência

## 28.7 Monitoramento contínuo

Métricas para acompanhar:

- **Latência p50, p95, p99** das APIs
- **Throughput** (req/s)
- **Error rate**
- **Cache hit ratio** (> 80% meta)
- **Database connection pool usage** (< 70% meta)
- **Queue size** (deve tender a 0)

Configure alertas para desvios.

---

# Capítulo 29 — Security Hardening Checklist

## 29.1 Infraestrutura

- [ ] HTTPS obrigatório (redirect HTTP → HTTPS)
- [ ] TLS 1.2+ (desativar 1.0 e 1.1)
- [ ] HSTS header (max-age 1 ano)
- [ ] Certificado válido (Let's Encrypt ou comercial)
- [ ] Firewall configurado (apenas portas necessárias)
- [ ] DDoS protection (Cloudflare, AWS Shield)
- [ ] WAF (Web Application Firewall)
- [ ] VPN para acesso admin
- [ ] SSH com chave (não senha)
- [ ] Bastion host para SSH

## 29.2 Aplicação

- [ ] CSP (Content Security Policy) header
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Cookies: httpOnly, secure, sameSite=strict
- [ ] CSRF tokens em forms
- [ ] Rate limiting ativo
- [ ] Input validation server-side
- [ ] Output encoding (prevenção XSS)
- [ ] SQL injection: usar prepared statements
- [ ] File upload: validar tipo, tamanho, scan
- [ ] Secrets em variáveis de ambiente (não no código)

## 29.3 Autenticação

- [ ] Política de senha forte (12+ caracteres)
- [ ] Bloqueio após 5 tentativas
- [ ] 2FA obrigatório para admins
- [ ] Sessão expira em 8h (4h para admin)
- [ ] Refresh token com rotação
- [ ] Logout invalida tokens
- [ ] Password history (não repetir últimas 5)
- [ ] Verificação de senhas vazadas (HaveIBeenPwned API)

## 29.4 Autorização

- [ ] RBAC implementado
- [ ] Princípio do menor privilégio
- [ ] Permissões revisadas trimestralmente
- [ ] Permissões por escopo (self, equipe, filial, empresa)
- [ ] Multi-tenant isolation (RLS no banco)

## 29.5 Dados

- [ ] Criptografia em trânsito (TLS)
- [ ] Criptografia em repouso (disk encryption)
- [ ] Backup criptografado
- [ ] PII criptografada no banco (CPF, e-mail)
- [ ] Logs não contêm senhas ou dados sensíveis
- [ ] Mascaramento de dados em logs
- [ ] Anonimização após 2 anos de desligamento

## 29.6 Auditoria

- [ ] Toda ação crítica é logada
- [ ] Logs incluem: quem, quando, o quê, IP, dispositivo
- [ ] Logs são imutáveis (não podem ser apagados)
- [ ] Logs em storage separado (não mesmo disco que app)
- [ ] Retenção: 5 anos (LGPD)
- [ ] Alertas para ações críticas

## 29.7 Network

- [ ] VPC com subnets públicas/privadas
- [ ] Banco em subnet privada
- [ ] Redis em subnet privada
- [ ] Load balancer público
- [ ] Security groups restritivos
- [ ] NACL (Network ACLs)
- [ ] VPC Flow Logs
- [ ] DNS com DNSSEC

## 29.8 Containerização

- [ ] Imagens com usuário não-root
- [ ] Imagens escaneadas (Trivy, Snyk)
- [ ] Registry privado
- [ ] Tags específicas (não latest)
- [ ] Resource limits (CPU, RAM)
- [ ] Read-only filesystem quando possível
- [ ] Secrets via Kubernetes Secrets / Docker Secrets

## 29.9 CI/CD

- [ ] Secrets em vault (não no repo)
- [ ] SAST (Static Application Security Testing)
- [ ] DAST (Dynamic Application Security Testing)
- [ ] Dependency scanning (Dependabot, Snyk)
- [ ] Image scanning no pipeline
- [ ] Assinatura de imagens (Cosign)
- [ ] Audit log de deploys

## 29.10 LGPD

- [ ] Mapeamento de dados pessoais
- [ ] Base legal documentada
- [ ] Consentimento explícito
- [ ] Direito de acesso (exportação)
- [ ] Direito de retificação
- [ ] Direito de exclusão (anonimização)
- [ ] Direito de portabilidade
- [ ] DPO designado
- [ ] Registro de operações
- [ ] Plano de resposta a incidentes
- [ ] Notificação à ANPD em 72h

## 29.11 Monitoramento de segurança

- [ ] SIEM (Security Information and Event Management)
- [ ] IDS/IPS
- [ ] File integrity monitoring
- [ ] Log analysis
- [ ] Alertas de segurança
- [ ] Threat intelligence
- [ ] Bug bounty program

## 29.12 Treinamento

- [ ] Treinamento de segurança para todos
- [ ] Treinamento avançado para admins
- [ ] Phishing simulation
- [ ] Política de uso aceitável
- [ ] NDA para acesso a dados sensíveis

---

# Capítulo 30 — Backup Verification Procedures

## 30.1 Por que verificar

Backup sem verificação = nenhum backup.

Riscos:
- Backup pode estar corrompido
- Pode faltar dados
- Pode não restaurar corretamente
- Pode estar desatualizado

## 30.2 Verificação automática (diária)

Após cada backup, o sistema verifica:

1. **Tamanho:** dentro do esperado (±20%)
2. **Checksum:** integridade do arquivo
3. **Contagem de registros:** tabelas principais
4. **Schema:** versão do banco compatível

Se algum falhar, alerta é gerado.

## 30.3 Verificação manual semanal

Toda primeira sexta-feira:

1. Selecione o backup de quarta-feira
2. Restaure em ambiente de teste (`staging`)
3. Verifique:
   - Login funcionou
   - Tabelas principais têm registros
   - Última data de registro é recente
   - Tamanho do banco confere

## 30.4 Verificação mensal completa

Toda primeira segunda do mês:

### Restauração em sandbox
1. Provisione ambiente sandbox
2. Restaure o backup mais recente
3. Execute smoke tests:
   - Login com usuário admin
   - Login com usuário vendedor
   - Lançar resultado de teste
   - Ver ranking atualizar
   - Ver notificações
   - Testar IA
   - Testar exportações

### Validação de dados
1. Conte registros em tabelas principais:
   ```sql
   SELECT 'users' as tbl, count(*) FROM users
   UNION ALL
   SELECT 'results', count(*) FROM results
   UNION ALL
   SELECT 'goals', count(*) FROM goals
   UNION ALL
   SELECT 'campaigns', count(*) FROM campaigns
   UNION ALL
   SELECT 'audit_logs', count(*) FROM audit_logs;
   ```
2. Compare com produção
3. Tolerância: ±1% (devido a atividade após backup)

### Validação de schema
1. Compare versões de migration
2. Verifique se todas as migrations foram aplicadas
3. Verifique índices e constraints

### Documentação
1. Preencha checklist de verificação
2. Registre data, responsável, resultados
3. Arquive por 1 ano

## 30.5 Verificação de restore point-in-time

Para backups com WAL (Write-Ahead Log):

1. Escolha um timestamp específico (ex: ontem 14h)
2. Restaure até esse ponto
3. Verifique se os dados correspondem
4. Documente

## 30.6 Verificação de backup externo

Se você tem backup externo (S3, GCS):

1. Verifique se arquivos chegaram
2. Verifique tamanho
3. Verifique checksum
4. Faça download de um arquivo
5. Restaure em sandbox
6. Valide integridade

## 30.7 Teste de disaster recovery

Semestralmente:

1. Simule perda total do servidor primário
2. Restaure a partir de backup externo
3. Meça tempo total de recuperação (RTO)
4. Verifique perda de dados (RPO)
5. Documente
6. Compare com SLA definido

## 30.8 Checklist de verificação

```
┌────────────────────────────────────────────────────────────────┐
│  ✅ Checklist de Verificação de Backup                          │
│                                                                │
│  Data: ___/___/______  Responsável: ___________               │
│  Backup verificado: ___/___/______  (data do backup)          │
│                                                                │
│  □ Backup automático executado                                 │
│  □ Tamanho dentro do esperado                                  │
│  □ Checksum válido                                             │
│  □ Schema compatível                                           │
│  □ Contagem de registros confere                               │
│  □ Restaurado em sandbox com sucesso                           │
│  □ Login admin funcionou                                       │
│  □ Login vendedor funcionou                                    │
│  □ Lançamento de resultado funcionou                           │
│  □ Ranking atualizou                                           │
│  □ Notificações funcionaram                                    │
│  □ IA respondeu                                                │
│  □ Exportação funcionou                                        │
│  □ Backup externo sincronizado                                 │
│  □ Documentação arquivada                                      │
│                                                                │
│  Observações:                                                  │
│  _______________________________________________              │
│  _______________________________________________              │
└────────────────────────────────────────────────────────────────┘
```

---

# Capítulo 31 — Disaster Recovery Runbook

## 31.1 Objetivos

- **RTO (Recovery Time Objective):** 4h para sistema crítico
- **RPO (Recovery Point Objective):** 24h (backup diário)
- Para Enterprise: RTO 1h, RPO 1h (backup contínuo)

## 31.2 Cenários de desastre

### Cenário A: Falha de servidor único
- **Severidade:** Alta
- **RTO:** 2h
- **Ação:** Restaurar em servidor backup

### Cenário B: Falha de data center
- **Severidade:** Crítica
- **RTO:** 8h
- **Ação:** Restaurar em data center secundário

### Cenário C: Corrupção de dados
- **Severidade:** Alta
- **RTO:** 4h
- **Ação:** Restaurar backup mais recente íntegro

### Cenário D: Ataque cibernético (ransomware)
- **Severidade:** Crítica
- **RTO:** 12h
- **Ação:** Isolar, restaurar backup offline, investigar

### Cenário E: Vazamento de dados
- **Severidade:** Crítica
- **RTO:** N/A (sistema continua, mas incidente deve ser gerenciado)
- **Ação:** Investigar, notificar ANPD em 72h, comunicar usuários

## 31.3 Equipe de resposta

### Papéis
- **Incident Commander:** coordena resposta (Admin Master)
- **Communications:** comunicação interna e externa
- **Technical Lead:** executa recuperação técnica
- **Security Lead:** investiga causa e impacto
- **Legal/Compliance:** notifica ANPD se necessário
- **HR:** comunica equipe interna

### Contatos de emergência
- Admin Master: [telefone 24h]
- Fornecedor Orion: [telefone suporte 24h]
- Data center: [telefone NOC]
- ANPD: +55 XX XXXX-XXXX

## 31.4 Procedimento passo a passo

### Fase 1: Detecção e Isolamento (até 30 min)

1. Detecte o problema (alerta automático ou report)
2. Confirme a severidade
3. Notifique Incident Commander
4. Convocar equipe de resposta
5. Isole o problema (se atacante: desconecte da internet)
6. Preserve evidências (logs, snapshots)

### Fase 2: Avaliação (até 1h)

1. Identifique causa raiz
2. Avalie impacto:
   - Sistema operacional?
   - Dados perdidos?
   - Dados vazados?
3. Decida estratégia de recuperação
4. Comunique stakeholders

### Fase 3: Recuperação (até RTO)

1. Provisione novo ambiente (se necessário)
2. Restaure backup mais recente íntegro
3. Aplique WAL logs (se disponível) para reduzir RPO
4. Smoke tests em ambiente recuperado
5. Atualize DNS (se mudou servidor)
6. Valide com usuários chave

### Fase 4: Pós-recuperação (até 24h)

1. Monitore sistema de perto
2. Verifique consistência de dados
3. Comunique usuários da normalização
4. Documente incidente
5. Aplique medidas preventivas
6. Se vazamento: notifique ANPD em 72h

### Fase 5: Post-mortem (até 7 dias)

1. Reunião com equipe
2. Análise de causa raiz
3. Avaliação de resposta
4. Lições aprendidas
5. Plano de ação para evitar recorrência
6. Atualização de runbook

## 31.5 Comunicação

### Interna (equipe)
- Slack/Teams channel: #incident-response
- Atualizações a cada 30 min
- Status page interna

### Usuários
- Banner no sistema (manutenção)
- E-mail para todos (se incidente prolongado)
- Status page pública: status.suaempresa.com

### ANPD (se vazamento)
- Notificação em até 72h
- Formulário específico
- Descrição do incidente
- Dados afetados
- Medidas tomadas
- Medidas preventivas

### Mídia (se incidente grave)
- Apenas Communications Lead fala
- Press release preparado
- Não especular

## 31.6 Templates de comunicação

### Manutenção emergencial
```
Assunto: [Manutenção Emergencial] Orion indisponível

Prezado(a) [Nome],

O sistema Orion está temporariamente indisponível devido a
[manutenção emergencial / incidente técnico].

Nossa equipe está trabalhando para restabelecer o mais rápido
possível. Previsão de retorno: [horário].

Pedimos desculpas pelo inconveniente.

Atenciosamente,
Equipe Orion
```

### Restabelecimento
```
Assunto: [Resolvido] Orion disponível novamente

Prezado(a) [Nome],

O sistema Orion está disponível novamente desde [horário].

Causa do incidente: [breve descrição]
Ações tomadas: [breve descrição]

Nenhum dado foi perdido / Dados até [data] foram preservados.

Em caso de dúvida, contate o suporte.

Atenciosamente,
Equipe Orion
```

### Vazamento de dados
```
Assunto: [Importante] Incidente de segurança

Prezado(a) [Nome],

Identificamos um incidente de segurança que pode ter exposto
seus dados. Levamos isso muito a sério.

O que aconteceu: [breve descrição]
Dados potencialmente afetados: [lista]
O que estamos fazendo: [ações]
O que você deve fazer: [recomendações - ex: trocar senha]

Notificamos a ANPD conforme exigido pela LGPD.

Para dúvidas: dpo@suaempresa.com ou [telefone]

Atenciosamente,
DPO - [Nome]
```

## 31.7 Teste de DR

Semestralmente:

1. Simule um desastre em ambiente controlado
2. Siga o runbook
3. Meça RTO e RPO reais
4. Identifique gargalos
5. Atualize runbook
6. Treine equipe

---

# Capítulo 32 — User Management Best Practices

## 32.1 Princípios

- **Menor privilégio:** cada usuário com mínimo necessário
- **Need-to-know:** acesso apenas ao que precisa
- **Segregation of duties:** funções críticas separadas
- **Rotation:** rotação de pessoas em funções críticas
- **Audit trail:** toda mudança é registrada

## 32.2 Onboarding

### Checklist de onboarding
- [ ] Requisição formal aprovada (RH + gestor)
- [ ] Define cargo e permissões
- [ ] Cria usuário com senha temporária forte
- [ ] Entrega credenciais pessoalmente (não por e-mail)
- [ ] Usuário troca senha no primeiro login
- [ ] Ativa 2FA (se aplicável)
- [ ] Treina em uso básico
- [ ] Treina em segurança (phishing, senhas)
- [ ] Documenta treinamento
- [ ] Acompanha em 30 dias

## 32.3 Manutenção

### Revisão trimestral
- Lista de usuários ativos
- Confirma com gestores se ainda precisam
- Revoga usuários inativos (>90 dias sem login)
- Verifica cargos e permissões
- Documenta revisão

### Movimentação interna
- Quando usuário muda de cargo/função:
  - Atualiza cargo
  - Revisa permissões (remover não necessárias)
  - Adiciona novas (se aplicável)
  - Auditoria registra
  - Comunica usuário

## 32.4 Offboarding

### Checklist de offboarding
- [ ] Requisição formal de RH
- [ ] Bloqueia usuário (não excluir)
- [ ] Revoga tokens ativos
- [ ] Desativa 2FA
- [ ] Revoga API keys pessoais
- [ ] Reatribui metas/campanhas
- [ ] Documenta data e motivo
- [ ] Após 30 dias: backup final dos dados
- [ ] Após 2 anos: anonimização LGPD

## 32.5 Gestão de admins

### Admins devem ter
- Conta separada para uso admin (não usar conta comum)
- 2FA obrigatório
- Senha forte (14+ caracteres)
- Acesso apenas de IPs corporativos
- Sessão curta (4h)
- Auditoria rigorosa

### Rotação
- Rotação de senhas admin a cada 90 dias
- Re-emissão de 2FA backup codes a cada 180 dias
- Revisão de admins a cada trimestre

## 32.6 Gestão de contas de serviço

### Para integrações
- Crie conta específica (não use conta pessoal)
- Defina escopo mínimo de permissões
- API key com expiração
- Documente responsável e finalidade
- Monitore uso
- Renove periodicamente

## 32.7 Detecção de anomalias

### Comportamento suspeito
- Login fora de horário habitual
- Login de país diferente
- Múltiplos logins em sequência
- Acesso a dados sensíveis em volume
- Exportação incomum
- Mudanças em massa

Configure alertas para cada um.

## 32.8 Treinamento de usuários

### Obrigatório
- Treinamento de boas práticas de senha
- Reconhecimento de phishing
- Uso adequado do sistema
- Reportar atividades suspeitas

### Recomendado
- Treinamento de LGPD
- Treinamento de segurança digital
- Atualizações anuais

---

# Capítulo 33 — License Management Detailed

## 33.1 Tipos de licença

### Por plano
- **Starter:** até 50 usuários, 3 filiais
- **Professional:** até 500 usuários, 20 filiais
- **Enterprise:** ilimitado, módulos avançados
- **Custom:** contrato específico

### Por modelo
- **SaaS:** hospedado pelo fornecedor, mensal/anual
- **On-premise:** hospedado na empresa, licença perpétua + maintenance
- **Híbrido:** parte SaaS, parte on-premise

## 33.2 Ativação

### Primeira ativação
1. Receba chave de licença do fornecedor
2. Acesse **Sistema > Licença > Ativar**
3. Digite a chave
4. Sistema valida online
5. Confirma ativação
6. Recarrega para aplicar

### Renovação
1. 30 dias antes: sistema notifica
2. Contate fornecedor para renovação
3. Receba nova chave
4. Ative em **Sistema > Licença > Renovar**
5. Confirme

## 33.3 Monitoramento de uso

Acompanhe em **Sistema > Licença > Uso Atual**:

```
┌────────────────────────────────────────────────────────────────┐
│  📊 Uso da Licença — Março 2025                                │
│                                                                │
│  Plano: Professional                                           │
│  Válido até: 15/12/2025 (287 dias restantes)                  │
│                                                                │
│  Usuários:                                                     │
│  412 / 500 (82%) ████████████████████░░░░                     │
│  Tendência: +5/mês                                             │
│  Previsão de limite: Agosto 2025                              │
│                                                                │
│  Filiais:                                                      │
│  18 / 20 (90%) █████████████████████░░                        │
│                                                                │
│  IA:                                                           │
│  3.245 / 5.000 queries este mês (65%)                         │
│  Tendência: 4.800 ao fim do mês (abaixo do limite)            │
│                                                                │
│  Storage:                                                      │
│  45 GB / 100 GB (45%)                                          │
│                                                                │
│  Módulos ativos:                                               │
│  ✅ Core                                                       │
│  ✅ IA Insights                                                │
│  ✅ Integrações                                                │
│  ❌ Marketplace (não contratado)                              │
│  ❌ Multi-moeda (não contratado)                              │
└────────────────────────────────────────────────────────────────┘
```

## 33.4 Limites e bloqueios

### Usuários
- Ao tentar criar além do limite: bloqueio
- Mensagem: "Limite de usuários atingido (X de Y)"
- Solução: upgrade ou inative usuários antigos

### Filiais
- Mesmo comportamento

### IA
- Ao atingir limite: IA indisponível
- Renova no início do próximo mês
- Opcional: comprar pacote adicional

### Storage
- Ao atingir 90%: alerta
- Ao atingir 100%:
  - Uploads bloqueados
  - Sistema continua funcionando
  - Solicite upgrade ou limpeza

## 33.5 Upgrade

### Quando fazer
- Uso de usuários > 80%
- Uso de filiais > 80%
- Uso de IA > 80% recorrente
- Necessidade de novo módulo

### Como fazer
1. Contate fornecedor
2. Negocie novo plano
3. Receba nova chave
4. Ative em **Sistema > Licença > Ativar Nova Licença**
5. Novos limites aplicados imediatatamente
6. Pró-rateamento do valor

## 33.6 Downgrade

### Quando fazer
- Redução de equipe
- Mudança de estratégia
- Redução de custos

### Como fazer
1. Contate fornecedor com 30 dias de antecedência
2. Agende downgrade para o fim do período atual
3. Verifique se está dentro dos novos limites:
   - Se sim: downgrade automático
   - Se não: ajuste antes (inative usuários, etc.)
4. Novo plano entra em vigor no início do próximo período

## 33.7 Expiração

### Cronograma
- **30 dias antes:** notificação
- **7 dias antes:** notificação urgente
- **No dia:** sistema entra em modo somente leitura
- **7 dias após:** bloqueio total (apenas admin pode exportar dados)
- **30 dias após:** dados podem ser apagados (mediante contrato)

### Recuperação
- Se renovar dentro do período de carência: sistema volta ao normal
- Se renovar após carência: dados ainda disponíveis por 30 dias
- Após 30 dias pós-expiração: dados podem ser apagados

## 33.8 Transferência de licença

Para transferir licença entre empresas (ex: reestruturação):

1. Contate fornecedor
2. Documente motivo
3. Forneça dados das duas empresas
4. Aguarde aprovação
5. Realize a transferência
6. Verifique nova licença ativa

## 33.9 Auditoria de licença

O fornecedor pode auditar uso:

- Periodicamente (anual)
- Quando suspeita de uso além do contratado
- A pedido do cliente

Mantenha:

- Registro de usuários ativos
- Registro de filiais ativas
- Logs de uso de IA
- Logs de uso de storage

## 33.10 Compliance

Para empresas reguladas:

- Mantenha licença vigente
- Documente renovações
- Verifique compliance com políticas internas
- Inclua em auditorias de TI

---

# Capítulo 34 — Integration Setup Walkthroughs

## 34.1 Webhook — Slack

Objetivo: receber notificações no Slack quando resultados forem aprovados.

### Passo a passo

1. **No Slack:**
   - Acesse https://api.slack.com/apps
   - Crie novo app
   - Vá em "Incoming Webhooks"
   - Ative
   - Crie webhook para canal #vendas
   - Copie URL (ex: `https://hooks.slack.com/services/...`)

2. **No Orion:**
   - **Sistema > Integrações > Webhooks > Novo**
   - URL: a URL copiada
   - Eventos: `result.approved`
   - Headers: `Content-Type: application/json`
   - Template de payload:
     ```json
     {
       "text": "✅ Resultado aprovado: {{user.name}} - {{indicator.name}} = {{result.value}}"
     }
     ```
   - Salve
   - Teste com botão **Enviar Evento Teste**

3. **Verificação:**
   - Lance e aprove um resultado
   - Verifique se mensagem chegou no Slack
   - Ajuste template se necessário

## 34.2 API REST — Power BI

Objetivo: consumir dados do Orion no Power BI.

### Passo a passo

1. **No Orion:**
   - **Sistema > Integrações > API Keys > Nova**
   - Nome: "Power BI Integration"
   - Permissões: `results.read`, `users.read`, `goals.read`
   - Expiração: 1 ano
   - Copie a chave (não aparece mais)

2. **No Power BI:**
   - Abra Power BI Desktop
   - Get Data > Web
   - URL: `https://api.suaempresa.com/v1/results?from=2025-01-01`
   - Headers:
     - `Authorization: Bearer SUA_API_KEY`
     - `Accept: application/json`
   - Carregue dados
   - Configure refresh diário

3. **Verificação:**
   - Verifique se dados carregaram
   - Configure dashboard
   - Publique

## 34.3 ERP — Totvs

Objetivo: sincronizar vendas do Totvs com o Orion.

### Pré-requisitos
- Totvs com serviço REST habilitado
- Usuário com permissão de leitura
- Mapeamento de campos definido

### Passo a passo

1. **No Totvs:**
   - Configure serviço REST
   - Crie usuário `orion_integration`
   - Atribua permissão de leitura em vendas/produtos/vendedores

2. **No Orion:**
   - **Sistema > Integrações > ERP > Totvs > Configurar**
   - URL: `https://totvs.suaempresa.com:8051/rest`
   - Usuário: `orion_integration`
   - Senha: `[senha]`
   - Código da empresa: `1`
   - Filiais: mapeie códigos Totvs → Orion
   - Mapeamento de campos:
     ```
     Totvs                    Orion
     ────────────────────────
     A1_COD (cliente)    →   customer_id
     A1_NOME             →   customer_name
     C6_PRODUTO          →   product_id
     C6_DESCRI           →   product_name
     C6_VALOR            →   sale_value
     C6_QTDVEN           →   sale_qty
     A3_COD (vendedor)   →   user_external_id
     F2_EMISSAO          →   sale_date
     ```
   - Frequência: 15 minutos
   - Teste conexão
   - Ative

3. **Verificação:**
   - Verifique logs em **Integrações > Totvs > Logs**
   - Confirme que vendas estão chegando
   - Ajuste mapeamento se necessário

## 34.4 WhatsApp — Evolution API

Objetivo: enviar notificações de campanhas via WhatsApp.

### Passo a passo (self-hosted)

1. **Instale Evolution API:**
   ```bash
   docker run -d --name evolution-api \
     -p 8080:8080 \
     -e AUTHENTICATION_API_KEY=sua-chave \
     -e SERVER_URL=https://whatsapp.suaempresa.com \
     atendai/evolution-api:latest
   ```

2. **Crie instância WhatsApp:**
   - POST `/instance/create`
   - Body: `{"instanceName": "orion", "token": "..."}`
   - Obtenha QR code
   - Escaneie com celular

3. **No Orion:**
   - **Sistema > Integrações > WhatsApp > Evolution**
   - URL: `https://whatsapp.suaempresa.com`
   - API Key: `sua-chave`
   - Instância: `orion`
   - Templates de mensagem:
     ```
     🎉 Parabéns {{user.name}}!
     
     Você subiu para {{ranking.position}}º lugar no ranking!
     
     Continue assim!
     ```
   - Eventos para notificar: `ranking.position_change_up`, `campaign.won`
   - Salve
   - Teste enviando para seu número

## 34.5 SSO — Azure AD (SAML)

Objetivo: login único com Azure AD.

### Passo a passo

1. **No Azure AD:**
   - Acesse Azure Portal > Enterprise Applications
   - New application > Non-gallery
   - Nome: "Orion"
   - Setup single sign-on > SAML
   - Identifiers: `https://app.suaempresa.com`
   - Reply URL: `https://app.suaempresa.com/api/auth/saml/callback`
   - Login URL: copie (será usada no Orion)
   - Logout URL: copie
   - Certificate: baixe (Base64)
   - Adicione usuários/grupos

2. **No Orion:**
   - **Parâmetros > Segurança > SSO (SAML)**
   - Entity ID: `https://app.suaempresa.com`
   - Login URL: a URL copiada
   - Logout URL: a URL copiada
   - Certificate: faça upload do .cer baixado
   - Mapeamento de atributos:
     - `email` → e-mail do usuário
     - `name` → nome
     - `department` → departamento
   - Auto-create users: Sim (se quiser)
   - Default cargo for new: Vendedor
   - Teste com um usuário
   - Acompanhe adoção
   - Force SSO após migração completa

## 34.6 Zapier

Objetivo: conectar Orion com 3.000+ apps via Zapier.

### Passo a passo

1. **No Orion:**
   - **Sistema > Integrações > API Keys > Nova**
   - Nome: "Zapier"
   - Permissões: `results.read`, `goals.read`
   - Copie a chave

2. **No Zapier:**
   - Crie conta em zapier.com
   - Make a Zap
   - Trigger: Orion > "New Result Approved"
   - Conecte com API key
   - Action: escolha app (Google Sheets, Slack, etc.)
   - Mapeie campos
   - Teste
   - Ative

## 34.7 Microsoft Teams

Objetivo: enviar notificações em canal do Teams.

### Passo a passo

1. **No Teams:**
   - Vá no canal desejado
   - Mais opções > Conectores
   - Adicione "Incoming Webhook"
   - Configure nome e ícone
   - Copie URL

2. **No Orion:**
   - **Sistema > Integrações > Webhooks > Novo**
   - URL: a URL copiada
   - Eventos: escolha quais
   - Template de payload (formato Teams):
     ```json
     {
       "@type": "MessageCard",
       "@context": "http://schema.org/extensions",
       "themeColor": "0072C6",
       "title": "✅ Resultado Aprovado",
       "text": "{{user.name}} - {{indicator.name}} = {{result.value}}"
     }
     ```
   - Salve e teste

## 34.8 Sentry (error tracking)

Objetivo: capturar erros em produção.

### Passo a passo

1. **No Sentry:**
   - Crie conta em sentry.io
   - Crie projeto (Node.js)
   - Obtenha DSN

2. **No Orion:**
   - **Parâmetros > Monitoramento > Sentry**
   - DSN: a URL copiada
   - Environment: production
   - Sample rate: 1.0 (100%)
   - Antes de ativar: revise PII filtering
   - Ative

## 34.9 Datadog (APM)

Objetivo: monitorar performance.

### Passo a passo

1. **No Datadog:**
   - Crie conta
   - Vá em APM > Get Started
   - Obtenha API key e APP key

2. **No servidor Orion:**
   - Instale Datadog Agent
   - Configure APM para Node.js
   - Adicione integrações (PostgreSQL, Redis)

3. **No Orion:**
   - **Parâmetros > Monitoramento > Datadog**
   - Ative tracing
   - Sample rate: 10%
   - Service name: `orion-api`

## 34.10 Google Analytics

Objetivo: acompanhar uso do sistema.

### Passo a passo

1. **No Google Analytics:**
   - Crie propriedade GA4
   - Obtenha Measurement ID (G-XXXXXXX)

2. **No Orion:**
   - **Parâmetros > Analytics > Google Analytics**
   - Measurement ID: G-XXXXXXX
   - Ative
   - Eventos personalizados:
     - `login` (com cargo)
     - `result_created`
     - `campaign_participated`
     - `ia_query`

> **LGPD:** Não envie dados pessoais para GA. Use IDs anônimos.

---

# Encerramento

Este manual cobriu desde a configuração inicial até procedimentos avançados de administração. Como administrador, recomendamos:

1. **Leia as seções relevantes** conforme necessário
2. **Use como referência** em situações novas
3. **Mantenha este manual atualizado** com mudanças na sua empresa
4. **Treine sua equipe** nos procedimentos
5. **Documente runbooks específicos** da sua empresa
6. **Faça revisões periódicas** (trimestral e anual)
7. **Acompanhe métricas** de saúde e uso
8. **Comunique usuários** de mudanças importantes

Lembre-se: um bom administrador previne problemas antes que aconteçam, documente tudo, e capacita os usuários.

Boa administração! 🚀

---

**Próximo documento:** DOCUMENTO 21 — Architecture Decision Records (ADRs)
