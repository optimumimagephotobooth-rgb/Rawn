import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generateMembershipId } from '@/lib/utils/id'
import { sendMembershipWelcome } from '@/lib/email/membershipWelcome'

// POST /api/membership - Register for membership
export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserContext()
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
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

    const membershipId = generateMembershipId()

    const { data: membership, error } = await (supabase
      .from('memberships') as any)
      .insert({
        membership_id: membershipId,
        church_id: ctx.churchId,
        user_id: ctx.id,
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        zip_code: body.zip_code?.trim() || null,
        country: body.country?.trim() || null,
        date_of_birth: body.date_of_birth || null,
        baptism_date: body.baptism_date || null,
        previous_church: body.previous_church?.trim() || null,
        how_did_you_hear: body.how_did_you_hear?.trim() || null,
        interests: body.interests || [],
        commitment_level: body.commitment_level || 'Regular',
        status: 'Pending',
        notes: body.notes?.trim() || null,
        welcome_email_sent: false,
      })
      .select()
      .single()

    if (error) throw error

    // Send welcome email
    try {
      await sendMembershipWelcome({
        membershipId,
        name: membership.name,
        email: membership.email,
        submittedAt: membership.created_at || new Date().toISOString(),
      })

      // Update welcome_email_sent flag
      await (supabase
        .from('memberships') as any)
        .update({ welcome_email_sent: true })
        .eq('membership_id', membershipId)
    } catch (emailError) {
      // Log error but don't fail the request
      console.error('Failed to send membership welcome email:', emailError)
    }

    return NextResponse.json({
      success: true,
      data: membership,
      message: 'Membership registration received. Welcome to RAWN Ministry!',
    })
  } catch (error: any) {
    if (error.message === 'Unauthenticated') {
      return NextResponse.json(
        { success: false, error: 'Please log in to register for membership' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// GET /api/membership - Get memberships (Admin only)
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
    const status = searchParams.get('status')
    const commitmentLevel = searchParams.get('commitment_level')

    let query = supabase
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false })

    if (ctx.churchId && ctx.churchId !== 'PUBLIC') {
      query = query.eq('church_id', ctx.churchId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (commitmentLevel) {
      query = query.eq('commitment_level', commitmentLevel)
    }

    const { data: memberships, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: memberships })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
