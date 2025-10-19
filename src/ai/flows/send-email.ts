
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
 * It uses environment variables for SMTP configuration.
 *
 * @param {EmailParams} params - The email parameters.
 * @throws {Error} If the email service is not configured or if the email fails to send.
 */
export async function sendEmail({ to, subject, html }: EmailParams): Promise<void> {
  const emailHost = process.env.EMAIL_SERVER;
  const emailPort = process.env.EMAIL_PORT;
  const emailUser = process.env.EMAIL_SERVER_USER;
  const emailPass = process.env.EMAIL_SERVER_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM;

  if (!emailHost || !emailPort || !emailUser || !emailPass || !emailFrom) {
    const message =
      'Email service is not fully configured. Please set EMAIL_SERVER, EMAIL_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, and EMAIL_FROM in your .env file and restart the server to enable this feature.';
    console.warn(message);
    throw new Error(message);
  }

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort, 10),
    secure: parseInt(emailPort, 10) === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const mailOptions = {
    from: `"EcoVest" <${emailFrom}>`,
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
