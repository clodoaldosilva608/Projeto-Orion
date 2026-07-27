# DOSSIÊ MASTER DO PRODUTO

## DOCUMENTO 08

# USE CASE SPECIFICATION

**Projeto:** Orion (Nome interno)
**Versão:** 1.0
**Status:** Em Desenvolvimento
**Documento:** Use Case Specification (59 UCs detalhados)

---

# Capítulo 1 — Objetivo e Escopo

## 1.1 Objetivo

Este documento detalha todos os casos de uso (UCs) da versão 1.0 do Projeto Orion, organizados por ator. Cada caso de uso descreve uma interação completa entre um ator e o sistema, incluindo fluxo principal, fluxos alternativos, pré-condições, pós-condições e critérios de aceite. Os UCs servem como base para desenvolvimento das telas, APIs e testes funcionais.

## 1.2 Cobertura

Cobrimos 59 casos de uso distribuídos entre os seis atores do sistema (Administrador Master, Administrador da Empresa, Diretor, Gerente, Supervisor e Vendedor), mais 5 casos transversais que aplicam a todos. Cada UC segue o formato Cockburn simplificado com nível de detalhamento suficiente para:

- Desenvolvedores frontend construírem telas corretas
- Desenvolvedores backend implementarem APIs corretas
- QA escreverem testes funcionais automatizados
- Product Owners validarem implementações

## 1.3 Notação

Cada UC é identificado por `UC-XXX` (numeração sequencial). Adotamos formato Cockburn simplificado:

- **Ator Principal:** quem inicia a interação
- **Atores Secundários:** outros sistemas ou usuários envolvidos
- **Pré-condição:** estado necessário antes do UC iniciar
- **Fluxo Principal:** caminho feliz (passos numerados)
- **Fluxos Alternativos:** variações e exceções (A1, A2, A3...)
- **Pós-condição:** estado final do sistema
- **Critérios de Aceite:** checklist para considerar o UC pronto

## 1.4 Mapeamento RF → UC

Os casos de uso deste documento estão diretamente vinculados aos Requisitos Funcionais (RF) do Documento 03 (PRD). Cada UC pode cobrir um ou mais RFs. Consulte o PRD para detalhes técnicos completos de cada requisito.

---

# Capítulo 2 — Atores do Sistema

O Orion possui seis personas principais e um conjunto de UCs transversais. A tabela abaixo resume cada ator, seu escopo de atuação e os UCs sob sua responsabilidade:

| Ator | Escopo | UCs |
|------|--------|-----|
| Administrador Master | Configuração técnica do sistema, licenciamento, atualizações, backup global | UC-001 a UC-010 (10 UCs) |
| Administrador da Empresa | Cadastro e configuração da empresa: filiais, usuários, indicadores, temas | UC-011 a UC-022 (12 UCs) |
| Diretor | Visão estratégica consolidada, comparativos, ranking da rede | UC-023 a UC-028 (6 UCs) |
| Gerente | Gestão da equipe: metas, campanhas, premiações, aprovações | UC-029 a UC-038 (10 UCs) |
| Supervisor | Acompanhamento de grupo, lançamento em lote, feedback | UC-039 a UC-044 (6 UCs) |
| Vendedor | Auto-gestão: dashboard pessoal, lançamentos, ranking, histórico | UC-045 a UC-054 (10 UCs) |
| Transversais | Aplicam a todos os atores autenticados | UC-055 a UC-059 (5 UCs) |

## 2.1 Detalhamento dos Atores

### Administrador Master
Responsável técnico pela instalação e manutenção do sistema. Não gerencia dados de negócio (metas, resultados, ranking), mas cuida da infraestrutura técnica: licenciamento, módulos, atualizações, backup, parâmetros globais, auditoria cross-tenant (em modo SaaS), integrações externas e saúde do sistema.

**Características:**
- Acesso a todas as empresas (em modo SaaS)
- Não acessa dados comerciais específicos
- Pode revogar sessões, reiniciar serviços
- 2FA obrigatório

### Administrador da Empresa
Gerencia os dados de negócio da empresa. Diferentemente do Master, não tem acesso a configurações técnicas do sistema, mas tem controle total sobre a configuração comercial: filiais, usuários, indicadores, cargos, permissões, temas, idiomas, regras de cálculo.

**Características:**
- Acesso apenas à sua empresa
- Pode cadastrar/editar usuários, indicadores, metas
- Configura identidade visual
- 2FA obrigatório

### Diretor
Tem visão estratégica consolidada da empresa. Não faz operações de cadastro, mas consome relatórios e dashboards executivos para tomada de decisão em nível corporativo.

**Características:**
- Visão consolidada de todas as filiais
- Aprova metas corporativas
- Consulta auditoria de gestores
- Não faz operações de lançamento

### Gerente
Opera no nível tático: cadastra metas, cria campanhas, aprova resultados e consulta insights de IA para tomar decisões sobre sua equipe.

**Características:**
- Acesso a uma equipe ou filial
- Cria metas e campanhas
- Aprova resultados
- Consulta IA gerencial

### Supervisor
Atua como camada intermediária entre Gerente e Vendedor, com foco em acompanhamento operacional do grupo sob sua supervisão.

**Características:**
- Acompanha grupo de vendedores
- Lança resultados em lote (quando vendedor não pode)
- Reporta feedback ao gerente
- Aprova resultados do grupo

### Vendedor
Usuário final do sistema, com acesso apenas aos seus próprios dados. A interface é otimizada para simplicidade e mobile-first, permitindo uso no celular durante o expediente.

**Características:**
- Acesso apenas aos próprios dados
- Lança resultados diários
- Consulta metas e ranking
- Participa de campanhas
- Interface mobile-first

---

# Capítulo 3 — UCs do Administrador Master

O Administrador Master é o responsável técnico pela instalação e manutenção do sistema. Diferentemente do Administrador da Empresa (que gerencia dados de negócio), o Master foca em infraestrutura, licenciamento e saúde do sistema.

---

## UC-001 — Ativar licença do sistema

**Ator Principal:** Administrador Master
**Ator Secundário:** Servidor de licenciamento (call home)
**Pré-condição:** Sistema instalado e em modo de ativação (primeira execução ou após expiração).

### Fluxo Principal
1. Administrador abre o sistema pela primeira vez
2. Sistema detecta ausência de licença ativa
3. Sistema exibe tela de ativação automaticamente
4. Sistema solicita chave de licença (formato: XXXX-XXXX-XXXX-XXXX)
5. Administrador digita a chave recebida na compra
6. Administrador clica em "Ativar"
7. Sistema valida formato da chave (4 grupos de 4 caracteres alfanuméricos)
8. Sistema tenta validação online (call home ao servidor de licenciamento)
9. Servidor valida chave, retorna plano contratado e limites
10. Sistema confirma ativação
11. Sistema exibe: plano, limite de usuários, limite de filiais, módulos habilitados, validade
12. Sistema registra licença no banco local (criptografada)
13. Sistema redireciona para o Assistente de Configuração Inicial (UC-002)
14. Sistema registra auditoria da ativação

### Fluxos Alternativos

**A1 — Chave com formato inválido:**
- Passo 7 falha
- Sistema exibe erro: "Formato inválido. Use XXXX-XXXX-XXXX-XXXX."
- Campo destacado em vermelho
- Permite nova tentativa sem bloqueio

**A2 — Chave já utilizada em outra instalação:**
- Passo 9: servidor retorna erro "LICENSE_ALREADY_USED"
- Sistema exibe: "Esta chave já foi ativada em outra instalação. Contate o suporte."
- Bloqueia ativação
- Oferece link para suporte

**A3 — Chave expirada:**
- Passo 9: servidor retorna erro "LICENSE_EXPIRED"
- Sistema exibe: "Esta licença expirou em DD/MM/AAAA. Renove para continuar."
- Oferece link para renovação

**A4 — Sem conexão com internet (validação offline):**
- Passo 8 falha (timeout após 10s)
- Sistema tenta validação offline (assinatura RSA)
- Sistema verifica chave pública embutida no binário
- Se assinatura válida: ativa em modo offline (com lembrete de validação online em 7 dias)
- Se assinatura inválida: bloqueia, exibe "Chave inválida"

**A5 — Validação offline falha e sem internet:**
- Sistema oferece período de carência de 7 dias
- Modo somente leitura (consulta dados, não permite alterações)
- Lembrete diário: "Valide sua licença nas próximas X horas"
- Após 7 dias sem validação: bloqueio total

**A6 — Servidor de licenciamento indisponível (5xx):**
- Sistema tenta 3x com backoff exponencial (1s, 5s, 15s)
- Se persistir: ativa em modo offline (carência 7 dias)
- Registra log de falha para análise

**Pós-condição:** Licença ativa e registrada no banco de dados local. Sistema operacional. Auditoria registrada.

### Critérios de Aceite
- [ ] Validação online ocorre em até 5 segundos
- [ ] Validação offline funciona corretamente sem conexão (assinatura RSA)
- [ ] Plano e módulos habilitados exibidos corretamente após ativação
- [ ] Tentativas inválidas são auditadas com IP e timestamp
- [ ] Modo carência (7 dias) funcional
- [ ] Bloqueio total após 30 dias sem validação
- [ ] Chave criptografada em repouso (AES-256)

---

## UC-002 — Configurar instalação inicial (wizard)

**Ator Principal:** Administrador Master
**Pré-condição:** Licença ativada (UC-001).

### Fluxo Principal
1. Sistema inicia assistente de configuração em 5 etapas
2. Sistema exibe progresso: Etapa 1 de 5 (Empresa)
3. Administrador preenche dados da empresa:
   - Razão Social (obrigatório)
   - Nome Fantasia
   - CNPJ (obrigatório, validado)
   - Inscrição Estadual
   - Endereço completo (CEP auto-preenche)
   - Telefone e e-mail de contato
   - Logo da empresa (PNG/SVG até 2MB)
   - Tema visual (Padrão, Azul, Verde, Vermelho, Roxo, Personalizado)
   - Idioma (Português, Inglês)
   - Moeda (BRL, USD, EUR)
   - Timezone (America/Sao_Paulo, etc.)
4. Administrador clica em "Próximo"
5. Sistema valida CNPJ via módulo 11
6. Sistema busca CEP via API externa (Viacep)
7. Sistema valida formato do e-mail
8. Sistema valida e armazena logo
9. Sistema avança para Etapa 2 (Filiais)
10. Administrador cadastra primeira filial:
    - Código (ex: LOJA-001)
    - Nome
    - Endereço
    - Gerente responsável (ainda não cadastrado, opcional)
    - Horário de funcionamento
11. Sistema captura latitude/longitude via geocodificação
12. Administrador pode adicionar mais filiais (conforme limite da licença) ou pular
13. Sistema avança para Etapa 3 (Cargos)
14. Sistema exibe cargos pré-definidos:
    - Administrador
    - Diretor
    - Gerente
    - Supervisor
    - Vendedor
    - Caixa
    - Auxiliar
15. Administrador pode editar nomes, adicionar cargos, remover (exceto sistema)
16. Sistema avança para Etapa 4 (Usuário Admin)
17. Administrador cadastra primeiro usuário Administrador da Empresa:
    - Nome completo
    - CPF
    - E-mail
    - Login
    - Senha (deve atender política: 8+ chars, maiúscula, número, especial)
18. Sistema valida unicidade de CPF, e-mail e login
19. Sistema criptografa senha (bcrypt cost 12) e CPF (AES-256)
20. Sistema avança para Etapa 5 (Indicadores)
21. Sistema oferece opções:
    - Template por segmento (Farmácia, Supermercado, Varejo, etc.)
    - Começar do zero
    - Importar de outra instalação
22. Administrador seleciona template
23. Sistema cria indicadores do template (versão 1 cada)
24. Administrador clica em "Finalizar Configuração"
25. Sistema valida todas as etapas
26. Sistema salva tudo no banco (transação)
27. Sistema registra auditoria de cada etapa
28. Sistema redireciona para Dashboard Admin
29. Sistema exibe mensagem de boas-vindas

### Fluxos Alternativos

**A1 — Administrador interrompe wizard:**
- Sistema salva progresso automaticamente a cada etapa
- Ao retornar, oferece: "Continuar de onde parou" ou "Recomeçar"
- Dados parciais preservados por 30 dias

**A2 — CNPJ inválido:**
- Passo 5: módulo 11 falha
- Sistema exibe erro inline: "CNPJ inválido"
- Bloqueia avanço até correção

**A3 — CNPJ já cadastrado (modo SaaS):**
- Sistema verifica unicidade
- Exibe: "CNPJ já cadastrado. Contate o suporte."
- Bloqueia avanço

**A4 — CEP não encontrado:**
- Passo 6: API retorna vazio
- Sistema alerta mas permite preenchimento manual
- Não bloqueia

**A5 — Logo inválida:**
- Passo 8: formato não suportado ou tamanho > 2MB
- Sistema exibe erro específico
- Permite nova tentativa

**A6 — Limite de filiais atingido:**
- Passo 12: sistema verifica licença
- Bloqueia adição de mais filiais
- Exibe: "Limite atingido (X de Y). Faça upgrade do plano."

**A7 — Login do admin já existe:**
- Passo 18: sistema detecta duplicata
- Sugere login alternativo (login + número)
- Exige unicidade

**A8 — Senha fraca:**
- Passo 19: não atende política
- Sistema exibe requisitos não atendidos em tempo real
- Bloqueia até atender

**Pós-condição:** Empresa configurada com filiais, cargos, primeiro admin e indicadores. Sistema pronto para uso operacional.

### Critérios de Aceite
- [ ] Todas as 5 etapas podem ser puladas e retomadas
- [ ] Progresso salvo automaticamente
- [ ] Templates por segmento aceleram configuração (10+ segmentos)
- [ ] Senha do admin deve atender política mínima
- [ ] Logo é validada (PNG/SVG, máx 2MB)
- [ ] CNPJ validado via módulo 11
- [ ] CEP auto-preenche endereço
- [ ] Lat/lng capturados via geocodificação
- [ ] Auditoria registra cada etapa
- [ ] Tempo total médio: 30 minutos

---

## UC-003 — Gerenciar módulos e plugins

**Ator Principal:** Administrador Master
**Pré-condição:** Sistema ativo com licença válida.

### Fluxo Principal
1. Administrador acessa painel administrativo > Módulos
2. Sistema lista todos os módulos disponíveis com:
   - Nome e descrição
   - Status: Ativo, Inativo, Bloqueado por licença
   - Versão atual
   - Última atualização
   - Tamanho em disco
3. Sistema mostra estatísticas: X ativos, Y inativos, Z bloqueados
4. Administrador clica em um módulo inativo
5. Sistema exibe detalhes: funcionalidades, dependências, permissões necessárias
6. Administrador clica em "Ativar"
7. Sistema verifica se licença cobre o módulo
8. Sistema verifica dependências (outros módulos necessários)
9. Sistema ativa módulo
10. Sistema reinicia serviços afetados automaticamente
11. Sistema registra auditoria
12. Sistema emite evento `module.activated`
13. Sistema exibe sucesso
14. Sistema atualiza lista

### Fluxos Alternativos

**A1 — Tentar ativar módulo não coberto pela licença:**
- Passo 7: licença não inclui módulo
- Sistema bloqueia ativação
- Exibe: "Módulo 'X' requer plano Enterprise. Faça upgrade."
- Botão "Upgrade de Plano" leva ao portal

**A2 — Dependência não atendida:**
- Passo 8: módulo depende de outro inativo
- Sistema exibe: "Ative primeiro o módulo 'Y'"
- Bloqueia até dependência resolvida

**A3 — Desativar módulo com dados existentes:**
- Administrador clica em "Desativar" em módulo ativo
- Sistema alerta: "X registros ficarão inacessíveis. Continuar?"
- Exige confirmação dupla (digitar nome do módulo)
- Sistema desativa
- Dados preservados (não excluídos)

**A4 — Erro ao reiniciar serviço:**
- Passo 10: serviço não reinicia
- Sistema tenta 3x
- Se persistir: reverte ativação, exibe erro
- Log detalhado para debug

**A5 — Instalar plugin do marketplace:**
- Administrador acessa Marketplace (se disponível)
- Seleciona plugin
- Sistema baixa pacote
- Sistema valida assinatura
- Sistema instala em sandbox
- Plugin aparece como "Instalado, aguardando ativação"

**Pós-condição:** Estado dos módulos atualizado. Serviços reiniciados conforme necessário. Auditoria registrada.

### Critérios de Aceite
- [ ] Listagem carrega em menos de 1 segundo
- [ ] Ativação/desativação ocorre em menos de 5 segundos
- [ ] Serviços afetados são reiniciados sem downtime perceptível
- [ ] Alterações ficam registradas na auditoria
- [ ] Dependências verificadas antes da ativação
- [ ] Bloqueio por licença funciona
- [ ] Confirmação dupla para desativação com dados

---

## UC-004 — Aplicar atualizações do sistema

**Ator Principal:** Administrador Master
**Ator Secundário:** Servidor de atualizações (registry)
**Pré-condição:** Atualização disponível verificada pelo sistema.

### Fluxo Principal
1. Sistema verifica automaticamente novas versões (a cada 24h)
2. Sistema encontra nova versão disponível
3. Sistema exibe notificação: "Nova versão X.Y.Z disponível"
4. Sistema adiciona badge no menu Atualizações
5. Administrador acessa painel > Atualizações
6. Sistema exibe:
   - Versão atual: X.Y.Z
   - Versão disponível: A.B.C
   - Changelog completo (features, fixes, breaking changes)
   - Tamanho do download
   - Tempo estimado
   - Recomendação de backup pré-atualização
7. Administrador revisa changelog
8. Administrador clica em "Atualizar Agora"
9. Sistema exibe confirmação: "O sistema ficará indisponível por ~X minutos. Continuar?"
10. Administrador confirma
11. Sistema cria backup automático (CRÍTICO - UC-005)
12. Sistema valida integridade do backup
13. Sistema baixa pacote de atualização
14. Sistema verifica assinatura do pacote
15. Sistema aplica migrations de banco de dados
16. Sistema atualiza arquivos da aplicação
17. Sistema reinicia serviços
18. Sistema executa health checks pós-deploy
19. Sistema exibe tela de login com versão atualizada
20. Sistema registra auditoria
21. Sistema notifica admin do sucesso

### Fluxos Alternativos

**A1 — Falha durante download:**
- Passo 13: conexão cai
- Sistema tenta retomar download (3x)
- Se persistir: aborta, mantém versão atual
- Exibe: "Download falhou. Tente novamente."

**A2 — Falha durante migrations:**
- Passo 15: migration falha
- Sistema detecta erro
- Sistema restaura backup automático (passo 11)
- Sistema volta à versão anterior
- Sistema exibe relatório de erro detalhado
- Sistema envia log de erro para servidor (se permitido)

**A3 — Health check falha pós-deploy:**
- Passo 18: serviço não responde
- Sistema detecta após 30s
- Sistema restaura backup
- Sistema volta à versão anterior
- Sistema notifica admin
- Exige investigação manual

**A4 — Atualização requer versão intermediária:**
- Passo 6: sistema detecta versão muito antiga
- Exibe: "Atualização requer versão X.Y.Z primeiro. Serão aplicadas N atualizações em sequência."
- Administrador confirma
- Sistema aplica atualizações em cascata

**A5 — Pacote corrompido:**
- Passo 14: assinatura não confere
- Sistema aborta
- Exibe: "Pacote corrompido ou adulterado. Tente novamente."
- Reporta ao servidor

**A6 — Espaço em disco insuficiente:**
- Passo 13: sistema verifica espaço
- Exibe: "Espaço insuficiente. Necessário X GB, disponível Y GB."
- Bloqueia até liberação

**Pós-condição:** Sistema na versão mais recente. Backup pré-atualização disponível para rollback. Auditoria registrada.

### Critérios de Aceite
- [ ] Verificação de atualização ocorre automaticamente a cada 24h
- [ ] Backup pré-atualização é obrigatório e automático
- [ ] Tempo total de atualização inferior a 10 minutos
- [ ] Rollback automático em caso de falha
- [ ] Changelog exibido antes de atualizar
- [ ] Health check pós-deploy
- [ ] Auditoria registra operação
- [ ] Notificação de sucesso/fracasso

---

## UC-005 — Gerenciar backups e restauração

**Ator Principal:** Administrador Master
**Pré-condição:** Sistema ativo.

### Fluxo Principal — Backup Manual
1. Administrador acessa painel > Backup
2. Sistema exibe:
   - Lista de backups existentes (data, hora, tamanho, tipo, status)
   - Espaço total usado vs disponível
   - Próximo backup automático agendado
   - Configurações de retenção
3. Administrador clica em "Criar Backup Manual"
4. Sistema exibe confirmação: "Backup pode levar X minutos. Continuar?"
5. Administrador confirma
6. Sistema exibe progresso (barra com %)
7. Sistema executa pg_dump do PostgreSQL
8. Sistema compacta em .tar.gz
9. Sistema calcula hash SHA-256 (integridade)
10. Sistema armazena em storage local
11. Sistema replica para storage externo (se configurado: S3)
12. Sistema registra na tabela backups
13. Sistema registra auditoria
14. Sistema exibe sucesso com detalhes (tamanho, duração, localização)

### Fluxo Principal — Restauração
1. Administrador seleciona backup na lista
2. Clica em "Restaurar"
3. Sistema exibe WARNING: "Restauração substituirá todos os dados atuais. Operação irreversível."
4. Sistema solicita senha do admin para confirmar
5. Sistema solicita 2FA (código TOTP)
6. Administrador informa credenciais
7. Sistema valida
8. Sistema valida integridade do backup (hash)
9. Sistema exibe preview: "X tabelas, Y registros serão restaurados"
10. Administrador confirma novamente
11. Sistema coloca sistema em modo manutenção
12. Sistema faz backup automático do estado atual (antes de restaurar)
13. Sistema para serviços
14. Sistema restaura banco do backup
15. Sistema restaura arquivos (logos, anexos)
16. Sistema reinicia serviços
17. Sistema executa health checks
18. Sistema remove modo manutenção
19. Sistema registra auditoria (operação crítica)
20. Sistema notifica admin do sucesso

### Fluxos Alternativos

**A1 — Backup corrompido detectado na restauração:**
- Passo 8: hash não confere
- Sistema bloqueia restauração
- Exibe: "Backup corrompido. Selecione outro."
- Sugere backup mais recente

**A2 — Espaço em disco insuficiente para novo backup:**
- Passo 7: disco cheio
- Sistema alerta
- Oferece purge de backups antigos
- Bloqueia até liberação

**A3 — Falha durante restauração:**
- Passo 14: erro SQL
- Sistema detecta
- Sistema restaura backup do estado atual (passo 12)
- Sistema volta a operar
- Exibe relatório de erro

**A4 — Restauração interrompida (power off):**
- Sistema detecta na próxima inicialização
- Oferece: "Restauração incompleta detectada. Continuar ou restaurar backup anterior?"
- Recuperação assistida

**A5 — Exportar backup:**
- Administrador seleciona backup
- Clica em "Exportar"
- Sistema gera link de download assinado (válido 24h)
- Administrador baixa arquivo .tar.gz
- Link expira após 24h

**A6 — Importar backup externo:**
- Administrador faz upload de backup externo
- Sistema valida hash e estrutura
- Sistema adiciona à lista de backups
- Disponível para restauração

**A7 — Configurar backup automático:**
- Administrador acessa Configurações > Backup
- Define schedule (cron): ex: 0 2 * * * (diário 2h)
- Define retenção: 30 dias (padrão)
- Define storage externo (S3 opcional)
- Salva

**Pós-condição:** Backup criado ou restaurado conforme ação. Auditoria registrada. Sistema operacional.

### Critérios de Aceite
- [ ] Backups automáticos seguem cron configurável (padrão: diário 02h)
- [ ] Retenção padrão: 30 dias (configurável)
- [ ] Restauração exige confirmação por senha + 2FA
- [ ] Hash SHA-256 para verificação de integridade
- [ ] Backup automático do estado atual antes de restaurar
- [ ] Backups podem ser exportados para armazenamento externo
- [ ] Modo manutenção durante restauração
- [ ] Health checks pós-restauração
- [ ] Auditoria registra todas as operações
- [ ] Notificação ao admin do resultado

---

## UC-006 — Configurar parâmetros globais

**Ator Principal:** Administrador Master
**Pré-condição:** Permissão `system.config`.

### Fluxo Principal
1. Administrador acessa Sistema > Parâmetros Globais
2. Sistema exibe seções:
   - Idioma e Localização
   - Segurança
   - Performance
   - Notificações
   - Retenção de Dados
3. Administrador edita parâmetros:
   - Idioma padrão: Português (BR)
   - Timezone padrão: America/Sao_Paulo
   - Moeda base: BRL
   - Política de senhas: mín 8 chars, maiúscula, número, especial
   - Tentativas de login antes do bloqueio: 5
   - Tempo de bloqueio: 15 minutos
   - Tempo de sessão: 8 horas
   - Retenção de logs de auditoria: 5 anos
   - Retenção de backups: 30 dias
4. Administrador clica em Salvar
5. Sistema valida
6. Sistema aplica (algumas mudanças exigem reinício)
7. Sistema registra auditoria
8. Sistema notifica se reinício é necessário

### Critérios de Aceite
- [ ] Parâmetros organizados por seção
- [ ] Mudanças de segurança aplicadas imediatamente
- [ ] Mudanças de performance exigem reinício
- [ ] Auditoria registra alterações
- [ ] Validação de ranges (ex: tentativas 3-10)

---

## UC-007 — Acessar auditoria global

**Ator Principal:** Administrador Master
**Pré-condição:** Permissão `audit.read` (global).

### Fluxo Principal
1. Administrador acessa Sistema > Auditoria
2. Sistema exibe filtros:
   - Empresa (todas ou específica)
   - Período
   - Usuário
   - Ação
   - Tabela
3. Administrador aplica filtros
4. Sistema consulta tabela audit_logs
5. Sistema exibe lista paginada
6. Cada item mostra: timestamp, empresa, usuário, ação, tabela, registro, diff
7. Administrador pode expandir para ver valores completo (JSON)
8. Administrador pode exportar (CSV, PDF)

### Critérios de Aceite
- [ ] Acesso a logs de todas as empresas (modo SaaS)
- [ ] Filtros combináveis
- [ ] Paginação (default 50, max 200)
- [ ] Diff visual (highlight)
- [ ] Performance < 1s com 100k+ logs
- [ ] Exportação CSV e PDF

---

## UC-008 — Gerenciar integrações externas

**Ator Principal:** Administrador Master
**Pré-condição:** Permissão `integrations.manage`.

### Fluxo Principal
1. Administrador acessa Sistema > Integrações
2. Sistema exibe categorias:
   - Webhooks (saída)
   - API Keys (entrada)
   - ERP (Totvs, SAP, Sankhya)
   - CRM (Salesforce, HubSpot)
   - Mensageria (WhatsApp, Telegram)
   - E-mail (SMTP)
3. Administrador seleciona categoria
4. Adiciona/edita/remova integração
5. Configura credenciais
6. Testa conexão
7. Salva
8. Sistema criptografa credenciais
9. Sistema registra auditoria

### Critérios de Aceite
- [ ] Credenciais criptografadas (AES-256)
- [ ] Teste de conexão antes de salvar
- [ ] Múltiplas integrações por categoria
- [ ] Status de saúde (online/offline)
- [ ] Logs de integração

---

## UC-009 — Revogar sessões ativas

**Ator Principal:** Administrador Master
**Pré-condição:** Permissão `users.manage_sessions`.

### Fluxo Principal
1. Administrador acessa Sistema > Sessões Ativas
2. Sistema lista todas as sessões ativas:
   - Usuário
   - Empresa
   - IP
   - User-Agent
   - Última atividade
   - Localização aproximada (geo-IP)
3. Administrador pode filtrar por empresa, usuário, IP
4. Administrador seleciona sessão(ões)
5. Clica em "Revogar"
6. Sistema confirma
7. Sistema adiciona tokens à blacklist Redis
8. Sistema força logout no próximo request
9. Sistema registra auditoria
10. Sistema notifica usuário por e-mail

### Critérios de Aceite
- [ ] Lista todas as sessões ativas (todas as empresas)
- [ ] Filtros funcionais
- [ ] Revogação individual ou em massa
- [ ] Logout forçado imediato
- [ ] Notificação por e-mail ao usuário
- [ ] Auditoria registra quem revogou

---

## UC-010 — Reiniciar/desligar serviços

**Ator Principal:** Administrador Master
**Pré-condição:** Permissão `system.admin`.

### Fluxo Principal
1. Administrador acessa Sistema > Serviços
2. Sistema lista serviços:
   - API (orion-web)
   - Database (PostgreSQL)
   - Cache (Redis)
   - Backup (orion-backup)
   - Workers (background jobs)
3. Cada serviço mostra: status, uptime, CPU, RAM, versão
4. Administrador seleciona serviço
5. Clica em "Reiniciar"
6. Sistema confirma: "Serviço X ficará indisponível por ~Y segundos"
7. Administrador confirma
8. Sistema reinicia serviço
9. Sistema executa health check
10. Sistema registra auditoria
11. Sistema exibe sucesso

### Fluxos Alternativos

**A1 — Serviço não reinicia:**
- Sistema tenta 3x
- Se persistir: exibe erro, mantém serviço parado
- Alerta admin para intervenção manual

**A2 — Tentar reiniciar database:**
- Sistema alerta: "Reiniciar banco afeta TODOS os serviços"
- Exige confirmação dupla + 2FA
- Modo manutenção ativado durante restart

**Critérios de Aceite**
- [ ] Lista todos os serviços
- [ ] Status em tempo real
- [ ] Reinício individual
- [ ] Health check pós-restart
- [ ] Confirmação para serviços críticos
- [ ] Auditoria

---

# Capítulo 4 — UCs do Administrador da Empresa

O Administrador da Empresa gerencia os dados de negócio: filiais, usuários, indicadores, temas. Diferentemente do Master, não tem acesso a configurações técnicas do sistema.

---

## UC-011 — Cadastrar empresa

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Primeiro acesso após wizard (UC-002) ou solicitação de edição posterior. Permissão `companies.update`.

### Fluxo Principal
1. Administrador acessa Configurações > Empresa
2. Sistema exibe formulário com dados atuais (razão social, CNPJ, endereço, logo, tema, idioma)
3. Administrador edita campos desejados
4. Sistema valida CNPJ via módulo 11 (se alterado)
5. Sistema busca CEP via API (se alterado)
6. Sistema valida formato de e-mail
7. Administrador pode trocar logo (PNG/SVG até 2MB)
8. Administrador pode alterar tema (cores, modo claro/escuro)
9. Administrador pode alterar idioma padrão
10. Administrador pode alterar moeda
11. Administrador pode alterar timezone
12. Administrador clica em Salvar
13. Sistema valida todos os campos obrigatórios
14. Sistema criptografa CNPJ (AES-256)
15. Sistema persiste alterações
16. Sistema registra auditoria (valores anterior e novo)
17. Sistema emite evento `company.updated`
18. Sistema exibe sucesso
19. Sistema aplica mudanças de tema/idioma para próximas sessões

### Fluxos Alternativos

**A1 — CNPJ já cadastrado em outra empresa (modo SaaS):**
- Passo 4: sistema detecta duplicata
- Bloqueia alteração
- Exibe contato de suporte

**A2 — Alteração de CNPJ em empresa ativa:**
- Passo 12: operação crítica
- Exige reautenticação com senha + 2FA
- Registra como operação crítica na auditoria

**A3 — Logo inválida:**
- Passo 7: formato não suportado ou tamanho > 2MB
- Exibe erro específico
- Permite nova tentativa

**A4 — Tema customizado com baixo contraste:**
- Sistema detecta contraste < 4.5:1
- Alerta: "Contraste insuficiente pode afetar acessibilidade"
- Permite salvar mas recomenda ajuste

**Pós-condição:** Dados da empresa atualizados. Auditoria registrada. Mudanças aplicadas.

### Critérios de Aceite
- [ ] Campos obrigatórios validados antes de salvar
- [ ] CNPJ validado via módulo 11
- [ ] CEP auto-preenche endereço
- [ ] Logo aceita PNG/SVG até 2MB
- [ ] Tema pode ser customizado ou usar template pronto
- [ ] Idioma alterado afeta todos os usuários na próxima sessão
- [ ] Alteração de CNPJ exige reautenticação
- [ ] Auditoria com diff de valores

---

## UC-012 — Cadastrar filiais

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Empresa cadastrada, licença com limite não atingido, permissão `branches.create`.

### Fluxo Principal
1. Administrador acessa Configurações > Filiais > Nova Filial
2. Sistema exibe formulário:
   - Código (ex: LOJA-001)
   - Nome
   - Telefone
   - Gerente responsável (lista de usuários com cargo de gerente)
   - CEP, endereço, número, complemento, bairro, cidade, estado, país
   - Horário de funcionamento (abertura, fechamento, dias da semana)
3. Administrador preenche código
4. Sistema valida unicidade do código na empresa
5. Administrador preenche nome
6. Administrador seleciona gerente (opcional)
7. Administrador preenche CEP
8. Sistema busca endereço via Viacep
9. Administrador completa endereço
10. Administrador define horário (multi-turno se necessário)
11. Sistema captura lat/lng via geocodificação (Google Maps)
12. Administrador clica em Salvar
13. Sistema valida limite de filiais da licença
14. Sistema persiste
15. Sistema registra auditoria
16. Sistema emite evento `branch.created`
17. Sistema exibe sucesso

### Fluxos Alternativos

**A1 — Limite de filiais atingido:**
- Passo 13: licença não permite mais filiais
- Bloqueia criação
- Exibe: "Limite atingido (X de Y). Upgrade do plano."
- Botão de upgrade

**A2 — Código já existe:**
- Passo 4: duplicata detectada
- Exibe erro inline
- Bloqueia avanço

**A3 — Geocodificação falha:**
- Passo 11: API indisponível
- Sistema permite salvar sem lat/lng
- Marca para preenchimento posterior

**A4 — Gerente não selecionado:**
- Campo opcional
- Permite salvar sem gerente
- Sistema marca "Sem gerente designado"

**Pós-condição:** Filial criada e vinculada à empresa. Auditoria registrada.

### Critérios de Aceite
- [ ] Código único por empresa
- [ ] Limite de licença validado
- [ ] CEP auto-preenche endereço
- [ ] Lat/lng capturados via geocodificação
- [ ] Horário multi-turno suportado
- [ ] Auditoria registra criação
- [ ] Evento emitido para módulos assinantes

---

## UC-013 — Cadastrar departamentos

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Filial cadastrada, permissão `departments.create`.

### Fluxo Principal
1. Administrador acessa Configurações > Departamentos > Novo
2. Preenche: nome, descrição, filial, responsável
3. Salva
4. Sistema valida, persiste, audita

### Critérios de Aceite
- [ ] Departamento vinculado a filial
- [ ] Nome único por filial
- [ ] Auditoria registrada

---

## UC-014 — Cadastrar cargos

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Permissão `roles.create`.

### Fluxo Principal
1. Admin acessa Configurações > Cargos > Novo Cargo
2. Preenche: nome, descrição, é cargo de sistema (não)
3. Define permissões granulares por módulo (matriz visual)
4. Define hierarquia (herda de qual cargo?)
5. Salva
6. Sistema valida, persiste, audita
7. Sistema emite evento `role.created`

### Critérios de Aceite
- [ ] Matriz visual módulo × ação
- [ ] Hierarquia (herança de permissões)
- [ ] Cargo de sistema não pode ser excluído
- [ ] Auditoria registrada

---

## UC-015 — Cadastrar usuários

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Empresa e filial cadastradas, cargo definido, permissão `users.create`, limite de usuários não atingido.

### Fluxo Principal
1. Admin acessa Configurações > Usuários > Novo Usuário
2. Sistema exibe formulário completo
3. Admin preenche dados pessoais (nome, CPF, RG, matrícula)
4. Sistema valida CPF (módulo 11)
5. Sistema valida unicidade de CPF, e-mail e login
6. Admin preenche contato (e-mail, telefone, celular)
7. Admin faz upload de foto (opcional)
8. Admin seleciona filial e cargo
9. Admin define login e senha temporária
10. Sistema valida força da senha
11. Admin clica em Criar
12. Sistema verifica limite de usuários da licença
13. Sistema criptografa CPF (AES-256) e senha (bcrypt cost 12)
14. Sistema persiste
15. Sistema registra auditoria
16. Sistema envia e-mail de boas-vindas com credenciais
17. Sistema marca senha como temporária
18. Sistema emite evento `user.created`
19. Sistema exibe sucesso

### Fluxos Alternativos

**A1 — CPF inválido ou duplicado:** bloqueia, exibe erro
**A2 — E-mail já cadastrado:** bloqueia
**A3 — Login já existe:** sugere alternativa
**A4 — Senha fraca:** exibe requisitos
**A5 — Limite atingido:** bloqueia, sugere upgrade
**A6 — E-mail falha:** registra log, usuário criado, admin pode reenviar

### Critérios de Aceite
- [ ] CPF validado via módulo 11
- [ ] Unicidade de CPF, e-mail e login
- [ ] Senha segue política
- [ ] Senha criptografada (bcrypt cost 12)
- [ ] CPF criptografado (AES-256)
- [ ] Limite de licença validado
- [ ] E-mail de boas-vindas enviado
- [ ] Senha temporária exige troca
- [ ] Auditoria registrada

---

## UC-016 — Atribuir permissões a cargos

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Cargo existe, permissão `roles.update`.

### Fluxo Principal
1. Admin acessa cargo > Permissões
2. Sistema exibe matriz: módulos × ações
3. Admin marca/desmarca permissões
4. Salva
5. Sistema recalcula permissões de todos os usuários com o cargo
6. Sistema registra auditoria (diff de permissões)
7. Sistema emite evento `role.permissions_updated`

### Critérios de Aceite
- [ ] Matriz visual
- [ ] Mudanças aplicadas imediatamente
- [ ] Auditoria com diff
- [ ] Permissões especiais destacadas

---

## UC-017 — Configurar indicadores personalizados

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Permissão `indicators.create`.

### Fluxo Principal
1. Admin acessa Configurações > Indicadores > Novo
2. Preenche campos básicos (nome, descrição, categoria, tipo)
3. Configura aparência (ícone, cor)
4. Configura comportamento (peso, exibição)
5. Opcional: define fórmula personalizada
6. Valida fórmula
7. Cria
8. Sistema versiona (v1)
9. Sistema registra auditoria
10. Sistema emite evento `indicator.created`

### Critérios de Aceite
- [ ] Nome único por empresa
- [ ] Tipo valida formato
- [ ] Fórmula validada
- [ ] Peso afeta ranking
- [ ] Versionamento
- [ ] Auditoria

---

## UC-018 — Criar categorias de indicadores

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Permissão `indicators.create`.

### Fluxo Principal
1. Admin acessa Indicadores > Categorias > Nova
2. Preenche: nome, descrição, cor
3. Salva
4. Sistema valida unicidade
5. Sistema persiste, audita

### Critérios de Aceite
- [ ] Nome único por empresa
- [ ] Cor opcional
- [ ] Auditoria

---

## UC-019 — Configurar temas e identidade visual

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Permissão `company.config`.

### Fluxo Principal
1. Admin acessa Configurações > Temas
2. Seleciona tema pré-definido OU customiza:
   - Cor primária
   - Cor secundária
   - Cor de fundo
   - Modo padrão (claro/escuro/sistema)
3. Faz upload de logo
4. Define nome exibido
5. Salva
6. Sistema aplica para próxima sessão de cada usuário

### Critérios de Aceite
- [ ] Temas pré-definidos
- [ ] Customização de cores
- [ ] Logo PNG/SVG até 2MB
- [ ] Aplicação na próxima sessão

---

## UC-020 — Configurar idiomas e moeda

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Permissão `company.config`.

### Fluxo Principal
1. Admin acessa Configurações > Idioma e Moeda
2. Seleciona idioma padrão
3. Seleciona moeda
4. Define formato de data/hora
5. Salva
6. Sistema aplica para novos usuários

### Critérios de Aceite
- [ ] Idioma padrão para novos usuários
- [ ] Moeda aplicada em formulários
- [ ] Formato de data/hora respeitado

---

## UC-021 — Definir regras de cálculo globais

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Permissão `company.config`.

### Fluxo Principal
1. Admin acessa Configurações > Regras de Cálculo
2. Define fórmulas globais (ex: TKM = Faturamento / Clientes)
3. Salva
4. Sistema valida sintaxe
5. Sistema aplica em cálculos automáticos

### Critérios de Aceite
- [ ] Fórmulas globais
- [ ] Validação sintática
- [ ] Aplicação automática

---

## UC-022 — Exportar dados da empresa

**Ator Principal:** Administrador da Empresa
**Pré-condição:** Permissão `company.export`, 2FA obrigatório.

### Fluxo Principal
1. Admin acessa Configurações > Exportar Dados
2. Sistema exige 2FA
3. Admin seleciona escopo: tudo ou tabelas específicas
4. Sistema gera pacote JSON estruturado
5. Sistema compacta em ZIP
6. Sistema disponibiliza link (válido 24h)
7. Sistema notifica por e-mail
8. Sistema registra auditoria (LGPD crítica)

### Critérios de Aceite
- [ ] 2FA obrigatório
- [ ] Exportação completa
- [ ] Formato JSON estruturado
- [ ] Link expira em 24h
- [ ] Auditoria registra
- [ ] Notificação por e-mail

---

# Capítulo 5 — UCs do Diretor

O Diretor tem visão estratégica consolidada da empresa. Não faz operações de cadastro, mas consome relatórios e dashboards executivos para tomada de decisão em nível corporativo.

---

## UC-023 — Visualizar dashboard executivo consolidado

**Ator Principal:** Diretor
**Pré-condição:** Diretor autenticado com permissão de dashboard executivo.

### Fluxo Principal
1. Diretor acessa Dashboard > Executivo
2. Sistema coleta dados consolidados de todas as filiais
3. Sistema exibe painel:
   - Faturamento total da rede (hoje, semana, mês)
   - Meta consolidada e percentual
   - Ranking de filiais (top 10)
   - Top 10 vendedores da rede
   - Indicadores estratégicos (TKM, conversão, etc.)
   - Comparativo com período anterior
4. Diretor pode aplicar filtros:
   - Período (hoje, semana, mês, trimestre, ano, custom)
   - Região (se multi-região)
   - Segmento (se multi-segmento)
5. Sistema atualiza dados em tempo real (a cada 30s)
6. Diretor pode exportar snapshot em PDF
7. Sistema gera PDF com logo, dados consolidados, gráficos
8. Download

### Fluxos Alternativos

**A1 — Sem dados no período:**
- Sistema exibe estado vazio amigável
- Sugestão: "Tente outro período"

**A2 — Timeout ao carregar consolidação:**
- Sistema exibe progresso
- Permite cancelar
- Tenta novamente

**A3 — Filial offline (sem dados recentes):**
- Sistema alerta: "Filial X sem dados há Y horas"
- Exibe última sincronização

### Critérios de Aceite
- [ ] Carregamento inferior a 3 segundos mesmo com 100+ filiais
- [ ] Dados atualizam a cada 30 segundos
- [ ] Exportação PDF profissional com logo
- [ ] Filtros persistidos por usuário
- [ ] Comparativo com período anterior
- [ ] Visualização de ranking de filiais

---

## UC-024 — Comparar desempenho entre filiais

**Ator Principal:** Diretor
**Pré-condição:** Permissão `dashboard.executive`.

### Fluxo Principal
1. Diretor acessa Dashboard > Comparativo de Filiais
2. Sistema exibe matriz: filiais × indicadores
3. Diretor seleciona indicadores para comparar
4. Diretor seleciona filiais (ou todas)
5. Diretor seleciona período
6. Sistema gera matriz colorida (heatmap)
7. Diretor pode ordenar por indicador
8. Diretor pode exportar em Excel

### Critérios de Aceite
- [ ] Matriz visual
- [ ] Heatmap com cores
- [ ] Ordenação dinâmica
- [ ] Exportação Excel

---

## UC-025 — Acompanhar ranking geral da rede

**Ator Principal:** Diretor
**Pré-condição:** Permissão `ranking.read`.

### Fluxo Principal
1. Diretor acessa Ranking > Geral da Rede
2. Sistema exibe ranking consolidado:
   - Todos os vendedores de todas as filiais
   - Ordenados por pontuação
3. Diretor pode filtrar por filial
4. Diretor pode filtrar por período
5. Diretor pode exportar

### Critérios de Aceite
- [ ] Ranking consolidado
- [ ] Filtros por filial e período
- [ ] Exportação

---

## UC-026 — Solicitar relatórios estratégicos

**Ator Principal:** Diretor
**Pré-condição:** Permissão `reports.executive`.

### Fluxo Principal
1. Diretor acessa Relatórios > Estratégicos
2. Seleciona tipo:
   - Desempenho da rede
   - Análise de filiais
   - Tendências
   - Previsões (com IA)
3. Seleciona período
4. Seleciona formato (PDF, Excel, Tela)
5. Clica em Gerar
6. Sistema coleta dados
7. Sistema formata
8. Sistema gera arquivo
9. Download ou exibição

### Critérios de Aceite
- [ ] Múltiplos tipos de relatório
- [ ] Formatos PDF e Excel
- [ ] Logo da empresa
- [ ] Gráficos incluídos

---

## UC-027 — Aprovar metas corporativas

**Ator Principal:** Diretor
**Pré-condição:** Permissão `goals.approve_corporate`.

### Fluxo Principal
1. Diretor recebe notificação: "X metas corporativas aguardando aprovação"
2. Acessa Metas > Aprovações
3. Sistema lista metas propostas por gerentes
4. Diretor revisa cada uma:
   - Vendedor, indicador, período, valor
   - Justificativa do gerente
5. Diretor aprova ou rejeita
6. Se rejeita: informa motivo
7. Sistema notifica gerente da decisão
8. Sistema registra auditoria

### Critérios de Aceite
- [ ] Workflow de aprovação
- [ ] Lista de pendentes
- [ ] Aprovação/rejeição com motivo
- [ ] Notificação ao gerente
- [ ] Auditoria

---

## UC-028 — Consultar auditoria de gestores

**Ator Principal:** Diretor
**Pré-condição:** Permissão `audit.read` (escopo gestores).

### Fluxo Principal
1. Diretor acessa Auditoria > Gestores
2. Sistema exibe logs de ações gerenciais:
   - Criação/alteração de metas
   - Aprovação/rejeição de resultados
   - Criação de campanhas
   - Alterações de permissões
3. Diretor filtra por gerente, período, ação
4. Diretor pode exportar

### Critérios de Aceite
- [ ] Apenas ações de gestores
- [ ] Filtros
- [ ] Exportação
- [ ] Auditoria

---

# Capítulo 6 — UCs do Gerente

O Gerente opera no nível tático: cadastra metas, cria campanhas, aprova resultados e consulta insights de IA para tomar decisões sobre sua equipe.

---

## UC-029 — Cadastrar metas para equipe

**Ator Principal:** Gerente
**Pré-condição:** Permissão `goals.create`.

### Fluxo Principal
1. Gerente acessa Metas > Nova Meta
2. Seleciona escopo: Equipe
3. Seleciona equipe (todos da filial, ou equipe específica)
4. Seleciona indicador
5. Define tipo (diária, semanal, mensal, etc.)
6. Define período (data início e fim)
7. Define valor-alvo
8. Define peso (0.1-10.0)
9. Opcional: observações
10. Sistema lista vendedores afetados (preview)
11. Gerente confirma
12. Sistema valida:
    - Vendedores ativos
    - Indicador ativo
    - Período válido
    - Sem sobreposição (ou trata conflitos)
13. Sistema cria uma meta para cada vendedor
14. Sistema notifica todos os vendedores (push + e-mail)
15. Sistema registra auditoria (operação em lote)
16. Sistema emite eventos `goal.created` (um por meta)
17. Sistema exibe relatório: X criadas, Y falhas

### Fluxos Alternativos

**A1 — Alguns vendedores já têm meta sobreposta:**
- Sistema lista conflitos
- Gerente decide: pular, substituir, ou somar

**A2 — Vendedor desativado no meio do lote:**
- Sistema pula e registra no relatório

**A3 — Indicador inativo:**
- Bloqueia, exige ativar primeiro

### Critérios de Aceite
- [ ] Preview de vendedores afetados
- [ ] Tratamento de conflitos
- [ ] Relatório de criação
- [ ] Notificação para todos
- [ ] Auditoria em lote

---

## UC-030 — Atribuir metas individuais

**Ator Principal:** Gerente
**Pré-condição:** Permissão `goals.create`.

### Fluxo Principal
1. Gerente acessa Metas > Nova Meta > Individual
2. Seleciona vendedor
3. Seleciona indicador
4. Define tipo, período, valor, peso
5. Opcional: observações
6. Salva
7. Sistema valida
8. Sistema cria com versionamento
9. Sistema notifica vendedor
10. Sistema registra auditoria

### Critérios de Aceite
- [ ] Validações de vendedor, indicador, período
- [ ] Detecção de sobreposição
- [ ] Notificação ao vendedor
- [ ] Versionamento
- [ ] Auditoria

---

## UC-031 — Criar campanhas comerciais

**Ator Principal:** Gerente
**Pré-condição:** Permissão `campaigns.create`.

### Fluxo Principal
1. Gerente acessa Campanhas > Nova
2. Preenche dados básicos (nome, descrição, objetivo, período)
3. Seleciona indicadores com pesos
4. Seleciona participantes
5. Configura premiações
6. Opcional: configura regras (Rule Builder)
7. Opcional: upload de imagem
8. Salva como rascunho OU ativa
9. Sistema valida
10. Sistema persiste
11. Sistema registra auditoria
12. Se ativa: notifica participantes, emite evento

### Critérios de Aceite
- [ ] Múltiplos indicadores com pesos
- [ ] Múltiplas premiações
- [ ] Rule Builder funcional
- [ ] Imagem opcional
- [ ] Rascunho vs Ativa
- [ ] Notificação se ativa

---

## UC-032 — Configurar premiações

**Ator Principal:** Gerente
**Pré-condição:** Campanha existe, permissão `campaigns.update`.

### Fluxo Principal
1. Gerente acessa campanha > Premiações
2. Adiciona premiações:
   - Tipo (medalha, troféu, pontos, brinde, dinheiro, viagem)
   - Critério (1º lugar, 2º, 3º, % da meta, valor absoluto)
   - Valor/descrição
3. Salva
4. Sistema valida
5. Sistema registra auditoria

### Critérios de Aceite
- [ ] Múltiplos tipos
- [ ] Múltiplos critérios
- [ ] Auditoria

---

## UC-033 — Visualizar dashboard da equipe

**Ator Principal:** Gerente
**Pré-condição:** Permissão `dashboard.team`.

### Fluxo Principal
1. Gerente acessa Dashboard > Equipe
2. Sistema exibe:
   - KPIs consolidados da equipe
   - Ranking completo da equipe
   - Vendedores abaixo da meta
   - Vendedores destaque
   - Aprovações pendentes (se houver)
3. Atualização em tempo real

### Critérios de Aceite
- [ ] KPIs da equipe
- [ ] Ranking completo
- [ ] Identificação de baixa performance
- [ ] Aprovações pendentes
- [ ] Atualização em tempo real

---

## UC-034 — Aprovar resultados lançados

**Ator Principal:** Gerente
**Pré-condição:** Permissão `results.approve`.

### Fluxo Principal
1. Gerente acessa Dashboard > Aprovações Pendentes
2. Sistema lista resultados pendentes
3. Gerente visualiza detalhes (vendedor, indicador, valor, anexos)
4. Gerente aprova ou rejeita
5. Se rejeita: informa justificativa
6. Sistema atualiza status
7. Sistema recalcula ranking
8. Sistema notifica vendedor
9. Sistema registra auditoria
10. Sistema emite evento `result.approved` ou `result.rejected`

### Critérios de Aceite
- [ ] Lista de pendentes
- [ ] Detalhes completos
- [ ] Aprovação/rejeição com motivo
- [ ] Notificação ao vendedor
- [ ] Auditoria

---

## UC-035 — Consultar ranking da equipe

**Ator Principal:** Gerente
**Pré-condição:** Permissão `ranking.read`.

### Fluxo Principal
1. Gerente acessa Ranking > Equipe
2. Sistema exibe ranking dos vendedores da equipe
3. Mostra: posição, vendedor, pontuação, % meta, tendência
4. Gerente pode filtrar por período
5. Gerente pode exportar

### Critérios de Aceite
- [ ] Ranking da equipe
- [ ] Filtros de período
- [ ] Exportação
- [ ] Tendência visual

---

## UC-036 — Enviar notificações para equipe

**Ator Principal:** Gerente
**Pré-condição:** Permissão `notifications.send`.

### Fluxo Principal
1. Gerente acessa Notificações > Enviar
2. Seleciona destinatários (equipe, filial, indivíduos)
3. Escreve título e mensagem
4. Seleciona canais (sistema, e-mail, push)
5. Envia
6. Sistema entrega a todos
7. Sistema registra auditoria

### Critérios de Aceite
- [ ] Seleção de destinatários
- [ ] Múltiplos canais
- [ ] Auditoria

---

## UC-037 — Gerar relatórios de desempenho

**Ator Principal:** Gerente
**Pré-condição:** Permissão `reports.generate`.

### Fluxo Principal
1. Gerente acessa Relatórios > Desempenho
2. Seleciona filtros (período, vendedores, indicadores)
3. Seleciona formato (PDF, Excel, Tela)
4. Clica em Gerar
5. Sistema coleta dados
6. Sistema formata
7. Sistema gera arquivo
8. Download ou exibição

### Critérios de Aceite
- [ ] Múltiplos filtros
- [ ] Formatos PDF, Excel, Tela
- [ ] Logo da empresa
- [ ] Performance < 10s

---

## UC-038 — Consultar IA para insights gerenciais

**Ator Principal:** Gerente
**Pré-condição:** Permissão `ai.query`.

### Fluxo Principal
1. Gerente acessa IA > Insights
2. Sistema exibe insights automáticos (diários)
3. Gerente pode fazer perguntas no chat:
   - "Por que a Loja X vendeu menos?"
   - "Quem tem maior chance de bater a meta?"
4. Sistema usa RAG para buscar contexto
5. Sistema envia para LLM (GPT-4o ou Claude)
6. Sistema exibe resposta
7. Sistema registra interação (custo, tokens)
8. Gerente pode dar feedback (útil/não útil)

### Critérios de Aceite
- [ ] Insights automáticos diários
- [ ] Chat interativo
- [ ] Respostas baseadas em dados reais (RAG)
- [ ] Registro de custo
- [ ] Feedback mechanism

---

# Capítulo 7 — UCs do Supervisor

O Supervisor atua como camada intermediária entre Gerente e Vendedor, com foco em acompanhamento operacional do grupo sob sua supervisão.

---

## UC-039 — Acompanhar metas do grupo supervisionado

**Ator Principal:** Supervisor
**Pré-condição:** Permissão `goals.read` (escopo grupo).

### Fluxo Principal
1. Supervisor acessa Metas > Meu Grupo
2. Sistema exibe metas dos vendedores sob supervisão
3. Mostra: vendedor, indicador, meta, progresso, status
4. Supervisor pode filtrar por vendedor, indicador, período
5. Supervisor pode ver detalhes de cada meta

### Critérios de Aceite
- [ ] Apenas metas do grupo supervisionado
- [ ] Filtros
- [ ] Detalhes por meta

---

## UC-040 — Lançar resultados em lote

**Ator Principal:** Supervisor
**Pré-condição:** Permissão `results.create` (escopo grupo).

### Fluxo Principal
1. Supervisor acessa Resultados > Lançar em Lote
2. Seleciona data
3. Seleciona equipe ou vendedores
4. Sistema exibe grid: vendedores × indicadores
5. Supervisor preenche valores
6. Sistema valida célula por célula
7. Supervisor clica em Salvar Lote
8. Sistema cria resultados para cada vendedor
9. Sistema exibe relatório: X criados, Y falhas
10. Sistema registra auditoria

### Critérios de Aceite
- [ ] Grid vendedores × indicadores
- [ ] Validação célula por célula
- [ ] Relatório de lote
- [ ] Auditoria

---

## UC-041 — Visualizar dashboard do grupo

**Ator Principal:** Supervisor
**Pré-condição:** Permissão `dashboard.group`.

### Fluxo Principal
1. Supervisor acessa Dashboard > Grupo
2. Sistema exibe KPIs do grupo
3. Mostra ranking do grupo
4. Mostra vendedores precisando atenção
5. Atualização em tempo real

### Critérios de Aceite
- [ ] KPIs do grupo
- [ ] Ranking do grupo
- [ ] Identificação de atenção
- [ ] Tempo real

---

## UC-042 — Consultar histórico de vendedores

**Ator Principal:** Supervisor
**Pré-condição:** Permissão `users.read` (escopo grupo).

### Fluxo Principal
1. Supervisor acessa vendedor > Histórico
2. Sistema exite evolução do vendedor
3. Mostra: resultados por período, gráficos, tendência
4. Supervisor pode filtrar período
5. Supervisor pode exportar

### Critérios de Aceite
- [ ] Histórico completo
- [ ] Gráficos de evolução
- [ ] Filtros de período
- [ ] Exportação

---

## UC-043 — Reportar feedback ao gerente

**Ator Principal:** Supervisor
**Pré-condição:** Permissão `feedback.send`.

### Fluxo Principal
1. Supervisor acessa Feedback > Novo
2. Seleciona vendedor
3. Escreve observação qualitativa
4. Categoriza: ponto forte, melhoria, behavior
5. Envia
6. Sistema notifica gerente
7. Sistema registra

### Critérios de Aceite
- [ ] Seleção de vendedor
- [ ] Categorização
- [ ] Notificação ao gerente
- [ ] Registro

---

## UC-044 — Aprovar resultados pendentes do grupo

**Ator Principal:** Supervisor
**Pré-condição:** Permissão `results.approve` (escopo grupo).

### Fluxo Principal
1. Supervisor acessa Aprovações Pendentes
2. Sistema lista resultados pendentes do grupo
3. Supervisor revisa detalhes
4. Aprova ou rejeita com motivo
5. Sistema atualiza status
6. Sistema recalcula ranking
7. Sistema notifica vendedor
8. Sistema registra auditoria

### Critérios de Aceite
- [ ] Apenas pendentes do grupo
- [ ] Detalhes completos
- [ ] Aprovação/rejeição
- [ ] Notificação
- [ ] Auditoria

---

# Capítulo 8 — UCs do Vendedor

O Vendedor é o usuário final do sistema, com acesso apenas aos seus próprios dados. A interface é otimizada para simplicidade e mobile-first, permitindo uso no celular durante o expediente.

---

## UC-045 — Visualizar dashboard pessoal

**Ator Principal:** Vendedor
**Pré-condição:** Vendedor autenticado.

### Fluxo Principal
1. Vendedor faz login
2. Sistema exibe dashboard pessoal:
   - 4 cards de KPIs do dia
   - Gráfico de evolução
   - Ranking top 5 com sua posição
   - Próximas ações
3. Cores indicam status (verde/amarelo/vermelho)
4. Atualização em tempo real (polling 30s ou WebSocket)
5. Vendedor pode personalizar layout (se permitido)

### Critérios de Aceite
- [ ] 4 cards de KPI
- [ ] Cores de status
- [ ] Gráfico de evolução
- [ ] Ranking com destaque do próprio
- [ ] Próximas ações
- [ ] Tempo real

---

## UC-046 — Consultar metas do dia/semana/mês

**Ator Principal:** Vendedor
**Pré-condição:** Autenticado.

### Fluxo Principal
1. Vendedor acessa Metas
2. Sistema exibe abas: Dia, Semana, Mês
3. Para cada período, mostra:
   - Indicador
   - Valor atual
   - Meta
   - Percentual
   - Quanto falta
4. Vendedor pode alternar entre períodos
5. Vendedor pode ver detalhes de cada meta

### Critérios de Aceite
- [ ] Múltiplos períodos
- [ ] Cálculo de percentual
- [ ] Cálculo de quanto falta
- [ ] Detalhes por meta

---

## UC-047 — Lançar resultado diário

**Ator Principal:** Vendedor
**Pré-condição:** Vendedor autenticado. Meta ativa para o indicador no dia.

### Fluxo Principal
1. Vendedor acessa Lançar Resultado (botão de ação rápida)
2. Sistema exibe formulário com indicadores do dia (apenas os atribuídos)
3. Para cada indicador, vendedor digita valor
4. Sistema calcula percentual da meta em tempo real
5. Vendedor pode adicionar observação (texto)
6. Vendedor pode anexar comprovante (foto)
7. Vendedor pode gravar áudio (observação por voz)
8. Vendedor clica em Salvar
9. Sistema valida via Zod
10. Sistema verifica se indicador exige aprovação
11. Se exige: marca como "pending_approval", notifica supervisor
12. Se não exige: marca como "approved"
13. Sistema persiste
14. Sistema recalcula ranking
15. Sistema registra auditoria
16. Sistema emite evento `result.created`
17. Sistema dispara webhooks configurados
18. Sistema exibe sucesso
19. Sistema redireciona para dashboard

### Fluxos Alternativos

**A1 — Valor > 200% da meta:**
- Sistema alerta
- Pede justificativa
- Permite salvar com justificativa

**A2 — Valor fora de range configurado:**
- Sistema alerta
- Permite salvar com justificativa

**A3 — Indicador exige aprovação:**
- Marca como pendente
- Notifica supervisor/gerente
- Vendedor vê status "Pendente"

**A4 — Já existe resultado para o dia:**
- Sistema detecta duplicata
- Pergunta: sobrescrever, somar, ou cancelar

**A5 — Sistema offline (PWA):**
- Salva localmente (IndexedDB)
- Sincroniza quando volta conexão
- Alerta se conflito

**A6 — Anexo muito grande:**
- Valida tamanho (máx 5MB)
- Exige formato (JPG, PNG, PDF)

### Critérios de Aceite
- [ ] Apenas indicadores atribuídos aparecem
- [ ] Cálculo em tempo real
- [ ] Validação Zod
- [ ] Detecção de duplicata
- [ ] Suporte a anexos
- [ ] Suporte a áudio
- [ ] Funciona offline
- [ ] Auditoria
- [ ] Evento emitido
- [ ] Webhooks disparados
- [ ] Tempo < 2s

---

## UC-048 — Visualizar ranking individual

**Ator Principal:** Vendedor
**Pré-condição:** Autenticado.

### Fluxo Principal
1. Vendedor acessa Ranking
2. Sistema exibe sua posição em múltiplos períodos:
   - Diário
   - Semanal
   - Mensal
3. Mostra: posição, pontuação, distância para líderes
4. Mostra tendência (subiu/caiu/estável)
5. Vendedor pode ver ranking completo da equipe

### Critérios de Aceite
- [ ] Múltiplos períodos
- [ ] Distância para líderes
- [ ] Tendência visual
- [ ] Ranking completo da equipe

---

## UC-049 — Consultar histórico próprio

**Ator Principal:** Vendedor
**Pré-condição:** Autenticado.

### Fluxo Principal
1. Vendedor acessa Histórico
2. Sistema exibe gráficos de evolução
3. Períodos: 7 dias, 30 dias, 3 meses, 12 meses
4. Mostra: faturamento, indicadores, ranking ao longo do tempo
5. Comparativo com período anterior
6. Vendedor pode exportar (PDF, Excel)

### Critérios de Aceite
- [ ] Múltiplos períodos
- [ ] Gráficos de evolução
- [ ] Comparativo
- [ ] Exportação

---

## UC-050 — Participar de campanhas

**Ator Principal:** Vendedor
**Pré-condição:** Autenticado, campanhas ativas onde é participante.

### Fluxo Principal
1. Vendedor acessa Campanhas
2. Sistema lista campanhas ativas onde é participante
3. Para cada campanha:
   - Nome, período, indicadores, premiações
   - Sua posição no ranking da campanha
   - Distância para líderes
4. Vendedor pode ver detalhes
5. Vendedor acompanha progresso automaticamente (ao lançar resultados)

### Critérios de Aceite
- [ ] Apenas campanhas onde é participante
- [ ] Ranking da campanha
- [ ] Detalhes completos
- [ ] Acompanhamento automático

---

## UC-051 — Receber notificações

**Ator Principal:** Vendedor
**Pré-condição:** Autenticado.

### Fluxo Principal
1. Vendedor recebe notificações:
   - Push (se PWA instalado)
   - No sistema (badge no sino)
   - E-mail (se configurado)
2. Tipos: meta atingida, campanha começou, premiação recebida, aprovação pendente
3. Vendedor clica no sino
4. Sistema exibe lista
5. Vendedor marca como lida

### Critérios de Aceite
- [ ] Múltiplos canais
- [ ] Lista de notificações
- [ ] Marcar como lida
- [ ] Contador de não lidas

---

## UC-052 — Consultar premiações recebidas

**Ator Principal:** Vendedor
**Pré-condição:** Autenticado.

### Fluxo Principal
1. Vendedor acessa Perfil > Premiações
2. Sistema exibe galeria: medalhas, troféus, pontos
3. Mostra: data, campanha, tipo, descrição
4. Estatísticas: total, por tipo, ao longo do tempo

### Critérios de Aceite
- [ ] Galeria visual
- [ ] Estatísticas
- [ ] Filtros por tipo

---

## UC-053 — Atualizar perfil

**Ator Principal:** Vendedor
**Pré-condição:** Autenticado.

### Fluxo Principal
1. Vendedor acessa Perfil
2. Pode editar: foto, telefone, celular
3. Pode alterar senha (informando atual)
4. Pode ativar/desativar 2FA (se não Admin obrigatório)
5. Pode configurar preferências (tema, idioma, notificações)
6. Salva
7. Sistema valida
8. Sistema registra auditoria

### Critérios de Aceite
- [ ] Edição de dados pessoais
- [ ] Alteração de senha com validação
- [ ] 2FA management
- [ ] Preferências
- [ ] Auditoria

---

## UC-054 — Consultar IA para sugestões pessoais

**Ator Principal:** Vendedor
**Pré-condição:** Autenticado, permissão `ai.query` (pessoal).

### Fluxo Principal
1. Vendedor acessa IA Coach (se disponível)
2. Faz perguntas:
   - "Como posso melhorar meu ticket médio?"
   - "Vou bater a meta este mês?"
3. Sistema usa RAG com dados do vendedor
4. Sistema envia para LLM
5. Sistema exibe resposta personalizada
6. Sistema registra interação (custo)

### Critérios de Aceite
- [ ] Chat pessoal
- [ ] Respostas baseadas em dados próprios
- [ ] Sem enviar dados pessoais (CPF, e-mail) à IA
- [ ] Registro de custo

---

# Capítulo 9 — UCs Transversais

Estes casos de uso aplicam-se a todos os atores autenticados no sistema, independentemente de seu cargo. Incluem autenticação, recuperação de senha, preferências pessoais e direitos LGPD.

---

## UC-055 — Autenticar no sistema (login/logout)

**Ator Principal:** Qualquer ator
**Pré-condição:** Sistema ativo. Conta de usuário existente e ativa.

### Fluxo Principal — Login
1. Usuário acessa tela de login (admin.suaempresa.com ou app.suaempresa.com conforme perfil)
2. Sistema exibe formulário: login + senha
3. Usuário informa login (e-mail, matrícula, CPF ou username)
4. Usuário informa senha
5. Usuário clica em Entrar
6. Sistema valida credenciais
7. Sistema verifica se conta não está bloqueada
8. Sistema verifica se conta está ativa
9. Sistema verifica se 2FA está habilitado
10. Se 2FA: solicita código TOTP
11. Usuário digita código
12. Sistema valida TOTP (janela de 30s, aceita anterior + atual)
13. Sistema cria sessão JWT (access token 15min + refresh token 7d)
14. Sistema registra último acesso
15. Sistema emite evento `user.login`
16. Sistema redireciona para dashboard conforme cargo
17. Se senha temporária: redireciona para tela de troca de senha

### Fluxo Principal — Logout
1. Usuário clica em Sair
2. Sistema revoga tokens (access + refresh)
3. Sistema adiciona à blacklist Redis (TTL = expiração)
4. Sistema registra auditoria
5. Sistema redireciona para login

### Fluxos Alternativos

**A1 — 5 tentativas inválidas:**
- Conta bloqueada por 15 minutos
- Notificação ao administrador
- Exibe: "Conta bloqueada. Tente em X minutos."

**A2 — 10 tentativas em 24h:**
- Conta bloqueada por 24 horas
- Notifica admin
- Exige reset de senha

**A3 — 2FA habilitado:**
- Após senha correta, solicita TOTP
- Se código inválido: conta como tentativa inválida

**A4 — Login via Google/Microsoft (OAuth):**
- Redireciona para provedor
- Recebe code, troca por token
- Busca e-mail
- Se existe no Orion: cria sessão
- Se não existe: bloqueia

**A5 — Primeiro login (senha temporária):**
- Detecta senha temporária
- Redireciona para troca de senha
- Só libera após troca

**A6 — Login offline (PWA):**
- Se já autenticado antes: permite acesso com cached credentials
- Sincroniza quando volta conexão

### Critérios de Aceite
- [ ] Login aceita e-mail, matrícula, CPF ou username
- [ ] 5 tentativas → bloqueio 15min
- [ ] 10 tentativas em 24h → bloqueio 24h
- [ ] 2FA validado se habilitado
- [ ] Senha temporária exige troca
- [ ] OAuth funcional (Google, Microsoft)
- [ ] JWT gerado (15min access, 7d refresh)
- [ ] Auditoria registra login (IP, User-Agent)
- [ ] Logout revoga tokens imediatamente

---

## UC-056 — Recuperar senha

**Ator Principal:** Qualquer usuário
**Pré-condição:** Conta existe com e-mail cadastrado.

### Fluxo Principal
1. Usuário clica em "Esqueci minha senha"
2. Informa e-mail ou matrícula
3. Sistema verifica se usuário existe
4. Se existe: gera token único (UUID), válido 1h
5. Sistema envia e-mail com link contendo token
6. Sistema exibe: "Se o e-mail existir, você receberá instruções"
7. Usuário clica no link
8. Sistema valida token (existe, não expirado, não usado)
9. Usuário cadastra nova senha (2x)
10. Sistema valida política de senha
11. Sistema verifica não é igual às 5 últimas
12. Sistema criptografa (bcrypt)
13. Sistema invalida token (uso único)
14. Sistema revoga tokens antigos
15. Sistema registra auditoria
16. Sistema envia e-mail "Senha alterada"
17. Sistema redireciona para login

### Fluxos Alternativos

**A1 — E-mail não existe:**
- Exibe mesma mensagem (não revela)
- Não envia e-mail
- Previne enumeração

**A2 — Token expirado:**
- Exibe: "Link expirado"
- Botão: "Solicitar novo link"

**A3 — Token já usado:**
- Exibe: "Link já utilizado"
- Botão: "Solicitar novo link"

**A4 — Nova senha igual à atual:**
- Bloqueia
- Exige senha diferente

### Critérios de Aceite
- [ ] Token único (UUID)
- [ ] Token expira em 1h
- [ ] Token de uso único
- [ ] Não revela se e-mail existe
- [ ] Nova senha segue política
- [ ] Nova senha diferente das 5 últimas
- [ ] Tokens antigos revogados
- [ ] E-mail de confirmação enviado
- [ ] Auditoria registra

---

## UC-057 — Configurar preferências pessoais

**Ator Principal:** Qualquer usuário autenticado
**Pré-condição:** Autenticado.

### Fluxo Principal
1. Usuário acessa Perfil > Preferências
2. Configura:
   - Tema (claro, escuro, seguir sistema)
   - Idioma (se multi-idioma)
   - Layout do dashboard
   - Notificações (quais tipos, quais canais)
3. Salva
4. Sistema aplica imediatamente
5. Sistema persiste por usuário

### Critérios de Aceite
- [ ] Tema claro/escuro
- [ ] Idioma pessoal (sobrepõe empresa)
- [ ] Layout personalizado
- [ ] Preferências de notificação
- [ ] Aplicação imediata

---

## UC-058 — Solicitar exportação de dados pessoais (LGPD)

**Ator Principal:** Qualquer usuário
**Pré-condição:** Autenticado, 2FA obrigatório.

### Fluxo Principal
1. Usuário acessa Perfil > Meus Dados > Exportar
2. Sistema exige 2FA
3. Usuário confirma
4. Sistema coleta TODOS os dados pessoais:
   - Dados cadastrais
   - Histórico de resultados
   - Metas atribuídas
   - Notificações recebidas
   - Logs de auditoria próprios
5. Sistema gera pacote JSON estruturado
6. Sistema compacta em ZIP
7. Sistema disponibiliza link (válido 24h)
8. Sistema notifica por e-mail
9. Sistema registra auditoria (direito LGPD)

### Critérios de Aceite
- [ ] 2FA obrigatório
- [ ] Coleta completa de dados pessoais
- [ ] Formato JSON estruturado
- [ ] Link expira em 24h
- [ ] Auditoria registra (LGPD)
- [ ] Notificação por e-mail

---

## UC-059 — Solicitar anonimização de dados pessoais (LGPD)

**Ator Principal:** Qualquer usuário
**Pré-condição:** Autenticado, 2FA obrigatório.

### Fluxo Principal
1. Usuário acessa Perfil > Meus Dados > Anonimizar
2. Sistema exibe WARNING: "Seus dados pessoais serão anonimizados. Dados comerciais agregados serão preservados. Operação irreversível."
3. Sistema exige 2FA
4. Sistema exige confirmação dupla (digitar "ANONIMIZAR")
5. Usuário confirma
6. Sistema anonimiza:
   - Nome → "USER_HASH_a1b2c3"
   - CPF → null
   - E-mail → null
   - Telefone → null
   - Foto → removida
7. Sistema preserva:
   - Resultados comerciais (associados ao hash)
   - Metas (associadas ao hash)
   - Ranking histórico (associado ao hash)
8. Sistema revoga todos os tokens
9. Sistema registra auditoria (direito LGPD)
10. Sistema notifica por e-mail (último)
11. Usuário não pode mais acessar o sistema

### Critérios de Aceite
- [ ] 2FA obrigatório
- [ ] Confirmação dupla
- [ ] Anonimiza dados pessoais (irreversível)
- [ ] Preserva dados comerciais (anônimos)
- [ ] Revoga tokens
- [ ] Auditoria registra (LGPD)
- [ ] Última notificação por e-mail

---

# Capítulo 10 — Matriz Ator × UC

A tabela abaixo apresenta a matriz cruzada entre atores e casos de uso. **R** = Responsável (executa), **C** = Consultado (pode visualizar), **I** = Informado (recebe notificação), **—** = Sem acesso.

| UC | Admin Master | Admin Empresa | Diretor | Gerente | Supervisor | Vendedor |
|----|--------------|---------------|---------|---------|------------|----------|
| UC-001 Ativar licença | R | — | — | — | — | — |
| UC-002 Configurar instalação | R | C | — | — | — | — |
| UC-003 Gerenciar módulos | R | — | — | — | — | — |
| UC-004 Aplicar atualizações | R | I | — | — | — | — |
| UC-005 Backup e restauração | R | — | — | — | — | — |
| UC-006 Parâmetros globais | R | — | — | — | — | — |
| UC-007 Auditoria global | R | — | — | — | — | — |
| UC-008 Integrações externas | R | — | — | — | — | — |
| UC-009 Revogar sessões | R | C | — | — | — | — |
| UC-010 Reiniciar serviços | R | — | — | — | — | — |
| UC-011 Cadastrar empresa | — | R | C | — | — | — |
| UC-012 Cadastrar filiais | — | R | I | C | — | — |
| UC-013 Departamentos | — | R | — | C | — | — |
| UC-014 Cadastrar cargos | — | R | C | C | — | — |
| UC-015 Cadastrar usuários | — | R | I | C | — | — |
| UC-016 Permissões a cargos | — | R | C | C | — | — |
| UC-017 Configurar indicadores | — | R | C | C | I | I |
| UC-018 Categorias de indicadores | — | R | C | C | I | — |
| UC-019 Temas e identidade | — | R | C | — | — | — |
| UC-020 Idiomas e moeda | — | R | C | — | — | — |
| UC-021 Regras de cálculo | — | R | C | C | — | — |
| UC-022 Exportar dados empresa | — | R | I | — | — | — |
| UC-023 Dashboard executivo | — | C | R | I | — | — |
| UC-024 Comparar filiais | — | C | R | I | — | — |
| UC-025 Ranking geral da rede | — | C | R | I | — | — |
| UC-026 Relatórios estratégicos | — | C | R | I | — | — |
| UC-027 Aprovar metas corporativas | — | — | R | I | — | — |
| UC-028 Auditoria de gestores | — | — | R | C | — | — |
| UC-029 Cadastrar metas (equipe) | — | — | I | R | C | I |
| UC-030 Metas individuais | — | — | I | R | C | I |
| UC-031 Criar campanhas | — | — | I | R | I | I |
| UC-032 Configurar premiações | — | — | I | R | I | I |
| UC-033 Dashboard da equipe | — | C | C | R | C | — |
| UC-034 Aprovar resultados | — | — | — | R | C | I |
| UC-035 Ranking da equipe | — | C | C | R | C | — |
| UC-036 Notificações para equipe | — | C | C | R | C | I |
| UC-037 Relatórios de desempenho | — | C | C | R | C | — |
| UC-038 Consultar IA (gerencial) | — | C | C | R | C | — |
| UC-039 Metas do grupo | — | — | — | C | R | — |
| UC-040 Lançar em lote | — | — | — | C | R | I |
| UC-041 Dashboard do grupo | — | — | — | C | R | — |
| UC-042 Histórico de vendedores | — | — | — | C | R | — |
| UC-043 Feedback ao gerente | — | — | — | I | R | — |
| UC-044 Aprovar pendentes do grupo | — | — | — | I | R | I |
| UC-045 Dashboard pessoal | — | — | — | — | — | R |
| UC-046 Metas do dia/semana/mês | — | — | — | — | — | R |
| UC-047 Lançar resultado | — | — | — | I | C | R |
| UC-048 Ranking individual | — | — | — | — | — | R |
| UC-049 Histórico próprio | — | — | — | — | — | R |
| UC-050 Participar de campanhas | — | — | — | — | — | R |
| UC-051 Receber notificações | — | — | — | — | — | R |
| UC-052 Premiações recebidas | — | — | — | — | — | R |
| UC-053 Atualizar perfil | R | R | R | R | R | R |
| UC-054 IA sugestões pessoais | — | — | — | — | — | R |
| UC-055 Autenticar (login/logout) | R | R | R | R | R | R |
| UC-056 Recuperar senha | R | R | R | R | R | R |
| UC-057 Preferências pessoais | R | R | R | R | R | R |
| UC-058 Exportar dados (LGPD) | R | R | R | R | R | R |
| UC-059 Anonimizar dados (LGPD) | R | R | R | R | R | R |

---

# Capítulo 11 — Dependências entre UCs

As dependências `<<includes>>` e `<<extends>>` entre casos de uso são listadas abaixo. Esta análise orienta a ordem de desenvolvimento e identifica oportunidades de reutilização:

## 11.1 Dependências <<includes>>

Um UC `<<includes>>` outro quando SEMPRE executa o outro como parte de seu fluxo:

- UC-002 (Configurar instalação) `<<includes>>` UC-001 (Ativar licença)
  - Não pode configurar instalação sem licença ativa
- UC-004 (Aplicar atualizações) `<<includes>>` UC-005 (Backup automático pré-atualização)
  - Backup é obrigatório antes de atualizar
- UC-029 (Cadastrar metas em lote) `<<includes>>` UC-017 (Configurar indicadores pré-existentes)
  - Não pode criar meta sem indicador
- UC-031 (Criar campanhas) `<<includes>>` UC-017 (Indicadores configurados)
  - Campanha precisa de indicadores
- UC-034 (Aprovar resultados) `<<includes>>` UC-047 (Lançar resultado)
  - Não há o que aprovar sem lançamento
- UC-038 (Consultar IA gerencial) `<<includes>>` UC-033 (Dashboard da equipe — fornece contexto)
  - IA usa dados do dashboard
- UC-058 (Exportar dados LGPD) `<<includes>>` UC-055 (Autenticar com 2FA obrigatório)
  - Operação LGPD exige 2FA
- UC-059 (Anonimizar dados LGPD) `<<includes>>` UC-055 (Autenticar com 2FA) + UC-005 (Backup pré-operação)
  - Operação irreversível exige 2FA e backup

## 11.2 Dependências <<extends>>

Um UC `<<extends>>` outro quando é OPCIONAL e condicional:

- UC-054 (IA sugestões pessoais) `<<extends>>` UC-045 (Dashboard pessoal)
  - IA é opcional, acessível do dashboard
- UC-040 (Lançar em lote) `<<extends>>` UC-047 (Lançar resultado)
  - Lote é alternativa ao lançamento individual
- UC-032 (Configurar premiações) `<<extends>>` UC-031 (Criar campanhas)
  - Premiações são opcionais na criação
- UC-027 (Aprovar metas corporativas) `<<extends>>` UC-029 (Cadastrar metas)
  - Aprovação é necessária apenas para metas corporativas

## 11.3 Ordem de Desenvolvimento Recomendada

Baseado nas dependências, ordem ótima de desenvolvimento:

1. **UC-055** (Autenticar) — base de tudo
2. **UC-001** (Ativar licença) — sem isso nada funciona
3. **UC-002** (Configurar instalação) — depende de 001
4. **UC-011** (Cadastrar empresa) — depende de 002
5. **UC-012** (Cadastrar filiais) — depende de 011
6. **UC-014** (Cadastrar cargos) — depende de 011
7. **UC-015** (Cadastrar usuários) — depende de 012 e 014
8. **UC-017** (Configurar indicadores) — depende de 011
9. **UC-029/030** (Cadastrar metas) — depende de 015 e 017
10. **UC-047** (Lançar resultado) — depende de 029/030
11. **UC-045** (Dashboard pessoal) — depende de 047
12. **UC-033** (Dashboard equipe) — depende de 047
13. **UC-034** (Aprovar resultados) — depende de 047
14. **UC-031** (Criar campanhas) — depende de 017
15. Demais UCs em paralelo

---

# Capítulo 12 — Conclusão e Próximos Passos

Os 59 casos de uso detalhados neste documento cobrem integralmente o escopo da Versão 1.0 do Projeto Orion. Cada UC fornece base suficiente para:

1. **Desenvolvimento das telas** pelo time de frontend
2. **Implementação das APIs** pelo time de backend
3. **Escrita de testes funcionais** automatizados pelo QA
4. **Validação de aceitação** pelo Product Owner

A matriz ator × UC (Capítulo 10) permite validação cruzada de que nenhum ator ficou sem funcionalidade essencial e que nenhum UC está sem responsável claro. As dependências (Capítulo 11) orientam o planejamento de sprints, identificando quais UCs devem ser desenvolvidos primeiro por serem pré-requisitos de outros.

## 12.1 Cobertura de Requisitos

Cada UC mapeia para um ou mais Requisitos Funcionais (RF) do Documento 03 (PRD):

| UC | RFs Cobertos |
|----|--------------|
| UC-011 | RF-001, RF-006, RF-007, RF-008 |
| UC-012 | RF-002, RF-003, RF-004 |
| UC-015 | RF-013, RF-014, RF-015, RF-018, RF-019 |
| UC-017 | RF-036, RF-037, RF-038, RF-040, RF-041 |
| UC-029 | RF-061, RF-062, RF-063, RF-066 |
| UC-047 | RF-086, RF-087, RF-088, RF-094 |
| UC-031 | RF-126, RF-127, RF-128, RF-136 |
| UC-055 | RF-028, RF-029 |

## 12.2 Próximos Passos

No próximo documento do Dossiê Master — **Documento 09: UX/UI Design System** — iniciaremos o detalhamento visual do sistema: wireframes das telas principais, fluxos de navegação, componentes reutilizáveis, padrões de design, paleta de cores, tipografia, ícones, microinterações e especificações de responsividade para desktop, tablet e mobile.

Os UCs deste documento servem como input direto para:
- **Wireframes** (Doc 18): cada UC terá tela(s) correspondente(s)
- **Casos de Teste** (Doc 14): cada UC terá cenários de teste
- **API Specification** (Doc 10): cada UC com interação backend terá endpoints
- **Manual do Usuário** (Doc 19): cada UC terá instruções para usuário final
