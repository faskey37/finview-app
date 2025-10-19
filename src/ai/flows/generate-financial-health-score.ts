'use server';

/**
 * @fileOverview Generates a financial health score based on user's financial data.
 *
 * - generateFinancialHealthScore - Analyzes financial data and returns a score and summary.
 * - GenerateFinancialHealthScoreInput - The input type for the function.
 * - GenerateFinancialHealthScoreOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateFinancialHealthScoreInputSchema = z.object({
  totalIncome: z.number().describe("The user's total income for the current period."),
  totalExpense: z.number().describe("The user's total expenses for the current period."),
  totalBalance: z.number().describe("The user's total account balance across all accounts."),
  savingsGoals: z.string().describe("A JSON string representing the user's savings goals, including target and current amounts."),
  budgets: z.string().describe("A JSON string of the user's budgets, including category, amount, and amount spent."),
});
export type GenerateFinancialHealthScoreInput = z.infer<typeof GenerateFinancialHealthScoreInputSchema>;

const GenerateFinancialHealthScoreOutputSchema = z.object({
  score: z.number().min(0).max(1000).describe("A financial health score ranging from 0 to 1000."),
  summary: z.string().describe("A brief summary explaining the score, highlighting strengths and areas for improvement."),
});
export type GenerateFinancialHealthScoreOutput = z.infer<typeof GenerateFinancialHealthScoreOutputSchema>;

export async function generateFinancialHealthScore(
  input: GenerateFinancialHealthScoreInput
): Promise<GenerateFinancialHealthScoreOutput> {
  return generateFinancialHealthScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialHealthScorePrompt',
  input: { schema: GenerateFinancialHealthScoreInputSchema },
  output: { schema: GenerateFinancialHealthScoreOutputSchema },
  model: googleAI.model('openrouter/google/gemini-pro-1.5-flash'),
  prompt: `You are a financial analyst. Your task is to calculate a single Financial Health Score for a user based on their financial data. The score should be between 0 and 1000.

You must also provide a brief summary explaining the factors that contributed to the score, highlighting both positive aspects and areas for improvement.

Analyze the following data to generate the score and summary:
- Total Income: {{{totalIncome}}}
- Total Expenses: {{{totalExpense}}}
- Total Account Balance: {{{totalBalance}}}
- Savings Goals: {{{savingsGoals}}}
- Budgets: {{{budgets}}}

Scoring criteria (weights are suggestions, use your analytical judgment):
- Savings Ratio (Income vs. Expense): High impact (40%). A user saving more of their income gets a higher score. If expenses exceed income, penalize heavily.
- Emergency Fund (Total Balance): Medium impact (30%). A higher total balance relative to monthly expenses indicates better stability. An ideal balance would cover 3-6 months of expenses.
- Goal Progress: Medium impact (20%). Users making good progress on their savings goals should be rewarded.
- Budget Adherence: Low impact (10%). Users who are staying within their budgets should get a slight boost. Going over budget should have a small penalty.

Return a score between 0 and 1000 and a concise, encouraging summary.
`,
});

const generateFinancialHealthScoreFlow = ai.defineFlow(
  {
    name: 'generateFinancialHealthScoreFlow',
    inputSchema: GenerateFinancialHealthScoreInputSchema,
    outputSchema: GenerateFinancialHealthScoreOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      return { score: 0, summary: "Could not generate score. Please try again later." };
    }
    return output;
  }
);
