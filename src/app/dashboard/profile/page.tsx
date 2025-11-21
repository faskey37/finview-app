"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth, sendPasswordReset, updateUserEmail, reauthenticate, deleteUserAccount, linkPhoneNumber, verifyOtpForLinking } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sparkles, Edit, CalendarIcon, BadgeCheck, Trash2, Mail, Send, Phone, Loader2, Sprout, User, Shield, Bell, CreditCard } from "lucide-react";
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
import { ConfirmationResult } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const phoneSchema = z.object({
    phoneNumber: z.string().min(10, "Please enter a valid phone number."),
});

const otpSchema = z.object({
    otp: z.string().min(6, "Please enter the 6-digit code."),
});

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account."),
});

export default function ProfilePage() {
  const { user, loading, userData, updateAuthUserProfile, isPro } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSendingReset, setIsSendingReset] = React.useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = React.useState(false);
  const [isSendingSummary, setIsSendingSummary] = React.useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = React.useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = React.useState(false);
  const [accountAge, setAccountAge] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(null);

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

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  
  const deleteForm = useForm<z.infer<typeof deleteSchema>>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { password: "" },
  });

  React.useEffect(() => {
    profileForm.reset({ name: user?.displayName || "" });
    emailForm.reset({ email: user?.email || "", password: "" });
    photoForm.reset({ url: userData?.photoURL || user?.photoURL || "" });
     if (user) {
        phoneForm.reset({ phoneNumber: user.phoneNumber || "" });
        if (user.metadata.creationTime) {
            setAccountAge(formatDistanceToNow(new Date(user.metadata.creationTime)));
        }
    }
  }, [user, userData, profileForm, emailForm, photoForm, phoneForm]);

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

    async function handleLinkPhone(values: z.infer<typeof phoneSchema>) {
    setIsSaving(true);
    try {
        const result = await linkPhoneNumber(values.phoneNumber);
        setConfirmationResult(result);
        toast({ title: "Verification Code Sent", description: "Please check your phone for the code." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send code." });
    } finally {
        setIsSaving(false);
    }
  }

  async function handleVerifyOtp(values: z.infer<typeof otpSchema>) {
    if (!confirmationResult) return;
    setIsSaving(true);
    try {
        await verifyOtpForLinking(confirmationResult, values.otp);
        toast({ title: "Success", description: "Phone number linked successfully." });
        setPhoneDialogOpen(false);
        setConfirmationResult(null);
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: error.message || "Invalid code." });
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
        transactions: transactions,
        budgets: budgets,
        goals: goals,
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
       <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        </div>
        <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
       </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <Badge variant={isPro ? "default" : "secondary"} className="gap-2">
          {isPro ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
          {isPro ? "Pro Plan" : "Basic Plan"}
        </Badge>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                    <AvatarFallback className="text-lg">
                      {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">Change Photo</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
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
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account Age</p>
                    <p className="text-lg font-semibold">{accountAge}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <BadgeCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-lg font-semibold">{isPro ? "Pro" : "Basic"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Sprout className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Eco-Points</p>
                    <p className="text-lg font-semibold">{userData?.ecoPoints || 0}</p>
                  </div>
                </div>
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
                          <div className="flex gap-2">
                            <Input {...field} className="flex-1" />
                            <Button type="submit" disabled={isSaving} size="sm">
                              {isSaving ? "Saving..." : "Update"}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your authentication methods and account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
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
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={emailForm.control} name="password" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={isSaving}>
                              {isSaving ? "Updating..." : "Update Email"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone Number</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.phoneNumber || "Not linked"}
                      </p>
                    </div>
                  </div>
                  <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        {user?.phoneNumber ? "Change" : "Link"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{confirmationResult ? 'Verify Code' : 'Link Phone Number'}</DialogTitle>
                        <DialogDescription>
                          {confirmationResult ? "Enter the code sent to your phone." : "Enter your phone number to receive a verification code."}
                        </DialogDescription>
                      </DialogHeader>
                      {!confirmationResult ? (
                        <Form {...phoneForm}>
                          <form onSubmit={phoneForm.handleSubmit(handleLinkPhone)} className="space-y-4 py-4">
                            <FormField control={phoneForm.control} name="phoneNumber" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input type="tel" placeholder="+1 123 456 7890" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <DialogFooter>
                              <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="animate-spin mr-2" />}
                                Send Code
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      ) : (
                        <Form {...otpForm}>
                          <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4 py-4">
                            <FormField control={otpForm.control} name="otp" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl>
                                  <Input type="text" placeholder="123456" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <DialogFooter>
                              <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="animate-spin mr-2" />}
                                Verify & Link
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">Last updated {accountAge} ago</p>
                    </div>
                  </div>
                  <Button onClick={handlePasswordReset} disabled={isSendingReset} variant="outline" size="sm">
                    {isSendingReset ? "Sending..." : "Reset Password"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Permanent account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <Form {...deleteForm}>
                    <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <FormField
                          control={deleteForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction type="submit" disabled={isDeleting} variant="destructive">
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Manage your email preferences and test delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Test Email Delivery</p>
                    <p className="text-sm text-muted-foreground">Verify your email service is working</p>
                  </div>
                </div>
                <Button onClick={handleSendTestEmail} disabled={isSendingTestEmail} variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  {isSendingTestEmail ? "Sending..." : "Send Test"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Monthly Summary</p>
                    <p className="text-sm text-muted-foreground">
                      AI-generated financial summary {!isPro && "(Pro feature)"}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handleSendSummary} 
                  disabled={isSendingSummary || !isPro}
                  variant="outline" 
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSendingSummary ? "Sending..." : "Send Summary"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div id="recaptcha-container-profile" className="hidden"></div>
    </div>
  );
}