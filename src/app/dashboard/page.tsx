"use client";
import React, { useState, useMemo } from "react";
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
  Printer
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { subMonths, isAfter, format, startOfMonth, endOfMonth } from "date-fns";
import { useRouter } from "next/navigation";
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

const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.coerce.number().min(1, "Target amount must be greater than 0"),
  currentAmount: z.coerce.number().min(0, "Current amount must be 0 or more"),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
});

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

// Export functionality utilities
const exportToCSV = (data: any[], headers: string[], filename: string = 'dashboard') => {
  if (data.length === 0) return;

  const csvContent = [
    headers.join(','),
    ...data.map(row => row.map((field: any) => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const exportToJSON = (data: any, filename: string = 'dashboard') => {
  const exportData = {
    exportDate: new Date().toISOString(),
    ...data
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const printDashboard = (dashboardData: any, formatCurrency: (amount: number) => string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const { transactions, accounts, budgets, goals, stats } = dashboardData;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Financial Dashboard Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #333; 
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #333; 
            margin: 0;
            font-size: 28px;
          }
          .header .subtitle { 
            color: #666; 
            font-size: 16px;
            margin-top: 5px;
          }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 15px; 
            margin-bottom: 30px;
          }
          .stat-card { 
            border: 1px solid #ddd; 
            padding: 15px; 
            border-radius: 8px;
            text-align: center;
            background: #f9f9f9;
          }
          .stat-value { 
            font-size: 20px; 
            font-weight: bold; 
            margin: 5px 0;
          }
          .stat-label { 
            font-size: 12px; 
            color: #666;
          }
          .section { 
            margin-bottom: 30px; 
          }
          .section-title { 
            border-bottom: 2px solid #333; 
            padding-bottom: 10px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background-color: #f5f5f5; 
            font-weight: bold;
          }
          tr:nth-child(even) { 
            background-color: #f9f9f9; 
          }
          .progress-bar { 
            background: #e0e0e0; 
            border-radius: 10px; 
            height: 8px; 
            margin: 5px 0;
          }
          .progress-fill { 
            background: #4CAF50; 
            height: 100%; 
            border-radius: 10px;
          }
          .no-print { display: none; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Financial Dashboard Report</h1>
          <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
        </div>

        <div class="summary-grid">
          <div class="stat-card">
            <div class="stat-label">Total Balance</div>
            <div class="stat-value">${formatCurrency(stats.totalBalance)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Monthly Income</div>
            <div class="stat-value">${formatCurrency(stats.totalIncome)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Monthly Expenses</div>
            <div class="stat-value">${formatCurrency(stats.totalExpense)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Savings Rate</div>
            <div class="stat-value">${stats.savingsRate.toFixed(1)}%</div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Recent Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.slice(0, 10).map((t: Transaction) => `
                <tr>
                  <td>${new Date(t.date).toLocaleDateString()}</td>
                  <td>${t.description || 'N/A'}</td>
                  <td>${t.category || 'Uncategorized'}</td>
                  <td>${formatCurrency(t.amount)}</td>
                  <td>${t.type?.charAt(0).toUpperCase() + t.type?.slice(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Budget Overview</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Remaining</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              ${budgets.map((budget: any) => {
                const progress = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
                return `
                  <tr>
                    <td>${budget.category}</td>
                    <td>${formatCurrency(budget.amount)}</td>
                    <td>${formatCurrency(budget.spent)}</td>
                    <td>${formatCurrency(budget.amount - budget.spent)}</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                      </div>
                      ${progress.toFixed(1)}%
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Financial Goals</h2>
          <table>
            <thead>
              <tr>
                <th>Goal</th>
                <th>Target</th>
                <th>Current</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              ${goals.slice(0, 5).map((goal: Goal) => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                return `
                  <tr>
                    <td>${goal.name}</td>
                    <td>${formatCurrency(goal.targetAmount)}</td>
                    <td>${formatCurrency(goal.currentAmount)}</td>
                    <td>
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                      </div>
                      ${progress.toFixed(1)}%
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            Print Report
          </button>
          <button onclick="window.close()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};

// Enhanced Export Component
function ExportDashboard({ 
  transactions, 
  accounts, 
  budgets, 
  goals, 
  stats,
  timeRange,
  formatCurrency,
}: { 
  transactions: Transaction[];
  accounts: any[];
  budgets: any[];
  goals: Goal[];
  stats: any;
  timeRange: string;
  formatCurrency: (amount: number) => string;
}) {
  const { toast } = useToast();
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async (format: 'csv' | 'json' | 'print') => {
    if (transactions.length === 0 && format !== 'print') {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There is no data available for export.",
      });
      return;
    }

    setExporting(true);
    
    try {
      switch (format) {
        case 'csv':
          // Export transactions to CSV
          const transactionHeaders = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Account'];
          const transactionData = transactions.map(t => {
            const account = accounts.find(acc => acc.id === t.accountId);
            return [
              new Date(t.date).toLocaleDateString(),
              t.description || 'N/A',
              t.category || 'Uncategorized',
              t.type?.charAt(0).toUpperCase() + t.type?.slice(1) || 'N/A',
              t.amount.toString(),
              account?.provider || 'Unknown Account',
            ];
          });
          exportToCSV(transactionData, transactionHeaders, `transactions-${timeRange}`);
          break;

        case 'json':
          // Export comprehensive dashboard data
          const dashboardData = {
            summary: {
              totalBalance: stats.totalBalance,
              totalIncome: stats.totalIncome,
              totalExpense: stats.totalExpense,
              savingsRate: stats.savingsRate,
              transactionCount: transactions.length,
              accountCount: accounts.length,
              budgetCount: budgets.length,
              goalCount: goals.length
            },
            transactions: transactions.slice(0, 100), // Limit to prevent huge files
            accounts: accounts,
            budgets: budgets,
            goals: goals
          };
          exportToJSON(dashboardData, `dashboard-${timeRange}`);
          break;

        case 'print':
          printDashboard({
            transactions,
            accounts,
            budgets,
            goals,
            stats: {
              totalBalance: stats.totalBalance,
              totalIncome: stats.totalIncome,
              totalExpense: stats.totalExpense,
              savingsRate: stats.savingsRate
            }
          }, formatCurrency);
          break;
      }
      
      toast({
        title: "Export successful",
        description: `Dashboard data exported as ${format.toUpperCase()}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "Failed to export data. Please try again.",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('print')}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Enhanced User Welcome Header
function UserWelcome() {
  const { user, userData, isPro } = useAuth();
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? "Good morning" : currentTime < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {greeting}, {userData?.displayName?.split(' ')[0] || 'User'}!
          </h1>
          {isPro && (
            <Badge variant="default" className="bg-gradient-to-r from-primary to-purple-600 text-xs">
              <Crown className="h-3 w-3 mr-1" />
              Pro
            </Badge>
          )}
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">Here's your financial overview</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{format(new Date(), 'EEEE, MMMM do')}</span>
          <span>•</span>
          <span>Week {Math.ceil((new Date().getDate() + new Date(startOfMonth(new Date())).getDay()) / 7)}</span>
        </div>
      </div>
    </div>
  );
}

// Balance Visibility Toggle Component
function BalanceVisibilityToggle({ showBalance, setShowBalance }: { showBalance: boolean, setShowBalance: (show: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="balance-toggle" className="text-sm text-muted-foreground cursor-pointer">
        {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </Label>
      <Switch
        id="balance-toggle"
        checked={showBalance}
        onCheckedChange={setShowBalance}
        className="scale-90"
      />
    </div>
  );
}

// Enhanced Stats Overview with compact design
function StatsOverview({ totalIncome, totalExpense, totalBalance, showBalance }: { 
  totalIncome: number; 
  totalExpense: number; 
  totalBalance: number;
  showBalance: boolean;
}) {
  const { formatCurrency } = useCurrency();
  
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const stats = [
    {
      title: "Total Balance",
      value: showBalance ? formatCurrency(totalBalance) : '••••••',
      description: "All accounts",
      icon: Wallet,
      trend: 12.5,
      trendDirection: "up" as const,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Monthly Income",
      value: showBalance ? formatCurrency(totalIncome) : '••••••',
      description: "This month",
      icon: TrendingUp,
      trend: 8.2,
      trendDirection: "up" as const,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Monthly Expenses",
      value: showBalance ? formatCurrency(totalExpense) : '••••••',
      description: "This month",
      icon: TrendingDown,
      trend: 3.1,
      trendDirection: "down" as const,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      title: "Savings Rate",
      value: showBalance ? `${savingsRate.toFixed(1)}%` : '•••%',
      description: "Of income",
      icon: PiggyBank,
      trend: 15.7,
      trendDirection: "up" as const,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-all duration-200 group">
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                <p className={'text-lg font-bold'}>
                  {stat.value}
                </p>
                <div className="flex items-center gap-1">
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs ${
                    stat.trendDirection === "up" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20" 
                      : "bg-red-100 text-red-700 dark:bg-red-900/20"
                  }`}>
                    {stat.trendDirection === "up" ? (
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowDownRight className="h-2.5 w-2.5" />
                    )}
                    <span className="font-medium">{stat.trend}%</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.description}</span>
                </div>
              </div>
              <div className={`p-2 rounded-lg group-hover:scale-105 transition-transform duration-200 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
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
    .filter(t => t.type === 'expense' && t.date && new Date(t.date) > new Date())
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
            <alert.icon className={`h-4 w-4 mt-0.5 ${
              alert.type === 'warning' ? 'text-warning' : 'text-success'
            }`} />
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

// Enhanced Quick Actions with compact design
function QuickActions({ onAddTransactionClick, showBalance, setShowBalance }: { onAddTransactionClick: () => void, showBalance: boolean, setShowBalance: (show: boolean) => void }) {
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
      pro: false,
      onClick: onAddTransactionClick
    },
    { 
      icon: Target, 
      label: "Set Goal", 
      description: "Savings goal", 
      color: "bg-warning",
      pro: false,
      onClick: () => handleActionClick("/dashboard/goals")
    },
    { 
      icon: BarChart3, 
      label: "Reports", 
      description: "View analytics", 
      color: "bg-info",
      pro: false,
      onClick: () => handleActionClick("/dashboard/reports")
    },
    { 
      icon: PieChart, 
      label: "Net Worth", 
      description: "Track growth", 
      color: "bg-blue-500",
      pro: false,
      onClick: () => handleActionClick("/dashboard/net-worth")
    },
    { 
      icon: Zap, 
      label: "AI Assistant", 
      description: "Get insights", 
      color: "bg-purple-500",
      pro: true,
      onClick: () => handleActionClick("/dashboard/assistant")
    },
  ];

  return (
    <Card className="card">
      <CardHeader className="card-header-compact">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-warning" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs">Manage your finances</CardDescription>
          </div>
          <BalanceVisibilityToggle showBalance={showBalance} setShowBalance={setShowBalance} />
        </div>
      </CardHeader>
      <CardContent className="card-content-compact">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {actions.map((action, index) => {
            const effectiveOnClick = action.pro && !isPro 
              ? () => handleActionClick("/dashboard/upgrade")
              : action.onClick;

            return (
              <Button
                key={index}
                variant="outline"
                onClick={effectiveOnClick}
                className="h-16 flex flex-col justify-center items-center gap-1 hover:scale-105 transition-all duration-200 border hover:border-primary/20 bg-background p-1 min-w-0 group"
              >
                <div className={`p-1.5 rounded text-white shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform ${action.color}`}>
                  <action.icon className="h-3 w-3" />
                   {action.pro && !isPro && (
                      <Crown className="h-2 w-2 absolute -top-0.5 -right-0.5 text-warning" />
                    )}
                </div>
                <div className="space-y-0.5 min-w-0 w-full text-center">
                  <span className="text-xs font-semibold truncate block">{action.label}</span>
                  <span className="text-[10px] text-muted-foreground truncate block">{action.description}</span>
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

function FinancialGoalsCard({ goals, onAddNewGoal }: { goals: Goal[], onAddNewGoal: () => void }) {
    const { formatCurrency } = useCurrency();
    return (
        <Card className="card">
            <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track your savings targets</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {goals.slice(0, 3).map((goal, index) => {
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
                <Button variant="outline" className="w-full" onClick={onAddNewGoal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Goal
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function DashboardPage() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { goals, loading: goalsLoading } = useGoals();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { isPro, loading: authLoading } = useAuth();
  const { toast, formatCurrency } = useCurrency();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartTimeRange, setChartTimeRange] = useState('6M');
  const [showBalance, setShowBalance] = useState(true);

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
       <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Goal</DialogTitle>
            <DialogDescription>Set a target and a deadline to motivate your savings.</DialogDescription>
          </DialogHeader>
          <Form {...goalForm}>
            <form onSubmit={goalForm.handleSubmit(handleAddGoal)} className="space-y-4 py-4">
              <FormField
                control={goalForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Name</FormLabel>
                    <FormControl><Input placeholder="e.g., New Laptop" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={goalForm.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={goalForm.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount Saved</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={goalForm.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Add Goal</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
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
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Export Component */}
            <ExportDashboard 
              transactions={filteredTransactions}
              accounts={accounts}
              budgets={budgetWithSpent}
              goals={goals as Goal[]}
              stats={stats}
              timeRange={timeRange}
              formatCurrency={formatCurrency}
            />
          </div>
          {isPro === false && (
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
          showBalance={showBalance}
        />

        {/* Quick Actions */}
        <QuickActions onAddTransactionClick={() => setAddDialogOpen(true)} showBalance={showBalance} setShowBalance={setShowBalance} />

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingByCategory transactions={filteredTransactions} />
              <BudgetBreakdown budgets={budgetWithSpent} />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <MonthlyProgress 
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              budgets={budgetWithSpent}
            />

            <UpcomingBills transactions={transactions} />
            
            <FinancialHealthScoreCard 
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              totalBalance={totalBalance}
              goals={goals as Goal[]}
              budgets={budgetWithSpent}
            />

            <QuickInsights transactions={filteredTransactions} budgets={budgets} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions transactions={filteredTransactions} accounts={accounts} setAddDialogOpen={setAddDialogOpen} addDialogOpen={addDialogOpen} />
          <SavingsTips transactions={filteredTransactions} />
          <FinancialGoalsCard goals={goals as Goal[]} onAddNewGoal={() => setGoalDialogOpen(true)} />
        </div>
      </main>
    </div>
  );
}