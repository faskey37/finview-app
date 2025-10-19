
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
  sustainableSwitch: z.object({
      category: z.string().describe("The category with the highest carbon footprint where a sustainable alternative is suggested."),
      suggestion: z.string().describe("A specific suggestion for a more sustainable alternative brand or service."),
  }).describe("A suggestion for a sustainable alternative to a high-impact spending category.")
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
  model: googleAI.model('openrouter/google/gemini-pro-1.5-flash'),
  prompt: `You are an environmental impact analyst for an app called "Eco Vest". Your task is to estimate the carbon footprint (in kg of CO2) for a list of spending categories and provide actionable, eco-conscious advice.

Use established conversion factors to estimate the CO2 emissions for each dollar spent in the given categories.

Here are some example conversion factors (kg CO2 per dollar):
- Groceries: 0.3 kg
- Restaurants/Food: 0.4 kg
- Transport (Gas, Ride-sharing): 2.0 kg
- Flights: 2.5 kg
- Shopping (Apparel, Electronics): 0.8 kg
- Utilities (Electricity, Gas): 1.5 kg
- Entertainment: 0.2 kg

Spending Data:
{{{spendingData}}}

Your response must include three parts:
1.  **footprints**: An array of objects, each containing the spending category and the estimated CO2 footprint in kilograms.
2.  **summary**: A short, encouraging summary highlighting the categories with the highest impact and suggesting one simple way the user could reduce their footprint.
3.  **sustainableSwitch**: An object identifying the user's highest-impact category and suggesting a specific, named sustainable alternative brand or type of service. For example, if 'Shopping' is high, suggest a brand like 'Patagonia' for clothing or 'ThriftBooks' for books. If 'Transport' is high, suggest using public transit or a specific EV car-sharing service.
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
      throw new Error("Could not generate carbon footprint analysis.");
    }
    return output;
  }
);
