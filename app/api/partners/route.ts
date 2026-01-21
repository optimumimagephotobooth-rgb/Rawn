import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/getUserContext'
import { generateId } from '@/lib/utils/id'

// POST /api/partners - Partner signup
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

    // Get user context if authenticated
    let userId: string | null = null
    let churchId: string | null = null
    try {
      const ctx = await getUserContext()
      userId = ctx.id
      churchId = ctx.churchId
    } catch {
      // User not authenticated, that's okay for public partner signup
    }

    const partnerId = `PT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data: partner, error } = await (supabase
      .from('partners') as any)
      .insert({
        partner_id: partnerId,
        church_id: churchId,
        user_id: userId,
        name: body.name.trim(),
        email: body.email.trim(),
        phone: body.phone?.trim() || null,
        address: body.address?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        zip_code: body.zipCode?.trim() || null,
        country: body.country?.trim() || null,
        commitment_level: body.commitmentLevel || 'One-time',
        notes: body.notes?.trim() || null,
        status: 'Active',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: partner,
      message: 'Thank you for becoming a partner! We will be in touch soon.',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
