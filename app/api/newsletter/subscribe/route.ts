import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { Database } from '@/types/database'

type EmailSubscription = Database['public']['Tables']['email_subscriptions']['Row']

// POST /api/newsletter/subscribe - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    const email = body.email.trim().toLowerCase()
    const source = body.source || 'website'
    const churchId = body.churchId || null

    // Generate unsubscribe token
    const unsubscribeToken = crypto.randomBytes(32).toString('hex')

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('email_subscriptions')
      .select('id, status')
      .eq('email', email)
      .single()

    if (existing) {
      const typedExisting = existing as Pick<EmailSubscription, 'id' | 'status'>
      if (typedExisting.status === 'Subscribed') {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter.',
        })
      } else {
        // Re-subscribe
        await (supabase
          .from('email_subscriptions') as any)
          .update({
            status: 'Subscribed',
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
            unsubscribe_token: unsubscribeToken,
          })
          .eq('id', typedExisting.id)

        return NextResponse.json({
          success: true,
          message: 'Successfully re-subscribed to our newsletter!',
        })
      }
    }

    // Create new subscription
    const { data: subscription, error } = await (supabase
      .from('email_subscriptions') as any)
      .insert({
        email,
        church_id: churchId,
        source,
        status: 'Subscribed',
        unsubscribe_token: unsubscribeToken,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
      data: subscription,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

