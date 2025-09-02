"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Loader2, Sparkles } from "lucide-react";
import { generateFinancialHealthScore } from '@/ai/flows/generate-financial-health-score';
import type { Budget, Goal } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

interface FinancialHealthScoreCardProps {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  goals: Goal[];
  budgets: Budget[];
}

export function FinancialHealthScoreCard({ totalIncome, totalExpense, totalBalance, goals, budgets }: FinancialHealthScoreCardProps) {
  const [isPending, startTransition] = useTransition();
  const [score, setScore] = useState<number | null>(null);
  const { isPro } = useAuth();
  const router = useRouter();

  const handleGenerateScore = () => {
    if (!isPro) {
        router.push('/dashboard/upgrade');
        return;
    }
    startTransition(async () => {
      const result = await generateFinancialHealthScore({ 
          totalIncome, 
          totalExpense, 
          totalBalance, 
          savingsGoals: JSON.stringify(goals), 
          budgets: JSON.stringify(budgets) 
      });
      setScore(result.score);
    });
  };

  const getScoreColor = (scoreValue: number | null) => {
    if (scoreValue === null) return '';
    if (scoreValue < 400) return 'text-destructive';
    if (scoreValue < 700) return 'text-yellow-500';
    return 'text-primary';
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Activity className="text-accent" />
            Financial Health
        </CardTitle>
        <CardDescription>Get a quick snapshot of your financial wellness.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-grow text-center">
        {isPending ? (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        ) : score !== null && isPro ? (
            <>
                <p className="text-muted-foreground text-sm">Your Score</p>
                <p className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}</p>
                <Button variant="link" asChild><Link href="/dashboard/score">View Details</Link></Button>
            </>
        ) : (
             <Button onClick={handleGenerateScore} size="sm">
                 {isPro ? <><Sparkles/>Get Score</> : <><Sparkles/>Upgrade to See Score</>}
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
