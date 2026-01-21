/**
 * Email service for volunteer status updates
 */

interface VolunteerStatusUpdate {
  name: string
  email: string
  department: string
  oldStatus: string
  newStatus: string
  notes?: string | null
}

export async function sendVolunteerStatusUpdate(
  update: VolunteerStatusUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!update.email) {
      return { success: true }
    }

    const statusMessages: Record<string, { subject: string; message: string }> = {
      'Active': {
        subject: 'Welcome to the Team! - RAWN Ministry',
        message: 'Congratulations! Your volunteer application has been approved and you are now an active volunteer with RAWN Ministry. We are thrilled to have you on the team!'
      },
      'Rejected': {
        subject: 'Volunteer Application Update - RAWN Ministry',
        message: 'Thank you for your interest in volunteering with RAWN Ministry. Unfortunately, we are unable to move forward with your application at this time.'
      },
      'Inactive': {
        subject: 'Volunteer Status Update - RAWN Ministry',
        message: 'Your volunteer status has been updated to Inactive. If you have any questions or would like to discuss this change, please contact us.'
      },
      'Pending': {
        subject: 'Volunteer Application Update - RAWN Ministry',
        message: 'Your volunteer application status has been updated. We are still reviewing your application and will be in touch soon.'
      }
    }

    const statusInfo = statusMessages[update.newStatus] || {
      subject: 'Volunteer Application Update - RAWN Ministry',
      message: `Your volunteer application status has been updated to ${update.newStatus}.`
    }

    const subject = statusInfo.subject
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Volunteer Status Update</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">${update.newStatus === 'Active' ? 'Welcome to the Team!' : 'Application Update'}</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello ${update.name},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${statusInfo.message}
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
              <h2 style="margin-top: 0; color: #1f2937; font-size: 18px;">Application Details</h2>
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong style="color: #1f2937;">Department:</strong> ${update.department}
              </p>
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong style="color: #1f2937;">Status:</strong> <span style="padding: 4px 8px; background: ${update.newStatus === 'Active' ? '#d1fae5' : update.newStatus === 'Rejected' ? '#fee2e2' : '#fef3c7'}; border-radius: 4px; color: ${update.newStatus === 'Active' ? '#065f46' : update.newStatus === 'Rejected' ? '#991b1b' : '#92400e'}; font-weight: 600;">${update.newStatus}</span>
              </p>
            </div>
            
            ${update.notes ? `
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #374151; font-size: 14px;">
                <strong>Note from our team:</strong><br>
                ${update.notes}
              </p>
            </div>
            ` : ''}
            
            ${update.newStatus === 'Active' ? `
            <p style="font-size: 16px; margin-bottom: 20px;">
              Next steps: Our team will be in touch with you soon to discuss your role, schedule, and answer any questions you may have. We're excited to serve alongside you!
            </p>
            ` : ''}
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              If you have any questions, please don't hesitate to reach out to us.
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
${statusInfo.subject}

Hello ${update.name},

${statusInfo.message}

Application Details:
- Department: ${update.department}
- Status: ${update.newStatus}

${update.notes ? `Note from our team:\n${update.notes}\n\n` : ''}
${update.newStatus === 'Active' ? 'Next steps: Our team will be in touch with you soon to discuss your role, schedule, and answer any questions you may have. We\'re excited to serve alongside you!\n\n' : ''}
If you have any questions, please don't hesitate to reach out to us.

"For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do." - Ephesians 2:10

Blessings,
RAWN Ministry Team
    `.trim()

    if (process.env.EMAIL_SERVICE_URL) {
      const response = await fetch(process.env.EMAIL_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: update.email,
          subject,
          html: htmlContent,
          text: textContent,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }
    } else {
      console.log('📧 Volunteer Status Update Email:')
      console.log('To:', update.email)
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
    console.error('Failed to send volunteer status update email:', error)
    return { success: false, error: error.message }
  }
}
