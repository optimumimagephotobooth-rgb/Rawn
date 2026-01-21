import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { Database } from '@/types/database'
import { sendEventRegistrationConfirmation } from '@/lib/email/eventConfirmation'
import Stripe from 'stripe'

type Event = Database['public']['Tables']['events']['Row']

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

// POST /api/events/[id]/register/complete - Complete registration after payment (for paid events)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params
    const supabase = await createClient()
    const body = await request.json()

    const { sessionId, paymentIntentId, name, email, phone, notes } = body

    const stripe = getStripe()
    let paymentIntent: Stripe.PaymentIntent

    // Verify payment via session or payment intent
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      if (session.payment_status !== 'paid') {
        return NextResponse.json(
          { success: false, error: 'Payment not completed' },
          { status: 400 }
        )
      }
      if (session.metadata?.event_id !== eventId) {
        return NextResponse.json(
          { success: false, error: 'Session does not match event' },
          { status: 400 }
        )
      }
      // Get payment intent from session
      if (typeof session.payment_intent === 'string') {
        paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent)
      } else {
        return NextResponse.json(
          { success: false, error: 'Payment intent not found' },
          { status: 400 }
        )
      }
    } else if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { success: false, error: 'Payment not completed' },
          { status: 400 }
        )
      }
      if (paymentIntent.metadata.event_id !== eventId) {
        return NextResponse.json(
          { success: false, error: 'Payment intent does not match event' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Session ID or Payment Intent ID is required' },
        { status: 400 }
      )
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'Published')
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    const typedEvent = event as Event

    // Get user context if authenticated
    let userId: string | null = null
    try {
      const ctx = await getUserContext()
      userId = ctx.id
    } catch {
      // User not authenticated, that's okay for public registration
    }

    // Create registration
    const { data: registration, error: regError } = await (supabase
      .from('event_registrations') as any)
      .insert({
        event_id: eventId,
        church_id: typedEvent.church_id,
        user_id: userId,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        notes: notes?.trim() || null,
        status: 'Registered',
      })
      .select()
      .single()

    if (regError) throw regError

    // Send confirmation email (async, don't wait for it)
    sendEventRegistrationConfirmation(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        registrationId: registration.id,
      },
      {
        title: typedEvent.title,
        event_date: typedEvent.event_date,
        event_time: typedEvent.event_time,
        end_date: typedEvent.end_date,
        end_time: typedEvent.end_time,
        location: typedEvent.location,
        zoom_url: typedEvent.zoom_url,
        is_online: typedEvent.is_online,
        price: typedEvent.price,
        currency: typedEvent.currency,
      }
    ).catch((err) => {
      console.error('Failed to send confirmation email:', err)
      // Don't fail the registration if email fails
    })

    return NextResponse.json({
      success: true,
      data: registration,
      message: 'Successfully registered for event. A confirmation email has been sent.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
