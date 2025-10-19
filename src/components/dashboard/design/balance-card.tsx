import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { TrendingUp, Wallet } from "lucide-react";

interface BalanceCardProps {
    balance: number;
}

export function BalanceCard({ balance }: BalanceCardProps) {
    const { formatCurrency } = useCurrency();

    return (
        <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">My Balance</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
                <p className="text-3xl md:text-4xl font-bold break-words">{formatCurrency(balance)}</p>
            </CardContent>
            <CardFooter className="flex-col items-start text-xs gap-2">
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-3 w-3" />
                    <span>Total earned last time <span className="font-semibold text-accent">+14,503.00</span></span>
                 </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Total bonus <span className="font-semibold text-accent">+700.00</span></span>
                 </div>
            </CardFooter>
        </Card>
    )
}
