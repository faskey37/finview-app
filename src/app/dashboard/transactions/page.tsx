"use client"
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsPage() {
    const { transactions, loading } = useTransactions();
    
    if (loading) {
      return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <Skeleton className="h-[400px]" />
        </div>
      )
    }

    return (
        <div className="flex flex-col gap-8">
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <RecentTransactions transactions={transactions} />
        </div>
    )
}
