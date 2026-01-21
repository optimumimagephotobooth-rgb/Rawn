import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserContext'
import { Database } from '@/types/database'

type Event = Database['public']['Tables']['events']['Row']

// GET /api/events/[id]/registrations - Get event registrations (Admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params
    const ctx = await requireAdmin()
    const supabase = await createClient()

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

    // Get registrations
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: registrations })
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

