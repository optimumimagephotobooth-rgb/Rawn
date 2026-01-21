import { createClient } from '@/lib/supabase/server'

/**
 * Award BTC to a user (simulation)
 */
export async function awardBTC(
  userId: string,
  churchId: string | null,
  amount: number,
  reason: string
): Promise<void> {
  const supabase = await createClient()

  // Get current BTC
  const { data: currentRaw } = await supabase
    .from('btc_wallets')
    .select('btc')
    .eq('user_id', userId)
    .eq('church_id', churchId || 'PUBLIC')
    .single()

  const current = currentRaw as { btc: number } | null
  const newBTC = (Number(current?.btc) || 0) + amount

  // Upsert BTC wallet record
  await (supabase
    .from('btc_wallets') as any)
    .upsert({
      user_id: userId,
      church_id: churchId || 'PUBLIC',
      btc: newBTC,
      last_reason: reason,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,church_id',
    })
}

