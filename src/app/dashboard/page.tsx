
"use client"
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChartData } from "@/lib/types";
import { useGoals } from "@/hooks/use-goals";
import { useAccounts } from "@/hooks/use-accounts";
import { useAuth } from "@/hooks/use-auth";
import { BalanceCard } from "@/components/dashboard/design/balance-card";
import { MoneyFlowChart } from "@/components/dashboard/design/money-flow-chart";
import { IncomeCard } from "@/components/dashboard/design/income-card";
import { ExpenseCard } from "@/components/dashboard/design/expense-card";
import { BudgetBreakdown } from "@/components/dashboard/design/budget-breakdown";
import { SavingsTips } from "@/components/dashboard/savings-tips";
import { FinancialHealthScoreCard } from "@/components/dashboard/financial-health-score";

function processChartData(transactions: any[]): ChartData[] {
  const monthlyData: { [key: string]: { income: number; expense: number } } = {};

  transactions.forEach(t => {
    const dateParts = t.date.split('-').map(Number);
    const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const month = dateObj.toLocaleString('default', { month: 'short' });

    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expense += t.amount;
    }
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthIndex = new Date().getMonth();
  const relevantMonths = months.slice(0, 12);
  
  return relevantMonths.map(month => ({
    month,
    income: monthlyData[month]?.income || Math.random() * 5000 + 4000, // Dummy data
    expense: monthlyData[month]?.expense || Math.random() * 3000 + 2000, // Dummy data
  }));
}


export default function DashboardPage() {
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { budgets, loading: budgetsLoading } = useBudgets();
  const { goals, loading: goalsLoading } = useGoals();
  const { accounts, loading: accountsLoading } = useAccounts();
  const { loading: authLoading } = useAuth();


  const loading = transactionsLoading || budgetsLoading || goalsLoading || accountsLoading || authLoading;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
    
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

  const budgetWithSpent = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase())
      .reduce((acc, t) => acc + t.amount, 0);
    return { ...budget, spent };
  });
  
  const chartData = processChartData(transactions);

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Skeleton className="h-48 lg:col-span-1" />
            <Skeleton className="h-48 lg:col-span-1" />
            <Skeleton className="h-48 lg:col-span-2" />
        </div>
        <Skeleton className="h-[380px]" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="grid gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <BalanceCard balance={totalBalance} />
            <IncomeCard income={totalIncome} />
            <ExpenseCard expense={totalExpense} />
        </div>

        <MoneyFlowChart data={chartData} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SavingsTips transactions={transactions} />
            <FinancialHealthScoreCard 
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                totalBalance={totalBalance}
                goals={goals}
                budgets={budgetWithSpent}
            />
        </div>

        <BudgetBreakdown budgets={budgetWithSpent} />

    </div>
  );
}
