import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generateChurchId } from '@/lib/utils/id'
import { logAudit } from '@/lib/utils/audit'

// POST /api/churches - Create church (onboarding)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Church name is required' },
        { status: 400 }
      )
    }

    const churchId = generateChurchId()

    // Create church
    const { data: church, error: churchError } = await supabase
      .from('churches')
      .insert({
        church_id: churchId,
        name: name.trim(),
        owner_email: authUser.email!,
        plan: 'Free',
        status: 'Active',
      } as any)
      .select()
      .single()

    if (churchError) throw churchError

    // Create or update user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        email: authUser.email!,
        role: 'Admin',
        church_id: churchId,
        status: 'Active',
      } as any, {
        onConflict: 'id',
      })
      .select()
      .single()

    if (userError) throw userError

    await logAudit('CHURCH_CREATED', { churchId, name }, authUser.id)

    return NextResponse.json({ success: true, data: { church, user } })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

