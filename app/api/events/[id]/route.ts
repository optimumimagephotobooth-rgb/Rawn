import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { Database } from '@/types/database'

type Event = Database['public']['Tables']['events']['Row']

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params
    const supabase = await createClient()

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_id', eventId)
      .single()

    if (error) throw error

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    const typedEvent = event as Event

    // Get registration count if registration is required
    let registrationCount = 0
    if (typedEvent.registration_required) {
      const { count } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'Registered')

      registrationCount = count || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        ...typedEvent,
        registrationCount,
        isFull: typedEvent.capacity ? registrationCount >= typedEvent.capacity : false,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/events/[id] - Update event (Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params
    const ctx = await getUserContext()
    
    if (ctx.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const body = await request.json()

    // Verify event belongs to admin's church
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('church_id')
      .eq('event_id', eventId)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    const typedExistingEvent = existingEvent as Pick<Event, 'church_id'>

    if (typedExistingEvent.church_id !== ctx.churchId && typedExistingEvent.church_id !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.category !== undefined) updateData.category = body.category?.trim() || null
    if (body.eventDate !== undefined) updateData.event_date = body.eventDate
    if (body.eventTime !== undefined) updateData.event_time = body.eventTime || null
    if (body.endDate !== undefined) updateData.end_date = body.endDate || null
    if (body.endTime !== undefined) updateData.end_time = body.endTime || null
    if (body.location !== undefined) updateData.location = body.location?.trim() || null
    if (body.zoomUrl !== undefined) updateData.zoom_url = body.zoomUrl?.trim() || null
    if (body.isOnline !== undefined) updateData.is_online = body.isOnline
    if (body.registrationRequired !== undefined) updateData.registration_required = body.registrationRequired
    if (body.price !== undefined) updateData.price = parseFloat(body.price)
    if (body.currency !== undefined) updateData.currency = body.currency
    if (body.capacity !== undefined) updateData.capacity = body.capacity ? parseInt(body.capacity) : null
    if (body.status !== undefined) updateData.status = body.status
    if (body.featuredImage !== undefined) updateData.featured_image = body.featuredImage?.trim() || null

    const { data: event, error } = await (supabase
      .from('events') as any)
      .update(updateData)
      .eq('event_id', eventId)
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

// DELETE /api/events/[id] - Delete event (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params
    const ctx = await getUserContext()
    
    if (ctx.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Verify event belongs to admin's church
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('church_id')
      .eq('event_id', eventId)
      .single()

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    const typedExistingEvent = existingEvent as Pick<Event, 'church_id'>

    if (typedExistingEvent.church_id !== ctx.churchId && typedExistingEvent.church_id !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('event_id', eventId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

