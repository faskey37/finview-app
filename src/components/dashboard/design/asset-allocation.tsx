"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import type { Account } from "@/lib/types";

const COLORS = ['#3B82F6', '#10B981']; // Blue for cash, Green for investments

export function AssetAllocation({ accounts }: { accounts: Account[] }) {
  const { formatCurrency } = useCurrency();
  const cashAccounts = accounts.filter(a => a.type !== 'Investment' && a.type !== 'Credit Card' && a.type !== 'Loan');
  const investmentAccounts = accounts.filter(a => a.type === 'Investment');

  const totalCash = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalInvestments = investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  const data = [
    { name: 'Cash', value: totalCash },
    { name: 'Investments', value: totalInvestments },
  ];

  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
        <CardDescription>How your assets are distributed.</CardDescription>
      </CardHeader>
      <CardContent className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [formatCurrency(value), "Value"]} />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}