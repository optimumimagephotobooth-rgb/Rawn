import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'

// GET /api/gamification/leaderboard - Get XP leaderboard
export async function GET() {
  try {
    const supabase = await createClient()
    let ctx = null
    let churchId = null

    try {
      ctx = await getUserContext()
      churchId = ctx.churchId
    } catch {
      // Not authenticated, return empty
      return NextResponse.json({ success: true, data: [] })
    }

    const { data, error } = await supabase
      .from('gamification')
      .select(`
        *,
        users!inner(email)
      `)
      .eq('church_id', churchId || 'PUBLIC')
      .order('xp', { ascending: false })
      .limit(100)

    if (error) throw error

    // Transform data
    const leaderboard = data.map((item: any) => ({
      email: item.users.email,
      xp: item.xp,
      level: item.level,
      lastReason: item.last_reason,
    }))

    return NextResponse.json({ success: true, data: leaderboard })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

