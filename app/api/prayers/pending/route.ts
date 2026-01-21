import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserContext'

// GET /api/prayers/pending - Get received prayers (Admin only)
export async function GET() {
  try {
    const ctx = await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('prayers')
      .select('*')
      .eq('status', 'received')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

