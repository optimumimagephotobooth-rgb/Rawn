/**
 * Email service for event registration confirmations
 * This is a basic implementation. In production, integrate with:
 * - Resend (recommended for Next.js)
 * - SendGrid
 * - AWS SES
 * - Nodemailer with SMTP
 */

interface EventDetails {
  title: string
  event_date: string
  event_time: string | null
  end_date: string | null
  end_time: string | null
  location: string | null
  zoom_url: string | null
  is_online: boolean
  price: number
  currency: string
}

interface RegistrationDetails {
  name: string
  email: string
  phone: string | null
  registrationId: string
}

export async function sendEventRegistrationConfirmation(
  registration: RegistrationDetails,
  event: EventDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    // Format event date/time
    const eventDate = new Date(event.event_date)
    const dateStr = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    let timeStr = ''
    if (event.event_time) {
      const [hours, minutes] = event.event_time.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      timeStr = ` at ${displayHour}:${minutes} ${ampm}`
    }

    // Build email content
    const subject = `Registration Confirmed: ${event.title}`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Registration Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Registration Confirmed!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello ${registration.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for registering for <strong>${event.title}</strong>!
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Event Details</h2>
              
              <p style="margin: 10px 0;">
                <strong>Date & Time:</strong><br>
                ${dateStr}${timeStr}
                ${event.end_date && event.end_date !== event.event_date ? ` - ${new Date(event.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}
              </p>
              
              ${event.is_online && event.zoom_url ? `
                <p style="margin: 10px 0;">
                  <strong>Join Online:</strong><br>
                  <a href="${event.zoom_url}" style="color: #f97316; text-decoration: none;">Click here to join the Zoom meeting</a>
                </p>
              ` : ''}
              
              ${event.location && !event.is_online ? `
                <p style="margin: 10px 0;">
                  <strong>Location:</strong><br>
                  ${event.location}
                </p>
              ` : ''}
              
              <p style="margin: 10px 0;">
                <strong>Cost:</strong> 
                ${event.price > 0 ? `${event.currency} ${event.price.toFixed(2)}` : 'Free'}
              </p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>Registration ID:</strong> ${registration.registrationId}<br>
                Please save this for your records.
              </p>
            </div>
            
            <p style="font-size: 16px; margin-top: 30px;">
              We look forward to seeing you there!
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              If you have any questions or need to make changes to your registration, please contact us.
            </p>
          </div>
        </body>
      </html>
    `

    const textContent = `
Registration Confirmed: ${event.title}

Hello ${registration.name},

Thank you for registering for ${event.title}!

Event Details:
- Date & Time: ${dateStr}${timeStr}
${event.location && !event.is_online ? `- Location: ${event.location}\n` : ''}
${event.is_online && event.zoom_url ? `- Join Online: ${event.zoom_url}\n` : ''}
- Cost: ${event.price > 0 ? `${event.currency} ${event.price.toFixed(2)}` : 'Free'}

Registration ID: ${registration.registrationId}

We look forward to seeing you there!

If you have any questions, please contact us.
    `.trim()

    // In production, use an email service here
    // For now, we'll log it and use a simple fetch to a potential email API endpoint
    // You can integrate with Resend, SendGrid, etc.
    
    if (process.env.EMAIL_SERVICE_URL) {
      // If you have an email service endpoint
      const response = await fetch(process.env.EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: registration.email,
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
      console.log('📧 Event Registration Confirmation Email:')
      console.log('To:', registration.email)
      console.log('Subject:', subject)
      console.log('---')
      console.log(textContent)
      console.log('---')
      
      // In production, you should always have an email service configured
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ EMAIL_SERVICE_URL not configured. Email not sent.')
        // You might want to queue this for retry or use a fallback service
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Failed to send event confirmation email:', error)
    return { success: false, error: error.message }
  }
}
