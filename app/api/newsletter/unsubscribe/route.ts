import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const token = body.token
    const email = body.email?.trim().toLowerCase()

    if (!token && !email) {
      return NextResponse.json(
        { success: false, error: 'Token or email is required' },
        { status: 400 }
      )
    }

    let query = (supabase
      .from('email_subscriptions') as any)
      .update({
        status: 'Unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })

    if (token) {
      query = query.eq('unsubscribe_token', token)
    } else if (email) {
      query = query.eq('email', email)
    }

    const { data, error } = await query.select()

    if (error) throw error

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from our newsletter.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

