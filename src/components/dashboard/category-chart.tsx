
"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { CategoryData } from "@/lib/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useCurrency } from "@/hooks/use-currency";

interface CategoryChartProps {
  data: CategoryData[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const { formatCurrency } = useCurrency();
  
  const chartConfig = data.reduce((acc, item) => {
    acc[item.category] = { label: item.category, color: item.fill };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Spending by Category</CardTitle>
        <CardDescription>A breakdown of your expenses.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent hideLabel nameKey="category" formatter={(value) => formatCurrency(value as number)} />}
                />
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
                nameKey="category"
                >
                {data.map((entry) => (
                    <Cell key={`cell-${entry.category}`} fill={entry.fill} />
                ))}
                </Pie>
                <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                align="right"
                />
            </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
