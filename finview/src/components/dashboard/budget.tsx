import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bell } from "lucide-react";
import type { Budget } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BudgetsProps {
  budgets: Budget[];
}

export function Budgets({ budgets }: BudgetsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budgets</CardTitle>
        <CardDescription>Your spending limits for this month.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {budgets.map((budget) => {
          // Default spent to 0 if it's undefined
          const spent = budget.spent ?? 0;

          const progress = (spent / budget.amount) * 100;
          const isApproachingLimit = progress > 80 && progress <= 100;
          const isOverBudget = progress > 100;

          return (
            <div key={budget.id} className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{budget.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                  </span>
                  {isApproachingLimit && <Bell className="h-4 w-4 text-yellow-500" />}
                  {isOverBudget && <Bell className="h-4 w-4 text-destructive" />}
                </div>
              </div>
              <Progress
                value={progress}
                className={cn(
                  isApproachingLimit && "[&>div]:bg-yellow-500",
                  isOverBudget && "[&>div]:bg-destructive"
                )}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
