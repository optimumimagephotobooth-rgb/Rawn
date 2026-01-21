import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserContext'

// GET /api/sermons/[id] - Get sermon by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data: sermon, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('sermon_id', id)
      .single()

    if (error || !sermon) {
      return NextResponse.json(
        { success: false, error: 'Sermon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: sermon })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/sermons/[id] - Update sermon (Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const ctx = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    // Verify sermon belongs to admin's church
    const { data: currentSermonRaw } = await supabase
      .from('sermons')
      .select('church_id')
      .eq('sermon_id', id)
      .single()

    const currentSermon = currentSermonRaw as { church_id: string | null } | null
    if (!currentSermon || currentSermon.church_id !== ctx.churchId) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.title !== undefined) updateData.title = body.title.trim()
    if (body.speaker !== undefined) updateData.speaker = body.speaker?.trim() || null
    if (body.category !== undefined) updateData.category = body.category?.trim() || null
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.videoUrl !== undefined) updateData.video_url = body.videoUrl?.trim() || null
    if (body.audioUrl !== undefined) updateData.audio_url = body.audioUrl?.trim() || null
    if (body.notesUrl !== undefined) updateData.notes_url = body.notesUrl?.trim() || null
    if (body.scriptureReferences !== undefined) updateData.scripture_references = body.scriptureReferences || null
    if (body.date !== undefined) updateData.date = body.date || null

    const { data: sermon, error } = await (supabase
      .from('sermons') as any)
      .update(updateData)
      .eq('sermon_id', id)
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

// DELETE /api/sermons/[id] - Delete sermon (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const ctx = await requireAdmin()
    const supabase = await createClient()

    // Verify sermon belongs to admin's church
    const { data: currentSermonRaw } = await supabase
      .from('sermons')
      .select('church_id')
      .eq('sermon_id', id)
      .single()

    const currentSermon = currentSermonRaw as { church_id: string | null } | null
    if (!currentSermon || currentSermon.church_id !== ctx.churchId) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('sermon_id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

