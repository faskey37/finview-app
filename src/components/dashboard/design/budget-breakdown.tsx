import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/hooks/use-currency";
import type { Budget } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BudgetBreakdownProps {
    budgets: Budget[];
}

// Sample data as per the design
const sampleBudgets = [
    { name: "Needs", percentage: 89, spent: 7890, total: 9500, className: "bg-primary/70" },
    { name: "Food", percentage: 78, spent: 0, total: 0, className: "bg-primary/50" },
    { name: "Education", percentage: 42, spent: 0, total: 0, className: "bg-primary/30" },
]

export function BudgetBreakdown({ budgets }: BudgetBreakdownProps) {
    const { formatCurrency } = useCurrency();
    const totalSpent = budgets.reduce((acc, b) => acc + (b.spent || 0), 0);
    const totalBudget = budgets.reduce((acc, b) => acc + b.amount, 0);
    const remainingPercentage = totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;


    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Remaining Monthly</CardTitle>
                    <Button variant="link" className="text-primary">Budget setting →</Button>
                </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="flex flex-col items-center justify-center">
                    <p className="text-7xl font-bold">{100 - remainingPercentage}%</p>
                    <p className="text-sm text-muted-foreground">Additional AVG 2.4%</p>
                    <div className="mt-4 text-center">
                        <p className="font-semibold">You're in great shape—</p>
                        <p className="text-muted-foreground">your monthly usage is still very safe</p>
                    </div>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    {sampleBudgets.map(b => (
                        <div key={b.name} className={cn("p-4 rounded-lg flex flex-col justify-between", b.className)}>
                            <div>
                                <p className="text-2xl font-bold text-primary-foreground">{b.percentage}%</p>
                                <p className="text-sm font-medium text-primary-foreground">{b.name}</p>
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
