
'use server';

/**
 * @fileOverview Identifies and analyzes user subscriptions from their transactions.
 *
 * - generateSubscriptionInsights - A function that analyzes transactions to find subscriptions and provide insights.
 * - GenerateSubscriptionInsightsInput - The input type for the function.
 * - GenerateSubscriptionInsightsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { addRecurringTransaction } from '@/services/recurring';

const GenerateSubscriptionInsightsInputSchema = z.object({
  transactions: z
    .string()
    .describe('A JSON string of user transactions, including description, amount, and date.'),
});
export type GenerateSubscriptionInsightsInput = z.infer<typeof GenerateSubscriptionInsightsInputSchema>;


const SubscriptionInsightSchema = z.object({
    id: z.string().describe("A unique identifier for the subscription, derived from the transaction data."),
    name: z.string().describe("The name of the subscription service (e.g., Netflix, Spotify)."),
    monthlyCost: z.number().describe("The estimated monthly cost of the subscription."),
    category: z.string().describe("A relevant category for the subscription (e.g., Entertainment, Software, Music)."),
    suggestion: z.string().describe("A brief, actionable insight or suggestion for the user about this subscription. For example, mention if it's a high cost, if there are cheaper alternatives, or if it's a common subscription to forget about."),
});

const GenerateSubscriptionInsightsOutputSchema = z.object({
  insights: z.array(SubscriptionInsightSchema).describe('An array of identified subscriptions and the insights related to them.'),
});
export type GenerateSubscriptionInsightsOutput = z.infer<typeof GenerateSubscriptionInsightsOutputSchema>;


export async function generateSubscriptionInsights(
  input: GenerateSubscriptionInsightsInput
): Promise<GenerateSubscriptionInsightsOutput> {
  return generateSubscriptionInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSubscriptionInsightsPrompt',
  input: { schema: GenerateSubscriptionInsightsInputSchema },
  output: { schema: GenerateSubscriptionInsightsOutputSchema },
  
  prompt: `You are a financial assistant specializing in subscription management. Your task is to analyze a list of user transactions and identify recurring monthly subscriptions.

Analyze the provided transaction data. Look for recurring payments to common subscription services (like Netflix, Spotify, Amazon Prime, gym memberships, software services, etc.).

For each identified subscription, provide:
1. A unique ID (you can use the original transaction ID if available).
2. The name of the service.
3. The monthly cost.
4. A relevant category.
5. A short, helpful suggestion for the user. For instance, if it's an expensive subscription, you could note its high cost. If it's a service with family plans, you could suggest sharing. If it's a niche service, you could remind them to evaluate its usage.

Transaction Data:
{{{transactions}}}

Return a JSON object containing an array of these subscription insights. If no subscriptions are found, return an empty array.
`,
});

const generateSubscriptionInsightsFlow = ai.defineFlow(
  {
    name: 'generateSubscriptionInsightsFlow',
    inputSchema: GenerateSubscriptionInsightsInputSchema,
    outputSchema: GenerateSubscriptionInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
     if (!output) {
      return { insights: [] };
    }

    // Save each insight as a recurring transaction
    for (const insight of output.insights) {
      await addRecurringTransaction({
        description: insight.name,
        amount: insight.monthlyCost,
        type: 'expense',
        category: insight.category,
        frequency: 'monthly',
        startDate: new Date().toLocaleDateString('en-CA'),
        suggestion: insight.suggestion
      });
    }

    return output;
  }
);
