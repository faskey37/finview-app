import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { verifyOTP } from '@/lib/otp-utils';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();
    
    console.log('Verifying OTP for:', email);

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Get stored OTP hash from Firestore
    const otpRef = doc(db, 'otps', email.replace(/\./g, '_'));
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      return NextResponse.json(
        { error: 'No OTP found for this email. Please request a new one.' },
        { status: 400 }
      );
    }

    const storedData = otpDoc.data();

    // Check if OTP has expired
    if (Date.now() > storedData.expires) {
      await deleteDoc(otpRef);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP against stored hash
    const isValid = await verifyOTP(otp, storedData.otpHash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP is valid - remove it from store
    await deleteDoc(otpRef);
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