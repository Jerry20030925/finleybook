import { NextResponse } from 'next/server';
import { ResendService } from '@/lib/resendService';
import WeeklyReportEmail from '@/emails/WeeklyReport';
import { render } from '@react-email/render';

export async function POST(request: Request) {
  try {
    // 假设这是从数据库取出的用户数据
    // In a real application, you would parse the request body or fetch data from DB
    const userData = {
      userName: "Alex",
      email: "alex@example.com", // This should be dynamic
      savedAmount: "85.50",
      topCategory: "Gaming",
      nextBillName: "Spotify",
      nextBillAmount: "11.99"
    };

    // Allow overriding email for testing
    const body = await request.json().catch(() => ({}));
    const recipientEmail = body.email || userData.email;

    const html = await render(WeeklyReportEmail({
      userName: userData.userName,
      savedAmount: userData.savedAmount,
      topCategory: userData.topCategory,
      nextBillName: userData.nextBillName,
      nextBillAmount: userData.nextBillAmount,
    }));

    const data = await ResendService.sendEmail({
      from: ResendService.SENDERS.default,
      to: recipientEmail,
      subject: `Weekly Report: You saved $${userData.savedAmount}!`,
      html: html
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}