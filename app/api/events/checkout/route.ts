import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { Database } from '@/types/database'

type Event = Database['public']['Tables']['events']['Row']

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

// POST /api/events/checkout - Create Stripe Checkout Session for event registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, paymentIntentId, name, email, phone, notes } = body

    if (!eventId || !paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Event ID and Payment Intent ID are required' },
        { status: 400 }
      )
    }

    // Get event details to get price
    const supabase = await createClient()
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, price, currency')
      .eq('event_id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    const eventData = event as Pick<Event, 'title' | 'price' | 'currency'>

    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Get payment intent to verify amount
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const amount = paymentIntent.amount
    const currency = paymentIntent.currency

    // Create a Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Event Registration: ${eventData.title}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/events/${eventId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/events/${eventId}?payment=cancelled`,
      metadata: {
        event_id: eventId,
        payment_intent_id: paymentIntentId,
        registrant_name: name,
        registrant_email: email,
        registrant_phone: phone || '',
        notes: notes || '',
      },
      payment_intent_data: {
        metadata: {
          event_id: eventId,
          registrant_name: name,
          registrant_email: email,
        },
      },
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
