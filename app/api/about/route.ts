import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type MinistryContent = Database['public']['Tables']['ministry_content']['Row']

// GET /api/about - Get leadership profiles and ministry content (public)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const churchId = searchParams.get('church_id') || 'PUBLIC'

    // Fetch leadership profiles
    const { data: leadership, error: leadershipError } = await supabase
      .from('leadership_profiles')
      .select('*')
      .eq('church_id', churchId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (leadershipError) throw leadershipError

    // Fetch ministry content (intro video, photos)
    const { data: content, error: contentError } = await supabase
      .from('ministry_content')
      .select('*')
      .eq('church_id', churchId)
      .single()

    if (contentError && contentError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is okay
      throw contentError
    }

    const ministryContent = content as MinistryContent | null

    return NextResponse.json({
      success: true,
      data: {
        leadership: leadership || [],
        introVideoUrl: ministryContent?.intro_video_url || '',
        ministryPhotos: ministryContent?.ministry_photos || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
