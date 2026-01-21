import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserContext'
import { Database } from '@/types/database'
import { sendVolunteerStatusUpdate } from '@/lib/email/volunteerStatusUpdate'

type Volunteer = Database['public']['Tables']['volunteers']['Row']

// PATCH /api/volunteers/[id] - Update volunteer status (Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: volunteerId } = await context.params
    const ctx = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    // Get existing volunteer data to check status change
    const { data: existingVolunteer, error: fetchError } = await supabase
      .from('volunteers')
      .select('*')
      .eq('volunteer_id', volunteerId)
      .single()

    if (fetchError || !existingVolunteer) {
      return NextResponse.json(
        { success: false, error: 'Volunteer not found' },
        { status: 404 }
      )
    }

    const typedExistingVolunteer = existingVolunteer as Volunteer

    if (typedExistingVolunteer.church_id !== ctx.churchId && typedExistingVolunteer.church_id !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const oldStatus = typedExistingVolunteer.status
    const updateData: any = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null

    const { data: volunteer, error } = await (supabase
      .from('volunteers') as any)
      .update(updateData)
      .eq('volunteer_id', volunteerId)
      .select()
      .single()

    if (error) throw error

    // Send status update email if status changed
    if (body.status !== undefined && body.status !== oldStatus) {
      try {
        await sendVolunteerStatusUpdate({
          name: volunteer.name,
          email: volunteer.email,
          department: volunteer.department,
          oldStatus,
          newStatus: body.status,
          notes: body.notes?.trim() || null,
        })
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Failed to send volunteer status update email:', emailError)
      }
    }

    return NextResponse.json({ success: true, data: volunteer })
  } catch (error: any) {
    if (error.message.includes('Access denied') || error.message.includes('Authentication')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/volunteers/[id] - Delete volunteer (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: volunteerId } = await context.params
    const ctx = await requireAdmin()
    const supabase = await createClient()

    // Verify volunteer belongs to admin's church
    const { data: existingVolunteer, error: fetchError } = await supabase
      .from('volunteers')
      .select('church_id')
      .eq('volunteer_id', volunteerId)
      .single()

    if (fetchError || !existingVolunteer) {
      return NextResponse.json(
        { success: false, error: 'Volunteer not found' },
        { status: 404 }
      )
    }

    const typedExistingVolunteer = existingVolunteer as Pick<Volunteer, 'church_id'>

    if (typedExistingVolunteer.church_id !== ctx.churchId && typedExistingVolunteer.church_id !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('volunteers')
      .delete()
      .eq('volunteer_id', volunteerId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

