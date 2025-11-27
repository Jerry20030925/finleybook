import { NextRequest, NextResponse } from 'next/server';
import { ResendService } from '@/lib/resendService';

export async function POST(request: NextRequest) {
  try {
    const { email, type = 'welcome' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await ResendService.sendWelcomeEmail(email, 'Test User');
        break;
      case 'notification':
        result = await ResendService.sendNotificationEmail(email, {
          title: '测试通知',
          message: '这是一封测试邮件，用于验证FinleyBook的邮件发送功能是否正常工作。如果您收到这封邮件，说明邮件系统配置正确！',
          type: 'success'
        });
        break;
      case 'reset':
        result = await ResendService.sendPasswordResetEmail(email, 'test-token-123');
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: result?.id
    });

  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}