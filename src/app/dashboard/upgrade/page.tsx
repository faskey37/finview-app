
"use client"

import * as React from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Sparkles, Leaf, BrainCircuit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const proFeatures = [
    {
        icon: BrainCircuit,
        title: "AI Savings Tips",
        description: "Get personalized suggestions to optimize your spending and increase your savings.",
    },
    {
        icon: Leaf,
        title: "Carbon Footprint Analysis",
        description: "Understand the environmental impact of your purchases with our Eco-Tracker.",
    },
    {
        icon: Sparkles,
        title: "Advanced AI Features",
        description: "Access to all future AI-powered financial tools and insights.",
    },
]

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
                title: "Upgrade Successful!",
                description: "Welcome to Pro! You now have access to all premium features.",
            })
            router.push("/dashboard")
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Upgrade Failed",
                description: "Something went wrong. Please try again.",
            })
        } finally {
            setIsUpgrading(false)
        }
    }

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8 items-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Upgrade to Pro</h1>
                <p className="text-muted-foreground mt-2">Unlock powerful AI features to supercharge your finances.</p>
            </div>

            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <Sparkles className="mx-auto h-12 w-12 text-accent mb-4" />
                    <CardTitle className="text-2xl">Eco Vest Pro</CardTitle>
                    <CardDescription className="text-base">
                        <span className="text-3xl font-bold text-primary">$5</span>
                        /month
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ul className="space-y-4">
                        {proFeatures.map((feature) => (
                            <li key={feature.title} className="flex items-start gap-4">
                                <feature.icon className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-semibold">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    {userData?.isPro ? (
                         <div className="w-full flex items-center justify-center gap-2 text-primary">
                            <CheckCircle />
                            <p>You are already a Pro member. Thank you!</p>
                        </div>
                    ) : (
                        <Button className="w-full" onClick={handleUpgrade} disabled={isUpgrading}>
                            {isUpgrading ? "Upgrading..." : "Upgrade Now & Unlock All Features"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
