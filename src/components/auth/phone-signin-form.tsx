
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { sendPhoneNumberVerification, verifyOtp } from "@/hooks/use-auth";
import { ConfirmationResult } from "firebase/auth";
import { Loader2 } from "lucide-react";

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Please enter a valid phone number, including country code."),
});

const otpSchema = z.object({
  otp: z.string().length(6, "The code must be 6 digits."),
});

interface PhoneSignInFormProps {
    onSignInSuccess: () => void;
}

export function PhoneSignInForm({ onSignInSuccess }: PhoneSignInFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);
  const { toast } = useToast();

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  async function onPhoneSubmit(values: z.infer<typeof phoneSchema>) {
    setIsLoading(true);
    try {
      const result = await sendPhoneNumberVerification(values.phoneNumber);
      setConfirmationResult(result);
      toast({ title: "Verification Code Sent", description: "Please check your phone for the 6-digit code." });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Sending Code",
        description: error.message || "An error occurred. Please check the number and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onOtpSubmit(values: z.infer<typeof otpSchema>) {
    if (!confirmationResult) return;
    setIsLoading(true);
    try {
      await verifyOtp(confirmationResult, values.otp);
      toast({ title: "Sign In Successful", description: "Welcome!" });
      onSignInSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message || "The code was incorrect. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div>
      {!confirmationResult ? (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <FormField
              control={phoneForm.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1 123 456 7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground text-center">
              Please note: Standard messaging rates may apply. To ensure service for all users, phone verification usage is monitored.
            </p>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Send Verification Code
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Verify & Sign In
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
