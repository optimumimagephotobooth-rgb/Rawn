import { createClient } from '@/lib/supabase/server'
import { UserContext } from '@/types/user'
import { Database } from '@/types/database'

export async function getUserContext(): Promise<UserContext> {
  const supabase = await createClient()
  
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  if (!authUser || authError) {
    throw new Error('Unauthenticated')
  }

  // First, query just the user data (without join to avoid RLS issues)
  const { data: userDataRaw, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // Check if user doesn't exist in users table (needs onboarding)
  if (userError) {
    // PGRST116 is the error code for "no rows returned" in Supabase
    if (userError.code === 'PGRST116' || userError.message?.includes('No rows')) {
      throw new Error('USER_NEEDS_ONBOARDING: User account exists but profile is incomplete. Please complete onboarding.')
    }
    // Log other database errors for debugging
    console.error('Database error fetching user:', {
      userId: authUser.id,
      email: authUser.email,
      error: userError.message,
      code: userError.code,
    })
    throw new Error(`Database error: ${userError.message || 'Failed to fetch user data'}`)
  }

  const userData = userDataRaw as {
    id: string
    email: string
    role: 'Admin' | 'Editor' | 'Media Team' | 'Teacher' | 'Student'
    church_id: string | null
    status: 'Active' | 'Inactive' | 'Suspended'
    joined_at: string
    created_at: string
    updated_at: string
  } | null

  if (!userData) {
    throw new Error('USER_NEEDS_ONBOARDING: User account exists but profile is incomplete. Please complete onboarding.')
  }

  if (userData.status !== 'Active') {
    throw new Error('User not found or inactive')
  }

  // Fetch church data separately if user has a church_id
  let church = undefined
  if (userData.church_id) {
    const { data: churchData } = await supabase
      .from('churches')
      .select('*')
      .eq('church_id', userData.church_id)
      .single()
    
    if (churchData) {
      const churchRow = churchData as Database['public']['Tables']['churches']['Row']
      church = {
        id: churchRow.id,
        churchId: churchRow.church_id,
        name: churchRow.name,
        plan: churchRow.plan,
        status: churchRow.status,
      }
    }
  }

  return {
    id: userData.id,
    email: userData.email,
    role: userData.role,
    churchId: userData.church_id,
    status: userData.status,
    joinedAt: userData.joined_at,
    createdAt: userData.created_at,
    updatedAt: userData.updated_at,
    church,
  }
}

export async function requireAuth(): Promise<UserContext> {
  try {
    return await getUserContext()
  } catch {
    throw new Error('Authentication required')
  }
}

export async function requireRole(role: 'Admin' | 'Editor' | 'Media Team' | 'Teacher' | 'Student'): Promise<UserContext> {
  const ctx = await requireAuth()
  if (ctx.role !== role) {
    throw new Error(`Access denied: ${role} role required`)
  }
  return ctx
}

export async function requireEditorOrAdmin(): Promise<UserContext> {
  const ctx = await requireAuth()
  if (!['Admin', 'Editor'].includes(ctx.role)) {
    throw new Error('Access denied: Editor or Admin role required')
  }
  return ctx
}

export async function requireMediaOrAdmin(): Promise<UserContext> {
  const ctx = await requireAuth()
  if (!['Admin', 'Media Team'].includes(ctx.role)) {
    throw new Error('Access denied: Media Team or Admin role required')
  }
  return ctx
}

export async function requireAdmin(): Promise<UserContext> {
  return requireRole('Admin')
}

