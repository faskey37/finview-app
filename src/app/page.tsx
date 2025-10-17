
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import Logo from "@/components/logo";
import { Button } from '@/components/ui/button';
import { AppLoader } from '@/components/app-loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';
import { Phone } from 'lucide-react';
import { PhoneSignInForm } from '@/components/auth/phone-signin-form';
import { signInWithGoogle } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'phone'>('login');
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <AppLoader />;
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Signed in with Google",
        description: "Welcome!",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };
  
  const getTitle = () => {
    switch (authMode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create an Account';
      case 'phone': return 'Sign In with Phone';
    }
  }
  
  const getDescription = () => {
     switch (authMode) {
      case 'login': return 'Enter your credentials to access your dashboard.';
      case 'signup': return 'Fill out the form to get started.';
      case 'phone': return 'Enter your phone number to receive a verification code.';
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
       <div className="flex flex-col items-center space-y-2 text-center mb-6">
        <Logo />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <CardTitle>{getTitle()}</CardTitle>
            <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
            {authMode !== 'phone' && (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        <Button variant="outline" onClick={handleGoogleSignIn}>
                            <FcGoogle className="mr-2 h-5 w-5" />
                            Sign in with Google
                        </Button>
                    </div>
                    <div className="my-4 flex items-center">
                        <Separator className="flex-1" />
                        <span className="mx-4 text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                    </div>
                </>
            )}

            {authMode === 'login' && <LoginForm />}
            {authMode === 'signup' && <SignupForm onSignupSuccess={() => setAuthMode('login')} />}
            {authMode === 'phone' && <PhoneSignInForm onSignInSuccess={() => router.push('/dashboard')} />}
            
            <div className="mt-6 text-center text-sm">
              {authMode === 'login' && (
                <Button variant="link" onClick={() => setAuthMode('signup')}>
                  Don't have an account? Sign up
                </Button>
              )}
              {authMode === 'signup' && (
                <Button variant="link" onClick={() => setAuthMode('login')}>
                  Already have an account? Sign in
                </Button>
              )}
               {authMode === 'phone' && (
                <Button variant="link" onClick={() => setAuthMode('login')}>
                  Sign in with email instead
                </Button>
              )}
            </div>
        </CardContent>
      </Card>
      <div id="recaptcha-container"></div>
    </main>
  );
}
