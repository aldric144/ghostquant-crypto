import { NextRequest, NextResponse } from 'next/server'

// Price IDs for each tier (these would be created in Stripe Dashboard)
const PRICE_IDS: Record<string, string> = {
  'retail': process.env.STRIPE_PRICE_RETAIL || 'price_retail_placeholder',
  'trader-pro': process.env.STRIPE_PRICE_TRADER_PRO || 'price_trader_pro_placeholder',
  'elite': process.env.STRIPE_PRICE_ELITE || 'price_elite_placeholder',
  'fund': process.env.STRIPE_PRICE_FUND || 'price_fund_placeholder',
  'exchange': process.env.STRIPE_PRICE_EXCHANGE || 'price_exchange_placeholder',
  'government': process.env.STRIPE_PRICE_GOVERNMENT || 'price_government_placeholder',
}

export async function POST(request: NextRequest) {
  try {
    const { tier } = await request.json()

    if (!tier || !PRICE_IDS[tier]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      // Return mock checkout URL for development/demo
      console.log('Stripe not configured, returning mock checkout')
      return NextResponse.json({
        url: `/subscribe/${tier}?demo=true`,
        message: 'Stripe not configured - demo mode'
      })
    }

    // Dynamic import of Stripe to avoid build issues
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    const priceId = PRICE_IDS[tier]
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/terminal/home?subscription=success&tier=${tier}`,
      cancel_url: `${origin}/pricing?subscription=cancelled`,
      metadata: {
        tier,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
