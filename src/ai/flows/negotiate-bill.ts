'use server';

/**
 * @fileOverview Analyzes a user's bill and generates a negotiation script.
 *
 * - negotiateBill - A function that takes a bill image and returns a negotiation plan.
 * - NegotiateBillInput - The input type for the function.
 * - NegotiateBillOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

const NegotiateBillInputSchema = z.object({
  billImage: z
    .string()
    .describe(
      "An image of the user's bill, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type NegotiateBillInput = z.infer<typeof NegotiateBillInputSchema>;

const NegotiateBillOutputSchema = z.object({
  provider: z.string().describe("The name of the service provider identified from the bill."),
  currentMonthlyCost: z.number().describe("The current monthly cost identified from the bill."),
  negotiationScript: z.string().describe("A polite but firm script the user can read to negotiate their bill. It should include an introduction, a request for a lower rate citing loyalty and market competition, and a concluding statement. Use markdown for formatting."),
  talkingPoints: z.array(z.string()).describe("A list of key talking points or tips for the user during the negotiation call."),
});
export type NegotiateBillOutput = z.infer<typeof NegotiateBillOutputSchema>;


export async function negotiateBill(
  input: NegotiateBillInput
): Promise<NegotiateBillOutput> {
  return negotiateBillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'negotiateBillPrompt',
  input: { schema: NegotiateBillInputSchema },
  output: { schema: NegotiateBillOutputSchema },
  
  prompt: `You are an expert bill negotiator. Your task is to analyze the provided bill image and generate a script and talking points for the user to negotiate a lower rate.

Analyze the image to identify the service provider and the main monthly charge.

Then, generate a comprehensive negotiation plan. The script should be polite, reference the user's loyalty, and mention competitor pricing as a reason for seeking a discount. The talking points should offer additional tips, like being prepared to cancel or asking for a supervisor.

Bill Image:
{{media url=billImage}}
`,
});

const negotiateBillFlow = ai.defineFlow(
  {
    name: 'negotiateBillFlow',
    inputSchema: NegotiateBillInputSchema,
    outputSchema: NegotiateBillOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
     if (!output) {
      throw new Error("Could not generate negotiation script. The AI model may be temporarily unavailable.");
    }
    return output;
  }
);
