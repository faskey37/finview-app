import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart } from "recharts";
import type { Transaction } from "@/lib/types";

const chartData = [
  { value: 45 }, { value: 60 }, { value: 30 }, { value: 75 }, { value: 50 }, { value: 90 }, { value: 65 }
];

interface IncomeCardProps {
    income: number;
    transactions: Transaction[];
}

export function IncomeCard({ income, transactions }: IncomeCardProps) {
    const { formatCurrency, formatCompactNumber } = useCurrency();

    const incomeBySource = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => {
            const category = t.category.charAt(0).toUpperCase() + t.category.slice(1);
            acc[category] = (acc[category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const topSources = Object.entries(incomeBySource)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);


    return (
        <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">My Income</CardTitle>
                    <p className="text-xs text-muted-foreground">This Month</p>
                </div>
            </CardHeader>
            <CardContent className="pb-4">
                <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold break-words">{formatCurrency(income)}</p>
                     <BarChart width={80} height={20} data={chartData}>
                        <Bar dataKey="value" shape={<rect rx={2} />} className="fill-accent" />
                     </BarChart>
                </div>
                 <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">-2.4% vs last month</span>
                    </div>
                 </div>
            </CardContent>
            {topSources.length > 0 && (
                <CardFooter className="grid grid-cols-3 gap-2 text-center text-xs">
                    {topSources.map(([source, amount]) => (
                        <div key={source} className="p-2 rounded-lg bg-muted">
                            <p className="text-muted-foreground truncate">{source}</p>
                            <p className="font-bold">{formatCompactNumber(amount)}</p>
                        </div>
                    ))}
                </CardFooter>
            )}
        </Card>
    )
}
