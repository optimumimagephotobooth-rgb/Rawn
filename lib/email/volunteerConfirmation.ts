/**
 * Email service for volunteer signup confirmations
 */

interface VolunteerDetails {
  volunteerId: string
  name: string
  email: string
  department: string
  submittedAt: string
}

export async function sendVolunteerConfirmation(
  volunteer: VolunteerDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!volunteer.email) {
      return { success: true }
    }

    const date = new Date(volunteer.submittedAt)
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const subject = `Thank You for Your Volunteer Application - RAWN Ministry`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Volunteer Application Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Volunteering!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello ${volunteer.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for your interest in serving with RAWN Ministry! We have received your volunteer application and are excited about the possibility of you joining our team.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">Application Details</h2>
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong style="color: #1f2937;">Application ID:</strong> ${volunteer.volunteerId}
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong style="color: #1f2937;">Department:</strong> ${volunteer.department}
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong style="color: #1f2937;">Submitted:</strong> ${dateStr}
              </p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Our team will review your application and get back to you within the next few days. We appreciate your heart to serve and look forward to connecting with you soon!
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              If you have any questions in the meantime, please don't hesitate to reach out to us.
            </p>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <p style="margin: 0; color: #92400e; font-size: 14px; font-style: italic;">
                "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do." - Ephesians 2:10
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Blessings,<br>
              <strong>RAWN Ministry Team</strong>
            </p>
          </div>
        </body>
      </html>
    `.trim()

    const textContent = `
Thank You for Your Volunteer Application - RAWN Ministry

Hello ${volunteer.name},

Thank you for your interest in serving with RAWN Ministry! We have received your volunteer application and are excited about the possibility of you joining our team.

Application Details:
- Application ID: ${volunteer.volunteerId}
- Department: ${volunteer.department}
- Submitted: ${dateStr}

Our team will review your application and get back to you within the next few days. We appreciate your heart to serve and look forward to connecting with you soon!

If you have any questions in the meantime, please don't hesitate to reach out to us.

"For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do." - Ephesians 2:10

Blessings,
RAWN Ministry Team
    `.trim()

    if (process.env.EMAIL_SERVICE_URL) {
      const response = await fetch(process.env.EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: volunteer.email,
          subject,
          html: htmlContent,
          text: textContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } else {
      console.log('📧 Volunteer Confirmation Email:')
      console.log('To:', volunteer.email)
      console.log('Subject:', subject)
      console.log('---')
      console.log(textContent)
      console.log('---')
      
      if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ EMAIL_SERVICE_URL not configured. Email not sent.')
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Failed to send volunteer confirmation email:', error)
    return { success: false, error: error.message }
  }
}
