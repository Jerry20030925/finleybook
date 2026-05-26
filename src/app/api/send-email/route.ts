import { NextResponse } from 'next/server';
import { ResendService } from '@/lib/resendService';
import WeeklyReportEmail from '@/emails/WeeklyReport';
import { render } from '@react-email/render';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const userData = {
      userName: body.userName || "User",
      email: body.email,
      savedAmount: body.savedAmount || "0.00",
      topCategory: body.topCategory || "General",
      nextBillName: body.nextBillName || "None",
      nextBillAmount: body.nextBillAmount || "0.00"
    };

    const html = await render(WeeklyReportEmail({
      userName: userData.userName,
      savedAmount: userData.savedAmount,
      topCategory: userData.topCategory,
      nextBillName: userData.nextBillName,
      nextBillAmount: userData.nextBillAmount,
    }));

    const data = await ResendService.sendEmail({
      from: ResendService.SENDERS.default,
      to: userData.email,
      subject: `Weekly Report: You saved $${userData.savedAmount}!`,
      html: html
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}