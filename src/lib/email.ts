import nodemailer from "nodemailer";
import { env } from "~/env";
import type { NotificationType } from "@prisma/client";

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
  dashboardUrl: string,
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
  reason?: string,
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

/**
 * Sends email notification based on notification type
 * Note: Emails do NOT contain URLs (per user requirement - just alerts)
 */
export async function sendEmailNotification(params: {
  email: string;
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  try {
    let htmlContent: string;

    switch (params.type) {
      case "COURSE_INVITATION":
        htmlContent = getCourseInvitationTemplate(params);
        break;
      case "TIMETABLE_INVITATION":
        htmlContent = getTimetableInvitationTemplate(params);
        break;
      case "INVITATION_ACCEPTED":
        htmlContent = getInvitationAcceptedTemplate(params);
        break;
      case "INVITATION_REJECTED":
        htmlContent = getInvitationRejectedTemplate(params);
        break;
      case "CLASS_REMINDER":
        htmlContent = getClassReminderTemplate(params);
        break;
      case "AUDIT_LOG_ALERT":
        htmlContent = getAuditLogAlertTemplate(params);
        break;
      case "SYSTEM_NOTIFICATION":
        htmlContent = getSystemNotificationTemplate(params);
        break;
      default:
        htmlContent = getGenericNotificationTemplate(params);
    }

    await transporter.sendMail({
      from: `"UNIShare" <${env.EMAIL_USER}>`,
      to: params.email,
      subject: params.title,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw error;
  }
}

// Email Templates

function getCourseInvitationTemplate(params: any): string {
  const metadata = params.metadata as {
    courseName: string;
    inviterName: string;
    role: string;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #eef2ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          .role { display: inline-block; background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📚 Course Invitation</h1>
          </div>
          <div class="content">
            <p>Hi ${params.name},</p>
            <p>${metadata.inviterName} has invited you to collaborate on a course!</p>

            <div class="highlight">
              <strong>Course:</strong> ${metadata.courseName}<br>
              <strong>Your Role:</strong> <span class="role">${metadata.role}</span>
            </div>

            <p>${params.message}</p>

            <p style="margin-top: 30px;">Log in to UNIShare to accept or reject this invitation.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 UNIShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getTimetableInvitationTemplate(params: any): string {
  const metadata = params.metadata as {
    timetableName: string;
    inviterName: string;
    role: string;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #e0f2fe; padding: 15px; border-left: 4px solid #06b6d4; margin: 20px 0; }
          .role { display: inline-block; background: #06b6d4; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📅 Timetable Invitation</h1>
          </div>
          <div class="content">
            <p>Hi ${params.name},</p>
            <p>${metadata.inviterName} has invited you to collaborate on a timetable!</p>

            <div class="highlight">
              <strong>Timetable:</strong> ${metadata.timetableName}<br>
              <strong>Your Role:</strong> <span class="role">${metadata.role}</span>
            </div>

            <p>${params.message}</p>

            <p style="margin-top: 30px;">Log in to UNIShare to accept or reject this invitation.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 UNIShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getInvitationAcceptedTemplate(params: any): string {
  const metadata = params.metadata as {
    resourceType: string;
    resourceName: string;
    acceptorName: string;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #d1fae5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✅ Invitation Accepted</h1>
          </div>
          <div class="content">
            <p>Hi ${params.name},</p>
            <p>Great news! ${metadata.acceptorName} has accepted your invitation.</p>

            <div class="highlight">
              <strong>${metadata.resourceType === "course" ? "Course" : "Timetable"}:</strong> ${metadata.resourceName}
            </div>

            <p>You can now collaborate together on this ${metadata.resourceType}!</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 UNIShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getInvitationRejectedTemplate(params: any): string {
  const metadata = params.metadata as {
    resourceType: string;
    resourceName: string;
    rejectorName: string;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #fee2e2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">❌ Invitation Declined</h1>
          </div>
          <div class="content">
            <p>Hi ${params.name},</p>
            <p>${metadata.rejectorName} has declined your invitation.</p>

            <div class="highlight">
              <strong>${metadata.resourceType === "course" ? "Course" : "Timetable"}:</strong> ${metadata.resourceName}
            </div>

            <p>You can invite other collaborators to work on this ${metadata.resourceType}.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 UNIShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getClassReminderTemplate(params: any): string {
  const metadata = params.metadata as {
    courseName: string;
    location: string;
    startTime: string;
    endTime: string;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .time { font-size: 24px; font-weight: bold; color: #d97706; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⏰ Class Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${params.name},</p>
            <p>Don't forget! Your class is starting soon.</p>

            <div class="highlight">
              <strong>Class:</strong> ${metadata.courseName}<br>
              <strong>Location:</strong> ${metadata.location}<br>
              <strong>Time:</strong> <span class="time">${metadata.startTime} - ${metadata.endTime}</span>
            </div>

            <p>See you there! 📚</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 UNIShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getAuditLogAlertTemplate(params: any): string {
  const metadata = params.metadata as {
    action: string;
    resourceType: string;
    resourceName: string;
    performerName: string;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .highlight { background: #ede9fe; padding: 15px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
          .action { display: inline-block; background: #8b5cf6; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔔 Activity Alert</h1>
          </div>
          <div class="content">
            <p>Hi ${params.name},</p>
            <p>A collaborator has made changes to your content.</p>

            <div class="highlight">
              <strong>Action:</strong> <span class="action">${metadata.action}</span><br>
              <strong>Resource:</strong> ${metadata.resourceName} (${metadata.resourceType})<br>
              <strong>By:</strong> ${metadata.performerName}
            </div>

            <p>Log in to UNIShare to view the audit log for more details.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 UNIShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getSystemNotificationTemplate(params: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .message { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📢 System Notification</h1>
          </div>
          <div class="content">
            <p>Hi ${params.name},</p>

            <div class="message">
              <p>${params.message}</p>
            </div>

            <p>This is a system notification from the UNIShare team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 UNIShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function getGenericNotificationTemplate(params: any): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #64748b 0%, #475569 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .message { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔔 Notification</h1>
          </div>
          <div class="content">
            <p>Hi ${params.name},</p>

            <div class="message">
              <h3>${params.title}</h3>
              <p>${params.message}</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 UNIShare. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
