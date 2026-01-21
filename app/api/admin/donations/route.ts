import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserContext'
import { Database } from '@/types/database'

type Donation = Database['public']['Tables']['donations']['Row']

// GET /api/admin/donations - Get all donations (Admin only)
export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAdmin()
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const range = searchParams.get('range') || 'all'

    let query = supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })

    if (ctx.churchId && ctx.churchId !== 'PUBLIC') {
      query = query.eq('church_id', ctx.churchId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply date range filter
    if (range !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (range) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(0)
      }
      query = query.gte('created_at', startDate.toISOString())
    }

    const { data: donations, error } = await query

    if (error) throw error

    // Calculate totals
    const donationsList = donations as Donation[] | null || []
    const total = donationsList.reduce((sum, d) => sum + parseFloat((d.amount || 0).toString()), 0)
    const completed = donationsList.filter(d => d.status === 'Completed').reduce((sum, d) => sum + parseFloat((d.amount || 0).toString()), 0)
    const pending = donationsList.filter(d => d.status === 'Pending').reduce((sum, d) => sum + parseFloat((d.amount || 0).toString()), 0)
    const failed = donationsList.filter(d => d.status === 'Failed').reduce((sum, d) => sum + parseFloat((d.amount || 0).toString()), 0)

    return NextResponse.json({
      success: true,
      data: donations,
      summary: {
        total,
        completed,
        pending,
        failed,
        count: donationsList.length,
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

