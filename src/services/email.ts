
'use server';

import { Resend } from 'resend';

interface EmailParams {
  to: string;
  subject: string;
  text: string;
}

/**
 * Sends an email using the Resend API.
 * This function should only be called from a server-side environment (e.g., a Genkit flow).
 *
 * @param {EmailParams} params - The email parameters.
 * @throws {Error} If the RESEND_API_KEY is not set or if the email fails to send.
 */
export async function sendEmail({ to, subject, text }: EmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error('RESEND_API_KEY is not set.');
    throw new Error('Email service is not configured. Please ensure RESEND_API_KEY is set in your .env file and restart the server.');
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: 'EcoVest <onboarding@resend.dev>', // Must be a verified domain in Resend. 'onboarding@resend.dev' is for testing.
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('An unexpected error occurred in sendEmail:', error);
    if (error instanceof Error) {
        throw new Error(`An unexpected error occurred while trying to send the email: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while trying to send the email.');
  }
}

    