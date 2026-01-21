import { createClient } from '@/lib/supabase/server'

export async function logAudit(
  action: string,
  meta?: Record<string, any>,
  userId?: string
): Promise<void> {
  const supabase = await createClient()

  // Try to get current user if not provided
  let auditUserId: string | null | undefined = userId
  if (!auditUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    auditUserId = user?.id || null
  }

  await (supabase
    .from('audit_logs') as any)
    .insert({
      user_id: auditUserId ?? null,
      action,
      meta: meta ? JSON.stringify(meta) : null,
      timestamp: new Date().toISOString(),
    })
}

