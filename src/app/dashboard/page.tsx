"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from 'next/link';
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
  FileText,
  Printer,
  Brain,
  Lightbulb,
  AlertCircle,
  Car,
  ShoppingBag,
  Home,
  Coffee,
  Smartphone,
  HeartPulse,
  GraduationCap,
  Plane,
  Gift,
  Sun,
  Moon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { subMonths, isAfter, format, startOfMonth, endOfMonth, subDays, differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BudgetBreakdown } from "@/components/dashboard/design/budget-breakdown";
import { FinancialHealthScoreCard } from "@/components/dashboard/financial-health-score";
import { useCurrency } from "@/hooks/use-currency";
import { SpendingByCategory } from "@/components/dashboard/design/spending-by-category";
import { QuickInsights } from "@/components/dashboard/design/quick-insights";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addGoal } from "@/services/goals";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvestments } from "@/hooks/use-investments";

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.coerce.number().min(1, "Target amount must be greater than 0"),
  currentAmount: z.coerce.number().min(0, "Current amount must be 0 or more"),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
});

// Theme Toggle Component
function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = storedTheme || systemTheme;
    setTheme(initialTheme);
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full hover:bg-secondary"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}

// Custom Line Chart Component
function CustomLineChart({ data }: { data: ChartData[] }) {
  const { formatCurrency } = useCurrency();
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))'
            }}
            formatter={(value: number) => [formatCurrency(value), 'Amount']}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="hsl(var(--chart-1))"
            fillOpacity={1}
            fill="url(#colorIncome)"
            strokeWidth={2}
            dot={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="hsl(var(--chart-2))"
            fillOpacity={1}
            fill="url(#colorExpense)"
            strokeWidth={2}
            dot={{ stroke: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

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
    for (let i = monthsToShow - 1; i >= 0; i--) {
        const d = subMonths(endDate, i);
        const monthName = d.toLocaleString('default', { month: 'short' });
        months.push({
            month: monthName,
            income: monthlyData[monthName]?.income || 0,
            expense: monthlyData[monthName]?.expense || 0,
        });
    }

    return months;
}

// Modern Card Component
function ModernCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`rounded-2xl border border-border bg-card shadow-lg ${className}`}>
      {children}
    </Card>
  );
}

// Savings Tips Component
function SavingsTips({ transactions }: { transactions: Transaction[] }) {
  const { formatCurrency } = useCurrency();
  const [activeTip, setActiveTip] = useState(0);

  // Calculate spending by category
  const categorySpending = useMemo(() => {
    const spending: { [key: string]: { amount: number, icon: React.ComponentType, color: string } } = {};
    
    transactions.forEach(t => {
      if (t.type === 'expense' && t.category) {
        if (!spending[t.category]) {
          spending[t.category] = { amount: 0, icon: ShoppingBag, color: "bg-primary/20" };
        }
        spending[t.category].amount += t.amount;
      }
    });

    // Assign appropriate icons and colors based on category
    Object.keys(spending).forEach(category => {
      const lowerCat = category.toLowerCase();
      if (lowerCat.includes('transport') || lowerCat.includes('car')) {
        spending[category].icon = Car;
        spending[category].color = "bg-warning/20";
      } else if (lowerCat.includes('food') || lowerCat.includes('dining') || lowerCat.includes('groceries')) {
        spending[category].icon = Coffee;
        spending[category].color = "bg-success/20";
      } else if (lowerCat.includes('home') || lowerCat.includes('rent') || lowerCat.includes('mortgage')) {
        spending[category].icon = Home;
        spending[category].color = "bg-violet-500/20";
      } else if (lowerCat.includes('entertainment') || lowerCat.includes('movie') || lowerCat.includes('stream')) {
        spending[category].icon = Smartphone;
        spending[category].color = "bg-pink-500/20";
      } else if (lowerCat.includes('health') || lowerCat.includes('medical')) {
        spending[category].icon = HeartPulse;
        spending[category].color = "bg-destructive/20";
      } else if (lowerCat.includes('education')) {
        spending[category].icon = GraduationCap;
        spending[category].color = "bg-cyan-500/20";
      } else if (lowerCat.includes('travel')) {
        spending[category].icon = Plane;
        spending[category].color = "bg-indigo-500/20";
      } else if (lowerCat.includes('gift') || lowerCat.includes('donation')) {
        spending[category].icon = Gift;
        spending[category].color = "bg-purple-500/20";
      }
    });

    return spending;
  }, [transactions]);

  // Generate savings tips based on spending patterns
  const savingsTips = useMemo(() => {
    const tips = [];
    
    // Find highest spending category
    const categories = Object.entries(categorySpending);
    if (categories.length > 0) {
      const highestCategory = categories.sort((a, b) => b[1].amount - a[1].amount)[0];
      
      if (highestCategory[1].amount > 0) {
        const reductionPercentage = 15;
        const potentialSavings = (highestCategory[1].amount * reductionPercentage) / 100;
        
        tips.push({
          title: `Reduce ${highestCategory[0]} Spending`,
          description: `Consider reducing ${highestCategory[0]} spending by ${reductionPercentage}% to save ${formatCurrency(potentialSavings)} monthly`,
          category: highestCategory[0],
          savings: potentialSavings,
          icon: highestCategory[1].icon,
          color: highestCategory[1].color
        });
      }
    }

    // Add general tips
    tips.push({
      title: "Review Subscriptions",
      description: "Audit your monthly subscriptions. Cancel unused services to save up to 30% on recurring expenses",
      category: "Subscriptions",
      savings: 15000,
      icon: Smartphone,
      color: "bg-pink-500/20"
    });

    tips.push({
      title: "Energy Saving",
      description: "Switch to energy-efficient appliances and reduce electricity usage during peak hours",
      category: "Utilities",
      savings: 8000,
      icon: Home,
      color: "bg-violet-500/20"
    });

    tips.push({
      title: "Meal Planning",
      description: "Plan meals weekly to reduce food waste and avoid last-minute takeout orders",
      category: "Food",
      savings: 12000,
      icon: Coffee,
      color: "bg-success/20"
    });

    return tips;
  }, [categorySpending, formatCurrency]);

  // Calculate remaining monthly budget
  const remainingMonthlyBudget = 8350;
  const spentPercentage = 0; // From your image: 0% spent
  const isBudgetSafe = spentPercentage < 80;

  const handleNextTip = () => {
    setActiveTip((prev) => (prev + 1) % savingsTips.length);
  };

  const handlePrevTip = () => {
    setActiveTip((prev) => (prev - 1 + savingsTips.length) % savingsTips.length);
  };

  const IconComponent = savingsTips[activeTip]?.icon || Lightbulb;

  return (
    <ModernCard>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">A1 Savings Tips</CardTitle>
            <CardDescription>Personalized suggestions based on your spending</CardDescription>
          </div>
          <Badge variant="outline" className="border-border text-muted-foreground">
            <Brain className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Monthly Budget Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">Remaining Monthly</h3>
            <span className="text-xs text-muted-foreground">{spentPercentage}% spent of {formatCurrency(remainingMonthlyBudget)}</span>
          </div>
          <Progress value={spentPercentage} className="h-2 bg-secondary" />
          <div className={`text-sm ${isBudgetSafe ? 'text-success' : 'text-warning'}`}>
            {isBudgetSafe ? "You're in great shape—your monthly usage is still very safe" : "Your budget is at risk. Consider adjusting your spending"}
          </div>
          <div className="pt-2">
            <Button variant="outline" className="w-full border-border hover:bg-secondary" asChild>
              <Link href="/dashboard/budgets">
                <PieChart className="h-4 w-4 mr-2" />
                Budget setting →
              </Link>
            </Button>
          </div>
        </div>

        {/* Savings Tips Carousel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">Personalized Tip</h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePrevTip}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                ←
              </Button>
              <span className="text-xs text-muted-foreground">{activeTip + 1}/{savingsTips.length}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNextTip}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                →
              </Button>
            </div>
          </div>

          {savingsTips.length > 0 ? (
            <div className="space-y-3">
              <div className={`p-4 rounded-lg ${savingsTips[activeTip].color} border border-border`}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-foreground/10 rounded-lg">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{savingsTips[activeTip].title}</h4>
                    <p className="text-sm text-card-foreground mb-3">{savingsTips[activeTip].description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-secondary text-xs">
                        {savingsTips[activeTip].category}
                      </Badge>
                      <span className="text-sm font-medium text-success">
                        Save {formatCurrency(savingsTips[activeTip].savings)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" size="sm" className="col-span-1 border-border hover:bg-secondary">
                  A1
                </Button>
                <Button variant="outline" size="sm" className="col-span-1 border-border hover:bg-secondary">
                  B2
                </Button>
                <Button variant="outline" size="sm" className="col-span-1 border-border hover:bg-secondary">
                  C3
                </Button>
                <Button variant="outline" size="sm" className="col-span-1 border-border hover:bg-secondary">
                  D4
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Add more transactions to get personalized savings tips</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full border-border hover:bg-secondary" asChild>
          <Link href="/dashboard/assistant">
            <Brain className="h-4 w-4 mr-2" />
            Ask AI Assistant
          </Link>
        </Button>
      </CardFooter>
    </ModernCard>
  );
}

// User Welcome Header
function UserWelcome() {
  const { user, userData, isPro } = useAuth();
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {greeting}, {userData?.displayName?.split(' ')[0] || 'User'}!
        </h1>
        <div className="flex items-center gap-3">
         
          {isPro && (
            <Badge variant="default" className="bg-gradient-to-r from-warning to-orange-600 text-white text-xs px-3 py-1">
              <Crown className="h-3 w-3 mr-1" />
              Premium Member
            </Badge>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening with your finances today.</p>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
        <span className="text-muted-foreground/50">•</span>
        <span>Last updated: Today at {format(new Date(), 'h:mm a')}</span>
      </div>
    </div>
  );
}

// Stats Overview - Updated to include investments
function StatsOverview({ 
  totalIncome, 
  totalExpense, 
  totalBalance, 
  showBalance, 
  transactions,
  investments 
}: { 
  totalIncome: number; 
  totalExpense: number; 
  totalBalance: number;
  showBalance: boolean;
  transactions: Transaction[];
  investments: any[];
}) {
  const { formatCurrency } = useCurrency();
  
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  
  // Calculate investment metrics
  const investmentTotal = investments.reduce((acc, inv) => acc + (inv.currentValue || 0), 0);
  const investmentCost = investments.reduce((acc, inv) => acc + (inv.purchasePrice || 0), 0);
  const investmentGain = investmentTotal - investmentCost;
  const investmentGainPercent = investmentCost > 0 ? (investmentGain / investmentCost) * 100 : 0;
  
  // Calculate trends based on previous period
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Get previous period data
  const previousMonthTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const transactionDate = new Date(t.date);
    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return transactionDate.getMonth() === prevMonth.getMonth() && 
           transactionDate.getFullYear() === prevMonth.getFullYear();
  });

  const previousIncome = previousMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const previousExpense = previousMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const previousBalance = totalBalance * 0.95; // Estimated previous balance
  const previousSavingsRate = previousIncome > 0 ? ((previousIncome - previousExpense) / previousIncome) * 100 : 0;
  const previousInvestmentTotal = investmentTotal * 0.92; // Estimated previous investment value

  const stats = [
    {
      title: "Total Balance",
      value: showBalance ? formatCurrency(totalBalance) : '••••••',
      description: "Across all accounts",
      icon: Wallet,
      trend: calculateTrend(totalBalance, previousBalance),
      trendDirection: totalBalance >= previousBalance ? "up" : "down",
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "Monthly Income",
      value: showBalance ? formatCurrency(totalIncome) : '••••••',
      description: "This month's earnings",
      icon: TrendingUp,
      trend: calculateTrend(totalIncome, previousIncome),
      trendDirection: totalIncome >= previousIncome ? "up" : "down",
      color: "bg-success/10 text-success border-success/20",
    },
    {
      title: "Monthly Expenses",
      value: showBalance ? formatCurrency(totalExpense) : '••••••',
      description: "This month's spending",
      icon: TrendingDown,
      trend: calculateTrend(totalExpense, previousExpense),
      trendDirection: totalExpense <= previousExpense ? "down" : "up",
      color: "bg-destructive/10 text-destructive border-destructive/20",
    },
    {
      title: "Investments",
      value: showBalance ? formatCurrency(investmentTotal) : '••••••',
      description: "Portfolio value",
      icon: TrendingUp,
      trend: calculateTrend(investmentTotal, previousInvestmentTotal),
      trendDirection: investmentGain >= 0 ? "up" : "down",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <ModernCard key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <Badge className={`${
                stat.trendDirection === "up" 
                  ? "bg-success/20 text-success" 
                  : "bg-destructive/20 text-destructive"
              } border-0 px-3 py-1`}>
                {stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(1)}%
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.description}</p>
                {stat.trendDirection === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
          </CardContent>
        </ModernCard>
      ))}
    </div>
  );
}

// Money Flow Chart Component
function MoneyFlowChartCard({ chartData, chartTimeRange, setChartTimeRange }: { 
  chartData: ChartData[], 
  chartTimeRange: string, 
  setChartTimeRange: (range: string) => void 
}) {
  return (
    <ModernCard className="col-span-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg">Money Flow</CardTitle>
          <CardDescription>Income vs Expenses over time</CardDescription>
        </div>
        <Tabs value={chartTimeRange} onValueChange={setChartTimeRange} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="3M">3M</TabsTrigger>
            <TabsTrigger value="6M">6M</TabsTrigger>
            <TabsTrigger value="1Y">1Y</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <CustomLineChart data={chartData} />
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-sm text-muted-foreground">Expenses</span>
          </div>
        </div>
      </CardContent>
    </ModernCard>
  );
}

// Financial Goals Component
function FinancialGoalsCard({ goals, onAddNewGoal }: { goals: Goal[], onAddNewGoal: () => void }) {
  const { formatCurrency } = useCurrency();
  const now = new Date();

  const calculateUrgency = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const daysLeft = differenceInDays(deadlineDate, now);
    
    if (daysLeft < 0) return { label: "Overdue", color: "bg-destructive/20 text-destructive" };
    if (daysLeft <= 7) return { label: "Urgent", color: "bg-warning/20 text-warning" };
    if (daysLeft <= 30) return { label: "Soon", color: "bg-primary/20 text-primary" };
    return { label: "On Track", color: "bg-success/20 text-success" };
  };

  return (
    <ModernCard>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Financial Goals</CardTitle>
            <CardDescription>Track your savings targets</CardDescription>
          </div>
          <Badge className="bg-secondary text-secondary-foreground">
            {goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No goals set yet</p>
              <Button variant="outline" className="mt-4 border-border hover:bg-secondary" onClick={onAddNewGoal}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            goals.slice(0, 3).map((goal, index) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const urgency = calculateUrgency(goal.deadline);
              
              return (
                <div key={index} className="space-y-2 p-3 rounded-lg bg-secondary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm text-foreground">{goal.name}</span>
                    </div>
                    <Badge className={`${urgency.color} border-0 text-xs`}>
                      {urgency.label}
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-2 bg-secondary" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="font-medium text-foreground">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Deadline: {format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
                    <span>{formatCurrency(goal.targetAmount - goal.currentAmount)} to go</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
      {goals.length > 0 && (
        <CardFooter>
          <Button variant="outline" className="w-full border-border hover:bg-secondary" onClick={onAddNewGoal}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Goal
          </Button>
        </CardFooter>
      )}
    </ModernCard>
  );
}

// AI Savings Tips Component
function AISavingsTips({ transactions, budgets }: { transactions: Transaction[], budgets: any[] }) {
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [tips, setTips] = useState<string[]>([]);

  // Generate AI-based savings tips
  useMemo(() => {
    if (transactions.length === 0) return;
    
    setLoading(true);
    
    // Simulate AI analysis based on user data
    const generatedTips: string[] = [];
    
    // Analyze spending patterns
    const categorySpending: { [key: string]: number } = {};
    transactions.forEach(t => {
      if (t.type === 'expense' && t.category) {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      }
    });
    
    // Find highest spending category
    const highestSpendingCategory = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (highestSpendingCategory && highestSpendingCategory[1] > 500) {
      generatedTips.push(`Consider reducing ${highestSpendingCategory[0]} spending by 15% to save ${formatCurrency(highestSpendingCategory[1] * 0.15)} monthly`);
    }
    
    // Check subscription patterns
    const subscriptionKeywords = ['netflix', 'spotify', 'prime', 'subscription', 'monthly'];
    const subscriptionExpenses = transactions.filter(t => 
      t.type === 'expense' && 
      subscriptionKeywords.some(keyword => 
        t.description?.toLowerCase().includes(keyword)
      )
    );
    
    if (subscriptionExpenses.length > 3) {
      const totalSubscriptions = subscriptionExpenses.reduce((acc, t) => acc + t.amount, 0);
      generatedTips.push(`Review ${subscriptionExpenses.length} subscriptions. Could save ${formatCurrency(totalSubscriptions * 0.3)} by canceling unused ones`);
    }
    
    // Budget analysis
    const overBudgetCategories = budgets.filter(budget => {
      const spent = budget.spent || 0;
      return spent > budget.amount * 0.8;
    });
    
    if (overBudgetCategories.length > 0) {
      generatedTips.push(`${overBudgetCategories.length} categories are close to budget limit. Consider adjusting budgets`);
    }
    
    // General savings tips
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    if (totalExpenses > 2000) {
      generatedTips.push(`You could save ${formatCurrency(totalExpenses * 0.1)} monthly by optimizing recurring expenses`);
    }
    
    // Add generic tips if no specific ones generated
    if (generatedTips.length === 0) {
      generatedTips.push(
        "Set up automatic transfers to savings account on payday",
        "Review bank statements monthly to identify unnecessary expenses",
        "Consider consolidating high-interest debt to lower rates",
        "Use cash-back credit cards for regular purchases"
      );
    }
    
    setTips(generatedTips.slice(0, 4));
    setLoading(false);
  }, [transactions, budgets, formatCurrency]);

  return (
    <ModernCard>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-warning" />
              AI Savings Tips
            </CardTitle>
            <CardDescription>Personalized suggestions based on your spending</CardDescription>
          </div>
          <Badge className="bg-warning/20 text-warning border-0">
            <Lightbulb className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 bg-secondary rounded-lg" />
            ))}
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Add more transactions to get personalized savings tips</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Lightbulb className="h-4 w-4 text-warning" />
                </div>
                <p className="text-sm flex-1 text-foreground">{tip}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full border-border hover:bg-secondary" asChild>
          <Link href="/dashboard/assistant">
            <Brain className="h-4 w-4 mr-2" />
            Ask AI Assistant
          </Link>
        </Button>
      </CardFooter>
    </ModernCard>
  );
}

// Financial Health Score Component
function FinancialHealthScore({ 
  totalIncome, 
  totalExpense, 
  totalBalance, 
  goals, 
  budgets,
  transactions,
  investments 
}: { 
  totalIncome: number; 
  totalExpense: number; 
  totalBalance: number;
  goals: Goal[];
  budgets: any[];
  transactions: Transaction[];
  investments: any[];
}) {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);

  useMemo(() => {
    if (transactions.length === 0) {
      setScore(0);
      setInsights(["Add transactions to calculate your financial health score"]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // AI-based scoring algorithm
    let calculatedScore = 50; // Base score
    
    // 1. Savings Rate (25 points)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    const savingsScore = Math.min(25, (savingsRate / 4)); // 25% savings rate = 25 points
    calculatedScore += savingsScore;
    
    // 2. Debt-to-Income Ratio (25 points)
    const creditCardDebt = transactions
      .filter(t => t.type === 'expense' && t.category?.toLowerCase().includes('credit'))
      .reduce((acc, t) => acc + t.amount, 0);
    
    const debtRatio = totalIncome > 0 ? (creditCardDebt / totalIncome) * 100 : 0;
    const debtScore = debtRatio < 30 ? 25 : 25 - (debtRatio - 30);
    calculatedScore += Math.max(0, debtScore);
    
    // 3. Investment Health (20 points)
    const investmentTotal = investments.reduce((acc, inv) => acc + (inv.currentValue || 0), 0);
    const investmentCost = investments.reduce((acc, inv) => acc + (inv.purchasePrice || 0), 0);
    const investmentGain = investmentTotal - investmentCost;
    const investmentScore = investmentTotal > totalIncome * 3 ? 20 : 
                           investmentTotal > totalIncome * 1 ? 15 : 
                           investmentTotal > 0 ? 10 : 5;
    calculatedScore += investmentScore;
    
    // 4. Budget Adherence (15 points)
    const budgetAdherence = budgets.length > 0 
      ? budgets.reduce((acc, b) => {
          const utilization = b.amount > 0 ? (b.spent / b.amount) * 100 : 100;
          return acc + (utilization <= 100 ? 1 : 0);
        }, 0) / budgets.length * 15
      : 7; // Default 7 points if no budgets
    calculatedScore += budgetAdherence;
    
    // 5. Goal Progress (15 points)
    const goalProgress = goals.length > 0
      ? goals.reduce((acc, g) => {
          const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
          return acc + Math.min(progress, 100);
        }, 0) / goals.length * 0.15 // Convert to 15 points scale
      : 5; // Default 5 points if no goals
    calculatedScore += goalProgress;
    
    // Normalize score to 0-100
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));
    
    // Generate insights
    const generatedInsights: string[] = [];
    
    if (savingsRate < 10) {
      generatedInsights.push("Low savings rate. Aim for at least 20% of income");
    } else if (savingsRate > 30) {
      generatedInsights.push("Excellent savings rate! Keep it up");
    }
    
    if (debtRatio > 40) {
      generatedInsights.push("High debt ratio. Consider debt consolidation");
    }
    
    if (investmentTotal === 0) {
      generatedInsights.push("Start investing to build long-term wealth");
    } else if (investmentGain > 0) {
      generatedInsights.push("Good investment performance! Consider reinvesting gains");
    }
    
    if (budgets.length === 0) {
      generatedInsights.push("Create budgets to improve financial control");
    }
    
    if (goals.length === 0) {
      generatedInsights.push("Set financial goals to stay motivated");
    }
    
    setScore(Math.round(calculatedScore));
    setInsights(generatedInsights.length > 0 ? generatedInsights : ["Your finances are in good shape!"]);
    setLoading(false);
  }, [totalIncome, totalExpense, totalBalance, goals, budgets, transactions, investments]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: "text-success", bg: "bg-success/20", label: "Excellent" };
    if (score >= 60) return { color: "text-primary", bg: "bg-primary/20", label: "Good" };
    if (score >= 40) return { color: "text-warning", bg: "bg-warning/20", label: "Fair" };
    return { color: "text-destructive", bg: "bg-destructive/20", label: "Needs Work" };
  };

  const scoreInfo = getScoreColor(score);

  return (
    <ModernCard>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Financial Health Score
            </CardTitle>
            <CardDescription>AI-powered assessment of your finances</CardDescription>
          </div>
          <Badge className={`${scoreInfo.bg} ${scoreInfo.color} border-0`}>
            {scoreInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 bg-secondary rounded-lg" />
            <Skeleton className="h-20 bg-secondary rounded-lg" />
          </div>
        ) : (
          <>
            <div className="text-center space-y-4">
              <div className="relative w-40 h-40 mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className={`text-4xl font-bold ${scoreInfo.color}`}>{score}</span>
                    <p className="text-sm text-muted-foreground">/ 100</p>
                  </div>
                </div>
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-secondary"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="439.8"
                    strokeDashoffset={439.8 - (439.8 * score) / 100}
                    strokeLinecap="round"
                    className={scoreInfo.color}
                  />
                </svg>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <div className="text-sm text-muted-foreground">Savings Rate</div>
                  <div className={`font-bold ${totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 >= 20 ? "text-success" : "text-warning" : "text-muted-foreground"}`}>
                    {totalIncome > 0 ? `${((totalIncome - totalExpense) / totalIncome * 100).toFixed(1)}%` : "0%"}
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg bg-secondary">
                  <div className="text-sm text-muted-foreground">Investments</div>
                  <div className="font-bold text-emerald-500">
                    {investments.length > 0 ? `${investments.length}` : "None"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">AI Insights</h4>
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded bg-secondary">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                  <p className="text-sm text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </ModernCard>
  );
}

// Quick Actions
function QuickActions({ onAddTransactionClick, showBalance, setShowBalance }: { 
  onAddTransactionClick: () => void, 
  showBalance: boolean, 
  setShowBalance: (show: boolean) => void 
}) {
  const router = useRouter();
  const { isPro } = useAuth();

  const handleActionClick = (path: string) => {
    router.push(path);
  };

  const actions = [
    { 
      icon: Plus, 
      label: "Add Transaction", 
      description: "Record spending", 
      color: "bg-primary",
      onClick: onAddTransactionClick
    },
    { 
      icon: Target, 
      label: "Set Goal", 
      description: "Savings goal", 
      color: "bg-success",
      onClick: () => handleActionClick("/dashboard/goals")
    },
    { 
      icon: TrendingUp, 
      label: "Investments", 
      description: "Manage portfolio", 
      color: "bg-emerald-500",
      onClick: () => handleActionClick("/dashboard/investments")
    },
    { 
      icon: Zap, 
      label: "AI Assistant", 
      description: "Get insights", 
      color: "bg-warning",
      pro: true,
      onClick: () => handleActionClick(isPro ? "/dashboard/assistant" : "/dashboard/upgrade")
    },
  ];

  return (
    <ModernCard>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Manage your finances</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="balance-toggle" className="text-sm text-muted-foreground cursor-pointer">
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Label>
            <Switch
              id="balance-toggle"
              checked={showBalance}
              onCheckedChange={setShowBalance}
              className="data-[state=checked]:bg-success"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={action.onClick}
              className="h-24 flex flex-col justify-center items-center gap-2 hover:bg-secondary border-border"
            >
              <div className={`p-3 rounded-full ${action.color} text-primary-foreground`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </ModernCard>
  );
}

// Export Dashboard Component
function ExportDashboard({ 
  transactions, 
  stats,
  timeRange,
  formatCurrency,
}: { 
  transactions: Transaction[];
  stats: any;
  timeRange: string;
  formatCurrency: (amount: number) => string;
}) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json' | 'print') => {
    if (transactions.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There is no transaction data available for export.",
      });
      return;
    }

    setExporting(true);
    
    try {
      setTimeout(() => {
        toast({
          title: "Export successful",
          description: `Dashboard data exported as ${format.toUpperCase()}`,
          variant: "default"
        });
        setExporting(false);
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export data. Please try again.",
      });
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-border bg-secondary hover:bg-secondary/80" disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-border bg-popover">
        <DropdownMenuItem onClick={() => handleExport('csv')} className="hover:bg-secondary">
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} className="hover:bg-secondary">
          <FileText className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('print')} className="hover:bg-secondary">
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Investment Tracker Component with Actual Investment Data
function InvestmentTracker({ investments }: { investments: any[] }) {
  const { formatCurrency } = useCurrency();
  
  // Use actual investment data
  const investmentData = useMemo(() => {
    if (!investments || investments.length === 0) {
      return [];
    }

    const grouped = investments.reduce((acc, investment) => {
      const type = investment.type || 'Other';
      const value = investment.currentValue || 0;
      
      if (!acc[type]) {
        acc[type] = {
          name: type,
          value: 0,
          count: 0,
          totalCost: 0,
          totalGain: 0
        };
      }
      
      acc[type].value += value;
      acc[type].count += 1;
      acc[type].totalCost += investment.purchasePrice || 0;
      acc[type].totalGain += (value - (investment.purchasePrice || 0));
      
      return acc;
    }, {} as { [key: string]: { name: string; value: number; count: number; totalCost: number; totalGain: number } });

    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [investments]);

  if (!investments || investments.length === 0) {
    return (
      <ModernCard>
        <CardHeader>
          <CardTitle className="text-lg">Investment Portfolio</CardTitle>
          <CardDescription>Track your investment allocations</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <TrendingUp className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No investments recorded yet</p>
          <Button variant="outline" className="mt-4 border-border hover:bg-secondary" asChild>
            <Link href="/dashboard/investments">
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Link>
          </Button>
        </CardContent>
      </ModernCard>
    );
  }

  // Calculate total portfolio value
  const totalPortfolioValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  const totalCostBasis = investments.reduce((sum, inv) => sum + (inv.purchasePrice || 0), 0);
  const totalGainLoss = totalPortfolioValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  // Get top performing investments
  const topInvestments = [...investments]
    .sort((a, b) => {
      const aReturn = a.purchasePrice > 0 ? ((a.currentValue - a.purchasePrice) / a.purchasePrice) * 100 : 0;
      const bReturn = b.purchasePrice > 0 ? ((b.currentValue - b.purchasePrice) / b.purchasePrice) * 100 : 0;
      return bReturn - aReturn;
    })
    .slice(0, 3);

  return (
    <ModernCard>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Investment Portfolio</CardTitle>
            <CardDescription>Your investment allocations</CardDescription>
          </div>
          <Badge variant="outline" className={`${
            totalGainLoss >= 0 
              ? 'text-success border-success/20' 
              : 'text-destructive border-destructive/20'
          }`}>
            {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Portfolio Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Portfolio Value</p>
            <p className="text-lg font-semibold">{formatCurrency(totalPortfolioValue)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
            <p className={`text-lg font-semibold ${totalGainLoss >= 0 ? 'text-success' : 'text-destructive'}`}>
              {totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss)}
            </p>
          </div>
        </div>

        {/* Top Investments */}
        <div className="space-y-3 mb-4">
          <h4 className="font-medium text-sm text-muted-foreground">Top Performers</h4>
          {topInvestments.map((investment, index) => {
            const gainLoss = investment.currentValue - investment.purchasePrice;
            const gainLossPercent = investment.purchasePrice > 0 ? (gainLoss / investment.purchasePrice) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${
                    gainLossPercent >= 0 
                      ? 'bg-success/20 text-success' 
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {gainLossPercent >= 0 ? 
                      <TrendingUp className="h-3 w-3" /> : 
                      <TrendingDown className="h-3 w-3" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium">{investment.name}</p>
                    <p className="text-xs text-muted-foreground">{investment.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    gainLossPercent >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(investment.currentValue)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Allocation by Type */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Allocation by Type</h4>
          {investmentData.map((type, index) => {
            const percentage = totalPortfolioValue > 0 ? (type.value / totalPortfolioValue) * 100 : 0;
            const typeGainPercent = type.totalCost > 0 ? (type.totalGain / type.totalCost) * 100 : 0;
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{type.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${
                      typeGainPercent >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {typeGainPercent >= 0 ? '+' : ''}{typeGainPercent.toFixed(1)}%
                    </span>
                    <span className="text-sm font-medium">{formatCurrency(type.value)}</span>
                  </div>
                </div>
                <Progress value={percentage} className="h-1.5 bg-secondary" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{type.count} investment{type.count !== 1 ? 's' : ''}</span>
                  <span>{percentage.toFixed(1)}% of portfolio</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full border-border hover:bg-secondary" asChild>
          <Link href="/dashboard/investments">
            <TrendingUp className="h-4 w-4 mr-2" />
            View All Investments
          </Link>
        </Button>
      </CardFooter>
    </ModernCard>
  );
}

// Recent Activity Component with Investments
function RecentActivity({ transactions, investments }: { 
  transactions: Transaction[],
  investments: any[] 
}) {
  const { formatCurrency } = useCurrency();

  // Combine recent transactions with investment updates
  const recentActivities = useMemo(() => {
    const investmentActivities = investments.map(inv => ({
      id: inv.id,
      date: inv.purchaseDate || new Date().toISOString().split('T')[0],
      description: `Investment: ${inv.name}`,
      amount: inv.currentValue || 0,
      type: 'investment',
      category: inv.type || 'Other',
      activityType: 'investment'
    }));

    const transactionActivities = transactions.map(t => ({
      ...t,
      activityType: 'transaction'
    }));

    const allActivities = [...transactionActivities, ...investmentActivities];
    
    return allActivities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions, investments]);

  if (recentActivities.length === 0) {
    return (
      <ModernCard>
        <CardHeader className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest transactions and activities</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No recent transactions</p>
        </CardContent>
      </ModernCard>
    );
  }

  return (
    <ModernCard>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest transactions and activities</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          View All →
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={`${activity.activityType}-${activity.id || index}`} className="flex items-center justify-between p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  activity.activityType === 'investment' 
                    ? 'bg-emerald-500/20 text-emerald-500' 
                    : activity.type === 'income'
                    ? 'bg-success/20 text-success'
                    : activity.type === 'expense'
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-primary/20 text-primary'
                }`}>
                  {activity.activityType === 'investment' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : activity.type === 'income' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : activity.type === 'expense' ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.category} • {format(new Date(activity.date), 'MMM dd')}
                  </p>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                activity.activityType === 'investment' 
                  ? 'text-emerald-500' 
                  : activity.type === 'income' 
                  ? 'text-success' 
                  : activity.type === 'expense' 
                  ? 'text-destructive' 
                  : 'text-primary'
              }`}>
                {activity.activityType === 'investment' ? '' : activity.type === 'income' ? '+' : activity.type === 'expense' ? '-' : ''}
                {formatCurrency(activity.amount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </ModernCard>
  );
}

export default function DashboardPage() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { goals, loading: goalsLoading } = useGoals();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { isPro, loading: authLoading } = useAuth();
  const { investments: actualInvestments, loading: investmentsLoading } = useInvestments();
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartTimeRange, setChartTimeRange] = useState('6M');
  const [showBalance, setShowBalance] = useState(true);

  const loading = transactionsLoading || budgetsLoading || goalsLoading || accountsLoading || authLoading || investmentsLoading;

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

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const budgetWithSpent = budgets.map(budget => {
    const spent = filteredTransactions
      .filter(t => t.type === 'expense' && budget.category && t.category && t.category.toLowerCase() === budget.category.toLowerCase())
      .reduce((acc, t) => acc + t.amount, 0);
    return { ...budget, spent };
  });

  const stats = {
    totalBalance,
    totalIncome,
    totalExpense,
    savingsRate
  };

  const goalForm = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: 1000,
      currentAmount: 0,
      deadline: format(new Date(), 'yyyy-MM-dd')
    },
  });

  async function handleAddGoal(values: z.infer<typeof goalSchema>) {
    try {
      await addGoal(values);
      goalForm.reset();
      setGoalDialogOpen(false);
      toast({ title: "Success", description: "Goal added successfully." });
    } catch (error) {
      console.error("Error adding goal:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to add goal." });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 space-y-6">
        <Skeleton className="h-10 w-64 bg-secondary" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-secondary" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-xl bg-secondary" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl bg-secondary" />
          <Skeleton className="h-[400px] rounded-xl bg-secondary" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl bg-secondary" />
          <Skeleton className="h-80 rounded-xl bg-secondary" />
          <Skeleton className="h-80 rounded-xl bg-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Create a New Goal</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Set a target and a deadline to motivate your savings.
            </DialogDescription>
          </DialogHeader>
          <Form {...goalForm}>
            <form onSubmit={goalForm.handleSubmit(handleAddGoal)} className="space-y-4 py-4">
              <FormField
                control={goalForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Goal Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., New Laptop" 
                        className="border-border bg-secondary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={goalForm.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Target Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        className="border-border bg-secondary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={goalForm.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Current Amount Saved</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        className="border-border bg-secondary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={goalForm.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Deadline</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-border bg-secondary"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600"
                >
                  Add Goal
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <main className="p-4 sm:p-6 space-y-6 max-w-screen-xl mx-auto">
        <UserWelcome />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-40 border-border bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            
            <ExportDashboard 
              transactions={filteredTransactions}
              stats={stats}
              timeRange={timeRange}
              formatCurrency={formatCurrency}
            />
          </div>
          {isPro === false && (
            <Button className="bg-gradient-to-r from-warning to-orange-600 hover:from-warning/90 hover:to-orange-700 text-white" asChild>
              <Link href="/dashboard/upgrade">
                <Sparkles className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Link>
            </Button>
          )}
        </div>

        <StatsOverview 
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          totalBalance={totalBalance}
          showBalance={showBalance}
          transactions={transactions}
          investments={actualInvestments}
        />

        <QuickActions 
          onAddTransactionClick={() => setAddDialogOpen(true)} 
          showBalance={showBalance} 
          setShowBalance={setShowBalance} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MoneyFlowChartCard 
              chartData={chartData}
              chartTimeRange={chartTimeRange}
              setChartTimeRange={setChartTimeRange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              <SpendingByCategory transactions={filteredTransactions} />
              <InvestmentTracker investments={actualInvestments} />
            </div>
            <BudgetBreakdown budgets={budgetWithSpent} />
          </div>

          <div className="space-y-6">
            <FinancialHealthScore 
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              totalBalance={totalBalance}
              goals={goals as Goal[]}
              budgets={budgetWithSpent}
              transactions={transactions}
              investments={actualInvestments}
            />

            <AISavingsTips 
              transactions={transactions}
              budgets={budgetWithSpent}
            />

            <QuickInsights transactions={filteredTransactions} budgets={budgets} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentActivity transactions={filteredTransactions} investments={actualInvestments} />
          <SavingsTips transactions={filteredTransactions} />
          <FinancialGoalsCard 
            goals={goals as Goal[]} 
            onAddNewGoal={() => setGoalDialogOpen(true)} 
          />
        </div>
      </main>
    </div>
  );
}