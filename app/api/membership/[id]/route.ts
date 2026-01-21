import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserContext'
import { Database } from '@/types/database'

type Membership = Database['public']['Tables']['memberships']['Row']

// PATCH /api/membership/[id] - Update membership status (Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: membershipId } = await context.params
    const ctx = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    // Verify membership belongs to admin's church
    const { data: existingMembership, error: fetchError } = await supabase
      .from('memberships')
      .select('church_id')
      .eq('membership_id', membershipId)
      .single()

    if (fetchError || !existingMembership) {
      return NextResponse.json(
        { success: false, error: 'Membership not found' },
        { status: 404 }
      )
    }

    const typedExistingMembership = existingMembership as Pick<Membership, 'church_id'>

    if (typedExistingMembership.church_id !== ctx.churchId && typedExistingMembership.church_id !== 'PUBLIC') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const updateData: any = {}
    if (body.status !== undefined) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null

    const { data: membership, error } = await (supabase
      .from('memberships') as any)
      .update(updateData)
      .eq('membership_id', membershipId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: membership })
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
