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
  BarChart3,
  Eye,
  EyeOff,
  CreditCard,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Crown,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { subMonths, isAfter, format, startOfMonth, endOfMonth } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { MoneyFlowChart } from "@/components/dashboard/design/money-flow-chart";
import { BudgetBreakdown } from "@/components/dashboard/design/budget-breakdown";
import { SavingsTips } from "@/components/dashboard/savings-tips";
import { FinancialHealthScoreCard } from "@/components/dashboard/financial-health-score";
import { useCurrency } from "@/hooks/use-currency";
import { SpendingByCategory } from "@/components/dashboard/design/spending-by-category";
import { QuickInsights } from "@/components/dashboard/design/quick-insights";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

// Enhanced User Welcome Header
function UserWelcome() {
  const { user, userData, isPro } = useAuth();
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-2 min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {greeting}, {userData?.displayName?.split(' ')[0] || 'User'}!
          </h1>
          {isPro && (
            <Badge variant="default" className="bg-gradient-to-r from-primary to-purple-600">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground">Here's your financial overview</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{format(new Date(), 'EEEE, MMMM do')}</span>
          <span>•</span>
          <span>Week {Math.ceil((new Date().getDate() + new Date(startOfMonth(new Date())).getDay()) / 7)}</span>
        </div>
      </div>
    </div>
  );
}

// Balance Visibility Toggle Component
function BalanceVisibilityToggle() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="balance-toggle" className="text-sm text-muted-foreground cursor-pointer">
        {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Label>
      <Switch
        id="balance-toggle"
        checked={showBalance}
        onCheckedChange={setShowBalance}
      />
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
  
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const stats = [
    {
      title: "Total Balance",
      value: formatCurrency(totalBalance),
      description: "Across all accounts",
      icon: Wallet,
      trend: 12.5,
      trendDirection: "up" as const,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Monthly Income",
      value: formatCurrency(totalIncome),
      description: "This month",
      icon: TrendingUp,
      trend: 8.2,
      trendDirection: "up" as const,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Monthly Expenses",
      value: formatCurrency(totalExpense),
      description: "This month",
      icon: TrendingDown,
      trend: 3.1,
      trendDirection: "down" as const,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      title: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      description: "Of monthly income",
      icon: PiggyBank,
      trend: 15.7,
      trendDirection: "up" as const,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="card hover:shadow-md transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={cn('text-2xl font-bold', stat.color)}>
                  {stat.value}
                </p>
                <div className="flex items-center gap-2">
                  <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                    stat.trendDirection === "up" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                  )}>
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
              <div className={cn('p-3 rounded-lg group-hover:scale-110 transition-transform duration-300', stat.bgColor)}>
                <stat.icon className={cn('h-6 w-6', stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// New: Upcoming Bills Component
function UpcomingBills({ transactions }: { transactions: Transaction[] }) {
  const { formatCurrency } = useCurrency();
  const upcomingBills = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) > new Date())
    .slice(0, 3);

  if (upcomingBills.length === 0) {
    return (
      <Card className="card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Upcoming Bills
          </CardTitle>
          <CardDescription>No upcoming bills scheduled</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Upcoming Bills
        </CardTitle>
        <CardDescription>Bills due in the next 30 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingBills.map((bill, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <CreditCard className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-sm">{bill.description}</p>
                <p className="text-xs text-muted-foreground">
                  Due {format(new Date(bill.date), 'MMM dd')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">{formatCurrency(bill.amount)}</p>
              <Badge variant="outline" className="text-xs">
                {bill.category}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/transactions">
            View All Bills
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// New: Financial Alerts Component
function FinancialAlerts({ budgets, goals }: { budgets: any[], goals: Goal[] }) {
  const { formatCurrency } = useCurrency();
  
  const alerts = [];
  
  // Budget alerts
  budgets.forEach(budget => {
    const utilization = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    if (utilization > 90) {
      alerts.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Budget Nearly Exceeded',
        message: `${budget.category} budget is at ${utilization.toFixed(1)}%`,
        amount: formatCurrency(budget.amount - budget.spent)
      });
    }
  });
  
  // Goal alerts
  goals.slice(0, 2).forEach(goal => {
    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    if (progress > 75) {
      alerts.push({
        type: 'success',
        icon: CheckCircle2,
        title: 'Goal Nearly Achieved',
        message: `${goal.name} is ${progress.toFixed(1)}% complete`,
        amount: formatCurrency(goal.targetAmount - goal.currentAmount)
      });
    }
  });

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="card border-l-4 border-l-warning">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Financial Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <alert.icon className={cn('h-4 w-4 mt-0.5',
              alert.type === 'warning' ? 'text-warning' : 'text-success'
            )} />
            <div className="flex-1">
              <p className="font-medium text-sm">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
              <p className="text-xs font-medium mt-1">{alert.amount} remaining</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Enhanced Quick Actions with better styling
function QuickActions({ onAddTransactionClick }: { onAddTransactionClick: () => void }) {
  const router = useRouter();
  const { isPro } = useAuth();

  const handleActionClick = (label: string) => {
    switch (label) {
      case "Add Transaction":
        onAddTransactionClick();
        break;
      case "Set Goal":
        router.push("/dashboard/goals");
        break;
      case "View Reports":
        router.push("/dashboard/reports");
        break;
      case "AI Assistant":
        router.push("/dashboard/assistant");
        break;
      case "Net Worth":
        router.push("/dashboard/net-worth");
        break;
      default:
        break;
    }
  };
  
  const actions = [
    { 
      icon: Plus, 
      label: "Add Transaction", 
      description: "Record new spending", 
      color: "bg-primary",
      pro: false
    },
    { 
      icon: Target, 
      label: "Set Goal", 
      description: "Create savings goal", 
      color: "bg-warning",
      pro: false
    },
    { 
      icon: BarChart3, 
      label: "View Reports", 
      description: "See detailed reports", 
      color: "bg-info",
      pro: false
    },
     { 
      icon: PieChart, 
      label: "Net Worth", 
      description: "Track your growth", 
      color: "bg-blue-500",
      pro: false
    },
    { 
      icon: Zap, 
      label: "AI Assistant", 
      description: "Get financial insights", 
      color: "bg-purple-500",
      pro: true
    },
  ];

  return (
    <Card className="card bg-background">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Zap className="h-5 w-5 text-warning" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used actions to manage your finances</CardDescription>
          </div>
          <BalanceVisibilityToggle />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {actions.map((action, index) => {
            if (action.pro && !isPro) {
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-24 flex flex-col justify-center items-center gap-2 border-dashed bg-muted/30"
                  asChild
                >
                  <Link href="/dashboard/upgrade">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground relative">
                      <action.icon className="h-4 w-4" />
                      <Crown className="h-3 w-3 absolute -top-1 -right-1 text-warning" />
                    </div>
                    <div className="space-y-1 min-w-0 w-full text-center">
                      <span className="text-xs font-semibold truncate block">{action.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        Pro
                      </Badge>
                    </div>
                  </Link>
                </Button>
              );
            }

            return (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleActionClick(action.label)}
                className="h-24 flex flex-col justify-center items-center gap-2 hover:scale-105 transition-all duration-200 border hover:border-primary/20 bg-background min-w-0 group"
              >
                <div className={cn("p-2 rounded-lg text-white shadow-md flex-shrink-0 group-hover:scale-110 transition-transform", action.color)}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="space-y-1 min-w-0 w-full text-center">
                  <span className="text-xs font-semibold truncate block">{action.label}</span>
                  <span className="text-xs text-muted-foreground truncate block">{action.description}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}


// New: Monthly Progress Component
function MonthlyProgress({ totalIncome, totalExpense, budgets }: { 
  totalIncome: number; 
  totalExpense: number;
  budgets: any[];
}) {
  const { formatCurrency } = useCurrency();
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const monthProgress = (currentDay / daysInMonth) * 100;
  
  const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Monthly Progress
        </CardTitle>
        <CardDescription>Track your monthly financial progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Month Progress</span>
            <span>{currentDay}/{daysInMonth} days ({monthProgress.toFixed(1)}%)</span>
          </div>
          <Progress value={monthProgress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Budget Utilization</span>
            <span>{budgetProgress.toFixed(1)}%</span>
          </div>
          <Progress value={budgetProgress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 rounded-lg bg-success/10">
            <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-muted-foreground">Income</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</p>
            <p className="text-xs text-muted-foreground">Expenses</p>
          </div>
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
  const { loading: authLoading, isPro } = useAuth();
  const { formatCurrency } = useCurrency();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartTimeRange, setChartTimeRange] = useState('6M');

  const loading = transactionsLoading || budgetsLoading || goalsLoading || accountsLoading || authLoading;

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      if(!t.date) return false;
      const transactionDate = new Date(t.date);
      switch(timeRange) {
        case 'weekly':
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          return isAfter(transactionDate, lastWeek);
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
      .filter(t => t.type === 'expense' && budget.category && t.category && t.category.toLowerCase() === budget.category.toLowerCase())
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
      <main className="p-4 sm:p-6 space-y-6 max-w-screen-xl mx-auto">
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
                <SelectItem value="weekly">This Week</SelectItem>
                <SelectItem value="monthly">This Month</SelectItem>
                <SelectItem value="yearly">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          {!isPro && (
            <Button variant="outline" className="border-primary/20 text-primary" asChild>
              <Link href="/dashboard/upgrade">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Link>
            </Button>
          )}
        </div>

        {/* Financial Alerts */}
        <FinancialAlerts budgets={budgetWithSpent} goals={goals as Goal[]} />

        {/* Main Stats */}
        <StatsOverview 
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalBalance={totalBalance}
        />

        {/* Quick Actions */}
        <QuickActions onAddTransactionClick={() => setAddDialogOpen(true)} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Money Flow Chart */}
            <Card className="card">
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

            {/* Spending by Category */}
            <SpendingByCategory transactions={filteredTransactions} />

            {/* Budget Breakdown */}
            <BudgetBreakdown budgets={budgetWithSpent} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Monthly Progress */}
            <MonthlyProgress 
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              budgets={budgetWithSpent}
            />

            {/* Upcoming Bills */}
            <UpcomingBills transactions={transactions} />
            
            <FinancialHealthScoreCard 
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              totalBalance={totalBalance}
              goals={goals as Goal[]}
              budgets={budgetWithSpent}
            />
          </div>
        </div>

        {/* Transaction History and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions transactions={filteredTransactions} setAddDialogOpen={setAddDialogOpen} addDialogOpen={addDialogOpen} />
          <SavingsTips transactions={filteredTransactions} />
        </div>
      </main>
    </div>
  );
}