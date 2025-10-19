
"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useTransactions } from "@/hooks/use-transactions"
import { generateCarbonFootprint } from "@/ai/flows/generate-carbon.footprint"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Lightbulb, Loader2, Leaf, AlertTriangle, Sparkles, Sprout } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Footprint } from "@/lib/types"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useAuth } from "@/hooks/use-auth"
import type { GenerateCarbonFootprintOutput } from "@/ai/flows/generate-carbon.footprint"
import { getDailyChallenge } from "@/lib/challenges"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"


const chartConfig = {
  co2: {
    label: "CO₂ (kg)",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export default function EcoPage() {
    const { transactions, loading: transactionsLoading } = useTransactions()
    const { isPro, userData, updateUserData } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [analysis, setAnalysis] = React.useState<GenerateCarbonFootprintOutput | null>(null)
    const [isGenerating, setIsGenerating] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    
    const dailyChallenge = getDailyChallenge();
    const today = format(new Date(), 'yyyy-MM-dd');
    const isChallengeCompleted = userData?.completedChallenges?.[today] || false;


    const handleCompleteChallenge = async () => {
        if (isChallengeCompleted || !userData) return;

        const currentPoints = userData.ecoPoints || 0;
        const newPoints = currentPoints + dailyChallenge.points;
        
        const currentCompleted = userData.completedChallenges || {};
        const newCompleted = { ...currentCompleted, [today]: true };

        try {
            await updateUserData({
                ecoPoints: newPoints,
                completedChallenges: newCompleted
            });
            toast({
                title: "Challenge Complete! 🎉",
                description: `You've earned ${dailyChallenge.points} points!`,
            });
        } catch (e) {
            console.error(e);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save challenge progress.",
            });
        }
    };


    const handleGenerateFootprint = async () => {
        if (!isPro) {
            router.push("/dashboard/upgrade");
            return;
        }
        setIsGenerating(true)
        setError(null)
        setAnalysis(null);
        try {
            const spendingByCategory = transactions
                .filter(t => t.type === 'expense')
                .reduce((acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + t.amount;
                    return acc;
                }, {} as { [key: string]: number });
            
            const result = await generateCarbonFootprint({ spendingData: JSON.stringify(spendingByCategory) })
            setAnalysis(result)
        } catch (e) {
            console.error(e)
            setError("Failed to generate footprint. Please check your API key and try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    const totalCO2 = analysis?.footprints.reduce((acc, f) => acc + f.co2, 0) ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Impact Hub</h1>
            <p className="text-muted-foreground">Understand your environmental impact and take action.</p>
        </div>
      </div>
      
        <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg">Today's Eco-Challenge</CardTitle>
                    <CardDescription>Complete daily challenges to earn points and build sustainable habits.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-start gap-6 rounded-lg bg-muted/50 p-6">
                    <dailyChallenge.icon className="h-10 w-10 text-green-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h3 className="font-bold">{dailyChallenge.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{dailyChallenge.description}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-primary">+{dailyChallenge.points} PTS</p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end items-center gap-4 pt-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="complete-challenge"
                            checked={isChallengeCompleted}
                            onCheckedChange={handleCompleteChallenge}
                            disabled={isChallengeCompleted}
                        />
                        <Label
                            htmlFor="complete-challenge"
                            className={isChallengeCompleted ? "text-muted-foreground line-through" : ""}
                        >
                        {isChallengeCompleted ? "Completed!" : "Mark as Complete"}
                        </Label>
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><Sprout className="text-primary"/> Your Eco Points</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full">
                    <p className="text-6xl font-bold text-primary">{userData?.ecoPoints || 0}</p>
                    <p className="text-muted-foreground">points earned</p>
                </CardContent>
            </Card>
        </div>


       <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Leaf className="text-green-500" /> Carbon Footprint Analysis</CardTitle>
            <CardDescription>Estimate your environmental impact based on your spending habits. Click the button to generate your personalized report.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {transactionsLoading ? (
                <Skeleton className="h-12 w-48" />
            ) : (
                 <Button onClick={handleGenerateFootprint} disabled={isGenerating || transactions.length === 0}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing Spending...</>
                  ) : isPro ? (
                    <><Leaf className="mr-2 h-4 w-4" />{analysis ? 'Re-Analyze My Impact' : 'Analyze My Impact'}</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" />Upgrade to Pro to Analyze</>
                  )}
                </Button>
            )}
            
            {error && (
                 <div className="flex items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                 </div>
            )}

            {isGenerating && (
                <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            )}
            
            {analysis && isPro && (
                <div className="grid lg:grid-cols-5 gap-8 pt-4">
                    <Card className="lg:col-span-3">
                         <CardHeader>
                            <CardTitle>CO₂ by Category (kg)</CardTitle>
                         </CardHeader>
                         <CardContent className="h-[300px]">
                            <ChartContainer config={chartConfig} className="w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analysis.footprints} layout="vertical" margin={{ left: 20, right: 20 }}>
                                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                                        <ChartTooltip
                                            cursor={{ fill: 'hsl(var(--muted))' }}
                                            content={<ChartTooltipContent hideLabel formatter={(value) => `${(value as number).toFixed(2)} kg CO₂`} />}
                                        />
                                        <Bar dataKey="co2" fill="var(--color-co2)" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                         </CardContent>
                    </Card>
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="bg-muted/50">
                            <CardHeader className="text-center">
                                <CardTitle>Total Estimated Footprint</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-4xl font-bold text-green-600">{totalCO2.toFixed(2)} kg CO₂</p>
                                <p className="text-xs text-muted-foreground">this month</p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="text-yellow-400"/> AI Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="lg:col-span-full bg-accent/10 border-dashed border-accent/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-accent-foreground"><Sprout className="text-accent" /> Your Sustainable Switch</CardTitle>
                            <CardDescription>Based on your spending, here’s a high-impact switch you can make.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Your highest impact category is <strong className="text-foreground">{analysis.sustainableSwitch.category}</strong>. {analysis.sustainableSwitch.suggestion}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
          </CardContent>
       </Card>

    </div>
  )
}
