// lib/email-service.ts
import nodemailer from 'nodemailer';

// Create transporter using your SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER,
  port: Number(process.env.EMAIL_PORT),
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface SendProConfirmationEmailProps {
  email: string;
  name: string;
  plan: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  invoiceId?: string;
}

export async function sendProConfirmationEmail({
  email,
  name,
  plan,
  amount,
  currency,
  startDate,
  endDate,
  invoiceId
}: SendProConfirmationEmailProps) {
  const planName = plan === 'yearly' ? 'Yearly Pro' : 'Monthly Pro';
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
  
  const formattedStartDate = startDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedEndDate = endDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to EcoVest Pro</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            color: white;
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: #ffffff;
            padding: 40px 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
          .badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            display: inline-block;
            margin-bottom: 20px;
          }
          .details-card {
            background: #f9f9f9;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #666;
          }
          .detail-value {
            font-weight: 600;
            color: #333;
          }
          .highlight {
            color: #10b981;
            font-size: 24px;
            font-weight: bold;
          }
          .features {
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
          }
          .feature-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
          }
          .feature-item:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            margin-right: 10px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 30px;
            color: #999;
            font-size: 14px;
          }
          .footer a {
            color: #10b981;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to EcoVest Pro!</h1>
          </div>
          
          <div class="content">
            <div style="text-align: center;">
              <div class="badge">✨ PRO MEMBER ✨</div>
              <h2 style="margin: 10px 0;">Thank you for upgrading, ${name}!</h2>
              <p style="color: #666; font-size: 16px;">
                You now have access to all premium features to supercharge your financial journey.
              </p>
            </div>

            <div class="details-card">
              <h3 style="margin-top: 0; text-align: center;">Subscription Details</h3>
              
              <div class="detail-row">
                <span class="detail-label">Plan</span>
                <span class="detail-value">${planName}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">${formattedAmount}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Start Date</span>
                <span class="detail-value">${formattedStartDate}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Next Billing Date</span>
                <span class="detail-value">${formattedEndDate}</span>
              </div>
              
              ${invoiceId ? `
                <div class="detail-row">
                  <span class="detail-label">Invoice ID</span>
                  <span class="detail-value">#${invoiceId}</span>
                </div>
              ` : ''}
            </div>

            <div style="text-align: center;">
              <p style="font-size: 18px; color: #333;">
                Your investment: <span class="highlight">${formattedAmount}</span>
              </p>
              <p style="color: #666;">
                ${plan === 'yearly' 
                  ? 'You saved 16% by choosing the yearly plan! 🎯' 
                  : 'Upgrade to yearly and save 16% on your next billing!'}
              </p>
            </div>

            <div class="features">
              <h3 style="margin-top: 0;">✨ What's included in your Pro plan:</h3>
              
              <div class="feature-item">AI-powered savings insights and recommendations</div>
              <div class="feature-item">Carbon footprint tracking for all your transactions</div>
              <div class="feature-item">Advanced investment analytics and portfolio tracking</div>
              <div class="feature-item">Priority customer support</div>
              <div class="feature-item">Unlimited transactions and account connections</div>
              <div class="feature-item">Data export in multiple formats (CSV, JSON, PDF)</div>
              <div class="feature-item">API access for developers</div>
              <div class="feature-item">Quarterly financial strategy calls (Yearly plan only)</div>
              <div class="feature-item">Early access to new features</div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                Go to Your Dashboard
              </a>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 10px;">
              <h4 style="margin-top: 0; color: #0369a1;">💡 Pro Tip</h4>
              <p style="margin-bottom: 0; color: #075985;">
                Start by exploring your new AI insights! They'll help you identify 
                saving opportunities you might have missed.
              </p>
            </div>

            <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #999;">
              <p>Need help? Contact us at <a href="mailto:ecovest.help@gmail.com">ecovest.help@gmail.com</a></p>
            </div>
          </div>

          <div class="footer">
            <p>© 2024 EcoVest. All rights reserved.</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy">Privacy Policy</a> • 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms">Terms of Service</a> • 
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/support">Support</a>
            </p>
            <p style="font-size: 12px;">
              This email was sent to ${email} regarding your EcoVest Pro subscription.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // "EcoVest <no-reply@ecovest.app>"
      to: email,
      subject: `🎉 Welcome to EcoVest Pro, ${name}!`,
      html: htmlContent,
    });

    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

// Send invoice email
export async function sendInvoiceEmail({
  email,
  name,
  plan,
  amount,
  invoiceId,
  paymentMethod
}: {
  email: string;
  name: string;
  plan: 'monthly' | 'yearly';
  amount: number;
  invoiceId: string;
  paymentMethod: string;
}) {
  const planName = plan === 'yearly' ? 'Yearly Pro' : 'Monthly Pro';
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
  
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - EcoVest Pro</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .invoice-box { background: #f9f9f9; padding: 30px; border-radius: 10px; }
          .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 20px; }
          .invoice-title { font-size: 24px; color: #10b981; margin: 0; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; }
          .total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="invoice-box">
            <div class="header">
              <h1 class="invoice-title">Invoice</h1>
              <p>Invoice #: ${invoiceId}</p>
              <p>Date: ${date}</p>
            </div>
            
            <div class="row">
              <strong>Bill To:</strong>
              <span>${name} (${email})</span>
            </div>
            
            <div class="row">
              <strong>Description:</strong>
              <span>${planName} Subscription</span>
            </div>
            
            <div class="row">
              <strong>Payment Method:</strong>
              <span>${paymentMethod}</span>
            </div>
            
            <div class="row">
              <strong>Amount:</strong>
              <span>${formattedAmount}</span>
            </div>
            
            <div class="row total">
              <strong>Total Paid:</strong>
              <span>${formattedAmount}</span>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Thank you for your business! This invoice serves as your receipt of payment.
            </p>
          </div>
          
          <div class="footer">
            <p>For any questions, contact <a href="mailto:ecovest.help@gmail.com">ecovest.help@gmail.com</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // "EcoVest <no-reply@ecovest.app>"
      to: email,
      subject: `Your EcoVest Pro Invoice #${invoiceId}`,
      html: htmlContent,
    });

    console.log('Invoice email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}

// Test email connection
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('Email server connection verified successfully');
    return { success: true };
  } catch (error) {
    console.error('Email server connection failed:', error);
    return { success: false, error };
  }
}