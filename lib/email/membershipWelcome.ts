/**
 * Email service for membership welcome emails
 */

interface MembershipDetails {
  membershipId: string
  name: string
  email: string
  submittedAt: string
}

export async function sendMembershipWelcome(
  membership: MembershipDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!membership.email) {
      return { success: true }
    }

    const date = new Date(membership.submittedAt)
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const subject = `Welcome to RAWN Ministry! - Membership Confirmation`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to RAWN Ministry</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to RAWN Ministry!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello ${membership.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We are thrilled to welcome you as a member of RAWN Ministry! Your membership registration has been received and we're excited to have you join our community of intercessors, prophets, and disciples committed to raising a warrior nation for Jesus.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">Membership Details</h2>
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong style="color: #1f2937;">Membership ID:</strong> ${membership.membershipId}
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong style="color: #1f2937;">Registration Date:</strong> ${dateStr}
              </p>
            </div>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              As a member, you now have access to:
            </p>
            
            <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px; color: #374151;">
              <li style="margin-bottom: 8px;">Exclusive content and resources</li>
              <li style="margin-bottom: 8px;">Member-only events and gatherings</li>
              <li style="margin-bottom: 8px;">Community features and connections</li>
              <li style="margin-bottom: 8px;">Regular updates and ministry news</li>
            </ul>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Our team will review your membership application and will be in touch with you soon. In the meantime, feel free to explore our website and connect with our community.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              If you have any questions or need assistance, please don't hesitate to reach out to us.
            </p>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <p style="margin: 0; color: #92400e; font-size: 14px; font-style: italic;">
                "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." - Matthew 28:19
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Welcome to the family!<br>
              <strong>RAWN Ministry Team</strong>
            </p>
          </div>
        </body>
      </html>
    `.trim()

    const textContent = `
Welcome to RAWN Ministry! - Membership Confirmation

Hello ${membership.name},

We are thrilled to welcome you as a member of RAWN Ministry! Your membership registration has been received and we're excited to have you join our community of intercessors, prophets, and disciples committed to raising a warrior nation for Jesus.

Membership Details:
- Membership ID: ${membership.membershipId}
- Registration Date: ${dateStr}

As a member, you now have access to:
- Exclusive content and resources
- Member-only events and gatherings
- Community features and connections
- Regular updates and ministry news

Our team will review your membership application and will be in touch with you soon. In the meantime, feel free to explore our website and connect with our community.

If you have any questions or need assistance, please don't hesitate to reach out to us.

"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." - Matthew 28:19

Welcome to the family!
RAWN Ministry Team
    `.trim()

    if (process.env.EMAIL_SERVICE_URL) {
      const response = await fetch(process.env.EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: membership.email,
          subject,
          html: htmlContent,
          text: textContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } else {
      console.log('📧 Membership Welcome Email:')
      console.log('To:', membership.email)
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
    console.error('Failed to send membership welcome email:', error)
    return { success: false, error: error.message }
  }
}
