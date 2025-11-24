"use client";

import { useCurrency } from "@/hooks/use-currency";
import type { Transaction } from "@/lib/types";
import { BarChart3, Building, Car, CreditCard, ShoppingBag, Utensils, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SpendingByCategory({ transactions }: { transactions: Transaction[] }) {
  const { formatCurrency } = useCurrency();
  
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: { [key: string]: number }, transaction) => {
      if(!transaction.category) return acc;
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(categoryData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const getCategoryIcon = (category: string) => {
    const icons = {
      housing: Building,
      transport: Car,
      food: Utensils,
      shopping: ShoppingBag,
      entertainment: ShoppingBag,
      utilities: CreditCard,
      health: AlertCircle,
    };
    const IconComponent = icons[category.toLowerCase() as keyof typeof icons] || CreditCard;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      housing: "bg-primary",
      transport: "bg-success",
      food: "bg-warning",
      shopping: "bg-destructive",
      entertainment: "bg-info",
    };
    return colors[category.toLowerCase()] || "bg-secondary";
  };

  const totalExpense = Object.values(categoryData).reduce((a, b) => a + b, 0);

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Spending by Category
        </CardTitle>
        <CardDescription>Your top spending categories this month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCategories.map(([category, amount]) => {
            const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category)} text-white`}>
                    {getCategoryIcon(category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm capitalize truncate">{category}</p>
                    <Progress value={percentage} className="h-1.5 mt-1" />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-sm">{formatCurrency(amount)}</p>
                  <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
