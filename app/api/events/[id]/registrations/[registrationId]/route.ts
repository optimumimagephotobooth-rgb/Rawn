import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserContext'
import { Database } from '@/types/database'

type Event = Database['public']['Tables']['events']['Row']
type Registration = Database['public']['Tables']['event_registrations']['Row']

// PATCH /api/events/[id]/registrations/[registrationId] - Update registration status (Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string; registrationId: string }> }
) {
  try {
    const { id: eventId, registrationId } = await context.params
    const ctx = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    // Verify event belongs to admin's church
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('church_id')
      .eq('event_id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    const typedEvent = event as Pick<Event, 'church_id'>

    if (typedEvent.church_id !== ctx.churchId && typedEvent.church_id !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Validate status
    const validStatuses = ['Registered', 'Cancelled', 'Attended', 'No-Show']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update registration
    const updateData: any = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null

    const { data: registration, error } = await (supabase
      .from('event_registrations') as any)
      .update(updateData)
      .eq('id', registrationId)
      .eq('event_id', eventId)
      .select()
      .single()

    if (error) throw error

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: registration,
    })
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message.includes('Access denied')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
