"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ChartData } from "@/lib/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useCurrency } from "@/hooks/use-currency";
import { useEffect, useState } from "react";

interface SpendingChartProps {
  data: ChartData[];
}

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function SpendingChart({ data }: SpendingChartProps) {
  const { formatCurrency } = useCurrency();
  const [isClient, setIsClient] = useState(false);

  // Ensure this component only renders on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Add CSS variables for bar colors
  useEffect(() => {
    document.documentElement.style.setProperty('--color-income', chartConfig.income.color);
    document.documentElement.style.setProperty('--color-expense', chartConfig.expense.color);
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Income vs. Expenses</CardTitle>
        <CardDescription>A monthly summary of your cash flow.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] min-h-[250px] sm:min-h-[300px]">
        {isClient && (
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%" debounce={1}>
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value as number).replace(/(\.00|,00)/g, '')}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  width={60}
                />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.2)' }}
                  content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                />
                <Legend 
                  iconSize={10} 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Bar 
                  dataKey="income" 
                  fill="var(--color-income)" 
                  radius={[4, 4, 0, 0]} 
                  name="Income" 
                />
                <Bar 
                  dataKey="expense" 
                  fill="var(--color-expense)" 
                  radius={[4, 4, 0, 0]} 
                  name="Expense" 
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}