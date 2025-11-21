
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/hooks/use-currency";
import type { Budget } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BudgetBreakdownProps {
    budgets: Budget[];
}

export function BudgetBreakdown({ budgets }: BudgetBreakdownProps) {
    const { formatCurrency } = useCurrency();
    
    // Sort budgets by amount spent in descending order and take top 3
    const topBudgets = budgets
        .sort((a, b) => (b.spent || 0) - (a.spent || 0))
        .slice(0, 3)
        .map((b, i) => {
            const percentage = b.amount > 0 ? Math.round(((b.spent || 0) / b.amount) * 100) : 0;
            const classNames = ["bg-primary/70", "bg-primary/50", "bg-primary/30"];
            return {
                name: b.category,
                percentage,
                spent: b.spent || 0,
                total: b.amount,
                className: classNames[i]
            };
        });

    const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
    const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
    const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;


    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Remaining Monthly</CardTitle>
                    <Button variant="link" className="text-primary" asChild>
                        <Link href="/dashboard/budgets">Budget setting →</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-5xl md:text-7xl font-bold">{totalBudget > 0 ? `${spentPercentage}%` : 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">spent of {formatCurrency(totalBudget)}</p>
                    <div className="mt-4 text-center">
                        <p className="font-semibold">You're in great shape—</p>
                        <p className="text-muted-foreground">your monthly usage is still very safe</p>
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {topBudgets.map(b => (
                        <div key={b.name} className={cn("p-4 rounded-lg flex flex-col justify-between h-36 md:h-48", b.className)}>
                            <div>
                                <p className="text-xl md:text-2xl font-bold text-primary-foreground">{b.percentage}%</p>
                                <p className="text-sm font-medium text-primary-foreground truncate">{b.name}</p>
                            </div>
                            {b.total > 0 && (
                                <div>
                                     <Progress value={b.percentage} className="h-1 bg-primary-foreground/30 [&>div]:bg-primary-foreground" />
                                     <div className="flex justify-between text-xs text-primary-foreground/80 mt-1">
                                        <span>{formatCurrency(b.spent)}</span>
                                        <span>{formatCurrency(b.total)}</span>
                                     </div>
                                </div>
                            )}
                        </div>
                    ))}
                 </div>

            </CardContent>
        </Card>
    );
}
