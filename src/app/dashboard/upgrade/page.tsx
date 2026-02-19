"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Sparkles, 
  Leaf, 
  BrainCircuit, 
  Loader2, 
  Zap, 
  Shield, 
  Star, 
  TrendingUp, 
  ChevronRight, 
  Users,
  Crown,
  Wallet,
  CreditCard,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCcw,
  HelpCircle,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Script from "next/script";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, addMonths, differenceInDays } from "date-fns";

const proFeatures = [
  {
    icon: BrainCircuit,
    title: "AI Savings Tips",
    description: "Get personalized suggestions to optimize your spending and increase your savings.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  {
    icon: Leaf,
    title: "Carbon Footprint Analysis",
    description: "Understand the environmental impact of your purchases with our Eco-Tracker.",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400"
  },
  {
    icon: TrendingUp,
    title: "Advanced AI Features",
    description: "Access to all future AI-powered financial tools and insights.",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400"
  },
];

const stats = [
  { label: "Active Users", value: "10,000+", icon: Users },
  { label: "Money Saved", value: "$2.5M+", icon: TrendingUp },
  { label: "Happy Customers", value: "98%", icon: Star },
];

const cancelReasons = [
  { id: "expensive", label: "Too expensive" },
  { id: "not-using", label: "Not using enough" },
  { id: "missing-features", label: "Missing features I need" },
  { id: "technical", label: "Technical issues" },
  { id: "switching", label: "Switching to another service" },
  { id: "other", label: "Other reason" },
];

// Razorpay Payment Button Component
function RazorpayButton({ onSuccess, amount = 49900 }: { onSuccess: () => void; amount?: number }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast({
        title: "Payment system loading",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In production, you'll make an API call to create an order
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "EcoVest",
        description: "Pro Plan Subscription",
        image: "/logo.png",
        order_id: "",
        handler: function(response: any) {
          console.log("Payment successful:", response);
          onSuccess();
          toast({
            title: "Payment Successful!",
            description: "Welcome to EcoVest Pro!",
          });
        },
        prefill: {
          name: user?.displayName || "",
          email: user?.email || "",
          contact: "",
        },
        notes: {
          address: "EcoVest Pro Subscription",
        },
        theme: {
          color: "#10b981",
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            toast({
              title: "Payment cancelled",
              description: "You can upgrade anytime.",
            });
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          toast({
            title: "Failed to load payment system",
            description: "Please refresh the page and try again.",
            variant: "destructive",
          });
        }}
      />
      
      <Button
        onClick={handlePayment}
        disabled={isLoading || !scriptLoaded}
        className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white py-6 text-lg rounded-xl shadow-xl shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : !scriptLoaded ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading Payment...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-5 w-5" />
            Upgrade to Pro • ₹{amount/100}/month
          </>
        )}
      </Button>
    </>
  );
}

// Cancel Subscription Dialog
function CancelSubscriptionDialog({ 
  onConfirm, 
  subscriptionEndDate 
}: { 
  onConfirm: (reason: string, feedback: string) => void;
  subscriptionEndDate: Date;
}) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [reason, setReason] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const daysLeft = differenceInDays(subscriptionEndDate, new Date());

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    onConfirm(reason, feedback);
    setIsSubmitting(false);
    setOpen(false);
    // Reset after closing
    setTimeout(() => {
      setStep(1);
      setReason("");
      setFeedback("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive">
          <XCircle className="h-4 w-4 mr-2" />
          Cancel Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 1 ? (
              <>Cancel Pro Subscription</>
            ) : (
              <>Help us improve</>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "We're sorry to see you go. Please review what happens when you cancel."
              : "Tell us why you're leaving to help us improve."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 py-4"
            >
              <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-2">When you cancel:</p>
                    <ul className="text-xs text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        <span>You will immediately lose access to all Pro features (AI insights, investment tracking, priority support)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        <span>Your account will be downgraded to Free plan immediately</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        <span>You will not be charged again</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        <span>Your data will be safely stored and available if you resubscribe</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-amber-500/10 p-4 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">Days remaining in your billing period</p>
                    <p className="text-2xl font-bold text-amber-500">{daysLeft} days</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll lose Pro access immediately, not at the end of the period
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 py-4"
            >
              <RadioGroup value={reason} onValueChange={setReason}>
                {cancelReasons.map((r) => (
                  <div key={r.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={r.id} id={r.id} />
                    <Label htmlFor={r.id} className="text-sm">{r.label}</Label>
                  </div>
                ))}
              </RadioGroup>

              <Textarea
                placeholder="Any additional feedback? (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setStep(2)}
              >
                Continue Cancellation
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirm}
                disabled={!reason || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Pro Member Dashboard
function ProMemberDashboard() {
  const router = useRouter();
  const { updateUserData } = useAuth();
  const { toast } = useToast();
  
  // Mock subscription data - in reality, this would come from your backend
  const [subscription, setSubscription] = React.useState({
    plan: "Monthly Pro",
    amount: 499,
    nextBilling: addMonths(new Date(), 1),
    status: "active",
    paymentMethod: "Razorpay •••• 4242",
    since: addMonths(new Date(), -2),
    autoRenew: true
  });

  const handleCancelSubscription = async (reason: string, feedback: string) => {
    try {
      // In production, you would:
      // 1. Call your backend API to cancel the subscription in Razorpay
      // 2. Update the user's subscription status in your database
      // 3. Handle any refund logic if applicable
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state to show cancelled
      setSubscription(prev => ({
        ...prev,
        status: "cancelled",
        autoRenew: false
      }));

      // Actually demote the user by updating their data
      await updateUserData({ isPro: false });

      toast({
        title: "Subscription Cancelled",
        description: "Your Pro features have been removed. You're now on the Free plan.",
      });

      // Redirect to upgrade page after short delay
      setTimeout(() => {
        router.push("/dashboard/upgrade");
      }, 2000);

    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Something went wrong. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const handleReactivate = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubscription(prev => ({
        ...prev,
        status: "active",
        autoRenew: true
      }));

      await updateUserData({ isPro: true });

      toast({
        title: "Subscription Reactivated",
        description: "Welcome back! Your Pro features are now active.",
      });
    } catch (error) {
      toast({
        title: "Reactivation Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If subscription is cancelled, show different UI
  if (subscription.status === "cancelled") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-500">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Subscription Cancelled</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your Pro subscription has been cancelled. You've been downgraded to the Free plan.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => router.push("/dashboard/upgrade")}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upgrade to Pro Again
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Pro Status Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-purple-600">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  Pro Member
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    Active
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You have access to all premium features
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Member since {format(subscription.since, 'MMM yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Next billing: {format(subscription.nextBilling, 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="text-sm font-medium">{subscription.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-medium">₹{subscription.amount}/month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="text-sm font-medium">{subscription.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Auto-renewal</span>
              <Badge className={subscription.autoRenew ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}>
                {subscription.autoRenew ? "On" : "Off"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{format(new Date(), 'MMM d, yyyy')}</p>
                <p className="text-xs text-muted-foreground">Monthly subscription</p>
              </div>
              <span className="text-sm">₹{subscription.amount}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{format(addMonths(new Date(), -1), 'MMM d, yyyy')}</p>
                <p className="text-xs text-muted-foreground">Monthly subscription</p>
              </div>
              <span className="text-sm">₹{subscription.amount}</span>
            </div>
            <Button variant="link" className="p-0 h-auto text-xs">
              View all transactions
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Manage Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage Subscription</CardTitle>
          <CardDescription>Update your plan or cancel your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start gap-2">
              <RefreshCcw className="h-4 w-4" />
              Switch to Annual (Save 20%)
            </Button>
            <Button variant="outline" className="justify-start gap-2">
              <CreditCard className="h-4 w-4" />
              Update Payment Method
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg bg-accent/20">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Need help with your subscription?</p>
                <p className="text-xs text-muted-foreground">
                  Contact our support team for any questions about billing or features.
                </p>
              </div>
            </div>
            <Button variant="link" className="text-primary">
              Contact Support
            </Button>
          </div>

          <div className="border-t pt-4">
            <CancelSubscriptionDialog 
              onConfirm={handleCancelSubscription} 
              subscriptionEndDate={subscription.nextBilling}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Note: Cancelling will immediately downgrade your account to the Free plan.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function UpgradePage() {
  const { userData, updateUserData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = React.useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await updateUserData({ isPro: true });
      toast({
        title: "🎉 Welcome to Pro!",
        description: "You now have access to all premium features. Let's supercharge your finances!",
        duration: 5000,
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upgrade Failed",
        description: "Something went wrong. Please try again or contact support.",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // If user is already Pro, show the Pro dashboard with cancellation option
  if (userData?.isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 py-16 px-4 sm:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <Badge 
              variant="outline" 
              className="px-4 py-1.5 text-sm border-primary/20 bg-primary/5 inline-flex items-center gap-1.5"
            >
              <Crown className="h-3.5 w-3.5 text-primary" />
              Pro Member
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Manage Your Subscription
              </span>
            </h1>
            
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              View and manage your Pro membership details. Cancelling will immediately downgrade to Free plan.
            </p>
          </div>

          {/* Pro Dashboard */}
          <ProMemberDashboard />
        </div>
      </div>
    );
  }

  // Original upgrade page for non-Pro users
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 py-16 px-4 sm:py-20">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 px-4"
        >
          <Badge 
            variant="outline" 
            className="px-4 py-1.5 text-sm border-primary/20 bg-primary/5 inline-flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Limited Time Offer
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight md:leading-tight lg:leading-tight">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Upgrade to Pro
            </span>
          </h1>
          
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-2">
            Unlock powerful AI features to supercharge your finances 
            <br className="hidden sm:block" />
            and make smarter decisions
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4"
        >
          {stats.map((stat) => (
            <Card 
              key={stat.label} 
              className="border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors"
            >
              <CardContent className="p-6 text-center">
                <stat.icon className="h-6 w-6 mx-auto mb-3 text-primary" />
                <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Pricing Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-4"
        >
          <Card className="relative overflow-hidden border-2 border-border/50 bg-card shadow-2xl">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:via-transparent dark:to-accent/10" />
            
            {/* Popular Badge */}
            <div className="absolute top-6 right-0">
              <Badge className="rounded-l-full rounded-r-none px-4 py-2 bg-primary text-primary-foreground shadow-lg">
                Most Popular
              </Badge>
            </div>

            {/* Pro Badge */}
            <div className="absolute top-6 left-6">
              <Badge variant="outline" className="border-primary/20 bg-primary/5">
                <Crown className="h-3 w-3 mr-1 text-primary" />
                Pro Plan
              </Badge>
            </div>

            <CardHeader className="text-center relative pb-8 pt-12">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="mx-auto"
              >
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent p-4 mb-6 shadow-lg">
                  <Zap className="h-full w-full text-white" />
                </div>
              </motion.div>
              
              <CardTitle className="text-3xl font-bold">EcoVest Pro</CardTitle>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-primary">₹499</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground line-through">₹999/month</p>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    Save 50% with annual billing
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 relative pb-8">
              {/* Features List */}
              <div className="space-y-3">
                {proFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl transition-all duration-200",
                      feature.bgColor,
                      "border border-transparent hover:border-primary/20"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                      feature.color
                    )}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Additional Benefits */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Priority Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Unlimited Transactions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Data Export</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>API Access</span>
                </div>
              </div>

              {/* Guarantee Badge */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground border-t border-border/50 pt-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>30-day money-back guarantee</span>
                </div>
                <span className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground" />
                <div className="flex items-center gap-2">
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-center justify-center relative pb-8 px-6">
              <div className="w-full max-w-md space-y-4">
                {/* Razorpay Button */}
                <RazorpayButton onSuccess={handleUpgrade} amount={49900} />
                
                {/* Payment Methods Info */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    <span>Credit Card</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    <span>Debit Card</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                  <div className="flex items-center gap-1">
                    <span>UPI</span>
                  </div>
                </div>

                {/* Security Note */}
                <p className="text-xs text-center text-muted-foreground/60 flex items-center justify-center gap-1">
                  <Shield className="h-3 w-3" />
                  Secured by Razorpay • 256-bit SSL encryption
                </p>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center space-y-6 px-4"
        >
          <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
            <Card className="border border-border/50 bg-card/50">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">Yes, you can cancel your subscription at any time. Cancellation takes effect immediately and downgrades your account to the Free plan.</p>
              </CardContent>
            </Card>
            <Card className="border border-border/50 bg-card/50">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">How does the trial work?</h3>
                <p className="text-sm text-muted-foreground">Start with a 7-day free trial, no credit card required to test all features. Cancel anytime during the trial.</p>
              </CardContent>
            </Card>
            <Card className="border border-border/50 bg-card/50">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">What happens when I cancel?</h3>
                <p className="text-sm text-muted-foreground">Your account is immediately downgraded to the Free plan. You lose access to Pro features but your data is safely stored.</p>
              </CardContent>
            </Card>
            <Card className="border border-border/50 bg-card/50">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">Is my data secure?</h3>
                <p className="text-sm text-muted-foreground">Yes, we use bank-level encryption and Razorpay's secure payment gateway. Your financial data is never stored on our servers.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Simple payment note */}
        <p className="text-center text-xs text-muted-foreground/60">
          Secure payments powered by Razorpay
        </p>
      </div>
    </div>
  );
}