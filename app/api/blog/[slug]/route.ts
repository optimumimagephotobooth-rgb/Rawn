import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { Database } from '@/types/database'

type BlogPost = Database['public']['Tables']['blog_posts']['Row']
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update']

// GET /api/blog/[slug] - Get single blog post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const supabase = await createClient()

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'Published')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Post not found' },
          { status: 404 }
        )
      }
      throw error
    }

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    // Type assertion to ensure TypeScript knows the post type
    const typedPost = post as BlogPost

    // Get related posts (same category, excluding current)
    let relatedPosts: any[] = []
    if (typedPost.category) {
      const { data: related } = await supabase
        .from('blog_posts')
        .select('id, post_id, title, slug, excerpt, featured_image, published_at')
        .eq('category', typedPost.category)
        .eq('status', 'Published')
        .neq('id', typedPost.id)
        .order('published_at', { ascending: false })
        .limit(3)

      relatedPosts = related || []
    }

    return NextResponse.json({
      success: true,
      data: {
        ...typedPost,
        relatedPosts,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/blog/[slug] - Update blog post (Admin/Editor only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const ctx = await getUserContext()
    
    if (ctx.role !== 'Admin' && ctx.role !== 'Teacher') {
      return NextResponse.json(
        { success: false, error: 'Admin or Editor access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const body = await request.json()

    // Verify post belongs to admin's church
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('church_id, id, published_at')
      .eq('slug', slug)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    const typedExistingPost = existingPost as Pick<BlogPost, 'church_id' | 'id' | 'published_at'>

    if (typedExistingPost.church_id !== ctx.churchId && typedExistingPost.church_id !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (body.title !== undefined) updateData.title = body.title.trim()
    if (body.slug !== undefined) updateData.slug = body.slug.trim()
    if (body.content !== undefined) updateData.content = body.content.trim()
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt?.trim() || null
    if (body.author !== undefined) updateData.author = body.author?.trim() || null
    if (body.category !== undefined) updateData.category = body.category || null
    if (body.tags !== undefined) updateData.tags = body.tags || []
    if (body.featuredImage !== undefined) updateData.featured_image = body.featuredImage?.trim() || null
    if (body.status !== undefined) {
      updateData.status = body.status
      // Set published_at if status changes to Published
      if (body.status === 'Published' && !typedExistingPost.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }
    if (body.seoTitle !== undefined) updateData.seo_title = body.seoTitle?.trim() || null
    if (body.seoDescription !== undefined) updateData.seo_description = body.seoDescription?.trim() || null

    const { data: post, error } = await (supabase
      .from('blog_posts') as any)
      .update(updateData)
      .eq('slug', slug)
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

// DELETE /api/blog/[slug] - Delete blog post (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params
    const ctx = await getUserContext()
    
    if (ctx.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Verify post belongs to admin's church
    const { data: existingPost, error: fetchError } = await supabase
      .from('blog_posts')
      .select('church_id')
      .eq('slug', slug)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    const typedExistingPost = existingPost as Pick<BlogPost, 'church_id'>

    if (typedExistingPost.church_id !== ctx.churchId && typedExistingPost.church_id !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('slug', slug)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

