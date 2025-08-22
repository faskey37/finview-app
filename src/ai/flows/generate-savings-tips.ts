'use server';

/**
 * @fileOverview Generates AI-powered savings tips based on user spending patterns.
 *
 * - generateSavingsTips - A function that generates savings tips.
 * - GenerateSavingsTipsInput - The input type for the generateSavingsTips function.
 * - GenerateSavingsTipsOutput - The return type for the generateSavingsTips function.
 */

import {ai} from '@/ai/genkit';
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
    .describe('AI-powered suggestions for potential savings opportunities.'),
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
  prompt: `You are a personal finance advisor. Analyze the following spending data and provide actionable savings tips.

Spending Data:
{{{spendingData}}}

Provide specific and practical suggestions on how the user can save money based on their spending habits.`,
});

const generateSavingsTipsFlow = ai.defineFlow(
  {
    name: 'generateSavingsTipsFlow',
    inputSchema: GenerateSavingsTipsInputSchema,
    outputSchema: GenerateSavingsTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
