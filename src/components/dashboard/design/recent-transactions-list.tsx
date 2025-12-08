"use client";

import { useCurrency } from "@/hooks/use-currency";
import type { Transaction } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ShoppingBag, Utensils, Car } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const categoryIcons: { [key: string]: React.ElementType } = {
  Food: Utensils,
  Shopping: ShoppingBag,
  Transport: Car,
};

export function RecentTransactionsList({ transactions }: { transactions: Transaction[] }) {
  const { formatCurrency } = useCurrency();

  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your last 5 transactions.</CardDescription>
            </div>
            <Button variant="ghost" asChild><Link href="/dashboard/transactions">View All</Link></Button>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {transactions.slice(0, 5).map(t => {
            const Icon = t.type === 'income' ? TrendingUp : categoryIcons[t.category] || TrendingDown;
            return (
              <li key={t.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                    <Icon className={`h-4 w-4 ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm capitalize">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.category}</p>
                  </div>
                </div>
                <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  );
}