"use client";

import { useCurrency } from "@/hooks/use-currency";
import type { Transaction } from "@/lib/types";
import { AlertCircle, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickInsights({ transactions, budgets }: { transactions: Transaction[], budgets: any[] }) {
  const { formatCurrency } = useCurrency();
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const monthlyExpenses = transactions
    .filter(t => {
      if (typeof t.date !== 'string' || !t.date.includes('-')) return false;
      const dateParts = t.date.split('-').map(Number);
      if (dateParts.length < 3) return false;
      const transactionDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      return t.type === 'expense' && 
             transactionDate.getMonth() === currentMonth &&
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const avgDailySpending = monthlyExpenses > 0 ? monthlyExpenses / today.getDate() : 0;
  const projectedMonthlySpending = avgDailySpending * new Date(currentYear, currentMonth + 1, 0).getDate();

  const budgetsAtRisk = budgets.filter(budget => {
    const spent = transactions
      .filter(t => {
          if (typeof t.date !== 'string' || !t.date.includes('-')) return false;
          const dateParts = t.date.split('-').map(Number);
          if (dateParts.length < 3) return false;
          const transactionDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          return t.type === 'expense' && 
                 budget.category && t.category && t.category.toLowerCase() === budget.category.toLowerCase() &&
                 transactionDate.getMonth() === currentMonth &&
                 transactionDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
    return budget.amount > 0 && (spent / budget.amount) > 0.7;
  }).length;

  const insights = [
    {
      icon: TrendingUp,
      title: "Projected Monthly Spend",
      value: formatCurrency(projectedMonthlySpending),
      description: "Based on current spending rate",
      color: "text-warning-foreground",
      bgColor: "bg-warning/10"
    },
    {
      icon: AlertCircle,
      title: "Budgets at Risk",
      value: budgetsAtRisk.toString(),
      description: "Categories over 70% of budget",
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      icon: Zap,
      title: "Daily Average",
      value: formatCurrency(avgDailySpending),
      description: "Avg. daily spend this month",
      color: "text-info-foreground",
      bgColor: "bg-info/10"
    }
  ];

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle>Quick Insights</CardTitle>
        <CardDescription>Smart analysis of your spending</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className={`p-2 rounded-lg ${insight.bgColor} ${insight.color}`}>
                <insight.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${insight.color}`}>{insight.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
