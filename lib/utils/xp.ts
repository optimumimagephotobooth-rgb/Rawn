import { createClient } from '@/lib/supabase/server'

/**
 * Calculate level from XP
 * Level = floor(XP / 100) + 1
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

/**
 * Award XP to a user
 */
export async function awardXP(
  userId: string,
  churchId: string | null,
  amount: number,
  reason: string
): Promise<void> {
  const supabase = await createClient()

  // Get current XP
  const { data: currentRaw } = await supabase
    .from('gamification')
    .select('xp')
    .eq('user_id', userId)
    .eq('church_id', churchId || 'PUBLIC')
    .single()

  const current = currentRaw as { xp: number } | null

  const newXP = (current?.xp || 0) + amount
  const newLevel = calculateLevel(newXP)

  // Upsert gamification record
  await (supabase
    .from('gamification') as any)
    .upsert({
      user_id: userId,
      church_id: churchId || 'PUBLIC',
      xp: newXP,
      level: newLevel,
      last_reason: reason,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,church_id',
    })
}

