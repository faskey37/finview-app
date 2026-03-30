import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, message, userType, userId } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Send to support team
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'ecovest.help@gmail.com',
      subject: `💬 New Support Message from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #e5e7eb; }
            .message-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; border-radius: 5px; }
            .info-row { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 12px; background: #10b98120; color: #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📬 New Support Message</h2>
            </div>
            <div class="content">
              <div class="info-row">
                <strong>From:</strong> ${name}
              </div>
              <div class="info-row">
                <strong>Email:</strong> ${email}
              </div>
              <div class="info-row">
                <strong>User Type:</strong> 
                <span class="badge">${userType || 'Free User'}</span>
              </div>
              <div class="info-row">
                <strong>User ID:</strong> ${userId || 'N/A'}
              </div>
              <div class="info-row">
                <strong>Time:</strong> ${new Date().toLocaleString()}
              </div>
              <div class="message-box">
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p style="margin-top: 15px; font-size: 12px; color: #6b7280;">
                💡 <strong>Quick Reply:</strong> Reply directly to this email to respond to the user.
              </p>
            </div>
            <div class="footer">
              <p>EcoVest Support System</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Send auto-reply to user
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: '✅ We received your message - EcoVest Support',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
            .message-preview { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 3px solid #10b981; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Message Received!</h2>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for reaching out to EcoVest Support. We've received your message and will get back to you within <strong>24 hours</strong>.</p>
              <div class="message-preview">
                <p><strong>Your message:</strong></p>
                <p style="white-space: pre-wrap; color: #4b5563;">${message}</p>
              </div>
              <p>If you have additional information, feel free to reply to this email.</p>
              <p>Best regards,<br><strong>EcoVest Support Team</strong></p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af;">
                This is an automated confirmation. Our team will personally respond soon.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}