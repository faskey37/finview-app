"use client";
import React, { useState, useMemo } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartData, Transaction, Goal } from "@/lib/types";
import { useGoals } from "@/hooks/use-goals";
import { useAccounts } from "@/hooks/use-accounts";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  PiggyBank, 
  Plus, 
  Download, 
  ArrowRight, 
  MoreHorizontal,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { subMonths, isAfter } from "date-fns";
import { useRouter } from "next/navigation";

import { MoneyFlowChart } from "@/components/dashboard/design/money-flow-chart";
import { BudgetBreakdown } from "@/components/dashboard/design/budget-breakdown";
import { SavingsTips } from "@/components/dashboard/savings-tips";
import { FinancialHealthScoreCard } from "@/components/dashboard/financial-health-score";
import { useCurrency } from "@/hooks/use-currency";
import { SpendingByCategory } from "@/components/dashboard/design/spending-by-category";
import { QuickInsights } from "@/components/dashboard/design/quick-insights";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

function processChartData(transactions: Transaction[], monthsToShow: number): ChartData[] {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    const endDate = new Date();
    const startDate = subMonths(endDate, monthsToShow - 1);
    startDate.setDate(1);

    const filteredTransactions = transactions.filter(t => {
        if (typeof t.date !== 'string' || !t.date.includes('-')) return false;
        const dateParts = t.date.split('-').map(Number);
        if (dateParts.length < 3) return false;
        const transactionDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        return isAfter(transactionDate, startDate) || transactionDate.getTime() === startDate.getTime();
    });

    filteredTransactions.forEach(t => {
        const dateParts = t.date.split('-').map(Number);
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
    
    const months: ChartData[] = [];
    for (let i = 0; i < monthsToShow; i++) {
        const d = subMonths(endDate, i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        months.unshift({
            month: monthName,
            income: monthlyData[monthName]?.income || 0,
            expense: monthlyData[monthName]?.expense || 0,
        });
    }

    return months;
}

// User Welcome Header
function UserWelcome() {
  const { user, userData } = useAuth();
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="space-y-1 min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
          {greeting}, {userData?.displayName?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground truncate">Here's your financial overview</p>
      </div>
      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/20 shadow-lg flex-shrink-0">
        <AvatarImage src={userData?.photoURL || user?.photoURL || ""} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
          {(userData?.displayName?.[0] || 'U').toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}


// Enhanced Stats Overview with better visual design
function StatsOverview({ totalIncome, totalExpense, totalBalance }: { 
  totalIncome: number; 
  totalExpense: number; 
  totalBalance: number;
}) {
  const { formatCurrency } = useCurrency();
  
  const stats = [
    {
      title: "Total Balance",
      value: formatCurrency(totalBalance),
      description: "Across all accounts",
      icon: Wallet,
      trend: 12.5,
      trendDirection: "up" as const,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Monthly Income",
      value: formatCurrency(totalIncome),
      description: "This month",
      icon: TrendingUp,
      trend: 8.2,
      trendDirection: "up" as const,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(totalExpense),
      description: "This month",
      icon: TrendingDown,
      trend: 3.1,
      trendDirection: "down" as const,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      title: "Net Savings",
      value: formatCurrency(totalIncome - totalExpense),
      description: "Monthly surplus",
      icon: PiggyBank,
      trend: 15.7,
      trendDirection: "up" as const,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.gradient ? '' : 'text-foreground'}`}>
                  {stat.value}
                </p>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                    stat.trendDirection === "up" 
                      ? "bg-success/10 text-success-foreground" 
                      : "bg-destructive/10 text-destructive-foreground"
                  }`}>
                    {stat.trendDirection === "up" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    <span className="font-medium">{stat.trend}%</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.description}</span>
                </div>
              </div>
              <div className={`p-2 rounded-lg bg-muted ${stat.gradient ? '' : 'text-foreground'}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


// Enhanced Quick Actions with better styling
function QuickActions({ onAddTransactionClick }: { onAddTransactionClick: () => void }) {
  const router = useRouter();

  const handleActionClick = (label: string) => {
    switch (label) {
      case "Add Transaction":
      case "Add Income":
        onAddTransactionClick();
        break;
      case "Set Goal":
        router.push("/dashboard/goals");
        break;
      case "Export Report":
        // This is handled by the main export button now, can be repurposed.
        router.push("/dashboard/reports");
        break;
      default:
        break;
    }
  };
  
  const actions = [
    { icon: Plus, label: "Add Transaction", description: "Record new transaction", color: "bg-blue-500" },
    { icon: DollarSign, label: "Add Income", description: "Record new income", color: "bg-orange-500" },
    { icon: Target, label: "Set Goal", description: "Create savings goal", color: "bg-purple-500" },
    { icon: BarChart3, label: "View Reports", description: "See detailed reports", color: "bg-green-500" },
  ];

  return (
    <Card className="border shadow-sm bg-background">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Frequently used actions to manage your finances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleActionClick(action.label)}
              className="h-20 sm:h-24 flex flex-col justify-center items-center gap-2 hover:scale-105 transition-all duration-200 border hover:border-primary/20 bg-background min-w-0"
            >
              <div className={`p-2 rounded-lg ${action.color} text-white shadow-md flex-shrink-0`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="space-y-1 min-w-0 w-full text-center">
                <span className="text-xs sm:text-sm font-semibold truncate block">{action.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


export default function DashboardPage() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { goals, loading: goalsLoading } = useGoals();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { loading: authLoading } = useAuth();
  const { formatCurrency } = useCurrency();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartTimeRange, setChartTimeRange] = useState('6M');

  const loading = transactionsLoading || budgetsLoading || goalsLoading || accountsLoading || authLoading;

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      switch(timeRange) {
        case 'weekly':
          return isAfter(transactionDate, subMonths(now, 1/4));
        case 'yearly':
          return transactionDate.getFullYear() === now.getFullYear();
        case 'monthly':
        default:
          return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
      }
    });
  }, [transactions, timeRange]);
  
  const handleExport = () => {
    const headers = ["ID", "Date", "Description", "Amount", "Type", "Category"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map(t => [t.id, t.date, `"${t.description}"`, t.amount, t.type, t.category].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transactions-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const chartData = useMemo(() => {
    const months = chartTimeRange === '3M' ? 3 : chartTimeRange === '1Y' ? 12 : 6;
    return processChartData(transactions, months);
  }, [transactions, chartTimeRange]);


  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalBalance = accounts.reduce((acc, account) => 
    account.type !== 'Credit Card' ? acc + account.balance : acc - account.balance, 0
  );

  const budgetWithSpent = budgets.map(budget => {
    const spent = filteredTransactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase())
      .reduce((acc, t) => acc + t.amount, 0);
    return { ...budget, spent };
  });
  

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-80 lg:col-span-2 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <UserWelcome />
        
        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <StatsOverview 
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalBalance={totalBalance}
        />

        {/* Quick Actions */}
        <QuickActions onAddTransactionClick={() => setAddDialogOpen(true)} />

        {/* Main Content Grid - Updated layout with new components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Money Flow Chart */}
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Money Flow</CardTitle>
                  <CardDescription>Income vs Expenses over time</CardDescription>
                </div>
                <Tabs value={chartTimeRange} onValueChange={setChartTimeRange} className="w-full sm:w-auto">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="3M">3M</TabsTrigger>
                    <TabsTrigger value="6M">6M</TabsTrigger>
                    <TabsTrigger value="1Y">1Y</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <div className="h-[450px] w-full">
                  <MoneyFlowChart data={chartData} />
                </div>
              </CardContent>
            </Card>

            {/* New: Spending by Category */}
            <SpendingByCategory transactions={filteredTransactions} />

            {/* Budget Breakdown */}
            <BudgetBreakdown budgets={budgetWithSpent} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <RecentTransactions transactions={filteredTransactions} setAddDialogOpen={setAddDialogOpen} addDialogOpen={addDialogOpen} />
            
            {/* New: Quick Insights */}
            <QuickInsights transactions={filteredTransactions} budgets={budgets} />
            
            <FinancialHealthScoreCard 
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              totalBalance={totalBalance}
              goals={goals as Goal[]}
              budgets={budgetWithSpent}
            />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SavingsTips transactions={filteredTransactions} />
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Track your savings targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(goals as Goal[]).slice(0, 3).map((goal, index) => {
                  const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progress.toFixed(1)}% achieved</span>
                        <span>{formatCurrency(goal.targetAmount - goal.currentAmount)} to go</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create New Goal
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
