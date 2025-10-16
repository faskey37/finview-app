
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth, sendPasswordReset, updateUserEmail, reauthenticate, deleteUserAccount, sendVerificationEmail } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sparkles, Edit, CalendarIcon, BadgeCheck, Trash2, AlertCircle, Mail, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { sendEmail } from "@/ai/flows/send-email";
import { generateMonthlySummary } from "@/ai/flows/generate-monthly-summary";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useGoals } from "@/hooks/use-goals";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const photoSchema = z.object({
  url: z.string().url("Please enter a valid URL."),
});

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account."),
});

export default function ProfilePage() {
  const { user, loading, userData, updateAuthUserProfile } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSendingReset, setIsSendingReset] = React.useState(false);
  const [isSendingVerification, setIsSendingVerification] = React.useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = React.useState(false);
  const [isSendingSummary, setIsSendingSummary] = React.useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = React.useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const [accountAge, setAccountAge] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useGoals();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
  });
  
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const photoForm = useForm<z.infer<typeof photoSchema>>({
    resolver: zodResolver(photoSchema),
    defaultValues: { url: "" },
  });
  
  const deleteForm = useForm<z.infer<typeof deleteSchema>>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { password: "" },
  });

  React.useEffect(() => {
    profileForm.reset({ name: user?.displayName || "" });
    emailForm.reset({ email: user?.email || "", password: "" });
    photoForm.reset({ url: userData?.photoURL || user?.photoURL || "" });
    if (user?.metadata.creationTime) {
      setAccountAge(formatDistanceToNow(new Date(user.metadata.creationTime)));
    }
  }, [user, userData, profileForm, emailForm, photoForm]);

  async function handleProfileUpdate(values: z.infer<typeof profileSchema>) {
    setIsSaving(true);
    try {
      await updateAuthUserProfile({ displayName: values.name });
      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEmailUpdate(values: z.infer<typeof emailSchema>) {
    setIsSaving(true);
    try {
      await updateUserEmail(values.email, values.password);
      toast({ title: "Success!", description: "A verification link has been sent to your new email address. Please verify to complete the change." });
      setEmailDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update email." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoUpdate(values: z.infer<typeof photoSchema>) {
    setIsSaving(true);
    try {
      await updateAuthUserProfile({ photoURL: values.url });
      toast({ title: "Success", description: "Profile picture updated." });
      setPhotoDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile picture." });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      await sendPasswordReset(user.email);
      toast({ title: "Email Sent", description: "Check your inbox for a password reset link." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send reset email." });
    } finally {
      setIsSendingReset(false);
    }
  }

   async function handleResendVerification() {
    if (!user) return;
    setIsSendingVerification(true);
    try {
      await sendVerificationEmail();
      toast({ title: "Verification Email Sent", description: "Please check your inbox." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send verification email." });
    } finally {
      setIsSendingVerification(false);
    }
  }

  async function handleDeleteAccount(values: z.infer<typeof deleteSchema>) {
    if (!user?.email) return;
    setIsDeleting(true);
    try {
      await reauthenticate(user.email, values.password);
      await deleteUserAccount();
      toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
    } catch (error: any) {
       toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete account. Please check your password." });
    } finally {
        setIsDeleting(false);
    }
  }
  
   async function handleSendTestEmail() {
    if (!user?.email) return;
    setIsSendingTestEmail(true);
    try {
      const result = await sendEmail({
        to: user.email,
        subject: "Test Email from EcoVest",
        html: "This is a test email to confirm that your email service is configured correctly.",
      });
       if (result.success) {
        toast({ title: "Test Email Sent", description: "Please check your inbox." });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error: Email Not Sent", description: error.message });
    } finally {
      setIsSendingTestEmail(false);
    }
  }

  async function handleSendSummary() {
    if (!user?.email) return;
    setIsSendingSummary(true);
    try {
      const summaryResult = await generateMonthlySummary({
        transactions: JSON.stringify(transactions),
        budgets: JSON.stringify(budgets),
        goals: JSON.stringify(goals),
      });

      const emailResult = await sendEmail({
        to: user.email,
        subject: "Your Monthly Financial Summary from EcoVest",
        html: summaryResult.summaryHtml,
      });

      if (emailResult.success) {
        toast({ title: "Monthly Summary Sent", description: "Check your inbox for your AI-generated summary." });
      } else {
        throw new Error(emailResult.message);
      }
    } catch (error: any) {
       toast({ variant: "destructive", title: "Error", description: error.message || "Could not send summary." });
    } finally {
      setIsSendingSummary(false);
    }
  }


  if (loading) {
    return (
       <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <div className="space-y-8">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
       </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

      {user && !user.emailVerified && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Email Not Verified</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            Please check your inbox to verify your email address.
            <Button
              onClick={handleResendVerification}
              disabled={isSendingVerification}
              variant="link"
              className="text-destructive-foreground"
            >
              {isSendingVerification ? 'Sending...' : 'Resend Email'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Your Information</CardTitle>
                <CardDescription>Update your personal information and manage your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                        <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-2">
                        <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Change Picture</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <Form {...photoForm}>
                                    <form onSubmit={photoForm.handleSubmit(handlePhotoUpdate)}>
                                        <DialogHeader>
                                            <DialogTitle>Update Profile Picture</DialogTitle>
                                            <DialogDescription>
                                                Enter a URL for your new profile picture.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <FormField
                                                control={photoForm.control}
                                                name="url"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Image URL</FormLabel>
                                                        <FormControl>
                                                            <Input type="text" placeholder="https://example.com/image.png" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={isSaving}>
                                                {isSaving ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                         <p className="text-sm text-muted-foreground">Update your avatar from a public URL.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2"><CalendarIcon/> Account Age</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <p className="text-2xl font-bold">{accountAge}</p>
                      </CardContent>
                  </Card>
                   <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium flex items-center gap-2"><BadgeCheck/> Membership</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <div className="text-2xl font-bold flex items-center gap-2">
                            {userData?.isPro ? "Pro" : "Basic"}
                             {userData?.isPro && <Sparkles className="h-6 w-6 text-primary" />}
                          </div>
                      </CardContent>
                  </Card>
                </div>
            
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                        <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Name"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account Security</CardTitle>
          <CardDescription>Manage your email, password, and test notification settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2 p-4 border rounded-lg">
                <label className="text-sm font-medium leading-none">Email</label>
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" type="button"><Edit /> Change Email</Button>
                        </DialogTrigger>
                        <DialogContent>
                             <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)}>
                                <DialogHeader>
                                    <DialogTitle>Change Email Address</DialogTitle>
                                    <DialogDescription>
                                    Enter your new email and current password to make the change.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <FormField control={emailForm.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Email</FormLabel>
                                        <FormControl><Input type="email" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )} />
                                    <FormField control={emailForm.control} name="password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )} />
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={isSaving}>{isSaving ? "Updating..." : "Update Email"}</Button>
                                </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="space-y-2 p-4 border rounded-lg">
                <label className="text-sm font-medium leading-none">Password</label>
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">••••••••••••</p>
                    <Button onClick={handlePasswordReset} disabled={isSendingReset} variant="outline">
                        {isSendingReset ? "Sending..." : "Send Reset Link"}
                    </Button>
                </div>
            </div>
          
            <div className="space-y-2 p-4 border rounded-lg">
                <label className="text-sm font-medium leading-none">Monthly Summary</label>
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">Send an AI-generated summary of your monthly activity.</p>
                     <Button onClick={handleSendSummary} disabled={isSendingSummary} variant="outline">
                       <Send />
                       {isSendingSummary ? "Sending..." : "Send Summary Email"}
                    </Button>
                </div>
            </div>
        </CardContent>
        <CardFooter>
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <Form {...deleteForm}>
                   <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This is a sensitive operation. To confirm, please enter your password. This will permanently delete your account and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                       <div className="py-4">
                         <FormField
                          control={deleteForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                       </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction type="submit" disabled={isDeleting} variant="destructive">
                          {isDeleting ? "Deleting..." : "Confirm Deletion"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                   </form>
                </Form>
              </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
