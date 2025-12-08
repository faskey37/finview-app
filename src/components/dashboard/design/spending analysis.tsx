
"use client";

import { useCurrency } from "@/hooks/use-currency";
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SpendingAnalysis({ transactions }: { transactions: Transaction[] }) {
  const { formatCurrency } = useCurrency();

  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const totalSpending = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const spendingByCategory = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.keys(spendingByCategory).reduce((a, b) => spendingByCategory[a] > spendingByCategory[b] ? a : b, 'None');

  const largestTransaction = expenseTransactions.reduce((max, t) => t.amount > max.amount ? t : max, { amount: 0, description: 'None' } as Transaction);

  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle>Spending Analysis</CardTitle>
        <CardDescription>Insights into your spending for the current period.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Spending</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSpending)}</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Top Category</p>
          <p className="text-2xl font-bold capitalize">{topCategory}</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Largest Purchase</p>
          <p className="text-lg font-bold truncate">{largestTransaction.description}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(largestTransaction.amount)}</p>
        </div>
      </CardContent>