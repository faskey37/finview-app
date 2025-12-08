
"use client";

import * as React from "react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import type { Transaction } from "@/lib/types";
import { subMonths, format } from "date-fns";

type ChartData = {
  month: string;
  income: number;
  expense: number;
};

function processChartData(transactions: Transaction[], monthsToShow: number): ChartData[] {
  const monthlyData: { [key: string]: { income: number; expense: number } } = {};
  
  // Initialize data for the last `monthsToShow`
  for (let i = 0; i < monthsToShow; i++) {
    const d = subMonths(new Date(), i);
    const monthName = format(d, 'MMM yy');
    monthlyData[monthName] = { income: 0, expense: 0 };
  }

  transactions.forEach(t => {
    if (typeof t.date !== 'string' || !t.date.includes('-')) return;
    const dateParts = t.date.split('-').map(Number);
    if (dateParts.length < 3) return;
    
    const transactionDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const monthName = format(transactionDate, 'MMM yy');

    if (monthlyData.hasOwnProperty(monthName)) {
      if (t.type === 'income') {
        monthlyData[monthName].income += t.amount;
      } else {
        monthlyData[monthName].expense += t.amount;
      }
    }
  });

  return Object.keys(monthlyData)
    .map(month => ({
      month,
      income: monthlyData[month].income,
      expense: monthlyData[month].expense,
    }))
    .reverse(); // To show chronologically
}

export function CashFlowTrend({ transactions }: { transactions: Transaction[] }) {
  const { formatCurrency } = useCurrency();
  const chartData = processChartData(transactions, 6);

  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle>Cash Flow Trend</CardTitle>
        <CardDescription>Your income vs. expenses over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value: number) => formatCurrency(value).replace(/(\.00|,00)/g, '')} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#F9FAFB' }}
              formatter={(value: number, name: string) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Area type="monotone" dataKey="income" stroke="#10B981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
            <Area type="monotone" dataKey="expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
