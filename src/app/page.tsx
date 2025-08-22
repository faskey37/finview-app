
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import Logo from "@/components/logo";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);
  
  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
         <Skeleton className="h-24 w-64" />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Logo />
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to FinView
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          {showLogin 
            ? "Enter your credentials to access your dashboard"
            : "Create an account to start managing your finances"
          }
        </p>
      </div>

      {showLogin ? <LoginForm /> : <SignupForm />}

      <div className="mt-4">
        <Button variant="link" onClick={() => setShowLogin(!showLogin)}>
          {showLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </Button>
      </div>
    </main>
  );
}
