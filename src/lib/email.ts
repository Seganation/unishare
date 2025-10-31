import nodemailer from "nodemailer";
import { env } from "~/env";

/**
 * Email Service using Nodemailer with Gmail
 */

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Send welcome email to new user after registration
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const mailOptions = {
    from: `"UNIShare" <${env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to UNIShare - Registration Received",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 Welcome to UNIShare!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for registering with UNIShare, the student-driven academic organization platform.</p>

              <h3>What's Next?</h3>
              <p>Your registration is currently under review by our admin team. This typically takes 24-48 hours.</p>

              <p>We're verifying your student ID to ensure a secure community for all students.</p>

              <p><strong>You'll receive another email once your account is approved!</strong></p>

              <div style="background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0;">
                <strong>⏳ Pending Approval</strong><br/>
                Your account status: <strong>PENDING</strong><br/>
                You can log in, but access will be limited until approval.
              </div>

              <p>If you have any questions, feel free to reply to this email.</p>

              <p>Best regards,<br/>The UNIShare Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} UNIShare. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
}

/**
 * Send approval notification email
 */
export async function sendApprovalEmail(
  email: string,
  name: string,
  dashboardUrl: string
) {
  const mailOptions = {
    from: `"UNIShare" <${env.EMAIL_USER}>`,
    to: email,
    subject: "🎉 Your UNIShare Account Has Been Approved!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .success-box { background: #D1FAE5; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Account Approved!</h1>
            </div>
            <div class="content">
              <h2>Congratulations, ${name}! 🎊</h2>
              <p>Great news! Your UNIShare account has been approved by our admin team.</p>

              <div class="success-box">
                <strong>✅ Your account is now ACTIVE!</strong><br/>
                You now have full access to all features.
              </div>

              <h3>What You Can Do Now:</h3>
              <ul>
                <li>📚 Create and organize your courses</li>
                <li>🤝 Collaborate with classmates on shared courses</li>
                <li>📝 Take collaborative notes in real-time</li>
                <li>📅 Manage your timetable</li>
                <li>📄 Share resources and assignments</li>
                <li>✍️ Write and publish articles</li>
              </ul>

              <a href="${dashboardUrl}" class="button">Go to Dashboard →</a>

              <p style="margin-top: 30px;">If you have any questions or need help getting started, feel free to reply to this email.</p>

              <p>Happy organizing!<br/>The UNIShare Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} UNIShare. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${email}`);
  } catch (error) {
    console.error("Error sending approval email:", error);
    throw new Error("Failed to send approval email");
  }
}

/**
 * Send rejection notification email
 */
export async function sendRejectionEmail(
  email: string,
  name: string,
  reason?: string
) {
  const mailOptions = {
    from: `"UNIShare" <${env.EMAIL_USER}>`,
    to: email,
    subject: "UNIShare Registration Update",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .warning-box { background: #FEE2E2; padding: 15px; border-left: 4px solid #EF4444; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Registration Update</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>Thank you for your interest in UNIShare.</p>

              <div class="warning-box">
                <strong>Registration Status: Not Approved</strong><br/>
                We're unable to approve your registration at this time.
              </div>

              ${
                reason
                  ? `
              <h3>Reason:</h3>
              <p>${reason}</p>
              `
                  : ""
              }

              <h3>Common Reasons for Non-Approval:</h3>
              <ul>
                <li>Student ID image was unclear or unverifiable</li>
                <li>Information provided doesn't match university records</li>
                <li>Account created from unsupported institution</li>
              </ul>

              <p>If you believe this was an error or would like to reapply with updated information, please reply to this email.</p>

              <p>Best regards,<br/>The UNIShare Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} UNIShare. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${email}`);
  } catch (error) {
    console.error("Error sending rejection email:", error);
    throw new Error("Failed to send rejection email");
  }
}
