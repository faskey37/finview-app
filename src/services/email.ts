
'use server';

import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using Nodemailer.
 * This function should only be called from a server-side environment (e.g., a Genkit flow).
 * It uses Gmail as the transport service. For this to work, you must:
 * 1. Set EMAIL_SERVER_USER (your Gmail address) in your .env file.
 * 2. Set EMAIL_SERVER_PASSWORD (a Gmail App Password) in your .env file.
 *
 * @param {EmailParams} params - The email parameters.
 * @throws {Error} If the email service is not configured or if the email fails to send.
 */
export async function sendEmail({ to, subject, html }: EmailParams): Promise<void> {
  const emailUser = process.env.EMAIL_SERVER_USER;
  const emailPass = process.env.EMAIL_SERVER_PASSWORD;

  if (!emailUser || !emailPass) {
    const message =
      'Email service is not configured. Please set EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD (a Gmail App Password) in your .env file and restart the server to enable this feature.';
    console.warn(message);
    throw new Error(message);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"EcoVest" <${emailUser}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('An unexpected error occurred in sendEmail:', error);
    if (error instanceof Error) {
        throw new Error(`An unexpected error occurred while trying to send the email: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while trying to send the email.');
  }
}