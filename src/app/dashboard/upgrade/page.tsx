"use client"

import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Sparkles, Leaf, BrainCircuit, Loader2, Zap, Shield, Star, TrendingUp, ChevronRight, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import Script from "next/script"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

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
]

const stats = [
    { label: "Active Users", value: "10,000+", icon: Users },
    { label: "Money Saved", value: "$2.5M+", icon: TrendingUp },
    { label: "Happy Customers", value: "98%", icon: Star },
]

function PayPalSubscriptionButton({ onSubscriptionApproved }: { onSubscriptionApproved: () => void }) {
    const [scriptLoaded, setScriptLoaded] = React.useState(false);
    const [scriptError, setScriptError] = React.useState(false);
    const [isRendered, setIsRendered] = React.useState(false);
    const paypalButtonContainerRef = React.useRef<HTMLDivElement>(null);
    const scriptRef = React.useRef<HTMLScriptElement | null>(null);
    
    React.useEffect(() => {
        // Clean up function to prevent multiple renders
        return () => {
            if (paypalButtonContainerRef.current) {
                paypalButtonContainerRef.current.innerHTML = '';
            }
        };
    }, []);

    React.useEffect(() => {
        if (scriptLoaded && paypalButtonContainerRef.current && (window as any).paypal && !scriptError && !isRendered) {
            try {
                // Clear container first to prevent duplicates
                paypalButtonContainerRef.current.innerHTML = '';
                
                (window as any).paypal.Buttons({
                    style: {
                        shape: 'pill',
                        color: 'gold',
                        layout: 'vertical',
                        label: 'subscribe',
                        height: 45
                    },
                    createSubscription: function(data: any, actions: any) {
                        return actions.subscription.create({
                            plan_id: 'P-3AR707465S622335FNGHVXXA'
                        });
                    },
                    onApprove: function(data: any, actions: any) {
                        onSubscriptionApproved();
                    },
                    onError: function(err: any) {
                        console.error("PayPal error:", err);
                        setScriptError(true);
                    }
                }).render(paypalButtonContainerRef.current).then(() => {
                    setIsRendered(true);
                });
            } catch (error) {
                console.error("Failed to render PayPal buttons", error);
                setScriptError(true);
            }
        }
    }, [scriptLoaded, scriptError, onSubscriptionApproved, isRendered]);

    if (scriptError) {
        return (
            <div className="text-center space-y-3 py-4">
                <p className="text-sm text-destructive">Unable to load payment options</p>
                <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="mx-auto"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <>
            <Script
                ref={scriptRef}
                src="https://www.paypal.com/sdk/js?client-id=ATQQe0msfq8ed5TWIkZfBWyfQ1OhpyEG7iONYHg9P0-VQvjyG98xm7j55DhzEm9geoq9IhswzHknyZSw&vault=true&intent=subscription"
                data-sdk-integration-source="button-factory"
                onLoad={() => setScriptLoaded(true)}
                onError={() => setScriptError(true)}
                strategy="afterInteractive"
            />
            
            <div className="w-full">
                {!scriptLoaded && !scriptError && (
                    <div className="flex flex-col items-center gap-3 py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading secure payment...</p>
                    </div>
                )}
                
                {/* PayPal Button Container */}
                <div 
                    ref={paypalButtonContainerRef} 
                    className={cn(
                        "w-full min-h-[50px]",
                        scriptLoaded && !scriptError ? "block" : "hidden"
                    )}
                />
            </div>
        </>
    )
}

export default function UpgradePage() {
    const { userData, updateUserData, loading } = useAuth()
    const router = useRouter()
    const { toast } = useToast()
    const [isUpgrading, setIsUpgrading] = React.useState(false)

    const handleUpgrade = async () => {
        setIsUpgrading(true)
        try {
            await updateUserData({ isPro: true })
            toast({
                title: "🎉 Welcome to Pro!",
                description: "You now have access to all premium features. Let's supercharge your finances!",
                duration: 5000,
            })
            router.push("/dashboard")
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Upgrade Failed",
                description: "Something went wrong. Please try again or contact support.",
            })
        } finally {
            setIsUpgrading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5 py-16 px-4">
                <div className="max-w-4xl mx-auto space-y-8">
                    <Skeleton className="h-12 w-64 mx-auto" />
                    <Skeleton className="h-[600px] w-full rounded-2xl" />
                </div>
            </div>
        )
    }

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
                            
                            <CardTitle className="text-3xl font-bold">Eco Vest Pro</CardTitle>
                            
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-4xl font-bold text-primary">$5</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground line-through">$9.99/month</p>
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
                            {userData?.isPro ? (
                                <motion.div 
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    className="w-full flex flex-col items-center gap-4"
                                >
                                    <div className="flex items-center gap-2 text-primary bg-primary/10 dark:bg-primary/20 px-6 py-3 rounded-full">
                                        <CheckCircle className="h-5 w-5" />
                                        <p className="font-medium">You are already a Pro member!</p>
                                    </div>
                                    <Button 
                                        variant="default" 
                                        onClick={() => router.push("/dashboard")}
                                        className="mt-2 min-w-[200px]"
                                    >
                                        Go to Dashboard
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </motion.div>
                            ) : isUpgrading ? (
                                <div className="flex flex-col items-center gap-4 py-6">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-muted-foreground">Processing your upgrade...</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-md">
                                    <PayPalSubscriptionButton onSubscriptionApproved={handleUpgrade} />
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Simple payment note */}
                <p className="text-center text-xs text-muted-foreground/60">
                    Secure payments powered by PayPal
                </p>
            </div>
        </div>
    )
}