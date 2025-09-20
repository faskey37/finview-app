
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth, sendPasswordReset, reauthenticate, deleteUserAccount, updateUserEmail } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Trash2, Sparkles, Bell, Mail, Smartphone, Sprout, Edit } from "lucide-react";
import { useTheme } from "next-themes";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const appearanceSchema = z.object({
  currency: z.string(),
});

const climateSchema = z.object({
  roundUpForClimate: z.boolean().default(false),
});


const notificationsSchema = z.object({
    weeklySummary: z.boolean().default(false),
    budgetAlerts: z.boolean().default(true),
    pushNotifications: z.object({
        unusualTransactions: z.boolean().default(true),
        lowBalance: z.boolean().default(true),
        goalMilestones: z.boolean().default(true),
    }).default({}),
});

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account."),
});

export default function SettingsPage() {
  const { user, loading, userData, updateUserData, updateAuthUserProfile } = useAuth();
  const { setCurrency } = useCurrency();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSendingReset, setIsSendingReset] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = React.useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);

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

  const appearanceForm = useForm<z.infer<typeof appearanceSchema>>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: { currency: "USD" },
  });

  const climateForm = useForm<z.infer<typeof climateSchema>>({
    resolver: zodResolver(climateSchema),
    defaultValues: { roundUpForClimate: false },
  });


  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
        weeklySummary: false,
        budgetAlerts: true,
        pushNotifications: {
            unusualTransactions: true,
            lowBalance: true,
            goalMilestones: true,
        }
    }
  });
  
  const deleteForm = useForm<z.infer<typeof deleteSchema>>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { password: "" },
  });


  React.useEffect(() => {
    profileForm.reset({
      name: user?.displayName || "",
    });
    emailForm.reset({
      email: user?.email || "",
      password: ""
    });
    photoForm.reset({
      url: userData?.photoURL || user?.photoURL || "",
    });
    notificationsForm.reset({
      weeklySummary: userData?.notifications?.weeklySummary || false,
      budgetAlerts: userData?.notifications?.budgetAlerts !== false, // default to true
      pushNotifications: {
          unusualTransactions: userData?.notifications?.pushNotifications?.unusualTransactions !== false,
          lowBalance: userData?.notifications?.pushNotifications?.lowBalance !== false,
          goalMilestones: userData?.notifications?.pushNotifications?.goalMilestones !== false,
      }
    });
    appearanceForm.reset({
      currency: userData?.currency || "USD",
    });
    climateForm.reset({
      roundUpForClimate: userData?.roundUpForClimate || false,
    });
  }, [user, userData, profileForm, emailForm, notificationsForm, appearanceForm, photoForm, climateForm]);

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


  async function handleAppearanceUpdate(values: z.infer<typeof appearanceSchema>) {
    setIsSaving(true);
    try {
      await updateUserData({ currency: values.currency });
      setCurrency(values.currency);
      toast({ title: "Success", description: "Appearance settings updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
    } finally {
      setIsSaving(false);
    }
  }
  
    async function handleClimateUpdate(values: z.infer<typeof climateSchema>) {
    setIsSaving(true);
    try {
      await updateUserData({ roundUpForClimate: values.roundUpForClimate });
      toast({ title: "Success", description: "Climate contribution settings updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
    } finally {
      setIsSaving(false);
    }
  }


  async function handleNotificationsUpdate(values: z.infer<typeof notificationsSchema>) {
    setIsSaving(true);
    try {
      await updateUserData({ notifications: values });
      toast({ title: "Success", description: "Notification preferences updated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save preferences." });
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


  if (loading) {
    return (
       <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
       </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <CardTitle className="text-lg">Profile</CardTitle>
                    {userData?.isPro && (
                      <Badge 
                        variant="default"
                        className={cn(
                          "border-transparent animate-pulse"
                          )}
                        style={{
                          boxShadow: '0 0 8px hsl(var(--primary)), 0 0 16px hsl(var(--primary))'
                        }}
                      >
                        <Sparkles className="mr-1 h-3 w-3"/>Pro
                      </Badge>
                    )}
                </div>
                <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                        <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                     <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">Change picture</Button>
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
                </div>
            </CardContent>
            <Separator />
            <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
                    <CardContent className="space-y-4 pt-6">
                        <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-2">
                          <FormLabel>Email</FormLabel>
                          <div className="flex items-center gap-4">
                            <Input readOnly disabled value={user?.email || ''} />
                            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                              <DialogTrigger asChild>
                                 <Button variant="outline" type="button"><Edit /> Edit Email</Button>
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
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving Name..." : "Save Name"}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Password</CardTitle>
          <CardDescription>Change your password by sending a reset link to your email.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handlePasswordReset} disabled={isSendingReset}>
                {isSendingReset ? "Sending..." : "Send Password Reset Email"}
            </Button>
        </CardContent>
      </Card>

      <Card>
          <Form {...appearanceForm}>
              <form onSubmit={appearanceForm.handleSubmit(handleAppearanceUpdate)}>
                <CardHeader>
                  <CardTitle className="text-lg">Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="icon" onClick={() => setTheme('light')}><Sun /></Button>
                        <Button variant="outline" size="icon" onClick={() => setTheme('dark')}><Moon /></Button>
                        <span className="text-sm text-muted-foreground">Current theme: {theme}</span>
                    </div>
                    <FormField
                      control={appearanceForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="JPY">JPY (¥)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="INR">INR (₹)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
      </Card>
      
       <Card>
          <Form {...climateForm}>
              <form onSubmit={climateForm.handleSubmit(handleClimateUpdate)}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Sprout className="text-accent"/> Climate Contribution</CardTitle>
                  <CardDescription>Make a positive impact on the environment.</CardDescription>
                </CardHeader>
                <CardContent>
                     <FormField
                        control={climateForm.control}
                        name="roundUpForClimate"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Round-Up for Climate</FormLabel>
                                <FormDescription>Automatically round up your transactions to the nearest dollar and donate the spare change to verified climate projects.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
      </Card>

      <Card>
          <Form {...notificationsForm}>
              <form onSubmit={notificationsForm.handleSubmit(handleNotificationsUpdate)}>
                <CardHeader>
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2"><Mail /> Email Notifications</h4>
                        <FormField
                        control={notificationsForm.control}
                        name="weeklySummary"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Weekly Summaries</FormLabel>
                                <FormDescription>Receive a summary of your financial activity every week.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={notificationsForm.control}
                        name="budgetAlerts"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Budget Alerts</FormLabel>
                                <FormDescription>Get notified when you are approaching a budget limit.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                    </div>

                     <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2"><Smartphone /> Push Notifications</h4>
                        <FormField
                        control={notificationsForm.control}
                        name="pushNotifications.unusualTransactions"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Unusual Transactions</FormLabel>
                                <FormDescription>Alerts for large or un-categorized spending.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={notificationsForm.control}
                        name="pushNotifications.lowBalance"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Low Balance Warnings</FormLabel>
                                <FormDescription>Get an alert when an account balance is low.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={notificationsForm.control}
                        name="pushNotifications.goalMilestones"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Goal Milestones</FormLabel>
                                <FormDescription>Celebrate when you reach a new savings milestone.</FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
      </Card>

      <Separator />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Delete Account</CardTitle>
          <CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
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
                          This is a sensitive operation. To confirm, please enter your password.
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
                        <AlertDialogAction type="submit" disabled={isDeleting}>
                          {isDeleting ? "Deleting..." : "Confirm Deletion"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                   </form>
                </Form>
              </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
