import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/giving/testimonies - Get approved partner testimonies
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('church_id')
    const featured = searchParams.get('featured') === 'true'

    let query = (supabase
      .from('partner_testimonies') as any)
      .select('*')
      .eq('status', 'Approved')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (churchId) {
      query = query.or(`church_id.eq.${churchId},church_id.is.null`)
    } else {
      query = query.is('church_id', null)
    }

    if (featured) {
      query = query.eq('is_featured', true)
    }

    const { data: testimonies, error } = await query.limit(20)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: testimonies || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/giving/testimonies - Submit a partner testimony
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!body.testimony || !body.testimony.trim()) {
      return NextResponse.json(
        { success: false, error: 'Testimony is required' },
        { status: 400 }
      )
    }

    // Get user context if authenticated
    let userId: string | null = null
    let churchId: string | null = null
    try {
      const { getUserContext } = await import('@/lib/auth/getUserContext')
      const ctx = await getUserContext()
      userId = ctx.id
      churchId = ctx.churchId
    } catch {
      // User not authenticated, that's okay for public testimonies
    }

    const { generateId } = await import('@/lib/utils/id')
    const testimonyId = `TM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data: testimony, error } = await (supabase
      .from('partner_testimonies') as any)
      .insert({
        testimony_id: testimonyId,
        church_id: churchId,
        partner_id: body.partnerId || null,
        name: body.name.trim(),
        testimony: body.testimony.trim(),
        is_anonymous: body.isAnonymous || false,
        status: 'Pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: testimony,
      message: 'Thank you for sharing your testimony! It will be reviewed before being published.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
