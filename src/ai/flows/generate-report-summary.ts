'use server';

/**
 * @fileOverview Generates an AI-powered summary for a financial report.
 *
 * - generateReportSummary - A function that generates the report summary.
 * - GenerateReportSummaryInput - The input type for the function.
 * - GenerateReportSummaryOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateReportSummaryInputSchema = z.object({
  reportData: z
    .string()
    .describe('A JSON string of the aggregated report data, including spending trends and net worth changes.'),
  currency: z.string().describe('The currency code for all financial figures (e.g., USD, EUR, JPY).'),
});
export type GenerateReportSummaryInput = z.infer<typeof GenerateReportSummaryInputSchema>;

const GenerateReportSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise, insightful summary of the key trends and takeaways from the financial report data. Use Markdown for formatting.'),
});
export type GenerateReportSummaryOutput = z.infer<typeof GenerateReportSummaryOutputSchema>;

export async function generateReportSummary(
  input: GenerateReportSummaryInput
): Promise<GenerateReportSummaryOutput> {
  return generateReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportSummaryPrompt',
  input: { schema: GenerateReportSummaryInputSchema },
  output: { schema: GenerateReportSummaryOutputSchema },
  model: googleAI.model('openrouter/google/gemini-pro-1.5-flash'),
  prompt: `You are a financial analyst reviewing a user's monthly performance report. Your goal is to provide a brief, easy-to-understand summary of the key insights. All monetary values are in {{{currency}}}.

Analyze the following report data:
{{{reportData}}}

Based on the data, provide a summary that includes:
1.  A top-level observation about their income vs. expense trend.
2.  An insight into their category spending. Did a particular category have a significant change?
3.  A comment on their net worth progression.
4.  One actionable piece of advice based on these trends.

Keep the tone encouraging and focus on the most important information. Format the output as a Markdown string. Ensure all monetary values are mentioned with the correct currency ({{{currency}}}).`,
});

const generateReportSummaryFlow = ai.defineFlow(
  {
    name: 'generateReportSummaryFlow',
    inputSchema: GenerateReportSummaryInputSchema,
    outputSchema: GenerateReportSummaryOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
     if (!output) {
      return { summary: "Sorry, I couldn't generate a summary for your report at this time. Please try again." };
    }
    return output;
  }
);
