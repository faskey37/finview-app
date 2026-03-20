// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import { sendProConfirmationEmail, sendInvoiceEmail, testEmailConnection } from '@/lib/email-service';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    // Validate required fields
    if (!data.email || !data.name || !data.plan || !data.amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'welcome':
        result = await sendProConfirmationEmail(data);
        break;
      case 'invoice':
        result = await sendInvoiceEmail(data);
        break;
      case 'test':
        result = await testEmailConnection();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// Test endpoint
export async function GET() {
  try {
    const result = await testEmailConnection();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Email server not configured properly' },
      { status: 500 }
    );
  }
}