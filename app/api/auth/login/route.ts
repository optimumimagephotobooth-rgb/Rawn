import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/auth/login - Handle both OAuth and email/password login
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { provider, email, password } = body

    // OAuth login (Google)
    if (provider === 'google') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
        },
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ url: data.url })
    }

    // Email/password login
    if (email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Check if user needs onboarding
      if (data.user) {
        const { data: userDataRaw } = await supabase
          .from('users')
          .select('church_id')
          .eq('id', data.user.id)
          .single()

        const userData = userDataRaw as { church_id: string | null } | null

        return NextResponse.json({
          success: true,
          user: data.user,
          session: data.session,
          requiresOnboarding: !userData?.church_id,
        })
      }

      return NextResponse.json({
        success: true,
        user: data.user,
        session: data.session,
      })
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide provider, or email and password' },
      { status: 400 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 500 }
    )
  }
}

