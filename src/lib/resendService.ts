import { Resend } from 'resend';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';
import CashbackEmail from '@/emails/CashbackEmail';
import MonthlyReportEmail from '@/emails/MonthlyReportEmail';
import ReengagementEmail from '@/emails/ReengagementEmail';
import IncomeExpenseReminderEmail from '@/emails/IncomeExpenseReminderEmail';
import UpgradeSuccessEmail from '@/emails/UpgradeSuccessEmail';
import CashbackDetectedEmail from '@/emails/CashbackDetectedEmail';
import HiddenFeaturesEmail from '@/emails/HiddenFeaturesEmail';
import DiscountEmail from '@/emails/DiscountEmail';
import VerifyEmail from '@/emails/VerifyEmail';
import NewDeviceLoginEmail from '@/emails/NewDeviceLoginEmail';
import PaymentFailedEmail from '@/emails/PaymentFailedEmail';
import InvoiceReceiptEmail from '@/emails/InvoiceReceiptEmail';
import TrialEndingEmail from '@/emails/TrialEndingEmail';
import ReferralInviteEmail from '@/emails/ReferralInviteEmail';
import ReferralSuccessEmail from '@/emails/ReferralSuccessEmail';
import DataExportReadyEmail from '@/emails/DataExportReadyEmail';
import CashbackActivationEmail from '@/emails/CashbackActivationEmail';
import NewsletterWelcomeEmail from '@/emails/NewsletterWelcomeEmail';


const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export class ResendService {
  public static readonly SENDERS = {
    default: 'FinleyBook Support <support@finleybook.com>',
    updates: 'FinleyBook Alerts <updates@finleybook.com>',
    founder: 'Jerry from FinleyBook <jerry@finleybook.com>',
    rewards: 'FinleyBook Rewards <rewards@finleybook.com>'
  } as const;

  private static defaultFrom = ResendService.SENDERS.default;

  static async sendEmail(options: EmailOptions) {
    try {
      const payload: any = {
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      console.log(`[EmailService] Sending "${options.subject}" to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);

      const { data, error } = await resend.emails.send(payload);

      if (error) {
        console.error('[EmailService] Resend error:', error);
        throw new Error(`Email sending failed: ${error.message}`);
      }

      console.log('[EmailService] Email sent successfully. ID:', data?.id);
      return data;
    } catch (error) {
      console.error('[EmailService] Critical error:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(email: string, name?: string) {
    const html = await render(WelcomeEmail({ userFirstName: name || 'there' }));

    return this.sendEmail({
      to: email,
      subject: 'Quick hello',
      html,
    });
  }

  static async sendPasswordResetEmail(email: string, resetLink: string) {
    // If it's a full URL, use it. Otherwise construct one (legacy support)
    const url = resetLink.startsWith('http')
      ? resetLink
      : `${process.env.NEXT_PUBLIC_APP_URL || 'https://finleybook.com'}/reset-password?token=${resetLink}`;

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
            <a href="${url}" 
               style="background: #ef4444; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            This link will expire in 24 hours. If you didn't request this password reset, you can safely ignore this email.
          </p>
          

          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
            If the button doesn't work, copy and paste this link: <br>
            <a href="${url}" style="color: #6366f1; word-break: break-all;">${url}</a>
          </p>
          
          <div style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
            <a href="https://www.linkedin.com/company/finleybook/" target="_blank" style="margin: 0 8px; display: inline-block;">
                <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="24" height="24" alt="LinkedIn" style="border:0;display:block;" />
            </a>
            <a href="https://instagram.com/finleybook1" target="_blank" style="margin: 0 8px; display: inline-block;">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" height="24" alt="Instagram" style="border:0;display:block;" />
            </a>
            <a href="https://tiktok.com/@finleybook" target="_blank" style="margin: 0 8px; display: inline-block;">
                <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" width="24" height="24" alt="TikTok" style="border:0;display:block;" />
            </a>
            <a href="https://x.com/finleybook1" target="_blank" style="margin: 0 8px; display: inline-block;">
                <img src="https://cdn-icons-png.flaticon.com/512/5969/5969020.png" width="24" height="24" alt="X" style="border:0;display:block;" />
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

  static async sendNotificationEmail(email: string, notification: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
  }) {
    // Keep existing notification email for now, or replace with a generic template later
    // ... (existing implementation)
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
          
          <div style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
            <a href="https://www.linkedin.com/company/finleybook/" target="_blank" style="margin: 0 8px; display: inline-block;">
                <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="24" height="24" alt="LinkedIn" style="border:0;display:block;" />
            </a>
            <a href="https://instagram.com/finleybook1" target="_blank" style="margin: 0 8px; display: inline-block;">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" height="24" alt="Instagram" style="border:0;display:block;" />
            </a>
            <a href="https://tiktok.com/@finleybook" target="_blank" style="margin: 0 8px; display: inline-block;">
                <img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" width="24" height="24" alt="TikTok" style="border:0;display:block;" />
            </a>
            <a href="https://x.com/finleybook1" target="_blank" style="margin: 0 8px; display: inline-block;">
                <img src="https://cdn-icons-png.flaticon.com/512/5969/5969020.png" width="24" height="24" alt="X" style="border:0;display:block;" />
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

  // New Methods for Founder Persona Emails

  static async sendCashbackEmail(email: string, name: string, amount: string, merchant: string) {
    const html = await render(CashbackEmail({ userFirstName: name, amount, merchant }));
    return this.sendEmail({
      to: email,
      from: ResendService.SENDERS.updates,
      subject: `💸 Cha-ching! We tracked your cashback`,
      html,
    });
  }

  static async sendMonthlyReportEmail(email: string, name: string, data: any) {
    const html = await render(MonthlyReportEmail({
      userFirstName: name,
      ...data
    }));
    return this.sendEmail({
      to: email,
      subject: `Your ${data.monthName} Money Wrap 🌯`,
      html,
    });
  }

  static async sendReengagementEmail(email: string, name: string) {
    const html = await render(ReengagementEmail({ userFirstName: name }));
    return this.sendEmail({
      to: email,
      subject: `You're missing out on free money... 👀`,
      html,
    });
  }

  static async sendIncomeExpenseReminder(email: string, name: string, data: any) {
    const html = await render(IncomeExpenseReminderEmail({
      userFirstName: name,
      ...data
    }));
    return this.sendEmail({
      to: email,
      subject: `${data.periodLabel} Snapshot: ${data.net} Net Change`,
      html,
    });
  }

  static async sendUpgradeSuccessEmail(email: string, name: string, planName: string) {
    const html = await render(UpgradeSuccessEmail({
      userFirstName: name,
      planName
    }));
    return this.sendEmail({
      to: email,
      subject: `Welcome to Pro! ⚡️`,
      html,
    });
  }

  static async sendStreakReminder(email: string, name: string, streakCount: number) {
    // Dynamically import to avoid circular dependencies if any, or just consistent with pattern
    const { StreakReminderEmail } = await import('@/emails/StreakReminderEmail');
    const html = await render(StreakReminderEmail({
      userFirstName: name,
      streakCount
    }));
    return this.sendEmail({
      to: email,
      from: ResendService.SENDERS.default,
      subject: `🔥 Your ${streakCount} day streak is about to go out!`,
      html,
    });
  }

  static async sendCashbackDetectedEmail(email: string, name: string, merchant: string, amount: string, date: string) {
    const html = await render(CashbackDetectedEmail({
      userName: name,
      merchantName: merchant,
      cashbackAmount: amount,
      estimatedPayoutDate: date
    }));
    return this.sendEmail({
      to: email,
      from: ResendService.SENDERS.rewards,
      subject: `🎉 Cashback Detected: ${amount} from ${merchant}`,
      html,
    });
  }

  static async sendHiddenFeaturesEmail(email: string, name: string) {
    const unsubscribeUrl = this.generateUnsubscribeUrl(email);
    const html = await render(HiddenFeaturesEmail({ userFirstName: name, unsubscribeUrl }));
    return this.sendEmail({
      to: email,
      subject: `Did you find this hidden feature? 👀`,
      html,
    });
  }

  static async sendDiscountEmail(email: string, name: string) {
    const unsubscribeUrl = this.generateUnsubscribeUrl(email);
    const html = await render(DiscountEmail({ userFirstName: name, unsubscribeUrl }));
    return this.sendEmail({
      to: email,
      subject: `A special gift for you 🎁`,
      html,
    });
  }

  // --- Infrastructure & Growth Emails ---

  static async sendVerificationEmail(email: string, name: string, code: string, link: string) {
    const html = await render(VerifyEmail({ userFirstName: name, verificationCode: code, verificationLink: link }));
    return this.sendEmail({
      to: email,
      from: ResendService.SENDERS.default,
      subject: `Verify your email address`,
      html,
    });
  }

  static async sendNewDeviceLoginEmail(email: string, name: string, details: any) {
    const html = await render(NewDeviceLoginEmail({ userFirstName: name, ...details }));
    return this.sendEmail({
      to: email,
      subject: `New login detected`,
      html,
    });
  }

  static async sendPaymentFailedEmail(email: string, name: string, amount: string, date: string) {
    const html = await render(PaymentFailedEmail({ userFirstName: name, amount, date }));
    return this.sendEmail({
      to: email,
      subject: `Action Required: Payment Failed`,
      html,
    });
  }

  static async sendInvoiceReceiptEmail(email: string, name: string, details: any) {
    const html = await render(InvoiceReceiptEmail({ userFirstName: name, ...details }));
    return this.sendEmail({
      to: email,
      subject: `Receipt for ${details.planName}`,
      html,
    });
  }

  static async sendTrialEndingEmail(email: string, name: string, daysLeft: number) {
    const html = await render(TrialEndingEmail({ userFirstName: name, daysLeft }));
    return this.sendEmail({
      to: email,
      subject: `Your Pro trial ends in ${daysLeft} days`,
      html,
    });
  }

  static async sendReferralInviteEmail(email: string, inviterName: string, link: string) {
    const html = await render(ReferralInviteEmail({ inviterName, referralLink: link }));
    return this.sendEmail({
      to: email,
      subject: `${inviterName} invited you to FinleyBook`,
      html,
    });
  }

  static async sendReferralSuccessEmail(email: string, name: string, amount: string, friendName: string) {
    const html = await render(ReferralSuccessEmail({ userFirstName: name, rewardAmount: amount, friendName }));
    return this.sendEmail({
      to: email,
      subject: `You earned ${amount}!`,
      html,
    });
  }

  static async sendDataExportReadyEmail(email: string, name: string, link: string, format: string) {
    const html = await render(DataExportReadyEmail({ userFirstName: name, downloadLink: link, format }));
    return this.sendEmail({
      to: email,
      subject: `Your data export is ready`,
      html,
    });
  }

  static async sendCashbackActivationEmail(email: string, name: string, merchant: string, rate: string) {
    const html = await render(CashbackActivationEmail({ userFirstName: name, merchant, rate }));
    return this.sendEmail({
      to: email,
      from: ResendService.SENDERS.updates,
      subject: `Active! ${rate} cashback at ${merchant} 🚀`,
      html,
    });
  }

  static async sendNewsletterWelcomeEmail(email: string) {
    const html = await render(NewsletterWelcomeEmail({ userEmail: email }));
    return this.sendEmail({
      to: email,
      subject: `Welcome to the FinleyBook Community! 🌟`,
      html,
    });
  }

  private static generateUnsubscribeUrl(email: string): string {
    // In a real app, this would generate a signed token
    // For now, we'll point to a generic unsubscribe page with the email query param
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finleybook.com';
    return `${baseUrl}/unsubscribe?email=${encodeURIComponent(email)}`;
  }
}


export default ResendService;