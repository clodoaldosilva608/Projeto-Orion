# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 07

# BUSINESS RULES DOCUMENT

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Business Rules Document

---

## Sumário

- Capítulo 1 — Objetivo
- Capítulo 2 — Princípios das Regras
- Capítulo 3 — Empresas
- Capítulo 4 — Filiais
- Capítulo 5 — Usuários
- Capítulo 6 — Permissões
- Capítulo 7 — Indicadores
- Capítulo 8 — Metas
- Capítulo 9 — Resultados
- Capítulo 10 — Cálculo das Metas
- Capítulo 11 — Ranking
- Capítulo 12 — Campanhas
- Capítulo 13 — Premiações
- Capítulo 14 — Dashboards
- Capítulo 15 — Notificações
- Capítulo 16 — IA
- Capítulo 17 — Auditoria
- Capítulo 18 — Backup
- Capítulo 19 — Licenciamento
- Capítulo 20 — Motor de Regras
- Capítulo 21 — Configurações
- Capítulo 22 — Desempenho
- Capítulo 23 — Princípio Máximo do Orion
- Capítulo 24 — Regras de Cálculo Detalhadas (RN-055 a RN-070)
- Capítulo 25 — Regras de Validação por Módulo (RN-071 a RN-080)
- Capítulo 26 — Regras de Notificação (RN-081 a RN-088)
- Capítulo 27 — Regras de Auditoria (RN-089 a RN-094)
- Capítulo 28 — Regras de LGPD (RN-095 a RN-102)
- Capítulo 29 — Regras de Licenciamento (RN-103 a RN-108)
- Capítulo 30 — Regras de Multi-tenant (RN-109 a RN-114)
- Capítulo 31 — Regras de Cache (RN-115 a RN-120)
- Capítulo 32 — Regras de Rate Limiting (RN-121 a RN-126)
- Capítulo 33 — Regras de Webhook (RN-127 a RN-132)
- Capítulo 34 — Regras de IA (RN-133 a RN-140)
- Capítulo 35 — Regras de Backup (RN-141 a RN-146)
- Capítulo 36 — Regras de Atualização (RN-147 a RN-152)
- Capítulo 37 — Regras de Marketplace (RN-153 a RN-158)
- Capítulo 38 — Regras de Gamificação (RN-159 a RN-166)
- Capítulo 39 — Regras Adicionais de Negócio (RN-167 a RN-180)
- Capítulo 40 — Matriz de Regras por Módulo
- Capítulo 41 — Histórico de Versões de Regras
- Capítulo 42 — Sugestões Estratégicas

---

# Capítulo 1 — Objetivo

Este documento estabelece todas as regras que governam o funcionamento do Projeto Orion.

Nenhuma funcionalidade poderá ser implementada sem obedecer às regras aqui definidas.

Todas as telas, APIs, cálculos e processos deverão utilizar estas regras como fonte oficial.

Este é um documento vivo — regras podem ser adicionadas, modificadas ou descontinuadas, mas sempre com versionamento e justificativa documentada no Capítulo 41.

## 1.1 Abrangência

As regras deste documento aplicam-se a:

- Todas as instâncias do Orion (SaaS e On-Premise)
- Todos os módulos oficiais e plugins certificados
- Todas as integrações via API
- Todos os tipos de usuário (Master, Admin, Gerente, Supervisor, Vendedor)
- Todos os planos de licenciamento (Starter, Professional, Enterprise)

## 1.2 Conflito de regras

Em caso de conflito entre regras:

1. Regras de segurança prevalecem sobre regras de negócio
2. Regras de LGPD prevalecem sobre regras de conveniência
3. Regras específicas prevalecem sobre regras gerais
4. Em último caso, a regra mais recente prevalece (ver Capítulo 41)

## 1.3 Exceções

Exceções a regras só são permitidas se:

1. Documentadas formalmente
2. Aprovadas pelo Admin Master
3. Registradas em auditoria
4. Têm prazo de validade (máximo 90 dias)
5. São revisadas antes da renovação

---

# Capítulo 2 — Princípios das Regras

Todas as regras deverão obedecer aos seguintes princípios:

- **Clareza** — toda regra deve ser compreensível sem ambiguidade
- **Simplicidade** — evitar regras desnecessariamente complexas
- **Configurabilidade** — sempre que possível, configurável pelo administrador
- **Rastreabilidade** — toda regra aplicada deve ser rastreada
- **Auditoria** — mudanças em regras devem ser auditadas
- **Segurança** — regras nunca devem comprometer a segurança
- **Performance** — regras não devem impactar significativamente a performance
- **Testabilidade** — toda regra deve ser testável automaticamente

Nenhuma regra deverá ficar "escondida" no código.

Sempre que possível deverá ser configurável pelo administrador.

## 2.1 Formato das regras

Cada regra segue o formato:

```
## RN-XXX — Nome da regra
**Descrição:** o que a regra faz
**Módulo:** a qual módulo se aplica
**Tipo:** cálculo | validação | notificação | auditoria | segurança | negócio
**Configurável:** Sim/Não
**Default:** valor padrão
**Aplicação:** quando/how a regra é aplicada
**Exceções:** casos especiais (se houver)
**Exemplo:** exemplo prático
```

---

# Capítulo 3 — Empresas

## RN-001
Cada instalação pertence a apenas uma empresa.
A empresa será criada no primeiro acesso através do Assistente de Configuração Inicial.

## RN-002
Após a ativação da licença, os dados da empresa tornam-se protegidos.
Alterações críticas (CNPJ, Razão Social, Licença) exigirão autenticação do Administrador.

## RN-003
Cada empresa poderá cadastrar:
- Filiais ilimitadas (conforme licença)
- Departamentos
- Setores
- Centros de custo
- Equipes

---

# Capítulo 4 — Filiais

## RN-004
Cada funcionário deverá estar vinculado a uma filial.

## RN-005
As metas poderão ser:
- por empresa
- por filial
- por equipe
- por colaborador

## RN-006
Uma filial poderá ser desativada.
Os dados históricos permanecerão preservados.

---

# Capítulo 5 — Usuários

## RN-007
Cada usuário possuirá um único login.

## RN-008
O login poderá ser:
- E-mail
- Matrícula
- CPF
- Nome de usuário

(definido pela empresa)

## RN-009
A senha nunca será armazenada em texto.
Sempre será criptografada.

## RN-010
Após cinco tentativas inválidas.
A conta será bloqueada temporariamente.

## RN-011
O administrador poderá desbloquear manualmente.

---

# Capítulo 6 — Permissões

O Orion utilizará RBAC (Role Based Access Control).

## RN-012
Permissões serão concedidas ao cargo.
Nunca diretamente ao usuário.

## RN-013
Um usuário poderá possuir mais de um cargo.
Exemplo: Supervisor + Gerente

## RN-014
As permissões poderão ser:
- Visualizar
- Cadastrar
- Editar
- Excluir
- Exportar
- Importar
- Imprimir
- Configurar
- Auditar
- Administrar

---

# Capítulo 7 — Indicadores

Este é um dos principais diferenciais do Orion.

## RN-015
Cada empresa poderá criar indicadores ilimitados.
Exemplo: Faturamento, Ticket Médio, Clientes, Conversão, Serviços, Garantias, Perfumes, Vitaminas, Plano Fidelidade, Qualquer indicador.

## RN-016
Cada indicador possuirá:
- Nome
- Tipo
- Categoria
- Peso
- Meta
- Cor
- Ícone
- Precisão
- Fórmula
- Unidade

## RN-017
Indicadores poderão ser:
- Numéricos
- Financeiros
- Percentuais
- Quantidade
- Tempo
- Pontuação
- Texto
- Personalizados

---

# Capítulo 8 — Metas

## RN-018
Cada meta poderá ser:
- Diária
- Semanal
- Mensal
- Trimestral
- Semestral
- Anual
- Campanha
- Livre

## RN-019
Uma meta poderá ser atribuída para:
- Empresa
- Filial
- Equipe
- Usuário

## RN-020
Uma meta poderá possuir peso.
Esse peso influenciará o ranking.

## RN-021
As metas poderão ser importadas em massa.

---

# Capítulo 9 — Resultados

## RN-022
Resultados poderão ser lançados:
- Manual
- Importação
- API
- Integração
- IA

## RN-023
Resultados poderão exigir aprovação.

## RN-024
Após aprovados.
Não poderão ser alterados sem auditoria.

---

# Capítulo 10 — Cálculo das Metas

## RN-025
Percentual da Meta
Fórmula: `Resultado ÷ Meta × 100`

## RN-026
Caso a meta seja zero.
O sistema não realizará divisão.

## RN-027
Todos os cálculos utilizarão precisão decimal configurável.

---

# Capítulo 11 — Ranking

## RN-028
O ranking será recalculado automaticamente.

## RN-029
Empates utilizarão critérios configuráveis.
Exemplo: Maior faturamento, Maior Ticket Médio, Menor tempo, Maior número de clientes, Ou outro indicador definido pela empresa.

## RN-030
O ranking poderá ser:
- Diário
- Semanal
- Mensal
- Campanha
- Anual
- Personalizado

---

# Capítulo 12 — Campanhas

## RN-031
Campanhas poderão utilizar qualquer indicador.

## RN-032
Uma campanha poderá utilizar vários indicadores simultaneamente.

## RN-033
Campanhas poderão possuir:
- Pontuação
- Medalhas
- Premiações
- Desafios
- Metas
- Bonificações

---

# Capítulo 13 — Premiações

## RN-034
Premiações poderão ser:
- Medalhas
- Troféus
- Pontos
- Brindes
- Dinheiro
- Viagens
- Produtos
- Personalizadas

## RN-035
Premiações poderão ser automáticas.

---

# Capítulo 14 — Dashboards

## RN-036
Cada usuário poderá possuir dashboards próprios.

## RN-037
Cada dashboard poderá possuir widgets ilimitados.

## RN-038
Os widgets poderão ser movidos livremente.

---

# Capítulo 15 — Notificações

## RN-039
Notificações poderão ser:
- Push
- Sistema
- E-mail
- SMS
- WhatsApp (plugin futuro)
- Telegram (plugin futuro)

## RN-040
As notificações poderão ser automáticas.

---

# Capítulo 16 — IA

## RN-041
A IA nunca alterará dados automaticamente.
Ela apenas sugerirá ações.

## RN-042
Toda sugestão poderá ser aceita ou recusada.

## RN-043
A IA poderá gerar:
- Relatórios
- Insights
- Análises
- Previsões
- Campanhas
- Resumo Executivo

---

# Capítulo 17 — Auditoria

## RN-044
Toda alteração será registrada.

## RN-045
A auditoria registrará:
- Quem
- Quando
- Onde
- O quê
- Valor anterior
- Valor novo
- IP
- Dispositivo

## RN-046
Nenhum log poderá ser apagado pelo usuário comum.

---

# Capítulo 18 — Backup

## RN-047
Backups poderão ser:
- Manuais
- Automáticos
- Agendados

## RN-048
Toda restauração será auditada.

---

# Capítulo 19 — Licenciamento

## RN-049
O sistema funcionará apenas com licença válida.

## RN-050
Cada licença definirá:
- Número de usuários
- Número de filiais
- Módulos disponíveis
- Recursos Premium

---

# Capítulo 20 — Motor de Regras

Um dos maiores diferenciais do Orion.

## RN-051
O administrador poderá criar regras.

Exemplo:

```
SE Meta > 100%
ENTÃO Enviar Notificação
```

Outro exemplo:

```
SE Ranking = 1
ENTÃO Conceder Medalha Ouro
```

Outro exemplo:

```
SE Campanha terminou
ENTÃO Gerar Relatório
```

Tudo sem programação.

---

# Capítulo 21 — Configurações

## RN-052
Quase todo comportamento do sistema deverá ser configurável.

Exemplo:
- Tema
- Idioma
- Campos
- Indicadores
- Layouts
- Dashboards
- Permissões
- Notificações
- Campanhas

---

# Capítulo 22 — Desempenho

## RN-053
Toda tela deverá carregar em menos de 2 segundos em condições normais.

## RN-054
Operações críticas deverão utilizar processamento assíncrono quando necessário.

---

# Capítulo 23 — Princípio Máximo do Orion

> **"Nenhuma funcionalidade deverá ser criada para atender apenas um cliente. Todas as funcionalidades deverão ser genéricas, reutilizáveis, parametrizáveis e preparadas para evolução futura."**

Esse princípio será obrigatório durante todo o ciclo de vida do produto.

---

# Capítulo 24 — Regras de Cálculo Detalhadas

Este capítulo detalha as regras matemáticas que governam cálculos no Orion.

## RN-055 — Ticket Médio (TKM)

**Descrição:** Calcula o valor médio por venda ou por cliente.
**Fórmula:** `TKM = Faturamento / Número de Clientes`
**Módulo:** Indicadores
**Tipo:** cálculo
**Configurável:** Sim (denominador pode ser cliente ou venda)
**Default:** Por cliente
**Aplicação:** Calculado automaticamente quando os dois indicadores base existem
**Exceções:** Se número de clientes = 0, TKM = 0 (não há divisão por zero)
**Exemplo:** Faturamento R$3.000 / 22 clientes = TKM R$136,36

## RN-056 — Conversão

**Descrição:** Percentual de visitantes que efetuaram compra.
**Fórmula:** `Conversão = (Número de Vendas / Número de Visitantes) × 100`
**Módulo:** Indicadores
**Tipo:** cálculo
**Configurável:** Sim (denominador pode ser visitantes, prospects ou atendimentos)
**Default:** Visitantes
**Aplicação:** Calculado quando ambos os indicadores base são lançados
**Exceções:** Se visitantes = 0, conversão = 0
**Exemplo:** 22 vendas / 100 visitantes = 22% de conversão

## RN-057 — Ranking Ponderado

**Descrição:** Ranking que considera pesos diferentes para cada indicador.
**Fórmula:** `Pontuação = Σ (Atingimento_i × Peso_i) / Σ Peso_i`
**Módulo:** Ranking
**Tipo:** cálculo
**Configurável:** Sim (pesos por indicador)
**Default:** Todos os pesos = 1.0
**Aplicação:** Quando o ranking tem múltiplos indicadores com pesos diferentes
**Exceções:** Se Σ Peso_i = 0, usa peso padrão 1.0
**Exemplo:**
- Indicador A: atingimento 80%, peso 2.0 → 160
- Indicador B: atingimento 100%, peso 1.0 → 100
- Indicador C: atingimento 50%, peso 0.5 → 25
- Pontuação = (160 + 100 + 25) / 3.5 = 81,43 pontos

## RN-058 — Atingimento de Meta

**Descrição:** Percentual da meta alcançado.
**Fórmula:** `Atingimento = (Resultado / Meta) × 100`
**Módulo:** Metas
**Tipo:** cálculo
**Configurável:** Não (universal)
**Default:** N/A
**Aplicação:** Calculado para toda meta com valor definido
**Exceções:** Se Meta = 0, atingimento = 0 (RN-026)
**Exemplo:** Resultado R$1.500 / Meta R$3.000 = 50% de atingimento

## RN-059 — Projeção de Meta

**Descrição:** Estimativa de atingimento no fim do período, baseado no ritmo atual.
**Fórmula:** `Projeção = Resultado_Atual + (Ritmo_Diário_Médio × Dias_Restantes)`
**Módulo:** Metas/IA
**Tipo:** cálculo
**Configurável:** Sim (janela de cálculo do ritmo: 7, 14, 30 dias)
**Default:** 7 dias
**Aplicação:** Calculado pela IA sob demanda
**Exceções:** Se menos de 3 dias de histórico, projeção = resultado atual
**Exemplo:**
- Resultado atual: R$1.250 (5 dias)
- Ritmo médio: R$250/dia
- Dias restantes: 25
- Projeção: R$1.250 + (R$250 × 25) = R$7.500

## RN-060 — Margem de Erro da Projeção

**Descrição:** Calcula intervalo de confiança da projeção.
**Fórmula:** `Intervalo = Projeção ± (Desvio_Padrão × Fator_Confiança)`
**Módulo:** IA
**Tipo:** cálculo
**Configurável:** Sim (nível de confiança: 90%, 95%, 99%)
**Default:** 95%
**Aplicação:** Sempre que uma projeção é exibida
**Exceções:** Se menos de 7 dias de dados, intervalo = projeção ± 20%
**Exemplo:** Projeção R$7.500 ± R$1.200 (intervalo de 95%: R$6.300 a R$8.700)

## RN-061 — Crescimento Período

**Descrição:** Variação percentual entre dois períodos.
**Fórmula:** `Crescimento = ((Período_Atual - Período_Anterior) / Período_Anterior) × 100`
**Módulo:** Relatórios
**Tipo:** cálculo
**Configurável:** Não
**Default:** N/A
**Aplicação:** Comparativos de período
**Exceções:** Se Período_Anterior = 0, crescimento = N/A
**Exemplo:** Atual R$65.000, anterior R$58.000 → Crescimento = +12,07%

## RN-062 — Média Móvel

**Descrição:** Média dos últimos N períodos.
**Fórmula:** `MMA_n = (Σ Valor_i) / n, para i nos últimos n períodos`
**Módulo:** Relatórios
**Tipo:** cálculo
**Configurável:** Sim (n: 7, 14, 30 dias)
**Default:** 7 dias
**Aplicação:** Gráficos de evolução
**Exceções:** Se menos de n períodos, usa disponíveis
**Exemplo:** MM7 = média dos últimos 7 dias de faturamento

## RN-063 — Streak (Sequência)

**Descrição:** Conta dias consecutivos de lançamento ou meta batida.
**Fórmula:** `Streak = contador de dias consecutivos atendendo critério`
**Módulo:** Gamificação
**Tipo:** cálculo
**Configurável:** Sim (critério: lançou resultado | bateu meta)
**Default:** Lançou resultado
**Aplicação:** Diariamente, ao processar resultados
**Exceções:** Ausência em 1 dia zera o streak
**Exemplo:** Vendedor lançou resultado por 12 dias seguidos → Streak = 12

## RN-064 — Pontos de Gamificação

**Descrição:** Concede pontos por ações.
**Fórmula:** `Pontos = Σ (Ação_i × Valor_i)`
**Módulo:** Gamificação
**Tipo:** cálculo
**Configurável:** Sim (valores por ação)
**Default:** Ver Capítulo 38
**Aplicação:** Após cada ação elegível
**Exceções:** Pontos não são concedidos retroativamente
**Exemplo:** Bateu meta (50) + Streak 7 dias (100) = 150 pontos

## RN-065 — Conversão de Moeda

**Descrição:** Converte valores entre moedas para empresas multi-moeda.
**Fórmula:** `Valor_Convertido = Valor_Original × Taxa_de_Câmbio`
**Módulo:** Multi-moeda (v3.0)
**Tipo:** cálculo
**Configurável:** Sim (moeda origem, moeda destino, taxa)
**Default:** Taxa diária do Banco Central
**Aplicação:** Ao exibir valores para usuário em moeda diferente do lançamento
**Exceções:** Se taxa não disponível, usa última taxa conhecida + warning
**Exemplo:** R$1.000 × 0.20 = US$200

## RN-066 — Atingimento Acumulado

**Descrição:** Soma de atingimentos em período múltiplo.
**Fórmula:** `Acumulado = Σ Atingimento_diário`
**Módulo:** Metas
**Tipo:** cálculo
**Configurável:** Não
**Default:** N/A
**Aplicação:** Para metas mensais/trimestrais/anuais
**Exceções:** Se meta diária = 0 em algum dia, considera 0% no acumulado
**Exemplo:** Atingimentos diários: 80%, 100%, 90% → Acumulado mensal = 270% (média 90%)

## RN-067 — Ranking por Crescimento

**Descrição:** Ranking baseado em crescimento percentual vs. período anterior.
**Fórmula:** `Posição = ordem_desc(Crescimento)`
**Módulo:** Ranking
**Tipo:** cálculo
**Configurável:** Não
**Default:** N/A
**Aplicação:** Em rankings de crescimento
**Exceções:** Vendedores sem histórico no período anterior não participam
**Exemplo:** Vendedor com 30% de crescimento fica à frente de quem teve 20%

## RN-068 — Cálculo de Bônus

**Descrição:** Calcula bônus financeiro por atingimento.
**Fórmula:** `Bônus = Base × (Atingimento / 100) × Multiplicador`
**Módulo:** Premiações
**Tipo:** cálculo
**Configurável:** Sim (Base, Multiplicador por faixa)
**Default:** Ver tabela de faixas
**Aplicação:** Ao final de campanha com bônus financeiro
**Exceções:** Se atingimento < 50%, bônus = 0
**Exemplo:**
- Base: R$1.000
- Atingimento: 120%
- Multiplicador (≥120%): 1.5
- Bônus: R$1.000 × 1.2 × 1.5 = R$1.800

## RN-069 — Score Composto

**Descrição:** Score único que combina múltiplos KPIs.
**Fórmula:** `Score = Σ (KPI_normalizado_i × Peso_i)`
**Módulo:** IA/Relatórios
**Tipo:** cálculo
**Configurável:** Sim (KPIs incluídos e pesos)
**Default:** Atingimento (50%), TKM (25%), Conversão (25%)
**Aplicação:** Dashboards de score
**Exceções:** KPIs faltantes são substituídos pela média
**Exemplo:** Score = 0.85 × 0.5 + 0.90 × 0.25 + 0.75 × 0.25 = 0.84 (84%)

## RN-070 — Tendência (Trend)

**Descrição:** Calcula tendência (alta, baixa, estável) de um indicador.
**Fórmula:** `Tendência = REGRAS(_LINEAR_(valores_diários, período))`
**Módulo:** Relatórios
**Tipo:** cálculo
**Configurável:** Sim (período: 7, 14, 30 dias; threshold: ±5%)
**Default:** 7 dias, ±5%
**Aplicação:** Ao exibir gráficos
**Exceções:** Se menos de 3 pontos de dados, tendência = estável
**Exemplo:**
- Slope: +2.5%/dia
- Tendência: 📈 Alta (slope > 5% threshold)

---

# Capítulo 25 — Regras de Validação por Módulo

## RN-071 — Validação de Usuário (CPF)

**Descrição:** Valida CPF antes de aceitar cadastro.
**Regra:** CPF deve ser válido (algoritmo) e único no sistema.
**Módulo:** Usuários
**Tipo:** validação
**Configurável:** Não (obrigatório)
**Aplicação:** Ao criar/editar usuário
**Mensagem de erro:** "CPF inválido" ou "CPF já cadastrado"
**Exceções:** Estrangeiros podem usar passaporte (configurável)

## RN-072 — Validação de E-mail

**Descrição:** Valida formato de e-mail.
**Regra:** Deve seguir padrão RFC 5322 e ser único.
**Módulo:** Usuários
**Tipo:** validação
**Configurável:** Não
**Aplicação:** Ao criar/editar usuário
**Mensagem de erro:** "E-mail inválido" ou "E-mail já cadastrado"

## RN-073 — Validação de Senha

**Descrição:** Valida complexidade de senha.
**Regra:** Mínimo 8 caracteres (configurável: 8/10/12/14), 1 maiúscula, 1 minúscula, 1 número, 1 especial, não na lista de senhas vazadas.
**Módulo:** Segurança
**Tipo:** validação
**Configurável:** Sim (parâmetros)
**Default:** 8 caracteres
**Aplicação:** Ao criar/alterar senha
**Mensagem de erro:** Detalha qual requisito faltou
**Exceções:** Nenhuma (regra universal)

## RN-074 — Validação de Resultado (Range)

**Descrição:** Valida se resultado está dentro do range esperado.
**Regra:** Valor deve estar entre 0 e `meta × fator_anomalia` (default: 5x).
**Módulo:** Resultados
**Tipo:** validação
**Configurável:** Sim (fator_anomalia)
**Default:** 5x
**Aplicação:** Ao lançar resultado
**Ação se exceder:** Pede justificativa (RN-075)
**Exceções:** Indicadores específicos podem ter ranges próprios

## RN-075 — Justificativa de Resultado Anômalo

**Descrição:** Exige justificativa para resultados anômalos.
**Regra:** Se resultado > 200% da meta, exige justificativa textual (mínimo 20 caracteres).
**Módulo:** Resultados
**Tipo:** validação
**Configurável:** Sim (limiar: 150%, 200%, 300%)
**Default:** 200%
**Aplicação:** Após RN-074, se resultado dentro do range mas acima do limiar
**Ação se não justificar:** Bloqueia salvamento

## RN-076 — Validação de Meta (Período)

**Descrição:** Valida período da meta.
**Regra:** Data fim deve ser maior que data início. Período máximo: 1 ano.
**Módulo:** Metas
**Tipo:** validação
**Configurável:** Não
**Aplicação:** Ao criar/editar meta
**Mensagem de erro:** "Período inválido" ou "Período excede máximo de 1 ano"

## RN-077 — Validação de Campanha (Sobreposição)

**Descrição:** Alerta sobre campanhas sobrepostas.
**Regra:** Permite, mas alerta, se uma campanha se sobrepõe a outra para o mesmo grupo de participantes.
**Módulo:** Campanhas
**Tipo:** validação
**Configurável:** Não
**Aplicação:** Ao criar campanha
**Ação:** Exibe warning mas permite salvar

## RN-078 — Validação de Indicador (Fórmula)

**Descrição:** Valida sintaxe da fórmula.
**Regra:** Fórmula deve passar no parser e em testes de execução.
**Módulo:** Indicadores
**Tipo:** validação
**Configurável:** Não
**Aplicação:** Ao criar/editar indicador com fórmula
**Ação:** Botão "Validar Fórmula" executa testes

## RN-079 — Validação de Arquivo Anexo

**Descrição:** Valida arquivo anexado.
**Regra:**
- Formato: JPG, PNG, PDF (configurável)
- Tamanho máximo: 5MB por arquivo (configurável)
- Máximo 5 arquivos por resultado
- Antivírus scan obrigatório
**Módulo:** Resultados
**Tipo:** validação
**Configurável:** Sim
**Aplicação:** Ao anexar arquivo
**Ação se inválido:** Rejeita com mensagem específica

## RN-080 — Validação de Importação (Lote)

**Descrição:** Valida arquivo de importação.
**Regra:**
- Formato: .xlsx, .csv
- Tamanho máximo: 10MB
- Máximo 5.000 linhas por arquivo
- Cabeçalho obrigatório conforme template
- Tipos de dados corretos por coluna
**Módulo:** Importação
**Tipo:** validação
**Configurável:** Não
**Aplicação:** Ao enviar arquivo
**Ação:** Rejeita arquivo inválido; aceita parcialmente válido (com warning)

---

# Capítulo 26 — Regras de Notificação

## RN-081 — Disparo de Notificação de Aprovação

**Descrição:** Quando disparar notificação de resultado pendente.
**Regra:** Dispara quando resultado é lançado e exige aprovação.
**Destinatários:** Aprovadores do indicador (Gerente/Supervisor da equipe).
**Módulo:** Notificações
**Tipo:** notificação
**Configurável:** Sim (canais: sistema, e-mail, push, WhatsApp)
**Default:** Sistema + Push
**Aplicação:** Imediatamente após lançamento
**Repeat:** Lembrete em 4h, 24h, 72h se não aprovado

## RN-082 — Disparo de Notificação de Meta Atingida

**Descrição:** Quando disparar notificação de meta atingida.
**Regra:** Dispara quando usuário atinge 100% da meta (diária/semanal/mensal).
**Destinatários:** O próprio usuário + seu supervisor.
**Módulo:** Notificações
**Tipo:** notificação
**Configurável:** Sim (canais)
**Default:** Sistema + Push + E-mail
**Aplicação:** Imediatamente após cruzar 100%

## RN-083 — Disparo de Notificação de Nova Campanha

**Descrição:** Quando avisar sobre nova campanha.
**Regra:** Dispara quando campanha é ativada (status: rascunho → ativa).
**Destinatários:** Todos os participantes da campanha.
**Módulo:** Notificações
**Tipo:** notificação
**Configurável:** Sim
**Default:** Sistema + Push + E-mail

## RN-084 — Disparo de Notificação de Campanha Terminando

**Descrição:** Lembretes de fim de campanha.
**Regra:** Dispara 3 dias antes, 1 dia antes, e no dia do fim.
**Destinatários:** Todos os participantes ativos.
**Módulo:** Notificações
**Tipo:** notificação
**Configurável:** Sim (dias de antecedência)
**Default:** 3 e 1 dias

## RN-085 — Disparo de Notificação de Premiação

**Descrição:** Avisar sobre premiação recebida.
**Regra:** Dispara quando premiação é concedida.
**Destinatários:** O usuário premiado.
**Módulo:** Notificações
**Tipo:** notificação
**Configurável:** Sim
**Default:** Sistema + Push + E-mail + WhatsApp (se ativo)

## RN-086 — Lembrete Diário de Lançamento

**Descrição:** Lembrete diário para lançar resultado.
**Regra:** Dispara 1x por dia, no horário configurado, se usuário ainda não lançou.
**Destinatários:** Usuários com indicadores diários obrigatórios sem lançamento no dia.
**Módulo:** Notificações
**Tipo:** notificação
**Configurável:** Sim (horário: 16h, 17h, 18h, 19h, 20h)
**Default:** 18h
**Aplicação:** Diariamente, exceto fim de semana (configurável)

## RN-087 — Alerta de Queda de Desempenho

**Descrição:** Alerta gerente sobre queda significativa.
**Regra:** Dispara quando vendedor cai > 30% vs. média dos últimos 7 dias.
**Destinatários:** Supervisor + Gerente do vendedor.
**Módulo:** Notificações/IA
**Tipo:** notificação
**Configurável:** Sim (limiar: 20%, 30%, 50%)
**Default:** 30%
**Aplicação:** Diariamente, após processamento de resultados

## RN-088 — Não Perturbe

**Descrição:** Respeita horário de silêncio do usuário.
**Regra:** Notificações push são atrasadas para fora do período de silêncio.
**Módulo:** Notificações
**Tipo:** notificação
**Configurável:** Sim (horário pelo usuário)
**Default:** 22h-07h (não ativo por padrão)
**Aplicação:** Todas as notificações push
**Exceções:** Notificações críticas de segurança não são afetadas

---

# Capítulo 27 — Regras de Auditoria

## RN-089 — Eventos Auditados

**Descrição:** Define quais eventos devem ser auditados.
**Regra:** Os seguintes eventos são obrigatoriamente auditados:
- Login (sucesso e falha)
- Logout
- Criação/edição/exclusão de qualquer registro
- Aprovação/rejeição de resultados
- Alterações de permissões
- Alterações de metas e indicadores
- Acesso a dados sensíveis (CPF, relatórios de RH)
- Configurações do sistema
- Backup e restauração
- Alterações de licença
- Uso de IA (queries)
- Chamadas de API (com API key)
- Exportações de dados
**Módulo:** Auditoria
**Tipo:** auditoria
**Configurável:** Não (universal)

## RN-090 — Conteúdo do Log de Auditoria

**Descrição:** Campos obrigatórios em cada log.
**Regra:** Todo log deve conter:
- ID do log (UUID)
- Timestamp (UTC)
- Usuário ID
- Nome do usuário
- IP de origem
- User-Agent
- Ação (create, update, delete, login, etc.)
- Tabela afetada
- ID do registro afetado
- Valor anterior (JSON)
- Valor novo (JSON)
- Justificativa (se aplicável)
- Tenant ID (empresa)
**Módulo:** Auditoria
**Tipo:** auditoria
**Configurável:** Não

## RN-091 — Retenção de Logs

**Descrição:** Por quanto tempo manter logs.
**Regra:**
- Logs de auditoria: 5 anos (mínimo LGPD)
- Logs de sistema: 90 dias
- Logs de erro: 1 ano
- Logs de acesso (login): 2 anos
- Logs de IA: 1 ano
**Módulo:** Auditoria
**Tipo:** auditoria
**Configurável:** Sim (apenas aumentar)
**Default:** Conforme acima
**Aplicação:** Auto-purge após período
**Exceções:** Logs em investigação ativa são preservados

## RN-092 — Imutabilidade de Logs

**Descrição:** Logs não podem ser alterados ou apagados.
**Regra:** Nenhum usuário (inclusive Admin Master) pode editar ou excluir logs de auditoria.
**Módulo:** Auditoria
**Tipo:** auditoria
**Configurável:** Não
**Aplicação:** Append-only no banco
**Exceções:** Purge automático após retenção (RN-091)

## RN-093 — Alertas de Auditoria

**Descrição:** Dispara alertas para eventos críticos.
**Regra:** Os seguintes eventos geram alerta para Admin Master:
- Mudança de permissões críticas (`system.admin`, `license.manage`)
- Acesso a dados sensíveis fora de horário comercial
- Login de IP novo (fora do país)
- 5+ tentativas de login falhas em 1h
- Exportação de > 1.000 registros por usuário
- Backup restaurado
- Licença alterada
- API key criada/revogada
**Módulo:** Auditoria
**Tipo:** auditoria
**Configurável:** Sim (eventos e destinatários)
**Default:** Todos acima

## RN-094 — Exportação de Logs

**Descrição:** Permite exportar logs para análise externa.
**Regra:** Admin Master pode exportar logs filtrados em CSV ou JSON.
**Módulo:** Auditoria
**Tipo:** auditoria
**Configurável:** Não
**Aplicação:** Sob demanda, com justificativa registrada
**Audit trail:** A própria exportação é auditada

---

# Capítulo 28 — Regras de LGPD

## RN-095 — Consentimento

**Descrição:** Exige consentimento explícito para uso de dados.
**Regra:** Usuário deve consentir com:
- Tratamento de dados (obrigatório para uso do sistema)
- Comunicações (opcional)
- Uso de IA em dados pessoais (opcional)
- Compartilhamento com parceiros (opcional)
**Módulo:** LGPD
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** No primeiro acesso e quando políticas mudarem
**Audit:** Consentimento é registrado com timestamp e versão da política

## RN-096 — Direito de Acesso

**Descrição:** Usuário pode solicitar todos os dados que o sistema tem sobre ele.
**Regra:** Em até 72h da solicitação, sistema deve gerar exportação completa.
**Módulo:** LGPD
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Quando usuário solicita em Perfil > Privacidade
**Formato:** ZIP com JSON/CSV de todos os dados pessoais

## RN-097 — Direito de Retificação

**Descrição:** Usuário pode corrigir dados pessoais incorretos.
**Regra:** Usuário pode editar: nome, telefone, celular, foto. Para CPF/cargo: solicita ao admin.
**Módulo:** LGPD
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Imediatamente quando solicitado

## RN-098 — Direito de Exclusão (Anonimização)

**Descrição:** Usuário pode solicitar exclusão de dados pessoais.
**Regra:** Após desligamento da empresa, dados pessoais (CPF, e-mail, telefone, foto) são anonimizados em 2 anos.
**Módulo:** LGPD
**Tipo:** segurança
**Configurável:** Não (prazo pode ser menor se solicitado)
**Default:** 2 anos
**Aplicação:** Automática após 2 anos do bloqueio
**Mantém:** Dados comerciais agregados (resultados, metas) sem identificação

## RN-099 — Retenção de Dados

**Descrição:** Por quanto tempo manter dados pessoais.
**Regra:**
- Dados de usuário ativo: enquanto ativo
- Dados de usuário bloqueado: 2 anos
- Logs de auditoria com PII: 5 anos (mínimo LGPD)
- Backups com PII: 30 dias (após expiração, PII é removida)
**Módulo:** LGPD
**Tipo:** segurança
**Configurável:** Não

## RN-100 — Minimização de Dados

**Descrição:** Coletar apenas dados necessários.
**Regra:** Sistema só coleta dados estritamente necessários para funcionalidade.
**Módulo:** LGPD
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Em toda nova feature, análise de minimização obrigatória

## RN-101 — DPO (Encarregado de Dados)

**Descrição:** Empresa deve designar DPO.
**Regra:** Admin da Empresa deve registrar DPO no sistema (nome, e-mail).
**Módulo:** LGPD
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Na configuração inicial
**Uso:** Solicitações de titulares são encaminhadas ao DPO

## RN-102 — Notificação de Incidente

**Descrição:** Notificar ANPD em caso de vazamento.
**Regra:** Em caso de incidente de segurança com vazamento de dados pessoais:
- Notificar ANPD em até 72h
- Comunicar titulares afetados em prazo razoável
- Documentar incidente
**Módulo:** LGPD/Segurança
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Quando incidente é confirmado

---

# Capítulo 29 — Regras de Licenciamento

## RN-103 — Limites por Plano

**Descrição:** Define limites de uso por plano.
**Regra:**
| Plano | Usuários | Filiais | IA/mês | Storage |
|-------|----------|---------|--------|---------|
| Starter | 50 | 3 | 500 | 5 GB |
| Professional | 500 | 20 | 5.000 | 50 GB |
| Enterprise | Ilimitado | Ilimitado | 50.000+ | 500 GB+ |
| Custom | Custom | Custom | Custom | Custom |
**Módulo:** Licenciamento
**Tipo:** negócio
**Configurável:** Não (definido por contrato)

## RN-104 — Bloqueio ao Exceder Limite

**Descrição:** Ação ao tentar exceder limite.
**Regra:**
- Usuários: bloqueia criação, exibe mensagem, sugere upgrade
- Filiais: bloqueia criação, exibe mensagem
- IA: bloqueia novas queries até renovação mensal
- Storage: bloqueia uploads, sistema continua funcionando
**Módulo:** Licenciamento
**Tipo:** negócio
**Configurável:** Não

## RN-105 — Renovação

**Descrição:** Ciclo de renovação de licença.
**Regra:**
- Notificação 30 dias antes da expiração
- Notificação 7 dias antes (urgente)
- No dia: modo somente leitura
- 7 dias após: bloqueio total (apenas admin pode exportar dados)
- 30 dias após: dados podem ser apagados
**Módulo:** Licenciamento
**Tipo:** negócio
**Configurável:** Não

## RN-106 — Upgrade

**Descrição:** Processo de upgrade de plano.
**Regra:**
- Pode ser feito a qualquer momento
- Novos limites aplicados imediatatamente
- Pró-rateamento do valor
- Sem perda de dados
**Módulo:** Licenciamento
**Tipo:** negócio
**Configurável:** Não

## RN-107 — Downgrade

**Descrição:** Processo de downgrade de plano.
**Regra:**
- Só efetivo no fim do período atual
- Se exceder novos limites: bloqueio até adequação
- Sem perda de dados (mas pode haver ocultação)
**Módulo:** Licenciamento
**Tipo:** negócio
**Configurável:** Não

## RN-108 — Verificação de Licença

**Descrição:** Como e quando verificar licença.
**Regra:**
- Verificação online a cada 24h
- Se offline: tolerância de 7 dias
- Após 7 dias sem verificação: modo somente leitura
- Após 14 dias: bloqueio total
**Módulo:** Licenciamento
**Tipo:** negócio
**Configurável:** Não

---

# Capítulo 30 — Regras de Multi-tenant

## RN-109 — Isolamento de Dados

**Descrição:** Garante que empresas não veem dados umas das outras.
**Regra:** Todas as queries devem incluir filtro `tenant_id`. Implementado via Row Level Security (RLS) no banco.
**Módulo:** Multi-tenant
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Em toda query a dados de tenant
**Audit:** Tentativas de acesso cross-tenant são logadas e bloqueadas

## RN-110 — Row Level Security (RLS)

**Descrição:** Políticas RLS no PostgreSQL.
**Regra:** Toda tabela de domínio tem:
- Coluna `tenant_id` (NOT NULL)
- Política RLS: `USING (tenant_id = current_setting('app.tenant_id')::uuid)`
- Índice em `tenant_id`
**Módulo:** Multi-tenant
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Em todas as tabelas de domínio
**Exceções:** Tabelas meta (log de migrations, etc.) sem RLS

## RN-111 — Definição de Tenant

**Descrição:** Como o tenant é identificado.
**Regra:** `tenant_id` é extraído do JWT do usuário logado e setado como `current_setting('app.tenant_id')` no início de cada conexão/transaction.
**Módulo:** Multi-tenant
**Tipo:** segurança
**Configurável:** Não

## RN-112 — Migração de Tenant

**Descrição:** Quando um usuário muda de empresa.
**Regra:** Não permitido. Usuário deve ser bloqueado na empresa antiga e recriado na nova.
**Módulo:** Multi-tenant
**Tipo:** negócio
**Configurável:** Não
**Exceções:** Em reestruturações corporativas, migração assistida pelo Admin Master

## RN-113 — Backup por Tenant

**Descrição:** Backups podem ser por tenant.
**Regra:** Em modo SaaS multi-tenant, backup é global mas restauração pode ser por tenant via script.
**Módulo:** Multi-tenant/Backup
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Apenas Admin Master pode restaurar

## RN-114 — Performance Multi-tenant

**Descrição:** Garante performance com múltiplos tenants.
**Regra:**
- Índices sempre incluem `tenant_id` como primeira coluna
- Particionamento de tabelas grandes por tenant (seEnterprise)
- Cache key sempre inclui tenant_id
**Módulo:** Multi-tenant
**Tipo:** performance
**Configurável:** Não

---

# Capítulo 31 — Regras de Cache

## RN-115 — O Que Cachear

**Descrição:** Define quais dados são cacheados.
**Regra:** São cacheados:
- Ranking (composição por período)
- Dashboard widgets
- Metas (configurações)
- Indicadores (configurações)
- Configurações de empresa
- Templates de e-mail
- Traduções
- Lista de permissões por cargo
**Módulo:** Cache
**Tipo:** performance
**Configurável:** Sim
**Default:** Todos acima

## RN-116 — TTL por Tipo

**Descrição:** Tempo de vida do cache por tipo.
**Regra:**
| Tipo | TTL |
|------|-----|
| Ranking | 5 min |
| Dashboard widgets | 1 min |
| Metas (config) | 10 min |
| Indicadores (config) | 30 min |
| Configurações empresa | 1h |
| Templates e-mail | 1h |
| Traduções | 24h |
| Permissões | 30 min |
**Módulo:** Cache
**Tipo:** performance
**Configurável:** Sim
**Default:** Conforme acima

## RN-117 — Invalidação Automática

**Descrição:** Quando invalidar cache.
**Regra:** Cache é invalidado quando:
- Resultado é lançado → invalida ranking + dashboard do vendedor
- Meta é criada/editada → invalida metas + dashboard
- Indicador é editado → invalida indicadores + dashboards dependentes
- Campanha é criada/encerrada → invalida campanhas + ranking
- Permissões mudam → invalida permissões
- Configuração muda → invalida configurações
**Módulo:** Cache
**Tipo:** performance
**Configurável:** Não

## RN-118 — Invalidação Manual

**Descrição:** Admin pode invalidar cache manualmente.
**Regra:** Admin Master pode forçar invalidação em **Sistema > Cache > Limpar**.
**Módulo:** Cache
**Tipo:** performance
**Configurável:** Não
**Audit:** Ação é auditada

## RN-119 — Cache Strategy

**Regra:** Estratégia de cache.
**Regra:** Cache-Aside com write-through para dados críticos.
**Módulo:** Cache
**Tipo:** performance
**Configurável:** Não
**Detalhes:**
- Read: tenta cache, se miss busca banco e popula cache
- Write: atualiza banco, depois cache
- Eviction: LRU (Least Recently Used)

## RN-120 — Cache Hit Ratio

**Descrição:** Métrica de eficácia do cache.
**Regra:** Cache hit ratio deve ser ≥ 80% em produção.
**Módulo:** Cache
**Tipo:** performance
**Configurável:** Não
**Aplicação:** Monitoramento contínuo
**Ação se < 80%:** Investiga causa (TTL muito baixo, invalidação excessiva)

---

# Capítulo 32 — Regras de Rate Limiting

## RN-121 — Rate Limit por Usuário

**Descrição:** Limite de requisições por usuário autenticado.
**Regra:** 1.000 requisições/minuto por usuário.
**Módulo:** API
**Tipo:** segurança
**Configurável:** Sim
**Default:** 1.000/min
**Aplicação:** Em todos os endpoints autenticados
**Ação se exceder:** HTTP 429 com header `Retry-After`

## RN-122 — Rate Limit por IP

**Descrição:** Limite de requisições por IP (inclui não autenticadas).
**Regra:** 10.000 requisições/minuto por IP.
**Módulo:** API
**Tipo:** segurança
**Configurável:** Sim
**Default:** 10.000/min
**Aplicação:** Em todos os endpoints

## RN-123 — Rate Limit de Login

**Descrição:** Previne brute force em login.
**Regra:** 5 tentativas de login por 5 minutos por usuário + IP.
**Módulo:** Segurança
**Tipo:** segurança
**Configurável:** Sim
**Default:** 5 tentativas / 5 min
**Ação se exceder:** Bloqueia conta por 15 minutos

## RN-124 — Rate Limit de Reset de Senha

**Descrição:** Previne abuso de reset de senha.
**Regra:** 3 resets por hora por IP; 1 reset por 5 min por usuário.
**Módulo:** Segurança
**Tipo:** segurança
**Configurável:** Sim
**Default:** Conforme acima

## RN-125 — Rate Limit por Plano

**Descrição:** Limites diferenciados por plano.
**Regra:**
| Plano | API req/min | IA queries/mês |
|-------|-------------|----------------|
| Starter | 100 | 500 |
| Professional | 1.000 | 5.000 |
| Enterprise | 10.000 | 50.000+ |
**Módulo:** Licenciamento
**Tipo:** negócio
**Configurável:** Não

## RN-126 — Rate Limit de IA

**Descrição:** Limita uso de IA por usuário.
**Regra:** 10 queries de IA por minuto por usuário.
**Módulo:** IA
**Tipo:** segurança
**Configurável:** Sim
**Default:** 10/min
**Ação se exceder:** HTTP 429 + mensagem "Aguarde antes de nova pergunta"

---

# Capítulo 33 — Regras de Webhook

## RN-127 — Eventos Disponíveis

**Descrição:** Eventos que podem disparar webhook.
**Regra:** Eventos suportados:
- `user.created`, `user.updated`, `user.blocked`
- `goal.created`, `goal.updated`, `goal.achieved`
- `result.created`, `result.approved`, `result.rejected`
- `campaign.created`, `campaign.started`, `campaign.ended`
- `ranking.updated`
- `award.granted`
- `license.warning`, `license.expired`
**Módulo:** Integrações
**Tipo:** negócio
**Configurável:** Não (lista fixa, mas admin seleciona quais disparar)

## RN-128 — Payload Padrão

**Descrição:** Estrutura do payload enviado.
**Regra:** Todo webhook envia JSON com:
```json
{
  "event": "result.approved",
  "timestamp": "2025-03-12T14:35:00Z",
  "tenant_id": "uuid",
  "data": { ... },
  "metadata": {
    "webhook_id": "uuid",
    "delivery_id": "uuid",
    "attempt": 1
  },
  "signature": "hmac-sha256=..."
}
```
**Módulo:** Integrações
**Tipo:** negócio
**Configurável:** Não

## RN-129 — Assinatura HMAC

**Descrição:** Todo webhook é assinado.
**Regra:** Payload inclui header `X-Orion-Signature` com HMAC-SHA256 do corpo usando segredo do webhook.
**Módulo:** Integrações
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Destinatário deve validar assinatura

## RN-130 — Timeout

**Descrição:** Tempo máximo de espera por resposta.
**Regra:** 30 segundos. Após isso, considera falha.
**Módulo:** Integrações
**Tipo:** performance
**Configurável:** Sim (10s, 30s, 60s)
**Default:** 30s

## RN-131 — Retry Policy

**Descrição:** Política de retry em caso de falha.
**Regra:** Em caso de falha (HTTP 5xx ou timeout), retry com backoff exponencial:
- Tentativa 1: imediato
- Tentativa 2: +1 min
- Tentativa 3: +5 min
- Tentativa 4: +30 min
- Tentativa 5: +2h
- Tentativa 6: +12h
- Após 6 falhas: marca como "failed", notifica admin
**Módulo:** Integrações
**Tipo:** negócio
**Configurável:** Sim (número de retries)
**Default:** 6 retries

## RN-132 — Verificação de SSL

**Descrição:** Webhook deve usar HTTPS.
**Regra:** URL de webhook deve ser HTTPS com certificado válido.
**Módulo:** Integrações
**Tipo:** segurança
**Configurável:** Não (obrigatório)
**Exceções:** Em ambiente de desenvolvimento (localhost), pode ser HTTP

---

# Capítulo 34 — Regras de IA

## RN-133 — Limite Mensal

**Descrição:** Cada empresa tem limite mensal de queries.
**Regra:** Limite conforme plano (Starter: 500, Professional: 5.000, Enterprise: 50.000+).
**Módulo:** IA
**Tipo:** negócio
**Configurável:** Sim (compra de pacotes adicionais)
**Aplicação:** Renova no 1º dia de cada mês
**Ação ao atingir:** Bloqueia novas queries, exibe mensagem

## RN-134 — Alertas de Consumo

**Descrição:** Avisos de consumo.
**Regra:** Alertas em 50%, 80%, 95%, 100% do limite.
**Módulo:** IA
**Tipo:** notificação
**Configurável:** Sim
**Default:** Todos acima
**Destinatários:** Admin Master, Admin Empresa

## RN-135 — Custos por Modelo

**Descrição:** Diferentes modelos têm custos diferentes.
**Regra:** Queries com modelos mais avançados consomem mais "créditos":
- gpt-4o-mini: 1 crédito
- gpt-4o: 5 créditos
- gpt-4o com analysis: 10 créditos
**Módulo:** IA
**Tipo:** negócio
**Configurável:** Não
**Aplicação:** Ao processar query, desconta créditos do mês

## RN-136 — Fallback de IA

**Descrição:** Comportamento se IA indisponível.
**Regra:** Se IA falhar:
1. Tentar modelo alternativo (gpt-4o → gpt-4o-mini)
2. Se ainda falhar: exibir mensagem "IA temporariamente indisponível"
3. Não bloquear funcionalidades core do sistema
4. Notificar admin Master
**Módulo:** IA
**Tipo:** negócio
**Configurável:** Não

## RN-137 — Filtros de Dados (LGPD)

**Descrição:** Quais dados a IA pode acessar.
**Regra:** IA não recebe:
- CPF
- E-mail
- Telefone
- Endereço
- Outros PII
**Módulo:** IA/LGPD
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Antes de enviar para a IA, dados são anonimizados/agregados

## RN-138 — Consentimento de IA

**Descrição:** Exige consentimento explícito do usuário.
**Regra:** IA não processa dados de usuário sem consentimento registrado.
**Módulo:** IA/LGPD
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** No primeiro acesso, usuário escolhe
**Revogação:** Usuário pode revogar a qualquer momento em Perfil > Privacidade

## RN-139 — Auditabilidade de IA

**Descrição:** Toda query de IA é auditada.
**Regra:** Log de IA inclui:
- Usuário
- Timestamp
- Query (pergunta)
- Resposta
- Modelo usado
- Tokens consumidos
- Custo (créditos)
**Módulo:** IA/Auditoria
**Tipo:** auditoria
**Configurável:** Não
**Retenção:** 1 ano

## RN-140 — Não Decisão Automática

**Descrição:** IA nunca toma decisões automáticas.
**Regra:** IA apenas sugere. Toda ação é executada apenas se usuário aceitar.
**Módulo:** IA
**Tipo:** segurança
**Configurável:** Não
**Exceções:** Insights automáticos diários não são "decisões", são análises

---

# Capítulo 35 — Regras de Backup

## RN-141 — Frequência

**Descrição:** Frequência de backups automáticos.
**Regra:** Backup completo diário às 02h (configurável).
**Módulo:** Backup
**Tipo:** segurança
**Configurável:** Sim (horário)
**Default:** 02h
**Plus:** Backup incremental a cada 6h (Enterprise)

## RN-142 — Retenção

**Descrição:** Por quanto tempo manter backups.
**Regra:**
- Backups diários: 30 dias
- Backups semanais: 12 semanas
- Backups mensais: 12 meses
- Backups anuais: 5 anos (LGPD)
**Módulo:** Backup
**Tipo:** segurança
**Configurável:** Sim (apenas aumentar)
**Default:** Conforme acima

## RN-143 — Backup Externo

**Descrição:** Backup deve ser externo ao servidor principal.
**Regra:** Backup deve ser copiado para local externo (S3, GCS, outro servidor) em até 1h após criação.
**Módulo:** Backup
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Automático após cada backup

## RN-144 — Verificação de Integridade

**Descrição:** Backup deve ser validado.
**Regra:** Após criar backup, sistema verifica:
- Tamanho dentro do esperado (±20%)
- Checksum válido
- Contagem de registros principal
- Schema compatível
**Módulo:** Backup
**Tipo:** segurança
**Configurável:** Não
**Ação se falhar:** Alerta Admin Master

## RN-145 — Teste de Restauração

**Descrição:** Backup deve ser testado mensalmente.
**Regra:** Todo mês, restaurar backup mais recente em ambiente sandbox e executar smoke tests.
**Módulo:** Backup
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Primeira segunda do mês
**Documentação:** Resultado é registrado

## RN-146 — Criptografia

**Descrição:** Backups devem ser criptografados.
**Regra:** Backups são criptografados com AES-256. Chave mantida em KMS (Key Management Service).
**Módulo:** Backup/Segurança
**Tipo:** segurança
**Configurável:** Não

---

# Capítulo 36 — Regras de Atualização

## RN-147 — Versionamento SemVer

**Descrição:** Versões seguem Semantic Versioning.
**Regra:** Formato `MAJOR.MINOR.PATCH`:
- PATCH: correções de bugs, sem breaking changes
- MINOR: novas features, sem breaking changes
- MAJOR: breaking changes, exige migração
**Módulo:** Atualizações
**Tipo:** negócio
**Configurável:** Não

## RN-148 — Backup Pré-Atualização

**Descrição:** Backup obrigatório antes de atualizar.
**Regra:** Sistema cria backup automático antes de qualquer atualização.
**Módulo:** Atualizações
**Tipo:** segurança
**Configurável:** Não
**Aplicação:** Automática

## RN-149 — Rollback Automático

**Descrição:** Se atualização falhar, rollback automático.
**Regra:** Se migrations falham ou smoke tests pós-atualização falham, sistema restaura backup automático.
**Módulo:** Atualizações
**Tipo:** segurança
**Configurável:** Não
**Notificação:** Admin Master é avisado

## RN-150 — Atualizações Automáticas

**Descrição:** Tipos de atualização que podem ser automáticas.
**Regra:**
- Patch de segurança: automático (configurável)
- Patch de bug: automático com 7 dias delay
- Minor: manual (recomendado) ou automático com 14 dias delay
- Major: sempre manual
**Módulo:** Atualizações
**Tipo:** negócio
**Configurável:** Sim
**Default:** Patch automático, demais manual

## RN-151 — Janela de Manutenção

**Descrição:** Atualizações em horário de baixo uso.
**Regra:** Atualizações manuais devem ser em janela de manutenção configurada.
**Módulo:** Atualizações
**Tipo:** negócio
**Configurável:** Sim
**Default:** Domingo 02h-05h
**Notificação:** Usuários avisados 24h antes

## RN-152 — Breaking Changes

**Descrição:** Como comunicar breaking changes.
**Regra:** Breaking changes (MAJOR) devem ser:
- Documentadas em changelog
- Comunicadas com 30 dias de antecedência
- Acompanhadas de guia de migração
- Aplicadas manualmente pelo Admin Master
**Módulo:** Atualizações
**Tipo:** negócio
**Configurável:** Não

---

# Capítulo 37 — Regras de Marketplace

## RN-153 — Comissão

**Descrição:** Comissão do Orion sobre vendas no marketplace.
**Regra:** Orion retém 20% do valor de venda de plugins/extensões.
**Módulo:** Marketplace
**Tipo:** negócio
**Configurável:** Não (padrão contratual)
**Aplicação:** A cada venda, 80% para desenvolvedor, 20% para Orion
**Pagamento:** Mensal via transferência

## RN-154 — Certificação

**Descrição:** Plugins devem ser certificados.
**Regra:** Todo plugin no marketplace passa por:
- Code review pela equipe Orion
- Testes de segurança (SAST, DAST)
- Testes de performance
- Aprovação do comitê de produto
**Módulo:** Marketplace
**Tipo:** segurança
**Configurável:** Não
**Prazo:** Até 30 dias corridos

## RN-155 — Versionamento de Plugin

**Descrição:** Plugins devem seguir SemVer.
**Regra:** Cada plugin deve versionar suas releases. Atualizações com breaking changes requerem nova certificação.
**Módulo:** Marketplace
**Tipo:** negócio
**Configurável:** Não

## RN-156 — Remoção de Plugin

**Descrição:** Quando um plugin pode ser removido.
**Regra:** Plugin pode ser removido se:
- Solicitado pelo desenvolvedor
- Violar termos de uso
- Tiver vulnerabilidade de segurança não corrigida em 7 dias
- Não receber atualizações há 12 meses
**Módulo:** Marketplace
**Tipo:** negócio
**Configurável:** Não
**Notificação:** Usuários que instalaram são avisados com 30 dias de antecedência
**Migração:** Plugin continua funcionando por 90 dias, depois é desativado

## RN-157 — Free Trial de Plugin

**Descrição:** Plugins podem oferecer trial.
**Regra:** Desenvolvedor pode configurar período de trial (7, 14, 30 dias).
**Módulo:** Marketplace
**Tipo:** negócio
**Configurável:** Sim (pelo desenvolvedor)
**Default:** 14 dias

## RN-158 — Suporte de Plugin

**Descrição:** Desenvolvedor deve oferecer suporte.
**Regra:** Desenvolvedor deve responder a tickets em:
- Plugins pagos: 48h
- Plugins gratuitos: 7 dias
**Módulo:** Marketplace
**Tipo:** negócio
**Configurável:** Não
**Ação se não cumprir:** Plugin recebe badge "Suporte Lento"; após 3 meses, remoção

---

# Capítulo 38 — Regras de Gamificação

## RN-159 — Pontos por Ação

**Descrição:** Sistema de pontos por ações.
**Regra:**
| Ação | Pontos |
|------|--------|
| Lançar resultado no horário (até 18h) | 10 |
| Lançar resultado (após 18h) | 5 |
| Bater meta diária | 50 |
| Bater meta semanal | 200 |
| Bater meta mensal | 1.000 |
| Subir 1 posição no ranking | 20 |
| Participar de campanha | 100 |
| Ganhar campanha (1º) | 500 |
| Streak 7 dias lançando | 100 |
| Streak 30 dias lançando | 500 |
| Streak 90 dias lançando | 2.000 |
| Avaliar positiva IA (insight útil) | 5 |
**Módulo:** Gamificação
**Tipo:** negócio
**Configurável:** Sim (valores)
**Default:** Conforme acima

## RN-160 — Níveis

**Descrição:** Níveis baseados em pontos acumulados.
**Regra:**
| Nível | Pontos necessários |
|-------|---------------------|
| Iniciante | 0 |
| Bronze | 1.000 |
| Prata | 5.000 |
| Ouro | 15.000 |
| Platina | 40.000 |
| Diamante | 100.000 |
| Lenda | 250.000 |
**Módulo:** Gamificação
**Tipo:** negócio
**Configurável:** Não

## RN-161 — Medalhas

**Descrição:** Tipos de medalhas.
**Regra:**
- 🥇 Ouro: 1º lugar em campanha
- 🥈 Prata: 2º lugar em campanha
- 🥉 Bronze: 3º lugar em campanha
- 🏆 Troféu: conquista especial (vendedor do mês, maior crescimento, etc.)
**Módulo:** Gamificação
**Tipo:** negócio
**Configurável:** Não

## RN-162 — Conquistas (Achievements)

**Descrição:** Conquistas desbloqueáveis.
**Regra:**
- 🔥 Streak 7 dias
- 🔥🔥 Streak 30 dias
- 🔥🔥🔥 Streak 90 dias
- ⭐ Meta batida 10x
- ⭐⭐ Meta batida 50x
- ⭐⭐⭐ Meta batida 100x
- 💎 1º cliente fidelizado
- 💎💎 10 clientes fidelizados
- 💎💎💎 100 clientes fidelizados
- 🎯 1ª meta atingida
- 🎯🎯 100 metas atingidas
- 🏆 Primeira vitória em campanha
**Módulo:** Gamificação
**Tipo:** negócio
**Configurável:** Sim (ativar/desativar)
**Default:** Todos ativos

## RN-163 — Privacidade de Conquistas

**Descrição:** Conquistas são pessoais.
**Regra:** Conquistas são visíveis para o próprio usuário e seu gestor direto. Não aparecem no ranking público por padrão.
**Módulo:** Gamificação
**Tipo:** segurança
**Configurável:** Sim (usuário escolhe mostrar)
**Default:** Privado

## RN-164 — Ranking de Pontos

**Descrição:** Ranking opcional baseado em pontos.
**Regra:** Empresa pode ativar ranking de pontos (gamificação) em **Configurações > Gamificação**.
**Módulo:** Gamificação
**Tipo:** negócio
**Configurável:** Sim
**Default:** Desativado

## RN-165 — Troca de Pontos

**Descrição:** Pontos podem ser trocados por prêmios.
**Regra:** Se ativado pela empresa, pontos podem ser trocados por:
- Brindes físicos
- Dias de folga
- Vales-presente
- Dinheiro
**Módulo:** Gamificação
**Tipo:** negócio
**Configurável:** Sim (catálogo pela empresa)
**Default:** Desativado

## RN-166 — Reset de Pontos

**Descrição:** Pontos expiram?
**Regra:** Pontos não expiram. Mas o ranking mensal considera apenas pontos ganhos no mês.
**Módulo:** Gamificação
**Tipo:** negócio
**Configurável:** Não

---

# Capítulo 39 — Regras Adicionais de Negócio

## RN-167 — Horário de Funcionamento

**Descrição:** Cada filial tem horário de funcionamento.
**Regra:** Metas diárias são calculadas com base no horário da filial. Lembretes de lançamento respeitam horário.
**Módulo:** Filiais
**Tipo:** negócio
**Configurável:** Sim (por filial)
**Default:** 08h-18h

## RN-168 — Fuso Horário

**Descrição:** Multi-fuso horário.
**Regra:** Cada filial tem seu fuso. Resultados são armazenados em UTC e exibidos no fuso do usuário.
**Módulo:** Multi-tenant
**Tipo:** negócio
**Configurável:** Sim (por filial)
**Default:** UTC-3 (Brasília)

## RN-169 — Idiomas Suportados

**Descrição:** Idiomas oficiais do Orion.
**Regra:** Idiomas suportados:
- Português (Brasil) — padrão
- Inglês (EUA)
- Espanhol (Espanha)
- Futuro: Francês, Alemão, Italiano
**Módulo:** Internacionalização
**Tipo:** negócio
**Configurável:** Sim (por usuário)
**Default:** Português

## RN-170 — Moedas Suportadas

**Descrição:** Moedas oficiais.
**Regra:** Moedas suportadas:
- BRL (Real) — padrão
- USD (Dólar) — v3.0
- EUR (Euro) — v3.0
- ARS (Peso Argentino) — v3.0
- MXN (Peso Mexicano) — v3.0
**Módulo:** Internacionalização
**Tipo:** negócio
**Configurável:** Sim (por empresa)
**Default:** BRL

## RN-171 — Limite de Upload de Anexos

**Descrição:** Limites de upload.
**Regra:**
- Por arquivo: 5 MB
- Por resultado: 25 MB (5 arquivos × 5 MB)
- Por usuário por dia: 100 MB
- Por empresa por mês: 5 GB (configurável por plano)
**Módulo:** Resultados
**Tipo:** negócio
**Configurável:** Sim (dentro do limite do plano)

## RN-172 — Período de Lançamento Retroativo

**Descrição:** Até quando pode lançar resultado retroativo.
**Regra:** Usuário pode lançar resultados de até 7 dias anteriores. Após 7 dias, apenas supervisor/admin pode (com justificativa).
**Módulo:** Resultados
**Tipo:** negócio
**Configurável:** Sim (período)
**Default:** 7 dias

## RN-173 — Edição de Resultado Aprovado

**Descrição:** Pode editar resultado já aprovado?
**Regra:** Não. Para corrigir, supervisor deve rejeitar e usuário lançar novamente.
**Módulo:** Resultados
**Tipo:** negócio
**Configurável:** Não

## RN-174 — Reabertura de Campanha Encerrada

**Descrição:** Pode reabrir campanha encerrada?
**Regra:** Apenas Admin Master, com justificativa auditada. Premiações já concedidas são mantidas.
**Módulo:** Campanhas
**Tipo:** negócio
**Configurável:** Não

## RN-175 — Metas com Período Personalizado

**Descrição:** Metas podem ter período custom.
**Regra:** Sim. Ex: meta de 10 dias para uma promoção específica.
**Módulo:** Metas
**Tipo:** negócio
**Configurável:** Não (já é recurso)
**Default:** N/A

## RN-176 — Ranking por Filial vs. Empresa

**Descrição:** Escopo do ranking.
**Regra:** Ranking padrão é por filial. Empresa pode ativar ranking interfiliais.
**Módulo:** Ranking
**Tipo:** negócio
**Configurável:** Sim
**Default:** Por filial

## RN-177 — Anonimização de Vendedor Inativo

**Descrição:** Quando vendedor some do ranking.
**Regra:** Vendedores inativos há mais de 30 dias não aparecem em rankings ativos. Aparecem em rankings históricos (com nome, se não anonimizado).
**Módulo:** Ranking
**Tipo:** negócio
**Configurável:** Não

## RN-178 — Notificação para Gestor de Queda

**Descrição:** Alerta de queda de desempenho.
**Regra:** Se vendedor cai > 30% no faturamento médio (7 dias) vs. média anterior (7 dias), gestor é notificado.
**Módulo:** Notificações
**Tipo:** notificação
**Configurável:** Sim (limiar)
**Default:** 30%

## RN-179 — Bloqueio de Acesso a Dados Sensíveis

**Descrição:** Quem pode ver CPF, e-mail, telefone.
**Regra:** Apenas:
- Admin Master
- Admin Empresa
- Gestor direto do usuário
- O próprio usuário
Podem ver dados sensíveis. Outros veem apenas nome e cargo.
**Módulo:** Segurança
**Tipo:** segurança
**Configurável:** Não

## RN-180 — Auditoria de Acesso a Dados Sensíveis

**Descrição:** Acessos a dados sensíveis são auditados.
**Regra:** Toda visualização de CPF, e-mail, telefone, ou relatório com dados pessoais é logada.
**Módulo:** Auditoria
**Tipo:** auditoria
**Configurável:** Não
**Retenção:** 5 anos

---

# Capítulo 40 — Matriz de Regras por Módulo

Resumo de quais regras se aplicam a cada módulo:

| Módulo | Regras aplicáveis |
|--------|-------------------|
| Empresas | RN-001, RN-002, RN-003 |
| Filiais | RN-004, RN-005, RN-006, RN-167, RN-168 |
| Usuários | RN-007 a RN-011, RN-071, RN-072, RN-073, RN-179, RN-180 |
| Permissões | RN-012 a RN-014 |
| Indicadores | RN-015 a RN-017, RN-078 |
| Metas | RN-018 a RN-021, RN-058, RN-066, RN-076, RN-175 |
| Resultados | RN-022 a RN-024, RN-074, RN-075, RN-079, RN-172, RN-173 |
| Cálculo | RN-025 a RN-027, RN-055 a RN-070 |
| Ranking | RN-028 a RN-030, RN-057, RN-067, RN-176, RN-177 |
| Campanhas | RN-031 a RN-033, RN-077, RN-174 |
| Premiações | RN-034, RN-035, RN-068 |
| Dashboards | RN-036 a RN-038 |
| Notificações | RN-039, RN-040, RN-081 a RN-088, RN-178 |
| IA | RN-041 a RN-043, RN-133 a RN-140 |
| Auditoria | RN-044 a RN-046, RN-089 a RN-094, RN-180 |
| Backup | RN-047, RN-048, RN-141 a RN-146 |
| Licenciamento | RN-049, RN-050, RN-103 a RN-108 |
| Motor de Regras | RN-051 |
| Configurações | RN-052 |
| Performance | RN-053, RN-054, RN-120, RN-126 |
| LGPD | RN-095 a RN-102 |
| Multi-tenant | RN-109 a RN-114 |
| Cache | RN-115 a RN-120 |
| Rate Limiting | RN-121 a RN-126 |
| Webhook | RN-127 a RN-132 |
| Atualizações | RN-147 a RN-152 |
| Marketplace | RN-153 a RN-158 |
| Gamificação | RN-159 a RN-166 |
| Importação | RN-080 |
| Internacionalização | RN-169, RN-170 |

---

# Capítulo 41 — Histórico de Versões de Regras

Toda mudança em regra deve ser documentada aqui.

## Formato

```
| Versão | Data | Regra | Mudança | Autor | Justificativa |
|--------|------|-------|---------|-------|---------------|
```

## Histórico

| Versão | Data | Regra | Mudança | Autor | Justificativa |
|--------|------|-------|---------|-------|---------------|
| 1.0.0 | 2025-01-15 | RN-001 a RN-054 | Criação do documento | Equipe Produto | Versão inicial |
| 1.1.0 | 2025-03-12 | RN-055 a RN-180 | Adição de 126 regras novas cobrindo cálculos, validação, notificação, auditoria, LGPD, licenciamento, multi-tenant, cache, rate limiting, webhook, IA, backup, atualização, marketplace, gamificação e regras de negócio adicionais | Equipe Produto | Expansão do documento para cobertura completa |

## Processo de mudança

Para mudar uma regra:

1. **Propor mudança** em documento separado
2. **Revisar** com stakeholders (Produto, Engenharia, Segurança, LGPD)
3. **Aprovar** pelo Product Owner
4. **Versionar** documento (incrementar versão minor)
5. **Comunicar** clientes afetados (com 30 dias de antecedência para breaking changes)
6. **Implementar** no código
7. **Testar** com testes automatizados
8. **Documentar** neste histórico

## Depreciação de regras

Regras podem ser depreciadas:

1. Marcadas como `[DEPRECATED]` no documento
2. Permanecem por 6 meses para compatibilidade
3. Removidas em versão MAJOR seguinte
4. Documentadas aqui

---

# Capítulo 42 — Sugestões Estratégicas

### 1. Construtor de Fórmulas
Além de criar indicadores, o administrador poderá definir fórmulas personalizadas usando outros indicadores. Exemplo: `(Faturamento ÷ Número de Clientes)` para calcular automaticamente o Ticket Médio, sem necessidade de programação.

### 2. Simulador de Metas
O gerente poderá informar um valor hipotético e o sistema mostrará quanto falta para atingir a meta, qual o impacto no ranking e quais indicadores serão afetados.

### 3. Central de Aprovações
Alterações críticas (como metas, indicadores, campanhas e permissões) poderão seguir um fluxo de aprovação antes de entrarem em vigor, aumentando a segurança e o controle.

### 4. Calendário Comercial Inteligente
Além de campanhas, o sistema poderá exibir datas comemorativas, períodos sazonais, reuniões, treinamentos e ações planejadas, sugerindo automaticamente campanhas baseadas no histórico da empresa e no calendário.

### 5. Marketplace de Templates
Comunidade pode compartilhar templates de indicadores, campanhas, dashboards e regras. Avaliação por estrelas, curadoria do time Orion.

### 6. IA Coach Personalizada
No futuro, cada usuário pode ter um perfil de IA que aprende seu estilo e preferências, oferecendo sugestões cada vez mais personalizadas.

### 7. Multi-empresa
Para grupos empresariais, permitir que um usuário administre múltiplas empresas no Orion, com troca rápida de contexto.

### 8. API GraphQL
Além da REST, oferecer API GraphQL para consultas flexíveis e eficientes (especialmente para frontends e integrações mobile).

### 9. Real-time com WebSockets
Para rankings e dashboards, atualização em tempo real via WebSocket (sem necessidade de refresh).

### 10. Mobile Apps Nativos
Para usuários que preferem apps nativos (vs PWA), oferecer apps iOS e Android no futuro.

---

# Próximo Documento

**DOCUMENTO 08 — CASOS DE USO (USE CASE SPECIFICATION).**

Nele vamos detalhar, ator por ator (Administrador, Gerente, Supervisor e Vendedor), todas as interações possíveis com o sistema, descrevendo fluxos principais, fluxos alternativos, pré-condições, pós-condições e critérios de aceite. Esse documento servirá como base para o desenvolvimento das telas, APIs e testes funcionais do Orion.
