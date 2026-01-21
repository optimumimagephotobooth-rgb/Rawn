import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generateVolunteerId } from '@/lib/utils/id'
import { sendVolunteerConfirmation } from '@/lib/email/volunteerConfirmation'

// POST /api/volunteers - Create volunteer signup (public)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!body.department) {
      return NextResponse.json(
        { success: false, error: 'Department is required' },
        { status: 400 }
      )
    }

    // Get user context if authenticated
    let userId: string | null = null
    let churchId: string | null = null
    try {
      const ctx = await getUserContext()
      userId = ctx.id
      churchId = ctx.churchId
    } catch {
      // User not authenticated, that's okay for public signup
    }

    const volunteerId = generateVolunteerId()

    const { data: volunteer, error } = await (supabase
      .from('volunteers') as any)
      .insert({
        volunteer_id: volunteerId,
        church_id: churchId,
        user_id: userId,
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        department: body.department,
        skills: body.skills || [],
        availability: body.availability?.trim() || null,
        status: 'Pending',
        notes: body.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error

    // Send confirmation email
    try {
      await sendVolunteerConfirmation({
        volunteerId,
        name: volunteer.name,
        email: volunteer.email,
        department: volunteer.department,
        submittedAt: volunteer.created_at || new Date().toISOString(),
      })
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send volunteer confirmation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      data: volunteer,
      message: 'Thank you for your interest in volunteering! We will contact you soon.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/volunteers - Get volunteers (Admin only)
export async function GET(request: NextRequest) {
  try {
    const ctx = await getUserContext()
    
    if (ctx.role !== 'Admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const department = searchParams.get('department')
    const status = searchParams.get('status')

    let query = supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false })

    if (ctx.churchId && ctx.churchId !== 'PUBLIC') {
      query = query.eq('church_id', ctx.churchId)
    }

    if (department) {
      query = query.eq('department', department)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: volunteers, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: volunteers })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

