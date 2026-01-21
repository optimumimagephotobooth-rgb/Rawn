import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generateBlogPostId } from '@/lib/utils/id'
import { Database } from '@/types/database'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']

// Helper function to create slug from title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET /api/blog - Get blog posts (public or filtered)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const churchId = searchParams.get('church_id')
    const status = searchParams.get('status') || 'Published'
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (churchId) {
      query = query.eq('church_id', churchId)
    }

    if (search) {
      // Full-text search using PostgreSQL - search in title, content, excerpt, and tags
      const searchTerm = `%${search}%`
      
      // Build base query for text search with all filters
      let textQuery = supabase
        .from('blog_posts')
        .select('id')
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
      
      if (status) {
        textQuery = textQuery.eq('status', status)
      }
      if (category) {
        textQuery = textQuery.eq('category', category)
      }
      if (churchId) {
        textQuery = textQuery.eq('church_id', churchId)
      }
      
      const { data: textMatches } = await textQuery
      const textIds = (textMatches as Pick<BlogPost, 'id'>[] | null)?.map(p => p.id) || []
      
      // Build base query for tag search with all filters
      let tagQuery = supabase
        .from('blog_posts')
        .select('id')
        .contains('tags', [search])
      
      if (status) {
        tagQuery = tagQuery.eq('status', status)
      }
      if (category) {
        tagQuery = tagQuery.eq('category', category)
      }
      if (churchId) {
        tagQuery = tagQuery.eq('church_id', churchId)
      }
      
      const { data: tagMatches } = await tagQuery
      const tagIds = (tagMatches as Pick<BlogPost, 'id'>[] | null)?.map(p => p.id) || []
      
      // Combine unique IDs
      const allIds = [...new Set([...textIds, ...tagIds])]
      
      if (allIds.length > 0) {
        query = query.in('id', allIds)
      } else {
        // Return empty result set by using a non-existent ID
        query = query.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/blog - Create blog post (Admin/Editor only)
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext()
    
    if (ctx.role !== 'Admin' && ctx.role !== 'Teacher') {
      return NextResponse.json(
        { success: false, error: 'Admin or Editor access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const body = await request.json()

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Post title is required' },
        { status: 400 }
      )
    }

    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Post content is required' },
        { status: 400 }
      )
    }

    const postId = generateBlogPostId()
    const slug = body.slug?.trim() || createSlug(body.title)
    
    // Check if slug already exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Generate excerpt if not provided
    const excerpt = body.excerpt?.trim() || 
      body.content.substring(0, 200).replace(/[#*`]/g, '').trim() + '...'

    const { data: post, error } = await (supabase
      .from('blog_posts') as any)
      .insert({
        post_id: postId,
        church_id: ctx.churchId,
        title: body.title.trim(),
        slug,
        content: body.content.trim(),
        excerpt,
        author: body.author?.trim() || ctx.email,
        category: body.category || null,
        tags: body.tags || [],
        featured_image: body.featuredImage?.trim() || null,
        published_at: body.status === 'Published' ? new Date().toISOString() : null,
        status: body.status || 'Draft',
        seo_title: body.seoTitle?.trim() || null,
        seo_description: body.seoDescription?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: post })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

