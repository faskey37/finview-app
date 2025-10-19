import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart } from "recharts";

const chartData = [
  { value: 45 }, { value: 60 }, { value: 30 }, { value: 75 }, { value: 50 }, { value: 90 }, { value: 65 }
];

interface IncomeCardProps {
    income: number;
}

export function IncomeCard({ income }: IncomeCardProps) {
    const { formatCurrency, formatCompactNumber } = useCurrency();

    return (
        <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">My Income</CardTitle>
                    <p className="text-xs text-muted-foreground">July 2024</p>
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
                        <span className="text-red-500">-2.4% APR</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-accent" />
                        <span className="text-accent">Earned +$458.00</span>
                    </div>
                 </div>
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-muted">
                    <p className="text-muted-foreground">Salary</p>
                    <p className="font-bold">{formatCompactNumber(28300)}</p>
                </div>
                 <div className="p-2 rounded-lg bg-muted">
                    <p className="text-muted-foreground">Business</p>
                    <p className="font-bold">{formatCompactNumber(38500)}</p>
                </div>
                 <div className="p-2 rounded-lg bg-muted">
                    <p className="text-muted-foreground">Investment</p>
                    <p className="font-bold">{formatCompactNumber(34400)}</p>
                </div>
            </CardFooter>
        </Card>
    )
}
