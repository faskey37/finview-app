import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ExpenseCardProps {
    expense: number;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
    const { formatCurrency } = useCurrency();

    return (
        <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-3xl md:text-4xl font-bold break-words">{formatCurrency(expense)}</p>
                        <p className="text-sm font-medium text-muted-foreground">Total expense</p>
                    </div>
                    <p className="text-xs text-muted-foreground">July 2024</p>
                </div>
                 <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-accent" />
                        <span className="text-accent">Min 7.4% APR</span>
                    </div>
                     <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-accent" />
                        <span className="text-accent">Earned +$800.00</span>
                    </div>
                 </div>
            </CardHeader>
            <CardContent>
                <Progress value={75} className="h-3" />
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">With a goal of 75%</p>
            </CardFooter>
        </Card>
    )
}
