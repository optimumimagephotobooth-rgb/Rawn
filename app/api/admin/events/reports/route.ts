import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserContext'
import { subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { Database } from '@/types/database'

type Event = Database['public']['Tables']['events']['Row']
type EventRegistration = Database['public']['Tables']['event_registrations']['Row']

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAdmin()
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const range = searchParams.get('range') || 'all'

    const churchId = ctx.churchId || 'PUBLIC'

    // Calculate date range
    let dateFilter: { gte?: string; lte?: string } = {}
    const now = new Date()

    switch (range) {
      case 'week':
        dateFilter.gte = subDays(now, 7).toISOString()
        break
      case 'month':
        dateFilter.gte = startOfMonth(now).toISOString()
        dateFilter.lte = endOfMonth(now).toISOString()
        break
      case 'year':
        dateFilter.gte = startOfYear(now).toISOString()
        dateFilter.lte = endOfYear(now).toISOString()
        break
    }

    // Get events
    let eventsQuery = supabase
      .from('events')
      .select('*')
      .eq('church_id', churchId)
      .order('event_date', { ascending: false })

    if (dateFilter.gte) {
      eventsQuery = eventsQuery.gte('event_date', dateFilter.gte)
    }
    if (dateFilter.lte) {
      eventsQuery = eventsQuery.lte('event_date', dateFilter.lte)
    }

    const { data: events, error: eventsError } = await eventsQuery

    if (eventsError) throw eventsError

    const eventsList = (events || []) as Event[]

    // Get registrations for each event
    const reports = await Promise.all(
      eventsList.map(async (event) => {
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('status')
          .eq('event_id', event.event_id)

        const regs = (registrations || []) as Pick<EventRegistration, 'status'>[]
        const registeredCount = regs.length
        const attendedCount = regs.filter(r => r.status === 'Attended').length
        const cancelledCount = regs.filter(r => r.status === 'Cancelled').length
        const noShowCount = regs.filter(r => r.status === 'No-Show').length
        const attendanceRate = registeredCount > 0 ? attendedCount / registeredCount : 0

        // Calculate revenue (if event has price)
        const revenue = event.price && event.price > 0
          ? attendedCount * parseFloat(event.price.toString())
          : 0

        return {
          event_id: event.event_id,
          title: event.title,
          event_date: event.event_date,
          status: event.status,
          registration_required: event.registration_required,
          capacity: event.capacity,
          registered_count: registeredCount,
          attended_count: attendedCount,
          cancelled_count: cancelledCount,
          no_show_count: noShowCount,
          attendance_rate: attendanceRate,
          revenue,
          currency: event.currency || 'USD',
        }
      })
    )

    // Calculate summary
    const totalEvents = reports.length
    const totalRegistrations = reports.reduce((sum, r) => sum + r.registered_count, 0)
    const totalAttended = reports.reduce((sum, r) => sum + r.attended_count, 0)
    const averageAttendanceRate = reports.length > 0
      ? reports.reduce((sum, r) => sum + r.attendance_rate, 0) / reports.length
      : 0
    const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0)

    return NextResponse.json({
      success: true,
      reports,
      summary: {
        totalEvents,
        totalRegistrations,
        totalAttended,
        averageAttendanceRate,
        totalRevenue,
      },
    })
  } catch (error: any) {
    if (error.message.includes('Access denied') || error.message.includes('Authentication')) {
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
