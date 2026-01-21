import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'

// GET /api/giving/donations - Get user's donation history
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext()
    const supabase = await createClient()

    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .or(`user_id.eq.${ctx.id},donor_email.eq.${ctx.email}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data: donations })
  } catch (error: any) {
    if (error.message === 'Unauthenticated') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

