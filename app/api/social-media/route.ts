import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/social-media - Get social media posts (Instagram/Facebook)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const platform = searchParams.get('platform') // 'Instagram', 'Facebook', or null for all
    const churchId = searchParams.get('church_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('social_media_posts')
      .select('*', { count: 'exact' })
      .order('posted_at', { ascending: false, nullsFirst: false })
      .order('cached_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (platform) {
      query = query.eq('platform', platform)
    }

    if (churchId) {
      query = query.eq('church_id', churchId)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching social media posts:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
    })
  } catch (error: any) {
    console.error('Error in social media API:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/social-media - Create/update social media post (Admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const userProfile = profile as { role?: string } | null
    if (userProfile?.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { platform, post_id, church_id, content, media_url, posted_at } = body

    if (!platform || !post_id) {
      return NextResponse.json(
        { success: false, error: 'Platform and post_id are required' },
        { status: 400 }
      )
    }

    // Upsert the post (insert or update if exists)
    const { data, error } = await (supabase
      .from('social_media_posts') as any)
      .upsert(
        {
          platform,
          post_id,
          church_id: church_id || null,
          content: content || null,
          media_url: media_url || null,
          posted_at: posted_at || null,
          cached_at: new Date().toISOString(),
        },
        {
          onConflict: 'platform,post_id,church_id',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error upserting social media post:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error: any) {
    console.error('Error in social media POST API:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
