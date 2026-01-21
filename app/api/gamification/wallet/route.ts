import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/getUserContext'

// GET /api/gamification/wallet - Get user wallet
export async function GET() {
  try {
    const ctx = await requireAuth()
    const supabase = await createClient()

    const { data: walletRaw, error } = await supabase
      .from('btc_wallets')
      .select('*')
      .eq('user_id', ctx.id)
      .eq('church_id', ctx.churchId || 'PUBLIC')
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's okay, return empty wallet
      throw error
    }

    const { data: xpRaw } = await supabase
      .from('gamification')
      .select('*')
      .eq('user_id', ctx.id)
      .eq('church_id', ctx.churchId || 'PUBLIC')
      .single()

    const wallet = walletRaw as { btc: number } | null
    const xp = xpRaw as { xp: number; level: number } | null

    return NextResponse.json({
      success: true,
      data: {
        btc: wallet ? Number(wallet.btc) : 0,
        xp: xp?.xp || 0,
        level: xp?.level || 1,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

