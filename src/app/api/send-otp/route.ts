import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { otpStore } from '@/lib/otp-store';

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP in Firestore with expiration (10 minutes)
    await otpStore.set(email, otp, 10);

    console.log('OTP generated and stored for:', email, 'OTP:', otp);

    // Create transporter using your email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Send email with OTP
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - EcoVest',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #10b981;">EcoVest</h1>
          </div>
          <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
          <p style="color: #666; font-size: 16px; text-align: center;">
            Thank you for signing up with EcoVest! Please use the following verification code to complete your registration:
          </p>
          <div style="background: linear-gradient(135deg, #10b981, #8b5cf6); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h1 style="color: white; font-size: 48px; letter-spacing: 10px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">
            This code will expire in 10 minutes.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            If you didn't request this verification, please ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}