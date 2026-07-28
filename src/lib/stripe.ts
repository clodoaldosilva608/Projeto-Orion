export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY)

const PLANS = {
  free: { name: 'Free', price: 0, priceId: null },
  starter: { name: 'Starter', price: 9900, priceId: process.env.STRIPE_PRICE_STARTER || null },
  pro: { name: 'Pro', price: 29900, priceId: process.env.STRIPE_PRICE_PRO || null },
  enterprise: { name: 'Enterprise', price: 49900, priceId: process.env.STRIPE_PRICE_ENTERPRISE || null },
} as const

export type PlanSlug = keyof typeof PLANS

export async function createCheckoutSession(params: {
  plan: PlanSlug; customerEmail: string; customerId?: string; successUrl: string; cancelUrl: string
}): Promise<{ url: string | null; error: string | null }> {
  if (!stripeEnabled) return { url: null, error: 'Stripe não configurado.' }
  const plan = PLANS[params.plan]
  if (!plan.priceId) return { url: null, error: `Price ID não configurado para ${plan.name}` }
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription', payment_method_types: ['card'],
      customer_email: params.customerEmail, customer: params.customerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: params.successUrl, cancel_url: params.cancelUrl,
      metadata: { plan: params.plan },
      billing_address_collection: 'required',
      locale: 'pt-BR',
    })
    return { url: session.url, error: null }
  } catch (error: any) {
    return { url: null, error: error.message }
  }
}

export async function createBillingPortal(params: { customerId: string; returnUrl: string }): Promise<{ url: string | null; error: string | null }> {
  if (!stripeEnabled) return { url: null, error: 'Stripe não configurado.' }
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any })
    const session = await stripe.billingPortal.sessions.create({ customer: params.customerId, return_url: params.returnUrl })
    return { url: session.url, error: null }
  } catch (error: any) {
    return { url: null, error: error.message }
  }
}

export { PLANS }
