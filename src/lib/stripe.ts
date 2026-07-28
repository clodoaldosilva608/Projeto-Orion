/**
 * Stripe Client — Orion Platform
 *
 * Cria checkout sessions para cobrança de licenças SaaS Multi-Tenant.
 * Cada checkout carrega metadata com companyId e planId, permitindo que o
 * webhook ative a License e Company corretas quando o pagamento for confirmado.
 *
 * Se não houver STRIPE_SECRET_KEY, retorna erro gracioso.
 */

export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY)

export const PLANS = {
  free: { name: 'Free', price: 0, priceId: null, maxUsers: 5, maxBranches: 1 },
  starter: { name: 'Starter', price: 9900, priceId: process.env.STRIPE_PRICE_STARTER || null, maxUsers: 20, maxBranches: 3 },
  pro: { name: 'Pro', price: 29900, priceId: process.env.STRIPE_PRICE_PRO || null, maxUsers: 50, maxBranches: 10 },
  enterprise: { name: 'Enterprise', price: 49900, priceId: process.env.STRIPE_PRICE_ENTERPRISE || null, maxUsers: 100, maxBranches: 20 },
} as const

export type PlanSlug = keyof typeof PLANS

/**
 * Cria uma Checkout Session no Stripe.
 * Recebe companyId e planId para que o webhook possa identificar qual
 * empresa precisa ter a licença ativada.
 */
export async function createCheckoutSession(params: {
  plan: PlanSlug
  companyId: string
  customerEmail: string
  customerId?: string
  successUrl: string
  cancelUrl: string
}): Promise<{ url: string | null; error: string | null }> {
  if (!stripeEnabled) {
    return { url: null, error: 'Stripe não configurado. Adicione STRIPE_SECRET_KEY.' }
  }

  const plan = PLANS[params.plan]
  if (!plan.priceId) {
    return { url: null, error: `Price ID não configurado para o plano ${plan.name}` }
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: params.customerId ? undefined : params.customerEmail,
      customer: params.customerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        plan: params.plan,
        companyId: params.companyId,
        planId: params.plan,
      },
      subscription_data: {
        metadata: {
          plan: params.plan,
          companyId: params.companyId,
        },
      },
    })

    return { url: session.url, error: null }
  } catch (error: any) {
    console.error('[stripe] Erro:', error.message)
    return { url: null, error: error.message || 'Erro ao criar sessão de checkout' }
  }
}

/**
 * Cria sessão do Stripe Customer Portal para o cliente gerenciar sua assinatura.
 */
export async function createBillingPortal(params: {
  customerId: string
  returnUrl: string
}): Promise<{ url: string | null; error: string | null }> {
  if (!stripeEnabled) {
    return { url: null, error: 'Stripe não configurado.' }
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })

    const session = await stripe.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    })

    return { url: session.url, error: null }
  } catch (error: any) {
    return { url: null, error: error.message }
  }
}

/**
 * Busca o stripeCustomerId da empresa — armazenamos no metadata da Company.
 * Se ainda não tiver, procura no Stripe pelo email.
 */
export async function getOrCreateStripeCustomer(company: {
  id: string
  email: string | null
  tradeName: string
  stripeCustomerId?: string | null
}): Promise<{ customerId: string | null; error: string | null }> {
  if (!stripeEnabled) {
    return { customerId: null, error: 'Stripe não configurado.' }
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })

    // Se já temos o customerId armazenado, apenas retorna
    if (company.stripeCustomerId) {
      return { customerId: company.stripeCustomerId, error: null }
    }

    // Procura cliente existente por email
    const existing = await stripe.customers.list({
      email: company.email || undefined,
      limit: 1,
    })

    if (existing.data.length > 0) {
      return { customerId: existing.data[0].id, error: null }
    }

    // Cria novo customer
    const customer = await stripe.customers.create({
      email: company.email || undefined,
      name: company.tradeName,
      metadata: { companyId: company.id },
    })

    return { customerId: customer.id, error: null }
  } catch (error: any) {
    return { customerId: null, error: error.message }
  }
}
