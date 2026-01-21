import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/search - Global search across sermons, blog, events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      )
    }

    const searchTerm = `%${query.trim()}%`

    // Search sermons
    const { data: sermons } = await supabase
      .from('sermons')
      .select('id, sermon_id, title, category, date')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},speaker.ilike.${searchTerm}`)
      .limit(5)

    // Search blog posts
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('id, post_id, title, slug, category, published_at')
      .eq('status', 'Published')
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
      .limit(5)

    // Search events
    const { data: events } = await supabase
      .from('events')
      .select('id, event_id, title, category, event_date, status')
      .eq('status', 'Published')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5)

    return NextResponse.json({
      success: true,
      data: {
        sermons: sermons || [],
        blogPosts: blogPosts || [],
        events: events || [],
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

