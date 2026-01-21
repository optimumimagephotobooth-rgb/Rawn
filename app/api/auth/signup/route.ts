import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Check if user needs email confirmation
    if (data.user && !data.session) {
      return NextResponse.json({
        success: true,
        message: 'Please check your email to confirm your account',
        requiresConfirmation: true,
      })
    }

    // If session exists, user is automatically signed in
    // Check if user needs onboarding
    if (data.user) {
      const { data: userDataRaw } = await supabase
        .from('users')
        .select('church_id')
        .eq('id', data.user.id)
        .single()

      const userData = userDataRaw as { church_id: string | null } | null

      if (!userData?.church_id) {
        return NextResponse.json({
          success: true,
          requiresOnboarding: true,
          user: data.user,
        })
      }
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sign up' },
      { status: 500 }
    )
  }
}

