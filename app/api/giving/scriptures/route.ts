import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/giving/scriptures - Get active giving scriptures
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('church_id')

    let query = (supabase
      .from('giving_scriptures') as any)
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (churchId) {
      query = query.or(`church_id.eq.${churchId},church_id.is.null`)
    } else {
      query = query.is('church_id', null)
    }

    const { data: scriptures, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: scriptures || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
