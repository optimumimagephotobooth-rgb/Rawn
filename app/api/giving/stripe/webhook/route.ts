import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendDonationReceipt } from '@/lib/email/donationReceipt'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  })
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      // Check if this is an event registration payment
      if (paymentIntent.metadata?.event_id) {
        // Event registration payment - registration will be completed via the complete endpoint
        // The webhook can be used for logging or additional processing if needed
        console.log('Event registration payment succeeded:', paymentIntent.id)
      } else {
        // Get donation details
        const { data: donation, error: donationError } = await (supabase
          .from('donations') as any)
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (!donationError && donation) {
          // Update donation status
          await (supabase
            .from('donations') as any)
            .update({
              status: 'Completed',
              payment_id: paymentIntent.id,
              receipt_sent: false,
            })
            .eq('stripe_payment_intent_id', paymentIntent.id)

          // Send receipt email (async, don't wait)
          sendDonationReceipt({
            donationId: donation.donation_id,
            amount: parseFloat(donation.amount),
            currency: donation.currency,
            donorName: donation.donor_name,
            donorEmail: donation.donor_email,
            paymentMethod: 'Stripe',
            isRecurring: donation.is_recurring,
            date: donation.created_at,
          })
            .then(() => {
              // Update receipt_sent flag
              ;(supabase
                .from('donations') as any)
                .update({ receipt_sent: true })
                .eq('donation_id', donation.donation_id)
                .then(() => {})
            })
            .catch((err) => {
              console.error('Failed to send receipt email:', err)
            })
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      if (paymentIntent.metadata?.event_id) {
        // Event registration payment failed
        console.log('Event registration payment failed:', paymentIntent.id)
      } else {
        await (supabase
          .from('donations') as any)
          .update({ status: 'Failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id)
      }
    } else if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      // Handle checkout session completion for event registrations
      if (session.metadata?.event_id) {
        console.log('Event registration checkout completed:', session.id)
        // Registration will be completed when user returns to the site
        // This webhook can be used for logging or notifications
      }
    } else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice
      
      // Handle recurring donation payment
      const subscriptionId = (invoice as any).subscription
        ? (typeof (invoice as any).subscription === 'string' 
          ? (invoice as any).subscription 
          : (invoice as any).subscription?.id)
        : null
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        
        if (subscription.metadata?.donation_id) {
          // Create a new donation record for this recurring payment
          const { data: originalDonation } = await (supabase
            .from('donations') as any)
            .select('*')
            .eq('donation_id', subscription.metadata.donation_id)
            .single()

          if (originalDonation) {
            const donationId = `DN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            
            const { data: newDonation } = await (supabase
              .from('donations') as any)
              .insert({
                donation_id: donationId,
                church_id: originalDonation.church_id,
                user_id: originalDonation.user_id,
                amount: (invoice.amount_paid / 100).toFixed(2),
                currency: invoice.currency.toUpperCase(),
                payment_method: 'Stripe',
                donor_name: originalDonation.donor_name,
                donor_email: originalDonation.donor_email,
                is_recurring: true,
                recurring_id: subscription.id,
                status: 'Completed',
                payment_id: (typeof (invoice as any).payment_intent === 'string' 
                  ? (invoice as any).payment_intent 
                  : (invoice as any).payment_intent?.id) || null,
                receipt_sent: false,
              })
              .select()
              .single()

            if (newDonation) {
              // Send receipt email
              sendDonationReceipt({
                donationId: newDonation.donation_id,
                amount: parseFloat(newDonation.amount),
                currency: newDonation.currency,
                donorName: newDonation.donor_name,
                donorEmail: newDonation.donor_email,
                paymentMethod: 'Stripe',
                isRecurring: true,
                date: newDonation.created_at,
              })
                .then(() => {
                  ;(supabase
                    .from('donations') as any)
                    .update({ receipt_sent: true })
                    .eq('donation_id', newDonation.donation_id)
                    .then(() => {})
                })
                .catch((err) => {
                  console.error('Failed to send receipt email:', err)
                })
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Disable body parsing for webhook
export const runtime = 'nodejs'

