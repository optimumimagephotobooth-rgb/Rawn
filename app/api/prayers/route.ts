import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generatePrayerId } from '@/lib/utils/id'
import { awardXP } from '@/lib/utils/xp'
import { awardBTC } from '@/lib/utils/btc'
import { logAudit } from '@/lib/utils/audit'
import { sendPrayerAcknowledgment } from '@/lib/email/prayerAcknowledgment'
import { verifyRecaptchaToken } from '@/components/reCAPTCHA'

// GET /api/prayers - Get prayers (filtered by status/church)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const churchId = searchParams.get('church_id')

    let query = supabase
      .from('prayers')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (churchId) {
      query = query.eq('church_id', churchId)
    }

    // If no status specified and user is authenticated, try to get context
    if (!status) {
      try {
        const ctx = await getUserContext()
        if (ctx.role === 'Admin' && ctx.churchId) {
          query = query.eq('church_id', ctx.churchId)
        }
      } catch {
        // Not authenticated, return only prayed prayers
        query = query.eq('status', 'prayed')
      }
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/prayers - Submit prayer request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.content) {
      return NextResponse.json(
        { success: false, error: 'Prayer content is required' },
        { status: 400 }
      )
    }

    // Verify reCAPTCHA token if provided
    if (body.recaptchaToken) {
      const isValid = await verifyRecaptchaToken(body.recaptchaToken)
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'reCAPTCHA verification failed. Please try again.' },
          { status: 400 }
        )
      }
    }

    let ctx: Awaited<ReturnType<typeof getUserContext>> | null = null
    let churchId: string | null = null

    try {
      ctx = await getUserContext()
      churchId = ctx.churchId || null
    } catch {
      // Anonymous submission - leave churchId as null
    }

    const prayerId = generatePrayerId()

    const prayerEmail = body.email || ctx?.email || null
    const prayerName = body.name || null
    const isConfidential = body.isAnonymous || false

    const { data: prayer, error } = await (supabase
      .from('prayers') as any)
      .insert({
        prayer_id: prayerId,
        church_id: churchId,
        content: body.content,
        name: prayerName,
        email: prayerEmail,
        title: body.title || null,
        is_anonymous: isConfidential,
        status: 'received',
      })
      .select()
      .single()

    if (error) throw error

    // Send email acknowledgment if email is provided
    if (prayerEmail) {
      try {
        await sendPrayerAcknowledgment({
          prayerId,
          name: prayerName,
          email: prayerEmail,
          content: body.content,
          isConfidential,
          submittedAt: prayer.created_at || new Date().toISOString(),
        })
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Failed to send prayer acknowledgment email:', emailError)
      }
    }

    // Award XP and BTC if authenticated user
    if (ctx?.id) {
      await awardXP(ctx.id, churchId, 10, 'Prayer submitted')
      await awardBTC(ctx.id, churchId, 0.0001, 'Prayer submitted')
    }

    await logAudit('PRAYER_SUBMITTED', { prayerId, churchId }, ctx?.id)

    return NextResponse.json({ success: true, data: prayer })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

