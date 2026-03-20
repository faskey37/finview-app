'use client';

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Eye, 
  Lock, 
  Database, 
  Share2, 
  Mail, 
  FileText, 
  Globe, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  CreditCard,
  Server,
  Cookie,
  Phone,
  MapPin,
  Smartphone,
  Download,
  Trash2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Edit,
  User
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function PrivacyPage() {
  const [lastUpdated] = React.useState(new Date('2024-03-20'));

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We collect information to provide better services to all our users. The types of information we collect include:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Account Information</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Name and email address</li>
                <li>• Profile picture (if provided)</li>
                <li>• Account preferences and settings</li>
                <li>• Phone number (if linked)</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Financial Information</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Transaction history and categories</li>
                <li>• Account balances and budgets</li>
                <li>• Financial goals and targets</li>
                <li>• Investment portfolio details</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Location Information</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Country and city (for personalization)</li>
                <li>• Currency preferences</li>
                <li>• Time zone settings</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Device Information</h4>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Browser type and version</li>
                <li>• Device type and operating system</li>
                <li>• IP address and usage data</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: Eye,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We use your information to provide, maintain, and improve our services:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Personalize Your Experience</h4>
                <p className="text-xs text-muted-foreground">Tailor insights and recommendations based on your financial behavior</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Generate Financial Insights</h4>
                <p className="text-xs text-muted-foreground">Provide AI-powered savings tips and investment recommendations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Process Transactions</h4>
                <p className="text-xs text-muted-foreground">Categorize and analyze your financial transactions</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Improve Our Services</h4>
                <p className="text-xs text-muted-foreground">Analyze usage patterns to enhance features and performance</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Send Important Notifications</h4>
                <p className="text-xs text-muted-foreground">Notify you about account activity, updates, and security alerts</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Ensure Security</h4>
                <p className="text-xs text-muted-foreground">Protect against unauthorized access and fraudulent activity</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "data-sharing",
      title: "Data Sharing & Disclosure",
      icon: Share2,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We do not sell your personal information. We share data only in specific circumstances:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Service Providers</h4>
                <p className="text-sm text-muted-foreground">
                  We share information with trusted third-party services that help us operate (payment processing, email delivery, analytics). These providers are contractually bound to protect your data.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Anonymous Data Sharing</h4>
                <p className="text-sm text-muted-foreground">
                  With your consent, we share anonymized, aggregated data to help improve our services and contribute to financial research. You can control this in your <Link href="/dashboard/profile" className="text-primary hover:underline">profile settings</Link>.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Legal Requirements</h4>
                <p className="text-sm text-muted-foreground">
                  We may disclose information if required by law, to protect our rights, or to prevent fraud or security issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Industry-Standard Security</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  We use bank-level 256-bit SSL encryption, secure data centers, and regular security audits to protect your information.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <Lock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Encryption</p>
              <p className="text-xs text-muted-foreground">AES-256 encryption for data at rest and in transit</p>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <Server className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Secure Infrastructure</p>
              <p className="text-xs text-muted-foreground">Hosted on secure, compliant cloud infrastructure</p>
            </div>
            
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Regular Audits</p>
              <p className="text-xs text-muted-foreground">Ongoing security monitoring and vulnerability testing</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                While we take extensive security measures, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and enable two-factor authentication when available.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "your-rights",
      title: "Your Rights & Choices",
      icon: Users,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            You have control over your personal information:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Eye className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Access Your Data</h4>
                <p className="text-xs text-muted-foreground">View all information we have about you in your profile</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Download className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Export Your Data</h4>
                <p className="text-xs text-muted-foreground">Download a complete backup of your financial data</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Edit className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Correct Information</h4>
                <p className="text-xs text-muted-foreground">Update or fix any inaccurate information in your profile</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Delete Your Account</h4>
                <p className="text-xs text-muted-foreground">Permanently remove your account and all associated data</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <XCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Opt-Out of Marketing</h4>
                <p className="text-xs text-muted-foreground">Choose not to receive promotional communications</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Share2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Data Sharing Controls</h4>
                <p className="text-xs text-muted-foreground">Enable or disable anonymous data sharing in settings</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-primary/5 rounded-lg">
            <p className="text-sm">
              To exercise any of these rights, visit your 
              <Link href="/dashboard/profile" className="text-primary hover:underline mx-1">Profile Settings</Link> 
              or contact our support team at 
              <a href="mailto:ecovest.help@gmail.com" className="text-primary hover:underline ml-1">ecovest.help@gmail.com</a>
            </p>
          </div>
        </div>
      )
    },
    {
      id: "cookies",
      title: "Cookies & Tracking",
      icon: Cookie,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We use cookies and similar technologies to enhance your experience:
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Essential Cookies</h4>
                <p className="text-xs text-muted-foreground">Required for basic functionality like authentication and security</p>
              </div>
              <Badge variant="outline">Always Active</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Analytics Cookies</h4>
                <p className="text-xs text-muted-foreground">Help us understand how you use our app and improve features</p>
              </div>
              <Badge variant="secondary">Optional</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Preference Cookies</h4>
                <p className="text-xs text-muted-foreground">Remember your settings and preferences</p>
              </div>
              <Badge variant="secondary">Optional</Badge>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            You can manage your cookie preferences through your browser settings. Disabling cookies may affect app functionality.
          </p>
        </div>
      )
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We retain your data for as long as your account is active:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Active Accounts</h4>
                <p className="text-sm text-muted-foreground">Data is kept while your account remains active to provide continuous service</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium">Deleted Accounts</h4>
                <p className="text-sm text-muted-foreground">All personal data is permanently deleted within 30 days of account deletion</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Anonymized Data</h4>
                <p className="text-sm text-muted-foreground">Some anonymized, aggregated data may be retained for analytical purposes</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "children-privacy",
      title: "Children's Privacy",
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Age Restriction</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  EcoVest is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We may update this privacy policy from time to time. We will notify you of any material changes:
          </p>
          
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>By email to your registered address</li>
            <li>Through a notice in the app</li>
            <li>By updating the "Last Updated" date at the top of this page</li>
          </ul>
          
          <p className="text-sm text-muted-foreground">
            We encourage you to review this policy periodically to stay informed about how we protect your information.
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
            If you have questions about this privacy policy or our data practices, please contact us:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a href="mailto:ecovest.help@gmail.com" className="text-sm text-primary hover:underline">
                  ecovest.help@gmail.com
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Support</p>
                <p className="text-sm text-muted-foreground">Available 9AM - 6PM, Monday - Friday</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm">
              For privacy-related inquiries, you can also submit a request through our 
              <Link href="/support" className="text-primary hover:underline mx-1">support portal</Link>
              and a team member will respond within 5 business days.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 via-background to-background py-16 border-b">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your privacy matters to us. Learn how we collect, use, and protect your information.
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

        {/* Privacy Sections */}
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
                        {section.id === "information-collection" && "What data we gather from you"}
                        {section.id === "how-we-use" && "How we process your information"}
                        {section.id === "data-sharing" && "When and why we share your data"}
                        {section.id === "data-security" && "How we protect your information"}
                        {section.id === "your-rights" && "Your control over your data"}
                        {section.id === "cookies" && "Our use of cookies and tracking"}
                        {section.id === "data-retention" && "How long we keep your data"}
                        {section.id === "children-privacy" && "Our policies for young users"}
                        {section.id === "changes" && "How we update this policy"}
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
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Your Trust Matters</h3>
                <p className="text-sm text-muted-foreground">
                  We're committed to protecting your privacy and financial data
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard/profile">
                  <Download className="h-4 w-4 mr-2" />
                  Manage Your Data
                </Link>
              </Button>
              <Button asChild>
                <Link href="/help">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Contact Support
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
            and acknowledge that you have read and understand this 
            <Link href="/privacy" className="text-primary hover:underline mx-1">Privacy Policy</Link>.
          </p>
          <p className="mt-2">
            This privacy policy applies to all services provided by EcoVest.
          </p>
        </div>
      </div>
    </div>
  );
}