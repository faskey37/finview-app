"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft,
  Globe,
  Gem,
  Percent,
  Award,
  Mail,
  Receipt,
  Ban,
  AlertTriangle
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
import { format, addMonths, addYears, differenceInDays } from "date-fns";

// Currency configuration with exchange rates (relative to INR)
const CURRENCY_CONFIG = {
  INR: { symbol: '₹', code: 'INR', rate: 1, format: (amount: number) => `₹${amount.toFixed(0)}` },
  USD: { symbol: '$', code: 'USD', rate: 0.012, format: (amount: number) => `$${amount.toFixed(2)}` },
  EUR: { symbol: '€', code: 'EUR', rate: 0.011, format: (amount: number) => `€${amount.toFixed(2)}` },
  GBP: { symbol: '£', code: 'GBP', rate: 0.0095, format: (amount: number) => `£${amount.toFixed(2)}` },
  JPY: { symbol: '¥', code: 'JPY', rate: 1.80, format: (amount: number) => `¥${amount.toFixed(0)}` },
  AED: { symbol: 'د.إ', code: 'AED', rate: 0.044, format: (amount: number) => `AED ${amount.toFixed(2)}` },
  SAR: { symbol: '﷼', code: 'SAR', rate: 0.045, format: (amount: number) => `SAR ${amount.toFixed(2)}` },
  SGD: { symbol: 'S$', code: 'SGD', rate: 0.016, format: (amount: number) => `S$${amount.toFixed(2)}` },
  AUD: { symbol: 'A$', code: 'AUD', rate: 0.018, format: (amount: number) => `A$${amount.toFixed(2)}` },
  CAD: { symbol: 'C$', code: 'CAD', rate: 0.016, format: (amount: number) => `C$${amount.toFixed(2)}` },
};

type CurrencyCode = keyof typeof CURRENCY_CONFIG;

// Price constants
const PRICING = {
  MONTHLY: 499,
  YEARLY: 4990,
};

// Helper functions
const convertPrice = (amountInINR: number, currency: CurrencyCode): number => {
  const config = CURRENCY_CONFIG[currency];
  if (!config) return amountInINR;
  const convertedAmount = amountInINR * config.rate;
  if (currency === 'JPY' || currency === 'INR') {
    return Math.round(convertedAmount);
  }
  return Math.round(convertedAmount * 100) / 100;
};

const getRazorpayAmount = (amountInINR: number): number => {
  return amountInINR * 100;
};

const formatPrice = (amount: number, currency: CurrencyCode): string => {
  const config = CURRENCY_CONFIG[currency];
  if (!config) return `₹${amount}`;
  return config.format(amount);
};

const getCurrencyName = (code: CurrencyCode): string => {
  const names: Record<CurrencyCode, string> = {
    INR: "Indian Rupee",
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    JPY: "Japanese Yen",
    AED: "UAE Dirham",
    SAR: "Saudi Riyal",
    SGD: "Singapore Dollar",
    AUD: "Australian Dollar",
    CAD: "Canadian Dollar",
  };
  return names[code] || code;
};

const calculateYearlySavings = (monthly: number, yearly: number): number => {
  return (monthly * 12) - yearly;
};

const calculateSavingsPercentage = (monthly: number, yearly: number): number => {
  return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
};

// Calculate savings
const yearlySavings = calculateYearlySavings(PRICING.MONTHLY, PRICING.YEARLY);
const savingsPercentage = calculateSavingsPercentage(PRICING.MONTHLY, PRICING.YEARLY);

// Razorpay Payment Button Component
function RazorpayButton({ 
  onSuccess, 
  amount = PRICING.MONTHLY,
  planType = "monthly"
}: { 
  onSuccess: () => void; 
  amount?: number;
  planType?: "monthly" | "yearly";
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const { user } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();

  const currencyConfig = CURRENCY_CONFIG[currency as CurrencyCode] || CURRENCY_CONFIG.INR;
  const displayAmount = convertPrice(amount, currency as CurrencyCode);
  const razorpayAmount = getRazorpayAmount(amount);

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
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayAmount,
        currency: "INR",
        name: "EcoVest",
        description: `Pro Plan (${planType === "yearly" ? "Yearly" : "Monthly"})`,
        image: "/logo.png",
        order_id: "",
        handler: function(response: any) {
          console.log("Payment successful:", response);
          onSuccess();
          toast({
            title: "Payment Successful!",
            description: `Welcome to EcoVest Pro! Your ${planType} subscription is now active.`,
          });
        },
        prefill: {
          name: user?.displayName || "",
          email: user?.email || "",
          contact: "",
        },
        notes: {
          address: "EcoVest Pro Subscription",
          displayCurrency: currency,
          planType: planType,
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
            {planType === "yearly" ? (
              <>Upgrade to Pro Yearly • {formatPrice(displayAmount, currency as CurrencyCode)}/year</>
            ) : (
              <>Upgrade to Pro Monthly • {formatPrice(displayAmount, currency as CurrencyCode)}/month</>
            )}
          </>
        )}
      </Button>
    </>
  );
}

// Cancel Subscription Dialog
function CancelSubscriptionDialog({ 
  onConfirm, 
  subscriptionEndDate,
  planType = "monthly"
}: { 
  onConfirm: (reason: string, feedback: string) => void;
  subscriptionEndDate: Date;
  planType?: "monthly" | "yearly";
}) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [reason, setReason] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const daysLeft = differenceInDays(subscriptionEndDate, new Date());

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onConfirm(reason, feedback);
    setIsSubmitting(false);
    setOpen(false);
    setTimeout(() => {
      setStep(1);
      setReason("");
      setFeedback("");
    }, 300);
  };

  const cancelReasons = [
    { id: "expensive", label: "Too expensive" },
    { id: "not-using", label: "Not using enough" },
    { id: "missing-features", label: "Missing features I need" },
    { id: "technical", label: "Technical issues" },
    { id: "switching", label: "Switching to another service" },
    { id: "other", label: "Other reason" },
  ];

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
            {step === 1 ? "Cancel Pro Subscription" : "Help us improve"}
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
                        <span>You will immediately lose access to all Pro features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        <span>Your account will be downgraded to Free plan immediately</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-destructive">•</span>
                        <span>You will not be charged again</span>
                      </li>
                      {planType === "yearly" && (
                        <li className="flex items-start gap-2">
                          <span className="text-destructive">•</span>
                          <span>No partial refunds for unused months in your yearly plan</span>
                        </li>
                      )}
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
              <Button variant="destructive" onClick={() => setStep(2)}>
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

const stats = [
  { label: "Active Users", value: "10,000+", icon: Users },
  { label: "Money Saved", value: "$2.5M+", icon: TrendingUp },
  { label: "Happy Customers", value: "98%", icon: Star },
];

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

// Subscription Management Component for Pro Users
function SubscriptionManagement() {
  const { userData, updateUserData, isPro } = useAuth();
  const { currency } = useCurrency();
  const { toast } = useToast();
  const router = useRouter();
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [cancelFeedback, setCancelFeedback] = React.useState("");
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = React.useState(false);
  const [calculatedAmount, setCalculatedAmount] = React.useState(0);
  const [proratedDays, setProratedDays] = React.useState(0);

  const subscription = userData?.proSubscription;
  const planType = subscription?.plan || "monthly";
  const amount = subscription?.amount || PRICING.MONTHLY;
  const endDate = subscription?.endDate ? new Date(subscription.endDate) : addMonths(new Date(), 1);
  const daysRemaining = differenceInDays(endDate, new Date());
  const startDate = subscription?.startDate ? new Date(subscription.startDate) : new Date();

  const displayAmount = convertPrice(amount, currency as CurrencyCode);
  const monthlyEquivalent = planType === "yearly" 
    ? convertPrice(amount / 12, currency as CurrencyCode)
    : displayAmount;

  // Load Razorpay script
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Calculate prorated upgrade amount
  React.useEffect(() => {
    if (planType === "monthly") {
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      const dailyRate = PRICING.MONTHLY / daysInMonth;
      const remainingAmount = dailyRate * daysRemaining;
      const upgradeAmount = PRICING.YEARLY - remainingAmount;
      setCalculatedAmount(Math.max(0, upgradeAmount));
      setProratedDays(daysRemaining);
    }
  }, [planType, startDate, daysRemaining]);

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      // Create subscription history entry
      const subscriptionHistory = {
        previousPlan: planType,
        previousAmount: amount,
        action: 'cancelled',
        timestamp: new Date().toISOString(),
        reason: cancelReason,
        feedback: cancelFeedback,
        daysRemaining: daysRemaining,
        endDate: endDate.toISOString(),
      };

      // Get existing history or initialize empty array
      const existingHistory = subscription?.history || [];

      await updateUserData({
        isPro: false,
        proSubscription: {
          ...subscription,
          plan: planType,
          amount: amount,
          status: 'cancelled',
          autoRenew: false,
          cancelledAt: new Date().toISOString(),
          cancelReason: cancelReason,
          cancelFeedback: cancelFeedback,
          history: [...existingHistory, subscriptionHistory],
        }
      });

      toast({
        title: "Subscription Cancelled",
        description: "Your Pro subscription has been cancelled. You'll be downgraded to Free plan.",
      });

      setShowCancelDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Cancel subscription error:", error);
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: "Something went wrong. Please try again or contact support.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpgradeToYearly = () => {
    if (!scriptLoaded) {
      toast({
        title: "Payment system loading",
        description: "Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsUpgrading(true);
    
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(calculatedAmount * 100),
      currency: "INR",
      name: "EcoVest",
      description: "Upgrade from Monthly to Yearly Pro",
      image: "/logo.png",
      handler: async function(response: any) {
        try {
          const now = new Date();
          const newEndDate = addYears(now, 1);
          const invoiceId = `UPG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          
          // Create upgrade history entry
          const upgradeHistory = {
            previousPlan: 'monthly',
            previousAmount: PRICING.MONTHLY,
            newPlan: 'yearly',
            newAmount: PRICING.YEARLY,
            action: 'upgraded',
            timestamp: now.toISOString(),
            proratedAmount: calculatedAmount,
            proratedDays: proratedDays,
            paymentId: response.razorpay_payment_id,
            invoiceId: invoiceId,
          };

          const existingHistory = subscription?.history || [];
          
          const upgradeData = {
            isPro: true,
            proSubscription: {
              plan: 'yearly' as const,
              amount: PRICING.YEARLY,
              startDate: now.toISOString(),
              endDate: newEndDate.toISOString(),
              nextBillingDate: newEndDate.toISOString(),
              status: 'active' as const,
              autoRenew: true,
              invoiceId,
              paymentId: response.razorpay_payment_id,
              upgradedAt: now.toISOString(),
              previousPlan: 'monthly',
              previousAmount: PRICING.MONTHLY,
              proratedAmount: calculatedAmount,
              proratedDays: proratedDays,
              history: [...existingHistory, upgradeHistory],
            }
          };
          
          await updateUserData(upgradeData);
          
          toast({
            title: "🎉 Upgraded to Yearly!",
            description: `Successfully upgraded to Yearly Pro. Payment of ${formatPrice(calculatedAmount, currency as CurrencyCode)} was completed!`,
            duration: 5000,
          });
          
          setShowUpgradeDialog(false);
          router.refresh();
        } catch (error) {
          console.error("Upgrade error:", error);
          toast({
            variant: "destructive",
            title: "Upgrade Failed",
            description: "Payment was successful but upgrade failed. Please contact support.",
          });
        } finally {
          setIsUpgrading(false);
        }
      },
      prefill: {
        name: userData?.displayName || "",
        email: userData?.email || "",
      },
      notes: {
        type: "upgrade",
        from_plan: "monthly",
        to_plan: "yearly",
        prorated_amount: calculatedAmount,
        remaining_days: proratedDays,
        user_id: userData?.uid,
      },
      theme: {
        color: "#10b981",
      },
      modal: {
        ondismiss: function() {
          setIsUpgrading(false);
          toast({
            title: "Payment cancelled",
            description: "You can upgrade anytime.",
          });
        },
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  const handleSwitchToYearly = () => {
    setShowUpgradeDialog(true);
  };

  const handleReactivate = async () => {
    router.push("/dashboard/upgrade?plan=yearly");
  };

  if (subscription?.status === 'cancelled') {
    return (
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-amber-500">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Subscription Cancelled</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your Pro subscription has been cancelled. You'll have access until {format(endDate, 'MMMM d, yyyy')}.
              </p>
              <Button onClick={handleReactivate}>
                <Sparkles className="h-4 w-4 mr-2" />
                Reactivate Pro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Subscription Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-purple-600">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2 flex-wrap">
                  Pro Member
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    {planType === "yearly" ? "Yearly Plan" : "Monthly Plan"}
                  </Badge>
                  {daysRemaining < 7 && daysRemaining > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {daysRemaining} days remaining
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  You have access to all premium features
                </p>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Next billing: {format(endDate, 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {formatPrice(displayAmount, currency as CurrencyCode)}
                      {planType === "yearly" ? "/year" : "/month"}
                    </span>
                  </div>
                  {planType === "yearly" && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">
                        Saves {formatPrice(monthlyEquivalent, currency as CurrencyCode)}/month
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {planType === "monthly" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSwitchToYearly}
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Switch to Yearly
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => setShowCancelDialog(true)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade to Yearly Dialog */}
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Gem className="h-5 w-5 text-primary" />
              Switch to Yearly Plan
            </AlertDialogTitle>
            <AlertDialogDescription>
              Upgrade to yearly and save more on your subscription!
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Current Plan Info */}
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Current Plan (Monthly)</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Remaining days</span>
                <span className="text-sm font-medium">{proratedDays} days</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-muted-foreground">Credit value</span>
                <span className="text-sm font-medium text-green-600">
                  {formatPrice((PRICING.MONTHLY / 30) * proratedDays, currency as CurrencyCode)}
                </span>
              </div>
            </div>

            {/* Upgrade Benefits */}
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Upgrade Benefits</span>
              </div>
              <ul className="space-y-1 text-xs text-green-600 dark:text-green-400">
                <li>• Save {savingsPercentage}% compared to monthly</li>
                <li>• Lock in price for 12 months</li>
                <li>• Exclusive yearly benefits</li>
                <li>• No price hikes for a year</li>
              </ul>
            </div>

            {/* Prorated Calculation */}
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium mb-3">Upgrade Calculation</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Yearly plan price</span>
                  <span>{formatPrice(PRICING.YEARLY, currency as CurrencyCode)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credit from remaining days</span>
                  <span className="text-green-600">
                    - {formatPrice((PRICING.MONTHLY / 30) * proratedDays, currency as CurrencyCode)}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Amount to pay today</span>
                    <span className="text-primary">
                      {formatPrice(calculatedAmount, currency as CurrencyCode)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your yearly plan will start today and renew on {format(addYears(new Date(), 1), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUpgradeToYearly}
              className="bg-primary hover:bg-primary/90"
              disabled={isUpgrading || !scriptLoaded}
            >
              {isUpgrading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : !scriptLoaded ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Payment...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Pay {formatPrice(calculatedAmount, currency as CurrencyCode)}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cancel Pro Subscription?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You'll lose access to all Pro features immediately. No further charges will be made.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Why are you cancelling? (Optional)</Label>
              <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expensive" id="expensive" />
                  <Label htmlFor="expensive">Too expensive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-using" id="not-using" />
                  <Label htmlFor="not-using">Not using enough</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="missing-features" id="missing-features" />
                  <Label htmlFor="missing-features">Missing features I need</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technical" id="technical" />
                  <Label htmlFor="technical">Technical issues</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other reason</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label>Any feedback? (Optional)</Label>
              <Textarea
                placeholder="Tell us how we can improve..."
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Pro</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelSubscription}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Subscription'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Subscription Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Plan</span>
              <span className="text-sm font-medium capitalize">{planType} Pro</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-medium">
                {formatPrice(displayAmount, currency as CurrencyCode)}
                {planType === "yearly" ? "/year" : "/month"}
              </span>
            </div>
            {planType === "yearly" && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Monthly Equivalent</span>
                <span className="text-sm font-medium text-green-600">
                  {formatPrice(monthlyEquivalent, currency as CurrencyCode)}/month
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Auto-renewal</span>
              <Badge className={subscription?.autoRenew !== false ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"}>
                {subscription?.autoRenew !== false ? "On" : "Off"}
              </Badge>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-sm text-muted-foreground">Base Price (INR)</span>
              <span className="text-sm font-medium">₹{amount}</span>
            </div>
            {subscription?.upgradedAt && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Last upgraded</span>
                <span>{format(new Date(subscription.upgradedAt), 'MMM d, yyyy')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription?.history && subscription.history.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {subscription.history.slice().reverse().map((item: any, idx: number) => (
                  <div key={idx} className="text-xs border-l-2 border-primary/30 pl-3 py-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {item.action === 'upgraded' ? '⬆️ Upgraded' : '❌ Cancelled'}
                      </Badge>
                      <span className="text-muted-foreground">{format(new Date(item.timestamp), 'MMM d, yyyy')}</span>
                    </div>
                    {item.action === 'upgraded' && (
                      <p className="text-muted-foreground mt-1">
                        {item.previousPlan} → {item.newPlan} (Paid {formatPrice(item.proratedAmount, currency as CurrencyCode)})
                      </p>
                    )}
                    {item.action === 'cancelled' && (
                      <p className="text-muted-foreground mt-1">
                        {item.reason ? `Reason: ${item.reason}` : 'Cancelled'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No subscription history yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Need Help Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/20">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium mb-1">Have questions about your subscription?</p>
                <p className="text-xs text-muted-foreground">
                  Contact our support team for any billing or feature questions.
                </p>
              </div>
            </div>
            <Button variant="link" className="text-primary" asChild>
              <a href="mailto:ecovest.help@gmail.com?subject=Subscription Question">
                Contact Support
              </a>
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-start gap-3">
              <Receipt className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium mb-1">View Invoices</p>
                <p className="text-xs text-muted-foreground">
                  Download your billing history and receipts
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UpgradePage() {
  const { userData, updateUserData, loading, isPro } = useAuth();
  const { currency } = useCurrency();
  const router = useRouter();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<"monthly" | "yearly">("yearly");
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    if (plan === "monthly" || plan === "yearly") {
      setSelectedPlan(plan);
    }
  }, []);

  const currencyConfig = CURRENCY_CONFIG[currency as CurrencyCode] || CURRENCY_CONFIG.INR;
  const currencyName = getCurrencyName(currency as CurrencyCode);

  const monthlyPriceINR = PRICING.MONTHLY;
  const yearlyPriceINR = PRICING.YEARLY;
  
  const monthlyDisplayPrice = convertPrice(monthlyPriceINR, currency as CurrencyCode);
  const yearlyDisplayPrice = convertPrice(yearlyPriceINR, currency as CurrencyCode);
  
  const yearlySavingsDisplay = convertPrice(yearlySavings, currency as CurrencyCode);
  
  const monthlyEquivalent = yearlyPriceINR / 12;
  const monthlyEquivalentDisplay = convertPrice(monthlyEquivalent, currency as CurrencyCode);

  const sendConfirmationEmails = async (
    email: string,
    name: string,
    plan: 'monthly' | 'yearly',
    amount: number,
    invoiceId: string,
    startDate: Date,
    endDate: Date
  ) => {
    setIsSendingEmail(true);
    try {
      const welcomeResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          email,
          name,
          plan,
          amount,
          currency: 'INR',
          startDate,
          endDate,
          invoiceId,
        }),
      });

      if (!welcomeResponse.ok) {
        console.error('Failed to send welcome email');
      }

      const invoiceResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'invoice',
          email,
          name,
          plan,
          amount,
          invoiceId,
          paymentMethod: 'Razorpay',
        }),
      });

      if (!invoiceResponse.ok) {
        console.error('Failed to send invoice email');
      }

      console.log('Confirmation emails sent successfully');
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const now = new Date();
      const endDate = selectedPlan === "yearly" 
        ? addYears(now, 1)
        : addMonths(now, 1);
      
      const invoiceId = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Create initial subscription history
      const subscriptionHistory = [{
        action: 'created',
        plan: selectedPlan,
        amount: selectedPlan === "yearly" ? yearlyPriceINR : monthlyPriceINR,
        timestamp: now.toISOString(),
        invoiceId: invoiceId,
      }];
      
      const subscriptionData = {
        isPro: true,
        proSubscription: {
          plan: selectedPlan,
          amount: selectedPlan === "yearly" ? yearlyPriceINR : monthlyPriceINR,
          startDate: now.toISOString(),
          endDate: endDate.toISOString(),
          nextBillingDate: endDate.toISOString(),
          status: 'active' as const,
          autoRenew: true,
          invoiceId,
          createdAt: now.toISOString(),
          history: subscriptionHistory,
        }
      };
      
      await updateUserData(subscriptionData);
      
      const userName = userData?.displayName || userData?.email?.split('@')[0] || 'Valued Customer';
      const userEmail = userData?.email;
      
      if (userEmail) {
        sendConfirmationEmails(
          userEmail,
          userName,
          selectedPlan,
          selectedPlan === "yearly" ? yearlyPriceINR : monthlyPriceINR,
          invoiceId,
          now,
          endDate
        );
      }
      
      toast({
        title: "🎉 Welcome to Pro!",
        description: `You're now on the ${selectedPlan} plan. Check your email for confirmation!`,
        duration: 5000,
      });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    } catch (error) {
      console.error('Upgrade error:', error);
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

  // If user is Pro, show subscription management
  if (isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 py-16 px-4 sm:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
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
              View and manage your Pro membership details. All prices shown in {currency} ({currencyName}).
            </p>
          </div>

          <SubscriptionManagement />
        </div>
      </div>
    );
  }

  // Original upgrade page for non-Pro users
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 py-16 px-4 sm:py-20">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header with Currency Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 px-4"
        >
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className="px-4 py-1.5 text-sm border-primary/20 bg-primary/5 inline-flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Limited Time Offer
            </Badge>
            <Badge 
              variant="outline" 
              className="px-4 py-1.5 text-sm border-primary/20 bg-primary/5 inline-flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              {currency} • {currencyName}
            </Badge>
            <Badge 
              variant="outline" 
              className="px-4 py-1.5 text-sm border-green-500/20 bg-green-500/5 text-green-600 inline-flex items-center gap-1.5"
            >
              <Percent className="h-3.5 w-3.5" />
              Save {savingsPercentage}% with yearly
            </Badge>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight md:leading-tight lg:leading-tight">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Choose Your Plan
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

        {/* Email Confirmation Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="px-4"
        >
          <Card className="border border-primary/20 bg-primary/5">
            <CardContent className="p-3 flex items-center justify-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span>You'll receive a confirmation email at <strong>{userData?.email}</strong> after upgrading</span>
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Selection Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="px-4"
        >
          <Tabs 
            defaultValue="yearly" 
            value={selectedPlan}
            onValueChange={(value) => setSelectedPlan(value as "monthly" | "yearly")}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="monthly" className="text-sm sm:text-base">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className="text-sm sm:text-base relative">
                Yearly
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5">
                  Save {savingsPercentage}%
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Monthly Plan Content */}
            <TabsContent value="monthly">
              <Card className="relative overflow-hidden border-2 border-border/50 bg-card shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:via-transparent dark:to-accent/10" />
                
                <div className="absolute top-6 left-6">
                  <Badge variant="outline" className="border-primary/20 bg-primary/5">
                    <Zap className="h-3 w-3 mr-1 text-primary" />
                    Monthly Plan
                  </Badge>
                </div>

                <CardHeader className="text-center relative pb-8 pt-12">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto"
                  >
                    <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent p-4 mb-6 shadow-lg">
                      <Zap className="h-full w-full text-white" />
                    </div>
                  </motion.div>
                  
                  <CardTitle className="text-3xl font-bold">Monthly Pro</CardTitle>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">
                        {formatPrice(monthlyDisplayPrice, currency as CurrencyCode)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Billed monthly • Cancel anytime
                    </p>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded-lg">
                      <Globe className="h-3 w-3" />
                      <span>Shown in {currency} • Billed in INR</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8 relative pb-8">
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
                    <RazorpayButton 
                      onSuccess={handleUpgrade} 
                      amount={monthlyPriceINR}
                      planType="monthly"
                    />
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        1 INR = {CURRENCY_CONFIG[currency as CurrencyCode]?.rate} {currency}
                      </p>
                    </div>
                    
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
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Yearly Plan Content */}
            <TabsContent value="yearly">
              <Card className="relative overflow-hidden border-2 border-primary/30 bg-card shadow-2xl scale-105">
                <div className="absolute top-6 right-0">
                  <Badge className="rounded-l-full rounded-r-none px-4 py-2 bg-primary text-primary-foreground shadow-lg flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Best Value
                  </Badge>
                </div>

                <div className="absolute top-6 left-6 flex gap-2">
                  <Badge variant="outline" className="border-primary/20 bg-primary/5">
                    <Gem className="h-3 w-3 mr-1 text-primary" />
                    Yearly Plan
                  </Badge>
                  <Badge className="bg-green-500 text-white border-0">
                    Save {formatPrice(yearlySavingsDisplay, currency as CurrencyCode)}
                  </Badge>
                </div>

                <CardHeader className="text-center relative pb-8 pt-12">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto"
                  >
                    <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-600 p-4 mb-6 shadow-lg shadow-primary/25">
                      <Crown className="h-full w-full text-white" />
                    </div>
                  </motion.div>
                  
                  <CardTitle className="text-3xl font-bold">Yearly Pro</CardTitle>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-4xl font-bold text-primary">
                        {formatPrice(yearlyDisplayPrice, currency as CurrencyCode)}
                      </span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-muted-foreground line-through">
                        {formatPrice(monthlyDisplayPrice * 12, currency as CurrencyCode)}
                      </span>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                        Save {savingsPercentage}%
                      </Badge>
                    </div>
                    
                    <p className="text-sm font-medium text-green-600">
                      Just {formatPrice(monthlyEquivalentDisplay, currency as CurrencyCode)}/month
                    </p>
                    
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                      <p className="text-sm font-medium mb-1 flex items-center justify-center gap-1">
                        <Percent className="h-4 w-4 text-green-500" />
                        You save {formatPrice(yearlySavingsDisplay, currency as CurrencyCode)} annually
                      </p>
                      <p className="text-xs text-muted-foreground">
                        That's like getting 2 months free!
                      </p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-accent/20 p-2 rounded-lg">
                      <Globe className="h-3 w-3" />
                      <span>Shown in {currency} • Billed in INR</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8 relative pb-8">
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

                  <div className="bg-gradient-to-r from-primary/10 to-purple-600/10 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                      <Award className="h-4 w-4 text-primary" />
                      Yearly Plan Exclusive Benefits
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1">• Priority feature requests</li>
                      <li className="flex items-center gap-1">• Early access to new features</li>
                      <li className="flex items-center gap-1">• Quarterly strategy calls</li>
                    </ul>
                  </div>

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
                    <RazorpayButton 
                      onSuccess={handleUpgrade} 
                      amount={yearlyPriceINR}
                      planType="yearly"
                    />
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        1 INR = {CURRENCY_CONFIG[currency as CurrencyCode]?.rate} {currency}
                      </p>
                    </div>
                    
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

                    <p className="text-xs text-center text-muted-foreground/60 flex items-center justify-center gap-1">
                      <Shield className="h-3 w-3" />
                      Secured by Razorpay • 256-bit SSL encryption
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Plan Comparison Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-center px-4"
        >
          <Card className="border border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm">
                <span className="font-semibold">✨ All plans include:</span> Full access to AI insights, carbon tracking, and all premium features. 
                <span className="text-green-600 font-medium"> Yearly plan saves you {formatPrice(yearlySavingsDisplay, currency as CurrencyCode)} annually!</span>
              </p>
            </CardContent>
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
                <h3 className="font-semibold mb-2">Can I switch from monthly to yearly?</h3>
                <p className="text-sm text-muted-foreground">Yes! You can upgrade to yearly anytime. We'll prorate the remaining months and apply them to your yearly plan.</p>
              </CardContent>
            </Card>
            <Card className="border border-border/50 bg-card/50">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">How does currency conversion work?</h3>
                <p className="text-sm text-muted-foreground">Prices are shown in your preferred currency for convenience. All payments are processed in INR at the current exchange rate.</p>
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
                <h3 className="font-semibold mb-2">Will I receive a confirmation email?</h3>
                <p className="text-sm text-muted-foreground">Yes! You'll receive a welcome email and invoice at <strong>{userData?.email}</strong> immediately after successful payment.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Email Confirmation Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-center px-4"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Confirmation will be sent to: <strong>{userData?.email || 'your email'}</strong></span>
          </div>
          {isSendingEmail && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Sending confirmation email...</span>
            </div>
          )}
        </motion.div>

        <p className="text-center text-xs text-muted-foreground/60">
          Secure payments powered by Razorpay • All transactions in INR
        </p>
      </div>
    </div>
  );
}