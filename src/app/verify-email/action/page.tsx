'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VerifyEmailActionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check if the current URL is a sign-in link
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus('error');
          setMessage('Invalid verification link. Please request a new one.');
          return;
        }

        // Get the email from localStorage (saved during signup)
        let email = localStorage.getItem('emailForSignIn');
        
        if (!email) {
          // If email not found in localStorage, try to get from URL or prompt
          const urlParams = new URLSearchParams(window.location.search);
          email = urlParams.get('email');
          
          if (!email) {
            // If still no email, prompt user
            email = window.prompt('Please enter your email address for verification:');
            
            if (!email) {
              setStatus('error');
              setMessage('Email is required for verification.');
              return;
            }
          }
        }

        console.log('Verifying email with:', email); // Debug log

        // Complete the sign-in with email link
        const result = await signInWithEmailLink(auth, email, window.location.href);
        
        // Clear the email from storage
        localStorage.removeItem('emailForSignIn');
        
        if (result.user) {
          setStatus('success');
          setMessage('Email verified successfully!');
          
          toast({
            title: 'Success!',
            description: 'Your email has been verified. You can now sign in.',
          });
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Verification error details:', error);
        setStatus('error');
        
        // Handle specific Firebase errors
        if (error.code === 'auth/invalid-action-code') {
          setMessage('The verification link has expired or is invalid. Please request a new one.');
        } else if (error.code === 'auth/user-disabled') {
          setMessage('This account has been disabled.');
        } else if (error.code === 'auth/user-not-found') {
          setMessage('No account found with this email address.');
        } else if (error.code === 'auth/expired-action-code') {
          setMessage('The verification link has expired. Please request a new one.');
        } else {
          setMessage(error.message || 'Failed to verify email. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [router, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-2xl shadow-xl border p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-primary/20 animate-pulse">
                  <Loader2 className="h-12 w-12 text-primary animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Verifying Email</h2>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-green-500/20">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-destructive/20">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                <Link 
                  href="/verify-email" 
                  className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Back to Verification Page
                </Link>
                <Link 
                  href="/signup" 
                  className="block w-full px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Create New Account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}