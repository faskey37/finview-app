
'use server';

/**
 * @fileOverview A Genkit flow for sending emails.
 *
 * This file defines a flow that can be used to send transactional emails
 * from the application using an external email service.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmail as send } from '@/services/email';

// Define the input schema for the email sending flow
const SendEmailInputSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  subject: z.string().describe('The subject line of the email.'),
  text: z.string().describe('The plain text content of the email.'),
});

export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

// This is the exported function that components will call.
export async function sendEmail(input: SendEmailInput): Promise<{ success: boolean; message: string }> {
  return sendEmailFlow(input);
}

// Define the main email sending flow using Genkit
const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string()
    }),
  },
  async (input) => {
    try {
      await send({
        to: input.to,
        subject: input.subject,
        text: input.text,
      });
      return { success: true, message: 'Email sent successfully.' };
    } catch (error: any) {
      console.error('Error in sendEmailFlow:', error);
      return { success: false, message: error.message || 'An unknown error occurred while sending the email.' };
    }
  }
);
