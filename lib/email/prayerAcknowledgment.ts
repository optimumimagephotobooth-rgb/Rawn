/**
 * Email service for prayer request acknowledgments
 * This is a basic implementation. In production, integrate with:
 * - Resend (recommended for Next.js)
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 */

interface PrayerRequestDetails {
  prayerId: string
  name: string | null
  email: string
  content: string
  isConfidential: boolean
  submittedAt: string
}

export async function sendPrayerAcknowledgment(
  prayer: PrayerRequestDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!prayer.email) {
      // No email provided, skip sending
      return { success: true }
    }

    const date = new Date(prayer.submittedAt)
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
    const subject = `Prayer Request Received - We're Praying for You`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prayer Request Acknowledgment</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Prayer Request Received</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello ${prayer.name || 'Friend'},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for sharing your prayer request with us. We have received your request and our pastoral team will be praying for you.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">Request Details</h2>
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong style="color: #1f2937;">Request ID:</strong> ${prayer.prayerId}
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong style="color: #1f2937;">Submitted:</strong> ${dateStr} at ${timeStr}
              </p>
              
              ${prayer.isConfidential ? `
              <p style="color: #059669; font-size: 14px; margin: 8px 0; padding: 8px; background: #d1fae5; border-radius: 4px;">
                <strong>✓ Confidential Request:</strong> Your request has been marked as confidential and will only be visible to our pastoral staff.
              </p>
              ` : ''}
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We believe in the power of prayer and are committed to lifting your request before the Lord. Our team will review your request and follow up as appropriate.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              If you have any urgent needs or would like to speak with someone from our pastoral care team, please don't hesitate to reach out to us directly.
            </p>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <p style="margin: 0; color: #92400e; font-size: 14px; font-style: italic;">
                "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." - Philippians 4:6
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Blessings,<br>
              <strong>RAWN Ministry Pastoral Care Team</strong>
            </p>
          </div>
        </body>
      </html>
    `.trim()

    const textContent = `
Prayer Request Received - We're Praying for You

Hello ${prayer.name || 'Friend'},

Thank you for sharing your prayer request with us. We have received your request and our pastoral team will be praying for you.

Request Details:
- Request ID: ${prayer.prayerId}
- Submitted: ${dateStr} at ${timeStr}
${prayer.isConfidential ? '- Confidential Request: Your request has been marked as confidential and will only be visible to our pastoral staff.\n' : ''}

We believe in the power of prayer and are committed to lifting your request before the Lord. Our team will review your request and follow up as appropriate.

If you have any urgent needs or would like to speak with someone from our pastoral care team, please don't hesitate to reach out to us directly.

"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." - Philippians 4:6

Blessings,
RAWN Ministry Pastoral Care Team
    `.trim()

    // In production, use an email service here
    if (process.env.EMAIL_SERVICE_URL) {
      const response = await fetch(process.env.EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: prayer.email,
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
      console.log('📧 Prayer Request Acknowledgment Email:')
      console.log('To:', prayer.email)
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
    console.error('Failed to send prayer acknowledgment email:', error)
    return { success: false, error: error.message }
  }
}
