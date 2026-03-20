'use client';

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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Sparkles, Edit, CalendarIcon, BadgeCheck, Trash2, Mail, Send, Phone, Loader2, 
  Sprout, User, Shield, Bell, CreditCard, Download, Upload, FileText, 
  AlertCircle, CheckCircle, Database, RefreshCw, Archive, MapPin, Briefcase, 
  DollarSign, Target, GraduationCap, PiggyBank, Globe, Award, Clock, Heart,
  TrendingUp, Leaf, Crown, Calendar, Users
} from "lucide-react";
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
import { formatDistanceToNow, format } from "date-fns";
import { sendEmail } from "@/ai/flows/send-email";
import { generateMonthlySummary } from "@/ai/flows/generate-monthly-summary";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useGoals } from "@/hooks/use-goals";
import { ConfirmationResult } from "firebase/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import JSZip from 'jszip';

// Import/Export Service
import { exportUserData, importUserData } from "@/services/data-export";
import type { ExportProgress, ExportResult, ImportResult } from "@/services/data-export";

// Constants from signup page
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'India', 
  'Germany', 'France', 'Japan', 'Singapore', 'UAE', 'Other'
];

const OCCUPATIONS = [
  'Salaried Employee', 'Business Owner', 'Freelancer', 'Self-Employed',
  'Student', 'Retired', 'Homemaker', 'Unemployed', 'Other'
];

const INCOME_RANGES = [
  'Under $25,000', '$25,000 - $50,000', '$50,000 - $75,000',
  '$75,000 - $100,000', '$100,000 - $150,000', '$150,000 - $200,000',
  'Over $200,000', 'Prefer not to say'
];

const FINANCIAL_GOALS = [
  { id: 'saving', label: 'Save more money', icon: PiggyBank },
  { id: 'investing', label: 'Start investing', icon: TrendingUp },
  { id: 'debt', label: 'Pay off debt', icon: CreditCard },
  { id: 'budget', label: 'Better budgeting', icon: Target },
  { id: 'tracking', label: 'Track expenses', icon: Database },
  { id: 'retirement', label: 'Plan for retirement', icon: Clock },
  { id: 'house', label: 'Buy a house', icon: Home },
  { id: 'emergency', label: 'Build emergency fund', icon: Shield },
  { id: 'education', label: 'Education fund', icon: GraduationCap },
  { id: 'travel', label: 'Travel', icon: Globe },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner - New to finance' },
  { id: 'intermediate', label: 'Intermediate - Some knowledge' },
  { id: 'advanced', label: 'Advanced - Experienced' },
  { id: 'expert', label: 'Expert - Financial professional' },
];

// Profile Schemas
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  age: z.string().refine((val) => !val || (parseInt(val) >= 18 && parseInt(val) <= 120), {
    message: "Age must be between 18 and 120",
  }).optional(),
  occupation: z.string().optional(),
  phone: z.string().optional(),
});

const financialSchema = z.object({
  incomeRange: z.string().optional(),
  experienceLevel: z.string().optional(),
  hasEmergencyFund: z.boolean().optional(),
  monthlySavings: z.string().optional(),
  financialGoals: z.array(z.string()).optional(),
  roundUpForClimate: z.boolean().optional(),
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
  const { user, loading, userData, updateAuthUserProfile, updateUserData, isPro } = useAuth();
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
  const [editingSection, setEditingSection] = React.useState<string | null>(null);
  
  // Export/Import states
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const [importDialogOpen, setImportDialogOpen] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState<ExportProgress>({
    stage: 'idle',
    progress: 0,
    total: 0,
    currentItem: ''
  });
  const [importFile, setImportFile] = React.useState<File | null>(null);
  const [importResult, setImportResult] = React.useState<{
    success?: boolean;
    message?: string;
    stats?: any;
  } | null>(null);

  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useGoals();

  // Profile Form
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
      country: "",
      city: "",
      age: "",
      occupation: "",
      phone: "",
    },
  });

  // Financial Form
  const financialForm = useForm<z.infer<typeof financialSchema>>({
    resolver: zodResolver(financialSchema),
    defaultValues: {
      incomeRange: "",
      experienceLevel: "",
      hasEmergencyFund: false,
      monthlySavings: "",
      financialGoals: [],
      roundUpForClimate: false,
    },
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

  // Load user data into forms
  React.useEffect(() => {
    if (userData) {
      profileForm.reset({
        name: userData.displayName || user?.displayName || "",
        bio: userData.bio || "",
        country: userData.country || "",
        city: userData.city || "",
        age: userData.age?.toString() || "",
        occupation: userData.occupation || "",
        phone: user?.phoneNumber || userData.phone || "",
      });

      financialForm.reset({
        incomeRange: userData.incomeRange || "",
        experienceLevel: userData.experienceLevel || "",
        hasEmergencyFund: userData.hasEmergencyFund ?? false,
        monthlySavings: userData.monthlySavings?.toString() || "",
        financialGoals: userData.financialGoals || [],
        roundUpForClimate: userData.roundUpForClimate || false,
      });
    }
    
    emailForm.reset({ email: user?.email || "", password: "" });
    photoForm.reset({ url: userData?.photoURL || user?.photoURL || "" });
    
    if (user) {
      phoneForm.reset({ phoneNumber: user.phoneNumber || userData?.phone || "" });
      if (user.metadata.creationTime) {
        setAccountAge(formatDistanceToNow(new Date(user.metadata.creationTime), { addSuffix: true }));
      }
    }
  }, [user, userData, profileForm, financialForm, emailForm, photoForm, phoneForm]);

  // Profile update handler
  async function handleProfileUpdate(values: z.infer<typeof profileSchema>) {
    setIsSaving(true);
    try {
      await updateAuthUserProfile({ displayName: values.name });
      await updateUserData({
        displayName: values.name,
        bio: values.bio,
        country: values.country,
        city: values.city,
        age: values.age ? parseInt(values.age) : undefined,
        occupation: values.occupation,
        phone: values.phone,
      });
      
      toast({ 
        title: "Success", 
        description: "Profile information updated successfully." 
      });
      setEditingSection(null);
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to update profile." 
      });
    } finally {
      setIsSaving(false);
    }
  }

  // Financial info update handler
  async function handleFinancialUpdate(values: z.infer<typeof financialSchema>) {
    setIsSaving(true);
    try {
      await updateUserData({
        incomeRange: values.incomeRange,
        experienceLevel: values.experienceLevel,
        hasEmergencyFund: values.hasEmergencyFund,
        monthlySavings: values.monthlySavings ? parseFloat(values.monthlySavings) : undefined,
        financialGoals: values.financialGoals,
        roundUpForClimate: values.roundUpForClimate,
      });
      
      toast({ 
        title: "Success", 
        description: "Financial information updated successfully." 
      });
      setEditingSection(null);
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to update financial information." 
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEmailUpdate(values: z.infer<typeof emailSchema>) {
    setIsSaving(true);
    try {
      await updateUserEmail(values.email, values.password);
      toast({ 
        title: "Success!", 
        description: "A verification link has been sent to your new email address." 
      });
      setEmailDialogOpen(false);
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Failed to update email." 
      });
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
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to update profile picture." 
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLinkPhone(values: z.infer<typeof phoneSchema>) {
    setIsSaving(true);
    try {
      const result = await linkPhoneNumber(values.phoneNumber);
      setConfirmationResult(result);
      toast({ 
        title: "Verification Code Sent", 
        description: "Please check your phone for the code." 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Failed to send code." 
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVerifyOtp(values: z.infer<typeof otpSchema>) {
    if (!confirmationResult) return;
    setIsSaving(true);
    try {
      await verifyOtpForLinking(confirmationResult, values.otp);
      toast({ 
        title: "Success", 
        description: "Phone number linked successfully." 
      });
      setPhoneDialogOpen(false);
      setConfirmationResult(null);
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Invalid code." 
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      await sendPasswordReset(user.email);
      toast({ 
        title: "Email Sent", 
        description: "Check your inbox for a password reset link." 
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: "Failed to send reset email." 
      });
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
      toast({ 
        title: "Account Deleted", 
        description: "Your account has been permanently deleted." 
      });
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Failed to delete account." 
      });
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
      toast({ 
        variant: "destructive", 
        title: "Error: Email Not Sent", 
        description: error.message 
      });
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
        toast({ 
          title: "Monthly Summary Sent", 
          description: "Check your inbox for your AI-generated summary." 
        });
      } else {
        throw new Error(emailResult.message);
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Could not send summary." 
      });
    } finally {
      setIsSendingSummary(false);
    }
  }

  const debugImportFile = async (file: File) => {
    try {
      console.log('🔍 Analyzing import file:', file.name, 'size:', file.size);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('📦 File read as array buffer, size:', arrayBuffer.byteLength);
      
      const zip = await JSZip.loadAsync(arrayBuffer);
      console.log('📂 ZIP loaded, files:', Object.keys(zip.files));
      
      const exportFile = zip.file('export.json');
      if (exportFile) {
        const content = await exportFile.async('string');
        const data = JSON.parse(content);
        console.log('📊 Export data found:', {
          accounts: data.accounts?.length || 0,
          transactions: data.transactions?.length || 0,
          budgets: data.budgets?.length || 0,
          goals: data.goals?.length || 0,
          investments: data.investments?.length || 0,
          recurring: data.recurringTransactions?.length || 0
        });
        
        const total = (data.accounts?.length || 0) + 
                      (data.transactions?.length || 0) + 
                      (data.budgets?.length || 0) + 
                      (data.goals?.length || 0) + 
                      (data.investments?.length || 0) + 
                      (data.recurringTransactions?.length || 0);
        
        toast({
          title: "Backup File Analysis",
          description: `Found ${total} items to import.`,
        });
      } else {
        let totalItems = 0;
        const fileTypes = ['accounts.json', 'transactions.json', 'budgets.json', 'goals.json', 'investments.json', 'recurring.json'];
        
        for (const fileName of fileTypes) {
          const file = zip.file(fileName);
          if (file) {
            const content = await file.async('string');
            const data = JSON.parse(content);
            totalItems += data.length || 0;
            console.log(`📁 ${fileName}:`, data.length || 0, 'items');
          }
        }
        
        toast({
          title: "Backup File Analysis",
          description: `Found approximately ${totalItems} items to import.`,
        });
      }
    } catch (error) {
      console.error('❌ Error analyzing import file:', error);
      toast({
        variant: "destructive",
        title: "File Analysis Failed",
        description: error instanceof Error ? error.message : "Could not read the backup file",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportFile(file || null);
    setImportResult(null);
    if (file) {
      debugImportFile(file);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress({ stage: 'preparing', progress: 0, total: 0, currentItem: '' });
    
    try {
      const onProgress = (progress: ExportProgress) => {
        setExportProgress(progress);
      };

      const result = await exportUserData(onProgress);

      if (!result || !result.blob) {
        throw new Error('No data received from export');
      }

      const url = window.URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Successfully exported ${result.stats?.totalItems || 0} items.`,
      });
      
      setExportDialogOpen(false);
    } catch (error: any) {
      console.error('Export error details:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message || "Failed to export data. Check console for details.",
      });
    } finally {
      setIsExporting(false);
      setExportProgress({ stage: 'idle', progress: 0, total: 0, currentItem: '' });
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await importUserData(importFile);
      
      if (result.success) {
        setImportResult({
          success: true,
          message: result.message,
          stats: result.stats
        });
        
        toast({
          title: "Import Successful",
          description: result.message,
        });
        
        setTimeout(() => {
          setImportDialogOpen(false);
          setImportFile(null);
          setImportResult(null);
        }, 3000);
      } else {
        setImportResult({
          success: false,
          message: result.message,
          stats: result.stats
        });
      }
    } catch (error: any) {
      setImportResult({
        success: false,
        message: error.message || "Failed to import data"
      });
    } finally {
      setIsImporting(false);
    }
  };

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab - Personal Information */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal details and how others see you on EcoVest</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-6 flex-wrap">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
                    <AvatarFallback className="text-2xl">
                      {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{userData?.displayName || user?.displayName}</h2>
                    {userData?.emailVerified && (
                      <BadgeCheck className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {accountAge}</span>
                    </div>
                    {userData?.country && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{userData.country}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Badge variant="outline" className="px-3 py-1">
                  <Sprout className="h-3 w-3 mr-1 text-primary" />
                  {userData?.ecoPoints || 0} Eco Points
                </Badge>
              </div>

              <Separator />

              {/* Profile Form */}
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
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

                    <FormField
                      control={profileForm.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COUNTRIES.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" min="18" max="120" placeholder="Enter your age" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your occupation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {OCCUPATIONS.map((occ) => (
                                <SelectItem key={occ} value={occ}>
                                  {occ}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us a little about yourself..." 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Financial Profile
              </CardTitle>
              <CardDescription>
                Help us personalize your experience by sharing your financial goals and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...financialForm}>
                <form onSubmit={financialForm.handleSubmit(handleFinancialUpdate)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Income Range */}
                    <FormField
                      control={financialForm.control}
                      name="incomeRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Income Range</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select income range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INCOME_RANGES.map((range) => (
                                <SelectItem key={range} value={range}>
                                  {range}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Experience Level */}
                    <FormField
                      control={financialForm.control}
                      name="experienceLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Financial Experience</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {EXPERIENCE_LEVELS.map((level) => (
                                <SelectItem key={level.id} value={level.id}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Monthly Savings */}
                    <FormField
                      control={financialForm.control}
                      name="monthlySavings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Savings (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              step="100" 
                              placeholder="Amount you can save monthly" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Emergency Fund */}
                    <FormField
                      control={financialForm.control}
                      name="hasEmergencyFund"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Emergency Fund</FormLabel>
                            <FormDescription>
                              Do you have an emergency fund saved?
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Financial Goals */}
                  <FormField
                    control={financialForm.control}
                    name="financialGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Financial Goals (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                          {FINANCIAL_GOALS.map((goal) => {
                            const Icon = goal.icon;
                            const isSelected = field.value?.includes(goal.id);
                            return (
                              <button
                                key={goal.id}
                                type="button"
                                onClick={() => {
                                  const newValue = isSelected
                                    ? field.value?.filter(id => id !== goal.id)
                                    : [...(field.value || []), goal.id];
                                  field.onChange(newValue);
                                }}
                                className={`
                                  flex items-center gap-2 p-3 rounded-lg border transition-all
                                  ${isSelected 
                                    ? 'bg-primary text-primary-foreground border-primary' 
                                    : 'bg-background hover:bg-muted border-input'
                                  }
                                `}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="text-sm">{goal.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Climate Contribution */}
                  <FormField
                    control={financialForm.control}
                    name="roundUpForClimate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Leaf className="h-4 w-4 text-green-500" />
                            Round-Up for Climate
                          </FormLabel>
                          <FormDescription>
                            Automatically round up your transactions and donate the spare change to climate projects
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Financial Profile"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{transactions?.length || 0}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Accounts</p>
                  <p className="text-2xl font-bold">{userData?.accounts?.length || 0}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Budgets</p>
                  <p className="text-2xl font-bold">{budgets?.length || 0}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <p className="text-2xl font-bold">{goals?.length || 0}</p>
                </div>
              </div>
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
                        {user?.phoneNumber || userData?.phone || "Not linked"}
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
                      <p className="text-sm text-muted-foreground">Last updated {accountAge}</p>
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
                        <AlertDialogAction type="submit" disabled={isDeleting}>
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

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Export Your Data
              </CardTitle>
              <CardDescription>
                Download a complete backup of all your financial data. This includes transactions, accounts, budgets, goals, and settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Archive className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Your data is yours</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Download a ZIP file containing all your financial information in JSON format. 
                      You can use this file to restore your data later or keep it as a backup.
                    </p>
                  </div>
                </div>
              </div>

              <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Export Your Data</DialogTitle>
                    <DialogDescription>
                      Your export will include all your financial data. This process may take a few moments.
                    </DialogDescription>
                  </DialogHeader>

                  {isExporting ? (
                    <div className="py-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium capitalize">{exportProgress.stage}</span>
                        </div>
                        {exportProgress.currentItem && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Current:</span>
                            <span className="font-medium truncate max-w-[200px]">{exportProgress.currentItem}</span>
                          </div>
                        )}
                        {exportProgress.total > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Progress:</span>
                              <span className="font-medium">
                                {exportProgress.progress} / {exportProgress.total}
                              </span>
                            </div>
                            <Progress value={(exportProgress.progress / exportProgress.total) * 100} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 space-y-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">Your export will include:</p>
                        <ul className="space-y-1 text-xs text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Profile information
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            All transactions
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Accounts and balances
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Budgets and goals
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Investment portfolios
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            App settings and preferences
                          </li>
                        </ul>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleExport} disabled={isExporting}>
                          <Download className="h-4 w-4 mr-2" />
                          Start Export
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Import Previous Backup
              </CardTitle>
              <CardDescription>
                Restore your data from a previously exported backup file. This will add to your existing data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Important Notes</p>
                    <ul className="text-xs text-amber-600 dark:text-amber-400 list-disc list-inside space-y-1">
                      <li>Importing will add data to your existing account (no automatic deletion)</li>
                      <li>Only import backup files created by EcoVest</li>
                      <li>Files like PDFs and images need to be re-uploaded separately</li>
                      <li>For account recovery, first create a new account then import</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Import Your Data</DialogTitle>
                    <DialogDescription>
                      Select a backup file (.zip) to restore your financial data.
                    </DialogDescription>
                  </DialogHeader>

                  {importResult ? (
                    <div className="py-4">
                      <div className={`p-4 rounded-lg ${
                        importResult.success ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
                      }`}>
                        <div className="flex items-start gap-3">
                          {importResult.success ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              importResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                            }`}>
                              {importResult.message}
                            </p>
                            
                            {importResult.stats && importResult.stats.imported && (
                              <div className="mt-4">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  Imported Items:
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(importResult.stats.imported).map(([key, value]) => (
                                    Number(value) > 0 ? (
                                      <div key={key} className="bg-white dark:bg-gray-800 rounded p-2 text-center shadow-sm">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{key}</p>
                                        <p className="text-sm font-bold text-green-600 dark:text-green-400">{String(value)}</p>
                                      </div>
                                    ) : null
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {importResult.stats && importResult.stats.skipped && 
                             Object.values(importResult.stats.skipped).some(v => Number(v) > 0) && (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3 text-amber-500" />
                                  Skipped Items:
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(importResult.stats.skipped).map(([key, value]) => (
                                    Number(value) > 0 ? (
                                      <div key={key} className="bg-white dark:bg-gray-800 rounded p-2 text-center shadow-sm">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{key}</p>
                                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{String(value)}</p>
                                      </div>
                                    ) : null
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {importResult.success && (
                        <p className="text-xs text-center text-muted-foreground mt-4">
                          Closing automatically in 3 seconds...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          id="import-file"
                          accept=".zip"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <label
                          htmlFor="import-file"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <FileText className="h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {importFile ? importFile.name : 'Click to select backup file'}
                          </span>
                          <span className="text-xs text-gray-500">
                            Only .zip files from EcoVest export are accepted
                          </span>
                        </label>
                      </div>

                      {importFile && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Selected File:</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setImportFile(null)}
                              className="h-6 px-2 text-xs"
                            >
                              Clear
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground break-all">{importFile.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Size: {(importFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}

                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleImport} 
                          disabled={!importFile || isImporting}
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Import Data
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div id="recaptcha-container-profile" className="hidden"></div>
    </div>
  );
}

// Need to import Home icon
import { Home } from "lucide-react";