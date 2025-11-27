import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import WeeklyReportEmail from '@/emails/WeeklyReport';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const data = await resend.emails.send({
      from: 'FinleyBook <hello@finleybook.com>', // 必须是你验证过的域名
      to: [recipientEmail],
      subject: `Weekly Report: You saved $${userData.savedAmount}!`,
      // 核心：把组件作为 react 属性传入
      react: WeeklyReportEmail({
        userName: userData.userName,
        savedAmount: userData.savedAmount,
        topCategory: userData.topCategory,
        nextBillName: userData.nextBillName,
        nextBillAmount: userData.nextBillAmount,
      }),
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}