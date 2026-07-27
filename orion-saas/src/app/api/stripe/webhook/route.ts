import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 400 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })

    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('[stripe] Checkout completed:', event.data.object.id)
        break
      case 'customer.subscription.updated':
        console.log('[stripe] Subscription updated:', event.data.object.id)
        break
      case 'customer.subscription.deleted':
        console.log('[stripe] Subscription deleted:', event.data.object.id)
        break
      case 'invoice.payment_succeeded':
        console.log('[stripe] Payment succeeded:', event.data.object.id)
        break
      case 'invoice.payment_failed':
        console.log('[stripe] Payment failed:', event.data.object.id)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[stripe webhook] Erro:', error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
