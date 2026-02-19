// app/api/send-feedback/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const feedback = await request.json();

    // Create transporter using your email configuration
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT),
      secure: true, // true for port 465
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Format the feedback email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: 'ecovest.help@gmail.com',
      subject: `[Feedback] ${feedback.type}: ${feedback.title}`,
      text: `
New Feedback Received

Type: ${feedback.type}
Title: ${feedback.title}
Description: 
${feedback.description}

${feedback.rating ? `Rating: ${feedback.rating}/5` : ''}

User Information:
Name: ${feedback.userName}
${feedback.userEmail ? `Email: ${feedback.userEmail}` : 'Email: Not provided'}
Pro Member: ${feedback.isPro ? 'Yes' : 'No'}

Submitted: ${new Date(feedback.timestamp).toLocaleString()}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
            🎯 New Feedback Received
          </h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold; width: 120px;">Type:</td>
              <td style="padding: 10px;">${feedback.type}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold;">Title:</td>
              <td style="padding: 10px;">${feedback.title}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold;">Description:</td>
              <td style="padding: 10px;">${feedback.description.replace(/\n/g, '<br>')}</td>
            </tr>
            ${feedback.rating ? `
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold;">Rating:</td>
              <td style="padding: 10px;">${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)</td>
            </tr>
            ` : ''}
          </table>
          
          <h3 style="color: #374151; margin-top: 30px;">👤 User Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px;">${feedback.userName}</td>
            </tr>
            ${feedback.userEmail ? `
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold;">Email:</td>
              <td style="padding: 10px;"><a href="mailto:${feedback.userEmail}" style="color: #10b981;">${feedback.userEmail}</a></td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; background: #f3f4f6; font-weight: bold;">Pro Member:</td>
              <td style="padding: 10px;">${feedback.isPro ? '✅ Yes' : '❌ No'}</td>
            </tr>
          </table>
          
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            Submitted: ${new Date(feedback.timestamp).toLocaleString()}
          </p>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Feedback email sent:', info.messageId);

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId 
    });

  } catch (error: any) {
    console.error('Error sending feedback email:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send feedback',
        details: error.message 
      },
      { status: 500 }
    );
  }
}