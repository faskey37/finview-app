
"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { verifyResetCode, resetPassword } from "@/hooks/use-auth";
import Logo from "@/components/logo";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
});

function PasswordResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [mode, setMode] = useState<string | null>(null);
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const oobCodeParam = searchParams.get('oobCode');
    
    setMode(modeParam);

    if (modeParam === 'resetPassword' && oobCodeParam) {
      setActionCode(oobCodeParam);
      verifyResetCode(oobCodeParam)
        .then(userEmail => {
          setEmail(userEmail);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError("The password reset link is invalid or has expired. Please try again.");
          setLoading(false);
        });
    } else {
        setError("Invalid action. Please check the link or start the process again.");
        setLoading(false);
    }
  }, [searchParams]);

  async function onSubmit(values: z.infer<typeof passwordSchema>) {
    if (!actionCode) return;
    try {
      await resetPassword(actionCode, values.password);
      toast({
        title: "Success!",
        description: "Your password has been reset. You can now log in with your new password.",
      });
      router.push("/");
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset password. The link may have expired.",
      });
    }
  }

  if (loading) {
    return <p>Verifying link...</p>;
  }
  
  if (error) {
     return (
        <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="link" asChild><Link href="/">Back to Login</Link></Button>
        </div>
    );
  }

  if (mode === 'resetPassword') {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter a new password for {email}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Save New Password</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="text-center">
        <p className="text-destructive">An unknown error occurred.</p>
        <Button variant="link" asChild><Link href="/">Back to Login</Link></Button>
    </div>
  );
}


export default function AuthActionPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
            <div className="flex flex-col items-center space-y-4 text-center mb-8">
                <Logo />
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <PasswordResetForm />
            </Suspense>
        </main>
    )
}
