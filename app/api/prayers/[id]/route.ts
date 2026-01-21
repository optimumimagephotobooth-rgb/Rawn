import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserContext'
import { awardXP } from '@/lib/utils/xp'
import { awardBTC } from '@/lib/utils/btc'
import { logAudit } from '@/lib/utils/audit'

// PATCH /api/prayers/[id] - Update prayer status
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const ctx = await requireAdmin()
    const supabase = await createClient()
    const body = await request.json()

    const { status } = body
    const validStatuses = ['received', 'prayed', 'followed up']

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be one of: received, prayed, followed up' },
        { status: 400 }
      )
    }

    // Get current prayer
    const { data: currentPrayerRaw, error: fetchError } = await supabase
      .from('prayers')
      .select('*')
      .eq('prayer_id', id)
      .single()

    const currentPrayer = currentPrayerRaw as {
      church_id: string | null
      email: string | null
      status: string
      title: string | null
    } & Record<string, any> | null

    if (fetchError || !currentPrayer) {
      return NextResponse.json(
        { success: false, error: 'Prayer not found' },
        { status: 404 }
      )
    }

    // Permission check: admin can only update prayers from their church,
    // PUBLIC prayers, or global (null church_id) prayers
    if (
      currentPrayer.church_id !== null &&
      currentPrayer.church_id !== 'PUBLIC' &&
      currentPrayer.church_id !== ctx.churchId
    ) {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      )
    }

    // Business logic: can't mark your own prayer as prayed
    if (status === 'prayed' && currentPrayer.email === ctx.email) {
      return NextResponse.json(
        { success: false, error: 'Cannot mark your own prayer request as prayed' },
        { status: 400 }
      )
    }

    // No change needed
    if (currentPrayer.status === status) {
      return NextResponse.json({
        success: true,
        data: currentPrayer,
        message: `Prayer is already "${status}"`,
      })
    }

    // Update prayer
    const { data: updatedPrayer, error: updateError } = await (supabase
      .from('prayers') as any)
      .update({
        status,
        updated_by: ctx.id,
        updated_at: new Date().toISOString(),
      })
      .eq('prayer_id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Award rewards when prayer is marked as prayed
    let rewardsAwarded = false
    if (
      status === 'prayed' &&
      currentPrayer.email &&
      currentPrayer.status !== 'prayed'
    ) {
      try {
        // Find user by email
        const { data: userRaw } = await supabase
          .from('users')
          .select('id')
          .eq('email', currentPrayer.email)
          .single()

        const user = userRaw as { id: string } | null

        if (user) {
          await awardXP(
            user.id,
            currentPrayer.church_id,
            25,
            `Prayer approved: ${currentPrayer.title || 'Untitled'}`
          )
          await awardBTC(
            user.id,
            currentPrayer.church_id,
            0.00025,
            `Prayer approved: ${currentPrayer.title || 'Untitled'}`
          )
          rewardsAwarded = true
        }
      } catch (rewardError) {
        console.error('Reward failed:', rewardError)
      }
    }

    await logAudit(
      'PRAYER_STATUS_UPDATE',
      {
        prayerId: id,
        from: currentPrayer.status,
        to: status,
        rewardsAwarded,
      },
      ctx.id
    )

    return NextResponse.json({
      success: true,
      data: updatedPrayer,
      rewardsAwarded,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

