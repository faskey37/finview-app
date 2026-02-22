import { NextResponse } from 'next/server';
import { otpStore } from '@/lib/otp-store';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    
    console.log('Verifying OTP - Email:', email, 'OTP:', otp);

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get stored OTP from Firestore
    const storedData = await otpStore.get(email);

    if (!storedData) {
      console.log('No OTP found for email:', email);
      return NextResponse.json(
        { error: 'No OTP found for this email. Please request a new one.' },
        { status: 400 }
      );
    }

    console.log('Stored OTP data:', storedData);

    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
      console.log('OTP expired for email:', email);
      await otpStore.delete(email);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      console.log('OTP mismatch. Expected:', storedData.otp, 'Received:', otp);
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - remove it from store
    await otpStore.delete(email);
    console.log('OTP verified successfully for email:', email);

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Optional: Clean up expired OTPs
  await otpStore.cleanupExpired();
  
  return NextResponse.json({ 
    message: 'OTP verification endpoint' 
  });
}