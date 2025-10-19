import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const openrouter = googleAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export const ai = genkit({
  plugins: [openrouter],
});
