import { NextRequest, NextResponse } from 'next/server';
import { ResendService } from '@/lib/resendService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, ...data } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await ResendService.sendWelcomeEmail(email, data.name);
        break;
      
      case 'password-reset':
        if (!data.resetToken) {
          return NextResponse.json(
            { error: 'Reset token is required' },
            { status: 400 }
          );
        }
        result = await ResendService.sendPasswordResetEmail(email, data.resetToken);
        break;
      
      case 'notification':
        if (!data.notification) {
          return NextResponse.json(
            { error: 'Notification data is required' },
            { status: 400 }
          );
        }
        result = await ResendService.sendNotificationEmail(email, data.notification);
        break;
      
      case 'custom':
        if (!data.subject || (!data.html && !data.text)) {
          return NextResponse.json(
            { error: 'Subject and content (html or text) are required' },
            { status: 400 }
          );
        }
        result = await ResendService.sendEmail({
          to: email,
          subject: data.subject,
          html: data.html,
          text: data.text,
          from: data.from,
        });
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result?.id,
      message: 'Email sent successfully'
    });

  } catch (error: any) {
    console.error('Email API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Email API is working',
    supportedTypes: ['welcome', 'password-reset', 'notification', 'custom'],
    usage: {
      method: 'POST',
      body: {
        type: 'string (required)',
        email: 'string (required)',
        // Additional fields based on type
      }
    }
  });
}