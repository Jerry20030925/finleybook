import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export class ResendService {
  private static defaultFrom = 'FinleyBook <noreply@finleybook.com>';

  static async sendEmail(options: EmailOptions) {
    try {
      const { data, error } = await resend.emails.send({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        console.error('Resend error:', error);
        throw new Error(`Email sending failed: ${error.message}`);
      }

      console.log('Email sent successfully:', data?.id);
      return data;
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(email: string, name?: string) {
    const subject = 'Welcome to FinleyBook! 🎉';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to FinleyBook!</h1>
          <p style="margin: 16px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey to financial freedom starts now</p>
        </div>
        
        <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0;">
            ${name ? `Hi ${name},` : 'Hello there!'}
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.5; margin: 0 0 24px 0;">
            Thank you for joining FinleyBook! We're excited to help you take control of your finances and achieve your financial goals.
          </p>
          
          <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937;">What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li style="margin-bottom: 8px;">Connect your bank accounts for automatic tracking</li>
              <li style="margin-bottom: 8px;">Set up your budget and financial goals</li>
              <li style="margin-bottom: 8px;">Explore our AI-powered insights</li>
              <li>Start building your financial future!</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://finleybook.com" 
               style="background: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
              Get Started
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; text-align: center;">
            Need help? Reply to this email or visit our support center.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  static async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://finleybook.com'}/reset-password?token=${resetToken}`;
    
    const subject = 'Reset your FinleyBook password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f2937; color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="background: white; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151;">
            We received a request to reset your FinleyBook account password.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="background: #ef4444; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            This link will expire in 24 hours. If you didn't request this password reset, you can safely ignore this email.
          </p>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
            If the button doesn't work, copy and paste this link: <br>
            <a href="${resetUrl}" style="color: #6366f1; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  static async sendNotificationEmail(email: string, notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }) {
    const colors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      success: '#10b981',
      error: '#ef4444'
    };

    const subject = `FinleyBook Notification: ${notification.title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${colors[notification.type]}; color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">${notification.title}</h1>
        </div>
        
        <div style="background: white; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            ${notification.message}
          </p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="https://finleybook.com" 
               style="background: #6366f1; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
              Open FinleyBook
            </a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }
}

export default ResendService;