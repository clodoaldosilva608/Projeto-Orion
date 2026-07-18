/**
 * Seed do Projeto Orion — NOVA VISÃO SaaS Platform
 * Cliente, Aplicações, Licenças, Pagamentos, Downloads, Suporte
 */
import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Iniciando seed do Orion SaaS Platform...')

  // Limpar
  console.log('  Limpando dados antigos...')
  await db.auditLog.deleteMany()
  await db.notification.deleteMany()
  await db.ticketMessage.deleteMany()
  await db.supportTicket.deleteMany()
  await db.download.deleteMany()
  await db.payment.deleteMany()
  await db.license.deleteMany()
  await db.appUpdate.deleteMany()
  await db.application.deleteMany()
  await db.customer.deleteMany()

  // 1. Criar clientes
  console.log('  Criando clientes...')
  const customers = [
    {
      name: 'Maria Santos',
      email: 'maria@farmaciasaojoao.com.br',
      company: 'Farmácia São João LTDA',
      niche: 'Farmácia',
      phone: '(11) 3333-4444',
      status: 'active',
      mfaEnabled: true,
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      name: 'João Pereira',
      email: 'joao@supermercadoexpress.com.br',
      company: 'Supermercado Express',
      niche: 'Varejo',
      phone: '(11) 3333-5555',
      status: 'active',
      mfaEnabled: false,
    },
    {
      name: 'Carla Mendes',
      email: 'carla@lojaestilo.com.br',
      company: 'Loja Estilo',
      niche: 'Moda',
      phone: '(21) 2222-6666',
      status: 'active',
      mfaEnabled: true,
    },
    {
      name: 'Rafael Costa',
      email: 'rafael@clinicavida.com.br',
      company: 'Clínica Vida',
      niche: 'Saúde',
      phone: '(31) 3111-7777',
      status: 'suspended',
      mfaEnabled: false,
    },
    {
      name: 'Beatriz Lima',
      email: 'bia@construtoratop.com.br',
      company: 'Construtora Top',
      niche: 'Construção',
      phone: '(41) 4222-8888',
      status: 'active',
      mfaEnabled: true,
    },
  ]

  const customerRecords = []
  for (const c of customers) {
    const customer = await db.customer.create({ data: c })
    customerRecords.push(customer)
  }

  // 2. Criar aplicações
  console.log('  Criando aplicações...')
  const now = new Date()

  const apps = [
    {
      customerId: customerRecords[0].id,
      name: 'Farmácia Gestão Pro',
      description: 'Sistema completo de gestão para farmácias com controle de metas, indicadores e ranking',
      niche: 'Farmácia',
      objective: 'Substituir planilhas por sistema digital de gestão comercial',
      features: JSON.stringify(['dashboard', 'metas', 'ranking', 'campanhas', 'gamificacao', 'ia']),
      version: '2.3.1',
      status: 'published',
      complexity: 'high',
      artifactUrl: 's3://orion-artifacts/farmacia-gestao-pro-2.3.1.exe',
      artifactSize: 157286400, // 150MB
      artifactHash: 'sha256:abc123def456',
      publishedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    },
    {
      customerId: customerRecords[0].id,
      name: 'Farmácia Estoque',
      description: 'Controle de estoque integrado para farmácias',
      niche: 'Farmácia',
      objective: 'Automatizar controle de estoque e validade',
      features: JSON.stringify(['estoque', 'validade', 'alertas', 'relatorios']),
      version: '1.2.0',
      status: 'development',
      complexity: 'medium',
    },
    {
      customerId: customerRecords[1].id,
      name: 'Super Express PDV',
      description: 'Ponto de venda completo para supermercados',
      niche: 'Varejo',
      objective: 'Modernizar PDV e integrar com gestão',
      features: JSON.stringify(['pdv', 'estoque', 'fiscal', 'relatorios']),
      version: '3.1.0',
      status: 'published',
      complexity: 'enterprise',
      artifactUrl: 's3://orion-artifacts/super-express-pdv-3.1.0.exe',
      artifactSize: 209715200, // 200MB
      artifactHash: 'sha256:def789ghi012',
      publishedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 dias atrás
    },
    {
      customerId: customerRecords[2].id,
      name: 'Estilo CRM',
      description: 'CRM para lojas de moda com gestão de clientes',
      niche: 'Moda',
      objective: 'Fidelizar clientes e aumentar ticket médio',
      features: JSON.stringify(['crm', 'fidelidade', 'campanhas', 'relatorios']),
      version: '1.0.0',
      status: 'homologation',
      complexity: 'medium',
    },
    {
      customerId: customerRecords[3].id,
      name: 'Clínica Vida Agendamento',
      description: 'Sistema de agendamento para clínicas',
      niche: 'Saúde',
      objective: 'Automatizar agendamentos e reduzir faltas',
      features: JSON.stringify(['agendamento', 'prontuario', 'lembretes']),
      version: '0.9.0',
      status: 'testing',
      complexity: 'high',
    },
    {
      customerId: customerRecords[4].id,
      name: 'Construtora Top Projetos',
      description: 'Gestão de projetos e obras para construtoras',
      niche: 'Construção',
      objective: 'Controlar obras e cronograma',
      features: JSON.stringify(['projetos', 'cronograma', 'financeiro', 'relatorios']),
      version: '1.5.2',
      status: 'published',
      complexity: 'high',
      artifactUrl: 's3://orion-artifacts/construtora-top-1.5.2.exe',
      artifactSize: 178257920, // 170MB
      artifactHash: 'sha256:ghi345jkl678',
      publishedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
    },
  ]

  const appRecords = []
  for (const app of apps) {
    const record = await db.application.create({ data: app })
    appRecords.push(record)
  }

  // 2b. Criar atualizações de aplicações (AppUpdate / versionamento)
  console.log('  Criando atualizações de aplicações...')
  const appUpdates = [
    {
      applicationId: appRecords[0].id,
      version: '2.3.1',
      type: 'security',
      changelog: 'Correção de vulnerabilidade no módulo de autenticação e reforço de criptografia dos tokens de sessão.',
      status: 'published',
      artifactHash: 'sha256:abc123def456',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      applicationId: appRecords[0].id,
      version: '2.4.0',
      type: 'feature',
      changelog: 'Novo módulo de gamificação com ranking de vendedores, medalhas e metas por equipe.',
      status: 'pending',
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      applicationId: appRecords[2].id,
      version: '3.1.0',
      type: 'improvement',
      changelog: 'Otimização de performance no PDV: emissão de cupom fiscal 40% mais rápida.',
      status: 'published',
      artifactHash: 'sha256:def789ghi012',
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      applicationId: appRecords[5].id,
      version: '1.5.2',
      type: 'fix',
      changelog: 'Correção no cálculo de cronograma de obras e ajuste de fuso horário em relatórios.',
      status: 'published',
      artifactHash: 'sha256:ghi345jkl678',
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const up of appUpdates) {
    await db.appUpdate.create({ data: up })
  }

  // 3. Criar licenças
  console.log('  Criando licenças...')
  const licenses = [
    {
      customerId: customerRecords[0].id,
      applicationId: appRecords[0].id,
      licenseKey: 'ORN-FSJ-2026-XXXX-AAAA-0001',
      plan: 'professional',
      status: 'active',
      duration: 365,
      maxUsers: 50,
      maxDevices: 3,
      maxApps: 5,
      storageMb: 5000,
      price: 18000,
      autoRenew: true,
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[1].id,
      applicationId: appRecords[2].id,
      licenseKey: 'ORN-EXP-2026-XXXX-BBBB-0002',
      plan: 'enterprise',
      status: 'active',
      duration: 365,
      maxUsers: 200,
      maxDevices: 10,
      maxApps: 20,
      storageMb: 20000,
      price: 60000,
      autoRenew: true,
      startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 305 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[2].id,
      licenseKey: 'ORN-EST-2026-TRIAL-CCCC-0003',
      plan: 'trial',
      status: 'active',
      duration: 15,
      maxUsers: 5,
      maxDevices: 1,
      maxApps: 1,
      storageMb: 500,
      price: 0,
      autoRenew: false,
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      trialEndsAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[3].id,
      licenseKey: 'ORN-CVD-2026-XXXX-DDDD-0004',
      plan: 'professional',
      status: 'suspended',
      duration: 365,
      maxUsers: 50,
      maxDevices: 3,
      maxApps: 5,
      storageMb: 5000,
      price: 18000,
      autoRenew: false,
      startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      suspendedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[4].id,
      applicationId: appRecords[5].id,
      licenseKey: 'ORN-CTR-2026-XXXX-EEEE-0005',
      plan: 'professional',
      status: 'active',
      duration: 365,
      maxUsers: 30,
      maxDevices: 2,
      maxApps: 3,
      storageMb: 3000,
      price: 18000,
      autoRenew: true,
      startDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 350 * 24 * 60 * 60 * 1000),
      activatedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const lic of licenses) {
    await db.license.create({ data: lic })
  }

  // 4. Criar pagamentos
  console.log('  Criando pagamentos...')
  const payments = [
    {
      customerId: customerRecords[0].id,
      amount: 18000,
      method: 'card',
      status: 'succeeded',
      description: 'Licença Professional - Farmácia Gestão Pro (anual)',
      stripePaymentId: 'pi_3Oabc123def456',
      stripeInvoiceId: 'in_3Oabc123def456',
      invoiceUrl: 'https://invoice.stripe.com/i/acct_abc/inv_abc',
      invoicePdf: 'https://invoice.stripe.com/i/acct_abc/inv_abc.pdf',
      paidAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[1].id,
      amount: 60000,
      method: 'boleto',
      status: 'succeeded',
      description: 'Licença Enterprise - Super Express PDV (anual)',
      stripePaymentId: 'pi_3Odef789ghi012',
      stripeInvoiceId: 'in_3Odef789ghi012',
      invoiceUrl: 'https://invoice.stripe.com/i/acct_def/inv_def',
      invoicePdf: 'https://invoice.stripe.com/i/acct_def/inv_def.pdf',
      paidAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[4].id,
      amount: 18000,
      method: 'pix',
      status: 'succeeded',
      description: 'Licença Professional - Construtora Top (anual)',
      stripePaymentId: 'pi_3Oghi345jkl678',
      stripeInvoiceId: 'in_3Oghi345jkl678',
      invoiceUrl: 'https://invoice.stripe.com/i/acct_ghi/inv_ghi',
      invoicePdf: 'https://invoice.stripe.com/i/acct_ghi/inv_ghi.pdf',
      paidAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[3].id,
      amount: 18000,
      method: 'card',
      status: 'failed',
      description: 'Renovação Licença Professional - Clínica Vida',
      stripePaymentId: 'pi_3Ojkl901mno234',
      stripeInvoiceId: 'in_3Ojkl901mno234',
    },
    {
      customerId: customerRecords[1].id,
      amount: 60000,
      method: 'card',
      status: 'pending',
      description: 'Renovação Enterprise - Super Express PDV (próxima cobrança)',
      stripeInvoiceId: 'in_3Opqr567stu890',
      invoiceUrl: 'https://invoice.stripe.com/i/acct_def/inv_pqr',
    },
  ]

  for (const pay of payments) {
    await db.payment.create({ data: pay })
  }

  // 5. Criar downloads
  console.log('  Criando downloads...')
  const downloads = [
    {
      customerId: customerRecords[0].id,
      applicationId: appRecords[0].id,
      downloadToken: 'tok_abc123def456',
      signedUrl: 'https://download.orion.com/artifacts/signed/abc123',
      deviceInfo: 'Mozilla/5.0 Windows NT 10.0 Chrome/120',
      ipAddress: '189.45.12.34',
      status: 'completed',
      expiresAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
      downloadedAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[0].id,
      applicationId: appRecords[0].id,
      downloadToken: 'tok_def789ghi012',
      deviceInfo: 'Mozilla/5.0 Macintosh Safari/17',
      ipAddress: '189.45.12.34',
      status: 'completed',
      expiresAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      downloadedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[1].id,
      applicationId: appRecords[2].id,
      downloadToken: 'tok_ghi345jkl678',
      deviceInfo: 'Mozilla/5.0 Windows NT 10.0 Edge/120',
      ipAddress: '200.150.20.10',
      status: 'completed',
      expiresAt: new Date(now.getTime() - 59 * 24 * 60 * 60 * 1000),
      downloadedAt: new Date(now.getTime() - 59 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[4].id,
      applicationId: appRecords[5].id,
      downloadToken: 'tok_jkl901mno234',
      deviceInfo: 'Mozilla/5.0 Windows NT 10.0 Chrome/120',
      ipAddress: '177.99.22.33',
      status: 'completed',
      expiresAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      downloadedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const dl of downloads) {
    await db.download.create({ data: dl })
  }

  // 6. Criar tickets de suporte
  console.log('  Criando tickets de suporte...')
  const tickets = [
    {
      customerId: customerRecords[0].id,
      subject: 'Dúvida sobre configuração de indicadores',
      description: 'Gostaria de saber como criar um indicador personalizado para faturamento de perfumaria.',
      priority: 'normal',
      status: 'resolved',
      category: 'technical',
      assignedTo: 'Suporte Técnico',
      resolvedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[1].id,
      subject: 'Erro ao gerar relatório fiscal',
      description: 'Ao tentar gerar o relatório fiscal, o sistema retorna erro 500.',
      priority: 'high',
      status: 'in_progress',
      category: 'technical',
      assignedTo: 'Equipe de Desenvolvimento',
    },
    {
      customerId: customerRecords[2].id,
      subject: 'Como funciona o período de trial?',
      description: 'Estou em período de avaliação e gostaria de entender como funciona a conversão para plano pago.',
      priority: 'normal',
      status: 'open',
      category: 'billing',
    },
    {
      customerId: customerRecords[3].id,
      subject: 'Licença suspensa - necessidade de renovação',
      description: 'Minha licença foi suspensa por inadimplência. Como posso regularizar?',
      priority: 'urgent',
      status: 'open',
      category: 'license',
    },
    {
      customerId: customerRecords[4].id,
      subject: 'Solicitação de nova funcionalidade',
      description: 'Gostaria de solicitar integração com WhatsApp para notificações.',
      priority: 'low',
      status: 'open',
      category: 'general',
    },
  ]

  for (const t of tickets) {
    const ticket = await db.supportTicket.create({ data: t })
    // Adicionar mensagem inicial
    await db.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: ticket.customerId,
        authorRole: 'customer',
        message: t.description,
      },
    })
    // Para tickets resolvidos, adicionar resposta
    if (t.status === 'resolved') {
      await db.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          authorId: 'admin',
          authorRole: 'admin',
          message: 'Olá! Para criar um indicador personalizado, acesse Configurações > Indicadores > Novo Indicador. Preencha nome, tipo, fórmula (se necessário) e salve. O sistema criará automaticamente o KPI para acompanhamento.',
        },
      })
    }
  }

  // 7. Criar notificações
  console.log('  Criando notificações...')
  const notifications = [
    {
      customerId: customerRecords[0].id,
      title: 'Aplicação publicada! 🎉',
      message: 'Sua aplicação "Farmácia Gestão Pro" v2.3.1 foi publicada e está disponível para download.',
      type: 'app',
      priority: 'high',
      read: false,
    },
    {
      customerId: customerRecords[0].id,
      title: 'Atualização disponível',
      message: 'Nova versão do Farmácia Gestão Pro está disponível para download.',
      type: 'app',
      priority: 'normal',
      read: false,
    },
    {
      customerId: customerRecords[2].id,
      title: 'Trial expira em 8 dias',
      message: 'Seu período de avaliação termina em 08/08/2026. Contrate um plano para continuar usando.',
      type: 'trial',
      priority: 'high',
      read: false,
    },
    {
      customerId: customerRecords[3].id,
      title: 'Licença suspensa ⚠️',
      message: 'Sua licença foi suspensa devido a pagamento pendente. Regularize para reativar o acesso.',
      type: 'license',
      priority: 'urgent',
      read: false,
    },
    {
      customerId: customerRecords[1].id,
      title: 'Pagamento confirmado ✅',
      message: 'Seu pagamento de R$ 60.000,00 foi confirmado. Licença Enterprise ativa por 365 dias.',
      type: 'payment',
      priority: 'normal',
      read: true,
      readAt: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000),
    },
    {
      customerId: customerRecords[4].id,
      title: 'Bem-vindo ao Orion!',
      message: 'Sua conta foi criada com sucesso. Comece a explorar a plataforma agora mesmo.',
      type: 'system',
      priority: 'normal',
      read: true,
      readAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const n of notifications) {
    await db.notification.create({ data: n })
  }

  // 8. Logs de auditoria
  console.log('  Criando logs de auditoria...')
  const auditLogs = [
    { customerId: customerRecords[0].id, action: 'login', entity: 'customer', entityId: customerRecords[0].id, ipAddress: '189.45.12.34', userAgent: 'Chrome/120 Windows' },
    { customerId: customerRecords[0].id, action: 'download', entity: 'application', entityId: appRecords[0].id, ipAddress: '189.45.12.34', userAgent: 'Chrome/120 Windows' },
    { customerId: customerRecords[1].id, action: 'publish', entity: 'application', entityId: appRecords[2].id, ipAddress: '200.150.20.10', userAgent: 'Edge/120 Windows' },
    { customerId: customerRecords[3].id, action: 'suspend', entity: 'license', entityId: customerRecords[3].id, ipAddress: 'system', userAgent: 'System' },
    { customerId: customerRecords[2].id, action: 'login', entity: 'customer', entityId: customerRecords[2].id, ipAddress: '187.20.30.40', userAgent: 'Safari/17 Mac' },
  ]

  for (const log of auditLogs) {
    await db.auditLog.create({
      data: {
        ...log,
        newValue: JSON.stringify({ timestamp: new Date().toISOString() }),
      },
    })
  }

  console.log('\n✅ Seed concluído com sucesso!')
  console.log(`   Clientes: ${customerRecords.length}`)
  console.log(`   Aplicações: ${appRecords.length}`)
  console.log(`   Licenças: ${licenses.length}`)
  console.log(`   Pagamentos: ${payments.length}`)
  console.log(`   Downloads: ${downloads.length}`)
  console.log(`   Tickets: ${tickets.length}`)
  console.log(`   Notificações: ${notifications.length}`)
  console.log(`   Logs de auditoria: ${auditLogs.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
