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

// POST /api/events/[id]/register - Register for event (public)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params
    const supabase = await createClient()
    const body = await request.json()

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .eq('status', 'Published')
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Event not found or not available for registration' },
        { status: 404 }
      )
    }

    const typedEvent = event as Event

    if (!typedEvent.registration_required) {
      return NextResponse.json(
        { success: false, error: 'This event does not require registration' },
        { status: 400 }
      )
    }

    // Check if event is full
    if (typedEvent.capacity) {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'Registered')

      if ((count || 0) >= typedEvent.capacity) {
        return NextResponse.json(
          { success: false, error: 'Event is full' },
          { status: 400 }
        )
      }
    }

    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', body.email.trim())
      .eq('status', 'Registered')
      .single()

    if (existingRegistration) {
      return NextResponse.json(
        { success: false, error: 'You are already registered for this event' },
        { status: 400 }
      )
    }

    // Handle paid events - require payment first
    if (typedEvent.price > 0) {
      // For paid events, we need to create a payment intent
      // The frontend will handle the payment flow
      const stripe = getStripe()
      
      // Create a payment intent for the event registration
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(typedEvent.price * 100), // Convert to cents
        currency: typedEvent.currency.toLowerCase(),
        metadata: {
          event_id: eventId,
          registrant_email: body.email.trim(),
          registrant_name: body.name.trim(),
        },
        description: `Event Registration: ${typedEvent.title}`,
      })

      // Return payment intent for frontend to handle
      return NextResponse.json({
        success: true,
        requiresPayment: true,
        paymentIntent: {
          clientSecret: paymentIntent.client_secret,
          id: paymentIntent.id,
        },
        event: {
          title: typedEvent.title,
          price: typedEvent.price,
          currency: typedEvent.currency,
        },
      })
    }

    // For free events, proceed with registration
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
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        notes: body.notes?.trim() || null,
        status: 'Registered',
      })
      .select()
      .single()

    if (regError) throw regError

    // Send confirmation email (async, don't wait for it)
    sendEventRegistrationConfirmation(
      {
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
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

