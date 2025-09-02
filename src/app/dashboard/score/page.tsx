"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTransactions } from "@/hooks/use-transactions"
import { useAccounts } from "@/hooks/use-accounts"
import { useBudgets } from "@/hooks/use-budgets"
import { useGoals } from "@/hooks/use-goals"
import { useAuth } from "@/hooks/use-auth"
import { generateFinancialHealthScore } from "@/ai/flows/generate-financial-health-score"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, Sparkles, AlertTriangle, Activity } from "lucide-react"
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"

const GAUGE_MAX_ANGLE = 180; // Semicircle

export default function ScorePage() {
    const { isPro, loading: authLoading } = useAuth();
    const { transactions, loading: transactionsLoading } = useTransactions();
    const { accounts, loading: accountsLoading } = useAccounts();
    const { budgets, loading: budgetsLoading } = useBudgets();
    const { goals, loading: goalsLoading } = useGoals();
    
    const router = useRouter();
    const [score, setScore] = React.useState<number | null>(null);
    const [summary, setSummary] = React.useState('');
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const loading = authLoading || transactionsLoading || accountsLoading || budgetsLoading || goalsLoading;
    
    const handleGenerateScore = async () => {
        if (!isPro) {
            router.push("/dashboard/upgrade");
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
            const budgetWithSpent = budgets.map(b => ({
                ...b,
                spent: transactions.filter(t => t.type === 'expense' && t.category.toLowerCase() === b.category.toLowerCase()).reduce((acc, t) => acc + t.amount, 0)
            }));

            const result = await generateFinancialHealthScore({
                totalIncome,
                totalExpense,
                totalBalance,
                savingsGoals: JSON.stringify(goals),
                budgets: JSON.stringify(budgetWithSpent)
            });
            setScore(result.score);
            setSummary(result.summary);
        } catch (e) {
            console.error(e);
            setError("Failed to generate score. Please try again later.");
        } finally {
            setIsGenerating(false);
        }
    }

    const gaugeData = score !== null ? [
        { name: 'Score', value: score, fill: 'hsl(var(--primary))' },
        { name: 'Remaining', value: 1000 - score, fill: 'hsl(var(--muted))' }
    ] : [];

    const getScoreColor = (scoreValue: number) => {
        if (scoreValue < 400) return 'text-destructive';
        if (scoreValue < 700) return 'text-yellow-500';
        return 'text-primary';
    }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Financial Health Score</h1>
      </div>

       <Card className="max-w-4xl mx-auto w-full">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Activity /> Your Financial Wellness</CardTitle>
            <CardDescription>Get a snapshot of your current financial health. This score is calculated based on your income, expenses, savings, and budgeting habits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex flex-col items-center">
            
            {loading ? (
                 <Skeleton className="h-12 w-48" />
            ) : (
                <Button onClick={handleGenerateScore} disabled={isGenerating}>
                  {isGenerating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</>
                  ) : isPro ? (
                    <><Sparkles className="mr-2 h-4 w-4" />{score !== null ? 'Recalculate Score' : 'Calculate My Score'}</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" />Upgrade to Pro to Get Your Score</>
                  )}
                </Button>
            )}
            
            {error && (
                 <div className="flex items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 w-full">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                 </div>
            )}

            {isGenerating ? (
                <div className="flex flex-col items-center justify-center pt-8 w-full">
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : score !== null && isPro ? (
                <div className="w-full flex flex-col items-center pt-8">
                     <div className="relative h-48 w-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={gaugeData} 
                                    cx="50%" 
                                    cy="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius="70%"
                                    outerRadius="100%"
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                {gaugeData.map((entry) => <Cell key={entry.name} fill={entry.fill} stroke={entry.fill} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="text-muted-foreground text-sm">Your Score</span>
                            <span className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}</span>
                        </div>
                     </div>
                     <div className="prose prose-sm max-w-none text-foreground mt-8 text-center bg-muted/50 rounded-lg p-6 w-full">
                        <h4 className="font-semibold">AI Analysis</h4>
                        <p>{summary}</p>
                    </div>
                </div>
            ) : (
                 <div className="flex flex-col items-center justify-center text-center w-full h-48 rounded-lg border-2 border-dashed mt-4">
                    <p className="text-sm text-muted-foreground px-4">
                        {isPro ? "Click the button to generate your financial health score." : "Upgrade to Pro to unlock this feature."}
                    </p>
                </div>
            )}
          </CardContent>
       </Card>
    </div>
  )
}
