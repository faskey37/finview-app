// lib/otp-utils.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

// Hash OTP before storing
export async function hashOTP(otp: string): Promise<string> {
  return await bcrypt.hash(otp, SALT_ROUNDS);
}

// Verify OTP against stored hash
export async function verifyOTP(plainOTP: string, hashedOTP: string): Promise<boolean> {
  return await bcrypt.compare(plainOTP, hashedOTP);
}

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}