
"use client"
import * as React from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { useCurrency } from "@/hooks/use-currency"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { BenchmarkData } from "@/lib/types"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { Users, AlertTriangle } from "lucide-react"

// Static community data based on representative public financial surveys.
const communityData: { [key: string]: number } = {
    Food: 450,
    Transport: 220,
    Shopping: 300,
    Entertainment: 150,
    Housing: 1350,
    Health: 180,
    Other: 100,
};


export default function CommunityPage() {
    const { transactions, loading: transactionsLoading } = useTransactions()
    const { formatCurrency } = useCurrency()

    const userSpending = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            const key = t.category.charAt(0).toUpperCase() + t.category.slice(1);
            acc[key] = (acc[key] || 0) + t.amount
            return acc
        }, {} as { [key:string]: number })

    const benchmarkData: BenchmarkData[] = Object.keys(communityData).map(category => ({
        category,
        userSpending: userSpending[category] || 0,
        averageSpending: communityData[category] || 0,
    }))

    if (transactionsLoading) {
        return (
            <div className="flex flex-col gap-8">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96" />
                <Skeleton className="h-24" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Community Benchmarks</h1>
                <p className="text-muted-foreground">See how your spending compares to others (anonymously).</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> Spending Comparison</CardTitle>
                    <CardDescription>Your spending vs. the community average this month.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={benchmarkData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number).replace(/(\.00|,00)/g, '')} />
                            <Tooltip 
                                 contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                 }}
                                formatter={(value) => formatCurrency(value as number)}
                            />
                            <Legend iconSize={10} />
                            <Bar dataKey="userSpending" name="Your Spending" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="averageSpending" name="Community Average" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

             <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-base">About This Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        To protect user privacy, the "Community Average" data is based on representative public financial data (like consumer expenditure surveys) to provide a realistic benchmark. It is not based on other users' live data.
                    </p>
                </CardContent>
             </Card>

        </div>
    )
}
