/**
 * Email service for donation receipts
 * This is a basic implementation. In production, integrate with:
 * - Resend (recommended for Next.js)
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 */

interface DonationDetails {
  donationId: string
  amount: number
  currency: string
  donorName: string | null
  donorEmail: string
  paymentMethod: string
  isRecurring: boolean
  date: string
}

export async function sendDonationReceipt(
  donation: DonationDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    const date = new Date(donation.date)
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })

    // Build email content
    const subject = `Thank You for Your Donation - Receipt #${donation.donationId}`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Donation Receipt</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Your Generosity!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello ${donation.donorName || 'Friend'},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your generous donation to RAWN Ministry. Your support enables us to equip intercessors, prophets, and disciples across the nations.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Donation Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Donation ID:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1f2937;">${donation.donationId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1f2937; font-size: 18px;">${donation.currency} ${donation.amount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payment Method:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1f2937;">${donation.paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Type:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1f2937;">${donation.isRecurring ? 'Recurring Donation' : 'One-time Donation'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1f2937;">${dateStr} at ${timeStr}</td>
                </tr>
              </table>
            </div>
            
            ${donation.isRecurring ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Recurring Donation:</strong> Your donation will be processed automatically on a recurring basis. You can manage or cancel your recurring donation at any time by contacting us.
                </p>
              </div>
            ` : ''}
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>Tax Deductible:</strong> This donation may be tax-deductible. Please keep this receipt for your records. RAWN Ministry is a registered 501(c)(3) organization.
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">
              Your partnership means the world to us. Together, we are advancing the Kingdom of God across the nations.
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              If you have any questions about this donation, please contact us. We're here to help!
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
              Blessings,<br>
              The RAWN Ministry Team
            </p>
          </div>
        </body>
      </html>
    `

    const textContent = `
Thank You for Your Donation - Receipt #${donation.donationId}

Hello ${donation.donorName || 'Friend'},

Thank you for your generous donation to RAWN Ministry. Your support enables us to equip intercessors, prophets, and disciples across the nations.

Donation Details:
- Donation ID: ${donation.donationId}
- Amount: ${donation.currency} ${donation.amount.toFixed(2)}
- Payment Method: ${donation.paymentMethod}
- Type: ${donation.isRecurring ? 'Recurring Donation' : 'One-time Donation'}
- Date: ${dateStr} at ${timeStr}

${donation.isRecurring ? 'Recurring Donation: Your donation will be processed automatically on a recurring basis. You can manage or cancel your recurring donation at any time by contacting us.\n' : ''}

Tax Deductible: This donation may be tax-deductible. Please keep this receipt for your records. RAWN Ministry is a registered 501(c)(3) organization.

Your partnership means the world to us. Together, we are advancing the Kingdom of God across the nations.

If you have any questions about this donation, please contact us. We're here to help!

Blessings,
The RAWN Ministry Team
    `.trim()

    // In production, use an email service here
    if (process.env.EMAIL_SERVICE_URL) {
      const response = await fetch(process.env.EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: donation.donorEmail,
          subject,
          html: htmlContent,
          text: textContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } else {
      // Log email content in development
      console.log('📧 Donation Receipt Email:')
      console.log('To:', donation.donorEmail)
      console.log('Subject:', subject)
      console.log('---')
      console.log(textContent)
      console.log('---')
      
      // In production, you should always have an email service configured
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ EMAIL_SERVICE_URL not configured. Email not sent.')
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Failed to send donation receipt email:', error)
    return { success: false, error: error.message }
  }
}
