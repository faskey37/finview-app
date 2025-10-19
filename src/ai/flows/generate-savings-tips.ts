
'use server';

/**
 * @fileOverview Generates AI-powered savings tips based on user spending patterns.
 *
 * - generateSavingsTips - A function that generates savings tips.
 * - GenerateSavingsTipsInput - The input type for the generateSavingsTips function.
 * - GenerateSavingsTipsOutput - The return type for the generateSavingsTips function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateSavingsTipsInputSchema = z.object({
  spendingData: z
    .string()
    .describe(
      'A string containing the user spending data, including categories and amounts.'
    ),
});
export type GenerateSavingsTipsInput = z.infer<typeof GenerateSavingsTipsInputSchema>;

const GenerateSavingsTipsOutputSchema = z.object({
  savingsTips: z
    .string()
    .describe('AI-powered suggestions for potential savings opportunities, formatted in Markdown.'),
});
export type GenerateSavingsTipsOutput = z.infer<typeof GenerateSavingsTipsOutputSchema>;

export async function generateSavingsTips(
  input: GenerateSavingsTipsInput
): Promise<GenerateSavingsTipsOutput> {
  return generateSavingsTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSavingsTipsPrompt',
  input: {schema: GenerateSavingsTipsInputSchema},
  output: {schema: GenerateSavingsTipsOutputSchema},
  model: googleAI.model('openrouter/google/gemini-pro-1.5-flash'),
  prompt: `You are a friendly and encouraging personal finance advisor for an app called "Eco Vest".
Your goal is to analyze a user's spending data and provide actionable, easy-to-understand savings tips.

Analyze the following spending data:
{{{spendingData}}}

Based on this data, provide at least three specific and practical tips on how the user can save money.
Format your response using Markdown for readability. For example, use bullet points for each tip. Be encouraging and avoid being judgmental.
Focus on high-impact areas where the user spends the most.`,
});

const generateSavingsTipsFlow = ai.defineFlow(
  {
    name: 'generateSavingsTipsFlow',
    inputSchema: GenerateSavingsTipsInputSchema,
    outputSchema: GenerateSavingsTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output) {
      return { savingsTips: "Sorry, I couldn't come up with any tips right now. Please try again later." };
    }
    return output;
  }
);
