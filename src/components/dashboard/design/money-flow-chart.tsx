"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ChartData } from "@/lib/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useCurrency } from "@/hooks/use-currency";

interface MoneyFlowChartProps {
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

export function MoneyFlowChart({ data }: MoneyFlowChartProps) {
  const { formatCurrency } = useCurrency();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Money Flow</CardTitle>
        <CardDescription>Income and Expense over the last year</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value as number).replace(/(\.00|,00)/g, '')}
              />
              <ChartTooltip
                cursor={false}
                content={
                    <ChartTooltipContent 
                        className="rounded-lg bg-card-foreground text-background p-4"
                        formatter={(value, name) => (
                            <div className="flex flex-col">
                                <span className="text-xs uppercase text-muted-foreground">{name}</span>
                                <span className="font-bold text-base">{formatCurrency(value as number)}</span>
                            </div>
                        )}
                        labelFormatter={() => ''}
                        indicator="dot"
                    />
                }
              />
              <Legend />
              <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
