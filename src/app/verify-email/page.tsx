'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, CheckCircle, AlertCircle, RefreshCw, LogIn, Shield, TrendingUp, ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { markEmailAsVerified } from '@/lib/auth-utils';

export default function VerifyEmailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(true);
  const [verified, setVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<NodeJS.Timeout | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  // Countdown timer for resend button
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
      setCountdown(60);
    }
  }, [canResend, countdown]);

  // Send OTP on page load - but only once
  useEffect(() => {
    if (user?.email && !verified && !otpSent && !loading) {
      const timer = setTimeout(() => {
        handleSendOTP();
        setOtpSent(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleSendOTP = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      console.log('Sending OTP to:', user.email);
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      console.log('Send OTP response:', data);

      if (response.ok) {
        toast({
          title: 'Verification code sent',
          description: 'Please check your email for the 6-digit code.',
        });
        setCanResend(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to send code',
          description: data.error || 'Something went wrong',
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send verification code',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast({
        variant: 'destructive',
        title: 'Invalid code',
        description: 'Please enter the 6-digit verification code',
      });
      return;
    }

    setVerifying(true);
    try {
      console.log('Verifying OTP for:', user?.email, 'Code:', otpCode);
      
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User not found. Please sign up again.',
        });
        setTimeout(() => router.push('/signup'), 2000);
        return;
      }

      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, otp: otpCode }),
      });

      const data = await response.json();
      console.log('Verify OTP response:', data);

      if (response.ok) {
        // Mark email as verified in Firestore
        await markEmailAsVerified(user.uid);
        
        toast({
          title: 'Email verified!',
          description: 'Your email has been successfully verified.',
        });
        
        setVerified(true);
        
        // Sign out the user after verification
        await signOut(auth);
        console.log('User signed out');
        
        // Set timer to redirect to login
        const timer = setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
        setRedirectTimer(timer);
      } else {
        toast({
          variant: 'destructive',
          title: 'Verification failed',
          description: data.error || 'Invalid code',
        });
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to verify code',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < pastedValue.length; i++) {
        if (index + i < 6) {
          newOtp[index + i] = pastedValue[i];
        }
      }
      setOtp(newOtp);
      
      // Focus the next empty input or last input
      const nextEmptyIndex = newOtp.findIndex((val, idx) => idx > index && val === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    } else if (value === '') {
      // Handle delete
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      
      // Focus previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (/^\d*$/.test(value)) {
      // Handle single digit
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Focus next input
      if (index < 5 && value !== '') {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user AND not verified, show message to go to login
  if (!user && !verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-blue-500/20">
              <LogIn className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Already Verified?</h2>
          <p className="text-muted-foreground mb-6">
            If you've already verified your email, please sign in to continue.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-primary to-purple-600"
              size="lg"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
            <Button
              onClick={() => router.push('/signup')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Create New Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-green-500/20">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Email Verified Successfully!</h2>
          <p className="text-muted-foreground mb-6">
            Your email has been verified. You can now sign in to your account.
          </p>
          <Button
            onClick={handleGoToLogin}
            className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            size="lg"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Go to Login
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Redirecting to login page in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Verify Your Email</h2>
          <p className="text-muted-foreground">
            We've sent a verification code to <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border p-6">
          <div className="bg-primary/5 rounded-xl p-6 mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the 6-digit verification code sent to your email
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold"
                autoFocus={index === 0}
                disabled={verifying}
              />
            ))}
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleVerifyOTP}
              disabled={verifying || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              size="lg"
            >
              {verifying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Email
                </>
              )}
            </Button>

            <Button
              onClick={handleSendOTP}
              disabled={loading || !canResend}
              variant="outline"
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : !canResend ? (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend available in {countdown}s
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Didn't receive the code? Check your spam folder or{' '}
              <button
                onClick={handleSendOTP}
                disabled={!canResend}
                className="text-primary hover:underline disabled:opacity-50"
              >
                try again
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span>Trusted</span>
          </div>
        </div>
      </div>
    </div>
  );
}