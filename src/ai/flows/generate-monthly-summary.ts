
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

const GenerateMonthlySummaryInputSchema = z.object({
  transactions: z
    .string()
    .describe('A JSON string of the user\'s transactions for the month.'),
  budgets: z.string().describe('A JSON string of the user\'s budgets.'),
  goals: z.string().describe('A JSON string of the user\'s savings goals.'),
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

const prompt = ai.definePrompt({
  name: 'generateMonthlySummaryPrompt',
  input: { schema: GenerateMonthlySummaryInputSchema },
  output: { schema: GenerateMonthlySummaryOutputSchema },
  model: 'google/gemini-pro-1.5-flash',
  prompt: `You are a friendly and insightful financial analyst for an app called "EcoVest". Your task is to create a personalized and encouraging monthly summary email for a user. The output MUST be a single HTML string, styled with inline CSS for email compatibility.

Analyze the following user data for the past month:
- Transactions: {{{transactions}}}
- Budgets: {{{budgets}}}
- Savings Goals: {{{goals}}}

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
  async input => {
    const { output } = await prompt(input);
     if (!output) {
      throw new Error("Sorry, I couldn't generate a summary right now. The AI model may be temporarily unavailable.");
    }
    return output;
  }
);
