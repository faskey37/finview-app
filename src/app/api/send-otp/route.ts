import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { hashOTP, generateOTP } from '@/lib/otp-utils';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
    
    // HASH the OTP before storing
    const hashedOTP = await hashOTP(otp);

    // Store HASHED OTP in Firestore
    const otpRef = doc(db, 'otps', email.replace(/\./g, '_'));
    await setDoc(otpRef, {
      email,
      otpHash: hashedOTP, // Store hash, NOT plain text
      expires: Date.now() + 10 * 60 * 1000,
      createdAt: new Date().toISOString(),
    });

    console.log(`Generated OTP for ${email}: ${otp} (hash: ${hashedOTP.substring(0, 20)}...)`);

    // Send email with plain OTP (user needs the plain one)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

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
            Thank you for signing up with EcoVest! Please use the following verification code:
          </p>
          <div style="background: linear-gradient(135deg, #10b981, #8b5cf6); padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
            <h1 style="color: white; font-size: 48px; letter-spacing: 10px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">
            This code will expire in 10 minutes.
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