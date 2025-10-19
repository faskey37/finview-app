
"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { generateSavingsTips } from '@/ai/flows/generate-savings-tips';
import type { Transaction } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';

interface SavingsTipsProps {
  transactions: Transaction[];
}

export function SavingsTips({ transactions }: SavingsTipsProps) {
  const [isPending, startTransition] = useTransition();
  const [tips, setTips] = useState<string>('');
  const { isPro } = useAuth();
  const router = useRouter();

  const handleGenerateTips = () => {
    if (!isPro) {
        router.push('/dashboard/upgrade');
        return;
    }
    startTransition(async () => {
      const spendingData = transactions
        .filter(t => t.type === 'expense')
        .map(t => `${t.category}: $${t.amount.toFixed(2)}`)
        .join(', ');
      
      const result = await generateSavingsTips({ spendingData });
      setTips(result.savingsTips);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-accent" />
            AI Savings Tips
        </CardTitle>
        <CardDescription>Get personalized tips to improve your savings based on your spending.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-4">
        {tips && isPro ? (
          <div className="prose prose-sm text-sm text-foreground max-w-none">
            {tips.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center w-full h-32 rounded-lg border-2 border-dashed">
            <Lightbulb className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground px-4">
                {isPro ? "Click the button to generate your savings tips." : "This is a premium feature. Please upgrade to Pro."}
            </p>
          </div>
        )}

        <Button onClick={handleGenerateTips} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : isPro ? (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              {tips ? 'Regenerate Tips' : 'Get Savings Tips'}
            </>
          ) : (
             <>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Pro
             </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
