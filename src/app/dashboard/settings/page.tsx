
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth, updateUserProfile, sendPasswordReset, reauthenticate, deleteUserAccount } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Trash2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  photoURL: z.string().url().optional().or(z.literal('')),
});

const notificationsSchema = z.object({
  weeklySummary: z.boolean().default(false),
  budgetAlerts: z.boolean().default(true),
});

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required to delete your account."),
});

export default function SettingsPage() {
  const { user, loading, userData, updateUserData } = useAuth();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSendingReset, setIsSendingReset] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", email: "", photoURL: "" },
  });

  const notificationsForm = useForm<z.infer<typeof notificationsSchema>>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: { weeklySummary: false, budgetAlerts: true },
  });
  
  const deleteForm = useForm<z.infer<typeof deleteSchema>>({
    resolver: zodResolver(deleteSchema),
    defaultValues: { password: "" },
  });


  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
      });
    }
    if (userData) {
      notificationsForm.reset({
        weeklySummary: userData.notifications?.weeklySummary || false,
        budgetAlerts: userData.notifications?.budgetAlerts !== false, // default to true
      });
    }
  }, [user, userData, profileForm, notificationsForm]);

  async function handleProfileUpdate(values: z.infer<typeof profileSchema>) {
    setIsSaving(true);
    try {
      await updateUserProfile({ displayName: values.name, photoURL: values.photoURL });
      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
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
      // The user will be redirected via the auth state listener
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
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <FormField
                  control={profileForm.control}
                  name="photoURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <div className="flex items-center gap-4">
                         <Avatar className="h-16 w-16">
                            <AvatarImage src={field.value || ""} />
                            <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <FormControl>
                            <Input placeholder="https://example.com/photo.png" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" readOnly disabled {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
               <CardFooter>
                 <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
               </CardFooter>
            </form>
          </Form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your password by sending a reset link to your email.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handlePasswordReset} disabled={isSendingReset}>
                {isSendingReset ? "Sending..." : "Send Password Reset Email"}
            </Button>
        </CardContent>
      </Card>
      
      <Card>
          <Form {...notificationsForm}>
              <form onSubmit={notificationsForm.handleSubmit(handleNotificationsUpdate)}>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <FormField
                      control={notificationsForm.control}
                      name="weeklySummary"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Weekly Summaries</FormLabel>
                            <FormMessage />
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
                            <FormLabel className="text-base">Budget Alerts</FormLabel>
                             <FormMessage />
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
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => setTheme('light')}>
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              </Button>
               <Button variant="outline" size="icon" onClick={() => setTheme('dark')}>
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              </Button>
              <span className="text-sm text-muted-foreground">
                  Current theme: {theme}
              </span>
            </div>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Account</CardTitle>
          <CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <Form {...deleteForm}>
                   <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This is a permanent action. To confirm, please enter your password.
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
