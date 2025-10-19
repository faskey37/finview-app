
'use server';

/**
 * @fileOverview Generates an AI-powered monthly financial summary email.
 *
 * - generateMonthlySummary - A function that generates the email content.
 * - GenerateMonthlySummaryInput - The input type for the function.
 * - GenerateMonthlySummaryOutput - The return type for the function.
 */

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
  summaryHtml: z
    .string()
    .describe('A personalized summary of the user\'s monthly financial activity, formatted in HTML.'),
});
export type GenerateMonthlySummaryOutput = z.infer<typeof GenerateMonthlySummaryOutputSchema>;

export async function generateMonthlySummary(
  input: GenerateMonthlySummaryInput
): Promise<GenerateMonthlySummaryOutput> {
  return generateMonthlySummaryFlow(input);
}

const SummarizedDataSchema = z.object({
    totalIncome: z.number(),
    totalExpense: z.number(),
    topSpendingCategories: z.array(z.object({ category: z.string(), amount: z.number() })),
    budgetPerformance: z.array(z.object({ category: z.string(), budgeted: z.number(), spent: z.number(), status: z.string() })),
    goalProgress: z.array(z.object({ name: z.string(), current: z.number(), target: z.number(), progress: z.string() })),
});


const prompt = ai.definePrompt({
  name: 'generateMonthlySummaryPrompt',
  input: { schema: SummarizedDataSchema },
  output: { schema: GenerateMonthlySummaryOutputSchema },
  model: 'google/gemini-pro-1.5-flash',
  prompt: `You are a friendly and insightful financial analyst for an app called "EcoVest". Your task is to create a personalized and encouraging monthly summary email for a user. The output MUST be a single HTML string, styled with inline CSS for email compatibility.

Analyze the following summarized user data for the past month:
- Total Income: {{{totalIncome}}}
- Total Expenses: {{{totalExpense}}}
- Top Spending Categories: {{{JSON.stringify topSpendingCategories}}}
- Budget Performance: {{{JSON.stringify budgetPerformance}}}
- Savings Goals Progress: {{{JSON.stringify goalProgress}}}

Based on this data, generate an HTML email with the following sections:
1.  **A friendly greeting.**
2.  **Top-Line Numbers:** A quick overview of total income vs. total expenses.
3.  **Spending Breakdown:** A brief analysis of their top 3 spending categories.
4.  **Budget Check-in:** Comment on how well they adhered to their budgets. Mention 1-2 categories where they did well or went over.
5.  **Goal Progress:** Briefly mention their progress on one of their savings goals.
6.  **An Insightful Tip:** Provide one actionable tip for the next month based on their specific data (e.g., "We noticed you're close to your 'Food' budget. Have you considered trying a meal prep service to save a bit more?").
7.  **An encouraging closing.**

**Styling Rules (MUST be followed for email client compatibility):**
- Use a single-column layout.
- Use a container div with a max-width of 600px and centered.
- Use inline CSS for all styling (e.g., \`<p style="color: #333;">\`).
- Use basic, email-safe fonts like Arial, Helvetica, sans-serif.
- Use padding for spacing, not margin.
- Use color to highlight key numbers (e.g., green for income, red for expenses).
- Structure the content with headings and paragraphs for readability.
- Do not use any <style> tags or external stylesheets. The entire output must be one HTML string.
`,
});

const generateMonthlySummaryFlow = ai.defineFlow(
  {
    name: 'generateMonthlySummaryFlow',
    inputSchema: GenerateMonthlySummaryInputSchema,
    outputSchema: GenerateMonthlySummaryOutputSchema,
  },
  async ({ transactions, budgets, goals }) => {
    try {
        // 1. Calculate total income and expenses
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        // 2. Determine top spending categories
        const spendingByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        const topSpendingCategories = Object.entries(spendingByCategory)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category, amount]) => ({ category, amount }));

        // 3. Analyze budget performance
        const budgetPerformance = budgets.map(b => {
            const spent = b.spent || 0;
            const status = spent > b.amount ? 'Over Budget' : (spent / b.amount > 0.9 ? 'Nearing Limit' : 'On Track');
            return { category: b.category, budgeted: b.amount, spent, status };
        });

        // 4. Track goal progress
        const goalProgress = goals.map(g => ({
            name: g.name,
            current: g.currentAmount,
            target: g.targetAmount,
            progress: `${Math.round((g.currentAmount / g.targetAmount) * 100)}%`,
        }));

        const summarizedData: z.infer<typeof SummarizedDataSchema> = {
            totalIncome,
            totalExpense,
            topSpendingCategories,
            budgetPerformance,
            goalProgress
        };
      
      const { output } = await prompt(summarizedData);
       if (!output) {
        throw new Error("The AI model returned an empty response.");
      }
      return output;
    } catch (error) {
        console.error("Error in generateMonthlySummaryFlow:", error);
        // Provide a fallback HTML response in case of an error.
        return {
            summaryHtml: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h1 style="color: #333;">Monthly Summary Error</h1>
                    <p style="color: #555;">We're sorry, but we were unable to generate your AI-powered financial summary at this time.</p>
                    <p style="color: #555;">This may be due to a temporary issue with our AI service or a problem processing your data. Please try again later.</p>
                    <p style="color: #555; margin-top: 20px;">The EcoVest Team</p>
                </div>
            `
        };
    }
  }
);
