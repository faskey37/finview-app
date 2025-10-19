'use server';

import nodemailer from 'nodemailer';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email using Nodemailer (server-side only).
 * Ensure the following environment variables are set:
 *  EMAIL_SERVER_HOST
 *  EMAIL_SERVER_PORT
 *  EMAIL_SERVER_USER
 *  EMAIL_SERVER_PASSWORD
 *  EMAIL_FROM
 */

export async function sendEmail({ to, subject, html }: EmailParams): Promise<void> {
  // ✅ Use explicit variable names for clarity
  const host = process.env.EMAIL_SERVER_HOST;
  const port = process.env.EMAIL_SERVER_PORT;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM;

  // ✅ Validate config early
  if (!host || !port || !user || !pass || !from) {
    const message =
      '❌ Email service not configured. Please set EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, and EMAIL_FROM in your environment variables.';
    console.error(message);
    throw new Error(message);
  }

  try {
    // ✅ Create reusable transporter
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465, // true for 465, false for other ports
      auth: { user, pass },
    });

    const mailOptions = {
      from: from.includes('<') ? from : `"EcoVest" <${from}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent:', info.response);
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    if (err instanceof Error) {
      throw new Error(`Email sending failed: ${err.message}`);
    }
    throw new Error('Unknown error occurred while sending email.');
  }
}
