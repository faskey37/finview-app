
"use client"
import * as React from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { useAccounts } from "@/hooks/use-accounts"
import { useInvestments } from "@/hooks/use-investments"
import { useCurrency } from "@/hooks/use-currency"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, Sparkles } from "lucide-react"
import { generateReportSummary } from "@/ai/flows/generate-report-summary"
import { useRouter } from "next/navigation"

type MonthlyData = {
    month: string;
    income: number;
    expense: number;
    netWorth: number;
    [key: string]: number | string; // For dynamic category spending
}

function processMonthlyData(transactions: any[], accounts: any[], investments: any[]): { data: MonthlyData[], categories: string[] } {
    const dataByMonth: { [key: string]: any } = {};
    const categories = new Set<string>();

    // Process transactions
    transactions.forEach(t => {
        const date = new Date(t.date);
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!dataByMonth[month]) {
            dataByMonth[month] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            dataByMonth[month].income += t.amount;
        } else {
            dataByMonth[month].expense += t.amount;
            const categoryKey = `category_${t.category}`;
            dataByMonth[month][categoryKey] = (dataByMonth[month][categoryKey] || 0) + t.amount;
            categories.add(t.category);
        }
    });

    // Process assets/liabilities for net worth calculation at the end of each month
    const allEvents = [...transactions, ...accounts, ...investments];
    allEvents.forEach(e => {
        let date;
        if(e.date) date = new Date(e.date); // transactions
        else if (e.purchaseDate) date = new Date(e.purchaseDate); // investments
        else return; // accounts dont have dates, we assume current balance
        
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!dataByMonth[month]) {
            dataByMonth[month] = { income: 0, expense: 0 };
        }
    });

    const sortedMonths = Object.keys(dataByMonth).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    let runningAssets = accounts.filter(a => a.type !== 'Credit Card').reduce((acc, a) => acc + a.balance, 0) + investments.reduce((acc, i) => acc + i.currentValue, 0);
    let runningLiabilities = accounts.filter(a => a.type === 'Credit Card').reduce((acc, a) => acc + a.balance, 0);

    const finalData = sortedMonths.map(month => {
        const monthData = dataByMonth[month];
        // Simplified net worth logic: assumes current asset/liability values are end-of-month snapshots.
        // A more accurate system would require historical balance snapshots.
        const netWorth = runningAssets - runningLiabilities;
        
        const result: MonthlyData = {
            month: month,
            income: monthData.income,
            expense: monthData.expense,
            netWorth: netWorth,
        };

        categories.forEach(cat => {
            result[`category_${cat}`] = monthData[`category_${cat}`] || 0;
        });

        return result;
    });

    return { data: finalData, categories: Array.from(categories) };
}


export default function ReportsPage() {
    const { transactions, loading: tLoading } = useTransactions();
    const { accounts, loading: aLoading } = useAccounts();
    const { investments, loading: iLoading } = useInvestments();
    const { isPro } = useAuth();
    const router = useRouter();
    const { formatCurrency, currency } = useCurrency();

    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
    const [summary, setSummary] = React.useState<string | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    
    const loading = tLoading || aLoading || iLoading;

    const { data: monthlyData, categories } = React.useMemo(() => {
        if(loading) return { data: [], categories: [] };
        return processMonthlyData(transactions, accounts, investments)
    }, [loading, transactions, accounts, investments]);

    React.useEffect(() => {
        if(categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory]);

    const handleGenerateSummary = async () => {
        if (!isPro) {
            router.push('/dashboard/upgrade');
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const result = await generateReportSummary({ 
                reportData: JSON.stringify(monthlyData),
                currency: currency,
            });
            setSummary(result.summary);
        } catch (e) {
            console.error(e);
            setError("Failed to generate summary. Please try again later.");
        } finally {
            setIsGenerating(false);
        }
    }


    if (loading) {
        return (
            <div className="flex flex-col gap-8">
                <Skeleton className="h-10 w-64" />
                <div className="grid gap-8 md:grid-cols-2">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96" />
                    <Skeleton className="h-96 md:col-span-2" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Reports & Analysis</h1>
                    <p className="text-muted-foreground">Dive deeper into your financial trends over time.</p>
                </div>
                 <Button onClick={handleGenerateSummary} disabled={isGenerating || !isPro} className="w-full md:w-auto">
                    {isGenerating ? <><Loader2 className="animate-spin" /> Analyzing...</> : <><Sparkles /> Generate AI Summary</>}
                </Button>
            </div>
            
            {error && (
                <div className="flex items-center gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}
            
            {isPro && summary && (
                <Card className="bg-accent/20 border-accent/30">
                    <CardHeader>
                        <CardTitle className="text-lg">AI Report Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                         {summary.split('\n').map((line, index) => <p key={index}>{line.replace(/[*#]/g, '')}</p>)}
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Historical Spending</CardTitle>
                        <CardDescription>Income vs. Expense trend over the last several months.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number).replace(/(\.00|,00)/g, '')} />
                                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }} formatter={(value) => formatCurrency(value as number)} />
                                <Legend />
                                <Area type="monotone" dataKey="income" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1), 0.5)" />
                                <Area type="monotone" dataKey="expense" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2), 0.5)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Monthly Net Worth</CardTitle>
                        <CardDescription>A snapshot of your net worth at the end of each month.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number).replace(/(\.00|,00)/g, '')} />
                                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }} formatter={(value) => formatCurrency(value as number)} />
                                <Bar dataKey="netWorth" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                             <CardTitle>Category Spending Trend</CardTitle>
                             <CardDescription>Track spending for a specific category over time.</CardDescription>
                        </div>
                        <Select onValueChange={setSelectedCategory} value={selectedCategory || ''}>
                            <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                             <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                             <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number).replace(/(\.00|,00)/g, '')} />
                             <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }} formatter={(value) => formatCurrency(value as number)} />
                             <Legend />
                            {selectedCategory && (
                                <Line type="monotone" dataKey={`category_${selectedCategory}`} name={selectedCategory} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
