import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendDonationReceipt } from '@/lib/email/donationReceipt'
import paypal from '@paypal/checkout-server-sdk'

function paypalClient() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured')
  }

  const env =
    environment === 'production'
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret)

  return new paypal.core.PayPalHttpClient(env)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { orderId?: string; donationId?: string }
    const { orderId, donationId } = body

    if (!orderId || !donationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = paypalClient()
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderId)
    captureRequest.requestBody({})

    const capture = await client.execute(captureRequest)

    if (capture.result.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get donation details
    const { data: donation, error: donationError } = await (supabase
      .from('donations') as any)
      .select('*')
      .eq('donation_id', donationId)
      .single()

    if (donationError || !donation) {
      throw new Error('Donation not found')
    }

    // Update donation status
    const { error: updateError } = await (supabase
      .from('donations') as any)
      .update({
        status: 'Completed',
        payment_id: capture.result.id,
        paypal_order_id: orderId,
        receipt_sent: false,
      })
      .eq('donation_id', donationId)

    if (updateError) throw updateError

    // Send receipt email (async, don't wait)
    sendDonationReceipt({
      donationId: donation.donation_id,
      amount: parseFloat(donation.amount),
      currency: donation.currency,
      donorName: donation.donor_name,
      donorEmail: donation.donor_email,
      paymentMethod: 'PayPal',
      isRecurring: donation.is_recurring,
      date: donation.created_at,
    })
      .then(() => {
        // Update receipt_sent flag
        ;(supabase
          .from('donations') as any)
          .update({ receipt_sent: true })
          .eq('donation_id', donationId)
          .then(() => {})
      })
      .catch((err) => {
        console.error('Failed to send receipt email:', err)
      })

    return NextResponse.json({
      success: true,
      data: {
        orderId: capture.result.id,
        status: capture.result.status,
      },
    })
  } catch (error: any) {
    console.error('PayPal capture order error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to capture PayPal payment' },
      { status: 500 }
    )
  }
}
