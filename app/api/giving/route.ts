import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generateDonationId } from '@/lib/utils/id'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

// POST /api/giving - Initiate donation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.amount || parseFloat(body.amount) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid donation amount is required' },
        { status: 400 }
      )
    }

    if (!body.donorEmail || !body.donorEmail.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const amount = parseFloat(body.amount)
    const currency = body.currency || 'USD'
    const paymentMethod = body.paymentMethod || 'Stripe'
    const isRecurring = body.isRecurring || false

    // Get user context if authenticated
    let userId: string | null = null
    let churchId: string | null = null
    try {
      const ctx = await getUserContext()
      userId = ctx.id
      churchId = ctx.churchId
    } catch {
      // User not authenticated, that's okay for public donations
    }

    const donationId = generateDonationId()

    // Create donation record
    const { data: donation, error: donationError } = await (supabase
      .from('donations') as any)
      .insert({
        donation_id: donationId,
        church_id: churchId,
        user_id: userId,
        amount,
        currency,
        payment_method: paymentMethod,
        donor_name: body.donorName?.trim() || null,
        donor_email: body.donorEmail.trim(),
        is_recurring: isRecurring,
        status: 'Pending',
      })
      .select()
      .single()

    if (donationError) throw donationError

    if (paymentMethod === 'Stripe') {
      const stripe = getStripe()

      if (isRecurring) {
        // Create Stripe Subscription for recurring donations
        const price = await stripe.prices.create({
          unit_amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          recurring: {
            interval: 'month', // Default to monthly, can be customized
          },
          product_data: {
            name: 'Monthly Donation to RAWN Ministry',
          },
        })

        // Create or retrieve customer
        const customer = await stripe.customers.create({
          email: body.donorEmail.trim(),
          metadata: {
            donation_id: donationId,
          },
        })

        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [{ price: price.id }],
          payment_behavior: 'default_incomplete',
          payment_settings: { save_default_payment_method: 'on_subscription' },
          expand: ['latest_invoice.payment_intent'],
          metadata: {
            donation_id: donationId,
          },
        })

        const invoice = subscription.latest_invoice as Stripe.Invoice & {
          payment_intent: Stripe.PaymentIntent
        }
        const paymentIntent = invoice.payment_intent

        // Update donation with subscription and payment intent IDs
        await (supabase
          .from('donations') as any)
          .update({
            stripe_payment_intent_id: paymentIntent.id,
            recurring_id: subscription.id,
          })
          .eq('id', donation.id)

        return NextResponse.json({
          success: true,
          data: {
            donation,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            subscriptionId: subscription.id,
            isRecurring: true,
          },
        })
      } else {
        // Create Stripe Payment Intent for one-time donations
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            donation_id: donationId,
          },
          description: `Donation to RAWN Ministry`,
        })

        // Update donation with payment intent ID
        await (supabase
          .from('donations') as any)
          .update({ stripe_payment_intent_id: paymentIntent.id })
          .eq('id', donation.id)

        return NextResponse.json({
          success: true,
          data: {
            donation,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            isRecurring: false,
          },
        })
      }
    } else if (paymentMethod === 'PayPal') {
      // PayPal integration would go here
      // For now, return donation record
      return NextResponse.json({
        success: true,
        data: {
          donation,
          message: 'PayPal integration pending',
        },
      })
    }

    return NextResponse.json({ success: true, data: donation })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

