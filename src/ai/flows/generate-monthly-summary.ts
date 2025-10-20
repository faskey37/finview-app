'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Budget, Goal, Transaction } from '@/lib/types';

const TransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['income', 'expense']),
  category: z.string(),
});

const BudgetSchema = z.object({
  id: z.string(),
  category: z.string(),
  amount: z.number(),
  spent: z.optional(z.number()),
});

const GoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetAmount: z.number(),
  currentAmount: z.number(),
  deadline: z.string(),
});

const GenerateMonthlySummaryInputSchema = z.object({
  transactions: z.array(TransactionSchema),
  budgets: z.array(BudgetSchema),
  goals: z.array(GoalSchema),
});
export type GenerateMonthlySummaryInput = z.infer<typeof GenerateMonthlySummaryInputSchema>;

const GenerateMonthlySummaryOutputSchema = z.object({
  summaryHtml: z.string(),
});
export type GenerateMonthlySummaryOutput = z.infer<typeof GenerateMonthlySummaryOutputSchema>;

export async function generateMonthlySummary(
  input: GenerateMonthlySummaryInput
): Promise<GenerateMonthlySummaryOutput> {
  return generateMonthlySummaryFlow(input);
}

const generateMonthlySummaryFlow = ai.defineFlow(
  {
    name: 'generateMonthlySummaryFlow',
    inputSchema: GenerateMonthlySummaryInputSchema,
    outputSchema: GenerateMonthlySummaryOutputSchema,
  },
  async ({ transactions, budgets, goals }) => {
    try {
      // 1️⃣ Calculate total income and expenses
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // 2️⃣ Determine top spending categories
      const spendingByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);
      const topSpendingCategories = Object.entries(spendingByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category, amount]) => ({ category, amount }));

      // 3️⃣ Budget performance
      const budgetPerformance = budgets.map(b => {
        const spent = b.spent ?? 0;
        const status =
          spent > b.amount
            ? 'Over Budget'
            : spent / b.amount > 0.9
            ? 'Nearing Limit'
            : 'On Track';
        return { category: b.category, budgeted: b.amount, spent, status };
      });

      // 4️⃣ Goal progress
      const goalProgress = goals.map(g => ({
        name: g.name,
        current: g.currentAmount,
        target: g.targetAmount,
        progress: `${Math.round((g.currentAmount / g.targetAmount) * 100)}%`,
      }));

      // 🧠 Build dynamic prompt text with real data
      const promptText = `
You are a friendly and insightful financial analyst for an app called "EcoVest".
Create a personalized HTML monthly financial summary email.

Here is the user's summarized data:

Total Income: ₹${totalIncome.toFixed(2)}
Total Expenses: ₹${totalExpense.toFixed(2)}

Top Spending Categories:
${topSpendingCategories.map(c => `- ${c.category}: ₹${c.amount}`).join('\n')}

Budget Performance:
${budgetPerformance
  .map(b => `- ${b.category}: Budget ₹${b.budgeted}, Spent ₹${b.spent} (${b.status})`)
  .join('\n')}

Goal Progress:
${goalProgress
  .map(g => `- ${g.name}: ₹${g.current} / ₹${g.target} (${g.progress})`)
  .join('\n')}

Now, generate a fully formatted HTML email that:
- Includes a greeting, key financial summary, spending analysis, budget check-in, goal progress, and one tip.
- Uses inline CSS (email-safe, e.g., Arial, Helvetica).
- Colors: green for income, red for expenses.
- No <style> tags, just inline CSS.
`;

      // 5️⃣ Generate AI output
      const { output } = await ai.generate({
        model: 'google/gemini-pro-1.5-flash',
        prompt: promptText,
      });

      if (!output) throw new Error('Gemini returned no content.');

      return { summaryHtml: output.text || output }; // depending on genkit version
    } catch (error) {
      console.error('Error in generateMonthlySummaryFlow:', error);
      return {
        summaryHtml: `
          <div style="font-family: Arial; padding:20px; max-width:600px; margin:auto;">
            <h2 style="color:#333;">EcoVest Monthly Summary Unavailable</h2>
            <p style="color:#555;">We couldn’t generate your AI summary at this time. Please try again later.</p>
          </div>
        `,
      };
    }
  }
);
