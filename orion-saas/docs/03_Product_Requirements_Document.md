# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 03

# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Product Requirements Document

---

# CAPÍTULO 1 — INTRODUÇÃO

## 1.1 Objetivo

Este documento descreve todos os requisitos necessários para o desenvolvimento da plataforma Orion. O PRD será considerado a principal referência durante todo o ciclo de vida do software. Todos os módulos, funcionalidades, regras de negócio, fluxos, interfaces, permissões e integrações deverão seguir rigorosamente as especificações contidas neste documento. Nenhuma funcionalidade deverá ser implementada sem estar documentada.

Este documento tem caráter normativo: em caso de divergência entre implementação e PRD, o PRD prevalece e a implementação deve ser corrigida. Exceções a esta regra exigem aprovação formal do Product Owner e atualização do PRD antes da alteração de código.

## 1.2 Escopo

O Projeto Orion consiste em uma plataforma profissional para gestão de desempenho comercial. O sistema permitirá o cadastro completo de empresas, filiais, departamentos, usuários e equipes; a criação de metas e indicadores personalizados; a gestão de campanhas comerciais com premiações; a exibição de rankings em tempo real; a configuração de dashboards personalizáveis; o envio de notificações; a geração de relatórios; a auditoria completa de operações; a análise por inteligência artificial; e a administração completa da plataforma através de painel independente.

## 1.3 Estrutura do Documento

Este PRD está organizado em 12 capítulos principais:

- **Capítulo 1-3:** Visão geral, escopo e princípios
- **Capítulo 4:** Personas detalhadas
- **Capítulo 5:** Requisitos funcionais (RF-001 a RF-185) — o coração do documento
- **Capítulo 6:** Módulos do sistema
- **Capítulo 7:** Requisitos não funcionais
- **Capítulo 8:** Regras gerais
- **Capítulo 9:** Objetivos de UX
- **Capítulo 10:** Padrões visuais
- **Capítulo 11:** Estratégia de evolução
- **Capítulo 12:** Filosofia do produto

Cada requisito funcional (RF) segue a estrutura:
- **Código** (RF-XXX)
- **Descrição** (o que o sistema deve fazer)
- **Ator principal** (quem executa)
- **Pré-condições** (o que deve ser verdade antes)
- **Fluxo principal** (passos normais)
- **Fluxos alternativos** (variações e exceções)
- **Pós-condições** (estado final)
- **Critérios de aceite** (checklist para considerar pronto)

---

# CAPÍTULO 2 — ESCOPO DO PRODUTO

O Projeto Orion consiste em uma plataforma profissional para gestão de desempenho comercial. O sistema permitirá:

- cadastro de empresas com dados completos e configurações específicas;
- cadastro de filiais vinculadas a empresas, com endereço, gerente e horário;
- cadastro de departamentos e setores dentro de cada filial;
- cadastro de usuários com dados pessoais, login e vínculo com cargo;
- gestão de equipes comerciais com agrupamento de vendedores;
- criação de metas atribuídas em múltiplos níveis (empresa, filial, equipe, indivíduo);
- criação de indicadores personalizados através do Construtor de Indicadores;
- campanhas comerciais com regras, participantes e premiações configuráveis;
- ranking em tempo real com múltiplos critérios de desempate;
- dashboards personalizáveis com widgets arrastáveis;
- notificações push, sistema, e-mail e plugins (WhatsApp, Telegram);
- relatórios em PDF, Excel e tela com filtros flexíveis;
- auditoria completa de todas as operações com rastreabilidade;
- inteligência artificial para insights, previsões e sugestões;
- administração completa da plataforma através de painel independente;
- sistema de licenciamento com validação híbrida (online + offline);
- backup automático e manual com restauração auditada;
- atualizações automáticas com rollback em caso de falha;
- API REST pública para integrações externas;
- suporte a múltiplos idiomas, moedas e temas visuais;
- funcionamento offline-first com sincronização automática;
- instalação como PWA em dispositivos móveis e desktop (Electron).

---

# CAPÍTULO 3 — PRINCÍPIOS DO DESENVOLVIMENTO

Durante todo o desenvolvimento deverão ser respeitados os seguintes princípios.

## 3.1 Configurável

Nenhuma empresa deverá depender de programação para adaptar o sistema. Tudo deverá ser parametrizado através de interface administrativa visual. Este princípio elimina a necessidade de customização de código para cada novo cliente, reduzindo drasticamente o custo de implantação e o tempo de onboarding.

## 3.2 Modular

Cada funcionalidade deverá ser desenvolvida como módulo independente. Exemplo: Usuários, Empresas, Ranking, IA e Relatórios são módulos separados que podem evoluir independentemente, ser ativados ou desativados por licença, e ser desenvolvidos por equipes distintas sem conflitos de merge.

## 3.3 Escalável

A arquitetura deverá suportar crescimento durante muitos anos. Decisões como escolha de banco de dados, padrões de comunicação entre módulos e estratégia de cache devem ser tomadas considerando crescimento de 10x a 100x no volume sem necessidade de reescrita.

## 3.4 Responsivo

O sistema deverá funcionar perfeitamente em desktop, notebook, tablet e smartphone. A interface deve adaptar-se a diferentes tamanhos de tela com breakpoints definidos no Design System, garantindo usabilidade consistente em todos os dispositivos.

## 3.5 Seguro

Segurança deverá ser prioridade em todas as decisões. Toda operação deve passar por validação de permissão, todo dado sensível deve ser criptografado em trânsito e em repouso, e toda alteração deve gerar registro de auditoria.

## 3.6 Simples

Mesmo sendo extremamente completo, o sistema deverá ser intuitivo. A curva de aprendizado para um vendedor deve ser inferior a 30 minutos, e para um gerente inferior a 2 horas. Toda complexidade deve ser encapsulada, não exposta ao usuário final.

---

# CAPÍTULO 4 — PERSONAS

O sistema atenderá seis personas principais, cada uma com escopo de atuação e permissões específicas. O controle de acesso baseado em papéis (RBAC) garante que cada persona enxergue apenas as informações e execute apenas as ações relevantes ao seu papel.

## 4.1 Administrador Master

Responsável técnico pela instalação e manutenção do sistema. Diferentemente do Administrador da Empresa (que gerencia dados de negócio), o Master foca em infraestrutura, licenciamento e saúde do sistema.

**Acessos:**
- Ativação e gestão de licenças
- Módulos e plugins do sistema
- Atualizações e versões
- Backup global e restauração
- Parâmetros globais (idioma, timezone, política de senhas)
- Auditoria de todas as empresas (em modo SaaS)
- Integrações externas (webhooks, API keys)
- Revogação de sessões ativas
- Reinício de serviços

**Não acessa:**
- Dados comerciais específicos de empresas (metas, resultados, ranking)
- Configurações de identidade visual por empresa

## 4.2 Administrador da Empresa

Gerencia os dados de negócio da empresa. Diferentemente do Master, não tem acesso a configurações técnicas do sistema, mas tem controle total sobre a configuração comercial.

**Acessos:**
- Cadastro e edição de empresa, filiais, departamentos
- Cadastro de usuários e atribuição de cargos
- Construtor de Indicadores (criar, editar, desativar)
- Categorias de indicadores
- Cargos e permissões granulares
- Temas e identidade visual da empresa
- Idiomas e moeda
- Regras de cálculo globais
- Exportação de dados da empresa (LGPD)

**Não acessa:**
- Configurações técnicas do sistema (módulos, licença, atualizações)
- Auditoria de outras empresas

## 4.3 Diretor

Tem visão estratégica consolidada da empresa. Não faz operações de cadastro, mas consome relatórios e dashboards executivos para tomada de decisão em nível corporativo.

**Acessos:**
- Dashboard executivo consolidado
- Comparativo entre filiais
- Ranking geral da rede
- Relatórios estratégicos
- Aprovação de metas corporativas
- Consulta à auditoria de gestores

## 4.4 Gerente

Opera no nível tático: cadastra metas, cria campanhas, aprova resultados e consulta insights de IA para tomar decisões sobre sua equipe.

**Acessos:**
- Cadastro de metas individuais e em lote
- Criação de campanhas comerciais
- Configuração de premiações
- Dashboard da equipe
- Aprovação de resultados pendentes
- Ranking da equipe
- Envio de notificações para equipe
- Geração de relatórios de desempenho
- Consulta à IA para insights gerenciais

## 4.5 Supervisor

Atua como camada intermediária entre Gerente e Vendedor, com foco em acompanhamento operacional do grupo sob sua supervisão.

**Acessos:**
- Acompanhamento de metas do grupo
- Lançamento de resultados em lote
- Dashboard do grupo
- Histórico de vendedores
- Reportar feedback ao gerente
- Aprovação de resultados pendentes do grupo

## 4.6 Vendedor

Usuário final do sistema, com acesso apenas aos seus próprios dados. A interface é otimizada para simplicidade e mobile-first.

**Acessos:**
- Dashboard pessoal
- Consulta de metas do dia/semana/mês
- Lançamento de resultados diários
- Visualização do ranking individual
- Histórico próprio
- Participação em campanhas
- Recebimento de notificações
- Consulta de premiações recebidas
- Atualização de perfil
- Consulta à IA para sugestões pessoais

---

# CAPÍTULO 5 — REQUISITOS FUNCIONAIS

Cada requisito recebe um código único (RF-XXX). Os requisitos estão organizados por módulo/domínio para facilitar navegação.

## 5.1 Módulo: Empresas (RF-001 a RF-012)

### RF-001 — Cadastrar empresa

**Descrição:** O sistema deverá permitir cadastrar empresas com dados completos.

**Ator principal:** Administrador Master (primeira execução) ou Admin da Empresa (edição)

**Pré-condições:**
- Sistema instalado e licença ativa
- Usuário autenticado com permissão `companies.create` ou `companies.update`

**Fluxo principal:**
1. Usuário acessa tela de cadastro/edição de empresa
2. Sistema exibe formulário com campos: razão social, nome fantasia, CNPJ, inscrição estadual, telefone, celular, e-mail, website, CEP, endereço, número, complemento, bairro, cidade, estado, país, logo, tema, idioma, moeda, timezone
3. Usuário preenche campos obrigatórios (razão social, CNPJ, endereço, cidade, estado)
4. Sistema valida CNPJ via algoritmo (módulo 11)
5. Sistema busca CEP via API externa (Viacep ou similar) para auto-preenchimento
6. Sistema valida formato de e-mail e telefone
7. Usuário faz upload da logo (PNG/SVG, até 2MB)
8. Sistema valida e armazena logo em storage (S3 ou local)
9. Usuário seleciona tema (Padrão, Azul, Verde, Vermelho, Roxo, Personalizado)
10. Usuário seleciona idioma (Português, Inglês)
11. Usuário seleciona moeda (BRL, USD, EUR)
12. Usuário seleciona timezone (America/Sao_Paulo, etc.)
13. Usuário clica em Salvar
14. Sistema valida todos os campos obrigatórios
15. Sistema criptografa dados sensíveis (CNPJ) com AES-256
16. Sistema persiste no banco de dados
17. Sistema registra auditoria (quem, quando, o quê, valores)
18. Sistema exibe mensagem de sucesso
19. Sistema redireciona para lista de empresas ou dashboard

**Fluxos alternativos:**

**A1 — CNPJ inválido:**
- Passo 4: Sistema detecta CNPJ com módulo 11 falhando
- Sistema exibe erro inline: "CNPJ inválido"
- Bloqueia avanço até correção

**A2 — CNPJ já cadastrado (modo SaaS):**
- Passo 4: Sistema verifica unicidade do CNPJ
- Se já existe: bloqueia cadastro, exibe mensagem "CNPJ já cadastrado em outra empresa"
- Sugere contato com suporte

**A3 — CEP não encontrado:**
- Passo 5: API externa retorna vazio
- Sistema exibe alerta mas permite preenchimento manual
- Não bloqueia o fluxo

**A4 — Logo inválida:**
- Passo 7: Arquivo não é PNG/SVG ou excede 2MB
- Sistema exibe erro: "Formato não suportado" ou "Arquivo muito grande (máx 2MB)"
- Permite nova tentativa

**A5 — Alteração de CNPJ em empresa ativa:**
- Passo 13: Sistema detecta tentativa de alterar CNPJ
- Exige reautenticação com senha + 2FA
- Registra na auditoria como operação crítica

**Pós-condições:**
- Empresa criada ou atualizada no banco de dados
- Auditoria registrada com valores anterior e novo
- Logo armazenada em storage
- Configurações de tema/idioma/moeda aplicadas

**Critérios de aceite:**
- [ ] Todos os campos obrigatórios são validados antes de salvar
- [ ] CNPJ é validado via algoritmo módulo 11
- [ ] CEP é auto-preenchido via API externa
- [ ] Logo aceita apenas PNG/SVG até 2MB
- [ ] CNPJ é criptografado em repouso (AES-256)
- [ ] Alteração de CNPJ exige reautenticação
- [ ] Toda alteração é auditada com IP e User-Agent
- [ ] Tempo de resposta inferior a 2 segundos

---

### RF-002 — Cadastrar filiais

**Descrição:** O sistema deverá permitir cadastrar filiais vinculadas a uma empresa.

**Ator principal:** Administrador da Empresa

**Pré-condições:**
- Empresa cadastrada (RF-001)
- Licença ativa com limite de filiais não atingido
- Usuário com permissão `branches.create`

**Fluxo principal:**
1. Usuário acessa Configurações > Filiais > Nova Filial
2. Sistema exibe formulário: código, nome, telefone, gerente responsável, endereço completo, horário de funcionamento, latitude, longitude
3. Usuário preenche código da filial (ex: LOJA-001)
4. Sistema valida unicidade do código dentro da empresa
5. Usuário preenche nome da filial
6. Usuário seleciona gerente responsável (lista de usuários com cargo de gerente)
7. Usuário preenche endereço (CEP auto-preenche)
8. Usuário define horário de funcionamento (abertura, fechamento, dias da semana)
9. Sistema captura latitude/longitude via API de geocodificação (Google Maps ou similar)
10. Usuário clica em Salvar
11. Sistema valida limite de filiais da licença
12. Sistema persiste filial no banco
13. Sistema registra auditoria
14. Sistema emite evento `branch.created`
15. Sistema exibe mensagem de sucesso

**Fluxos alternativos:**

**A1 — Limite de filiais atingido:**
- Passo 11: Sistema verifica `license.max_branches`
- Se atingido: bloqueia, exibe "Limite atingido (X de Y). Faça upgrade do plano."
- Botão "Upgrade de Plano" leva ao portal

**A2 — Código já existe:**
- Passo 4: Sistema detecta duplicidade
- Exibe erro inline: "Código já usado pela filial X"
- Bloqueia avanço

**A3 — Geocodificação falha:**
- Passo 9: API externa indisponível
- Sistema permite salvar sem lat/lng
- Marca para preenchimento posterior
- Não bloqueia o fluxo

**A4 — Gerente não selecionado:**
- Passo 6: Campo opcional, permite salvar sem gerente
- Sistema marca como "Sem gerente designado"

**Pós-condições:**
- Filial criada e vinculada à empresa
- Auditoria registrada
- Evento `branch.created` emitido
- Lat/lng capturados (se API disponível)

**Critérios de aceite:**
- [ ] Código de filial é único por empresa
- [ ] Limite de licença é validado antes de salvar
- [ ] CEP auto-preenche endereço
- [ ] Lat/lng capturados via geocodificação
- [ ] Horário de funcionamento aceita múltiplos turnos
- [ ] Auditoria registra criação
- [ ] Evento emitido para módulos assinantes

---

### RF-003 — Editar filial

**Descrição:** O sistema deverá permitir editar dados de uma filial existente.

**Ator principal:** Administrador da Empresa

**Pré-condições:**
- Filial cadastrada (RF-002)
- Usuário com permissão `branches.update`

**Fluxo principal:**
1. Usuário acessa lista de filiais
2. Clica na filial desejada
3. Sistema exibe formulário preenchido
4. Usuário edita campos
5. Usuário clica em Salvar
6. Sistema valida alterações
7. Sistema persiste alterações
8. Sistema registra auditoria (valores anterior e novo)
9. Sistema emite evento `branch.updated`
10. Sistema exibe sucesso

**Fluxos alternativos:**

**A1 — Tentativa de mudar empresa da filial:**
- Sistema bloqueia (filial não pode mudar de empresa)
- Exibe erro: "Operação não permitida"

**A2 — Filial com resultados lançados:**
- Sistema alerta mas permite edição
- Não afeta dados históricos

**Pós-condições:**
- Filial atualizada
- Auditoria com diff de valores
- Evento emitido

**Critérios de aceite:**
- [ ] Não é possível mudar filial de empresa
- [ ] Auditoria registra valores anterior e novo
- [ ] Evento emitido

---

### RF-004 — Desativar filial

**Descrição:** O sistema deverá permitir desativar uma filial (soft delete).

**Ator principal:** Administrador da Empresa

**Pré-condições:**
- Filial ativa
- Usuário com permissão `branches.delete`

**Fluxo principal:**
1. Usuário acessa filial
2. Clica em "Desativar"
3. Sistema exibe confirmação: "Desativar filial X? Dados históricos serão preservados. Usuários vinculados não poderão mais acessar."
4. Usuário confirma
5. Sistema valida: não há usuários ativos vinculados (ou solicita transferência)
6. Sistema executa soft delete (SET deleted_at = NOW())
7. Sistema desativa usuários vinculados (opcional, conforme escolha)
8. Sistema registra auditoria
9. Sistema emite evento `branch.deactivated`
10. Sistema exibe sucesso

**Fluxos alternativos:**

**A1 — Há usuários ativos na filial:**
- Sistema lista usuários afetados
- Pergunta: "Transferir usuários para outra filial ou desativar?"
- Se transferir: seleciona filial destino
- Se desativar: confirma

**A2 — Há metas ativas para a filial:**
- Sistema alerta: "Existem X metas ativas. Elas serão canceladas."
- Exige confirmação dupla

**Pós-condições:**
- Filial marcada como inativa (deleted_at preenchido)
- Auditoria registrada
- Usuários transferidos ou desativados
- Metas canceladas ou mantidas (conforme escolha)
- Dados históricos preservados

**Critérios de aceite:**
- [ ] Soft delete (não DELETE físico)
- [ ] Usuários vinculados são tratados (transferir ou desativar)
- [ ] Metas ativas são canceladas ou confirmadas
- [ ] Dados históricos preservados
- [ ] Auditoria registrada

---

### RF-005 — Cadastrar departamentos

**Descrição:** O sistema deverá permitir cadastrar departamentos dentro de filiais.

**Ator principal:** Administrador da Empresa

**Pré-condições:**
- Filial cadastrada
- Permissão `departments.create`

**Fluxo principal:**
1. Usuário acessa Configurações > Departamentos > Novo
2. Preenche: nome, descrição, filial, responsável
3. Salva
4. Sistema valida, persiste, audita

**Critérios de aceite:**
- [ ] Departamento vinculado a filial
- [ ] Nome único por filial
- [ ] Auditoria registrada

---

### RF-006 — Listar empresas

**Descrição:** O sistema deverá listar empresas cadastradas.

**Ator principal:** Admin Master (todas) ou Admin Empresa (só a sua)

**Pré-condições:** Usuário autenticado

**Fluxo principal:**
1. Usuário acessa lista de empresas
2. Sistema aplica filtro automático: Admin Master vê todas, Admin Empresa vê só a sua
3. Sistema exibe tabela com: nome, CNPJ, cidade, status, plano, MRR
4. Suporta paginação, busca, ordenação
5. Suporta filtros: status, plano, cidade, estado

**Critérios de aceite:**
- [ ] Isolamento multi-tenant (Admin Empresa vê só a sua)
- [ ] Paginação (default 20, max 100)
- [ ] Busca por nome ou CNPJ
- [ ] Filtros combináveis
- [ ] Performance < 500ms mesmo com 1000+ empresas

---

### RF-007 — Consultar empresa

**Descrição:** O sistema deverá permitir consultar detalhes de uma empresa.

**Ator principal:** Admin Master ou Admin Empresa

**Pré-condições:** Empresa existe, usuário tem permissão

**Fluxo principal:**
1. Usuário clica em empresa da lista
2. Sistema exibe página de detalhes: dados cadastrais, filiais, usuários, indicadores, metas, configurações
3. Mostra estatísticas: total de filiais, usuários ativos, MRR, últimos acessos

**Critérios de aceite:**
- [ ] Detalhes completos em uma tela
- [ ] Estatísticas calculadas em tempo real
- [ ] Performance < 1s

---

### RF-008 — Configurar tema da empresa

**Descrição:** O sistema deverá permitir configurar o tema visual da empresa.

**Ator principal:** Admin da Empresa

**Pré-condições:** Permissão `company.config`

**Fluxo principal:**
1. Usuário acessa Configurações > Tema
2. Seleciona tema pré-definido OU customiza cores
3. Faz upload de logo personalizada
4. Define nome exibido no header
5. Salva
6. Sistema aplica imediatamente para todos os usuários da empresa

**Critérios de aceite:**
- [ ] Temas pré-definidos disponíveis
- [ ] Customização de cor primária, secundária, fundo
- [ ] Logo aceita PNG/SVG até 2MB
- [ ] Aplicação imediata (próxima sessão de cada usuário)

---

### RF-009 — Configurar idioma da empresa

**Descrição:** O sistema deverá permitir configurar idioma padrão da empresa.

**Ator principal:** Admin da Empresa

**Pré-condições:** Permissão `company.config`

**Fluxo principal:**
1. Usuário acessa Configurações > Idioma
2. Seleciona idioma padrão (Português, Inglês)
3. Salva
4. Sistema aplica para novos usuários
5. Usuários existentes mantêm idioma atual (podem alterar no perfil)

**Critérios de aceite:**
- [ ] Idioma padrão para novos usuários
- [ ] Usuários existentes não são forçados a mudar
- [ ] Tradução cobre 100% da interface

---

### RF-010 — Configurar moeda da empresa

**Descrição:** O sistema deverá permitir configurar moeda padrão.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Usuário acessa Configurações > Moeda
2. Seleciona: BRL, USD, EUR
3. Define formato (R$ 1.234,56 ou $1,234.56)
4. Salva

**Critérios de aceite:**
- [ ] Moeda aplicada em todos os formulários
- [ ] Formato respeitado em relatórios
- [ ] Conversão não é automática (moeda é apenas display)

---

### RF-011 — Configurar timezone da empresa

**Descrição:** O sistema deverá permitir configurar timezone padrão.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Usuário seleciona timezone (America/Sao_Paulo, America/New_York, etc.)
2. Salva
3. Sistema aplica para cálculos de data/hora

**Critérios de aceite:**
- [ ] Timezone aplicado em todos os campos de data/hora
- [ ] Banco armazena em UTC, exibição converte
- [ ] Usuário pode ter timezone próprio (sobrepõe empresa)

---

### RF-012 — Exportar dados da empresa

**Descrição:** O sistema deverá permitir exportar todos os dados da empresa (LGPD).

**Ator principal:** Admin da Empresa

**Pré-condições:** Permissão `company.export`, 2FA obrigatório

**Fluxo principal:**
1. Usuário acessa Configurações > Exportar Dados
2. Sistema exige autenticação 2FA
3. Usuário seleciona escopo: tudo, ou tabelas específicas
4. Sistema gera pacote JSON estruturado
5. Sistema compacta em ZIP
6. Sistema disponibiliza link de download (válido 24h)
7. Sistema notifica por e-mail quando pronto
8. Sistema registra auditoria (operação LGPD crítica)

**Critérios de aceite:**
- [ ] 2FA obrigatório
- [ ] Exportação completa (todas as tabelas com dados da empresa)
- [ ] Formato JSON estruturado
- [ ] Link expira em 24h
- [ ] Auditoria registra quem, quando, o quê
- [ ] Notificação por e-mail ao concluir

---

## 5.2 Módulo: Usuários (RF-013 a RF-035)

### RF-013 — Cadastrar usuário

**Descrição:** O sistema deverá permitir cadastrar usuários vinculados a filial e cargo.

**Ator principal:** Administrador da Empresa, Gerente (escopo limitado)

**Pré-condições:**
- Empresa e filial cadastradas
- Cargo definido
- Permissão `users.create`
- Limite de usuários da licença não atingido

**Fluxo principal:**
1. Usuário acessa Configurações > Usuários > Novo
2. Sistema exibe formulário: nome completo, CPF, RG, matrícula, e-mail, telefone, celular, foto, filial, cargo, supervisor, data admissão, login, senha temporária
3. Usuário preenche campos obrigatórios (nome, CPF, e-mail, filial, cargo, login, senha)
4. Sistema valida CPF via módulo 11
5. Sistema valida unicidade de CPF, e-mail e login
6. Sistema valida força da senha (8+ chars, 1 maiúscula, 1 número, 1 especial)
7. Usuário faz upload de foto (opcional, JPG/PNG até 2MB)
8. Sistema valida e armazena foto
9. Usuário clica em Criar
10. Sistema verifica limite de usuários da licença
11. Sistema criptografa CPF e senha (bcrypt cost 12)
12. Sistema persiste no banco
13. Sistema registra auditoria
14. Sistema envia e-mail de boas-vindas com credenciais
15. Sistema marca senha como temporária (exige troca no primeiro login)
16. Sistema emite evento `user.created`
17. Sistema exibe sucesso

**Fluxos alternativos:**

**A1 — CPF inválido:**
- Sistema detecta módulo 11 falhando
- Exibe erro inline: "CPF inválido"

**A2 — CPF já cadastrado:**
- Sistema verifica unicidade na empresa
- Exibe: "CPF já cadastrado para usuário X"
- Bloqueia avanço

**A3 — E-mail já cadastrado:**
- Sistema verifica unicidade
- Exibe erro

**A4 — Login já existe:**
- Sistema verifica unicidade
- Sugere login alternativo (login + número)

**A5 — Senha fraca:**
- Sistema valida política
- Exibe requisitos não atendidos

**A6 — Limite de usuários atingido:**
- Sistema bloqueia
- Exibe "Limite atingido (X de Y). Upgrade do plano."
- Botão de upgrade

**A7 — E-mail de boas-vindas falha:**
- Sistema tenta 3x
- Se falhar: registra log, mas usuário é criado
- Admin pode reenviar e-mail manualmente

**Pós-condições:**
- Usuário criado no banco
- Senha criptografada (bcrypt)
- CPF criptografado (AES-256)
- Auditoria registrada
- E-mail de boas-vindas enviado
- Evento `user.created` emitido
- Usuário obrigado a trocar senha no primeiro login

**Critérios de aceite:**
- [ ] CPF validado via módulo 11
- [ ] Unicidade de CPF, e-mail e login
- [ ] Senha segue política (8+, maiúscula, número, especial)
- [ ] Senha criptografada com bcrypt cost 12
- [ ] CPF criptografado com AES-256
- [ ] Limite de licença validado
- [ ] E-mail de boas-vindas enviado
- [ ] Senha temporária exige troca no primeiro acesso
- [ ] Auditoria registrada
- [ ] Evento emitido

---

### RF-014 — Editar usuário

**Descrição:** O sistema deverá permitir editar dados de um usuário.

**Ator principal:** Admin da Empresa, Gerente (escopo limitado)

**Pré-condições:**
- Usuário cadastrado
- Permissão `users.update`

**Fluxo principal:**
1. Usuário acessa lista de usuários
2. Clica no usuário desejado
3. Sistema exibe formulário preenchido
4. Usuário edita campos (exceto CPF e login que são imutáveis)
5. Usuário clica em Salvar
6. Sistema valida alterações
7. Sistema persiste
8. Sistema registra auditoria (diff)
9. Sistema emite evento `user.updated`
10. Sistema exibe sucesso

**Fluxos alternativos:**

**A1 — Alteração de cargo:**
- Sistema alerta: "Mudança de cargo afeta permissões"
- Exige confirmação
- Registra como operação crítica

**A2 — Alteração de filial:**
- Sistema alerta: "Mudança de filial pode afetar metas históricas"
- Pergunta: "Manter metas na filial antiga ou transferir?"
- Exige confirmação

**A3 — Desativação de usuário com metas ativas:**
- Sistema alerta sobre metas pendentes
- Exige decisão: cancelar ou manter metas

**Pós-condições:**
- Usuário atualizado
- Auditoria com diff de valores
- Permissões recalculadas se cargo mudou
- Evento emitido

**Critérios de aceite:**
- [ ] CPF e login não podem ser alterados
- [ ] Mudança de cargo exige confirmação
- [ ] Mudança de filial exige decisão sobre metas
- [ ] Auditoria registra diff
- [ ] Permissões recalculadas

---

### RF-015 — Desativar usuário (soft delete)

**Descrição:** O sistema deverá permitir desativar usuários preservando dados históricos.

**Ator principal:** Admin da Empresa

**Pré-condições:** Usuário ativo, permissão `users.delete`

**Fluxo principal:**
1. Usuário acessa usuário
2. Clica em "Desativar"
3. Sistema exibe confirmação: "Desativar usuário X? Dados históricos serão preservados. Acesso ao sistema será bloqueado."
4. Usuário confirma
5. Sistema revoga todos os tokens ativos (logout forçado)
6. Sistema executa soft delete (deleted_at = NOW())
7. Sistema registra auditoria
8. Sistema emite evento `user.deactivated`
9. Sistema exibe sucesso

**Fluxos alternativos:**

**A1 — Usuário tem metas ativas:**
- Sistema alerta
- Pergunta: "Cancelar metas ativas ou manter?"
- Se manter: metas continuam mas usuário não lança resultados

**A2 — Usuário é gerente de outros:**
- Sistema alerta: "Usuário é gerente de X vendedores"
- Exige designar novo gerente antes de desativar

**Pós-condições:**
- Usuário desativado (deleted_at preenchido)
- Tokens revogados (logout imediato)
- Dados históricos preservados
- Metas tratadas conforme decisão
- Auditoria registrada

**Critérios de aceite:**
- [ ] Soft delete (não DELETE físico)
- [ ] Tokens revogados imediatamente
- [ ] Dados históricos preservados
- [ ] Metas tratadas (cancelar ou manter)
- [ ] Se for gerente, exige substituto
- [ ] Auditoria registrada

---

### RF-016 — Reset de senha (admin)

**Descrição:** O sistema deverá permitir que admin resete senha de usuário.

**Ator principal:** Admin da Empresa, Admin Master

**Pré-condições:** Usuário existe, permissão `users.reset_password`

**Fluxo principal:**
1. Admin acessa usuário
2. Clica em "Resetar Senha"
3. Sistema exibe confirmação
4. Admin confirma
5. Sistema gera senha temporária aleatória (12 chars, atende política)
6. Sistema criptografa com bcrypt
7. Sistema marca como temporária (exige troca no próximo login)
8. Sistema revoga tokens ativos
9. Sistema registra auditoria
10. Sistema exibe senha temporária UMA VEZ (não envia por e-mail por segurança)
11. Admin entrega senha ao usuário presencialmente ou via canal seguro

**Critérios de aceite:**
- [ ] Senha temporária atende política
- [ ] Senha exibida uma vez apenas
- [ ] Senha NÃO enviada por e-mail (segurança)
- [ ] Troca obrigatória no próximo login
- [ ] Tokens antigos revogados
- [ ] Auditoria registra quem resetou

---

### RF-017 — Desbloquear conta

**Descrição:** O sistema deverá permitir desbloquear conta bloqueada por tentativas.

**Ator principal:** Admin da Empresa, Admin Master

**Pré-condições:** Conta bloqueada, permissão `users.unlock`

**Fluxo principal:**
1. Admin acessa usuário bloqueado
2. Sistema exibe motivo do bloqueio e horário
3. Admin clica em "Desbloquear"
4. Sistema remove bloqueio
5. Sistema registra auditoria
6. Sistema notifica usuário por e-mail

**Critérios de aceite:**
- [ ] Bloqueio removido imediatamente
- [ ] Auditoria registra quem desbloqueou
- [ ] Usuário notificado por e-mail

---

### RF-018 — Importar usuários em lote

**Descrição:** O sistema deverá permitir importar usuários via Excel.

**Ator principal:** Admin da Empresa

**Pré-condições:** Permissão `users.import`

**Fluxo principal:**
1. Admin acessa Usuários > Importar
2. Sistema oferece download de template Excel
3. Admin preenche template (uma linha por usuário)
4. Admin faz upload do arquivo
5. Sistema valida formato (XLSX)
6. Sistema valida cada linha: CPF, e-mail, login, campos obrigatórios
7. Sistema exibe preview: válidos X inválidos Y
8. Sistema mostra erros detalhados por linha
9. Admin corrige e reenvia OU decide importar só os válidos
10. Sistema cria usuários válidos em lote
11. Sistema envia e-mails de boas-vindas
12. Sistema gera relatório de importação (sucessos, falhas)
13. Sistema registra auditoria

**Fluxos alternativos:**

**A1 — Arquivo não é XLSX:**
- Sistema rejeita
- Exige formato correto

**A2 — Linhas duplicadas no arquivo:**
- Sistema detecta
- Mantém apenas primeira ocorrência
- Alerta sobre duplicatas

**A3 — CPFs já cadastrados:**
- Sistema pula linha
- Registra no relatório

**Critérios de aceite:**
- [ ] Template disponível para download
- [ ] Validação linha por linha
- [ ] Preview antes de confirmar
- [ ] Erros detalhados por linha
- [ ] Importação parcial permitida (só válidos)
- [ ] E-mails enviados para criados
- [ ] Relatório de importação gerado
- [ ] Auditoria registra operação em lote

---

### RF-019 — Listar usuários

**Descrição:** O sistema deverá listar usuários com filtros.

**Ator principal:** Admin, Gerente, Supervisor (escopo limitado)

**Pré-condições:** Autenticado, permissão `users.read`

**Fluxo principal:**
1. Usuário acessa lista de usuários
2. Sistema aplica filtro de escopo (Gerente vê só sua equipe, etc.)
3. Sistema exibe tabela: nome, login, e-mail, filial, cargo, status, último acesso
4. Suporta paginação, busca, ordenação
5. Suporta filtros: filial, cargo, status, supervisor
6. Permite ações em lote: ativar, desativar, exportar

**Critérios de aceite:**
- [ ] Escopo respeitado (Gerente não vê outras equipes)
- [ ] Paginação (default 20, max 100)
- [ ] Busca por nome, login ou e-mail
- [ ] Filtros combináveis
- [ ] Ações em lote disponíveis
- [ ] Performance < 500ms com 1000+ usuários

---

### RF-020 — Consultar usuário

**Descrição:** O sistema deverá permitir consultar detalhes de um usuário.

**Ator principal:** Admin, Gerente (escopo)

**Pré-condições:** Usuário existe, escopo permitido

**Fluxo principal:**
1. Usuário clica em usuário da lista
2. Sistema exibe detalhes: dados pessoais, cargo, filial, metas ativas, resultados recentes, ranking atual, último acesso, auditoria de ações
3. Permite editar (se permissão), desativar, resetar senha

**Critérios de aceite:**
- [ ] Detalhes completos em uma tela
- [ ] Metas e resultados atuais
- [ ] Ranking atual
- [ ] Histórico de acessos
- [ ] Ações rápidas (editar, desativar, resetar)

---

### RF-021 — Cadastrar cargos

**Descrição:** O sistema deverá permitir cadastrar cargos personalizados.

**Ator principal:** Admin da Empresa

**Pré-condições:** Permissão `roles.create`

**Fluxo principal:**
1. Admin acessa Configurações > Cargos > Novo
2. Preenche: nome, descrição, é cargo de sistema (não)
3. Define permissões granulares por módulo (criar, ler, editar, excluir, etc.)
4. Define hierarquia (herda de qual cargo?)
5. Salva
6. Sistema valida, persiste, audita

**Critérios de aceite:**
- [ ] Permissões granulares por módulo
- [ ] Hierarquia (herança de permissões)
- [ ] Cargo de sistema não pode ser excluído
- [ ] Auditoria registrada

---

### RF-022 — Editar cargo

**Descrição:** O sistema deverá permitir editar cargos.

**Ator principal:** Admin da Empresa

**Pré-condições:** Cargo existe, permissão `roles.update`

**Fluxo principal:**
1. Admin acessa cargo
2. Edita nome, descrição, permissões
3. Salva
4. Sistema aplica mudanças a todos os usuários com esse cargo
5. Sistema registra auditoria
6. Sistema emite evento `role.updated`

**Critérios de aceite:**
- [ ] Mudanças aplicadas imediatamente
- [ ] Usuários com cargo são afetados
- [ ] Auditoria registra diff de permissões

---

### RF-023 — Excluir cargo

**Descrição:** O sistema deverá permitir excluir cargos (soft delete).

**Ator principal:** Admin da Empresa

**Pré-condições:**
- Cargo não é de sistema (is_system = false)
- Nenhum usuário vinculado
- Permissão `roles.delete`

**Fluxo principal:**
1. Admin clica em excluir
2. Sistema valida: não é sistema, não tem usuários
3. Sistema executa soft delete
4. Sistema registra auditoria

**Fluxos alternativos:**

**A1 — Cargo é de sistema:**
- Sistema bloqueia
- Exibe: "Cargos de sistema não podem ser excluídos"

**A2 — Há usuários vinculados:**
- Sistema bloqueia
- Exibe: "X usuários vinculados. Transfira para outro cargo antes."

**Critérios de aceite:**
- [ ] Cargos de sistema não excluídos
- [ ] Validação de usuários vinculados
- [ ] Soft delete

---

### RF-024 — Atribuir permissões a cargo

**Descrição:** O sistema deverá permitir atribuir permissões granulares a cargos.

**Ator principal:** Admin da Empresa

**Pré-condições:** Cargo existe, permissão `roles.update`

**Fluxo principal:**
1. Admin acessa cargo > Permissões
2. Sistema exibe matriz: módulos × ações
3. Admin marca/desmarca permissões
4. Salva
5. Sistema recalcula permissões de todos os usuários com o cargo
6. Sistema registra auditoria (diff de permissões)

**Critérios de aceite:**
- [ ] Matriz visual módulo × ação
- [ ] Mudanças aplicadas imediatamente
- [ ] Auditoria com diff
- [ ] Permissões especiais (audit.read, system.admin) destacadas

---

### RF-025 — Atribuir múltiplos cargos a usuário

**Descrição:** O sistema deverá permitir que um usuário tenha múltiplos cargos.

**Ator principal:** Admin da Empresa

**Pré-condições:** Permissão `users.update`

**Fluxo principal:**
1. Admin acessa usuário > Cargos
2. Adiciona cargos adicionais (ex: Supervisor + Gerente)
3. Salva
4. Sistema calcula permissões como UNIÃO de todos os cargos
5. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Múltiplos cargos permitidos
- [ ] Permissões são união (não interseção)
- [ ] Auditoria registra atribuição

---

### RF-026 — Listar cargos

**Descrição:** O sistema deverá listar cargos da empresa.

**Ator principal:** Admin da Empresa

**Critérios de aceite:**
- [ ] Lista cargos ativos
- [ ] Mostra: nome, descrição, é sistema, nº de usuários
- [ ] Permite editar, excluir (se não sistema)

---

### RF-027 — Consultar cargo

**Descrição:** O sistema deverá permitir consultar detalhes de um cargo.

**Ator principal:** Admin da Empresa

**Critérios de aceite:**
- [ ] Detalhes do cargo
- [ ] Lista de permissões
- [ ] Lista de usuários com o cargo
- [ ] Hierarquia (herda de, herdado por)

---

### RF-028 — Autenticar usuário (login)

**Descrição:** O sistema deverá autenticar usuários via login e senha.

**Ator principal:** Qualquer usuário

**Pré-condições:** Conta existe e está ativa

**Fluxo principal:**
1. Usuário acessa tela de login
2. Informa login (e-mail, matrícula, CPF ou username)
3. Informa senha
4. Sistema valida credenciais
5. Sistema verifica se conta não está bloqueada
6. Sistema verifica se conta está ativa
7. Sistema verifica se 2FA está habilitado
8. Se 2FA: solicita código TOTP
9. Sistema valida código TOTP
10. Sistema cria sessão JWT (access + refresh tokens)
11. Sistema registra último acesso
12. Sistema emite evento `user.login`
13. Sistema redireciona para dashboard conforme cargo

**Fluxos alternativos:**

**A1 — Credenciais inválidas:**
- Sistema incrementa contador de tentativas
- Após 5 tentativas: bloqueia por 15min
- Exibe: "Credenciais inválidas. Tentativa X de 5."

**A2 — Conta bloqueada:**
- Sistema exibe: "Conta bloqueada. Tente novamente em X minutos."
- Não revela qual campo está errado

**A3 — Conta desativada:**
- Sistema exibe: "Conta inativa. Contate o administrador."

**A4 — 2FA habilitado:**
- Após senha correta, solicita código TOTP
- Se código inválido: conta como tentativa inválida

**A5 — Primeiro login (senha temporária):**
- Sistema detecta senha temporária
- Redireciona para tela de troca de senha
- Só libera acesso após troca

**A6 — Login via OAuth (Google/Microsoft):**
- Sistema redireciona para provedor
- Recebe code, troca por token
- Busca e-mail do provedor
- Se e-mail existe no Orion: cria sessão
- Se não existe: bloqueia (cadastro via admin apenas)

**Critérios de aceite:**
- [ ] Login aceita e-mail, matrícula, CPF ou username
- [ ] 5 tentativas → bloqueio 15min
- [ ] 10 tentativas em 24h → bloqueio 24h
- [ ] 2FA validado se habilitado
- [ ] Senha temporária exige troca
- [ ] OAuth funcional (Google, Microsoft)
- [ ] JWT gerado (15min access, 7d refresh)
- [ ] Auditoria registra login (IP, User-Agent)

---

### RF-029 — Logout

**Descrição:** O sistema deverá permitir logout do usuário.

**Ator principal:** Qualquer usuário autenticado

**Fluxo principal:**
1. Usuário clica em Sair
2. Sistema revoga tokens (access + refresh)
3. Sistema adiciona tokens à blacklist Redis (TTL = expiração)
4. Sistema registra auditoria
5. Sistema redireciona para login

**Critérios de aceite:**
- [ ] Tokens revogados imediatamente
- [ ] Blacklist Redis evita reuso
- [ ] Auditoria registra logout

---

### RF-030 — Recuperar senha (esqueci minha senha)

**Descrição:** O sistema deverá permitir recuperação de senha via e-mail.

**Ator principal:** Qualquer usuário

**Fluxo principal:**
1. Usuário clica em "Esqueci minha senha"
2. Informa e-mail ou matrícula
3. Sistema verifica se usuário existe
4. Se existe: gera token único (UUID), válido 1h
5. Sistema envia e-mail com link contendo token
6. Sistema exibe: "Se o e-mail existir, você receberá instruções"
7. Usuário clica no link
8. Sistema valida token (existe, não expirou, não usado)
9. Usuário cadastra nova senha (2x)
10. Sistema valida política de senha
11. Sistema criptografa (bcrypt)
12. Sistema invalida token (uso único)
13. Sistema revoga tokens antigos
14. Sistema registra auditoria
15. Sistema envia e-mail "Senha alterada"
16. Sistema redireciona para login

**Fluxos alternativos:**

**A1 — E-mail não existe:**
- Sistema exibe mesma mensagem (não revela)
- Não envia e-mail
- Previne enumeração de usuários

**A2 — Token expirado:**
- Sistema exibe: "Link expirado"
- Botão: "Solicitar novo link"

**A3 — Token já usado:**
- Sistema exibe: "Link já utilizado"
- Botão: "Solicitar novo link"

**A4 — Nova senha igual à atual:**
- Sistema bloqueia
- Exige senha diferente

**Critérios de aceite:**
- [ ] Token único (UUID)
- [ ] Token expira em 1h
- [ ] Token de uso único
- [ ] Não revela se e-mail existe (anti-enumeração)
- [ ] Nova senha segue política
- [ ] Nova senha diferente das 5 últimas
- [ ] Tokens antigos revogados
- [ ] E-mail de confirmação enviado
- [ ] Auditoria registra operação

---

### RF-031 — Alterar própria senha

**Descrição:** O sistema deverá permitir que usuário altere própria senha.

**Ator principal:** Qualquer usuário autenticado

**Fluxo principal:**
1. Usuário acessa Perfil > Segurança > Alterar Senha
2. Informa senha atual
3. Informa nova senha (2x)
4. Sistema valida senha atual
5. Sistema valida política da nova senha
6. Sistema verifica não é igual às 5 últimas
7. Sistema criptografa nova (bcrypt)
8. Sistema revoga outros tokens (exceto atual)
9. Sistema registra auditoria
10. Sistema exibe sucesso

**Critérios de aceite:**
- [ ] Senha atual validada
- [ ] Nova senha segue política
- [ ] Nova senha diferente das 5 últimas
- [ ] Outros tokens revogados
- [ ] Auditoria registrada

---

### RF-032 — Ativar 2FA

**Descrição:** O sistema deverá permitir ativar autenticação em dois fatores.

**Ator principal:** Qualquer usuário autenticado

**Fluxo principal:**
1. Usuário acessa Perfil > Segurança > 2FA
2. Clica em "Ativar"
3. Sistema gera secret TOTP
4. Sistema exibe QR code
5. Usuário escaneia com Google Authenticator/Authy
6. Sistema exibe 10 códigos de backup
7. Usuário salva códigos
8. Sistema solicita código TOTP atual para confirmar
9. Usuário digita código
10. Sistema valida
11. Sistema ativa 2FA para o usuário
12. Sistema registra auditoria
13. Sistema exibe sucesso

**Critérios de aceite:**
- [ ] QR code compatível com Google Authenticator
- [ ] 10 códigos de backup gerados
- [ ] Confirmação com código TOTP
- [ ] 2FA obrigatório para Admin Master e Admin Empresa
- [ ] Auditoria registra ativação

---

### RF-033 — Desativar 2FA

**Descrição:** O sistema deverá permitir desativar 2FA.

**Ator principal:** Qualquer usuário autenticado

**Pré-condições:** 2FA ativo

**Fluxo principal:**
1. Usuário acessa Perfil > Segurança > 2FA
2. Clica em "Desativar"
3. Sistema solicita: senha + código TOTP atual
4. Usuário informa
5. Sistema valida
6. Sistema desativa 2FA
7. Sistema invalida códigos de backup
8. Sistema registra auditoria
9. Sistema exibe sucesso

**Fluxos alternativos:**

**A1 — Usuário é Admin Master ou Admin Empresa:**
- Sistema bloqueia (2FA obrigatório)
- Exige manter 2FA ativo

**Critérios de aceite:**
- [ ] Exige senha + TOTP para desativar
- [ ] Códigos de backup invalidados
- [ ] Admin Master/Empresa não pode desativar
- [ ] Auditoria registra

---

### RF-034 — Login com 2FA

**Descrição:** O sistema deverá validar 2FA no login.

**Ator principal:** Qualquer usuário com 2FA ativo

**Fluxo principal:**
1. Usuário faz login normal (senha correta)
2. Sistema detecta 2FA ativo
3. Sistema solicita código TOTP
4. Usuário digita código de 6 dígitos
5. Sistema valida (janela de 30s, aceita anterior e atual)
6. Se válido: continua login
7. Se inválido: conta como tentativa inválida

**Fluxos alternativos:**

**A1 — Usuário perdeu acesso ao TOTP:**
- Clica em "Usar código de backup"
- Digita um dos 10 códigos
- Sistema valida (uso único)
- Sistema invalida código usado

**A2 — 5 códigos TOTP inválidos:**
- Sistema bloqueia por 15min
- Exige senha + 2FA no próximo login

**Critérios de aceite:**
- [ ] Código TOTP validado
- [ ] Janela aceita anterior + atual (anti-desync)
- [ ] Códigos de backup aceitos (uso único)
- [ ] Tentativas inválidas contam para bloqueio

---

### RF-035 — Gerenciar sessões ativas

**Descrição:** O sistema deverá permitir visualizar e revogar sessões ativas.

**Ator principal:** Admin Master, Admin Empresa

**Pré-condições:** Permissão `users.manage_sessions`

**Fluxo principal:**
1. Admin acessa usuário > Sessões
2. Sistema lista sessões ativas: IP, User-Agent, último acesso, localização aproximada
3. Admin pode revogar sessão específica ou todas
4. Sistema remove tokens da sessão
5. Sistema registra auditoria
6. Sistema notifica usuário por e-mail

**Critérios de aceite:**
- [ ] Lista todas as sessões ativas
- [ ] Mostra IP, dispositivo, localização
- [ ] Revogação individual ou em massa
- [ ] Notificação por e-mail ao usuário
- [ ] Auditoria registrada

---

## 5.3 Módulo: Indicadores (RF-036 a RF-060)

### RF-036 — Cadastrar indicador personalizado

**Descrição:** O sistema deverá permitir cadastrar indicadores personalizados via Construtor de Indicadores.

**Ator principal:** Admin da Empresa

**Pré-condições:** Permissão `indicators.create`

**Fluxo principal:**
1. Admin acessa Configurações > Indicadores > Novo
2. Sistema exibe formulário:
   - Nome (1-255 chars, obrigatório)
   - Descrição (texto livre)
   - Categoria (selecionar ou criar nova)
   - Tipo (currency, percentage, integer, decimal, score, time, custom)
   - Ícone (biblioteca de ícones)
   - Cor (paleta de cores)
   - Unidade (R$, %, unidades, etc.)
   - Casas decimais (0-3)
   - Fórmula (opcional, avançado)
   - Peso (para ranking, 0.1-10.0)
   - Meta padrão (opcional)
   - Valor mínimo (opcional)
   - Valor máximo (opcional)
   - Exibir em Dashboard (sim/não)
   - Exibir em Ranking (sim/não)
   - Exibir em Relatórios (sim/não)
   - Obrigatório (vendedor deve lançar)
   - Ordem (para exibição)
3. Admin preenche campos
4. Sistema valida nome único na empresa
5. Se fórmula: sistema valida sintaxe
6. Admin clica em Criar
7. Sistema persiste com versionamento (v1)
8. Sistema registra auditoria
9. Sistema emite evento `indicator.created`
10. Sistema exibe sucesso

**Fluxos alternativos:**

**A1 — Nome já existe:**
- Sistema bloqueia
- Exige nome único

**A2 — Fórmula inválida:**
- Sistema valida sintaxe
- Exibe erro específico
- Bloqueia até correção

**A3 — Cor fora da paleta:**
- Sistema sugere cores próximas
- Permite custom mas avisa sobre contraste

**Pós-condições:**
- Indicador criado com versão 1
- Disponível para atribuição em metas
- Auditoria registrada
- Evento emitido

**Critérios de aceite:**
- [ ] Nome único por empresa
- [ ] Tipo valida formato de entrada
- [ ] Fórmula validada sintaticamente
- [ ] Peso afeta ranking
- [ ] Configurações de exibição respeitadas
- [ ] Versionamento ativo
- [ ] Auditoria registrada

---

### RF-037 — Editar indicador

**Descrição:** O sistema deverá permitir editar indicadores existentes.

**Ator principal:** Admin da Empresa

**Pré-condições:** Indicador existe, permissão `indicators.update`

**Fluxo principal:**
1. Admin acessa indicador
2. Edita campos
3. Salva
4. Sistema cria nova versão (v2, v3, etc.)
5. Sistema mantém versão anterior para histórico
6. Sistema atualiza configurações em tempo real
7. Sistema registra auditoria com diff
8. Sistema emite evento `indicator.updated`

**Critérios de aceite:**
- [ ] Edição cria nova versão
- [ ] Versão anterior preservada
- [ ] Histórico de versões disponível
- [ ] Auditoria com diff
- [ ] Mudanças aplicadas em tempo real

---

### RF-038 — Desativar indicador

**Descrição:** O sistema deverá permitir desativar indicadores.

**Ator principal:** Admin da Empresa

**Pré-condições:** Indicador existe, permissão `indicators.delete`

**Fluxo principal:**
1. Admin acessa indicador
2. Clica em "Desativar"
3. Sistema alerta: "Indicador será desativado. Novos lançamentos não serão aceitos. Histórico preservado."
4. Se há metas ativas com o indicador:
   - Sistema alerta: "X metas ativas usam este indicador"
   - Pergunta: "Cancelar metas ou manter?"
5. Admin confirma
6. Sistema desativa (active = false)
7. Sistema trata metas conforme decisão
8. Sistema registra auditoria
9. Sistema emite evento `indicator.deactivated`

**Critérios de aceite:**
- [ ] Soft delete (não exclui)
- [ ] Novos lançamentos bloqueados
- [ ] Histórico preservado
- [ ] Metas ativas tratadas
- [ ] Auditoria registrada

---

### RF-039 — Criar categoria de indicadores

**Descrição:** O sistema deverá permitir criar categorias para organizar indicadores.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Admin acessa Indicadores > Categorias > Nova
2. Preenche: nome, descrição, cor (opcional)
3. Salva
4. Sistema valida, persiste, audita

**Critérios de aceite:**
- [ ] Nome único por empresa
- [ ] Cor opcional (para organização visual)
- [ ] Pode ser atribuída a múltiplos indicadores

---

### RF-040 — Listar indicadores

**Descrição:** O sistema deverá listar indicadores da empresa.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Admin acessa lista de indicadores
2. Sistema exibe: nome, tipo, categoria, peso, status (ativo/inativo), versão atual
3. Suporta filtros: categoria, tipo, status
4. Suporta busca por nome
5. Permite ações: editar, desativar, ver versões

**Critérios de aceite:**
- [ ] Lista apenas indicadores da empresa (multi-tenant)
- [ ] Filtros funcionais
- [ ] Busca por nome
- [ ] Ações disponíveis

---

### RF-041 — Consultar indicador

**Descrição:** O sistema deverá permitir consultar detalhes de um indicador.

**Ator principal:** Admin da Empresa

**Critérios de aceite:**
- [ ] Detalhes completos
- [ ] Histórico de versões
- [ ] Metas usando o indicador
- [ ] Resultados lançados (estatísticas)

---

### RF-042 — Validar fórmula de indicador

**Descrição:** O sistema deverá validar sintaxe de fórmulas personalizadas.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Admin digita fórmula
2. Clica em "Validar"
3. Sistema faz parse da fórmula
4. Sistema verifica: funções válidas, variáveis definidas, parênteses balanceados
5. Sistema executa em dados de exemplo
6. Sistema exibe: "Válida" ou erro específico

**Critérios de aceite:**
- [ ] Funções suportadas: SUM, AVG, COUNT, MIN, MAX, IF
- [ ] Variáveis: outros indicadores por ID ou nome
- [ ] Operadores: +, -, *, /, (, )
- [ ] Erros específicos (não genéricos)
- [ ] Teste com dados reais

---

### RF-043 — Importar indicadores de template

**Descrição:** O sistema deverá permitir importar indicadores de templates por segmento.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Admin acessa Indicadores > Importar Template
2. Sistema lista segmentos: Farmácia, Supermercado, Varejo, Cosméticos, Construção, etc.
3. Admin seleciona segmento
4. Sistema exibe preview dos indicadores do template
5. Admin seleciona quais importar
6. Sistema cria indicadores (versão 1)
7. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Múltiplos templates por segmento
- [ ] Preview antes de importar
- [ ] Seleção individual de indicadores
- [ ] Indicadores criados como ativos

---

### RF-044 — Exportar indicadores

**Descrição:** O sistema deverá permitir exportar configuração de indicadores.

**Ator principal:** Admin da Empresa

**Critérios de aceite:**
- [ ] Exportação em JSON
- [ ] Inclui todas as configurações
- [ ] Útil para backup ou migração

---

### RF-045 — Restaurar versão anterior de indicador

**Descrição:** O sistema deverá permitir restaurar versões anteriores.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Admin acessa indicador > Versões
2. Sistema lista todas as versões com data e mudanças
3. Admin seleciona versão antiga
4. Clica em "Restaurar"
5. Sistema cria nova versão (atual) com dados da antiga
6. Sistema mantém histórico completo
7. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Histórico completo de versões
- [ ] Restauração cria nova versão (não sobrescreve)
- [ ] Auditoria registra restauração

---

### RF-046 — Calcular valor de indicador

**Descrição:** O sistema deverá calcular valores de indicadores com fórmula.

**Ator principal:** Sistema (automático)

**Pré-condições:** Indicador tem fórmula, dados disponíveis

**Fluxo principal:**
1. Trigger: novo resultado lançado, ou cálculo agendado
2. Sistema identifica indicadores dependentes
3. Sistema busca dados necessários
4. Sistema executa fórmula (sandbox seguro)
5. Sistema armazena resultado calculado
6. Sistema atualiza ranking se necessário
7. Sistema emite evento `indicator.calculated`

**Critérios de aceite:**
- [ ] Cálculo automático quando dependências mudam
- [ ] Sandbox seguro (sem acesso a sistema)
- [ ] Timeout de 5s por cálculo
- [ ] Tratamento de erros (divisão por zero, etc.)
- [ ] Cache de resultados

---

### RF-047 — Definir meta padrão para indicador

**Descrição:** O sistema deverá permitir definir meta padrão.

**Ator principal:** Admin da Empresa

**Critérios de aceite:**
- [ ] Meta padrão usada ao criar nova meta
- [ ] Pode ser sobrescrita individualmente
- [ ] Não afeta metas existentes

---

### RF-048 — Configurar alertas de indicador

**Descrição:** O sistema deverá permitir configurar alertas automáticos.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Admin acessa indicador > Alertas
2. Define regras:
   - "Se valor < X% da meta, alertar gerente"
   - "Se valor > Y% da meta, parabenizar vendedor"
3. Salva
4. Sistema monitora em tempo real
5. Quando condição atendida, dispara alerta

**Critérios de aceite:**
- [ ] Múltiplas regras por indicador
- [ ] Condições: >, <, =, >=, <=
- [ ] Ações: notificar, e-mail, webhook
- [ ] Monitoramento em tempo real

---

### RF-049 — Listar categorias de indicadores

**Descrição:** O sistema deverá listar categorias.

**Critérios de aceite:**
- [ ] Lista categorias ativas
- [ ] Mostra nº de indicadores por categoria
- [ ] Permite editar, excluir

---

### RF-050 — Editar categoria de indicadores

**Descrição:** O sistema deverá permitir editar categorias.

**Critérios de aceite:**
- [ ] Edição não afeta indicadores vinculados
- [ ] Auditoria registrada

---

### RF-051 — Excluir categoria de indicadores

**Descrição:** O sistema deverá permitir excluir categorias.

**Pré-condições:** Categoria não tem indicadores vinculados

**Critérios de aceite:**
- [ ] Bloqueia se há indicadores vinculados
- [ ] Soft delete
- [ ] Auditoria registrada

---

### RF-052 — Atribuir indicador a vendedor

**Descrição:** O sistema deverá permitir atribuir indicadores a vendedores específicos.

**Ator principal:** Gerente, Admin da Empresa

**Fluxo principal:**
1. Gerente acessa vendedor > Indicadores
2. Seleciona indicadores que o vendedor deve lançar
3. Salva
4. Sistema atualiza formulário de lançamento do vendedor

**Critérios de aceite:**
- [ ] Múltiplos indicadores por vendedor
- [ ] Ordem de exibição configurável
- [ ] Mudança reflete imediatamente no formulário

---

### RF-053 — Remover indicador de vendedor

**Descrição:** O sistema deverá permitir remover indicadores de vendedores.

**Critérios de aceite:**
- [ ] Remoção não afeta histórico
- [ ] Vendedor não vê mais o indicador no formulário
- [ ] Metas ativas mantidas (alerta)

---

### RF-054 — Listar indicadores por vendedor

**Descrição:** O sistema deverá listar quais indicadores cada vendedor lança.

**Critérios de aceite:**
- [ ] Visão por vendedor
- [ ] Visão por indicador (quais vendedores lançam)
- [ ] Exportação disponível

---

### RF-055 — Clonar indicador

**Descrição:** O sistema deverá permitir clonar indicadores.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Admin acessa indicador
2. Clica em "Clonar"
3. Sistema cria cópia com nome "Cópia de X"
4. Admin edita nome e configurações
5. Salva como novo indicador

**Critérios de aceite:**
- [ ] Cópia idêntica exceto nome
- [ ] Novo indicador independente
- [ ] Auditoria registra clonagem

---

### RF-056 — Definir indicador como obrigatório

**Descrição:** O sistema deverá permitir definir indicadores como obrigatórios.

**Ator principal:** Admin da Empresa

**Critérios de aceite:**
- [ ] Indicador obrigatório bloqueia salvamento se vazio
- [ ] Aplicado por vendedor ou global
- [ ] Auditoria registrada

---

### RF-057 — Configurar precisão decimal

**Descrição:** O sistema deverá permitir configurar precisão decimal por indicador.

**Critérios de aceite:**
- [ ] 0-3 casas decimais
- [ ] Aplicado em formulários e relatórios
- [ ] Arredondamento bancário (não truncamento)

---

### RF-058 — Configurar unidade de indicador

**Descrição:** O sistema deverá permitir configurar unidade.

**Critérios de aceite:**
- [ ] Unidades padrão: R$, %, un, kg, L, h, min
- [ ] Unidade customizada permitida
- [ ] Exibida em formulários e relatórios

---

### RF-059 — Definir ordem de exibição

**Descrição:** O sistema deverá permitir definir ordem de indicadores.

**Critérios de aceite:**
- [ ] Ordem por vendedor ou global
- [ ] Drag-and-drop na configuração
- [ ] Reflete no formulário de lançamento

---

### RF-060 — Validar range de valor

**Descrição:** O sistema deverá validar valores dentro de range configurado.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Vendedor lança valor
2. Sistema verifica min/max do indicador
3. Se fora do range: alerta mas permite salvar com justificativa
4. Sistema registra justificativa

**Critérios de aceite:**
- [ ] Validação em tempo real
- [ ] Alerta se fora do range
- [ ] Permite salvar com justificativa
- [ ] Auditoria registra justificativa

---

## 5.4 Módulo: Metas (RF-061 a RF-085)

### RF-061 — Criar meta individual

**Descrição:** O sistema deverá permitir criar metas individuais para vendedores.

**Ator principal:** Gerente, Admin da Empresa

**Pré-condições:**
- Vendedor existe e está ativo
- Indicador existe e está ativo
- Permissão `goals.create`

**Fluxo principal:**
1. Gerente acessa Metas > Nova Meta
2. Seleciona escopo: Individual
3. Seleciona vendedor
4. Seleciona indicador
5. Seleciona tipo: Diária, Semanal, Mensal, Trimestral, Anual, Campanha, Livre
6. Define período: data início e data fim
7. Define valor-alvo (positivo)
8. Define peso (0.1-10.0, default 1.0)
9. Opcional: observações
10. Sistema valida:
    - Vendedor ativo
    - Indicador ativo
    - Data fim > data início
    - Valor-alvo > 0
    - Não há meta sobreposta para mesmo vendedor+indicador+período
11. Sistema persiste com versionamento
12. Sistema registra auditoria
13. Sistema notifica vendedor (push + e-mail)
14. Sistema emite evento `goal.created`
15. Sistema exibe sucesso

**Fluxos alternativos:**

**A1 — Meta sobreposta existe:**
- Sistema detecta conflito
- Oferece: substituir, somar, ou cancelar
- Substituir: desativa antiga, cria nova
- Somar: mantém ambas (raro)

**A2 — Indicador inativo:**
- Sistema bloqueia
- Exige ativar indicador primeiro

**A3 — Vendedor desativado:**
- Sistema bloqueia
- Exige ativar vendedor

**A4 — Período no passado:**
- Sistema alerta mas permite (meta retroativa)

**Pós-condições:**
- Meta criada com versão 1
- Vendedor notificado
- Auditoria registrada
- Evento emitido

**Critérios de aceite:**
- [ ] Validações de vendedor, indicador, período
- [ ] Detecção de sobreposição
- [ ] Notificação ao vendedor
- [ ] Versionamento
- [ ] Auditoria
- [ ] Evento emitido

---

### RF-062 — Criar meta em lote (equipe)

**Descrição:** O sistema deverá permitir criar metas para toda a equipe de uma vez.

**Ator principal:** Gerente

**Pré-condições:** Permissão `goals.create`

**Fluxo principal:**
1. Gerente acessa Metas > Nova Meta > Escopo: Equipe
2. Seleciona equipe (todos da filial, ou equipe específica)
3. Seleciona indicador
4. Define tipo, período, valor-alvo, peso
5. Sistema lista vendedores afetados (preview)
6. Gerente confirma
7. Sistema cria uma meta para cada vendedor
8. Sistema notifica todos os vendedores
9. Sistema registra auditoria (operação em lote)
10. Sistema exibe relatório: X criadas, Y falhas

**Fluxos alternativos:**

**A1 — Alguns vendedores já têm meta sobreposta:**
- Sistema lista conflitos
- Gerente decide: pular, substituir, ou somar para cada um

**A2 — Vendedor desativado no meio do lote:**
- Sistema pula e registra no relatório

**Critérios de aceite:**
- [ ] Preview de vendedores afetados
- [ ] Tratamento de conflitos individual
- [ ] Relatório de criação
- [ ] Notificação para todos os criados
- [ ] Auditoria em lote

---

### RF-063 — Importar metas via Excel

**Descrição:** O sistema deverá permitir importar metas via arquivo Excel.

**Ator principal:** Gerente, Admin da Empresa

**Fluxo principal:**
1. Usuário acessa Metas > Importar
2. Baixa template Excel
3. Preenche: vendedor, indicador, tipo, data início, data fim, valor, peso
4. Faz upload
5. Sistema valida formato e conteúdo
6. Sistema exibe preview: válidas X inválidas Y
7. Usuário corrige ou importa só válidas
8. Sistema cria metas em lote
9. Sistema gera relatório
10. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Template disponível
- [ ] Validação linha por linha
- [ ] Preview antes de confirmar
- [ ] Importação parcial permitida
- [ ] Relatório detalhado

---

### RF-064 — Editar meta

**Descrição:** O sistema deverá permitir editar metas existentes.

**Ator principal:** Gerente, Admin da Empresa

**Pré-condições:** Meta existe, permissão `goals.update`

**Fluxo principal:**
1. Usuário acessa meta
2. Edita: valor-alvo, peso, observações, período
3. Salva
4. Sistema cria nova versão
5. Sistema mantém versão anterior
6. Sistema recalcula progresso
7. Sistema registra auditoria (diff)
8. Sistema notifica vendedor sobre alteração

**Critérios de aceite:**
- [ ] Edição cria nova versão
- [ ] Versão anterior preservada
- [ ] Recálculo automático de progresso
- [ ] Auditoria com diff
- [ ] Notificação ao vendedor

---

### RF-065 — Desativar meta

**Descrição:** O sistema deverá permitir desativar metas.

**Ator principal:** Gerente, Admin da Empresa

**Fluxo principal:**
1. Usuário acessa meta
2. Clica em "Desativar"
3. Sistema confirma
4. Sistema executa soft delete
5. Meta não conta mais no ranking
6. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Soft delete
- [ ] Meta não conta no ranking
- [ ] Histórico preservado
- [ ] Auditoria registrada

---

### RF-066 — Listar metas

**Descrição:** O sistema deverá listar metas com filtros.

**Ator principal:** Gerente, Admin, Vendedor (próprias)

**Fluxo principal:**
1. Usuário acessa lista de metas
2. Sistema aplica escopo (vendedor vê só as suas)
3. Sistema exibe: vendedor, indicador, tipo, período, valor, progresso
4. Suporta filtros: vendedor, indicador, tipo, status, período
5. Suporta busca e paginação

**Critérios de aceite:**
- [ ] Escopo respeitado
- [ ] Filtros combináveis
- [ ] Paginação
- [ ] Performance < 500ms

---

### RF-067 — Consultar meta

**Descrição:** O sistema deverá permitir consultar detalhes de uma meta.

**Critérios de aceite:**
- [ ] Detalhes completos
- [ ] Progresso atual
- [ ] Histórico de versões
- [ ] Resultados lançados contra a meta

---

### RF-068 — Calcular progresso da meta

**Descrição:** O sistema deverá calcular progresso automaticamente.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Trigger: novo resultado lançado
2. Sistema identifica metas afetadas
3. Sistema soma resultados no período
4. Sistema calcula percentual: (resultado / meta) × 100
5. Se meta = 0: retorna N/A
6. Sistema atualiza campo `progress` na meta
7. Sistema atualiza ranking se necessário

**Critérios de aceite:**
- [ ] Cálculo automático após lançamento
- [ ] Fórmula: (resultado / meta) × 100
- [ ] Tratamento de meta = 0
- [ ] Precisão decimal configurável
- [ ] Atualização de ranking

---

### RF-069 — Atribuir peso à meta

**Descrição:** O sistema deverá permitir definir peso para metas.

**Ator principal:** Gerente

**Critérios de aceite:**
- [ ] Peso 0.1-10.0
- [ ] Default 1.0
- [ ] Afeta ranking (meta com peso 2.0 conta o dobro)
- [ ] Auditoria registrada

---

### RF-070 — Definir meta diária

**Descrição:** O sistema deverá suportar metas diárias.

**Critérios de aceite:**
- [ ] Tipo: daily
- [ ] Período: 1 dia (data início = data fim)
- [ ] Reset diário
- [ ] Histórico diário preservado

---

### RF-071 — Definir meta semanal

**Descrição:** O sistema deverá suportar metas semanais.

**Critérios de aceite:**
- [ ] Tipo: weekly
- [ ] Período: 7 dias
- [ ] Soma resultados da semana
- [ ] Reset semanal

---

### RF-072 — Definir meta mensal

**Descrição:** O sistema deverá suportar metas mensais.

**Critérios de aceite:**
- [ ] Tipo: monthly
- [ ] Período: 1 mês calendário
- [ ] Soma resultados do mês
- [ ] Comparativo com mês anterior

---

### RF-073 — Definir meta trimestral

**Descrição:** O sistema deverá suportar metas trimestrais.

**Critérios de aceite:**
- [ ] Tipo: quarterly
- [ ] Período: 3 meses
- [ ] Soma resultados do trimestre

---

### RF-074 — Definir meta anual

**Descrição:** O sistema deverá suportar metas anuais.

**Critérios de aceite:**
- [ ] Tipo: yearly
- [ ] Período: 1 ano
- [ ] Soma resultados do ano

---

### RF-075 — Definir meta de campanha

**Descrição:** O sistema deverá suportar metas vinculadas a campanhas.

**Critérios de aceite:**
- [ ] Tipo: campaign
- [ ] Vinculada a campanha específica
- [ ] Período = período da campanha
- [ ] Conta para ranking da campanha

---

### RF-076 — Definir meta livre

**Descrição:** O sistema deverá suportar metas com período customizado.

**Critérios de aceite:**
- [ ] Tipo: custom
- [ ] Período: datas arbitrárias
- [ ] Útil para metas especiais

---

### RF-077 — Notificar vendedor sobre nova meta

**Descrição:** O sistema deverá notificar vendedores sobre novas metas.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Meta criada
2. Sistema identifica vendedor
3. Sistema envia notificação push (se PWA instalado)
4. Sistema envia notificação no sistema (sino)
5. Sistema envia e-mail
6. Sistema registra envio

**Critérios de aceite:**
- [ ] Notificação push (se habilitada)
- [ ] Notificação no sistema
- [ ] E-mail (se habilitado)
- [ ] Registro de envio

---

### RF-078 — Notificar vendedor sobre alteração de meta

**Descrição:** O sistema deverá notificar sobre mudanças em metas.

**Critérios de aceite:**
- [ ] Notificação ao vendedor
- [ ] Inclui diff (valor antigo → novo)
- [ ] Auditoria registrada

---

### RF-079 — Aprovar meta corporativa

**Descrição:** O sistema deverá suportar workflow de aprovação de metas.

**Ator principal:** Diretor

**Fluxo principal:**
1. Gerente propõe meta
2. Meta fica com status "pending_approval"
3. Diretor recebe notificação
4. Diretor revisa
5. Aprova ou rejeita com justificativa
6. Se aprovada: meta ativa
7. Se rejeitada: volta para gerente com feedback

**Critérios de aceite:**
- [ ] Workflow de aprovação
- [ ] Notificação ao diretor
- [ ] Aprovação ou rejeição com justificativa
- [ ] Auditoria de decisão

---

### RF-080 — Simular meta

**Descrição:** O sistema deverá permitir simular cenários de meta.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa Simulador de Metas
2. Informa valor hipotético
3. Sistema mostra:
   - Percentual que representaria
   - Impacto no ranking
   - Indicadores afetados
4. Gerente ajusta e simula novamente

**Critérios de aceite:**
- [ ] Simulação sem persistir
- [ ] Cálculo em tempo real
- [ ] Visualização de impacto

---

### RF-081 — Copiar meta de período anterior

**Descrição:** O sistema deverá permitir copiar metas de períodos anteriores.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa metas de mês anterior
2. Clica em "Copiar para próximo mês"
3. Sistema cria metas idênticas no novo período
4. Gerente pode ajustar valores
5. Salva

**Critérios de aceite:**
- [ ] Cópia de período
- [ ] Ajuste de valores antes de salvar
- [ ] Mantém vendedores e indicadores

---

### RF-082 — Definir meta por empresa

**Descrição:** O sistema deverá suportar metas no nível empresa.

**Critérios de aceite:**
- [ ] Escopo: company
- [ ] Aplica a toda a empresa
- [ ] Soma resultados de todas as filiais

---

### RF-083 — Definir meta por filial

**Descrição:** O sistema deverá suportar metas no nível filial.

**Critérios de aceite:**
- [ ] Escopo: branch
- [ ] Aplica a uma filial específica
- [ ] Soma resultados da filial

---

### RF-084 — Definir meta por equipe

**Descrição:** O sistema deverá suportar metas no nível equipe.

**Critérios de aceite:**
- [ ] Escopo: team
- [ ] Aplica a um grupo de vendedores
- [ ] Soma resultados do grupo

---

### RF-085 — Exportar metas

**Descrição:** O sistema deverá permitir exportar metas em Excel/PDF.

**Critérios de aceite:**
- [ ] Exportação com filtros aplicados
- [ ] Formato Excel (editável)
- [ ] Formato PDF (relatório)
- [ ] Inclui progresso atual

---

## 5.5 Módulo: Resultados (RF-086 a RF-110)

### RF-086 — Lançar resultado

**Descrição:** O sistema deverá permitir que vendedores lancem resultados diários.

**Ator principal:** Vendedor

**Pré-condições:**
- Vendedor autenticado
- Meta ativa para o indicador no dia
- Indicador atribuído ao vendedor

**Fluxo principal:**
1. Vendedor acessa Lançar Resultado
2. Sistema exibe formulário com indicadores do dia (apenas os atribuídos)
3. Para cada indicador, vendedor digita valor
4. Sistema calcula percentual da meta em tempo real
5. Vendedor pode adicionar observação (texto)
6. Vendedor pode anexar comprovante (foto)
7. Vendedor pode gravar áudio (observação por voz)
8. Vendedor clica em Salvar
9. Sistema valida via Zod:
   - Valores numéricos positivos
   - Campos obrigatórios preenchidos
   - Valores dentro de range (se configurado)
10. Sistema verifica se indicador exige aprovação
11. Se exige: marca como "pending_approval"
12. Se não exige: marca como "approved"
13. Sistema persiste no banco
14. Sistema recalcula ranking
15. Sistema registra auditoria
16. Sistema emite evento `result.created`
17. Sistema dispara webhooks configurados
18. Sistema exibe sucesso
19. Sistema redireciona para dashboard

**Fluxos alternativos:**

**A1 — Valor > 200% da meta:**
- Sistema alerta: "Valor acima do esperado. Confirme ou justifique."
- Vendedor confirma ou ajusta
- Se confirmar: pede justificativa textual

**A2 — Valor fora de range configurado:**
- Sistema alerta: "Valor fora do range normal (X-Y)"
- Permite salvar com justificativa

**A3 — Indicador exige aprovação:**
- Sistema marca como pendente
- Notifica supervisor/gerente
- Vendedor vê status "Pendente"

**A4 — Já existe resultado para o dia:**
- Sistema detecta duplicata
- Pergunta: "Já existe resultado. Sobrescrever, somar, ou cancelar?"

**A5 — Sistema offline (PWA):**
- Vendedor lança normalmente
- Sistema salva localmente (IndexedDB)
- Quando volta conexão, sincroniza
- Se conflito, alerta usuário

**A6 — Anexo muito grande:**
- Sistema valida tamanho (máx 5MB por arquivo)
- Exige formato (JPG, PNG, PDF)

**Pós-condições:**
- Resultado registrado no banco
- Ranking recalculado
- Auditoria registrada
- Evento emitido
- Webhooks disparados

**Critérios de aceite:**
- [ ] Apenas indicadores atribuídos aparecem
- [ ] Cálculo em tempo real
- [ ] Validação Zod em todo input
- [ ] Detecção de duplicata
- [ ] Suporte a anexos
- [ ] Suporte a áudio
- [ ] Funciona offline
- [ ] Auditoria registrada
- [ ] Evento emitido
- [ ] Webhooks disparados
- [ ] Tempo de resposta < 2s

---

### RF-087 — Lançar resultado em lote (supervisor)

**Descrição:** O sistema deverá permitir que supervisores lancem resultados em lote.

**Ator principal:** Supervisor

**Pré-condições:** Permissão `results.create` para outros usuários

**Fluxo principal:**
1. Supervisor acessa Lançar em Lote
2. Seleciona data
3. Seleciona equipe ou vendedores específicos
4. Sistema exibe grid: vendedores × indicadores
5. Supervisor preenche valores
6. Sistema valida célula por célula
7. Supervisor clica em Salvar Lote
8. Sistema cria resultados para cada vendedor
9. Sistema exibe relatório: X criados, Y falhas
10. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Grid vendedores × indicadores
- [ ] Validação célula por célula
- [ ] Relatório de lote
- [ ] Auditoria registra operação em lote

---

### RF-088 — Importar resultados via Excel

**Descrição:** O sistema deverá permitir importar resultados via Excel.

**Ator principal:** Supervisor, Gerente

**Fluxo principal:**
1. Usuário acessa Resultados > Importar
2. Baixa template
3. Preenche: vendedor, indicador, data, valor, observação
4. Faz upload
5. Sistema valida
6. Preview: válidos X inválidos
7. Importa válidos
8. Gera relatório
9. Auditoria

**Critérios de aceite:**
- [ ] Template disponível
- [ ] Validação linha por linha
- [ ] Importação parcial
- [ ] Relatório detalhado

---

### RF-089 — Editar resultado

**Descrição:** O sistema deverá permitir editar resultados não aprovados.

**Ator principal:** Vendedor (próprios), Supervisor, Gerente

**Pré-condições:**
- Resultado existe
- Status: pending_approval ou approved (com permissão especial)
- Permissão apropriada

**Fluxo principal:**
1. Usuário acessa resultado
2. Edita valor ou observação
3. Salva
4. Sistema cria nova versão
5. Sistema recalcula ranking
6. Sistema registra auditoria (diff)
7. Sistema notifica se mudança significativa

**Fluxos alternativos:**

**A1 — Resultado já aprovado:**
- Sistema bloqueia vendedor
- Supervisor/Gerente pode editar com justificativa
- Requer revalidação

**Critérios de aceite:**
- [ ] Edição cria versão
- [ ] Auditoria com diff
- [ ] Recálculo de ranking
- [ ] Bloqueio se aprovado (exceto admin)

---

### RF-090 — Excluir resultado

**Descrição:** O sistema deverá permitir excluir resultados (soft delete).

**Ator principal:** Supervisor, Gerente

**Pré-condições:**
- Resultado existe
- Permissão `results.delete`
- Justificativa obrigatória

**Fluxo principal:**
1. Usuário acessa resultado
2. Clica em Excluir
3. Sistema pede justificativa
4. Usuário informa
5. Sistema executa soft delete
6. Sistema recalcula ranking
7. Sistema registra auditoria com justificativa

**Critérios de aceite:**
- [ ] Soft delete
- [ ] Justificativa obrigatória
- [ ] Recálculo de ranking
- [ ] Auditoria com justificativa

---

### RF-091 — Aprovar resultado

**Descrição:** O sistema deverá permitir aprovar resultados pendentes.

**Ator principal:** Supervisor, Gerente

**Pré-condições:**
- Resultado com status pending_approval
- Permissão `results.approve`

**Fluxo principal:**
1. Gerente acessa Aprovações Pendentes
2. Sistema lista resultados pendentes
3. Gerente visualiza detalhes: vendedor, indicador, valor, observações, anexos
4. Gerente clica em Aprovar
5. Sistema atualiza status para approved
6. Sistema recalcula ranking
7. Sistema registra auditoria
8. Sistema notifica vendedor
9. Sistema emite evento `result.approved`

**Critérios de aceite:**
- [ ] Lista de pendentes
- [ ] Detalhes completos
- [ ] Aprovação individual ou em lote
- [ ] Notificação ao vendedor
- [ ] Auditoria registrada

---

### RF-092 — Rejeitar resultado

**Descrição:** O sistema deverá permitir rejeitar resultados pendentes.

**Ator principal:** Supervisor, Gerente

**Fluxo principal:**
1. Gerente acessa resultado pendente
2. Clica em Rejeitar
3. Sistema pede justificativa
4. Gerente informa motivo
5. Sistema atualiza status para rejected
6. Sistema registra auditoria com motivo
7. Sistema notifica vendedor com motivo
8. Sistema emite evento `result.rejected`

**Critérios de aceite:**
- [ ] Justificativa obrigatória
- [ ] Notificação ao vendedor com motivo
- [ ] Auditoria registra motivo
- [ ] Evento emitido

---

### RF-093 — Aprovar resultados em lote

**Descrição:** O sistema deverá permitir aprovar múltiplos resultados de uma vez.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa lista de pendentes
2. Seleciona múltiplos (checkbox)
3. Clica em "Aprovar Selecionados"
4. Sistema confirma
5. Sistema aprova todos
6. Sistema recalcula ranking
7. Sistema notifica vendedores
8. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Seleção múltipla
- [ ] Confirmação antes de aprovar
- [ ] Notificação para cada vendedor
- [ ] Auditoria em lote

---

### RF-094 — Listar resultados

**Descrição:** O sistema deverá listar resultados com filtros.

**Ator principal:** Gerente, Supervisor, Vendedor (próprios)

**Fluxo principal:**
1. Usuário acessa lista de resultados
2. Sistema aplica escopo
3. Exibe: vendedor, indicador, data, valor, status
4. Filtros: vendedor, indicador, data, status, filial
5. Paginação e busca

**Critérios de aceite:**
- [ ] Escopo respeitado
- [ ] Filtros combináveis
- [ ] Performance < 500ms com 10k+ resultados

---

### RF-095 — Consultar resultado

**Descrição:** O sistema deverá permitir consultar detalhes de um resultado.

**Critérios de aceite:**
- [ ] Detalhes completos
- [ ] Histórico de versões
- [ ] Anexos visíveis
- [ ] Áudio reproduzível
- [ ] Auditoria de alterações

---

### RF-096 — Configurar exigência de aprovação

**Descrição:** O sistema deverá permitir configurar quais indicadores exigem aprovação.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Admin acessa indicador
2. Marca "Exigir aprovação"
3. Define quem aprova: Gerente, Supervisor
4. Salva
5. Novos resultados ficam pendentes

**Critérios de aceite:**
- [ ] Configuração por indicador
- [ ] Define aprovador
- [ ] Aplica a novos resultados

---

### RF-097 — Anexar comprovante

**Descrição:** O sistema deverá permitir anexar comprovantes a resultados.

**Ator principal:** Vendedor

**Fluxo principal:**
1. Vendedor em formulário de lançamento
2. Clica em "Anexar"
3. Seleciona arquivo (JPG, PNG, PDF)
4. Sistema valida tamanho (máx 5MB)
5. Sistema faz upload para storage (S3 ou local)
6. Sistema associa ao resultado

**Critérios de aceite:**
- [ ] Formatos: JPG, PNG, PDF
- [ ] Tamanho máx 5MB por arquivo
- [ ] Múltiplos anexos por resultado
- [ ] Visualização no detalhe

---

### RF-098 — Gravar áudio (observação por voz)

**Descrição:** O sistema deverá permitir gravar áudio como observação.

**Ator principal:** Vendedor

**Fluxo principal:**
1. Vendedor clica em 🎤 (microfone)
2. Browser solicita permissão
3. Vendedor grava áudio
4. Clica em parar
5. Sistema faz upload do áudio
6. Sistema associa ao resultado

**Critérios de aceite:**
- [ ] Permissão de microfone
- [ ] Gravação via Web Audio API
- [ ] Formato: WebM ou MP3
- [ ] Duração máx 2 minutos
- [ ] Reprodução no detalhe

---

### RF-099 — Sincronizar resultados offline

**Descrição:** O sistema deverá sincronizar resultados lançados offline.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Vendedor lança resultado offline
2. Sistema salva em IndexedDB
3. Conexão volta
4. Sistema detecta resultados pendentes
5. Sistema sincroniza com servidor
6. Se conflito (já existe no servidor), alerta usuário
7. Sistema marca como sincronizado

**Critérios de aceite:**
- [ ] Detecção de conexão (online/offline)
- [ ] Persistência em IndexedDB
- [ ] Sincronização automática
- [ ] Tratamento de conflitos
- [ ] Indicador visual de pendentes

---

### RF-100 — Calcular ticket médio

**Descrição:** O sistema deverá calcular ticket médio automaticamente.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Sistema identifica faturamento e nº de clientes
2. Calcula: TKM = Faturamento / Nº Clientes
3. Atualiza indicador de TKM
4. Recalcula ranking se TKM é ponderado

**Critérios de aceite:**
- [ ] Cálculo automático
- [ ] Tratamento de divisão por zero (0 clientes = TKM 0)
- [ ] Atualização em tempo real

---

### RF-101 — Calcular conversão

**Descrição:** O sistema deverá calcular taxa de conversão.

**Critérios de aceite:**
- [ ] Fórmula: (vendas / visitantes) × 100
- [ ] Se sem visitantes: N/A
- [ ] Atualização automática

---

### RF-102 — Exportar resultados

**Descrição:** O sistema deverá permitir exportar resultados.

**Critérios de aceite:**
- [ ] Exportação Excel e PDF
- [ ] Filtros aplicados
- [ ] Inclui todos os campos
- [ ] Limite de 10k linhas por export

---

### RF-103 — Filtrar resultados por período

**Descrição:** O sistema deverá permitir filtrar por período.

**Critérios de aceite:**
- [ ] Filtro: data início e data fim
- [ ] Atalhos: hoje, semana, mês, ano
- [ ] Período customizado

---

### RF-104 — Filtrar resultados por vendedor

**Descrição:** O sistema deverá permitir filtrar por vendedor.

**Critérios de aceite:**
- [ ] Seleção única ou múltipla
- [ ] Busca por nome
- [ ] Escopo respeitado (vendedor vê só os seus)

---

### RF-105 — Filtrar resultados por indicador

**Descrição:** O sistema deverá permitir filtrar por indicador.

**Critérios de aceite:**
- [ ] Seleção única ou múltipla
- [ ] Agrupado por categoria

---

### RF-106 — Filtrar resultados por status

**Descrição:** O sistema deverá permitir filtrar por status.

**Critérios de aceite:**
- [ ] Filtros: pending, approved, rejected
- [ ] Combina com outros filtros

---

### RF-107 — Buscar resultados

**Descrição:** O sistema deverá permitir buscar resultados por texto.

**Critérios de aceite:**
- [ ] Busca em observações
- [ ] Busca por nome do vendedor
- [ ] Busca por nome do indicador

---

### RF-108 — Ver histórico de um resultado

**Descrição:** O sistema deverá mostrar histórico de alterações.

**Critérios de aceite:**
- [ ] Lista de versões
- [ ] Quem alterou, quando, o quê
- [ ] Diff visual

---

### RF-109 — Resultados por API

**Descrição:** O sistema deverá permitir lançar resultados via API.

**Ator principal:** Sistema externo (ERP, CRM)

**Fluxo principal:**
1. Sistema externo faz POST /v1/results
2. Sistema valida API key
3. Sistema valida payload
4. Sistema cria resultado
5. Sistema retorna ID

**Critérios de aceite:**
- [ ] API key necessária
- [ ] Rate limiting aplicado
- [ ] Validação via Zod
- [ ] Mesmas regras de UI

---

### RF-110 — Webhook de resultado criado

**Descrição:** O sistema deverá disparar webhook quando resultado é criado.

**Critérios de aceite:**
- [ ] Payload com dados do resultado
- [ ] Assinatura HMAC
- [ ] Retry 3x com backoff
- [ ] Desativa após 3 falhas

---

## 5.6 Módulo: Ranking (RF-111 a RF-125)

### RF-111 — Calcular ranking

**Descrição:** O sistema deverá calcular ranking automaticamente.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Trigger: resultado lançado ou aprovado
2. Sistema identifica escopo (equipe, filial, rede)
3. Sistema busca todos os vendedores do escopo
4. Para cada vendedor, calcula pontuação ponderada:
   - Soma (resultado × peso do indicador) / soma dos pesos
5. Sistema ordena por pontuação (decrescente)
6. Sistema atribui posições (1, 2, 3, ...)
7. Sistema detecta empates e aplica critério de desempate
8. Sistema persiste ranking no banco
9. Sistema emite evento `ranking.updated`
10. Sistema atualiza dashboards em tempo real

**Critérios de aceite:**
- [ ] Cálculo automático após cada resultado
- [ ] Pontuação ponderada por peso
- [ ] Critério de desempate configurável
- [ ] Performance < 1s para 100 vendedores
- [ ] Evento emitido
- [ ] Atualização em tempo real

---

### RF-112 — Configurar critério de desempate

**Descrição:** O sistema deverá permitir configurar critérios de desempate.

**Ator principal:** Admin da Empresa

**Fluxo principal:**
1. Admin acessa Configurações > Ranking > Desempate
2. Define ordem de critérios:
   - Maior faturamento
   - Maior ticket médio
   - Maior nº de clientes
   - Menor tempo
   - Outro indicador
3. Salva
4. Sistema aplica em novos cálculos

**Critérios de aceite:**
- [ ] Múltiplos critérios em ordem
- [ ] Aplicado automaticamente
- [ ] Configurável por empresa

---

### RF-113 — Listar ranking diário

**Descrição:** O sistema deverá exibir ranking diário.

**Ator principal:** Vendedor, Supervisor, Gerente

**Fluxo principal:**
1. Usuário acessa Ranking > Diário
2. Sistema exibe lista ordenada por posição
3. Mostra: posição, vendedor, pontuação, % da meta, tendência (↑↓→)
4. Destaca posição do próprio usuário
5. Atualiza em tempo real

**Critérios de aceite:**
- [ ] Lista ordenada por posição
- [ ] Indicador de tendência
- [ ] Destaque do próprio usuário
- [ ] Atualização em tempo real (WebSocket ou polling)

---

### RF-114 — Listar ranking semanal

**Descrição:** O sistema deverá exibir ranking semanal.

**Critérios de aceite:**
- [ ] Período: segunda a domingo
- [ ] Soma resultados da semana
- [ ] Comparativo com semana anterior

---

### RF-115 — Listar ranking mensal

**Descrição:** O sistema deverá exibir ranking mensal.

**Critérios de aceite:**
- [ ] Período: mês calendário
- [ ] Soma resultados do mês
- [ ] Comparativo com mês anterior

---

### RF-116 — Listar ranking de campanha

**Descrição:** O sistema deverá exibir ranking de campanhas ativas.

**Critérios de aceite:**
- [ ] Filtro por campanha
- [ ] Período = período da campanha
- [ ] Pontuação conforme regras da campanha

---

### RF-117 — Listar ranking anual

**Descrição:** O sistema deverá exibir ranking anual.

**Critérios de aceite:**
- [ ] Período: ano calendário
- [ ] Soma resultados do ano
- [ ] Comparativo com ano anterior

---

### RF-118 — Consultar posição no ranking

**Descrição:** O sistema deverá permitir consultar posição individual.

**Ator principal:** Vendedor

**Fluxo principal:**
1. Vendedor acessa "Minha Posição"
2. Sistema exibe:
   - Posição atual no ranking (diário, semanal, mensal)
   - Pontuação
   - Distância para o 1º colocado
   - Distância para o próximo
   - Tendência (subiu/caiu X posições)

**Critérios de aceite:**
- [ ] Múltiplos períodos
- [ ] Distância para líderes
- [ ] Tendência visual

---

### RF-119 — Exportar ranking

**Descrição:** O sistema deverá permitir exportar ranking.

**Critérios de aceite:**
- [ ] Formato PDF (relatório)
- [ ] Formato Excel (editável)
- [ ] Com filtros aplicados

---

### RF-120 — Notificar mudança de posição

**Descrição:** O sistema deverá notar mudanças significativas de posição.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Ranking recalculado
2. Sistema detecta mudanças (subiu para top 3, caiu para bottom 3)
3. Sistema envia notificação ao vendedor
4. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Notificação ao subir para top 3
- [ ] Notificação ao cair para bottom 3
- [ ] Não spam (máx 1 por dia por vendedor)

---

### RF-121 — Configurar escopo do ranking

**Descrição:** O sistema deverá permitir configurar escopos de ranking.

**Ator principal:** Admin da Empresa

**Critérios de aceite:**
- [ ] Escopos: equipe, filial, rede
- [ ] Configurável por cargo (vendedor vê equipe, gerente vê filial, etc.)

---

### RF-122 — Ranking por indicador específico

**Descrição:** O sistema deverá permitir ranking filtrado por indicador.

**Critérios de aceite:**
- [ ] Seleção de indicador
- [ ] Ranking apenas daquele indicador

---

### RF-123 — Ranking histórico

**Descrição:** O sistema deverá permitir consultar rankings passados.

**Critérios de aceite:**
- [ ] Seleção de data
- [ ] Snapshot do ranking naquele dia
- [ ] Comparativo com atual

---

### RF-124 — Ranking com anonimato

**Descrição:** O sistema deverá suportar ranking anônimo (sem nomes).

**Ator principal:** Admin da Empresa

**Critérios de aceite:**
- [ ] Configurável por empresa
- [ ] Mostra: "Vendedor 1", "Vendedor 2", etc.
- [ ] Útil para empresas que não querem expor

---

### RF-125 — Recalcular ranking

**Descrição:** O sistema deverá permitir recálculo manual de ranking.

**Ator principal:** Admin Master

**Fluxo principal:**
1. Admin acessa Sistema > Recalcular Ranking
2. Seleciona período
3. Confirma
4. Sistema recalcula para todo o período
5. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Recálculo para período específico
- [ ] Confirmação obrigatória
- [ ] Auditoria registra operação

---

## 5.7 Módulo: Campanhas (RF-126 a RF-145)

### RF-126 — Criar campanha

**Descrição:** O sistema deverá permitir criar campanhas comerciais.

**Ator principal:** Gerente, Admin da Empresa

**Pré-condições:** Permissão `campaigns.create`

**Fluxo principal:**
1. Gerente acessa Campanhas > Nova
2. Preenche dados básicos:
   - Nome (1-255 chars)
   - Descrição
   - Objetivo
   - Data início
   - Data fim (> início)
3. Seleciona indicadores da campanha:
   - Múltiplos indicadores
   - Peso de cada um no ranking da campanha
4. Seleciona participantes:
   - Todos os vendedores
   - Equipes específicas
   - Vendedores individuais
5. Configura premiações:
   - 1º lugar: Medalha Ouro + R$500
   - 2º lugar: Medalha Prata + R$300
   - 3º lugar: Medalha Bronze + R$200
   - Ou outras premiações customizadas
6. Configura regras (opcional):
   - "SE vendedor bater 150% da meta da campanha, conceder Troféu Especial"
   - Usa Rule Builder visual
7. Faz upload de imagem da campanha (opcional)
8. Salva como rascunho OU ativa
9. Sistema valida
10. Sistema persiste
11. Sistema registra auditoria
12. Se ativa: notifica participantes
13. Sistema emite evento `campaign.created`

**Fluxos alternativos:**

**A1 — Data fim < data início:**
- Sistema bloqueia
- Exige correção

**A2 — Indicador inativo:**
- Sistema bloqueia
- Exige ativar primeiro

**A3 — Sem participantes:**
- Sistema bloqueia
- Exige pelo menos 1

**A4 — Salvar como rascunho:**
- Não notifica participantes
- Não inicia contagem
- Visível apenas para gerente

**Pós-condições:**
- Campanha criada
- Se ativa: participantes notificados
- Auditoria registrada

**Critérios de aceite:**
- [ ] Validações de período e indicadores
- [ ] Múltiplos indicadores com pesos
- [ ] Múltiplas premiações
- [ ] Rule Builder funcional
- [ ] Imagem opcional
- [ ] Rascunho vs Ativa
- [ ] Notificação se ativa
- [ ] Auditoria

---

### RF-127 — Editar campanha

**Descrição:** O sistema deverá permitir editar campanhas.

**Ator principal:** Gerente

**Pré-condições:**
- Campanha existe
- Status: draft ou active (não ended)
- Permissão `campaigns.update`

**Fluxo principal:**
1. Gerente acessa campanha
2. Edita campos
3. Salva
4. Sistema cria nova versão
5. Sistema registra auditoria
6. Se ativa: notifica participantes sobre mudanças

**Fluxos alternativos:**

**A1 — Campanha já encerrada:**
- Sistema bloqueia edição
- Apenas visualização

**Critérios de aceite:**
- [ ] Edição cria versão
- [ ] Bloqueio se encerrada
- [ ] Notificação se ativa

---

### RF-128 — Ativar campanha

**Descrição:** O sistema deverá permitir ativar campanhas rascunho.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa rascunho
2. Clica em "Ativar"
3. Sistema valida dados
4. Sistema muda status para active
5. Sistema notifica participantes
6. Sistema inicia contagem
7. Sistema registra auditoria
8. Sistema emite evento `campaign.started`

**Critérios de aceite:**
- [ ] Validação antes de ativar
- [ ] Notificação a participantes
- [ ] Início da contagem
- [ ] Evento emitido

---

### RF-129 — Pausar campanha

**Descrição:** O sistema deverá permitir pausar campanhas ativas.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa campanha ativa
2. Clica em "Pausar"
3. Sistema confirma
4. Sistema muda status para paused
5. Sistema congela contagem (mas mantém pontos)
6. Sistema notifica participantes
7. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Pausa congela contagem
- [ ] Pontos mantidos
- [ ] Notificação a participantes
- [ ] Auditoria

---

### RF-130 — Retomar campanha pausada

**Descrição:** O sistema deverá permitir retomar campanhas pausadas.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa campanha pausada
2. Clica em "Retomar"
3. Sistema volta status para active
4. Sistema reinicia contagem
5. Sistema notifica participantes
6. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Retomada reinicia contagem
- [ ] Pontos mantidos
- [ ] Notificação a participantes

---

### RF-131 — Encerrar campanha

**Descrição:** O sistema deverá permitir encerrar campanhas manualmente.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa campanha ativa
2. Clica em "Encerrar"
3. Sistema confirma
4. Sistema calcula vencedores finais
5. Sistema atribui premiações
6. Sistema gera relatório final
7. Sistema muda status para ended
8. Sistema notifica participantes com resultados
9. Sistema envia relatório ao gerente
10. Sistema registra auditoria
11. Sistema emite evento `campaign.ended`

**Critérios de aceite:**
- [ ] Cálculo automático de vencedores
- [ ] Atribuição de premiações
- [ ] Relatório final gerado
- [ ] Notificação a participantes
- [ ] Auditoria

---

### RF-132 — Adicionar participantes

**Descrição:** O sistema deverá permitir adicionar participantes a campanhas ativas.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa campanha > Participantes
2. Clica em "Adicionar"
3. Seleciona vendedores
4. Salva
5. Sistema adiciona (com data de entrada)
6. Sistema notifica novos participantes
7. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Adição durante campanha ativa
- [ ] Data de entrada registrada
- [ ] Notificação aos novos
- [ ] Pontuação a partir da entrada

---

### RF-133 — Remover participantes

**Descrição:** O sistema deverá permitir remover participantes.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa participantes
2. Remove vendedor
3. Sistema mantém pontos até remoção
4. Sistema retira do ranking da campanha
5. Sistema notifica vendedor removido
6. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Pontos até remoção mantidos
- [ ] Retirada do ranking
- [ ] Notificação ao removido
- [ ] Auditoria

---

### RF-134 — Configurar premiações

**Descrição:** O sistema deverá permitir configurar premiações.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa campanha > Premiações
2. Adiciona premiações:
   - Tipo: Medalha, Troféu, Pontos, Brinde, Dinheiro, Viagem
   - Critério: 1º lugar, 2º lugar, % da meta, valor absoluto
   - Valor/descrição
3. Salva
4. Sistema valida
5. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Múltiplos tipos de premiação
- [ ] Múltiplos critérios
- [ ] Premiações automáticas ou manuais

---

### RF-135 — Atribuir premiação manual

**Descrição:** O sistema deverá permitir atribuir premiações manualmente.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa vendedor em campanha
2. Clica em "Atribuir Premiação"
3. Seleciona tipo
4. Informa justificativa
5. Salva
6. Sistema atribui
7. Sistema notifica vendedor
8. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Atribuição manual
- [ ] Justificativa obrigatória
- [ ] Notificação ao vendedor
- [ ] Auditoria

---

### RF-136 — Listar campanhas

**Descrição:** O sistema deverá listar campanhas.

**Ator principal:** Gerente, Vendedor

**Fluxo principal:**
1. Usuário acessa Campanhas
2. Sistema exibe:
   - Aba "Ativas" (em andamento)
   - Aba "Próximas" (futuras)
   - Aba "Encerradas" (passadas)
3. Para cada campanha: nome, período, indicadores, seu ranking
4. Filtros: status, período

**Critérios de aceite:**
- [ ] Separação por status
- [ ] Visão do próprio ranking
- [ ] Filtros
- [ ] Performance < 500ms

---

### RF-137 — Consultar campanha

**Descrição:** O sistema deverá permitir consultar detalhes de campanha.

**Critérios de aceite:**
- [ ] Detalhes completos
- [ ] Ranking atualizado
- [ ] Lista de participantes
- [ ] Premiações
- [ ] Regras

---

### RF-138 — Acompanhar ranking de campanha

**Descrição:** O sistema deverá exibir ranking da campanha em tempo real.

**Critérios de aceite:**
- [ ] Ranking atualizado a cada resultado
- [ ] Destaque do próprio usuário
- [ ] Distância para líderes

---

### RF-139 — Listar premiações recebidas

**Descrição:** O sistema deverá listar premiações do vendedor.

**Ator principal:** Vendedor

**Fluxo principal:**
1. Vendedor acessa Perfil > Premiações
2. Sistema exibe galeria: medalhas, troféus, pontos
3. Mostra: data, campanha, tipo, descrição
4. Estatísticas: total, por tipo

**Critérios de aceite:**
- [ ] Galeria visual
- [ ] Estatísticas
- [ ] Filtros por tipo

---

### RF-140 — Exportar campanha

**Descrição:** O sistema deverá permitir exportar campanha (relatório).

**Critérios de aceite:**
- [ ] PDF com ranking final
- [ ] Lista de vencedores
- [ ] Premiações concedidas
- [ ] Estatísticas

---

### RF-141 — Duplicar campanha

**Descrição:** O sistema deverá permitir duplicar campanhas.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa campanha encerrada
2. Clica em "Duplicar"
3. Sistema cria cópia como rascunho
4. Gerente ajusta período e detalhes
5. Salva

**Critérios de aceite:**
- [ ] Cópia como rascunho
- [ ] Mantém configurações
- [ ] Novo período exigido

---

### RF-142 — Notificar início de campanha

**Descrição:** O sistema deverá notificar participantes sobre início.

**Ator principal:** Sistema (automático)

**Critérios de aceite:**
- [ ] Notificação push, sistema, e-mail
- [ ] Inclui detalhes da campanha
- [ ] Link para acompanhamento

---

### RF-143 — Notificar fim de campanha

**Descrição:** O sistema deverá notificar sobre encerramento.

**Critérios de aceite:**
- [ ] Notificação com resultados
- [ ] Vencedores anunciados
- [ ] Premiações concedidas

---

### RF-144 — Calcular pontuação de campanha

**Descrição:** O sistema deverá calcular pontuação conforme regras.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Resultado lançado em indicador da campanha
2. Sistema identifica campanhas ativas com esse indicador
3. Sistema aplica fórmula (resultado × peso)
4. Sistema soma pontos do vendedor
5. Sistema atualiza ranking da campanha

**Critérios de aceite:**
- [ ] Cálculo automático
- [ ] Múltiplos indicadores com pesos
- [ ] Atualização em tempo real

---

### RF-145 — Configurar regras de campanha

**Descrição:** O sistema deverá permitir configurar regras via Rule Builder.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa campanha > Regras
2. Usa Rule Builder visual:
   - SE condição ENTÃO ação
3. Adiciona múltiplas regras
4. Salva
5. Sistema valida
6. Sistema monitora em tempo real

**Critérios de aceite:**
- [ ] Interface visual
- [ ] Múltiplas condições (E, OU)
- [ ] Múltiplas ações
- [ ] Validação de sintaxe

---

## 5.8 Módulo: Dashboard (RF-146 a RF-160)

### RF-146 — Exibir dashboard do vendedor

**Descrição:** O sistema deverá exibir dashboard personalizado para vendedores.

**Ator principal:** Vendedor

**Fluxo principal:**
1. Vendedor faz login
2. Sistema exibe dashboard padrão:
   - Cards de KPIs do dia (4 indicadores principais)
   - Gráfico de evolução do dia
   - Ranking top 5
   - Próximas ações
3. Vendedor pode personalizar layout (se permitido)
4. Dados atualizam em tempo real (polling 30s ou WebSocket)

**Critérios de aceite:**
- [ ] 4 cards de KPI principais
- [ ] Cores de status (verde/amarelo/vermelho)
- [ ] Gráfico de evolução
- [ ] Ranking top 5
- [ ] Próximas ações
- [ ] Atualização em tempo real
- [ ] Carregamento < 2s

---

### RF-147 — Exibir dashboard do gerente

**Descrição:** O sistema deverá exibir dashboard gerencial.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente faz login
2. Sistema exibe dashboard:
   - Cards de KPIs da equipe
   - Ranking completo da equipe
   - Aprovações pendentes
   - Insights de IA
   - Alertas
3. Gerente pode personalizar

**Critérios de aceite:**
- [ ] KPIs da equipe
- [ ] Ranking completo
- [ ] Aprovações pendentes
- [ ] Insights de IA
- [ ] Alertas
- [ ] Personalização

---

### RF-148 — Exibir dashboard executivo

**Descrição:** O sistema deverá exibir dashboard para diretores.

**Ator principal:** Diretor

**Fluxo principal:**
1. Diretor faz login
2. Sistema exibe dashboard executivo:
   - Faturamento total da rede
   - Meta consolidada
   - Ranking de filiais
   - Top 10 vendedores
   - Indicadores estratégicos
3. Filtros: período, região, segmento
4. Exportação em PDF

**Critérios de aceite:**
- [ ] Visão consolidada
- [ ] Ranking de filiais
- [ ] Top 10 vendedores
- [ ] Filtros
- [ ] Exportação PDF

---

### RF-149 — Personalizar dashboard

**Descrição:** O sistema deverá permitir personalizar dashboards.

**Ator principal:** Qualquer usuário

**Fluxo principal:**
1. Usuário clica em "Personalizar"
2. Entra em modo de edição
3. Pode:
   - Adicionar/remover widgets
   - Arrastar e soltar widgets
   - Redimensionar widgets
   - Configurar cada widget
4. Salva layout
5. Sistema persiste por usuário

**Critérios de aceite:**
- [ ] Modo de edição
- [ ] Drag-and-drop
- [ ] Redimensionamento
- [ ] Configuração por widget
- [ ] Persistência por usuário

---

### RF-150 — Criar dashboard personalizado

**Descrição:** O sistema deverá permitir criar múltiplos dashboards.

**Ator principal:** Qualquer usuário

**Fluxo principal:**
1. Usuário clica em "Novo Dashboard"
2. Dá nome
3. Adiciona widgets
4. Configura layout
5. Salva
6. Pode alternar entre dashboards

**Critérios de aceite:**
- [ ] Múltiplos dashboards por usuário
- [ ] Naming
- [ ] Alternância rápida

---

### RF-151 — Adicionar widget ao dashboard

**Descrição:** O sistema deverá permitir adicionar widgets.

**Ator principal:** Qualquer usuário

**Fluxo principal:**
1. Em modo de edição, clica em "Adicionar Widget"
2. Sistema exibe catálogo:
   - Gráfico de linha
   - Gráfico de barra
   - Gráfico de pizza
   - Card de KPI
   - Ranking
   - Tabela
   - Calendário
   - Notificações
   - IA Insights
   - Campanhas
3. Usuário seleciona
4. Configura (dados, período, etc.)
5. Adiciona ao dashboard

**Critérios de aceite:**
- [ ] Catálogo de widgets
- [ ] Configuração por widget
- [ ] Preview antes de adicionar

---

### RF-152 — Remover widget

**Descrição:** O sistema deverá permitir remover widgets.

**Critérios de aceite:**
- [ ] Botão remover em cada widget
- [ ] Confirmação
- [ ] Layout reorganiza automaticamente

---

### RF-153 — Configurar widget

**Descrição:** O sistema deverá permitir configurar widgets.

**Ator principal:** Qualquer usuário

**Fluxo principal:**
1. Usuário clica em engrenagem do widget
2. Sistema exibe configurações:
   - Título
   - Indicador(es)
   - Período
   - Tipo de gráfico
   - Cores
3. Usuário ajusta
4. Salva
5. Widget atualiza

**Critérios de aceite:**
- [ ] Configurações por tipo de widget
- [ ] Preview em tempo real
- [ ] Persistência

---

### RF-154 — Exportar dashboard

**Descrição:** O sistema deverá permitir exportar dashboard em PDF.

**Ator principal:** Qualquer usuário

**Fluxo principal:**
1. Usuário clica em "Exportar PDF"
2. Sistema gera PDF com:
   - Logo da empresa
   - Título do dashboard
   - Data de geração
   - Todos os widgets
3. Download

**Critérios de aceite:**
- [ ] PDF com logo
- [ ] Todos os widgets
- [ ] Layout fiel ao exibido
- [ ] Data/hora de geração

---

### RF-155 — Compartilhar dashboard

**Descrição:** O sistema deverá permitir compartilhar dashboards.

**Ator principal:** Gerente, Admin

**Fluxo principal:**
1. Gerente cria dashboard
2. Clica em "Compartilhar"
3. Seleciona usuários ou equipes
4. Define permissão (visualizar, editar)
5. Salva
6. Usuários veem dashboard compartilhado

**Critérios de aceite:**
- [ ] Compartilhamento com usuários/equipes
- [ ] Permissões (view, edit)
- [ ] Lista de dashboards compartilhados

---

### RF-156 — Widget de gráfico de linha

**Descrição:** O sistema deverá ter widget de gráfico de linha.

**Critérios de aceite:**
- [ ] Eixo X: tempo
- [ ] Eixo Y: valor
- [ ] Múltiplas séries
- [ ] Tooltip com valores
- [ ] Zoom e pan

---

### RF-157 — Widget de gráfico de barra

**Descrição:** O sistema deverá ter widget de gráfico de barra.

**Critérios de aceite:**
- [ ] Barras verticais ou horizontais
- [ ] Múltiplas séries
- [ ] Ordenação
- [ ] Tooltip

---

### RF-158 — Widget de ranking

**Descrição:** O sistema deverá ter widget de ranking.

**Critérios de aceite:**
- [ ] Top N configurável
- [ ] Destaque do próprio usuário
- [ ] Indicador de tendência
- [ ] Atualização em tempo real

---

### RF-159 — Widget de card de KPI

**Descrição:** O sistema deverá ter widget de card de KPI.

**Critérios de aceite:**
- [ ] Título do indicador
- [ ] Valor atual
- [ ] Meta
- [ ] Percentual
- [ ] Cor de status
- [ ] Tendência

---

### RF-160 — Atualização em tempo real

**Descrição:** O sistema deverá atualizar dashboards em tempo real.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Resultado lançado
2. Sistema emite evento
3. WebSocket envia update para clientes conectados
4. Dashboards atualizam sem refresh

**Critérios de aceite:**
- [ ] WebSocket ou SSE
- [ ] Update < 1s após evento
- [ ] Fallback para polling (30s) se WS falhar

---

## 5.9 Módulo: Notificações (RF-161 a RF-170)

### RF-161 — Enviar notificação no sistema

**Descrição:** O sistema deverá enviar notificações in-app.

**Ator principal:** Sistema ou Gerente

**Fluxo principal:**
1. Evento dispara notificação
2. Sistema cria registro de notificação
3. Sistema exibe badge no sino (contador)
4. Usuário clica no sino
5. Sistema exibe lista de notificações
6. Usuário marca como lida
7. Sistema atualiza contador

**Critérios de aceite:**
- [ ] Badge com contador
- [ ] Lista de notificações
- [ ] Marcar como lida (individual ou todas)
- [ ] Persistência (não some ao refresh)

---

### RF-162 — Enviar notificação push

**Descrição:** O sistema deverá enviar notificações push (PWA).

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Evento dispara notificação push
2. Sistema verifica se usuário tem PWA instalado
3. Sistema envia via Web Push API
4. Browser exibe notificação
5. Usuário clica → abre app

**Critérios de aceite:**
- [ ] Web Push API
- [ ] Apenas se PWA instalado e permissão concedida
- [ ] Click abre app na tela relevante

---

### RF-163 — Enviar notificação por e-mail

**Descrição:** O sistema deverá enviar notificações por e-mail.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Evento dispara e-mail
2. Sistema usa template
3. Sistema envia via SMTP
4. Sistema registra envio
5. Se falha: retry 3x

**Critérios de aceite:**
- [ ] Templates personalizáveis
- [ ] SMTP configurável
- [ ] Retry em falha
- [ ] Registro de envio

---

### RF-164 — Listar notificações

**Descrição:** O sistema deverá listar notificações do usuário.

**Ator principal:** Qualquer usuário

**Fluxo principal:**
1. Usuário clica no sino
2. Sistema exibe lista
3. Mostra: título, mensagem, tipo, data, lida/não lida
4. Filtros: tipo, status
5. Marcar como lida

**Critérios de aceite:**
- [ ] Lista com detalhes
- [ ] Filtros
- [ ] Marcar como lida
- [ ] Paginação (se muitas)

---

### RF-165 — Marcar notificação como lida

**Descrição:** O sistema deverá permitir marcar como lida.

**Critérios de aceite:**
- [ ] Individual
- [ ] Todas de uma vez
- [ ] Atualiza contador

---

### RF-166 — Configurar preferências de notificação

**Descrição:** O sistema deverá permitir configurar preferências.

**Ator principal:** Qualquer usuário

**Fluxo principal:**
1. Usuário acessa Perfil > Notificações
2. Marca/desmarca tipos:
   - Push (sim/não)
   - E-mail (sim/não)
   - Sistema (sempre)
3. Por categoria: metas, campanhas, IA, etc.
4. Salva

**Critérios de aceite:**
- [ ] Configuração por canal (push, email, sistema)
- [ ] Configuração por categoria
- [ ] Aplicação imediata

---

### RF-167 — Enviar notificação para equipe

**Descrição:** O sistema deverá permitir gerente enviar notificação à equipe.

**Ator principal:** Gerente

**Fluxo principal:**
1. Gerente acessa Notificações > Enviar
2. Seleciona destinatários (equipe, filial, indivíduos)
3. Escreve título e mensagem
4. Seleciona canais (sistema, e-mail, push)
5. Envia
6. Sistema entrega a todos
7. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Seleção de destinatários
- [ ] Múltiplos canais
- [ ] Auditoria

---

### RF-168 — Arquivar notificação

**Descrição:** O sistema deverá permitir arquivar notificações.

**Critérios de aceite:**
- [ ] Arquivar individual
- [ ] Arquivar todas lidas
- [ ] Não exclui (mantém histórico)

---

### RF-169 — Notificação de meta atingida

**Descrição:** O sistema deverá notar quando meta é atingida.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Resultado lançado
2. Sistema detecta meta atingida (>= 100%)
3. Sistema envia notificação ao vendedor
4. Sistema envia notificação ao gerente
5. Sistema registra auditoria

**Critérios de aceite:**
- [ ] Detecção automática
- [ ] Notificação ao vendedor (parabéns)
- [ ] Notificação ao gerente
- [ ] Não spam (1 por meta por dia)

---

### RF-170 — Notificação de campanha

**Descrição:** O sistema deverá notar eventos de campanha.

**Critérios de aceite:**
- [ ] Início de campanha
- [ ] Fim de campanha
- [ ] Subida no ranking da campanha
- [ ] Premiação recebida

---

## 5.10 Módulo: Relatórios (RF-171 a RF-180)

### RF-171 — Gerar relatório de desempenho

**Descrição:** O sistema deverá gerar relatórios de desempenho.

**Ator principal:** Gerente, Diretor

**Fluxo principal:**
1. Usuário acessa Relatórios > Desempenho
2. Seleciona filtros: período, vendedores, indicadores
3. Seleciona formato: PDF, Excel, Tela
4. Clica em Gerar
5. Sistema coleta dados
6. Sistema formata
7. Sistema gera arquivo
8. Download ou exibição

**Critérios de aceite:**
- [ ] Múltiplos filtros
- [ ] Formatos PDF, Excel, Tela
- [ ] Logo da empresa no PDF
- [ ] Performance < 10s para 1000 registros

---

### RF-172 — Gerar relatório de ranking

**Descrição:** O sistema deverá gerar relatório de ranking.

**Critérios de aceite:**
- [ ] Ranking por período
- [ ] Formato PDF e Excel
- [ ] Inclui gráficos

---

### RF-173 — Gerar relatório de campanha

**Descrição:** O sistema deverá gerar relatório de campanha encerrada.

**Critérios de aceite:**
- [ ] Ranking final
- [ ] Vencedores
- [ ] Premiações
- [ ] Estatísticas

---

### RF-174 — Gerar relatório comparativo

**Descrição:** O sistema deverá gerar relatórios comparativos entre períodos.

**Critérios de aceite:**
- [ ] Comparação de 2 ou mais períodos
- [ ] Diferenças em valor e percentual
- [ ] Gráficos comparativos

---

### RF-175 — Agendar relatório recorrente

**Descrição:** O sistema deverá permitir agendar relatórios.

**Ator principal:** Gerente, Diretor

**Fluxo principal:**
1. Usuário configura relatório
2. Clica em "Agendar"
3. Define periodicidade (diário, semanal, mensal)
4. Define destinatários (e-mails)
5. Salva
6. Sistema gera e envia automaticamente

**Critérios de aceite:**
- [ ] Periodicidade configurável
- [ ] Múltiplos destinatários
- [ ] Envio automático
- [ ] Log de envios

---

### RF-176 — Exportar dados em Excel

**Descrição:** O sistema deverá exportar dados em Excel.

**Critérios de aceite:**
- [ ] Formato XLSX
- [ ] Múltiplas abas (se aplicável)
- [ ] Filtros aplicados
- [ ] Limite 10k linhas

---

### RF-177 — Exportar dados em PDF

**Descrição:** O sistema deverá exportar dados em PDF.

**Critérios de aceite:**
- [ ] Logo da empresa
- [ ] Cabeçalho e rodapé
- [ ] Tabelas formatadas
- [ ] Gráficos (se aplicável)

---

### RF-178 — Exportar dados em CSV

**Descrição:** O sistema deverá exportar dados em CSV.

**Critérios de aceite:**
- [ ] Formato CSV
- [ ] Encoding UTF-8
- [ ] Separador configurável (, ou ;)

---

### RF-179 — Listar relatórios agendados

**Descrição:** O sistema deverá listar relatórios agendados.

**Critérios de aceite:**
- [ ] Lista com detalhes
- [ ] Editar, pausar, excluir
- [ ] Histórico de envios

---

### RF-180 — Cancelar relatório agendado

**Descrição:** O sistema deverá permitir cancelar relatórios agendados.

**Critérios de aceite:**
- [ ] Cancelamento
- [ ] Confirmação
- [ ] Mantém histórico

---

## 5.11 Módulo: Auditoria (RF-181 a RF-185)

### RF-181 — Registrar auditoria

**Descrição:** O sistema deverá registrar auditoria de todas as operações sensíveis.

**Ator principal:** Sistema (automático)

**Fluxo principal:**
1. Operação sensível executada (create, update, delete)
2. Sistema cria registro de auditoria:
   - userId
   - companyId
   - action (create, update, delete, login, etc.)
   - tableName
   - recordId
   - oldValue (JSON)
   - newValue (JSON)
   - ipAddress
   - userAgent
   - timestamp
3. Sistema persiste em tabela audit_logs
4. Sistema indexa para consulta rápida

**Critérios de aceite:**
- [ ] Toda operação sensível auditada
- [ ] Valores anterior e novo (diff)
- [ ] IP e User-Agent
- [ ] Timestamp preciso
- [ ] Performance < 100ms overhead

---

### RF-182 — Consultar auditoria

**Descrição:** O sistema deverá permitir consultar logs de auditoria.

**Ator principal:** Admin Master, Admin Empresa

**Pré-condições:** Permissão `audit.read`

**Fluxo principal:**
1. Admin acessa Sistema > Auditoria
2. Sistema exibe filtros:
   - Período
   - Usuário
   - Ação (create, update, delete, login)
   - Tabela
   - Registro específico
3. Admin aplica filtros
4. Sistema exibe lista paginada
5. Cada item mostra: data, usuário, ação, tabela, registro, diff
6. Admin pode expandir para ver valores completo

**Critérios de aceite:**
- [ ] Filtros combináveis
- [ ] Paginação (default 50, max 200)
- [ ] Diff visual (highlight de mudanças)
- [ ] Performance < 1s com 100k+ logs
- [ ] Exportação disponível

---

### RF-183 — Exportar auditoria

**Descrição:** O sistema deverá permitir exportar logs de auditoria.

**Critérios de aceite:**
- [ ] Formato CSV e PDF
- [ ] Filtros aplicados
- [ ] Limite 50k linhas por export

---

### RF-184 — Filtrar auditoria por usuário

**Descrição:** O sistema deverá permitir filtrar auditoria por usuário.

**Critérios de aceite:**
- [ ] Seleção de usuário
- [ ] Múltiplos usuários
- [ ] Busca por nome

---

### RF-185 — Filtrar auditoria por ação

**Descrição:** O sistema deverá permitir filtrar por tipo de ação.

**Critérios de aceite:**
- [ ] Filtros: create, update, delete, login, logout, approve, reject
- [ ] Combina com outros filtros

---

# CAPÍTULO 6 — MÓDULOS DO SISTEMA

O Projeto Orion será dividido em módulos independentes, cada um com responsabilidade única e comunicação via Event Bus interno. Esta arquitetura permite que módulos sejam ativados, desativados, atualizados ou substituídos sem impactar o restante do sistema:

| Módulo | Responsabilidade |
|--------|------------------|
| Core | Funcionamento geral da plataforma. Sem ele o sistema não inicia. Inclui configurações globais, logs, eventos, sessões. |
| Auth | Autenticação, login, logout, sessões, recuperação de senha, 2FA, controle de tentativas. |
| Empresas | Cadastro de empresas, dados cadastrais, configurações específicas por empresa. |
| Filiais | Cadastro de filiais vinculadas a empresas. |
| Usuários | Cadastro de usuários, dados pessoais, vínculo com cargo e filial. |
| Equipes | Agrupamento de vendedores em equipes supervisionadas. |
| Indicadores | Construtor e gestão de KPIs personalizados por empresa. |
| Metas | Criação, atribuição e acompanhamento de metas em múltiplos períodos. |
| Resultados | Lançamento, edição, aprovação de resultados. |
| Dashboard | Painéis personalizáveis com widgets arrastáveis. |
| Ranking | Pontuação e classificação em tempo real. |
| Campanhas | Campanhas internas com premiações. |
| Relatórios | Geração de relatórios em PDF, Excel e tela, com filtros flexíveis. |
| Auditoria | Registro completo de todas as operações com usuário, IP e timestamp. |
| IA | Motor de inteligência artificial para insights, previsões e sugestões. |
| Licenciamento | Validação de licença, controle de planos e módulos habilitados. |
| Atualizações | Verificação e aplicação de atualizações do sistema. |
| Backup | Backup manual, automático e agendado, com restauração auditada. |
| Notificações | Notificações push, sistema, e-mail e plugins (WhatsApp, Telegram). |
| API | API REST documentada em OpenAPI para integrações externas. |

---

# CAPÍTULO 7 — REQUISITOS NÃO FUNCIONAIS

Os requisitos não funcionais definem as qualidades que o sistema deve possuir, independentemente das funcionalidades específicas. Estes requisitos são tão críticos quanto os funcionais e devem ser validados através de testes específicos:

- **Alta disponibilidade** — o sistema deve ter uptime mínimo de 99,5% em ambientes cloud.
- **Alta performance** — toda tela deve carregar em menos de 2 segundos em condições normais.
- **Arquitetura limpa** — código deve seguir princípios SOLID, DDD e Clean Architecture.
- **Código documentado** — toda função pública deve ter docstring explicando propósito, parâmetros e retorno.
- **Suporte à internacionalização** — todo texto visível deve ser traduzível via arquivos de locale.
- **Suporte a múltiplos idiomas** — português brasileiro e inglês desde a versão 1.0; espanhol na v2.0.
- **Múltiplos temas** — modo claro e escuro nativos, com temas personalizados por empresa.
- **Logs completos** — toda operação deve gerar log estruturado com nível, timestamp e contexto.
- **Criptografia** — dados sensíveis devem ser criptografados em repouso (AES-256) e em trânsito (TLS 1.3).
- **Autenticação segura** — senhas com hash bcrypt cost 12, suporte a 2FA TOTP, rate limiting de tentativas.
- **Backup automático** — agendamento diário com retenção configurável e restauração auditada.
- **Recuperação de desastre** — RTO de 4 horas e RPO de 24 horas em ambientes cloud.
- **Versionamento** — toda alteração de configuração gera nova versão, permitindo rollback.

---

# CAPÍTULO 8 — REGRAS GERAIS

As seguintes regras gerais governam o comportamento do sistema em todos os módulos, sem exceção. Estas regras devem ser implementadas no Core e aplicadas transversalmente:

- Nenhuma empresa poderá acessar dados de outra empresa — isolamento multi-tenant obrigatório.
- Todos os cálculos deverão ocorrer automaticamente após o lançamento de cada resultado.
- Todas as alterações deverão gerar auditoria com usuário, IP, dispositivo, timestamp e valores anterior/novo.
- Toda exclusão deverá ser lógica (soft delete), permitindo recuperação quando necessário.
- Todas as operações críticas deverão possuir confirmação explícita do usuário.
- Todas as operações sensíveis devem passar por validação de permissão antes da execução.
- Toda comunicação entre módulos deve ocorrer via Event Bus, nunca via chamada direta.

---

# CAPÍTULO 9 — OBJETIVOS DA EXPERIÊNCIA DO USUÁRIO

O sistema deverá permitir que qualquer usuário consiga aprender a utilizá-lo rapidamente, sem necessidade de treinamento extenso. Os seguintes objetivos de UX são mensuráveis e devem ser validados em testes de usabilidade:

- Tempo médio de aprendizado (vendedor): menos de 30 minutos
- Tempo médio de aprendizado (gerente): menos de 2 horas
- Tempo médio para executar operações comuns: menos de 3 cliques
- Tempo médio de carregamento de tela: inferior a 2 segundos
- Taxa de erro de operação: inferior a 2%
- Satisfação do usuário (SUS Score): acima de 75

---

# CAPÍTULO 10 — PADRÕES VISUAIS

A interface do usuário seguirá padrões visuais modernos e consistentes em todo o sistema. O Design System completo será detalhado no Documento 09 (UX/UI Design System), mas os princípios fundamentais são:

- Interface moderna com tipografia hierárquica clara e espaçamentos consistentes.
- Design limpo com uso consciente de cor, evitando poluição visual.
- Modo claro e modo escuro com paleta de cores derivada de uma cor primária corporativa.
- Ícones padronizados de uma biblioteca única (Lucide ou Phosphor), nunca misturas.
- Responsividade total com breakpoints definidos: mobile (até 640px), tablet (641-1024px), desktop (1025px+).
- Animações suaves com duração entre 150ms e 300ms, sempre com propósito funcional.
- Feedback visual em todas as ações: hover, focus, active, loading, success, error.

---

# CAPÍTULO 11 — ESTRATÉGIA DE EVOLUÇÃO

O Projeto Orion deverá evoluir através de versões maiores, cada uma com escopo bem definido. Esta estratégia permite planejamento de longo prazo e gerencia expectativas de clientes quanto a novidades:

- **Versão 1.0:** Base do sistema — empresas, usuários, metas, indicadores, dashboard, ranking, campanhas, relatórios, auditoria, licenciamento.
- **Versão 2.0:** IA básica — insights automáticos, previsão de fechamento, sugestões de ação. Marketplace de plugins v1.
- **Versão 3.0:** Marketplace — plugins de terceiros, gestão de extensões, revenue share.
- **Versão 4.0:** Business Intelligence — cubos OLAP, relatórios ad-hoc, drill-down avançado.
- **Versão 5.0:** Plataforma internacional — multi-idioma avançado, multi-moeda, conformidade fiscal por país.

---

# CAPÍTULO 12 — FILOSOFIA DO PRODUTO

Todo desenvolvimento deverá obedecer a um único princípio norteador, que deve ser lembrado por toda a equipe em cada decisão de design e implementação:

> **"A tecnologia deve adaptar-se ao negócio do cliente, e não o cliente adaptar-se à tecnologia."**

Essa filosofia orientará toda a evolução do Projeto Orion. Sempre que uma decisão técnica for conflitar com a flexibilidade necessária para atender um cliente, a decisão técnica deve ceder. Esta é a base do princípio de configurabilidade total que diferencia o Orion de seus concorrentes.

---

# RESUMO DE REQUISITOS FUNCIONAIS

| Módulo | RFs | Quantidade |
|--------|-----|------------|
| Empresas | RF-001 a RF-012 | 12 |
| Usuários | RF-013 a RF-035 | 23 |
| Indicadores | RF-036 a RF-060 | 25 |
| Metas | RF-061 a RF-085 | 25 |
| Resultados | RF-086 a RF-110 | 25 |
| Ranking | RF-111 a RF-125 | 15 |
| Campanhas | RF-126 a RF-145 | 20 |
| Dashboard | RF-146 a RF-160 | 15 |
| Notificações | RF-161 a RF-170 | 10 |
| Relatórios | RF-171 a RF-180 | 10 |
| Auditoria | RF-181 a RF-185 | 5 |
| **TOTAL** | | **185 RFs** |

---

## Próximo documento

No **Documento 04 – Arquitetura Geral do Sistema**, começaremos a definir a estrutura técnica do Orion: arquitetura em camadas, módulos, comunicação entre componentes, padrões de desenvolvimento, tecnologias recomendadas e diretrizes para garantir escalabilidade, segurança e facilidade de manutenção.
