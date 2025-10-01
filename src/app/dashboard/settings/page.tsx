
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Mail, Smartphone, Sprout } from "lucide-react";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";

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


export default function SettingsPage() {
  const { user, loading, userData, updateUserData } = useAuth();
  const { setCurrency } = useCurrency();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const [isSaving, setIsSaving] = React.useState(false);
  
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


  React.useEffect(() => {
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
  }, [user, userData, notificationsForm, appearanceForm, climateForm]);

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
  

  if (loading) {
    return (
       <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
       </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

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
    </div>
  );
}

    