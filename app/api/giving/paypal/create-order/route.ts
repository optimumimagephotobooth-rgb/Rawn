import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
    const body = await request.json() as { amount?: number; currency?: string; donationId?: string }
    const { amount, currency, donationId } = body

    if (!amount || !currency || !donationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = paypalClient()
    const createRequest = new paypal.orders.OrdersCreateRequest()
    createRequest.prefer('return=representation')
    createRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: donationId,
          description: 'Donation to RAWN Ministry',
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'RAWN Ministry',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/give/success?donation_id=${donationId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/give?cancelled=true`,
      },
    })

    const order = await client.execute(createRequest)

    // Update donation with PayPal order ID
    const supabase = await createClient()
    await (supabase
      .from('donations') as any)
      .update({ paypal_order_id: order.result.id })
      .eq('donation_id', donationId)

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.result.id,
      },
    })
  } catch (error: any) {
    console.error('PayPal create order error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
