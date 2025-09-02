
"use client";
import * as React from "react";
import { useAccounts } from "@/hooks/use-accounts";
import { useInvestments } from "@/hooks/use-investments";
import { useCurrency } from "@/hooks/use-currency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Asset, Liability } from "@/lib/types";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PiggyBank, Landmark, TrendingUp, CreditCard } from "lucide-react";

export default function NetWorthPage() {
    const { accounts, loading: accountsLoading } = useAccounts();
    const { investments, loading: investmentsLoading } = useInvestments();
    const { formatCurrency } = useCurrency();

    const loading = accountsLoading || investmentsLoading;

    const assets: Asset[] = [
        ...accounts.filter(a => a.type !== 'Credit Card').map(a => ({ name: a.provider, value: a.balance, type: 'Cash' as const })),
        ...investments.map(i => ({ name: i.name, value: i.currentValue, type: 'Investment' as const }))
    ];
    
    const liabilities: Liability[] = [
        ...accounts.filter(a => a.type === 'Credit Card').map(a => ({ name: a.provider, value: a.balance, type: 'Credit Card' as const }))
        // Add loans here in the future
    ];

    const totalAssets = assets.reduce((acc, asset) => acc + asset.value, 0);
    const totalLiabilities = liabilities.reduce((acc, liab) => acc + liab.value, 0);
    const netWorth = totalAssets - totalLiabilities;
    
    const assetData = assets.map(a => ({ name: a.name, value: a.value, fill: a.type === 'Cash' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-4))'}));
    const liabilityData = liabilities.map(l => ({ name: l.name, value: l.value, fill: 'hsl(var(--chart-3))' }));
    
    const assetConfig = assetData.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
    }, {} as ChartConfig);

    const liabilityConfig = liabilityData.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
    }, {} as ChartConfig);


    if (loading) {
        return (
             <div className="flex flex-col gap-8">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-8 md:grid-cols-3">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Net Worth</h1>
                <p className="text-muted-foreground">A snapshot of your total financial value.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Total Assets</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-green-600">{formatCurrency(totalAssets)}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Total Liabilities</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</p></CardContent>
                </Card>
                <Card className="md:col-span-3 lg:col-span-1 bg-card-foreground text-background">
                    <CardHeader><CardTitle className="text-background/90">Net Worth</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{formatCurrency(netWorth)}</p></CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Asset Breakdown</CardTitle>
                        <CardDescription>Where your value is stored.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                         <ChartContainer config={assetConfig} className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                                    <Pie data={assetData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                                        {assetData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill} /> )}
                                    </Pie>
                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-lg">Liability Breakdown</CardTitle>
                        <CardDescription>What you owe.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                         <ChartContainer config={liabilityConfig} className="w-full h-full">
                           <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel nameKey="name" formatter={(value) => formatCurrency(value as number)} />} />
                                    <Pie data={liabilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                                         {liabilityData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill} /> )}
                                    </Pie>
                                     <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
