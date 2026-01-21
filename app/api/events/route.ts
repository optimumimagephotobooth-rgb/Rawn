import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generateEventId } from '@/lib/utils/id'

// GET /api/events - Get events (public or filtered)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const churchId = searchParams.get('church_id')
    const status = searchParams.get('status') || 'Published'
    const upcoming = searchParams.get('upcoming') === 'true'
    const past = searchParams.get('past') === 'true'

    let query = supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .order('event_time', { ascending: true })

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (churchId) {
      query = query.eq('church_id', churchId)
    }

    if (upcoming) {
      query = query.gte('event_date', new Date().toISOString().split('T')[0])
    }

    if (past) {
      query = query.lt('event_date', new Date().toISOString().split('T')[0])
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

// POST /api/events - Create event (Admin only)
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext()
    
    if (ctx.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const body = await request.json()

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Event title is required' },
        { status: 400 }
      )
    }

    if (!body.eventDate) {
      return NextResponse.json(
        { success: false, error: 'Event date is required' },
        { status: 400 }
      )
    }

    const eventId = generateEventId()

    const { data: event, error } = await (supabase
      .from('events') as any)
      .insert({
        event_id: eventId,
        church_id: ctx.churchId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        category: body.category?.trim() || null,
        event_date: body.eventDate,
        event_time: body.eventTime || null,
        end_date: body.endDate || null,
        end_time: body.endTime || null,
        location: body.location?.trim() || null,
        zoom_url: body.zoomUrl?.trim() || null,
        is_online: body.isOnline || false,
        registration_required: body.registrationRequired || false,
        price: body.price ? parseFloat(body.price) : 0,
        currency: body.currency || 'USD',
        capacity: body.capacity ? parseInt(body.capacity) : null,
        status: body.status || 'Draft',
        featured_image: body.featuredImage?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: event })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

