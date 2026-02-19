'use client';

import { useState } from 'react';
import { sendPasswordReset } from '@/lib/auth-utils';
import Link from 'next/link';
import { Mail, ArrowLeft, Shield, TrendingUp } from 'lucide-react';
import Logo from '@/components/logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordReset(email);
      setMessage('Check your email for a password reset link');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Reset Password</h2>
          <p className="text-muted-foreground">Enter your email to receive a reset link</p>
        </div>

        {/* Reset Card */}
        <div className="bg-card rounded-2xl shadow-xl border p-6">
          {/* Back to Login Link */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                We'll send a password reset link to this email address
              </p>
            </div>

            {/* Reset Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary/25"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => {
                  setMessage('');
                  setError('');
                }}
                className="text-primary hover:underline font-medium"
              >
                try again
              </button>
            </p>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Remember your password?{' '}
            <Link 
              href="/login" 
              className="text-primary hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
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