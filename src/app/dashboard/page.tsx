
"use client"
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Budgets } from "@/components/dashboard/budgets";
import { SavingsTips } from "@/components/dashboard/savings-tips";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { Skeleton } from "@/components/ui/skeleton";
import type { CategoryData, ChartData } from "@/lib/types";
import { FinancialHealthScoreCard } from "@/components/dashboard/financial-health-score";
import { useGoals } from "@/hooks/use-goals";
import { useAccounts } from "@/hooks/use-accounts";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrainCircuit, ChevronRight, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

function processChartData(transactions: any[]): ChartData[] {
  const monthlyData: { [key: string]: { income: number; expense: number } } = {};

  transactions.forEach(t => {
    // Robust date parsing: 'YYYY-MM-DD'. Avoids `new Date(string)` inconsistency.
    const dateParts = t.date.split('-').map(Number);
    // Note: month is 0-indexed in JS Date (0=Jan, 1=Feb, etc.)
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const month = dateObj.toLocaleString('default', { month: 'short' });

    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expense += t.amount;
    }
  });

  // Ensure we have at least some months for the chart, even if empty
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth();
  const relevantMonths = months.slice(0, currentMonthIndex + 1);
  
  return relevantMonths.map(month => ({
    month,
    income: monthlyData[month]?.income || 0,
    expense: monthlyData[month]?.expense || 0,
  }));
}


function processCategoryData(transactions: any[]): CategoryData[] {
    const categoryTotals: { [key: string]: number } = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
        if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += t.amount;
    });

    const chartColors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))',
    ];

    return Object.entries(categoryTotals).map(([category, value], index) => ({
        category,
        value,
        fill: chartColors[index % chartColors.length]
    }));
}


export default function DashboardPage() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { goals, loading: goalsLoading } = useGoals();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { userData, loading: authLoading } = useAuth();


  const loading = transactionsLoading || budgetsLoading || goalsLoading || accountsLoading || authLoading;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

  const budgetWithSpent = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase())
      .reduce((acc, t) => acc + t.amount, 0);
    return { ...budget, spent };
  });
  
  const chartData = processChartData(transactions);
  const categoryData = processCategoryData(transactions);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Skeleton className="h-[380px] lg:col-span-2" />
          <Skeleton className="h-[380px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        <Card className="bg-accent/20 border-accent/30">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <BrainCircuit className="h-10 w-10 text-accent animate-pulse" style={{ filter: 'drop-shadow(0 0 3px hsl(var(--accent)))' }}/>
                    <div>
                        <CardTitle className="text-lg">Meet Your AI Assistant</CardTitle>
                        <CardDescription>Ask questions about your finances, get insights, and more.</CardDescription>
                    </div>
                </div>
                 <Button asChild>
                    <Link href="/dashboard/assistant">
                        Ask Now
                        <ChevronRight/>
                    </Link>
                </Button>
            </CardHeader>
        </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCards income={totalIncome} expense={totalExpense} />
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eco Points</CardTitle>
                <Leaf className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{userData?.ecoPoints || 0}</div>
                <p className="text-xs text-muted-foreground">From completing eco-challenges</p>
            </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendingChart data={chartData} />
        </div>
        <div>
          <CategoryChart data={categoryData} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Budgets budgets={budgetWithSpent} />
        </div>
        <FinancialHealthScoreCard
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            totalBalance={totalBalance}
            goals={goals}
            budgets={budgetWithSpent}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <RecentTransactions transactions={transactions.slice(0, 5)} />
        <SavingsTips transactions={transactions} />
      </div>

    </div>
  );
}
