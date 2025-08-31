
'use server';

/**
 * @fileOverview Generates an estimated carbon footprint based on spending categories.
 *
 * - generateCarbonFootprint - A function that analyzes spending data and returns CO2 estimates.
 * - GenerateCarbonFootprintInput - The input type for the function.
 * - GenerateCarbonFootprintOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateCarbonFootprintInputSchema = z.object({
  spendingData: z
    .string()
    .describe('A JSON string of spending data, with categories and total amounts.'),
});
export type GenerateCarbonFootprintInput = z.infer<typeof GenerateCarbonFootprintInputSchema>;

const FootprintSchema = z.object({
    category: z.string().describe("The spending category."),
    co2: z.number().describe("The estimated CO2 footprint in kilograms (kg).")
});

const GenerateCarbonFootprintOutputSchema = z.object({
  footprints: z.array(FootprintSchema).describe('An array of spending categories and their estimated CO2 footprint.'),
  summary: z.string().describe("A brief, insightful summary of the user's environmental impact based on their spending."),
});
export type GenerateCarbonFootprintOutput = z.infer<typeof GenerateCarbonFootprintOutputSchema>;


export async function generateCarbonFootprint(
  input: GenerateCarbonFootprintInput
): Promise<GenerateCarbonFootprintOutput> {
  return generateCarbonFootprintFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCarbonFootprintPrompt',
  input: { schema: GenerateCarbonFootprintInputSchema },
  output: { schema: GenerateCarbonFootprintOutputSchema },

  prompt: `You are an environmental impact analyst. Your task is to estimate the carbon footprint (in kg of CO2) for a list of spending categories.

Use established conversion factors to estimate the CO2 emissions for each dollar spent in the given categories. Be thoughtful and provide a reasonable estimate.

Here are some example conversion factors (kg CO2 per dollar):
- Groceries: 0.3 kg
- Restaurants/Food: 0.4 kg
- Transport (Gas, Ride-sharing): 2.0 kg
- Flights: 2.5 kg
- Shopping (Apparel, Electronics): 0.6 kg
- Utilities (Electricity, Gas): 1.5 kg
- Entertainment: 0.2 kg

Spending Data:
{{{spendingData}}}

Analyze the data and return an array of objects, each containing the category and the estimated CO2 footprint in kilograms. Also provide a short, actionable summary highlighting the categories with the highest impact and suggesting one or two simple ways the user could reduce their footprint.
`,
});

const generateCarbonFootprintFlow = ai.defineFlow(
  {
    name: 'generateCarbonFootprintFlow',
    inputSchema: GenerateCarbonFootprintInputSchema,
    outputSchema: GenerateCarbonFootprintOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
     if (!output) {
      return { footprints: [], summary: "Could not generate analysis." };
    }
    return output;
  }
);
