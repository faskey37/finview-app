"use client";

import { useCurrency } from "@/hooks/use-currency";
import type { Goal } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GoalsSnapshot({ goals }: { goals: Goal[] }) {
  const { formatCurrency } = useCurrency();
  const totalTarget = goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
  const totalSaved = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const goalsInProgress = goals.filter(g => g.currentAmount < g.targetAmount).length;

  return (
    <Card className="border-gray-800 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Goals Snapshot</CardTitle>
                <CardDescription>Your progress towards your savings goals.</CardDescription>
            </div>
            <Button variant="ghost" asChild><Link href="/dashboard/goals">View All</Link></Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
            <p className="text-sm text-muted-foreground">Overall Progress</p>
            <p className="text-3xl font-bold text-primary">{overallProgress.toFixed(1)}%</p>
        </div>
        <Progress value={overallProgress} className="h-2" />
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Goals in Progress</p>
            <p className="text-lg font-bold">{goalsInProgress}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Saved</p>
            <p className="text-lg font-bold">{formatCurrency(totalSaved)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}