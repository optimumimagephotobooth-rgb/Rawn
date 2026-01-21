import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generateSermonId } from '@/lib/utils/id'

// GET /api/sermons - Get sermons (public or filtered)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const churchId = searchParams.get('church_id')
    const search = searchParams.get('search')?.trim()

    let query = supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (churchId) {
      query = query.eq('church_id', churchId)
    }

    // Full-text search using PostgreSQL text search
    if (search) {
      query = query.textSearch('title,description,speaker', search, {
        type: 'websearch',
        config: 'english'
      })
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    // Fallback to simple ILIKE search if full-text search fails
    if (error.code === 'PGRST116' || error.message?.includes('textSearch')) {
      try {
        const supabase = await createClient()
        const searchParams = request.nextUrl.searchParams
        const category = searchParams.get('category')
        const churchId = searchParams.get('church_id')
        const search = searchParams.get('search')?.trim()

        let query = supabase
          .from('sermons')
          .select('*')
          .order('date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })

        if (category) {
          query = query.eq('category', category)
        }

        if (churchId) {
          query = query.eq('church_id', churchId)
        }

        // Fallback: simple ILIKE search
        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,speaker.ilike.%${search}%`)
        }

        const { data, error: fallbackError } = await query
        if (fallbackError) throw fallbackError

        return NextResponse.json({ success: true, data })
      } catch (fallbackError: any) {
        return NextResponse.json(
          { success: false, error: fallbackError.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/sermons - Create sermon (Admin only)
export async function POST(request: NextRequest) {
  try {
    let ctx
    try {
      ctx = await getUserContext()
    } catch (error: any) {
      // Handle user not found / needs onboarding
      if (error.message?.includes('USER_NEEDS_ONBOARDING')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Please complete your account setup first. Redirecting to onboarding...',
            requiresOnboarding: true 
          },
          { status: 403 }
        )
      }
      // Re-throw other errors
      throw error
    }
    
    if (ctx.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const body = await request.json()

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Sermon title is required' },
        { status: 400 }
      )
    }

    const sermonId = generateSermonId()

    const { data: sermon, error } = await (supabase
      .from('sermons') as any)
      .insert({
        sermon_id: sermonId,
        church_id: ctx.churchId,
        title: body.title.trim(),
        speaker: body.speaker?.trim() || null,
        category: body.category?.trim() || null,
        description: body.description?.trim() || null,
        video_url: body.videoUrl?.trim() || null,
        audio_url: body.audioUrl?.trim() || null,
        notes_url: body.notesUrl?.trim() || null,
        scripture_references: body.scriptureReferences || null,
        date: body.date || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: sermon })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

