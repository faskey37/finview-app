// app/terms/page.tsx
'use client';

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  FileText, 
  Scale, 
  Lock, 
  CreditCard, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  Download,
  Trash2,
  HelpCircle,
  ExternalLink,
  BookOpen,
  Gavel,
  DollarSign,
  Server,
  UserCheck,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function TermsPage() {
  const [lastUpdated] = React.useState(new Date('2024-03-20'));

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            By accessing or using EcoVest ("the App", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
          </p>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Important</p>
                <p className="text-xs text-muted-foreground">
                  These Terms apply to all users of the App, including those who are simply viewing content, creating accounts, or subscribing to premium services.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "eligibility",
      title: "Eligibility",
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            To use EcoVest, you must:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Be at least 18 years of age or have parental consent</li>
            <li>Have the legal capacity to enter into a binding agreement</li>
            <li>Not be located in a country subject to US sanctions</li>
            <li>Provide accurate and complete information during registration</li>
          </ul>
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Age Restriction</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  EcoVest is not intended for children under 13. We do not knowingly collect information from children under 13.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "account",
      title: "Account Registration",
      icon: UserCheck,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            To access certain features, you must create an account. You agree to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Provide Accurate Information</h4>
                <p className="text-xs text-muted-foreground">All registration information must be truthful and current</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Maintain Account Security</h4>
                <p className="text-xs text-muted-foreground">Keep your password secure and notify us of unauthorized use</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">One Account Per User</h4>
                <p className="text-xs text-muted-foreground">You may not create multiple accounts</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Account Responsibility</h4>
                <p className="text-xs text-muted-foreground">You're responsible for all activity under your account</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "subscription",
      title: "Subscription & Billing",
      icon: CreditCard,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            EcoVest offers both free and paid subscription plans. By subscribing to a paid plan, you agree to:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Pricing</h4>
                <p className="text-sm text-muted-foreground">
                  Monthly: $4.99/month | Yearly: $49.90/year (Save 16%). Prices are in USD and subject to change with 30 days notice.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Auto-Renewal</h4>
                <p className="text-sm text-muted-foreground">
                  Subscriptions auto-renew unless cancelled at least 24 hours before the renewal date. You can cancel anytime in your account settings.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Refund Policy</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 30-day money-back guarantee for annual plans. Monthly subscriptions are non-refundable. Contact support for refund requests.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Payment Failures</h4>
                <p className="text-sm text-muted-foreground">
                  If payment fails, we may retry or suspend your account. You'll receive notifications to update your payment method.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "data-security",
      title: "Data Security & Privacy",
      icon: Lock,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We take data security seriously. Our practices include:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-sm">Encryption</h4>
                <p className="text-xs text-muted-foreground">256-bit SSL encryption for all data transmission</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Server className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-sm">Secure Storage</h4>
                <p className="text-xs text-muted-foreground">Bank-level security for stored financial data</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-sm">Regular Audits</h4>
                <p className="text-xs text-muted-foreground">Third-party security audits and vulnerability testing</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <h4 className="font-medium text-sm">Data Sovereignty</h4>
                <p className="text-xs text-muted-foreground">Your data is stored in secure, compliant data centers</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            For more details, please review our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      )
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: Gavel,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You agree not to misuse EcoVest. Prohibited activities include:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Unauthorized Access</h4>
                <p className="text-xs text-muted-foreground">Attempting to access other users' accounts</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Data Scraping</h4>
                <p className="text-xs text-muted-foreground">Automated extraction of data without permission</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Fraudulent Activity</h4>
                <p className="text-xs text-muted-foreground">Using the service for illegal or fraudulent purposes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Interference</h4>
                <p className="text-xs text-muted-foreground">Disrupting or harming the service or other users</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">Violation Consequences</p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Violations may result in account suspension, termination, and potential legal action.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            EcoVest and its content, features, and functionality are owned by EcoVest and protected by copyright, trademark, and other intellectual property laws.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">What You Own</h4>
                <p className="text-sm text-muted-foreground">
                  You retain ownership of your financial data and content you upload.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">What We Own</h4>
                <p className="text-sm text-muted-foreground">
                  The EcoVest software, designs, logos, and AI models are our proprietary property.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">License to Use</h4>
                <p className="text-sm text-muted-foreground">
                  We grant you a limited, non-exclusive license to use our service for personal, non-commercial purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: Scale,
      content: (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">To the maximum extent permitted by law:</p>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>EcoVest is provided "as is" without warranties of any kind</li>
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability shall not exceed the amount you paid us in the past 12 months</li>
                <li>We do not guarantee financial returns or investment outcomes</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Financial Disclaimer</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  EcoVest provides financial tracking and insights but does not provide financial advice. Always consult with qualified professionals before making investment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "termination",
      title: "Termination",
      icon: Trash2,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Either party may terminate this agreement:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">By You</h4>
              <p className="text-sm text-muted-foreground">
                You can delete your account at any time from settings. All data will be permanently removed within 30 days.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">By Us</h4>
              <p className="text-sm text-muted-foreground">
                We may suspend or terminate accounts for violations, inactivity, or at our discretion with notice.
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm">
              Upon termination, your right to use the service ends, and we may delete your data after 30 days.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We may modify these Terms at any time. We'll notify you of material changes:
          </p>
          
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>By email to your registered address</li>
            <li>Through a notice in the app</li>
            <li>By updating the "Last Updated" date</li>
          </ul>
          
          <p className="text-sm text-muted-foreground">
            Your continued use of EcoVest after changes constitutes acceptance of the new Terms.
          </p>
        </div>
      )
    },
    {
      id: "contact",
      title: "Contact Us",
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            If you have questions about these Terms, please contact us:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href="mailto:ecovest.help@gmail.com?subject=Terms%20of%20Service%20Question" className="text-sm text-primary hover:underline">
                  ecovest.help@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
              <Mail className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Via Gmail</p>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=ecovest.help@gmail.com&su=Terms%20of%20Service%20Question&body=Hello%2C%0A%0AI%20have%20a%20question%20about%20the%20Terms%20of%20Service...%0A%0AThank%20you."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Open in Gmail
                </a>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-primary/5 rounded-lg">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Response Time</p>
                <p className="text-sm text-muted-foreground">
                  We aim to respond to all inquiries within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Quick email templates for legal inquiries
  const emailTemplates = [
    {
      subject: "Legal Inquiry",
      body: "Hello,%0A%0AI have a legal question regarding the Terms of Service.%0A%0AMy question: %0A%0AMy account email: [your-email]%0A%0AThank you."
    },
    {
      subject: "Termination Request",
      body: "Hello,%0A%0AI would like to request account termination.%0A%0AMy account email: [your-email]%0A%0AReason for termination: %0A%0AThank you."
    },
    {
      subject: "Data Export Request",
      body: "Hello,%0A%0AI would like to request a full export of my data.%0A%0AMy account email: [your-email]%0A%0AThank you."
    }
  ];

  const openGmailWithTemplate = (subject: string, body: string) => {
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=ecovest.help@gmail.com&su=${encodedSubject}&body=${encodedBody}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 via-background to-background py-16 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using EcoVest.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last Updated: {format(lastUpdated, 'MMMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Quick Navigation */}
        <Card className="mb-8 sticky top-4 z-10">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  asChild
                >
                  <a href={`#${section.id}`}>
                    <section.icon className="h-3 w-3 mr-1" />
                    {section.title.split(' ')[0]}
                  </a>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legal Inquiries Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-center">Quick Legal Inquiries</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {emailTemplates.map((template, index) => (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                onClick={() => openGmailWithTemplate(template.subject, template.body)}
              >
                <CardContent className="p-4 text-center">
                  <div className="p-2 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{template.subject}</h3>
                  <p className="text-xs text-muted-foreground">
                    Click to open in Gmail
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription>
                        {section.id === "acceptance" && "By using EcoVest, you agree to these terms"}
                        {section.id === "eligibility" && "Who can use our service"}
                        {section.id === "account" && "Creating and managing your account"}
                        {section.id === "subscription" && "Pricing, billing, and refunds"}
                        {section.id === "data-security" && "How we protect your information"}
                        {section.id === "acceptable-use" && "Rules for using our service"}
                        {section.id === "intellectual-property" && "Ownership of content and rights"}
                        {section.id === "limitation-liability" && "Our liability limitations"}
                        {section.id === "termination" && "How to end your account"}
                        {section.id === "changes" && "Updates to these terms"}
                        {section.id === "contact" && "How to reach us"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {section.content}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-12 p-6 bg-primary/5 rounded-xl border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Questions About These Terms?</h3>
                <p className="text-sm text-muted-foreground">
                  We're here to help clarify any questions you may have
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => openGmailWithTemplate("Legal Inquiry", "Hello,%0A%0AI have a question about the Terms of Service.%0A%0AMy question: %0A%0AMy account email: [your-email]%0A%0AThank you.")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Ask a Question
              </Button>
              <Button asChild>
                <Link href="/support">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Visit Help Center
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            By using EcoVest, you agree to our 
            <Link href="/terms" className="text-primary hover:underline mx-1">Terms of Service</Link>
            and 
            <Link href="/privacy" className="text-primary hover:underline mx-1">Privacy Policy</Link>.
          </p>
          <p className="mt-2">
            These terms constitute the entire agreement between you and EcoVest.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-muted-foreground">
              © 2024 EcoVest. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link href="/security" className="text-xs text-muted-foreground hover:text-primary">
                Security
              </Link>
              <Link href="/help" className="text-xs text-muted-foreground hover:text-primary">
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}