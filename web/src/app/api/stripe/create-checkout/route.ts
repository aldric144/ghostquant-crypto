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

    // For now, return demo mode URL since Stripe is not configured
    // When Stripe is set up, install the stripe package and uncomment the code below
    if (!stripeSecretKey) {
      console.log('Stripe not configured, returning mock checkout')
      return NextResponse.json({
        url: `/subscribe/${tier}?demo=true`,
        message: 'Stripe not configured - demo mode'
      })
    }

    // Demo mode - redirect to subscription confirmation page
    // To enable real Stripe checkout:
    // 1. Install stripe: npm install stripe
    // 2. Add STRIPE_SECRET_KEY to environment variables
    // 3. Create price IDs in Stripe Dashboard
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    return NextResponse.json({
      url: `${origin}/subscribe/${tier}?demo=true`,
      message: 'Demo mode - Stripe integration pending'
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
